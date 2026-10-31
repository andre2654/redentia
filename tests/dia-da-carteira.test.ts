/**
 * O topo da home de quem assina, segunda versão (31/10/2026): a sobrelinha com
 * a data, o título que só diz "Tudo normal." quando é verdade, o veredito sem
 * número e a causa que nunca elogia. Cada caso é uma frase que a investidora
 * do público ou a especialista de produto pediram, travada aqui.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contraABolsa, fiosDoAnel, fracaoDoAnel, frasesDoDia, montarResumoDoDia, pctComSinal, type ResumoDoDia } from '../app/utils/diaDaCarteira.ts'

const base: ResumoDoDia = {
  priceDate: '2026-10-30',
  asOf: '2026-10-30T20:05:00Z',
  carteiraPct: -0.62,
  diaValor: -428.98,
  bolsaPct: -0.82,
  alerta: null,
  outrasQuedas: [],
  maiorPeso: { nome: 'Itaú', fracao: 0.2 },
  rendaFixa: 40,
  acoesPct: -1.1,
  provento: false,
}
const sexta18h = new Date('2026-10-30T18:30:00-03:00')
const sabado = new Date('2026-10-31T10:00:00-03:00')

test('a sobrelinha diz de quando é o número, sempre com a data', () => {
  const quinta = { ...base, priceDate: '2026-10-29' }
  assert.equal(frasesDoDia(quinta, 'antes', new Date('2026-10-30T08:12:00-03:00'))!.sobrelinha, 'Antes da abertura · fechamento de quinta, 29/10')
  assert.equal(frasesDoDia(base, 'fechada', sexta18h)!.sobrelinha, 'Hoje, 30/10 · pregão encerrado')
  assert.equal(frasesDoDia(base, 'sem-pregao', sabado)!.sobrelinha, 'Fim de semana · fechamento de sexta, 30/10')
  // Finados (segunda, 02/11): sem pregão num dia de semana
  assert.equal(frasesDoDia(base, 'sem-pregao', new Date('2026-11-02T11:00:00-03:00'))!.sobrelinha, 'Sem pregão hoje · fechamento de sexta, 30/10')
  // ao vivo com dado fresco: verde e com a hora; dado velho: "Atualizado às"
  const vivo = frasesDoDia({ ...base, asOf: '2026-10-30T17:28:00Z' }, 'aberta', new Date('2026-10-30T14:32:00-03:00'))!
  assert.deepEqual([vivo.sobrelinha, vivo.sobrelinhaTom], ['Ao vivo · 14h28', 'verde'])
  assert.equal(frasesDoDia({ ...base, asOf: '2026-10-30T16:02:00Z' }, 'aberta', new Date('2026-10-30T14:32:00-03:00'))!.sobrelinha, 'Atualizado às 13h02')
  // o rótulo do dia na faixa: "Hoje" ou a data, nunca "último pregão"
  assert.equal(frasesDoDia(base, 'sem-pregao', sabado)!.diaRotulo, 'Sexta, 30/10')
  assert.equal(frasesDoDia(base, 'fechada', sexta18h)!.diaRotulo, 'Hoje')
})

test('com muita renda fixa, a frase diz a causa e compara só as ações', () => {
  const f = frasesDoDia({ ...base, priceDate: '2026-10-29' }, 'antes', new Date('2026-10-30T08:12:00-03:00'))!
  assert.equal(f.titulo, 'Tudo normal.')
  assert.equal(f.veredito, 'Caiu menos que a bolsa.')
  assert.equal(f.apoio, '40% da carteira está em renda fixa, que não anda com a bolsa; suas ações caíram 1,10%, mais que ela. Nenhum papel seu caiu 5% ou mais ontem.')
  assert.equal(f.esmaecido, true)
  // ao vivo, no presente
  const vivo = frasesDoDia({ ...base, asOf: '2026-10-30T17:30:00Z' }, 'aberta', new Date('2026-10-30T14:32:00-03:00'))!
  assert.equal(vivo.veredito, 'Até agora, cai menos que a bolsa.')
  assert.match(vivo.apoio!, /suas ações caem 1,10%, mais que ela\. Nenhum papel seu caiu 5% ou mais hoje\.$/)
  // pouca renda fixa: a causa não é a composição
  assert.equal(frasesDoDia({ ...base, rendaFixa: 13 }, 'fechada', sexta18h)!.apoio, 'Nenhum papel seu caiu 5% ou mais hoje.')
})

test('o papel que pesou no dia é a causa, com a parte certa', () => {
  assert.match(frasesDoDia({ ...base, maiorPeso: { nome: 'Vale', fracao: 0.6 } }, 'fechada', sexta18h)!.apoio!, /^Vale fez mais da metade da queda\./)
  assert.match(frasesDoDia({ ...base, rendaFixa: 10, maiorPeso: { nome: 'Itaú', fracao: 0.43 } }, 'fechada', sexta18h)!.apoio!, /^Itaú fez quase metade da queda\./)
  assert.match(frasesDoDia({ ...base, rendaFixa: 10, maiorPeso: { nome: 'Vale', fracao: 0.33 } }, 'fechada', sexta18h)!.apoio!, /^Vale fez um terço da queda\./)
  const alta = frasesDoDia({ ...base, carteiraPct: 0.24, diaValor: 160, maiorPeso: { nome: 'Taesa', fracao: 0.58 } }, 'fechada', sexta18h)!
  assert.equal(alta.veredito, 'Subiu com a bolsa em queda.')
  assert.equal(alta.apoio, 'Taesa fez mais da metade da alta. Nenhum papel seu caiu 5% ou mais hoje.')
})

test('"Tudo normal." só quando é verdade: dia de 3% ou mais vira o título', () => {
  const forte = frasesDoDia({ ...base, carteiraPct: -3.1, bolsaPct: -3.05, rendaFixa: 5, maiorPeso: { nome: 'Vale', fracao: 0.33 } }, 'fechada', sexta18h)!
  assert.equal(forte.titulo, 'Sua carteira caiu 3,10%.')
  assert.equal(forte.veredito, 'Caiu junto com a bolsa.')
  assert.equal(forte.apoio, 'Vale fez um terço da queda. Nenhum papel seu caiu 5% ou mais hoje.')
})

test('dia de alerta: o papel é o título e a carteira inteira vai no apoio', () => {
  const r = { ...base, alerta: { ticker: 'ITUB4', nome: 'Itaú', pct: -6.1, fracao: 0.5 } }
  const f = frasesDoDia(r, 'fechada', sexta18h)!
  assert.equal(f.titulo, 'Itaú caiu.')
  assert.equal(f.sobrelinhaTom, 'ambar')
  assert.equal(f.veredito, 'Caiu 6,10% hoje e fez metade da queda da carteira.')
  assert.equal(f.apoio, 'A carteira inteira caiu menos que a bolsa. Nenhum outro papel seu caiu 5% ou mais hoje.')
  const dois = frasesDoDia({ ...r, outrasQuedas: [{ nome: 'Vale', pct: -5.4, pequeno: false }] }, 'fechada', sexta18h)!
  assert.match(dois.apoio!, /Mais 1 papel seu caiu 5% ou mais hoje\.$/)
  assert.equal(frasesDoDia(r, 'aberta', new Date('2026-10-30T14:32:00-03:00'))!.titulo, 'Itaú caindo.')
})

test('o fecho não mente: papel pequeno que caiu 5% aparece', () => {
  const f = frasesDoDia({ ...base, rendaFixa: 10, outrasQuedas: [{ nome: 'OIBR3', pct: -7.2, pequeno: true }] }, 'fechada', sexta18h)!
  assert.equal(f.apoio, 'OIBR3 caiu 7,20%, mas pesa menos de 1% da carteira.')
})

test('as palavras contra a bolsa, nos quase iguais e nos estáveis', () => {
  assert.equal(contraABolsa(-0.78, -0.82, false), 'caiu junto com a bolsa')
  assert.equal(contraABolsa(-0.03, -0.82, false), 'ficou estável com a bolsa em queda')
  assert.equal(contraABolsa(0.9, 0.4, true), 'sobe mais que a bolsa')
  assert.equal(contraABolsa(-1.2, 0.5, false), 'caiu com a bolsa em alta')
  assert.equal(contraABolsa(-1.5, -0.8, false), 'caiu mais que a bolsa')
  // sem a bolsa, o veredito fica com o número
  assert.equal(frasesDoDia({ ...base, bolsaPct: null }, 'fechada', sexta18h)!.veredito, 'Caiu 0,62%.')
  // sem o dia da carteira, não há frase
  assert.equal(frasesDoDia({ ...base, carteiraPct: null }, 'fechada', sexta18h), null)
})

test('o anel: uma volta é 3%, o arco mínimo é 6° e a queda anda para trás', () => {
  assert.equal(fracaoDoAnel(-1.5), 0.5)
  assert.equal(fracaoDoAnel(-8), 1)
  assert.equal(fracaoDoAnel(0.01), 6 / 360)
  assert.equal(fracaoDoAnel(null), 0)
  assert.equal(Math.round(fracaoDoAnel(-0.62) * 360), 74)
  const fios = fiosDoAnel(-0.62, -0.82, 'nenhum hoje')
  assert.deepEqual(fios.map((f) => [f.chave, f.esquerda]), [['voce', true], ['bolsa', true], ['provento', false]])
  // empilhados com folga de 36 do mesmo lado
  assert.ok(fios[1]!.y - fios[0]!.y > 35.999)
  assert.equal(pctComSinal(-0.62), '−0,62%')
  assert.equal(pctComSinal(0.001), '0,00%')
})

test('o resumo do dia sai do /today, do /portfolio e do /income', () => {
  const r = montarResumoDoDia({
    today: {
      as_of: '2026-10-30T20:05:00Z',
      price_dates: { today: '2026-10-30' },
      totals: { value_d1: 69047.56, day_change_amount: -428.98, day_change_pct: -0.62 },
      positions: [
        { ticker: 'ITUB4', name: 'Itaú', asset_class: 'STOCK', value_now: 15120, day_change_amount: -183.6, day_change_pct: -1.2 },
        { ticker: 'VALE3', name: 'Vale', asset_class: 'STOCK', value_now: 10989, day_change_amount: -156, day_change_pct: -1.4 },
        { ticker: 'OIBR3', name: 'Oi', asset_class: 'STOCK', value_now: 300, day_change_amount: -23, day_change_pct: -7.1 },
        { ticker: 'HGLG11', name: 'CSHG Logística', asset_class: 'REIT', value_now: 11760, day_change_amount: -46, day_change_pct: -0.39 },
      ],
    },
    posicoes: [{ assetClass: 'STOCK', value: 26409 }, { assetClass: 'TREASURY', value: 27000 }, { assetClass: 'REIT', value: 11760 }],
    total: 65169,
    ibov: [{ t: '2026-10-29', v: 171650 }, { t: '2026-10-30', v: 170242 }],
    income: { months: [{ entries: [{ trade_date: '2026-10-30', amount: 82.5 }] }] },
  })
  assert.equal(Math.round(r.bolsaPct! * 100) / 100, -0.82)
  assert.equal(r.alerta, null) // a Oi caiu 7%, mas pesa menos de 1%
  assert.deepEqual(r.outrasQuedas, [{ nome: 'Oi', pct: -7.1, pequeno: true }])
  assert.equal(r.maiorPeso!.nome, 'Itaú')
  assert.equal(Math.round(r.rendaFixa!), 41)
  assert.equal(r.provento, true)
  assert.ok(r.acoesPct! < -1.3 && r.acoesPct! > -1.4)
})
