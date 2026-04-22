// Subdomain router: requests to `embed.redentia.com.br` (or
// `embed.localhost` / `embed.redentia.localhost` in dev) são internamente
// reescritos pra servir as páginas de `/embed/*`.
//
// Diferente dos outros product subdomains (creative, api, whitelabel), o
// `embed` tem landing page indexável no SEO (objetivo: ranquear pra
// "widgets de cotação", "embed ações B3", "calculadora embed", etc.).
//
// Ver api-subdomain.ts pra histórico do motivo de usar proxy via
// `$fetch` absoluto em vez de mutação de URL.

const EMBED_HOSTS = [
  'embed.redentia.com.br',
  'embed.localhost',
  'embed.redentia.localhost',
]

function isEmbedHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return EMBED_HOSTS.includes(clean)
}

function targetOrigin(host: string): string {
  const clean = host.split(':')[0].toLowerCase()
  if (clean === 'embed.localhost' || clean === 'embed.redentia.localhost') {
    const port = host.includes(':') ? host.split(':')[1] : '3000'
    return `http://localhost:${port}`
  }
  return 'https://www.redentia.com.br'
}

export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isEmbedHost(host)) return

  const url = getRequestURL(event)
  const pathname = url.pathname

  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/embed')
  ) {
    return
  }

  const newPath = pathname === '/' ? '/embed' : `/embed${pathname}`
  const rewritten = newPath + url.search
  const absoluteUrl = `${targetOrigin(host)}${rewritten}`

  const filteredHeaders = Object.fromEntries(
    Object.entries(event.node.req.headers).filter(
      ([k]) => !['host', 'connection', 'content-length', 'x-forwarded-host'].includes(k.toLowerCase())
    ) as [string, string][]
  )

  try {
    const body = await $fetch(absoluteUrl, {
      method: event.node.req.method as any,
      headers: filteredHeaders,
      responseType: 'text',
      redirect: 'follow',
    })
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    return body
  } catch (err) {
    console.error('[embed-subdomain] proxy failed for', absoluteUrl, (err as any)?.message || err)
  }
})
