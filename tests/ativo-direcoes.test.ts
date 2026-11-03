/**
 * As contas das três direções do /asset (?ativo=1|2|3, 03/11/2026). Os números
 * são os do pregão de 03/11/2026 (PETR4, ITUB4), para o teste quebrar se a
 * conta virar.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  caminhosDoGrafico, cartoesCoerentes, extremosDaSerie, fraseDeAbertura, legendaDoGrafico, linhasCoerentes,
  lucroNaoFecha, marcasDePreco, numeroDoRotulo, pctDaLinhaDoDia, perguntasDoAtivo, secoesDoAtivo, vejaTambem,
} from '../app/utils/ativoDirecoes.ts'

const ITUB4 = [
  { l: 'Valor de Mercado', v: 'R$ 450,24B' }, { l: 'Dividend Yield', v: '8,01%' }, { l: 'P/L (TTM)', v: '9,56' },
  { l: 'ROE', v: '22,0%' }, { l: 'Receita (12M)', v: 'R$ 351,90B' }, { l: 'Lucro Líquido (12M)', v: 'R$ 87,49B' },
  { l: 'Margem Líquida', v: '24,9%' },
]
const PETR4 = [
  { l: 'Valor de Mercado', v: 'R$ 726,56B' }, { l: 'P/L (TTM)', v: '5,09' }, { l: 'Lucro Líquido (12M)', v: 'R$ 118,59B' },
]

test('rótulo vira número: B, M, T e decimal com vírgula', () => {
  assert.equal(numeroDoRotulo('R$ 450,24B'), 450.24e9)
  assert.equal(numeroDoRotulo('R$ 274,94M'), 274.94e6)
  assert.equal(numeroDoRotulo('R$ 27,41T'), 27.41e12)
  assert.equal(numeroDoRotulo('9,56'), 9.56)
  assert.equal(numeroDoRotulo(''), null)
})

test('banco: o lucro de receita × margem não fecha com valor de mercado ÷ P/L e sai', () => {
  // 87,49 contra 450,24 ÷ 9,56 = 47,1: 1,86x
  assert.equal(lucroNaoFecha(ITUB4), true)
  assert.equal(linhasCoerentes(ITUB4).some((r) => r.l.startsWith('Lucro')), false)
  assert.equal(linhasCoerentes(ITUB4).length, ITUB4.length - 1)
  const cartoes = [{ kind: 'metric' as const, label: 'Lucro Líquido (12M)', value: 'R$ 87,5B', tag: null }, { kind: 'metric' as const, label: 'ROE', value: '22,0%', tag: null }]
  assert.deepEqual(cartoesCoerentes(cartoes, ITUB4).map((c) => c.kind === 'metric' && c.label), ['ROE'])
})

test('não financeira: o lucro fecha (PETR4 118,59 contra 726,56 ÷ 5,09 = 142,7) e fica', () => {
  assert.equal(lucroNaoFecha(PETR4), false)
  assert.equal(linhasCoerentes(PETR4).length, 3)
  // sem P/L (FII, ETF) não há com o que conferir: nada sai
  assert.equal(lucroNaoFecha([{ l: 'Dividend Yield', v: '13,40%' }]), false)
})

test('legenda: o ativo e o IBOV no mesmo período', () => {
  const a = [{ t: '2025-11-03', v: 28.95 }, { t: '2026-11-03', v: 50.6 }]
  const i = [{ t: '2025-11-03', v: 150000 }, { t: '2026-11-03', v: 164895 }]
  assert.deepEqual(legendaDoGrafico('PETR4', a, i), [
    { rotulo: 'PETR4', pct: '+74,78%', dir: 'up' },
    { rotulo: 'IBOV', pct: '+9,93%', dir: null },
  ])
  assert.deepEqual(legendaDoGrafico('X', [a[0]!], []), [])
})

test('gráfico: o IBOV sai do mesmo ponto do ativo e as duas linhas cabem na caixa', () => {
  const a = [{ t: '2026-01-01', v: 10 }, { t: '2026-01-02', v: 12 }, { t: '2026-01-03', v: 11 }]
  const i = [{ t: '2026-01-01', v: 1000 }, { t: '2026-01-02', v: 900 }, { t: '2026-01-03', v: 1300 }]
  const c = caminhosDoGrafico(a, i, 100, 50)
  assert.ok(c.linha.startsWith('M0.0,'))
  assert.ok(c.ibov?.startsWith(`M0.0,${c.linha.slice(5, c.linha.indexOf('L'))}`), 'o IBOV parte do mesmo y')
  for (const n of [...c.linha.matchAll(/,(-?[\d.]+)/g), ...(c.ibov ?? '').matchAll(/,(-?[\d.]+)/g)].map((m) => Number(m[1]))) {
    assert.ok(n >= 0 && n <= 50, `y ${n} dentro da caixa`)
  }
  assert.deepEqual(c.fim, { x: 100, y: c.y(11) })
  assert.equal(caminhosDoGrafico([a[0]!], [], 100, 50).linha, '')
})

test('marcas de preço redondas dentro do domínio', () => {
  assert.deepEqual(marcasDePreco(27, 62), [30, 40, 50])
  assert.deepEqual(marcasDePreco(8, 10.2), [9, 10])
  assert.deepEqual(marcasDePreco(5, 5), [])
})

test('extremos da série com a data', () => {
  const e = extremosDaSerie([{ t: 'a', v: 3 }, { t: 'b', v: 1 }, { t: 'c', v: 5 }])
  assert.deepEqual(e, { min: { t: 'b', v: 1 }, max: { t: 'c', v: 5 } })
  assert.equal(extremosDaSerie([]), null)
})

test('a primeira frase não corta em "1,2 milhão" nem em "S.A."', () => {
  assert.equal(
    fraseDeAbertura('A Petróleo Brasileiro S.A., Petrobras, atua na exploração de petróleo. A companhia é controlada pela União.'),
    'A Petróleo Brasileiro S.A., Petrobras, atua na exploração de petróleo.',
  )
  assert.equal(fraseDeAbertura('O FII mais popular da bolsa, 1.2 milhão de cotistas. Paga todo mês.'), 'O FII mais popular da bolsa, 1.2 milhão de cotistas.')
  assert.equal(fraseDeAbertura(null), null)
})

test('as perguntas prontas: só a que tem dado, nunca conselho', () => {
  const q = perguntasDoAtivo({ ticker: 'PETR4', dir: 'down', variacaoDia: pctDaLinhaDoDia('-R$ 2,11 (4,00%) hoje'), variacao12m: '+74,78%', temProventos: true, temPares: true, kind: 'stock' })
  assert.deepEqual(q, ['Por que PETR4 caiu 4,00% hoje?', 'O que explica +74,78% de PETR4 em 12 meses?', 'De onde vêm os proventos de PETR4?'])
  for (const s of q) assert.doesNotMatch(s, /\b(compre|venda|comprar|vender|recomend)/i)
  assert.deepEqual(perguntasDoAtivo({ ticker: 'BOVA11', dir: 'up', variacaoDia: null, variacao12m: null, temProventos: false, temPares: false, kind: 'etf' }), ['O que há dentro do BOVA11?'])
})

test('índice das seções: só o que a página tem, na ordem dela', () => {
  const s = secoesDoAtivo({ cotacao: true, teses: false, numeros: true, fundo: false, etf: false, proventos: true, leitura: false, editorial: false, perguntas: true, noticias: true, cadeia: false, setor: true }, 'stock')
  assert.deepEqual(s.map((x) => x.id), ['cotacao', 'indicadores', 'dividendos', 'noticias', 'setor', 'perguntas'])
})

test('veja também: o link repetido sai, a âncora diferente para o mesmo destino fica', () => {
  const r = vejaTambem(
    [{ href: '/dividendos/PETR4', label: 'Dividendos de PETR4' }, { href: '/setor/energia', label: 'Setor energia' }],
    [{ href: '/setor/energia', label: 'Ranking do setor energia' }, { href: '/dividendos/PETR4', label: 'Dividendos de PETR4' }, { href: '/calculadora/preco-teto/PETR4', label: 'Preço teto de PETR4' }],
  )
  assert.deepEqual(r.map((x) => x.label), ['Dividendos de PETR4', 'Setor energia', 'Ranking do setor energia', 'Preço teto de PETR4'])
})
