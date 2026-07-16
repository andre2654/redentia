/**
 * View-models da página /teses (contrato: designs-v2/Redentia Teses Nu.dc.html).
 * Os 3 carrosséis compartilham o MESMO template de card — só mudam os dados,
 * a pill do topo (convicção / risco / ranking) e os labels estáticos.
 */
export interface TesesCardVM {
  /** id/slug da tese no backend (ou key estável do seed) */
  slug: string
  /** categoria do topo do card (ex.: "Reindustrialização") */
  cat: string
  /** título grande do card */
  title: string
  /** true → badge "Seguindo" (verde-menta) ao lado da categoria */
  foll: boolean
  /** pill direita do topo: "Convicção 88" | "Risco baixo" | "Nº 1" (null = some) */
  pill: string | null
  /** retorno verde-menta do rodapé, ex.: "+34%" (null = some, honesto) */
  ret: string | null
  /** legenda sob o retorno: "retorno em 12 meses" / "retorno acumulado" / "desde que você segue" */
  since: string
  /** chips de ticker (até 5) */
  tickers: string[]
  /** capa real da tese (campo image do backend, ex. /teses/x.webp). null → o
   *  card degrada pro gradiente navy (fallback padrão do projeto). */
  image: string | null
  /** destino do card e do CTA fantasma */
  href: string
}
