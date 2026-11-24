/**
 * Recorte de FIIs para o hub /fiis. Sai do mesmo ranking de dividend yield
 * que o gráfico /graficos#fiis: só fundo imobiliário, com cotação, data de
 * pregão e DY de 12 meses até 50%. Sem linha que passe no filtro, a lista
 * fica vazia. A página não completa com número inventado.
 */
import { MONTHS_PT } from './format.ts'
import { DY_TETO, pct2, pareceFii, type LinhaFii } from './graficos.ts'
import { nomeDaEmpresa } from './nomeB3.ts'

export const FIIS_NA_LISTA = 12

export interface FiiPublicado {
  ticker: string
  nome: string
  dy: string
  preco: string
  data: string
  dataIso: string
}

export interface ListaFiis {
  itens: FiiPublicado[]
  fonte: string
  dataIso: string | null
}

const VAZIA: ListaFiis = { itens: [], fonte: '', dataIso: null }

const nfBrl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function num(v: number | string | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function dataCurta(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}

function nomeDoFii(bruto: string, ticker: string): string {
  const limpo = bruto.replace(/\s+/g, ' ').trim().replace(/^FII\s+/i, '')
  return nomeDaEmpresa(limpo) || ticker
}

export function listaDeFiis(rows: readonly LinhaFii[] | null, limite = FIIS_NA_LISTA): ListaFiis {
  if (!rows || limite < 1) return VAZIA
  const uteis: { ticker: string, nome: string, dy: number, preco: number, dataIso: string }[] = []
  for (const row of rows) {
    const ticker = String(row.ticker ?? '').toUpperCase()
    const name = String(row.name ?? '')
    if (row.type && row.type !== 'REIT') continue
    if (!pareceFii(ticker, name)) continue
    const dy = num(row.dividend_yield)
    if (dy == null || dy <= 0 || dy > DY_TETO) continue
    const preco = num(row.market_price) ?? num(row.close)
    if (preco == null || preco <= 0) continue
    const dataIso = String(row.price_date ?? '')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataIso)) continue
    uteis.push({ ticker, nome: nomeDoFii(name, ticker), dy, preco, dataIso })
  }
  uteis.sort((a, b) => b.dy - a.dy || (a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0))
  const top = uteis.slice(0, limite)
  if (!top.length) return VAZIA
  const datas = [...new Set(top.map((t) => t.dataIso))].sort()
  const min = datas[0]!
  const max = datas[datas.length - 1]!
  const periodo = min === max ? dataCurta(max) : `${dataCurta(min)} a ${dataCurta(max)}`
  const pregao = min === max ? `Pregão de ${periodo}` : `Pregões de ${periodo}`
  return {
    itens: top.map((t) => ({
      ticker: t.ticker,
      nome: t.nome,
      dy: pct2(t.dy * 100),
      preco: nfBrl.format(t.preco),
      data: dataCurta(t.dataIso),
      dataIso: t.dataIso,
    })),
    fonte: `Fonte: avisos de proventos da B3 e Brapi (B3). ${pregao}.`,
    dataIso: max,
  }
}
