/**
 * O lado a lado do "Quanto ele te paga" (08/11/2026). Sem os 5 anos, o mês a
 * mês e o mês corrente ficavam lado a lado num grid que encaixava os filhos em
 * duas linhas (grid-auto-flow: column). A legenda por tipo entrou como um filho
 * a mais e empurrou o "Em novembro, já marcados" e o "Próximo" para uma
 * terceira coluna: o gráfico ficou com 200 px e os valores quebraram em cima
 * uns dos outros. Agora cada parte tem a sua caixa (.vrd__parte), e a grade não
 * depende de quantos filhos ela tem.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const fonte = readFileSync(new URL('../app/components/carteira/visao/VisaoRenda.vue', import.meta.url), 'utf8')

test('o mês a mês e o mês corrente moram em duas caixas dentro da coluna', () => {
  const col = fonte.slice(fonte.indexOf('<div class="vrd__col">'), fonte.indexOf('<!-- daqui a 5 anos -->'))
  // as duas caixas ganharam nome (10/11, o foco no mês a cair): --meses e --marcados, a primeira com o ref da rolagem
  const caixas = [...col.matchAll(/<div (?:ref="\w+" )?class="vrd__parte(?: vrd__parte--\w+)?">/g)]
  assert.equal(caixas.length, 2)
  // a legenda, as barras e o mês clicado ficam dentro das partes
  const p1 = caixas[0]!.index!
  const p2 = caixas[1]!.index!
  assert.ok(col.indexOf('vrd__classes') > p1 && col.indexOf('vrd__classes') < p2)
  assert.ok(col.indexOf('vrd__meses') > p1 && col.indexOf('vrd__meses') < p2)
  assert.ok(col.indexOf('já marcados') > p2)
})

test('o lado a lado não conta filhos: sem grid-auto-flow nem linhas fixas', () => {
  const regra = fonte.match(/\.vrd__grade--lado \.vrd__col \{[^}]*\}/)?.[0] ?? ''
  assert.match(regra, /grid-template-columns: repeat\(2/)
  assert.doesNotMatch(regra, /grid-auto-flow/)
  assert.doesNotMatch(regra, /grid-template-rows/)
})

test('o rótulo do mês não quebra a linha, e com o gráfico estreito o "R$ " sai', () => {
  assert.match(fonte, /\.vrd__mes-v, \.vrd__mes-n \{ white-space: nowrap; \}/)
  assert.match(fonte, /@container \(max-width: \d+px\) \{\s*\.vrd__mes-rs, \.vrd__mes-acair \{ display: none; \}/)
  assert.match(fonte, /<span class="vrd__mes-rs">R\$ <\/span>/)
})
