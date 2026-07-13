/**
 * Dados do /tesouro (hub) e /tesouro/[slug] (detalhe do título).
 * Referência FUNCIONAL: Frontend/app/pages/tesouro/[slug].vue (a página da
 * Redentia antiga — taxa como "preço", cards compra/venda, gráfico com toggle
 * cotação↔taxa, interpretações por regra). O visual é 100% linguagem Nu.
 *
 * SSR-FIRST como o /asset (PR2): lista e detalhe buscados no servidor via
 * useAsyncData — taxas reais no HTML da 1ª resposta. Degrade honesto:
 *  - hub: backend fora → rows=[] + unavailable=true (copy honesta na página;
 *    inventar taxa de juros seria mentir, então NÃO há seed de dados);
 *  - detalhe: 404 real do backend → 404; qualquer outra falha → 503
 *    (temporário, não envenena o índice do Google — padrão das teses).
 *
 * Interpretações/FAQ são determinísticas (regras por indexador/prazo,
 * zero LLM), com copy honesta: marcação a mercado explica a oscilação,
 * nunca recomendação de compra.
 */
import type { TesouroApi } from '~/types/market'
import type {
  TesouroChartMode,
  TesouroHeroVM,
  TesouroIndexerFilter,
  TesouroPayload,
  TesouroPricePointApi,
  TesouroRange,
  TesouroReadingVM,
  TesouroRowVM,
  TesouroSeriesPoint,
} from '~/types/tesouro'

/* ————— helpers de formatação ————— */

const nfBrl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 'Indexados ao IPCA' → 'IPCA+' (rótulo curto de badge/tabela/filtro). */
export function tesouroIndexerShort(indexer: string | null | undefined): string {
  const raw = (indexer ?? '').toUpperCase()
  if (raw.includes('IPCA')) return 'IPCA+'
  if (raw.includes('SELIC')) return 'Selic'
  if (raw.includes('IGPM') || raw.includes('IGP-M')) return 'IGP-M'
  if (raw.includes('PREFIXADO')) return 'Prefixado'
  return indexer ?? '—'
}

/**
 * Taxa exibível: 'IPCA + 8,43%' | '13,81%' | 'Selic' (rate_numeric null).
 * O backend manda rate sem '%' ('IPCA + 8,43'); o caso tesouro-reserva-2036
 * vem 'SELIC + -' com rate_numeric null — mostrar só o indexador é o único
 * display honesto (o título acompanha a Selic, sem spread divulgado).
 */
export function tesouroRateFmt(t: Pick<TesouroApi, 'rate' | 'rate_numeric' | 'indexer'>): string {
  if (t.rate_numeric == null) return tesouroIndexerShort(t.indexer)
  return `${t.rate}%`
}

function moneyFmt(v: number | null): string {
  return v == null || !Number.isFinite(v) ? '—' : nfBrl.format(v)
}

/** '2029-05-15' → '15/05/2029' (sem Date pra não escorregar de timezone). */
function maturityFmt(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}

/** Meses até o vencimento (negativo = vencido; null = sem data). */
function monthsToMaturity(iso: string | null): number | null {
  if (!iso) return null
  const [y, m] = iso.split('-').map(Number)
  if (!y || !m) return null
  const now = new Date()
  return (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth())
}

/** 18 → 'daqui a 1 ano e 6 meses' (linha de prazo do hero). */
function horizonLine(months: number | null): string {
  if (months == null) return ''
  if (months < 0) return 'título vencido'
  if (months === 0) return 'vence este mês'
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts: string[] = []
  if (y > 0) parts.push(`${y} ${y === 1 ? 'ano' : 'anos'}`)
  if (m > 0) parts.push(`${m} ${m === 1 ? 'mês' : 'meses'}`)
  return `daqui a ${parts.join(' e ')}`
}

/** '2026-07-11T03:37:58-03:00' → '11/07/2026' (stat "Atualizado em"). */
function refreshedFmt(iso: string | null): string {
  if (!iso) return '—'
  const day = iso.slice(0, 10)
  const [y, m, d] = day.split('-')
  return d && m && y ? `${d}/${m}/${y}` : day
}

/* ————— hub ————— */

const INDEXER_FILTERS: TesouroIndexerFilter[] = ['todos', 'IPCA', 'PREFIXADO', 'SELIC', 'IGPM']

