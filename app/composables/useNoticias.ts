/**
 * Dados do /noticias (PR3). Contrato de UX: designs/Redentia Noticias Nu.dc.html.
 *
 * SSR-FIRST com seed (o melhor dos dois padrões anteriores): a 1ª leva do feed
 * é buscada no servidor via useAsyncData (HTML indexável com notícia real) e
 * QUALQUER falha degrada pro SEED — os 8 itens exatos do mock do design — pra
 * página nunca renderizar vazia.
 *
 * Decisões documentadas:
 *  - Fonte primária = GET /research/news (news_takes: leitura do Atlas +
 *    tickers {ticker,dir} + imageUrl — shapes verificados em prod 2026-07-11).
 *    Fallback = GET /news/latest (sem leitura → o card do Atlas some, nunca
 *    inventa take).
 *  - Take GENÉRICO na V1: o mock personaliza a leitura por carteira ("16,9% da
 *    carteira", proventos recebidos, beta) — isso exige auth + positions e é
 *    camada V2; a V1 usa o take do news_takes como vem.
 *  - Categoria: news_takes NÃO expõe categoria/setor — heurística
 *    determinística: tem ticker → 'Ações', sem ticker → 'Macro'.
 *  - "Sua carteira": V1 sem cruzamento real (a carteira Nu é o PR8) —
 *    `portfolioTickers` é o GANCHO (hidratar via GET /portfolio no PR8); tab
 *    visível, filtro cai no empty-state elegante com CTA de login/conexão.
 *  - "Carregar mais": /research/news só tem `limit` (sem offset) → incrementa
 *    o limit, deduplica por id/título e esconde o botão quando nada novo vem
 *    (cap de 60 itens em prod). Offset real = melhoria de backend.
 */
import type { NewsApi, NewsTakeApi } from '~/types/market'
import type { NoticiasItem, NoticiasTab, NoticiasTickerChip } from '~/types/noticias'

const PAGE_SIZE = 8

/* ————— seed: os 8 itens EXATOS do mock do design (copy verbatim) ————— */

