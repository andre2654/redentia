/**
 * Dados de /imposto-de-renda/{TICKER}. A página educativa existe para os 50
 * mais líquidos. O perfil decide a classe. Os proventos vêm do mesmo
 * GET /dividends do /dividendos. Sem histórico, a página segue e diz isso.
 */
import type { PaginaImpostoRenda } from '~/utils/impostoRendaPagina'
import { parseProventos } from '~/utils/proventos'
import { spISODate } from '~/utils/format'
import {
  cnpjDoCadastro,
  classeDeImpostoRenda,
  montarPaginaImpostoRenda,
} from '~/utils/impostoRendaPagina'
import { tickerNaListaImpostoRenda } from '~/utils/impostoRendaLiquidos'
import { nomeDaEmpresa, nomeDoBdr } from '~/utils/nomeB3'
import {
  delistedAtOf,
  delistedAtOfError,
  delistedError,
  isDelistedEnvelope,
  renamedError,
  renamedTargetOf,
} from '~/utils/delisted'
import { acaoFetchDividends, acaoFetchOverview, acaoFetchProfile } from '~/services/acao'

export interface ImpostoRendaPayload {
  pagina: PaginaImpostoRenda
  /** data do provento mais recente listado, quando há linha */
  dataDate: string | null
}

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

async function loadImpostoRenda(base: string, ticker: string): Promise<ImpostoRendaPayload> {
  if (!tickerNaListaImpostoRenda(ticker)) {
    throw createError({ statusCode: 404, statusMessage: 'Ativo não encontrado' })
  }
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
  if (renamedTo) {
    throw renamedError(ticker, renamedTo, tickerNaListaImpostoRenda(renamedTo) ? 'mesma' : 'asset')
  }
  const profile = res.data
  const [overviewR, dividendsR] = await Promise.allSettled([
    acaoFetchOverview(base, ticker),
    acaoFetchDividends(base, ticker),
  ])
  if (dividendsR.status === 'rejected' && statusOf(dividendsR.reason) === 410) {
    throw delistedError(ticker, delistedAtOfError(dividendsR.reason))
  }
  const overview = overviewR.status === 'fulfilled' ? overviewR.value?.data ?? null : null
  const se = overview?.scrape_extras
  const classe = classeDeImpostoRenda({
    assetType: se?.asset_type,
    profileType: profile.type,
    nomeB3: profile.name,
  })
  const nome = (classe === 'bdr' ? nomeDoBdr(se?.identity?.company_name) : null)
    ?? nomeDaEmpresa(profile.name, se?.fii?.trading_name ?? null)
  const rows = dividendsR.status === 'fulfilled' ? parseProventos(dividendsR.value?.data) : null
  const hoje = spISODate()
  const pagina = montarPaginaImpostoRenda({
    ticker,
    nome,
    classe,
    cnpj: cnpjDoCadastro(se?.identity?.cnpj ?? se?.etf?.cnpj),
    rows,
    hoje,
  })
  const datas = pagina.proventos.linhas.length
    ? (rows ?? []).map((r) => r.payDate).filter((d) => d.startsWith(hoje.slice(0, 4)) && d <= hoje).sort()
    : []
  const dataDate = datas.at(-1) ?? null
  return { pagina, dataDate }
}

export async function useImpostoRendaTicker(ticker: string) {
  const config = useRuntimeConfig()
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'
  const { data, error } = await useAsyncData<ImpostoRendaPayload>(
    `imposto-renda:${ticker}`,
    () => loadImpostoRenda(import.meta.server ? serverBase : clientBase, ticker),
  )
  return { data, error }
}
