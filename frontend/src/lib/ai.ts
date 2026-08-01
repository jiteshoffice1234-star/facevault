import type { FaceAnalysis } from './analysis'

export interface AIPriority {
  area: string
  score: number
  why: string
  action: string
}

export interface AIAdviceResult {
  available: boolean
  provider?: string
  reason?: 'not-configured' | 'timeout' | 'malformed'
  message?: string
  summary?: string
  priorities?: AIPriority[]
  quickWins?: string[]
}

/**
 * Build the privacy-safe payload: ONLY numeric metrics and category scores.
 * Never the photo, never landmark arrays.
 */
export function buildAIPayload(analysis: FaceAnalysis) {
  return {
    compositeScore: analysis.breakdown.composite,
    pslBand: analysis.breakdown.pslBand,
    faceShape: analysis.faceShape,
    genderGuess: analysis.genderGuess,
    categories: analysis.breakdown.categories.map((c) => ({
      id: c.id,
      label: c.label,
      score: c.score,
    })),
    metrics: analysis.metrics.map((m) => ({
      id: m.id,
      label: m.label,
      category: m.category,
      value: m.value,
      ideal: m.ideal,
      tolerance: m.tolerance,
      score: m.score,
      unit: m.unit,
    })),
  }
}

/**
 * POST the numeric metrics to the backend AI advisor.
 * Throws on network failure; the component handles the response shape.
 * A hard client-side timeout (40s) caps how long the spinner can run, even if
 * the backend or provider queue stalls.
 */
export async function requestAIAdvice(analysis: FaceAnalysis, signal?: AbortSignal): Promise<AIAdviceResult> {
  const timeoutSignal = AbortSignal.timeout(40000)
  const controller = new AbortController()
  const onAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onAbort)
  }
  timeoutSignal.addEventListener('abort', onAbort)
  try {
    const res = await fetch('/api/ai/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAIPayload(analysis)),
      signal: controller.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`AI advice request failed (${res.status}): ${body.slice(0, 120)}`)
    }
    return (await res.json()) as AIAdviceResult
  } finally {
    signal?.removeEventListener('abort', onAbort)
    timeoutSignal.removeEventListener('abort', onAbort)
  }
}
