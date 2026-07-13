/**
 * Índice client-side da busca (PR9 /busca) — contrato de UX:
 * designs/Redentia Busca Nu.dc.html + adição do dono 2026-07-13 (filtros de
 * tipo + atalhos pros screeners reais).
 *
 *  - Ativos: GET /tickers-full (≈1.674 ativos) buscado 1x no client, LAZY
 *    (primeiro focus/input da barra); vive em useState pra sobreviver a
 *    navegação. Guarda ticker/name/type/market_cap. Filtro de texto: ticker
 *    (prefixo pesa mais) e nome (includes, case/acento-insensitive).
 *  - Cripto (GET /crypto?limit=100) e Tesouro (GET /tesouro) entram no MESMO
 *    universo de matching (símbolo/nome/slug), buscados lazy junto do índice.
 *  - Filtro de TIPO (pills Todos/Ações/FIIs/BDRs/Cripto/Tesouro Direto):
 *      · sem query → LISTA NAVEGÁVEL do tipo (browse): B3 por market_cap desc,
 *        cripto top 20, tesouro por vencimento; "Ver mais" revela +30.
 *      · com query → restringe os resultados àquele tipo.
 *  - Default sem query e sem tipo ("Em alta agora"): 4 top movers do dia +
 *    2 teses + 3 guias (contrato original do design).
 *  - "Filtros avançados" NÃO screena no client (o /tickers-full não traz DY
 *    nem fundamentos): é um atalho pros rankings REAIS (/ranking/*), que já
 *    screenam de verdade e aceitam ?type=acoes|fiis|bdrs.
 *
 * Padrão swap real+fallback do app: seeds do design → hidrata real no client,
 * fonte fora degrada pro seed / estado vazio honesto (a tela nunca quebra).
 */
import type { NuDir, TickerApi } from '~/types/market'
import { FEATURED_GUIDE, GUIDES, guideCardTo } from '~/content/guias/index'

/* ————— tipos de ativo (pills do dono) ————— */

export type BuscaType = 'todos' | 'acoes' | 'fiis' | 'bdrs' | 'cripto' | 'tesouro'

export const BUSCA_TIPOS: readonly { key: BuscaType; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'acoes', label: 'Ações' },
  { key: 'fiis', label: 'FIIs' },
  { key: 'bdrs', label: 'BDRs' },
  { key: 'cripto', label: 'Cripto' },
  { key: 'tesouro', label: 'Tesouro Direto' },
] as const

/** tipo da pill ↔ `type` do /tickers-full (só as classes B3 têm mapa). */
const TYPE_BACKEND: Partial<Record<BuscaType, string>> = {
  acoes: 'STOCK',
  fiis: 'REIT',
  bdrs: 'BDR',
}

/** tipo da pill ↔ ?classe= do /rankings (deep-link "Ver ranking completo"). */
const TYPE_CLASSE: Partial<Record<BuscaType, string>> = {
  acoes: 'acoes',
  fiis: 'fiis',
  bdrs: 'bdrs',
}

export interface BuscaAssetRow {
  ticker: string
  name: string
  price: string | null
  pct: string | null
  dir: NuDir
  href: string
}

export interface BuscaTesouroRow {
  slug: string
  name: string
  rate: string
  indexer: string
  href: string
}

export interface BuscaThesisRow {
  slug: string
  title: string
  meta: string
  image: string | null
  href: string
  /** título+setor+tickers normalizados pro matching */
  kw: string
}

export interface BuscaGuideRow {
  title: string
  tag: string
  minutes: string
  href: string
}

export interface BuscaResultsVM {
  label: string
  assets: BuscaAssetRow[]
  tesouro: BuscaTesouroRow[]
  theses: BuscaThesisRow[]
  guias: BuscaGuideRow[]
  empty: boolean
}

