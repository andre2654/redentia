export interface IChatMessage {
  id: string
  content: string
  type: 'user' | 'bot'
  timestamp: Date
  actions?: string[]
  status?: string
  suggestions?: string[]
  // New fields for structured response
  structuredData?: IAgentResponse
}

export interface IAgentResponse {
  status: 'success' | 'error'
  ticker?: string
  type: 'price' | 'chart' | 'dividends' | 'analysis' | 'text' | 'report'
  data?: any
  meta?: {
    summary?: string
    recommendation?: 'buy' | 'hold' | 'sell' | null
  }
  relatedTickers?: Array<{
    ticker: string
    name: string
    logo: string
    change: string
  }>
  toolsUsed?: Array<{
    name: string
    result: any
  }>
  message?: string // for error or simple text
}
