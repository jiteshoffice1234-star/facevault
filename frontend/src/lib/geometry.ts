export interface Pt {
  x: number
  y: number
  z: number
}

export type Pt2D = Pick<Pt, 'x' | 'y'>

export interface LandmarkResult {
  landmarks: Pt[][]
}

export type Landmarks = Pt[]

export function dist(a: Pt, b: Pt): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function dist2d(a: Pt | Pt2D, b: Pt | Pt2D): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function mid(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 }
}

export function angleDeg(a: Pt, b: Pt, c: Pt): number {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const magA = Math.hypot(ab.x, ab.y)
  const magB = Math.hypot(cb.x, cb.y)
  if (magA === 0 || magB === 0) return 0
  const cos = Math.max(-1, Math.min(1, dot / (magA * magB)))
  return (Math.acos(cos) * 180) / Math.PI
}

export function slopeAngleDeg(a: Pt | Pt2D, b: Pt | Pt2D): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
}

export function symmetryError(pair: [Pt, Pt], axis: { x: number; y: number }): number {
  const reflected = { x: 2 * axis.x - pair[0].x, y: pair[0].y }
  return dist2d(reflected, pair[1])
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

export function inverseLerp(value: number, lo: number, hi: number): number {
  if (hi === lo) return 0
  return clamp01((value - lo) / (hi - lo))
}

export function scoreFromRange(value: number, ideal: number, tolerance: number): number {
  const diff = Math.abs(value - ideal) / tolerance
  return clamp01(1 - diff)
}
