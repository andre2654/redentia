// ============================================================
// Redentia Creative — hardcoded color palette
//
// The /creative/* pages are social-media render targets (1080x1080,
// 1080x1920, etc.) used for content automation. They must render
// identically across all tenants and never leak other brands'
// colors into screenshots — so we freeze the Redentia palette
// here instead of looking up `useBrand()` at runtime.
//
// These values mirror the `redentia.colors` object in
// `config/brand.ts` and must be kept in sync if the primary
// brand theme ever changes.
// ============================================================

export const REDENTIA_COLORS = {
  primary: '#F5A623',         // Bloomberg amber — accents, actionable
  secondary: '#FFC555',       // brighter amber — hover, emphasis
  tertiary: '#14161C',        // charcoal elevated
  positive: '#00D395',        // terminal cyan-green
  negative: '#FF4747',        // saturated red
  neutral: '#8B92A7',         // muted warm
  background: '#0A0B0E',      // near-black, slightly warm
  surface: '#14161C',         // charcoal
  surfaceHover: '#1B1E26',
  border: '#2A2E39',
  text: '#E8EAED',            // off-white warm
  textMuted: '#8B92A7',
  gradientFrom: '#F5A623',
  gradientVia: '#FFC555',
  gradientTo: '#FFE082',
} as const

// Decomposed RGB triplets — useful for inline `rgba(...)` in
// templates where we need alpha compositing without needing
// a per-call helper.
export const REDENTIA_RGB = {
  primary: '245, 166, 35',
  positive: '0, 211, 149',
  negative: '255, 71, 71',
  text: '232, 234, 237',
  background: '10, 11, 14',
} as const

// Shared font family used by every creative. Instrument Serif
// for display headlines and JetBrains Mono for numeric chrome
// are loaded globally; Inter is the body default.
export const REDENTIA_FONTS = {
  body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  display: "'Instrument Serif', 'Times New Roman', serif",
  mono: "'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace",
} as const

// Google Fonts stylesheet for creatives — identical to the
// Redentia brand token but embedded here so the /creative
// pages stay self-contained and don't depend on brand loading.
export const REDENTIA_GOOGLE_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap'

// Small helper for darkening a hex — mirrors what the old
// render pages had inline so we keep behavior identical.
export function darkenHex(hex: string, factor: number): string {
  const c = hex.replace('#', '')
  const r = Math.round(parseInt(c.substring(0, 2), 16) * factor)
  const g = Math.round(parseInt(c.substring(2, 4), 16) * factor)
  const b = Math.round(parseInt(c.substring(4, 6), 16) * factor)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
