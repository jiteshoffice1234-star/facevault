import type { Landmarks } from './geometry'
import { computeMetrics, measure, scoreBreakdown, generateAdvice } from './metrics'
import type { ScoreBreakdown, AdviceItem, Metric } from './metrics'
import { adviceFor } from './advice'

export interface FaceAnalysis {
  metrics: Metric[]
  breakdown: ScoreBreakdown
  advice: AdviceItem[]
  faceShape: string
  genderGuess: string
}

const LEFT_JAW = 234
const RIGHT_JAW = 454
const TOP = 10
const CHIN = 152
const CHEEK_LEFT = 50
const CHEEK_RIGHT = 280

export function classifyFaceShape(lm: Landmarks): string {
  if (!lm || lm.length < 478) return 'unknown'
  const faceWidth = Math.hypot(lm[LEFT_JAW].x - lm[RIGHT_JAW].x, lm[LEFT_JAW].y - lm[RIGHT_JAW].y)
  const faceHeight = Math.hypot(lm[TOP].x - lm[CHIN].x, lm[TOP].y - lm[CHIN].y)
  const cheekWidth = Math.hypot(lm[CHEEK_LEFT].x - lm[CHEEK_RIGHT].x, lm[CHEEK_LEFT].y - lm[CHEEK_RIGHT].y)
  const jawWidth = faceWidth
  const ratio = faceHeight / Math.max(faceWidth, 1e-6)
  const cheekJaw = cheekWidth / Math.max(jawWidth, 1e-6)

  if (ratio > 1.5) return 'Oblong'
  if (ratio < 1.2 && cheekJaw > 1.12) return 'Round'
  if (cheekJaw < 0.92 && ratio > 1.3) return 'Heart'
  if (cheekJaw < 0.98 && ratio < 1.32) return 'Square'
  if (cheekJaw > 1.05 && ratio >= 1.2 && ratio <= 1.4) return 'Oval'
  return 'Diamond'
}

export function analyzeFace(lm: Landmarks): FaceAnalysis {
  const raw = measure(lm)
  if (!raw) throw new Error('Could not measure landmarks')
  const metrics = computeMetrics(raw)
  const breakdown = scoreBreakdown(metrics)
  const advice = generateAdvice(metrics).map((item) => {
    const metric = metrics.find((m) => m.id === item.metricId)
    return { ...item, message: metric ? adviceFor(metric) : item.message }
  })
  const faceShape = classifyFaceShape(lm)
  return { metrics, breakdown, advice, faceShape, genderGuess: 'neutral' }
}
