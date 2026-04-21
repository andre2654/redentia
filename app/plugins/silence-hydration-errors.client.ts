// ============================================================
// Hydration-error safety net
// ============================================================
// Pragmatic fix for pages that render fine server-side (HTTP 200)
// but throw during client hydration — most commonly inside the
// Instagram in-app browser, which blocks some storage/cookie APIs
// and can crash plugins that assume a full browser.
//
// Default Nuxt behavior: any uncaught Vue error → `showError(500)`
// → swap to `error.vue`. From the user's perspective, the page
// was fine for a split second, then the error page appears. Not
// acceptable for a landing page a big client is about to visit.
//
// This plugin intercepts client-side errors, logs them to the
// backend (via `navigator.sendBeacon` so it's fire-and-forget and
// survives page unload), and DOES NOT bubble them to Nuxt's error
// handler. The page stays rendered with whatever the SSR produced.
//
// Server-side errors (real SSR 500s) still propagate normally —
// Nuxt's server error path isn't touched here.
// ============================================================

export default defineNuxtPlugin((nuxtApp) => {
  function report(kind: string, err: unknown, info?: string) {
    const payload = {
      kind,
      message: (err as any)?.message || String(err),
      stack: typeof (err as any)?.stack === 'string' ? (err as any).stack.slice(0, 4000) : null,
      info: info || null,
      url: typeof window !== 'undefined' ? window.location.href : null,
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      ts: Date.now(),
    }
    try {
      // eslint-disable-next-line no-console
      console.error(`[client-error:${kind}]`, err, info || '')
    } catch {}
    try {
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
        navigator.sendBeacon('/api/_debug/client-error', blob)
      }
    } catch {}
  }

  // Vue component-level errors (render/watch/setup/mounted/etc).
  // Overriding the app errorHandler here suppresses the default
  // Nuxt behavior of calling `showError` for any uncaught Vue error.
  nuxtApp.vueApp.config.errorHandler = (err, _instance, info) => {
    report('vue', err, info)
  }

  // Nuxt-specific hooks — belt + suspenders in case the errorHandler
  // override misses something.
  nuxtApp.hook('vue:error', (err, _instance, info) => {
    report('vue:hook', err, info)
  })
  nuxtApp.hook('app:error', (err) => {
    report('app:error', err)
  })

  // Native window/promise errors (e.g. a CSS font fetch failing, a
  // blocked script in Instagram IAB).
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (ev) => {
      report('window', ev.error ?? ev.message, ev.filename ? `${ev.filename}:${ev.lineno}` : undefined)
    })
    window.addEventListener('unhandledrejection', (ev) => {
      report('unhandledrejection', ev.reason)
    })
  }
})
