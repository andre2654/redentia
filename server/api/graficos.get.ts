/**
 * GET /api/graficos — as séries da página. Dado público, cache de um dia.
 * A rota não grava cookie e não embute script de terceiro.
 */
import { carregarGraficos } from '../utils/graficos-dados'

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=86400')
  return await carregarGraficos()
})
