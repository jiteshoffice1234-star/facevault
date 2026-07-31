import type { CSSProperties, ReactNode } from 'react'

export const cx = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(' ')

export const css = {
  glass: {
    background: 'color-mix(in srgb, var(--surface) 72%, transparent)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: 'var(--border-style)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
  } as CSSProperties,
}

export type BtnVariant = 'primary' | 'ghost' | 'outline' | 'danger'

const btnBase: CSSProperties = {
  fontWeight: 600,
  border: 'none',
  borderRadius: 'var(--radius-pill)',
  transition:
    'transform .18s cubic-bezier(.22,1,.36,1), box-shadow .2s ease, filter .2s ease, background .2s ease, border-color .2s ease, color .2s ease',
  position: 'relative',
  overflow: 'hidden',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

export function btn(variant: BtnVariant = 'primary', size: 'md' | 'lg' | 'sm' = 'md'): CSSProperties {
  const base: CSSProperties = { ...btnBase }

  if (variant === 'primary') {
    base.background = 'var(--gradient-text)'
    base.color = '#fff'
    base.boxShadow = 'var(--shadow-glow)'
  } else if (variant === 'outline') {
    base.background = 'transparent'
    base.color = 'var(--text)'
    base.border = 'var(--border-style)'
  } else if (variant === 'danger') {
    base.background = 'var(--danger)'
    base.color = '#fff'
  } else {
    base.background = 'color-mix(in srgb, var(--surface2) 70%, transparent)'
    base.color = 'var(--text2)'
  }

  if (size === 'lg') {
    base.padding = '16px 32px'
    base.fontSize = '16px'
    base.fontWeight = 700
  } else if (size === 'sm') {
    base.padding = '8px 16px'
    base.fontSize = '13px'
  } else {
    base.padding = '12px 24px'
    base.fontSize = '15px'
  }

  return base
}

export function GradText({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        background: 'var(--gradient-text)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function Card({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div style={{ ...css.glass, ...style }} className={className}>
      {children}
    </div>
  )
}

export function Pill({
  children,
  tone = 'neutral',
  style,
}: {
  children: ReactNode
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
  style?: CSSProperties
}) {
  const tones: Record<string, CSSProperties> = {
    neutral: { background: 'var(--surface2)', color: 'var(--text2)' },
    primary: { background: 'color-mix(in srgb, var(--primary) 18%, transparent)', color: 'var(--primary)' },
    success: { background: 'color-mix(in srgb, var(--success) 18%, transparent)', color: 'var(--success)' },
    warning: { background: 'color-mix(in srgb, var(--warning) 18%, transparent)', color: 'var(--warning)' },
    danger: { background: 'color-mix(in srgb, var(--danger) 18%, transparent)', color: 'var(--danger)' },
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 12.5,
        fontWeight: 600,
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </span>
  )
}
