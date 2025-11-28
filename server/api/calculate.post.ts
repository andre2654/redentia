import { calculateCompoundInterest, calculatePlanning, calculateStockReturn } from '../utils/calculators'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { type, params } = body

    if (!type) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Type is required',
        })
    }

    try {
        if (type === 'compound') {
            const { initialValue, monthlyValue, interestRate, period, periodType, interestPeriod } = params
            return calculateCompoundInterest(initialValue, monthlyValue, interestRate, period, periodType, interestPeriod)
        }

        if (type === 'planning') {
            const { goalValue, monthlyContribution, strategy } = params
            return await calculatePlanning(goalValue, monthlyContribution, strategy)
        }

        if (type === 'stock') {
            const { ticker, initialInvestment, monthlyInvestment, periodYears, reinvestDividends } = params
            return await calculateStockReturn(ticker, initialInvestment, monthlyInvestment, periodYears, reinvestDividends)
        }

        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid calculator type',
        })
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Calculation failed',
        })
    }
})
