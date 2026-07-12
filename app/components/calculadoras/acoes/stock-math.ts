/**
 * PR10 — matemática do simulador de ações, porte EXATO do backend antigo:
 *  - cleanChart / cleanDividends: Frontend/server/utils/market.ts
 *  - simulateStock: calculateSingleStockReturn de
 *    Frontend/server/utils/calculators.ts (loop de aportes mensais +
 *    reinvestimento de proventos sobre preços históricos reais)
 *  - mergeChartData: agregação multi-ticker de calculateStockReturn
 * A RedentiaNu não tem rotas Nitro próprias, então o cálculo roda no client
 * com dados do Laravel via proxy same-origin /api/backend
 * (GET /tickers/{t}/prices?mode=full e GET /dividends/{t}).
 * Nenhuma mudança de fórmula — só a remoção do transporte HTTP interno.
 */

export interface StockChartPoint {
  date: string
  value: number
  timestamp: number
}

export interface StockDividendEvent {
  ticker: string
  payment_date: string
  rate: number
  label: string
  totalReceived: number
  sharesAtTime: number
}

export interface StockSimulation {
  ticker: string
  totalInvested: number
  finalValue: number
  returnPercentage: number
  totalDividends: number
  totalShares: number
  averagePrice: number
  chartData: StockChartPoint[]
  periodYears: number
  dividendsHistory: StockDividendEvent[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Porte de cleanChart (market.ts): acha o array e normaliza date/close. */
export function cleanChart(data: any): { date: any; close: any }[] {
  let arr = data
  if (data && typeof data === 'object') {
    if (Array.isArray(data)) arr = data
    else if (Array.isArray(data.data)) arr = data.data
    else if (Array.isArray(data.prices)) arr = data.prices
    else if (Array.isArray(data.results)) arr = data.results
    else if (Array.isArray(data.history)) arr = data.history
  }
  if (!Array.isArray(arr)) return []
  return arr
    .map((p: any) => ({
      date: p.date || p.created_at || p.time || p.price_at,
      close: p.close ?? p.price ?? p.value ?? p.amount ?? p.market_price,
    }))
    .filter((p) => p.close !== undefined && p.close !== null)
}

/** Porte de cleanDividends (market.ts): normaliza date/value/type e inverte. */
export function cleanDividends(data: any): { date: any; value: any; type: any }[] {
  let arr = data
  if (data && typeof data === 'object') {
    if (Array.isArray(data)) arr = data
    else if (Array.isArray(data.data)) arr = data.data
    else if (Array.isArray(data.dividends)) arr = data.dividends
    else if (Array.isArray(data.results)) arr = data.results
  }
  if (!Array.isArray(arr)) return []
  return arr
    .map((d: any) => ({
      date: d.payment_date || d.date || d.approved_date || d.last_date_prior,
      value: d.value || d.amount || d.rate || d.value_cash,
      type: d.type_description || d.type || d.label,
    }))
    .filter((d) => d.value !== undefined && d.value !== null)
    .reverse()
}

/**
 * Porte de calculateSingleStockReturn (calculators.ts), incluindo o fallback
 * do wrapper calculateStockReturn (sem nenhum valor → R$ 1.000 inicial).
 * Recebe os dados já buscados (priceHistory = cleanChart, dividendsRaw =
 * cleanDividends) e devolve a simulação — null quando faltam dados.
 */
export function simulateStock(
  ticker: string,
  priceHistory: { date: any; close: any }[],
  dividendsRaw: { date: any; value: any; type: any }[],
  initialInvestmentInput: number,
  monthlyInvestmentInput: number,
  periodYears: number,
  reinvestDividends: boolean,
): StockSimulation | null {
  try {
    if (!priceHistory || priceHistory.length === 0) return null

    // Ensure inputs are numbers (handle undefined/null)
    let initialInvestment = Number(initialInvestmentInput)
    let monthlyInvestment = Number(monthlyInvestmentInput)
    if (isNaN(initialInvestment)) initialInvestment = 0
    if (isNaN(monthlyInvestment)) monthlyInvestment = 0
    // Fallback: If user didn't specify any value (both are 0), default to R$ 1000 initial
    if (initialInvestment === 0 && monthlyInvestment === 0) initialInvestment = 1000

    // Normalize Prices
    const normalizedPrices = priceHistory
      .map((p: any) => {
        const priceDate = new Date(p.date || p.price_at)
        return {
          price_at: p.date || p.price_at,
          market_price: Number(p.close || p.price || p.market_price),
          priceDate,
        }
      })
      .filter(
        (p: any) =>
          Number.isFinite(p.market_price) &&
          p.market_price > 0 &&
          !isNaN(p.priceDate.getTime()),
      )
      .sort((a: any, b: any) => a.priceDate.getTime() - b.priceDate.getTime())

    if (!normalizedPrices.length) return null

    const latestEntry = normalizedPrices[normalizedPrices.length - 1]!
    const endDate = new Date(latestEntry.priceDate)
    const startDate = new Date(endDate)
    startDate.setFullYear(startDate.getFullYear() - periodYears)

    const relevantPrices = normalizedPrices.filter((p: any) => p.priceDate >= startDate)
    if (!relevantPrices.length) return null

    // Process Dividends
    const processedDividends = dividendsRaw
      .map((d: any) => ({
        payment_date: d.date || d.payment_date,
        rate: parseFloat(d.value || d.rate) || 0,
        label: d.type || d.label || 'Dividendo',
        date: new Date(d.date || d.payment_date),
      }))
      .filter(
        (d: any) =>
          Number.isFinite(d.rate) &&
          d.rate > 0 &&
          !isNaN(d.date.getTime()) &&
          d.date >= startDate &&
          d.date <= endDate,
      )
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())

    // Simulation Loop
    let totalShares = 0
    let totalInvested = 0
    let totalDividends = 0
    const chartData: StockChartPoint[] = []
    const dividendsHistory: StockDividendEvent[] = []

    const firstPrice = relevantPrices[0]!
    const initialPrice = firstPrice.market_price

    const initialShares = initialInvestment > 0 ? initialInvestment / initialPrice : 0
    totalShares = initialShares
    totalInvested = initialInvestment

    const firstDate = new Date(firstPrice.price_at)
    chartData.push({
      date: firstDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      value: totalShares * initialPrice,
      timestamp: firstDate.getTime(),
    })

    let lastMonthProcessed = firstDate.getMonth()
    let lastYearProcessed = firstDate.getFullYear()

    for (let i = 1; i < relevantPrices.length; i++) {
      const currentPrice = relevantPrices[i]!
      const priceDate = currentPrice.priceDate
      const priceValue = currentPrice.market_price
      const currentMonth = priceDate.getMonth()
      const currentYear = priceDate.getFullYear()

      // Monthly Contribution
      if (monthlyInvestment > 0 && (currentMonth !== lastMonthProcessed || currentYear !== lastYearProcessed)) {
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
          (d: any) => d.date > previousDate && d.date <= priceDate,
        )

        for (const div of relevantDivs) {
          const dividendValue = totalShares * div.rate
          totalDividends += dividendValue
          dividendsHistory.push({
            ticker,
            payment_date: div.payment_date,
            rate: div.rate,
            totalReceived: dividendValue,
            sharesAtTime: totalShares,
            label: div.label,
          })

          if (priceValue > 0) {
            const newShares = dividendValue / priceValue
            totalShares += newShares
          }
        }
      }

      const portfolioValue = totalShares * priceValue

      // Sample chart data (mesma amostragem do backend antigo: semanal + último)
      if (i % 7 === 0 || i === relevantPrices.length - 1) {
        chartData.push({
          date: priceDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
          value: portfolioValue,
          timestamp: priceDate.getTime(),
        })
      }
    }

    const finalValue = totalShares * relevantPrices[relevantPrices.length - 1]!.market_price
    const returnPercentage = totalInvested > 0 ? ((finalValue - totalInvested) / totalInvested) * 100 : 0
    const averagePrice = totalShares > 0 ? totalInvested / totalShares : 0

    return {
      ticker,
      totalInvested,
      finalValue,
      returnPercentage,
      totalDividends,
      totalShares,
      averagePrice,
      chartData,
      periodYears,
      dividendsHistory,
    }
  } catch {
    return null
  }
}

/** Porte da agregação de chartData multi-ticker (calculateStockReturn). */
export function mergeChartData(results: StockSimulation[]): StockChartPoint[] {
  const dateMap = new Map<number, StockChartPoint>()
  results.forEach((res) => {
    res.chartData.forEach((point) => {
      const existing = dateMap.get(point.timestamp)
      if (existing) {
        existing.value += point.value
      } else {
        dateMap.set(point.timestamp, { ...point })
      }
    })
  })
  return Array.from(dateMap.values()).sort((a, b) => a.timestamp - b.timestamp)
}
