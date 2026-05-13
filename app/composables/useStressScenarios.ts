// Single source of truth for the wallet stress-test scenarios.
//
// Both <StressTestCard> (inside the wallet dashboard) and the Raio-X
// Highlights story (SlideStressTest) consume from here so the numbers
// the user sees are identical across surfaces.
//
// Each scenario carries:
//   - canonical metadata (name, period, year, headline, baseline_ibov)
//   - impact_by_class: percentage impact on each asset class derived
//     from historical (or projected) behaviour of the leading index
//     (IBOV, S&P 500, IFIX, IMA-B, MSCI World).
//
// The portfolio-level impact is a weighted sum of those per-class
// percentages, using the user's actual allocation.

import type { UnifiedPosition } from '~/services/portfolio'

export type StressAssetClass = 'STOCK' | 'REIT' | 'ETF' | 'BDR' | 'TREASURY' | 'CRYPTO' | 'OTHER'

export interface StressScenarioCanon {
  id: 'covid-2020' | 'subprime-2008' | 'ai-bubble-2026'
  name: string
  icon: string
  year_label: string
  type: 'real' | 'hipotetico'
  tone: 'crisis' | 'severe' | 'projection'
  period: string
  duration: string
  recovery: string
  headline: string
  baseline_ibov: number
  impact_by_class: Record<StressAssetClass, number>
}

export const STRESS_SCENARIOS: StressScenarioCanon[] = [
  {
    id: 'covid-2020',
    name: 'Pandemia COVID-19',
    icon: 'i-lucide-biohazard',
    year_label: '2020',
    type: 'real',
    tone: 'crisis',
    period: 'fev-mar 2020',
    duration: '32 dias',
    recovery: '~5 meses',
    headline:
      'Choque global de liquidez com lockdowns simultâneos. IBOV cedeu 45% em pouco mais de um mês, S&P 500 perdeu 34%, FIIs caíram 34%.',
    baseline_ibov: -45,
    impact_by_class: {
      STOCK:    -45,
      REIT:     -34,
      ETF:      -38,
      BDR:      -35,
      TREASURY: -8,
      CRYPTO:   -50,
      OTHER:    -30,
    },
  },
  {
    id: 'subprime-2008',
    name: 'Crise do Subprime',
    icon: 'i-lucide-trending-down',
    year_label: '2008',
    type: 'real',
    tone: 'severe',
    period: 'set 2008 - mar 2009',
    duration: '6 meses',
    recovery: '~2,5 anos',
    headline:
      'Colapso bancário global após a falência do Lehman Brothers. IBOV recuou 54%, S&P 500 perdeu 57%, recuperação total levou anos.',
    baseline_ibov: -54,
    impact_by_class: {
      STOCK:    -54,
      REIT:     -38,
      ETF:      -50,
      BDR:      -55,
      TREASURY: -3,
      CRYPTO:   0,
      OTHER:    -40,
    },
  },
  {
    id: 'ai-bubble-2026',
    name: 'Estouro da bolha de IA',
    icon: 'i-lucide-cpu',
    year_label: '202?',
    type: 'hipotetico',
    tone: 'projection',
    period: 'projeção 2026-2027',
    duration: '~12 meses',
    recovery: '18-24 meses',
    headline:
      'Cenário hipotético: tese de hyperscalers (Nvidia, Microsoft, Meta) é revisada bruscamente. BDRs e ETFs internacionais sofrem mais; FIIs e Tesouro tendem a oferecer abrigo.',
    baseline_ibov: -25,
    impact_by_class: {
      STOCK:    -25,
      REIT:     -10,
      ETF:      -35,
      BDR:      -50,
      TREASURY:   5,
      CRYPTO:   -45,
      OTHER:    -20,
    },
  },
]

const EMPTY_ALLOCATION: Record<StressAssetClass, number> = {
  STOCK: 0,
  REIT: 0,
  ETF: 0,
  BDR: 0,
  TREASURY: 0,
  CRYPTO: 0,
  OTHER: 0,
}

/**
 * Compute the percentage allocation by asset class from a list of
 * unified positions. Output is in percent (0-100), summing to 100 when
 * any positions exist.
 */
export function allocationByClass(positions: UnifiedPosition[]): Record<StressAssetClass, number> {
  if (!positions.length) return { ...EMPTY_ALLOCATION }
  const totals: Partial<Record<StressAssetClass, number>> = {}
  let total = 0
  for (const p of positions) {
    const cls = (p.asset_class || 'OTHER') as StressAssetClass
    const v = p.current_value ?? (p.quantity * (p.current_price ?? p.average_price))
    totals[cls] = (totals[cls] || 0) + v
    total += v
  }
  const out: Record<StressAssetClass, number> = { ...EMPTY_ALLOCATION }
  if (!total) return out
  for (const k of Object.keys(totals) as StressAssetClass[]) {
    out[k] = ((totals[k] || 0) / total) * 100
  }
  return out
}

/**
 * Portfolio impact for a single scenario, in percent (typically negative).
 * Rounded to one decimal — matches the wallet card.
 */
export function scenarioImpact(
  scenario: StressScenarioCanon,
  allocation: Record<StressAssetClass, number>,
): number {
  let impact = 0
  for (const k of Object.keys(scenario.impact_by_class) as StressAssetClass[]) {
    impact += (allocation[k] / 100) * scenario.impact_by_class[k]
  }
  return Number(impact.toFixed(1))
}

/**
 * Convenience: returns the three scenarios already projected onto the
 * given positions. Shape matches what the Highlights slide expects.
 */
export function projectScenarios(positions: UnifiedPosition[]): Array<{
  id: string
  name: string
  change_pct: number
  note: string
  year_label: string
}> {
  const alloc = allocationByClass(positions)
  return STRESS_SCENARIOS.map((s) => ({
    id: s.id,
    name: s.name,
    change_pct: scenarioImpact(s, alloc),
    note: s.headline,
    year_label: s.year_label,
  }))
}
