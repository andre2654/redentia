import { generateCommentary, type CommentaryCandidate } from '../../utils/marketCommentary'
import { resolveValidSiblings } from '../../utils/tickerSiblings'

/**
 * On-demand ticker commentary generation.
 *
 * Called from the asset page when no ticker-specific commentary exists
 * for today. Fetches the current ticker data, calls Claude with web_search
 * to generate a specific commentary, and saves to the backend.
 *
 * The result is cached per (ticker, date) in the backend, so subsequent
 * calls return immediately with { created: false }.
 *
 * No auth: public endpoint (rate-limited by Laravel API throttle).
 * Cost control: each call generates at most 1 commentary per ticker per day.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const rawTicker = (body?.ticker || '').toString().toUpperCase().trim()

  if (!rawTicker || !/^[A-Z]{4}[0-9]{1,2}$/.test(rawTicker)) {
    throw createError({ statusCode: 400, message: 'ticker inválido' })
  }

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBaseUrl as string
  const internalKey = (config as any).internalApiKey
  const model = (config as any).anthropicCommentaryModel || 'claude-sonnet-4-5'

  if (!internalKey) {
    throw createError({ statusCode: 500, message: 'internal key not configured' })
  }

  // 1. Fetch current ticker profile (includes latest price + company data)
  const tickerRes = await $fetch<{ data: any }>(
    `${apiBase}/tickers/${rawTicker}`
  ).catch(() => null)

  if (!tickerRes?.data) {
    throw createError({ statusCode: 404, message: 'ticker não encontrado' })
  }

  const data: any = tickerRes.data
  // The shape is { ticker, name, logo, type, price: {...}, company_profile: {...} }
  const price = data.price || {}
  const profile = data.company_profile || {}
  const priceAt = price.price_at || new Date().toISOString().slice(0, 10)
  // Normalize: take only YYYY-MM-DD
  const date = priceAt.slice(0, 10)

  // 2. Check if commentary already exists (avoid duplicate generation)
  const existingRes = await $fetch<{ data: any[] }>(
    `${apiBase}/market-commentaries`,
    {
      query: { scope: 'ticker', identifier: rawTicker, from: date, to: date, limit: 1 },
    }
  ).catch(() => ({ data: [] }))

  if (existingRes.data && existingRes.data.length > 0) {
    return { commentary: existingRes.data[0], created: false }
  }

  // 3. Build candidate with actual market data
  const candidate: CommentaryCandidate = {
    scope: 'ticker',
    identifier: rawTicker,
    date,
    change_percent: Number(price.change_percent) || 0,
    context_data: {
      ticker: rawTicker,
      name: data.name || data.full_name || rawTicker,
      sector: profile.sector || null,
      industry: profile.industry_category || null,
      open: Number(price.open) || 0,
      high: Number(price.high) || 0,
      low: Number(price.low) || 0,
      close: Number(price.market_price) || 0,
      volume: Number(price.volume) || 0,
      change_percent: Number(price.change_percent) || 0,
      market_cap: Number(price.market_cap) || 0,
    },
  }

  // 4. Generate commentary with Claude + web_search
  const result = await generateCommentary(candidate)
  if (!result) {
    throw createError({
      statusCode: 500,
      message: 'Falha ao gerar análise. Tente novamente em instantes.',
    })
  }

  // 5. Save to backend
  try {
    const saveRes = await $fetch<{ data: any }>(
      `${apiBase}/market-commentaries`,
      {
        method: 'POST',
        headers: { 'x-internal-key': internalKey },
        body: {
          scope: candidate.scope,
          identifier: candidate.identifier,
          date: candidate.date,
          change_percent: candidate.change_percent,
          title: result.title,
          commentary: result.commentary,
          context_data: candidate.context_data,
          sources: result.sources,
          ai_model: model,
        },
      }
    )
    // Propagate to sibling tickers (same company, different share class).
    // Same news applies — fetch each sibling's own price for today and save.
    try {
      const siblings = await resolveValidSiblings(rawTicker, apiBase)
      await Promise.all(
        siblings.map(async (sibling) => {
          // Fetch sibling profile for its specific price.change_percent today
          const siblingRes = await $fetch<{ data: any }>(
            `${apiBase}/tickers/${sibling.ticker}`
          ).catch(() => null)
          if (!siblingRes?.data) return

          const sp = siblingRes.data.price || {}
          const siblingDate = String(sp.price_at || date).slice(0, 10)
          if (siblingDate !== date) return // Different trading day, skip

          const siblingContext = {
            ticker: sibling.ticker,
            name: sibling.name,
            sector: sibling.sector,
            open: Number(sp.open) || 0,
            high: Number(sp.high) || 0,
            low: Number(sp.low) || 0,
            close: Number(sp.market_price) || 0,
            volume: Number(sp.volume) || 0,
            change_percent: Number(sp.change_percent) || 0,
            market_cap: Number(sp.market_cap) || 0,
          }

          await $fetch(`${apiBase}/market-commentaries`, {
            method: 'POST',
            headers: { 'x-internal-key': internalKey },
            body: {
              scope: 'ticker',
              identifier: sibling.ticker,
              date,
              change_percent: Number(sp.change_percent) || 0,
              title: result.title,
              commentary: result.commentary,
              context_data: siblingContext,
              sources: result.sources,
              ai_model: model,
            },
          }).catch((err) => {
            const status = err?.response?.status || err?.statusCode
            if (status !== 409 && status !== 422) {
              console.error(
                `[commentaries] sibling propagation failed (${sibling.ticker}):`,
                err?.data || err?.message
              )
            }
          })
        })
      )
    } catch (err) {
      console.error(`[commentaries] sibling resolve error:`, err)
    }

    return { commentary: saveRes.data, created: true }
  } catch (error: any) {
    console.error(
      `[commentaries] Failed to save ticker commentary for ${rawTicker}:`,
      error?.data || error?.message
    )
    throw createError({
      statusCode: 500,
      message: 'Falha ao salvar análise.',
    })
  }
})
