/**
 * Índice client-side da busca (PR9 /busca) — contrato de UX:
 * designs/Redentia Busca Nu.dc.html.
 *
 *  - Ativos: GET /tickers-full (≈1.673 ativos) buscado 1x no client, LAZY
 *    (primeiro focus/input da barra); vive em useState pra sobreviver a
 *    navegação. Filtro: ticker (prefixo pesa mais) e nome (includes,
 *    case/acento-insensitive); com query, cap de 8.
 *  - Default sem query ("Em alta agora"): 4 ativos = top movers do dia
 *    (MESMA fonte da banda de movers do /mercado: GET /top-stocks?side=top),
 *    2 teses e 3 guias.
 *  - Teses: dados reais (mesma fonte da Home/Mercado — GET /theses) com o
 *    MESMO tratamento: performance = returnLabel do backtest ("desde o
 *    lançamento"), capas via c.image (seed local /teses/*.png). Sem
 *    performance → "tese recente" (padrão do design).
 *  - Guias: registry local app/content/guias — SÓ os com página real linkam;
 *    os "em breve" ficam FORA dos resultados.
 *
 * Padrão swap real+fallback do app: seeds do design → hidrata real no client,
 * erro degrada pro seed (a tela nunca rende vazia).
 */
import type { NuDir, TickerApi } from '~/types/market'
import { FEATURED_GUIDE, GUIDES, guideCardTo } from '~/content/guias/index'

export interface BuscaAssetRow {
  ticker: string
  name: string
  price: string | null
  pct: string | null
  dir: NuDir
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
  theses: BuscaThesisRow[]
  guias: BuscaGuideRow[]
  empty: boolean
}

/** Copy verbatim do design — usada no hero E no estado vazio do chat. */
export const BUSCA_SUGESTOES = [
  'Vale a pena comprar PETR4 hoje?',
  'Como está a diversificação da minha carteira?',
  'Qual tese combina com meu perfil?',
  'O DY de 7% da PETR4 é sustentável?',
] as const

interface RawAsset {
  ticker: string
  name: string
  price: number | null
  chg: number | null
}

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function toRow(a: RawAsset): BuscaAssetRow {
  return {
    ticker: a.ticker,
    name: a.name,
    price: a.price != null ? `R$ ${nf2.format(a.price)}` : null,
    pct: a.chg != null ? pctFmt(a.chg) : null,
    dir: dirOf(a.chg ?? 0),
    href: `/acao/${a.ticker}`,
  }
}

/* ——— seeds (valores exatos do design) ——— */

const MOVERS_SEED: RawAsset[] = [
  { ticker: 'PETR4', name: 'Petrobras', price: 38.25, chg: 0.76 },
  { ticker: 'VALE3', name: 'Vale', price: 61.20, chg: 3.10 },
  { ticker: 'BBAS3', name: 'Banco do Brasil', price: 27.45, chg: 1.89 },
  { ticker: 'WEGE3', name: 'WEG', price: 52.10, chg: 1.72 },
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

export function useBuscaIndex() {
  // índice completo (lazy — só baixa no primeiro focus/input)
  const assets = useState<RawAsset[]>('nu:busca:assets', () => [])
  const assetsStarted = useState<boolean>('nu:busca:assets-started', () => false)

  // curadoria default (top movers do dia — mesma fonte do /mercado)
  const movers = useState<RawAsset[]>('nu:busca:movers', () => MOVERS_SEED)
  const moversStarted = useState<boolean>('nu:busca:movers-started', () => false)

  const theses = useState<BuscaThesisRow[]>('nu:busca:theses', () => THESES_SEED)
  const thesesStarted = useState<boolean>('nu:busca:theses-started', () => false)

  /** Baixa o /tickers-full 1x (lazy). Erro → segue com movers/seed. */
  async function ensureAssets() {
    if (assetsStarted.value || import.meta.server) return
    assetsStarted.value = true
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
        })
      }
      if (next.length) assets.value = next
    } catch { /* mantém movers/seed como universo de matching */ }
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

  function search(q: string): BuscaResultsVM {
    const raw = q.trim()
    const ql = norm(raw)

    if (!ql) {
      return {
        label: 'Em alta agora',
        assets: movers.value.slice(0, 4).map(toRow),
        theses: theses.value.slice(0, 2),
        guias: GUIAS.slice(0, 3),
        empty: false,
      }
    }

    // universo: índice completo quando já carregado; senão os movers (o lazy
    // fetch dispara no primeiro input — em ~1s o índice inteiro responde)
    const universe = assets.value.length ? assets.value : movers.value
    const scored: { a: RawAsset; s: number }[] = []
    for (const a of universe) {
      const t = norm(a.ticker)
      const n = norm(a.name)
      let s = -1
      if (t.startsWith(ql)) s = 0
      else if (t.includes(ql)) s = 1
      else if (n.includes(ql)) s = 2
      if (s >= 0) scored.push({ a, s })
    }
    scored.sort((x, y) => x.s - y.s || x.a.ticker.localeCompare(y.a.ticker))
    const matchedAssets = scored.slice(0, 8).map((x) => toRow(x.a))

    const matchedTheses = theses.value.filter((t) => norm(t.title).includes(ql) || t.kw.includes(ql))
    const matchedGuias = GUIAS.filter((g) => norm(g.title).includes(ql) || norm(g.tag).includes(ql))

    const total = matchedAssets.length + matchedTheses.length + matchedGuias.length
    return {
      label: total === 0
        ? `Sem resultados para "${raw}" — clique em Perguntar à IA`
        : `Resultados para "${raw}"`,
      assets: matchedAssets,
      theses: matchedTheses,
      guias: matchedGuias,
      empty: total === 0,
    }
  }

  return { search, ensureAssets }
}
