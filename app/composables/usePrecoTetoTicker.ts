/**
 * SSR de /calculadora/preco-teto/{TICKER}.
 *
 * Mesma política do /asset e do /dividendos: 404 é veredito (não existe, ou
 * existe e não tem LPA nem dividendo), 410 é papel que saiu da B3, 301 é
 * código trocado, qualquer outra falha é 503. Um 404 por backend fora
 * tiraria papel vivo do índice.
 */
import type { ProventoRow } from '~/utils/proventos'
import { overviewDyOf, parseProventos } from '~/utils/proventos'
import {
  TIPOS_PRECO_TETO,
  dividendoParaBazin,
  lpaDeOverview,
  montarPrecoTeto,
  paginaPrecoTetoExiste,
  sectorPlEfetivo,
  vpaDeOverview,
  type PrecoTetoView,
} from '~/utils/preco-teto-pagina'
import {
  delistedAtOf,
  delistedAtOfError,
  delistedError,
  isDelistedEnvelope,
  renamedError,
  renamedTargetOf,
} from '~/utils/delisted'
import { acaoFetchDividends, acaoFetchOverview, acaoFetchProfile } from '~/services/acao'

interface SectorRow { slug?: string; name?: string }

const HORA = 60 * 60 * 1000
let sectorsCache: { at: number; rows: SectorRow[] } | null = null
const peCache = new Map<string, { at: number; pe: number | null }>()

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

const json = { headers: { Accept: 'application/json' }, timeout: 12_000 }

/** Média de P/L do setor, a mesma cadeia da calculadora. Cache de 1 h por nome. */
async function mediaDoSetor(base: string, sectorName: string | null): Promise<number | null> {
  if (!sectorName) return null
  const hit = peCache.get(sectorName)
  if (hit && Date.now() - hit.at < HORA) return hit.pe
  let pe: number | null = null
  try {
    if (!sectorsCache || Date.now() - sectorsCache.at > HORA) {
      const resp = await $fetch<{ data?: SectorRow[] }>(`${base}/sectors`, json)
      sectorsCache = { at: Date.now(), rows: Array.isArray(resp?.data) ? resp.data : [] }
    }
    const target = sectorName.toLowerCase().trim()
    const slug = target.replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const found = sectorsCache.rows.find((s) => s.name?.toLowerCase() === target || s.slug === target || s.slug === slug)
    if (found?.slug) {
      const resp = await $fetch<{ aggregates?: { avg_trailing_pe?: number | null }; data?: { trailing_pe?: number | null }[] }>(
        `${base}/sectors/${found.slug}/tickers?limit=200`,
        json,
      )
      const avg = Number(resp?.aggregates?.avg_trailing_pe)
      if (Number.isFinite(avg) && avg > 0) pe = avg
      else {
        const pes = (resp?.data ?? [])
          .map((t) => Number(t?.trailing_pe))
          .filter((n) => Number.isFinite(n) && n > 0 && n < 100)
        if (pes.length) pe = pes.reduce((a, b) => a + b, 0) / pes.length
      }
    }
  } catch {
    pe = null
  }
  peCache.set(sectorName, { at: Date.now(), pe })
  return pe
}

async function loadPrecoTeto(base: string, ticker: string): Promise<PrecoTetoView> {
  let res: Awaited<ReturnType<typeof acaoFetchProfile>>
  try {
    res = await acaoFetchProfile(base, ticker)
  } catch (e) {
    const status = statusOf(e)
    if (status === 404) throw createError({ statusCode: 404, statusMessage: `Ativo ${ticker} não encontrado` })
    if (status === 410) throw delistedError(ticker, delistedAtOfError(e))
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }
  if (isDelistedEnvelope(res)) throw delistedError(ticker, delistedAtOf(res))
  const renamedTo = renamedTargetOf(res, ticker)
  if (renamedTo) throw renamedError(ticker, renamedTo)

  const profile = res.data
  if (!TIPOS_PRECO_TETO.has(profile.type)) {
    throw createError({ statusCode: 404, statusMessage: `Preço teto não se aplica a ${ticker}` })
  }
  const preco = Number(profile.market_price)
  if (!(preco > 0)) {
    throw createError({ statusCode: 404, statusMessage: `${ticker} não tem cotação` })
  }

  const [overviewR, dividendsR] = await Promise.allSettled([
    acaoFetchOverview(base, ticker),
    acaoFetchDividends(base, ticker),
  ])
  if (overviewR.status === 'rejected' && statusOf(overviewR.reason) === 410) {
    throw delistedError(ticker, delistedAtOfError(overviewR.reason))
  }
  if (dividendsR.status === 'rejected' && statusOf(dividendsR.reason) === 410) {
    throw delistedError(ticker, delistedAtOfError(dividendsR.reason))
  }

  const overviewFalhou = overviewR.status === 'rejected' && statusOf(overviewR.reason) !== 404
  const overview = overviewR.status === 'fulfilled' ? overviewR.value?.data ?? null : null
  let rows: ProventoRow[] | null
  if (dividendsR.status === 'fulfilled') rows = parseProventos(dividendsR.value?.data)
  else if (statusOf(dividendsR.reason) === 404) rows = []
  else rows = null

  const lpa = lpaDeOverview(overview)
  const div = dividendoParaBazin({ overviewDy: overviewDyOf(overview), price: preco, rows })

  // Sem LPA e sem saber o dividendo: não dá para distinguir página fina de
  // backend fora. 503, nunca 404.
  if ((overviewFalhou || rows == null) && !paginaPrecoTetoExiste(lpa, div.valor)) {
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }
  if (!paginaPrecoTetoExiste(lpa, div.valor)) {
    throw createError({ statusCode: 404, statusMessage: `${ticker} não tem LPA nem dividendo para preço teto` })
  }

  const pe = sectorPlEfetivo(lpa, lpa > 0 ? await mediaDoSetor(base, profile.sector) : null)
  const dyOficial = overviewDyOf(overview)
  const view = montarPrecoTeto({
    ticker,
    nomeBruto: profile.name,
    fiiTradingName: overview?.scrape_extras?.fii?.trading_name ?? null,
    tipo: profile.type,
    preco,
    priceDate: profile.price_date,
    setorBruto: profile.sector,
    lpa,
    vpa: vpaDeOverview(overview),
    dividendo: div.valor,
    dividendoFonte: div.fonte,
    dyPct: div.dyPct,
    sectorPL: pe.valor,
    sectorPLFonte: pe.fonte,
    temPaginaDividendos: (rows != null && rows.length > 0) || dyOficial != null,
  })
  if (!view) {
    throw createError({ statusCode: 404, statusMessage: `${ticker} não tem LPA nem dividendo para preço teto` })
  }
  return view
}

export async function usePrecoTetoTicker(ticker: string) {
  const config = useRuntimeConfig()
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'
  const { data, error } = await useAsyncData<PrecoTetoView>(
    `preco-teto:${ticker}`,
    () => loadPrecoTeto(import.meta.server ? serverBase : clientBase, ticker),
  )
  return { data, error }
}
