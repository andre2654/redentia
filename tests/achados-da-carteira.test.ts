/**
 * Os achados da Redentia AI na /carteira (05/11/2026): a lista que junta os
 * pontos de atenção do Raio-X (de hoje) com a análise escrita pela IA (com a
 * data dela). Ordem por gravidade, ISIN trocado pelo nome, sem ordem de compra
 * e venda, sem item repetido, e a idade da análise dita com honestidade.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  analiseDesatualizada,
  assuntoDe,
  idadeDaAnalise,
  montarAchados,
  oQueOlhou,
  quandoOlhou,
  resumoDosAchados,
  temOrdem,
  trocarIsin,
  PEDIDO_DE_ANALISE_NOVA,
  type EntradaDosAchados,
} from '../app/utils/achadosDaCarteira.ts'
import type { CarteiraAnaliseIA, CarteiraRaioXVM, RaioXMetricVM } from '../app/types/carteira.ts'

const AGORA = new Date('2026-11-05T11:01:00-03:00')

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

const POSICOES = [
  { ticker: 'AUPO11', classe: 'ETF', valor: 6000, nome: 'AUPO11' },
  { ticker: 'BBSE3', classe: 'STOCK', valor: 3500, nome: 'BB Seguridade' },
  { ticker: 'BRSTNCNTB7T1', classe: 'TREASURY', valor: 15000, nome: 'Tesouro IPCA+ 2035' },
  { ticker: 'VALE3', classe: 'STOCK', valor: 9000, nome: 'Vale' },
]

/** a análise da conta do dono: de 22/05, com o ISIN cru no texto */
const ANALISE: CarteiraAnaliseIA = {
  generated_at: '2026-05-22T14:10:00Z',
  risks: [
    { title: 'Exposição a juros', body: 'Boa parte da carteira reage à Selic.', severity: 'medium' },
    { title: 'Concentração nos maiores ativos', body: 'Os três principais ativos (AUPO11, BBSE3, BRSTNCNTB7T1) somam 26.1% da carteira.', severity: 'high' },
    { title: 'Liquidez de AUPO11', body: 'O ETF negocia pouco.', severity: 'low' },
  ],
  recommendations: [
    { title: 'Olhar a fatia de renda fixa', body: 'A renda fixa é 35% do total. Recomendamos vender parte do Tesouro.' },
    { title: 'Venda VALE3', body: 'Reduza a mineração.' },
  ],
  strengths: [{ title: 'Proventos constantes', body: 'Os FIIs pagaram todo mês.' }],
}

const entrada = (o: Partial<EntradaDosAchados> = {}): EntradaDosAchados => ({
  raiox: raiox([
    metrica('Diversificação', 62, '62/100', '64% em ações. Maior setor: Mineração (30% do total).'),
    metrica('Risco', 80, 'Beta 0,84', 'Sua carteira oscila menos que o IBOV.'),
    metrica('Renda', 50, 'DY 3,1%', 'R$ 1.200 em proventos nos últimos 12 meses.'),
    metrica('Qualidade', 40, '40/100', 'Score médio de 3 dos seus ativos.'),
  ]),
  analise: ANALISE,
  posicoes: POSICOES,
  olhadaEm: '2026-11-05T11:01:00Z',
  agora: AGORA,
  ...o,
})

test('a ordem é por gravidade, com o dado de hoje antes do texto antigo no empate', () => {
  const vm = montarAchados(entrada())
  const ids = vm.itens.map((a) => `${a.tipo}:${a.gravidade ?? '-'}:${a.origem}`)
  assert.deepEqual(ids, [
    'atencao:alta:raiox', // Qualidade 40 (abaixo de 45 é grave)
    'atencao:media:raiox', // Diversificação 62
    'atencao:media:raiox', // Renda 50
    'risco:media:analise', // juros
    'risco:baixa:analise', // liquidez
    'ideia:-:analise',
    'forca:-:analise',
  ])
  assert.equal(vm.itens[0]!.dimensao, 'Qualidade')
  assert.equal(vm.pontos, 5)
  assert.equal(vm.ideias, 1)
  assert.equal(vm.vazio, false)
})

