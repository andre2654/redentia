/**
 * A /carteira nova (06/11/2026): as regras que o backend vai garantir no
 * GET /me/carteira/visao, conferidas no mock de cada cenário, e as contas
 * pequenas da tela (utils/carteiraVisao.ts).
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { CENARIOS, relatorioMock, visaoMock } from '../app/dev/carteiraVisaoMock.ts'
import { brlCurto, cobertura, confereComOTopo, gruposDeAvisos, pctTxt, quandoAtualizou, tituloDosAvisos } from '../app/utils/carteiraVisao.ts'
import { mesesEmOrdem } from '../app/utils/impostoVisao.ts'
import { mediana } from '../app/utils/relatorioCarteira.ts'
import type { MesImposto } from '../app/types/carteiraVisao.ts'

const GRUPOS = new Set(['acoes', 'fii', 'etf', 'rf', 'cripto'])
/** '2026-11' → '2026-10' */
const mesAntes = (mes: string) => {
  const [a, m] = mes.split('-').map(Number) as [number, number]
  return m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`
}
/** as regras do contrato ImpostoVisao, num mês */
function confereMes(m: MesImposto) {
  const vistos = new Set<string>()
  for (const g of m.grupos) {
    assert.ok(GRUPOS.has(g.grupo), `grupo ${g.grupo}`)
    assert.ok(!vistos.has(g.grupo), `${g.grupo} repetido`)
    vistos.add(g.grupo)
    assert.ok(g.vendido >= 0, `${m.mes} ${g.grupo}: vendido negativo`)
    if (g.isencao != null) {
      assert.equal(g.cabeAinda, Math.max(0, g.isencao - g.vendido), `${m.mes} ${g.grupo}: cabeAinda = isenção − vendido`)
      assert.ok(g.cabeAinda! >= 0)
      if (g.vendido <= g.isencao) assert.ok(!g.impostoEstimado, `${m.mes} ${g.grupo}: imposto dentro da isenção`)
    } else assert.equal(g.cabeAinda, null, `${m.mes} ${g.grupo}: cabeAinda sem isenção`)
    if (!g.custoConhecido) {
      assert.equal(g.lucro, null)
      assert.equal(g.impostoEstimado, null)
    }
    if (g.vendido === 0) assert.ok(!g.lucro && !g.impostoEstimado, `${m.mes} ${g.grupo}: lucro sem venda`)
    assert.ok(g.aliquota >= 0 && g.aliquota < 1)
    assert.ok(g.nota, `${m.mes} ${g.grupo} sem nota`)
  }
  // o DARF é a soma do imposto estimado (a renda fixa é retida na fonte, fora dele)
  const soma = m.grupos.filter((g) => g.grupo !== 'rf').reduce((s, g) => s + (g.impostoEstimado ?? 0), 0)
  if (soma > 0) {
    assert.ok(Math.abs((m.darf.valor ?? 0) - soma) < 0.01, `${m.mes}: DARF ${m.darf.valor} ≠ ${soma}`)
    assert.match(m.darf.vence ?? '', /^\d{4}-\d{2}-\d{2}$/)
  } else {
    assert.equal(m.darf.valor, null)
    assert.equal(m.darf.vence, null)
  }
  assert.equal(m.darf.codigo, '6015')
}

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

  test(`mock ${id}: o imposto segue o contrato (grupos coerentes, cabeAinda, DARF, 12 meses com selo)`, () => {
    const { imposto } = visaoMock(id)
    confereMes(imposto.mesAtual)
    confereMes(imposto.mesAnterior)
    assert.equal(imposto.mesAnterior.mes, mesAntes(imposto.mesAtual.mes))
    const meses = mesesEmOrdem(imposto.historico)
    assert.equal(meses.length, 12)
    assert.equal(meses[11]!.mes, imposto.mesAtual.mes)
    meses.forEach((m, i) => {
      if (i) assert.equal(mesAntes(m.mes), meses[i - 1]!.mes, `${m.mes} fora da ordem`)
      const vendas = m.operacoes.filter((o) => o.lado === 'venda').reduce((s, o) => s + o.valor, 0)
      assert.ok(Math.abs(vendas - m.vendas) < 0.01, `${m.mes}: vendas ${m.vendas} ≠ ${vendas}`)
      assert.equal(m.selo === 'sem_venda', m.vendas === 0, `${m.mes}: selo ${m.selo}`)
      for (const o of m.operacoes) {
        assert.ok(o.data.startsWith(m.mes), `${o.ticker} de ${o.data} em ${m.mes}`)
        assert.ok(GRUPOS.has(o.grupo))
      }
    })
    const vendidoNoMes = imposto.mesAtual.grupos.reduce((s, g) => s + g.vendido, 0)
    assert.ok(Math.abs(vendidoNoMes - meses[11]!.vendas) < 0.01, 'o mês atual bate com o histórico')
  })

  test(`mock ${id}: todo aviso diz a pergunta que responde e sai na tela`, () => {
    for (const a of visaoMock(id).avisos.itens) {
      assert.ok(a.pergunta?.endsWith('?'), `${a.id} sem pergunta`)
      assert.ok(a.canais.includes('tela'), `${a.id} fora da tela`)
    }
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

test('imposto do normal: R$ 18,7 mil em ações em novembro, R$ 1,3 mil da isenção, DARF do FII em 30/12, outubro isento', () => {
  const { imposto } = visaoMock('normal')
  const acoes = imposto.mesAtual.grupos.find((g) => g.grupo === 'acoes')!
  assert.equal(imposto.mesAtual.mes, '2026-11')
  assert.equal(acoes.vendido, 18700)
  assert.equal(acoes.cabeAinda, 1300)
  // o DARF de novembro vence no último dia útil de dezembro: 31/12 não tem expediente
  assert.deepEqual(imposto.mesAtual.darf, { valor: 82.4, vence: '2026-12-30', codigo: '6015' })
  assert.equal(imposto.historico.find((m) => m.mes === '2026-10')!.selo, 'isento')
  assert.ok(imposto.historico.some((m) => m.selo === 'custo_desconhecido'))
  assert.ok(imposto.historico.some((m) => m.selo === 'pago'))
})

test('imposto dos outros cenários: nenhuma venda no mês, e o aviso da isenção some', () => {
  for (const { id } of CENARIOS.filter((c) => c.id !== 'normal')) {
    const v = visaoMock(id)
    assert.ok(v.imposto.mesAtual.grupos.every((g) => g.vendido === 0), id)
    assert.ok(!v.avisos.itens.some((a) => a.detector === 'imposto.isencao'), id)
  }
})

test('relatório do mock: o pilar é a mediana dos indicadores dele, e a nota é a mediana dos pilares', () => {
  const r = relatorioMock()
  const chaves = r.indicadores.map((i) => i.chave)
  assert.equal(new Set(chaves).size, chaves.length, 'indicador repetido')
  for (const k of ['twr', 'mwr', 'cagr', 'retorno_real', 'volatilidade', 'downside_deviation', 'max_drawdown', 'beta', 'r2', 'sharpe', 'sortino', 'treynor', 'alpha_jensen', 'm2', 'information_ratio', 'tracking_error', 'appraisal_ratio'])
    assert.ok(chaves.includes(k), `falta ${k}`)
  assert.deepEqual(r.pilares.map((p) => p.chave), ['retorno', 'risco', 'eficiencia', 'diversificacao'])
  for (const p of r.pilares) {
    const notas = r.indicadores.filter((i) => i.pilar === p.chave).map((i) => i.nota)
    assert.ok(notas.length, `${p.chave} sem indicador`)
    assert.equal(p.nota, Math.round(mediana(notas)!), `pilar ${p.chave}`)
  }
  assert.equal(r.nota, Math.round(mediana(r.pilares.map((p) => p.nota))!))
  for (const i of r.indicadores) assert.ok(i.nota == null || (i.nota >= 0 && i.nota <= 100), i.chave)
  assert.ok(Math.abs(r.benchmark.composicao.reduce((s, c) => s + c.peso, 0) - 100) < 0.5, 'o benchmark soma 100%')
  assert.equal(r.periodo.historicoCurto, false)
})
