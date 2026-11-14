/**
 * A janelinha de espiar ativo (03/11/2026): qual clique vira janela e qual
 * segue sendo link, o que o cartão mostra por classe, o "por que mexeu" e
 * onde o cartão pousa com o painel do chat aberto.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  classeDoAtivo,
  direitaDoCartao,
  indicadoresDoAtivo,
  linhaDoAtivo,
  montarEspiar,
  porQueMexeu,
  tickerDoHrefDeAtivo,
  tickerParaEspiar,
  type EspiarAncora,
  type EspiarClique,
} from '../app/utils/espiarAtivo.ts'
import type { FundamentalsOverviewApi, TickerProfileApi } from '../app/types/acao.ts'
import type { NewsTakeApi } from '../app/types/market.ts'

const ORIGEM = 'https://redentia.com.br'
const clique = (o: Partial<EspiarClique> = {}): EspiarClique => ({
  button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false, ...o,
})
const ancora = (o: Partial<EspiarAncora> = {}): EspiarAncora => ({
  href: '/asset/PETR4', target: null, download: false, semEspiar: false, emModal: false, ...o,
})
const em = (rotaAtual = '/', extra: { seletorDoChat?: boolean } = {}) => ({ origem: ORIGEM, rotaAtual, ...extra })

test('clique simples num link de ativo vira janela', () => {
  assert.equal(tickerParaEspiar(clique(), ancora(), em()), 'PETR4')
  assert.equal(tickerParaEspiar(clique(), ancora({ href: '/asset/petr4' }), em('/rankings')), 'PETR4')
  assert.equal(tickerParaEspiar(clique(), ancora({ href: '/asset/HGLG11?de=home#proventos' }), em()), 'HGLG11')
  assert.equal(tickerParaEspiar(clique(), ancora({ href: '/asset/AAPL34/' }), em()), 'AAPL34')
  // símbolo flex (ação americana, cripto): a janela tenta; o perfil 404 manda à página
  assert.equal(tickerParaEspiar(clique(), ancora({ href: '/asset/BRK-B' }), em()), 'BRK-B')
  // href absoluto do próprio site vale
  assert.equal(tickerParaEspiar(clique(), ancora({ href: 'https://redentia.com.br/asset/VALE3' }), em()), 'VALE3')
  // target _self é o mesmo que nenhum
  assert.equal(tickerParaEspiar(clique(), ancora({ target: '_self' }), em()), 'PETR4')
})

test('modificadores e botões que não são o esquerdo passam direto', () => {
  for (const m of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const) {
    assert.equal(tickerParaEspiar(clique({ [m]: true }), ancora(), em()), null, m)
  }
  assert.equal(tickerParaEspiar(clique({ button: 1 }), ancora(), em()), null, 'botão do meio')
  assert.equal(tickerParaEspiar(clique({ button: 2 }), ancora(), em()), null, 'botão direito')
  assert.equal(tickerParaEspiar(clique({ defaultPrevented: true }), ancora(), em()), null, 'alguém já tratou')
})

test('target, download, modal e o opt-out passam direto', () => {
  assert.equal(tickerParaEspiar(clique(), ancora({ target: '_blank' }), em()), null)
  assert.equal(tickerParaEspiar(clique(), ancora({ target: 'outra' }), em()), null)
  assert.equal(tickerParaEspiar(clique(), ancora({ download: true }), em()), null)
  assert.equal(tickerParaEspiar(clique(), ancora({ semEspiar: true }), em()), null)
  assert.equal(tickerParaEspiar(clique(), ancora({ emModal: true }), em()), null)
  // o cursor mágico do chat ligado: o clique anexa o ativo, não espia
  assert.equal(tickerParaEspiar(clique(), ancora(), em('/', { seletorDoChat: true })), null)
})

test('href externo e de outras rotas não são ativo', () => {
  for (const href of [
    'https://outro.com/asset/PETR4',
    '//outro.com/asset/PETR4',
    'http://redentia.com.br/asset/PETR4', // outro protocolo é outra origem
    '/dividendos/PETR4',
    '/asset',
    '/asset/',
    '/asset/PETR4/dividendos',
    '/assets/PETR4',
    '/ranking/maiores-altas-mes',
    '#asset/PETR4',
    'mailto:x@y.z',
    'javascript:void(0)',
    '/asset/%3Cscript%3E',
    '/asset/%E0%A4%A',
    '',
  ]) {
    assert.equal(tickerParaEspiar(clique(), ancora({ href }), em()), null, href)
  }
  assert.equal(tickerParaEspiar(clique(), ancora({ href: null }), em()), null)
})

test('na página do próprio ativo, o link dele navega; o de outro ativo espia', () => {
  assert.equal(tickerParaEspiar(clique(), ancora({ href: '/asset/PETR4' }), em('/asset/PETR4')), null)
  assert.equal(tickerParaEspiar(clique(), ancora({ href: '/asset/PETR4#indicadores' }), em('/asset/petr4')), null)
  assert.equal(tickerParaEspiar(clique(), ancora({ href: '/asset/PRIO3' }), em('/asset/PETR4')), 'PRIO3')
})

test('tickerDoHrefDeAtivo só lê /asset/X', () => {
  assert.equal(tickerDoHrefDeAtivo('/asset/mxrf11'), 'MXRF11')
  assert.equal(tickerDoHrefDeAtivo('/asset/PETR4?x=1'), 'PETR4')
  assert.equal(tickerDoHrefDeAtivo('/tese/petroleo'), null)
  assert.equal(tickerDoHrefDeAtivo(undefined), null)
})

test('o plugin intercepta na captura, para antes do NuxtLink, e respeita o opt-out', () => {
  const src = readFileSync(new URL('../app/plugins/espiar-ativo.client.ts', import.meta.url), 'utf8')
  assert.match(src, /addEventListener\('click',[\s\S]*\}, true\)/)
  assert.match(src, /\[data-sem-espiar\]/)
  assert.match(src, /e\.preventDefault\(\)/)
  const linha = readFileSync(new URL('../app/components/busca/BuscaLinha.vue', import.meta.url), 'utf8')
  assert.match(linha, /data-sem-espiar/, 'os resultados da /busca navegam direto')
  const janela = readFileSync(new URL('../app/components/espiar/EspiarAtivo.vue', import.meta.url), 'utf8')
  assert.match(janela, /data-sem-espiar class="esp__icone"/, 'o maximizar navega, não reabre a janela')
  assert.match(janela, /role="dialog"/)
  assert.match(janela, /aria-modal="false"/)
  assert.match(janela, /v-contexto-chat="contexto"/)
  assert.doesNotMatch(janela, /✦/)
})

/* ——— o cartão ——— */

