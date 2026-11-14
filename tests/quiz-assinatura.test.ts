/**
 * O quiz do "Conectar carteira" (31/10/2026): o resultado sai das respostas,
 * só promete o que existe e tem de três a quatro itens; os bancos e o
 * "nenhum" não convivem; os respiros mudam com a resposta.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  PASSOS,
  passosDoQuiz,
  PERGUNTAS,
  alternarBanco,
  fraseDosAvisos,
  fraseDosCenarios,
  listaEmPalavras,
  resultadoDoQuiz,
  tituloDoResultado,
} from '../app/utils/quizAssinatura.ts'

const nomes: Record<string, string> = { nubank: 'Nubank', itau: 'Itaú', xp: 'XP Investimentos', btg: 'BTG Pactual', rico: 'Rico' }
const nome = (s: string) => nomes[s] ?? s

test('seis perguntas, dois respiros, a montagem e o resultado, nessa ordem', () => {
  assert.equal(PERGUNTAS.length, 6)
  assert.deepEqual(PASSOS.map((p) => (p.tipo === 'pergunta' ? p.pergunta.id : p.tipo === 'respiro' ? p.id : p.tipo)),
    ['investe', 'bancos', 'frequencia', 'avisos', 'preocupa', 'queda', 'cenarios', 'quer', 'montando', 'resultado'])
})

test('sem conta, o e-mail vem antes do resultado; com conta, não aparece', () => {
  const nome = (p: ReturnType<typeof passosDoQuiz>[number]) => (p.tipo === 'pergunta' ? p.pergunta.id : p.tipo === 'respiro' ? p.id : p.tipo)
  assert.deepEqual(passosDoQuiz(true).slice(-4).map(nome), ['quer', 'conta', 'montando', 'resultado'])
  assert.equal(passosDoQuiz(false), PASSOS)
  assert.ok(!passosDoQuiz(false).some((p) => p.tipo === 'conta'))
})

test('lista em palavras', () => {
  assert.equal(listaEmPalavras(['Nubank']), 'Nubank')
  assert.equal(listaEmPalavras(['Nubank', 'XP']), 'Nubank e XP')
  assert.equal(listaEmPalavras(['Nubank', 'Itaú', 'XP']), 'Nubank, Itaú e XP')
})

test('"Ainda em nenhum" e os bancos não convivem', () => {
  assert.deepEqual(alternarBanco(['nubank', 'xp'], 'nenhum'), ['nenhum'])
  assert.deepEqual(alternarBanco(['nenhum'], 'itau'), ['itau'])
  assert.deepEqual(alternarBanco(['nubank', 'xp'], 'xp'), ['nubank'])
})

test('o resultado nomeia os bancos e liga cada item a uma resposta', () => {
  const r = resultadoDoQuiz({ investe: ['anos'], bancos: ['nubank', 'xp'], preocupa: ['queda', 'proventos'], queda: ['nao'], quer: ['renda'] }, nome)
  assert.equal(r[0]!.titulo, 'Nubank e XP Investimentos, num lugar só')
  assert.deepEqual(r.map((x) => x.id), ['bancos', 'aviso', 'proventos', 'cenarios'])
})

test('um banco só, muitos bancos e nenhum', () => {
  assert.equal(resultadoDoQuiz({ bancos: ['itau'] }, nome)[0]!.titulo, 'Seu Itaú, lido sozinho')
  assert.equal(resultadoDoQuiz({ bancos: ['nubank', 'itau', 'xp', 'btg', 'rico'] }, nome)[0]!.titulo, 'Nubank, Itaú, XP Investimentos e mais 2, num lugar só')
  assert.equal(resultadoDoQuiz({ investe: ['nao'], bancos: ['nenhum'] }, nome)[0]!.titulo, 'A carteira nasce aqui')
})

test('sempre de três a quatro itens, sem repetir', () => {
  const casos = [
    {},
    { queda: ['sim'] },
    { bancos: ['nubank'], preocupa: ['queda', 'indo', 'proventos', 'espalhado'], queda: ['nao'], quer: ['renda'] },
    { investe: ['nao'], bancos: ['nenhum'], quer: ['nao-sei'] },
  ]
  for (const c of casos) {
    const r = resultadoDoQuiz(c, nome)
    assert.ok(r.length >= 2 && r.length <= 4, `${JSON.stringify(c)}: ${r.length}`)
    assert.equal(new Set(r.map((x) => x.id)).size, r.length)
  }
})

test('os respiros respondem ao que a pessoa disse', () => {
  assert.match(fraseDosAvisos({ frequencia: ['dia'] }).titulo, /todo dia\. A Aportou também/)
  assert.match(fraseDosAvisos({ frequencia: ['nunca'] }).titulo, /não precisa olhar/)
  assert.match(fraseDosCenarios({ queda: ['nao'] }).titulo, /Quase ninguém sabe/)
  assert.match(fraseDosCenarios({ queda: ['sim'] }).titulo, /2\.000/)
})

test('o título usa o primeiro nome quando tem', () => {
  assert.equal(tituloDoResultado({ investe: ['anos'] }, 'Marina Costa'), 'O seu plano está pronto, Marina.')
  assert.equal(tituloDoResultado({ investe: ['nao'] }, null), 'Tudo pronto para começar.')
})

test('nenhuma frase do quiz recomenda comprar ou vender', () => {
  const textos = JSON.stringify([PERGUNTAS, resultadoDoQuiz({ bancos: ['nubank'], preocupa: ['queda', 'indo', 'proventos'], queda: ['nao'], quer: ['renda'] }, nome)])
  assert.doesNotMatch(textos, /\b(compre|venda|comprar|vender|recomend)/i)
})
