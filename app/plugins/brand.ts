import { brand as defaultBrand, brands } from '~/config/brand'

const borderRadiusMap = {
  sharp: { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
  rounded: { sm: '8px', md: '12px', lg: '16px', xl: '24px', full: '9999px' },
  pill: { sm: '12px', md: '16px', lg: '24px', xl: '32px', full: '9999px' },
} as const

const animationMap = {
  none: { duration: '0ms', ease: 'linear' },
  snappy: { duration: '150ms', ease: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  smooth: { duration: '300ms', ease: 'cubic-bezier(0.4, 0, 0.2, 1)' },
} as const

function getBgPatterns(isLight: boolean): Record<string, (primary: string) => string> {
  const lineColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'
  const dotColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'
  return {
    none: () => 'none',
    grid: () => `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M40 0v40M0 0h40' stroke='${encodeURIComponent(lineColor)}' stroke-width='1'/%3E%3C/svg%3E")`,
    dots: () => `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='${encodeURIComponent(dotColor)}'/%3E%3C/svg%3E")`,
    gradient: (primary) => `radial-gradient(ellipse at 50% 0%, ${primary}08 0%, transparent 70%)`,
    noise: () => 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.02\'/%3E%3C/svg%3E")',
  }
}

function buildCssVars(b: typeof defaultBrand): string {
  const radius = borderRadiusMap[b.theme.borderRadius]
  const anim = animationMap[b.theme.animation]
  const isLight = b.theme.mode === 'light'
  const bgPatterns = getBgPatterns(isLight)
  const bgPattern = (bgPatterns[b.theme.backgroundPattern] ?? bgPatterns.none)(b.colors.primary)

  return `:root {
  color-scheme: ${isLight ? 'light' : 'dark'};
  --brand-primary: ${b.colors.primary};
  --brand-secondary: ${b.colors.secondary};
  --brand-tertiary: ${b.colors.tertiary};
  --brand-positive: ${b.colors.positive};
  --brand-negative: ${b.colors.negative};
  --brand-neutral: ${b.colors.neutral};
  --brand-background: ${b.colors.background};
  --brand-surface: ${b.colors.surface};
  --brand-surface-hover: ${b.colors.surfaceHover};
  --brand-border: ${b.colors.border};
  --brand-text: ${b.colors.text};
  --brand-text-muted: ${b.colors.textMuted};
  --brand-input-bg: ${b.colors.inputBg};
  --brand-input-bg-hover: ${b.colors.inputBgHover};
  --brand-input-border: ${b.colors.inputBorder};
  --brand-gradient-from: ${b.colors.gradient.from};
  --brand-gradient-via: ${b.colors.gradient.via};
  --brand-gradient-to: ${b.colors.gradient.to};
  --brand-font: '${b.font.family}', sans-serif;
  --brand-radius-sm: ${radius.sm};
  --brand-radius-md: ${radius.md};
  --brand-radius-lg: ${radius.lg};
  --brand-radius-xl: ${radius.xl};
  --brand-radius-full: ${radius.full};
  --brand-duration: ${anim.duration};
  --brand-ease: ${anim.ease};
  --brand-overlay: ${isLight ? '0, 0, 0' : '255, 255, 255'};
  --brand-overlay-inverse: ${isLight ? '255, 255, 255' : '0, 0, 0'};

  /* ============================================================
     QUIET tokens — semantic layer for the redentia-stripe-style skill.
     Lightness as luxury: warm headings instead of pure black/white,
     amber-tinted shadows, conservative borders derived from primary.
     Available platform-wide; consumed by typography defaults in main.css,
     by app.config.ts component defaults, and by any quiet-aware component.
     ============================================================ */
  /* Surfaces (alias to brand vars where they coincide, distinct names so
     quiet components express intent without coupling to brand semantics) */
  --bg-base: ${b.colors.background};
  --bg-elevated: ${b.colors.surface};
  --bg-overlay: ${b.colors.surfaceHover};
  --bg-input: ${b.colors.inputBg};

  /* Text ramp — 4 stops. Headings are warm (aubergine/onyx), never pure. */
  --text-heading: ${isLight ? '#1A0A2E' : b.colors.text};
  --text-label: ${isLight ? '#2A1A4A' : b.colors.text};
  --text-body: ${b.colors.textMuted};
  --text-muted: ${isLight ? '#9A92A8' : b.colors.textMuted};

  /* Borders — derived from primary via color-mix so multi-tenant safe.
     Light: low-saturation amber neutralized. Dark: amber tint on white. */
  --border-subtle: ${isLight
    ? `color-mix(in srgb, ${b.colors.primary} 8%, ${b.colors.border})`
    : `color-mix(in srgb, ${b.colors.primary} 8%, transparent)`};
  --border-default: ${isLight
    ? `color-mix(in srgb, ${b.colors.primary} 16%, ${b.colors.border})`
    : `color-mix(in srgb, ${b.colors.primary} 14%, transparent)`};
  --border-strong: ${isLight
    ? `color-mix(in srgb, ${b.colors.primary} 28%, ${b.colors.border})`
    : `color-mix(in srgb, ${b.colors.primary} 24%, transparent)`};

  /* Shadow — chromatic, amber-tinted. Light gets a far amber + near neutral,
     dark gets a much lower-opacity amber + heavy neutral for ambient depth. */
  --shadow-amber-far: ${isLight
    ? `color-mix(in srgb, ${b.colors.primary} 18%, transparent)`
    : `color-mix(in srgb, ${b.colors.primary} 10%, transparent)`};
  --shadow-amber-near: ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.4)'};
  --shadow-ambient: ${isLight ? 'rgba(23,23,23,0.06)' : 'rgba(0,0,0,0.5)'};

  /* Composed shadow recipes — drop-in for elevation levels */
  --shadow-card: 0 30px 45px -30px var(--shadow-amber-far), 0 18px 36px -18px var(--shadow-amber-near);
  --shadow-card-hover: 0 40px 55px -30px var(--shadow-amber-far), 0 24px 40px -18px var(--shadow-amber-near);
  --shadow-popover: 0 14px 30px -10px rgba(0,0,0,${isLight ? '0.12' : '0.55'}), 0 30px 45px -30px var(--shadow-amber-far);
  --shadow-ring-focus: 0 0 0 3px color-mix(in srgb, ${b.colors.primary} 22%, transparent);
}
body {
  background-image: ${bgPattern};
  background-repeat: repeat;
  background-attachment: fixed;
}`
}

function googleFontsUrl(googleSpec: string): string {
  // Support multiple families joined with `&family=`. Each family segment
  // is URL-encoded individually so the `&family=` delimiter itself is
  // preserved. This enables loading e.g. Inter + Instrument Serif + JetBrains Mono
  // in a single stylesheet request.
  const families = googleSpec.split('&family=')
  const encoded = families
    .map((f) => encodeURIComponent(f).replace(/%20/g, '+'))
    .join('&family=')
  return `https://fonts.googleapis.com/css2?family=${encoded}&display=swap`
}

export default defineNuxtPlugin({
  name: 'brand',
  // `enforce: 'post'` makes this plugin run AFTER `@nuxtjs/color-mode`'s
  // server/client plugin so we read the resolved `colorMode.preference`
  // (sourced from the cookie on SSR) when computing the active palette.
  // Without this, we'd race color-mode's own setup and apply the wrong
  // palette on SSR — producing dark inline `:style` attributes that the
  // client cannot reconcile (Vue 3 hydration leaves SSR DOM as-is on
  // mismatch in non-rectifying mode).
  enforce: 'post',
  setup(nuxtApp) {
    const brand = useBrand()
  // `useColorMode` is auto-imported by @nuxtjs/color-mode (transitive
  // dep of @nuxt/ui). It handles cookie/localStorage persistence,
  // the <html class="dark|light"> class, anti-flash on first paint,
  // and `prefers-color-scheme` reactivity — we just consume `value`
  // (resolved 'dark'|'light') to drive the brand palette swap.
  const colorMode = useColorMode()

  // ----------------------------------------------------------------
  // Resolver — produces the active mode at any moment by checking
  // (in order) the colorMode value, the colorMode preference, and
  // finally the brand's defaultMode. Used for both the synchronous
  // pre-render mutation AND the runtime watcher.
  // ----------------------------------------------------------------
  // A tenant is "multi-mode" when its config has a `themes` block with
  // a `light` (or future `dark`) variant. Single-mode tenants only
  // ship one palette and CAN'T render in the opposite mode — the
  // colorMode toggle becomes a visual lie if we honor it. So we lock
  // the resolved mode to the tenant's `defaultMode` whenever
  // `themes` is missing. Source of truth: the canonical brand from
  // `brands` map (NOT the live reactive `brand`, since we mutate
  // brand.theme.mode below and that creates a feedback loop).
  function getCanonicalBrand(): typeof defaultBrand {
    return (brands as Record<string, typeof defaultBrand>)[brand.slug] ?? defaultBrand
  }
  function tenantSupportsMultiMode(): boolean {
    const canonical = getCanonicalBrand()
    return !!(canonical.themes && (canonical.themes.light || canonical.themes.dark))
  }

  function resolveMode(): 'dark' | 'light' {
    // Single-mode tenant — pinned to its defaultMode regardless of OS
    // / cookie / toggle. Prevents the F5-with-system-color bug where
    // the OS resolves to 'light' but the tenant only has dark
    // colors → mismatched <html class>, color-scheme, and :style.
    if (!tenantSupportsMultiMode()) {
      return getCanonicalBrand().defaultMode === 'light' ? 'light' : 'dark'
    }
    if (colorMode.value === 'dark' || colorMode.value === 'light') return colorMode.value
    if (colorMode.preference === 'dark' || colorMode.preference === 'light') return colorMode.preference
    return brand.defaultMode === 'light' ? 'light' : 'dark'
  }

  function applyMode(resolved: 'dark' | 'light') {
    const canonical = getCanonicalBrand()
    const baseColors = canonical.colors
    const overrides = canonical.themes?.[resolved]
    Object.assign(brand.colors, baseColors)
    if (overrides) {
      Object.assign(brand.colors, overrides)
      brand.colors.gradient = {
        ...baseColors.gradient,
        ...(overrides.gradient ?? {}),
      }
    } else {
      brand.colors.gradient = { ...baseColors.gradient }
    }
    brand.theme.mode = resolved
    // Force-clean the <html> class to a single mode token.
    if (import.meta.client) {
      const html = document.documentElement
      const other = resolved === 'light' ? 'dark' : 'light'
      if (html.classList.contains(other)) html.classList.remove(other)
      if (!html.classList.contains(resolved)) html.classList.add(resolved)
    }
  }

  // ----------------------------------------------------------------
  // CLIENT: seed colorMode + apply mode SYNCHRONOUSLY before Vue
  // mounts. This is the critical fix for the F5 mismatch bug —
  // Vue's hydration logs a warning but does NOT rectify inline
  // `:style` attributes when the SSR DOM differs from what the
  // client render would produce. So we must ensure the brand state
  // is correct BEFORE any component mounts.
  //
  // The anti-flash inline script (from @nuxtjs/color-mode) runs
  // before any Nuxt plugin, populating
  // `window.__NUXT_COLOR_MODE__` with the user's resolved
  // preference. We read it directly, push the values into the
  // colorMode state, then mutate `brand.colors` in place. Plugins
  // run BEFORE component setup, so by the time `<NuxtLayout>` and
  // its children render their template, brand.colors already
  // reflects the user's preference and the SSR HTML is replaced
  // (not reconciled-against) on first render.
  // ----------------------------------------------------------------
  if (import.meta.client) {
    const helper = (globalThis as any).__NUXT_COLOR_MODE__
    if (helper) {
      colorMode.preference = helper.preference
      colorMode.value = helper.value
      ;(colorMode as any).unknown = false
    }
  }

  // Server: pick the best mode we can resolve from the cookie.
  // Client: the resolution rule depends on whether SSR could match.
  //
  //   - preference='dark' or preference='light' → SSR knew it, both
  //     sides agree, apply synchronously on client too. No mismatch.
  //
  //   - preference='system' → SSR can't read prefers-color-scheme, so
  //     it rendered with `defaultMode`. The client now KNOWS the
  //     actual resolved mode (from the anti-flash helper). If we apply
  //     it synchronously here, brand.colors mutates BEFORE Vue
  //     hydrates — SSR DOM has the defaultMode :style, JS has the
  //     resolved palette, hydration warns and leaves the SSR styles
  //     intact (Vue 3 doesn't rectify mismatched inline :style on
  //     hydration). Half the page ends up showing the wrong palette.
  //
  //     Fix: on system preference, FIRST sync to defaultMode (match
  //     SSR), let Vue hydrate cleanly, THEN apply the resolved mode
  //     in nextTick. The reactive update propagates to inline :style
  //     bindings after hydration completes — they DO update on
  //     post-hydration mutations.
  // First-visit / legacy-cookie path: if `preference=system` (or no cookie
  // at all), SSR rendered with `defaultMode` but the client now knows the
  // actual OS pref. The OLD code triggered `window.location.reload()` so
  // SSR could re-render with the resolved value — but that's a full second
  // page load on every fresh visitor whose OS color mode differs from the
  // tenant default, which on Lighthouse mobile pegged FCP/LCP for half the
  // landing traffic.
  //
  // The fix: write the cookie (so the NEXT F5 is fast and bug-free) but
  // SKIP the reload. Apply the SSR-painted mode synchronously to match
  // hydration cleanly, then do a single post-hydration `applyMode(resolved)`
  // via the `app:mounted` hook. By that point Vue owns the DOM, the SSR
  // inline `:style` attrs have been replaced by reactive bindings, and the
  // mutation propagates normally — no reload needed, just one extra paint
  // ~200ms after hydration on the first visit only.
  let pendingPostHydrateMode: 'dark' | 'light' | null = null
  if (import.meta.client && colorMode.preference === 'system') {
    const ssrMode: 'dark' | 'light' = brand.theme.mode === 'light' ? 'light' : 'dark'
    const osDark =
      typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved: 'dark' | 'light' = osDark ? 'dark' : 'light'
    colorMode.preference = resolved
    if (ssrMode !== resolved) {
      pendingPostHydrateMode = resolved
    }
  }
  applyMode(resolveMode())
  if (pendingPostHydrateMode) {
    nuxtApp.hook('app:mounted', () => {
      applyMode(pendingPostHydrateMode!)
    })
  }

  // ----------------------------------------------------------------
  // Runtime watcher — applies subsequent mode changes (toggle, OS
  // pref change, etc.). Tracks colorMode.value reactively so any
  // mutation flows back into brand.colors.
  // ----------------------------------------------------------------
  watch(
    () => [colorMode.value, colorMode.preference] as const,
    () => applyMode(resolveMode()),
  )

  useHead({
    style: [
      {
        innerHTML: computed(() => buildCssVars(brand)),
      },
    ],
  })

  // Font loading — single source of truth.
  //
  // Both SSR and client install the stylesheet via `useHead` with a stable
  // `key` so we get exactly ONE <link> in the rendered HTML (preventing the
  // duplicated render-blocking request that PageSpeed used to flag).
  //
  // On the client, we additionally watch for tenant brand swaps so the
  // active font follows the active tenant (the URL changes, the existing
  // <link> mutates in place via the same key).
  useHead({
    link: [
      {
        key: 'brand-google-font',
        rel: 'stylesheet',
        href: computed(() => googleFontsUrl(brand.font.google)),
      },
    ],
  })
  },
})
