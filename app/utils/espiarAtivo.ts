/**
 * A janelinha de espiar ativo (03/11/2026, pedido do dono: "quando clico nos
 * ativos em qualquer lugar do app, ao invés de abrir direto a tela do ativo,
 * acho que seria legal aparecer uma janelinha no canto inferior direito, só
 * com detalhes, e podendo maximizar para aí sim ver a tela dos ativos").
 *
 * A regra pura, sem Vue, para o `node --test`:
 *  - `tickerParaEspiar`: qual clique vira janelinha e qual segue sendo link
 *    (o plugin plugins/espiar-ativo.client.ts só lê o DOM e pergunta aqui);
 *  - `montarEspiar`: o que a janelinha mostra, a partir das cinco respostas
 *    leves do Laravel (perfil, série de 12 meses, overview, proventos e as
 *    leituras do Atlas do ativo). As contas são as mesmas da página de ativo
 *    (useAcao): o mesmo DY (resolveSiteDy), os mesmos rótulos, a mesma classe.
 *    Muda o tamanho, nunca o número.
 */
import { symbolShape } from './tickerClass.ts'
import { nomeDaEmpresa, nomeDoBdr } from './nomeB3.ts'
import { overviewDyOf, parseProventos, resolveSiteDy } from './proventos.ts'
import type { FundamentalsOverviewApi, TickerProfileApi } from '../types/acao'
import type { NewsTakeApi } from '../types/market'

/* ————— a regra do clique ————— */

export interface EspiarClique {
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  defaultPrevented: boolean
}

export interface EspiarAncora {
  /** o atributo href como está no HTML (relativo ou absoluto) */
  href: string | null
  target: string | null
  /** tem o atributo download */
  download: boolean
  /** ela ou um ancestral tem data-sem-espiar */
  semEspiar: boolean
  /** está dentro de um diálogo modal (a folha de cadastro, um modal Nu) */
  emModal: boolean
}

export interface EspiarOpcoes {
  /** location.origin: href absoluto para outro host passa direto */
  origem: string
  /** o path da página atual: no /asset/X o link para X navega (âncoras, refresh) */
  rotaAtual: string
  /** o cursor mágico do chat está ligado e este link é dele (anexa, não espia) */
  seletorDoChat?: boolean
}

/** O ticker de um href /asset/X (maiúsculo), ou null para qualquer outra rota. */
export function tickerDoHrefDeAtivo(href: string | null | undefined, origem = 'https://x.invalid'): string | null {
  if (!href) return null
  let url: URL
  try { url = new URL(href, origem) } catch { return null }
  if (url.origin !== new URL(origem).origin) return null
  const m = url.pathname.match(/^\/asset\/([^/]+)\/?$/i)
  if (!m) return null
  let t: string
  try { t = decodeURIComponent(m[1]!).trim().toUpperCase() } catch { return null }
  return symbolShape(t) === 'invalid' ? null : t
}

/**
 * O clique vira janelinha? Devolve o ticker, ou null para deixar o link ser
 * link. Passam direto: botão do meio e o direito, Cmd/Ctrl/Shift/Alt (nova
 * aba, nova janela, baixar), target que não é _self, download, href de outro
 * host ou de outra rota, o opt-out data-sem-espiar, link dentro de modal, o
 * cursor mágico do chat ligado e o link para o próprio ativo da página.
 */
export function tickerParaEspiar(c: EspiarClique, a: EspiarAncora, o: EspiarOpcoes): string | null {
  if (c.defaultPrevented || c.button !== 0) return null
  if (c.metaKey || c.ctrlKey || c.shiftKey || c.altKey) return null
  const alvo = (a.target ?? '').trim().toLowerCase()
  if (alvo && alvo !== '_self') return null
  if (a.download || a.semEspiar || a.emModal || o.seletorDoChat) return null
  const t = tickerDoHrefDeAtivo(a.href, o.origem)
  if (!t) return null
  if (tickerDoHrefDeAtivo(o.rotaAtual, o.origem) === t) return null
  return t
}

/* ————— o que a janelinha mostra ————— */

export type EspiarClasse = 'acao' | 'fii' | 'etf' | 'bdr'

export interface EspiarIndicador { rotulo: string; valor: string }

