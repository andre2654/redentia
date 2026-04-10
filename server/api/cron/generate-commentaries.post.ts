import { generateCommentary, type CommentaryCandidate } from '../../utils/marketCommentary'

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
  const errors: string[] = []

  // 2. Generate + store commentaries sequentially (parallel would hit rate limits)
  for (const candidate of candidates) {
    try {
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
      console.log(
        `[cron:commentaries] Generated ${candidate.scope}:${candidate.identifier} — ${result.title}`
      )

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
    failed,
    total: candidates.length,
    errors: errors.length > 0 ? errors : undefined,
  }
})