const perfil = (o: Partial<TickerProfileApi> = {}): TickerProfileApi => ({
  ticker: 'PETR4', name: 'PETROBRAS   PN      N2', logo: null, type: 'STOCK', currency: 'BRL',
  market_price: 50.71, change_percent: -3.79, price_at: '03/11', price_date: '2026-11-03',
  market_cap: null, sector: 'Energy', industry_category: null, long_business_summary: null, ...o,
})

const ovAcao = {
  ticker: 'PETR4',
  key_statistics: null,
  financial_data: null,
  scrape_extras: {
    asset_type: 'stock',
    valuation: { dividend_yield: 11.2, price_to_earnings: 5.1, price_to_book: 1.3, ev_ebitda: 3, market_cap: 7e11 },
    quality: { return_on_equity: 24.6, return_on_assets: 9, net_margin: 18.2 },
    leverage: { net_debt_to_ebitda: 1.1 },
  },
} as unknown as FundamentalsOverviewApi

const take = (o: Partial<NewsTakeApi> = {}): NewsTakeApi => ({
  id: '1', source: 'money_times', url: 'https://x.invalid/a', title: 'Petróleo Brent fecha em queda',
  imageUrl: null, publishedAt: '2026-11-03T17:47:06-03:00',
  atlasReading: 'O Brent fechou em queda de 1,11%, a US$ 103,60. Com PRIO3 caindo 4,7% e PETR4 4%, o prêmio de guerra sai do preço.',
  tickers: [{ ticker: 'PETR4', dir: 'down' }], relevance: 70, ...o,
})

