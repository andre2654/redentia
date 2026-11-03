/**
 * O hub /guias visto como biblioteca (02/11/2026): a camada de APRESENTAÇÃO
 * sobre o registry de app/content/guias. Nada aqui muda o formato do dado: a
 * rotina semanal continua escrevendo `app/content/guias/<slug>.ts` + uma linha
 * em GUIDE_DOCS e outra em GUIDES, e tudo o que entra lá aparece sozinho no
 * hub. O tema sai da `tag` que a rotina já escreve; os mapas abaixo só
 * refinam (o guia de IR mora em "Imposto de renda", não em "Guia Redentia").
 * Slug que ainda não existe nas trilhas cai só na lista completa, e slug de
 * trilha que sumiu do registry é ignorado em silêncio.
 *
 * Sem `~/` em import de valor: o teste (node --test) importa este arquivo.
 */
import type { GuideDoc, GuideMeta, GuideTag } from '../types/guias'

export type GuiaTemaId = 'renda-fixa' | 'acoes' | 'dividendos' | 'fiis' | 'impostos' | 'carteira' | 'cripto'

export interface GuiaTema { id: GuiaTemaId; rotulo: string; linha: string }

/** Ordem de leitura de quem chega: do colchão à carteira. */
export const GUIAS_TEMAS: readonly GuiaTema[] = [
  { id: 'renda-fixa', rotulo: 'Renda fixa', linha: 'Reserva, Tesouro e a renda fixa do banco.' },
  { id: 'acoes', rotulo: 'Ações e ETFs', linha: 'Como comprar, como analisar e quanto pagar.' },
  { id: 'dividendos', rotulo: 'Dividendos', linha: 'O calendário do provento e a renda que pinga.' },
  { id: 'fiis', rotulo: 'FIIs', linha: 'Fundos imobiliários, do segmento ao indicador.' },
  { id: 'impostos', rotulo: 'Imposto de renda', linha: 'O que declarar e o que a Receita leva.' },
  { id: 'carteira', rotulo: 'Carteira e IA', linha: 'A carteira inteira num lugar, e a IA lendo junto.' },
  { id: 'cripto', rotulo: 'Cripto', linha: 'Quanto da carteira e com que cuidado.' },
]

const TEMA_DA_TAG: Record<GuideTag, GuiaTemaId> = {
  'Renda fixa': 'renda-fixa',
  'Ações': 'acoes',
  'Análise': 'acoes',
  'Dividendos': 'dividendos',
  'FIIs': 'fiis',
  'Guia Redentia': 'carteira',
  'Cripto': 'cripto',
}

/** Onde a tag do registry não diz o assunto do guia. */
const TEMA_DO_SLUG: Record<string, GuiaTemaId> = {
  'como-declarar-investimentos-no-ir': 'impostos',
  'imposto-sobre-dividendos': 'impostos',
}

export interface GuiaTrilha { id: string; titulo: string; linha: string; slugs: string[] }

/** As trilhas: sequências de leitura escolhidas à mão (só slugs). */
export const GUIAS_TRILHAS: readonly GuiaTrilha[] = [
  {
    id: 'comece',
    titulo: 'Comece por aqui',
    linha: 'Do colchão de segurança à primeira carteira.',
    slugs: ['reserva-de-emergencia', 'tesouro-direto-para-iniciantes', 'como-investir-em-acoes', 'como-investir-em-etf', 'como-montar-carteira-de-investimentos'],
  },
  {
    id: 'dividendos',
    titulo: 'Viver de dividendos',
    linha: 'Como o provento funciona e como fazer ele pagar as contas.',
    slugs: ['data-com-e-data-ex', 'acoes-fiis-dividendos-todo-mes', 'calculadora-de-dividendos', 'melhores-fiis-2026', 'tesouro-renda-mais-educa-mais'],
  },
  {
    id: 'analise',
    titulo: 'Analisar uma empresa',
    linha: 'Os indicadores, o preço teto e onde o risco mora.',
    slugs: ['como-analisar-uma-acao', 'como-calcular-preco-teto', 'small-caps-guia-completo', 'como-investir-em-bdr'],
  },
  {
    id: 'ir',
    titulo: 'Imposto de renda',
    linha: 'O que é isento, o que é tributado e como declarar.',
    slugs: ['cdb-lci-lca', 'imposto-sobre-dividendos', 'como-declarar-investimentos-no-ir'],
  },
  {
    id: 'ia',
    titulo: 'Sua carteira com IA',
    linha: 'Conecte a carteira e pergunte sobre ela em português.',
    slugs: ['open-finance', 'conectar-carteira-ao-chatgpt', 'mcp-para-investimentos'],
  },
]

export interface GuiaItemVM {
  /** slug do guia */
  chave: string
  titulo: string
  linha: string
  tema: GuiaTemaId
  temaRotulo: string
  minutos: number
  to: string
  /** 'out 2026', da última revisão do guia */
  mesAno: string | null
  publicado: string | null
  /** títulos das seções do guia, na ordem: o sumário */
  secoes: string[]
  /** resumo longo (o do card em destaque) */
  resumo: string | null
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
export function guiasMesAno(iso: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})/.exec(iso ?? '')
  return m ? `${MESES[Number(m[2]) - 1]} ${m[1]}` : null
}

