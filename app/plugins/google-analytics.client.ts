// Google Analytics 4 (gtag.js). Migrado do Frontend antigo no cutover.
// — sem consentimento, o script não entra (nem o cookie _ga). Recusar
//   também não carrega. A escolha fica em utils/consent.ts.
// — com consentimento, deferido até requestIdleCallback (fallback setTimeout
//   500ms em Safari/iOS in-app) pra não competir com o LCP.
// — page_view manual em cada navegação SPA (o `config` já dispara o 1º,
//   com a URL da visita, inclusive os UTMs).
//
// O Consent Mode não substitui este portão: o gtag.js seria baixado mesmo
// com analytics_storage=denied, e o requisito é sem aceite, sem script.
//
// Measurement ID em runtimeConfig.public.gaId. NUXT_PUBLIC_GA_ID= vazio
// desliga em qualquer env.
//
// NÃO carrega em rota com token no path (/cliente/convite, /cliente/acesso,
// /business/convite): o page_location levaria o segredo ao GA4. Ver
// utils/analytics-privacy.ts.
import { isSecretTokenPath } from '~/utils/analytics-privacy'
import { agendarComConsentimento, lerConsentimento } from '~/utils/consent'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const gaId = (config.public as any).gaId as string
  if (!gaId) return
  if (isSecretTokenPath(window.location.pathname)) return

  const installGtag = () => {
    if (lerConsentimento() !== 'granted') return
    if (isSecretTokenPath(window.location.pathname)) return
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

  agendarComConsentimento(installGtag)

  // SPA navigations não disparam o page_view automático do gtag.
  const router = useRouter()
  router.afterEach((to) => {
    if (lerConsentimento() !== 'granted') return
    if (typeof window === 'undefined' || !(window as any).gtag) return
    if (isSecretTokenPath(to.path)) return
    ;(window as any).gtag('event', 'page_view', {
      page_path: to.fullPath,
      page_location: window.location.href,
      page_title: document.title,
    })
  })
})
