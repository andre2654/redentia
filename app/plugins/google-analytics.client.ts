// Google Analytics 4 (gtag.js). Migrado do Frontend antigo no cutover.
// — deferido até requestIdleCallback (fallback setTimeout 500ms em
//   Safari/iOS in-app) pra não competir com o LCP.
// — page_view manual em cada navegação SPA (o `config` já dispara o 1º).
//
// Measurement ID em runtimeConfig.public.gaId. NUXT_PUBLIC_GA_ID= vazio
// desliga em qualquer env.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const gaId = (config.public as any).gaId as string
  if (!gaId) return

  const installGtag = () => {
    if ((window as any).gtag) return

    ;(window as any).dataLayer = (window as any).dataLayer || []
    function gtag(..._args: unknown[]) {
      ;(window as any).dataLayer.push(arguments)
    }
    ;(window as any).gtag = gtag

    gtag('js', new Date())
    gtag('config', gaId, { send_page_view: true })

    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(s)
  }

  if ('requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(installGtag, { timeout: 4000 })
  }
  else {
    setTimeout(installGtag, 500)
  }

  // SPA navigations não disparam o page_view automático do gtag.
  const router = useRouter()
  router.afterEach((to) => {
    if (typeof window === 'undefined' || !(window as any).gtag) return
    ;(window as any).gtag('event', 'page_view', {
      page_path: to.fullPath,
      page_location: window.location.href,
      page_title: document.title,
    })
  })
})
