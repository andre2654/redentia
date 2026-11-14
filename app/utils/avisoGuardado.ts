/**
 * O aviso do motor guardado na aba (12/11/2026, a abertura do ativo mais rápida).
 *
 * A resposta de GET /me/carteira/visao é pesada (~124 KB, segundos na API) e a
 * régua do topo só precisa de um booleano dela: o aviso urgente existe e está
 * na lista do dia. Ele fica no sessionStorage por 5 minutos, para uma página
 * nova ou um recarregamento não pedirem de novo.
 *
 * A CHAVE muda quando a pessoa troca de conta, sem guardar o token: leva um
 * hash curto dele (FNV-1a de 32 bits, em base 36). O valor é só o booleano e a
 * hora da resposta. Tudo dentro de try/catch (aba anônima, cota cheia, storage
 * bloqueado): sem storage, a consulta só não é poupada.
 */
export const VALIDADE_DO_AVISO_MS = 5 * 60 * 1000
const PREFIXO = 'nu:aviso-carteira:'

/** O hash curto do token: muda com a conta, e o token não sai dele. */
export function impressaoDoToken(token: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

export function chaveDoAviso(token: string): string {
  return `${PREFIXO}${impressaoDoToken(token)}`
}

/** O que o storage precisa ter (o sessionStorage do navegador, ou um falso no teste). */
export type GuardaDoAviso = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

/** O aviso guardado para esta sessão, se ainda vale; null se não há, venceu ou veio torto. */
export function lerAvisoGuardado(guarda: GuardaDoAviso | null | undefined, token: string, agora = Date.now()): { urgente: boolean; em: number } | null {
  if (!guarda || !token) return null
  try {
    const bruto = guarda.getItem(chaveDoAviso(token))
    if (!bruto) return null
    const v = JSON.parse(bruto) as { urgente?: unknown; em?: unknown } | null
    if (!v || typeof v.urgente !== 'boolean' || typeof v.em !== 'number' || !Number.isFinite(v.em)) return null
    // vencido, ou do futuro (o relógio da máquina voltou): não vale
    if (v.em > agora || agora - v.em >= VALIDADE_DO_AVISO_MS) return null
    return { urgente: v.urgente, em: v.em }
  } catch {
    return null
  }
}

/** Guarda a resposta desta sessão e tira as de outras contas (só uma fica na aba). */
export function guardarAviso(guarda: GuardaDoAviso | null | undefined, token: string, urgente: boolean, agora = Date.now()): void {
  if (!guarda || !token) return
  try {
    const minha = chaveDoAviso(token)
    esquecerAvisosGuardados(guarda, minha)
    guarda.setItem(minha, JSON.stringify({ urgente, em: agora }))
  } catch { /* sem storage: só não poupa a próxima consulta */ }
}

/** Tira da aba os avisos guardados (a sessão saiu ou trocou); `menos` fica. */
export function esquecerAvisosGuardados(guarda: GuardaDoAviso | null | undefined, menos?: string): void {
  if (!guarda) return
  try {
    const chaves: string[] = []
    for (let i = 0; i < guarda.length; i++) {
      const k = guarda.key(i)
      if (k && k.startsWith(PREFIXO) && k !== menos) chaves.push(k)
    }
    for (const k of chaves) guarda.removeItem(k)
  } catch { /* nada */ }
}

/** O sessionStorage, se o navegador deixar (o acesso em si pode lançar). */
export function guardaDaAba(): GuardaDoAviso | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}
