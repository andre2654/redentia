/**
 * Convite "Acompanhar este ticker" abaixo do resultado de
 * /calculadora/preco-teto/{TICKER}. View uma vez, submit no clique, e nada
 * sem consentimento granted.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { capturarAtribuicaoDeSessao } from '../app/utils/atribuicao.ts'
import {
  EVENTO_SUBMIT_CONVITE_PRECO_TETO,
  EVENTO_VIEW_CONVITE_PRECO_TETO,
  LEGAL_CONVITE_PRECO_TETO,
  LEGAL_EMAIL_CONVITE_PRECO_TETO,
  TITULO_CONVITE_PRECO_TETO,
  confirmacaoListaConvite,
  corpoConvitePrecoTeto,
  dispararEventoConvitePrecoTeto,
  limparViewsDoConvitePrecoTeto,
  rotuloBotaoConvitePrecoTeto,
  rotuloJaSegueConvite,
  viewConviteNoConjunto,
  viewConviteSeCouber,
  type AmbienteConvite,
  type GtagConvite,
} from '../app/utils/preco-teto-convite.ts'
import { tickerDePaginaPrecoTeto } from '../app/utils/preco-teto-pagina.ts'
import { B3_TICKER_RE } from '../app/utils/tickerClass.ts'

const VEDADOS = /\b(compre|comprar|compra|vender|venda|oportunidade|recomend\w*|barato|upside|imperd[ií]vel)\b/i

function ler(caminho: string) {
  return readFileSync(new URL(caminho, import.meta.url), 'utf8')
}

function ambiente(consentimento: AmbienteConvite['consentimento'], gtag?: GtagConvite): AmbienteConvite {
  return { consentimento, gtag }
}

test('o convite fica abaixo do resultado, só na página do ticker, numa linha', () => {
  const pagina = ler('../app/components/calc/CalcPrecoTetoTicker.vue')
  const nums = pagina.indexOf('class="ptt__nums"')
  const aviso = pagina.indexOf('class="ptt__aviso"', nums)
  const convite = pagina.indexOf('<CalcConvitePrecoTeto', aviso)
  const fecha = pagina.indexOf('</section>', convite)
  const tabela = pagina.indexOf('ptt__table-sec', fecha)
  assert.ok(nums !== -1 && aviso !== -1 && convite !== -1 && fecha !== -1 && tabela !== -1)
  assert.ok(nums < aviso && aviso < convite && convite < fecha && fecha < tabela)
  assert.equal(pagina.match(/<CalcConvitePrecoTeto/g)?.length, 1)
  assert.match(pagina, /<CalcConvitePrecoTeto :ticker="view\.ticker" :alvo="view\.consenso > 0 \? view\.consenso : null" \/>/)

  assert.doesNotMatch(ler('../app/pages/calculadora/preco-teto/index.vue'), /CalcConvitePrecoTeto/)
  assert.doesNotMatch(ler('../app/components/calc/CalcPrecoTetoMetodo.vue'), /CalcConvitePrecoTeto/)
})

test('o bloco nasce com o resultado: sem lazy, sem modal, sem script novo', () => {
  const comp = ler('../app/components/calc/CalcConvitePrecoTeto.vue')
  assert.match(comp, /new IntersectionObserver/)
  assert.match(comp, /threshold: 0\.5/)
  assert.match(comp, /viewConviteSeCouber\(papel\.value\)/)
  assert.match(comp, /dispararEventoConvitePrecoTeto\(EVENTO_SUBMIT_CONVITE_PRECO_TETO, papel\.value\)/)
  assert.match(comp, /useAlertaPrecoTeto\(/)
  assert.match(comp, /seguir=1/)
  assert.match(comp, /to="\/institucional\/privacy"/)
  assert.doesNotMatch(comp, /defineAsyncComponent|ClientOnly|<ClientOnly|import\(/)
  assert.doesNotMatch(comp, /useCadastroFolha|CadastroFolha|Teleport|role="dialog"|<dialog/)
  assert.doesNotMatch(comp, /gtag|googletagmanager|createElement\(/)
  assert.doesNotMatch(comp, /sessionStorage|localStorage|entry_path/)
  assert.doesNotMatch(comp, /nu-green|nu-red|#[0-9a-fA-F]{3,8}/)
  assert.match(comp, /var\(--nu-cream\)/)
  assert.match(comp, /var\(--nu-blue\)/)
  assert.match(comp, /var\(--nu-navy\)/)
  assert.match(comp, /var\(--nu-font\)/)
})

test('o texto descreve o acompanhamento que já existe e não recomenda', () => {
  assert.equal(TITULO_CONVITE_PRECO_TETO, 'Acompanhar este ticker')
  assert.equal(EVENTO_VIEW_CONVITE_PRECO_TETO, 'preco_teto_convite_view')
  assert.equal(EVENTO_SUBMIT_CONVITE_PRECO_TETO, 'preco_teto_convite_submit')
  const comPreco = corpoConvitePrecoTeto('petr4', 'R$ 42,10')
  const semPreco = corpoConvitePrecoTeto('PETR4', null)
  assert.equal(comPreco, 'Um e-mail no fim do pregão em que a cotação de PETR4 cruzar o preço teto desta página (R$ 42,10). O papel entra na sua lista de ativos seguidos.')
  assert.equal(semPreco, 'PETR4 entra na sua lista de ativos seguidos. A cotação do último pregão fica na sua página inicial.')
  assert.match(comPreco, /e-mail/)
  assert.doesNotMatch(semPreco, /e-mail|alerta/i)
  assert.equal(rotuloBotaoConvitePrecoTeto('petr4'), 'Acompanhar PETR4')
  assert.equal(rotuloJaSegueConvite('VALE3'), 'Você segue VALE3')
  assert.equal(confirmacaoListaConvite('ITUB4'), 'Você está seguindo ITUB4.')
  assert.equal(LEGAL_CONVITE_PRECO_TETO, 'Grátis, com a sua conta.')
  assert.match(LEGAL_EMAIL_CONVITE_PRECO_TETO, /e-mail/)
  const frases = [TITULO_CONVITE_PRECO_TETO, comPreco, semPreco, rotuloBotaoConvitePrecoTeto('HGLG11'), rotuloJaSegueConvite('TAEE11'), confirmacaoListaConvite('BBAS3'), LEGAL_CONVITE_PRECO_TETO, LEGAL_EMAIL_CONVITE_PRECO_TETO]
  for (const frase of frases) assert.equal(VEDADOS.test(frase), false, frase)
  const comp = ler('../app/components/calc/CalcConvitePrecoTeto.vue')
  const template = comp.slice(comp.indexOf('<template>'), comp.indexOf('</template>'))
  assert.equal(VEDADOS.test(template), false)
})

test('a view dispara uma vez com o ticker e o submit dispara com o ticker', () => {
  const chamadas: unknown[][] = []
  const gtag: GtagConvite = (comando, nome, params) => { chamadas.push([comando, nome, params]) }
  const vistos = new Set<string>()
  const ok = ambiente('granted', gtag)
  assert.equal(viewConviteNoConjunto('petr4', vistos, ok), 'enviado')
  assert.equal(viewConviteNoConjunto('PETR4', vistos, ok), 'repetido')
  assert.equal(viewConviteNoConjunto('VALE3', vistos, ok), 'enviado')
  assert.equal(dispararEventoConvitePrecoTeto('preco_teto_convite_submit', 'petr4', ok), 'enviado')
  assert.deepEqual(chamadas, [
    ['event', 'preco_teto_convite_view', { ticker: 'PETR4' }],
    ['event', 'preco_teto_convite_view', { ticker: 'VALE3' }],
    ['event', 'preco_teto_convite_submit', { ticker: 'PETR4' }],
  ])
  assert.equal(dispararEventoConvitePrecoTeto('preco_teto_convite_view', 'xxx', ok), 'sem-ticker')
  assert.equal(chamadas.length, 3)
})

test('o convite vale para todo ticker que tem página: com dígito no meio também (B3SA3)', () => {
  // Até 13/11/2026 o convite tinha uma cópia da regra de quatro letras: a
  // página da B3SA3 existia (a regra dela é a do tickerClass.ts) e o convite não aparecia.
  assert.equal(tickerDePaginaPrecoTeto({ ticker: 'B3SA3', type: 'STOCK', market_price: 14.76 }), 'B3SA3')
  assert.equal(rotuloBotaoConvitePrecoTeto('b3sa3'), 'Acompanhar B3SA3')
  assert.equal(rotuloJaSegueConvite('B3SA3'), 'Você segue B3SA3')
  assert.equal(confirmacaoListaConvite('B3SA3'), 'Você está seguindo B3SA3.')
  assert.equal(corpoConvitePrecoTeto('B3SA3', null), 'B3SA3 entra na sua lista de ativos seguidos. A cotação do último pregão fica na sua página inicial.')
  const chamadas: unknown[][] = []
  const gtag: GtagConvite = (comando, nome, params) => { chamadas.push([comando, nome, params]) }
  const ok = ambiente('granted', gtag)
  assert.equal(viewConviteNoConjunto('b3sa3', new Set<string>(), ok), 'enviado')
  assert.deepEqual(chamadas, [['event', 'preco_teto_convite_view', { ticker: 'B3SA3' }]])
  // quem não é ticker da B3 segue sem frase e sem evento
  for (const t of ['BTC', 'AAPL', 'TESOURO SELIC 2029', 'CDB', '']) {
    assert.equal(rotuloBotaoConvitePrecoTeto(t), '', t)
    assert.equal(corpoConvitePrecoTeto(t, 'R$ 10,00'), '', t)
    assert.equal(dispararEventoConvitePrecoTeto('preco_teto_convite_view', t, ok), 'sem-ticker', t)
  }
  assert.equal(chamadas.length, 1)
  // a expressão do convite é a da regra única, letra por letra (ela fica escrita no util, sem import)
  assert.ok(ler('../app/utils/preco-teto-convite.ts').includes(`\nconst TICKER = ${B3_TICKER_RE}\n`), 'a regra do convite saiu de sincronia com o tickerClass.ts')
  // o componente só aparece com o ticker que esta regra devolve
  const comp = ler('../app/components/calc/CalcConvitePrecoTeto.vue')
  assert.match(comp, /const papel = computed\(\(\) => normalizarTickerConvite\(props\.ticker\)\)/)
  assert.match(comp, /<section v-if="papel" ref="raiz" class="ptc"/)
})

test('sem consentimento nada dispara, e a view recusada não queima o ticker', () => {
  const chamadas: unknown[][] = []
  const gtag: GtagConvite = (comando, nome, params) => { chamadas.push([comando, nome, params]) }
  const vistos = new Set<string>()
  for (const consentimento of [null, 'denied'] as const) {
    assert.equal(viewConviteNoConjunto('PETR4', vistos, ambiente(consentimento, gtag)), 'recusado')
    assert.equal(dispararEventoConvitePrecoTeto('preco_teto_convite_submit', 'PETR4', ambiente(consentimento, gtag)), 'recusado')
  }
  assert.equal(dispararEventoConvitePrecoTeto('preco_teto_convite_view', 'PETR4', ambiente('granted')), 'recusado')
  assert.equal(chamadas.length, 0)
  assert.equal(vistos.has('PETR4'), false)
  assert.equal(viewConviteNoConjunto('PETR4', vistos, ambiente('granted', gtag)), 'enviado')
  assert.deepEqual(chamadas, [['event', 'preco_teto_convite_view', { ticker: 'PETR4' }]])

  const estoura: GtagConvite = () => { throw new Error('ga') }
  assert.equal(dispararEventoConvitePrecoTeto('preco_teto_convite_submit', 'PETR4', ambiente('granted', estoura)), 'recusado')
})

test('o conjunto do módulo também conta uma vez e o login não cobre o entry_path do ticker', () => {
  limparViewsDoConvitePrecoTeto()
  const chamadas: unknown[][] = []
  const gtag: GtagConvite = (comando, nome, params) => { chamadas.push([comando, nome, params]) }
  const ok = ambiente('granted', gtag)
  try {
    assert.equal(viewConviteSeCouber('PETR4', ok), 'enviado')
    assert.equal(viewConviteSeCouber('PETR4', ok), 'repetido')
    assert.equal(chamadas.length, 1)
  }
  finally {
    limparViewsDoConvitePrecoTeto()
  }

  const store = {
    valor: undefined as string | undefined,
    getItem() { return this.valor ?? null },
    setItem(_k: string, v: string) { this.valor = v },
  }
  const entrada = capturarAtribuicaoDeSessao(
    store,
    { pathname: '/calculadora/preco-teto/PETR4', search: '?utm_source=google', hostname: 'www.redentia.com.br' },
    '',
  )
  const depoisDoLogin = capturarAtribuicaoDeSessao(
    store,
    { pathname: '/login', search: '', hostname: 'www.redentia.com.br' },
    '',
  )
  assert.equal(entrada.entry_path, '/calculadora/preco-teto/PETR4')
  assert.equal(entrada.utm_source, 'google')
  assert.equal(depoisDoLogin.entry_path, '/calculadora/preco-teto/PETR4')
  assert.equal(depoisDoLogin.utm_source, 'google')
})
