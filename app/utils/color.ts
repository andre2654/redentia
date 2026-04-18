/**
 * Color utilities for picking contrast-aware foregrounds against brand colors.
 *
 * Used by ranking/calendar/sector pages to avoid hard-coded pairs like
 * `text = brand.background` that break when a tenant uses a light primary
 * (e.g. Me Poupe! amarelo #FACC15) on a dark background.
 */

/** Parse #rgb or #rrggbb into [r, g, b]. Returns null for invalid input. */
function parseHex(hex: string): [number, number, number] | null {
  if (!hex || typeof hex !== 'string') return null
  const h = hex.trim().replace('#', '')
  if (h.length === 3) {
    const r = parseInt(h[0]! + h[0], 16)
    const g = parseInt(h[1]! + h[1], 16)
    const b = parseInt(h[2]! + h[2], 16)
    return Number.isFinite(r + g + b) ? [r, g, b] : null
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return Number.isFinite(r + g + b) ? [r, g, b] : null
  }
  return null
}

/** Relative luminance (WCAG) 0..1. */
export function luminance(hex: string): number {
  const rgb = parseHex(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((c) => {
    const x = c / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Returns the best foreground (#000 or #FFF) for a given background.
 * Used for tab pills where the active bg = brand.primary, if primary
 * is a light color (yellow, cyan, lime), we need dark text instead of
 * whatever brand.background happens to be.
 */
export function readableOn(bgHex: string): string {
  return luminance(bgHex) > 0.55 ? '#000000' : '#FFFFFF'
}

/**
 * Tint/shade a hex color by mixing with white or black.
 * amount in -1..1 (negative = darken, positive = lighten).
 */
export function mix(hex: string, amount: number): string {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  const target = amount >= 0 ? 255 : 0
  const t = Math.abs(amount)
  const [r, g, b] = rgb.map((c) => Math.round(c + (target - c) * t)) as [
    number,
    number,
    number,
  ]
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * Given a brand in light mode, returns a subtle row-hover background.
 * In dark mode, `bg-white/5` works; in light mode it's invisible, so we
 * darken the surface slightly instead.
 */
export function hoverBg(themeMode: string, surfaceHex: string): string {
  if (themeMode === 'light') {
    return mix(surfaceHex, -0.04) // 4% darker
  }
  return 'rgba(255, 255, 255, 0.05)'
}

/**
 * Picks a distinct accent for the dividend yield column when brand.primary
 * collides with brand.negative (e.g. Investidor Sardinha, primary and
 * negative are both #DC2626). Falls back to positive (green) as the
 * "renda passiva" semantic color.
 */
export function dividendAccent(
  primaryHex: string,
  negativeHex: string,
  positiveHex: string
): string {
  if (!primaryHex || !negativeHex) return primaryHex
  if (primaryHex.toLowerCase() === negativeHex.toLowerCase()) {
    return positiveHex
  }
  return primaryHex
}
