/**
 * /acao/{ticker} e /crypto/{moeda} chegam em /asset/{MAIÚSCULO} num 301 só.
 * A caixa alta na página de ativo era um segundo salto.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { destinoCanonicoDeAtalho } from '../server/utils/atalho-canonico.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('cripto e ação antiga vão para o ativo em caixa alta, com a query', () => {
  assert.equal(destinoCanonicoDeAtalho('/crypto/sol'), '/asset/SOL')
  assert.equal(destinoCanonicoDeAtalho('/crypto/SOL'), '/asset/SOL')
  assert.equal(destinoCanonicoDeAtalho('/crypto/xrp/'), '/asset/XRP')
  assert.equal(destinoCanonicoDeAtalho('/crypto/sol?utm_source=google'), '/asset/SOL?utm_source=google')
  assert.equal(destinoCanonicoDeAtalho('/acao/petr4'), '/asset/PETR4')
  assert.equal(destinoCanonicoDeAtalho('/acao/vale3/'), '/asset/VALE3')
  assert.equal(destinoCanonicoDeAtalho('/acao/brk-b'), '/asset/BRK-B')
})

test('o que já é um salto só, ou não é símbolo, não entra neste atalho', () => {
  for (const p of ['/preco-teto', '/preco-teto/PETR4', '/dividendos/vale3', '/asset/petr4', '/crypto', '/acao', '/cryptox/sol', '/crypto/sol/extra', '/crypto/!!!'])
    assert.equal(destinoCanonicoDeAtalho(p), null, p)
  assert.equal(destinoCanonicoDeAtalho('/crypto/sol?'), '/asset/SOL')
})

test('o routeRules não reabre a corrente, e os atalhos institucionais são 301', () => {
  const config = ler('nuxt.config.ts')
  assert.doesNotMatch(config, /'\/crypto\/\*\*'/)
  assert.doesNotMatch(config, /'\/acao\/\*\*'/)
  assert.match(config, /'\/privacidade': \{ redirect: \{ to: '\/institucional\/privacy', statusCode: 301 \} \}/)
  assert.match(config, /'\/termos': \{ redirect: \{ to: '\/institucional\/terms', statusCode: 301 \} \}/)
  assert.match(config, /'\/sobre': \{ redirect: \{ to: '\/institucional\/about', statusCode: 301 \} \}/)
  assert.match(config, /'\/preco-teto': \{ redirect: \{ to: '\/calculadora\/preco-teto', statusCode: 301 \} \}/)
})

test('no domínio antigo o middleware não corre na frente do host-antigo', () => {
  const mw = ler('server/middleware/atalho-canonico.ts')
  const guarda = mw.indexOf('if (destinoNaAportou(')
  const salto = mw.indexOf('return sendRedirect(event, para, 301)')
  assert.ok(guarda > 0 && salto > guarda)
})
