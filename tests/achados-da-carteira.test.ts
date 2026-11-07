/**
 * Os achados da Redentia AI na /carteira (05/11/2026): os pontos de atenção do
 * score determinístico (de hoje), por gravidade, e o que vai bem. A análise
 * escrita pela IA (o Raio-X da carteira) saiu da tela em 07/11/2026, e os
 * testes dela (idade, ISIN, número brasileiro, o filtro da CVM no texto da IA,
 * o pedido de análise nova) saíram junto.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  montarAchados,
  oQueOlhou,
  assinaturaDosAchados,
  quandoOlhou,
  resumoDosAchados,
  achadosHtml,
  tituloDosAchados,
  type EntradaDosAchados,
} from '../app/utils/achadosDaCarteira.ts'
import type { CarteiraScoreVM, ScoreMetricVM } from '../app/types/carteira.ts'

const AGORA = new Date('2026-11-05T11:01:00-03:00')

const metrica = (label: string, fillPct: number, value: string, note: string): ScoreMetricVM => ({
  label, value, fillPct, note,
  tag: fillPct < 70 ? 'Atenção' : fillPct < 85 ? 'Controlado' : 'Excelente',
  tagTone: fillPct < 70 ? 'amber' : 'green',
  fillTone: fillPct < 70 ? 'amber' : 'green',
})

const raiox = (metrics: ScoreMetricVM[]): CarteiraScoreVM => ({
  score: 70, band: 'Boa saúde', attention: metrics.filter((m) => m.tag === 'Atenção').length, metrics,
})

const POSICOES = [
  { ticker: 'AUPO11', classe: 'ETF', valor: 6000, nome: 'AUPO11' },
  { ticker: 'BBSE3', classe: 'STOCK', valor: 3500, nome: 'BB Seguridade' },
  { ticker: 'BRSTNCNTB7T1', classe: 'TREASURY', valor: 15000, nome: 'Tesouro IPCA+ 2035' },
  { ticker: 'VALE3', classe: 'STOCK', valor: 9000, nome: 'Vale' },
]

const entrada = (o: Partial<EntradaDosAchados> = {}): EntradaDosAchados => ({
  raiox: raiox([
    metrica('Diversificação', 62, '62/100', '64% em ações. Maior setor: Mineração (30% do total).'),
    metrica('Risco', 80, 'Beta 0,84', 'Sua carteira oscila menos que o IBOV.'),
    metrica('Renda', 50, 'DY 3,1%', 'R$ 1.200 em proventos nos últimos 12 meses.'),
    metrica('Qualidade', 40, '40/100', 'Score médio de 3 dos seus ativos.'),
  ]),
  posicoes: POSICOES,
  olhadaEm: '2026-11-05T11:01:00Z',
  agora: AGORA,
  ...o,
})

test('a ordem é por gravidade, e o que vai bem fica no fim', () => {
  const vm = montarAchados(entrada())
  assert.deepEqual(vm.itens.map((a) => `${a.tipo}:${a.gravidade ?? '-'}:${a.dimensao}`), [
    'atencao:alta:Qualidade', // 40 (abaixo de 45 é grave)
    'atencao:media:Diversificação', // 62
    'atencao:media:Renda', // 50
  ])
  assert.equal(vm.pontos, 3)
  assert.equal(vm.vazio, false)
  // com uma métrica Excelente, o contrapeso vem por último e não conta como ponto
  const comForca = montarAchados(entrada({ raiox: raiox([metrica('Diversificação', 95, '95/100', 'Bem espalhada.'), metrica('Renda', 50, 'DY 3,1%', 'Pouca renda.')]) }))
  assert.deepEqual(comForca.itens.map((a) => `${a.tipo}:${a.selo}`), ['atencao:Pede atenção', 'forca:Vai bem'])
  assert.equal(comForca.pontos, 1)
})

test('CVM: o texto dos achados descreve, sem ordem de compra e venda nem alocação', () => {
  const ORDEM = /\b(compre|comprar|venda|vender|recomend\w*|sugerimos|reduza|reduzir|aumente|aumentar|rebalance\w*|diversifique)\b/i
  for (const e of [entrada(), entrada({ raiox: raiox([metrica('Diversificação', 95, '95/100', 'Bem espalhada.')]) })]) {
    for (const a of montarAchados(e).itens) assert.doesNotMatch(`${a.titulo} ${a.selo} ${a.pergunta}`, ORDEM, a.id)
  }
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
  }))
  assert.equal(vm.vazio, true)
  assert.equal(vm.pontos, 0)
  // o contrapeso pode existir (a métrica Excelente de hoje), mas não tira a calma
  assert.deepEqual(vm.itens.map((a) => a.tipo), ['forca'])
  assert.equal(resumoDosAchados(vm), 'nada que peça atenção')
  const nada = montarAchados({ raiox: null, posicoes: [], olhadaEm: null, agora: AGORA })
  assert.equal(nada.itens.length, 0)
  assert.equal(nada.vazio, true)
  assert.equal(oQueOlhou(nada), null)
})

test('o que olhou e o resumo, no singular e no plural', () => {
  const vm = montarAchados(entrada())
  assert.equal(oQueOlhou(vm), '4 ativos em 4 dimensões')
  assert.equal(resumoDosAchados(vm), '3 pontos de atenção')
  assert.equal(resumoDosAchados({ pontos: 1 }), '1 ponto de atenção')
  assert.equal(oQueOlhou({ ativos: 1, dimensoes: 1 }), '1 ativo em 1 dimensão')
})

test('cada item tem uma pergunta pronta para o chat', () => {
  for (const a of montarAchados(entrada()).itens) assert.ok(a.pergunta.length > 20, a.id)
})

test('o título conta os pontos de atenção de hoje, com o número à parte', () => {
  const vm = montarAchados(entrada())
  const t = tituloDosAchados(vm)
  assert.equal(t.titulo, 'A Redentia olhou a sua carteira: 3 pontos de atenção')
  assert.deepEqual(t.pedacos.filter((p) => p.numero), [{ texto: '3', numero: 'atencao' }])
  assert.equal(t.pedacos.map((p) => p.texto).join(''), t.titulo)
  assert.equal(tituloDosAchados({ pontos: 1, vazio: false }).titulo, 'A Redentia olhou a sua carteira: 1 ponto de atenção')
  assert.equal(tituloDosAchados({ pontos: 0, vazio: true }).titulo, 'A Redentia olhou a sua carteira: nada pede atenção')
})

test('a barra aberta: tudo escapado, o R$ mascarado e nada da análise escrita', () => {
  const vm = montarAchados(entrada())
  const html = achadosHtml(vm, { mascarar: (t) => t.replace(/R\$\s?[\d.,]+/g, 'R$ ••••') })
  const grupos = [...html.matchAll(/<p class="cah__grupo">(.+?)<\/p>/g)].map((x) => x[1]!)
  assert.deepEqual(grupos, ['Pede atenção'])
  assert.equal((html.match(/<li /g) ?? []).length, vm.itens.length)
  assert.match(html, /A Redentia olhou <b>4 ativos em 4 dimensões<\/b>/)
  assert.match(html, /R\$ ••••/)
  assert.doesNotMatch(html, /R\$ 1\.200/)
  // o número de hoje à direita do título, e o "Perguntar à Redentia" da linha
  assert.match(html, /<b class="cah__t">A qualidade pede atenção<\/b><span class="cah__v">40\/100<\/span>/)
  assert.equal((html.match(/class="cah__perg" data-achado="/g) ?? []).length, vm.itens.length)
  for (const a of vm.itens) assert.ok(html.includes(`data-achado="${a.id}"`), a.id)
  // sem a análise escrita: nem a data dela, nem o grupo do fim, nem o aviso
  assert.doesNotMatch(html, /cah__antiga|cah__meta|cah__nota|análise de/)
  const sujo = montarAchados(entrada({ raiox: raiox([metrica('Renda', 30, 'DY <1%', 'a & b <script>')]) }))
  const h2 = achadosHtml(sujo)
  assert.match(h2, /DY &lt;1%/)
  assert.match(h2, /a &amp; b &lt;script&gt;/)
})

/* ————— a carteira do dono, aberta em 05/11/2026 ————— */

