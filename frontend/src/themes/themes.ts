export interface Theme {
  id: string
  name: string
  fontFamily: string
  fontHeading: string
  palette: {
    bg: string
    bg2: string
    surface: string
    surface2: string
    text: string
    text2: string
    muted: string
    primary: string
    primary2: string
    accent: string
    danger: string
    success: string
    warning: string
    border: string
    ring: string
  }
  radius: {
    sm: string
    md: string
    lg: string
    xl: string
    pill: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  shadow: {
    sm: string
    md: string
    lg: string
    glow: string
  }
  effects: {
    glassBlur: string
    gradientBg: string
    gradientText: string
    hoverLift: string
    borderStyle: string
  }
  isDark: boolean
}

const base = (over: Partial<Theme> & { id: string; name: string; isDark: boolean; fontFamily: string; fontHeading: string; palette: Theme['palette'] }): Theme => {
  const radius: Theme['radius'] = {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    pill: '999px',
  }
  const spacing: Theme['spacing'] = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  }
  return {
    radius,
    spacing,
    shadow: { sm: '0 1px 2px rgba(0,0,0,.3)', md: '0 6px 24px rgba(0,0,0,.35)', lg: '0 12px 40px rgba(0,0,0,.5)', glow: '0 0 24px rgba(34,211,238,.35)' },
    effects: { glassBlur: 'blur(14px)', gradientBg: 'none', gradientText: 'linear-gradient(135deg,#22d3ee,#a78bfa)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #1e2a3d' },
    ...over,
  }
}