const NOTICIAS_SEED: NoticiasItem[] = [
  {
    id: 'seed-1', veiculo: 'Money Times', tempo: 'há 1 h', cat: 'Ações', url: null, image: null, publishedAt: null,
    titulo: 'Suzano (SUZB3), Sabesp (SBSP3) e mais 3 ações para ter na carteira de curto prazo, segundo a Terra',
    leitura: 'A Terra manteve sem mudanças sua carteira semanal com Sabesp, Suzano, Hypera, MBRF e Iguatemi, mesmo após queda de 1,78% na semana. Aposta em nomes defensivos e ligados ao mercado interno, coerente com um cenário de juro alto que só agora começa a ceder.',
    tickers: [{ ticker: 'SBSP3', dir: 'up' }, { ticker: 'SUZB3', dir: 'down' }, { ticker: 'MBRF3', dir: 'up' }],
  },
  {
    id: 'seed-2', veiculo: 'Money Times', tempo: 'há 2 h', cat: 'Ações', url: null, image: null, publishedAt: null,
    titulo: 'Banco do Brasil anuncia dividendos extraordinários no ciclo de payout alto',
    leitura: 'R$ 0,105 por ação a mais confirma a disposição do banco de devolver caixa. Com o payout perto do teto e o lucro resiliente, o BBAS3 segue como uma das principais pagadoras de dividendos do índice.',
    tickers: [{ ticker: 'BBAS3', dir: 'up' }],
  },
  {
    id: 'seed-3', veiculo: 'Valor Investe', tempo: 'hoje, 09:40', cat: 'Ações', url: null, image: null, publishedAt: null,
    titulo: 'Petroleiras perdem apelo com Brent caminhando para US$ 60',
    leitura: 'Citi e Goldman veem excesso de oferta no 2º semestre. Pressiona a margem do pré-sal, mas não muda o payout de 45% da Petrobras: o dividendo segue coberto pelo caixa, e o alvo médio dos analistas continua acima do preço atual.',
    tickers: [{ ticker: 'PETR4', dir: 'down' }, { ticker: 'PRIO3', dir: 'down' }],
  },
  {
    id: 'seed-4', veiculo: 'Exame', tempo: 'hoje, 08:30', cat: 'Macro', url: null, image: null, publishedAt: null,
    titulo: 'Ibovespa renova recorde histórico aos 197 mil pontos',
    leitura: 'Fluxo estrangeiro e IPCA surpreendendo para baixo sustentam a 12ª máxima do ano. Carteiras diversificadas com peso em bancos e utilities tendem a capturar boa parte da alta com menos volatilidade que o índice.',
    tickers: [{ ticker: 'IBOV', dir: 'up' }],
  },
  {
    id: 'seed-5', veiculo: 'InfoMoney', tempo: 'ontem', cat: 'Ações', url: null, image: null, publishedAt: null,
    titulo: 'Vale amplia guidance de produção de minério para 2027',
    leitura: 'Guidance ~6% maior com custo caindo reforça a tese de valor da VALE3. O contraponto é a concentração em commodities, que exige atenção ao peso do setor em qualquer carteira exposta a mineração.',
    tickers: [{ ticker: 'VALE3', dir: 'up' }],
  },
  {
    id: 'seed-6', veiculo: 'Bloomberg Línea', tempo: 'ontem', cat: 'Ações', url: null, image: null, publishedAt: null,
    titulo: 'WEG anuncia nova fábrica de motores no México',
    leitura: 'Nearshoring na prática: capacidade instalada ao lado do cliente americano. Conecta direto com a tese "A nova geografia do frete" e reforça a WEGE3 como uma das melhores histórias de crescimento industrial da bolsa.',
    tickers: [{ ticker: 'WEGE3', dir: 'up' }],
  },
  {
    id: 'seed-7', veiculo: 'Money Times', tempo: '10 jul', cat: 'Ações', url: null, image: null, publishedAt: null,
    titulo: 'Tupy (TUPY3): XP vê ciclo de recuperação ganhar força e eleva para compra',
    leitura: 'Foi este upgrade que colocou a TUPY3 na tese "A fábrica volta para casa" como segunda perna brasileira: fundição exposta à cadeia industrial americana, em observação a R$ 14,34.',
    tickers: [{ ticker: 'TUPY3', dir: 'up' }],
  },
  {
    id: 'seed-8', veiculo: 'Seu Dinheiro', tempo: '10 jul', cat: 'Macro', url: null, image: null, publishedAt: null,
    titulo: 'Fim do caos pode derrubar o petróleo para US$ 60, diz Citi',
    leitura: 'O cenário do Citi é o principal risco de curto prazo para PETR4, mas é preço, não fundamento: caixa livre de R$ 131,9B cobre o dividendo mesmo com Brent a US$ 60. Monitorado dia a dia na tese "O último ciclo do petróleo".',
    tickers: [{ ticker: 'PETR4', dir: 'down' }],
  },
]

/* ————— mapeamento API → view-model ————— */

/** news_takes traz tickers como objeto {ticker,dir}; /news como string. */
function toChip(t: unknown): NoticiasTickerChip | null {
  if (typeof t === 'string') return t ? { ticker: t.toUpperCase(), dir: 'flat' } : null
  if (t && typeof t === 'object' && 'ticker' in t) {
    const o = t as { ticker: unknown; dir?: unknown }
    if (!o.ticker) return null
    const dir = o.dir === 'up' ? 'up' : o.dir === 'down' ? 'down' : 'flat'
    return { ticker: String(o.ticker).toUpperCase(), dir }
  }
  return null
}

function chipsOf(raw: (string | { ticker: string; dir?: string } | null)[] | string[] | null | undefined): NoticiasTickerChip[] {
  const seen = new Set<string>()
  const out: NoticiasTickerChip[] = []
  for (const t of raw ?? []) {
    const chip = toChip(t)
    if (chip && !seen.has(chip.ticker)) {
      seen.add(chip.ticker)
      out.push(chip)
    }
  }
  // O design mostra até 3 chips por linha (hint-placeholder-count 3);
  // /news/latest chega a listar 16 tickers — corta.
  return out.slice(0, 3)
}

function fromTake(n: NewsTakeApi): NoticiasItem {
  const tickers = chipsOf(n.tickers)
  return {
    id: `take-${n.id}`,
    veiculo: sourcePretty(n.source),
    tempo: relTimeFeed(n.publishedAt),
    titulo: n.title,
    url: n.url || null,
    leitura: n.atlasReading || null,
    image: n.imageUrl || null,
    // Heurística documentada: news_takes não expõe categoria — com ticker é
    // notícia de empresa ('Ações'), sem ticker é pano de fundo ('Macro').
    cat: tickers.length ? 'Ações' : 'Macro',
    tickers,
    publishedAt: n.publishedAt,
  }
}

