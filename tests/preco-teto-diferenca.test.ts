/**
 * A página de método descreve a conta com o percentual assinado do PR 162.
 * O hub volta a pintar Abaixo / Na / Acima da régua. A matemática dos métodos
 * não entra aqui. O ticker do PR 163 fica com a média "abaixo dessa média".
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

  const como162 = (v: number) => `${(v * 100).toFixed(1).replace('.', ',')}%`
  assert.equal(formatarDiferencaPct(-0.2), '-20,0%')
  assert.equal(formatarDiferencaPct(0.25), '25,0%')
  assert.equal(formatarDiferencaPct(0), '0,0%')
  const pelaLinha = metrics(30, 28)
  assert.equal(
    linhaDiferencaPrecoTeto(28, 30),
    `Diferença entre a cotação informada e o preço teto calculado: ${como162(pelaLinha.ratio - 1)}.`,
  )
  assert.equal(
    linhaDiferencaPrecoTeto(28, 35),
    'Diferença entre a cotação informada e o preço teto calculado: -20,0%.',
  )
  assert.equal(
    linhaDiferencaPrecoTeto(40, 32),
    'Diferença entre a cotação informada e o preço teto calculado: 25,0%.',
  )
  assert.equal(
    linhaDiferencaPrecoTeto(10, 10),
    'Diferença entre a cotação informada e o preço teto calculado: 0,0%.',
  )
})

test('o hub pinta os selos da régua e o título indexável fica', () => {
  const pagina = ler('app/pages/calculadora/preco-teto/index.vue')
  assert.match(pagina, /title: 'Calculadora de Preço Teto 2026 - Grátis'/)
  assert.match(pagina, /A conta mostra a distância até a régua de cada método/)
  assert.equal(pagina.includes('robots'), false)
  assert.match(pagina, /if \(ratio <= 0\.8\) return 'Abaixo da régua'/)
  assert.match(pagina, /if \(ratio <= 1\.0\) return 'Na régua'/)
  assert.match(pagina, /return 'Acima da régua'/)
  assert.match(pagina, /pt__method--positive/)
  assert.match(pagina, /pt__method--neutral/)
  assert.match(pagina, /pt__method--negative/)
  assert.match(pagina, /pt__method--positive \.pt__method-badge \{ background: var\(--nu-green-bg\)/)
  assert.match(pagina, /pt__method--negative \.pt__method-badge \{ background: var\(--nu-red-bg\)/)
  assert.match(pagina, /:selo="`Posição em relação ao teto: \$\{results\.consensus\.recommendation\}`"/)
  assert.match(pagina, /está 12% abaixo do teto médio/)
  assert.match(pagina, /pt__result-box--positive/)
  assert.equal(pagina.includes('linhaDiferencaPrecoTeto'), false)
  assert.equal(pagina.includes('class="pt__diff"'), false)
  const metodo = ler('app/components/calc/CalcPrecoTetoMetodo.vue')
  assert.match(metodo, /linhaDiferencaPrecoTeto\(price\.value, resultado\.value\.fairPrice\)/)
  assert.match(metodo, /rotulo: 'Diferença'/)
  assert.match(metodo, /:explica="posicao\?\.texto"/)
  assert.equal(metodo.includes('class="ptm__diff"'), false)
  assert.equal(metodo.includes('Abaixo da régua'), false)
})

test('a página do ticker fica com a média do PR 163 e o upside do ranking pinta', () => {
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
  assert.match(view.paragrafo, /A cotação está 42,3% abaixo da média, o que deixa a ação barata e subvalorizada em relação a esse preço teto\./)
  assert.match(view.paragrafo, /Estimativa educacional, não é recomendação/)
  assert.equal(/perto do preço teto|Abaixo da régua|Na régua|Acima da régua/.test(view.paragrafo + view.passos.map((p) => p.linhas.join(' ')).join(' ')), false)
  const media = view.passos.find((p) => p.titulo === 'Média dos métodos')
  assert.match(media?.linhas.join('\n') ?? '', /A cotação está 42,3% abaixo da média/)

  assert.equal(RANKING_COLUMNS.upsidePct.signed, true)
  assert.equal('semCor' in RANKING_COLUMNS.upsidePct, false)
  assert.equal(RANKING_COLUMNS.change.signed, true)
  const tabela = ler('app/components/ranking/RankTable.vue')
  assert.match(tabela, /if \(!def\.signed\) return null/)
  assert.equal(tabela.includes('semCor'), false)
  const lider = ler('app/components/ranking/RankLeader.vue')
  assert.match(lider, /if \(!col\.value\.signed\) return ''/)
  assert.match(lider, /rkl__value--up/)
  assert.match(lider, /rkl__value--down/)
})

test('XPML11 e PRIO3 medem a distância sobre a média, e acima da média não chama de barata', () => {
  const entradas = JSON.parse(ler('tests/fixtures/preco-teto-indexaveis.json')) as Array<Parameters<typeof montarPrecoTeto>[0]>
  const pct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const distancia = (preco: number, media: number) => pct.format(Math.abs((preco - media) / media * 100))

  const xpml = montarPrecoTeto(entradas.find((e) => e.ticker === 'XPML11')!)
  const prio = montarPrecoTeto(entradas.find((e) => e.ticker === 'PRIO3')!)
  assert.ok(xpml && prio)
  assert.equal(distancia(89.52, 162.25), '44,8')
  assert.equal(distancia(64.49, 70.23), '8,2')
  assert.equal(distancia(xpml.preco, xpml.consenso), '44,8')
  assert.equal(distancia(prio.preco, prio.consenso), '8,2')
  assert.equal(diferencaSobreTeto(xpml.preco, xpml.consenso), (xpml.preco - xpml.consenso) / xpml.consenso)
  for (const [view, p] of [[xpml, '44,8'], [prio, '8,2']] as const) {
    assert.match(view.paragrafo, new RegExp(`A cotação está ${p}% abaixo da média, o que deixa a (ação|cota) barata e subvalorizada em relação a esse preço teto\\.`))
    assert.match(view.description, new RegExp(`${p}% abaixo da média`))
    assert.match(view.passos.find((passo) => passo.titulo === 'Média dos métodos')?.linhas.join(' ') ?? '', new RegExp(`${p}% abaixo da média`))
    assert.doesNotMatch(`${view.paragrafo}\n${view.description}`, /\bcara\b|compre|venda/)
  }
  assert.equal(xpml.nome, 'XP Malls')

  const acima = montarPrecoTeto({
    ticker: 'HGLG11',
    nomeBruto: 'CSHG LOG',
    fiiTradingName: 'CSHG Logística',
    tipo: 'REIT',
    preco: 160,
    priceDate: '2026-10-23',
    setorBruto: 'Real Estate',
    lpa: 0,
    vpa: 100,
    dividendo: 1.2,
    dividendoFonte: 'soma',
    dyPct: 10,
    sectorPL: 0,
    sectorPLFonte: 'sem-lpa',
    temPaginaDividendos: true,
  })
  assert.ok(acima)
  assert.equal(distancia(acima.preco, acima.consenso), '88,2')
  assert.match(acima.paragrafo, /A cotação está 88,2% acima da média, acima do preço teto calculado\./)
  assert.match(acima.description, /88,2% acima da média/)
  assert.doesNotMatch(`${acima.paragrafo}\n${acima.description}`, /barata|subvalorizada|\bcara\b|compre|venda/)
})
