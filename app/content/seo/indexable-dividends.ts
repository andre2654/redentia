/**
 * /dividendos/{TICKER} com demanda medida: as páginas que tiveram impressão no
 * Google e não estavam no sitemap, que só levava os 12 clássicos e o top 20 do
 * ranking de dividend yield (server/utils/site-pages.ts, fetchDividendPages).
 *
 * COMO FOI MONTADA (20/10/2026): Search Console pela API, páginas /dividendos
 * com pelo menos 1 impressão de 19/07 a 18/10, vivas no /tickers-full (ação,
 * FII, BDR ou ETF, com preço de outubro). Eram 47 fora do sitemap, com
 * 74 cliques e 10.336 impressões no período: UNIP6 (27 cliques), CMIG4,
 * AXIA3, SLCE3...
 *
 * O sitemap ainda passa cada uma pela guarda anti-404 do universo
 * (getSiteSections), então ticker que sair da bolsa sai do sitemap sozinho.
 *
 * COMO ATUALIZAR: junto com o indexable-assets.ts, a cada trimestre, SOMANDO.
 */
export const INDEXABLE_DIVIDENDS: readonly string[] = [
  'ALUP4', 'ARML3', 'ASML34', 'AXIA3', 'BRSR3', 'BRSR6', 'BSLI4', 'BTLG11',
  'CACR11', 'CEBR3', 'CEBR5', 'CEBR6', 'CMIG4', 'CXSE3', 'DIRR3', 'EKTR4',
  'ENMT4', 'FCXO34', 'FIEI3', 'FLCR11', 'HOND34', 'LMTB34', 'LRDI11', 'MANA11',
  'MCDC34', 'MDNE3', 'MOSC34', 'PCIP11', 'PINE4', 'PLPL3', 'PQAG11', 'RENT3',
  'RINV11', 'RZAT11', 'S1TX34', 'S2UI34', 'SLCE3', 'SPTW11', 'SUZB3', 'TGTB34',
  'TRIS3', 'UNIP5', 'UNIP6', 'VGHF11', 'WFCO34', 'WHGR11', 'WLMM3',
]
