export interface IChatMessage {
  id: string
  content: string
  type: 'user' | 'bot'
  timestamp: Date
  actions?: string[]
}