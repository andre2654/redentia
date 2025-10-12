import type { IChartDataPoint } from './chart';

export interface IAsset {
    stock: string,
    name: string,
    close: number,
    change: number,
    volume: number,
    market_cap: number,
    logo?: string,
    sector?: string,
    type?: 'stock' | 'fund' | 'bdr',
    priceHistory?: IChartDataPoint[],
    // Campos opcionais para getTickerDetails
    ticker?: string,
    industry_category?: string,
    city?: string,
    state?: string,
    country?: string,
    employees?: string,
    website?: string,
    long_business_summary?: string,
    market_price?: number,
    day_change_percent?: number
}

// Interface para resposta da API getTickerFundamentus
export interface FundamentusApiResponse {
    ticker: string
    key_statistics: {
        ticker: string
        updated_at: string
        enterprise_value: string
        enterprise_to_revenue: string
        enterprise_to_ebitda: string | null
        price_to_book: string
        book_value: string
        trailing_eps: string
        forward_pe: string
        dividend_yield: string
        profit_margins: string
        earnings_annual_growth: string
        earnings_quarterly_growth: string | null
        shares_outstanding: number
        total_assets: string
        ytd_return: string
        fifty_two_week_change: string
    }
    financial_data: {
        ticker: string
        updated_at: string
        currency: string
        current_price: string
        total_revenue: string
        gross_profits: string
        ebitda: string | null
        gross_margins: string
        operating_margins: string | null
        profit_margins: string
        ebitda_margins: string | null
        return_on_assets: string
        return_on_equity: string
        revenue_growth: string
        earnings_growth: string
        total_cash: string
        total_debt: string | null
        debt_to_equity: string
        free_cashflow: string
        operating_cashflow: string
    }
    income: {
        annual: Array<{
            period_type: string
            period_end_date: string
            total_revenue: string
            gross_profit: string
            operating_income: string
            ebit: string | null
            net_income: string
            interest_expense: string | null
            income_tax_expense: string
            eps: {
                basic: string | null
                diluted: string | null
            }
        }>
        quarterly: Array<{
            period_type: string
            period_end_date: string
            total_revenue: string
            gross_profit: string
            operating_income: string
            ebit: string | null
            net_income: string
            interest_expense: string | null
            income_tax_expense: string
            eps: {
                basic: string | null
                diluted: string | null
            }
        }>
    }
    balance: {
        annual: Array<{
            period_type: string
            period_end_date: string
            total_assets: string
            total_liab: string
            equity: string
            cash: string
            inventory: string | null
            net_receivables: string | null
            long_term_debt: string | null
        }>
        quarterly: Array<{
            period_type: string
            period_end_date: string
            total_assets: string
            total_liab: string
            equity: string
            cash: string
            inventory: string | null
            net_receivables: string | null
            long_term_debt: string | null
        }>
    }
    cash_flow: {
        annual: Array<{
            period_type: string
            period_end_date: string
            operating_cash_flow: string
            investment_cash_flow: string
            financing_cash_flow: string
            increase_or_decrease_in_cash: string
            initial_cash_balance: string | null
            final_cash_balance: string
        }>
        quarterly: Array<{
            period_type: string
            period_end_date: string
            operating_cash_flow: string
            investment_cash_flow: string
            financing_cash_flow: string
            increase_or_decrease_in_cash: string
            initial_cash_balance: string | null
            final_cash_balance: string
        }>
    }
}

// Interface simplificada para os componentes de gráfico
export interface FundamentusData {
    // Indicadores básicos
    priceToEarnings?: number // P/L
    priceToBook?: number // P/VPA
    dividendYield?: number // D.Y.
    roe?: number // ROE
    roa?: number // ROA
    netMargin?: number // Margem Líquida
    
    // Demonstrações financeiras
    cashFlow?: {
        operatingCashFlow?: number
        investingCashFlow?: number
        financingCashFlow?: number
        freeCashFlow?: number
    }
    
    balanceSheet?: {
        totalAssets?: number
        totalLiabilities?: number
        totalEquity?: number
        currentAssets?: number
        currentLiabilities?: number
        longTermDebt?: number
        cash?: number
    }
    
    incomeStatement?: {
        totalRevenue?: number
        grossProfit?: number
        operatingIncome?: number
        netIncome?: number
        ebitda?: number
        operatingExpenses?: number
    }
    
    // Outras métricas
    marketCap?: number
    enterpriseValue?: number
    bookValue?: number
    priceToSales?: number
    evToEbitda?: number
    currentRatio?: number
    quickRatio?: number
    debtToEquity?: number
    returnOnAssets?: number
    returnOnEquity?: number
    profitMargin?: number
    grossMargin?: number
}