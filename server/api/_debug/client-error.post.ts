// Collector for client-side errors intercepted by
// `plugins/silence-hydration-errors.client.ts`. Appends each event to
// Vercel function logs so we can later triage via `vercel logs`.
//
// Intentionally cheap: no DB write, no auth, no rate limit. If this
// gets abused publicly we'll add a Nitro storage-based rate limit,
// but the payload shape is small (< 5KB) and the endpoint just prints.
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  if (!body || typeof body !== 'object') {
    return { ok: false }
  }
  const b = body as Record<string, unknown>
  const summary = {
    kind: b.kind,
    message: typeof b.message === 'string' ? b.message.slice(0, 400) : null,
    info: b.info,
    url: b.url,
    ua: typeof b.ua === 'string' ? b.ua.slice(0, 250) : null,
    stackHead: typeof b.stack === 'string' ? b.stack.split('\n').slice(0, 5).join(' | ') : null,
  }
  // One line per event — easier to grep in Vercel log UI.
  // eslint-disable-next-line no-console
  console.error('[client-error collected]', JSON.stringify(summary))
  return { ok: true }
})
