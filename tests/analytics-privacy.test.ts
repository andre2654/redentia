/**
 * SEC-01 (revisão de 07/10/2026): o token do convite e o do link de gestão
 * ficam no caminho da URL. GA4, GTM, Clarity e o script da Vercel carregavam
 * em todas as rotas e mandavam a URL (e o Clarity, a tela) para terceiros:
 * quem tivesse acesso a esses painéis consentia ou revogava no lugar do
 * cliente. Os plugins agora perguntam a isSecretTokenPath antes de carregar, e
 * este teste trava as rotas que não podem voltar a vazar.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { isSecretTokenPath } from '../app/utils/analytics-privacy.ts'

const TOKEN = 'a'.repeat(48)

test('as três rotas com token no path são secretas, com ou sem query e hash', () => {
  for (const p of [
    `/cliente/convite/${TOKEN}`,
    `/cliente/acesso/${TOKEN}`,
    `/business/convite/${TOKEN}`,
    `/cliente/acesso/${TOKEN}?utm_source=x`,
    `/cliente/convite/${TOKEN}#topo`,
    `/cliente/acesso/${TOKEN}/`,
    `//cliente//acesso/${TOKEN}`,
    `/Cliente/Convite/${TOKEN}`,
  ]) assert.equal(isSecretTokenPath(p), true, p)
})

test('rotas sem token seguem medidas', () => {
  for (const p of ['/', '/business', '/business/clientes', '/business/chaves', '/cliente', '/cliente/convite', '/cliente/convite/', '/conta', '/asset/PETR4', null, undefined, ''])
    assert.equal(isSecretTokenPath(p as string), false, String(p))
})

test('os quatro plugins de analytics consultam a guarda antes de carregar', () => {
  for (const f of [
    'google-analytics.client.ts',
    'clarity.client.ts',
    'google-tag-manager.ts',
    'vercel-analytics.client.ts',
  ]) {
    const src = readFileSync(new URL(`../app/plugins/${f}`, import.meta.url), 'utf8')
    assert.match(src, /isSecretTokenPath\(/, `${f} não consulta isSecretTokenPath`)
  }
  const guard = readFileSync(new URL('../app/plugins/00.rotas-com-segredo.client.ts', import.meta.url), 'utf8')
  assert.match(guard, /isSecretTokenPath\(to\.path\)/)
  assert.match(guard, /location\.assign/)
})

test('link com token e chave na tela vão mascarados para o Clarity', () => {
  for (const f of [
    'components/business/RbClientLink.vue',
    'pages/cliente/convite/[token].vue',
    'pages/business/convite/[token].vue',
    'components/business/RbKeysTable.vue',
    'components/conta/ContaMcp.vue',
  ]) {
    const src = readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8')
    const codes = src.match(/<code class="[^"]*(?:__code|__link-code|__key)"[^>]*>/g) ?? []
    assert.ok(codes.length > 0, `${f}: nenhum <code> de segredo achado`)
    for (const c of codes) assert.match(c, /data-clarity-mask="true"/, `${f}: ${c}`)
  }
})
