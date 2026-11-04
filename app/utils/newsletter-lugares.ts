/**
 * Onde a assinatura de O mercado da semana aparece além dos formulários das
 * páginas: a faixa do rodapé (NuFooter). O bloco solto antes do rodapé
 * (NuNewsletterConvite) saiu em 03/11/2026. Sem import do Nuxt, para rodar no
 * `node --test` (tests/newsletter-lugares.test.ts).
 */

// a preço teto: veto do dono (15/10/2026); ela já tem o bloco no resultado
const PRECO_TETO = /^\/calculadora\/preco-teto(?:\/|$)/i

/** O rodapé fica sem a faixa onde a página já tem o formulário dela. */
export function rodapeSemAssinatura(caminho: string): boolean {
  return PRECO_TETO.test(caminho)
}

/** O `formato` que o formulário manda no evento de inscrição. */
export const FORMATOS_CONVITE = ['bloco_mobile', 'bloco_desktop'] as const
export type FormatoConvite = (typeof FORMATOS_CONVITE)[number]

export function formatoConviteValido(formato?: string | null): FormatoConvite | null {
  return (FORMATOS_CONVITE as readonly string[]).includes(formato ?? '')
    ? formato as FormatoConvite
    : null
}