function fromLatest(n: NewsApi): NoticiasItem {
  const tickers = chipsOf(n.tickers)
  return {
    id: `news-${n.id}`,
    veiculo: sourcePretty(n.source),
    tempo: relTimeFeed(n.published_at),
    titulo: n.title,
    url: n.url || null,
    leitura: null, // scraper não tem take do Atlas — o card some, nunca inventa
    image: n.image_url || null,
    cat: tickers.length ? 'Ações' : 'Macro',
    tickers,
    publishedAt: n.published_at,
  }
}

function dedupe(items: NoticiasItem[]): NoticiasItem[] {
  const ids = new Set<string>()
  const titles = new Set<string>()
  const out: NoticiasItem[] = []
  for (const n of items) {
    const titleKey = n.titulo.trim().toLowerCase()
    if (ids.has(n.id) || titles.has(titleKey)) continue
    ids.add(n.id)
    titles.add(titleKey)
    out.push(n)
  }
  return out
}

/** Busca real: research/news primeiro; vazio/erro cai pro /news/latest. */
async function fetchFeed(base: string, limit: number): Promise<NoticiasItem[]> {
  try {
    const res = await noticiasFetchResearchNews(base, limit)
    const items = dedupe((res?.data ?? []).filter((n) => !!n.title).map(fromTake))
    if (items.length) return items
  } catch { /* tenta o fallback */ }
  const latest = await noticiasFetchLatestNews(base, limit)
  return dedupe((latest?.data ?? []).filter((n) => !!n.title).map(fromLatest))
}

/* ————— composable ————— */

export async function useNoticias() {
  const config = useRuntimeConfig()
  // Server: URL direta do Laravel (sem loopback no próprio Nitro).
  // Client: proxy same-origin /api/backend (zero CORS) — usado no load-more.
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'
  const { isAuthenticated } = useAuthState()

  const { data } = await useAsyncData<NoticiasItem[]>('noticias:feed', async () => {
    try {
      const items = await fetchFeed(import.meta.server ? serverBase : clientBase, PAGE_SIZE)
      if (items.length >= 2) return items.slice(0, PAGE_SIZE)
    } catch { /* degrada pro seed */ }
    return NOTICIAS_SEED
  })

  const items = ref<NoticiasItem[]>(data.value ?? NOTICIAS_SEED)
  const isSeed = computed(() => items.value[0]?.id.startsWith('seed-') ?? false)

  /* — carregar mais (limit incremental + dedupe; sem offset no backend) — */
  const limit = ref(PAGE_SIZE)
  const exhausted = ref(false)
  const loadingMore = ref(false)

  async function loadMore() {
    if (loadingMore.value || exhausted.value) return
    loadingMore.value = true
    try {
      const next = limit.value + PAGE_SIZE
      const fetched = await fetchFeed(clientBase, next)
      if (fetched.length) {
        if (isSeed.value) {
          // backend voltou depois de um SSR degradado — troca o seed pelo real
          items.value = fetched
        } else {
          const known = new Set(items.value.map((n) => n.id))
          const knownTitles = new Set(items.value.map((n) => n.titulo.trim().toLowerCase()))
          const fresh = fetched.filter((n) => !known.has(n.id) && !knownTitles.has(n.titulo.trim().toLowerCase()))
          if (fresh.length) items.value = [...items.value, ...fresh]
          else exhausted.value = true // cap do endpoint — botão some
        }
        limit.value = next
      }
    } catch { /* transiente: mantém a lista e o botão */ } finally {
      loadingMore.value = false
    }
  }

  /* — filtros (client-side, como no mock) — */
  const tabs: NoticiasTab[] = ['Tudo', 'Sua carteira', 'Ações', 'Macro']
  const tab = ref<NoticiasTab>('Tudo')

  // GANCHO PR8 (carteira): hidratar com os tickers de GET /portfolio quando a
  // carteira Nu existir — aí o badge "Na sua carteira" e o filtro acendem.
  const portfolioTickers = ref<Set<string>>(new Set())
  const inCarteira = (n: NoticiasItem) => n.tickers.some((t) => portfolioTickers.value.has(t.ticker))

  const filtered = computed<NoticiasItem[]>(() => {
    if (tab.value === 'Sua carteira') return items.value.filter(inCarteira)
    if (tab.value === 'Ações' || tab.value === 'Macro') return items.value.filter((n) => n.cat === tab.value)
    return items.value
  })

  return { items, filtered, tabs, tab, inCarteira, loadMore, loadingMore, exhausted, isAuthenticated }
}
