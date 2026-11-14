/**
 * O "Você +51%" (07/11/2026): a legenda "Você" do topo e o desempenho do
 * relatório passam a mostrar a rentabilidade (TWR) da `series.carteira` do
 * /me/carteira/relatorio, cortada no período do gráfico, e o crescimento do
 * patrimônio com os aportes vira a meta ao lado (utils/rentabilidadeCarteira.ts).
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  dataDoCorte, inicioDoPeriodo, legendaDoDesempenho, legendaDoTopo, metaDoPatrimonio, periodosDoDesempenho, rebase100,
  rentabilidadeNoPeriodo, serieDesde, tituloDoDesempenho, variacaoDoIndice,
} from '../app/utils/rentabilidadeCarteira.ts'
import { pctAtivo } from '../app/utils/ativoDirecoes.ts'
import { relatorioMock } from '../app/dev/carteiraVisaoMock.ts'

const DIA = 86_400_000
/** um ponto por dia a partir de `ini` */
const dias = (ini: string, vs: number[]) => vs.map((v, i) => ({ t: new Date(Date.parse(ini) + i * DIA).toISOString().slice(0, 10), v }))
const perto = (a: number | null | undefined, b: number, msg?: string) => assert.ok(a != null && Math.abs(a - b) < 1e-9, msg ?? `${a} ≠ ${b}`)
// sábado, 07/11/2026, ao meio-dia em São Paulo
const HOJE = new Date('2026-11-07T12:00:00-03:00')

test('o corte do período: os pontos a partir do dia em que o gráfico começa', () => {
  const s = dias('2025-11-01', [100, 101, 102, 104, 103])
  assert.deepEqual(serieDesde(s, '2025-11-03').map((p) => p.t), ['2025-11-03', '2025-11-04', '2025-11-05'])
  // a data com hora corta pelo dia, como a fatia do gráfico (t.slice(0, 10))
  assert.equal(serieDesde(s, '2025-11-03T15:00:00.000Z').length, 3)
  assert.equal(serieDesde(s, '2026-01-01').length, 0)
  assert.equal(dataDoCorte(12, HOJE), '2025-11-07')
  assert.equal(dataDoCorte(1, HOJE), '2026-10-07')
})

test('a TWR do período é v_fim / v_ini − 1, com o v_ini do primeiro pregão do corte', () => {
  perto(variacaoDoIndice(dias('2025-11-01', [100, 101, 102, 104, 103])), 3)
  // a forma da resposta real: base 100 em 14/05/2025, 101,70 no primeiro pregão dos 12 meses e 120,48 no fim
  const serie = [
    { t: '2025-05-14', v: 100 }, { t: '2025-08-01', v: 104.2 }, { t: '2025-11-06', v: 101.9 },
    { t: '2025-11-07', v: 101.7 }, { t: '2026-05-04', v: 111.3 }, { t: '2026-11-06', v: 120.48 },
  ]
  const r = rentabilidadeNoPeriodo(serie, '2025-11-07')!
  perto(r.pct, (120.48 / 101.7 - 1) * 100)
  assert.equal(r.inicio, '2025-11-07')
  assert.equal(r.desde, null)
  // a série inteira: a TWR do relatório (retorno.twr), 20,48%
  perto(rentabilidadeNoPeriodo(serie, '2025-05-14')!.pct, 20.48)
  // sem dois pontos no período, ou com a base zerada: sem número
  assert.equal(rentabilidadeNoPeriodo(serie, '2026-11-06'), null)
  assert.equal(variacaoDoIndice([{ v: 0 }, { v: 10 }]), null)
  assert.equal(variacaoDoIndice([]), null)
})

test('o período maior que a série (o 5A, com o relatório desde maio/2025): a TWR diz desde quando', () => {
  const serie = [{ t: '2025-05-14', v: 100 }, { t: '2026-11-06', v: 120.48 }]
  const r = rentabilidadeNoPeriodo(serie, '2021-11-07')!
  perto(r.pct, 20.48)
  assert.equal(r.desde, '2025-05-14')
  // um feriado ou um fim de semana no começo não conta como "desde"
  assert.equal(rentabilidadeNoPeriodo([{ t: '2025-11-10', v: 100 }, { t: '2026-11-06', v: 110 }], '2025-11-07')!.desde, null)
  const leg = legendaDoTopo(dias('2021-11-07', [100, 150]), [], r)
  assert.equal(leg.itens[0]!.nota, 'desde 14/05/25')
})