/** view-model da lista navegável por tipo (pill selecionada, sem query). */
export interface BuscaBrowseVM {
  type: BuscaType
  label: string
  assets: BuscaAssetRow[]
  tesouro: BuscaTesouroRow[]
  total: number
  hasMore: boolean
  /** deep-link "ver tudo" (ranking/hub do tipo) — null quando não há. */
  moreHref: string | null
  moreLabel: string | null
  loading: boolean
  empty: boolean
  /** fonte fora do ar (fetch falhou) → copy honesta, nada inventado. */
  unavailable: boolean
}

/** Copy verbatim do design — usada no hero E no estado vazio do chat. */
export const BUSCA_SUGESTOES = [
  'Vale a pena comprar PETR4 hoje?',
  'Como está a diversificação da minha carteira?',
  'Qual tese combina com meu perfil?',
  'O DY de 7% da PETR4 é sustentável?',
] as const

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface RawAsset {
  ticker: string
  name: string
  price: number | null
  chg: number | null
  type: string
  cap: number | null
}

interface RawCrypto {
  symbol: string
  name: string
  slug: string
  price: number | null
  chg: number | null
  cap: number | null
}

interface RawTesouro {
  slug: string
  name: string
  rate: string
  indexer: string
  maturity: string | null
}

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function toRow(a: RawAsset): BuscaAssetRow {
  return {
    ticker: a.ticker,
    name: a.name,
    price: a.price != null ? `R$ ${nf2.format(a.price)}` : null,
    pct: a.chg != null ? pctFmt(a.chg) : null,
    dir: dirOf(a.chg ?? 0),
    href: `/asset/${a.ticker}`,
  }
}

/** Preço de cripto abreviado (mesma escala do /mercado: 'R$ 612 mil'). */
function cryptoPrice(v: number): string {
  if (v >= 10_000) {
    const mil = v / 1000
    return `R$ ${(mil >= 100 ? nf0 : nf1).format(mil)} mil`
  }
  return `R$ ${nf2.format(v)}`
}

function cryptoToRow(c: RawCrypto): BuscaAssetRow {
  return {
    ticker: c.symbol,
    name: c.name,
    price: c.price != null ? cryptoPrice(c.price) : null,
    pct: c.chg != null ? pctFmt(c.chg) : null,
    dir: dirOf(c.chg ?? 0),
    href: `/asset/${c.symbol}`,
  }
}

function tesouroToRow(t: RawTesouro): BuscaTesouroRow {
  return {
    slug: t.slug,
    name: t.name,
    rate: tesouroRateFmt({ rate: t.rate, rate_numeric: parseTesouroRate(t.rate), indexer: t.indexer }),
    indexer: tesouroIndexerShort(t.indexer),
    href: `/tesouro/${t.slug}`,
  }
}

/** rate vem sem '%' ('IPCA + 8,43'); extrai o número pro fmt honesto. */
function parseTesouroRate(rate: string): number | null {
  const m = rate.replace(',', '.').match(/-?\d+(\.\d+)?/g)
  if (!m?.length) return null
  const n = Number(m[m.length - 1])
  return Number.isFinite(n) ? n : null
}

/* ——— seeds (valores exatos do design) ——— */

const MOVERS_SEED: RawAsset[] = [
  { ticker: 'PETR4', name: 'Petrobras', price: 38.25, chg: 0.76, type: 'STOCK', cap: null },
  { ticker: 'VALE3', name: 'Vale', price: 61.20, chg: 3.10, type: 'STOCK', cap: null },
  { ticker: 'BBAS3', name: 'Banco do Brasil', price: 27.45, chg: 1.89, type: 'STOCK', cap: null },
  { ticker: 'WEGE3', name: 'WEG', price: 52.10, chg: 1.72, type: 'STOCK', cap: null },
]

