# FaceVault

Local AI face analysis, golden-ratio scoring, and digital avatar studio.

> Your face never leaves your device. Fully open source, fully local.

## Live links

- **Web app (GitHub Pages):** https://jiteshoffice1234-star.github.io/facevault/
- **Releases (Android APKs):** https://github.com/jiteshoffice1234-star/facevault/releases

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

## Quick start (web)

```bash
# 1. Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# 2. (Optional) Backend API + AI Coach
cd backend
npm install
npm start            # http://localhost:3001, proxies /api to frontend

# (Backend serves the built app - run `npm run build` in frontend/ first)
```

`npm test` in `frontend/` runs the geometry/scoring unit tests (Vitest).

## AI Coach (optional, privacy-first)

The AI Coach turns your numeric face measurements into personalized advice via
a language model. **Only numbers leave your device - never photos, never
landmarks.** Each analysis runs on-device; when you tap "Generate AI advice" a
strictly numeric summary is sent to an OpenAI-compatible provider.

### Configure (NVIDIA NIM, free tier)

```bash
cd backend
cp .env.example .env    # then fill in your key
```

```dotenv
PORT=3001
AI_BASE_URL=https://integrate.api.nvidia.com/v1
AI_API_KEY=nvapi-...    # from build.nvidia.com (free hosted NIM models)
AI_MODEL=nvidia/llama-3.3-nemotron-super-49b-v1
AI_TIMEOUT_MS=35000  # keep below the client's 40s abort
AI_JSON_MODE=0
```

The `.env` is gitignored - never commit a real key. Any OpenAI-compatible
endpoint works (Groq, OpenRouter, local Ollama); see `.env.example`.

### Quality evaluation

```bash
cd backend && npm run eval              # AI response for a synthetic face (needs .env)
cd frontend && npx vite-node scripts/eval-ai.ts   # side-by-side: rules vs AI on 3 faces
```

## Security

- **On-device processing** - photos, camera frames and landmarks never leave
the browser.
- **Hardened backend** - Helmet security headers + CSP, CORS allowlist (no
wildcard), rate limiting (global + 20/hr on the AI route), 100kb payload cap,
`x-powered-by` disabled, central error handler that never leaks internals.
- **Strict input validation** - Zod schemas reject anything that isn't tiny
numeric JSON; labels are sanitized against prompt-injection signatures before
reaching the model.
- **Secrets** - the AI key lives only in `backend/.env` (gitignored); nothing is
embedded in the client or the APK.
- **Client timeout** - AI requests abort after 40s so the UI never hangs.

## Build the Android APK

Requires: JDK 17+ on PATH (or `JAVA_HOME`) and the Android SDK
(`android/local.properties` with `sdk.dir=...`, or `ANDROID_HOME` set).

```bash
cd frontend
npm install
npm run apk          # debug APK  -> android/app/build/outputs/apk/debug
npm run apk:release  # release APK -> android/app/build/outputs/apk/release
```

For a **properly signed** release build, create `frontend/android/keystore.properties`:

```properties
KEYSTORE_FILE=my-release.keystore
STORE_PASS=...
KEY_ALIAS=facevault
KEY_PASS=...
```

Generate the keystore once (never commit it - both files are gitignored):

```bash
keytool -genkeypair -v -keystore my-release.keystore -alias facevault \
  -keyalg RSA -keysize 2048 -validity 10000
```

If the properties file is absent, `assembleRelease` warns and falls back to
the debug key.

## Deploy the web app (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds with a
subpath base and deploys to Pages. Manual trigger: **Actions -> Deploy web app
to GitHub Pages -> Run workflow**.

## Scripts (frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with `/api` proxy to backend |
| `npm run build` | Type-check + production build |
| `npm run test` | Vitest unit tests |
| `npm run apk` | Build debug APK |
| `npm run apk:release` | Build signed release APK |

## Scripts (backend)

| Command | Description |
|---------|-------------|
| `npm start` / `npm run dev` | Express API on :3001 (serves built frontend, proxies `/api`) |
| `npm run eval` | AI quality check against a synthetic face (needs `.env`) |

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

## Legal

Full text lives in the app (footer): **Privacy Policy**, **Terms of Service**
and **Disclaimer**. Highlights:

- No accounts, no analytics, no cookies; theme lives in local storage only.
- Biometric data: none is collected - processing is on-device and ephemeral
  (BIPA / GDPR Art. 9 / CCPA-CPRA safe by design).
- AI Coach sends numeric measurements to the configured provider only when you
  opt in.
- 13+ age gate (COPPA); scores are entertainment, not medical advice.

## Disclaimer

The face score is a geometric approximation based on published attractiveness
research, for entertainment and self-improvement guidance. It is not a clinical
instrument or a judgment of worth.

## License

MIT