export interface EspiarLinha {
  /** o path do SVG no viewBox 0 0 LARGURA ALTURA */
  d: string
  /**
   * a série inteira, pregão a pregão (data e preço, em ordem): a capa do
   * maximizar desenha com ela a linha no tamanho e na conta do gráfico da
   * página (caminhosDoGrafico), no lugar onde a página vai desenhá-la
   */
  serie: Array<{ t: string; v: number }>
  /** o ponto de hoje */
  x: number
  y: number
  /** a variação no período, como a legenda do gráfico da página ("+74,78%") */
  variacao: string | null
  dir: 'up' | 'down' | null
}

export interface EspiarPorQue {
  /** "Por que mexeu hoje" ou "Por que mexeu em 31/10" (o último pregão) */
  titulo: string
  texto: string
  /** "Money Times, 17h47" */
  fonte: string
  url: string | null
}

export interface EspiarVM {
  ticker: string
  nome: string
  classe: EspiarClasse
  classeRotulo: string
  bolsa: string
  precoFmt: string | null
  /** "-3,79%" */
  variacaoFmt: string | null
  dir: 'up' | 'down' | null
  /** "hoje" ou "em 31/10" */
  quando: string | null
  linha: EspiarLinha | null
  indicadores: EspiarIndicador[]
  porQue: EspiarPorQue | null
  /** o ativo em texto, para o chat (o que a pessoa está vendo na janelinha) */
  contexto: string
}

export interface EspiarEntrada {
  perfil: TickerProfileApi
  /** GET /tickers/{t}/prices?mode=12mo → data (null = falhou) */
  precos: Array<{ market_price: number | null; price_at: string }> | null
  overview: FundamentalsOverviewApi | null
  /** GET /dividends/{t} → data (null = falhou; aí vale o DY oficial, como na página) */
  proventos: readonly unknown[] | null
  /** GET /research/news?ticker= → data */
  leituras: NewsTakeApi[] | null
  /** 'YYYY-MM-DD' de hoje em São Paulo */
  hoje: string
}

export const LINHA_LARGURA = 320
export const LINHA_ALTURA = 64

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (n: number) => `${n > 0 ? '+' : n < 0 ? '-' : ''}${nf2.format(Math.abs(n))}%`

