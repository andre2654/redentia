/**
 * Páginas /setores e /setores/{slug}.
 *
 * A classificação é a que o cadastro de ativos já traz: `industry_category`
 * do perfil (o mesmo campo que o preço teto chama de segmento). A leitura
 * gravada em server/data/preco-teto-lotes.ts é de 17/11/2026
 * (GET /tickers/{ticker}). Sem esse campo, a página não existe.
 *
 * Entra segmento com nome em português (segmentoEmPortugues) e pelo menos
 * cinco empresas. Uma classe por empresa: a de maior volume financeiro
 * naquela leitura. Saneamento (Utilities - Regulated Water) fica de fora:
 * o cadastro tem três empresas (SBSP3, SAPR, CSMG3).
 */
import { PRECO_TETO_FICHA } from '../../server/data/preco-teto-lotes.ts'
import { SETORES_BY_API } from '../content/setores.ts'
import { apiSlugDoSetor } from './paresDoSetor.ts'
import { segmentoEmPortugues } from './preco-teto-pagina.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO, TETO_TITULO_PAGINA, tituloQueCabe } from './serp.ts'

export const SETORES_LISTA_MIN = 5
/** Dia da leitura do cadastro que define quem entra em cada segmento. */
export const SETORES_LISTA_DATA = '2026-11-17'
export const SETORES_LISTA_DATA_PT = '17/11/2026'

export interface CotacaoDeSetor {
  nome: string | null
  preco: number | null
  /** YYYY-MM-DD do pregão. Sem esta data o preço não entra. */
  priceDate: string | null
  /** DY de 12 meses, em %. Sem dyDate o número não entra. */
  dy: number | null
  /** YYYY-MM-DD de key_statistics.updated_at. */
  dyDate: string | null
}

export interface SetorLista {
  slug: string
  /** Nome em português, minúsculo, como o mapa de segmentos. */
  nome: string
  /** industry_category, como veio no cadastro. */
  segmento: string
  empresas: { ticker: string }[]
  setorAmplo: { nome: string; href: string; apiSlug: string } | null
}

const ORDEM_DA_CLASSE = ['11', '4', '3', '5', '6']

function pesoDaClasse(ticker: string): number {
  const i = ORDEM_DA_CLASSE.indexOf(ticker.slice(4))
  return i === -1 ? ORDEM_DA_CLASSE.length : i
}

