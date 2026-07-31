import { useEffect, useRef, useState, useCallback } from 'react'
import type { CSSProperties } from 'react'
import { detectFromImage, getLandmarker, toEngineImage, imageBitmapFromFile } from '../lib/faceEngine'
import type { Landmarks } from '../lib/geometry'
import { analyzeFace } from '../lib/analysis'
import type { FaceAnalysis } from '../lib/analysis'
import { css, btn, GradText, Pill } from '../components/ui'
import { CameraIcon, UploadIcon, LockIcon, RefreshIcon, CloseIcon, SparkIcon } from '../components/icons'

interface ScanPageProps {
  onAnalyzed: (analysis: FaceAnalysis, landmarks: Landmarks, image: HTMLCanvasElement) => void
  initialAnalysis?: FaceAnalysis | null
  initialLandmarks?: Landmarks | null
  initialImage?: string | null
}

type Stage = 'idle' | 'ready' | 'scanning' | 'analyzed'

const FACE_GUIDE_IDX = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400,
  377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
]

export default function ScanPage({ onAnalyzed, initialAnalysis, initialLandmarks, initialImage }: ScanPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [stage, setStage] = useState<Stage>(initialAnalysis ? 'analyzed' : 'idle')
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [captured, setCaptured] = useState<HTMLCanvasElement | null>(null)
  const [result, setResult] = useState<FaceAnalysis | null>(initialAnalysis ?? null)
  const [landmarks, setLandmarks] = useState<Landmarks | null>(initialLandmarks ?? null)
  const [cameraFailed, setCameraFailed] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)

  const startCamera = useCallback(async () => {
    if (cameraFailed) return
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      })
      setStream(s)
      setCameraActive(true)
      setStage('ready')
      setError(null)
    } catch {
      setCameraFailed(true)
      setError('Camera unavailable. You can still upload a photo.')
    }
  }, [cameraFailed])

  useEffect(() => {
    if (!stream || !videoRef.current) return
    videoRef.current.srcObject = stream
    void videoRef.current.play().catch(() => setError('Could not play camera feed.'))
  }, [stream])

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (stream) stream.getTracks().forEach((t) => t.stop())
    setStream(null)
    setCameraActive(false)
  }, [stream])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  const drawPreview = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    if (video.videoWidth === 0 || video.videoHeight === 0) return
    const w = 720
    const h = 720
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const vw = video.videoWidth
    const vh = video.videoHeight
    const srcMin = Math.min(vw, vh)
    const sx = (vw - srcMin) / 2
    const sy = (vh - srcMin) / 2
    ctx.save()
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, sx, sy, srcMin, srcMin, 0, 0, w, h)
    ctx.restore()
  }, [])

  // Live (mirrored, selfie-style) camera preview loop.
  useEffect(() => {
    if (!cameraActive || captured) return
    let raf = 0
    const tick = () => {
      drawPreview()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [cameraActive, captured, drawPreview])

  const captureFrame = useCallback((): HTMLCanvasElement | null => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera is still starting - try again in a moment.')
      return null
    }
    drawPreview()
    return canvas
  }, [drawPreview])

  const processImage = useCallback(
    async (img: HTMLCanvasElement) => {
      setStage('scanning')
      setError(null)
      try {
        setModelLoading(true)
        await getLandmarker()
      } finally {
        setModelLoading(false)
      }
      try {
        const engineImage = toEngineImage(img)
        const detection = await detectFromImage(engineImage)
        if (!detection) {
          setError('No face detected. Try again with a clearer, front-facing photo.')
          setStage('ready')
          return
        }
        const analysis = analyzeFace(detection.landmarks)
        setResult(analysis)
        setLandmarks(detection.landmarks)
        setCaptured(img)
        // Ensure the visible canvas shows the analyzed frame (upload path uses a temp canvas).
        if (img !== canvasRef.current && canvasRef.current) {
          const display = canvasRef.current
          display.width = img.width
          display.height = img.height
          const dctx = display.getContext('2d')
          if (dctx) dctx.drawImage(img, 0, 0)
        }
        setStage('analyzed')
        drawOverlay(detection.landmarks)
        onAnalyzed(analysis, detection.landmarks, img)
        // Release the camera after a successful capture.
        if (stream) stopCamera()
      } catch (e) {
        setError(`Analysis failed: ${e instanceof Error ? e.message : String(e)}`)
        setStage('ready')
      }
    },
    [onAnalyzed, stream, stopCamera],
  )

  const onCapture = useCallback(() => {
    const canvas = captureFrame()
    if (canvas) void processImage(canvas)
  }, [captureFrame, processImage])

  const onFile = useCallback(
    async (file: File) => {
      setStage('scanning')
      setError(null)
      try {
        const bitmap = await imageBitmapFromFile(file)
        const canvas = document.createElement('canvas')
        canvas.width = Math.min(bitmap.width, 1200)
        canvas.height = Math.min(bitmap.height, 1200)
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas unavailable')
        const scale = Math.min(canvas.width / bitmap.width, canvas.height / bitmap.height)
        const dw = bitmap.width * scale
        const dh = bitmap.height * scale
        ctx.drawImage(bitmap, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh)
        bitmap.close()
        await processImage(canvas)
      } catch (e) {
        setError(`Could not read image: ${e instanceof Error ? e.message : String(e)}`)
        setStage('ready')
      }
    },
    [processImage],
  )

  const drawOverlay = (lm: Landmarks) => {
    const overlay = overlayRef.current
    const base = canvasRef.current
    if (!overlay || !base) return
    overlay.width = base.width
    overlay.height = base.height
    const ctx = overlay.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, overlay.width, overlay.height)
    ctx.strokeStyle = 'rgba(34,211,238,0.85)'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    FACE_GUIDE_IDX.forEach((idx, i) => {
      const p = lm[idx]
      if (!p) return
      if (i === 0) ctx.moveTo(p.x * base.width, p.y * base.height)
      else ctx.lineTo(p.x * base.width, p.y * base.height)
    })
    ctx.closePath()
    ctx.stroke()
    ctx.strokeStyle = 'rgba(167,139,250,0.7)'
    for (const idx of [33, 133, 362, 263, 159, 145, 386, 374, 61, 291]) {
      const p = lm[idx]
      if (!p) continue
      ctx.beginPath()
      ctx.arc(p.x * base.width, p.y * base.height, 2.2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(167,139,250,0.9)'
      ctx.fill()
    }
  }

  const reset = () => {
    setStage('idle')
    setResult(null)
    setLandmarks(null)
    setCaptured(null)
    setError(null)
    if (stream) stopCamera()
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <Pill tone="primary" style={{ marginBottom: 'var(--space-md)' }}>
          <LockIcon size={13} /> 100% on-device - nothing uploaded
        </Pill>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.08 }}>
          <GradText>Scan your face.</GradText>
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '17px', marginTop: 'var(--space-sm)', maxWidth: 560, marginInline: 'auto', lineHeight: 1.55 }}>
          A Umax-style 0-100 score, golden-ratio analysis, and your own digital avatar - computed locally in your browser.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Pill>Symmetry</Pill>
          <Pill>Golden ratio</Pill>
          <Pill>Jawline</Pill>
          <Pill>Avatar studio</Pill>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', alignItems: 'start' }}>
        <div style={css.glass as CSSProperties} className="fade-up">
          <div style={{ padding: 'var(--space-lg)' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#000',
                aspectRatio: '1 / 1',
                border: 'var(--border-style)',
              }}
            >
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: cameraActive || captured ? 'block' : 'none' }}
              />
              <canvas
                ref={overlayRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              />

              {!cameraActive && stage !== 'scanning' && !captured && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 'var(--space-sm)',
                    padding: 'var(--space-lg)',
                    textAlign: 'center',
                  }}
                >
                  {initialImage ? (
                    <img src={initialImage} alt="Your scan" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <div
                        style={{
                          width: 220,
                          height: 260,
                          border: '2px dashed color-mix(in srgb, var(--muted) 55%, transparent)',
                          borderRadius: '46% 46% 44% 44%',
                          position: 'relative',
                          animation: 'breathe 3.4s ease-in-out infinite',
                          boxShadow: '0 0 40px color-mix(in srgb, var(--primary) 14%, transparent)',
                        }}
                      >
                        <div style={{ position: 'absolute', top: '26%', left: '22%', width: 28, height: 6, borderRadius: 99, background: 'color-mix(in srgb, var(--muted) 50%, transparent)', transform: 'rotate(-6deg)' }} />
                        <div style={{ position: 'absolute', top: '26%', right: '22%', width: 28, height: 6, borderRadius: 99, background: 'color-mix(in srgb, var(--muted) 50%, transparent)', transform: 'rotate(6deg)' }} />
                        <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translateX(-50%)', width: 6, height: 16, borderRadius: 99, background: 'color-mix(in srgb, var(--muted) 45%, transparent)' }} />
                        <div style={{ position: 'absolute', top: '68%', left: '38%', width: '24%', height: 8, borderRadius: 99, background: 'color-mix(in srgb, var(--muted) 45%, transparent)' }} />
                      </div>
                      <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 280, lineHeight: 1.55 }}>
                        Align your face with the outline, in good, even light.
                      </p>
                    </>
                  )}
                </div>
              )}

              {stage === 'scanning' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'var(--primary)',
                    fontSize: '15px',
                    gap: 'var(--space-md)',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      border: '3px solid var(--border)',
                      borderTopColor: 'var(--primary)',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <div style={{ color: 'var(--text2)', fontSize: 14 }}>
                    {modelLoading ? 'Loading analysis model...' : 'Analyzing face geometry...'}
                  </div>
                </div>
              )}

              <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
              {!cameraActive && !captured && (
                <>
                  <button style={btn('primary', 'lg')} onClick={() => void startCamera()}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <CameraIcon size={18} /> Use Camera
                    </span>
                  </button>
                  <button style={btn('outline', 'lg')} onClick={() => fileInputRef.current?.click()}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <UploadIcon size={18} /> Upload Photo
                    </span>
                  </button>
                </>
              )}
              {cameraActive && !captured && (
                <>
                  <button style={btn('primary', 'lg')} onClick={onCapture}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <CameraIcon size={18} /> Capture
                    </span>
                  </button>
                  <button style={btn('ghost', 'lg')} onClick={stopCamera}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <CloseIcon size={18} /> Stop
                    </span>
                  </button>
                  <button style={btn('outline', 'lg')} onClick={() => fileInputRef.current?.click()}>
                    Upload instead
                  </button>
                </>
              )}
              {captured && stage === 'analyzed' && (
                <>
                  <button style={btn('primary', 'lg')} onClick={reset}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <RefreshIcon size={18} /> Scan again
                    </span>
                  </button>
                  <button style={btn('ghost', 'lg')} onClick={() => fileInputRef.current?.click()}>
                    New photo
                  </button>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onFile(f)
              }}
            />
            {error && (
              <p style={{ color: 'var(--danger)', marginTop: 'var(--space-md)', fontSize: '14px' }}>{error}</p>
            )}
          </div>
        </div>

        <div className="fade-up" style={{ animationDelay: '80ms' }}>
          <ResultPanel result={result} landmarks={landmarks} />
        </div>
      </div>
    </div>
  )
}

