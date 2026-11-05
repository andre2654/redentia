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
  assinaturaDosAchados,
  quandoOlhou,
  resumoDosAchados,
  temOrdem,
  trocarIsin,
  achadosHtml,
  tituloDosAchados,
  tituloDeOrdem,
  numerosBr,
  semJargao,
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
  // a análise é de 22/05 (antiga): a contagem do título é só a de hoje
  assert.equal(vm.pontos, 3)
  assert.equal(vm.ideias, 0)
  assert.equal(vm.antigos, 3)
  assert.equal(vm.vazio, false)
  // sem métrica Excelente hoje, o ponto forte antigo vai para o fim também
  assert.deepEqual(vm.itens.filter((a) => a.antigo).map((a) => a.tipo), ['risco', 'risco', 'ideia', 'forca'])
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
  const vm = montarAchados(entrada({ analise: { ...ANALISE, generated_at: '2026-10-20T12:00:00Z' } }))
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
  assert.match(conc.texto!, /somam 26,1% da carteira\.$/)
})

test('cada item tem uma pergunta pronta para o chat', () => {
  for (const a of montarAchados(entrada()).itens) assert.ok(a.pergunta.length > 20, a.id)
})

test('a barra: o título conta os achados de hoje, com os números à parte, e diz a análise desatualizada', () => {
  const vm = montarAchados(entrada())
  const t = tituloDosAchados(vm)
  assert.equal(t.titulo, 'A Redentia olhou a sua carteira: 3 pontos de atenção')
  assert.equal(t.idade, 'análise de 22/05, desatualizada')
  assert.deepEqual(t.pedacos.filter((p) => p.numero), [{ texto: '3', numero: 'atencao' }])
  assert.equal(t.pedacos.map((p) => p.texto).join(''), t.titulo)
  const recente = montarAchados(entrada({ analise: { ...ANALISE, generated_at: '2026-10-20T12:00:00Z' } }))
  const tr = tituloDosAchados(recente)
  assert.equal(tr.titulo, 'A Redentia olhou a sua carteira: 5 pontos de atenção e 1 ideia para avaliar')
  assert.equal(tr.idade, null)
  assert.deepEqual(tr.pedacos.filter((p) => p.numero).map((p) => `${p.numero}:${p.texto}`), ['atencao:5', 'ideia:1'])
  assert.equal(tituloDosAchados({ pontos: 0, ideias: 0, vazio: true, analise: null }).titulo, 'A Redentia olhou a sua carteira: nada pede atenção')
  // só a análise antiga tem o que apontar: hoje, nada
  assert.equal(tituloDosAchados({ pontos: 0, ideias: 0, vazio: false, analise: null }).titulo, 'A Redentia olhou a sua carteira: nada pede atenção hoje')
})

