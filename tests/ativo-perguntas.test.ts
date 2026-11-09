/**
 * As perguntas do /asset no idioma do FAQ da /teses (03/11/2026). O desenho
 * mudou; o SEO não: os mesmos títulos no mesmo nível, todas as respostas no
 * HTML do servidor e o mesmo FAQPage. O botão abre o painel do chat com o ativo.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('AtivoPerguntas: o título grande é o H2 de antes, as respostas em <details> e o FAQPage igual', () => {
  const src = ler('app/components/ativo/AtivoPerguntas.vue')
  const tpl = src.slice(src.indexOf('<template>'), src.indexOf('<style'))
  assert.match(tpl, /<h2 class="apg__h2">Perguntas frequentes sobre \{\{ ticker \}\}<\/h2>/)
  assert.match(tpl, /<h2 class="apg__h2">\{\{ resumo!\.faqTitulo \}\}<\/h2>/)
  assert.match(tpl, /<h3 class="apg__h3">\{\{ f\.q \}\}<\/h3>/)
  assert.equal((tpl.match(/<h2\b/g) ?? []).length, 2, 'nenhum H2 novo ("Ficou com alguma dúvida?")')
  // as respostas sempre no HTML: <details>, nunca v-if nelas
  assert.equal((tpl.match(/<details\b/g) ?? []).length, 2)
  assert.doesNotMatch(tpl, /<p[^>]*v-if[^>]*class="apg__a"|class="apg__a"[^>]*v-if/)
  assert.match(src, /if \(props\.editorial\?\.faq\.length\) useFaqSchema\(props\.editorial\.faq\)\nelse if \(props\.resumo\?\.faq\.length\) useFaqSchema\(props\.resumo\.faq\)/)
  assert.match(tpl, /@click="emit\('perguntar'\)">Perguntar à Redentia AI</)
})

test('AtivoNoite: a seção de perguntas abre o painel com o ativo e mantém o gancho e o "veja também"', () => {
  const src = ler('app/components/ativo/AtivoNoite.vue')
  assert.match(src, /<AtivoPerguntas [^>]*@perguntar="abrirCom\(\)"/)
  const sec = src.slice(src.indexOf('<section id="perguntas"'), src.indexOf('</section>', src.indexOf('<section id="perguntas"')))
  assert.match(sec, /<SeguirGancho /)
  assert.match(sec, /<AtivoVejaTambem /)
  // a faixa fecha sempre em creme
  assert.match(src, /out\.perguntas = 'creme'\n  return out/)
})
