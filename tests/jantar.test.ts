/**
 * Landing /jantar. Fatos travados, CTA no WhatsApp, sitemap de páginas.
 * O texto público não diz quem organiza e não inventa número.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pagina = readFileSync(new URL('../app/pages/jantar.vue', import.meta.url), 'utf8')
const layout = readFileSync(new URL('../app/layouts/jantar.vue', import.meta.url), 'utf8')
const paginas = readFileSync(new URL('../server/utils/site-pages.ts', import.meta.url), 'utf8')
const cache = readFileSync(new URL('../server/middleware/cache-sessao.ts', import.meta.url), 'utf8')
const nav = readFileSync(new URL('../app/components/nu/NuHeader.vue', import.meta.url), 'utf8')

const template = pagina.slice(pagina.indexOf('<template>'), pagina.lastIndexOf('</template>'))
const descricao = 'Mesa fechada em São Paulo, dezembro, data a combinar. 10 cadeiras, uma mesa, nenhuma palestra. Convite sob curadoria. Jantar a R$ 600, só após a aprovação.'
const fila = 'https://wa.me/5511951495841?text=Oi%20Andr%C3%A9%2C%20quero%20saber%20mais%20sobre%20o%20Redentia%20Wealth%20Intelligence%20Dinner'

test('a página usa o layout com nav e rodapé do site e não entra no menu', () => {
  assert.match(pagina, /layout:\s*'jantar'/)
  assert.match(layout, /<NuHeader\s*\/>/)
  assert.match(layout, /<NuFooter\s*\/>/)
  assert.doesNotMatch(nav, /\/jantar/)
})

test('o CTA é a fila no WhatsApp, em aba nova, sem formulário', () => {
  assert.ok(pagina.includes(fila))
  assert.doesNotMatch(template, /André|Andre/i)
  const anchors = template.match(/<a\b[^>]*>/g) ?? []
  assert.ok(anchors.length >= 3)
  for (const a of anchors) {
    assert.match(a, /:href="fila"/)
    assert.match(a, /target="_blank"/)
    assert.match(a, /rel="noopener noreferrer"/)
  }
  assert.equal((template.match(/Entrar na fila/g) ?? []).length, anchors.length)
  assert.doesNotMatch(template, /<form\b|<input\b|<textarea\b|<select\b/i)
})

test('a copy fica nos fatos travados', () => {
  assert.match(template, /Mesa fechada\. Convite sob curadoria\. Conversa entre quem decide\. Poucas cadeiras, nenhuma por acaso\./)
  assert.match(template, /A próxima mesa já está posta\. Reserve sua cadeira\./)
  assert.match(template, /Nem todo mundo senta nesta mesa\./)
  assert.match(template, /A cadeira não se compra\. Se conquista pela trajetória\./)
  assert.match(template, /Não é evento\. É uma mesa fechada\./)
  assert.match(pagina, /conversa de 20 minutos/)
  assert.match(pagina, /R\$\\u00A0600/)
  assert.match(pagina, /Você já corre assessoria, family office, banco ou gestora\./)
  assert.match(pagina, /Você chega para somar, não para vender\./)
  assert.doesNotMatch(pagina, /450|350|40\+|organiz|depoimento|rentabilidade|recomend|clientes|\bCVM\b|\bB3\b/i)
  assert.equal(descricao.length <= 160, true, String(descricao.length))
})

test('a URL entra no sitemap de páginas, com o mesmo título e a mesma description', () => {
  assert.match(paginas, /path: '\/jantar'/)
  assert.match(paginas, /title: 'Redentia Wealth Intelligence Dinner'/)
  assert.ok(paginas.includes(descricao))
  assert.ok(pagina.includes(descricao))
  assert.match(pagina, /path: '\/jantar'/)
  assert.match(cache, /'\/jantar': HORA/)
})
