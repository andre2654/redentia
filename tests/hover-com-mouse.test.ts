import { test } from 'node:test'
import assert from 'node:assert/strict'
import postcss from 'postcss'
import hoverComMouse from '../postcss/hover-com-mouse.mjs'

const rodar = async (css: string) => (await postcss([hoverComMouse()]).process(css, { from: undefined })).css
const limpo = (css: string) => css.replace(/\s*([{};])\s*/g, '$1').replace(/\s+/g, ' ').trim()

test('regra só com :hover vai inteira para dentro de @media (hover: hover), no mesmo lugar', async () => {
  const saida = await rodar('.a { color: red } .a:hover { color: blue } .a.ativo { color: green }')
  assert.equal(limpo(saida), limpo('.a { color: red } @media (hover: hover) { .a:hover { color: blue } } .a.ativo { color: green }'))
})

test('numa lista, só os seletores com :hover entram; :focus-visible continua valendo no toque', async () => {
  const saida = await rodar('.b:hover, .b:focus-visible { outline: 0 }')
  assert.equal(limpo(saida), limpo('.b:focus-visible { outline: 0 } @media (hover: hover) { .b:hover { outline: 0 } }'))
})

test('regra que já está num @media de hover não é embrulhada de novo', async () => {
  const css = '@media (hover: hover) { .c:hover { color: red } }'
  assert.equal(limpo(await rodar(css)), limpo(css))
})

test('dentro de outro @media, o hover ganha o seu @media aninhado e o resto fica', async () => {
  const saida = await rodar('@media (max-width: 600px) { .d { color: red } .d:hover { color: blue } }')
  assert.equal(limpo(saida), limpo('@media (max-width: 600px) { .d { color: red } @media (hover: hover) { .d:hover { color: blue } } }'))
})

test('CSS sem :hover sai igual', async () => {
  const css = '.e { color: red } @keyframes k { from { opacity: 0 } to { opacity: 1 } }'
  assert.equal(limpo(await rodar(css)), limpo(css))
})
