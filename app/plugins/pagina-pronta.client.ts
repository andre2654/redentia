/**
 * Acompanha quando a página termina de carregar (12/11/2026): o que pode
 * esperar (o vigia da carteira na régua, utils/quandoOcioso.ts) só sai depois
 * do page:finish e com o navegador ocioso, sem disputar com a página. Liga no
 * começo do app para a hidratação contar como carregando.
 */
import { acompanharPaginas } from '~/utils/quandoOcioso'

export default defineNuxtPlugin({
  name: 'pagina-pronta',
  setup(nuxtApp) {
    acompanharPaginas(nuxtApp)
  },
})
