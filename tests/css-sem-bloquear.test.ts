/**
 * Folha de estilo já embutida no HTML não pode segurar a primeira pintura.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cssSemBloquear } from '../server/utils/css-sem-bloquear.ts'

test('o link de CSS deixa de bloquear e o resto do head fica', () => {
  const html = [
    '<link rel="preload" href="/fonts/figtree-latin.woff2" as="font">',
    '<link rel="stylesheet" href="/_nuxt/entry.css" crossorigin>',
    '<link rel="modulepreload" as="script" href="/_nuxt/app.js">',
    '<link rel="stylesheet" href="/ja.css" media="print">',
  ].join('')
  const out = cssSemBloquear(html)
  assert.match(out, /rel="preload"/)
  assert.match(out, /rel="modulepreload"/)
  assert.match(out, /href="\/_nuxt\/entry\.css" crossorigin media="print" onload="this\.media='all'"/)
  assert.match(out, /href="\/ja\.css" media="print">/)
  assert.doesNotMatch(out, /onload="this\.media='all'"><link rel="stylesheet" href="\/ja/)
})
