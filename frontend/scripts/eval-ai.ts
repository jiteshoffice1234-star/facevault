/**
 * Quality comparison: current rule-based advice vs AI advice.
 *
 * Run (needs the backend up with AI_API_KEY/AI_BASE_URL configured):
 *   cd backend && AI_API_KEY=... AI_BASE_URL=... npm start &
 *   cd frontend && npx vite-node scripts/eval-ai.ts
 *
 * Prints, for each synthetic face, the current template advice AND the AI
 * advice, so the quality jump can be judged side by side.
 */
import { measure, computeMetrics, scoreBreakdown, generateAdvice } from '../src/lib/metrics'
import { classifyFaceShape, analyzeFace } from '../src/lib/analysis'
import { adviceFor } from '../src/lib/advice'
import type { Landmarks } from '../src/lib/geometry'
import { buildAIPayload } from '../src/lib/ai'

function makeLandmarks(opts: { asymShift?: number; narrow?: number } = {}): Landmarks {
  const lm: Landmarks = []
  for (let i = 0; i < 478; i++) lm.push({ x: 0.5, y: 0.5, z: 0 })
  const p = (i: number, x: number, y: number, z = 0) => {
    lm[i] = { x, y, z }
  }
  const { asymShift = 0, narrow = 0 } = opts
  const eyeY = 0.42
  const s = (x: number) => x * (1 - narrow)
  p(33, 0.5 - s(0.16) + asymShift, eyeY)
  p(263, 0.5 + s(0.16), eyeY)
  p(133, 0.5 - s(0.07) + asymShift, eyeY)
  p(362, 0.5 + s(0.07), eyeY)
  p(159, 0.5 - s(0.115) + asymShift, eyeY - 0.02)
  p(145, 0.5 - s(0.115) + asymShift, eyeY + 0.02)
  p(386, 0.5 + s(0.115), eyeY - 0.02)
  p(374, 0.5 + s(0.115), eyeY + 0.02)
  p(468, 0.5 - s(0.115) + asymShift, eyeY)
  p(473, 0.5 + s(0.115), eyeY)
  p(61, 0.5 - s(0.09) + asymShift, 0.62)
  p(291, 0.5 + s(0.09), 0.62)
  p(0, 0.5, 0.605)
  p(13, 0.5, 0.615)
  p(14, 0.5, 0.63)
  p(17, 0.5, 0.645)
  p(164, 0.5, 0.575)
  p(152, 0.5, 0.92)
  p(10, 0.5, 0.1)
  p(9, 0.5, 0.31)
  p(168, 0.5, 0.36)
  p(2, 0.5, 0.53)
  p(1, 0.5, 0.51)
  p(49, 0.5 - s(0.04) + asymShift, 0.54)
  p(279, 0.5 + s(0.04), 0.54)
  p(50, 0.5 - s(0.17) + asymShift, 0.38)
  p(280, 0.5 + s(0.17), 0.38)
  p(234, 0.5 - s(0.155) + asymShift, 0.72)
  p(454, 0.5 + s(0.155), 0.72)
  p(58, 0.5 - s(0.14) + asymShift, 0.78)
  p(288, 0.5 + s(0.14), 0.78)
  p(70, 0.5 - s(0.08) + asymShift, 0.315)
  p(276, 0.5 + s(0.08), 0.315)
  p(300, 0.5 + s(0.08), 0.315)
  p(105, 0.5 - s(0.15) + asymShift, 0.325)
  p(334, 0.5 + s(0.15), 0.325)
  return lm
}

function ruleAdviceText(name: string, lm: Landmarks): string[] {
  const m = measure(lm)
  if (!m) return ['(measure failed)']
  const metrics = computeMetrics(m)
  const advice = generateAdvice(metrics).map((item) => {
    const metric = metrics.find((x) => x.id === item.metricId)
    return metric ? adviceFor(metric) : item.message
  })
  return advice.length ? advice : ['(no advice - all metrics above threshold)']
}

async function aiAdviceText(name: string, lm: Landmarks): Promise<string[]> {
  try {
    const analysis = analyzeFace(lm)
    const payload = buildAIPayload(analysis)
    const res = await fetch('http://localhost:3001/api/ai/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!data.available) return [`[AI unavailable: ${data.reason}] ${data.message}`]
    const lines: string[] = []
    lines.push(`SUMMARY: ${data.summary}`)
    for (const pr of data.priorities || []) {
      lines.push(`PRIORITY ${pr.area} (opp. ${pr.score}/100): ${pr.why} -> ${pr.action}`)
    }
    lines.push(`QUICK WINS: ${(data.quickWins || []).join(' | ')}`)
    return lines
  } catch (e) {
    return [`[AI request failed] ${e instanceof Error ? e.message : String(e)}`]
  }
}

async function compare(name: string, lm: Landmarks): Promise<void> {
  console.log('\n==============================================')
  console.log(`FACE: ${name}  (shape ${classifyFaceShape(lm)})`)
  console.log('==============================================')
  console.log('\n-- CURRENT (rule-based templates) --')
  for (const t of ruleAdviceText(name, lm)) console.log(`  - ${t}`)
  console.log('\n-- AI (LLM from numeric metrics) --')
  for (const t of await aiAdviceText(name, lm)) console.log(`  - ${t}`)
  console.log('')
}

const balanced = makeLandmarks()
const asymmetric = makeLandmarks({ asymShift: 0.06 })
const narrow = makeLandmarks({ narrow: 0.25 })

await compare('Balanced face (control)', balanced)
await compare('Asymmetric face (right side shifted)', asymmetric)
await compare('Narrow face (width compressed)', narrow)