test('a barra aberta: de hoje em colunas, a análise antiga no fim, tudo escapado, o R$ mascarado e sem ordem', () => {
  const vm = montarAchados(entrada())
  const html = achadosHtml(vm, { aviso: 'O que está em cima é de hoje.', mascarar: (t) => t.replace(/R\$\s?[\d.,]+/g, 'R$ ••••') })
  const grupos = [...html.matchAll(/<p class="cah__grupo">(.+?)<\/p>/g)].map((x) => x[1]!.replace(/<[^>]+>/g, ''))
  assert.deepEqual(grupos, ['Pede atenção', 'Da análise de 22/05 há 167 dias'])
  assert.equal((html.match(/<li /g) ?? []).length, vm.itens.length)
  // a análise antiga fica depois das colunas de hoje
  assert.ok(html.indexOf('cah__antiga') > html.indexOf('cah__cols'))
  assert.doesNotMatch(html.slice(0, html.indexOf('cah__antiga')), /Exposição a juros|Liquidez/)
  assert.match(html, /A Redentia olhou <b>4 ativos em 4 dimensões<\/b>/)
  assert.match(html, /R\$ ••••/)
  assert.doesNotMatch(html, /R\$ 1\.200/)
  assert.doesNotMatch(html, /BRSTN|[Rr]ecomendamos|Venda VALE3/)
  assert.match(html, /<p class="cah__nota">O que está em cima é de hoje\.<\/p>$/)
  // o número de hoje à direita do título, e o "Perguntar à Redentia" da linha
  assert.match(html, /<b class="cah__t">A qualidade pede atenção<\/b><span class="cah__v">40\/100<\/span>/)
  assert.equal((html.match(/class="cah__perg" data-achado="/g) ?? []).length, vm.itens.length)
  for (const a of vm.itens) assert.ok(html.includes(`data-achado="${a.id}"`), a.id)
  // o ponto leve diz "Vale olhar"; de hoje não repete "visto hoje"
  assert.match(html, /<b class="cah__t">Liquidez de AUPO11<\/b><\/p><p class="cah__x">[^<]*<\/p><div class="cah__pe"><span class="cah__meta">Vale olhar<\/span><button /)
  assert.doesNotMatch(html, /visto hoje/)
  const sujo = montarAchados(entrada({ analise: { ...ANALISE, risks: [{ title: 'Risco <script>', body: 'a & b', severity: 'high' }] } }))
  const h2 = achadosHtml(sujo)
  assert.match(h2, /Risco &lt;script&gt;/)
  assert.match(h2, /a &amp; b/)
})

test('a barra aberta com a análise recente: sem separação, ideias e o que vai bem na segunda coluna', () => {
  const vm = montarAchados(entrada({ analise: { ...ANALISE, generated_at: '2026-10-20T12:00:00Z' } }))
  assert.equal(vm.itens.some((a) => a.antigo), false)
  const html = achadosHtml(vm)
  assert.doesNotMatch(html, /cah__antiga/)
  assert.match(html, /<div class="cah__cols cah__cols--2"><div class="cah__col"><p class="cah__grupo">Pede atenção<\/p>[^]*<\/div><div class="cah__col"><p class="cah__grupo">Ideias para avaliar<\/p>[^]*<p class="cah__grupo">Vai bem<\/p>/)
  // o que é da análise leva a data na linha
  assert.match(html, /<span class="cah__meta">análise de 20\/10<\/span>/)
})

/* ————— a carteira do dono, aberta em 05/11/2026 (as frases reais) ————— */

const POSICOES_DO_DONO = [
  { ticker: 'AUPO11', classe: 'ETF', valor: 6000, nome: 'AUPO11' },
  { ticker: 'BBSE3', classe: 'STOCK', valor: 3500, nome: 'BB Seguridade' },
  { ticker: 'BRSTNCNTB4W2', classe: 'TREASURY', valor: 15000, nome: 'Tesouro IPCA+ 2032' },
  { ticker: 'PETR4', classe: 'STOCK', valor: 8000, nome: 'Petrobras' },
]
const ANALISE_DO_DONO: CarteiraAnaliseIA = {
  generated_at: '2026-05-22T14:10:00Z',
  risks: [
    { title: 'Concentração em poucos ativos', body: 'Os três principais ativos (AUPO11, BBSE3, BRSTNCNTB4W2) somam 26.1% da carteira, o que pode aumentar o risco de perdas significativas.', severity: 'high' },
    { title: 'Exposição a juros altos', body: 'Com a Selic em 14.5%, a renda fixa pode se tornar mais atrativa, impactando a performance de ações.', severity: 'medium' },
  ],
  recommendations: [
    { title: 'Avaliar redução de concentração', body: 'Considere reduzir a exposição nos três principais ativos para diversificar ainda mais a carteira.' },
    { title: 'Rebalancear para ações de dividendos', body: 'Avalie aumentar a alocação em ações com bom histórico de pagamento de dividendos, especialmente em momentos de correção.' },
  ],
  strengths: [{ title: 'Diversificação elevada', body: 'A carteira possui 12 setores distintos, com um HHI de 0.17, indicando uma boa dispersão de risco.' }],
}
const entradaDoDono = (o: Partial<EntradaDosAchados> = {}): EntradaDosAchados => ({
  raiox: raiox([
    metrica('Diversificação', 95, '95/100', '58,2% em ações. Maior setor: Financeiro (21% do total).'),
    metrica('Renda', 25, 'DY 1,6%', 'R$ 9.118 em proventos nos últimos 12 meses.'),
    metrica('Qualidade', 52, '52/100', 'Score médio de 4 dos seus ativos: PETR4 e BBSE3 puxam para baixo.'),
  ]),
  analise: ANALISE_DO_DONO,
  posicoes: POSICOES_DO_DONO,
  olhadaEm: '2026-11-05T11:01:00Z',
  agora: AGORA,
  ...o,
})

test('CVM: a alocação prescrita das frases reais cai (frase e título)', () => {
  assert.equal(temOrdem('Considere reduzir a exposição nos três principais ativos para diversificar ainda mais a carteira.'), true)
  assert.equal(temOrdem('Avalie aumentar a alocação em ações com bom histórico de pagamento de dividendos, especialmente em momentos de correção.'), true)
  assert.equal(temOrdem('Rebalancear para ações de dividendos'), true)
  assert.equal(temOrdem('Sugerimos diversificar entre setores.'), true)
  assert.equal(temOrdem('Vale a pena trocar parte dos FIIs.'), true)
  assert.equal(tituloDeOrdem('Avaliar redução de concentração'), true)
  assert.equal(tituloDeOrdem('Rebalancear para ações de dividendos'), true)
  assert.equal(tituloDeOrdem('Reduza a renda fixa'), true)
  // o fato descritivo fica
  assert.equal(temOrdem('Os três principais ativos somam 26.1% da carteira, o que pode aumentar o risco de perdas significativas.'), false)
  assert.equal(temOrdem('Com a Selic em 14.5%, a renda fixa pode se tornar mais atrativa, impactando a performance de ações.'), false)
  assert.equal(temOrdem('A carteira possui 12 setores distintos, indicando uma boa dispersão de risco.'), false)
  assert.equal(tituloDeOrdem('Diversificação elevada'), false)
  assert.equal(tituloDeOrdem('Olhar a fatia de renda fixa'), false)
  assert.equal(tituloDeOrdem('Comparar os FIIs de logística'), false)
  assert.equal(tituloDeOrdem('Concentração em poucos ativos'), false)
})

test('a carteira do dono: sem ideia sobra, o grupo some e a contagem acompanha', () => {
  const vm = montarAchados(entradaDoDono())
  assert.equal(vm.itens.filter((a) => a.tipo === 'ideia').length, 0)
  assert.equal(vm.ideias, 0)
  assert.equal(tituloDosAchados(vm).titulo, 'A Redentia olhou a sua carteira: 2 pontos de atenção')
  const html = achadosHtml(vm)
  assert.doesNotMatch(html, /Ideias para avaliar/)
  assert.doesNotMatch(html, /Considere|Avalie|Rebalancear|Avaliar redução|reduzir a exposição|aumentar a alocação/)
  for (const a of vm.itens) assert.equal(temOrdem(`${a.titulo} ${a.texto ?? ''}`), false, a.id)
  // a mesma análise, recente: as ideias continuam fora (são ordem), os riscos sobem
  const recente = montarAchados(entradaDoDono({ analise: { ...ANALISE_DO_DONO, generated_at: '2026-10-20T12:00:00Z' } }))
  assert.equal(recente.ideias, 0)
  assert.equal(tituloDosAchados(recente).titulo, 'A Redentia olhou a sua carteira: 4 pontos de atenção')
})

test('a carteira do dono: número brasileiro e sem o jargão do HHI', () => {
  const vm = montarAchados(entradaDoDono({ analise: { ...ANALISE_DO_DONO, generated_at: '2026-10-20T12:00:00Z' } }))
  const texto = (t: RegExp) => vm.itens.find((a) => t.test(a.titulo))!.texto
  assert.equal(texto(/Concentração/), 'Os três principais ativos (AUPO11, BBSE3, Tesouro IPCA+ 2032) somam 26,1% da carteira, o que pode aumentar o risco de perdas significativas.')
  assert.equal(texto(/juros/), 'Com a Selic em 14,5%, a renda fixa pode se tornar mais atrativa, impactando a performance de ações.')
  assert.equal(texto(/Diversificação elevada/), 'A carteira possui 12 setores distintos, indicando uma boa dispersão de risco.')
  assert.equal(numerosBr('HHI de 0.17 e 0.175; R$ 9.118 e 1.200; 1.234.567; 2.5x'), 'HHI de 0,17 e 0,175; R$ 9.118 e 1.200; 1.234.567; 2,5x')
  assert.equal(semJargao('Bem espalhada (HHI 0.17).'), 'Bem espalhada.')
  assert.equal(semJargao('São 12 setores, com um índice HHI de 0,17, bem distribuídos.'), 'São 12 setores, bem distribuídos.')
})

test('a carteira do dono: o que é de 22/05 vai para o grupo do fim; em cima, só o de hoje', () => {
  const vm = montarAchados(entradaDoDono())
  const hoje = vm.itens.filter((a) => !a.antigo)
  assert.deepEqual(hoje.map((a) => `${a.tipo}:${a.titulo}`), [
    'atencao:A renda pede atenção',
    'atencao:A qualidade pede atenção',
    'forca:Diversificação em nível excelente',
  ])
  assert.ok(hoje.every((a) => a.quando === 'hoje'))
  // o ponto forte antigo fala do mesmo que a métrica Excelente de hoje: fica a métrica, com a nota
  assert.equal(hoje[2]!.confirmadoEm, '22/05')
  assert.deepEqual(vm.itens.filter((a) => a.antigo).map((a) => a.titulo), ['Concentração em poucos ativos', 'Exposição a juros altos'])
  assert.equal(vm.antigos, 2)
  const html = achadosHtml(vm)
  const antes = html.slice(0, html.indexOf('cah__antiga'))
  assert.doesNotMatch(antes, /Selic|Concentração em poucos/)
  assert.match(html, /<div class="cah__antiga"><p class="cah__grupo">Da análise de 22\/05 <span class="cah__grupo-d">há 167 dias<\/span><\/p>/)
  // a análise recente (até 30 dias) não separa
  const recente = montarAchados(entradaDoDono({ analise: { ...ANALISE_DO_DONO, generated_at: '2026-10-20T12:00:00Z' } }))
  assert.equal(recente.antigos, 0)
  assert.doesNotMatch(achadosHtml(recente), /cah__antiga/)
})

test('a barra aberta sem achado: a linha calma, nunca vazia', () => {
  const vm = montarAchados(entrada({ analise: null, raiox: raiox([metrica('Risco', 80, 'Beta 0,84', 'ok')]) }))
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
  // os grupos seguem os mesmos
  assert.match(html, /<p class="cah__grupo">Pede atenção<\/p>/)
  assert.match(html, /<div class="cah__antiga">/)
})
