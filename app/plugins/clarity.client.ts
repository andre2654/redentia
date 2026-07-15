/**
 * Microsoft Clarity — session recordings + heatmaps + AI insights.
 * Migrado do Frontend antigo no cutover. Project ID: wmh9pyc3io.
 *
 * Load lazy via requestIdleCallback (fallback setTimeout 500ms pra Safari
 * / IG in-app browser sem rIC), depois do LCP. Pula hosts de dev/preview
 * pra não contaminar o funil de prod com sessões de localhost/preview.
 *
 * Lê de runtimeConfig.public.clarityProjectId. NUXT_PUBLIC_CLARITY_PROJECT_ID=
 * vazio desliga num env.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const projectId
    = ((config.public as Record<string, unknown>).clarityProjectId as string | undefined)
    || 'wmh9pyc3io'

  if (!projectId) return

  // Não roda em localhost / *.vercel.app (preview) / hostnames com "preview":
  // heatmaps de dev viram "rage clicks" falsos no projeto de prod.
  const host = window.location.hostname.toLowerCase()
  const isDev
    = host === 'localhost'
    || host === '127.0.0.1'
    || host === '0.0.0.0'
    || host.endsWith('.local')
    || host.endsWith('.vercel.app')
    || host.includes('preview')
  if (isDev && !(window as { __forceClarity?: boolean }).__forceClarity) {
    return
  }

  const installClarity = () => {
    if ((window as { clarity?: unknown }).clarity) return

    ;(function (c: Window & { clarity?: unknown }, l: Document, a: string, r: string, i: string) {
      const w = c as Window & { clarity?: { (...args: unknown[]): void, q?: unknown[] } }
      w.clarity
        = w.clarity
        || function (...args: unknown[]) {
          (w.clarity!.q = w.clarity!.q || []).push(args)
        }
      const t = l.createElement(r) as HTMLScriptElement
      t.async = true
      t.src = `https://www.clarity.ms/tag/${i}`
      const y = l.getElementsByTagName(r)[0] as HTMLScriptElement | undefined
      if (y && y.parentNode) y.parentNode.insertBefore(t, y)
    })(window, document, 'clarity', 'script', projectId)
  }

  if ('requestIdleCallback' in window) {
    ;(window as Window & { requestIdleCallback: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number }).requestIdleCallback(installClarity, { timeout: 4000 })
  }
  else {
    setTimeout(installClarity, 500)
  }
})
