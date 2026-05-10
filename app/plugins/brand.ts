// Phase 1: brand.ts foi morto. Tipo agora vem do seed-brand (mesma shape).
// Live brand vem do useBrand() — populado via SSR + API backend.
import { seedBrand as defaultBrand } from '~/config/seed-brand'

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

/**
 * Resolve as `colors` ativas pra um modo especifico, aplicando overrides
 * de `themes.{mode}` sobre `colors` base. Espelha a logica do `applyMode`
 * mas e pure (sem mutar `brand.colors`). Usado pra emitir CSS de ambos
 * modos simultaneamente.
 *
 * `baseColors` precisa ser a paleta CANONICA (defaultMode), nao a versao
 * possivelmente mutada por applyMode em tempo de execucao. Caller passa
 * o snapshot — sem ele, lemos b.colors mas o resultado pode estar
 * "contaminado" pelo modo ativo (bug onde dark + light blocks acabam
 * com a mesma palette).
 */
function resolveColorsForMode(
  b: typeof defaultBrand,
  mode: 'dark' | 'light',
  baseColors?: typeof defaultBrand.colors,
): typeof defaultBrand.colors {
  const base = baseColors ?? b.colors
  const overrides = b.themes?.[mode]
  if (!overrides) return base
  return {
    ...base,
    ...overrides,
    gradient: {
      ...base.gradient,
      ...(overrides.gradient ?? {}),
    },
  }
}

/**
 * Emite o bloco de vars pra um modo especifico, em DOIS seletores:
 *
 *   1. `@media (prefers-color-scheme: {mode}) :root:not(.{otherMode})`
 *      → fallback OS pref quando user nao tem class manual (1a visita
 *      sem cookie). O `:not(.otherMode)` evita que media sobrescreva
 *      toggle manual oposto.
 *
 *   2. `:root.{mode}` → class manual (cookie via @nuxtjs/color-mode).
 *      Sempre vence media query (mesmo specificity, declarado depois).
 *
 * Brand-agnostic vars (font, radii, durations) ficam em `:root` puro,
 * compartilhadas entre modos. Resultado: CSS resolve modo correto sem
 * JS, eliminando flash em hidratacao SSR mesmo na 1a visita absoluta.
 */
function buildVarsBody(
  b: typeof defaultBrand,
  mode: 'dark' | 'light',
  baseColors?: typeof defaultBrand.colors,
): string {
  const c = resolveColorsForMode(b, mode, baseColors)
  const isLight = mode === 'light'

  return `color-scheme: ${mode};
  --brand-primary: ${c.primary};
  --brand-secondary: ${c.secondary};
  --brand-tertiary: ${c.tertiary};
  --brand-positive: ${c.positive};
  --brand-negative: ${c.negative};
  --brand-neutral: ${c.neutral};
  /* warning: estado intermediario (pausado, pendente, atencao moderada).
     Sem token explicito por tenant — derivamos amber-laranja universal
     que funciona em qualquer paleta. Usado em status dots, banners de
     "ação requerida", chips paused, validation warnings. */
  --brand-warning: #F59E0B;
  --brand-background: ${c.background};
  --brand-surface: ${c.surface};
  --brand-surface-hover: ${c.surfaceHover};
  --brand-border: ${c.border};
  --brand-text: ${c.text};
  --brand-text-muted: ${c.textMuted};
  --brand-input-bg: ${c.inputBg};
  --brand-input-bg-hover: ${c.inputBgHover};
  --brand-input-border: ${c.inputBorder};
  --brand-gradient-from: ${c.gradient.from};
  --brand-gradient-via: ${c.gradient.via};
  --brand-gradient-to: ${c.gradient.to};
  --brand-overlay: ${isLight ? '0, 0, 0' : '255, 255, 255'};
  --brand-overlay-inverse: ${isLight ? '255, 255, 255' : '0, 0, 0'};

  /* Texto sobre amber (--brand-primary), dinamico por modo:
     light = branco (amber escurece o suficiente pra contrastar),
     dark  = onyx warm #1A0A2E (regra do IDENTITY.md secao 2.1).
     Centraliza a regra em um token em vez de espalhar hex. */
  --text-on-primary: ${isLight ? '#ffffff' : '#1A0A2E'};

  /* QUIET tokens — semantic layer (redentia-stripe-style) */
  --bg-base: ${c.background};
  --bg-elevated: ${c.surface};
  --bg-overlay: ${c.surfaceHover};
  --bg-input: ${c.inputBg};

  --text-heading: ${isLight ? '#1A0A2E' : c.text};
  --text-label: ${isLight ? '#2A1A4A' : c.text};
  --text-body: ${c.textMuted};
  --text-muted: ${isLight ? '#9A92A8' : c.textMuted};

  --border-subtle: ${isLight
    ? `color-mix(in srgb, ${c.primary} 8%, ${c.border})`
    : `color-mix(in srgb, ${c.primary} 8%, transparent)`};
  --border-default: ${isLight
    ? `color-mix(in srgb, ${c.primary} 16%, ${c.border})`
    : `color-mix(in srgb, ${c.primary} 14%, transparent)`};
  --border-strong: ${isLight
    ? `color-mix(in srgb, ${c.primary} 28%, ${c.border})`
    : `color-mix(in srgb, ${c.primary} 24%, transparent)`};

  --shadow-amber-far: ${isLight
    ? `color-mix(in srgb, ${c.primary} 18%, transparent)`
    : `color-mix(in srgb, ${c.primary} 10%, transparent)`};
  --shadow-amber-near: ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.4)'};
  --shadow-ambient: ${isLight ? 'rgba(23,23,23,0.06)' : 'rgba(0,0,0,0.5)'};

  --shadow-card: 0 30px 45px -30px var(--shadow-amber-far), 0 18px 36px -18px var(--shadow-amber-near);
  --shadow-card-hover: 0 40px 55px -30px var(--shadow-amber-far), 0 24px 40px -18px var(--shadow-amber-near);
  --shadow-popover: 0 14px 30px -10px rgba(0,0,0,${isLight ? '0.12' : '0.55'}), 0 30px 45px -30px var(--shadow-amber-far);
  --shadow-ring-focus: 0 0 0 3px color-mix(in srgb, ${c.primary} 22%, transparent);`
}

