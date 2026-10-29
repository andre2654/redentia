/**
 * O PUT /me/notification-preferences que liga a newsletter leva a versão do
 * texto de aceite e o lugar do formulário. A versão é a data do commit que
 * introduziu o texto atual (34fe7b17, 21/10/2026, PRs #87–#89).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  NEWSLETTER_CONSENT_VERSION,
  ORIGENS_DA_NEWSLETTER,
  corpoInscricaoNewsletter,
  origemDaNewsletter,
} from '../app/composables/useNewsletter.ts'

const CORPO = {
  topic: 'newsletter',
  email: true,
  whatsapp: false,
  consent_version: '2026-10-21',
}

test('a versão do aceite é a data do texto atual', () => {
  assert.equal(NEWSLETTER_CONSENT_VERSION, '2026-10-21')
})

test('o PUT liga o tópico e leva a versão e a origem do aceite', () => {
  for (const origem of ORIGENS_DA_NEWSLETTER) {
    assert.deepEqual(corpoInscricaoNewsletter(origem), { ...CORPO, consent_source: origem })
  }
})

test('origem ausente ou desconhecida cai no padrão seguro', () => {
  for (const origem of [undefined, null, '', 'home', 'preco-teto']) {
    assert.equal(origemDaNewsletter(origem), 'bloco')
    assert.deepEqual(corpoInscricaoNewsletter(origem), { ...CORPO, consent_source: 'bloco' })
  }
})

test('ligarTopico manda esse corpo no PUT das preferências', () => {
  const src = readFileSync(new URL('../app/composables/useNewsletter.ts', import.meta.url), 'utf8')
  const fn = src.slice(src.indexOf('function ligarTopico'), src.indexOf('function concluir'))
  assert.match(fn, /\/me\/notification-preferences/)
  assert.match(fn, /method:\s*'PUT'/)
  assert.match(fn, /body:\s*corpoInscricaoNewsletter\(fonte\)/)
  assert.match(src, /gtag\?\.\('event', 'newsletter_assinatura', \{ origem: fonte, source: fonte, conta: fim\.value \}\)/)
})

test('cada formulário declara a origem do aceite', () => {
  const ler = (caminho: string) => readFileSync(new URL(caminho, import.meta.url), 'utf8')
  assert.match(ler('../app/components/nu/NuNewsletterBand.vue'), /origem="guias"/)
  assert.match(ler('../app/components/nu/NuFooter.vue'), /origem="rodape"/)
  assert.match(ler('../app/components/nu/NuNewsletterConvite.vue'), /origem="convite"/)
  assert.match(ler('../app/components/calc/CalcCapturaTeto.vue'), /useNewsletter\('bloco'\)/)
  assert.match(ler('../app/components/nu/NuNewsletterForm.vue'), /origem:\s*'bloco'/)
})
