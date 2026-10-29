/**
 * Editorial exibido em /asset/{ticker}.
 *
 * O texto que a API devolve foi gerado em lote e mistura descrição da empresa
 * com juízo de adequação e número sem fonte. Quando há cópia local, ela
 * substitui a resposta da API por inteiro. Sem cópia local, a página ainda
 * descarta o carimbo de geração e qualquer trecho com linguagem vedada.
 */
import type { EditorialApi } from '~/types/acao'

export interface AssetEditorialCopy {
  description: string
  thesis: string
  risks: string
  peers: string
  history: string
  faq: { q: string; a: string }[]
}

/** Termos que não podem aparecer no texto editorial visível. */
export const TERMOS_VEDADOS_EDITORIAL = [
  'boa para',
  'bom para',
  'escolha padrão',
  'vantagem',
  'defensivo',
  'defensiva',
  'book',
  'atualizada em',
  'vale a pena',
  'compre',
  'aposentadoria',
  'renda passiva',
  'longo prazo',
] as const

/** Palavra inteira: "compre" não pega "compreensão", "book" não pega "book_name". */
const TERMOS_PALAVRA = new Set(['book', 'compre'])

/** Minúsculas e sem acento, para o casamento não depender de caixa nem de til. */
function plano(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

function termoParaRegex(termo: string): string {
  const base = plano(termo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return TERMOS_PALAVRA.has(plano(termo)) ? `\\b${base}\\b` : base
}

const VEDADO = new RegExp(TERMOS_VEDADOS_EDITORIAL.map(termoParaRegex).join('|'))

export function textoEditorialVedado(texto: string): boolean {
  return VEDADO.test(plano(texto))
}

function semTrechoVedado(texto: string | null): string | null {
  if (!texto) return texto
  const corpo = texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !textoEditorialVedado(p))
    .join('\n\n')
    .trim()
  return corpo || null
}

export function editorialExibido(
  ticker: string,
  api: EditorialApi | null,
  locais: Readonly<Record<string, AssetEditorialCopy>>,
): EditorialApi | null {
  const local = locais[ticker.toUpperCase()]
  if (local) {
    return {
      ticker: ticker.toLowerCase(),
      description: local.description,
      thesis_pros: local.thesis,
      thesis_cons: local.risks,
      peers_comparison: local.peers,
      history_summary: local.history,
      faq_extended: local.faq.map((item) => ({ question: item.q, answer: item.a })),
      generated_at: null,
    }
  }
  if (!api) return null
  const faq = (api.faq_extended ?? []).filter(
    (item) => item.question && item.answer && !textoEditorialVedado(`${item.question} ${item.answer}`),
  )
  return {
    ...api,
    description: semTrechoVedado(api.description),
    thesis_pros: semTrechoVedado(api.thesis_pros),
    thesis_cons: semTrechoVedado(api.thesis_cons),
    peers_comparison: semTrechoVedado(api.peers_comparison),
    history_summary: semTrechoVedado(api.history_summary),
    faq_extended: faq,
    generated_at: null,
  }
}
