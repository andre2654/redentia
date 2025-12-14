import { calculateCompoundInterest, calculatePlanning, calculateStockReturn } from '../utils/calculators'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { type, params } = body

    if (!type || typeof type !== 'string') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Type is required',
        })
    }

    try {
        if (type === 'compound') {
            const { initialValue, monthlyValue, interestRate, period, periodType, interestPeriod } = params
            const iv = Number(initialValue)
            const mv = Number(monthlyValue)
            const ir = Number(interestRate)
            const p = Number(period)

            if (
                !Number.isFinite(iv) ||
                !Number.isFinite(mv) ||
                !Number.isFinite(ir) ||
                !Number.isFinite(p) ||
                p <= 0
            ) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid params for compound' })
            }
            return calculateCompoundInterest(iv, mv, ir, p, periodType, interestPeriod)
        }

        if (type === 'planning') {
            const { goalValue, monthlyContribution, strategy } = params
            const gv = Number(goalValue)
            const mc = Number(monthlyContribution)
            const strat = strategy === 'rentabilidade' || strategy === 'seguranca' ? strategy : 'seguranca'

            if (!Number.isFinite(gv) || !Number.isFinite(mc) || gv <= 0 || mc <= 0) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid params for planning' })
            }

            return await calculatePlanning(gv, mc, strat)
        }

        if (type === 'stock') {
            const { ticker, initialInvestment, monthlyInvestment, periodYears, reinvestDividends } = params
            const normalizeTicker = (t: any) =>
                typeof t === 'string' ? t.trim().toUpperCase() : ''
            const isValidTicker = (t: string) => /^[A-Z]{4}[0-9]{1,2}$/.test(t)

            const t = normalizeTicker(ticker)
            if (!t || !isValidTicker(t)) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid ticker' })
            }

            const ii = Number(initialInvestment)
            const mi = Number(monthlyInvestment)
            const py = Number(periodYears || 1)
            if (!Number.isFinite(py) || py <= 0) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid periodYears' })
            }

            return await calculateStockReturn(
                t,
                Number.isFinite(ii) ? ii : 0,
                Number.isFinite(mi) ? mi : 0,
                py,
                reinvestDividends
            )
        }

        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid calculator type',
        })
    } catch (error: any) {
        if (error?.statusCode && error?.statusMessage) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: error?.message || 'Calculation failed',
        })
    }
})
