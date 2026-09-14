/**
 * Google Tag Manager (container GTM-M9KBJN7Q), nas duas metades do snippet
 * oficial do Google:
 *
 * 1. <noscript> com o iframe logo depois do <body>, renderizado no SSR. Essa
 *    metade só serve pra quem navega sem JS, então não pode nascer no browser.
 * 2. gtm.js no client, deferido até requestIdleCallback (fallback setTimeout
 *    500ms pra Safari e in-app sem rIC), igual ao GA4 e ao Clarity. O gtm.js
 *    pesa ~330 KB sem compressão mesmo com o container vazio e não pode
 *    competir com o LCP das páginas de SEO. Por isso NÃO é o <script> colado
 *    no <head>.
 *
 * Divide o window.dataLayer com o gtag do GA4 (google-analytics.client.ts),
 * arranjo suportado pelo Google. Se o container ganhar uma tag GA4 com o mesmo
 * G-F2QGZNWJTM, o page_view passa a contar em dobro: nesse caso desligue o
 * gaId (NUXT_PUBLIC_GA_ID=) em vez de manter os dois.
 *
 * Navegação SPA: o Vue Router troca de rota por history.pushState, então o
 * acionador "Alteração no histórico" do GTM enxerga cada página sem push manual.
 *
 * ID em runtimeConfig.public.gtmId. NUXT_PUBLIC_GTM_ID= vazio desliga num env.
 */
const GTM_ID_FORMAT = /^GTM-[A-Z0-9]+$/

export default defineNuxtPlugin(() => {
  const gtmId = (useRuntimeConfig().public as Record<string, unknown>).gtmId as string | undefined
  // O ID entra cru no innerHTML do noscript: só passa o formato do Google.
  if (!gtmId || !GTM_ID_FORMAT.test(gtmId)) return

  // Registrado nos dois lados com a mesma entrada: no client o noscript é
  // inerte, e o estado do head fica igual ao HTML que o SSR entregou.
  useHead({
    noscript: [{
      tagPosition: 'bodyOpen',
      innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
    }],
  })

  if (import.meta.server) return

  const w = window as unknown as { dataLayer?: unknown[], __nuGtmLoaded?: boolean }

  const installGtm = () => {
    if (w.__nuGtmLoaded) return
    w.__nuGtmLoaded = true

    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
    document.head.appendChild(s)
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(installGtm, { timeout: 4000 })
  }
  else {
    setTimeout(installGtm, 500)
  }
})
