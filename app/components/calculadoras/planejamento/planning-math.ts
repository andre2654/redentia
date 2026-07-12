/**
 * PR10 — matemática do Planejamento Patrimonial, porte EXATO do backend da
 * página antiga (Frontend/server/utils/calculators.ts → calculatePlanning +
 * calculateSingleStockReturn, e Frontend/server/utils/market.ts → cleaners).
 * A única diferença é ONDE roda: aqui a simulação executa no client contra o
 * proxy same-origin /api/backend (mesmos endpoints Laravel que o antigo
 * getMarketData consumia: /tickers/{t}/prices?mode=full e /dividends/{t}).
 * Nenhuma constante, peso ou fórmula foi alterada.
 */

export type PlanningStrategy = 'rentabilidade' | 'seguranca'

export interface PlanningChartPoint {
  date: string
  value: number
  timestamp: number
}

export interface PlanningRecommendedAsset {
  ticker: string
  category: string
  cagr: number
  monthlyRate: number
  periodYears: number
  totalReturn: number
  totalDividends: number
  weight: number
}

export interface PlanningResult {
  strategy: PlanningStrategy
  goalValue: number
  monthlyContribution: number
  monthsToGoal: number
  targetDateLabel: string
  totalInvestedUntilGoal: number
  estimatedFinalValue: number
  estimatedProfit: number
  monthlyReturnRate: number
  recommendedAssets: PlanningRecommendedAsset[]
  historicalFinalValue: number
  historicalInvested: number
  historicalProfit: number
  historicalYears: number
  chartData: PlanningChartPoint[]
}

const MARKET_FETCH_TIMEOUT_MS = 15_000

// --- Constants for Planning (verbatim da página antiga) ---
const planningUniverse = {
  seguranca: {
    fixedIncomeAnnualRate: 0.1,
  },
}

// --- Cleaners (porte de market.ts: cleanChart / cleanDividends) ---

function cleanChart(data: unknown) {
  let arr: unknown = data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (Array.isArray(data)) arr = data
    else if (Array.isArray(d.data)) arr = d.data
    else if (Array.isArray(d.prices)) arr = d.prices
    else if (Array.isArray(d.results)) arr = d.results
    else if (Array.isArray(d.history)) arr = d.history
  }
  if (!Array.isArray(arr)) return []
  return (arr as Record<string, unknown>[])
    .map((p) => ({
      date: (p.date || p.created_at || p.time || p.price_at) as string,
      close: (p.close ?? p.price ?? p.value ?? p.amount ?? p.market_price) as number | string,
    }))
    .filter((p) => p.close !== undefined && p.close !== null)
}

function cleanDividends(data: unknown) {
  let arr: unknown = data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (Array.isArray(data)) arr = data
    else if (Array.isArray(d.data)) arr = d.data
    else if (Array.isArray(d.dividends)) arr = d.dividends
    else if (Array.isArray(d.results)) arr = d.results
  }
  if (!Array.isArray(arr)) return []
  return (arr as Record<string, unknown>[])
    .map((d) => ({
      date: (d.payment_date || d.date || d.approved_date || d.last_date_prior) as string,
      value: (d.value || d.amount || d.rate || d.value_cash) as number | string,
      type: (d.type_description || d.type || d.label) as string,
    }))
    .filter((d) => d.value !== undefined && d.value !== null)
    .reverse()
}

// --- Helpers (verbatim de calculators.ts) ---

function computeMonthsToGoal(goal: number, monthly: number, monthlyRate: number) {
  if (monthlyRate <= 0) {
    if (monthly <= 0) return 9999
    return Math.ceil(goal / monthly)
  }
  // n = log((FV*r/PMT) + 1) / log(1+r)
  const num = (goal * monthlyRate) / monthly + 1
  if (num <= 0) return 9999
  const n = Math.log(num) / Math.log(1 + monthlyRate)
  return Math.ceil(n)
}

function computeProjectionTotals(monthly: number, months: number, monthlyRate: number) {
  let balance = 0
  let totalInvested = 0
  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthly
    totalInvested += monthly
  }
  return { finalValue: balance, totalInvested }
}

function buildProjectionChart(months: number, monthly: number, rate: number): PlanningChartPoint[] {
  const data: PlanningChartPoint[] = []
  let balance = 0
  const now = new Date()

  for (let i = 0; i <= months; i++) {
    if (i > 0) {
      balance = balance * (1 + rate) + monthly
    }

    // Sample points
    if (months > 50 && i % Math.ceil(months / 50) !== 0 && i !== months) continue

    const date = new Date(now)
    date.setMonth(date.getMonth() + i)

    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: balance,
      timestamp: date.getTime(),
    })
  }
  return data
}

// --- Simulação com dados reais (porte de calculateSingleStockReturn) ---

