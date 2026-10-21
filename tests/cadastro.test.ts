/**
 * Cadastro sem muro (21/10/2026): a folha que sobe no lugar do /login. Estes
 * testes travam os textos de cada gesto (só o que a conta entrega de verdade)
 * e as contas dos gráficos do herói, que usam dado real: a série do mês do
 * ativo e a mesma conta de juros compostos da calculadora.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { brlInteiro, citaOutroPapel, curvaJuros, linhaDoMes, motivoCurto, pctTexto, pontoNaPolilinha, primeiraFrase, quandoDoPregao, textoDoGesto, totalJuros } from '../app/utils/cadastro.ts'
import { compoundProjection } from '../app/components/calc/compound-math.ts'

test('cada gesto tem título, até três motivos, botão com a ação e o aceite', () => {
  for (const g of ['seguir', 'resumo', 'simulacao', 'aposentadoria', 'pergunta'] as const) {
    const t = textoDoGesto(g, { ticker: 'wege3', minutos: 3 })
    assert.ok(t.titulo.endsWith('.'), g)
    assert.ok(t.linhas.length > 0 && t.linhas.length <= 3, g)
    assert.ok(t.botao.length > 0 && !/criar conta/i.test(t.botao), g)
    assert.match(t.aceite, /conta grátis/, g)
  }
  const s = textoDoGesto('seguir', { ticker: 'wege3' })
  assert.equal(s.titulo, 'Siga WEGE3.')
  assert.equal(s.botao, 'Seguir WEGE3')
  // o resumo das 19h só sai com o tópico ligado: o aceite precisa dizer isso
  assert.match(s.aceite, /resumo das 19h/)
  assert.equal(textoDoGesto('resumo', { minutos: 3 }).apoio, 'Três minutos de leitura antes de o pregão abrir.')
  assert.equal(textoDoGesto('resumo', {}).apoio, 'Uma leitura curta antes de o pregão abrir.')
  // as calculadoras: a pergunta de exemplo usa a conta da pessoa
  assert.equal(textoDoGesto('aposentadoria', { aposentaAos: 60 }).linhas[2]!.texto, '“E se eu me aposentar aos 58?”, com os seus números.')
  assert.equal(textoDoGesto('simulacao', { mensal: 500 }).linhas[2]!.texto, '“E se eu guardar R$ 1.000 por mês?”, com os seus números.')
  assert.equal(textoDoGesto('aposentadoria').botao, 'Guardar a minha conta')
})

test('variação e dinheiro no formato da casa', () => {
  assert.equal(pctTexto(7.78), '+7,78%')
  assert.equal(pctTexto(-5.17), '−5,17%')
  assert.equal(pctTexto(0), '0,00%')
  assert.equal(brlInteiro(103925.6), 'R$ 103.926')
})

test('primeira frase do briefing e o porquê pela manchete', () => {
  assert.equal(
    primeiraFrase('O Ibovespa subiu 1,57%, a 208.296 pontos, com 71 de 76 papéis em alta. A cinco dias do segundo turno, o dinheiro foi para o varejo.'),
    'O Ibovespa subiu 1,57%, a 208.296 pontos, com 71 de 76 papéis em alta.',
  )
  assert.equal(primeiraFrase('   '), null)
  assert.equal(
    motivoCurto('WEG (WEGE3) lucra R$ 1,67 bilhão no 3T e fica abaixo das projeções do mercado', 'WEGE3'),
    'WEG lucra R$ 1,67 bilhão no 3T e fica abaixo das projeções do mercado',
  )
  const longo = motivoCurto('Palavra '.repeat(30), 'XPTO3', 40)
  assert.ok(longo && longo.length <= 41 && longo.endsWith('…'))
})

test('resumo do dia não vira o porquê, e o "hoje" só vale com o pregão aberto', () => {
  assert.equal(citaOutroPapel('Petrobras, WEG (WEGE3) e Cosan (CSAN3) são alguns dos destaques desta quarta-feira (21)', 'PETR4'), true)
  assert.equal(citaOutroPapel('Petrobras (PETR3; PETR4) aprova dividendos', 'PETR4'), false)
  assert.equal(citaOutroPapel('WEG lucra R$ 1,67 bilhão no 3T e fica abaixo das projeções', 'WEGE3'), false)
  // 21/10/2026 é quarta: 10h em Brasília são 13h UTC
  assert.equal(quandoDoPregao(new Date('2026-10-21T13:00:00Z')), 'hoje')
  assert.equal(quandoDoPregao(new Date('2026-10-21T12:59:00Z')), 'no último pregão')
  assert.equal(quandoDoPregao(new Date('2026-10-22T02:30:00Z')), 'hoje') // quarta, 23h30 em Brasília
  assert.equal(quandoDoPregao(new Date('2026-10-24T15:00:00Z')), 'no último pregão') // sábado
})

test('a linha do mês separa o trecho de hoje e marca o fechamento de ontem', () => {
  // série real da WEG, 21/09 a 21/10/2026
  const weg = [51.08, 51.8, 51.16, 50.74, 51.07, 50.12, 50.29, 49.46, 49.56, 51.45, 51.25, 50.75, 51.27, 51.77, 51.47, 50.81, 50.44, 49.09, 47.99, 47.67, 48.79, 46.43]
  const l = linhaDoMes(weg, 456, 120, 8)
  assert.ok(l)
  assert.equal(l.subiu, false)
  assert.deepEqual(l.fim, [448, 112])
  assert.equal(l.ontemY, 66.3)
  assert.match(l.queda, /^M427\.0 66\.3 L448\.0 112\.0$/)
  assert.ok(l.comprimentoCorpo > 400 && l.comprimentoQueda > 40)
  assert.equal(linhaDoMes([10, null, 11]), null)
  assert.equal(linhaDoMes([10, 11, 12])?.subiu, true)
})

test('a curva de juros usa a mesma conta da calculadora', () => {
  const c = { inicial: 0, mensal: 500, taxa: 10.75, anos: 10 }
  assert.equal(Math.round(totalJuros(c)), Math.round(compoundProjection({ ji: 0, jm: 500, jt: 10.75, jp: 10 }).total))
  assert.equal(brlInteiro(totalJuros(c)), 'R$ 103.926')
  const k = curvaJuros(c)
  assert.ok(k)
  assert.equal(Math.round(k.aportado), 60000)
  assert.ok(k.pontos.length >= 20)
  // começa embaixo à esquerda e termina no topo à direita
  assert.deepEqual(k.pontos[0], [10, 110])
  assert.deepEqual(k.pontos[k.pontos.length - 1], [446, 10])
  assert.equal(curvaJuros({ inicial: 0, mensal: 0, taxa: 10, anos: 10 }), null)
})

test('a bola de neve anda pelo comprimento da curva', () => {
  const pts: Array<[number, number]> = [[0, 0], [10, 0], [10, 10]]
  assert.deepEqual(pontoNaPolilinha(pts, 0), [0, 0])
  assert.deepEqual(pontoNaPolilinha(pts, 0.5), [10, 0])
  assert.deepEqual(pontoNaPolilinha(pts, 1), [10, 10])
  assert.deepEqual(pontoNaPolilinha(pts, 2), [10, 10])
})
