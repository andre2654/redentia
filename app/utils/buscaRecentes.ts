/**
 * Buscas recentes da /busca (redesenho de 02/11/2026): o que a pessoa abriu
 * a partir da busca, mais recente primeiro. Vive no localStorage do próprio
 * navegador (conveniência por visitante, não dado da conta) e a tela funciona
 * igual sem ele.
 *
 * Sem import de valor de propósito: os testes (node --test) importam direto.
 */

export interface BuscaRecente {
  /** estável por destino: 'ativo:PETR4', 'tesouro:tesouro-selic-2029' */
  id: string
  tipo: 'ativo' | 'tesouro' | 'tese' | 'guia'
  titulo: string
  sub: string
  href: string
  /** ticker para o logo, só de ativo */
  ticker?: string
}

export const RECENTES_MAX = 6
export const RECENTES_CHAVE = 'nu:busca:recentes'

const TIPOS = new Set(['ativo', 'tesouro', 'tese', 'guia'])

/** Põe na frente, sem repetir, e corta no máximo. */
export function adicionarRecente(lista: BuscaRecente[], item: BuscaRecente, max = RECENTES_MAX): BuscaRecente[] {
  return [item, ...lista.filter((r) => r.id !== item.id)].slice(0, max)
}

/**
 * Lê o que estava guardado. Qualquer coisa fora do formato some (versão velha,
 * edição à mão, JSON quebrado), e o href precisa ser rota interna: o que está
 * no localStorage não vira link para fora do site.
 */
export function lerRecentes(bruto: string | null | undefined, max = RECENTES_MAX): BuscaRecente[] {
  if (!bruto) return []
  let dado: unknown
  try { dado = JSON.parse(bruto) } catch { return [] }
  if (!Array.isArray(dado)) return []
  const saida: BuscaRecente[] = []
  for (const r of dado) {
    if (!r || typeof r !== 'object') continue
    const { id, tipo, titulo, sub, href, ticker } = r as Record<string, unknown>
    if (typeof id !== 'string' || typeof titulo !== 'string' || typeof href !== 'string') continue
    if (typeof tipo !== 'string' || !TIPOS.has(tipo)) continue
    if (!href.startsWith('/') || href.startsWith('//')) continue
    if (saida.some((x) => x.id === id)) continue
    saida.push({
      id,
      tipo: tipo as BuscaRecente['tipo'],
      titulo,
      sub: typeof sub === 'string' ? sub : '',
      href,
      ...(typeof ticker === 'string' ? { ticker } : {}),
    })
    if (saida.length >= max) break
  }
  return saida
}
