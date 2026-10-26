/**
 * Orçamento de title e description no Google (pt-BR).
 *
 * O titleTemplate de app/app.vue acrescenta ` · Redentia` (11 caracteres) a
 * todo <title>. O número que o usuário vê — e que o Google corta por volta
 * de 60 — é o title da página MAIS esse sufixo. Description corta por volta
 * de 155. Cortar no último espaço, sem reticência: a reticência come
 * caractere e parece title quebrado.
 */

export const SUFIXO_MARCA = ' · Redentia'
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
