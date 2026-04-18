/**
 * Subdomain-aware link helper.
 *
 * `creative.redentia.com.br`, `whitelabel.redentia.com.br`, `api.redentia.com.br`
 * and `admin.redentia.com.br` are all served by the same Nuxt app via
 * server-side URL rewrites (see Frontend/server/middleware/*-subdomain.ts).
 * That means a NuxtLink like `to="/"` inside a page under `creative.redentia.com.br`
 * triggers a client-side SPA navigation to `/`, which stays on the SAME
 * host — the browser renders the main homepage but the address bar still
 * reads `creative.redentia.com.br/`. Not what users expect when they
 * click "Voltar para o site".
 *
 * This composable detects the current host and returns the absolute URL of
 * the main Redentia site when we're on a known "tool subdomain", or a
 * relative `/` when we're already on the main domain (so NuxtLink can do
 * a normal SPA nav and we don't bounce off a full page reload for no
 * reason).
 *
 * Usage:
 *   const mainSiteHref = useMainSiteHref()
 *   // → 'https://redentia.com.br/' on creative.redentia.com.br
 *   // → '/' on redentia.com.br
 *
 * Use with a plain <a href> (NOT NuxtLink) when the result might be an
 * absolute URL, so the browser does a real navigation that changes the
 * host. NuxtLink would try to treat `https://redentia.com.br/` as an
 * external link and work fine, but being explicit with `<a>` prevents
 * any SPA-routing confusion.
 */

// Tool subdomains that the Nuxt app serves as dedicated "mini-sites" via
// server-side URL rewrites (see Frontend/server/middleware/*-subdomain.ts).
// Anything else is treated as the main tenant site — no rewriting needed.
const TOOL_SUBDOMAIN_PREFIXES = [
  'creative.',
  'whitelabel.',
  'api.',
  'admin.',
]

interface MainSiteOptions {
  path?: string
}

function matchingPrefix(hostname: string): string | null {
  const clean = hostname.toLowerCase()
  return TOOL_SUBDOMAIN_PREFIXES.find((p) => clean.startsWith(p)) || null
}

function isToolSubdomain(hostname: string): boolean {
  return matchingPrefix(hostname) !== null
}

/**
 * Strip the tool prefix to get the "main site" host. Works for ANY tenant
 * domain — not just redentia.com.br — because white-labels like
 * `creative.usengine.io` should resolve to `https://usengine.io/`, not to
 * the Redentia master domain.
 *
 * Examples:
 *   creative.redentia.com.br → redentia.com.br
 *   creative.usengine.io     → usengine.io
 *   creative.localhost       → localhost
 */
function mainSiteOriginFor(hostname: string, port: string, protocol: string): string | null {
  const prefix = matchingPrefix(hostname)
  if (!prefix) return null

  const rootHost = hostname.slice(prefix.length)
  if (!rootHost) return null

  // localhost in dev keeps the port; production subdomains assume standard ports.
  const isLocal = rootHost === 'localhost' || rootHost.endsWith('.localhost')
  const scheme = (protocol || (isLocal ? 'http:' : 'https:')).replace(/:$/, '')
  const portPart = isLocal && port ? `:${port}` : ''
  return `${scheme}://${rootHost}${portPart}`
}

/**
 * Returns an href that points to the main Redentia site's given path
 * (default `/`). When already on the main site, returns the plain path
 * so SPA navigation can be used. When on a tool subdomain, returns a
 * full absolute URL so a regular <a href> triggers a proper host change.
 */
export function useMainSiteHref(options: MainSiteOptions = {}): string {
  const path = options.path || '/'

  if (import.meta.server) {
    const reqUrl = useRequestURL()
    if (!isToolSubdomain(reqUrl.hostname)) return path
    const origin = mainSiteOriginFor(reqUrl.hostname, reqUrl.port, reqUrl.protocol)
    return origin ? origin + path : path
  }

  // Client
  const hostname = window.location.hostname
  if (!isToolSubdomain(hostname)) return path
  const origin = mainSiteOriginFor(hostname, window.location.port, window.location.protocol)
  return origin ? origin + path : path
}

/**
 * True when the browser is currently on one of the tool subdomains
 * (creative / whitelabel / api / admin).
 */
export function useIsToolSubdomain(): boolean {
  if (import.meta.server) {
    const reqUrl = useRequestURL()
    return isToolSubdomain(reqUrl.hostname)
  }
  return isToolSubdomain(window.location.hostname)
}