export function slugDeSetor(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function nomeDeTitulo(nome: string): string {
  return nome.charAt(0).toLocaleUpperCase('pt-BR') + nome.slice(1)
}

function amploDe(setores: string[]): SetorLista['setorAmplo'] {
  const cont = new Map<string, number>()
  for (const setor of setores) {
    const api = apiSlugDoSetor(setor)
    if (!api || !SETORES_BY_API[api]) continue
    cont.set(api, (cont.get(api) ?? 0) + 1)
  }
  let melhor: string | null = null
  let n = 0
  for (const [api, c] of cont) {
    if (c > n) {
      melhor = api
      n = c
    }
  }
  if (!melhor) return null
  const entry = SETORES_BY_API[melhor]!
  return { nome: entry.name, href: `/setor/${entry.ptSlug}`, apiSlug: entry.apiSlug }
}

function montar(): SetorLista[] {
  interface Candidato { ticker: string; segmento: string; volume: number; setor: string }
  const porRaiz = new Map<string, Candidato>()
  for (const [ticker, ficha] of Object.entries(PRECO_TETO_FICHA)) {
    const segmento = ficha.segmento.trim()
    if (!segmento) continue
    const raiz = ticker.slice(0, 4)
    const atual = porRaiz.get(raiz)
    const melhor = !atual
      || ficha.volume > atual.volume
      || (ficha.volume === atual.volume && pesoDaClasse(ticker) < pesoDaClasse(atual.ticker))
      || (ficha.volume === atual.volume && pesoDaClasse(ticker) === pesoDaClasse(atual.ticker) && ticker < atual.ticker)
    if (melhor) porRaiz.set(raiz, { ticker, segmento, volume: ficha.volume, setor: ficha.setor })
  }

  const grupos = new Map<string, Candidato[]>()
  for (const c of porRaiz.values()) {
    const lista = grupos.get(c.segmento) ?? []
    lista.push(c)
    grupos.set(c.segmento, lista)
  }

  const saida: SetorLista[] = []
  const slugs = new Set<string>()
  for (const [segmento, empresas] of grupos) {
    if (empresas.length < SETORES_LISTA_MIN) continue
    const nome = segmentoEmPortugues(segmento)
    if (!nome) continue
    const slug = slugDeSetor(nome)
    if (!slug || slugs.has(slug)) continue
    slugs.add(slug)
    saida.push({
      slug,
      nome,
      segmento,
      empresas: empresas
        .map((e) => ({ ticker: e.ticker }))
        .sort((a, b) => a.ticker.localeCompare(b.ticker)),
      setorAmplo: amploDe(empresas.map((e) => e.setor)),
    })
  }
  saida.sort((a, b) => b.empresas.length - a.empresas.length || a.nome.localeCompare(b.nome, 'pt-BR'))
  return saida
}

export const SETORES_LISTA: readonly SetorLista[] = montar()

export const SETORES_LISTA_POR_SLUG: Readonly<Record<string, SetorLista>> = Object.fromEntries(
  SETORES_LISTA.map((s) => [s.slug, s]),
)

export function hrefSetorDoSegmento(industry: string | null | undefined): string | null {
  const nome = segmentoEmPortugues(industry)
  if (!nome) return null
  const entry = SETORES_LISTA_POR_SLUG[slugDeSetor(nome)]
  return entry ? `/setores/${entry.slug}` : null
}

/** Link do /asset para o segmento, quando a página existe. */
export function linkOutrasEmpresasDoSetor(industry: string | null | undefined): { href: string; label: string } | null {
  const href = hrefSetorDoSegmento(industry)
  if (!href) return null
  return { href, label: 'Outras empresas do setor' }
}

export function segmentosDoSetorAmplo(apiSlug: string): SetorLista[] {
  return SETORES_LISTA.filter((s) => s.setorAmplo?.apiSlug === apiSlug)
}

/** Número só com data ISO. Sem data, devolve null para a célula ficar em branco. */
export function leituraDatada(valor: number | null | undefined, data: string | null | undefined): { valor: number; data: string } | null {
  if (valor == null || !Number.isFinite(valor)) return null
  const dia = typeof data === 'string' ? data.slice(0, 10) : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return null
  return { valor, data: dia }
}

export function textoSetorLista(s: SetorLista): string {
  return `Ativos da B3 classificados como ${s.nome} no cadastro de ${SETORES_LISTA_DATA_PT}. Quando há mais de uma classe, entra a de maior volume financeiro naquele pregão. Cotação e dividend yield de 12 meses só aparecem com a data da leitura. Não é recomendação.`
}

export function tituloSetorLista(nome: string): string {
  const n = nomeDeTitulo(nome)
  const cheio = `${n} na B3`
  return cheio.length <= TETO_TITULO_PAGINA ? cheio : tituloQueCabe(cheio)
}

export const TITULO_HUB_SETORES = 'Segmentos da B3 com cinco ativos ou mais'

function cabeDescricao(texto: string): string {
  const t = texto.replace(/\s+/g, ' ').trim()
  if (t.length >= 120 && t.length <= TETO_DESCRICAO) return t
  throw new Error(`description fora de 120–155 (${t.length}): ${t}`)
}

export function descricaoSetorLista(nome: string, n: number): string {
  const comDy = `${n} ativos da B3 classificados como ${nome} no cadastro de ${SETORES_LISTA_DATA_PT}. Uma classe por empresa. Cotação e DY só com data. Não é recomendação.`
  const curta = `${n} ativos classificados como ${nome} no cadastro da B3 de ${SETORES_LISTA_DATA_PT}. Uma classe por empresa. Não é recomendação.`
  return cabeDescricao([comDy, curta].find((t) => t.length >= 120 && t.length <= TETO_DESCRICAO) ?? comDy)
}

export function descricaoHubSetores(): string {
  return cabeDescricao(
    `Segmentos da B3 com pelo menos cinco ativos no cadastro de ${SETORES_LISTA_DATA_PT}, como bancos e energia elétrica. Uma classe por empresa. Não é recomendação.`,
  )
}

export function paginasSitemapSetoresLista(): { path: string; title: string; description: string; lastmod: string }[] {
  return [
    {
      path: '/setores',
      title: TITULO_HUB_SETORES,
      description: descricaoHubSetores(),
      lastmod: SETORES_LISTA_DATA,
    },
    ...SETORES_LISTA.map((s) => ({
      path: `/setores/${s.slug}`,
      title: tituloSetorLista(s.nome),
      description: descricaoSetorLista(s.nome, s.empresas.length),
      lastmod: SETORES_LISTA_DATA,
    })),
  ]
}

export function titulosSetoresCabem(): boolean {
  const hub = TITULO_HUB_SETORES.length + SUFIXO_MARCA.length <= TETO_TITULO
  return hub && SETORES_LISTA.every((s) => tituloSetorLista(s.nome).length + SUFIXO_MARCA.length <= TETO_TITULO)
}
