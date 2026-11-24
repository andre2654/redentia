/**
 * Dois blocos de /dividendos/{TICKER} que não entram no FAQ nem no title:
 * os avisos com data com ou pagamento ainda à frente, e outras empresas do
 * mesmo industry_category do cadastro.
 *
 * Os avisos saem só de GET /dividends (a base). Sem linha, a página não
 * inventa data nem valor. A data citada é a da consulta desses avisos:
 * a base não traz um dia de publicação separado.
 *
 * Os pares saem de PRECO_TETO_FICHA (industry_category gravado em 17/11/2026),
 * do maior volume financeiro ao menor. Uma classe por empresa. Sem DY.
 * O link /setores/{slug} só entra quando a rota existe: o PR de /setores
 * pode chegar depois, e o slug é o mesmo dessa página (nome em português,
 * cinco empresas ou mais).
 */
import { PRECO_TETO_FICHA, PRECO_TETO_LOTE_LASTMOD } from '../../server/data/preco-teto-lotes.ts'
import { dataCurtaAgenda, rotuloDoAviso } from './agendaDividendos.ts'
import { segmentoEmPortugues } from './preco-teto-pagina.ts'
import type { ProventoRow } from './proventos.ts'

export const PARES_SEGMENTO_MAX = 8
export const SETOR_PAGINA_MIN = 5
export const PATH_AGENDA = '/dividendos/agenda'

const ORDEM_DA_CLASSE = ['11', '4', '3', '5', '6']

const nf24 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

export interface LinhaProximo {
  tipo: string
  valor: string
  dataCom: string
  pagamento: string
}

export interface BlocoProximos {
  itens: LinhaProximo[]
  /** Frase quando a base respondeu e não há data com nem pagamento futuro. */
  vazio: string | null
  /** A base não respondeu. Não é o mesmo que "não há aviso". */
  indisponivel: boolean
  fonte: string
  agenda: typeof PATH_AGENDA
}

export interface ParSegmento {
  ticker: string
  href: string
}

export interface ParesSegmento {
  /** industry_category, como no cadastro. null se o papel não tem. */
  segmento: string | null
  /** Nome em português, quando o mapa conhece o segmento. */
  nome: string | null
  itens: ParSegmento[]
  slug: string | null
  /** A página /setores/{slug} existe para este segmento, se a rota existir. */
  qualifica: boolean
  nota: string
}

export interface FichaSegmento {
  volume: number
  segmento: string
}

function dinheiro(n: number): string {
  return `R$ ${nf24.format(n)}`
}

function chave(s: string | null | undefined): string {
  const t = String(s ?? '').trim().toLowerCase()
  if (!t || t === 'n/a') return ''
  return t
}

function raiz(ticker: string): string {
  return ticker.slice(0, 4)
}

function pesoDaClasse(ticker: string): number {
  const i = ORDEM_DA_CLASSE.indexOf(ticker.slice(4))
  return i === -1 ? ORDEM_DA_CLASSE.length : i
}

