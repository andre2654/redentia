/**
 * Convite da newsletter e aviso de cookies não ficam por cima do rodapé.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  bannerCookiesEmFluxo,
  exibirConviteFlutuante,
  folgaDoBannerNoRodape,
} from '../app/utils/rodape-flutuantes.ts'

test('o convite some quando o rodapé entra na tela', () => {
  assert.equal(exibirConviteFlutuante(true, false), true)
  assert.equal(exibirConviteFlutuante(true, true), false)
  assert.equal(exibirConviteFlutuante(false, false), false)
  assert.equal(exibirConviteFlutuante(false, true), false)
})

test('o banner de cookies só sai do fixed no desktop, com rodapé e âncora', () => {
  const base = { aberto: true, rodapeNaTela: true, desktop: true, temAncora: true }
  assert.equal(bannerCookiesEmFluxo(base), true)
  assert.equal(bannerCookiesEmFluxo({ ...base, aberto: false }), false)
  assert.equal(bannerCookiesEmFluxo({ ...base, rodapeNaTela: false }), false)
  assert.equal(bannerCookiesEmFluxo({ ...base, desktop: false }), false)
  assert.equal(bannerCookiesEmFluxo({ ...base, temAncora: false }), false)
})

test('a folga do rodapé é a altura do banner, e zero quando ele não está nessa folga', () => {
  assert.equal(folgaDoBannerNoRodape(true, 96), 96)
  assert.equal(folgaDoBannerNoRodape(true, 96.4), 97)
  assert.equal(folgaDoBannerNoRodape(true, 0), 0)
  assert.equal(folgaDoBannerNoRodape(false, 96), 0)
})

test('o modal de onboarding fecha com Esc, clique fora e botão com aria-label Fechar', () => {
  const src = readFileSync(new URL('../app/components/nu/NuOnboardingModal.vue', import.meta.url), 'utf8')
  assert.match(src, /aria-label="Fechar"/)
  assert.match(src, /e\.key === 'Escape'/)
  assert.match(src, /@click\.self="dispensar"/)
  assert.match(src, /NEWSLETTER_SEGURA_ONBOARDING/)
})

test('o convite usa o observador do rodapé e fecha depois da assinatura', () => {
  const src = readFileSync(new URL('../app/components/nu/NuNewsletterConvite.vue', import.meta.url), 'utf8')
  assert.match(src, /exibirConviteFlutuante/)
  assert.match(src, /useRodapeNaTela/)
  assert.match(src, /@ja-assinante="fechar"/)
})

test('o banner reserva no rodapé a própria altura quando ele está visível', () => {
  const src = readFileSync(new URL('../app/components/consent/ConsentBanner.vue', import.meta.url), 'utf8')
  assert.match(src, /folgaDoBannerNoRodape/)
  assert.match(src, /paddingBottom/)
  assert.match(src, /Aceitar/)
  assert.match(src, /Recusar/)
  assert.match(src, /Análise e anúncios só com a sua escolha\./)
})
