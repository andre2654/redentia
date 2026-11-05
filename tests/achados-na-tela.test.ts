/**
 * As palavras dos três tipos novos dos achados (05/11/2026): a leitura em
 * prosa, o diagnóstico em números e as perguntas que o agente oferece. A conta
 * é a de montarAchados; aqui se confere a frase, o número na frase, a pergunta
 * que vai ao chat e que nada vira ordem.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { montarAchados, temOrdem, type EntradaDosAchados } from '../app/utils/achadosDaCarteira.ts'
import {
  complementoDaNota,
  leituraDosAchados,
  numeroGrande,
  numeroNaFrase,
  numerosDoDiagnostico,
  oQueOlhei,
  perguntasDoAgente,
  pontosPorExtenso,
  vereditoDaMetrica,
  vereditoDosAchados,
  type Trecho,
} from '../app/utils/achadosNaTela.ts'
import type { CarteiraAnaliseIA, CarteiraRaioXVM, RaioXMetricVM } from '../app/types/carteira.ts'

const AGORA = new Date('2026-11-05T13:08:00-03:00')

const metrica = (label: string, fillPct: number, value: string, note: string): RaioXMetricVM => ({
  label, value, fillPct, note,
  tag: fillPct < 70 ? 'Atenção' : fillPct < 85 ? 'Controlado' : 'Excelente',
  tagTone: fillPct < 70 ? 'amber' : 'green',
  fillTone: fillPct < 70 ? 'amber' : 'green',
})
const raiox = (metrics: RaioXMetricVM[]): CarteiraRaioXVM => ({
  score: 70, badge: 'Boa saúde', band: 'Boa saúde', attention: metrics.filter((m) => m.tag === 'Atenção').length,
  metrics, insight: null, insightDate: null,
})

/** a carteira do dono em 05/11: diversificação 95, renda 1,6%, qualidade 54; a análise é de 22/05 */
const METRICAS = [
  metrica('Diversificação', 95, '95/100', '18 ativos em 3 setores.'),
  metrica('Renda', 25, 'DY 1,6%', 'R$ 1.552 em proventos nos últimos 12 meses.'),
  metrica('Qualidade', 54, '54/100', 'Score médio de 4 dos seus ativos: PRIO3 e ITSA4 puxam para baixo.'),
]
const ANALISE: CarteiraAnaliseIA = {
  generated_at: '2026-05-22T14:10:00Z',
  risks: [
    { title: 'Concentração em poucos ativos', body: 'Os três principais ativos (AUPO11, BBSE3, BRSTNCNTB4W2) somam 26.1% da carteira.', severity: 'high' },
    { title: 'Exposição a juros altos', body: 'Com a Selic em 14.5%, a renda fixa pode se tornar mais atrativa.', severity: 'medium' },
  ],
  recommendations: [
    { title: 'Avaliar redução de concentração', body: 'Considere reduzir a exposição nos três principais ativos.' },
  ],
  strengths: [{ title: 'Diversificação elevada', body: 'A carteira possui 12 setores distintos, com um HHI de 0.17.' }],
}
const POSICOES = Array.from({ length: 18 }, (_, i) => ({ ticker: `ATV${i}`, classe: 'STOCK', valor: 1000, nome: `Ativo ${i}` }))
const entrada = (o: Partial<EntradaDosAchados> = {}): EntradaDosAchados => ({
  raiox: raiox(METRICAS), analise: ANALISE, posicoes: POSICOES, olhadaEm: '2026-11-05T16:08:00Z', agora: AGORA, ...o,
})
const texto = (ts: Trecho[]) => ts.map((t) => t.t).join('')

