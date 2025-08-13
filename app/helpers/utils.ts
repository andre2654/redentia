import type { ChartTimeRange, IChartDataPoint } from '../types/chart'

// Gera dados mock para gráficos de linha
export function generateMockChartData(timeRange: ChartTimeRange, basePrice = 1000): IChartDataPoint[] {
  const getDaysFromRange = (range: ChartTimeRange): number => {
    switch (range) {
      case 'month': return 30
      case '3months': return 90
      case '6months': return 180
      case 'year': return 365
      case 'ytd': {
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        return Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
      }
      default: return 30
    }
  }
  const days = getDaysFromRange(timeRange)
  const data: IChartDataPoint[] = []
  let currentPrice = basePrice
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    // Simulação de variação de preço (-4% a +4%)
    const variation = (Math.random() - 0.5) * 0.08
    currentPrice = Math.max(currentPrice * (1 + variation), 1)
    data.push({
      date: date.toLocaleDateString('pt-BR'),
      value: Math.round(currentPrice * 100) / 100,
      timestamp: date.getTime(),
    })
  }
  return data
}
// Funções utilitárias extraídas de lógicas repetidas das páginas/components

export function isPWAInstalled(pwa: any): boolean {
  return pwa && pwa.isPWAInstalled
}

export function installPWA(pwa: any, hideInstallAppBanner?: () => void) {
  if (!pwa) return
  if (!pwa.isPWAInstalled) {
    pwa.install()
    if (hideInstallAppBanner) hideInstallAppBanner()
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
