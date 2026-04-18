import { generateCommentary, type CommentaryCandidate } from '../../utils/marketCommentary'
import { resolveValidSiblings } from '../../utils/tickerSiblings'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Protect with internal key
  const providedKey = getHeader(event, 'x-internal-key')
  const expectedKey = (config as any).internalApiKey
  if (!expectedKey || providedKey !== expectedKey) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const body = await readBody(event).catch(() => ({}))
  const date = body?.date as string | undefined
  if (!date) {
    throw createError({ statusCode: 400, message: 'date is required (YYYY-MM-DD)' })
  }

  const apiBase = config.public?.apiBaseUrl as string
  if (!apiBase) {
    throw createError({ statusCode: 500, message: 'apiBaseUrl not configured' })
  }

  // 1. Fetch candidates from backend
  const candidatesResp = await $fetch<{ data: CommentaryCandidate[] }>(
    `${apiBase}/market-commentaries/candidates/${date}`,
    {
      headers: { 'x-internal-key': expectedKey },
    }
  ).catch((err) => {
    console.error('[cron:commentaries] Failed to fetch candidates:', err)
    return { data: [] }
  })

  const candidates = candidatesResp?.data || []
  if (candidates.length === 0) {
    return { generated: 0, total: 0, message: 'No candidates for this date' }
  }

  console.log(`[cron:commentaries] Found ${candidates.length} candidates for ${date}`)

  const model =
    (config as any).anthropicCommentaryModel || 'claude-sonnet-4-5'

  let generated = 0
  let failed = 0
  let propagated = 0
  const errors: string[] = []

  // Track which (scope:identifier:date) combos we've already saved so the
  // sibling propagation step doesn't double-save when the candidates list
  // already contains both siblings organically.
  const savedKeys = new Set<string>()

  // 2. Generate + store commentaries sequentially (parallel would hit rate limits)
  for (const candidate of candidates) {
    try {
      const key = `${candidate.scope}:${candidate.identifier}:${candidate.date}`
      if (savedKeys.has(key)) continue

      const result = await generateCommentary(candidate)
      if (!result) {
        failed++
        errors.push(`${candidate.scope}:${candidate.identifier} (generation returned null)`)
        continue
      }

      await $fetch(`${apiBase}/market-commentaries`, {
        method: 'POST',
        headers: { 'x-internal-key': expectedKey },
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
      })

      generated++
      savedKeys.add(key)
      console.log(
        `[cron:commentaries] Generated ${candidate.scope}:${candidate.identifier} — ${result.title}`
      )

      // Propagate to sibling tickers (PETR3 ↔ PETR4, ITUB3 ↔ ITUB4, etc).
      // Share classes of the same company share all company-level news, so
      // generating once and copying (with each sibling's own OHLCV) keeps
      // the "movimentos notáveis" grid symmetrical even when only one
      // sibling cleared the 2.5% + R$1M liquidity cutoff.
      if (candidate.scope === 'ticker') {
        try {
          const siblings = await resolveValidSiblings(candidate.identifier, apiBase)
          for (const sibling of siblings) {
            const siblingKey = `ticker:${sibling.ticker}:${candidate.date}`
            if (savedKeys.has(siblingKey)) continue

            // Fetch this sibling's own price for the candidate's date
            const siblingPriceRes = await $fetch<{ data: any[] }>(
              `${apiBase}/tickers/${sibling.ticker}/prices?mode=1mo`
            ).catch(() => ({ data: [] }))

            const siblingRow = (siblingPriceRes?.data || []).find(
              (r: any) => String(r.price_at).slice(0, 10) === candidate.date
            )
            if (!siblingRow) continue

            const siblingContext = {
              ticker: sibling.ticker,
              name: sibling.name,
              sector: sibling.sector,
              open: Number(siblingRow.open) || 0,
              high: Number(siblingRow.high) || 0,
              low: Number(siblingRow.low) || 0,
              close: Number(siblingRow.market_price) || 0,
              volume: Number(siblingRow.volume) || 0,
              change_percent: Number(siblingRow.change_percent) || 0,
            }

            await $fetch(`${apiBase}/market-commentaries`, {
              method: 'POST',
              headers: { 'x-internal-key': expectedKey },
              body: {
                scope: 'ticker',
                identifier: sibling.ticker,
                date: candidate.date,
                change_percent: siblingContext.change_percent,
                title: result.title,
                commentary: result.commentary,
                context_data: siblingContext,
                sources: result.sources,
                ai_model: model,
              },
            })
              .then(() => {
                savedKeys.add(siblingKey)
                propagated++
                console.log(
                  `[cron:commentaries] Propagated to ${sibling.ticker} (${candidate.date})`
                )
              })
              .catch((err: any) => {
                const status = err?.response?.status || err?.statusCode
                if (status !== 409 && status !== 422) {
                  console.error(
                    `[cron:commentaries] sibling propagation failed (${sibling.ticker}):`,
                    err?.data || err?.message
                  )
                }
              })
          }
        } catch (err: any) {
          console.error(
            `[cron:commentaries] sibling resolve error for ${candidate.identifier}:`,
            err?.message || err
          )
        }
      }

      // Small delay between generations to avoid rate limits
      await new Promise((r) => setTimeout(r, 500))
    } catch (err: any) {
      failed++
      errors.push(`${candidate.scope}:${candidate.identifier} (${err?.message || 'unknown'})`)
      console.error(
        `[cron:commentaries] Error for ${candidate.scope}:${candidate.identifier}:`,
        err
      )
    }
  }

  return {
    generated,
    propagated,
    failed,
    total: candidates.length,
    errors: errors.length > 0 ? errors : undefined,
  }
})
