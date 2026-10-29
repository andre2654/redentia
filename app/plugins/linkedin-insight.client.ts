/**
 * LinkedIn Insight Tag. Só depois do consentimento e só com Partner ID.
 *
 * O ID vem de runtimeConfig.public.linkedinPartnerId
 * (NUXT_PUBLIC_LINKEDIN_PARTNER_ID). O padrão está no nuxt.config; vazio
 * desliga. Sem ID, este plugin não injeta script nem pixel.
 *
 * Não há <img> de noscript no HTML: sem JavaScript a pessoa não consegue
 * aceitar, e o pixel da px.ads.linkedin.com não pode sair antes disso.
 * O insight.min.js, carregado aqui depois do Aceitar, é quem chama o
 * collect com o pid.
 *
 * Visita paga (gclid, li_fat_id, utm_medium=cpc…): entra na hora do aceite,
 * no mesmo critério do GTM. Orgânico espera o requestIdleCallback.
 *
 * NÃO carrega em rota com token no path. Ver utils/analytics-privacy.ts.
 */
import { isSecretTokenPath } from '~/utils/analytics-privacy'
import { agendarComConsentimento, lerConsentimento } from '~/utils/consent'

const PARTNER_ID_FORMAT = /^\d+$/

export default defineNuxtPlugin(() => {
  if (isSecretTokenPath(window.location.pathname)) return

  const partnerId = String(
    (useRuntimeConfig().public as Record<string, unknown>).linkedinPartnerId ?? '',
  ).trim()
  if (!partnerId || !PARTNER_ID_FORMAT.test(partnerId)) return

  const instalar = () => {
    if (lerConsentimento() !== 'granted') return
    if (isSecretTokenPath(window.location.pathname)) return

    const w = window as Window & {
      __nuLinkedInLoaded?: boolean
      _linkedin_partner_id?: string
      _linkedin_data_partner_ids?: string[]
      lintrk?: ((a: unknown, b: unknown) => void) & { q: unknown[][] }
    }
    if (w.__nuLinkedInLoaded) return
    w.__nuLinkedInLoaded = true

    w._linkedin_partner_id = partnerId
    w._linkedin_data_partner_ids = w._linkedin_data_partner_ids || []
    w._linkedin_data_partner_ids.push(partnerId)

    if (!w.lintrk) {
      const lintrk = function (a: unknown, b: unknown) {
        lintrk.q.push([a, b])
      } as ((a: unknown, b: unknown) => void) & { q: unknown[][] }
      lintrk.q = []
      w.lintrk = lintrk
    }

    const s = document.createElement('script')
    s.async = true
    s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js'
    const primeiro = document.getElementsByTagName('script')[0]
    if (primeiro?.parentNode) primeiro.parentNode.insertBefore(s, primeiro)
    else document.head.appendChild(s)
  }

  agendarComConsentimento(instalar, { pagoNaHora: true })
})
