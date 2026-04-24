import type { IChartDataPoint } from './chart'

export interface AssetMdiEntry {
  ticker: string
  month: number
  occurrences: number
  total_years: number
  pm: string
  sv: string
  mdi: string
  sum_rate: string
  sum_total: string
  years_back: number
  calculated_at: string
}

export interface IAsset {
  stock: string
  name: string
  close: number
  change: number
  volume: number
  market_cap: number
  logo?: string
  sector?: string
  type?: 'stock' | 'fund' | 'bdr' | 'STOCK' | 'ETF' | 'BDR' | 'REIT' | 'UNKNOWN'
  priceHistory?: IChartDataPoint[]
  // Campos opcionais para getTickerDetails
  ticker?: string
  industry_category?: string
  city?: string
  state?: string
  country?: string
  employees?: string
  website?: string
  long_business_summary?: string
  market_price?: number
  change_percent?: number
  mdi?: AssetMdiEntry[]
}

export interface ScrapeExtrasEtf {
  asset_type: 'etf'
  etf: {
    price: number | null
    change_12m: number | null
    min_price_52_weeks: number | null
    max_price_52_weeks: number | null
    num_shareholders: number | null
    volume: number | null
    ratio: number | null
    lot_size: number | null
    market: string | null
    isin_code: string | null
    book_name: string | null
    cnpj: string | null
    fund_start_date: string | null
    trading_name: string | null
  }
  identity: {
    company_name: string | null
    sector: string | null
    subsector: string | null
    segment: string | null
    cnpj: string | null
    website: string | null
    logo: string | null
  }
  refreshed_at: string | null
}

export interface ScrapeExtrasFii {
  asset_type: 'fii'
  fii: {
    dividend_yield_12m: number | null
    price_to_book: number | null
    book_value_per_share: number | null
    cash_and_equivalents: number | null
    num_shareholders: number | null
    monthly_income_avg_24m: number | null
    ifix_share: number | null
    change_12m: number | null
    price: number | null
    min_price_52_weeks: number | null
    max_price_52_weeks: number | null
    anbima_segment: string | null
    anbima_type: string | null
    trading_name: string | null
    cnpj: string | null
    fund_start_date: string | null
    fund_duration: string | null
  }
  identity: {
    company_name: string | null
    sector: string | null
    subsector: string | null
    segment: string | null
    cnpj: string | null
    website: string | null
    logo: string | null
  }
  refreshed_at: string | null
}

// StatusInvest-scraped extras — rich metrics not in Brapi's shape.
// Null when the ticker hasn't been scraped yet.
export interface ScrapeExtrasStock {
  asset_type?: 'stock'
  valuation: {
    dividend_yield: number | null
    price_to_earnings: number | null
    peg_ratio: number | null
    price_to_book: number | null
    ev_ebitda: number | null
    ev_ebit: number | null
    price_to_ebitda: number | null
    price_to_ebit: number | null
    book_value_per_share: number | null
    price_to_assets: number | null
    earnings_per_share: number | null
    price_to_sales: number | null
    price_to_working_capital: number | null
    price_to_net_current_assets: number | null
    enterprise_value: number | null
    market_cap: number | null
  }
  leverage: {
    net_debt: number | null
    gross_debt: number | null
    cash_and_equivalents: number | null
    net_debt_to_ebit: number | null
    net_debt_to_ebitda: number | null
    net_debt_to_equity: number | null
    liabilities_to_assets: number | null
    equity_to_assets: number | null
    current_ratio: number | null
  }
  growth: {
    revenue_cagr_5y: number | null
    earnings_cagr_5y: number | null
  }
  quality: {
    return_on_invested_capital: number | null
    return_on_equity: number | null
    return_on_assets: number | null
    gross_margin: number | null
    ebit_margin: number | null
    ebitda_margin: number | null
    net_margin: number | null
    asset_turnover: number | null
    listing_segment: string | null
  }
  market: {
    free_float: number | null
    max_price_52_weeks: number | null
    min_price_52_weeks: number | null
    price: number | null
    shares_outstanding: number | null
  }
  identity: {
    company_name: string | null
    sector: string | null
    subsector: string | null
    segment: string | null
    cnpj: string | null
    website: string | null
    logo: string | null
  }
  refreshed_at: string | null
}

// Union — the backend discriminates with `asset_type`.
export type ScrapeExtras = ScrapeExtrasStock | ScrapeExtrasFii | ScrapeExtrasEtf

// Interface para resposta da API getTickerFundamentus
export interface FundamentusApiResponse {
  ticker: string
  scrape_extras: ScrapeExtras | null
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
