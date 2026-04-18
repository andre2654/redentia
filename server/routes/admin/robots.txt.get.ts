// Dedicated robots.txt for the admin subdomain. Served at
// /admin/robots.txt and surfaced at admin.redentia.com.br/robots.txt
// (the admin-subdomain middleware rewrites `/` → `/admin`, so this
// file is reachable without any extra config).
//
// Belt-and-suspenders with X-Robots-Tag header + <meta name=robots>:
// even if someone browses the admin and a search engine somehow got
// the URL, this is the first and cheapest "go away" signal.

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return 'User-agent: *\nDisallow: /\n'
})
