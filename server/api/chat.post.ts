import { streamChatWithTools } from '../utils/agent'

type RateLimitEntry = { count: number; resetAt: number }
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const RATE_LIMIT_MAX = 30
const rateLimitByIp = new Map<string, RateLimitEntry>()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { message, route, ticker: contextTicker, history } = body

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
    const HISTORY_LIMIT = 6
    const HISTORY_MAX_CHARS = 800
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

    // Validate and sanitize history (optional)
    const safeHistory = Array.isArray(history)
        ? history
            .slice(-HISTORY_LIMIT)
            .map((h: any) => ({
                role: h?.role === 'assistant' ? 'assistant' : 'user',
                content:
                    typeof h?.content === 'string'
                        ? h.content.trim().slice(0, HISTORY_MAX_CHARS)
                        : '',
            }))
            .filter((h: any) => h.content.length > 0)
        : []

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
    await streamChatWithTools(
        event,
        trimmedMessage,
        route,
        safeContextTicker,
        safeHistory,
        requestId
    )

    event.node.res.end()
    console.log(
        `[chat:${requestId}] done durationMs=${Date.now() - startedAt}`
    )

})
