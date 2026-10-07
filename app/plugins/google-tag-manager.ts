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
 *    EXCEÇÃO, visita de anúncio (06/10/2026): quando a URL de entrada traz um
 *    identificador de clique pago (gclid, fbclid…) ou utm_medium pago, o
 *    gtm.js entra na inicialização do app, sem esperar o ocioso. É o tráfego
 *    que mais rejeita rápido, e um pixel que não dispara antes da saída some
 *    da atribuição de CAC e da otimização da campanha. O orgânico continua
 *    adiado: quem fica alguns segundos (o público de remarketing) é medido
 *    igual. Colar no <head> do SSR pra todo mundo não recupera o que se
 *    perde por bloqueador de anúncio nem pelo ITP do Safari (isso é o papel
 *    da API de Conversões, no servidor) e devolveria o custo no LCP.
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
 *
 * NÃO carrega (nem o noscript do SSR) em rota com token no path
 * (/cliente/convite, /cliente/acesso, /business/convite): o container é de
 * agência e as tags dele leem a URL. Ver utils/analytics-privacy.ts.
 */
import { isSecretTokenPath } from '~/utils/analytics-privacy'

const GTM_ID_FORMAT = /^GTM-[A-Z0-9]+$/

// Google (gclid, gbraid, wbraid), Meta (fbclid), Microsoft (msclkid),
// TikTok (ttclid) e LinkedIn (li_fat_id).
const PAID_CLICK_PARAMS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id']
const PAID_UTM_MEDIUM = /^(cpc|ppc|cpm|display|paid([-_ ]?social)?|paidsocial)$/i

function isPaidLanding(search: string): boolean {
  const q = new URLSearchParams(search)
  return PAID_CLICK_PARAMS.some(p => q.has(p)) || PAID_UTM_MEDIUM.test(q.get('utm_medium') ?? '')
}

export default defineNuxtPlugin(() => {
  const gtmId = (useRuntimeConfig().public as Record<string, unknown>).gtmId as string | undefined
  // O ID entra cru no innerHTML do noscript: só passa o formato do Google.
  if (!gtmId || !GTM_ID_FORMAT.test(gtmId)) return
  const path = import.meta.server ? useRequestURL().pathname : window.location.pathname
  if (isSecretTokenPath(path)) return

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

  if (isPaidLanding(window.location.search)) {
    installGtm()
  }
  else if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(installGtm, { timeout: 4000 })
  }
  else {
    setTimeout(installGtm, 500)
  }
})