const num = (v: unknown): number | null => {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** A classe pela mesma regra do loadAcao: scrape_extras.asset_type manda; sem ele, o tipo do perfil. */
export function classeDoAtivo(perfilTipo: string | null | undefined, assetType: string | null | undefined): EspiarClasse {
  if (assetType === 'fii') return 'fii'
  if (assetType === 'bdr') return 'bdr'
  if (assetType === 'etf') return 'etf'
  if (assetType) return 'acao'
  if (perfilTipo === 'REIT') return 'fii'
  if (perfilTipo === 'ETF' || perfilTipo === 'US_ETF') return 'etf'
  if (perfilTipo === 'BDR') return 'bdr'
  return 'acao'
}

const ROTULO_CLASSE: Record<EspiarClasse, string> = { acao: 'Ação', fii: 'FII', etf: 'ETF', bdr: 'BDR' }

/** "Inter & Co" de "ISHARE SP500" e afins: o book_name do ETF em caixa de título. */
function caixaDeTitulo(s: string): string {
  const miudas = new Set(['de', 'do', 'da', 'dos', 'das', 'e'])
  return s.trim().toLowerCase().split(/\s+/).map((w) => (miudas.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')
}

/**
 * Os 3 ou 4 números que dizem o que o ativo é, por classe, com os rótulos e
 * as fontes da página de ativo (buildFundCards). Número que falta sai; nunca
 * zero inventado.
 */
export function indicadoresDoAtivo(classe: EspiarClasse, ov: FundamentalsOverviewApi | null, dy: number | null, moeda: 'R$' | 'US$'): EspiarIndicador[] {
  const se = ov?.scrape_extras
  const ks = ov?.key_statistics
  const fd = ov?.financial_data
  const out: EspiarIndicador[] = []
  const por = (rotulo: string, v: number | null | undefined, fmt: (n: number) => string) => {
    if (v != null && Number.isFinite(v)) out.push({ rotulo, valor: fmt(v) })
  }
  const pctDe = (n: number) => `${nf2.format(n)}%`
  if (classe === 'etf') {
    const e = se?.etf
    por('12 meses', e?.change_12m ?? null, pct)
    por('Mín. 52 semanas', e?.min_price_52_weeks ?? null, (n) => `${moeda} ${nf2.format(n)}`)
    por('Máx. 52 semanas', e?.max_price_52_weeks ?? null, (n) => `${moeda} ${nf2.format(n)}`)
    por('Cotistas', e?.num_shareholders ?? null, (n) => nf0.format(n))
    return out.slice(0, 4)
  }
  if (classe === 'fii') {
    const f = se?.fii
    por('Dividend Yield', dy, pctDe)
    por('P/VP', f?.price_to_book ?? num(ks?.price_to_book), (n) => nf2.format(n))
    por('Renda média/cota (24M)', f?.monthly_income_avg_24m ?? null, (n) => `R$ ${nf2.format(n)}`)
    por('Cotistas', f?.num_shareholders ?? null, (n) => nf0.format(n))
    if (out.length < 4) por('VP por cota', f?.book_value_per_share ?? null, (n) => `R$ ${nf2.format(n)}`)
    return out.slice(0, 4)
  }
  const val = se?.valuation
  const q = se?.quality
  const roe = q?.return_on_equity ?? (num(fd?.return_on_equity) != null ? num(fd?.return_on_equity)! * 100 : null)
  const margem = q?.net_margin ?? (num(fd?.profit_margins) != null ? num(fd?.profit_margins)! * 100 : null)
  const pl = val?.price_to_earnings ?? num(ks?.forward_pe)
  const pvp = val?.price_to_book ?? num(ks?.price_to_book)
  if (classe === 'bdr') {
    por('P/L', pl, (n) => nf2.format(n))
    por('Dividend Yield', dy, pctDe)
    por('ROE', roe, (n) => `${nf1.format(n)}%`)
    por('Margem Líquida', margem, (n) => `${nf1.format(n)}%`)
    return out.slice(0, 4)
  }
  por('Dividend Yield', dy, pctDe)
  por('P/L', pl, (n) => nf2.format(n))
  por('P/VP', pvp, (n) => nf2.format(n))
  por('ROE', roe, (n) => `${nf1.format(n)}%`)
  if (out.length < 4) por('Margem Líquida', margem, (n) => `${nf1.format(n)}%`)
  if (out.length < 4) por('Dív. Líq./EBITDA', se?.leverage?.net_debt_to_ebitda ?? null, (n) => nf2.format(n))
  return out.slice(0, 4)
}

/** Até ~90 pontos: a linha de 320px não precisa dos 250 pregões, e o fim fica sempre. */
function reduzir<T>(xs: T[], max = 90): T[] {
  if (xs.length <= max) return xs
  const passo = (xs.length - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => xs[Math.round(i * passo)]!)
}

/** A linha de 12 meses, sem eixo: o desenho e o ponto de hoje. Menos de 2 pontos → null. */
export function linhaDoAtivo(serie: Array<{ market_price: number | null; price_at: string }> | null | undefined): EspiarLinha | null {
  const pontos = (serie ?? [])
    .filter((p) => p && typeof p.market_price === 'number' && Number.isFinite(p.market_price) && p.market_price > 0 && !!p.price_at)
    .sort((a, b) => (a.price_at < b.price_at ? -1 : a.price_at > b.price_at ? 1 : 0))
    .map((p) => ({ t: p.price_at, v: p.market_price as number }))
  const pts = pontos.map((p) => p.v)
  if (pts.length < 2) return null
  const vs = reduzir(pts)
  const min = Math.min(...vs), max = Math.max(...vs)
  const faixa = max - min || 1
  // folga de 6px em cima e embaixo (o ponto de hoje tem raio 4 e o halo)
  const pad = 6
  const xDe = (i: number) => (i / (vs.length - 1)) * LINHA_LARGURA
  const yDe = (v: number) => pad + (1 - (v - min) / faixa) * (LINHA_ALTURA - pad * 2)
  const d = vs.map((v, i) => `${i ? 'L' : 'M'}${xDe(i).toFixed(1)} ${yDe(v).toFixed(1)}`).join(' ')
  const a = pts[0]!, z = pts[pts.length - 1]!
  const v = a ? ((z - a) / a) * 100 : null
  return {
    d,
    serie: pontos,
    x: LINHA_LARGURA,
    y: Number(yDe(vs[vs.length - 1]!).toFixed(1)),
    variacao: v == null ? null : `${v > 0 ? '+' : ''}${nf2.format(v)}%`,
    dir: v == null ? null : v < 0 ? 'down' : 'up',
  }
}

const SP = 'America/Sao_Paulo'
const diaSp = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : new Intl.DateTimeFormat('en-CA', { timeZone: SP }).format(d)
}
const horaSp = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const [h, m] = new Intl.DateTimeFormat('pt-BR', { timeZone: SP, hour: '2-digit', minute: '2-digit', hour12: false }).format(d).split(':')
  return `${h}h${m}`
}
const fonteBonita = (s: string) => s.replace(/_/g, ' ').replace(/(^|\s)\S/g, (c) => c.toUpperCase())
const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

/** As duas primeiras frases, com teto: a janelinha não é a notícia inteira. */
function frasesCurtas(s: string, max = 230): string {
  const t = s.replace(/\s+/g, ' ').trim()
  // fim de frase é o ponto seguido de espaço e maiúscula: "165.528" e "US$ 103,60." não cortam
  const frases = t.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ"“])/)
  let out = ''
  for (const f of frases) {
    const prox = `${out}${out ? ' ' : ''}${f.trim()}`
    if (out && prox.length > max) break
    out = prox
    if (out.length >= max * 0.6) break
  }
  return out.length > max ? `${out.slice(0, max - 1).trimEnd()}…` : out
}

/**
 * "Por que mexeu": a leitura do Atlas do mesmo pregão da cotação, e só se
 * ela marca o ativo no mesmo sentido do dia (subiu e a leitura diz "up").
 * Leitura de outro dia, "flat" ou do lado contrário não explica o movimento
 * e não aparece. Variação menor que 0,5% não é "mexeu".
 */
export function porQueMexeu(
  ticker: string,
  leituras: NewsTakeApi[] | null | undefined,
  variacaoDia: number | null | undefined,
  dataPreco: string | null | undefined,
  hoje: string,
): EspiarPorQue | null {
  if (variacaoDia == null || Math.abs(variacaoDia) < 0.5 || !dataPreco) return null
  const sentido = variacaoDia > 0 ? 'up' : 'down'
  const cands = (leituras ?? []).flatMap((n) => {
    const lista = Array.isArray(n.tickers) ? n.tickers : []
    const i = lista.findIndex((x) => (typeof x === 'string' ? x : x?.ticker)?.toUpperCase() === ticker)
    const marca = i >= 0 ? lista[i] : null
    const dir = marca && typeof marca === 'object' ? marca.dir : null
    if (!n.publishedAt || dir !== sentido || diaSp(n.publishedAt) !== dataPreco) return []
    const texto = (n.atlasReading ?? '').trim() || (n.title ?? '').trim()
    if (!texto) return []
    return [{ n, i, total: lista.length, texto }]
  })
  if (!cands.length) return null
  // o ativo como protagonista ganha (primeiro da lista, a lista mais curta),
  // depois a relevância e a mais recente
  cands.sort((a, b) => (a.i - b.i) || (a.total - b.total) || ((b.n.relevance ?? 0) - (a.n.relevance ?? 0)) || (a.n.publishedAt < b.n.publishedAt ? 1 : -1))
  const { n, texto } = cands[0]!
  const hora = horaSp(n.publishedAt!)
  return {
    titulo: dataPreco === hoje ? 'Por que mexeu hoje' : `Por que mexeu em ${ddmm(dataPreco)}`,
    texto: frasesCurtas(texto),
    fonte: [n.source ? fonteBonita(n.source) : null, hora].filter(Boolean).join(', '),
    url: n.url ?? null,
  }
}

/** O cartão inteiro. O perfil é obrigatório; o resto degrada escondendo. */
export function montarEspiar(e: EspiarEntrada): EspiarVM {
  const p = e.perfil
  const ticker = String(p.ticker ?? '').toUpperCase()
  const ov = e.overview
  const classe = classeDoAtivo(p.type, ov?.scrape_extras?.asset_type ?? null)
  const usd = p.currency === 'USD'
  const moeda = usd ? 'US$' : 'R$'
  const etfNome = classe === 'etf' && ov?.scrape_extras?.etf?.book_name ? caixaDeTitulo(ov.scrape_extras.etf.book_name) : null
  const bdrNome = classe === 'bdr' ? nomeDoBdr(ov?.scrape_extras?.identity?.company_name) : null
  const nome = etfNome ?? bdrNome ?? nomeDaEmpresa(p.name ?? ticker, ov?.scrape_extras?.fii?.trading_name ?? null)

  const preco = p.market_price
  const chg = p.change_percent
  const dataPreco = /^\d{4}-\d{2}-\d{2}$/.test(p.price_date ?? '') ? p.price_date! : null
  const quando = dataPreco ? (dataPreco === e.hoje ? 'hoje' : `em ${ddmm(dataPreco)}`) : null

  const dy = classe === 'etf'
    ? null
    : resolveSiteDy({ overviewDy: overviewDyOf(ov), price: preco, rows: e.proventos == null ? null : parseProventos(e.proventos) }).value
  const indicadores = indicadoresDoAtivo(classe, ov, dy, moeda)
  const linha = linhaDoAtivo(e.precos)
  const porQue = porQueMexeu(ticker, e.leituras, chg, dataPreco, e.hoje)
  const precoFmt = preco != null && preco > 0 ? `${moeda} ${nf2.format(preco)}` : null
  const variacaoFmt = chg != null && Number.isFinite(chg) ? pct(chg) : null

  const contexto = [
    `${nome} (${ticker}), ${ROTULO_CLASSE[classe]}${usd ? ' nos EUA' : ' na B3'}`,
    precoFmt ? `Preço: ${precoFmt}${variacaoFmt ? `, ${variacaoFmt} ${quando ?? ''}`.trimEnd() : ''}` : null,
    linha?.variacao ? `Em 12 meses: ${linha.variacao}` : null,
    ...indicadores.map((i) => `${i.rotulo}: ${i.valor}`),
    porQue ? `${porQue.titulo}: ${porQue.texto}` : null,
  ].filter(Boolean).join('\n')

  return {
    ticker,
    nome,
    classe,
    classeRotulo: ROTULO_CLASSE[classe],
    bolsa: usd ? 'EUA' : 'B3',
    precoFmt,
    variacaoFmt,
    dir: chg == null ? null : chg < 0 ? 'down' : 'up',
    quando,
    linha,
    indicadores,
    porQue,
    contexto,
  }
}

/* ————— onde o cartão pousa ————— */

export interface EspiarGeometria {
  /** largura da janela (innerWidth) */
  vw: number
  /** o painel do chat aberto ocupa a direita */
  painelAberto: boolean
  /** largura do painel + as duas margens dele (o que ele tira da direita) */
  painelOcupa: number
  largura: number
  margem: number
}

/**
 * Ao lado do painel do chat quando cabe (a janelinha anda para a esquerda dele,
 * os dois lado a lado no canto); sem espaço, ela dá lugar ao painel (null): o
 * ativo já foi junto como anexo da conversa.
 */
/**
 * A barra do chat vai para baixo do cartão, na largura dele, e passa a
 * perguntar sobre o ativo (dono, 12/11/2026: "deixar o input ali de
 * ladinho"). Só no computador: com o cartão (acima de 640px) E a barra na
 * forma larga (acima de 760px; abaixo ela é a cápsula do celular) E a barra
 * à vista (fora do login, da /busca e com o painel fechado).
 */
export const BARRA_LARGA_DESDE = 761
export const ALTURA_BARRA_AO_LADO = 62 // a barra no foco (58 em repouso)
export const VAO_BARRA_CARTAO = 12

export function barraAoLado(g: { vw: number, celular: boolean, barraVisivel: boolean }): boolean {
  return !g.celular && g.vw >= BARRA_LARGA_DESDE && g.barraVisivel
}

export function direitaDoCartao(g: EspiarGeometria): number | null {
  if (!g.painelAberto) return g.margem
  const direita = g.painelOcupa + g.margem
  return g.vw - direita - g.largura >= g.margem ? direita : null
}
