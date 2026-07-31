import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { applyTheme, getTheme, defaultThemeId, themes } from '../themes/themes'
import type { Theme } from '../themes/themes'

interface ThemeContextValue {
  theme: Theme
  themeId: string
  setThemeId: (id: string) => void
  themesList: Theme[]
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'facevault.theme'

function readStoredTheme(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && themes.some((t) => t.id === stored)) return stored
  } catch {
    /* ignore */
  }
  return defaultThemeId
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(readStoredTheme)

  useEffect(() => {
    const theme = getTheme(themeId)
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, themeId)
    } catch {
      /* ignore */
    }
  }, [themeId])

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id)
  }, [])

  const theme = getTheme(themeId)

  return (
    <ThemeContext.Provider
      value={{ theme, themeId, setThemeId, themesList: themes, isDark: theme.isDark }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
