/**
 * Variação do preço no ano, em %, pela série de preços do próprio ativo: o
 * último ponto da série contra o último fechamento do ano anterior. Alimenta o
 * "PETR4 cai X% no ano" da Leitura da IA no /asset (useAcao, buildAiRead).
 *
 * POR QUE NÃO O `ytd_return` (20/10/2026). O campo `key_statistics.ytd_return`
 * do overview vinha em escalas misturadas e com valor errado: PETR4 -0.121
 * (a página dizia "PETR4 cai 12,1% no ano" com a ação em +92% no ano), VALE3
 * 0.050, ITUB4 12.939 (que viraria 1.293,9%). O `fifty_two_week_change` do
 * mesmo bloco também estava errado (PETR4 -0.119).
 *
 * A SÉRIE É CRUA. O preço guardado não é ajustado por desdobramento,
 * grupamento ou bonificação depois de ~28/08/2026 (TickerService::listPrices
 * no Backend). Por isso a conta só sai com duas travas:
 *  - nenhum salto de um pregão para o outro acima de 50% para cima ou para
 *    baixo dentro do ano: é o desenho de um evento não ajustado (2:1, 10:1);
 *  - o preço-base cabe na mínima e na máxima de 52 semanas do overview, quando
 *    elas existem (com 3% de folga).
 * Bonificação pequena (10%) depois de agosto passa pelas travas e erra a conta
 * no tamanho dela. É o mesmo risco da legenda do gráfico de 12 meses, que usa
 * a mesma série sem trava nenhuma.
 *
 * Sem import de valor de propósito: os testes (node --test) importam direto.
 */

export interface PontoDaSerie {
  /** 'YYYY-MM-DD' */
  t: string
  v: number
}

export interface Faixa52Semanas {
  min: number | null
  max: number | null
}

/** O último fechamento do ano anterior tem de estar perto do fim do ano. */
const BASE_DESDE = '-12-15'
const SALTO_MAXIMO = 1.5
const FOLGA_DA_FAIXA = 0.03

/**
 * % do ano (ex.: 91.7 para +91,7%), ou null quando não dá para afirmar: série
 * sem o fim do ano anterior, salto de evento no caminho ou base fora da faixa
 * de 52 semanas.
 */
export function variacaoNoAno(serie: readonly PontoDaSerie[], faixa?: Faixa52Semanas | null): number | null {
  const pontos = serie
    .filter((p) => /^\d{4}-\d{2}-\d{2}/.test(p.t) && Number.isFinite(p.v) && p.v > 0)
    .map((p) => ({ t: p.t.slice(0, 10), v: p.v }))
    .sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0))
  const ultimo = pontos[pontos.length - 1]
  if (!ultimo) return null
  const ano = Number(ultimo.t.slice(0, 4))
  const inicioDoAno = `${ano}-01-01`
  // laço à mão em vez de findLastIndex: ele não existe no Safari antes do 15.4,
  // e o useAcao também roda no navegador na navegação entre ativos
  let iBase = -1
  for (let i = pontos.length - 1; i >= 0; i--) {
    if (pontos[i]!.t < inicioDoAno) { iBase = i; break }
  }
  const base = pontos[iBase]
  if (!base || base.t < `${ano - 1}${BASE_DESDE}`) return null

  for (let i = iBase + 1; i < pontos.length; i++) {
    const razao = pontos[i]!.v / pontos[i - 1]!.v
    if (razao > SALTO_MAXIMO || razao < 1 / SALTO_MAXIMO) return null
  }
  if (faixa?.min != null && faixa.min > 0 && base.v < faixa.min * (1 - FOLGA_DA_FAIXA)) return null
  if (faixa?.max != null && faixa.max > 0 && base.v > faixa.max * (1 + FOLGA_DA_FAIXA)) return null

  return (ultimo.v / base.v - 1) * 100
}
