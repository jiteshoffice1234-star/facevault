/**
 * Quality evaluator for FaceVault answers.
 *
 * Run: npx vite-node scripts/eval-quality.ts
 *
 * Builds synthetic landmark sets (well-balanced, asymmetric, narrow-face) and
 * prints the CURRENT rule-based pipeline output so the quality of answers can
 * be judged before/after the AI integration.
 */
import { measure, computeMetrics, scoreBreakdown, generateAdvice } from '../src/lib/metrics'
import { classifyFaceShape, analyzeFace } from '../src/lib/analysis'
import { adviceFor } from '../src/lib/advice'
import type { Landmarks } from '../src/lib/geometry'

function makeLandmarks(
  opts: { asymShift?: number; narrow?: number } = {},
): Landmarks {
  const lm: Landmarks = []
  for (let i = 0; i < 478; i++) lm.push({ x: 0.5, y: 0.5, z: 0 })
  const p = (i: number, x: number, y: number, z = 0) => {
    lm[i] = { x, y, z }
  }
  const { asymShift = 0, narrow = 0 } = opts
  const eyeY = 0.42
  const s = (x: number) => x * (1 - narrow) // narrow shrinks width toward center
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

function printAnalysis(name: string, lm: Landmarks): void {
  console.log('\n==============================================')
  console.log(`FACE: ${name}`)
  console.log('==============================================')
  const m = measure(lm)
  if (!m) {
    console.log('  (measure returned null)')
    return
  }
  const metrics = computeMetrics(m)
  const breakdown = scoreBreakdown(metrics)
  const advice = generateAdvice(metrics).map((item) => {
    const metric = metrics.find((x) => x.id === item.metricId)
    return { ...item, message: metric ? adviceFor(metric) : item.message }
  })
  console.log(`  Shape:       ${classifyFaceShape(lm)}`)
  console.log(`  Score:       ${breakdown.composite}/100  PSL ${breakdown.pslBand}`)
  console.log('\n  Category scores:')
  for (const cat of breakdown.categories) {
    console.log(`    ${cat.label.padEnd(16)} ${Math.round(cat.score * 100)}%`)
  }
  console.log('\n  CURRENT RULE-BASED ADVICE (template strings):')
  if (advice.length === 0) {
    console.log('    (no advice — all metrics above threshold)')
  }
  for (const a of advice) {
    console.log(`    [${a.severity.toUpperCase().padEnd(6)}] ${a.label}`)
    console.log(`      ${a.message}`)
  }
}

const balanced = makeLandmarks()
const asymmetric = makeLandmarks({ asymShift: 0.06 })
const narrow = makeLandmarks({ narrow: 0.25 })

printAnalysis('Balanced face (control)', balanced)
printAnalysis('Asymmetric face (right side shifted)', asymmetric)
printAnalysis('Narrow face (width compressed)', narrow)

// Also exercise analyzeFace (the end-to-end path the app uses)
console.log('\n==============================================')
console.log('analyzeFace() end-to-end sanity (balanced)')
console.log('==============================================')
const full = analyzeFace(balanced)
console.log(`  composite=${full.breakdown.composite} shape=${full.faceShape} adviceCount=${full.advice.length}`)
