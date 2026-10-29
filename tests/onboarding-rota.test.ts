/**
 * Na troca de rota o onboarding volta a passar por check(). /business (e o
 * que está abaixo) e /login não reabrem o modal.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { onboardingForaDaRota } from '../app/utils/onboarding.ts'

test('o onboarding fica fora do /business e do /login', () => {
  assert.equal(onboardingForaDaRota('/business'), true)
  assert.equal(onboardingForaDaRota('/business/'), true)
  assert.equal(onboardingForaDaRota('/business/clientes'), true)
  assert.equal(onboardingForaDaRota('/business/chaves'), true)
  assert.equal(onboardingForaDaRota('/login'), true)
  for (const caminho of ['/', '/guias', '/rankings', '/carteira', '/logins']) {
    assert.equal(onboardingForaDaRota(caminho), false, caminho)
  }
})

test('a troca de rota chama check() e não força o modal aberto', () => {
  const src = readFileSync(new URL('../app/components/nu/NuOnboardingModal.vue', import.meta.url), 'utf8')
  const watch = src.slice(src.indexOf('watch(() => route.path'), src.indexOf('watch(naFolha'))
  assert.match(watch, /void check\(\)/)
  assert.doesNotMatch(watch, /open\.value = true/)
  assert.match(src, /onboardingForaDaRota\(route\.path\)/)
})
