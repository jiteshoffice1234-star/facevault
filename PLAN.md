# FACEVAULT (working title) — AI Face Analysis + Digital Avatar Studio

A fully local, open-source web app that scans a user's face from a selfie, produces a
Umax-style facial analysis and improvement plan, and builds an exportable digital avatar.

---

## 1. Product Summary

| Item | Value |
|------|-------|
| Working name | **FaceVault** (see Section 9 for alternatives) |
| Platform | Web app (PWA-ready), fully local / offline-capable |
| Stack | Vite + React + TypeScript frontend, Node + Express backend |
| Core ML | Google MediaPipe Face Landmarker (478 landmarks, ~1.1 MB WASM) |
| Processing | 100% on-device (images never leave the machine) |
| License | MIT (open source) |

### Core loop

1. User clicks **Scan** -> webcam or file upload.
2. App captures a front selfie and a side selfie.
3. MediaPipe extracts 478 3D landmarks locally.
4. Geometry engine computes facial measurements, ratios, symmetry.
5. Analysis engine produces a **Face Score** (Umax-style), sub-scores, and an
   actionable improvement plan.
6. Avatar engine renders a stylized digital avatar (canvas/SVG) and exports it
   for use with any AI model (VRM-ready JSON, PNG, mesh OBJ).

---

## 2. What Umax Does (Research Summary)

Sources: Fortune (July 2024), App Store / Play listings, RealWorldAppeal analysis,
TikTok/Reddit coverage, autogpt.net.

- **What it is**: "Umax - Become Hot", a looksmaxxing app launched Dec 2023.
  7M+ downloads, ~$500k/month subscription revenue, 1B+ social impressions.
- **How it works**: user submits a front + side selfie; a scan animation runs; the
  app returns a score (0-100, refreshed weekly) plus attribute scores (jawline,
  cheekbones, skin quality, masculinity/"potential") and an improvement checklist.
- **Built on**: partially OpenAI models per Fortune; geometry + skin-pixel analysis
  against a trained template.
- **Monetization**: $3.99/week paywall *after* the scan; blurred scorecard as sales
  page. Free tier shows only that a number exists.
- **Known weaknesses** (opportunity for us):
  - Same face + different pose/lighting = different score (sensitive to one photo).
  - Paywall surprises users; no offline mode; photos leave the device.
  - Score is purely geometric, ignores expression, grooming, and real-life first
    impressions (the "Geometry Gap").
  - Reviewers report crashes and inconsistent rescans.
- **Lessons for our app**:
  - Front + side selfie is the proven input pattern -> adopt it.
  - Score breakdown + improvement plan drives engagement -> adopt and expand.
  - Transparency + privacy (fully local) is our differentiator.
  - Deterministic, explainable geometry scoring (no randomness) fixes the
    "same face, different number" complaint.

---

## 3. Open-Source Facial-Analysis Research

| Library | Stars | Landmarks | Runs in browser | Notes |
|---------|-------|-----------|-----------------|-------|
| **MediaPipe Face Landmarker** (Google) | 36.4k | 478 3D | Yes (WASM) | Best precision; iris + face oval; ~1.1MB WASM; needs WasmFileset from CDN. **Chosen. Frontend.** |
| face-api.js (justadudewhohacks) | 17.9k | 68 | Yes (TF.js) | Mature; tiny 190KB detector; 68 points enough for ratios; slower, larger bundles. Backup option. |
| @vladmandic/face-api (fork) | ~2.7k | 68 | Yes | Better-maintained fork of face-api.js. |
| DeepFace (serengil) | 23.2k | - | No (Python) | Age/gender/emotion/race analysis, 11 recognition models, celebrity lookalike, anti-spoofing. **Chosen. Backend optional.** |
| InsightFace (deepinsight) | 25k+ | 106 + 3D | No (Python) | ArcFace recognition + 3D landmark regression; highest accuracy. Future backend upgrade. |
| OpenCV | - | Haar / YuNet | No (natively) | Detection only; classic. |
| SCUT-FBP5500 models | - | - | - | Academic beauty-prediction datasets; used to train LightGBM on MediaPipe landmarks (see vu2f2425015-arch repo). Research reference for our scoring weights. |

### Attribution, skin & attributes (research-level, free)
- MediaPipe gives landmarks -> geometry scores (ratio of width to length = phi 1.618).
- Skin quality: local pixel analysis (smoothness/energy in HSB) around cheeks/forehead.
- Face shape: classify oval/round/square/heart/diamond from the face oval landmarks.
- Age/gender/emotion: `DeepFace.analyze` (optional backend service) for richer output.

---

## 4. Architecture

### 4.1 Monorepo layout

```
/workspace
├── docs/                     # design & architecture notes
├── backend/                  # Node + Express (optional, for local AI extras)
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/analyze.js # DeepFace bridge (optional)
│   └── package.json
├── frontend/
│   ├── public/models/        # MediaPipe WasmFileset + model
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── lib/
│   │   │   ├── faceEngine.ts      # MediaPipe wrapper (wasm local)
│   │   │   ├── geometry.ts        # pure math: ratios, angles, symmetry
│   │   │   ├── metrics.ts         # golden-ratio / PSL-style metrics
│   │   │   ├── scoring.ts         # weighted scoring engine
│   │   │   ├── advice.ts          # improvement plan generator
│   │   │   └── avatar.ts          # SVG/canvas avatar generator + export
│   │   ├── state/theme.tsx        # theming context
│   │   ├── themes/                # 10+ full theme definitions
│   │   ├── components/            # UI components
│   │   └── pages/                 # Scan, Result, Avatar, Settings
│   └── package.json
└── PLAN.md
```

### 4.2 Data flow