test('ação: preço, variação do dia, nome limpo e os quatro números da página', () => {
  const vm = montarEspiar({ perfil: perfil(), precos: null, overview: ovAcao, proventos: null, leituras: null, hoje: '2026-11-03' })
  assert.equal(vm.ticker, 'PETR4')
  assert.equal(vm.nome, 'Petrobras')
  assert.equal(vm.classe, 'acao')
  assert.equal(vm.precoFmt, 'R$ 50,71')
  assert.equal(vm.variacaoFmt, '-3,79%')
  assert.equal(vm.dir, 'down')
  assert.equal(vm.quando, 'hoje')
  assert.deepEqual(vm.indicadores.map((i) => i.rotulo), ['Dividend Yield', 'P/L', 'P/VP', 'ROE'])
  assert.deepEqual(vm.indicadores.map((i) => i.valor), ['11,20%', '5,10', '1,30', '24,6%'])
  assert.equal(vm.linha, null, 'sem série, sem linha')
  assert.match(vm.contexto, /Petrobras \(PETR4\)/)
  // pregão anterior
  assert.equal(montarEspiar({ perfil: perfil({ price_date: '2026-10-31' }), precos: null, overview: null, proventos: null, leituras: null, hoje: '2026-11-03' }).quando, 'em 31/10')
})

test('o DY é o da página: histórico sem renda em 12 meses vira 0, não o indicado', () => {
  const proventosVelhos = [{ ex_date: '2024-05-02', payment_date: '2024-05-20', rate: 1.2, label: 'DIVIDENDO' }]
  const vm = montarEspiar({ perfil: perfil(), precos: null, overview: ovAcao, proventos: proventosVelhos, leituras: null, hoje: '2026-11-03' })
  assert.equal(vm.indicadores.find((i) => i.rotulo === 'Dividend Yield')?.valor, '0,00%')
})

test('FII, ETF e BDR mostram números diferentes', () => {
  const fii = indicadoresDoAtivo('fii', {
    scrape_extras: { asset_type: 'fii', fii: { dividend_yield_12m: 9.32, price_to_book: 0.874, book_value_per_share: 165.4, monthly_income_avg_24m: 1.1, ifix_share: 4.1, num_shareholders: 613837, trading_name: 'PÁTRIA LOG' } },
  } as unknown as FundamentalsOverviewApi, 9.32, 'R$')
  assert.deepEqual(fii.map((i) => `${i.rotulo}=${i.valor}`), ['Dividend Yield=9,32%', 'P/VP=0,87', 'Renda média/cota (24M)=R$ 1,10', 'Cotistas=613.837'])

  const etf = indicadoresDoAtivo('etf', {
    scrape_extras: { asset_type: 'etf', etf: { change_12m: 10.61, min_price_52_weeks: 147.19, max_price_52_weeks: 207, num_shareholders: 100430 } },
  } as unknown as FundamentalsOverviewApi, null, 'R$')
  assert.deepEqual(etf.map((i) => `${i.rotulo}=${i.valor}`), ['12 meses=+10,61%', 'Mín. 52 semanas=R$ 147,19', 'Máx. 52 semanas=R$ 207,00', 'Cotistas=100.430'])

  const bdr = indicadoresDoAtivo('bdr', {
    scrape_extras: { asset_type: 'bdr', valuation: { price_to_earnings: 39.4, dividend_yield: 0.21, price_to_book: 47.7 }, quality: { return_on_equity: 149.1, net_margin: 27.6 } },
  } as unknown as FundamentalsOverviewApi, 0.21, 'R$')
  assert.deepEqual(bdr.map((i) => i.rotulo), ['P/L', 'Dividend Yield', 'ROE', 'Margem Líquida'])

  // número que falta some; nunca zero inventado
  assert.deepEqual(indicadoresDoAtivo('acao', null, null, 'R$'), [])
})

