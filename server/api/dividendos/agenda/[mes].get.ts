/**
 * GET /api/dividendos/agenda/{mês-ano} — proventos com pagamento naquele mês.
 * 404: slug inválido ou mês sem lista publicável. 503: o feed que o mês
 * precisa falhou ou veio cortado no limite de 500 linhas.
 */
import { responderMes, statusHttpAgenda } from '../../../utils/agenda-dividendos.ts'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'mes') ?? '')
  const resultado = await responderMes(slug)
  if (resultado.status !== 'ok' || !resultado.pagina) {
    throw createError({
      statusCode: statusHttpAgenda(resultado.status),
      statusMessage: resultado.status === 'indisponivel'
        ? 'Dados temporariamente indisponíveis'
        : 'Mês não encontrado',
    })
  }
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600')
  return resultado.pagina
})