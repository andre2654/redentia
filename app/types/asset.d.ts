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