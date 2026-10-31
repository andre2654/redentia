/**
 * Dados de /quanto-rende/{TICKER}. Mesmas fontes de /dividendos:
 * GET /tickers/{t} (cotação), GET /fundamentals/{t}/overview (DY oficial) e
 * GET /dividends/{t} (histórico). A soma de 12 meses é proventos12m: data com,
 * só renda, amortização fora.
 *
 * Existência: símbolo inválido 404 antes do fetch (a página); deslistado 410;
 * código trocado 301; sem renda em 12 meses 404; cotação ou histórico
 * indisponíveis 503. Sem renda a página não existe: thin content com yield
 * zero não entra no índice.
 */
import type { NuFaqItem } from '~/types/market'
import type { RenamedRota } from '~/utils/delisted'
import { dinheiroFmt, diaCurto, rendimentoFmt, qtdFmt, seoQuantoRendeTicker, VALOR_PADRAO, quantoRendeProventos } from '~/utils/quanto-rende'

export interface QuantoRendeTickerPayload {
  ticker: string
  nome: string
  unidade: 'ação' | 'cota' | 'BDR'
  unidadePlural: string
  isFii: boolean
  isBdr: boolean
  preco: number
  proventoPorUnidade: number
  count12: number
  cap12: number
  dyOficial: number | null
  dyMatchesSum: boolean
  fontePreco: string
  fonteProventos: string
  fonteDy: string | null
  hoje: string
  dataDate: string | null
  seo: { title: string; description: string }
  faq: NuFaqItem[]
}

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

function isoDia(v: unknown): string | null {
  const s = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}

async function rotaDestino(base: string, novo: string): Promise<RenamedRota> {
  try {
    const [profileR, divR] = await Promise.allSettled([
      acaoFetchProfile(base, novo),
      acaoFetchDividends(base, novo),
    ])
    if (profileR.status !== 'fulfilled' || isDelistedEnvelope(profileR.value)) return 'asset'
    const profile = profileR.value.data
    if (profile.type !== 'STOCK' && profile.type !== 'REIT' && profile.type !== 'BDR') return 'asset'
    if (!(profile.market_price != null && profile.market_price > 0)) return 'asset'
    if (divR.status !== 'fulfilled') return 'mesma'
    const income = proventos12m(parseProventos(divR.value?.data)).income12
    return income > 0 ? 'mesma' : 'asset'
  } catch {
    return 'mesma'
  }
}

