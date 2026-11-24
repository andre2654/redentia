/**
 * Orçamento de title e description no Google (pt-BR).
 *
 * O titleTemplate de app/app.vue acrescenta ` · Aportou` (10 caracteres) a
 * todo <title>. O número que a pessoa vê, e que o Google corta por volta de
 * 60, é o title da página mais esse sufixo. Description corta por volta de
 * 155. Cortar no último espaço, sem reticência: a reticência come caractere
 * e parece title quebrado.
 */

export const SUFIXO_MARCA = ' · Aportou'
export const TETO_TITULO = 60
export const TETO_DESCRICAO = 155
export const TETO_TITULO_PAGINA = TETO_TITULO - SUFIXO_MARCA.length

export function tituloQueCabe(titulo: string, teto = TETO_TITULO_PAGINA): string {
  const t = titulo.replace(/\s+/g, ' ').trim()
  if (t.length <= teto) return t
  const cut = t.slice(0, teto)
  const sp = cut.lastIndexOf(' ')
  return (sp >= Math.min(24, teto - 8) ? cut.slice(0, sp) : cut).replace(/[\s,.:;–—-]+$/u, '')
}

/** Preposição ou conjunção que não pode sobrar no fim de um nome encurtado. */
const PREPOSICAO_SOLTA = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

function tokenSolto(palavra: string): boolean {
  const limpa = palavra.toLowerCase().replace(/^[,.:;–—-]+|[,.:;–—-]+$/gu, '')
  return !limpa || PREPOSICAO_SOLTA.has(limpa)
}

/**
 * Encurta um nome de empresa no teto, só entre palavras. Não corta no meio
 * da palavra, não deixa "da", "de", "do", "das", "dos" ou "e" soltos no fim
 * e não termina em hífen. Se nem a primeira palavra cabe, devolve '' para
 * o título usar o ticker.
 */
export function encurtaNome(nome: string, teto: number): string {
  const t = nome.replace(/\s+/g, ' ').trim()
  if (!t || teto < 1) return ''
  if (t.length <= teto) return t
  const palavras = t.split(' ')
  let n = palavras.length
  while (n > 0) {
    while (n > 0 && tokenSolto(palavras[n - 1]!)) n -= 1
    if (n === 0) return ''
    const candidato = palavras.slice(0, n).join(' ').replace(/[–—-]+$/u, '').trim()
    const ultima = candidato.split(' ').at(-1)?.toLowerCase().replace(/[,.:;–—-]+$/u, '') ?? ''
    if (candidato && candidato.length <= teto && !PREPOSICAO_SOLTA.has(ultima)) return candidato
    n -= 1
  }
  return ''
}

/**
 * Title de /dividendos/{ticker}. A consulta (ticker + dividendos) abre.
 * O nome entra inteiro quando ainda cabe nos 50 caracteres antes de
 * " · Aportou"; nome longo cai na versão curta, sem cortar palavra.
 */
export function tituloDividendos(ticker: string, nome?: string | null): string {
  const t = ticker.replace(/\s+/g, ' ').trim().toUpperCase()
  const empresa = (nome ?? '').replace(/\s+/g, ' ').trim()
  const curta = `${t}: dividendos, histórico e data com`
  if (empresa && empresa.toUpperCase() !== t) {
    const comNome = `${t}: dividendos ${empresa}, histórico e data com`
    if (comNome.length <= TETO_TITULO_PAGINA) return comNome
  }
  if (curta.length <= TETO_TITULO_PAGINA) return curta
  const minima = `${t}: dividendos`
  return minima.length <= TETO_TITULO_PAGINA ? minima : tituloQueCabe(minima)
}

export function descricaoQueCabe(texto: string, teto = TETO_DESCRICAO): string {
  const t = texto.replace(/\s+/g, ' ').trim()
  if (t.length <= teto) return t
  const cut = t.slice(0, teto)
  const sp = cut.lastIndexOf(' ')
  const base = (sp >= 80 ? cut.slice(0, sp) : cut).replace(/[\s,.:;–—-]+$/u, '')
  return /[.!?]$/.test(base) ? base : `${base}.`
}

/** Junta frases inteiras enquanto couberem. Se a primeira sozinha estourar, ela é cortada. */
export function juntaAte(partes: Array<string | null | undefined | false>, teto = TETO_DESCRICAO): string {
  const limpas = partes
    .filter((p): p is string => typeof p === 'string')
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  if (!limpas.length) return ''
  let out = ''
  for (const p of limpas) {
    const next = out ? `${out} ${p}` : p
    if (next.length > teto) break
    out = next
  }
  return out || descricaoQueCabe(limpas[0]!, teto)
}

/** Title de /setor/{slug}. "Setor Serviços financeiros…" estourava 87 caracteres. */
export function tituloSetor(ptSlug: string, name: string): string {
  if (ptSlug === 'financeiro') return 'Financeiro na B3: bancos e cotações'
  return tituloQueCabe(`${name} na B3: empresas e cotações`)
}