test('a leitura fala como o agente, com os números em destaque e a vírgula que fecha o aposto', () => {
  const vm = montarAchados(entrada())
  const l = leituraDosAchados(vm, METRICAS)
  assert.equal(
    texto(l.hoje),
    'Olhei os seus 18 ativos hoje às 13:08. A diversificação está excelente, 95/100, como a análise de 22/05 já via. '
    + 'Dois pontos pedem atenção: a renda, 1,6% ao ano em proventos, e a qualidade, 54/100, puxada para baixo por PRIO3 e ITSA4.',
  )
  // os números são os botões, cada um com a pergunta do achado dele
  const nums = l.hoje.filter((t) => t.pergunta)
  assert.deepEqual(nums.map((t) => [t.t, t.tom]), [['95/100', 'ok'], ['1,6% ao ano em proventos', 'atencao'], ['54/100', 'atencao']])
  assert.match(nums[1]!.pergunta!, /renda/)
  // a análise antiga é uma frase à parte, com a data e os dias
  assert.equal(texto(l.antiga!), 'Na análise de 22/05, há 167 dias, eu via também concentração em poucos ativos e exposição a juros altos. Pode já não valer.')
})

test('sem nada a apontar, a leitura diz com calma e não inventa ponto', () => {
  const so = [metrica('Diversificação', 95, '95/100', '18 ativos em 3 setores.')]
  const vm = montarAchados(entrada({ raiox: raiox(so), analise: null }))
  assert.equal(vm.vazio, true)
  const l = leituraDosAchados(vm, so)
  assert.equal(texto(l.hoje), 'Olhei os seus 18 ativos hoje às 13:08. A diversificação está excelente, 95/100. Nada pede atenção agora.')
  assert.equal(l.antiga, null)
  assert.equal(vereditoDosAchados(vm), 'Nada pede atenção.')
})

test('o número na frase e o número grande saem do valor da métrica', () => {
  assert.equal(numeroNaFrase({ label: 'Renda', value: 'DY 1,6%' }), '1,6% ao ano em proventos')
  assert.equal(numeroNaFrase({ label: 'Risco', value: 'Beta 0,18' }), 'beta 0,18')
  assert.equal(numeroNaFrase({ label: 'Qualidade', value: '54/100' }), '54/100')
  assert.deepEqual(numeroGrande({ value: '95/100' }), { antes: null, n: '95', depois: '/100' })
  assert.deepEqual(numeroGrande({ value: 'DY 1,6%' }), { antes: null, n: '1,6%', depois: 'ao ano' })
  assert.deepEqual(numeroGrande({ value: 'Beta 0,18' }), { antes: 'beta', n: '0,18', depois: null })
})

test('o complemento lê a nota do Raio-X, e sem casar fica de fora', () => {
  assert.equal(complementoDaNota(METRICAS[2]!), 'puxada para baixo por PRIO3 e ITSA4')
  assert.equal(complementoDaNota({ label: 'Risco', note: 'Sua carteira oscila menos que o IBOV: 9,1% vs 18,0% a.a.' }), 'oscilando menos que o Ibovespa')
  assert.equal(complementoDaNota({ label: 'Diversificação', note: '71,9% em ações. Maior setor: Energia (40% do total).' }), 'com 71,9% em ações')
  assert.equal(complementoDaNota({ label: 'Renda', note: 'R$ 1.552 em proventos nos últimos 12 meses.' }), null)
  assert.equal(complementoDaNota({ label: 'Qualidade', note: 'Score médio de PRIO3 e ITSA4, os dois dos seus ativos que a Redentia pontua.' }), null)
})

test('o veredito da Qualidade segue o percentil (54 é a média da bolsa, não "abaixo")', () => {
  assert.equal(vereditoDaMetrica(METRICAS[2]!), 'Na média da bolsa.')
  assert.equal(vereditoDaMetrica(metrica('Qualidade', 30, '30/100', '')), 'Abaixo da média da bolsa.')
  assert.equal(vereditoDaMetrica(metrica('Renda', 25, 'DY 1,6%', '')), 'Paga pouco em proventos.')
  assert.equal(vereditoDaMetrica(metrica('Risco', 88, 'Beta 0,18', 'Sua carteira oscila menos que o IBOV.')), 'Oscila menos que a bolsa.')
})

