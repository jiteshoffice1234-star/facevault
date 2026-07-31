import { css, GradText } from '../components/ui'
import { LockIcon, ScanIcon, AvatarIcon, ThemesIcon, SparkIcon, CheckIcon } from '../components/icons'

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      <div className="fade-up" style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
          <GradText>Your face, in your vault.</GradText>
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 'var(--space-sm)', lineHeight: 1.6 }}>
          FaceVault is a fully local, open-source AI face analysis and digital avatar studio.
          Your selfies are processed on-device - nothing is uploaded, ever.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }} className="fade-up">
        {[
          { icon: <ScanIcon size={26} />, title: 'On-device AI', text: 'Google MediaPipe Face Landmarker runs in your browser via WebAssembly. 478 3D landmarks, no cloud.' },
          { icon: <SparkIcon size={26} />, title: 'Golden-ratio scoring', text: 'Symmetry, facial thirds, phi ratios, jawline, cheekbones, eyes, lips, nose, chin - a Umax-style 0-100 face score with full explainability.' },
          { icon: <AvatarIcon size={26} />, title: 'Digital avatar', text: 'Auto-render a stylized avatar from your landmarks and export it as PNG, SVG, or JSON for any AI model or rig.' },
          { icon: <ThemesIcon size={26} />, title: '12 themes', text: 'Switch between Noir, Aurora, Hologram, Neo Tokyo and 8 more - every font, color and shadow changes instantly.' },
          { icon: <LockIcon size={26} />, title: 'Private by design', text: 'No accounts, no analytics, no uploads. Your data stays in this tab.' },
        ].map((f) => (
          <div key={f.title} style={{ ...css.glass, padding: 'var(--space-lg)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: 'var(--space-sm)' }}>{f.icon}</div>
            <h3 style={{ fontSize: 17, marginBottom: 'var(--space-xs)' }}>{f.title}</h3>
            <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>{f.text}</p>
          </div>
        ))}
      </div>

      <div style={{ ...css.glass, padding: 'var(--space-lg)', marginTop: 'var(--space-xl)' }} className="fade-up">
        <h3 style={{ marginBottom: 'var(--space-sm)' }}>How the score works</h3>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>
          The engine measures distances and angles between your facial landmarks, compares them against
          established attractiveness research (golden ratio ~1.618, equal facial thirds, symmetry, gonial
          angle ~124°, canthal tilt, and more), and combines nine weighted categories into a single
          deterministic 0-100 score. Same photo always gives the same score - no randomness.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          {['Symmetry 20%', 'Facial thirds 15%', 'Golden ratio 15%', 'Jawline 12%', 'Cheekbones 10%', 'Eyes 10%', 'Lips 8%', 'Nose 6%', 'Chin 4%'].map((w) => (
            <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text2)', background: 'var(--surface2)', padding: '5px 12px', borderRadius: 'var(--radius-pill)' }}>
              <CheckIcon size={12} style={{ color: 'var(--success)' }} /> {w}
            </span>
          ))}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 'var(--space-md)', lineHeight: 1.6 }}>
          Disclaimer: scores are a fun, geometric approximation based on published research - not a
          judgment of your worth or a clinical instrument. Real-world attractiveness is far more than
          face geometry.
        </p>
      </div>
    </div>
  )
}
