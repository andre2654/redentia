/**
 * Adapta o payload do motor (Laravel) para a forma que os componentes da
 * tela já consomem — a mesma que o simMock produzia.
 *
 * Existe pra que trocar mock por dado real NÃO exija reescrever SimFanChart,
 * SimPositionsImpact, SimAnnualBands e SimTimeline. A tela foi aprovada com
 * essa forma; quem se ajusta é a fronteira, não o layout.
 *
 * O motor devolve snake_case (convenção do Laravel) e a tela fala camelCase
 * (convenção do TS). Um dos dois tinha que ceder num único ponto, e é aqui.
 *
 * NÃO É COSMÉTICO: duas diferenças mudam o significado do número.
 *
 *  1. `baseline_p50` vira `baseline`. O motor separa a linha "sem cenário"
 *     do resto; o mock chamava de baseline e a tela desenha com esse nome.
 *
 *  2. A série vem em PODER DE COMPRA DE HOJE, já deflacionada. O mock era
 *     nominal. Quem exibir tem que dizer isso — `meta.unit` carrega o rótulo
 *     e `nominalP50` fica disponível pra quem quiser mostrar os dois.
 */
import type { SimResultApi } from '~/composables/useSimulacao'
import type { SimResult, SimSeries, SimPositionImpact, SimEvent, SimAnnual } from './simMock'

/** O que o motor manda além do que o mock tinha — a tela pode usar ou ignorar. */
export interface SimResultExtra {
  /** `false` quando o cenário foi montado nos dials, sem precedente calibrado. */
  calibrated: boolean
  /** Regras aplicadas, em texto, quando o cenário é customizado. */
  rules: string[]
  /** Mediana em reais NOMINAIS — só pra contexto, nunca como manchete. */
  nominalP50: number
  unit: string
  engineMs: number
  disclaimer: string
  clientSummary: SimResultApi['client_summary']
  assumptionsRaw: SimResultApi['assumptions']
}

function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

export function adaptSeries(s: SimResultApi['series']): SimSeries {
  return {
    dates: s.dates ?? [],
    p10: s.p10 ?? [],
    p50: s.p50 ?? [],
    p90: s.p90 ?? [],
    // o mock desenhava um sample próprio; o motor manda o caminho cujo valor
    // final é o mais próximo da mediana (herdado do PortfolioForecastService)
    sample: s.sample ?? [],
    baseline: s.baseline_p50 ?? [],
  }
}

function adaptPositions(rows: SimResultApi['positions_impact']): SimPositionImpact[] {
  return (rows ?? []).map((p) => ({
    ticker: p.ticker,
    name: p.name,
    klass: p.klass ?? 'RF',
    weight: num(p.weight),
    shockPct: num(p.shock_pct),
    beta: num(p.beta),
    factors: (p.factors ?? []).map((f) => ({
      name: f.name,
      load: num(f.load),
      contributionPct: num(f.contribution_pct),
    })),
    carryPct: num(p.carry_net_pct),
    tax: p.tax,
    // o motor manda o código; o rótulo legível é decisão de UI
    taxLabel: p.tax === 'isento' ? 'isento de IR' : 'IR 15%',
    rfNote: p.rf_note ?? undefined,
  }))
}

/**
 * A narrativa do motor vem em markdown com `{mark}…{/mark}`. A tela já sabe
 * ler esse formato (o mock usava o mesmo), então passa direto.
 *
 * `lead` e `filmLine` não existem no payload: o motor manda um texto só. Aqui
 * o lead é derivado do título — melhor que inventar frase, e mantém a regra
 * de que nenhum texto de resultado nasce fora do motor.
 */
export function adaptResult(api: SimResultApi): { result: SimResult; extra: SimResultExtra } {
  const series = adaptSeries(api.series)
  const scenarioTitle = api.scenario?.title ?? 'Cenário base'
  const isBase = (api.scenario?.slug ?? 'base') === 'base'

  const result: SimResult = {
    // os dials não voltam do motor; a tela já tem os seus
    shocks: {},
    scenario: {
      key: api.scenario?.slug ?? 'base',
      title: scenarioTitle,
      lead: isBase
        ? 'No cenário base, o tempo é o único protagonista.'
        : `${scenarioTitle}, em poder de compra de hoje.`,
      narrative: api.scenario?.narrative_md ?? '',
      filmLine: scenarioTitle.toLowerCase(),
      sources: api.scenario?.sources ?? [],
    },
    series,
    final: {
      p10: num(api.final?.p10),
      p50: num(api.final?.p50),
      p90: num(api.final?.p90),
    },
    events: (api.events ?? []) as SimEvent[],
    annual: (api.annual ?? []) as SimAnnual[],
    positions: adaptPositions(api.positions_impact),
    // o motor não expõe o resumo do choque separado; a tela usa só pra copy
    shockSummary: null,
    assumptions: {
      anchor: num(api.assumptions?.anchor_brl),
      anchorDate: String(api.assumptions?.anchor_date ?? ''),
      beta: num(api.assumptions?.beta),
      cdiPct: num(api.assumptions?.cdi_anchor_pct),
      carryPct: num(api.assumptions?.cdi_terminal_pct),
      erpPp: num(api.assumptions?.erp_pp),
      volPct: num(api.assumptions?.idio_vol_annual_pct),
      paths: num(api.assumptions?.paths, 2000),
    },
  }

  const extra: SimResultExtra = {
    calibrated: (api.scenario as { calibrated?: boolean })?.calibrated !== false,
    rules: ((api.scenario as { rules?: string[] })?.rules) ?? [],
    nominalP50: num(api.final?.nominal_p50),
    unit: api.meta?.unit ?? 'poder-de-compra-de-hoje',
    engineMs: num(api.meta?.engine_ms),
    disclaimer: api.disclaimer ?? '',
    clientSummary: api.client_summary,
    assumptionsRaw: api.assumptions ?? {},
  }

  return { result, extra }
}