// Slugs/capas REAIS (public/teses/*.png) — o design usava ids de mock.
const THESES_SEED: BuscaThesisRow[] = [
  {
    slug: 'reindustrializacao-eua',
    title: 'A fábrica volta para casa',
    meta: 'Convicção 88 · +34% desde o lançamento',
    image: '/teses/reindustrializacao-eua.png',
    href: '/tese/reindustrializacao-eua',
    kw: norm('A fábrica volta para casa reindustrialização industrial caterpillar gerdau tupy'),
  },
  {
    slug: 'a-conta-de-luz-da-ia',
    title: 'Energia para IA',
    meta: 'Convicção 82 · +96% desde o lançamento',
    image: '/teses/a-conta-de-luz-da-ia.png',
    href: '/tese/a-conta-de-luz-da-ia',
    kw: norm('Energia para IA energia data center nuclear engie'),
  },
  {
    slug: 'a-nova-geografia-do-frete',
    title: 'A nova geografia do frete',
    meta: 'Convicção 79 · tese recente',
    image: '/teses/a-nova-geografia-do-frete.png',
    href: '/tese/a-nova-geografia-do-frete',
    kw: norm('A nova geografia do frete logística nearshoring portos frete'),
  },
  {
    slug: 'imovel-mais-disputado-data-center',
    title: 'O imóvel mais disputado do mundo',
    meta: 'Convicção 85 · +44% desde o lançamento',
    image: '/teses/imovel-mais-disputado-data-center.png',
    href: '/tese/imovel-mais-disputado-data-center',
    kw: norm('O imóvel mais disputado do mundo data center imóveis galpão'),
  },
]

/** Guias linkáveis (página real): featured + cards do hub com destino. */
const GUIAS: BuscaGuideRow[] = [
  {
    title: FEATURED_GUIDE.title,
    tag: FEATURED_GUIDE.tag,
    minutes: `${FEATURED_GUIDE.minutes} min`,
    href: `/guias/${FEATURED_GUIDE.slug}`,
  },
  ...GUIDES
    .map((g) => ({ g, to: guideCardTo(g) }))
    .filter((x): x is { g: (typeof GUIDES)[number]; to: string } => !!x.to)
    .map(({ g, to }) => ({ title: g.title, tag: g.tag as string, minutes: `${g.minutes} min`, href: to })),
]

const BROWSE_PAGE = 30

