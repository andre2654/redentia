import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CONSENT_COOKIE,
  CONSENT_POLICY_VERSION,
  consentimentoNoCookie,
  interpretarConsentimento,
  serializarConsentimento,
  valorDoCookie,
} from '../app/utils/consent.ts'
import { isPaidLanding } from '../app/utils/paid-landing.ts'

test('a escolha só vale com a versão atual da política', () => {
  assert.equal(interpretarConsentimento(serializarConsentimento('granted')), 'granted')
  assert.equal(interpretarConsentimento(serializarConsentimento('denied')), 'denied')
  assert.equal(interpretarConsentimento(null), null)
  assert.equal(interpretarConsentimento(''), null)
  assert.equal(interpretarConsentimento('granted'), null)
  assert.equal(interpretarConsentimento('1.maybe'), null)
  assert.equal(interpretarConsentimento(`9.granted`), null)
  assert.equal(interpretarConsentimento('"1.granted"'), 'granted')
  assert.equal(CONSENT_POLICY_VERSION, '1')
})

test('o cookie de consentimento não se confunde com outro e sobrevive ao encode', () => {
  const header = `nu:token=abc; ${CONSENT_COOKIE}=${encodeURIComponent('1.denied')}; redentia_consent_extra=1.granted`
  assert.equal(valorDoCookie(header, CONSENT_COOKIE), '1.denied')
  assert.equal(consentimentoNoCookie(header), 'denied')
  assert.equal(consentimentoNoCookie(''), null)
})

test('visita paga continua reconhecida pelos cliques e pelo utm_medium', () => {
  assert.equal(isPaidLanding('?gclid=1'), true)
  assert.equal(isPaidLanding('?li_fat_id=abc'), true)
  assert.equal(isPaidLanding('?utm_medium=cpc&utm_source=teste'), true)
  assert.equal(isPaidLanding('?utm_medium=paid-social'), true)
  assert.equal(isPaidLanding('?utm_medium=organic'), false)
  assert.equal(isPaidLanding('?utm_source=teste'), false)
  assert.equal(isPaidLanding(''), false)
})
