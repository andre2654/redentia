/**
 * Navegação SPA para uma rota com token no path vira navegação cheia.
 *
 * Os plugins de analytics (GA4, GTM, Clarity, Vercel) não carregam quando a
 * página ABRE numa rota com segredo (utils/analytics-privacy.ts). Mas se a
 * pessoa já estava em outra página do site, os scripts já estão no ar e veem
 * o pushState do Vue Router: o acionador "Alteração no histórico" do GTM, o
 * Clarity e o script da Vercel leem a URL nova, com o token. A navegação cheia
 * descarrega esses scripts antes de a URL com o token existir na aba, e a
 * página nova abre sem eles.
 *
 * Prefixo 00. para registrar a guarda antes dos plugins de analytics.
 */
import { isSecretTokenPath } from '~/utils/analytics-privacy'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  router.beforeEach((to, from) => {
    // Primeira resolução (hidratação): a página já abriu na rota, sem scripts.
    if (!from.matched.length) return
    if (to.path === from.path) return
    if (!isSecretTokenPath(to.path)) return
    window.location.assign(to.fullPath)
    return false
  })
})
