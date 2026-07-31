import { useMemo, useState } from 'react'
import { buildAvatar, downloadAvatar } from '../lib/avatar'
import type { AvatarResult, AvatarStyle } from '../lib/avatar'
import type { Landmarks } from '../lib/geometry'
import { css, btn, Pill } from '../components/ui'
import { DownloadIcon } from '../components/icons'

interface AvatarPageProps {
  landmarks: Landmarks | null
  imageDataUrl?: string | null
}

const styles: { id: AvatarStyle; label: string; desc: string }[] = [
  { id: 'cartoon', label: 'Cartoon', desc: 'Soft, playful' },
  { id: 'neon', label: 'Neon', desc: 'Cyber glow' },
  { id: 'mono', label: 'Mono', desc: 'Minimal ink' },
  { id: 'glow', label: 'Glow', desc: 'Aura light' },
]

const palettePresets = {
  cartoon: { skin: '#f4c59e', hair: '#4a3728', line: '#2b1f16', accent: '#ff6b6b', bg: 'transparent' },
  neon: { skin: '#e8b98a', hair: '#111827', line: '#f0abfc', accent: '#22d3ee', bg: '#0f0a1e' },
  mono: { skin: '#e5e5e5', hair: '#262626', line: '#111111', accent: '#737373', bg: '#fafafa' },
  glow: { skin: '#f2c9a0', hair: '#1e293b', line: '#334155', accent: '#a78bfa', bg: '#0b0e14' },
}

const skinTones = ['#f4c59e', '#f2c9a0', '#e8b98a', '#d9a066', '#c68642', '#a06e3c', '#8d5524', '#5c3a21', '#3e2723']
const hairColors = ['#4a3728', '#111827', '#1e293b', '#262626', '#3b2a1a', '#ffd700', '#c0392b', '#8e44ad', '#111111']
const accents = ['#ff6b6b', '#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#ec4899', '#f0f', '#ffffff']

