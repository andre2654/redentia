import { getMarketData } from '../utils/market'
import { streamAgentResponse, identifyTicker, identifyIntent } from '../utils/agent'
import { formatMarketData } from '../utils/formatter'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { message, route, ticker: contextTicker } = body

    // 1. Determine Intent & Ticker
    let type = 'text'
    let ticker = contextTicker || null

    const lowerMsg = message.toLowerCase()

    const tickerMatch = message.match(/[A-Z]{4}[0-9]{1,2}/i)
    if (tickerMatch) {
        ticker = tickerMatch[0].toUpperCase()
    } else if (!ticker) {
        // Try to identify ticker via AI if not found by regex and not in context
        ticker = await identifyTicker(message)
    }

    // Identify intent using AI
    type = await identifyIntent(message)

    // Keyword overrides (Hybrid approach: AI + Deterministic)
    // This ensures explicit requests like "relatório completo" or "gráfico" always work, even with typos or AI misses
    if (lowerMsg.includes('relatório') || lowerMsg.includes('relatorio') || lowerMsg.includes('completo') || lowerMsg.includes('completa') || lowerMsg.includes('resumo') || lowerMsg.includes('tudo sobre')) {
        type = 'report'
    } else if (lowerMsg.includes('gráfico') || lowerMsg.includes('grafico') || lowerMsg.includes('histórico') || lowerMsg.includes('historico')) {
        type = 'chart'
    } else if (lowerMsg.includes('dividendo') || lowerMsg.includes('provento')) {
        type = 'dividends'
    }

    // Fallback: if AI returns 'text' but we have a ticker, default to analysis (lighter than report)
    // unless the message is very short (likely just the ticker), then show report
    if (type === 'text' && ticker) {
        if (message.split(' ').length <= 2) {
            type = 'report'
        } else {
            type = 'analysis'
        }
    }

    // Safety check: If we have an asset-specific type but NO ticker, revert to text
    // This prevents showing empty charts/reports for general questions like "Como está o mercado?"
    if (['price', 'chart', 'dividends', 'analysis', 'report'].includes(type) && !ticker) {
        type = 'text'
    }

    // 2. Fetch Data
    let rawData = null
    if (ticker && type !== 'text') {
        try {
            rawData = await getMarketData(ticker, type)
        } catch (e) {
            console.error('Error fetching market data', e)
        }
    }

    // 3. Prepare Structured Data (Deterministic)
    const structuredData = {
        ticker,
        type,
        data: formatMarketData(type, rawData),
        meta: {
            summary: '', // Will be filled by stream
            recommendation: null
        }
    }

    // 4. Start Stream
    event.node.res.setHeader('Content-Type', 'application/x-ndjson')
    event.node.res.setHeader('Cache-Control', 'no-cache')
    event.node.res.setHeader('Connection', 'keep-alive')

    // Send initial data event
    event.node.res.write(JSON.stringify({ type: 'data', content: structuredData }) + '\n')

    // Stream AI response
    await streamAgentResponse(event, ticker, type, rawData, message)

    event.node.res.end()
})
