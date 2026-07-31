import { useTheme } from '../state/theme'
import { css, GradText, Pill } from '../components/ui'

export default function ThemesPage() {
  const { themeId, setThemeId, themesList, theme } = useTheme()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      <div className="fade-up" style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
          <GradText>Themes</GradText>
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 'var(--space-xs)' }}>
          12 complete themes. Every font, color, radius and shadow switches instantly - on every screen.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
        {themesList.map((t, i) => {
          const active = t.id === themeId
          return (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              className="fade-up"
              style={{
                animationDelay: `${i * 30}ms`,
                padding: 0,
                textAlign: 'left',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  ...css.glass,
                  background: t.palette.surface,
                  border: active ? `2px solid ${t.palette.primary}` : t.palette.border,
                  boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${t.palette.primary} 22%, transparent)` : 'var(--shadow-md)',
                  padding: 'var(--space-sm)',
                  transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                  fontFamily: t.fontHeading,
                }}
              >
                <div
                  style={{
                    height: 88,
                    borderRadius: 'var(--radius-sm)',
                    background: `linear-gradient(135deg, ${t.palette.primary}, ${t.palette.primary2})`,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: t.isDark ? '#fff' : '#fff',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[t.palette.surface2, t.palette.text, t.palette.accent].map((c, j) => (
                      <span key={j} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.18)' }} />
                    ))}
                  </div>
                </div>
                <div style={{ padding: '10px 8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: t.fontFamily }}>
                  <span style={{ fontSize: 13, color: t.palette.text2 }}>{t.fontHeading.split(',')[0].replace(/'/g, '')}</span>
                  {active && (
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: t.palette.primary,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800,
                        color: t.isDark ? '#000' : '#fff',
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ ...css.glass, padding: 'var(--space-lg)', marginTop: 'var(--space-xl)' }} className="fade-up">
        <h3 style={{ marginBottom: 'var(--space-sm)' }}>Live preview</h3>
        <p style={{ color: 'var(--text2)', marginBottom: 'var(--space-sm)' }}>
          This is <b style={{ color: 'var(--text)' }}>{theme.name}</b> - every element below re-skins instantly.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <button style={{ background: 'var(--gradient-text)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>Primary</button>
          <button style={{ background: 'var(--surface2)', color: 'var(--text)', border: 'var(--border-style)', padding: '10px 18px', borderRadius: 'var(--radius-pill)' }}>Ghost</button>
          <button style={{ background: 'transparent', color: 'var(--primary)', border: `1.5px solid var(--primary)`, padding: '10px 18px', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}>Outline</button>
          <Pill tone="danger">danger</Pill>
          <Pill tone="success">success</Pill>
          <Pill tone="warning">warning</Pill>
        </div>
        <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--surface)', border: 'var(--border-style)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', boxShadow: 'var(--shadow-sm)', fontSize: 14 }}>Card surface</div>
          <div style={{ background: 'var(--surface2)', border: 'var(--border-style)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', boxShadow: 'var(--shadow-md)', fontSize: 14 }}>Card surface 2</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', alignSelf: 'center' }}>
            Heading font: <b style={{ fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>Aa Bb Cc</b>
          </div>
        </div>
      </div>
    </div>
  )
}
