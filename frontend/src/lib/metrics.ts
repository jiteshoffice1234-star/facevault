import type { Landmarks, Pt } from './geometry'
import { dist2d, angleDeg, slopeAngleDeg, scoreFromRange } from './geometry'

export const IDX = {
  upperLipCenter: 0,
  noseTip: 1,
  noseBase: 2,
  glabella: 9,
  foreheadTop: 10,
  mouthOpenTop: 13,
  mouthOpenBottom: 14,
  lowerLipBottom: 17,
  eyeLOuter: 33,
  cheekL: 50,
  noseAlaL: 49,
  chinSideL: 58,
  mouthCornerL: 61,
  browInnerL: 70,
  browOuterL: 107,
  eyeLInner: 133,
  eyeLLower: 145,
  chinBottom: 152,
  eyeLUpper: 159,  philtrumTop: 164,
  noseBridge: 168,
  jawL: 234,
  browInnerR: 276,
  noseAlaR: 279,
  cheekR: 280,
  chinSideR: 288,
  mouthCornerR: 291,
  browOuterR: 336,
  eyeRInner: 362,
  eyeROuter: 263,
  eyeRLower: 374,
  eyeRUpper: 386,
  jawR: 454,
  irisL: 468,
  irisR: 473,
} as const

/** Known mirror pairs (left index, right index) across the vertical facial axis. */
const MIRROR_PAIRS: [number, number][] = [
  [33, 263],
  [133, 362],
  [159, 386],
  [145, 374],
  [61, 291],
  [50, 280],
  [234, 454],
  [70, 300],
  [105, 334],
  [49, 279],
  [58, 288],
]

export interface RawMeasurements {
  faceWidth: number
  faceLength: number
  forehead: number
  midface: number
  lowerFace: number
  eyeWidth: number
  interEyeInner: number
  interPupil: number
  eyeHeight: number
  canthalTiltL: number
  canthalTiltR: number
  noseWidth: number
  noseLength: number
  mouthWidth: number
  lipUpper: number
  lipLower: number
  philtrumLen: number
  chinLen: number
  jawWidth: number
  cheekWidth: number
  gonialAngleL: number
  gonialAngleR: number
  browHeight: number
  symmetryErrors: number[]
}

export function measure(lm: Landmarks): RawMeasurements | null {
  if (!lm || lm.length < 478) return null
  const p = (i: number): Pt => lm[i]
  const faceWidth = dist2d(p(IDX.jawL), p(IDX.jawR))
  const faceLength = dist2d(p(IDX.foreheadTop), p(IDX.chinBottom))
  if (faceWidth <= 0 || faceLength <= 0) return null

  const forehead = dist2d(p(IDX.foreheadTop), p(IDX.glabella))
  const midface = dist2d(p(IDX.glabella), p(IDX.noseBase))
  const lowerFace = dist2d(p(IDX.noseBase), p(IDX.chinBottom))

  const eyeWidth = (dist2d(p(IDX.eyeLOuter), p(IDX.eyeLInner)) + dist2d(p(IDX.eyeRInner), p(IDX.eyeROuter))) / 2
  const interEyeInner = dist2d(p(IDX.eyeLInner), p(IDX.eyeRInner))
  const interPupil = dist2d(p(IDX.irisL), p(IDX.irisR))
  const eyeHeight = (dist2d(p(IDX.eyeLUpper), p(IDX.eyeLLower)) + dist2d(p(IDX.eyeRUpper), p(IDX.eyeRLower))) / 2

  const canthalTiltL = slopeAngleDeg(p(IDX.eyeLInner), p(IDX.eyeLOuter))
  const canthalTiltR = slopeAngleDeg(p(IDX.eyeRInner), p(IDX.eyeROuter))

  const noseWidth = dist2d(p(IDX.noseAlaL), p(IDX.noseAlaR))
  const noseLength = dist2d(p(IDX.noseBridge), p(IDX.noseBase))
  const mouthWidth = dist2d(p(IDX.mouthCornerL), p(IDX.mouthCornerR))
  const lipUpper = dist2d(p(IDX.upperLipCenter), p(IDX.mouthOpenTop))
  const lipLower = dist2d(p(IDX.mouthOpenBottom), p(IDX.lowerLipBottom))
  const philtrumLen = dist2d(p(IDX.philtrumTop), p(IDX.upperLipCenter))
  const chinLen = dist2d(p(IDX.lowerLipBottom), p(IDX.chinBottom))
  const jawWidth = dist2d(p(IDX.jawL), p(IDX.jawR))
  const cheekWidth = dist2d(p(IDX.cheekL), p(IDX.cheekR))

  const gonialAngleL = angleDeg(p(IDX.jawL), p(IDX.chinBottom), p(IDX.cheekL))
  const gonialAngleR = angleDeg(p(IDX.jawR), p(IDX.chinBottom), p(IDX.cheekR))
  const browHeight = (dist2d(p(IDX.browInnerL), p(IDX.eyeLUpper)) + dist2d(p(IDX.browInnerR), p(IDX.eyeRUpper))) / 2

  const axisX = (p(IDX.jawL).x + p(IDX.jawR).x) / 2
  const symmetryErrors = MIRROR_PAIRS.map(([li, ri]) => {
    const left = p(li)
    const right = p(ri)
    const reflected = { x: 2 * axisX - left.x, y: left.y }
    return dist2d(reflected, right) / (interPupil > 0 ? interPupil : faceWidth)
  })

  return {
    faceWidth, faceLength, forehead, midface, lowerFace,
    eyeWidth, interEyeInner, interPupil, eyeHeight,
    canthalTiltL, canthalTiltR,
    noseWidth, noseLength, mouthWidth, lipUpper, lipLower,
    philtrumLen, chinLen, jawWidth, cheekWidth,
    gonialAngleL, gonialAngleR, browHeight, symmetryErrors,
  }
}

