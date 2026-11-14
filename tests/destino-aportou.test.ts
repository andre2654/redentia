/**
 * A rede de segurança da virada de domínio (13/11/2026; docs/aportou/virada-de-dominio.md, seção 4):
 * pedido que chega pelo domínio antigo vai para a Aportou com 301, no mesmo caminho e com a mesma query.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { destinoNaAportou, ORIGEM_APORTOU } from '../server/utils/destino-b2b.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('o domínio antigo, com ou sem www, vai para o mesmo caminho na Aportou, com a query', () => {
  assert.equal(ORIGEM_APORTOU, 'https://aportou.com.br')
  assert.equal(destinoNaAportou('/calculadora/juros-compostos?initial=10000&years=20', 'www.redentia.com.br'), 'https://aportou.com.br/calculadora/juros-compostos?initial=10000&years=20')
  assert.equal(destinoNaAportou('/', 'redentia.com.br'), 'https://aportou.com.br/')
  assert.equal(destinoNaAportou('/asset/PETR4', 'WWW.Redentia.com.br:443'), 'https://aportou.com.br/asset/PETR4')
  // X-Forwarded-Host com lista: vale o primeiro
  assert.equal(destinoNaAportou('/login', 'www.redentia.com.br, interno.vercel.app'), 'https://aportou.com.br/login')
  // os sitemaps e as páginas legais também (o que não é do B2B é da Aportou)
  assert.equal(destinoNaAportou('/sitemaps/calculadoras.xml', 'www.redentia.com.br'), 'https://aportou.com.br/sitemaps/calculadoras.xml')
  assert.equal(destinoNaAportou('/institucional/privacy', 'www.redentia.com.br'), 'https://aportou.com.br/institucional/privacy')
})

test('outro host não muda: a própria Aportou, o preview, o localhost e os outros subdomínios da Redentia', () => {
  for (const host of ['aportou.com.br', 'www.aportou.com.br', 'redentia-git-feat.vercel.app', 'localhost:3471', 'whitelabel.redentia.com.br', 'estudo.redentia.com.br', ''])
    assert.equal(destinoNaAportou('/calculadora/juros-compostos', host), null, host)
})

test('os caminhos do B2B ficam com o middleware do B2B, e o que é do próprio app não muda de domínio', () => {
  for (const p of ['/business', '/business/clientes', '/cliente/convite/abc', '/jantar', '/whitelabel', '/pricing', '/relatorio/tok', '/entrar?convite=tok'])
    assert.equal(destinoNaAportou(p, 'www.redentia.com.br'), null, p)
  for (const p of ['/_nuxt/entry.js', '/api', '/api/backend/theses?x=1', '/_ipx/w_300/img.png', '/__nuxt/x'])
    assert.equal(destinoNaAportou(p, 'www.redentia.com.br'), null, p)
  // só o prefixo exato: /apis é uma página como outra qualquer
  assert.equal(destinoNaAportou('/apis', 'www.redentia.com.br'), 'https://aportou.com.br/apis')
})

test('o endereço sai limpo: acento vira %XX e caminho com duas barras não troca de host', () => {
  assert.equal(destinoNaAportou('/busca?q=ação', 'www.redentia.com.br'), 'https://aportou.com.br/busca?q=a%C3%A7%C3%A3o')
  const d = destinoNaAportou('//outro.com/x', 'www.redentia.com.br')!
  assert.equal(new URL(d).host, 'aportou.com.br')
})

test('o middleware manda 301 sem cache (a borda não pode guardar o redirect) e o canônico é aportou.com.br', () => {
  const mw = ler('server/middleware/host-antigo.ts')
  assert.match(mw, /setResponseHeader\(event, 'cache-control', 'private, no-store'\)\n  return sendRedirect\(event, para, 301\)/)
  assert.match(mw, /getRequestHost\(event, \{ xForwardedHost: true \}\)/)
  assert.match(ler('nuxt.config.ts'), /siteUrl: process\.env\.NUXT_PUBLIC_SITE_URL \|\| 'https:\/\/aportou\.com\.br',/)
  // nenhum texto de página ensina a copiar um endereço do domínio antigo
  for (const p of ['app/pages/calculadora/juros-compostos/index.vue', 'app/pages/calculadora/aposentadoria/index.vue', 'app/pages/calculadora/quanto-investir/index.vue', 'app/pages/calculadora/acoes.vue', 'app/pages/calculadora/planejamento.vue'])
    assert.doesNotMatch(ler(p).replace(/\/\/.*$/gm, ''), /https:\/\/redentia\.com\.br\/calculadora/, p)
})
