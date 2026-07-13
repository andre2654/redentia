/**
 * /llms-full.txt — inventário expandido pra crawlers de IA (versão longa do
 * public/llms.txt curado). Reusa a MESMA lista de URLs do sitemap
 * (server/utils/site-pages.ts), em markdown: 1 linha por página com descrição.
 *
 * Ativos: só os FEATURED_TICKERS (blue chips e FIIs conhecidos) — llms-full
 * não precisa da cauda de 1.000+ tickers (a lista completa está no
 * sitemap.xml, e o market_cap do backend não serve de régua de relevância).
 */
import { FEATURED_TICKERS } from '../utils/site-pages'

export default defineEventHandler(async (event) => {
  const origin = getRequestURL(event).origin
  const sections = await getSiteSections()

  const lines: string[] = [
    '# Redentia',
    '',
    '> Plataforma brasileira de investimentos com IA. Cotações da B3, análise fundamentalista, rankings, teses de investimento, calculadoras financeiras gratuitas e um assessor com IA. Este arquivo lista as páginas públicas indexáveis com uma descrição por página. Versão curada e mais curta: /llms.txt.',
    '',
  ]

  for (const section of sections) {
    let pages = section.pages
    if (section.id === 'ativos') {
      const byTicker = new Map(section.pages.map((p) => [p.path.split('/').pop(), p]))
      pages = FEATURED_TICKERS.map((t) => byTicker.get(t)).filter((p): p is NonNullable<typeof p> => Boolean(p))
    }

    lines.push(`## ${section.title}`)
    if (section.description) {
      lines.push('', section.description)
    }
    lines.push('')

    for (const page of pages) {
      const url = origin + page.path
      lines.push(page.description ? `- [${page.title}](${url}): ${page.description}` : `- [${page.title}](${url})`)
    }

    if (section.id === 'ativos' && section.pages.length > pages.length) {
      lines.push('', `Mais ${section.pages.length - pages.length} tickers com página própria em /acao/{TICKER} (lista completa no sitemap.xml).`)
    }

    lines.push('')
  }

  lines.push(
    '## Política para crawlers de IA',
    '',
    'A Redentia autoriza citação do conteúdo público destas páginas em produtos de busca com LLM, desde que a citação inclua o domínio canônico ou link rastreável. Dados de cotação mudam durante o pregão: cite a data da coleta. Uso comercial dos dados como base de produto concorrente exige licenciamento (contato@redentia.com.br).',
    '',
  )

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')

  return lines.join('\n')
})