export function slugDeSegmento(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function futuro(r: ProventoRow, hoje: string): boolean {
  const pagamento = !!r.payDate && r.payDate > hoje
  const com = r.hasExDate && r.date >= hoje
  return pagamento || com
}

/**
 * Proventos já anunciados com data com hoje ou depois, ou com pagamento
 * depois de hoje. Pagamento no próprio dia da consulta já não é futuro.
 */
export function montarProximosPagamentos(input: {
  rows: readonly ProventoRow[] | null
  hoje: string
  unidade: 'ação' | 'cota' | 'BDR'
}): BlocoProximos {
  const data = dataCurtaAgenda(input.hoje)
  const fonte = `Fonte: avisos de proventos da B3, consultados em ${data}.`
  if (input.rows == null) {
    return {
      itens: [],
      vazio: null,
      indisponivel: true,
      fonte: 'Fonte: os avisos de proventos da B3 não puderam ser lidos nesta página.',
      agenda: PATH_AGENDA,
    }
  }
  const linhas = [...input.rows]
    .filter((r) => futuro(r, input.hoje))
    .sort((a, b) => (a.payDate || '9999-12-31').localeCompare(b.payDate || '9999-12-31')
      || a.date.localeCompare(b.date)
      || a.label.localeCompare(b.label))
  return {
    itens: linhas.map((r) => ({
      tipo: rotuloDoAviso(r.label),
      valor: `${dinheiro(r.rate)} por ${input.unidade}`,
      dataCom: r.hasExDate ? dataCurtaAgenda(r.date) : 'Não informada',
      pagamento: r.payDate ? dataCurtaAgenda(r.payDate) : 'A definir',
    })),
    vazio: linhas.length ? null : `Sem aviso de pagamento futuro em ${data}.`,
    indisponivel: false,
    fonte,
    agenda: PATH_AGENDA,
  }
}

interface Empresa {
  ticker: string
  volume: number
}

function empresasDoSegmento(
  segmento: string,
  ficha: Readonly<Record<string, FichaSegmento>>,
): Empresa[] {
  const alvo = chave(segmento)
  const porRaiz = new Map<string, Empresa>()
  for (const [ticker, linha] of Object.entries(ficha)) {
    if (chave(linha.segmento) !== alvo) continue
    const atual = porRaiz.get(raiz(ticker))
    const melhor = !atual
      || linha.volume > atual.volume
      || (linha.volume === atual.volume && pesoDaClasse(ticker) < pesoDaClasse(atual.ticker))
      || (linha.volume === atual.volume && pesoDaClasse(ticker) === pesoDaClasse(atual.ticker) && ticker < atual.ticker)
    if (melhor) porRaiz.set(raiz(ticker), { ticker, volume: linha.volume })
  }
  return [...porRaiz.values()]
}

export function montarParesSegmento(
  ticker: string,
  industry: string | null | undefined,
  ficha: Readonly<Record<string, FichaSegmento>> = PRECO_TETO_FICHA,
): ParesSegmento {
  const eu = String(ticker ?? '').trim().toUpperCase()
  const bruto = String(industry ?? '').trim()
  const segmento = chave(bruto) ? bruto.trim() : (ficha[eu]?.segmento?.trim() || '')
  const vazio: ParesSegmento = {
    segmento: null,
    nome: null,
    itens: [],
    slug: null,
    qualifica: false,
    nota: '',
  }
  if (!chave(segmento)) return vazio

  const empresas = empresasDoSegmento(segmento, ficha)
  const nome = segmentoEmPortugues(segmento)
  const slug = nome ? slugDeSegmento(nome) : null
  const qualifica = !!slug && empresas.length >= SETOR_PAGINA_MIN
  const data = dataCurtaAgenda(PRECO_TETO_LOTE_LASTMOD)
  const itens = empresas
    .filter((e) => raiz(e.ticker) !== raiz(eu))
    .sort((a, b) => b.volume - a.volume || a.ticker.localeCompare(b.ticker))
    .slice(0, PARES_SEGMENTO_MAX)
    .map((e) => ({ ticker: e.ticker, href: `/dividendos/${e.ticker}` }))

  const onde = nome || segmento
  const nota = itens.length
    ? `Mesmo segmento no cadastro: ${onde}. Volume financeiro do pregão de ${data}.`
    : `Não há outra empresa em ${onde} no cadastro de ${data}.`

  return {
    segmento,
    nome,
    itens,
    slug: qualifica ? slug : null,
    qualifica,
    nota,
  }
}

/** /setores/{slug} só com a rota publicada e com segmento que essa rota lista. */
export function hrefSetorSeRota(pares: ParesSegmento, rotaExiste: boolean): string | null {
  if (!rotaExiste || !pares.qualifica || !pares.slug) return null
  return `/setores/${pares.slug}`
}
