# FaceVault

Local AI face analysis, golden-ratio scoring, and digital avatar studio.

> Your face never leaves your device. Fully open source, fully local.

## Features

- **Face scan** - webcam or photo upload, processed 100% on-device with
  Google MediaPipe Face Landmarker (478 3D landmarks, WebAssembly).
- **Umax-style face score** - deterministic 0-100 composite from nine weighted
  categories (symmetry, facial thirds, golden ratio, jawline, cheekbones, eyes,
  lips, nose, chin) plus a PSL 1-10 band.
- **Improvement plan** - the lowest-scoring metrics drive a ranked, actionable
  checklist.
- **Avatar Studio** - auto-render a stylized avatar from detected landmarks and
  export as PNG, SVG, or raw landmark JSON for any AI model / rig.
- **12 themes** - Noir, Aurora, Hologram, Neo Tokyo, Sunset, Mint, Cyber Lime,
  Royal, Paper, Midnight Luxe, Bubblegum, Monochrome. Every font, color, radius
  and shadow switches instantly.
- **Privacy by design** - no accounts, no analytics, no uploads.

## Quick start

```bash
# 1. Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# 2. (Optional) Backend API
cd backend
npm install
npm start            # http://localhost:3001, proxies /api to frontend
```

`npm test` in `frontend/` runs the geometry/scoring unit tests (Vitest).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with `/api` proxy to backend |
| `npm run build` | Type-check + production build |
| `npm run test` | Vitest unit tests |
| `npm start` (backend) | Express server that also serves `frontend/dist` |

## Architecture

```
selfie -> MediaPipe FaceLandmarker (local wasm)
        -> geometry.ts   (distances/angles/symmetry from 478 landmarks)
        -> metrics.ts    (golden-ratio & research-based metrics)
        -> analysis.ts   (score breakdown + face shape + advice)
        -> avatar.ts     (SVG/canvas avatar + PNG/SVG/JSON export)
```

## Scoring model

Weights: symmetry 20, facial thirds 15, golden ratio 15, jawline 12,
cheekbones 10, eyes 10, lips 8, nose 6, chin 4 (sums to 100).

Scoring is deterministic - the same photo always returns the same score.
See `docs/` and `PLAN.md` for the full research and roadmap.

## Disclaimer

The face score is a geometric approximation based on published attractiveness
research, for entertainment and self-improvement guidance. It is not a clinical
instrument or a judgment of worth.

## License

MIT
