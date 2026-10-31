/**
 * /sitemaps/{tipo}.xml — um urlset por família de página.
 * O índice em /sitemap.xml só aponta para os tipos que têm URL.
 *
 * dividendos e quanto-rende respondem da última cópia boa. A fila que monta
 * o quanto-rende passa de dois minutos; o Googlebot não espera isso.
 */
import { responderSitemapPesado } from '../../utils/sitemap-resposta.ts'

const SITEMAPS_PESADOS = new Set(['dividendos', 'quanto-rende'])

export default defineEventHandler(async (event) => {
  const tipo = tipoDoSitemap(getRouterParam(event, 'tipo'))
  if (!tipo) {
    throw createError({ statusCode: 404, statusMessage: 'Sitemap não encontrado' })
  }

  const origin = siteOrigin(event)
  if (SITEMAPS_PESADOS.has(tipo)) {
    return responderSitemapPesado(event, tipo, origin)
  }

  const pages = paginasDoGrupo(await getSiteSections(), tipo)
  cacheSitemap(event)
  return urlsetXml(origin, pages)
})
