import type { ReactNode } from 'react'
import { css, GradText } from '../components/ui'
import { LockIcon } from '../components/icons'

function LegalShell({ title, children, updated }: { title: string; children: ReactNode; updated: string }) {
  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      <div className="fade-up" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
          <GradText>{title}</GradText>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 'var(--space-sm)' }}>Last updated: {updated}</p>
      </div>
      <div className="fade-up" style={{ ...css.glass, padding: 'var(--space-xl)', fontSize: 14.5, lineHeight: 1.75, color: 'var(--text2)' }}>
        {children}
      </div>
    </div>
  )
}

function Section({ h, children }: { h: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--space-lg)' }}>
      <h2 style={{ fontSize: 17, color: 'var(--text)', marginBottom: 'var(--space-xs)', fontFamily: 'var(--font-heading)' }}>{h}</h2>
      {children}
    </section>
  )
}

function P({ children }: { children: ReactNode }) {
  return <p style={{ marginBottom: 'var(--space-sm)' }}>{children}</p>
}

const LINK = { color: 'var(--primary)', textDecoration: 'underline' } as const

export function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 31, 2026">
      <Section h="1. The short version">
        <P>
          FaceVault is designed to be private by default. Your photos, camera frames, and face measurements are
          processed <strong>entirely on your device</strong>. FaceVault does not have an account system and does not
          collect, store, or sell your personal data. We have no analytics, no advertising SDKs, and no trackers.
        </P>
        <P>
          The only optional network call is the <strong>AI Coach</strong> feature: when you explicitly tap "Generate AI
          advice", FaceVault sends <em>numeric facial measurements only</em> (e.g. "jawline 55%") to a third-party AI
          provider (<a href="https://build.nvidia.com" style={LINK}>NVIDIA NIM</a>) to generate personalized advice. Your
          photo, camera frame, and raw landmark data are <strong>never</strong> sent.
        </P>
      </Section>

      <Section h="2. What we collect">
        <P>
          We collect <strong>nothing</strong> on our servers. There is no registration, no profile, no database of
          users. The backend only answers health/feature checks and the optional AI advice request described above.
        </P>
        <P>Data that exists only on your device (and can be cleared by closing the tab or clearing site data):</P>
        <ul style={{ paddingLeft: 20, marginBottom: 'var(--space-sm)' }}>
          <li>Camera stream and captured photo (held in memory for the session only).</li>
          <li>Face measurements and your 0-100 score (in-memory for the session).</li>
          <li>Your chosen theme and avatar exports (local browser storage / downloaded files you choose to save).</li>
        </ul>
      </Section>

      <Section h="3. Biometric data">
        <P>
          FaceVault uses on-device face-geometry analysis (MediaPipe Face Landmarker running in your browser via
          WebAssembly) to compute cosmetic measurements. We do not create, store, or transmit biometric templates,
          faceprints, or identifiers. Because processing happens in your browser and results are discarded when you
          close the tab, FaceVault does not collect biometric information as defined by the Illinois Biometric
          Information Privacy Act (BIPA), GDPR Article 9, or the California CCPA/CPRA.
        </P>
      </Section>

      <Section h="4. AI Coach & third-party processing">
        <P>
          When you opt in by tapping "Generate AI advice", a strictly numeric summary of your measurements is sent to
          NVIDIA's hosted API (NVIDIA NIM, <code style={LINK}>integrate.api.nvidia.com</code>). NVIDIA processes this
          data under their own terms and privacy policy to generate the advice text. We send no image, no name, no
          email, and no identifying information. This feature can be disabled entirely by the operator of the backend
          (or simply not used).
        </P>
      </Section>

      <Section h="5. Cookies & storage">
        <P>
          FaceVault does not use tracking cookies. Your theme preference is kept in your browser's local storage solely
          so the app looks the same next visit. The installed app (PWA) may cache static assets (HTML, JS, icons, the
          offline face model) to work offline — this cache never leaves your device.
        </P>
      </Section>

      <Section h="6. Children's privacy (COPPA)">
        <P>
          FaceVault is intended for users 13 and older and is not directed at children under 13. We do not knowingly
          collect personal information from children. If you believe a child has provided data, contact us and we will
          take steps to remove it. By using FaceVault you confirm you are at least 13 years old.
        </P>
      </Section>

      <Section h="7. Your rights (GDPR / CCPA / CPRA)">
        <P>
          Because we store no personal data, there is nothing to access, correct, or delete on our side. If you are in
          the EU/UK or California, you retain all rights under applicable law (access, erasure, restriction,
          portability, and the right to object). To exercise them, or for any privacy question, contact us using the
          details below.
        </P>
      </Section>

      <Section h="8. Security">
        <P>
          The backend enforces HTTPS-only where deployed, security headers (CSP, X-Content-Type-Options,
          frame protection), CORS allowlisting, rate limiting, strict input validation, and short payload limits. No
          secrets, keys, or API credentials are embedded in the client; the AI provider key lives only in the
          operator's environment and is never exposed to the browser.
        </P>
      </Section>

      <Section h="9. Changes & contact">
        <P>
          This policy may be updated; the date at the top reflects the latest revision. Questions: open an issue on the
          FaceVault GitHub repository.
        </P>
      </Section>
    </LegalShell>
  )
}