test('a legenda do topo com o relatório: "Você" é a TWR, sem traço, e o patrimônio vira a meta', () => {
  const patrimonio = [{ t: '2025-11-07', v: 422_583.65 }, { t: '2026-06-01', v: 520_000 }, { t: '2026-11-06', v: 636_096.48 }]
  const ibov = [{ t: '2025-11-07', v: 150_000 }, { t: '2026-11-06', v: 164_055 }]
  const twr = rentabilidadeNoPeriodo([{ t: '2025-11-07', v: 101.7 }, { t: '2026-11-06', v: 120.48 }], '2025-11-07')
  const l = legendaDoTopo(patrimonio, ibov, twr)
  assert.deepEqual(l.itens.map((i) => i.rotulo), ['Você', 'IBOV'])
  assert.equal(l.itens[0]!.pct, pctAtivo((120.48 / 101.7 - 1) * 100))
  assert.equal(l.itens[0]!.pct, '+18,47%')
  // a TWR não é a linha desenhada (a linha é o patrimônio): sem traço; o IBOV, tracejado
  assert.equal(l.itens[0]!.traco, null)
  assert.equal(l.itens[1]!.traco, 'tracejado')
  assert.equal(l.itens[1]!.pct, '+9,37%')
  assert.equal(l.meta, 'o patrimônio cresceu 50,53% com os aportes')
})

test('a legenda do topo sem o relatório (carregando ou com erro): "Patrimônio (com aportes)", nunca "Você"', () => {
  const patrimonio = [{ t: '2025-11-07', v: 422_583.65 }, { t: '2026-11-06', v: 639_552.04 }]
  const l = legendaDoTopo(patrimonio, [], null)
  assert.deepEqual(l.itens.map((i) => i.rotulo), ['Patrimônio'])
  assert.equal(l.itens[0]!.pct, '+51,34%')
  assert.equal(l.itens[0]!.nota, '(com aportes)')
  assert.equal(l.itens[0]!.traco, 'linha')
  assert.equal(l.meta, null)
  // a tela antiga, que não lê o relatório: o mesmo número com o nome certo
  const antiga = legendaDoTopo(patrimonio, [], null, 'com aportes')
  assert.equal(antiga.itens[0]!.rotulo, 'Patrimônio')
  assert.equal(antiga.itens[0]!.nota, 'com aportes')
  assert.ok(!antiga.itens.some((i) => i.rotulo === 'Você'))
  // sem curva nenhuma, nada
  assert.deepEqual(legendaDoTopo([], [], null).itens, [])
})

test('a meta do patrimônio: cresceu, caiu ou parou', () => {
  assert.equal(metaDoPatrimonio(51.343), 'o patrimônio cresceu 51,34% com os aportes')
  assert.equal(metaDoPatrimonio(-3.2), 'o patrimônio caiu 3,20%, contando aportes e retiradas')
  assert.equal(metaDoPatrimonio(0.001), 'o patrimônio ficou parado, contando os aportes')
})

test('os períodos do desempenho: só os que a série cobre, e o "Tudo" quando ela passa bem de 12 meses', () => {
  const desde = (ini: string) => [{ t: ini, v: 100 }, { t: '2026-11-06', v: 110 }]
  assert.deepEqual(periodosDoDesempenho(desde('2025-05-14'), HOJE), ['1mo', '6mo', '12mo', 'tudo'])
  assert.deepEqual(periodosDoDesempenho(desde('2025-10-20'), HOJE), ['1mo', '6mo', '12mo'])
  assert.deepEqual(periodosDoDesempenho(desde('2026-08-03'), HOJE), ['1mo', '6mo'])
  assert.deepEqual(periodosDoDesempenho([{ t: '2026-11-06', v: 100 }], HOJE), [])
  assert.equal(inicioDoPeriodo('12mo', desde('2025-05-14'), HOJE), '2025-11-07')
  assert.equal(inicioDoPeriodo('tudo', desde('2025-05-14'), HOJE), '2025-05-14')
  assert.equal(tituloDoDesempenho('12mo', '2025-11-07', '2025-11-07'), 'Sua carteira em 12 meses.')
  assert.equal(tituloDoDesempenho('tudo', '2025-05-14', '2025-05-14'), 'Sua carteira desde 14/05/25.')
  // o período maior que a série: o título diz desde quando
  assert.equal(tituloDoDesempenho('6mo', '2026-05-07', '2026-08-03'), 'Sua carteira desde 03/08/26.')
})

test('o desempenho: as linhas saem de 100, e a TWR da série inteira é o retorno.twr do relatório', () => {
  const r = relatorioMock()
  const ini = r.series.carteira[0]!.t
  const leg = legendaDoDesempenho(r.series, ini)
  assert.deepEqual(leg.map((i) => i.rotulo), ['Você', 'Benchmark', 'CDI', 'IBOV'])
  assert.equal(leg[0]!.pct, pctAtivo(r.retorno.twr!))
  assert.deepEqual(leg.map((i) => i.traco), ['linha', 'tracejado', null, null])
  // cortada em 12 meses, cada linha mede a partir do mesmo pregão
  const doze = legendaDoDesempenho(r.series, '2025-11-07')
  const c = serieDesde(r.series.carteira, '2025-11-07')
  assert.equal(doze[0]!.pct, pctAtivo((c[c.length - 1]!.v / c[0]!.v - 1) * 100))
  const b = rebase100(c)
  assert.equal(b[0]!.v, 100)
  perto(b[b.length - 1]!.v / 100, c[c.length - 1]!.v / c[0]!.v)
  assert.deepEqual(rebase100([]), [])
})
