/**
 * O aviso de cookies, no computador e com o rodapé na tela, deixa o fixed
 * e senta na âncora do rodapé. Sem Vue, para o `node --test`.
 */

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