export interface Metric {
  id: string
  label: string
  category: CategoryId
  value: number
  ideal: number
  tolerance: number
  score: number
  weight: number
  unit: string
  hint: string
}

export type CategoryId = 'symmetry' | 'thirds' | 'goldenRatio' | 'jawline' | 'cheekbones' | 'eyes' | 'lips' | 'nose' | 'chin'

export const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  symmetry: 20,
  thirds: 15,
  goldenRatio: 15,
  jawline: 12,
  cheekbones: 10,
  eyes: 10,
  lips: 8,
  nose: 6,
  chin: 4,
}

const PHI = 1.618

export function computeMetrics(m: RawMeasurements): Metric[] {
  const metrics: Metric[] = []
  const add = (id: string, label: string, category: CategoryId, value: number, ideal: number, tolerance: number, unit: string, hint: string) => {
    metrics.push({ id, label, category, value, ideal, tolerance, score: scoreFromRange(value, ideal, tolerance), weight: CATEGORY_WEIGHTS[category], unit, hint })
  }

  const faceWtoL = m.faceWidth / m.faceLength

  // Symmetry
  if (m.symmetryErrors.length > 0) {
    const avgErr = m.symmetryErrors.reduce((a, b) => a + b, 0) / m.symmetryErrors.length
    const maxErr = Math.max(...m.symmetryErrors)
    add('symmetry_avg', 'Overall symmetry', 'symmetry', avgErr, 0, 0.32, '', 'Lower value = more symmetric. Mirrored landmark pairs are compared across the vertical midline.')
    add('symmetry_local', 'Local symmetry peaks', 'symmetry', maxErr, 0, 0.45, '', 'The single most asymmetric feature pair drags this down.')
  } else {
    add('symmetry_avg', 'Overall symmetry', 'symmetry', 1, 0, 0.32, '', 'Not enough landmark data to compute.')
  }

  // Facial thirds (ideal: equal thirds)
  const thirdTol = 0.09
  add('thirds_forehead', 'Forehead third', 'thirds', m.forehead / m.faceLength, 1 / 3, thirdTol, '', 'Forehead should be roughly one third of face length.')
  add('thirds_midface', 'Midface third', 'thirds', m.midface / m.faceLength, 1 / 3, thirdTol, '', 'Nose-to-glabella segment should be one third.')
  add('thirds_lower', 'Lower third', 'thirds', m.lowerFace / m.faceLength, 1 / 3, thirdTol, '', 'Nose-to-chin segment should be one third.')

  // Golden ratio metrics
  add('ratio_face', 'Face width / length', 'goldenRatio', faceWtoL, 0.75, 0.08, '', 'Ideal face W:L ratio for many attractiveness models is ~0.75.')
  add('ratio_eye_face', 'Eye width / face width', 'goldenRatio', m.eyeWidth / m.faceWidth, 0.31, 0.04, '', 'Combined eye width relative to face width.')
  add('ratio_nose', 'Nose width / length', 'goldenRatio', m.noseWidth / m.noseLength, 0.62, 0.12, '', 'Nose width-to-length ratio target ~0.62.')
  add('ratio_mouth', 'Mouth width / nose width', 'goldenRatio', m.mouthWidth / m.noseWidth, 1.5, 0.25, '', 'Mouth-to-nose width ratio.')
  add('ratio_phi_face', 'Golden face ratio', 'goldenRatio', m.faceLength / m.faceWidth, PHI * 0.75, 0.1, '', 'Face length approximates phi * width for the classic ideal.')
  add('ratio_interocular', 'Interocular ratio', 'goldenRatio', m.interEyeInner / m.eyeWidth, 1.0, 0.2, '', 'Inner eye distance relative to a single eye width.')

  // Jawline
  add('jaw_width', 'Jaw width / face width', 'jawline', m.jawWidth / m.faceWidth, 0.82, 0.1, '', 'Gonial width to bizygomatic width ratio.')
  add('jaw_gonial', 'Gonial angle', 'jawline', (m.gonialAngleL + m.gonialAngleR) / 2, 124, 8, 'deg', 'Gonial angle ~124deg is the common masculine ideal.')
  add('jaw_defined', 'Jaw-to-face contrast', 'jawline', m.jawWidth / m.cheekWidth, 0.92, 0.1, '', 'Narrower jaw relative to cheekbones reads as more defined.')

  // Cheekbones
  add('cheek_ratio', 'Cheekbone ratio', 'cheekbones', m.cheekWidth / m.faceLength, 1.05, 0.12, '', 'Bizygomatic width relative to face length.')
  add('cheek_face', 'Cheek width / face width', 'cheekbones', m.cheekWidth / m.faceWidth, 1.1, 0.1, '', 'Cheekbones wider than jaw reads as prominent.')

  // Eyes
  add('eye_dist', 'Eye separation', 'eyes', m.interPupil / m.faceWidth, 0.46, 0.05, '', 'Pupil distance relative to face width.')
  add('eye_ratio', 'Eye width / height', 'eyes', m.eyeWidth / m.eyeHeight, 3.1, 0.6, '', 'Eye aspect ratio (W/H).')
  add('eye_tilt', 'Canthal tilt', 'eyes', (m.canthalTiltL + m.canthalTiltR) / 2, -5, 6, 'deg', 'Positive (upward outer corner) tilt is preferred.')
  add('eye_brow', 'Brow-to-eye gap', 'eyes', m.browHeight / m.eyeHeight, 0.55, 0.25, '', 'Brow height relative to eye height.')

  // Lips
  add('lip_width', 'Lip width ratio', 'lips', m.mouthWidth / m.faceWidth, 0.36, 0.06, '', 'Mouth width relative to face width.')
  add('lip_ratio', 'Lip proportion', 'lips', m.lipUpper / (m.lipLower || 1), 0.75, 0.25, '', 'Upper-to-lower lip ratio.')
  add('lip_philtrum', 'Philtrum length', 'lips', m.philtrumLen / m.noseLength, 0.18, 0.08, '', 'Philtrum relative to nose length.')

  // Nose
  add('nose_length', 'Nose length / face', 'nose', m.noseLength / m.faceLength, 0.36, 0.06, '', 'Nose length relative to face length.')
  add('nose_width_face', 'Nose width / face', 'nose', m.noseWidth / m.faceWidth, 0.21, 0.05, '', 'Nose width relative to face width.')

  // Chin
  add('chin_proj', 'Chin length / face', 'chin', m.chinLen / m.faceLength, 0.16, 0.05, '', 'Chin length relative to face length.')
  add('chin_jaw', 'Chin vs jaw', 'chin', m.chinLen / m.jawWidth, 0.22, 0.08, '', 'Chin-to-jaw relationship.')

  return metrics
}