async function loadQuantoRende(base: string, ticker: string): Promise<QuantoRendeTickerPayload> {
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
  if (renamedTo) throw renamedError(ticker, renamedTo, await rotaDestino(base, renamedTo))

  const profile = res.data
  if (profile.type !== 'STOCK' && profile.type !== 'REIT' && profile.type !== 'BDR') {
    throw createError({ statusCode: 404, statusMessage: `${ticker} não tem página de quanto rende` })
  }

  const [overviewR, dividendsR] = await Promise.allSettled([
    acaoFetchOverview(base, ticker),
    acaoFetchDividends(base, ticker),
  ])
  if (dividendsR.status === 'rejected') {
    if (statusOf(dividendsR.reason) === 410) throw delistedError(ticker, delistedAtOfError(dividendsR.reason))
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }

  const overview = overviewR.status === 'fulfilled' ? overviewR.value?.data ?? null : null
  const se = overview?.scrape_extras ?? null
  const isFii = se?.asset_type === 'fii' || profile.type === 'REIT'
  const isBdr = !isFii && (se?.asset_type === 'bdr' || profile.type === 'BDR')
  const bdrName = isBdr ? nomeDoBdr(se?.identity?.company_name) : null
  const nome = bdrName ?? nomeDaEmpresa(profile.name, se?.fii?.trading_name ?? null)
  const price = profile.market_price
  if (price == null || !(price > 0)) {
    throw createError({ statusCode: 503, statusMessage: 'Cotação temporariamente indisponível' })
  }

  const rows = parseProventos(dividendsR.value?.data)
  const today = spISODate()
  const w = proventos12m(rows, today)
  if (!(w.income12 > 0)) {
    throw createError({ statusCode: 404, statusMessage: `${ticker} não pagou proventos nos últimos 12 meses` })
  }
  const site = resolveSiteDy({ overviewDy: overviewDyOf(overview), price, rows, today })
  const conta = quantoRendeProventos(VALOR_PADRAO, price, w.income12)
  if (!conta) throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })

  const unidade = isFii ? 'cota' : isBdr ? 'BDR' : 'ação'
  const unidadePlural = isFii ? 'cotas' : isBdr ? 'BDRs' : 'ações'
  const priceDate = isoDia(profile.price_date)
  const ovDatas = overview as { key_statistics?: { updated_at?: unknown }; financial_data?: { updated_at?: unknown } } | null
  const dyAsOf = isoDia(ovDatas?.key_statistics?.updated_at) ?? isoDia(ovDatas?.financial_data?.updated_at)
  const fontePreco = `Fonte: Brapi (B3)${priceDate ? `, pregão de ${diaCurto(priceDate)}` : ''}.`
  const fonteProventos = `Fonte: avisos de proventos da B3, pela data com até ${diaCurto(today)}.`
  const fonteDy = site.value != null && site.value > 0
    ? `Fonte: StatusInvest${dyAsOf ? `, em ${diaCurto(dyAsOf)}` : ''}.`
    : null
  const kind = isFii ? 'rendimentos' : 'proventos'
  const ev = isFii ? (w.events12 === 1 ? 'rendimento' : 'rendimentos') : w.events12 === 1 ? 'provento' : 'proventos'
  const dyOficial = site.basis === 'oficial' && site.value != null && site.value > 0 ? site.value : null

  const exemplo = `${dinheiroFmt(VALOR_PADRAO)} em ${ticker} compram ${qtdFmt(conta.quantidade)} ${unidadePlural} a ${dinheiroFmt(price)}. No último ano, essa quantidade teria recebido ${dinheiroFmt(conta.proventos)} em ${kind}, ${rendimentoFmt(conta.rendimentoPct)} do valor. ${fontePreco} ${fonteProventos}`
  const dyResposta = dyOficial != null && site.sumMatches
    ? `Sim, neste papel os dois fecham: ${rendimentoFmt(dyOficial)}. ${fonteDy}`
    : dyOficial != null
      ? `O dividend yield oficial de 12 meses é ${rendimentoFmt(dyOficial)}. ${fonteDy} A conta desta página usa a soma dos pagamentos como foram pagos, ${rendimentoFmt(conta.rendimentoPct)} sobre a cotação, e os dois números não fecham. A causa varia: desdobramento na janela, cotação que andou, ou fonte diferente. A página não escolhe uma causa.`
      : `O dividend yield oficial de 12 meses está indisponível. O percentual desta página é a soma dos pagamentos dividida pela cotação: ${rendimentoFmt(conta.rendimentoPct)}. ${fonteProventos} ${fontePreco}`

  const faq: NuFaqItem[] = [
    {
      q: `Quanto R$ 1.000 em ${ticker} teriam recebido de ${kind}?`,
      a: `${exemplo} Rentabilidade passada não garante rentabilidade futura.`,
    },
    {
      q: `O rendimento de ${ticker} é o dividend yield?`,
      a: dyResposta,
    },
    {
      q: 'Rentabilidade passada garante a futura?',
      a: `Não. Rentabilidade passada não garante rentabilidade futura. Os ${w.events12} ${ev} dos últimos 12 meses são o que foi anunciado, com data com até ${diaCurto(today)}. ${fonteProventos} O próximo pagamento depende de lucro, caixa e de nova decisão. Não é recomendação de compra ou venda.`,
    },
  ]

  return {
    ticker,
    nome,
    unidade,
    unidadePlural,
    isFii,
    isBdr,
    preco: price,
    proventoPorUnidade: w.income12,
    count12: w.events12,
    cap12: w.capital12,
    dyOficial,
    dyMatchesSum: site.sumMatches,
    fontePreco,
    fonteProventos,
    fonteDy,
    hoje: today,
    dataDate: priceDate,
    seo: seoQuantoRendeTicker({
      ticker,
      valor: VALOR_PADRAO,
      preco: price,
      quantidade: conta.quantidade,
      proventos: conta.proventos,
      rendimentoPct: conta.rendimentoPct,
      unidadePlural,
    }),
    faq,
  }
}

export async function useQuantoRende(ticker: string) {
  const config = useRuntimeConfig()
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'
  const { data, error } = await useAsyncData<QuantoRendeTickerPayload>(
    `quanto-rende:${ticker}`,
    () => loadQuantoRende(import.meta.server ? serverBase : clientBase, ticker),
  )
  return { data, error }
}
