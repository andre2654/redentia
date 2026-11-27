/**
 * Ações que pagam dividendos: o DY vem do ranking, os meses vêm do
 * histórico de pagamento. count_12m alto em poucos meses não vira "mensal".
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  ACOES_DIV_DESCRIPTION,
  ACOES_DIV_MENSAIS_DESCRIPTION,
  ACOES_DIV_MENSAIS_PATH,
  ACOES_DIV_MENSAIS_TITLE,
  ACOES_DIV_PATH,
  ACOES_DIV_TITLE,
  acoesDividendosCabeNoSerp,
} from '../app/content/seo/acoes-dividendos.ts'
import {
  ACOES_DIV_MENSAIS_ATALHO,
  MESES_ALTA,
  MESES_MENSAL,
  RANKING_LIMITE,
  faixaDeDy,
  montarAcoesDividendos,
  passaNoFiltro,
  leituraDeProventos,
  tickersParaHistorico,
  type CadastroDividendoBruto,
  type LinhaAcaoDividendo,
  type PagadorDividendoBruto,
  type RankingDividendoBruto,
} from '../app/utils/acoesDividendos.ts'
import { parseProventos } from '../app/utils/proventos.ts'
import { destinoSemBarra } from '../server/utils/sem-barra.ts'
import { SEMENTES_SITEMAP } from '../server/data/sitemap-semente.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const PROIBIDO = /melhores ações|recomendamos|vale a pena comprar|renda garantida|garantia de renda|compre agora/i
const HOJE = '2026-11-27'

function aviso(pay: string, label = 'Dividendo', rate = '0.10', ex = pay) {
  return { payment_date: pay, ex_date: ex, rate, label }
}

function historico(ticker: string, linhas: ReturnType<typeof aviso>[]) {
  return { [ticker]: linhas }
}

function rank(ticker: string, dy: number, extra: Partial<RankingDividendoBruto> = {}): RankingDividendoBruto {
  return {
    ticker,
    name: ticker,
    type: 'STOCK',
    sector: 'Financial Services',
    market_price: 10,
    dividend_yield: dy,
    price_date: '2026-11-26',
    ...extra,
  }
}

function cadastroDe(...tickers: string[]): CadastroDividendoBruto[] {
  return tickers.map((ticker) => ({ ticker, name: `${ticker} ON`, type: 'STOCK' }))
}

function meses(de: string, ate: string, dia = '15'): string[] {
  const out: string[] = []
  let y = Number(de.slice(0, 4))
  let m = Number(de.slice(5, 7))
  const fimY = Number(ate.slice(0, 4))
  const fimM = Number(ate.slice(5, 7))
  while (y < fimY || (y === fimY && m <= fimM)) {
    out.push(`${y}-${String(m).padStart(2, '0')}-${dia}`)
    m += 1
    if (m === 13) {
      m = 1
      y += 1
    }
  }
  return out
}

test('o title e a description cabem no SERP e não indicam compra', () => {
  assert.equal(acoesDividendosCabeNoSerp(), true)
  assert.ok(ACOES_DIV_TITLE.length <= 50)
  assert.ok(ACOES_DIV_MENSAIS_TITLE.length <= 50)
  assert.ok(ACOES_DIV_DESCRIPTION.length >= 120 && ACOES_DIV_DESCRIPTION.length <= 155)
  assert.ok(ACOES_DIV_MENSAIS_DESCRIPTION.length >= 120 && ACOES_DIV_MENSAIS_DESCRIPTION.length <= 155)
  const texto = [
    ACOES_DIV_TITLE, ACOES_DIV_DESCRIPTION, ACOES_DIV_MENSAIS_TITLE, ACOES_DIV_MENSAIS_DESCRIPTION,
    ler('app/content/seo/acoes-dividendos.ts'),
    ler('app/pages/acoes-que-pagam-dividendos.vue'),
    ler('app/pages/acoes-que-pagam-dividendos-mensais.vue'),
  ].join('\n')
  assert.doesNotMatch(texto, PROIBIDO)
  assert.match(texto, /não garantem pagamentos futuros|não garantem os futuros/i)
  assert.doesNotMatch(texto, /noindex/i)
})

test('mês é calendário de pagamento, não a contagem de avisos', () => {
  const doze = meses('2025-12', '2026-11').map((d) => aviso(d))
  const leitura = leituraDeProventos(parseProventos(doze), HOJE)
  assert.equal(leitura.meses, 12)
  assert.equal(leitura.temRendaNaJanela, true)

  const apertados = [
    ...Array.from({ length: 8 }, (_, i) => aviso('2026-10-02', 'JCP', '0.05', '2026-09-28')),
    ...Array.from({ length: 8 }, (_, i) => aviso(`2026-11-${String(i + 1).padStart(2, '0')}`, 'Dividendo', '0.02')),
  ]
  const poucos = leituraDeProventos(parseProventos(apertados), HOJE)
  assert.equal(poucos.meses, 2)
  assert.equal(poucos.meses < MESES_ALTA, true)

  const comAmort = [
    ...meses('2025-12', '2026-11').map((d) => aviso(d, 'Amortização')),
    aviso('2026-11-10', 'Dividendo', '0.20'),
  ]
  const renda = leituraDeProventos(parseProventos(comAmort), HOJE)
  assert.equal(renda.meses, 1)

  const futuro = leituraDeProventos(parseProventos([
    aviso('2026-12-15', 'Dividendo', '1.00', '2026-11-20'),
    { payment_date: '2026-11-01', ex_date: '2026-10-20', rate: '0.30', label: 'JCP', payment_pending: true },
  ]), HOJE)
  assert.equal(futuro.meses, 0)
  assert.equal(futuro.temRendaNaJanela, true)
  assert.equal(futuro.ultimoIso, null)

  const mesmoDia = leituraDeProventos(parseProventos([
    aviso('2026-11-10', 'JCP', '0.15'),
    aviso('2026-11-10', 'Dividendo', '0.10'),
  ]), HOJE)
  assert.equal(mesmoDia.meses, 1)
  assert.equal(mesmoDia.ultimoValor, 0.25)
})

test('a lista mensal exige 10 meses no histórico, e 6 a 9 ficam separados', () => {
  const itub = meses('2025-12', '2026-11').map((d) => aviso(d, 'JCP'))
  const petr = meses('2026-04', '2026-11').map((d) => aviso(d))
  const dois = [
    ...Array.from({ length: 10 }, () => aviso('2026-10-05', 'JCP')),
    ...Array.from({ length: 6 }, () => aviso('2026-11-05', 'Dividendo')),
  ]
  const pagadores: PagadorDividendoBruto[] = [
    { ticker: 'ITUB4', type: 'STOCK', count_12m: 16 },
    { ticker: 'PETR4', type: 'STOCK', count_12m: 8 },
    { ticker: 'BBDC4', type: 'STOCK', count_12m: 16 },
    { ticker: 'TAEE11', type: 'STOCK', count_12m: 2 },
    { ticker: 'HGLG11', type: 'REIT', count_12m: 12 },
    { ticker: 'ALIX3', type: 'STOCK', count_12m: 12 },
  ]
  const ranking: RankingDividendoBruto[] = [
    rank('ITUB4', 0.07, { name: 'ITAUUNIBANCOPN  EJ  N1', sector: 'Financial Services' }),
    rank('PETR4', 0.084, { name: 'PETROBRAS   PN      N2', sector: 'Energy' }),
    rank('BBDC4', 0.39),
    rank('TAEE11', 0.075, { sector: 'Utilities' }),
    rank('HGLG11', 0.11, { type: 'REIT', sector: 'Real Estate' }),
    rank('ALTO4', 0.6),
    rank('ALIX3', 0.05),
  ]
  const cadastro: CadastroDividendoBruto[] = [
    { ticker: 'ITUB4', name: 'ITAUUNIBANCOPN  EJ  N1', type: 'STOCK' },
    { ticker: 'PETR4', name: 'PETROBRAS   PN      N2', type: 'STOCK' },
    ...cadastroDe('BBDC4', 'TAEE11', 'HGLG11', 'ALTO4'),
    { ticker: 'ALIX3', name: 'ALIAS ON', type: 'STOCK', alias_of: 'NOVO3' },
  ]
  const historicos = {
    ...historico('ITUB4', itub),
    ...historico('PETR4', petr),
    ...historico('BBDC4', dois),
    ...historico('TAEE11', meses('2026-08', '2026-11').map((d) => aviso(d))),
    ...historico('HGLG11', meses('2025-12', '2026-11').map((d) => aviso(d, 'Rendimento'))),
    ...historico('ALTO4', meses('2025-12', '2026-11').map((d) => aviso(d))),
    ...historico('ALIX3', itub),
  }
  const lista = montarAcoesDividendos({ ranking, pagadores, cadastro, historicos, today: HOJE })
  assert.equal(lista.ok, true)
  assert.equal(lista.incompleto, false)
  assert.deepEqual(lista.mensais.map((i) => i.ticker), ['ITUB4'])
  assert.equal(lista.mensais[0]!.meses, 12)
  assert.equal(lista.mensais[0]!.nome, 'Itaú Unibanco')
  assert.equal(lista.mensais[0]!.setor, 'Serviços financeiros')
  assert.match(lista.mensais[0]!.dyTexto ?? '', /7,00%/)
  assert.deepEqual(lista.alta.map((i) => i.ticker), ['PETR4'])
  assert.equal(lista.alta[0]!.meses, 8)
  assert.equal(lista.ranking.some((i) => i.ticker === 'BBDC4'), true)
  assert.equal(lista.mensais.some((i) => i.ticker === 'BBDC4'), false)
  assert.equal(lista.alta.some((i) => i.ticker === 'BBDC4'), false)
  assert.equal(lista.ranking.some((i) => i.ticker === 'HGLG11' || i.ticker === 'ALTO4' || i.ticker === 'ALIX3'), false)
  assert.match(lista.fonte, /Não é recomendação/)
  assert.match(lista.fonte, /27 nov 2025/)
  assert.match(lista.fonte, /27 nov 2026/)
  assert.equal(MESES_MENSAL, 10)
  assert.doesNotMatch(`${lista.fonte} ${lista.mensais[0]!.mesesTexto}`, PROIBIDO)
})

test('o filtro de meses e de DY não inventa faixa, e o ranking corta no limite', () => {
  assert.equal(faixaDeDy(0.08), 'de-4-a-8')
  assert.equal(faixaDeDy(0.0801), 'acima-8')
  assert.equal(faixaDeDy(0.0399), 'abaixo-4')
  const linha = {
    faixaMeses: 'alta',
    dy: 0.05,
    setor: 'Energia',
  } as LinhaAcaoDividendo
  assert.equal(passaNoFiltro(linha, { meses: 'alta', dy: 'de-4-a-8', setor: 'Energia' }), true)
  assert.equal(passaNoFiltro(linha, { meses: 'mensal', dy: 'todas', setor: '' }), false)
  assert.equal(passaNoFiltro({ ...linha, dy: null }, { meses: 'todas', dy: 'de-4-a-8', setor: '' }), false)

  const ranking = Array.from({ length: 120 }, (_, i) => rank(`A${String(i).padStart(3, '0')}4`, 0.2 - i * 0.001))
  const cadastro = cadastroDe(...ranking.map((r) => r.ticker!))
  const historicos: Record<string, unknown[]> = {}
  for (const row of ranking) historicos[row.ticker!] = [aviso('2026-11-10')]
  const lista = montarAcoesDividendos({
    ranking,
    pagadores: ranking.map((r) => ({ ticker: r.ticker, type: 'STOCK', count_12m: 1 })),
    cadastro,
    historicos,
    today: HOJE,
  })
  assert.equal(lista.rankingTotal, 120)
  assert.equal(lista.ranking.length, RANKING_LIMITE)
  assert.equal(lista.ranking[0]!.ticker, 'A0004')
  assert.equal(lista.ranking[0]!.pos, 1)
  assert.equal(lista.mensais.length, 0)
  assert.equal(lista.alta.length, 0)
})

test('histórico que falhou não entra e a página não finge que fechou', () => {
  const lista = montarAcoesDividendos({
    ranking: [rank('ITUB4', 0.07), rank('PETR4', 0.08, { sector: 'Energy' })],
    pagadores: [
      { ticker: 'ITUB4', type: 'STOCK', count_12m: 12 },
      { ticker: 'VIVT3', type: 'STOCK', count_12m: 11 },
    ],
    cadastro: cadastroDe('ITUB4', 'PETR4', 'VIVT3'),
    historicos: {
      ITUB4: meses('2025-12', '2026-11').map((d) => aviso(d)),
      PETR4: null,
      VIVT3: null,
    },
    today: HOJE,
  })
  assert.equal(lista.incompleto, true)
  assert.deepEqual(lista.ranking.map((i) => i.ticker), ['ITUB4'])
  assert.deepEqual(lista.mensais.map((i) => i.ticker), ['ITUB4'])
  assert.equal(lista.mensais.some((i) => i.ticker === 'VIVT3'), false)

  const semPagadores = montarAcoesDividendos({
    ranking: [rank('ITUB4', 0.07)],
    pagadores: null,
    cadastro: cadastroDe('ITUB4'),
    historicos: { ITUB4: meses('2025-12', '2026-11').map((d) => aviso(d)) },
    today: HOJE,
  })
  assert.equal(semPagadores.incompleto, true)
  assert.equal(semPagadores.mensais[0]?.ticker, 'ITUB4')
  assert.deepEqual(montarAcoesDividendos({
    ranking: null, pagadores: null, cadastro: null, historicos: {}, today: HOJE,
  }).ok, false)
})

test('a fila de histórico pega o ranking e quem tem avisos suficientes', () => {
  const tickers = tickersParaHistorico({
    ranking: [rank('PETR4', 0.08), rank('HGLG11', 0.1, { type: 'REIT' })],
    pagadores: [
      { ticker: 'ITUB4', type: 'STOCK', count_12m: 12 },
      { ticker: 'TAEE11', type: 'STOCK', count_12m: 5 },
      { ticker: 'MXRF11', type: 'REIT', count_12m: 12 },
    ],
    cadastro: cadastroDe('PETR4', 'HGLG11', 'ITUB4', 'TAEE11', 'MXRF11'),
  })
  assert.deepEqual(tickers, ['ITUB4', 'PETR4'])
})

test('as rotas, o 301, o sitemap e o llms.txt', () => {
  assert.equal(destinoSemBarra(`${ACOES_DIV_MENSAIS_ATALHO}/`), ACOES_DIV_MENSAIS_PATH)
  assert.equal(destinoSemBarra(`${ACOES_DIV_PATH}/`), ACOES_DIV_PATH)
  assert.equal(destinoSemBarra(`${ACOES_DIV_MENSAIS_PATH}/`), ACOES_DIV_MENSAIS_PATH)
  assert.match(ler('nuxt.config.ts'), /'\/acoes-que-pagam-dividendos\/mensais': \{ redirect: \{ to: '\/acoes-que-pagam-dividendos-mensais', statusCode: 301 \} \}/)
  for (const p of ['app/pages/acoes-que-pagam-dividendos.vue', 'app/pages/acoes-que-pagam-dividendos-mensais.vue']) {
    const vue = ler(p)
    assert.match(vue, /usePageSeo\(/)
    assert.match(vue, /breadcrumbs:/)
    assert.match(vue, /ItemList/)
    assert.match(vue, /NuFaqAccordion/)
    assert.match(vue, /AcoesDividendosLista/)
    assert.doesNotMatch(vue, /noindex/)
  }
  assert.match(ler('app/pages/acoes-que-pagam-dividendos.vue'), /passaNoFiltro/)
  assert.match(ler('app/components/dividendos/AcoesDividendosLista.vue'), /\/dividendos\/\$\{item\.ticker\}/)
  assert.match(ler('app/components/dividendos/AcoesDividendosLista.vue'), /\/asset\/\$\{item\.ticker\}/)
  assert.match(ler('server/utils/site-pages.ts'), /ACOES_DIV_PATH/)
  assert.match(ler('server/utils/site-pages.ts'), /ACOES_DIV_MENSAIS_PATH/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/acoes-que-pagam-dividendos\)/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/acoes-que-pagam-dividendos-mensais\)/)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/acoes-que-pagam-dividendos': QUINZE_MIN/)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/acoes-que-pagam-dividendos-mensais': QUINZE_MIN/)
  assert.match(ler('app/content/rankings/copy/maiores-dividend-yield.ts'), /href: '\/acoes-que-pagam-dividendos'/)
  assert.match(ler('app/pages/dividendos/agenda/index.vue'), /to="\/acoes-que-pagam-dividendos-mensais"/)
  assert.match(ler('app/utils/topo.ts'), /to: '\/acoes-que-pagam-dividendos'/)
  const xml = SEMENTES_SITEMAP.rankings?.xml ?? ''
  assert.match(xml, /\/acoes-que-pagam-dividendos</)
  assert.match(xml, /\/acoes-que-pagam-dividendos-mensais</)
  assert.equal(SEMENTES_SITEMAP.rankings?.urls, xml.split('<loc>').length - 1)
  const llms = ler('server/routes/llms.txt.ts')
  const bloco = llms.slice(llms.indexOf('### Rankings'), llms.indexOf('### Tesouro'))
  assert.match(bloco, /\/acoes-que-pagam-dividendos\)/)
  assert.match(bloco, /\/acoes-que-pagam-dividendos-mensais\)/)
  assert.doesNotMatch(bloco.slice(bloco.indexOf('/acoes-que-pagam-dividendos')), PROIBIDO)
})
