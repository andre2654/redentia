/**
 * A geometria da marca no losango do dia (04/11/2026): as medidas que
 * saíram do SVG do logo e as contas que põem as peças no desenho.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LOGO, PECAS_DO_LOGO, transformDoLogo } from '../app/utils/marcaRedentia.ts'

test('as peças são as do SVG da marca, sem tirar nem pôr', () => {
  const svg = readFileSync(new URL('../public/logo-azul.svg', import.meta.url), 'utf8')
  for (const d of Object.values(PECAS_DO_LOGO)) assert.ok(svg.includes(`d="${d}"`), d.slice(0, 24))
})

test('as proporções do logo: quadrado a 45°, miolo de 0,43 e abas de 0,27', () => {
  // a borda de fora da metade da esquerda: x + y = 99,6 (a 45°)
  assert.ok(Math.abs((71.387 + 28.2132) - (2.40387 + 97.1954)) < 0.01)
  // o raio vivo de fora: 206 − 99,6
  assert.ok(Math.abs(LOGO.raioVivo - (206 - 99.6)) < 0.01)
  // a borda de dentro: x + y = 153,34, o miolo vivo é 206 − 153,34
  assert.ok(Math.abs(LOGO.mioloVivo - (206 - (97.2354 + 56.1042))) < 0.01)
  // o canto do miolo leva a ponta a ~44,5 (0,43 do raio)
  assert.ok(Math.abs(LOGO.mioloVivo - (Math.SQRT2 - 1) * LOGO.cantoDoMiolo - LOGO.miolo) < 0.2)
  assert.ok(Math.abs(LOGO.miolo / LOGO.raio - 0.432) < 0.005)
  assert.ok(Math.abs(LOGO.meiaAba / LOGO.raio - 0.266) < 0.005)
  assert.ok(Math.abs(LOGO.faixa - (LOGO.raioVivo - LOGO.mioloVivo) / Math.SQRT2) < 0.1)
  // as metades vão de 22,8 a 183,3
  assert.ok(Math.abs(LOGO.alcanceDasMetades - (183.302 - 22.7979) / 2) < 0.01)
})

test('o transform põe o logo de 206 no tamanho e no centro pedidos', () => {
  assert.equal(transformDoLogo(160, 96, 206), 'translate(57 -7) scale(1)')
  assert.equal(transformDoLogo(100, 100, 103), 'translate(48.5 48.5) scale(0.5)')
})