test('o risco que diz o mesmo de uma métrica em Atenção some, e a métrica guarda a data da análise', () => {
  const vm = montarAchados(entrada())
  assert.equal(vm.itens.some((a) => /Concentração/.test(a.titulo)), false)
  const div = vm.itens.find((a) => a.dimensao === 'Diversificação' && a.origem === 'raiox')!
  assert.equal(div.confirmadoEm, '22/05')
  assert.equal(div.quando, 'hoje')
})

test('sem a métrica em Atenção, o risco da concentração fica, com o nome no lugar do ISIN', () => {
  const vm = montarAchados(entrada({ raiox: raiox([metrica('Diversificação', 88, '88/100', 'Bem espalhada.')]) }))
  const conc = vm.itens.find((a) => /Concentração/.test(a.titulo))!
  assert.equal(conc.gravidade, 'alta')
  assert.equal(conc.quando, 'análise de 22/05')
  assert.match(conc.texto!, /AUPO11, BBSE3, Tesouro IPCA\+ 2035/)
  assert.doesNotMatch(conc.texto!, /BRSTN/)
  assert.match(conc.pergunta, /de 22\/05/)
})

test('o ISIN sem posição vira "um título do Tesouro"; palavra comum não é ISIN', () => {
  assert.equal(trocarIsin('Pesa o BRSTNCLF1RU6 vendido.', POSICOES), 'Pesa o um título do Tesouro vendido.')
  assert.equal(trocarIsin('BRADESCO e BRASILEIRAS', POSICOES), 'BRADESCO e BRASILEIRAS')
})

test('CVM: a frase com ordem sai; o título com ordem derruba o item', () => {
  const vm = montarAchados(entrada())
  const ideias = vm.itens.filter((a) => a.tipo === 'ideia')
  assert.equal(ideias.length, 1)
  assert.equal(ideias[0]!.titulo, 'Olhar a fatia de renda fixa')
  assert.equal(ideias[0]!.texto, 'A renda fixa é 35% do total.')
  assert.equal(ideias[0]!.selo, 'Ideia para avaliar')
  for (const a of vm.itens) {
    assert.equal(temOrdem(`${a.titulo} ${a.texto ?? ''} ${a.selo}`), false, a.id)
  }
  assert.equal(temOrdem('Recomendamos reduzir'), true)
  assert.equal(temOrdem('Compre mais'), true)
  assert.equal(temOrdem('A compreensão do setor'), false)
})

test('a idade da análise: 167 dias em 05/11, antiga passando de 30', () => {
  const vm = montarAchados(entrada())
  assert.deepEqual(vm.analise, { data: '22/05', dias: 167, antiga: true, desatualizada: true })
  assert.deepEqual(idadeDaAnalise('2026-10-20T12:00:00Z', AGORA), { data: '20/10', dias: 16, antiga: false })
  assert.equal(idadeDaAnalise('2025-12-30T12:00:00Z', AGORA)!.data, '30/12/2025')
  assert.equal(idadeDaAnalise(null, AGORA), null)
  // a análise de hoje diz "hoje"
  const hoje = montarAchados(entrada({ analise: { ...ANALISE, generated_at: '2026-11-05T09:00:00-03:00' }, raiox: null }))
  assert.equal(hoje.itens.find((a) => a.tipo === 'risco')!.quando, 'hoje')
})

