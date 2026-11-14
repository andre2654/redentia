/**
 * Helpers de auth compartilhados (PR6). Vivem em utils/ (auto-import) porque
 * o middleware inline de definePageMeta não pode referenciar locals da página.
 */

/**
 * Sanitiza um ?redirect= vindo de query string: só paths INTERNOS (começa
 * com '/', nunca '//' nem esquema). Espelha o sanitizeRedirect dos
 * controllers de magic-pin/magic-link do Laravel — mesma regra nas duas
 * pontas, nenhum open redirect.
 */
export function sanitizeRedirect(raw: unknown): string {
  const v = typeof raw === 'string' ? raw.trim() : ''
  if (!v || !v.startsWith('/')) return '/'
  if (v.startsWith('//')) return '/'
  if (/[\n\r]/.test(v)) return '/'
  if (v.length > 256) return '/'
  return v
}

/**
 * De quem é um estado guardado no app (07/11/2026): um resumo de 32 bits do
 * token (FNV-1a), nunca o token, que não vai para o payload. O estado da
 * carteira que sobrevive à navegação (o relatório, as preferências dos
 * avisos) compara o dono com a sessão de agora: sair e entrar com outra
 * conta na mesma aba não mostra o dado da conta anterior.
 */
export function resumoDoToken(token: string | null | undefined): string | null {
  if (!token) return null
  let h = 0x811c9dc5
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16)
}
