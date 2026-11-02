/**
 * Teclado e deep link da /busca (redesenho de 02/11/2026).
 *
 * - ↑↓ andam pela lista inteira (resultados + "Perguntar à Redentia") e dão a
 *   volta nas pontas; -1 é "nada marcado".
 * - ?chat=1 (com ou sem ?q=) não abre mais um modo de chat na página: abre o
 *   painel do chat (useChatPainel) com a pergunta. Anônimo vai para o login
 *   com a rota inteira no redirect, para a pergunta sobreviver.
 *
 * Sem import de valor de propósito: os testes (node --test) importam direto.
 */

/** Próximo índice marcado. `passo` +1 desce, -1 sobe; dá a volta. */
export function proximoIndice(atual: number, total: number, passo: 1 | -1): number {
  if (total <= 0) return -1
  if (atual < 0 || atual >= total) return passo === 1 ? 0 : total - 1
  return (atual + passo + total) % total
}

export type AcaoDoLinkDeChat =
  | { tipo: 'nenhuma' }
  | { tipo: 'login'; para: string }
  | { tipo: 'abrir'; pergunta: string; query: Record<string, string> }

/**
 * O que fazer com o ?chat= da URL. `fullPath` é a rota como chegou (vai no
 * redirect do login). Logado: abre o painel com o ?q= e tira chat e q da URL,
 * para um refresh não reenviar a pergunta.
 */
export function acaoDoLinkDeChat(
  query: Record<string, unknown>,
  fullPath: string,
  logado: boolean,
): AcaoDoLinkDeChat {
  if (query.chat !== '1') return { tipo: 'nenhuma' }
  if (!logado) return { tipo: 'login', para: `/login?redirect=${encodeURIComponent(fullPath)}` }
  const pergunta = typeof query.q === 'string' ? query.q.trim() : ''
  const resto: Record<string, string> = {}
  for (const [k, v] of Object.entries(query)) {
    if (k === 'chat' || k === 'q') continue
    if (typeof v === 'string') resto[k] = v
  }
  return { tipo: 'abrir', pergunta, query: resto }
}

/** Para onde manda o anônimo que clicou em "Perguntar à Redentia". */
export function loginParaPerguntar(pergunta: string): string {
  const volta = `/busca?chat=1&q=${encodeURIComponent(pergunta)}`
  return `/login?redirect=${encodeURIComponent(volta)}`
}
