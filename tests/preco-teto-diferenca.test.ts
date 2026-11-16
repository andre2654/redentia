/**
 * A calculadora de preço teto descreve a conta com um percentual assinado.
 * Sem selo "Abaixo da régua" / "Na régua" / "Acima da régua" e sem verde ou
 * vermelho nessa comparação. A matemática dos métodos não entra aqui.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { metrics } from '../app/utils/preco-teto.ts'
import { montarPrecoTeto } from '../app/utils/preco-teto-pagina.ts'
import { RANKING_COLUMNS } from '../app/utils/rankings.ts'
import {
  diferencaSobreTeto,
  formatarDiferencaPct,
  linhaDiferencaPrecoTeto,
} from '../app/utils/preco-teto-diferenca.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('X é (cotação − preço teto) ÷ preço teto, em pt-BR, com 1 casa e sinal', () => {
  assert.equal(diferencaSobreTeto(28, 35), (28 - 35) / 35)
  assert.equal(diferencaSobreTeto(40, 32), (40 - 32) / 32)
  assert.equal(diferencaSobreTeto(0, 10), null)
  assert.equal(diferencaSobreTeto(10, 0), null)
  const pelaConta = metrics(35, 28)
  assert.ok(Math.abs((pelaConta.ratio - 1) - diferencaSobreTeto(28, 35)!) < 1e-12)

  assert.equal(formatarDiferencaPct(-0.2), '-20,0%')
  assert.equal(formatarDiferencaPct(0.25), '+25,0%')
  assert.equal(formatarDiferencaPct(0), '0,0%')
  assert.equal(
    linhaDiferencaPrecoTeto(28, 35),
    'Diferença entre a cotação informada e o preço teto calculado: -20,0%.',
  )
  assert.equal(
    linhaDiferencaPrecoTeto(40, 32),
    'Diferença entre a cotação informada e o preço teto calculado: +25,0%.',
  )
  assert.equal(
    linhaDiferencaPrecoTeto(10, 10),
    'Diferença entre a cotação informada e o preço teto calculado: 0,0%.',
  )
})

test('o hub não tem os selos da régua e a linha neutra entra no resultado', () => {
  const pagina = ler('app/pages/calculadora/preco-teto/index.vue')
  assert.match(pagina, /title: 'Calculadora de Preço Teto 2026 - Grátis'/)
  assert.match(pagina, /A conta mostra a distância até a régua de cada método/)
  for (const selo of ['Abaixo da régua', 'Na régua', 'Acima da régua', 'getStatusText', 'getMethodStatus', 'pt__method--positive', 'pt__method--negative', 'pt__result-box--positive', 'pt__result-main--positive']) {
    assert.equal(pagina.includes(selo), false, selo)
  }
  assert.match(pagina, /class="pt__diff"/)
  assert.match(pagina, /\{\{ linhaConsenso \}\}/)
  assert.match(pagina, /\{\{ m\.diferenca \}\}/)
  assert.equal(
    linhaDiferencaPrecoTeto(28, 31.89),
    'Diferença entre a cotação informada e o preço teto calculado: -12,2%.',
  )
  assert.equal(
    linhaDiferencaPrecoTeto(38, 65.8),
    'Diferença entre a cotação informada e o preço teto calculado: -42,2%.',
  )
  assert.match(pagina, /linhaDiferencaPrecoTeto\(28, 31\.89\)/)
  assert.match(pagina, /linhaDiferencaPrecoTeto\(38, 65\.8\)/)
  assert.match(pagina, /color: var\(--nu-ink\)/)
  const metodo = ler('app/components/calc/CalcPrecoTetoMetodo.vue')
  assert.match(metodo, /linhaDiferencaPrecoTeto\(price\.value, resultado\.value\.fairPrice\)/)
  assert.match(metodo, /class="ptm__diff"/)
  assert.equal(metodo.includes('Abaixo da régua'), false)
  assert.equal(metodo.includes('Na régua'), false)
  assert.equal(metodo.includes('Acima da régua'), false)
})

test('a página do ticker usa a mesma linha e o upside do ranking não pinta verde ou vermelho', () => {
  const view = montarPrecoTeto({
    ticker: 'PETR4',
    nomeBruto: 'PETROBRAS   PN      N2',
    tipo: 'STOCK',
    preco: 38,
    priceDate: '2026-10-23',
    setorBruto: 'Energy',
    lpa: 8,
    vpa: 35,
    dividendo: 5,
    dividendoFonte: 'soma',
    dyPct: 13.16,
    sectorPL: 6,
    sectorPLFonte: 'setor',
    temPaginaDividendos: true,
  })
  assert.ok(view)
  assert.match(view.paragrafo, /Diferença entre a cotação informada e o preço teto calculado: -42,3%\./)
  assert.equal(view.paragrafo.includes('abaixo desse consenso'), false)
  assert.equal(view.paragrafo.includes('acima desse consenso'), false)
  const consenso = view.passos.find((p) => p.titulo === 'Consenso')
  assert.match(consenso?.linhas.join('\n') ?? '', /Diferença entre a cotação informada e o preço teto calculado: -42,3%\./)

  assert.equal(RANKING_COLUMNS.upsidePct.semCor, true)
  assert.equal(RANKING_COLUMNS.upsidePct.signed, true)
  assert.equal(RANKING_COLUMNS.change.signed, true)
  assert.equal(RANKING_COLUMNS.change.semCor, undefined)
  const tabela = ler('app/components/ranking/RankTable.vue')
  assert.match(tabela, /if \(!def\.signed \|\| def\.semCor\) return null/)
  const lider = ler('app/components/ranking/RankLeader.vue')
  assert.match(lider, /if \(!col\.value\.signed \|\| col\.value\.semCor\) return ''/)
  assert.match(lider, /rkl__value--up/)
  assert.match(lider, /rkl__value--down/)
})
