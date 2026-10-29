/**
 * O convite da newsletter e o aviso de cookies são fixos no canto. Nenhum
 * dos dois fica por cima do rodapé quando ele entra na tela.
 * Sem Vue, para o `node --test`.
 */

/** O cartão do convite sai da tela enquanto o rodapé está visível. */
export function exibirConviteFlutuante(aberto: boolean, rodapeNaTela: boolean): boolean {
  return aberto && !rodapeNaTela
}

/**
 * No computador, com o rodapé na tela, o aviso de cookies deixa de ser fixed
 * e senta na folga do rodapé (a âncora #ancora-cookies).
 */
export function bannerCookiesEmFluxo(opts: {
  aberto: boolean
  rodapeNaTela: boolean
  desktop: boolean
  temAncora: boolean
}): boolean {
  return opts.aberto && opts.rodapeNaTela && opts.desktop && opts.temAncora
}

/** padding-bottom do rodapé, em px, igual à altura do banner enquanto ele ocupa essa folga. */
export function folgaDoBannerNoRodape(emFluxo: boolean, alturaBanner: number): number {
  if (!emFluxo) return 0
  const h = Math.ceil(alturaBanner)
  return h > 0 ? h : 0
}