const POSICOES_DO_DONO = [
  { ticker: 'AUPO11', classe: 'ETF', valor: 6000, nome: 'AUPO11' },
  { ticker: 'BBSE3', classe: 'STOCK', valor: 3500, nome: 'BB Seguridade' },
  { ticker: 'BRSTNCNTB4W2', classe: 'TREASURY', valor: 15000, nome: 'Tesouro IPCA+ 2032' },
  { ticker: 'PETR4', classe: 'STOCK', valor: 8000, nome: 'Petrobras' },
]
const entradaDoDono = (o: Partial<EntradaDosAchados> = {}): EntradaDosAchados => ({
  raiox: raiox([
    metrica('Diversificação', 95, '95/100', '58,2% em ações. Maior setor: Financeiro (21% do total).'),
    metrica('Renda', 25, 'DY 1,6%', 'R$ 9.118 em proventos nos últimos 12 meses.'),
    metrica('Qualidade', 52, '52/100', 'Score médio de 4 dos seus ativos: PETR4 e BBSE3 puxam para baixo.'),
  ]),
  posicoes: POSICOES_DO_DONO,
  olhadaEm: '2026-11-05T11:01:00Z',
  agora: AGORA,
  ...o,
})

test('a carteira do dono: a renda e a qualidade pedem atenção; a diversificação vai bem', () => {
  const vm = montarAchados(entradaDoDono())
  assert.deepEqual(vm.itens.map((a) => `${a.tipo}:${a.titulo}`), [
    'atencao:A renda pede atenção',
    'atencao:A qualidade pede atenção',
    'forca:Diversificação em nível excelente',
  ])
  assert.equal(vm.pontos, 2)
  assert.equal(tituloDosAchados(vm).titulo, 'A Redentia olhou a sua carteira: 2 pontos de atenção')
})

