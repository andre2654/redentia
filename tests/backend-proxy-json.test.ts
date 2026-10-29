/**
 * O proxy /api/backend/** precisa pedir JSON ao Laravel. O proxyRequest do
 * h3 descarta o Accept do cliente; estes headers vão nas opções do proxy.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  CABECALHOS_JSON_DO_PROXY,
  MARCADOR_BUILD_PROXY,
  MARCADOR_BUILD_PROXY_VALOR,
  caminhoDoProxyBackend,
} from '../server/utils/backend-proxy-json.ts'

test('o proxy pede JSON e se identifica como XHR', () => {
  assert.equal(CABECALHOS_JSON_DO_PROXY.accept, 'application/json')
  assert.equal(CABECALHOS_JSON_DO_PROXY['x-requested-with'], 'XMLHttpRequest')
  assert.equal(Object.keys(CABECALHOS_JSON_DO_PROXY).length, 2)
})

test('o marcador de build é um header de resposta, não um header pro Laravel', () => {
  assert.equal(MARCADOR_BUILD_PROXY, 'x-redentia-proxy')
  assert.equal(MARCADOR_BUILD_PROXY_VALOR, 'json')
  assert.equal(CABECALHOS_JSON_DO_PROXY[MARCADOR_BUILD_PROXY], undefined)
})

test('só o prefixo /api/backend leva o marcador', () => {
  assert.equal(caminhoDoProxyBackend('/api/backend/auth/magic-link/request'), true)
  assert.equal(caminhoDoProxyBackend('/api/backend/me/notification-preferences'), true)
  assert.equal(caminhoDoProxyBackend('/api/backend/business/leads?x=1'), true)
  assert.equal(caminhoDoProxyBackend('/api/backend'), true)
  assert.equal(caminhoDoProxyBackend('/api/chat/stream'), false)
  assert.equal(caminhoDoProxyBackend('/api/backend-outro'), false)
  assert.equal(caminhoDoProxyBackend('/'), false)
})

test('routeRules e o devProxy usam os mesmos headers, e o hook da chave fica', () => {
  const cfg = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  const usos = cfg.split('CABECALHOS_JSON_DO_PROXY').length - 1
  assert.equal(usos, 3, 'import + routeRules.proxy.headers + devProxy.headers')
  assert.match(cfg, /x-forwarded-for|backend-front-key/)

  const plugin = readFileSync(new URL('../server/plugins/backend-front-key.ts', import.meta.url), 'utf8')
  assert.match(plugin, /MARCADOR_BUILD_PROXY/)
  assert.match(plugin, /x-forwarded-for/)
  assert.match(plugin, /x-redentia-front-key/)
  assert.match(plugin, /headers\[FRONT_KEY_HEADER\] = key/)
})
