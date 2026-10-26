/**
 * /sitemaps/{tipo}.xml — um urlset por família de página.
 * O índice em /sitemap.xml só aponta para os tipos que têm URL.
 */
export default defineEventHandler(async (event) => {
  const tipo = tipoDoSitemap(getRouterParam(event, 'tipo'))
  if (!tipo) {
    throw createError({ statusCode: 404, statusMessage: 'Sitemap não encontrado' })
  }

  const origin = siteOrigin(event)
  const pages = paginasDoGrupo(await getSiteSections(), tipo)
  cacheSitemap(event)
  return urlsetXml(origin, pages)
})
