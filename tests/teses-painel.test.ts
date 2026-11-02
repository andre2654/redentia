/**
 * O painel das teses (/teses, 02/11/2026): as contas que as direções novas
 * desenham. Os números dos casos são os de produção do pregão de 30/10/2026
 * (Ibovespa −0,75%) e da convicção de "A fibra virou alvo".
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { diaDaCesta, distancia, fraseDaMudanca, mudancasDaConviccao, naAgua, pctDoDia, serieCompacta, ultimaMudanca, type PainelDasTeses } from '../app/utils/tesesPainel.ts'

test('o dia da cesta é a média dos papéis cotados no pregão do índice', () => {
  const cot = {
    TIMS3: { ticker: 'TIMS3', pct: -1.34, data: '2026-10-30' },
    VIVT3: { ticker: 'VIVT3', pct: 0.5, data: '2026-10-30' },
    DESK3: { ticker: 'DESK3', pct: 1.2, data: '2026-10-30' },
    FIQE3: { ticker: 'FIQE3', pct: 0.16, data: '2026-10-30' },
  }
  assert.deepEqual(diaDaCesta(['TIMS3', 'VIVT3', 'DESK3', 'FIQE3'], cot, '2026-10-30'), { pct: 0.13, papeis: 4, total: 4 })
})

test('papel com cotação de outro pregão fica de fora; com menos da metade a tese não tem dia', () => {
  const cot = {
    A: { ticker: 'A', pct: 2, data: '2026-10-30' },
    B: { ticker: 'B', pct: 4, data: '2026-10-29' }, // parado: não entra
    C: { ticker: 'C', pct: null, data: '2026-10-30' },
  }
  assert.equal(diaDaCesta(['A', 'B', 'C'], cot, '2026-10-30'), null) // 1 de 3
  assert.deepEqual(diaDaCesta(['A', 'B'], cot, '2026-10-30'), { pct: 2, papeis: 1, total: 2 }) // 1 de 2 é a metade
  assert.equal(diaDaCesta(['A'], cot, null), null) // sem o pregão do índice, não há referência
})

test('a última mudança da convicção é a data do primeiro dia no valor atual', () => {
  const s = [
    { d: '2026-10-20', v: 90 }, { d: '2026-10-21', v: 92 }, { d: '2026-10-22', v: 92 },
    { d: '2026-11-01', v: 93 }, { d: '2026-10-31', v: 92 }, // fora de ordem de propósito
  ]
  assert.deepEqual(ultimaMudanca(s), { data: '2026-11-01', de: 92, para: 93 })
  assert.equal(fraseDaMudanca(ultimaMudanca(s)), 'subiu de 92 em 1º nov')
  assert.equal(fraseDaMudanca({ data: '2026-10-28', de: 90, para: 88 }), 'caiu de 90 em 28 out')
  assert.equal(ultimaMudanca([{ d: '2026-10-01', v: 80 }, { d: '2026-10-02', v: 80 }]), null)
  assert.equal(mudancasDaConviccao([{ d: 'a', v: 1 }, { d: 'b', v: 2 }, { d: 'c', v: 2 }, { d: 'd', v: 1 }]), 2)
})

test('a série compacta guarda os últimos dias e descarta ponto inválido', () => {
  const crua = Array.from({ length: 130 }, (_, i) => ({ date: `2026-${String(7 + Math.floor(i / 30)).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}T00:00:00`, conviction: 80 + (i % 3) }))
  const s = serieCompacta([...crua, { date: '2026-12-01', conviction: Number.NaN }])!
  assert.equal(s.length, 120)
  assert.equal(s[0]!.d.length, 10)
  assert.equal(serieCompacta([{ date: '2026-10-01', conviction: 80 }]), null)
})

test('na água: a distância até o índice, da que mais boiou à que mais afundou; sem dia não entra', () => {
  const painel: PainelDasTeses = {
    ibov: { pct: -0.75, data: '2026-10-30' },
    teses: {
      fibra: { conviccao: null, cesta: null, dia: { pct: 0.13, papeis: 4, total: 4 } },
      bancos: { conviccao: null, cesta: null, dia: { pct: -2.22, papeis: 4, total: 4 } },
      fabrica: { conviccao: null, cesta: null, dia: { pct: 1.12, papeis: 5, total: 5 } },
      sem: { conviccao: null, cesta: null, dia: null },
    },
  }
  const l = naAgua([{ slug: 'fibra' }, { slug: 'bancos' }, { slug: 'fabrica' }, { slug: 'sem' }, { slug: 'fora' }], painel)
  assert.deepEqual(l.map((t) => [t.slug, t.gap]), [['fabrica', 1.87], ['fibra', 0.88], ['bancos', -1.47]])
  assert.deepEqual(naAgua([{ slug: 'fibra' }], { ...painel, ibov: null }), [])
})

test('as palavras: sinal de menos tipográfico e pontos percentuais', () => {
  assert.equal(pctDoDia(-0.75), '−0,75%')
  assert.equal(pctDoDia(1.124), '+1,12%')
  assert.equal(distancia(1.87), '+1,87 p.p.')
  assert.equal(distancia(-1.47), '−1,47 p.p.')
  assert.equal(distancia(0.001), 'na linha')
})
