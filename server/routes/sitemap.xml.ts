/**
 * /sitemap.xml — índice. Cada família de página tem o próprio urlset em
 * /sitemaps/{tipo}.xml, gerado da MESMA lista de getSiteSections().
 *
 * A resposta sai da última cópia boa, como os urlsets. Host: origem CANÔNICA
 * (siteOrigin), nunca o host da request. <lastmod> do índice é a data mais
 * nova REAL das URLs daquele arquivo; sem data, o campo não sai. Arquivo
 * vazio (backend fora, seção omitida) não entra no índice.
 */
import { responderSitemapPesado } from '../utils/sitemap-resposta.ts'
import { SITEMAP_INDICE } from '../utils/sitemap-xml.ts'

export default defineEventHandler(async (event) => {
  return responderSitemapPesado(event, SITEMAP_INDICE, siteOrigin(event))
})
