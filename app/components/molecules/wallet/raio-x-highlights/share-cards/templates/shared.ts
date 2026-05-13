// Shared helpers for the 4 share-card templates.
// Centralizing here keeps copy strings, formatting rules and the
// auto-fit math consistent across Editorial / Aurora / Fintech /
// Wrapped — and easy to evolve in one place.

/**
 * Compute a font-size in px that lets `text` fit a given usable width.
 * Every big numeral in every template runs through this so a "8" and
 * a "9.999.999.999" both fit cleanly without ever overflowing the card.
 *
 * `charWidth` is the average em-width per character for the typeface:
 *   - 0.5 — Instrument Serif numerals (default)
 *   - 0.55 — serif text
 *   - 0.6 — sans-serif
 */
export function fit(
  text: string,
  maxPx: number,
  usablePx: number,
  charWidth = 0.5,
): number {
  const len = (text ?? '').length || 1
  const ideal = usablePx / (len * charWidth)
  return Math.max(28, Math.min(maxPx, Math.floor(ideal)))
}

// ============ Score band labels ============
export const scoreBandLabelMap: Record<'critico' | 'atencao' | 'bom' | 'excelente', string> = {
  critico: 'Crítica',
  atencao: 'Atenção',
  bom: 'Boa',
  excelente: 'Excelente',
}

export const scoreBandColorMap: Record<'critico' | 'atencao' | 'bom' | 'excelente', string> = {
  critico: '#ff7a7a',
  atencao: '#ffb84d',
  bom: '#d9a635',
  excelente: '#a8e6a3',
}

export function scoreCaptionFor(score: number): string {
  if (score >= 82) return 'Carteira sólida e equilibrada'
  if (score >= 65) return 'Bom nível, com espaço para evoluir'
  if (score >= 45) return 'Atenção: dá pra melhorar'
  return 'Carteira pede ajustes urgentes'
}

// ============ P&L copy ============
export function pnlCaptionFor(amount: number): string {
  if (amount > 0) return 'Cresceu de forma consistente'
  if (amount < 0) return 'Recuou no período. Ainda dá pra recuperar.'
  return 'Manteve-se estável.'
}

// ============ Risk pill ============
export function riskPillFor(severity: 'low' | 'medium' | 'high'): string {
  if (severity === 'high') return 'Risco alto'
  if (severity === 'low') return 'Risco baixo'
  return 'Risco médio'
}