test('o diagnóstico tem uma casa por dimensão, com o tom e o estado em palavras', () => {
  const vm = montarAchados(entrada())
  const ns = numerosDoDiagnostico(vm, METRICAS)
  assert.deepEqual(ns.map((n) => [n.label, n.n, n.tom, n.estado]), [
    ['Diversificação', '95', 'ok', 'vai bem'],
    ['Renda', '1,6%', 'atencao', 'pede atenção'],
    ['Qualidade', '54', 'atencao', 'pede atenção'],
  ])
  // a métrica que virou achado leva a pergunta dele; a casa Controlado leva uma própria
  assert.equal(ns[1]!.pergunta, vm.itens.find((a) => a.dimensao === 'Renda')!.pergunta)
  const comRisco = numerosDoDiagnostico(vm, [...METRICAS, metrica('Risco', 80, 'Beta 0,62', 'Sua carteira oscila menos que o IBOV.')])
  assert.match(comRisco[3]!.pergunta, /^Como está o risco da minha carteira \(Beta 0,62\)\?/)
  assert.equal(comRisco[3]!.estado, 'sob controle')
})

test('a máscara de valor chega à nota e à pergunta', () => {
  const vm = montarAchados(entrada())
  const m = (t: string) => t.replace(/R\$\s?[\d.,]+/g, 'R$ ••••')
  const ns = numerosDoDiagnostico(vm, METRICAS, m)
  assert.equal(ns[1]!.nota, 'R$ •••• em proventos nos últimos 12 meses.')
  assert.doesNotMatch(ns[1]!.pergunta, /1\.552/)
})

test('as perguntas do agente: a primeira é a que mais pesa, e a análise antiga vira uma só', () => {
  const vm = montarAchados(entrada())
  const ps = perguntasDoAgente(vm, METRICAS)
  assert.deepEqual(ps.map((p) => p.oferta), [
    'A sua renda está em 1,6% ao ano em proventos. Quer ver de onde ela vem?',
    'A qualidade está em 54/100, puxada para baixo por PRIO3 e ITSA4. Quer entender por quê?',
    'A diversificação está excelente, 95/100. Quer ver o que sustenta isso?',
    'Na análise de 22/05, há 167 dias, eu via mais 2 pontos. Quer conferir se ainda valem?',
  ])
  // o que vai ao chat é a pergunta do achado, na voz da pessoa
  assert.equal(ps[0]!.pergunta, vm.itens[0]!.pergunta)
  assert.match(ps[3]!.pergunta, /"Concentração em poucos ativos", "Exposição a juros altos"/)
  // nada do que a Redentia oferece é ordem
  for (const p of ps) assert.equal(temOrdem(p.oferta), false, p.oferta)
  for (const t of leituraDosAchados(vm, METRICAS).hoje) assert.equal(temOrdem(t.t), false, t.t)
})

test('os números por extenso e o que a Redentia olhou', () => {
  assert.equal(pontosPorExtenso(1), 'Um ponto pede atenção')
  assert.equal(pontosPorExtenso(3), 'Três pontos pedem atenção')
  assert.equal(pontosPorExtenso(9), '9 pontos pedem atenção')
  assert.equal(oQueOlhei({ ativos: 1, olhouEm: 'ontem às 21:40' }), 'Olhei o seu ativo ontem às 21:40.')
  assert.equal(oQueOlhei({ ativos: 0, olhouEm: null }), 'Olhei a sua carteira.')
  assert.equal(vereditoDosAchados({ pontos: 2, ideias: 1, antigos: 0, vazio: false }), 'Dois pontos pedem atenção e há uma ideia para avaliar.')
  assert.equal(vereditoDosAchados({ pontos: 0, ideias: 0, antigos: 3, vazio: false }), 'Nada pede atenção hoje.')
})