/** rótulo da pill ↔ valor do ?indexer= (a URL fala a língua da API). */
export const TESOURO_FILTER_LABELS: Record<TesouroIndexerFilter, string> = {
  todos: 'Todos',
  IPCA: 'IPCA+',
  PREFIXADO: 'Prefixado',
  SELIC: 'Selic',
  IGPM: 'IGP-M',
}

function toRow(t: TesouroApi): TesouroRowVM {
  return {
    slug: t.slug,
    name: t.name,
    indexer: tesouroIndexerShort(t.indexer),
    rateFmt: tesouroRateFmt(t),
    maturityFmt: maturityFmt(t.maturity_date),
    priceBuyFmt: moneyFmt(t.price_buy),
  }
}

/**
 * Hub /tesouro — SSR-first, reativo a ?indexer= (deep-linkável, mesmo padrão
 * do ?type= dos rankings: troca via URL sem reload).
 */
export function useTesouroHub() {
  const route = useRoute()
  const router = useRouter()
  // backendDirectBase é server-only — no client o acesso dispara warn do Nuxt
  const config = useRuntimeConfig()
  const serverBase = import.meta.server
    ? (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
    : ''

  const activeIndexer = computed<TesouroIndexerFilter>(() => {
    const q = String(route.query.indexer ?? '').toUpperCase()
    return (INDEXER_FILTERS as string[]).includes(q) ? (q as TesouroIndexerFilter) : 'todos'
  })

  function setIndexer(f: TesouroIndexerFilter) {
    const query = { ...route.query }
    if (f === 'todos') delete query.indexer
    else query.indexer = f
    router.replace({ query })
  }

  const { data, pending, error } = useAsyncData(
    'tesouro-hub',
    async () => {
      const base = import.meta.server ? serverBase : '/api/backend'
      const indexer = activeIndexer.value === 'todos' ? null : activeIndexer.value
      const resp = await tesouroFetchList(base, indexer)
      // vencimento mais próximo primeiro — a leitura natural de "todas as taxas"
      return (resp.data ?? [])
        .slice()
        .sort((a, b) => (a.maturity_date ?? '9999').localeCompare(b.maturity_date ?? '9999'))
        .map(toRow)
    },
    { watch: [activeIndexer], default: () => [] as TesouroRowVM[] },
  )

  const rows = computed(() => data.value ?? [])
  const count = computed(() => rows.value.length)
  /** backend fora (fetch falhou) → copy 'tente de novo'. */
  const unavailable = computed(() => !pending.value && count.value === 0 && !!error.value)
  /** filtro legitimamente vazio (sem erro) → copy própria. */
  const empty = computed(() => !pending.value && count.value === 0 && !error.value)

  return { rows, count, pending, unavailable, empty, activeIndexer, setIndexer }
}

/* ————— detalhe: builders (regras determinísticas, zero LLM) ————— */

function buildHero(t: TesouroApi): TesouroHeroVM {
  return {
    name: t.name,
    indexerShort: tesouroIndexerShort(t.indexer),
    rateHero: tesouroRateFmt(t),
    rateSuffix: t.rate_numeric != null ? 'ao ano' : '',
    maturityLine: t.maturity_date ? `Vence em ${maturityFmt(t.maturity_date)}` : 'Sem data de vencimento divulgada',
    horizonLine: horizonLine(monthsToMaturity(t.maturity_date)),
  }
}

function buildStats(t: TesouroApi): { l: string; v: string }[] {
  const rows: { l: string; v: string }[] = [
    { l: 'Taxa de compra', v: tesouroRateFmt(t) },
    { l: 'Preço de compra', v: moneyFmt(t.price_buy) },
    { l: 'Preço de venda', v: moneyFmt(t.price_sell) },
    { l: 'Vencimento', v: maturityFmt(t.maturity_date) },
  ]
  if (t.reference_rate != null) {
    rows.push({ l: t.reference_rate_label ?? 'Taxa de referência', v: `${nf2.format(t.reference_rate)}%` })
  }
  if (t.refreshed_at) rows.push({ l: 'Atualizado em', v: refreshedFmt(t.refreshed_at) })
  return rows
}

/**
 * 2-3 interpretações por regra (copy honesta, sem recomendação):
 * 1) o que a taxa significa, por indexador;
 * 2) marcação a mercado × levar até o vencimento (calibrada pelo prazo);
 * 3) garantia + IR regressivo.
 */
function buildReadings(t: TesouroApi): TesouroReadingVM[] {
  const idx = tesouroIndexerShort(t.indexer)
  const rate = t.rate_numeric
  const months = monthsToMaturity(t.maturity_date)
  const years = months != null ? Math.round(months / 12) : null
  const matFmt = maturityFmt(t.maturity_date)
  const out: TesouroReadingVM[] = []

  if (idx === 'IPCA+' || idx === 'IGP-M') {
    const inflation = idx === 'IGP-M' ? 'IGP-M' : 'IPCA'
    out.push({
      title: 'O que a taxa significa',
      body: rate != null
        ? `Este título paga ${inflation} + ${nf2.format(rate)}% ao ano. A inflação medida pelo ${inflation} corrige o valor investido e os ${nf2.format(rate)}% são o juro real, o ganho acima da inflação garantido pra quem leva o título até o vencimento.`
        : `Este título é corrigido pela inflação medida pelo ${inflation}, mais um juro real definido na compra.`,
    })
  } else if (idx === 'Prefixado') {
    out.push({
      title: 'O que a taxa significa',
      body: rate != null
        ? `Taxa prefixada de ${nf2.format(rate)}% ao ano: você sabe hoje exatamente quanto recebe no vencimento. O que a taxa não trava é o poder de compra, se a inflação subir muito, o ganho real diminui.`
        : 'Título prefixado: a taxa nominal é definida no momento da compra e vale até o vencimento.',
    })
  } else if (idx === 'Selic') {
    const ref = t.reference_rate != null ? ` (hoje em ${nf2.format(t.reference_rate)}% ao ano)` : ''
    const spread = rate != null && rate > 0 ? `, mais ${nf2.format(rate)}% ao ano` : ''
    out.push({
      title: 'O que a taxa significa',
      body: `A rentabilidade acompanha a taxa Selic${ref}${spread}. É o título público que menos oscila no dia a dia, por isso costuma ser usado como reserva de liquidez.`,
    })
  }

  if (idx === 'Selic') {
    out.push({
      title: 'Se vender antes do vencimento',
      body: 'A marcação a mercado quase não afeta o Tesouro Selic: o preço anda colado na taxa do dia. Na venda antecipada vale o preço de venda do dia, normalmente muito próximo do valor acumulado.',
    })
  } else {
    const horizon = years == null
      ? ''
      : years >= 20
        ? ' Com vencimento longo, a oscilação é amplificada: quedas de juros valorizam bastante o título e altas derrubam o preço na mesma proporção.'
        : years >= 10
          ? ' Com prazo médio a longo, a sensibilidade à marcação é moderada, mas visível.'
          : years >= 3
            ? ' Com prazo mais curto, a oscilação de preço tende a ser menor.'
            : ''
    out.push({
      title: 'Se vender antes do vencimento',
      body: `Antes do vencimento o preço oscila com a marcação a mercado: quando os juros de mercado sobem, o preço do título cai, e vice-versa. Quem leva até ${matFmt !== '—' ? matFmt : 'o vencimento'} recebe exatamente a taxa contratada, a oscilação só vira ganho ou perda pra quem vende antes.${horizon}`,
    })
  }

  out.push({
    title: 'Garantia e imposto',
    body: 'Títulos do Tesouro Direto têm garantia do Tesouro Nacional, considerada a mais sólida do mercado brasileiro. O rendimento paga IR regressivo: 22,5% até 180 dias, caindo até 15% após 2 anos.',
  })

  return out.slice(0, 3)
}

function buildFaq(t: TesouroApi): { q: string; a: string }[] {
  const idx = tesouroIndexerShort(t.indexer)
  const rateHero = tesouroRateFmt(t)
  const rateExplain = idx === 'IPCA+' || idx === 'IGP-M'
    ? `significa que o título rende a inflação do período mais ${t.rate_numeric != null ? `${nf2.format(t.rate_numeric)}%` : 'um juro real'} ao ano. A parte fixa é o juro real, garantido pra quem leva até o vencimento.`
    : idx === 'Prefixado'
      ? 'é a taxa nominal contratada: o valor de resgate no vencimento já é conhecido no dia da compra, independente do que acontecer com juros e inflação.'
      : 'significa que o título acompanha a taxa Selic diária. Quando a Selic sobe, o rendimento acelera; quando cai, desacelera.'
  return [
    {
      q: `O que significa a taxa ${rateHero} do ${t.name}?`,
      a: `A taxa ${rateHero} ${rateExplain}`,
    },
    {
      q: `O que acontece se eu vender o ${t.name} antes do vencimento?`,
      a: idx === 'Selic'
        ? 'O Tesouro recompra o título pelo preço de venda do dia, que no Tesouro Selic fica muito próximo do valor acumulado. É o título com menor risco de perda na venda antecipada.'
        : 'O Tesouro recompra pelo preço de venda do dia, definido pela marcação a mercado. Se os juros subiram desde a compra, o preço caiu e a venda pode sair com perda; se caíram, pode haver ganho acima da taxa contratada. Levando até o vencimento, a taxa da compra é garantida.',
    },
    {
      q: 'Como funciona o imposto de renda no Tesouro Direto?',
      a: 'O IR incide só sobre o rendimento, com alíquota regressiva: 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% acima de 2 anos. Há ainda IOF nos primeiros 30 dias. O imposto é retido na fonte no resgate ou vencimento.',
    },
    {
      q: `Qual o valor mínimo pra investir no ${t.name}?`,
      a: `O Tesouro Direto permite comprar frações a partir de 1% do preço do título, respeitando o mínimo de cerca de R$ 30 definido pelo programa. Com o preço de compra atual${t.price_buy != null ? ` de ${moneyFmt(t.price_buy)}` : ''}, a fração de 1% ${t.price_buy != null ? `sai por ${moneyFmt(Math.max(t.price_buy * 0.01, 30))}` : 'define o aporte mínimo'}.`,
    },
  ]
}

function buildSeo(t: TesouroApi): TesouroPayload['seo'] {
  const rateHero = tesouroRateFmt(t)
  const bits: string[] = [`${t.name} hoje: taxa ${rateHero}${t.rate_numeric != null ? ' ao ano' : ''}.`]
  if (t.price_buy != null) bits.push(`Preço de compra ${moneyFmt(t.price_buy)}${t.price_sell != null ? `, venda ${moneyFmt(t.price_sell)}` : ''}.`)
  if (t.maturity_date) bits.push(`Vencimento em ${maturityFmt(t.maturity_date)}.`)
  bits.push('Veja o histórico de preço e taxa, a leitura do título e perguntas frequentes.')
  return {
    title: `${t.name}: taxa de hoje, preço e histórico`,
    description: bits.join(' '),
  }
}

/**
 * Deep-link pra calculadora de juros compostos com a taxa NOMINAL estimada
 * (prefixado = a própria taxa; IPCA+/Selic = referência atual + spread) e o
 * prazo do título. Estimativa didática, o texto do link deixa isso claro.
 */
function buildCalcHref(t: TesouroApi): string {
  const months = monthsToMaturity(t.maturity_date)
  const years = Math.min(40, Math.max(1, months != null ? Math.round(months / 12) : 10))
  const idx = tesouroIndexerShort(t.indexer)
  let nominal: number | null = null
  if (idx === 'Prefixado') nominal = t.rate_numeric
  else if (t.reference_rate != null) nominal = t.reference_rate + (t.rate_numeric ?? 0)
  const rate = nominal != null && Number.isFinite(nominal) ? Math.round(nominal * 100) / 100 : 10.5
  return `/calculadora/juros-compostos?initial=1000&monthly=500&rate=${String(rate).replace(',', '.')}&years=${years}`
}

/* ————— detalhe: carga SSR + gráfico client ————— */

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

async function loadTesouro(base: string, slug: string): Promise<TesouroPayload> {
  let t: TesouroApi
  try {
    t = (await tesouroFetchOne(base, slug)).data
  } catch (e) {
    // 404 real (slug não existe) vs falha temporária (503 não envenena índice)
    if (statusOf(e) === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Título não encontrado' })
    }
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }
  return {
    slug,
    raw: t,
    hero: buildHero(t),
    stats: buildStats(t),
    readings: buildReadings(t),
    faq: buildFaq(t),
    seo: buildSeo(t),
    calcHref: buildCalcHref(t),
  }
}

export async function useTesouroTitle(slug: string) {
  // backendDirectBase é server-only — no client o acesso dispara warn do Nuxt
  const config = useRuntimeConfig()
  const serverBase = import.meta.server
    ? (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
    : ''
  const clientBase = '/api/backend'

  /* Gráfico: série buscada no CLIENT (a página SSR já sai completa com hero/
     cards/stats; o histórico hidrata depois), cacheada por range. O toggle
     preço↔taxa é só projeção sobre a série crua (sem refetch). Erro de fetch
     mantém o range anterior (degrade honesto).
     GOTCHA (pego no verify desta página): TODO o estado do gráfico e o
     onMounted vivem ANTES do await useAsyncData — hook registrado depois do
     await perde a instância ativa e é DESCARTADO em silêncio no client
     ('onMounted is called when there is no active component instance'). */
  const activeRange = ref<TesouroRange>('1y')
  const activeMode = ref<TesouroChartMode>('price')
  const rangeSeries = ref<Partial<Record<TesouroRange, TesouroPricePointApi[]>>>({})
  const rangeLoading = ref(false)

  async function fetchRange(range: TesouroRange) {
    rangeLoading.value = true
    try {
      const resp = await tesouroFetchPrices(clientBase, slug, range)
      const pts = resp.data ?? []
      if (pts.length >= 2) {
        rangeSeries.value = { ...rangeSeries.value, [range]: pts }
        activeRange.value = range
      } else if (!rangeSeries.value[activeRange.value]) {
        // série realmente vazia no 1º load → registra pro empty-state honesto
        rangeSeries.value = { ...rangeSeries.value, [range]: pts }
        activeRange.value = range
      }
    } catch { /* mantém o range atual */ } finally {
      rangeLoading.value = false
    }
  }

  function setRange(range: TesouroRange) {
    if (range === activeRange.value && rangeSeries.value[range]) return
    if (rangeSeries.value[range]) {
      activeRange.value = range
      return
    }
    fetchRange(range)
  }

  onMounted(() => { fetchRange(activeRange.value) })

  const { data, error } = await useAsyncData<TesouroPayload>(
    `tesouro:${slug}`,
    () => loadTesouro(import.meta.server ? serverBase : clientBase, slug),
  )

  const rawSeries = computed<TesouroPricePointApi[]>(() => rangeSeries.value[activeRange.value] ?? [])
  /** eixo ativo = lado VENDA (o que o investidor recebe se sair hoje). */
  const chartPoints = computed<TesouroSeriesPoint[]>(() =>
    rawSeries.value
      .map((p) => ({ t: p.price_at, v: activeMode.value === 'rate' ? p.sell_rate : p.sell_price }))
      .filter((p): p is TesouroSeriesPoint => p.v != null && Number.isFinite(p.v)),
  )
  /** taxas do último pregão (hidratam os cards Compra/Venda). */
  const latestRates = computed(() => {
    const last = rawSeries.value[rawSeries.value.length - 1]
    return {
      buy: last?.buy_rate != null ? `${nf2.format(last.buy_rate)}% a.a.` : '',
      sell: last?.sell_rate != null ? `${nf2.format(last.sell_rate)}% a.a.` : '',
    }
  })
  /** valor da pill do gráfico no eixo ativo. */
  const chartCurrentLabel = computed(() => {
    const last = chartPoints.value[chartPoints.value.length - 1]
    if (!last) return '—'
    return activeMode.value === 'rate' ? `${nf2.format(last.v)}% a.a.` : nfBrl.format(last.v)
  })
  /** 1º load ainda rodando (série do range ativo nunca chegou). */
  const chartEmpty = computed(() => !rangeLoading.value && rawSeries.value.length > 0 && chartPoints.value.length < 2)
  const chartUnavailable = computed(() => !rangeLoading.value && rawSeries.value.length === 0)

  return {
    data,
    error,
    activeRange,
    activeMode,
    setRange,
    setMode: (m: TesouroChartMode) => { activeMode.value = m },
    rangeLoading,
    chartPoints,
    chartCurrentLabel,
    chartEmpty,
    chartUnavailable,
    latestRates,
  }
}
