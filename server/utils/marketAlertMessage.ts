/**
 * generateMarketAlertMessage — short push-notification body for the
 * "alerta de mercado" cron. Used to live inside the legacy
 * `server/utils/agent.ts` which carried the old in-process chat
 * agent + dozens of tools. That file was deleted when the chat moved
 * to the standalone `chat-service` microservice; this module keeps
 * just the alert-string generation behind a thin Anthropic Haiku call.
 *
 * Falls back to a templated message when:
 *   - the Anthropic API key is missing, or
 *   - the SDK call fails for any reason (network, rate limit, etc.)
 * The cron must always have something to put in the notification body.
 */
import Anthropic from '@anthropic-ai/sdk'

interface AlertMarketData {
  price?: {
    market_cap?: number | null
    change?: number | null
    last_close?: number | null
    pct_change?: number | null
  } | null
  fundamentals?: {
    market_cap?: number | null
  } | null
  [key: string]: unknown
}

const STYLE = `Você escreve mensagens curtas (máx 110 chars) em português brasileiro pra notificação push de "alerta de mercado". Tom: direto, neutro, sem clickbait, sem ponto de exclamação duplo. Sem emoji. Não cite hora. Não invente número. Use o ticker e a variação fornecidos.`

function templateMessage(ticker: string, data: AlertMarketData): string {
  const change = data.price?.change ?? data.price?.pct_change ?? null
  if (change === null || change === undefined || Number.isNaN(change)) {
    return `${ticker} apresenta movimento relevante hoje. Toque para ver detalhes.`
  }
  const formatted = `${change > 0 ? '+' : ''}${change.toFixed(2).replace('.', ',')}%`
  const verb = change > 0 ? 'sobe' : 'cai'
  return `${ticker} ${verb} ${formatted} hoje. Toque para ver o motivo e o panorama.`
}

export async function generateMarketAlertMessage(
  ticker: string,
  marketData: AlertMarketData,
): Promise<string> {
  const config = useRuntimeConfig()
  const apiKey = (config as any).anthropicApiKey as string | undefined
  if (!apiKey) {
    return templateMessage(ticker, marketData)
  }

  try {
    const client = new Anthropic({ apiKey, timeout: 8_000 })
    const model =
      ((config as any).anthropicAlertModel as string | undefined) ?? 'claude-haiku-4-5'

    const change = marketData.price?.change ?? marketData.price?.pct_change ?? null
    const lastClose = marketData.price?.last_close ?? null
    const marketCap =
      marketData.price?.market_cap ?? marketData.fundamentals?.market_cap ?? null

    const userPrompt = [
      `Ticker: ${ticker}`,
      change !== null && change !== undefined
        ? `Variação dia: ${change > 0 ? '+' : ''}${Number(change).toFixed(2)}%`
        : '',
      lastClose != null ? `Último preço: ${lastClose}` : '',
      marketCap != null ? `Market cap: ${marketCap}` : '',
      '',
      'Escreva UMA frase curta para a notificação push. Direto ao ponto, sem clickbait. Termine com convite breve a abrir o app.',
    ]
      .filter(Boolean)
      .join('\n')

    const response = await client.messages.create({
      model,
      max_tokens: 80,
      temperature: 0.3,
      system: STYLE,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = response.content
      .filter((c) => c.type === 'text')
      .map((c) => (c as { text: string }).text)
      .join(' ')
      .trim()

    if (!text) return templateMessage(ticker, marketData)
    // Hard cap on length so the FCM body doesn't truncate awkwardly.
    return text.length > 130 ? text.slice(0, 127) + '…' : text
  } catch (err) {
    console.error('generateMarketAlertMessage: falling back to template', err)
    return templateMessage(ticker, marketData)
  }
}
