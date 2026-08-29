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

/**
 * Uma trajetória macro sobreposta ao fan chart, como o MOTOR a emite.
 *
 * São as linhas do gráfico, e elas saem do MESMO run que aplica o choque nas
 * posições — foi a última parte da tela que ainda projetava número por conta
 * própria. Petróleo não vem: sem série de preço ligada, não há t0 pra ancorar.
 */
export interface SimMacroPathApi {
  key: 'dolar' | 'selic' | 'bolsa'
  label: string
  unit: string
  touched: boolean
  values: number[]
  anchors: { at: number, value: number }[]
  source: string
  t0: number | null
  t0_as_of: string | null
  t0_reference: { label: string, value: number, as_of: string | null, source: string } | null
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
  /** vazio quando o motor não pôde ancorar nenhuma linha em fonte */
  macro_paths: SimMacroPathApi[]
  client_summary: { whatsapp: string; email_subject: string; email_body: string; footer: string }
  disclaimer: string
  meta: {
    engine_version: string
    engine_ms: number
    unit: string
    /**
     * As linhas macro saem em NOMINAL — são os insumos que a pessoa girou no
     * dial (R$ 6,30 é cotação nominal, e deflacionar contradiria o controle).
     * A faixa da carteira continua em poder de compra de hoje (`unit`).
     */
    macro_unit: string
    /** por que uma linha não veio: `dolar_indisponivel`, `dolar_sem_alvo_no_cenario`, `ibov_sem_historico` */
    macro_warnings: string[]
  }
}
