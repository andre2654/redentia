import { getMarketData } from '../utils/market'
import { streamAgentResponse } from '../utils/agent'
import { routeRequest } from '../utils/router'
import { formatMarketData } from '../utils/formatter'
import {
    calculateCompoundInterest,
    calculatePlanning,
    calculateStockReturn,
} from '../utils/calculators'

type RateLimitEntry = { count: number; resetAt: number }
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const RATE_LIMIT_MAX = 30
const rateLimitByIp = new Map<string, RateLimitEntry>()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { message, route, ticker: contextTicker } = body

    const initNdjsonStream = (statusCode: number = 200) => {
        event.node.res.statusCode = statusCode
        event.node.res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
        event.node.res.setHeader('Cache-Control', 'no-store, no-transform')
        event.node.res.setHeader('X-Content-Type-Options', 'nosniff')
        event.node.res.flushHeaders?.()
    }

    const writeNdjson = (payload: any) => {
        event.node.res.write(JSON.stringify(payload) + '\n')
    }

    const requestId =
        (globalThis as any).crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const startedAt = Date.now()

    // --------------------
    // Input validation (hardening)
    // --------------------
    const MAX_MESSAGE_CHARS = 2500
    const rawMessage = typeof message === 'string' ? message : ''
    const trimmedMessage = rawMessage.trim()

    const normalizeTicker = (t: any) =>
        typeof t === 'string' ? t.trim().toUpperCase() : null
    const isValidTicker = (t: string) => /^[A-Z]{4}[0-9]{1,2}$/.test(t)
    const normalizedContextTicker = normalizeTicker(contextTicker)
    const safeContextTicker =
        normalizedContextTicker && isValidTicker(normalizedContextTicker)
            ? normalizedContextTicker
            : null

    if (!trimmedMessage) {
        initNdjsonStream(400)
        writeNdjson({ type: 'error', content: 'Mensagem inválida.' })
        event.node.res.end()
        console.log(`[chat:${requestId}] rejected_invalid_message`)
        return
    }

    if (trimmedMessage.length > MAX_MESSAGE_CHARS) {
        initNdjsonStream(413)
        writeNdjson({
            type: 'error',
            content: `Mensagem muito longa (máximo ${MAX_MESSAGE_CHARS} caracteres).`,
        })
        event.node.res.end()
        console.log(
            `[chat:${requestId}] rejected_message_too_long len=${trimmedMessage.length}`
        )
        return
    }

    // --------------------
    // Basic rate limiting (per instance / per IP)
    // --------------------
    const forwardedFor = (event.node.req.headers['x-forwarded-for'] as string) || ''
    const clientIp =
        forwardedFor.split(',')[0]?.trim() ||
        event.node.req.socket?.remoteAddress ||
        'unknown'

    const now = Date.now()
    // Lightweight cleanup to avoid unbounded growth in long-lived instances
    if (rateLimitByIp.size > 1000) {
        for (const [key, entry] of rateLimitByIp.entries()) {
            if (now > entry.resetAt) rateLimitByIp.delete(key)
        }
    }

    const existing = rateLimitByIp.get(clientIp)
    if (!existing || now > existing.resetAt) {
        rateLimitByIp.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    } else {
        existing.count += 1
        if (existing.count > RATE_LIMIT_MAX) {
            const retryAfterSeconds = Math.max(
                1,
                Math.ceil((existing.resetAt - now) / 1000)
            )
            event.node.res.setHeader('Retry-After', String(retryAfterSeconds))
            initNdjsonStream(429)
            writeNdjson({
                type: 'error',
                content: 'Muitas requisições. Tente novamente em alguns minutos.',
            })
            event.node.res.end()
            console.log(
                `[chat:${requestId}] rate_limited ip=${clientIp} retryAfterSec=${retryAfterSeconds}`
            )
            return
        }
    }

    // NDJSON streaming headers (see ADR 0002)
    initNdjsonStream(200)
    console.log(
        `[chat:${requestId}] start ip=${clientIp} route=${route || '-'} ticker=${safeContextTicker || '-'} msgLen=${trimmedMessage.length}`
    )

    // Send initial status
    writeNdjson({ type: 'status', content: '🔍 Analisando intenção...' })

    // 1. Route Request (Router Agent)
    // The router decides if this is a tool execution, a data view, or a simple chat
    const routeStartedAt = Date.now()
    const action = await routeRequest(trimmedMessage, safeContextTicker)
    console.log(
        `[chat:${requestId}] routed type=${action.type} durationMs=${Date.now() - routeStartedAt}`
    )

    let type = 'text'
    let ticker = safeContextTicker || null
    let toolResult = null
    let toolName = ''

    // Handle Router Action
    if (action.type === 'tool') {
        toolName = action.name
        console.log(`[Router] Executing tool: ${toolName}`)
        
        // Send tool status
        const toolLabel = toolName === 'calculate_planning' ? 'Planejamento Financeiro' : 
                          toolName === 'calculate_stock_return' ? 'Simulação de Rentabilidade' : 
                          'Calculadora'
        writeNdjson({ type: 'status', content: `🧮 Executando: ${toolLabel}...` })

        try {
            const ALLOWED_TOOLS = new Set([
                'calculate_compound_interest',
                'calculate_planning',
                'calculate_stock_return',
            ])

            if (!ALLOWED_TOOLS.has(toolName)) {
                throw new Error('Tool not allowed')
            }

            if (toolName === 'calculate_compound_interest') {
                const {
                    initialValue,
                    monthlyValue,
                    interestRate,
                    period,
                    periodType,
                    interestPeriod,
                } = action.args

                const toNumber = (v: any) => Number(v)
                const iv = toNumber(initialValue)
                const mv = toNumber(monthlyValue)
                const ir = toNumber(interestRate)
                const p = toNumber(period)

                if (
                    !Number.isFinite(iv) ||
                    !Number.isFinite(mv) ||
                    !Number.isFinite(ir) ||
                    !Number.isFinite(p) ||
                    p <= 0
                ) {
                    throw new Error('Parâmetros inválidos para a simulação.')
                }

                toolResult = calculateCompoundInterest(
                    iv,
                    mv,
                    ir,
                    p,
                    periodType,
                    interestPeriod
                )
            } else if (toolName === 'calculate_planning') {
                const { goalValue, monthlyContribution, strategy } = action.args
                const gv = Number(goalValue)
                const mc = Number(monthlyContribution)
                const strat =
                    strategy === 'rentabilidade' || strategy === 'seguranca'
                        ? strategy
                        : 'seguranca'

                if (!Number.isFinite(gv) || !Number.isFinite(mc) || gv <= 0 || mc <= 0) {
                    throw new Error('Parâmetros inválidos para o planejamento.')
                }

                toolResult = await calculatePlanning(
                    gv,
                    mc,
                    strat
                )
            } else if (toolName === 'calculate_stock_return') {
                const {
                    tickers,
                    ticker: singleTicker,
                    initialInvestment,
                    monthlyInvestment,
                    periodYears,
                    reinvestDividends,
                } = action.args

                // Handle both single 'ticker' (legacy/fallback) and 'tickers' array
                const rawTickers = tickers || (singleTicker ? [singleTicker] : [])
                const targetTickers = (Array.isArray(rawTickers) ? rawTickers : [])
                    .map((t: any) => normalizeTicker(t))
                    .filter((t: any) => typeof t === 'string' && isValidTicker(t))

                // Update context ticker if provided (use first one)
                if (targetTickers.length > 0) ticker = targetTickers[0]

                const ii = Number(initialInvestment)
                const mi = Number(monthlyInvestment)
                const py = Number(periodYears || 1)

                if (targetTickers.length === 0 || !Number.isFinite(py) || py <= 0) {
                    throw new Error('Parâmetros inválidos para a simulação de rentabilidade.')
                }

                toolResult = await calculateStockReturn(
                    targetTickers,
                    Number.isFinite(ii) ? ii : 0,
                    Number.isFinite(mi) ? mi : 0,
                    py, // Default to 1 year if not specified
                    reinvestDividends
                )
            }
        } catch (e) {
            console.error('Tool execution failed', e)
            writeNdjson({
                type: 'status',
                content: '⚠️ Não consegui executar a simulação. Vou responder no modo chat.',
            })
            toolResult = null
            toolName = ''
        }

    } else if (action.type === 'data') {
        console.log(`[Router] View Data: ${action.view} for ${action.ticker}`)
        const view = action.view
        const nextTicker = normalizeTicker(action.ticker)
        if (
            nextTicker &&
            isValidTicker(nextTicker) &&
            ['report', 'chart', 'dividends', 'analysis', 'price'].includes(view)
        ) {
            type = view
            ticker = nextTicker
        } else {
            type = 'text'
            ticker = safeContextTicker || null
        }
    } else if (action.type === 'chat') {
        console.log(`[Router] Chat mode`)
        type = 'text'
        const nextTicker = normalizeTicker(action.ticker)
        if (nextTicker && isValidTicker(nextTicker)) ticker = nextTicker
    }

    // Safety check: If we have an asset-specific type but NO ticker, revert to text
    if (
        ['price', 'chart', 'dividends', 'analysis', 'report'].includes(type) &&
        !ticker
    ) {
        type = 'text'
    }

    // 2. Fetch Data (if needed)
    let rawData = null
    if (ticker && type !== 'text') {
        writeNdjson({ type: 'status', content: `📊 Buscando dados de ${ticker}...` })
        try {
            const fetchStartedAt = Date.now()
            rawData = await getMarketData(ticker, type)
            console.log(
                `[chat:${requestId}] market_data type=${type} ok=${!!rawData} durationMs=${Date.now() - fetchStartedAt}`
            )
        } catch (e) {
            console.error('Error fetching market data', e)
        }
    }

    // Send Structured Data for Views (Report, Chart, etc.)
    if (rawData && type !== 'text') {
        const structuredData = {
            ticker,
            type,
            data: formatMarketData(type, rawData),
            meta: {
                summary: '',
                recommendation: null,
            },
        }
        writeNdjson({ type: 'data', content: structuredData })
    }

    // Generate Suggestions
    const suggestions = generateSuggestions(action, ticker, toolName)
    if (suggestions.length > 0) {
        writeNdjson({ type: 'suggestions', content: suggestions })
    }

    // 3. Stream Response (Agent)
    writeNdjson({ type: 'status', content: '✅ Gerando resposta...' })
    await streamAgentResponse(
        event,
        ticker,
        type,
        rawData,
        trimmedMessage,
        toolResult,
        toolName,
        requestId
    )

    event.node.res.end()
    console.log(
        `[chat:${requestId}] done durationMs=${Date.now() - startedAt} type=${type} ticker=${ticker || '-'} tool=${toolName || '-'}`
    )

function generateSuggestions(action: any, ticker: string | null, toolName: string) {
    const suggestions: string[] = []

    if (ticker) {
        suggestions.push(`Ver dividendos de ${ticker}`)
        suggestions.push(`Análise técnica de ${ticker}`)
        suggestions.push(`Comparar ${ticker} com concorrentes`)
    }

    if (toolName === 'calculate_planning') {
        suggestions.push('Refazer com estratégia de segurança')
        suggestions.push('Aumentar aporte mensal')
    } else if (toolName === 'calculate_stock_return') {
        suggestions.push('Ver gráfico de dividendos')
        suggestions.push('Simular com reinvestimento')
    }

    if (action.type === 'chat' && !ticker) {
        suggestions.push('Simular rentabilidade de ações')
        suggestions.push('Planejamento de aposentadoria')
        suggestions.push('Cotação do Dólar')
    }

    return suggestions.slice(0, 3)
}
})
