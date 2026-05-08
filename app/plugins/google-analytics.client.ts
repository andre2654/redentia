// Google Analytics 4 (gtag.js). Mirrors the meta-pixel plugin shape:
// — defers script injection until requestIdleCallback (Safari/iOS in-app
//   browser fallback to setTimeout 500ms) so it doesn't compete with LCP.
// — picks up route changes via router.afterEach to log SPA navigations as
//   GA `page_view` events. The initial PageView fires inside `gtag('config',
//   id)` automatically, so we only manually fire on subsequent navigations.
//
// Measurement ID lives in runtimeConfig.public.gaId. Set the string to
// empty in .env (NUXT_PUBLIC_GA_ID=) to disable in any environment.
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
  } else {
    setTimeout(installGtag, 500)
  }

  // SPA navigations don't trigger gtag's auto page_view, so we fire one
  // manually on every route change. Guarded so it no-ops while gtag is
  // still being deferred-loaded.
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
