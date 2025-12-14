export const ChartColors = {
  positive: '#b9ecc1',
  negative: '#8E3939',
  secondary: '#a7d6ff',
  neutral: '#6B7280',
} as const

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


