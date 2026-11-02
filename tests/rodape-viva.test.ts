/**
 * O rodapé "Viva" (protótipo de 02/11/2026): a frase do pregão em cada
 * momento do relógio da B3, sobre o fechamento real de 30/10/2026 (o mesmo
 * fixture do teste da bolsa do dia).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { montarBolsaDoDia, type EntradaDaBolsa } from '../app/utils/bolsaDoDia.ts'
import { estadoDoPregao } from '../app/utils/pregao.ts'
import { fraseDoPregao } from '../app/utils/rodapeViva.ts'

const fixture = JSON.parse(readFileSync(new URL('./fixtures/bolsa-2026-10-30.json', import.meta.url), 'utf8')) as EntradaDaBolsa
const dia = montarBolsaDoDia(fixture)
const em = (iso: string) => {
  const agora = new Date(iso)
  return fraseDoPregao(dia, estadoDoPregao(agora).estado, agora)
}

test('no feriado de Finados, a frase é a de sexta e diz quando a bolsa abre', () => {
  const f = em('2026-11-02T15:00:00-03:00')!
  assert.equal(`${f.abertura} ${f.pontos}, ${f.variacao}.`, 'Na sexta, o Ibovespa fechou em 167.921 pontos, −0,75%.')
  assert.equal(f.sobrelinha, 'Finados, sem pregão · abre terça, 3/11, às 10h')
  assert.equal(f.enredo, 'Quinta queda seguida.')
  assert.equal(f.sentido, 'queda')
  assert.equal(f.aoVivo, false)
  assert.equal(f.pergunta, 'Por que o Ibovespa caiu na sexta?')
})

test('no sábado, a bolsa fechada pula o feriado de segunda', () => {
  const f = em('2026-10-31T11:00:00-03:00')!
  assert.equal(f.sobrelinha, 'Bolsa fechada · abre terça, 3/11, às 10h')
  assert.equal(f.abertura, 'Ontem, o Ibovespa fechou em')
})

test('na noite do pregão, é hoje e diz a hora do fechamento', () => {
  const f = em('2026-10-30T21:00:00-03:00')!
  assert.equal(f.abertura, 'Hoje, o Ibovespa fechou em')
  assert.match(f.sobrelinha, /^Bolsa fechada · fechou às 1[78]h$/)
})

test('com o pregão aberto e o número do dia, a frase é ao vivo', () => {
  const agora = new Date('2026-10-30T14:00:00-03:00')
  const f = fraseDoPregao(dia, 'aberta', agora)!
  assert.equal(f.aoVivo, true)
  assert.equal(f.abertura, 'Agora, o Ibovespa está em')
  assert.equal(f.enredo, null)
  assert.equal(f.pergunta, 'Por que o Ibovespa cai hoje?')
})

test('sem o Ibovespa, não há frase (nunca zero)', () => {
  assert.equal(fraseDoPregao({ ...dia, ibov: null }, 'fechada'), null)
  assert.equal(fraseDoPregao(null, 'fechada'), null)
})