export const themes: Theme[] = [
  base({
    id: 'noir',
    name: 'Noir',
    isDark: true,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Space Grotesk', 'Inter', sans-serif",
    palette: {
      bg: '#0b0e14', bg2: '#0f1520', surface: '#121926', surface2: '#1a2332',
      text: '#e6edf7', text2: '#aab8cc', muted: '#6b7a92',
      primary: '#22d3ee', primary2: '#3b82f6', accent: '#a78bfa',
      danger: '#f87171', success: '#34d399', warning: '#fbbf24',
      border: '#1e2a3d', ring: '#22d3ee',
    },
    shadow: { sm: '0 1px 2px rgba(0,0,0,.3)', md: '0 6px 24px rgba(0,0,0,.35)', lg: '0 12px 40px rgba(0,0,0,.5)', glow: '0 0 24px rgba(34,211,238,.35)' },
    effects: { glassBlur: 'blur(14px)', gradientBg: 'radial-gradient(1200px 600px at 20% -10%, rgba(34,211,238,.12), transparent 60%), radial-gradient(1000px 500px at 110% 10%, rgba(167,139,250,.10), transparent 55%)', gradientText: 'linear-gradient(135deg,#22d3ee,#a78bfa)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #1e2a3d' },
  }),
  base({
    id: 'aurora',
    name: 'Aurora',
    isDark: true,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Sora', 'Inter', sans-serif",
    palette: {
      bg: '#070b14', bg2: '#0b1220', surface: '#0e1730', surface2: '#16223f',
      text: '#eef2ff', text2: '#b3c0e0', muted: '#7583a8',
      primary: '#818cf8', primary2: '#34d399', accent: '#c084fc',
      danger: '#fb7185', success: '#34d399', warning: '#fde047',
      border: '#1e2c4d', ring: '#818cf8',
    },
    shadow: { sm: '0 1px 2px rgba(0,0,0,.4)', md: '0 8px 30px rgba(30,44,77,.5)', lg: '0 16px 50px rgba(30,44,77,.6)', glow: '0 0 30px rgba(129,140,248,.4)' },
    effects: { glassBlur: 'blur(16px)', gradientBg: 'radial-gradient(1000px 500px at 10% -10%, rgba(129,140,248,.16), transparent 55%), radial-gradient(900px 500px at 110% 20%, rgba(52,211,153,.12), transparent 50%)', gradientText: 'linear-gradient(135deg,#818cf8,#34d399)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #1e2c4d' },
  }),
  base({
    id: 'hologram',
    name: 'Hologram',
    isDark: true,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Syne', 'Inter', sans-serif",
    palette: {
      bg: '#0a0a12', bg2: '#101018', surface: '#14141f', surface2: '#1c1c2a',
      text: '#f5f3ff', text2: '#c7c2e8', muted: '#8d86b8',
      primary: '#e879f9', primary2: '#38bdf8', accent: '#facc15',
      danger: '#f87171', success: '#4ade80', warning: '#fbbf24',
      border: '#2a2440', ring: '#e879f9',
    },
    shadow: { sm: '0 1px 2px rgba(0,0,0,.35)', md: '0 8px 32px rgba(120,60,200,.28)', lg: '0 16px 56px rgba(120,60,200,.4)', glow: '0 0 28px rgba(232,121,249,.4)' },
    effects: { glassBlur: 'blur(18px)', gradientBg: 'radial-gradient(900px 600px at 15% -10%, rgba(232,121,249,.14), transparent 55%), radial-gradient(800px 500px at 115% 30%, rgba(56,189,248,.12), transparent 50%), radial-gradient(600px 400px at 50% 120%, rgba(250,204,21,.06), transparent 50%)', gradientText: 'linear-gradient(120deg,#e879f9,#38bdf8,#facc15)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #2a2440' },
  }),
  base({
    id: 'neo-tokyo',
    name: 'Neo Tokyo',
    isDark: true,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Orbitron', 'Inter', sans-serif",
    palette: {
      bg: '#0d0418', bg2: '#140826', surface: '#180b2e', surface2: '#221040',
      text: '#f3e8ff', text2: '#cfc0ee', muted: '#9380b8',
      primary: '#f0f', primary2: '#00f5ff', accent: '#ff2d95',
      danger: '#ff5c5c', success: '#3dffc3', warning: '#ffd93d',
      border: '#2e1650', ring: '#f0f',
    },
    shadow: { sm: '0 1px 2px rgba(0,0,0,.5)', md: '0 8px 32px rgba(255,0,255,.22)', lg: '0 16px 60px rgba(255,0,255,.3)', glow: '0 0 30px rgba(255,0,255,.45)' },
    effects: { glassBlur: 'blur(14px)', gradientBg: 'radial-gradient(800px 500px at 10% -5%, rgba(255,0,255,.16), transparent 55%), radial-gradient(800px 500px at 110% 15%, rgba(0,245,255,.14), transparent 50%)', gradientText: 'linear-gradient(120deg,#f0f,#00f5ff)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #2e1650' },
  }),
  base({
    id: 'sunset',
    name: 'Sunset',
    isDark: true,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Clash Display', 'Inter', sans-serif",
    palette: {
      bg: '#150b0f', bg2: '#1c0f14', surface: '#211118', surface2: '#2e1a22',
      text: '#fff1f2', text2: '#e0bcc4', muted: '#a77d88',
      primary: '#fb7185', primary2: '#fb923c', accent: '#f472b6',
      danger: '#ef4444', success: '#4ade80', warning: '#fbbf24',
      border: '#3a1f28', ring: '#fb7185',
    },
    shadow: { sm: '0 1px 2px rgba(0,0,0,.4)', md: '0 8px 30px rgba(251,113,133,.2)', lg: '0 16px 55px rgba(251,113,133,.3)', glow: '0 0 26px rgba(251,113,133,.4)' },
    effects: { glassBlur: 'blur(14px)', gradientBg: 'radial-gradient(900px 550px at 15% -5%, rgba(251,113,133,.18), transparent 55%), radial-gradient(800px 500px at 110% 20%, rgba(251,146,60,.12), transparent 50%)', gradientText: 'linear-gradient(135deg,#fb7185,#fb923c)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #3a1f28' },
  }),
  base({
    id: 'mint',
    name: 'Mint',
    isDark: false,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Sora', 'Inter', sans-serif",
    palette: {
      bg: '#f4fbf7', bg2: '#eafaf2', surface: '#ffffff', surface2: '#f0f9f4',
      text: '#123026', text2: '#3f5f52', muted: '#7fa293',
      primary: '#10b981', primary2: '#06b6d4', accent: '#8b5cf6',
      danger: '#ef4444', success: '#10b981', warning: '#f59e0b',
      border: '#d5efe2', ring: '#10b981',
    },
    shadow: { sm: '0 1px 3px rgba(16,185,129,.12)', md: '0 8px 28px rgba(16,185,129,.14)', lg: '0 16px 48px rgba(16,185,129,.16)', glow: '0 0 24px rgba(16,185,129,.25)' },
    effects: { glassBlur: 'blur(12px)', gradientBg: 'radial-gradient(900px 500px at 10% -5%, rgba(16,185,129,.10), transparent 55%), radial-gradient(800px 500px at 110% 10%, rgba(6,182,212,.08), transparent 50%)', gradientText: 'linear-gradient(135deg,#059669,#0891b2)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #d5efe2' },
  }),
  base({
    id: 'cyber-lime',
    name: 'Cyber Lime',
    isDark: true,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Space Grotesk', 'Inter', sans-serif",
    palette: {
      bg: '#0a0f08', bg2: '#0f160b', surface: '#121a0e', surface2: '#1b2615',
      text: '#f2ffe6', text2: '#c3d9ae', muted: '#8aa66f',
      primary: '#a3e635', primary2: '#4ade80', accent: '#22d3ee',
      danger: '#f87171', success: '#a3e635', warning: '#fde047',
      border: '#22331a', ring: '#a3e635',
    },
    shadow: { sm: '0 1px 2px rgba(0,0,0,.5)', md: '0 8px 30px rgba(163,230,53,.16)', lg: '0 16px 55px rgba(163,230,53,.2)', glow: '0 0 26px rgba(163,230,53,.35)' },
    effects: { glassBlur: 'blur(14px)', gradientBg: 'radial-gradient(900px 550px at 10% -5%, rgba(163,230,53,.13), transparent 55%), radial-gradient(800px 500px at 110% 20%, rgba(34,211,238,.10), transparent 50%)', gradientText: 'linear-gradient(135deg,#a3e635,#22d3ee)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #22331a' },
  }),
  base({
    id: 'royal',
    name: 'Royal',
    isDark: true,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Playfair Display', 'Georgia', serif",
    palette: {
      bg: '#0a0c16', bg2: '#0e1120', surface: '#131730', surface2: '#1b2040',
      text: '#f0ecf9', text2: '#c4bcdd', muted: '#8b82ab',
      primary: '#6366f1', primary2: '#d4af37', accent: '#818cf8',
      danger: '#f87171', success: '#34d399', warning: '#fbbf24',
      border: '#242a4d', ring: '#6366f1',
    },
    shadow: { sm: '0 1px 2px rgba(0,0,0,.45)', md: '0 10px 34px rgba(99,102,241,.22)', lg: '0 18px 60px rgba(99,102,241,.3)', glow: '0 0 28px rgba(212,175,55,.3)' },
    effects: { glassBlur: 'blur(14px)', gradientBg: 'radial-gradient(900px 550px at 12% -5%, rgba(99,102,241,.16), transparent 55%), radial-gradient(700px 450px at 110% 25%, rgba(212,175,55,.08), transparent 50%)', gradientText: 'linear-gradient(135deg,#6366f1,#d4af37)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #242a4d' },
  }),
  base({
    id: 'paper',
    name: 'Paper',
    isDark: false,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Lora', 'Georgia', serif",
    palette: {
      bg: '#f8f7f4', bg2: '#f1efe9', surface: '#ffffff', surface2: '#f5f3ec',
      text: '#1c1a17', text2: '#4f4b45', muted: '#8b857a',
      primary: '#b45309', primary2: '#c2410c', accent: '#0f766e',
      danger: '#dc2626', success: '#15803d', warning: '#d97706',
      border: '#e5e0d6', ring: '#b45309',
    },
    shadow: { sm: '0 1px 3px rgba(60,50,30,.10)', md: '0 8px 28px rgba(60,50,30,.12)', lg: '0 16px 48px rgba(60,50,30,.14)', glow: '0 0 22px rgba(180,83,9,.18)' },
    effects: { glassBlur: 'blur(10px)', gradientBg: 'radial-gradient(900px 500px at 10% -5%, rgba(180,83,9,.06), transparent 55%)', gradientText: 'linear-gradient(135deg,#b45309,#c2410c)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #e5e0d6' },
  }),
  base({
    id: 'midnight-luxe',
    name: 'Midnight Luxe',
    isDark: true,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Playfair Display', 'Georgia', serif",
    palette: {
      bg: '#05070f', bg2: '#080b16', surface: '#0c1020', surface2: '#131a30',
      text: '#eaf0ff', text2: '#b6c3e2', muted: '#7c8cb5',
      primary: '#d4af37', primary2: '#3b82f6', accent: '#e0c979',
      danger: '#f87171', success: '#34d399', warning: '#fbbf24',
      border: '#1a2240', ring: '#d4af37',
    },
    shadow: { sm: '0 1px 2px rgba(0,0,0,.5)', md: '0 10px 36px rgba(212,175,55,.14)', lg: '0 18px 60px rgba(0,0,0,.6)', glow: '0 0 26px rgba(212,175,55,.3)' },
    effects: { glassBlur: 'blur(16px)', gradientBg: 'radial-gradient(1000px 600px at 10% -10%, rgba(212,175,55,.10), transparent 55%), radial-gradient(800px 500px at 115% 20%, rgba(59,130,246,.10), transparent 50%)', gradientText: 'linear-gradient(135deg,#d4af37,#3b82f6)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #1a2240' },
  }),
  base({
    id: 'bubblegum',
    name: 'Bubblegum',
    isDark: false,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Quicksand', 'Inter', sans-serif",
    palette: {
      bg: '#fff5f8', bg2: '#ffeef4', surface: '#ffffff', surface2: '#ffe9f1',
      text: '#3d1a2c', text2: '#7a4a60', muted: '#b0849a',
      primary: '#ec4899', primary2: '#f472b6', accent: '#c084fc',
      danger: '#ef4444', success: '#10b981', warning: '#f59e0b',
      border: '#ffd9e6', ring: '#ec4899',
    },
    shadow: { sm: '0 1px 3px rgba(236,72,153,.12)', md: '0 8px 30px rgba(236,72,153,.16)', lg: '0 16px 50px rgba(236,72,153,.2)', glow: '0 0 24px rgba(236,72,153,.3)' },
    effects: { glassBlur: 'blur(12px)', gradientBg: 'radial-gradient(900px 500px at 10% -5%, rgba(236,72,153,.10), transparent 55%), radial-gradient(700px 450px at 110% 20%, rgba(192,132,252,.08), transparent 50%)', gradientText: 'linear-gradient(135deg,#ec4899,#c084fc)', hoverLift: 'translateY(-3px)', borderStyle: '1px solid #ffd9e6' },
  }),
  base({
    id: 'monochrome',
    name: 'Monochrome',
    isDark: true,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontHeading: "'Space Grotesk', 'Inter', sans-serif",
    palette: {
      bg: '#0a0a0a', bg2: '#111111', surface: '#151515', surface2: '#1f1f1f',
      text: '#f5f5f5', text2: '#b0b0b0', muted: '#737373',
      primary: '#f5f5f5', primary2: '#a3a3a3', accent: '#e5e5e5',
      danger: '#e5e5e5', success: '#e5e5e5', warning: '#e5e5e5',
      border: '#262626', ring: '#f5f5f5',
    },
    shadow: { sm: '0 1px 2px rgba(0,0,0,.5)', md: '0 8px 30px rgba(0,0,0,.4)', lg: '0 16px 55px rgba(0,0,0,.55)', glow: '0 0 0 rgba(0,0,0,0)' },
    effects: { glassBlur: 'blur(0px)', gradientBg: 'none', gradientText: 'linear-gradient(135deg,#3a3a3a,#8a8a8a)', hoverLift: 'translateY(-2px)', borderStyle: '1px solid #262626' },
  }),
]

