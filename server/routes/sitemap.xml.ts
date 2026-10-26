/**
 * /sitemap.xml — índice. Cada família de página tem o próprio urlset em
 * /sitemaps/{tipo}.xml, gerado da MESMA lista de getSiteSections().
 *
 * Host: origem CANÔNICA (siteOrigin), nunca o host da request. <lastmod> do
 * índice é a data mais nova REAL das URLs daquele arquivo; sem data, o campo
 * não sai. Arquivo vazio (backend fora, seção omitida) não entra no índice.
 */
export default defineEventHandler(async (event) => {
  const origin = siteOrigin(event)
  const sections = await getSiteSections()

  const entries = SITEMAP_ORDEM.flatMap((tipo) => {
    const pages = paginasDoGrupo(sections, tipo)
    if (!pages.length) return []
    return [{
      loc: `${origin}/sitemaps/${tipo}.xml`,
      lastmod: latestLastmod(pages),
    }]
  })

  cacheSitemap(event)
  return sitemapIndexXml(entries)
})
