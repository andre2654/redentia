// Brand-aware static-like accessor, reads from active brand config
import { brand as activeBrand } from '~/config/brand'

export const ChartColors = {
  get positive() { return activeBrand.colors.positive },
  get negative() { return activeBrand.colors.negative },
  get secondary() { return activeBrand.colors.secondary },
  get neutral() { return activeBrand.colors.neutral },
} as const

/**
 * Brand-aware chart colors. Use inside setup() or computed().
 */
export function useChartColors() {
  const brand = useBrand()
  return {
    positive: brand.colors.positive,
    negative: brand.colors.negative,
    secondary: brand.colors.secondary,
    neutral: brand.colors.neutral,
    primary: brand.colors.primary,
    text: brand.colors.text,
    textMuted: brand.colors.textMuted,
    border: brand.colors.border,
    surface: brand.colors.surface,
    background: brand.colors.background,
    // Grid/tick helpers for light vs dark mode
    gridColor: brand.theme.mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.04)',
    tickColor: brand.theme.mode === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.3)',
    tickColorMuted: brand.theme.mode === 'light' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.2)',
    labelColor: brand.theme.mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    tooltipBg: brand.theme.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
    tooltipBorder: brand.colors.border,
    tooltipText: brand.colors.text,
    tooltipTextMuted: brand.colors.textMuted,
    loadingBg: brand.theme.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)',
    crosshairColor: brand.theme.mode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
  }
}

function normalizeHex(hex: string): string {
  const value = hex.trim()
  if (!value.startsWith('#')) return `#${value}`
  return value
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = normalizeHex(hex).replace('#', '')
  if (value.length === 3) {
    const r = parseInt(value[0] + value[0], 16)
    const g = parseInt(value[1] + value[1], 16)
    const b = parseInt(value[2] + value[2], 16)
    return { r, g, b }
  }
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return { r, g, b }
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  const safeAlpha = Math.max(0, Math.min(alpha, 1))
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`
}