test('a classe segue a regra do loadAcao', () => {
  assert.equal(classeDoAtivo('STOCK', 'fii'), 'fii')
  assert.equal(classeDoAtivo('REIT', null), 'fii')
  assert.equal(classeDoAtivo('US_ETF', null), 'etf')
  assert.equal(classeDoAtivo('BDR', null), 'bdr')
  assert.equal(classeDoAtivo('US_STOCK', null), 'acao')
  assert.equal(classeDoAtivo('ETF', 'stock'), 'acao')
})

test('a linha de 12 meses: sem eixo, o ponto de hoje no fim, a variação do período', () => {
  const serie = Array.from({ length: 250 }, (_, i) => ({ market_price: 30 + i * 0.08, price_at: `2026-${String(1 + Math.floor(i / 25)).padStart(2, '0')}-${String(1 + (i % 25)).padStart(2, '0')}` }))
  const l = linhaDoAtivo([...serie, { market_price: null, price_at: '2026-12-31' }])!
  assert.ok(l)
  assert.equal(l.x, 320)
  assert.ok(l.d.startsWith('M0.0 '))
  assert.ok(l.d.split('L').length <= 90, 'reduz a ~90 pontos')
  assert.equal(l.dir, 'up')
  assert.equal(l.variacao, '+66,40%')
  assert.ok(l.y >= 0 && l.y <= 64)
  assert.equal(linhaDoAtivo([{ market_price: 10, price_at: '2026-01-01' }]), null)
  assert.equal(linhaDoAtivo(null), null)
})

test('por que mexeu: só a leitura do mesmo pregão e no mesmo sentido do dia', () => {
  const p = porQueMexeu('PETR4', [take()], -3.79, '2026-11-03', '2026-11-03')!
  assert.equal(p.titulo, 'Por que mexeu hoje')
  assert.match(p.texto, /^O Brent fechou em queda/)
  assert.equal(p.fonte, 'Money Times, 17h47')
  // o pregão anterior diz a data
  assert.equal(porQueMexeu('PETR4', [take({ publishedAt: '2026-10-31T15:00:00-03:00' })], -2, '2026-10-31', '2026-11-03')?.titulo, 'Por que mexeu em 31/10')
  // sentido contrário, flat, outro dia ou variação pequena: não explica
  assert.equal(porQueMexeu('PETR4', [take({ tickers: [{ ticker: 'PETR4', dir: 'up' }] })], -3.79, '2026-11-03', '2026-11-03'), null)
  assert.equal(porQueMexeu('PETR4', [take({ tickers: [{ ticker: 'PETR4', dir: 'flat' }] })], -3.79, '2026-11-03', '2026-11-03'), null)
  assert.equal(porQueMexeu('PETR4', [take({ publishedAt: '2026-11-02T10:00:00-03:00' })], -3.79, '2026-11-03', '2026-11-03'), null)
  assert.equal(porQueMexeu('PETR4', [take()], -0.2, '2026-11-03', '2026-11-03'), null)
  assert.equal(porQueMexeu('PETR4', [take({ tickers: ['PETR4'] })], -3.79, '2026-11-03', '2026-11-03'), null, 'formato legado sem sentido')
  assert.equal(porQueMexeu('PETR4', null, -3.79, '2026-11-03', '2026-11-03'), null)
  // o ativo como protagonista ganha da notícia em que ele é coadjuvante
  const geral = take({ id: '2', atlasReading: 'O Ibovespa caiu 1,42%.', tickers: [{ ticker: 'VALE3', dir: 'down' }, { ticker: 'PETR4', dir: 'down' }], relevance: 90 })
  const dele = take({ id: '3', atlasReading: 'A Petrobras cortou o diesel.', tickers: [{ ticker: 'PETR4', dir: 'down' }], relevance: 60 })
  assert.match(porQueMexeu('PETR4', [geral, dele], -3.79, '2026-11-03', '2026-11-03')!.texto, /diesel/)
})

