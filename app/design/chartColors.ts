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
 *
 * Returns an object with GETTERS so every property read re-evaluates
 * against the current brand state. This is required for live theme
 * switching: when `brand.theme.mode` flips between 'dark' and 'light',
 * inline styles that read `cc.labelColor` on each render get the new
 * value, and Chart.js options re-evaluate when the chart is re-built.
 */
export function useChartColors() {
  const brand = useBrand()
  const isLight = () => brand.theme.mode === 'light'
  return {
    get positive() { return brand.colors.positive },
    get negative() { return brand.colors.negative },
    get secondary() { return brand.colors.secondary },
    get neutral() { return brand.colors.neutral },
    get primary() { return brand.colors.primary },
    get text() { return brand.colors.text },
    get textMuted() { return brand.colors.textMuted },
    get border() { return brand.colors.border },
    get surface() { return brand.colors.surface },
    get background() { return brand.colors.background },
    // Grid/tick helpers for light vs dark mode
    get gridColor() { return isLight() ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.04)' },
    get tickColor() { return isLight() ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.3)' },
    get tickColorMuted() { return isLight() ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.2)' },
    get labelColor() { return isLight() ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)' },
    get tooltipBg() { return isLight() ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)' },
    get tooltipBorder() { return brand.colors.border },
    get tooltipText() { return brand.colors.text },
    get tooltipTextMuted() { return brand.colors.textMuted },
    get loadingBg() { return isLight() ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)' },
    get crosshairColor() { return isLight() ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)' },
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


