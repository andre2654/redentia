export interface IMarketCommentary {
  id: number
  scope: 'index' | 'sector' | 'ticker'
  identifier: string
  date: string
  change_percent: number
  title: string
  commentary: string
  context_data?: Record<string, any>
  sources?: Array<{ url: string; title: string }>
  ai_model: string
  type?: 'primary' | 'sector' | 'macro'
  created_at: string
  updated_at: string
}