test('o texto do por que mexeu é curto e não corta número no meio', () => {
  const longa = 'O Ibovespa caiu 1,42%, aos 165.528 pontos, na sexta queda seguida. Petrobras e Vale puxaram o tombo. Com o Focus elevando IPCA e Selic, a bolsa precifica juro alto por mais tempo, e o comunicado do Copom na quarta vira o próximo teste do prêmio de risco.'
  const p = porQueMexeu('PETR4', [take({ atlasReading: longa })], -3.79, '2026-11-03', '2026-11-03')!
  assert.ok(p.texto.length <= 230)
  assert.match(p.texto, /^O Ibovespa caiu 1,42%, aos 165\.528 pontos/)
})

test('com o painel do chat aberto, o cartão anda para a esquerda dele, ou dá lugar', () => {
  const g = { vw: 1440, painelAberto: false, painelOcupa: 464, largura: 384, margem: 16 }
  assert.equal(direitaDoCartao(g), 16)
  assert.equal(direitaDoCartao({ ...g, painelAberto: true }), 480)
  assert.equal(direitaDoCartao({ ...g, vw: 860, painelAberto: true }), null, 'sem espaço para os dois')
  assert.equal(direitaDoCartao({ ...g, vw: 375, painelAberto: true, painelOcupa: 375 }), null)
})

test('nada de "compre/venda" nem ✦ no cartão', () => {
  const vm = montarEspiar({ perfil: perfil(), precos: null, overview: ovAcao, proventos: null, leituras: [take()], hoje: '2026-11-03' })
  const textos = [vm.nome, vm.contexto, ...vm.indicadores.flatMap((i) => [i.rotulo, i.valor]), vm.porQue?.titulo ?? '']
  for (const s of textos) {
    assert.doesNotMatch(s, /\b(compre|venda)\b/i)
    assert.doesNotMatch(s, /✦/)
  }
})

test('a barra do chat vai para baixo do cartão só no computador, com a barra larga e à vista', async () => {
  const { barraAoLado, BARRA_LARGA_DESDE } = await import('../app/utils/espiarAtivo.ts')
  assert.equal(barraAoLado({ vw: 1440, celular: false, barraVisivel: true }), true)
  assert.equal(barraAoLado({ vw: BARRA_LARGA_DESDE, celular: false, barraVisivel: true }), true)
  // entre 641 e 760px a barra é a cápsula do celular: fica no centro e o cartão sobe acima dela
  assert.equal(barraAoLado({ vw: 720, celular: false, barraVisivel: true }), false)
  assert.equal(barraAoLado({ vw: 390, celular: true, barraVisivel: true }), false)
  // painel aberto, login ou /busca: não há barra para trazer
  assert.equal(barraAoLado({ vw: 1440, celular: false, barraVisivel: false }), false)
})

test('com a barra ao lado, o cartão tira o "Perguntar" e a barra pergunta sobre o ativo, com ele anexado', () => {
  const cartao = readFileSync(new URL('../app/components/espiar/EspiarAtivo.vue', import.meta.url), 'utf8')
  assert.match(cartao, /<NuBotaoSeta v-if="!espiar\.aoLado\.value \|\| celular" class="esp__perguntar"/)
  assert.match(cartao, /pe\.value = PE_BARRA \+ ALTURA_BARRA_AO_LADO \+ VAO_BARRA_CARTAO/)
  const barra = readFileSync(new URL('../app/components/chat/ChatBarra.vue', import.meta.url), 'utf8')
  assert.match(barra, /`Pergunte sobre \$\{espiar\.ticker\.value\}`/)
  assert.match(barra, /painel\.perguntar\(t, ativo \? \[ativo\] : \[\]\)/)
  assert.match(barra, /if \(ativo && !t\) \{ painel\.abrir\(undefined, \[ativo\]\); return \}/)
  // as sugestões não sobem por cima do cartão
  assert.match(barra, /const mostrarSugestoes = computed\(\(\) => !aoLado\.value &&/)
})
