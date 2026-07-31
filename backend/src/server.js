import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT || 3001)

app.use(cors())
app.use(express.json({ limit: '8mb' }))

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
  })
})

const staticDir = path.join(__dirname, '..', '..', 'frontend', 'dist')
app.use(express.static(staticDir))

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

app.listen(PORT, () => {
  console.log(`[facevault-backend] listening on http://localhost:${PORT}`)
})