test('a barra aberta com o que vai bem: "Pede atenção" numa coluna e "Vai bem" na outra', () => {
  const html = achadosHtml(montarAchados(entradaDoDono()))
  assert.match(html, /<div class="cah__cols cah__cols--2"><div class="cah__col"><p class="cah__grupo">Pede atenção<\/p>[^]*<\/div><div class="cah__col"><p class="cah__grupo">Vai bem<\/p>/)
  assert.doesNotMatch(html, /Ideias para avaliar/)
})

test('a barra aberta sem achado: a linha calma, nunca vazia', () => {
  const vm = montarAchados(entrada({ raiox: raiox([metrica('Risco', 80, 'Beta 0,84', 'ok')]) }))
  assert.equal(vm.vazio, true)
  const html = achadosHtml(vm)
  assert.match(html, /Nada pede atenção agora\./)
  assert.doesNotMatch(html, /cah__grupo/)
})

test('o modal: a assinatura diz o que olhou e quando; sem a frase de abertura no miolo', () => {
  const vm = montarAchados(entrada())
  assert.equal(assinaturaDosAchados(vm), 'olhou 4 ativos hoje às 08:01')
  assert.equal(assinaturaDosAchados({ ativos: 1, olhouEm: null }), 'olhou 1 ativo')
  assert.equal(assinaturaDosAchados({ ativos: 0, olhouEm: 'hoje às 08:01' }), 'olhou a sua carteira hoje às 08:01')
  const html = achadosHtml(vm, { olhou: false })
  assert.doesNotMatch(html, /A Redentia olhou/)
  assert.match(html, /^<div class="cah__cols/)
  assert.match(html, /<p class="cah__grupo">Pede atenção<\/p>/)
})