test('desatualizada: antiga, ou anterior à última sincronização do Open Finance', () => {
  const recente = '2026-10-20T12:00:00Z'
  assert.equal(analiseDesatualizada(recente, null, AGORA), false)
  assert.equal(analiseDesatualizada(recente, '2026-10-19T12:00:00Z', AGORA), false)
  assert.equal(analiseDesatualizada(recente, '2026-11-04T12:00:00Z', AGORA), true)
  assert.equal(analiseDesatualizada('2026-05-22T14:10:00Z', null, AGORA), true)
  assert.equal(analiseDesatualizada(null, '2026-11-04T12:00:00Z', AGORA), false)
  const vm = montarAchados(entrada({ analise: { ...ANALISE, generated_at: recente }, ultimoSync: '2026-11-04T12:00:00Z' }))
  assert.equal(vm.analise!.antiga, false)
  assert.equal(vm.analise!.desatualizada, true)
})

test('o pedido de análise nova casa com a regex do chat-service', () => {
  // reanalyzeKeywordRE (chat-service/src/llm/turn/auto-actions.ts), a parte que importa
  assert.match(PEDIDO_DE_ANALISE_NOVA, /\b(reanalisar|reanalisa|reanalise|reanaliz)\b/i)
})

test('a hora em que olhou, no fuso de São Paulo', () => {
  assert.equal(quandoOlhou('2026-11-05T11:01:00Z', AGORA), 'hoje às 08:01')
  assert.equal(quandoOlhou('2026-11-04T23:40:00Z', AGORA), 'ontem às 20:40')
  assert.equal(quandoOlhou('2026-11-01T12:00:00Z', AGORA), 'em 01/11 às 09:00')
  assert.equal(quandoOlhou(null, AGORA), null)
})

test('sem nada a apontar, a seção fica vazia (a linha calma), sem inventar item', () => {
  const vm = montarAchados(entrada({
    raiox: raiox([metrica('Diversificação', 88, '88/100', 'Bem espalhada.'), metrica('Risco', 80, 'Beta 0,7', 'Oscila menos.')]),
    analise: null,
  }))
  assert.equal(vm.vazio, true)
  assert.equal(vm.pontos, 0)
  // o contrapeso pode existir (a métrica Excelente de hoje), mas não tira a calma
  assert.deepEqual(vm.itens.map((a) => a.tipo), ['forca'])
  assert.equal(resumoDosAchados(vm), 'nada que peça atenção')
  const nada = montarAchados({ raiox: null, analise: null, posicoes: [], olhadaEm: null, agora: AGORA })
  assert.equal(nada.itens.length, 0)
  assert.equal(nada.analise, null)
  assert.equal(oQueOlhou(nada), null)
})

test('o que olhou e o resumo, no singular e no plural', () => {
  const vm = montarAchados(entrada())
  assert.equal(oQueOlhou(vm), '4 ativos em 4 dimensões')
  assert.equal(resumoDosAchados(vm), '5 pontos de atenção e 1 ideia para avaliar')
  assert.equal(resumoDosAchados({ pontos: 1, ideias: 0 }), '1 ponto de atenção')
  assert.equal(oQueOlhou({ ativos: 1, dimensoes: 1 }), '1 ativo em 1 dimensão')
})

test('o assunto do texto da IA casa com a dimensão do Raio-X', () => {
  assert.equal(assuntoDe('Concentração nos três principais ativos'), 'Diversificação')
  assert.equal(assuntoDe('Volatilidade acima do índice'), 'Risco')
  assert.equal(assuntoDe('Dividend yield baixo'), 'Renda')
  assert.equal(assuntoDe('Exposição a juros'), null)
  // "renda fixa" é classe, não a renda da carteira
  assert.equal(assuntoDe('Boa parte da renda fixa reage à Selic'), null)
})

test('o ponto decimal não corta a frase ao tirar a ordem', () => {
  const vm = montarAchados(entrada({ raiox: null }))
  const conc = vm.itens.find((a) => /Concentração/.test(a.titulo))!
  assert.match(conc.texto!, /somam 26\.1% da carteira\.$/)
})

test('cada item tem uma pergunta pronta para o chat', () => {
  for (const a of montarAchados(entrada()).itens) assert.ok(a.pergunta.length > 20, a.id)
})
