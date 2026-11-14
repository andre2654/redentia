/**
 * A linha da prova com valor de frase (08/11/2026): o "Por que parei" dos
 * ajustes tem até ~33 palavras e, lado a lado, espremia o rótulo em três
 * linhas. Acima de 60 caracteres, o valor desce para baixo do rótulo.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const fonte = readFileSync(new URL('../app/components/carteira/visao/CarteiraAvisos.vue', import.meta.url), 'utf8')

test('valor longo da prova empilha embaixo do rótulo', () => {
  assert.match(fonte, /const provaLonga = \(valor: string\) => valor\.length > 60/)
  assert.match(fonte, /:class="\{ 'cav__prova-l--frase': provaLonga\(p\.valor\) \}"/)
  assert.match(fonte, /\.cav__prova-l--frase \{ flex-direction: column;/)
  assert.match(fonte, /\.cav__prova-l--frase dd \{ text-align: left;/)
})
