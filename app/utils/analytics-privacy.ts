/**
 * Rotas cujo caminho É um segredo: o token de uso único vai no path.
 *
 *  - /cliente/convite/<token>  (convite do cliente do escritório, Contrato E)
 *  - /cliente/acesso/<token>   (link de gestão do cliente: lê o registro e revoga)
 *  - /business/convite/<token> (convite de chave da mesa: a chave nasce na tela)
 *
 * Quem tem o link age no lugar do dono dele (consente, revoga, gera chave).
 * Por isso nenhuma ferramenta de terceiro pode ver essas URLs: GA4 manda
 * page_location, o GTM (container de agência) enxerga cada troca de histórico,
 * o Clarity grava URL e tela, e o script da Vercel reporta o pageview. Os
 * plugins de analytics consultam esta função e NÃO carregam nessas rotas; a
 * navegação SPA para uma delas vira navegação cheia (plugin
 * 00.rotas-com-segredo.client.ts), para nenhum script já carregado ver o
 * pushState com o token.
 *
 * Sem import do Nuxt: roda no `node --test` (tests/analytics-privacy.test.ts).
 */
const SECRET_TOKEN_PATH = /^\/(?:cliente\/(?:convite|acesso)|business\/convite)\/[^/]+/i

/** O path (sem query/hash, ou com eles) carrega um token secreto? */
export function isSecretTokenPath(path: string | null | undefined): boolean {
  if (!path) return false
  const p = path.split(/[?#]/, 1)[0] ?? ''
  // Barra dupla e sufixo de barra não escapam: /cliente//convite/x é outra rota.
  return SECRET_TOKEN_PATH.test(p.replace(/\/{2,}/g, '/'))
}
