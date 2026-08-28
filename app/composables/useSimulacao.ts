/**
 * Tipos do contrato do motor de /simulacao (POST /simulations/run).
 *
 * Era um composable com a máquina de estados do hero de texto livre. O hero
 * saiu (decisão do dono, 28/08) e com ele o interpretador do chat-service —
 * o que sobrou aqui são os TIPOS, que três lugares consomem:
 *
 *   app/components/sim/simAdapter.ts:21    SimResultApi
 *   app/components/sim/SimShockPanel.vue:7 SimCatalogItem
 *   app/pages/simulacao.vue:282            SimResultApi, em import inline de tipo
 *
 * O nome de arquivo ficou por causa desses três import sites; renomear pra
 * types/sim.ts obrigaria a mexer nos três e não paga.
 *
 * A unidade do resultado é PODER DE COMPRA DE HOJE (`meta.unit`), já
 * deflacionada pela inflação implícita do cenário.
 */

export interface SimCatalogItem {
  slug: string
  title: string
  kind: string
  eyebrow?: string | null
  event_date?: string | null
  refreshed_at?: string | null
  sources?: string[]
  /** Posição dos controles que representa o cenário — preset de UI. */
  dials?: { dolar?: number, selic?: number, bolsa?: number, petroleo?: number, year?: number } | null
}

export interface SimSeriesApi {
  step: 'monthly'
  dates: string[]
  p10: number[]
  p25: number[]
  p50: number[]
  p75: number[]
  p90: number[]
  sample: number[]
  baseline_p50: number[]
}

export interface SimPositionImpactApi {
  ticker: string
  name: string
  klass: string | null
  weight: number
  shock_pct: number
  beta: number
  beta_estimated: boolean
  factors: { name: string; load: number; contribution_pct: number }[]
  carry_net_pct: number
  tax: 'isento' | 'ir15'
  rf_note: string | null
}

export interface SimResultApi {
  spec: Record<string, unknown>
  scenario: {
    slug: string
    title: string
    kind: string
    eyebrow: string | null
    narrative_md: string | null
    sources: string[]
    refreshed_at: string | null
  }
  series: SimSeriesApi
  final: { p10: number; p50: number; p90: number; nominal_p50: number }
  events: { at: number; kind: string; label: string }[]
  annual: { year: number; p10: number; p50: number; p90: number }[]
  positions_impact: SimPositionImpactApi[]
  assumptions: Record<string, string | number | boolean | null>
  compare: {
    series: SimSeriesApi
    final: { p10: number; p50: number; p90: number }
    positions_impact: SimPositionImpactApi[]
    anchor_gap: number | null
  } | null
  client_summary: { whatsapp: string; email_subject: string; email_body: string; footer: string }
  disclaimer: string
  meta: { engine_version: string; engine_ms: number; unit: string }
}
