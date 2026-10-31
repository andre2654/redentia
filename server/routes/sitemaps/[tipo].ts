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
  // Lista de tickers incompleta (rede) não pode ficar uma hora na borda:
  // a próxima leitura tem que tentar de novo, e não congelar o buraco.
  if (tipo === 'quanto-rende' && !quantoRendeGeracaoCompleta()) {
    setHeader(event, 'content-type', 'application/xml; charset=utf-8')
    setHeader(event, 'cache-control', 'private, no-store')
  } else {
    cacheSitemap(event)
  }
  return urlsetXml(origin, pages)
})
