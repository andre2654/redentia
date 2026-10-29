/**
 * Visita de anúncio: a URL de entrada traz um identificador de clique pago
 * ou um utm_medium de mídia paga.
 *
 * Google (gclid, gbraid, wbraid), Meta (fbclid), Microsoft (msclkid),
 * TikTok (ttclid) e LinkedIn (li_fat_id).
 *
 * O GTM (e a Insight Tag, quando há Partner ID) usa isto para entrar na hora
 * depois do consentimento, sem esperar o requestIdleCallback. O orgânico
 * continua adiado. Ver google-tag-manager.ts.
 */
const PAID_CLICK_PARAMS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id']
const PAID_UTM_MEDIUM = /^(cpc|ppc|cpm|display|paid([-_ ]?social)?|paidsocial)$/i

export function isPaidLanding(search: string): boolean {
  const q = new URLSearchParams(search)
  return PAID_CLICK_PARAMS.some(p => q.has(p)) || PAID_UTM_MEDIUM.test(q.get('utm_medium') ?? '')
}
