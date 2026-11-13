/**
 * Os ativos da esteira do rodapé (13/11/2026; o dono: "uns carrosséis de
 * ativos com a bandeirinha da aportou").
 *
 * São tickers de verdade, escolhidos à mão: os mais conhecidos de cada tipo.
 * Em 12/11/2026 todos estavam na base (listados, nenhum fora da B3) e todos
 * tinham ícone no serviço de ícones que o site já usa (icons.brapi.dev, o
 * mesmo do NuAssetLogo). Uma fila é de ações; a outra, de fundos
 * imobiliários, ETFs e BDRs.
 *
 * Fundo e ETF levam o ícone da gestora, e MXRF11, XPML11 e XPLG11 (ou BOVA11,
 * IVVB11 e SMAL11) dão o mesmo desenho três vezes: por isso entra um por
 * gestora. HGRU11 ficou de fora porque não tem ícone.
 *
 * A esteira é ornamento da marca, não cotação: não leva preço, variação nem
 * nome de empresa (menos coisa para envelhecer). O que envelhece é o ticker:
 * quando um sair da B3 ou trocar de código, tire-o daqui.
 */
export const ATIVOS_DO_RODAPE: readonly (readonly string[])[] = [
  ['PETR4', 'VALE3', 'ITUB4', 'WEGE3', 'BBAS3', 'ABEV3', 'B3SA3', 'SUZB3', 'RENT3', 'EMBJ3', 'PRIO3', 'EQTL3', 'BPAC11', 'RADL3', 'VIVT3', 'GGBR4'],
  ['MXRF11', 'HGLG11', 'KNRI11', 'BTLG11', 'VISC11', 'BOVA11', 'HASH11', 'GOLD11', 'AAPL34', 'MSFT34', 'GOGL34', 'AMZO34', 'NVDC34', 'TSLA34', 'MELI34', 'M1TA34'],
]

/** o endereço do ícone de um ativo (o mesmo serviço do NuAssetLogo) */
export const iconeDoAtivo = (ticker: string): string => `https://icons.brapi.dev/icons/${encodeURIComponent(ticker.toUpperCase())}.svg`
