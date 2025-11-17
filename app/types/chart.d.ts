export interface IChartDataPoint {
  date: string
  value: number
  timestamp: number
}

export interface IChartLegendItem {
  label: string
  color: string
  value?: string | number
}

export interface IChartConfig {
  data: IChartDataPoint[]
  colors: string[]
  legend: IChartLegendItem[]
}

export interface IAssetPriceHistory {
  ticker: string
  prices: IChartDataPoint[]
}

export type ChartTimeRange =
  | 'month'
  | 'year'
  | 'ytd'
  | '3months'
  | '6months'
  | '3years'
  | 'full'
