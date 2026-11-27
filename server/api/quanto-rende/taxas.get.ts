/**
 * GET /api/quanto-rende/taxas — CDI, Selic e poupança do SGS.
 * 503 quando o Banco Central não devolve um ponto crível. Sem taxa substituta.
 */
import { carregarTaxasQuantoRende } from '../../utils/quanto-rende-taxas'

export default defineEventHandler(async (event) => {
  const taxas = await carregarTaxasQuantoRende()
  if (!taxas) {
    setHeader(event, 'cache-control', 'private, no-store')
    throw createError({ statusCode: 503, statusMessage: 'Taxas temporariamente indisponíveis' })
  }
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
  return taxas
})
