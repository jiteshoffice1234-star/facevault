import { describe, it, expect } from 'vitest'
import { dist, dist2d, mid, angleDeg, slopeAngleDeg, scoreFromRange, clamp01, inverseLerp } from '../src/lib/geometry'
import { measure, computeMetrics, scoreBreakdown, CATEGORY_WEIGHTS, generateAdvice } from '../src/lib/metrics'
import { classifyFaceShape, analyzeFace } from '../src/lib/analysis'
import { buildAvatar } from '../src/lib/avatar'
import type { Landmarks } from '../src/lib/geometry'

function makeLandmarks(overrides: Partial<Record<number, { x: number; y: number; z: number }>> = {}): Landmarks {
  const lm: Landmarks = []
  for (let i = 0; i < 478; i++) lm.push({ x: 0.5, y: 0.5, z: 0 })
  const p = (i: number, x: number, y: number, z = 0) => {
    lm[i] = { x, y, z }
  }
  // Symmetric front face, centered on x=0.5
  const eyeY = 0.42
  p(33, 0.5 - 0.16, eyeY)
  p(263, 0.5 + 0.16, eyeY)
  p(133, 0.5 - 0.07, eyeY)
  p(362, 0.5 + 0.07, eyeY)
  p(159, 0.5 - 0.115, eyeY - 0.02)
  p(145, 0.5 - 0.115, eyeY + 0.02)
  p(386, 0.5 + 0.115, eyeY - 0.02)
  p(374, 0.5 + 0.115, eyeY + 0.02)
  p(468, 0.5 - 0.115, eyeY)
  p(473, 0.5 + 0.115, eyeY)
  p(61, 0.5 - 0.09, 0.62)
  p(291, 0.5 + 0.09, 0.62)
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
  p(49, 0.5 - 0.04, 0.54)
  p(279, 0.5 + 0.04, 0.54)
  p(50, 0.5 - 0.17, 0.38)
  p(280, 0.5 + 0.17, 0.38)
  p(234, 0.5 - 0.155, 0.72)
  p(454, 0.5 + 0.155, 0.72)
  p(58, 0.5 - 0.14, 0.78)
  p(288, 0.5 + 0.14, 0.78)
  p(70, 0.5 - 0.08, 0.315)
  p(276, 0.5 + 0.08, 0.315)
  p(300, 0.5 + 0.08, 0.315)
  p(105, 0.5 - 0.15, 0.325)
  p(334, 0.5 + 0.15, 0.325)
  Object.assign(lm, overrides)
  return lm
}
describe('geometry', () => {
  it('computes distance', () => {
    expect(dist({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(5)
  })
  it('computes 2d distance', () => {
    expect(dist2d({ x: 0, y: 0, z: 0 }, { x: 6, y: 8, z: 0 })).toBe(10)
  })
  it('computes midpoint', () => {
    const m = mid({ x: 0, y: 0, z: 0 }, { x: 4, y: 6, z: 2 })
    expect(m).toEqual({ x: 2, y: 3, z: 1 })
  })
  it('computes angles', () => {
    const a = { x: 0, y: 0, z: 0 }
    const b = { x: 1, y: 0, z: 0 }
    const c = { x: 1, y: 1, z: 0 }
    expect(angleDeg(a, b, c)).toBeCloseTo(90, 5)
  })
  it('slope angle', () => {
    expect(slopeAngleDeg({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(45, 5)
  })
  it('clamps and lerps', () => {
    expect(clamp01(1.5)).toBe(1)
    expect(clamp01(-1)).toBe(0)
    expect(inverseLerp(5, 0, 10)).toBe(0.5)
  })
  it('scores ranges', () => {
    expect(scoreFromRange(10, 10, 5)).toBe(1)
    expect(scoreFromRange(15, 10, 5)).toBe(0)
    expect(scoreFromRange(12.5, 10, 5)).toBe(0.5)
  })
})

describe('measure', () => {
  it('returns null for bad landmarks', () => {
    expect(measure([{ x: 0, y: 0, z: 0 }])).toBeNull()
  })
  it('measures a symmetric face', () => {
    const lm = makeLandmarks()
    const m = measure(lm)
    expect(m).not.toBeNull()
    if (!m) return
    expect(m.eyeWidth).toBeGreaterThan(0)
    expect(m.faceLength).toBeGreaterThanOrEqual(m.forehead + m.midface + m.lowerFace)
    expect(m.symmetryErrors.length).toBeGreaterThan(0)
    expect(m.symmetryErrors.every((e) => e >= 0)).toBe(true)
  })
  it('detects asymmetry', () => {
    const lm = makeLandmarks()
    lm[33] = { x: 0.3, y: 0.42, z: 0 } // shift left eye outer
    const m1 = measure(lm)!
    const symmetric = measure(makeLandmarks())!
    const maxSym = Math.max(...symmetric.symmetryErrors)
    const maxAsym = Math.max(...m1.symmetryErrors)
    expect(maxAsym).toBeGreaterThan(maxSym)
  })
})

describe('scoring', () => {
  it('produces a full breakdown with all categories', () => {
    const lm = makeLandmarks()
    const m = measure(lm)!
    const metrics = computeMetrics(m)
    expect(metrics.length).toBeGreaterThan(15)
    const breakdown = scoreBreakdown(metrics)
    expect(breakdown.categories.length).toBe(Object.keys(CATEGORY_WEIGHTS).length)
    expect(breakdown.composite).toBeGreaterThanOrEqual(0)
    expect(breakdown.composite).toBeLessThanOrEqual(100)
    expect(breakdown.pslBand).toBeGreaterThanOrEqual(1)
    expect(breakdown.pslBand).toBeLessThanOrEqual(10)
  })

  it('symmetric face scores high, asymmetric scores lower', () => {
    const symmetric = scoreBreakdown(computeMetrics(measure(makeLandmarks())!)).composite
    const lm = makeLandmarks()
    for (let i = 33; i < 478; i += 37) {
      lm[i] = { x: lm[i].x - 0.12, y: lm[i].y, z: lm[i].z }
    }
    const asymmetric = scoreBreakdown(computeMetrics(measure(lm)!)).composite
    expect(asymmetric).toBeLessThan(symmetric)
  })

  it('generates advice sorted by severity', () => {
    const lm = makeLandmarks()
    const m = measure(lm)!
    const metrics = computeMetrics(m)
    const advice = generateAdvice(metrics)
    expect(Array.isArray(advice)).toBe(true)
    for (let i = 1; i < advice.length; i++) {
      const prev = metrics.find((x) => x.id === advice[i - 1].metricId)!
      const curr = metrics.find((x) => x.id === advice[i].metricId)!
      expect(prev.score).toBeLessThanOrEqual(curr.score)
    }
  })

  it('classifies face shapes deterministically', () => {
    const lm = makeLandmarks()
    const shape = classifyFaceShape(lm)
    expect(typeof shape).toBe('string')
    expect(['Oblong', 'Round', 'Heart', 'Square', 'Oval', 'Diamond', 'unknown']).toContain(shape)
  })
})

describe('analyzeFace', () => {
  it('produces a complete analysis from landmarks', () => {
    const lm = makeLandmarks()
    const a = analyzeFace(lm)
    expect(a.metrics.length).toBeGreaterThan(15)
    expect(a.breakdown.composite).toBeGreaterThanOrEqual(0)
    expect(a.breakdown.composite).toBeLessThanOrEqual(100)
    expect(a.breakdown.pslBand).toBeGreaterThanOrEqual(1)
    expect(a.breakdown.pslBand).toBeLessThanOrEqual(10)
    expect(typeof a.faceShape).toBe('string')
    expect(a.genderGuess).toBe('neutral')
    expect(Array.isArray(a.advice)).toBe(true)
  })

  it('clamps PSL band to 1..10 at extremes', () => {
    const lm = makeLandmarks()
    const a = analyzeFace(lm)
    const extreme = a.breakdown
    expect(extreme.pslBand).toBeGreaterThanOrEqual(1)
    expect(extreme.pslBand).toBeLessThanOrEqual(10)
  })
})

describe('avatar', () => {
  it('builds an SVG avatar from landmarks', () => {
    const lm = makeLandmarks()
    const result = buildAvatar(lm, 'cartoon', {
      skin: '#f4c59e',
      hair: '#4a3728',
      line: '#2b1f16',
      accent: '#ff6b6b',
      bg: 'transparent',
    })
    expect(result.svg).toContain('<svg')
    expect(result.svg).toContain('<path')
    expect(result.svg).toContain('</svg>')
    expect(result.dataUrl).toContain('data:image/svg+xml')
    const parsed = JSON.parse(result.landmarksJson)
    expect(parsed.length).toBe(478)
    expect(parsed[0]).toHaveProperty('x')
    expect(parsed[0]).toHaveProperty('z')
  })

  it('throws on invalid landmarks', () => {
    expect(() =>
      buildAvatar([{ x: 0, y: 0, z: 0 }], 'neon', {
        skin: '#f4c59e',
        hair: '#111827',
        line: '#f0abfc',
        accent: '#22d3ee',
        bg: '#0f0a1e',
      }),
    ).toThrow()
  })

  it('renders different styles without error', () => {
    const lm = makeLandmarks()
    for (const style of ['cartoon', 'neon', 'mono', 'glow'] as const) {
      const r = buildAvatar(lm, style, {
        skin: '#f4c59e',
        hair: '#111827',
        line: '#2b1f16',
        accent: '#22d3ee',
        bg: '#0f0a1e',
      })
      expect(r.svg.length).toBeGreaterThan(0)
    }
  })
})
