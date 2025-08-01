import type { IChartDataPoint } from './chart';

export interface IAsset {
    stock: string,
    name: string,
    close: number,
    change: number
    volume: number
    market_cap: number
    logo?: string
    sector?: string
    type?: 'stock' | 'fund' | 'bdr'
    priceHistory?: IChartDataPoint[]
}