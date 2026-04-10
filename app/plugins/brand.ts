import { brand as defaultBrand } from '~/config/brand'

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

export default defineNuxtPlugin(() => {
  const brand = useBrand()

  useHead({
    htmlAttrs: {
      class: computed(() => brand.theme.mode === 'light' ? '' : 'dark'),
    },
    style: [
      {
        innerHTML: computed(() => buildCssVars(brand)),
      },
    ],
  })

  // Font loading: inject link tag and watch for brand changes
  if (import.meta.client) {
    const fontLinkId = 'brand-google-font'

    function loadFont(googleSpec: string) {
      let link = document.getElementById(fontLinkId) as HTMLLinkElement | null
      const url = googleFontsUrl(googleSpec)

      if (link) {
        if (link.href === url) return
        link.href = url
      } else {
        link = document.createElement('link')
        link.id = fontLinkId
        link.rel = 'stylesheet'
        link.href = url
        document.head.appendChild(link)
      }
    }

    // Load initial font
    loadFont(brand.font.google)

    // Watch for brand switches
    watch(() => brand.font.google, (newGoogle) => {
      loadFont(newGoogle)
    })
  } else {
    // SSR: use useHead for initial render
    useHead({
      link: [
        {
          rel: 'stylesheet',
          href: googleFontsUrl(brand.font.google),
        },
      ],
    })
  }
})
