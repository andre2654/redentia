/**
 * First-touch da sessão para o header X-Redentia-Attribution.
 *
 * Roda em qualquer página de entrada, no browser. A primeira página da aba
 * grava o caminho, os utm_* e o host do referrer externo. Uma página seguinte
 * não cobre. Só sessionStorage: sem cookie e sem script novo.
 */
import { capturarAtribuicaoDeSessao } from '~/utils/atribuicao'

export default defineNuxtPlugin(() => {
  try {
    capturarAtribuicaoDeSessao(window.sessionStorage, window.location, document.referrer)
  }
  catch {
    // sessionStorage indisponível: os pedidos de conta saem sem origem
  }
})
