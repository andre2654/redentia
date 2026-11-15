/**
 * Inventário do llms.txt e do llms-full.txt a partir da semente do sitemap.
 *
 * getSiteSections() espera o histórico de cada pagador e passa de um minuto.
 * Um crawler desiste antes. A semente é a última cópia boa do sitemap, já no
 * bundle, e a resposta sai na hora. O host antigo gravado nela vira a origem
 * canônica; caminho de B2B não entra.
 */
import { SEMENTES_SITEMAP } from '../data/sitemap-semente.ts'
import { xmlNaOrigem } from './sitemap-cache.ts'
import { SITEMAP_ORDEM } from './sitemap-xml.ts'

const HOSTS_ANTIGOS = ['https://www.redentia.com.br', 'https://redentia.com.br']
const CAMINHO_B2B = /^\/(?:business|cliente|jantar|whitelabel|pricing|relatorio|entrar)(?:\/|$)/i

type Semente = { xml?: string; origin?: string }

function semente(tipo: string): Semente | null {
  const item = (SEMENTES_SITEMAP as Record<string, Semente>)[tipo]
  return item && typeof item.xml === 'string' ? item : null
}

/** XML do tipo, com <loc> já na origem pedida. */
export function xmlDaSemente(tipo: string, origin: string): string {
  const item = semente(tipo)
  if (!item?.xml) return ''
  let xml = xmlNaOrigem(item.xml, item.origin || HOSTS_ANTIGOS[0], origin)
  for (const host of HOSTS_ANTIGOS) xml = xml.replaceAll(`<loc>${host}`, `<loc>${origin}`)
  return xml
}

export function contagemDaSemente(tipo: string): number {
  return (xmlDaSemente(tipo, 'https://aportou.com.br').match(/<loc>/g) ?? []).length
}

function caminhoDe(loc: string, origin: string): string | null {
  if (!loc.startsWith(origin)) return null
  const path = loc.slice(origin.length).split('?')[0] || '/'
  if (!path.startsWith('/') || CAMINHO_B2B.test(path)) return null
  return path
}

/** Uma seção de markdown por arquivo do sitemap, só com URL canônica. */
export function inventarioLlms(origin: string): string {
  const blocos: string[] = []
  for (const tipo of SITEMAP_ORDEM) {
    const xml = xmlDaSemente(tipo, origin)
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => caminhoDe(m[1] ?? '', origin))
      .filter((p): p is string => !!p)
    if (!paths.length) continue
    blocos.push(`## ${tipo}`, '', ...paths.map((p) => `- ${origin}${p}`), '')
  }
  return blocos.join('\n')
}
