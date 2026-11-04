/**
 * Uma carteira de exemplo atravessando um cenário macro, com o resultado do
 * motor de verdade (04/11/2026). Usada pelas direções da /business no dev
 * (?biz=2 e ?biz=3, ver pages/business/index.vue).
 *
 * DE ONDE VEIO CADA NÚMERO: uma chamada a simulate_scenario (motor 3.4.1,
 * 2.000 caminhos), em 04/11/2026 às 07h10, com o cenário estudado
 * "expansao-fiscal-pos-2026" (Selic 18,5%, dólar R$ 6,20, Ibovespa −22%), 1
 * ano de horizonte, sobre a carteira abaixo (R$ 1 milhão, montada para a
 * página: não é a carteira de ninguém). A faixa está em reais de hoje (poder de
 * compra). O motor devolve só os percentis do fim e o choque por ativo: o
 * desenho dos caminhos entre hoje e o fim é feito na página (BizLeque) e chega
 * exatamente nesses percentis. Rodou de novo? Troque os números e a data juntos.
 *
 * A carteira colada vai ao motor sem nome e não fica salva na conta (ver o
 * FAQ "Preciso conectar cliente para rodar um cenário?").
 */
export const EXEMPLO_CENARIO = {
  data: '04/11/2026',
  cenario: 'Expansão fiscal pós-2026',
  /** os três choques do cenário estudado, como o motor os recebe */
  choques: [
    { nome: 'Selic', valor: '18,5%' },
    { nome: 'Dólar', valor: 'R$ 6,20' },
    { nome: 'Ibovespa', valor: '−22%' },
  ],
  horizonte: '1 ano',
  caminhos: 2000,
  inicio: 1_000_000,
  /** percentis do patrimônio no fim do horizonte, em reais de hoje */
  final: { p05: 819_336, p10: 860_321, p50: 995_492, p90: 1_125_249, p95: 1_166_048 },
  /** a mediana cai até ~2% no caminho (drawdown_p50_pct) */
  quedaMediana: -2,
  /** a carteira, com o choque que o motor deu a cada posição */
  posicoes: [
    { ticker: 'Tesouro Selic', peso: 30, choque: 0 },
    { ticker: 'ITUB4', peso: 15, choque: -21.9 },
    { ticker: 'IVVB11', peso: 15, choque: 9.9 },
    { ticker: 'PETR4', peso: 12, choque: -24 },
    { ticker: 'VALE3', peso: 10, choque: -17.1 },
    { ticker: 'HGLG11', peso: 10, choque: -23 },
    { ticker: 'LREN3', peso: 8, choque: -30.8 },
  ],
} as const

/** "R$ 860 mil" / "R$ 1,13 milhão" */
export function reaisCurto(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',').replace(/0$/, '')} milhão`
  return `R$ ${Math.round(v / 1000)} mil`
}

/** "+9,9%" / "−30,8%" / "0%" */
export function choqueTxt(v: number): string {
  if (v === 0) return '0%'
  return `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', ',').replace(/,0$/, '')}%`
}
