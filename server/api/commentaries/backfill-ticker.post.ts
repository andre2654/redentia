import { generateCommentary, type CommentaryCandidate } from '../../utils/marketCommentary'
import {
  resolveValidSiblings,
  fetchSiblingPriceSeries,
  fetchExistingCommentaryDates,
  type SiblingInfo,
  type SiblingPriceRow,
} from '../../utils/tickerSiblings'

/**
 * Historical backfill for a specific ticker.
 *
 * Finds days in the last 90 days where |change_percent| >= 2%,
 * deduplicates against existing commentaries, and generates up to
 * 10 new commentaries via Claude + web_search.
 *
 * Guards:
 *  - Rate limited: once per ticker per 24h (Nitro storage cooldown)
 *  - Max 10 generations per request (hard cost cap)
 *  - Sequential with 500ms delay to avoid rate limits
 *  - Fire-and-forget: returns immediately, processing happens in background
 */

const RATE_LIMIT_MS = 24 * 60 * 60 * 1000 // 24h
const MAX_GENERATIONS = 10
const MIN_CHANGE_PERCENT = 2.0
const HISTORY_MODE = '3mo' // ~90 dias
const DELAY_BETWEEN_GENS_MS = 500

interface BackfillStatus {
  running: boolean
  total: number
  current: number
  done: boolean
  startedAt: number
  updatedAt: number
  error?: string
}

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

  const storage = useStorage('backfill')

  // Rate limit check — skip if ran in last 24h
  const lastRun = await storage.getItem<number>(`${rawTicker}:lastRun`)
  if (lastRun && Date.now() - lastRun < RATE_LIMIT_MS) {
    const hoursLeft = Math.round(
      (RATE_LIMIT_MS - (Date.now() - lastRun)) / 1000 / 60 / 60
    )
    return {
      skipped: true,
      reason: 'rate_limited',
      message: `Backfill já executado recentemente. Novo run em ~${hoursLeft}h.`,
    }
  }

  // If status shows running already, skip
  const currentStatus = await storage.getItem<BackfillStatus>(`${rawTicker}:status`)
  if (currentStatus?.running && Date.now() - currentStatus.updatedAt < 5 * 60 * 1000) {
    return {
      skipped: true,
      reason: 'already_running',
      message: 'Backfill já em progresso.',
      status: currentStatus,
    }
  }

  // 1. Fetch historical prices (last 3 months) with change_percent
  let prices: any[] = []
  try {
    const pricesRes = await $fetch<{ data: any[] }>(
      `${apiBase}/tickers/${rawTicker}/prices?mode=${HISTORY_MODE}`
    )
    prices = pricesRes?.data || []
  } catch (err) {
    throw createError({
      statusCode: 502,
      message: `Falha ao buscar histórico de ${rawTicker}`,
    })
  }

  if (prices.length === 0) {
    return { queued: 0, message: 'Nenhum histórico disponível', total: 0 }
  }

  // 2. Filter to volatile days (|change| >= 2%)
  const volatileDays = prices
    .filter((p) => {
      const cp = Number(p.change_percent)
      return Number.isFinite(cp) && Math.abs(cp) >= MIN_CHANGE_PERCENT
    })
    .sort((a, b) => (a.price_at < b.price_at ? 1 : -1)) // DESC (newest first)

  if (volatileDays.length === 0) {
    // Still mark as run to respect rate limit (user won't re-trigger expensive fetch)
    await storage.setItem(`${rawTicker}:lastRun`, Date.now())
    return {
      queued: 0,
      total: 0,
      message: `Sem dias com variação >= ${MIN_CHANGE_PERCENT}% nos últimos 90 dias.`,
    }
  }

  // 3. Fetch existing ticker commentaries to dedupe
  let existingDates = new Set<string>()
  try {
    const existingRes = await $fetch<{ data: any[] }>(
      `${apiBase}/market-commentaries`,
      {
        query: {
          scope: 'ticker',
          identifier: rawTicker,
          from: volatileDays[volatileDays.length - 1].price_at,
          to: volatileDays[0].price_at,
          limit: 200,
        },
      }
    )
    existingDates = new Set(
      (existingRes?.data || []).map((c) => String(c.date).slice(0, 10))
    )
  } catch {
    // If listing fails, proceed optimistically — unique index will dedupe on POST
  }

  // 4. Pick missing dates, cap at MAX_GENERATIONS (most recent first)
  const missing = volatileDays.filter(
    (p) => !existingDates.has(String(p.price_at).slice(0, 10))
  )
  const toGenerate = missing.slice(0, MAX_GENERATIONS)

  if (toGenerate.length === 0) {
    await storage.setItem(`${rawTicker}:lastRun`, Date.now())
    return {
      queued: 0,
      total: volatileDays.length,
      existing: existingDates.size,
      message: 'Todas as datas voláteis já têm análise.',
    }
  }

  // 5. Also fetch ticker profile for context (name + sector)
  let tickerName = rawTicker
  let tickerSector: string | null = null
  try {
    const profileRes = await $fetch<{ data: any }>(
      `${apiBase}/tickers/${rawTicker}`
    )
    tickerName = profileRes?.data?.name || profileRes?.data?.full_name || rawTicker
    tickerSector =
      profileRes?.data?.company_profile?.sector ||
      profileRes?.data?.sector ||
      null
  } catch {}

  // 5b. Resolve sibling tickers (same company, different share class).
  // Each commentary generated for the primary ticker will be propagated
  // to all siblings with their own change_percent/OHLCV.
  let siblings: SiblingInfo[] = []
  const siblingSeries = new Map<string, Map<string, SiblingPriceRow>>()
  const siblingExistingDates = new Map<string, Set<string>>()
  try {
    siblings = await resolveValidSiblings(rawTicker, apiBase)
    if (siblings.length > 0) {
      const fromDate = volatileDays[volatileDays.length - 1].price_at
      const toDate = volatileDays[0].price_at
      await Promise.all(
        siblings.map(async (s) => {
          const [series, existing] = await Promise.all([
            fetchSiblingPriceSeries(s.ticker, apiBase, HISTORY_MODE as any),
            fetchExistingCommentaryDates(s.ticker, fromDate, toDate, apiBase),
          ])
          siblingSeries.set(s.ticker, series)
          siblingExistingDates.set(s.ticker, existing)
        })
      )
      console.log(
        `[backfill:${rawTicker}] siblings resolved: ${siblings.map((s) => s.ticker).join(', ')}`
      )
    }
  } catch (err) {
    console.error(`[backfill:${rawTicker}] sibling resolution failed:`, err)
  }

  // 6. Initialize status
  const initialStatus: BackfillStatus = {
    running: true,
    total: toGenerate.length,
    current: 0,
    done: false,
    startedAt: Date.now(),
    updatedAt: Date.now(),
  }
  await storage.setItem(`${rawTicker}:status`, initialStatus)
  await storage.setItem(`${rawTicker}:lastRun`, Date.now())

  // 7. Fire-and-forget async loop — don't await from the handler
  // The handler returns immediately, loop runs in background.
  const runBackfill = async () => {
    let generated = 0
    let failed = 0

    for (const day of toGenerate) {
      try {
        const dateStr = String(day.price_at).slice(0, 10)
        const candidate: CommentaryCandidate = {
          scope: 'ticker',
          identifier: rawTicker,
          date: dateStr,
          change_percent: Number(day.change_percent) || 0,
          context_data: {
            ticker: rawTicker,
            name: tickerName,
            sector: tickerSector,
            open: Number(day.open) || 0,
            high: Number(day.high) || 0,
            low: Number(day.low) || 0,
            close: Number(day.market_price) || 0,
            volume: Number(day.volume) || 0,
            change_percent: Number(day.change_percent) || 0,
          },
        }

        const result = await generateCommentary(candidate)
        if (result) {
          // Save for primary ticker
          await $fetch(`${apiBase}/market-commentaries`, {
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
          }).catch((err) => {
            console.error(
              `[backfill:${rawTicker}] save failed for ${dateStr}:`,
              err?.data || err?.message
            )
          })
          generated++

          // Propagate to siblings — same news applies, each with its own OHLCV.
          // Skip siblings that already have a commentary for this date.
          for (const sibling of siblings) {
            const existing = siblingExistingDates.get(sibling.ticker)
            if (existing?.has(dateStr)) continue

            const siblingPrice = siblingSeries.get(sibling.ticker)?.get(dateStr)
            if (!siblingPrice) continue // No trading data — skip

            const siblingContext = {
              ticker: sibling.ticker,
              name: sibling.name,
              sector: sibling.sector,
              open: siblingPrice.open,
              high: siblingPrice.high,
              low: siblingPrice.low,
              close: siblingPrice.close,
              volume: siblingPrice.volume,
              change_percent: siblingPrice.change_percent,
            }

            await $fetch(`${apiBase}/market-commentaries`, {
              method: 'POST',
              headers: { 'x-internal-key': internalKey },
              body: {
                scope: 'ticker',
                identifier: sibling.ticker,
                date: dateStr,
                change_percent: siblingPrice.change_percent,
                title: result.title,
                commentary: result.commentary,
                context_data: siblingContext,
                sources: result.sources,
                ai_model: model,
              },
            })
              .then(() => {
                existing?.add(dateStr)
                console.log(
                  `[backfill:${rawTicker}] propagated to ${sibling.ticker} (${dateStr})`
                )
              })
              .catch((err) => {
                // Unique index conflict = already exists, that's fine
                const status = err?.response?.status || err?.statusCode
                if (status !== 409 && status !== 422) {
                  console.error(
                    `[backfill:${rawTicker}] sibling save failed (${sibling.ticker}, ${dateStr}):`,
                    err?.data || err?.message
                  )
                }
              })
          }
        } else {
          failed++
        }
      } catch (err: any) {
        failed++
        console.error(`[backfill:${rawTicker}] gen error:`, err?.message || err)
      }

      // Update status
      await storage.setItem(`${rawTicker}:status`, {
        running: true,
        total: toGenerate.length,
        current: generated + failed,
        done: false,
        startedAt: initialStatus.startedAt,
        updatedAt: Date.now(),
      } satisfies BackfillStatus)

      // Delay between calls
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_GENS_MS))
    }

    // Mark done
    await storage.setItem(`${rawTicker}:status`, {
      running: false,
      total: toGenerate.length,
      current: generated + failed,
      done: true,
      startedAt: initialStatus.startedAt,
      updatedAt: Date.now(),
    } satisfies BackfillStatus)

    console.log(
      `[backfill:${rawTicker}] done. generated=${generated} failed=${failed} total=${toGenerate.length}`
    )
  }

  // Kick off async (do NOT await)
  runBackfill().catch((err) => {
    console.error(`[backfill:${rawTicker}] fatal error:`, err)
  })

  // Return immediately
  return {
    queued: toGenerate.length,
    total: volatileDays.length,
    existing: existingDates.size,
    message: `Backfill iniciado: gerando ${toGenerate.length} análises.`,
  }
})