export interface ScoreBreakdown {
  categories: { id: CategoryId; label: string; score: number; weight: number }[]
  composite: number
  pslBand: number
}

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  symmetry: 'Symmetry',
  thirds: 'Facial thirds',
  goldenRatio: 'Golden ratio',
  jawline: 'Jawline',
  cheekbones: 'Cheekbones',
  eyes: 'Eyes',
  lips: 'Lips',
  nose: 'Nose',
  chin: 'Chin',
}

export function scoreBreakdown(metrics: Metric[]): ScoreBreakdown {
  const catScores = new Map<CategoryId, { sum: number; count: number }>()
  for (const metric of metrics) {
    const entry = catScores.get(metric.category) ?? { sum: 0, count: 0 }
    entry.sum += metric.score
    entry.count += 1
    catScores.set(metric.category, entry)
  }
  let composite = 0
  const categories = (Object.keys(CATEGORY_WEIGHTS) as CategoryId[]).map((id) => {
    const entry = catScores.get(id)
    const score = entry && entry.count > 0 ? entry.sum / entry.count : 0
    composite += score * CATEGORY_WEIGHTS[id]
    return { id, label: CATEGORY_LABELS[id], score, weight: CATEGORY_WEIGHTS[id] }
  })
  const totalWeight = (Object.keys(CATEGORY_WEIGHTS) as CategoryId[]).reduce((a, c) => a + CATEGORY_WEIGHTS[c], 0)
  const compositeScore = Math.round((composite / totalWeight) * 100)
  const pslBand = Math.max(1, Math.min(10, Math.round(1 + (compositeScore / 100) * 9)))
  return { categories, composite: compositeScore, pslBand }
}

export interface AdviceItem {
  metricId: string
  category: CategoryId
  label: string
  message: string
  severity: 'high' | 'medium' | 'low'
}

export function generateAdvice(metrics: Metric[]): AdviceItem[] {
  return metrics
    .filter((metric) => metric.score < 0.68)
    .sort((a, b) => a.score - b.score)
    .slice(0, 8)
    .map((metric) => {
      const severity = metric.score < 0.4 ? 'high' : metric.score < 0.55 ? 'medium' : 'low'
      return { metricId: metric.id, category: metric.category, label: metric.label, message: metric.hint, severity }
    })
}
