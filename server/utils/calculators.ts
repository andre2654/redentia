import { getMarketData } from './market'

// --- Constants for Planning ---
const planningUniverse = {
    rentabilidade: {
        fallbackStocks: ['PETR4', 'VALE3', 'PRIO3', 'WEGE3', 'LREN3', 'ITUB4'],
        fallbackFiis: ['HGLG11', 'KNRI11', 'XPML11', 'VISC11', 'BCFF11'],
        minimumAssets: 3,
        priorityTickers: [
            'PETR4',
            'VALE3',
            'PRIO3',
            'WEGE3',
            'ITUB4',
            'BBAS3',
            'ABEV3',
            'SUZB3',
        ],
    },
    seguranca: {
        categories: {
            energy: ['TAEE11', 'EQTL3', 'ENBR3', 'NEOE3'],
            sanitation: ['SBSP3', 'CSMG3', 'SAPR11'],
            banks: ['ITUB4', 'BBAS3', 'BBDC4', 'SANB11'],
            fiis: ['HGLG11', 'KNRI11', 'BCFF11', 'VISC11'],
        },
        categoryLabels: {
            energy: 'Energia',
            sanitation: 'Saneamento',
            banks: 'Bancos',
            fiis: 'FII consolidado',
        },
        fixedIncomeWeight: 0.1,
        fixedIncomeAnnualRate: 0.1,
    },
}

// --- Helper Functions ---

function normalizeTicker(t: string) {
    return t ? t.trim().toUpperCase() : ''
}

function computeMonthsToGoal(
    goal: number,
    monthly: number,
    monthlyRate: number
) {
    if (monthlyRate <= 0) {
        if (monthly <= 0) return 9999
        return Math.ceil(goal / monthly)
    }
    // FV = P * (((1+r)^n - 1)/r)  (assuming initial=0 for simplicity in "months to goal" approx, or solve properly)
    // Actually, let's use a loop or proper formula.
    // Formula for n with monthly contributions PMT and Future Value FV:
    // FV = PMT * ((1+r)^n - 1) / r
    // FV*r/PMT = (1+r)^n - 1
    // (FV*r/PMT) + 1 = (1+r)^n
    // n = log((FV*r/PMT) + 1) / log(1+r)

    // If there is initial value, it's more complex. But here we assume starting from 0 for "months to goal" based on monthly contribution?
    // The frontend code uses `computeMonthsToGoal`. Let's assume 0 initial for this specific calculation if not provided.

    const num = (goal * monthlyRate) / monthly + 1
    if (num <= 0) return 9999 // Should not happen if inputs positive
    const n = Math.log(num) / Math.log(1 + monthlyRate)
    return Math.ceil(n)
}

function computeProjectionTotals(
    monthly: number,
    months: number,
    monthlyRate: number
) {
    let balance = 0
    let totalInvested = 0
    for (let i = 0; i < months; i++) {
        balance = balance * (1 + monthlyRate) + monthly
        totalInvested += monthly
    }
    return { finalValue: balance, totalInvested }
}

function buildProjectionChart(months: number, monthly: number, rate: number) {
    const data = []
    let balance = 0
    const now = new Date()

    for (let i = 0; i <= months; i++) {
        if (i > 0) {
            balance = balance * (1 + rate) + monthly
        }

        // Sample points
        if (months > 50 && i % Math.ceil(months / 50) !== 0 && i !== months)
            continue

        const date = new Date(now)
        date.setMonth(date.getMonth() + i)

        data.push({
            date: date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            }),
            value: balance,
            timestamp: date.getTime(),
        })
    }
    return data
}

// --- Calculators ---

