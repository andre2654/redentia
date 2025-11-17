import type {
  IChartConfig,
  IChartDataPoint,
  ChartTimeRange,
} from '~/types/chart'

export const useChartData = () => {
  // Mock data generator para simular dados reais
  const generateMockPriceData = (
    ticker: string,
    days: number = 30
  ): IChartDataPoint[] => {
    const data: IChartDataPoint[] = []
    const basePrice = Math.random() * 100 + 50 // Preço base entre 50-150
    let currentPrice = basePrice

    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Simula variação de preço (-5% a +5%)
      const variation = (Math.random() - 0.5) * 0.1
      currentPrice = Math.max(currentPrice * (1 + variation), 1)

      data.push({
        date: date.toLocaleDateString('pt-BR'),
        value: Math.round(currentPrice * 100) / 100,
        timestamp: date.getTime(),
      })
    }

    return data
  }

  const getTimeRangeDays = (range: ChartTimeRange): number => {
    switch (range) {
      case 'month':
        return 30
      case '3months':
        return 90
      case '6months':
        return 180
      case 'year':
        return 365
      case 'ytd': {
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        return Math.ceil(
          (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
        )
      }
      default:
        return 30
    }
  }

  const formatChartData = (
    priceData: IChartDataPoint[],
    ticker: string
  ): IChartConfig => {
    const currentPrice = priceData[priceData.length - 1]?.value || 0
    const previousPrice = priceData[priceData.length - 2]?.value || currentPrice
    const change = currentPrice - previousPrice

    const color = change >= 0 ? '#b9ecc1' : '#8E3939'

    return {
      data: priceData,
      colors: [color],
      legend: [
        {
          label: ticker.toUpperCase(),
          color,
          value: `R$ ${currentPrice.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        },
      ],
    }
  }

  const getChartConfig = (
    ticker: string,
    timeRange: ChartTimeRange = 'month'
  ): IChartConfig => {
    const days = getTimeRangeDays(timeRange)
    const mockData = generateMockPriceData(ticker, days)
    return formatChartData(mockData, ticker)
  }

  const formatTooltipValue = (value: number): string => {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatAxisLabel = (
    dateString: string,
    timeRange: ChartTimeRange
  ): string => {
    const date = new Date(dateString.split('/').reverse().join('-'))

    switch (timeRange) {
      case 'month':
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        })
      case 'year':
      case 'ytd':
        return date.toLocaleDateString('pt-BR', {
          month: 'short',
          year: '2-digit',
        })
      default:
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        })
    }
  }

  return {
    generateMockPriceData,
    getChartConfig,
    formatChartData,
    formatTooltipValue,
    formatAxisLabel,
    getTimeRangeDays,
  }
}
