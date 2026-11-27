/**
 * GET /api/acoes-dividendos — ranking de ações com DY e a contagem de meses
 * com pagamento. Falha de rede devolve lista vazia. As páginas continuam no ar.
 */
import { resultadoVazio } from '../../app/utils/acoesDividendos.ts'
import { spISODate } from '../../app/utils/format.ts'
import { fetchAcoesDividendos } from '../utils/acoes-dividendos.ts'

export default defineEventHandler(async (event) => {
  try {
    const body = await fetchAcoesDividendos()
    setHeader(event, 'cache-control', body.ok && !body.incompleto
      ? 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600'
      : 'no-store')
    return body
  } catch {
    setHeader(event, 'cache-control', 'no-store')
    return resultadoVazio(spISODate())
  }
})
