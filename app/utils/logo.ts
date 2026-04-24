/**
 * Brapi's logo CDN (`icons.brapi.dev/icons/{TICKER}.svg`) has real SVGs
 * for popular equities (PETR4, WEGE3, ITUB4, etc.) but returns an HTML 404
 * for FIIs and less-liquid tickers. We *allow* the URL through and rely on
 * `<img @error>` to swap in a placeholder when the server actually fails to
 * serve an image — that way we don't hide genuine brand logos.
 *
 * The only URL we explicitly reject is the literal generic `BRAPI.svg`
 * fallback some responses contain.
 */
export function isPlaceholderLogo(logo: string | null | undefined): boolean {
  if (!logo) return true
  return /icons\.brapi\.dev\/icons\/BRAPI\.svg$/i.test(logo)
}

/**
 * Prefer an explicit scrape logo (StatusInvest, when available) over the
 * Brapi CDN. Returns null only when we have nothing at all.
 */
export function resolveLogo(
  scrapeLogo: string | null | undefined,
  fallback: string | null | undefined,
): string | null {
  if (scrapeLogo && !isPlaceholderLogo(scrapeLogo)) return scrapeLogo
  if (fallback && !isPlaceholderLogo(fallback)) return fallback
  return null
}