export default function AvatarPage({ landmarks, imageDataUrl }: AvatarPageProps) {
  const [style, setStyle] = useState<AvatarStyle>('cartoon')
  const [skin, setSkin] = useState(palettePresets.cartoon.skin)
  const [hair, setHair] = useState(palettePresets.cartoon.hair)
  const [accent, setAccent] = useState(palettePresets.cartoon.accent)
  const [bg, setBg] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const result: AvatarResult | null = useMemo(() => {
    if (!landmarks) return null
    try {
      const colors = { skin, hair, line: '#222', accent, bg: bg ?? 'transparent' }
      return buildAvatar(landmarks, style, colors)
    } catch {
      return null
    }
  }, [landmarks, style, skin, hair, accent, bg])

  if (!landmarks) {
    return (
      <div style={{ ...css.glass, padding: 'var(--space-xl)', textAlign: 'center', maxWidth: 560, margin: 'var(--space-2xl) auto' }}>
        <h3 style={{ fontSize: '20px', marginBottom: 'var(--space-sm)' }}>Scan your face first</h3>
        <p style={{ color: 'var(--text2)' }}>
          Go to Scan, capture or upload a selfie, and your digital avatar will be built from the detected face.
        </p>
      </div>
    )
  }

  const onStyle = (s: AvatarStyle) => {
    setStyle(s)
    const p = palettePresets[s]
    setSkin(p.skin)
    setHair(p.hair)
    setAccent(p.accent)
    setBg(p.bg === 'transparent' ? null : p.bg)
  }

  const doDownload = (format: 'svg' | 'json' | 'png') => {
    if (!result) return
    downloadAvatar(result, format, 'facevault-avatar')
    setNote(`Downloaded ${format.toUpperCase()}`)
    setTimeout(() => setNote(''), 2000)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      <div className="fade-up" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>Avatar Studio</h1>
        <p style={{ color: 'var(--text2)', marginTop: 'var(--space-xs)' }}>
          A stylized avatar is rendered from your detected landmarks. Fully local - export it anywhere.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)', alignItems: 'start' }}>
        <div style={{ ...css.glass, padding: 'var(--space-lg)' }} className="fade-up">
          <h4 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 'var(--space-sm)' }}>Style</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {styles.map((s) => {
              const active = style === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => onStyle(s.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: active ? '1.5px solid var(--primary)' : 'var(--border-style)',
                    background: active ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--surface2)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color .2s ease, background .2s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.desc}</div>
                </button>
              )
            })}
          </div>

          <h4 style={{ fontSize: 14, color: 'var(--text2)', margin: 'var(--space-lg) 0 var(--space-sm)' }}>Skin tone</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {skinTones.map((c) => (
              <button
                key={c}
                onClick={() => setSkin(c)}
                aria-label={`Skin ${c}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: c,
                  border: skin === c ? '2px solid var(--ring)' : '1px solid rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'transform .15s ease',
                }}
              />
            ))}
          </div>

          <h4 style={{ fontSize: 14, color: 'var(--text2)', margin: 'var(--space-lg) 0 var(--space-sm)' }}>Hair color</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {hairColors.map((c) => (
              <button
                key={c}
                onClick={() => setHair(c)}
                aria-label={`Hair ${c}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: c,
                  border: hair === c ? '2px solid var(--ring)' : '1px solid rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'transform .15s ease',
                }}
              />
            ))}
          </div>

          <h4 style={{ fontSize: 14, color: 'var(--text2)', margin: 'var(--space-lg) 0 var(--space-sm)' }}>Accent</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {accents.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                aria-label={`Accent ${c}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: c,
                  border: accent === c ? '2px solid var(--ring)' : '1px solid rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'transform .15s ease',
                }}
              />
            ))}
          </div>

          <h4 style={{ fontSize: 14, color: 'var(--text2)', margin: 'var(--space-lg) 0 var(--space-sm)' }}>Background</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['transparent', '#0b0e14', '#ffffff', '#f4c59e', '#22d3ee', '#a78bfa'].map((c) => (
              <button
                key={c}
                onClick={() => setBg(c === 'transparent' ? null : c)}
                aria-label={`Background ${c}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: c === 'transparent' ? 'repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 12px 12px' : c,
                  border: bg === c || (c === 'transparent' && bg === null) ? '2px solid var(--ring)' : '1px solid rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'transform .15s ease',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <button style={btn('primary')} onClick={() => doDownload('png')}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <DownloadIcon size={16} /> PNG
              </span>
            </button>
            <button style={btn('outline')} onClick={() => doDownload('svg')}>SVG</button>
            <button style={btn('outline')} onClick={() => doDownload('json')}>JSON landmarks</button>
          </div>
          {note && <p style={{ color: 'var(--success)', fontSize: '13px', marginTop: 'var(--space-sm)' }}>{note}</p>}

          <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: 'var(--space-md)', lineHeight: 1.5 }}>
            JSON exports the raw 478 3D landmark coordinates - ready to feed any AI model, avatar rig, or VRM pipeline.
          </p>
        </div>

        <div style={{ ...css.glass, padding: 'var(--space-lg)', textAlign: 'center', position: 'sticky', top: 90 }} className="fade-up">
          <div
            style={{
              background:
                bg === null
                  ? 'repeating-conic-gradient(color-mix(in srgb, var(--surface2) 60%, transparent) 0% 25%, color-mix(in srgb, var(--surface2) 30%, transparent) 0% 50%) 0 0 / 16px 16px'
                  : bg,
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md)',
              border: 'var(--border-style)',
            }}
          >
            {result ? (
              <img
                src={result.dataUrl}
                alt="Generated avatar"
                style={{ width: '100%', maxWidth: 380, borderRadius: 'var(--radius-lg)', animation: 'floaty 5s ease-in-out infinite' }}
              />
            ) : (
              <p style={{ color: 'var(--muted)' }}>Avatar unavailable</p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Pill tone="primary">{style}</Pill>
            {imageDataUrl && <Pill>from your scan</Pill>}
          </div>
        </div>
      </div>
    </div>
  )
}
