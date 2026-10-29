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

export const FORMATOS_CONVITE = ['bloco_mobile', 'bloco_desktop', 'card_desktop'] as const
export type FormatoConvite = (typeof FORMATOS_CONVITE)[number]

/**
 * Teto do miúdo, em px. null: o <main> do layout não tem max-width e ocupa a
 * viewport (app/layouts/default.vue). A folga lateral é zero e o cartão não
 * entra. Um número é o max-width real do container.
 */
export const CONVITE_CONTEUDO_MAX_PX: number | null = null

/** Cartão um pouco menor que os 392px originais, para caber numa folga de verdade. */
export const CONVITE_CARD_LARGURA_PX = 340
export const CONVITE_CARD_MARGEM_PX = 24

export function formatoConviteValido(formato?: string | null): FormatoConvite | null {
  return (FORMATOS_CONVITE as readonly string[]).includes(formato ?? '')
    ? formato as FormatoConvite
    : null
}

/** Espaço que o cartão ocupa na folga: a largura dele e uma margem de cada lado. */
export function espacoDoCartao(
  largura = CONVITE_CARD_LARGURA_PX,
  margem = CONVITE_CARD_MARGEM_PX,
): number {
  return largura + margem * 2
}

/** (viewport − teto do miúdo) / 2. Sem teto, o miúdo é a própria viewport. */
export function folgaLateral(
  larguraViewport: number,
  conteudoMax: number | null = CONVITE_CONTEUDO_MAX_PX,
): number {
  const limite = conteudoMax == null ? larguraViewport : Math.min(conteudoMax, larguraViewport)
  return Math.max(0, (larguraViewport - limite) / 2)
}

export function cabeCartaoNoGutter(
  larguraViewport: number,
  conteudoMax: number | null = CONVITE_CONTEUDO_MAX_PX,
): boolean {
  return folgaLateral(larguraViewport, conteudoMax) >= espacoDoCartao()
}

/**
 * Menor viewport em que a folga cabe o cartão. null quando o miúdo não tem
 * teto: nenhuma largura cria folga.
 */
export function larguraMinimaDoCartao(conteudoMax: number | null = CONVITE_CONTEUDO_MAX_PX): number | null {
  if (conteudoMax == null || !Number.isFinite(conteudoMax)) return null
  return Math.ceil(conteudoMax + 2 * espacoDoCartao())
}

/**
 * Até 760px, bloco no fluxo. Acima, o cartão só se a folga lateral já existe
 * e cabe nele; senão, o mesmo bloco no fluxo (formato bloco_desktop).
 */
export function formatoConvitePorLargura(
  larguraPx: number,
  conteudoMax: number | null = CONVITE_CONTEUDO_MAX_PX,
): FormatoConvite {
  if (larguraPx <= CONVITE_MOBILE_MAX_PX) return 'bloco_mobile'
  return cabeCartaoNoGutter(larguraPx, conteudoMax) ? 'card_desktop' : 'bloco_desktop'
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