export const calculateCompoundInterest = (
    initialValue: number,
    monthlyValue: number,
    interestRate: number,
    period: number,
    periodType: 'months' | 'years' = 'years',
    interestPeriod: 'month' | 'year' = 'year'
) => {
    let rate = interestRate
    let months = periodType === 'years' ? period * 12 : period

    if (interestPeriod === 'year') {
        rate = Math.pow(1 + rate / 100, 1 / 12) - 1
    } else {
        rate = rate / 100
    }

    let balance = initialValue
    let totalInvested = initialValue
    const chartData = []

    const startDate = new Date()
    chartData.push({
        date: startDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }),
        value: balance,
        timestamp: startDate.getTime(),
    })

    for (let i = 1; i <= months; i++) {
        balance = balance * (1 + rate) + monthlyValue
        totalInvested += monthlyValue

        const date = new Date()
        date.setMonth(date.getMonth() + i)
        // Only add points occasionally to avoid huge JSON
        if (months > 50 && i % Math.ceil(months / 50) !== 0 && i !== months) continue

        chartData.push({
            date: date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            }),
            value: balance,
            timestamp: date.getTime(),
        })
    }

    const finalValue = balance
    const totalInterest = finalValue - totalInvested

    return {
        totalInvested,
        totalInterest,
        finalValue,
        chartData,
        periodMonths: months
    }
}

export const calculateStockReturn = async (
  tickersInput: string | string[],
  initialInvestmentInput: number,
  monthlyInvestmentInput: number,
  periodYears: number,
  reinvestDividends: boolean = true
) => {
  try {
    const tickers = Array.isArray(tickersInput) ? tickersInput : [tickersInput]
    
    // Ensure inputs are numbers (handle undefined/null)
    let initialInvestment = Number(initialInvestmentInput)
    let monthlyInvestment = Number(monthlyInvestmentInput)

    if (isNaN(initialInvestment)) initialInvestment = 0
    if (isNaN(monthlyInvestment)) monthlyInvestment = 0

    // Fallback: If user didn't specify any value (both are 0), default to R$ 1000 initial
    if (initialInvestment === 0 && monthlyInvestment === 0) {
      initialInvestment = 1000
    }

    // If multiple tickers, split investment equally
    const investmentPerTicker = initialInvestment / tickers.length
    const monthlyPerTicker = monthlyInvestment / tickers.length

    const results = await Promise.all(tickers.map(async (ticker) => {
      return await calculateSingleStockReturn(
        ticker,
        investmentPerTicker,
        monthlyPerTicker,
        periodYears,
        reinvestDividends
      )
    }))

    const validResults = results.filter(r => r !== null)
    if (validResults.length === 0) return null

    // Aggregate results
    const totalInvested = validResults.reduce((sum, r) => sum + r.totalInvested, 0)
    const finalValue = validResults.reduce((sum, r) => sum + r.finalValue, 0)
    const totalDividends = validResults.reduce((sum, r) => sum + r.totalDividends, 0)
    
    // Merge chart data
    // We need to align dates. We'll use the dates from the first valid result and sum values if dates match
    // Or better: create a map of date -> value
    const dateMap = new Map<number, { date: string, value: number, timestamp: number }>()
    
    validResults.forEach(res => {
      res.chartData.forEach((point: any) => {
        const existing = dateMap.get(point.timestamp)
        if (existing) {
          existing.value += point.value
        } else {
          dateMap.set(point.timestamp, { ...point })
        }
      })
    })

    const chartData = Array.from(dateMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    
    const returnPercentage = totalInvested > 0 ? ((finalValue - totalInvested) / totalInvested) * 100 : 0

    // For single ticker, we can preserve shares and avg price
    let totalShares = 0
    let averagePrice = 0
    
    if (validResults.length === 1 && validResults[0]) {
        totalShares = validResults[0].totalShares
        averagePrice = validResults[0].averagePrice
    }

    return {
      ticker: tickers.join(' + '),
      totalInvested,
      finalValue,
      returnPercentage,
      totalDividends,
      totalShares,
      averagePrice,
      chartData,
      periodYears,
      dividendsHistory: validResults.flatMap(r => r.dividendsHistory).sort((a: any, b: any) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())
    }

  } catch (error) {
    console.error('Error calculating portfolio return:', error)
    return null
  }
}

const calculateSingleStockReturn = async (
  ticker: string,
  initialInvestment: number,
  monthlyInvestment: number,
  periodYears: number,
  reinvestDividends: boolean
) => {
  try {
    // Fetch price history
    const priceData = await getMarketData(ticker, 'chart', { period: 'full' })
    const priceHistory = Array.isArray(priceData) ? priceData : (priceData as any)?.data || []

    if (!priceHistory || priceHistory.length === 0) {
      return null
    }

    // Fetch dividends
    let dividendsRaw: any[] = []
        if (reinvestDividends) {
            try {
                const divData = await getMarketData(ticker, 'dividends')
                dividendsRaw = Array.isArray(divData) ? divData : (divData as any)?.data || []
            } catch (error) {
                console.warn('Failed to fetch dividends for', ticker)
            }
        }

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
                    !isNaN(p.priceDate.getTime())
            )
            .sort((a: any, b: any) => a.priceDate.getTime() - b.priceDate.getTime())

        if (!normalizedPrices.length) return null

        const latestEntry = normalizedPrices[normalizedPrices.length - 1]
        const endDate = new Date(latestEntry.priceDate)
        const startDate = new Date(endDate)
        startDate.setFullYear(startDate.getFullYear() - periodYears)

        const relevantPrices = normalizedPrices.filter(
            (p: any) => p.priceDate >= startDate
        )

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
                    d.date <= endDate
            )
            .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())

        // Simulation Loop
        let totalShares = 0
        let totalInvested = 0
        let totalDividends = 0
        const chartData = []
        const dividendsHistory = []

        const firstPrice = relevantPrices[0]
        const initialPrice = firstPrice.market_price

        const initialShares = initialInvestment > 0 ? initialInvestment / initialPrice : 0
        totalShares = initialShares
        totalInvested = initialInvestment

        const firstDate = new Date(firstPrice.price_at)
        chartData.push({
            date: firstDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
            value: totalShares * initialPrice,
            timestamp: firstDate.getTime()
        })

        let lastMonthProcessed = firstDate.getMonth()
        let lastYearProcessed = firstDate.getFullYear()

        for (let i = 1; i < relevantPrices.length; i++) {
            const currentPrice = relevantPrices[i]
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
                const previousDate = relevantPrices[i - 1].priceDate
                const relevantDivs = processedDividends.filter(
                    (d: any) => d.date > previousDate && d.date <= priceDate
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
                        label: div.label
                    })

                    if (priceValue > 0) {
                        const newShares = dividendValue / priceValue
                        totalShares += newShares
                    }
                }
            }

            const portfolioValue = totalShares * priceValue

            // Sample chart data
            // Always include first and last, and sample in between
            // For portfolio aggregation, we need consistent timestamps or interpolation.
            // Here we just push daily/weekly points.
            if (i % 7 === 0 || i === relevantPrices.length - 1) {
                chartData.push({
                    date: priceDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
                    value: portfolioValue,
                    timestamp: priceDate.getTime()
                })
            }
        }

        const finalValue = totalShares * relevantPrices[relevantPrices.length - 1].market_price
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
            dividendsHistory
        }

    } catch (error) {
        console.error('Error calculating single stock return:', error)
        return null
    }
}

