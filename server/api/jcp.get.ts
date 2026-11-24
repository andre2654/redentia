/**
 * GET /api/jcp — avisos de JCP com data, a partir dos mesmos feeds da agenda.
 * Falha de rede devolve lista vazia. A página /jcp continua no ar.
 */
import { NOTA_CVM } from '../../app/utils/agendaDividendos.ts'
import { FONTE_PAGADORES_JCP, pagadoresDeJcp, respostaVaziaPagadores } from '../../app/utils/jcpPagadores.ts'
import { carregarFontesAgenda } from '../utils/agenda-dividendos.ts'

export default defineEventHandler(async (event) => {
  try {
    const fontes = await carregarFontesAgenda()
    const ok = fontes.recentes.ok || fontes.futuros.ok
    const itens = [
      ...(fontes.recentes.ok ? fontes.recentes.itens : []),
      ...(fontes.futuros.ok ? fontes.futuros.itens : []),
    ]
    setHeader(event, 'cache-control', ok
      ? 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600'
      : 'no-store')
    if (!ok) return respostaVaziaPagadores(false)
    return {
      ok: true,
      pagadores: pagadoresDeJcp(itens, fontes.hoje),
      fonte: FONTE_PAGADORES_JCP,
      nota: NOTA_CVM,
    }
  } catch {
    setHeader(event, 'cache-control', 'no-store')
    return respostaVaziaPagadores(false)
  }
})
