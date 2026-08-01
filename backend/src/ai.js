/**
 * AI advice endpoint — provider-agnostic, privacy-first.
 *
 * Sends ONLY numeric facial metrics (never photos, never landmark arrays)
 * to any OpenAI-compatible chat-completions endpoint:
 *
 *   AI_BASE_URL  (default https://api.openai.com/v1)
 *   AI_API_KEY   (required; e.g. OpenAI, Groq, OpenRouter, or a local Ollama/LM Studio proxy)
 *   AI_MODEL     (default gpt-4o-mini)
 *
 * Examples:
 *   Groq:         AI_BASE_URL=https://api.groq.com/openai/v1  AI_MODEL=llama-3.3-70b-versatile
 *   OpenRouter:   AI_BASE_URL=https://openrouter.ai/api/v1    AI_MODEL=meta-llama/llama-3.3-70b-instruct:free
 *   Local Ollama: AI_BASE_URL=http://localhost:11434/v1       AI_MODEL=llama3.2
 *
 * Fails gracefully (structured "AI unavailable" payload) when no key is
 * configured, the provider times out, or the response is malformed — the app
 * always keeps the local rule-based advice as a baseline.
 */
import { env } from 'node:process'
import { z } from 'zod'

// Keep the backend timeout UNDER the client's 40s abort (frontend/src/lib/ai.ts)
// so we never keep billing the provider after the user's tab has given up.
const DEFAULT_TIMEOUT_MS = 35000

// ---- Strict input validation (prompt-injection + abuse defense) ---------
// The AI route accepts ONLY numeric metrics. Labels are user-adjacent strings
// that get embedded into the LLM prompt, so they must be tight and sanitized.
const LABEL_RE = /^[a-zA-Z0-9][a-zA-Z0-9 /&()._'-]*$/
const INJECTION_SIGNATURES = /ignore (all |any |the )?(previous|prior|above) instructions|system prompt|system override|you are now|roleplay as|jailbreak/i

const label = z
  .string()
  .min(1)
  .max(60)
  .regex(LABEL_RE, 'Invalid label characters')
  .refine((v) => !INJECTION_SIGNATURES.test(v), 'Suspicious label content')

const idStr = z.string().min(1).max(48).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid id')
const unitStr = z.string().max(8).optional().default('')
const num = z.number().finite()

const categorySchema = z.object({
  id: idStr.optional(),
  label,
  score: num.min(0).max(1),
})

const metricSchema = z.object({
  id: idStr.optional(),
  label,
  category: idStr.optional(),
  value: num,
  ideal: num,
  tolerance: num.min(0),
  score: num.min(0).max(1.5),
  unit: unitStr,
})

const aiInputSchema = z.object({
  compositeScore: num.min(0).max(100),
  pslBand: num.min(1).max(10),
  faceShape: label.max(30).optional().default('Unknown'),
  genderGuess: label.max(20).optional().default('neutral'),
  categories: z.array(categorySchema).max(20),
  metrics: z.array(metricSchema).max(60),
})

/** Validate and return a cleaned, safe copy of the input. Throws on bad input. */
export function sanitizeAIInput(input) {
  return aiInputSchema.parse(input)
}

export function aiConfigured() {
  return Boolean(env.AI_API_KEY && env.AI_BASE_URL)
}

function providerLabel() {
  const url = (env.AI_BASE_URL || '').toLowerCase()
  if (url.includes('nvidia') || url.includes('integrate.api')) return 'NVIDIA NIM'
  if (url.includes('groq')) return 'Groq'
  if (url.includes('openrouter')) return 'OpenRouter'
  if (url.includes('ollama') || url.includes('11434') || url.includes('localhost')) return 'local LLM'
  if (url.includes('anthropic')) return 'Anthropic'
  return 'AI'
}

/**
 * Builds a compact, metric-only prompt. No image data, no landmark arrays.
 */
export function buildPrompt(input) {
  const { compositeScore, pslBand, faceShape, genderGuess, categories, metrics } = input

  const categoryLines = (categories || [])
    .map((c) => `  - ${c.label}: ${Math.round(c.score * 100)}%`)
    .join('\n')

  const metricLines = (metrics || [])
    .map((m) => {
      const dir =
        m.value > m.ideal
          ? m.value > m.ideal + m.tolerance
            ? `above ideal (${m.ideal}${m.unit ? ' ' + m.unit : ''})`
            : `near ideal (${m.ideal}${m.unit ? ' ' + m.unit : ''})`
          : m.value < m.ideal - m.tolerance
            ? `below ideal (${m.ideal}${m.unit ? ' ' + m.unit : ''})`
            : `near ideal (${m.ideal}${m.unit ? ' ' + m.unit : ''})`
      return `  - ${m.label}: ${m.value.toFixed(3)} ${m.unit || ''}(${dir}, category score ${Math.round(m.score * 100)}/100)`
    })
    .join('\n')

  return [
    'You are a warm, evidence-informed facial aesthetics advisor. A user ran an on-device face analysis. Your job: turn these NUMERIC measurements into honest, personalized, actionable guidance.',
    '',
    'EVIDENCE-INFORMED KNOWLEDGE (use honestly, never overstate):',
    '- Symmetry: research (Perrett 1999, Rhodes 2006) links symmetry with attractiveness, but the effect is modest - small asymmetries are nearly universal and usually invisible to others. Frame gently.',
    '- Facial thirds and golden ratio (phi 1.618): classic aesthetic canons, but weak empirical support as hard rules. Present them as reference points, never judgments of a person.',
    '- Jawline: perceived definition is driven mainly by low facial/body fat, posture, and muscle tone. A gonial angle near 120-130deg is a common reference range.',
    '- Eyes: a slightly positive canthal tilt and roughly one-eye-width spacing are common preferences, with wide natural variation.',
    '- Levers that genuinely help (free/low-cost): quality sleep (reduces puffiness and dark circles), hydration, less sodium/alcohol (de-puffing), upright posture (changes how jaw/chin project in photos), facial exercises (mild toning only - weak evidence), grooming (brows, hair framing), makeup/contour, and photo technique (camera angle, soft frontal light, expression).',
    '- NEVER recommend: surgery, fillers, injections, medications, "mewing" as bone-changing (weak evidence), or any pseudoscientific protocol. Never shame, rate, or judge the person.',
    '',
    'RULES:',
    "1. Be encouraging and realistic. Reference the user's ACTUAL numbers and category scores - never repeat generic text. If a category scores high, say so; if low, say exactly why and what shifts it.",
    '2. Prioritize the 2-3 biggest opportunity areas, ranked with a one-line "why" that cites the user\'s measured value.',
    '3. Keep the tone professional but warm, ~180-240 words total.',
    '4. Output STRICT JSON only, no markdown fences, with this exact shape:',
    '{',
    '  "summary": "one-paragraph personalized overview referencing the actual scores",',
    '  "priorities": [{ "area": "short label", "score": 0-100, "why": "one sentence with the user\'s number", "action": "one concrete free/low-cost action" }],',
    '  "quickWins": ["2-3 short actionable items tied to their weakest metrics"]',
    '}',
    '',
    'USER DATA (numeric only):',
    `  Composite score: ${compositeScore}/100 (PSL band ${pslBand}/10)`,
    `  Face shape: ${faceShape}`,
    `  Gender guess: ${genderGuess}`,
    '  Category scores:',
    categoryLines,
    '  Metrics:',
    metricLines,
  ].join('\n')
}

/**
 * Calls the provider. Throws on failure; caller decides how to fall back.
 */
export async function requestAIAdvice(prompt) {
  const base = (env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const model = env.AI_MODEL || 'gpt-4o-mini'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), Number(env.AI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS))

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 900,
        ...(env.AI_JSON_MODE === '1' ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: 'You output valid JSON only.' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`AI provider error ${res.status}: ${body.slice(0, 200)}`)
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error('AI provider returned empty content')

    const parsed = parseStrictJson(content)
    validateShape(parsed)
    return parsed
  } finally {
    clearTimeout(timer)
  }
}

