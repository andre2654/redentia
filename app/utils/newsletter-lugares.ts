/**
 * Onde a assinatura de O mercado da semana aparece além dos formulários das
 * páginas: a faixa do rodapé (NuFooter) e o bloco antes dele
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

/**
 * Breakpoint do site (app/assets/css/base.css): até 760px é celular.
 * O convite decide o formato por CSS com este corte, não por JS no primeiro
 * paint, para o SSR e o cliente pintarem a mesma árvore.
 */
export const CONVITE_MOBILE_MAX_PX = 760

export const FORMATOS_CONVITE = ['bloco_mobile', 'bloco_desktop'] as const
export type FormatoConvite = (typeof FORMATOS_CONVITE)[number]

export function formatoConviteValido(formato?: string | null): FormatoConvite | null {
  return (FORMATOS_CONVITE as readonly string[]).includes(formato ?? '')
    ? formato as FormatoConvite
    : null
}

/** Até 760px, bloco_mobile. Acima, bloco_desktop. Os dois são o bloco no fluxo. */
export function formatoConvitePorLargura(larguraPx: number): FormatoConvite {
  return larguraPx <= CONVITE_MOBILE_MAX_PX ? 'bloco_mobile' : 'bloco_desktop'
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
