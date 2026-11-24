/**
 * Rankings só de FIIs e a lista de small caps.
 *
 * O recorte de FIIs sai do mesmo ranking de dividend yield que o hub /fiis
 * já usa (até 100 linhas). Volume financeiro não vem na lista: chega do
 * cadastro de cada ticker, e a linha só entra com volume e data. Não há
 * lista ordenada por P/VP. Small caps saem do valor de mercado da base de
 * tickers, com um corte declarado, ordenadas por esse valor. Sem número ou
 * sem data, a linha não entra. A função não completa com número inventado.
 */
import { MONTHS_PT } from './format.ts'
import { DY_TETO, pareceFii } from './graficos.ts'
import { nomeDaEmpresa } from './nomeB3.ts'
import { fmtCompactBrl } from './rankings.ts'
import { symbolShape } from './tickerClass.ts'

export const FIIS_RANK_LIMITE = 20
export const SMALL_CAPS_LIMITE = 50
/** Corte declarado da página. Não é a carteira do índice Small Cap da B3. */
export const SMALL_CAPS_CORTE = 2_000_000_000
export const SMALL_CAPS_CORTE_TEXTO = 'R$ 2 bilhões'

export interface LinhaBruta {
  ticker?: string | null
  name?: string | null
  type?: string | null
  market_price?: number | string | null
  close?: number | string | null
  dividend_yield?: number | string | null
  price_date?: string | null
  market_cap?: number | string | null
  alias_of?: string | null
}

export interface VolumeLido {
  volume: number
  priceDate: string | null
  marketPrice: number | null
}

export interface NumeroPublicado {
  rotulo: string
  valor: string
}

export interface LinhaPublicada {
  ticker: string
  nome: string
  data: string
  dataIso: string
  numeros: NumeroPublicado[]
}

export interface Recorte {
  itens: LinhaPublicada[]
  total: number
  fonte: string
  dataIso: string | null
  rotulo: string
  /** true quando o volume não pôde ser lido. A lista vazia, nesse caso, não é "ninguém passou". */
  indisponivel: boolean
  ordem: 'asc' | 'desc'
}

const VAZIO = (rotulo: string, ordem: Recorte['ordem'], indisponivel = false): Recorte => ({
  itens: [],
  total: 0,
  fonte: '',
  dataIso: null,
  rotulo,
  indisponivel,
  ordem,
})

