import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateAIAdvice, aiConfigured } from './ai.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT || 3001)

// ---- Security hardening -------------------------------------------------
app.disable('x-powered-by')

// HTTP security headers (CSP tuned for the React SPA: inline styles used by
// the design system, external built assets from self).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // wasm assets load from self; keep simple
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
)

// CORS allowlist - the GitHub Pages site and local dev. Nothing wildcard.
const ALLOWED_ORIGINS = new Set([
  'https://jiteshoffice1234-star.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
])
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, native apps) with no Origin header.
      if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true)
      return callback(new Error('Origin not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400,
  }),
)

// Payloads are tiny numeric JSON only - 100kb is generous and blocks abuse.
app.use(express.json({ limit: '100kb' }))

// Global limiter + a stricter limiter on the AI proxy route (it spends API credits).
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
})
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI advice rate limit reached (20/hour). Try again later.' },
})
app.use(globalLimiter)

// -------------------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'facevault-backend', ts: Date.now() })
})

app.get('/api/features', (_req, res) => {
  res.json({
    localAnalysis: true,
    avatarExport: ['png', 'svg', 'json'],
    themes: 12,
    models: ['mediapipe-face-landmarker-478'],
    privacy: 'on-device',
    ai: { configured: aiConfigured() },
  })
})

/**
 * POST /api/ai/advice
 *
 * Body: numeric-only face analysis. Validated strictly by Zod in ai.js.
 * Never receives photos or raw landmark arrays.
 */
app.post('/api/ai/advice', aiLimiter, async (req, res, next) => {
  try {
    const result = await generateAIAdvice(req.body)
    res.json(result)
  } catch (err) {
    // Express 4 does not forward rejected promises from async handlers to the
    // error middleware, so route them explicitly (invalid payloads throw 400).
    next(err)
  }
})

const staticDir = path.join(__dirname, '..', '..', 'frontend', 'dist')
app.use(express.static(staticDir, { maxAge: '1h', immutable: false, etag: true }))

// Unknown /api routes should return JSON 404, not the SPA shell.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// SPA fallback for everything else.
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Frontend build not found. Run `npm run build` in frontend/ first.')
    }
  })
})

// Central error handler - never leak internals.
app.use((err, _req, res, _next) => {
  const status = err?.status || 400
  const message =
    err?.expose === false || !err?.message
      ? 'Request failed'
      : String(err.message).slice(0, 200)
  console.error('[facevault-backend] error:', err?.message)
  res.status(status).json({ error: message })
})

app.listen(PORT, () => {
  console.log(`[facevault-backend] listening on http://localhost:${PORT}`)
})
