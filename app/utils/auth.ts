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
