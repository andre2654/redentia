/**
 * A queda falsa de 05/11/2026: o /portfolio/today devolveu FLRY3 com −20,28%
 * no dia enquanto a Fleury subia 0,43%. A cotação de hoje não tinha chegado e
 * a resposta avisava em `flags: ["pending_today_FLRY3"]`. O topo da /carteira
 * (buildAgora do useCarteira, via variacaoConfiavel) e o da home
 * (montarResumoDoDia) não podem transformar isso em "FLRY3 caindo.".
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cotacaoPendente, fraseDaCarteira, variacaoConfiavel } from '../app/utils/carteira-agora.ts'
import { montarResumoDoDia, type HojeDaApi } from '../app/utils/diaDaCarteira.ts'

const pos = (ticker: string, pct: number | null, valor: number, flags?: string[]) => ({
  ticker, name: ticker, asset_class: 'STOCK', value_now: valor,
  day_change_amount: pct == null ? null : (valor * pct) / (100 + pct), day_change_pct: pct, flags,
})

test('cotacaoPendente: reconhece o flag no topo e na posição, sem confundir tickers', () => {
  assert.equal(cotacaoPendente('FLRY3', ['pending_today_FLRY3']), true)
  assert.equal(cotacaoPendente('flry3', ['PENDING_TODAY_FLRY3']), true)
  assert.equal(cotacaoPendente('FLRY3', [], ['pending_today_FLRY3']), true)
  assert.equal(cotacaoPendente('FLRY3', ['pending_today_FLRY11']), false)
  assert.equal(cotacaoPendente('ITUB4', ['pending_today_FLRY3']), false)
  assert.equal(cotacaoPendente('FLRY3', null, null), false)
})

test('variacaoConfiavel: null quando a variação não veio ou a cotação está pendente', () => {
  assert.equal(variacaoConfiavel({ ticker: 'FLRY3', day_change_pct: -20.28 }, ['pending_today_FLRY3']), null)
  assert.equal(variacaoConfiavel({ ticker: 'FLRY3', day_change_pct: -20.28, flags: ['pending_today_FLRY3'] }), null)
  assert.equal(variacaoConfiavel({ ticker: 'FLRY3', day_change_pct: null }), null)
  assert.equal(variacaoConfiavel({ ticker: 'FLRY3', day_change_pct: Number.NaN }), null)
  assert.equal(variacaoConfiavel({ ticker: 'ITUB4', day_change_pct: -6.1 }, ['pending_today_FLRY3']), -6.1)
})

test('a frase do topo da /carteira: com a guarda, FLRY3 pendente fica "Tudo normal."', () => {
  // o mesmo laço do alerta em buildAgora (useCarteira), sobre a resposta de 05/11
  const flags = ['pending_today_FLRY3']
  const posicoes = [pos('FLRY3', -20.28, 2500), pos('VALE3', 0.4, 9000)]
  let alerta: { nome: string; pct: number } | null = null
  for (const p of posicoes) {
    const pct = variacaoConfiavel(p, flags)
    if (pct == null) continue
    if (pct <= -5 && (!alerta || pct < alerta.pct)) alerta = { nome: p.ticker, pct }
  }
  assert.equal(alerta, null)
  const f = fraseDaCarteira({ pregao: 'aberta', quando: 'hoje', carteiraPct: 0.2, bolsaPct: 0.5, alerta })
  assert.equal(f.titulo, 'Tudo normal.')
  assert.equal(f.tom, 'normal')
})

test('montarResumoDoDia (home): papel pendente não vira alerta, nem queda, nem maior peso', () => {
  const today: HojeDaApi = {
    price_dates: { today: '2026-11-05' },
    totals: { value_d1: 20000, day_change_amount: -500, day_change_pct: -2.5 },
    positions: [pos('FLRY3', -20.28, 2500), pos('MXRF11', -7, 50), pos('VALE3', 0.4, 9000)],
    flags: ['pending_today_FLRY3'],
  }
  const r = montarResumoDoDia({ today, posicoes: [], total: 20000, ibov: null, income: null })
  assert.equal(r.alerta, null)
  assert.deepEqual(r.outrasQuedas.map((q) => q.nome), ['MXRF11'])
  assert.notEqual(r.maiorPeso?.nome, 'FLRY3')
})

test('montarResumoDoDia (home): a queda de verdade continua pedindo atenção', () => {
  const today: HojeDaApi = {
    price_dates: { today: '2026-11-05' },
    totals: { value_d1: 20000, day_change_amount: -500, day_change_pct: -2.5 },
    positions: [pos('FLRY3', -6.2, 2500), pos('ITUB4', -20.28, 3000, ['pending_today_ITUB4']), pos('VALE3', 0.4, 9000)],
    flags: [],
  }
  const r = montarResumoDoDia({ today, posicoes: [], total: 20000, ibov: null, income: null })
  assert.equal(r.alerta?.ticker, 'FLRY3')
  assert.equal(r.alerta?.pct, -6.2)
  assert.deepEqual(r.outrasQuedas, [])
})

test('montarResumoDoDia (home): com o total do dia null (nada com o preço de hoje), sem número do dia', () => {
  // api fix/dia-pendente (N13): quando nenhuma posição tem o preço de hoje, o
  // total do dia vem null, e a tela não pode virar "+R$ 0,00 (0,00%) hoje"
  const today: HojeDaApi = {
    price_dates: { today: '2026-11-09' },
    totals: { value_d1: 20000, day_change_amount: null, day_change_pct: null },
    positions: [pos('FLRY3', null, 2500), pos('VALE3', null, 9000)],
    flags: ['pending_today_FLRY3', 'pending_today_VALE3'],
  }
  const r = montarResumoDoDia({ today, posicoes: [], total: 20000, ibov: null, income: null })
  assert.equal(r.carteiraPct, null)
  assert.equal(r.diaValor, null)
  assert.equal(r.alerta, null)
})