async function calculateSingleStockReturn(
  base: string,
  ticker: string,
  initialInvestment: number,
  monthlyInvestment: number,
  periodYears: number,
  reinvestDividends: boolean,
) {
  try {
    // Fetch price history (mesmo endpoint do getMarketData(ticker,'chart',{period:'full'}))
    const priceRaw = await $fetch(`${base}/tickers/${ticker}/prices?mode=full`, {
      headers: { Accept: 'application/json' },
      timeout: MARKET_FETCH_TIMEOUT_MS,
    })
    const priceHistory = cleanChart(priceRaw)

    if (!priceHistory || priceHistory.length === 0) return null

    // Fetch dividends
    let dividendsRaw: { date: string; value: number | string; type: string }[] = []
    if (reinvestDividends) {
      try {
        const divRaw = await $fetch(`${base}/dividends/${ticker}`, {
          headers: { Accept: 'application/json' },
          timeout: MARKET_FETCH_TIMEOUT_MS,
        })
        dividendsRaw = cleanDividends(divRaw)
      } catch {
        console.warn('Failed to fetch dividends for', ticker)
      }
    }

    // Normalize Prices
    const normalizedPrices = priceHistory
      .map((p) => {
        const priceDate = new Date(p.date)
        return {
          price_at: p.date,
          market_price: Number(p.close),
          priceDate,
        }
      })
      .filter(
        (p) =>
          Number.isFinite(p.market_price) &&
          p.market_price > 0 &&
          !isNaN(p.priceDate.getTime()),
      )
      .sort((a, b) => a.priceDate.getTime() - b.priceDate.getTime())

    if (!normalizedPrices.length) return null

    const latestEntry = normalizedPrices[normalizedPrices.length - 1]!
    const endDate = new Date(latestEntry.priceDate)
    const startDate = new Date(endDate)
    startDate.setFullYear(startDate.getFullYear() - periodYears)

    const relevantPrices = normalizedPrices.filter((p) => p.priceDate >= startDate)

    if (!relevantPrices.length) return null

    // Process Dividends
    const processedDividends = dividendsRaw
      .map((d) => ({
        payment_date: d.date,
        rate: parseFloat(String(d.value)) || 0,
        label: d.type || 'Dividendo',
        date: new Date(d.date),
      }))
      .filter(
        (d) =>
          Number.isFinite(d.rate) &&
          d.rate > 0 &&
          !isNaN(d.date.getTime()) &&
          d.date >= startDate &&
          d.date <= endDate,
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Simulation Loop
    let totalShares = 0
    let totalInvested = 0
    let totalDividends = 0

    const firstPrice = relevantPrices[0]!
    const initialPrice = firstPrice.market_price

    const initialShares = initialInvestment > 0 ? initialInvestment / initialPrice : 0
    totalShares = initialShares
    totalInvested = initialInvestment

    const firstDate = new Date(firstPrice.price_at)
    let lastMonthProcessed = firstDate.getMonth()
    let lastYearProcessed = firstDate.getFullYear()

    for (let i = 1; i < relevantPrices.length; i++) {
      const currentPrice = relevantPrices[i]!
      const priceDate = currentPrice.priceDate
      const priceValue = currentPrice.market_price
      const currentMonth = priceDate.getMonth()
      const currentYear = priceDate.getFullYear()

      // Monthly Contribution
      if (
        monthlyInvestment > 0 &&
        (currentMonth !== lastMonthProcessed || currentYear !== lastYearProcessed)
      ) {
        const newShares = monthlyInvestment / priceValue
        totalShares += newShares
        totalInvested += monthlyInvestment
        lastMonthProcessed = currentMonth
        lastYearProcessed = currentYear
      }

      // Reinvest Dividends
      if (reinvestDividends && processedDividends.length > 0) {
        const previousDate = relevantPrices[i - 1]!.priceDate
        const relevantDivs = processedDividends.filter(
          (d) => d.date > previousDate && d.date <= priceDate,
        )

        for (const div of relevantDivs) {
          const dividendValue = totalShares * div.rate
          totalDividends += dividendValue

          if (priceValue > 0) {
            const newShares = dividendValue / priceValue
            totalShares += newShares
          }
        }
      }
    }

    const finalValue = totalShares * relevantPrices[relevantPrices.length - 1]!.market_price

    return {
      ticker,
      totalInvested,
      finalValue,
      totalDividends,
      periodYears,
    }
  } catch (error) {
    console.error('Error calculating single stock return:', error)
    return null
  }
}

// Helper for Planning (verbatim: 1000 de base, sem aporte, 5 anos, reinveste)
async function simulateAssetPerformance(
  base: string,
  ticker: string,
  options: { reinvestDividends: boolean; categoryLabel: string },
) {
  try {
    const result = await calculateSingleStockReturn(
      base,
      ticker,
      1000, // Base investment for simulation
      0, // No monthly contribution for pure asset performance check
      5, // 5 years
      options.reinvestDividends,
    )

    if (!result || result.totalInvested <= 0) return null

    const finalValue = result.finalValue
    const initialValue = result.totalInvested

    // CAGR: r = (FV/PV)^(1/n) - 1
    const years = 5
    const cagr = Math.pow(finalValue / initialValue, 1 / years) - 1
    const monthlyRate = Math.pow(1 + cagr, 1 / 12) - 1

    return {
      ticker,
      category: options.categoryLabel,
      cagr,
      monthlyRate,
      periodYears: years,
      totalReturn: (finalValue - initialValue) / initialValue,
      totalDividends: result.totalDividends,
    }
  } catch (e) {
    console.error(`Simulation failed for ${ticker}:`, e)
    return null
  }
}

// --- Calculadora principal (verbatim de calculatePlanning) ---

export async function calculatePlanning(
  base: string,
  goalValue: number,
  monthlyContribution: number,
  strategy: PlanningStrategy,
): Promise<PlanningResult | null> {
  try {
    let recommendedAssets: PlanningRecommendedAsset[] = []
    let monthlyReturnRate = 0
    const analysisYears = 5

    if (strategy === 'rentabilidade') {
      // Rule: Use fixed high-performance assets for consistency
      // 3 setores distintos: Oil (PRIO3), Mining (VALE3), Industry (WEGE3)
      const selectedTickers = ['PRIO3', 'VALE3', 'WEGE3']

      const performances = await Promise.all(
        selectedTickers.map((t) =>
          simulateAssetPerformance(base, t, { reinvestDividends: true, categoryLabel: 'Ação' }),
        ),
      )

      const valid = performances.filter((p) => p !== null)
      if (valid.length === 0) throw new Error('No data available for selected assets')

      const avgMonthlyRate = valid.reduce((sum, p) => sum + (p?.monthlyRate || 0), 0) / valid.length
      monthlyReturnRate = avgMonthlyRate

      recommendedAssets = valid.map((p) => ({
        ...p!,
        weight: 1 / valid.length,
      }))
    } else {
      // Strategy: Seguranca
      // 1 Energy (TAEE11), 1 Bank (ITUB4), 2 FIIs (HGLG11, VISC11) + Fixed Income
      const selectedStocks = ['TAEE11', 'ITUB4']
      const selectedFiis = ['HGLG11', 'VISC11']

      // Fixed Income (Synthetic)
      const fixedIncomeRate = planningUniverse.seguranca.fixedIncomeAnnualRate
      const fixedIncomeMonthly = Math.pow(1 + fixedIncomeRate, 1 / 12) - 1
      const fixedIncomeAsset: PlanningRecommendedAsset = {
        ticker: 'Renda Fixa',
        category: 'Renda Fixa',
        cagr: fixedIncomeRate,
        monthlyRate: fixedIncomeMonthly,
        periodYears: 5,
        totalReturn: Math.pow(1 + fixedIncomeRate, 5) - 1,
        totalDividends: 0,
        weight: 0.2,
      }

      const stockPerformances = await Promise.all(
        selectedStocks.map((t) =>
          simulateAssetPerformance(base, t, { reinvestDividends: true, categoryLabel: 'Ação Segura' }),
        ),
      )
      const fiiPerformances = await Promise.all(
        selectedFiis.map((t) =>
          simulateAssetPerformance(base, t, { reinvestDividends: true, categoryLabel: 'FII' }),
        ),
      )

      const validStocks = stockPerformances.filter((p) => p !== null)
      const validFiis = fiiPerformances.filter((p) => p !== null)

      const allAssets = [...validStocks, ...validFiis]

      // Average rate including Fixed Income
      const totalParts = allAssets.length + 1

      let sumRates = fixedIncomeMonthly
      allAssets.forEach((a) => (sumRates += a?.monthlyRate || 0))

      monthlyReturnRate = sumRates / totalParts

      recommendedAssets = [
        fixedIncomeAsset,
        ...allAssets.map((a) => ({ ...a!, weight: 1 / totalParts })),
      ]

      // Adjust RF weight in the list
      recommendedAssets[0]!.weight = 1 / totalParts
    }

    const monthsToGoal = computeMonthsToGoal(goalValue, monthlyContribution, monthlyReturnRate)
    const totals = computeProjectionTotals(monthlyContribution, monthsToGoal, monthlyReturnRate)

    const periodMonths = Math.max(Math.round(analysisYears * 12), 1)
    const historicalTotals = computeProjectionTotals(monthlyContribution, periodMonths, monthlyReturnRate)

    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() + monthsToGoal)

    return {
      strategy,
      goalValue,
      monthlyContribution,
      monthsToGoal,
      targetDateLabel: targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      totalInvestedUntilGoal: totals.totalInvested,
      estimatedFinalValue: totals.finalValue,
      estimatedProfit: totals.finalValue - totals.totalInvested,
      monthlyReturnRate,
      recommendedAssets,
      historicalFinalValue: historicalTotals.finalValue,
      historicalInvested: historicalTotals.totalInvested,
      historicalProfit: historicalTotals.finalValue - historicalTotals.totalInvested,
      historicalYears: analysisYears,
      chartData: buildProjectionChart(monthsToGoal, monthlyContribution, monthlyReturnRate),
    }
  } catch (error) {
    console.error('Planning calculation error:', error)
    return null
  }
}

/** '18 anos e 3 meses' — porte exato do formatTimeLabel do Planning.vue antigo. */
export function formatTimeLabel(months: number) {
  if (months <= 0) return 'menos de 1 mês'
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  const parts: string[] = []
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`)
  }
  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`)
  }
  return parts.join(' e ')
}