```
[selfie or webcam frame]
   └── faceEngine (MediaPipe, local WASM)
        └── 478 landmarks (x,y,z normalized)
             ├── geometry.ts  -> measurements (distances/angles/ratios/symmetry)
             ├── metrics.ts   -> golden ratio deltas, face shape, skin estimate
             ├── scoring.ts   -> weighted Face Score (0-100) + sub-scores
             ├── advice.ts    -> ranked improvement plan
             └── avatar.ts    -> stylized avatar (SVG) + export (PNG/JSON/VRM-ish)
```

### 4.3 Privacy
- All detection/scoring/avatar runs in the browser. Photos never uploaded.
- The optional backend service (DeepFace) is opt-in and runs locally too.
- No analytics, no tracking, no accounts required.

---

## 5. Feature Set (Phased)

### Phase 1 (this build) - Core
- Front + side selfie capture (webcam + file upload)
- Local landmark detection (MediaPipe WASM)
- Face geometry analysis: symmetry, jaw, cheekbones, chin, eyes, lips, nose, philtrum
- Golden-ratio metrics (phi 1.618 based)
- Face Score 0-100 with sub-scores and gauge
- Improvement plan generator (ranked, actionable)
- Digital avatar generation + export (PNG, SVG, JSON landmarks, OBJ mesh)
- 12 full themes (fonts, colors, radii, spacing, shadows all switch per theme)
- Smooth animations, no layout jumps, responsive, PWA-ready manifest

### Phase 2 - Growth
- Age/gender/emotion via local DeepFace backend
- Celebrity look-alike matching
- Photo upload history + progress tracking (IndexedDB)
- "Looksmax" plan scheduler (skincare, sleep, jawline exercises)
- Anti-spoofing / image-quality guidance

### Phase 3 - Scale
- Real-time webcam face tracking with live ratios
- 3D avatar rig (VRM export for Blender/Unity/Godot)
- AR makeup / hairstyle try-on
- Crowd-sourced score models (SCUT-FBP5500-trained LightGBM, trained offline)

---

## 6. Scoring Engine (deterministic + explainable)

Weights (sum = 100):

| Category | Weight | Measures |
|----------|--------|----------|
| Symmetry | 20 | Left/right mirror distance of landmark pairs |
| Facial thirds | 15 | Forehead / midface / lower-third balance |
| Golden ratio (phi) | 15 | Face W:L, eyes W, nose W:L, mouth W:L vs 1.618 |
| Jawline | 12 | Gonial angle, jaw width/length |
| Cheekbones | 10 | Bizygomatic ratio, zygomatic projection |
| Eyes | 10 | Eye distance ratio, eye width, canthal tilt |
| Lips | 8 | Lip width, lip ratio, philtrum length |
| Nose | 6 | Nose width/length, nose-lip angle |
| Chin | 4 | Chin projection, chin-face ratio |
| Overall harmony | 0 (tiebreaker) | PCA-style landmark deviation vs dataset mean |

Every sub-score is computed from exact geometry, so a given photo always returns
the same result (fixes the #1 Umax complaint). Sub-scores feed a **PSL-style band**
(1-10) plus the 0-100 composite. Improvement plan lists the lowest-scoring metrics
first with concrete instructions.

---

## 7. UI/UX Design

- **Design language**: GenZ native - bold gradients, glassmorphism cards, rounded
  corners, springy micro-interactions, dark-mode-first.
- **Flow**: Landing -> Scan (guided, front + side) -> Scan animation -> Score card
  with gauge -> Breakdown tabs -> Improvement plan -> Avatar studio -> Export.
- **12 themes** (every theme sets font, palette, radii, spacing, shadows, effects):
  1. Noir (dark, cyan accents)
  2. Aurora (dark, purple-green gradients)
  3. Hologram (iridescent, glassy)
  4. Neo Tokyo (dark + neon pink/blue)
  5. Sunset (warm orange/pink)
  6. Mint (light, soft green)
  7. Cyber Lime (dark + acid green)
  8. Royal (indigo/gold)
  9. Paper (clean light)
  10. Midnight Luxe (deep blue + gold)
  11. Bubblegum (pink pastel)
  12. Monochrome (grayscale, brutalist)
- **Performance**: CSS variables for theming, `content-visibility`, passive event
  handlers, `requestIdleCallback` for heavy math, canvas reuse, no layout thrash.

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| MediaPipe WASM must be served with correct MIME | Copy `wasm/` + model into `public/`, serve from same origin |
| ML bundle size | Load MediaPipe lazily on first scan; code-split the engine |
| Score feels arbitrary (ethics) | Deterministic, explainable scores; disclaimer copy |
| Backend Python deps heavy | Backend is optional; frontend works standalone |
| Model file availability | Pin exact CDN URLs in docs; vendor files into `public/models` |

---

## 9. Name Suggestions (GenZ)

| Name | Domain vibes | Why it works |
|------|--------------|--------------|
| **FaceVault** | facesevault.ai | Safe + locked-in + score = "vault"; privacy-first angle |
| **GlowUp** | - | Direct looksmaxxing slang, TikTok-native |
| **Ratio** | - | "Your ratios" = golden ratio fitness; fits scoring |
| **NovaFace** | - | Fresh, futuristic |
| **FaceCode** | - | Decoding your face, hacker-cool |
| **Ava** | - | Short for Avatar; soft, gender-neutral |
| **Mog** | - | "Mogging" internet slang (edgier) |

**Recommendation: FaceVault** - memorable, brandable, matches the privacy/local
selling point ("your face stays in the vault"), and clean with Avatar/Studio.

---

## 10. Validation

- `npm run build` must pass with TypeScript strict.
- Unit tests (Vitest) for `geometry`, `metrics`, `scoring`, `advice`.
- Manual test: upload a frontal portrait; verify landmark overlay + score render.
