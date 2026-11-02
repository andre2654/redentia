/**
 * Índice client-side da /busca. Redesenho de 02/11/2026: a página é só busca
 * (o chat foi para o painel, useChatPainel), e este composable entrega listas
 * prontas de BuscaItem, uma linha por destino, para a lista navegável por
 * teclado.
 *
 *  - Ativos: GET /tickers-full (~1.600 ativos) baixado 1x no client ao montar
 *    a página (quem abre a busca vai digitar; o primeiro caractere já acha);
 *    vive em useState para sobreviver a navegação.
 *  - Cripto (GET /crypto?limit=100) e Tesouro (GET /tesouro) entram no mesmo
 *    universo de casamento, baixados junto.
 *  - Teses: GET das teses reais (seed das capas reais até chegar); guias: o
 *    registry de content/guias.
 *  - Ordem: faixa de casamento (ticker exato, prefixo, nome...) e, na mesma
 *    faixa, quem vale mais na bolsa (utils/buscaRanking.ts).
 *  - Filtro de tipo (pills, ?tipo=): sem texto vira a lista navegável do tipo
 *    (B3 por market_cap, cripto top 20, Tesouro por vencimento; "Ver mais"
 *    revela +30); com texto restringe os resultados àquele tipo.
 *  - Campo vazio e sem tipo: as maiores empresas da B3 pelo valor de mercado
 *    do próprio índice. Nada de "em alta" inventado.
 *  - Fonte fora: estado 'erro' com frase honesta; enquanto carrega, 'carregando'
 *    (skeleton) e nunca "sem resultados" para um ticker que existe.
 */
import type { NuDir } from '~/types/market'
import type { Casado } from '~/utils/buscaRanking'
import type { BuscaRecente } from '~/utils/buscaRecentes'
import { FEATURED_GUIDE, GUIDES, guideCardTo } from '~/content/guias/index'

/* ————— tipos de ativo (pills do dono) ————— */

export type BuscaType = 'todos' | 'acoes' | 'fiis' | 'bdrs' | 'etfs' | 'eua' | 'cripto' | 'tesouro'

export const BUSCA_TIPOS: readonly { key: BuscaType; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'acoes', label: 'Ações' },
  { key: 'fiis', label: 'FIIs' },
  { key: 'bdrs', label: 'BDRs' },
  { key: 'etfs', label: 'ETFs' },
  { key: 'eua', label: 'EUA' },
  { key: 'cripto', label: 'Cripto' },
  { key: 'tesouro', label: 'Tesouro Direto' },
] as const

/** tipo da pill ↔ `type`(s) do /tickers-full (só as classes de tickers têm
 *  mapa). 'eua' cobre ação E ETF americanos numa pill só. */
const TYPE_BACKEND: Partial<Record<BuscaType, string[]>> = {
  acoes: ['STOCK'],
  fiis: ['REIT'],
  bdrs: ['BDR'],
  etfs: ['ETF'],
  eua: ['US_STOCK', 'US_ETF'],
}

/** tipo da pill ↔ ?classe= do /rankings (deep-link "Ver ranking completo"). */
const TYPE_CLASSE: Partial<Record<BuscaType, string>> = {
  acoes: 'acoes',
  fiis: 'fiis',
  bdrs: 'bdrs',
}

/** Uma linha da lista da busca. A tela só recebe texto já formatado. */
export interface BuscaItem {
  /** estável por destino: 'ativo:PETR4', 'tese:a-conta-de-luz-da-ia' */
  id: string
  tipo: 'ativo' | 'tesouro' | 'tese' | 'guia'
  /** ticker do ativo, nome do título/tese/guia */
  titulo: string
  /** 'Petrobras · Ação', 'IPCA+ · vence em 2035', a convicção da tese */
  sub: string
  href: string
  /** ticker para o logo (só ativo) */
  ticker?: string
  /** valor à direita: preço, taxa, minutos de leitura */
  valor?: string | null
  /** variação do dia, abaixo do valor (só ativo) */
  pct?: string | null
  dir?: NuDir
  /** capa da tese */
  imagem?: string | null
}

export interface BuscaGrupo {
  id: string
  titulo: string
  itens: BuscaItem[]
}

/**
 * 'pronto' tem linha; 'carregando' e 'erro' não afirmam vazio (o índice da B3
 * ainda não respondeu ou caiu); 'vazio' só quando o universo respondeu.
 */
export type BuscaEstado = 'pronto' | 'carregando' | 'erro' | 'vazio'

