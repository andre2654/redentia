/**
 * Leitura de /acoes-que-pagam-dividendos. A conta mora em
 * app/utils/acoesDividendos.ts. Aqui só entra o GET: o ranking de DY de
 * ações, a lista de pagadores e o histórico de quem pode entrar.
 * Cache de 1 h só quando a leitura fecha. Falha não grava buraco.
 */
import { spISODate } from '../../app/utils/format.ts'
import {
  montarAcoesDividendos,
  resultadoVazio,
  tickersParaHistorico,
  type CadastroDividendoBruto,
  type PagadorDividendoBruto,
  type RankingDividendoBruto,
  type ResultadoAcoesDividendos,
} from '../../app/utils/acoesDividendos.ts'

const CONCORRENCIA = 8
const INTERVALO_MS = 40

function base(): string {
  return String(useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api').replace(/\/+$/, '')
}

function statusDaResposta(e: unknown): number | null {
  const err = e as { statusCode?: number, status?: number, response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

async function historicoDe(
  raiz: string,
  ticker: string,
  reservar: () => Promise<void>,
): Promise<unknown[] | null> {
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    await reservar()
    try {
      const res = await $fetch<{ data?: unknown[] }>(`/dividends/${encodeURIComponent(ticker)}`, {
        baseURL: raiz,
        timeout: 12_000,
      })
      return Array.isArray(res?.data) ? res.data : []
    } catch (e) {
      const status = statusDaResposta(e)
      if (status === 404 || status === 410) return []
      if (status === 429) await new Promise((r) => setTimeout(r, 1_200))
      if (tentativa === 0) continue
      return null
    }
  }
  return null
}

async function historicosEmFila(
  raiz: string,
  tickers: readonly string[],
): Promise<{ historicos: Record<string, unknown[] | null>, falhas: number }> {
  const historicos: Record<string, unknown[] | null> = {}
  let cursor = 0
  let falhas = 0
  let proximo = Date.now()
  function reservar(): Promise<void> {
    const agora = Date.now()
    const quando = Math.max(agora, proximo)
    proximo = quando + INTERVALO_MS
    const espera = quando - agora
    return espera > 0 ? new Promise((r) => setTimeout(r, espera)) : Promise.resolve()
  }
  async function worker() {
    while (cursor < tickers.length) {
      const ticker = tickers[cursor++]!
      const rows = await historicoDe(raiz, ticker, reservar)
      historicos[ticker] = rows
      if (rows == null) falhas++
    }
  }
  const n = Math.min(CONCORRENCIA, tickers.length)
  if (n > 0) await Promise.all(Array.from({ length: n }, () => worker()))
  return { historicos, falhas }
}

async function lerListas(raiz: string): Promise<{
  ranking: RankingDividendoBruto[] | null
  pagadores: PagadorDividendoBruto[] | null
  cadastro: CadastroDividendoBruto[] | null
}> {
  const [ranking, pagadores, cadastro] = await Promise.all([
    $fetch<{ data?: RankingDividendoBruto[] }>('/rankings/top-dividend-yield?type=STOCK&limit=100', {
      baseURL: raiz,
      timeout: 15_000,
    }).then((res) => (Array.isArray(res?.data) ? res.data : [])).catch(() => null),
    $fetch<{ data?: PagadorDividendoBruto[] }>('/dividends/tickers', {
      baseURL: raiz,
      timeout: 15_000,
    }).then((res) => (Array.isArray(res?.data) ? res.data : [])).catch(() => null),
    $fetch<{ data?: CadastroDividendoBruto[] }>('/tickers-full', {
      baseURL: raiz,
      timeout: 20_000,
    }).then((res) => (Array.isArray(res?.data) ? res.data : [])).catch(() => null),
  ])
  return { ranking, pagadores, cadastro }
}

export const fetchAcoesDividendos = defineCachedFunction(
  async (): Promise<ResultadoAcoesDividendos> => {
    const hoje = spISODate()
    const raiz = base()
    const listas = await lerListas(raiz)
    if (!listas.ranking) return resultadoVazio(hoje)
    const tickers = tickersParaHistorico(listas)
    const { historicos } = await historicosEmFila(raiz, tickers)
    return montarAcoesDividendos({ ...listas, historicos, today: hoje })
  },
  {
    name: 'acoes-dividendos-v1',
    maxAge: 3600,
    swr: true,
    getKey: () => 'all',
    validate: (entry) => entry.value?.ok === true && entry.value?.incompleto === false && entry.value.rankingTotal > 0,
  },
)
