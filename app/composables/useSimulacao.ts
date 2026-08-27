/**
 * useSimulacao — a máquina de estados de /simulacao (F3).
 *
 *   idle → interpreting → confirm → running → result
 *
 * Duas chamadas, dois serviços, papéis separados de propósito:
 *   1. chat-service  POST /api/chat/simulate/interpret   texto → SimSpec
 *   2. Laravel       POST /api/backend/simulations/run   SimSpec → números
 *
 * O LLM nunca produz número. O passo `confirm` existe pra que o guardrail
 * vire a primeira cena: a pessoa vê o que foi entendido e corrige ANTES de
 * qualquer valor aparecer na tela.
 *
 * UNIDADE: o resultado vem em PODER DE COMPRA DE HOJE, já deflacionado pela
 * inflação implícita do cenário (`meta.unit`). Comparar reais nominais entre
 * cenários de juros diferentes é maçã-laranja — um cenário de Selic alta é um
 * cenário de inflação alta. Toda copy da tela precisa dizer isso.
 */

export type SimPhase = 'idle' | 'interpreting' | 'confirm' | 'running' | 'result'

export interface SimSpecApi {
  spec_version: 1
  mode: 'carteira_colada' | 'tematica'
  positions: { ticker: string; value: number | null }[] | null
  scenario_slug: string | null
  horizon_years: number
  confidence: 'high' | 'medium' | 'low'
  not_simulable_reason: string | null
}

export interface SimCatalogItem {
  slug: string
  title: string
  kind: string
  eyebrow?: string | null
  event_date?: string | null
  refreshed_at?: string | null
  sources?: string[]
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

export interface SimPositionInput {
  ticker?: string
  value: number
  kind?: 'rf'
  label?: string
  indexer?: 'pos' | 'pre' | 'ipca'
  rate_pct?: number
  cdi_mult?: number
  duration_years?: number
  isento?: boolean
}

export function useSimulacao() {
  const { publicFetch, authFetch } = useApi()
  const { token } = useAuthState()
  const cfg = useRuntimeConfig()

  /** chat-service: mesmo helper do useNuChat (proxy same-origin, com escape
   * hatch pro caso do proxy da Vercel atrapalhar). */
  function chatUrl(path: string): string {
    const direct = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
    return import.meta.client && direct ? `${direct}${path}` : `/api/chat${path}`
  }

  const phase = ref<SimPhase>('idle')
  const rawText = ref('')
  const spec = ref<SimSpecApi | null>(null)
  const result = ref<SimResultApi | null>(null)
  const catalog = ref<SimCatalogItem[]>([])
  const positions = ref<SimPositionInput[]>([])
  const error = ref<string | null>(null)

  /** Confiança baixa OU sem cenário → a UI cai nos chips em vez de adivinhar. */
  const needsManualChoice = computed(
    () => spec.value !== null && (spec.value.confidence === 'low' || spec.value.scenario_slug === null),
  )
  const refused = computed(() => spec.value?.not_simulable_reason ?? null)

  const scenarioTitle = computed(() => {
    const slug = spec.value?.scenario_slug
    if (!slug) return 'Cenário base'
    return catalog.value.find((c) => c.slug === slug)?.title ?? slug
  })

  async function loadCatalog() {
    if (catalog.value.length) return catalog.value
    try {
      const res = await publicFetch<{ data: SimCatalogItem[] }>('/simulations/scenarios')
      catalog.value = res?.data ?? []
    }
    catch {
      // catálogo é a lista de chips do fallback: sem ele a tela ainda funciona
      // com o cenário base, mas o usuário perde a escolha manual
      catalog.value = []
    }
    return catalog.value
  }

  async function interpret(text: string) {
    rawText.value = text
    error.value = null
    phase.value = 'interpreting'
    try {
      const res = await $fetch<{ spec: SimSpecApi }>(chatUrl('/simulate/interpret'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        },
        body: { text },
      })
      spec.value = res.spec
      phase.value = 'confirm'
    }
    catch {
      // Interpretador fora do ar não pode virar cenário chutado: cai no
      // confirm com confidence low, que é a tela de escolha manual.
      spec.value = {
        spec_version: 1,
        mode: 'tematica',
        positions: null,
        scenario_slug: null,
        horizon_years: 10,
        confidence: 'low',
        not_simulable_reason: null,
      }
      phase.value = 'confirm'
    }
  }

  /** Ajustes do eco editável antes de rodar. */
  function patchSpec(patch: Partial<SimSpecApi>) {
    if (!spec.value) return
    spec.value = { ...spec.value, ...patch }
  }

  async function run(positionsB?: SimPositionInput[] | null) {
    if (positions.value.length === 0) {
      error.value = 'Monte a carteira antes de simular.'
      return
    }
    error.value = null
    phase.value = 'running'
    try {
      result.value = await authFetch<SimResultApi>('/simulations/run', {
        method: 'POST',
        body: {
          positions: positions.value,
          positions_b: positionsB ?? undefined,
          scenario_slug: spec.value?.scenario_slug ?? 'base',
          horizon_years: spec.value?.horizon_years ?? 10,
        },
      })
      phase.value = 'result'
    }
    catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status
      error.value = status === 503
        ? 'O motor está sem histórico de mercado suficiente agora. Tente de novo em alguns minutos.'
        : 'Não consegui rodar essa simulação. Confira a carteira e tente de novo.'
      phase.value = 'confirm'
    }
  }

  function reset() {
    phase.value = 'idle'
    spec.value = null
    result.value = null
    error.value = null
  }

  /**
   * Compartilhar: `?s=<base64 do spec + posições>`. Persistência de graça,
   * sem tabela — salvar em user_simulations ficou pra V1.5.
   */
  function toShareParam(): string {
    return btoa(
      encodeURIComponent(
        JSON.stringify({
          s: spec.value?.scenario_slug ?? 'base',
          h: spec.value?.horizon_years ?? 10,
          p: positions.value,
        }),
      ),
    )
  }

  function fromShareParam(raw: string): boolean {
    try {
      const o = JSON.parse(decodeURIComponent(atob(raw))) as {
        s?: string
        h?: number
        p?: SimPositionInput[]
      }
      if (!Array.isArray(o.p) || o.p.length === 0) return false
      positions.value = o.p
      spec.value = {
        spec_version: 1,
        mode: 'carteira_colada',
        positions: null,
        scenario_slug: o.s && o.s !== 'base' ? o.s : null,
        horizon_years: Math.max(1, Math.min(10, Number(o.h) || 10)),
        confidence: 'high',
        not_simulable_reason: null,
      }
      return true
    }
    catch {
      return false
    }
  }

  return {
    phase, rawText, spec, result, catalog, positions, error,
    needsManualChoice, refused, scenarioTitle,
    loadCatalog, interpret, patchSpec, run, reset,
    toShareParam, fromShareParam,
  }
}
