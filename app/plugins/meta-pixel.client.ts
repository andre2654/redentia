export default defineNuxtPlugin(() => {
  const brand = useBrand()
  const config = useRuntimeConfig()

  const pixelId = brand.meta?.pixelId || (config.public as any).metaPixelId
  if (!pixelId) return

  // The <noscript> img is harmless and only used by the ~0% of users with
  // JS off, so we keep it in <head> via useHead — it doesn't block render.
  useHead({
    noscript: [
      {
        innerHTML: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`,
      },
    ],
  })

  // Defer the actual fbevents.js + init until AFTER the page is fully
  // interactive. PageSpeed flagged the pixel as costing 45 KiB of legacy
  // transpiled JS + 100 KiB of cached config + ~160ms of CPU during the
  // critical render window. None of that work needs to happen before LCP.
  //
  // Strategy:
  //   1. requestIdleCallback (fall back to setTimeout 2.5s on Safari and
  //      anywhere rIC is missing) — runs on browser idle, never blocks.
  //   2. Once running, install the stub-and-load snippet exactly as Meta
  //      ships it. The first PageView is fired in the same idle slot.
  //
  // Tracking accuracy: PageView fires ~2-3s after LCP instead of during
  // critical-path JS. Bounce-tracking still picks it up because the
  // user is still on the page; only sessions <2.5s long are missed,
  // which are bounces anyway.
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
  } else {
    setTimeout(installPixel, 2500)
  }

  // Track PageView on client-side navigation. Guarded so it no-ops until
  // the deferred install completes.
  const router = useRouter()
  router.afterEach(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'PageView')
    }
  })
})
