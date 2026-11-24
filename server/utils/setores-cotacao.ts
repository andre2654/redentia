/**
 * Cotação e DY de 12 meses para /setores/{slug}.
 *
 * Cotação: GET /tickers/{T}, market_price com price_date.
 * DY: GET /fundamentals/{T}/overview, key_statistics.dividend_yield
 * com key_statistics.updated_at. Sem a data, o número não volta.
 */
import { nomeDaEmpresa } from '../../app/utils/nomeB3.ts'
import type { CotacaoDeSetor } from '../../app/utils/setoresLista.ts'

function backendBase(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}

function isoDia(v: unknown): string | null {
  const d = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
}

interface PerfilResposta {
  data?: {
    name?: string | null
    market_price?: number | null
    price_date?: string | null
  }
}

interface OverviewResposta {
  data?: {
    key_statistics?: {
      dividend_yield?: string | number | null
      updated_at?: string | null
    } | null
  }
}

export const fetchCotacaoSetor = defineCachedFunction(
  async (ticker: string): Promise<CotacaoDeSetor> => {
    const baseURL = backendBase()
    const headers = { Accept: 'application/json' }
    const [perfil, overview] = await Promise.all([
      $fetch<PerfilResposta>(`/tickers/${encodeURIComponent(ticker)}`, { baseURL, headers, timeout: 8_000 }).catch(() => null),
      $fetch<OverviewResposta>(`/fundamentals/${encodeURIComponent(ticker)}/overview`, { baseURL, headers, timeout: 8_000 }).catch(() => null),
    ])
    if (!perfil?.data && !overview?.data) throw new Error(`sem leitura de ${ticker}`)
    const priceDate = isoDia(perfil?.data?.price_date)
    const preco = Number(perfil?.data?.market_price)
    const temPreco = !!priceDate && Number.isFinite(preco) && preco > 0
    const dyDate = isoDia(overview?.data?.key_statistics?.updated_at)
    const dy = Number(overview?.data?.key_statistics?.dividend_yield)
    const temDy = !!dyDate && Number.isFinite(dy)
    const bruto = String(perfil?.data?.name ?? '')
    const nome = bruto ? nomeDaEmpresa(bruto) : ''
    return {
      nome: nome && nome.toUpperCase() !== ticker ? nome : null,
      preco: temPreco ? preco : null,
      priceDate: temPreco ? priceDate : null,
      dy: temDy ? dy : null,
      dyDate: temDy ? dyDate : null,
    }
  },
  {
    name: 'setores-cotacao-v1',
    maxAge: 6 * 3600,
    swr: true,
    getKey: (ticker: string) => ticker,
  },
)

async function emFila(tickers: readonly string[], n: number, fn: (ticker: string) => Promise<void>) {
  let i = 0
  async function worker() {
    while (i < tickers.length) {
      const ticker = tickers[i]!
      i += 1
      await fn(ticker)
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, tickers.length) }, () => worker()))
}

export async function cotacoesDoSetor(tickers: readonly string[]): Promise<Record<string, CotacaoDeSetor>> {
  const out: Record<string, CotacaoDeSetor> = {}
  await emFila(tickers, 6, async (ticker) => {
    try {
      out[ticker] = await fetchCotacaoSetor(ticker)
    } catch {
      out[ticker] = { nome: null, preco: null, priceDate: null, dy: null, dyDate: null }
    }
  })
  return out
}
