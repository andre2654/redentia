/**
 * O leque dos 2.000 caminhos não pode travar o fio principal na entrada da
 * home. O desenho final é o mesmo: um lote por quadro, e a fonte só repinta
 * o texto (os caminhos não usam a Figtree).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../app/components/home/HomeLeque.vue', import.meta.url), 'utf8')

test('os caminhos saem em lotes, fora do fio da hidratação', () => {
  assert.match(src, /const LOTE = 80/)
  assert.match(src, /loteRaf = requestAnimationFrame\(passo\)/)
  assert.match(src, /requestAnimationFrame\(\(\) => \{\n    leque = sortear\(props\.caminhos\)\n    preparar\(\)\n  \}\)/)
})

test('a fonte pronta não redesenha os 2.000 caminhos', () => {
  assert.match(src, /document\.fonts\?\.ready\.then\(\(\) => \{ if \(quadroPronto\) pintar\(progresso\) \}\)/)
  assert.doesNotMatch(src, /fonts\?\.ready\.then\(\(\) => preparar\(\)\)/)
})

test('a caixa reserva o tamanho antes do desenho', () => {
  assert.match(src, /\.hlq \{ position: relative; width: 100%; aspect-ratio: 16 \/ 10;/)
})
