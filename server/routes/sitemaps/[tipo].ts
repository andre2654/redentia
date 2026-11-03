/**
 * /sitemaps/{tipo}.xml — um urlset por família de página.
 * O índice em /sitemap.xml só aponta para os tipos que têm URL.
 *
 * Todos os tipos respondem da última cópia boa. A montagem é a mesma lista
 * de páginas de antes, e a fila do quanto-rende passa de dois minutos.
 */
import { responderSitemapPesado } from '../../utils/sitemap-resposta.ts'

export default defineEventHandler(async (event) => {
  const tipo = tipoDoSitemap(getRouterParam(event, 'tipo'))
  if (!tipo) {
    throw createError({ statusCode: 404, statusMessage: 'Sitemap não encontrado' })
  }

  return responderSitemapPesado(event, tipo, siteOrigin(event))
})
