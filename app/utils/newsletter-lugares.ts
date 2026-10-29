/**
 * Onde a assinatura de O mercado da semana aparece além dos formulários das
 * páginas: a faixa do rodapé (NuFooter) e o convite do canto
 * (NuNewsletterConvite). Sem import do Nuxt, para rodar no `node --test`
 * (tests/newsletter-lugares.test.ts).
 */

// a preço teto: veto do dono (15/10/2026) para a faixa do rodapé; ela já tem
// o bloco no resultado. O convite (cartão no computador, bloco no fluxo no
// celular) entra nela: não cobre mais a calculadora.
const PRECO_TETO = /^\/calculadora\/preco-teto(?:\/|$)/i
// o /guias fecha com a faixa azul da newsletter
const GUIAS = /^\/guias\/?$/i

/** O rodapé fica sem a faixa onde a página já tem o formulário dela. */
export function rodapeSemAssinatura(caminho: string): boolean {
  return PRECO_TETO.test(caminho) || GUIAS.test(caminho)
}

const CONVITE_FORA = [
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

/**
 * Breakpoint do site (app/assets/css/base.css): até 760px é celular.
 * O convite decide o formato por CSS com este corte, não por JS no primeiro
 * paint, para o SSR e o cliente pintarem a mesma árvore.
 */
export const CONVITE_MOBILE_MAX_PX = 760

export const FORMATOS_CONVITE = ['bloco_mobile', 'card_desktop'] as const
export type FormatoConvite = (typeof FORMATOS_CONVITE)[number]

/** Largura do cartão, margem até a borda da tela e folga até o texto. */
export const CONVITE_LARGURA_PX = 392
export const CONVITE_MARGEM_PX = 24
export const CONVITE_FOLGA_PX = 16

export function formatoConviteValido(formato?: string | null): FormatoConvite | null {
  return (FORMATOS_CONVITE as readonly string[]).includes(formato ?? '')
    ? formato as FormatoConvite
    : null
}

/** Abaixo ou igual a 760px o convite é o bloco; acima, o cartão. */
export function formatoConvitePorLargura(larguraPx: number): FormatoConvite {
  return larguraPx > CONVITE_MOBILE_MAX_PX ? 'card_desktop' : 'bloco_mobile'
}

/** padding-right do <main> enquanto o cartão está na tela, em px. */
export function reservaDoConviteDesktop(): number {
  return CONVITE_LARGURA_PX + CONVITE_MARGEM_PX + CONVITE_FOLGA_PX
}

/**
 * O conteúdo termina antes da borda esquerda do cartão, e o cartão guarda a
 * margem direita. Vale para a largura fixa de 392px (telas em que ela cabe).
 */
export function cardSeparadoDoConteudo(larguraViewport: number): boolean {
  const larguraCard = Math.min(CONVITE_LARGURA_PX, Math.max(0, larguraViewport - CONVITE_MARGEM_PX * 2))
  const esquerdaCard = larguraViewport - CONVITE_MARGEM_PX - larguraCard
  const direitaConteudo = larguraViewport - reservaDoConviteDesktop()
  return direitaConteudo <= esquerdaCard - CONVITE_FOLGA_PX + 0.5
    && esquerdaCard >= CONVITE_MARGEM_PX
}

export interface ConviteElegibilidade {
  ligada: boolean
  autenticado: boolean
  folhaAberta: boolean
  contaConviteVisto: boolean
  caminho: string
  /** localStorage de quem já assinou: o convite não volta. */
  assinou: boolean
  fechouEm: number | null
  agora: number
}

/** Quem já assinou, fechou ou está fora da página não vê o convite, nos dois formatos. */
export function conviteElegivel(o: ConviteElegibilidade): boolean {
  return o.ligada
    && !o.autenticado
    && !o.folhaAberta
    && !o.contaConviteVisto
    && !conviteForaDaPagina(o.caminho)
    && !o.assinou
    && !convitePausado(o.fechouEm, o.agora)
}
