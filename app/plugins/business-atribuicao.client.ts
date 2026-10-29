/**
 * First-touch da sessão para o pedido de hora da /business.
 *
 * Roda em qualquer página de entrada, não só na /business: o anúncio pode
 * cair numa URL e a pessoa rolar até o formulário depois. A primeira página
 * da aba grava utm_*, li_fat_id, gclid, a landing e o referrer. Uma página
 * seguinte não cobre.
 *
 * Só sessionStorage. Não mexe em GA4, GTM nem Clarity, e não carrega tag nova.
 * Rota com token no path grava a landing sem o segredo (ver paginaDeEntrada).
 */
import { capturarAtribuicao } from '~/utils/business-lead'

export default defineNuxtPlugin(() => {
  try {
    capturarAtribuicao(window.sessionStorage, window.location, document.referrer)
  }
  catch {
    // sessionStorage indisponível: o pedido sai sem origem
  }
})
