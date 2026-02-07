export interface PortfolioPosition {
  id?: number
  user_id?: number
  ticker: string
  quantity: number
  average_price: number
  source?: string
}

export interface PortfolioSector {
  label: string
  actualValue: number
  actualPercent: number
  idealPercent: number
}

export interface PortfolioInsight {
  title: string
  message: string
}

export interface PortfolioComposition {
  sectors: PortfolioSector[]
  totalValue: number
  insight: PortfolioInsight | null
}

export const usePortfolioService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  async function getPositions(): Promise<{ positions: PortfolioPosition[] }> {
    return authFetch(`${baseURL}/portfolio`, { method: 'GET' }) as Promise<{ positions: PortfolioPosition[] }>
  }

  async function getComposition(): Promise<PortfolioComposition> {
    return authFetch(`${baseURL}/portfolio/composition`, { method: 'GET' }) as Promise<PortfolioComposition>
  }

  async function uploadPositions(positions: { ticker: string; quantity: number; average_price: number }[]): Promise<{ message: string; imported: number }> {
    return authFetch(`${baseURL}/portfolio/upload`, {
      method: 'POST',
      body: { positions },
    }) as Promise<{ message: string; imported: number }>
  }

  return { getPositions, getComposition, uploadPositions }
}
