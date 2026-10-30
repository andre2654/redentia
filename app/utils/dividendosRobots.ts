/**
 * /dividendos/{TICKER} sem nenhum provento no histórico fica fora do índice.
 * follow permanece: os links da página (ativo, calculadoras) continuam úteis.
 * Histórico presente não manda robots: a página é indexável.
 */
export function robotsDeDividendos(temHistorico: boolean): 'noindex, follow' | undefined {
  return temHistorico ? undefined : 'noindex, follow'
}