export function useBuscaIndex() {
  // índice completo (lazy — só baixa no primeiro focus/input)
  const assets = useState<RawAsset[]>('nu:busca:assets', () => [])
  const assetsStatus = useState<LoadStatus>('nu:busca:assets-status', () => 'idle')

  // universos secundários (cripto + tesouro), também lazy
  const crypto = useState<RawCrypto[]>('nu:busca:crypto', () => [])
  const cryptoStatus = useState<LoadStatus>('nu:busca:crypto-status', () => 'idle')
  const tesouro = useState<RawTesouro[]>('nu:busca:tesouro', () => [])
  const tesouroStatus = useState<LoadStatus>('nu:busca:tesouro-status', () => 'idle')

  // curadoria default (top movers do dia — mesma fonte do /mercado)
  const movers = useState<RawAsset[]>('nu:busca:movers', () => MOVERS_SEED)
  const moversStarted = useState<boolean>('nu:busca:movers-started', () => false)

  const theses = useState<BuscaThesisRow[]>('nu:busca:theses', () => THESES_SEED)
  const thesesStarted = useState<boolean>('nu:busca:theses-started', () => false)

  // paginação do browse ("Ver mais") — reseta quando a pill muda
  const browseLimit = useState<number>('nu:busca:browse-limit', () => BROWSE_PAGE)

  /** Baixa o /tickers-full 1x (lazy). Erro → segue com movers/seed. */
  async function ensureAssets() {
    if (assetsStatus.value !== 'idle' || import.meta.server) return
    assetsStatus.value = 'loading'
    try {
      const res = await $fetch<{ data?: any[] } | any[]>('/api/backend/tickers-full', {
        headers: { Accept: 'application/json' },
      })
      const list = Array.isArray(res) ? res : (res?.data ?? [])
      const next: RawAsset[] = []
      for (const a of list) {
        if (!a?.ticker || !a?.name || a.alias_of) continue
        next.push({
          ticker: String(a.ticker).toUpperCase(),
          name: String(a.name),
          price: typeof a.market_price === 'number' ? a.market_price : null,
          chg: typeof a.change_percent === 'number' ? a.change_percent : null,
          type: String(a.type ?? '').toUpperCase(),
          cap: typeof a.market_cap === 'number' && a.market_cap > 0 ? a.market_cap : null,
        })
      }
      if (next.length) assets.value = next
      assetsStatus.value = 'ready'
    } catch {
      assetsStatus.value = 'error' // mantém movers/seed como universo de matching
    }
  }

  /** Baixa o /crypto 1x (lazy). Fonte separada do /tickers-full. */
  async function ensureCrypto() {
    if (cryptoStatus.value !== 'idle' || import.meta.server) return
    cryptoStatus.value = 'loading'
    try {
      const res = await $fetch<{ data?: any[] }>('/api/backend/crypto?limit=100', {
        headers: { Accept: 'application/json' },
      })
      const list = res?.data ?? []
      const next: RawCrypto[] = []
      for (const c of list) {
        if (!c?.symbol || !c?.name) continue
        next.push({
          symbol: String(c.symbol).toUpperCase(),
          name: String(c.name),
          slug: String(c.slug ?? c.symbol).toLowerCase(),
          price: typeof c.price_brl === 'number' ? c.price_brl : null,
          // o backend hoje manda change_24h_pct (change_24h ficou null)
          chg: typeof c.change_24h_pct === 'number' ? c.change_24h_pct
            : typeof c.change_24h === 'number' ? c.change_24h : null,
          cap: typeof c.market_cap_brl === 'number' ? c.market_cap_brl : null,
        })
      }
      if (next.length) crypto.value = next
      cryptoStatus.value = 'ready'
    } catch {
      cryptoStatus.value = 'error'
    }
  }

  /** Baixa a lista completa do /tesouro 1x (lazy). */
  async function ensureTesouro() {
    if (tesouroStatus.value !== 'idle' || import.meta.server) return
    tesouroStatus.value = 'loading'
    try {
      const resp = await tesouroFetchList('/api/backend', null)
      const next: RawTesouro[] = (resp?.data ?? [])
        .filter((t) => !!t?.slug && !!t?.name)
        .map((t) => ({
          slug: t.slug,
          name: t.name,
          rate: t.rate ?? '',
          indexer: t.indexer ?? '',
          maturity: t.maturity_date ?? null,
        }))
      if (next.length) tesouro.value = next
      tesouroStatus.value = 'ready'
    } catch {
      tesouroStatus.value = 'error'
    }
  }

  /** Garante todo o universo de matching (chamado no 1º foco/input da barra). */
  function ensureUniverse() {
    void ensureAssets()
    void ensureCrypto()
    void ensureTesouro()
  }

  /** Garante a fonte de um tipo específico (chamado ao clicar a pill). */
  function ensureType(type: BuscaType) {
    if (type === 'cripto') void ensureCrypto()
    else if (type === 'tesouro') void ensureTesouro()
    else if (type !== 'todos') void ensureAssets()
    else ensureUniverse()
  }

  function showMore() {
    browseLimit.value += BROWSE_PAGE
  }
  function resetBrowse() {
    browseLimit.value = BROWSE_PAGE
  }

  async function hydrate() {
    if (!moversStarted.value) {
      moversStarted.value = true
      try {
        const r = await marketFetchMovers('stocks', 'top')
        const rows = (r?.data ?? [])
          .filter((t: TickerApi) => t.market_price != null && t.change_percent != null)
          .slice(0, 4)
          .map((t: TickerApi): RawAsset => ({
            ticker: t.ticker,
            name: t.name,
            price: t.market_price,
            chg: t.change_percent,
            type: String(t.type ?? 'STOCK').toUpperCase(),
            cap: null,
          }))
        if (rows.length >= 3) movers.value = rows
      } catch { /* mantém o seed */ }
    }
    if (!thesesStarted.value) {
      thesesStarted.value = true
      try {
        const r = await marketFetchTheses()
        const cards = r?.data ?? []
        if (cards.length >= 2) {
          theses.value = cards.map((c) => ({
            slug: c.id,
            title: c.title,
            meta: [
              c.conviction != null ? `Convicção ${c.conviction}` : c.sector,
              c.returnLabel ? `${c.returnLabel} desde o lançamento` : 'tese recente',
            ].join(' · '),
            image: c.image,
            href: `/tese/${c.id}`,
            kw: norm(`${c.title} ${c.sector ?? ''} ${(c.tickers ?? []).join(' ')} ${c.description ?? ''}`),
          }))
        }
      } catch { /* mantém o seed */ }
    }
  }

  onMounted(hydrate)

  /* ————— busca por texto (com filtro de tipo opcional) ————— */

  function search(q: string, type: BuscaType = 'todos'): BuscaResultsVM {
    const raw = q.trim()
    const ql = norm(raw)

    if (!ql) {
      // default só acontece com type 'todos' (a página roteia tipo+sem-query
      // pro browse); mesmo assim degradamos honestamente pra "Em alta agora".
      return {
        label: 'Em alta agora',
        assets: movers.value.slice(0, 4).map(toRow),
        tesouro: [],
        theses: theses.value.slice(0, 2),
        guias: GUIAS.slice(0, 3),
        empty: false,
      }
    }

    const backendType = TYPE_BACKEND[type] ?? null
    const wantB3 = type === 'todos' || !!backendType
    const wantCrypto = type === 'todos' || type === 'cripto'
    const wantTesouro = type === 'todos' || type === 'tesouro'
    const cap = type === 'todos' ? 8 : 14

    let matchedAssets: BuscaAssetRow[] = []
    if (wantB3) {
      // universo: índice completo quando já carregado; senão os movers (o lazy
      // fetch dispara no primeiro input — em ~1s o índice inteiro responde)
      const universe = assets.value.length ? assets.value : movers.value
      const scored: { a: RawAsset; s: number }[] = []
      for (const a of universe) {
        if (backendType && a.type !== backendType) continue
        const t = norm(a.ticker)
        const n = norm(a.name)
        let s = -1
        if (t.startsWith(ql)) s = 0
        else if (t.includes(ql)) s = 1
        else if (n.includes(ql)) s = 2
        if (s >= 0) scored.push({ a, s })
      }
      scored.sort((x, y) => x.s - y.s || x.a.ticker.localeCompare(y.a.ticker))
      matchedAssets = scored.slice(0, cap).map((x) => toRow(x.a))
    }

    if (wantCrypto) {
      const cryptoRows: { c: RawCrypto; s: number }[] = []
      for (const c of crypto.value) {
        const sym = norm(c.symbol)
        const nm = norm(c.name)
        let s = -1
        if (sym.startsWith(ql)) s = 0
        else if (sym.includes(ql)) s = 1
        else if (nm.includes(ql)) s = 2
        if (s >= 0) cryptoRows.push({ c, s })
      }
      cryptoRows.sort((x, y) => x.s - y.s || x.c.symbol.localeCompare(y.c.symbol))
      const rows = cryptoRows.slice(0, cap).map((x) => cryptoToRow(x.c))
      // cripto entra na MESMA lista de "Ativos" (linka pra /asset/{símbolo})
      matchedAssets = type === 'cripto' ? rows : matchedAssets.concat(rows)
    }

    let matchedTesouro: BuscaTesouroRow[] = []
    if (wantTesouro) {
      matchedTesouro = tesouro.value
        .filter((t) => norm(t.name).includes(ql) || t.slug.includes(ql) || norm(t.indexer).includes(ql))
        .slice(0, cap)
        .map(tesouroToRow)
    }

    // teses e guias não são "tipo de ativo" — só entram no filtro 'Todos'
    const matchedTheses = type === 'todos'
      ? theses.value.filter((t) => norm(t.title).includes(ql) || t.kw.includes(ql))
      : []
    const matchedGuias = type === 'todos'
      ? GUIAS.filter((g) => norm(g.title).includes(ql) || norm(g.tag).includes(ql))
      : []

    const total = matchedAssets.length + matchedTesouro.length + matchedTheses.length + matchedGuias.length
    return {
      label: total === 0
        ? `Sem resultados para "${raw}". Clique em Perguntar à IA`
        : `Resultados para "${raw}"`,
      assets: matchedAssets,
      tesouro: matchedTesouro,
      theses: matchedTheses,
      guias: matchedGuias,
      empty: total === 0,
    }
  }

  /* ————— lista navegável por tipo (pill selecionada, sem query) ————— */

  function browse(type: BuscaType): BuscaBrowseVM {
    const limit = browseLimit.value

    if (type === 'cripto') {
      const loading = cryptoStatus.value === 'idle' || cryptoStatus.value === 'loading'
      const sorted = [...crypto.value].sort((a, b) => (b.cap ?? 0) - (a.cap ?? 0))
      const top = sorted.slice(0, 20) // cripto: top 20 (contrato do dono)
      return {
        type,
        label: 'Principais criptomoedas',
        assets: top.map(cryptoToRow),
        tesouro: [],
        total: top.length,
        hasMore: false,
        moreHref: '/',
        moreLabel: 'Ver cripto no mercado',
        loading,
        empty: !loading && top.length === 0,
        unavailable: cryptoStatus.value === 'error' && top.length === 0,
      }
    }

    if (type === 'tesouro') {
      const loading = tesouroStatus.value === 'idle' || tesouroStatus.value === 'loading'
      const sorted = [...tesouro.value].sort(
        (a, b) => (a.maturity ?? '9999').localeCompare(b.maturity ?? '9999'),
      )
      const shown = sorted.slice(0, limit)
      return {
        type,
        label: 'Tesouro Direto',
        assets: [],
        tesouro: shown.map(tesouroToRow),
        total: sorted.length,
        hasMore: sorted.length > shown.length,
        moreHref: '/tesouro',
        moreLabel: 'Ver todos os títulos',
        loading,
        empty: !loading && sorted.length === 0,
        unavailable: tesouroStatus.value === 'error' && sorted.length === 0,
      }
    }

    // Ações / FIIs / BDRs a partir do /tickers-full
    const backendType = TYPE_BACKEND[type]
    const loading = assetsStatus.value === 'idle' || assetsStatus.value === 'loading'
    const list = assets.value.filter((a) => a.type === backendType)
    // market_cap desc quando houver; empate/ausência → alfabético
    list.sort((a, b) => (b.cap ?? 0) - (a.cap ?? 0) || a.ticker.localeCompare(b.ticker))
    const shown = list.slice(0, limit)
    const classe = TYPE_CLASSE[type]
    const label = type === 'acoes' ? 'Ações da B3' : type === 'fiis' ? 'Fundos imobiliários' : 'BDRs'
    return {
      type,
      label,
      assets: shown.map(toRow),
      tesouro: [],
      total: list.length,
      hasMore: list.length > shown.length,
      moreHref: classe ? `/rankings?classe=${classe}` : '/rankings',
      moreLabel: 'Ver ranking completo',
      loading,
      empty: !loading && list.length === 0,
      unavailable: assetsStatus.value === 'error' && list.length === 0,
    }
  }

  return {
    search,
    browse,
    ensureAssets,
    ensureUniverse,
    ensureType,
    showMore,
    resetBrowse,
  }
}