const nfBrl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function num(v: number | string | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function dataIso(v: string | null | undefined): string | null {
  const d = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
}

function dataCurta(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}

function quando(datas: string[]): string {
  const uniq = [...new Set(datas)].sort()
  const min = dataCurta(uniq[0]!)
  const max = dataCurta(uniq[uniq.length - 1]!)
  return min === max ? `em ${max}` : `nos pregões de ${min} a ${max}`
}

function rotuloDe(criterio: string, datas: string[]): string {
  if (!datas.length) return `Ranking por ${criterio}.`
  return `Ranking por ${criterio} ${quando(datas)}.`
}

function pregaoDe(datas: string[]): string {
  const uniq = [...new Set(datas)].sort()
  const min = dataCurta(uniq[0]!)
  const max = dataCurta(uniq[uniq.length - 1]!)
  return min === max ? `Pregão de ${max}` : `Pregões de ${min} a ${max}`
}

function nomeDoPapel(bruto: string, ticker: string): string {
  const limpo = bruto.replace(/\s+/g, ' ').trim().replace(/^FII\s+/i, '')
  return nomeDaEmpresa(limpo) || ticker
}

interface BaseFii {
  ticker: string
  nome: string
  preco: number
  dataIso: string
  dy: number | null
}

function baseFiis(rows: readonly LinhaBruta[] | null): BaseFii[] {
  if (!rows) return []
  const vistos = new Set<string>()
  const saida: BaseFii[] = []
  for (const row of rows) {
    const ticker = String(row.ticker ?? '').toUpperCase()
    const name = String(row.name ?? '')
    if (vistos.has(ticker)) continue
    if (row.type && row.type !== 'REIT') continue
    if (!pareceFii(ticker, name)) continue
    const preco = num(row.market_price) ?? num(row.close)
    if (preco == null || preco <= 0) continue
    const dia = dataIso(row.price_date)
    if (!dia) continue
    vistos.add(ticker)
    const dy = num(row.dividend_yield)
    saida.push({
      ticker,
      nome: nomeDoPapel(name, ticker),
      preco,
      dataIso: dia,
      dy: dy != null && dy > 0 && dy <= DY_TETO ? dy : null,
    })
  }
  return saida
}

function publicar(
  linhas: { ticker: string, nome: string, dataIso: string, numeros: NumeroPublicado[] }[],
  total: number,
  criterio: string,
  fonte: string,
  ordem: Recorte['ordem'],
): Recorte {
  if (!linhas.length) return VAZIO(rotuloDe(criterio, []), ordem)
  const datas = linhas.map((l) => l.dataIso)
  const max = [...datas].sort().at(-1) ?? null
  return {
    itens: linhas.map((l) => ({
      ticker: l.ticker,
      nome: l.nome,
      data: dataCurta(l.dataIso),
      dataIso: l.dataIso,
      numeros: l.numeros,
    })),
    total,
    fonte: `Fonte: ${fonte} ${pregaoDe(datas)}.`,
    dataIso: max,
    rotulo: rotuloDe(criterio, datas),
    indisponivel: false,
    ordem,
  }
}

function linhaDePreco(base: BaseFii, extra: NumeroPublicado): NumeroPublicado[] {
  return [
    extra,
    { rotulo: 'Cotação', valor: nfBrl.format(base.preco) },
    { rotulo: 'Pregão', valor: dataCurta(base.dataIso) },
  ]
}

/** Tickers do recorte, para buscar o volume só deles. */
export function candidatosFiis(rows: readonly LinhaBruta[] | null): string[] {
  return baseFiis(rows).map((b) => b.ticker)
}

export function recorteDyFiis(rows: readonly LinhaBruta[] | null, limite = FIIS_RANK_LIMITE): Recorte {
  const uteis = baseFiis(rows).filter((b) => b.dy != null)
  uteis.sort((a, b) => b.dy! - a.dy! || a.ticker.localeCompare(b.ticker))
  const top = uteis.slice(0, Math.max(0, limite))
  return publicar(
    top.map((b) => ({
      ticker: b.ticker,
      nome: b.nome,
      dataIso: b.dataIso,
      numeros: linhaDePreco(b, { rotulo: 'DY 12 meses', valor: `${nf2.format(b.dy! * 100)}%` }),
    })),
    uteis.length,
    'dividend yield de 12 meses',
    'avisos de proventos da B3 e Brapi (B3), no ranking de dividend yield. O recorte é esse ranking, até 100 linhas, não a lista de todos os FIIs da B3.',
    'desc',
  )
}

/**
 * volumes null: a leitura falhou (indisponivel).
 * volumes objeto: só entra ticker com volume > 0 e data de pregão.
 */
export function recorteLiquidezFiis(
  rows: readonly LinhaBruta[] | null,
  volumes: Readonly<Record<string, VolumeLido>> | null,
  limite = FIIS_RANK_LIMITE,
): Recorte {
  const criterio = 'volume financeiro do pregão'
  if (volumes == null) return VAZIO(rotuloDe(criterio, []), 'desc', true)
  const bases = new Map(baseFiis(rows).map((b) => [b.ticker, b]))
  const uteis: { base: BaseFii, volume: number, dataIso: string, preco: number }[] = []
  for (const [ticker, vol] of Object.entries(volumes)) {
    const base = bases.get(ticker.toUpperCase())
    if (!base) continue
    if (!Number.isFinite(vol.volume) || vol.volume <= 0) continue
    const dia = dataIso(vol.priceDate)
    if (!dia) continue
    const preco = vol.marketPrice != null && vol.marketPrice > 0
      ? vol.marketPrice
      : (dia === base.dataIso ? base.preco : null)
    if (preco == null) continue
    uteis.push({ base: { ...base, preco, dataIso: dia }, volume: vol.volume, dataIso: dia, preco })
  }
  uteis.sort((a, b) => b.volume - a.volume || a.base.ticker.localeCompare(b.base.ticker))
  const top = uteis.slice(0, Math.max(0, limite))
  return publicar(
    top.map((u) => ({
      ticker: u.base.ticker,
      nome: u.base.nome,
      dataIso: u.dataIso,
      numeros: linhaDePreco(u.base, { rotulo: 'Volume', valor: fmtCompactBrl(u.volume) }),
    })),
    uteis.length,
    criterio,
    'volume financeiro do pregão, em reais, no cadastro de cada ticker. Entram só os FIIs desse recorte com volume maior que zero e data.',
    'desc',
  )
}

export function recorteSmallCaps(rows: readonly LinhaBruta[] | null, limite = SMALL_CAPS_LIMITE): Recorte {
  const criterio = `valor de mercado abaixo de ${SMALL_CAPS_CORTE_TEXTO}`
  if (!rows) return VAZIO(rotuloDe(criterio, []), 'asc')
  const vistos = new Set<string>()
  const uteis: { ticker: string, nome: string, preco: number, dataIso: string, valor: number }[] = []
  for (const row of rows) {
    const ticker = String(row.ticker ?? '').toUpperCase()
    if (vistos.has(ticker)) continue
    if (row.type !== 'STOCK') continue
    if (symbolShape(ticker) !== 'b3') continue
    if (row.alias_of) continue
    const valor = num(row.market_cap)
    if (valor == null || valor <= 0 || valor >= SMALL_CAPS_CORTE) continue
    const preco = num(row.market_price) ?? num(row.close)
    if (preco == null || preco <= 0) continue
    const dia = dataIso(row.price_date)
    if (!dia) continue
    vistos.add(ticker)
    uteis.push({ ticker, nome: nomeDoPapel(String(row.name ?? ''), ticker), preco, dataIso: dia, valor })
  }
  uteis.sort((a, b) => a.valor - b.valor || a.ticker.localeCompare(b.ticker))
  const top = uteis.slice(0, Math.max(0, limite))
  const faixa = top.length < uteis.length
    ? `A tabela mostra ${top.length} de ${uteis.length} que passam no corte, ordenadas pelo valor de mercado, do menor para o maior.`
    : `A tabela mostra as ${uteis.length} que passam no corte, ordenadas pelo valor de mercado, do menor para o maior.`
  return publicar(
    top.map((u) => ({
      ticker: u.ticker,
      nome: u.nome,
      dataIso: u.dataIso,
      numeros: [
        { rotulo: 'Valor de mercado', valor: fmtCompactBrl(u.valor) },
        { rotulo: 'Cotação', valor: nfBrl.format(u.preco) },
        { rotulo: 'Pregão', valor: dataCurta(u.dataIso) },
      ],
    })),
    uteis.length,
    criterio,
    `cotação e valor de mercado da base de tickers da B3. Corte: valor de mercado maior que zero e abaixo de ${SMALL_CAPS_CORTE_TEXTO}. ${faixa} ON e PN da mesma empresa podem aparecer, porque a base devolve o valor em cada ticker.`,
    'asc',
  )
}

/** Lê o cadastro do ticker. Sem volume positivo, devolve null. */
export function lerVolumeTicker(payload: unknown): VolumeLido | null {
  if (!payload || typeof payload !== 'object') return null
  const bruto = payload as { data?: unknown, volume?: unknown, price_date?: unknown, market_price?: unknown }
  const row = bruto.data && typeof bruto.data === 'object'
    ? bruto.data as { volume?: unknown, price_date?: unknown, market_price?: unknown }
    : bruto
  const volume = num(row.volume as number | string | null)
  if (volume == null || volume <= 0) return null
  const preco = num(row.market_price as number | string | null)
  return {
    volume,
    priceDate: dataIso(typeof row.price_date === 'string' ? row.price_date : null),
    marketPrice: preco != null && preco > 0 ? preco : null,
  }
}