// Helper for Planning
async function simulateAssetPerformance(ticker: string, options: { reinvestDividends: boolean, categoryLabel: string }) {
    try {
        // Use the robust calculator to get 5-year performance with dividends
        const result = await calculateSingleStockReturn(
            ticker,
            1000, // Base investment for simulation
            0,    // No monthly contribution for pure asset performance check
            5,    // 5 years
            options.reinvestDividends
        )

        if (!result || result.totalInvested <= 0) return null

        const finalValue = result.finalValue
        const initialValue = result.totalInvested
        
        // Calculate CAGR
        // FV = PV * (1 + r)^n  =>  r = (FV/PV)^(1/n) - 1
        const years = 5
        const cagr = Math.pow(finalValue / initialValue, 1 / years) - 1
        
        // Monthly rate
        const monthlyRate = Math.pow(1 + cagr, 1 / 12) - 1

        return {
            ticker,
            category: options.categoryLabel,
            cagr,
            monthlyRate,
            periodYears: years,
            totalReturn: (finalValue - initialValue) / initialValue,
            totalDividends: result.totalDividends
        }
    } catch (e) {
        console.error(`Simulation failed for ${ticker}:`, e)
        return null
    }
}

function getRandomAssets(list: string[], count: number): string[] {
    const shuffled = [...list].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

export const calculatePlanning = async (
    goalValue: number,
    monthlyContribution: number,
    strategy: 'rentabilidade' | 'seguranca'
) => {
    try {
        let recommendedAssets: any[] = []
        let monthlyReturnRate = 0
        let analysisYears = 5

        if (strategy === 'rentabilidade') {
            // Rule: At least 3 stocks
            const candidates = [
                ...planningUniverse.rentabilidade.priorityTickers
            ]
            
            // Pick 3 random unique stocks
            const selectedTickers = getRandomAssets(candidates, 3)
            
            const performances = await Promise.all(
                selectedTickers.map(t => simulateAssetPerformance(t, { reinvestDividends: true, categoryLabel: 'Ação' }))
            )

            const valid = performances.filter(p => p !== null)
            if (valid.length === 0) throw new Error('No data available for selected assets')

            const avgMonthlyRate = valid.reduce((sum, p) => sum + (p?.monthlyRate || 0), 0) / valid.length
            monthlyReturnRate = avgMonthlyRate

            recommendedAssets = valid.map(p => ({
                ...p,
                weight: 1 / valid.length
            }))

        } else {
            // Strategy: Seguranca
            // Rule: 2 Stocks + 2 FIIs + 1 Fixed Income
            
            // 1. Pick 2 Stocks (from safe categories: energy, sanitation, banks)
            const safeStockCandidates = [
                ...planningUniverse.seguranca.categories.energy,
                ...planningUniverse.seguranca.categories.sanitation,
                ...planningUniverse.seguranca.categories.banks
            ]
            const selectedStocks = getRandomAssets(safeStockCandidates, 2)

            // 2. Pick 2 FIIs
            const fiiCandidates = planningUniverse.seguranca.categories.fiis
            const selectedFiis = getRandomAssets(fiiCandidates, 2)

            // 3. Fixed Income (Synthetic)
            const fixedIncomeRate = planningUniverse.seguranca.fixedIncomeAnnualRate
            const fixedIncomeMonthly = Math.pow(1 + fixedIncomeRate, 1 / 12) - 1
            const fixedIncomeAsset = {
                ticker: 'Renda Fixa',
                category: 'Renda Fixa',
                cagr: fixedIncomeRate,
                monthlyRate: fixedIncomeMonthly,
                periodYears: 5,
                totalReturn: Math.pow(1 + fixedIncomeRate, 5) - 1,
                totalDividends: 0,
                weight: 0.2 // 1 of 5 assets = 20%
            }

            // Run simulations for stocks and FIIs
            const stockPerformances = await Promise.all(
                selectedStocks.map(t => simulateAssetPerformance(t, { reinvestDividends: true, categoryLabel: 'Ação Segura' }))
            )
            const fiiPerformances = await Promise.all(
                selectedFiis.map(t => simulateAssetPerformance(t, { reinvestDividends: true, categoryLabel: 'FII' }))
            )

            const validStocks = stockPerformances.filter(p => p !== null)
            const validFiis = fiiPerformances.filter(p => p !== null)

            // Combine all assets
            // We aim for 5 assets total. If some simulations fail, we adjust weights.
            const allAssets = [...validStocks, ...validFiis]
            
            // Calculate average rate including Fixed Income
            // Weighting: Fixed Income is 1 part. Real assets are remaining parts.
            // If we have 2 stocks + 2 FIIs + 1 RF = 5 parts.
            
            const totalParts = allAssets.length + 1 // +1 for Fixed Income
            
            let sumRates = fixedIncomeMonthly // Start with RF rate
            allAssets.forEach(a => sumRates += (a?.monthlyRate || 0))
            
            monthlyReturnRate = sumRates / totalParts

            recommendedAssets = [
                fixedIncomeAsset,
                ...allAssets.map(a => ({ ...a, weight: 1 / totalParts }))
            ]
            
            // Adjust RF weight in the list
            recommendedAssets[0].weight = 1 / totalParts
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
            chartData: buildProjectionChart(monthsToGoal, monthlyContribution, monthlyReturnRate)
        }

    } catch (error) {
        console.error('Planning calculation error:', error)
        return null
    }
}
