/**
 * Empresas com aviso de JCP na mesma base da agenda e de /dividendos/{TICKER}.
 * Só entra quem o feed já traz com rótulo de JCP, data de pagamento e valor
 * positivo. Sem data, o ticker não aparece. O valor em reais não sai daqui:
 * a página não repete número de provento fora do aviso citado em /dividendos.
 */
import type { ItemBruto } from './agendaDividendos.ts'
import { NOTA_CVM, dataCurtaAgenda, rotuloDoAviso } from './agendaDividendos.ts'
import { nomeDaEmpresa } from './nomeB3.ts'
import { proximoPregao } from './pregao.ts'
import { symbolShape } from './tickerClass.ts'

export const LIMITE_PAGADORES_JCP = 12

export const FONTE_PAGADORES_JCP =
  'Datas dos avisos de proventos da B3, a mesma base das páginas de dividendos e da agenda. Sem data de pagamento no aviso, a empresa não entra.'

export interface PagadorJcp {
  ticker: string
  nome: string
  rotulo: string
  pagamento: string
  pagamentoTexto: string
  dataCom: string | null
  dataComTexto: string | null
  dataEx: string | null
  dataExTexto: string
  href: string
}

export interface RespostaPagadoresJcp {
  ok: boolean
  pagadores: PagadorJcp[]
  fonte: string
  nota: string
}

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function avisoEhJcp(label: string): boolean {
  const rotulo = rotuloDoAviso(label)
  if (rotulo === 'JCP' || rotulo === 'Dividendo + JCP' || rotulo === 'JCP + Dividendo') return true
  const n = semAcento(label)
  return n.includes('jcp') || n.includes('juros sobre capital')
}

function tipoDeAcao(type: string): boolean {
  const t = type.toUpperCase()
  return t !== 'REIT' && t !== 'BDR' && t !== 'ETF'
}

function distancia(iso: string, hoje: string): number {
  return Math.abs(Date.parse(`${iso}T12:00:00Z`) - Date.parse(`${hoje}T12:00:00Z`))
}

function prefere(candidato: ItemBruto, atual: ItemBruto, hoje: string): boolean {
  const dc = distancia(candidato.payment_date, hoje)
  const da = distancia(atual.payment_date, hoje)
  if (dc !== da) return dc < da
  const futuroC = candidato.payment_date >= hoje ? 0 : 1
  const futuroA = atual.payment_date >= hoje ? 0 : 1
  if (futuroC !== futuroA) return futuroC < futuroA
  if (!!candidato.last_date_prior !== !!atual.last_date_prior) return !!candidato.last_date_prior
  return candidato.label < atual.label
}

function paraPagador(item: ItemBruto): PagadorJcp {
  const ticker = item.ticker.toUpperCase()
  const nome = nomeDaEmpresa(item.name) || ticker
  const dataCom = item.last_date_prior
  const dataEx = dataCom ? proximoPregao(dataCom) : null
  return {
    ticker,
    nome,
    rotulo: rotuloDoAviso(item.label),
    pagamento: item.payment_date,
    pagamentoTexto: dataCurtaAgenda(item.payment_date),
    dataCom,
    dataComTexto: dataCom ? dataCurtaAgenda(dataCom) : null,
    dataEx,
    dataExTexto: dataEx ? dataCurtaAgenda(dataEx) : (dataCom ? 'Pregão seguinte à data com' : 'Não informada'),
    href: `/dividendos/${ticker}`,
  }
}

/**
 * Um aviso por ticker: o de pagamento mais próximo de `hoje`. A lista que
 * sai está em ordem de data, no máximo LIMITE_PAGADORES_JCP. Não ordena
 * por valor.
 */
export function pagadoresDeJcp(
  itens: readonly ItemBruto[],
  hoje: string,
  limite = LIMITE_PAGADORES_JCP,
): PagadorJcp[] {
  const porTicker = new Map<string, ItemBruto>()
  for (const item of itens) {
    if (!avisoEhJcp(item.label) || !tipoDeAcao(item.type)) continue
    const ticker = item.ticker.trim().toUpperCase()
    if (!ticker || symbolShape(ticker) !== 'b3') continue
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.payment_date)) continue
    if (!Number.isFinite(item.rate) || item.rate <= 0) continue
    const candidato = { ...item, ticker }
    const atual = porTicker.get(ticker)
    if (!atual || prefere(candidato, atual, hoje)) porTicker.set(ticker, candidato)
  }
  return [...porTicker.values()]
    .sort((a, b) => distancia(a.payment_date, hoje) - distancia(b.payment_date, hoje) || a.ticker.localeCompare(b.ticker))
    .slice(0, Math.max(0, limite))
    .sort((a, b) => a.payment_date.localeCompare(b.payment_date) || a.ticker.localeCompare(b.ticker))
    .map(paraPagador)
}

export function respostaVaziaPagadores(ok: boolean): RespostaPagadoresJcp {
  return { ok, pagadores: [], fonte: FONTE_PAGADORES_JCP, nota: NOTA_CVM }
}