/**
 * Envolve o body de vars em DOIS seletores: media query (OS pref fallback)
 * + class manual (toggle/cookie). Garante que CSS resolve o modo correto
 * tanto na 1a visita (sem cookie, OS pref via media query) quanto apos
 * toggle manual (class no <html>).
 */
function buildModeBlock(
  b: typeof defaultBrand,
  mode: 'dark' | 'light',
  baseColors?: typeof defaultBrand.colors,
): string {
  const body = buildVarsBody(b, mode, baseColors)
  const otherMode = mode === 'dark' ? 'light' : 'dark'

  return `@media (prefers-color-scheme: ${mode}) {
  :root:not(.${otherMode}):not(.${mode}) {
    ${body}
  }
}
:root.${mode} {
  ${body}
}`
}

function buildCssVars(b: typeof defaultBrand, baseColors?: typeof defaultBrand.colors): string {
  // Defensivo: theme/borderRadius/animation podem nao existir em
  // brands legacy ou em estados transientes (SSR antes do API
  // resolver completar). Caímos pra defaults conservadores em vez
  // de quebrar a página inteira.
  const themeBlock: any = (b as any).theme || {}
  const radiusKey = (themeBlock.borderRadius || 'rounded') as keyof typeof borderRadiusMap
  const animKey = (themeBlock.animation || 'smooth') as keyof typeof animationMap
  const radius = borderRadiusMap[radiusKey] || borderRadiusMap.rounded
  const anim = animationMap[animKey] || animationMap.smooth
  const tenantSupportsBoth = !!((b as any).themes?.dark || (b as any).themes?.light)

  // Tenants single-mode (sem `themes`) so emitem o seletor do seu defaultMode.
  // Tenants multi-mode emitem ambos os blocos — CSS resolve via media query
  // (1a visita) ou via class no <html> (apos cookie/toggle).
  const blocks: string[] = []
  if (tenantSupportsBoth) {
    blocks.push(buildModeBlock(b, 'dark', baseColors))
    blocks.push(buildModeBlock(b, 'light', baseColors))
  } else {
    const fallbackMode: 'dark' | 'light' = b.defaultMode === 'light' ? 'light' : 'dark'
    blocks.push(buildModeBlock(b, fallbackMode, baseColors))
  }

  // Shared brand-agnostic vars (font, radii, durations) — same in both modes.
  // Emitted in plain `:root` so they apply regardless of mode class.
  const isLight = themeBlock.mode === 'light'
  const bgPatterns = getBgPatterns(isLight)
  const bgPatternKey = (themeBlock.backgroundPattern || 'none') as string
  const bgPattern = (bgPatterns[bgPatternKey] ?? bgPatterns.none)(b.colors.primary)

  const sharedRoot = `:root {
  --brand-font: '${b.font.family}', sans-serif;
  --brand-radius-sm: ${radius.sm};
  --brand-radius-md: ${radius.md};
  --brand-radius-lg: ${radius.lg};
  --brand-radius-xl: ${radius.xl};
  --brand-radius-full: ${radius.full};
  --brand-duration: ${anim.duration};
  --brand-ease: ${anim.ease};
}
body {
  background-image: ${bgPattern};
  background-repeat: repeat;
  background-attachment: fixed;
}`

  return `${sharedRoot}\n${blocks.join('\n')}`
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
  // `themes` is missing.
  //
  // Phase 1: o brand vem do backend agora (não há mais "brands map"
  // canônico no frontend). O próprio `brand` reativo é a fonte —
  // lemos themes/defaultMode dele direto. Se o backend serviu um
  // brand quebrado/parcial, o `seedBrand` já garantiu defaults.
  function tenantSupportsMultiMode(): boolean {
    const themes = (brand as any).themes
    if (!themes) return false
    if (Array.isArray(themes)) return themes.length > 0
    return !!(themes.light || themes.dark)
  }

  // Snapshot das cores BASE da marca (defaultMode). Capturado na
  // primeira invocacao de applyMode, reutilizado pra reset entre
  // toggles. Necessario porque `brand.colors` e mutado live —
  // sem snapshot, perdemos o palette original ao trocar de modo.
  // Reativo pra que o `useHead` computed re-emita CSS quando o
  // snapshot finalmente eh capturado (server-side roda antes do
  // applyMode client, entao baseColorsSnapshot pode ser null no SSR).
  const baseColorsSnapshot = ref<any>(null)
  // Capturamos o snapshot logo AQUI (em vez de dentro de applyMode)
  // pra que ja esteja disponivel no primeiro render do `useHead`
  // computed. Usar JSON clone evita reference-shared mutation.
  baseColorsSnapshot.value = JSON.parse(JSON.stringify(brand.colors))

  function resolveMode(): 'dark' | 'light' {
    // Single-mode tenant — pinned to its defaultMode regardless of OS
    // / cookie / toggle. Prevents the F5-with-system-color bug where
    // the OS resolves to 'light' but the tenant only has dark
    // colors → mismatched <html class>, color-scheme, and :style.
    if (!tenantSupportsMultiMode()) {
      return (brand as any).defaultMode === 'light' ? 'light' : 'dark'
    }
    if (colorMode.value === 'dark' || colorMode.value === 'light') return colorMode.value
    if (colorMode.preference === 'dark' || colorMode.preference === 'light') return colorMode.preference
    return (brand as any).defaultMode === 'light' ? 'light' : 'dark'
  }

  function applyMode(resolved: 'dark' | 'light') {
    // Snapshot ja foi capturado no setup. Reuse pra reset entre toggles.
    const baseColors = baseColorsSnapshot.value
    const overrides = (brand as any).themes?.[resolved]
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
    if ((brand as any).theme) (brand as any).theme.mode = resolved
    else (brand as any).theme = { mode: resolved }
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
  // CSS multi-mode (2026-05-04): o plugin agora emite vars pra dark E
  // light em selectores `:root.dark` / `:root.light`. A class no <html>
  // e gerenciada pelo `@nuxtjs/color-mode` (anti-flash inline script)
  // ANTES do CSS aplicar — ou seja, componentes que usam `var(--brand-X)`
  // ja chegam no modo certo sem JS rodar.
  //
  // O reload anterior em `preference=system` foi removido porque nao e
  // mais necessario: a class no <html> ja faz o swap puro CSS. A unica
  // razao pra ainda mutar `brand.colors` em runtime e suportar componentes
  // que usam `:style="{ color: brand.colors.X }"` direto (5641 lugares).
  // Esses ainda podem flashar na 1a visita; a partir da 2a, o
  // `Sec-CH-Prefers-Color-Scheme` Client Hint faz SSR ja renderizar com
  // o modo certo no cookie, eliminando flash.
  applyMode(resolveMode())

  // ----------------------------------------------------------------
  // Runtime watcher — applies subsequent mode changes (toggle, OS
  // pref change, etc.). Tracks colorMode.value reactively so any
  // mutation flows back into brand.colors.
  // ----------------------------------------------------------------
  watch(
    () => [colorMode.value, colorMode.preference] as const,
    () => applyMode(resolveMode()),
  )

  // Inject `<html class="dark|light">` AT SSR — sem isso o HTML chega
  // sem class, o CSS multi-mode nao tem modo pra resolver, e os
  // componentes que usam var(--brand-X) caem nos defaults antes do
  // anti-flash script do client adicionar a class. Como ja resolvemos
  // o modo correto via cookie/Client Hint no Nitro middleware
  // `2-color-mode.ts`, basta serializar.
  useHead({
    htmlAttrs: {
      class: computed(() => brand.theme.mode),
    },
    style: [
      {
        innerHTML: computed(() => buildCssVars(brand, baseColorsSnapshot.value)),
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
        // crossorigin="anonymous" pra que o stylesheet seja legível pelo
        // motor de replay do Microsoft Clarity (que reusa o CSS no <iframe>
        // sandbox da gravação). Sem isso, replays renderizam com fonte
        // default do browser e parecem "site sem CSS". O preconnect pra
        // fonts.gstatic.com no nuxt.config.ts já tem o mesmo attr.
        crossorigin: 'anonymous',
      },
    ],
  })

  // ----------------------------------------------------------------
  // Site-wide Organization JSON-LD — identity anchor pra Google e LLMs.
  // ----------------------------------------------------------------
  // Por que aqui no plugin (e nao em layout): o plugin roda 1 vez por
  // SSR/cliente, antes de qualquer pagina renderizar. Schema injetado
  // no <head> uma unica vez, valido pra rota inteira. Em layouts, teria
  // que duplicar em default + unauthenticated + admin-panel + static.
  //
  // O `sameAs[]` e o sinal de disambiguacao mais importante hoje pra
  // LLMs (ChatGPT/Perplexity/Gemini) descobrirem "quem e a Redentia"
  // alem do dominio canonico. Sem isso, ficamos confundiveis com outras
  // empresas brasileiras de nome parecido. As authority cites em
  // `knowsAbout[]` ancoram a area de expertise (financas/investimentos
  // BR) — sinal forte pra E-E-A-T em conteudo YMYL.
  //
  // Stable key garante que mesmo que o plugin re-rode em HMR/dev, so
  // existe 1 script <ld+json> com esse @id.
  useHead({
    script: [
      {
        key: 'org-jsonld',
        type: 'application/ld+json',
        innerHTML: computed(() =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': `${brand.url}#organization`,
            name: brand.name,
            legalName: brand.company?.legalName || brand.name,
            url: brand.url,
            logo: {
              '@type': 'ImageObject',
              url: `${brand.url}/512x512.png`,
              width: 512,
              height: 512,
            },
            description: brand.seo?.description,
            foundingDate: '2024',
            // Lista canonica dos perfis publicos da marca. Cada link e
            // um sinal de identidade pra LLMs disambig — quanto mais
            // amplo o `sameAs[]`, mais robusto o vinculo entre o nome
            // da marca e essa entidade especifica.
            //
            // Fonte: brand.social (tenant-aware) filtrado pra URLs
            // nao-vazias. Funciona pra qualquer tenant — antes era
            // hardcoded so pra Redentia, vazando white-label.
            sameAs: Object.values(brand.social ?? {}).filter(
              (url): url is string => typeof url === 'string' && url.trim() !== '',
            ),
            // E-E-A-T anchor: declara expertise em entidades reais que
            // o Google reconhece como autoridades do dominio financeiro
            // brasileiro. Faz a Redentia "conhecer sobre" os mesmos
            // topicos que BCB/B3/CVM tratam — sinal positivo de YMYL
            // expertise.
            knowsAbout: [
              { '@type': 'Thing', name: 'Investimentos' },
              { '@type': 'Thing', name: 'Bolsa de Valores' },
              { '@type': 'Thing', name: 'B3' },
              { '@type': 'Thing', name: 'Análise fundamentalista' },
              { '@type': 'Thing', name: 'Dividendos' },
              { '@type': 'Thing', name: 'Tesouro Direto' },
              { '@type': 'Thing', name: 'Fundos Imobiliários' },
              { '@type': 'Thing', name: 'Planejamento financeiro' },
            ],
            address: brand.company?.address
              ? {
                  '@type': 'PostalAddress',
                  addressCountry: 'BR',
                  streetAddress: brand.company.address,
                }
              : { '@type': 'PostalAddress', addressCountry: 'BR' },
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: brand.email || `contato@${(brand.url || '').replace(/^https?:\/\/(www\.)?/, '')}`,
              availableLanguage: ['pt-BR'],
            },
          })
        ),
      },
    ],
  })
  },
})
