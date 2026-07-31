import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import ScanPage from './pages/ScanPage'
import AvatarPage from './pages/AvatarPage'
import ThemesPage from './pages/ThemesPage'
import AboutPage from './pages/AboutPage'
import { useTheme } from './state/theme'
import type { FaceAnalysis } from './lib/analysis'
import type { Landmarks } from './lib/geometry'
import { ScanIcon, AvatarIcon, ThemesIcon, AboutIcon } from './components/icons'

type Page = 'scan' | 'avatar' | 'themes' | 'about'

const nav: { id: Page; label: string; icon: (props: { size?: number }) => JSX.Element }[] = [
  { id: 'scan', label: 'Scan', icon: ScanIcon },
  { id: 'avatar', label: 'Avatar', icon: AvatarIcon },
  { id: 'themes', label: 'Themes', icon: ThemesIcon },
  { id: 'about', label: 'About', icon: AboutIcon },
]

export default function App() {
  const [page, setPage] = useState<Page>('scan')
  const { themeId, setThemeId, themesList, theme } = useTheme()
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null)
  const [landmarks, setLandmarks] = useState<Landmarks | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [renderKey, setRenderKey] = useState(0)

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme.palette.bg)
  }, [theme])

  const handleAnalyzed = (a: FaceAnalysis, lm: Landmarks, img: HTMLCanvasElement) => {
    setAnalysis(a)
    setLandmarks(lm)
    try {
      setImageDataUrl(img.toDataURL('image/jpeg', 0.6))
    } catch {
      setImageDataUrl(null)
    }
  }

  const navigate = (p: Page) => {
    if (p === page) return
    setRenderKey((k) => k + 1)
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          padding: 'calc(10px + var(--safe-top)) var(--space-lg) 10px',
          background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: 'var(--border-style)',
        }}
      >
        <button
          onClick={() => navigate('scan')}
          aria-label="FaceVault home"
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 0 }}
        >
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="FaceVault" width={32} height={32} style={{ borderRadius: 9 }} />
          <span
            style={{
              fontWeight: 800,
              fontSize: 19,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              background: 'var(--gradient-text)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            FaceVault
          </span>
        </button>

        <nav style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {nav.map((n) => {
            const Icon = n.icon
            const active = page === n.id
            return (
              <button
                key={n.id}
                onClick={() => navigate(n.id)}
                className="no-select"
                aria-current={active ? 'page' : undefined}
                style={{
                  background: active ? 'color-mix(in srgb, var(--primary) 18%, transparent)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text2)',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  transition: 'background .2s ease, color .2s ease, transform .15s ease',
                }}
              >
                <Icon size={16} />
                <span className="nav-label">{n.label}</span>
              </button>
            )
          })}
        </nav>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            aria-label="Select theme"
            style={{
              background: 'var(--surface2)',
              color: 'var(--text)',
              border: 'var(--border-style)',
              borderRadius: 'var(--radius-pill)',
              padding: '9px 32px 9px 14px',
              fontSize: 13,
              fontWeight: 600,
              appearance: 'none',
              WebkitAppearance: 'none',
              cursor: 'pointer',
            }}
          >
            {themesList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <span
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              fontSize: 11,
              color: 'var(--muted)',
            }}
          >
            ▼
          </span>
        </div>
      </header>

      <main style={{ flex: 1 }} key={renderKey} className="fade-in">
        {page === 'scan' && (
          <ScanPage
            onAnalyzed={handleAnalyzed}
            initialAnalysis={analysis}
            initialLandmarks={landmarks}
            initialImage={imageDataUrl}
          />
        )}
        {page === 'avatar' && <AvatarPage landmarks={landmarks} imageDataUrl={imageDataUrl} />}
        {page === 'themes' && <ThemesPage />}
        {page === 'about' && <AboutPage />}
      </main>

      <footer
        style={{
          padding: 'var(--space-md) var(--space-lg)',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: 12,
          borderTop: 'var(--border-style)',
        }}
      >
        FaceVault - open source, fully local AI face analysis &amp; avatar studio. No uploads, no tracking.
      </footer>

      <nav
        className="mobile-tabbar"
        aria-label="Primary"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'none',
          background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderTop: 'var(--border-style)',
          padding: '6px 8px calc(6px + var(--safe-bottom))',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {nav.map((n) => {
            const Icon = n.icon
            const active = page === n.id
            return (
              <button
                key={n.id}
                onClick={() => navigate(n.id)}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '7px 4px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: 'var(--radius-md)',
                  color: active ? 'var(--primary)' : 'var(--muted)',
                  fontSize: 10.5,
                  fontWeight: active ? 700 : 500,
                  transition: 'color .2s ease',
                }}
              >
                <Icon size={21} />
                {n.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
