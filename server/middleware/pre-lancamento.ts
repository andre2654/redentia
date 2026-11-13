/**
 * No pré-lançamento (NUXT_PUBLIC_PRE_LANCAMENTO=true; nuxt.config, preLancamento), toda resposta sai fora do índice:
 * a Aportou no ar em aportou.com.br antes da troca não compete no Google com o redentia.com.br, que ainda serve o
 * mesmo conteúdo. O header vence o `robots` do HTML (o Google fica com o mais restritivo). Decidido por pedido, e não
 * no routeRules, porque o preset da Vercel congela o routeRules no build, e a variável liga e desliga sem rebuild.
 */
import { preLancamentoLigado } from '../utils/pre-lancamento'

export default defineEventHandler((event) => {
  if (preLancamentoLigado(useRuntimeConfig(event).public.preLancamento)) setResponseHeader(event, 'x-robots-tag', 'noindex, nofollow')
})