/** Busca sem acento e sem caixa: "imposto" acha "Imposto", "acoes" acha "Ações". */
export function guiasNormalizar(s: string): string {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

export function guiasBuscar(itens: GuiaItemVM[], termo: string): GuiaItemVM[] {
  const palavras = guiasNormalizar(termo).split(' ').filter(Boolean)
  if (!palavras.length) return itens
  // acha em qualquer lugar (título, linha, tema, seções); o que acha no título vem antes
  const peso = (g: GuiaItemVM) => {
    const t = guiasNormalizar(`${g.titulo} ${g.temaRotulo}`)
    const l = guiasNormalizar(g.linha)
    const alvo = `${t} ${l} ${guiasNormalizar(g.secoes.join(' '))}`
    if (!palavras.every((p) => alvo.includes(p))) return 0
    return palavras.every((p) => t.includes(p)) ? 3 : palavras.every((p) => `${t} ${l}`.includes(p)) ? 2 : 1
  }
  return itens
    .map((g, i) => ({ g, i, p: peso(g) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p || a.i - b.i)
    .map((x) => x.g)
}

export interface BibliotecaGuias {
  itens: GuiaItemVM[]
  /** o guia mais novo (pela data de publicação) */
  destaque: GuiaItemVM | null
  temas: (GuiaTema & { itens: GuiaItemVM[] })[]
  trilhas: (GuiaTrilha & { itens: GuiaItemVM[]; minutos: number })[]
  /** a revisão mais recente entre os guias */
  atualizadoEm: string | null
}

export function montarBibliotecaGuias(
  metas: readonly GuideMeta[],
  docs: Record<string, GuideDoc>,
  extra?: GuideDoc | null,
): BibliotecaGuias {
  const vm = (meta: GuideMeta, doc: GuideDoc | null): GuiaItemVM | null => {
    const to = meta.slug ? `/guias/${meta.slug}` : meta.href ?? null
    if (!to) return null
    const tema = (meta.slug && TEMA_DO_SLUG[meta.slug]) || TEMA_DA_TAG[meta.tag] || 'carteira'
    return {
      chave: meta.slug ?? to,
      titulo: meta.title,
      linha: meta.description,
      tema,
      temaRotulo: GUIAS_TEMAS.find((t) => t.id === tema)?.rotulo ?? meta.tag,
      minutos: doc ? doc.minutes : meta.minutes,
      to,
      mesAno: guiasMesAno(doc?.dateModified),
      publicado: doc?.datePublished ?? null,
      secoes: doc ? doc.sections.map((s) => s.title) : [],
      resumo: doc?.summary ?? null,
    }
  }

  const vistos = new Set<string>()
  const itens: GuiaItemVM[] = []
  for (const meta of metas) {
    const doc = meta.slug ? docs[meta.slug] ?? null : null
    // card sem guia escrito (hoje só "Análise PETR4", que aponta para
    // /asset/PETR4 com um "12 min de leitura" que não existe) fica fora da
    // biblioteca: ela só lista guia de verdade, e as contagens não mentem
    if (!doc) continue
    const item = vm(meta, doc)
    if (!item || vistos.has(item.chave)) continue
    vistos.add(item.chave)
    itens.push(item)
  }
  // o guia em destaque de hoje (Open Finance) não está na lista do hub
  if (extra && !vistos.has(extra.slug)) {
    const item = vm({ title: extra.title, description: extra.dek, tag: extra.tag, minutes: extra.minutes, slug: extra.slug }, extra)
    if (item) { itens.push(item); vistos.add(item.chave) }
  }

  const comData = itens.filter((g) => g.publicado)
  const destaque = comData.reduce<GuiaItemVM | null>((a, g) => (!a || (g.publicado! > a.publicado!) ? g : a), null)
  const revisoes = Object.values(docs).map((d) => d.dateModified).filter(Boolean).sort()
  const porChave = new Map(itens.map((g) => [g.chave, g]))

  return {
    itens,
    destaque,
    temas: GUIAS_TEMAS.map((t) => ({ ...t, itens: itens.filter((g) => g.tema === t.id) })).filter((t) => t.itens.length),
    trilhas: GUIAS_TRILHAS
      .map((t) => {
        const lista = t.slugs.map((s) => porChave.get(s)).filter((g): g is GuiaItemVM => !!g)
        return { ...t, itens: lista, minutos: lista.reduce((s, g) => s + g.minutos, 0) }
      })
      .filter((t) => t.itens.length >= 2),
    atualizadoEm: guiasMesAno(revisoes.at(-1)),
  }
}

/** Guias abertos neste navegador (só para o progresso das trilhas). */
export const GUIAS_LIDOS_CHAVE = 'nu:guias-abertos'
export function guiasLerAbertos(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(GUIAS_LIDOS_CHAVE) ?? '[]')
    return Array.isArray(v) ? v.filter((s) => typeof s === 'string').slice(0, 200) : []
  } catch { return [] }
}
export function guiasMarcarAberto(chave: string): string[] {
  const lista = guiasLerAbertos()
  if (!lista.includes(chave)) lista.push(chave)
  try { localStorage.setItem(GUIAS_LIDOS_CHAVE, JSON.stringify(lista)) } catch { /* modo privado: sem progresso */ }
  return lista
}
