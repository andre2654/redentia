// Meta Pixel (fbevents.js). Migrado do Frontend antigo no cutover.
// Adaptado: o Nu é Redentia-only (sem useBrand), então o pixelId vem
// direto de runtimeConfig.public.metaPixelId. NUXT_PUBLIC_META_PIXEL_ID=
// vazio desliga.
//
// Deferido até requestIdleCallback (fallback setTimeout 500ms pra Safari /
// IG in-app browser sem rIC): o pixel custa ~45KiB de JS + ~160ms de CPU
// que não precisam rodar antes do LCP. PageView dispara no mesmo slot idle
// e em cada navegação SPA.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const pixelId = (config.public as any).metaPixelId as string
  if (!pixelId) return

  // <noscript> harmless pro ~0% com JS off; não bloqueia render.
  useHead({
    noscript: [
      {
        innerHTML: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`,
      },
    ],
  })

  const installPixel = () => {
    if ((window as any).fbq) return
    ;(function (f: any, b: any, e: string, v: string) {
      if (f.fbq) return
      const n: any = (f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments as any)
          : n.queue.push(arguments)
      })
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
      const t: any = b.createElement(e)
      t.async = true
      t.src = v
      const s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    ;(window as any).fbq('init', pixelId)
    ;(window as any).fbq('track', 'PageView')
  }

  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(installPixel, { timeout: 4000 })
  }
  else {
    setTimeout(installPixel, 500)
  }

  // PageView em navegação client-side (guardado até o install deferido).
  const router = useRouter()
  router.afterEach(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'PageView')
    }
  })
})
