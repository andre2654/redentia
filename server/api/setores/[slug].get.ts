/**
 * Cotações datadas do segmento. A lista de tickers é o cadastro local;
 * esta rota só completa nome, preço e DY quando a leitura traz data.
 */
import { SETORES_LISTA_POR_SLUG } from '../../../app/utils/setoresLista'
import { cotacoesDoSetor } from '../../utils/setores-cotacao'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') ?? '')
  const entry = SETORES_LISTA_POR_SLUG[slug]
  if (!entry) {
    throw createError({ statusCode: 404, statusMessage: 'Setor não encontrado' })
  }
  return cotacoesDoSetor(entry.empresas.map((e) => e.ticker))
})