export const defaultThemeId = 'noir'

export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0]
}

export function applyTheme(theme: Theme): void {
  const r = document.documentElement.style
  const p = theme.palette
  r.setProperty('--bg', p.bg)
  r.setProperty('--bg2', p.bg2)
  r.setProperty('--surface', p.surface)
  r.setProperty('--surface2', p.surface2)
  r.setProperty('--text', p.text)
  r.setProperty('--text2', p.text2)
  r.setProperty('--muted', p.muted)
  r.setProperty('--primary', p.primary)
  r.setProperty('--primary2', p.primary2)
  r.setProperty('--accent', p.accent)
  r.setProperty('--danger', p.danger)
  r.setProperty('--success', p.success)
  r.setProperty('--warning', p.warning)
  r.setProperty('--border', p.border)
  r.setProperty('--ring', p.ring)
  r.setProperty('--radius-sm', theme.radius.sm)
  r.setProperty('--radius-md', theme.radius.md)
  r.setProperty('--radius-lg', theme.radius.lg)
  r.setProperty('--radius-xl', theme.radius.xl)
  r.setProperty('--radius-pill', theme.radius.pill)
  r.setProperty('--space-xs', theme.spacing.xs)
  r.setProperty('--space-sm', theme.spacing.sm)
  r.setProperty('--space-md', theme.spacing.md)
  r.setProperty('--space-lg', theme.spacing.lg)
  r.setProperty('--space-xl', theme.spacing.xl)
  r.setProperty('--space-2xl', theme.spacing['2xl'])
  r.setProperty('--shadow-sm', theme.shadow.sm)
  r.setProperty('--shadow-md', theme.shadow.md)
  r.setProperty('--shadow-lg', theme.shadow.lg)
  r.setProperty('--shadow-glow', theme.shadow.glow)
  r.setProperty('--glass-blur', theme.effects.glassBlur)
  r.setProperty('--gradient-bg', theme.effects.gradientBg)
  r.setProperty('--gradient-text', theme.effects.gradientText)
  r.setProperty('--hover-lift', theme.effects.hoverLift)
  r.setProperty('--border-style', theme.effects.borderStyle)
  r.setProperty('--font-body', theme.fontFamily)
  r.setProperty('--font-heading', theme.fontHeading)
  document.body.style.fontFamily = theme.fontFamily
  document.body.style.background = p.bg
  document.body.style.color = p.text
  document.documentElement.style.colorScheme = theme.isDark ? 'dark' : 'light'
}