export function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="July 31, 2026">
      <Section h="1. Acceptance">
        <P>
          By using FaceVault you agree to these Terms. If you are under 13, you may not use the app. If you are between
          13 and the age of majority, use it with a parent or guardian's permission.
        </P>
      </Section>

      <Section h="2. The service">
        <P>
          FaceVault is a free, open-source web app that performs on-device facial geometry analysis and renders
          stylized avatars. The AI Coach feature provides generated, text-based suggestions. All features are provided
          "as is" without warranty of any kind.
        </P>
      </Section>

      <Section h="3. Not medical or professional advice">
        <P>
          <strong>Important:</strong> FaceVault is an entertainment and educational tool. Its scores, measurements, and
          AI-generated advice are <strong>not</strong> medical, dermatological, psychological, or surgical advice, and
          are not a diagnosis of any condition. Attractiveness is subjective and cannot be measured by geometry. Never
          base health or appearance decisions solely on this app; consult a qualified professional for real concerns.
        </P>
      </Section>

      <Section h="4. Acceptable use">
        <P>You agree not to:</P>
        <ul style={{ paddingLeft: 20, marginBottom: 'var(--space-sm)' }}>
          <li>Use the app to harass, stalk, shame, or rate other people without their consent.</li>
          <li>Attempt to reverse-engineer, overload, or attack the backend or its rate limits.</li>
          <li>Use the app in violation of any applicable law.</li>
        </ul>
      </Section>

      <Section h="5. Intellectual property">
        <P>
          The FaceVault codebase is open source under its repository license. Your avatar exports are yours. Any
          AI-generated text belongs to its provider under their terms; you may use it for personal purposes.
        </P>
      </Section>

      <Section h="6. Limitation of liability">
        <P>
          To the maximum extent permitted by law, FaceVault and its maintainers are not liable for any indirect,
          incidental, or consequential damages arising from your use of the app, including reliance on scores or
          AI-generated advice.
        </P>
      </Section>

      <Section h="7. Governing law">
        <P>
          These Terms are governed by the laws applicable to the operator's jurisdiction, without regard to conflict
          of law principles. Questions: open an issue on the FaceVault GitHub repository.
        </P>
      </Section>
    </LegalShell>
  )
}

export function DisclaimerPage() {
  return (
    <LegalShell title="Disclaimer" updated="July 31, 2026">
      <Section h="Scores are approximations, not verdicts">
        <P>
          FaceVault's 0-100 score is a deterministic geometric approximation derived from published research on facial
          proportions (facial thirds, golden-ratio references, symmetry, gonial angle, canthal tilt, and similar). It
          is a fun, explainable heuristic — <strong>not a measure of your worth</strong>, not a medical assessment, and
          not a scientifically validated attractiveness test.
        </P>
        <P>
          Real-world perception is shaped by expression, personality, health, culture, lighting, and countless factors
          no camera can capture. The same photo always yields the same score by design; different photos of the same
          person will differ.
        </P>
      </Section>

      <Section h="AI advice is generated, not certified">
        <P>
          The AI Coach text is generated by a language model from numeric inputs. It may contain inaccuracies and is
          not a substitute for professional advice. Never attempt dangerous routines; always consult a qualified
          professional before acting on any advice related to your health or appearance.
        </P>
        <p style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--text2)' }}>
          <LockIcon size={15} style={{ flexShrink: 0, marginTop: 3, color: 'var(--success)' }} />
          Your photo never leaves your device — only optional numeric measurements go to the AI provider when you
          explicitly ask for AI advice.
        </p>
      </Section>
    </LegalShell>
  )
}
