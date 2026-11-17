/**
 * /caminho/ chega na URL final num 301 só: sem a barra, com a query, e já
 * na caixa canônica quando a página faria um segundo salto.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { destinoSemBarra } from '../server/utils/sem-barra.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('a calculadora perde a barra e guarda a query', () => {
  assert.equal(destinoSemBarra('/calculadora/acoes/'), '/calculadora/acoes')
  assert.equal(destinoSemBarra('/calculadora/acoes/?x=1'), '/calculadora/acoes?x=1')
  assert.equal(destinoSemBarra('/calculadora/acoes/?x=1&y=2'), '/calculadora/acoes?x=1&y=2')
  assert.equal(destinoSemBarra('/calculadoras/'), '/calculadoras')
  assert.equal(destinoSemBarra('/calculadora/dividend-yield/'), '/calculadora/dividend-yield')
  assert.equal(destinoSemBarra('/calculadora/preco-teto/'), '/calculadora/preco-teto')
  assert.equal(destinoSemBarra('/calculadora/acoes//'), '/calculadora/acoes')
  assert.equal(destinoSemBarra('/calculadora/acoes'), null)
})

test('a raiz, o app interno, arquivo, sitemap e o fluxo de conta não mudam', () => {
  for (const p of [
    '/',
    '/?x=1',
    '///',
    '/api/foo/',
    '/api/foo/?x=1',
    '/api/',
    '/_nuxt/entry.js/',
    '/_vercel/insights/',
    '/_vercel/insights/?x=1',
    '/_ipx/w_300/img.png/',
    '/.well-known/foo/',
    '/.well-known/foo/?x=1',
    '/__nuxt_error/',
    '/__nuxt/',
    '/favicon.ico/',
    '/img/logo.svg/',
    '/llms.txt/',
    '/sitemap.xml/',
    '/robots.txt/',
    '/sitemaps/ativos.xml/',
    '/sitemaps/',
    '/login/',
    '/assinar/',
    '/assinar/obrigado/',
    '/conta/',
    '/checkout/',
    '/checkout/session/',
    '/webhooks/stripe/',
    '/webhook/stripe/',
    '/auth/google/callback/',
    '/auth/apple/',
    '/oauth/callback/',
    '/algum/callback/',
    '//evil.com/',
    '/business/',
    '/pricing/',
  ]) assert.equal(destinoSemBarra(p), null, p)
})

test('ticker minúsculo com barra vai direto para a caixa alta, num salto', () => {
  assert.equal(destinoSemBarra('/asset/petr4/'), '/asset/PETR4')
  assert.equal(destinoSemBarra('/asset/petr4/?x=1'), '/asset/PETR4?x=1')
  assert.equal(destinoSemBarra('/asset/PETR4/'), '/asset/PETR4')
  assert.equal(destinoSemBarra('/asset/btc/'), '/asset/BTC')
  assert.equal(destinoSemBarra('/asset/brk-b/'), '/asset/BRK-B')
  assert.equal(destinoSemBarra('/asset/!!!/'), '/asset/!!!')
  assert.equal(destinoSemBarra('/dividendos/petr4/'), '/dividendos/PETR4')
  assert.equal(destinoSemBarra('/dividendos/vale3/?de=EMBR3'), '/dividendos/VALE3?de=EMBR3')
  assert.equal(destinoSemBarra('/dividendos/btc/'), '/dividendos/btc')
  assert.equal(destinoSemBarra('/quanto-rende/petr4/'), '/quanto-rende/PETR4')
  assert.equal(destinoSemBarra('/calculadora/preco-teto/hglg11/'), '/calculadora/preco-teto/HGLG11')
  assert.equal(destinoSemBarra('/calculadora/preco-teto/bazin/'), '/calculadora/preco-teto/bazin')
  assert.equal(destinoSemBarra('/calculadora/preco-teto/petr4/?x=1'), '/calculadora/preco-teto/PETR4?x=1')
  // sem barra, a página continua dona da caixa
  assert.equal(destinoSemBarra('/asset/petr4'), null)
})

test('atalho, slug minúsculo e regra estática terminam na URL final', () => {
  assert.equal(destinoSemBarra('/acao/petr4/'), '/asset/PETR4')
  assert.equal(destinoSemBarra('/acao/vale3/?utm_source=google'), '/asset/VALE3?utm_source=google')
  assert.equal(destinoSemBarra('/crypto/sol/'), '/asset/SOL')
  assert.equal(destinoSemBarra('/tese/Reindustrializacao-EUA/'), '/tese/reindustrializacao-eua')
  assert.equal(destinoSemBarra('/tesouro/Tesouro-Selic-2029/'), '/tesouro/tesouro-selic-2029')
  assert.equal(destinoSemBarra('/quanto-rende/tesouro/Tesouro-Selic-2029/'), '/quanto-rende/tesouro/tesouro-selic-2029')
  assert.equal(destinoSemBarra('/calculadora/'), '/calculadoras')
  assert.equal(destinoSemBarra('/preco-teto/?x=1'), '/calculadora/preco-teto?x=1')
  assert.equal(destinoSemBarra('/dividendos/'), '/ranking/maiores-dividend-yield')
  assert.equal(destinoSemBarra('/dividendos/calendario/'), '/ranking/maiores-dividend-yield')
  assert.equal(destinoSemBarra('/mercado-completo/'), '/')
  assert.equal(destinoSemBarra('/tesouro/tesouro-ipca-com-juros-semestrais-2028/'), '/tesouro/tesouro-ipca-com-juros-semestrais-2030')
  assert.equal(destinoSemBarra('/tesouro/TESOURO-IPCA-COM-JUROS-SEMESTRAIS-2028/'), '/tesouro/tesouro-ipca-com-juros-semestrais-2030')
  assert.equal(destinoSemBarra('/guias/analise-petr4-vale-a-pena-investir/'), '/asset/PETR4')
  assert.equal(destinoSemBarra('/rankings/acoes/?x=1'), '/rankings?classe=acoes&x=1')
  assert.equal(destinoSemBarra('/rankings/fiis/'), '/rankings?classe=fiis')
  assert.equal(destinoSemBarra('/fiis/'), '/fiis')
  assert.equal(destinoSemBarra('/fiis/?x=1'), '/fiis?x=1')
  assert.equal(destinoSemBarra('/fiis'), null)
})

test('POST, PUT e o resto não redirecionam; HEAD segue o GET', () => {
  for (const metodo of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'post']) {
    assert.equal(destinoSemBarra('/calculadora/acoes/', metodo), null, metodo)
    assert.equal(destinoSemBarra('/asset/petr4/', metodo), null, metodo)
  }
  assert.equal(destinoSemBarra('/calculadora/acoes/', 'HEAD'), '/calculadora/acoes')
  assert.equal(destinoSemBarra('/asset/petr4/', 'HEAD'), '/asset/PETR4')
})

test('cada redirect do routeRules, com barra, termina no destino dele', () => {
  const config = ler('nuxt.config.ts')
  const regras = [...config.matchAll(/'([^']+)': \{ redirect: \{ to: '([^']+)', statusCode: 301 \} \}/g)]
  assert.ok(regras.length >= 40, `o regex achou ${regras.length} regras`)
  for (const [, de, para] of regras) {
    if (de.startsWith('/auth')) {
      assert.equal(destinoSemBarra('/auth/google/callback/'), null, de)
      continue
    }
    if (de.endsWith('/**')) {
      const base = de.slice(0, -2)
      assert.equal(destinoSemBarra(`${base}qualquer-coisa/`), para, de)
      const com = para.includes('?') ? `${para}&x=1` : `${para}?x=1`
      assert.equal(destinoSemBarra(`${base}qualquer-coisa/?x=1`), com, de)
      continue
    }
    assert.equal(destinoSemBarra(`${de}/`), para, de)
    const com = para.includes('?') ? `${para}&x=1` : `${para}?x=1`
    assert.equal(destinoSemBarra(`${de}/?x=1`), com, de)
    const destino = destinoSemBarra(`${de}/`)!
    const path = destino.split('?')[0]!
    assert.ok(path === '/' || !path.endsWith('/'), destino)
  }
})

test('no domínio antigo o middleware não corre na frente do host-antigo', () => {
  const mw = ler('server/middleware/sem-barra.ts')
  const guarda = mw.indexOf('if (destinoNaAportou(')
  const salto = mw.indexOf('return sendRedirect(event, para, 301)')
  assert.ok(guarda > 0 && salto > guarda)
  assert.match(mw, /setResponseHeader\(event, 'cache-control', 'public, max-age=0, must-revalidate'\)/)
  assert.ok('atalho-canonico.ts' < 'sem-barra.ts')
  assert.ok('b2b-para-redentia.ts' < 'sem-barra.ts')
  assert.ok('host-antigo.ts' < 'sem-barra.ts')
})
