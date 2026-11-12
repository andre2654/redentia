/**
 * Convite da newsletter e aviso de cookies não ficam por cima do rodapé.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  bannerCookiesEmFluxo,
  folgaDoBannerNoRodape,
} from '../app/utils/rodape-flutuantes.ts'

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

test('o banner de cookies acompanha o rodapé', () => {
  const banner = readFileSync(new URL('../app/components/consent/ConsentBanner.vue', import.meta.url), 'utf8')
  assert.match(banner, /useRodapeNaTela/)
  assert.match(banner, /folgaDoBannerNoRodape/)
})

test('o banner reserva no rodapé a própria altura quando ele está visível', () => {
  const src = readFileSync(new URL('../app/components/consent/ConsentBanner.vue', import.meta.url), 'utf8')
  assert.match(src, /folgaDoBannerNoRodape/)
  assert.match(src, /paddingBottom/)
  assert.match(src, /Aceitar/)
  assert.match(src, /Recusar/)
  assert.match(src, /Análise e anúncios só com a sua escolha\./)
})

// Morava num teste do B2B, que saiu em 12/11/2026: é do layout padrão.
test('no layout padrão o aviso de cookies fica abaixo do header, e não no rodapé', () => {
  const layout = readFileSync(new URL('../app/layouts/default.vue', import.meta.url), 'utf8')
  const padrao = layout.slice(layout.indexOf('<template>'), layout.lastIndexOf('</template>'))
  assert.match(padrao, /<NuHeader\s*\/>[\s\S]*?<ConsentBanner\s*\/>[\s\S]*?<main>/)
  assert.doesNotMatch(padrao.slice(padrao.lastIndexOf('<NuFooter')), /ConsentBanner/)
})