export interface BuscaResultadoVM {
  estado: BuscaEstado
  grupos: BuscaGrupo[]
  total: number
}

/** Lista navegável do tipo (pill marcada, campo vazio). */
export interface BuscaBrowseVM {
  titulo: string
  total: number
  itens: BuscaItem[]
  hasMore: boolean
  /** saída para a página do tipo (ranking, hub, guia); null quando não há */
  maisHref: string | null
  maisRotulo: string | null
  estado: BuscaEstado
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
  /** 'BRL' | 'USD' (EUA) — o símbolo do preço sai daqui */
  currency: string
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

/**
 * O nome que a gente fala. Ação e BDR vêm da coluna da B3 ('PETROBRAS   PN
 * N2') e passam pelo nomeDaEmpresa. FII vem 'FII HGLG PAXCI  ERS': sai o
 * "FII" da frente (o tipo já está na linha) e a marca do pregão do fim (CI,
 * ER...), sem mexer na caixa (o nomeDaEmpresa faria 'Hglg'). ETF, EUA e
 * cripto ficam como vieram, só sem os espaços de coluna.
 */
const FII_MARCA_FINAL = /(\s+(CI|ER|ERS|EJ|ED|ES|EB|R))+$/
function nomeDoAtivo(a: RawAsset): string {
  if (a.type === 'STOCK' || a.type === 'BDR') return nomeDaEmpresa(a.name)
  const nome = a.name.replace(/\s+/g, ' ').trim()
  if (a.type === 'REIT' || a.type === 'AGRI_FUND') {
    const limpo = nome.replace(/^(FII|FIAGRO)\s+/, '').replace(FII_MARCA_FINAL, '').trim()
    return limpo || nome
  }
  return nome
}

function subDoAtivo(nome: string, tipo: string, ticker: string): string {
  // FII cujo nome é a raiz do ticker ('AAGR' de AAGR11) não diz nada a mais
  const repete = !nome || nome === ticker || nome === ticker.replace(/\d+$/, '')
  const partes = [repete ? '' : nome, tipo].filter(Boolean)
  return partes.join(' · ')
}

function ativoItem(a: RawAsset): BuscaItem {
  return {
    id: `ativo:${a.ticker}`,
    tipo: 'ativo',
    titulo: a.ticker,
    sub: subDoAtivo(nomeDoAtivo(a), rotuloDoTipo(a.type), a.ticker),
    href: `/asset/${a.ticker}`,
    ticker: a.ticker,
    valor: a.price != null ? `${a.currency === 'USD' ? 'US$' : 'R$'} ${nf2.format(a.price)}` : null,
    pct: a.chg != null ? pctFmt(a.chg) : null,
    dir: dirOf(a.chg ?? 0),
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

function cryptoItem(c: RawCrypto): BuscaItem {
  return {
    id: `ativo:${c.symbol}`,
    tipo: 'ativo',
    titulo: c.symbol,
    sub: subDoAtivo(c.name, 'Cripto', c.symbol),
    href: `/asset/${c.symbol}`,
    ticker: c.symbol,
    valor: c.price != null ? cryptoPrice(c.price) : null,
    pct: c.chg != null ? pctFmt(c.chg) : null,
    dir: dirOf(c.chg ?? 0),
  }
}

function tesouroItem(t: RawTesouro): BuscaItem {
  const indexador = tesouroIndexerShort(t.indexer)
  return {
    id: `tesouro:${t.slug}`,
    tipo: 'tesouro',
    titulo: t.name,
    sub: ['Tesouro Direto', indexador].filter(Boolean).join(' · '),
    href: `/tesouro/${t.slug}`,
    valor: tesouroRateFmt({ rate: t.rate, rate_numeric: parseTesouroRate(t.rate), indexer: t.indexer }) || null,
  }
}

function teseItem(t: RawThesis): BuscaItem {
  return { id: `tese:${t.slug}`, tipo: 'tese', titulo: t.title, sub: t.meta, href: t.href, imagem: t.image }
}

function guiaItem(g: RawGuide): BuscaItem {
  return { id: `guia:${g.href}`, tipo: 'guia', titulo: g.title, sub: g.tag, href: g.href, valor: g.minutes }
}

/** rate vem sem '%' ('IPCA + 8,43'); extrai o número pro fmt honesto. */
function parseTesouroRate(rate: string): number | null {
  const m = rate.replace(',', '.').match(/-?\d+(\.\d+)?/g)
  if (!m?.length) return null
  const n = Number(m[m.length - 1])
  return Number.isFinite(n) ? n : null
}

interface RawThesis {
  slug: string
  title: string
  meta: string
  image: string | null
  href: string
  /** título+setor+tickers normalizados pro casamento */
  kw: string
}

interface RawGuide {
  title: string
  tag: string
  minutes: string
  href: string
}

// Slugs/capas REAIS (public/teses/*) enquanto a lista real não chega; só
// entram no casamento de texto, nunca como vitrine.
const THESES_SEED: RawThesis[] = [
  {
    slug: 'reindustrializacao-eua',
    title: 'A fábrica volta para casa',
    meta: 'Tese da Redentia',
    image: '/teses/reindustrializacao-eua.webp',
    href: '/tese/reindustrializacao-eua',
    kw: normBusca('A fábrica volta para casa reindustrialização industrial caterpillar gerdau tupy'),
  },
  {
    slug: 'a-conta-de-luz-da-ia',
    title: 'Energia para IA',
    meta: 'Tese da Redentia',
    image: '/teses/a-conta-de-luz-da-ia.webp',
    href: '/tese/a-conta-de-luz-da-ia',
    kw: normBusca('Energia para IA energia data center nuclear engie'),
  },
  {
    slug: 'a-nova-geografia-do-frete',
    title: 'A nova geografia do frete',
    meta: 'Tese da Redentia',
    image: '/teses/a-nova-geografia-do-frete.webp',
    href: '/tese/a-nova-geografia-do-frete',
    kw: normBusca('A nova geografia do frete logística nearshoring portos frete'),
  },
  {
    slug: 'imovel-mais-disputado-data-center',
    title: 'O imóvel mais disputado do mundo',
    meta: 'Tese da Redentia',
    image: '/teses/imovel-mais-disputado-data-center.webp',
    href: '/tese/imovel-mais-disputado-data-center',
    kw: normBusca('O imóvel mais disputado do mundo data center imóveis galpão'),
  },
]

/** Guias linkáveis (página real): featured + cards do hub com destino. */
const GUIAS: RawGuide[] = [
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
  const assets = useState<RawAsset[]>('nu:busca:assets', () => [])
  const assetsStatus = useState<LoadStatus>('nu:busca:assets-status', () => 'idle')

  const crypto = useState<RawCrypto[]>('nu:busca:crypto', () => [])
  const cryptoStatus = useState<LoadStatus>('nu:busca:crypto-status', () => 'idle')
  const tesouro = useState<RawTesouro[]>('nu:busca:tesouro', () => [])
  const tesouroStatus = useState<LoadStatus>('nu:busca:tesouro-status', () => 'idle')

  const theses = useState<RawThesis[]>('nu:busca:theses', () => THESES_SEED)
  const thesesStarted = useState<boolean>('nu:busca:theses-started', () => false)

  // paginação do browse ("Ver mais"), volta ao topo quando a pill muda
  const browseLimit = useState<number>('nu:busca:browse-limit', () => BROWSE_PAGE)

  /** Baixa o /tickers-full 1x. */
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
          currency: String(a.currency ?? 'BRL').toUpperCase(),
        })
      }
      if (next.length) assets.value = next
      assetsStatus.value = next.length ? 'ready' : 'error'
    } catch {
      assetsStatus.value = 'error'
    }
  }

  /** Baixa o /crypto 1x. Fonte separada do /tickers-full. */
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

  /** Baixa a lista completa do /tesouro 1x. */
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

  /** As teses reais (título, convicção, capa) para o casamento de texto. */
  async function ensureTheses() {
    if (thesesStarted.value || import.meta.server) return
    thesesStarted.value = true
    try {
      const r = await marketFetchTheses()
      const cards = r?.data ?? []
      if (cards.length >= 2) {
        theses.value = cards.map((c) => ({
          slug: c.id,
          title: c.title,
          meta: [
            c.conviction != null ? `Convicção ${c.conviction}` : (c.sector ?? 'Tese da Redentia'),
            c.returnLabel ? `${c.returnLabel} desde o lançamento` : '',
          ].filter(Boolean).join(' · '),
          image: teseCover(c.image),
          href: `/tese/${c.id}`,
          kw: normBusca(`${c.title} ${c.sector ?? ''} ${(c.tickers ?? []).join(' ')} ${c.description ?? ''}`),
        }))
      }
    } catch { /* fica o seed: só casa texto, não vira vitrine */ }
  }

  /** Todo o universo de casamento (chamado ao montar a página). */
  function ensureUniverse() {
    void ensureAssets()
    void ensureCrypto()
    void ensureTesouro()
    void ensureTheses()
  }

  /** Garante a fonte de um tipo (pill clicada antes do universo inteiro). */
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

  const pendente = (s: LoadStatus) => s === 'idle' || s === 'loading'

  /* ————— busca por texto (com filtro de tipo opcional) ————— */

  function search(q: string, type: BuscaType = 'todos'): BuscaResultadoVM {
    const ql = normBusca(q.trim())
    if (!ql) return { estado: 'vazio', grupos: [], total: 0 }

    const backendType = TYPE_BACKEND[type] ?? null
    const wantB3 = type === 'todos' || !!backendType
    const wantCrypto = type === 'todos' || type === 'cripto'
    const wantTesouro = type === 'todos' || type === 'tesouro'
    const cap = type === 'todos' ? 8 : 20

    const b3: Casado<RawAsset>[] = []
    if (wantB3) {
      for (const a of assets.value) {
        if (backendType && !backendType.includes(a.type)) continue
        const limpo = faixaDoCasamento(ql, a.ticker, nomeDoAtivo(a))
        const cru = faixaDoCasamento(ql, a.ticker, a.name)
        const faixa = limpo < 0 ? cru : cru < 0 ? limpo : Math.min(limpo, cru)
        if (faixa >= 0) b3.push({ item: a, faixa, ticker: a.ticker, cap: a.cap })
      }
      b3.sort(compararCasados)
    }
    const cr: Casado<RawCrypto>[] = []
    if (wantCrypto) {
      for (const c of crypto.value) {
        const faixa = faixaDoCasamento(ql, c.symbol, c.name)
        if (faixa >= 0) cr.push({ item: c, faixa, ticker: c.symbol, cap: c.cap })
      }
      cr.sort(compararCasados)
    }
    // B3 e cripto na mesma lista de ativos: a faixa manda; no empate, a B3
    // vem antes (sort estável sobre [B3..., cripto...]).
    const ativos = [
      ...b3.map((x) => ({ faixa: x.faixa, item: ativoItem(x.item) })),
      ...cr.map((x) => ({ faixa: x.faixa, item: cryptoItem(x.item) })),
    ].sort((a, b) => a.faixa - b.faixa).slice(0, cap).map((x) => x.item)

    const titulos = wantTesouro
      ? tesouro.value
        .filter((t) => normBusca(t.name).includes(ql) || t.slug.includes(ql) || normBusca(t.indexer).includes(ql))
        .slice(0, cap)
        .map(tesouroItem)
      : []

    // teses e guias não são tipo de ativo: só entram no "Todos"
    const teses = type === 'todos'
      ? theses.value.filter((t) => normBusca(t.title).includes(ql) || t.kw.includes(ql)).slice(0, 4).map(teseItem)
      : []
    const guias = type === 'todos'
      ? GUIAS.filter((g) => normBusca(g.title).includes(ql) || normBusca(g.tag).includes(ql)).slice(0, 4).map(guiaItem)
      : []

    const grupos: BuscaGrupo[] = [
      { id: 'ativos', titulo: type === 'cripto' ? 'Cripto' : 'Ativos', itens: ativos },
      { id: 'tesouro', titulo: 'Tesouro Direto', itens: titulos },
      { id: 'teses', titulo: 'Teses', itens: teses },
      { id: 'guias', titulo: 'Guias', itens: guias },
    ].filter((g) => g.itens.length)
    const total = grupos.reduce((n, g) => n + g.itens.length, 0)

    // "Sem resultados" só quando a fonte do tipo REALMENTE respondeu: enquanto
    // o /tickers-full (~1 MB) baixa, afirmar vazio pra um ticker que existe é
    // mentira; e se a fonte caiu, é indisponibilidade, não vazio.
    const fonte: LoadStatus = type === 'cripto' ? cryptoStatus.value
      : type === 'tesouro' ? tesouroStatus.value
        : assetsStatus.value
    const semDado = type === 'cripto' ? !crypto.value.length
      : type === 'tesouro' ? !tesouro.value.length
        : !assets.value.length
    let estado: BuscaEstado = 'pronto'
    if (!total) estado = semDado && pendente(fonte) ? 'carregando' : semDado && fonte === 'error' ? 'erro' : 'vazio'
    return { estado, grupos, total }
  }

  /* ————— campo vazio: as maiores da B3 pelo valor de mercado ————— */

  function maiores(quantas = 6): BuscaResultadoVM {
    const acoes = assets.value
      .filter((a) => a.type === 'STOCK' && a.cap != null)
      .sort((a, b) => (b.cap ?? 0) - (a.cap ?? 0))
    const itens = umaLinhaPorEmpresa(acoes, quantas).map(ativoItem)
    const estado: BuscaEstado = itens.length ? 'pronto'
      : pendente(assetsStatus.value) ? 'carregando'
        : assetsStatus.value === 'error' ? 'erro' : 'vazio'
    return { estado, grupos: itens.length ? [{ id: 'maiores', titulo: 'Maiores empresas da B3', itens }] : [], total: itens.length }
  }

  /**
   * A recente com o número de agora: o preço guardado envelheceria, então a
   * linha do ativo sai do índice vivo; fora dele (ou de outro tipo), só o
   * nome que foi guardado, sem número.
   */
  function aoVivo(r: BuscaRecente): BuscaItem {
    if (r.tipo === 'ativo' && r.ticker) {
      const a = assets.value.find((x) => x.ticker === r.ticker)
      if (a) return ativoItem(a)
      const c = crypto.value.find((x) => x.symbol === r.ticker)
      if (c) return cryptoItem(c)
    }
    return { id: r.id, tipo: r.tipo, titulo: r.titulo, sub: r.sub, href: r.href, ...(r.ticker ? { ticker: r.ticker } : {}) }
  }

  /* ————— lista navegável por tipo (pill marcada, campo vazio) ————— */

  function browse(type: BuscaType): BuscaBrowseVM {
    const limit = browseLimit.value
    const estadoDe = (status: LoadStatus, n: number): BuscaEstado =>
      n ? 'pronto' : pendente(status) ? 'carregando' : status === 'error' ? 'erro' : 'vazio'

    if (type === 'cripto') {
      const top = [...crypto.value].sort((a, b) => (b.cap ?? 0) - (a.cap ?? 0)).slice(0, 20)
      return {
        titulo: 'Principais criptomoedas',
        total: top.length,
        itens: top.map(cryptoItem),
        hasMore: false,
        maisHref: null,
        maisRotulo: null,
        estado: estadoDe(cryptoStatus.value, top.length),
      }
    }

    if (type === 'tesouro') {
      const sorted = [...tesouro.value].sort((a, b) => (a.maturity ?? '9999').localeCompare(b.maturity ?? '9999'))
      const shown = sorted.slice(0, limit)
      return {
        titulo: 'Tesouro Direto',
        total: sorted.length,
        itens: shown.map(tesouroItem),
        hasMore: sorted.length > shown.length,
        maisHref: '/tesouro',
        maisRotulo: 'Ver todos os títulos',
        estado: estadoDe(tesouroStatus.value, sorted.length),
      }
    }

    const backendType = TYPE_BACKEND[type] ?? []
    const list = assets.value.filter((a) => backendType.includes(a.type))
    // market_cap desc quando a maioria do tipo tem valor (ações, BDRs); FII,
    // ETF e EUA quase não têm no índice, e meia dúzia com valor na frente de
    // centenas em ordem alfabética parecia ordem nenhuma: aí, só alfabético.
    const porValor = list.filter((a) => a.cap != null).length >= list.length / 2
    list.sort((a, b) => (porValor ? (b.cap ?? 0) - (a.cap ?? 0) : 0) || a.ticker.localeCompare(b.ticker))
    const shown = list.slice(0, limit)
    const classe = TYPE_CLASSE[type]
    const titulo = type === 'acoes' ? 'Ações da B3'
      : type === 'fiis' ? 'Fundos imobiliários'
        : type === 'etfs' ? 'ETFs da B3'
          : type === 'eua' ? 'Ações e ETFs dos EUA' : 'BDRs'
    // Rankings excluem ETF por decisão (registry): a saída da pill ETFs é o
    // guia com a tabela viva; a da pill EUA, o guia de BDR (a ponte que o
    // investidor daqui conhece).
    const etfs = type === 'etfs'
    const eua = type === 'eua'
    return {
      titulo,
      total: list.length,
      itens: shown.map(ativoItem),
      hasMore: list.length > shown.length,
      maisHref: etfs ? '/guias/como-investir-em-etf'
        : eua ? '/guias/como-investir-em-bdr'
          : classe ? `/rankings?classe=${classe}` : '/rankings',
      maisRotulo: etfs ? 'Como escolher um ETF' : eua ? 'Como investir nos EUA pela B3' : 'Ver os rankings',
      estado: estadoDe(assetsStatus.value, list.length),
    }
  }

  return {
    search,
    maiores,
    aoVivo,
    browse,
    ensureUniverse,
    ensureType,
    showMore,
    resetBrowse,
  }
}