/** Tolerates markdown fences and leading prose around the JSON object. */
export function parseStrictJson(content) {
  let text = String(content).trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) text = text.slice(start, end + 1)
  return JSON.parse(text)
}

function validateShape(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('AI response is not an object')
  if (typeof parsed.summary !== 'string' || parsed.summary.length < 20) {
    throw new Error('AI response missing a valid summary')
  }
  if (!Array.isArray(parsed.priorities) || parsed.priorities.length === 0) {
    throw new Error('AI response missing priorities')
  }
  if (!Array.isArray(parsed.quickWins) || parsed.quickWins.length === 0) {
    throw new Error('AI response missing quickWins')
  }
}

export function unavailablePayload(reason) {
  return {
    available: false,
    provider: providerLabel(),
    reason,
    message:
      reason === 'not-configured'
        ? 'AI advice is not configured yet. Set AI_API_KEY and AI_BASE_URL on the backend to enable it.'
        : reason === 'timeout'
          ? 'The AI provider took too long to respond. Try again in a moment.'
          : 'The AI provider returned an unreadable response. The rule-based advice below is still based on your real measurements.',
  }
}

export async function generateAIAdvice(input) {
  if (!aiConfigured()) return unavailablePayload('not-configured')
  let clean
  try {
    clean = sanitizeAIInput(input)
  } catch (err) {
    // Invalid / malicious payload - reject without calling the provider.
    const details = err?.issues?.[0]?.message || err?.message || 'Invalid payload'
    throw Object.assign(new Error(`Invalid AI request: ${details}`), { status: 400, expose: true })
  }
  try {
    const advice = await requestAIAdvice(buildPrompt(clean))
    return { available: true, provider: providerLabel(), ...advice }
  } catch (err) {
    // AbortError fires for both our timeout and any explicit abort; treat as timeout.
    const timedOut = err?.name === 'AbortError' || /timed? ?out/i.test(String(err?.message || ''))
    return unavailablePayload(timedOut ? 'timeout' : 'malformed')
  }
}
