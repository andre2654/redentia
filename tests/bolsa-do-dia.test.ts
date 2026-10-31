/**
 * A bolsa do dia na home do visitante ("O fechamento", 31/10/2026). O
 * fixture é a API pública de produção do fechamento de 30/10/2026; os casos
 * travam os fatos (pontos do índice, quedas seguidas, o mês, a semana) e as
 * frases de cada momento do relógio da B3.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { causaEmTexto, convicaoAntes, montarBolsaDoDia, pontosComSinal, pontosTruncados, textosDaBolsa, type EntradaDaBolsa } from '../app/utils/bolsaDoDia.ts'
import { proximoPregao } from '../app/utils/pregao.ts'
import { momentoDaBolsa } from '../app/utils/pregaoB3.ts'

const fixture = JSON.parse(readFileSync(new URL('./fixtures/bolsa-2026-10-30.json', import.meta.url), 'utf8')) as EntradaDaBolsa
const dia = montarBolsaDoDia(fixture)
const sexta21h = new Date('2026-10-30T21:00:00-03:00')
const sabado = new Date('2026-10-31T11:00:00-03:00')

test('os fatos do dia saem de uma fonte só e batem com a IA', () => {
  assert.deepEqual(dia.ibov && [dia.ibov.pontos, dia.ibov.pct, dia.ibov.data], [167921.8, -0.75, '2026-10-30'])
  assert.equal(pontosTruncados(dia.ibov!.pontos), '167.921') // truncado, como a IA escreve
  assert.deepEqual(dia.seguidas, { n: 5, sentido: 'queda', ate: '2026-10-30' })
  assert.equal(Math.round(dia.mes!.pct * 100) / 100, -9.88)
  assert.equal(dia.mes!.ultimoPregao, true) // 02/11 é Finados: o próximo pregão já é de novembro
  assert.equal(dia.mes!.piorDesde, 'junho de 2022')
  assert.deepEqual(dia.mes!.raros, { n: 17, total: 302, desde: 2001 })
  assert.deepEqual(dia.contagem, { altas: 17, quedas: 58, total: 76 })
  assert.equal(dia.leitura!.bate, true)
})

test('quem mexeu no índice, em pontos, junta as classes da mesma empresa', () => {
  const p = dia.pesos!
  assert.equal(p.confere, true)
  assert.deepEqual(p.negativas.slice(0, 3).map((x) => [x.nome, pontosComSinal(x.pontos)]), [['Itaú Unibanco', '−324'], ['B3', '−274'], ['BTG Pactual', '−215']])
  assert.deepEqual(p.positivas.slice(0, 2).map((x) => [x.nome, pontosComSinal(x.pontos)]), [['Vale', '+518'], ['Petrobras', '+326']])
  assert.deepEqual(p.positivas[1]!.tickers.sort(), ['PETR3', 'PETR4'])
  // a tese dos que mais tiraram
  assert.deepEqual(dia.tese && [dia.tese.slug, dia.tese.nomes], ['bancos-brasileiros', ['Itaú Unibanco', 'BTG Pactual']])
})

test('o dia em que um pregão andou mais de 10% não sustenta a semana nem o mês', () => {
  // 26/10 marca −13,88% na série: até alguém confirmar, a semana e o mês saem
  assert.equal(dia.semana!.confiavel, false)
  assert.equal(dia.mes!.confiavel, false)
  const t = textosDaBolsa(dia, 'sem-pregao', sabado)!
  assert.equal(t.sobrelinha, 'Sexta, 30/10 · abre terça, 3/11, às 10h')
  assert.equal(t.legenda, 'Ibovespa ontem')
  assert.equal(t.apoio, 'Ibovespa a 167.921 pontos. Segunda é Finados, sem pregão.')
})

test('fechou e a IA escreveu: a história inteira', () => {
  const confiavel = { ...dia, mes: { ...dia.mes!, confiavel: true }, tese: { ...dia.tese!, antes: { valor: 90, ate: '2026-10-27' } } }
  const t = textosDaBolsa(confiavel, 'fechada', sexta21h)!
  assert.equal(t.sobrelinha, 'Hoje, 30/10 · fechou às 17h')
  assert.deepEqual([t.numero, t.legenda, t.titulo], ['−0,75%', 'Ibovespa hoje', 'Quinta queda seguida.'])
  assert.equal(t.apoio, 'Ibovespa a 167.921 pontos. Outubro fechou em −9,88%, o pior mês desde junho de 2022.')
  assert.equal(causaEmTexto(t.causa!), 'Quem mais tirou: Itaú Unibanco, −324; B3, −274; BTG Pactual, −215. Vale (+518) e Petrobras (+326) seguraram a queda.')
  assert.equal(t.contagem, '17 das 76 ações do Ibovespa subiram; 58 caíram.')
  assert.equal(t.tese!.texto, 'Itaú Unibanco e BTG Pactual estão na tese Bancos Brasileiros: convicção 88 de 100, era 90 até 27/10.')
  assert.deepEqual(t.leitura && t.leitura.assinatura, 'IA da Redentia · 30/10, 20h20')
  assert.equal(t.linkFechamento, 'Ler o fechamento inteiro')
  assert.match(t.ponte.frase, /^Desde 2001, o Ibovespa caiu 9,88% ou mais em 17 meses, este incluído\./)
})

test('fechou e a IA ainda não escreveu: o aviso, não o esqueleto', () => {
  const t = textosDaBolsa({ ...dia, leitura: null }, 'fechada', new Date('2026-10-30T18:10:00-03:00'))!
  assert.equal(t.leitura, null)
  assert.equal(t.aviso, 'O fechamento da IA sai por volta das 20h.')
  // passou das 21h30 sem texto: o aviso some
  assert.equal(textosDaBolsa({ ...dia, leitura: null }, 'fechada', new Date('2026-10-30T22:00:00-03:00'))!.aviso, null)
})

test('ao vivo: presente, hora do dado e o fechamento de ontem só como link', () => {
  const vivo = { ...dia, ibov: { ...dia.ibov!, asOf: '2026-10-30T14:30:00-03:00' }, leitura: { ...dia.leitura!, data: '2026-10-29', bate: false } }
  const t = textosDaBolsa(vivo, 'aberta', new Date('2026-10-30T14:32:00-03:00'))!
  assert.deepEqual([t.sobrelinha, t.aoVivo, t.legenda], ['Ao vivo · 14h30', true, 'Ibovespa até agora'])
  assert.equal(t.titulo, 'Itaú Unibanco pesa mais: −324 pontos.')
  assert.match(t.apoio!, /O fechamento da IA sai por volta das 20h\.$/)
  assert.match(causaEmTexto(t.causa!), /^Até agora, quem mais tira: .* seguram a queda\.$/)
  assert.equal(t.contagem, 'Até agora, 17 das 76 ações do Ibovespa sobem; 58 caem.')
  assert.equal(t.linkFechamento, 'Ler o fechamento de quinta')
  assert.equal(textosDaBolsa(vivo, 'aberta', new Date('2026-10-30T15:10:00-03:00'))!.sobrelinha, 'Atualizado às 14h30')
})

test('fim de semana com a série confirmada: a semana é o herói', () => {
  const semana = { ...dia, semana: { ...dia.semana!, confiavel: true }, mes: { ...dia.mes!, confiavel: true } }
  const t = textosDaBolsa(semana, 'sem-pregao', sabado)!
  assert.equal(t.sobrelinha, 'Semana de 26 a 30/10 · abre terça, 3/11, às 10h')
  assert.deepEqual([t.numero, t.legenda, t.titulo], ['−18,12%', 'Ibovespa na semana', 'Cinco quedas em cinco pregões.'])
  assert.equal(t.apoio, 'De 205.082 para 167.921 pontos. Outubro fechou em −9,88%, o pior mês desde junho de 2022. Segunda é Finados, sem pregão.')
  assert.match(causaEmTexto(t.causa!), /^Ontem, quem mais tirou:/)
  assert.equal(t.contagem, null)
})

test('antes da abertura e feriado no meio da semana', () => {
  const t = textosDaBolsa(dia, 'antes', new Date('2026-11-03T08:00:00-03:00'))!
  assert.equal(t.sobrelinha, 'Sexta, 30/10 · abre hoje às 10h')
  assert.equal(t.legenda, 'Ibovespa na sexta')
  const fer = { ...dia, ibov: { ...dia.ibov!, data: '2026-11-19' }, seguidas: null }
  assert.equal(textosDaBolsa(fer, 'sem-pregao', new Date('2026-11-20T11:00:00-03:00'))!.sobrelinha, 'Consciência Negra, sem pregão · abre segunda, 23/11, às 10h')
})

test('o calendário: o próximo pregão e o fechamento das 18h fora do horário de verão dos EUA', () => {
  assert.equal(proximoPregao('2026-10-30'), '2026-11-03')
  assert.equal(proximoPregao('2026-12-30'), null) // 31/12 sem pregão e 2027 sem calendário
  // de 03/11 em diante a B3 fecha às 18h: às 17h30 a bolsa ainda está aberta
  assert.equal(momentoDaBolsa(new Date('2026-11-03T17:30:00-03:00')).estado, 'aberta')
  assert.equal(momentoDaBolsa(new Date('2026-10-30T17:30:00-03:00')).estado, 'fechada')
})

test('a convicção de antes, só se mudou nos últimos 30 dias', () => {
  const s = [{ date: '2026-10-26', conviction: 90 }, { date: '2026-10-27', conviction: 90 }, { date: '2026-10-28', conviction: 88 }, { date: '2026-10-30', conviction: 88 }]
  assert.deepEqual(convicaoAntes(s, 88), { valor: 90, ate: '2026-10-27' })
  assert.equal(convicaoAntes([{ date: '2026-10-30', conviction: 88 }], 88), null)
})

test('a variação do papel principal vai junto com os pontos da empresa', () => {
  assert.equal(dia.pesos!.negativas[0]!.pct, fixture.today!.constituents!.find((c) => c.ticker === 'ITUB4')!.change_pct)
  assert.equal(dia.acoes.length, 76)
})