function useCountUp(target: number, duration = 1100): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function CategoryBar({ label, pct }: { label: string; pct: number }) {
  const catHue = pct >= 75 ? 'var(--success)' : pct >= 55 ? 'var(--primary)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)'
  const width = useCountUp(pct, 900)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: 5 }}>
        <span style={{ color: 'var(--text2)' }}>{label}</span>
        <span style={{ color: catHue, fontWeight: 700 }}>{width}%</span>
      </div>
      <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            background: `linear-gradient(90deg, ${catHue}, color-mix(in srgb, ${catHue} 45%, var(--accent)))`,
            borderRadius: 99,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  )
}

function ResultPanel({ result }: { result: FaceAnalysis | null; landmarks: Landmarks | null }) {
  const [showMetrics, setShowMetrics] = useState(false)
  // NOTE: all hooks must run before any early return (rules of hooks).
  const gauge = result?.breakdown.composite ?? 0
  const displayGauge = useCountUp(gauge)

  if (!result) {
    return (
      <div style={{ ...css.glass, padding: 'var(--space-xl)', textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: '0 auto var(--space-md)',
            borderRadius: 'var(--radius-lg)',
            background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
          }}
        >
          <SparkIcon size={30} />
        </div>
        <h3 style={{ fontSize: '20px', marginBottom: 'var(--space-sm)' }}>Your result appears here</h3>
        <p style={{ color: 'var(--text2)', fontSize: '15px', lineHeight: 1.6 }}>
          Take a front-facing selfie with good light, a neutral expression, and your face fully in frame.
          We measure symmetry, thirds, golden ratios, jawline and more - then build your avatar.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)', textAlign: 'left' }}>
          {[
            'Works entirely offline - your photo never leaves your device',
            'Deterministic 0-100 score: same photo, same result, every time',
            'Export your avatar as PNG, SVG, or JSON for any AI pipeline',
          ].map((tip) => (
            <div key={tip} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: 'var(--text2)' }}>
              <span style={{ color: 'var(--success)', fontSize: 14, lineHeight: 1.4 }}>✓</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const { breakdown } = result
  const band = breakdown.pslBand
  const hue = gauge >= 75 ? 'var(--success)' : gauge >= 55 ? 'var(--primary)' : gauge >= 40 ? 'var(--warning)' : 'var(--danger)'
  const radius = 52
  const circ = 2 * Math.PI * radius
  const dash = (displayGauge / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ ...css.glass, padding: 'var(--space-lg)', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto' }}>
          <svg width="150" height="150" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--surface2)" strokeWidth="9" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke={hue} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.1s linear' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '34px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: hue }}>{displayGauge}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>/ 100</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Pill tone={gauge >= 60 ? 'success' : gauge >= 45 ? 'primary' : 'warning'}>PSL {band}/10</Pill>
          <Pill>Face shape: {result.faceShape}</Pill>
        </div>
      </div>

      <div style={{ ...css.glass, padding: 'var(--space-lg)' }}>
        <h4 style={{ fontSize: '16px', marginBottom: 'var(--space-md)' }}>Category breakdown</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {breakdown.categories.map((cat) => {
            const pct = Math.round(cat.score * 100)
            return <CategoryBar key={cat.id} label={cat.label} pct={pct} />
          })}
        </div>
      </div>

      <div style={{ ...css.glass, padding: 'var(--space-lg)' }}>
        <button
          onClick={() => setShowMetrics((s) => !s)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-heading)' }}>Metric details</span>
          <span style={{ color: 'var(--muted)', fontSize: 12, transition: 'transform .2s ease', transform: showMetrics ? 'rotate(180deg)' : 'none' }}>▼</span>
        </button>
        {showMetrics && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'var(--space-md)' }}>
            {result.metrics.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'color-mix(in srgb, var(--surface2) 45%, transparent)' }}>
                <span style={{ color: 'var(--text2)' }}>{m.label}</span>
                <span style={{ color: m.score >= 0.68 ? 'var(--success)' : m.score >= 0.4 ? 'var(--warning)' : 'var(--danger)', fontWeight: 700 }}>
                  {Math.round(m.score * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {result.advice.length > 0 && (
        <div style={{ ...css.glass, padding: 'var(--space-lg)' }}>
          <h4 style={{ fontSize: '16px', marginBottom: 'var(--space-md)' }}>
            Your glow-up plan <span style={{ color: 'var(--muted)', fontWeight: 500 }}>({result.advice.length} tips)</span>
          </h4>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', listStyle: 'none' }}>
            {result.advice.map((a) => (
              <li
                key={a.metricId}
                style={{
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  alignItems: 'flex-start',
                  padding: 'var(--space-sm) var(--space-sm)',
                  borderRadius: 'var(--radius-md)',
                  background: 'color-mix(in srgb, var(--surface2) 55%, transparent)',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#fff',
                    background:
                      a.severity === 'high' ? 'var(--danger)' : a.severity === 'medium' ? 'var(--warning)' : 'var(--success)',
                  }}
                >
                  {a.severity === 'high' ? '!' : a.severity === 'medium' ? 'i' : '✓'}
                </span>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--text2)' }}>{a.message}</div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
