/**
 * Onde a assinatura de O mercado da semana aparece além dos formulários das
 * páginas: a faixa do rodapé (NuFooter) e o convite do canto
 * (NuNewsletterConvite). Sem import do Nuxt, para rodar no `node --test`
 * (tests/newsletter-lugares.test.ts).
 */

// a preço teto: veto do dono (15/10/2026); ela já tem o bloco no resultado
const PRECO_TETO = /^\/calculadora\/preco-teto(?:\/|$)/i
// o /guias fecha com a faixa azul da newsletter
const GUIAS = /^\/guias\/?$/i

/** O rodapé fica sem a faixa onde a página já tem o formulário dela. */
export function rodapeSemAssinatura(caminho: string): boolean {
  return PRECO_TETO.test(caminho) || GUIAS.test(caminho)
}

const CONVITE_FORA = [
  PRECO_TETO,
  GUIAS,
  // login, conta e as ferramentas de tela cheia
  /^\/(?:login|conta|carteira|busca|simulacao)(?:\/|$)/i,
  // área do cliente (links com token), institucionais e o B2B
  /^\/(?:cliente|institucional|business)(?:\/|$)/i,
]

/** Páginas onde o convite não abre. */
export function conviteForaDaPagina(caminho: string): boolean {
  return CONVITE_FORA.some((r) => r.test(caminho))
}

/** Depois de fechar, o convite some por esse tempo. */
export const CONVITE_PAUSA_DIAS = 30

export function convitePausado(fechouEm: number | null, agora: number): boolean {
  return !!fechouEm && agora - fechouEm < CONVITE_PAUSA_DIAS * 86_400_000
}

/** Quanto do <main> já passou pela base da tela: 0 no topo, 1 no fim. */
export function fracaoLida(topoDoMain: number, alturaDoMain: number, alturaDaTela: number): number {
  if (alturaDoMain <= 0) return 0
  return (alturaDaTela - topoDoMain) / alturaDoMain
}
