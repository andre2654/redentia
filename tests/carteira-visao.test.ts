/**
 * A /carteira nova (06/11/2026): as regras que o backend vai garantir no
 * GET /me/carteira/visao, conferidas no mock de cada cenário, e as contas
 * pequenas da tela (utils/carteiraVisao.ts).
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { CENARIOS, visaoMock } from '../app/dev/carteiraVisaoMock.ts'
import { brlCurto, cobertura, confereComOTopo, gruposDeAvisos, pctTxt, quandoAtualizou, tituloDosAvisos } from '../app/utils/carteiraVisao.ts'

for (const { id } of CENARIOS) {
  test(`mock ${id}: as posições somam o patrimônio e os fatores somam 100%`, () => {
    const v = visaoMock(id)
    assert.ok(confereComOTopo(v))
    const soma = v.fatores.reduce((s, f) => s + f.pct, 0)
    assert.ok(Math.abs(soma - 100) < 0.01, `fatores somam ${soma}`)
    for (const p of v.posicoes) assert.ok(v.fatores.some((f) => f.tickers.includes(p.ticker)), `${p.ticker} sem fator`)
  })

  test(`mock ${id}: nenhum aviso sem prova, e o urgente existe`, () => {
    const v = visaoMock(id)
    for (const a of v.avisos.itens) {
      assert.ok(a.prova.length > 0, `${a.id} sem prova`)
      assert.ok(a.fonte, `${a.id} sem fonte`)
      if (a.confianca !== 'certeza') assert.ok(a.ressalva, `${a.id} incerto sem ressalva`)
    }
    if (v.avisos.urgente) assert.ok(v.avisos.itens.some((a) => a.id === v.avisos.urgente))
  })

  test(`mock ${id}: nenhuma frase manda comprar ou vender`, () => {
    const v = visaoMock(id)
    const textos = [...v.avisos.itens.flatMap((a) => [a.titulo, a.texto, ...a.acoes.map((x) => x.rotulo)]), ...v.renda.caminhos.map((c) => c.nome)]
    for (const t of textos) assert.doesNotMatch(t, /\b(compre|venda já|vender agora|recomendamos)\b/i, t)
  })
}

test('conexão parada: só o aviso de conexão sai, o resto espera', () => {
  const v = visaoMock('velho')
  assert.equal(v.avisos.itens.length, 1)
  assert.equal(v.avisos.itens[0]!.detector, 'conexao.velha')
  assert.ok(v.avisos.retidos > 0)
  assert.equal(v.dadosDe, '16/07')
  assert.equal(v.avisos.descartados.length, 0)
})

test('sem cartão: a cobertura da vida é null, nunca zero', () => {
  assert.equal(cobertura(visaoMock('semgasto').renda), null)
  const c = cobertura(visaoMock('normal').renda)!
  assert.ok(c > 9 && c < 11, `cobertura ${c}`)
})

test('caminhos: 61 pontos e p10 ≤ mediana ≤ p90', () => {
  for (const c of visaoMock('normal').renda.caminhos) {
    assert.equal(c.mediana.length, 61)
    c.mediana.forEach((m, i) => assert.ok(c.p10[i]! <= m && m <= c.p90[i]!, `${c.id}[${i}]`))
  }
})

test('grupos e título do modal', () => {
  const v = visaoMock('normal')
  const g = gruposDeAvisos(v.avisos, new Set())
  assert.equal(g.atencao.length, 2)
  assert.equal(g.atencao[0]!.gravidade, 'alta')
  assert.equal(tituloDosAvisos(2, 3), '2 coisas pedem a sua atenção.')
  assert.equal(tituloDosAvisos(1, 0), 'Uma coisa pede a sua atenção.')
  assert.equal(tituloDosAvisos(0, 1), 'Tudo normal. Uma coisa boa de saber.')
  assert.equal(tituloDosAvisos(0, 0), 'Tudo normal. Sigo de olho.')
  const r = gruposDeAvisos(v.avisos, new Set([g.atencao[0]!.id]))
  assert.equal(r.atencao.length, 1)
  assert.equal(r.resolvidos.length, 1)
})

test('números e datas em pt-BR', () => {
  assert.equal(pctTxt(37.28), '37%')
  assert.equal(pctTxt(6.02), '6%')
  assert.equal(pctTxt(4.51), '4,5%')
  assert.equal(pctTxt(0.4), 'menos de 1%')
  assert.equal(brlCurto(203544), 'R$ 204 mil')
  assert.equal(brlCurto(9800), 'R$ 9.800')
  const agora = new Date(2026, 10, 6, 15, 0)
  assert.equal(quandoAtualizou(new Date(2026, 10, 6, 9, 12).toISOString(), agora), 'hoje, 9h12')
  assert.equal(quandoAtualizou(new Date(2026, 10, 5, 18, 40).toISOString(), agora), 'ontem, 18h40')
  assert.equal(quandoAtualizou(new Date(2026, 6, 16, 8, 2).toISOString(), agora), '16/07')
})
