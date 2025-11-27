
const unwrap = (res: any) => (res && res.data) ? res.data : res

function cleanPrice(data: any) {
    const d = unwrap(data)
    if (!d) return null
    return {
        price: d.market_price ?? d.price ?? d.close,
        change: d.change_percent ?? d.change,
        updated_at: d.updated_at ?? d.last_update,
        ticker: d.ticker,
        name: d.name,
        logo: d.logo,
        sector: d.sector,
        market_cap: d.market_cap
    }
}

function cleanChart(data: any) {
    // Try to find array in common places
    let arr = data
    if (data && typeof data === 'object') {
        if (Array.isArray(data)) arr = data
        else if (Array.isArray(data.data)) arr = data.data
        else if (Array.isArray(data.prices)) arr = data.prices
        else if (Array.isArray(data.results)) arr = data.results
        else if (Array.isArray(data.history)) arr = data.history
    }

    if (!Array.isArray(arr)) return []

    return arr.map((p: any) => ({
        date: p.date || p.created_at || p.time || p.price_at,
        close: p.close ?? p.price ?? p.value ?? p.amount ?? p.market_price
    })).filter(p => p.close !== undefined && p.close !== null)
}

function cleanDividends(data: any) {
    // Try to find array in common places
    let arr = data
    if (data && typeof data === 'object') {
        if (Array.isArray(data)) arr = data
        else if (Array.isArray(data.data)) arr = data.data
        else if (Array.isArray(data.dividends)) arr = data.dividends
        else if (Array.isArray(data.results)) arr = data.results
    }

    if (!Array.isArray(arr)) return []

    return arr.map((d: any) => ({
        date: d.payment_date || d.date || d.approved_date || d.last_date_prior,
        value: d.value || d.amount || d.rate || d.value_cash,
        type: d.type_description || d.type || d.label
    })).filter(d => d.value !== undefined && d.value !== null).reverse()
}

function cleanFundamentals(data: any) {
    const d = unwrap(data)
    if (!d) return null

    return {
        sector: d.sector ?? d.summary_profile?.sector,
        sub_sector: d.sub_sector,
        name: d.name,
        market_cap: d.market_cap ?? d.summary_detail?.market_cap ?? d.price?.market_cap,
        pl: d.pl,
        dy: d.dy,
        pvp: d.pvp,
        roe: d.roe,
        margem_liquida: d.margem_liquida,
        divida_liquida_ebitda: d.divida_liquida_ebitda,
        key_statistics: d.key_statistics,
        financial_data: d.financial_data,
        summary_detail: d.summary_detail,
        summary_profile: d.summary_profile
    }
}

export const getMarketData = async (ticker: string, type: string, params: any = {}) => {
    const BASE_URL = 'https://redentia-api.saraivada.com/api'

    try {
        if (type === 'price') {
            const response = await $fetch(`${BASE_URL}/tickers/${ticker}`)
            return cleanPrice(response)
        }

        if (type === 'chart') {
            const period = params.period || '1mo'
            const response = await $fetch(`${BASE_URL}/tickers/${ticker}/prices?mode=${period}`)
            return cleanChart(response)
        }

        if (type === 'dividends') {
            const response = await $fetch(`${BASE_URL}/dividends/${ticker}`)
            return cleanDividends(response)
        }

        if (type === 'analysis') {
            const response = await $fetch(`${BASE_URL}/fundamentals/${ticker}/overview`)
            return cleanFundamentals(response)
        }

        if (type === 'report') {
            const [price, chart, dividends, fundamentals] = await Promise.all([
                $fetch(`${BASE_URL}/tickers/${ticker}`).catch(() => null),
                $fetch(`${BASE_URL}/tickers/${ticker}/prices?mode=12mo`).catch(() => null),
                $fetch(`${BASE_URL}/dividends/${ticker}`).catch(() => null),
                $fetch(`${BASE_URL}/fundamentals/${ticker}/overview`).catch(() => null)
            ])

            return {
                price: cleanPrice(price),
                chart: cleanChart(chart),
                dividends: cleanDividends(dividends),
                fundamentals: cleanFundamentals(fundamentals)
            }
        }

        const response = await $fetch(`${BASE_URL}/tickers/${ticker}`)
        return cleanPrice(response)

    } catch (error) {
        console.error(`Error fetching market data for ${ticker} (${type}):`, error)
        return null
    }
}
