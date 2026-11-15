/**
 * /llms-full.txt — inventário das URLs do sitemap, em markdown.
 *
 * Não espera a fila ao vivo do inventário: ela passa de um minuto e o
 * crawler desiste. As URLs saem da semente do sitemap, já na origem
 * canônica, sem caminho de B2B. O resumo de cada página está no /llms.txt.
 */
import { inventarioLlms } from '../utils/llms-inventario'

export default defineEventHandler((event) => {
  const origin = siteOrigin(event)
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
  return [
    `# ${MARCA.nome}`,
    '',
    `> ${MARCA.descricao} Inventário das páginas públicas de ${origin}. Cada linha é uma URL canônica do sitemap. Resumos em linguagem clara: ${origin}/llms.txt. Não é recomendação de compra ou venda.`,
    '',
    inventarioLlms(origin),
  ].join('\n')
})
