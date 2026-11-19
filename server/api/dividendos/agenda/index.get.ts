/**
 * GET /api/dividendos/agenda — meses com lista inteira de pagamentos.
 * Dado público. A página /dividendos/agenda consome isto no SSR.
 */
import { hubDeAgenda } from '../../../../app/utils/agendaDividendos.ts'
import { carregarFontesAgenda } from '../../../utils/agenda-dividendos.ts'

export default defineEventHandler(async (event) => {
  try {
    const fontes = await carregarFontesAgenda()
    setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600')
    return hubDeAgenda(fontes)
  } catch {
    setHeader(event, 'cache-control', 'no-store')
    return hubDeAgenda(null)
  }
})
