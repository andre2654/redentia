/**
 * Read backfill progress status for a ticker.
 *
 * GET /api/commentaries/backfill-status?ticker=BBAS3
 *
 * Returns the current backfill progress or null if not found.
 * Used by the frontend to poll progress while backfill runs.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawTicker = ((query?.ticker as string) || '').toUpperCase().trim()

  if (!rawTicker || !/^[A-Z]{4}[0-9]{1,2}$/.test(rawTicker)) {
    throw createError({ statusCode: 400, message: 'ticker inválido' })
  }

  const storage = useStorage('backfill')
  const status = await storage.getItem<{
    running: boolean
    total: number
    current: number
    done: boolean
    startedAt: number
    updatedAt: number
  }>(`${rawTicker}:status`)

  if (!status) {
    return {
      status: {
        running: false,
        total: 0,
        current: 0,
        done: false,
      },
    }
  }

  // Stale detection: if "running" but not updated in 5 min, consider it dead
  const staleThreshold = 5 * 60 * 1000
  if (status.running && Date.now() - status.updatedAt > staleThreshold) {
    return {
      status: {
        ...status,
        running: false,
        done: true,
      },
      stale: true,
    }
  }

  return { status }
})
