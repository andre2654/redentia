/**
 * Landing /jantar. Fatos travados, CTA no WhatsApp, sitemap de páginas.
 * O texto público não diz quem organiza e não inventa número.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const pagina = readFileSync(new URL('../app/pages/jantar.vue', import.meta.url), 'utf8')
const layout = readFileSync(new URL('../app/layouts/jantar.vue', import.meta.url), 'utf8')
const paginas = readFileSync(new URL('../server/utils/site-pages.ts', import.meta.url), 'utf8')
const cache = readFileSync(new URL('../server/middleware/cache-sessao.ts', import.meta.url), 'utf8')
const nav = readFileSync(new URL('../app/components/nu/NuHeader.vue', import.meta.url), 'utf8')

const template = pagina.slice(pagina.indexOf('<template>'), pagina.lastIndexOf('</template>'))
const descricao = 'Mesa fechada em São Paulo, dezembro, data a combinar. 10 cadeiras, uma mesa, nenhuma palestra. Convite sob curadoria. Jantar a R$ 600, só após a aprovação.'
const fila = 'https://wa.me/5511951495841?text=Oi%20Andr%C3%A9%2C%20quero%20saber%20mais%20sobre%20o%20Redentia%20Wealth%20Intelligence%20Dinner'

test('o aviso de cookies fica abaixo do header, como no resto do site, e não no rodapé', () => {
  const recorte = (src: string) => src.slice(src.indexOf('<template>'), src.lastIndexOf('</template>'))
  const jantarTpl = recorte(layout)
  const padrao = recorte(readFileSync(new URL('../app/layouts/default.vue', import.meta.url), 'utf8'))
  assert.match(padrao, /<NuHeader\s*\/>[\s\S]*?<ConsentBanner\s*\/>[\s\S]*?<main>/)
  assert.doesNotMatch(padrao.slice(padrao.lastIndexOf('<NuFooter')), /ConsentBanner/)
  assert.match(jantarTpl, /<\/header>[\s\S]*?<ConsentBanner\s*\/>[\s\S]*?<main>/)
  assert.doesNotMatch(jantarTpl.slice(jantarTpl.indexOf('class="jt-foot"')), /ConsentBanner/)
  assert.equal((jantarTpl.match(/<ConsentBanner\b/g) ?? []).length, 1)
  assert.doesNotMatch(pagina, /<ConsentBanner\b/)
})

test('a página usa o layout do jantar, com rodapé do site, e não entra no menu', () => {
  assert.match(pagina, /layout:\s*'jantar'/)
  assert.doesNotMatch(layout, /<NuHeader/)
  // o jantar é da Redentia (escritórios): desde 11/11/2026 o rodapé do site de
  // investidor é o da Aportou, e o jantar usa a variante business, com a marca dele
  assert.match(layout, /<NuFooter variante="business"\s*\/>/)
  assert.doesNotMatch(nav, /\/jantar/)
  assert.doesNotMatch(layout.slice(layout.indexOf('<template>')), /Início|Teses|Criar conta|Ferramentas/)
})

test('o CTA é a fila no WhatsApp, em aba nova, sem formulário', () => {
  assert.ok(pagina.includes(fila))
  assert.ok(layout.includes(fila))
  assert.doesNotMatch(template, /André|Andre/i)
  const layoutTpl = layout.slice(layout.indexOf('<template>'), layout.lastIndexOf('</template>'))
  const anchors = `${template}\n${layoutTpl}`.match(/<a\b[^>]*>/g) ?? []
  assert.equal(anchors.length, 4)
  for (const a of anchors) {
    assert.match(a, /:href="fila"/)
    assert.match(a, /target="_blank"/)
    assert.match(a, /rel="noopener noreferrer"/)
  }
  assert.equal((`${template}\n${layoutTpl}`.match(/Entrar na fila/g) ?? []).length, 4)
  assert.doesNotMatch(template, /<form\b|<input\b|<textarea\b|<select\b/i)
  assert.doesNotMatch(template, /quem já sentou|Edição inaugural/i)
  assert.match(template, />Imagem ilustrativa\.</)
  assert.match(pagina, /Mesa posta em restaurante, imagem ilustrativa/)
  assert.match(pagina, /Pratos de alta gastronomia, imagem ilustrativa/)
  assert.match(pagina, /Vinho sendo servido, imagem ilustrativa/)
  assert.match(pagina, /Taças e talheres, imagem ilustrativa/)
  for (const nome of ['mesa-posta', 'pratos', 'vinho', 'tacas']) {
    assert.equal(existsSync(new URL(`../public/img/jantar/${nome}.webp`, import.meta.url)), true, nome)
  }
})

test('a copy fica nos fatos travados', () => {
  const h1 = template.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0] ?? ''
  assert.match(h1, /O jantar dos/)
  assert.match(h1, /CEOs/)
  assert.match(h1, /de assessorias, family offices e gestoras\./)
  assert.doesNotMatch(h1, /A próxima mesa/)
  const apoio = template.indexOf('jt__apoio')
  const lead = template.indexOf('jt__lead')
  assert.ok(template.indexOf('<h1') < apoio && apoio < lead)
  assert.match(template, /class="jt__apoio">A próxima mesa já está posta\. Reserve sua cadeira\.<\/p>/)
  assert.match(template, /Mesa fechada\. Convite sob curadoria\. Conversa entre quem decide\. Poucas cadeiras, nenhuma por acaso\./)
  assert.match(template, /Nem todo mundo senta nesta mesa\./)
  assert.match(template, /A cadeira não se compra\. Se conquista pela trajetória\./)
  assert.match(template, /Não é evento\./)
  assert.match(template, /É uma mesa fechada\./)
  assert.match(pagina, /Sócios, diretores e C-level de assessorias, family offices, bancos e gestoras/)
  assert.match(pagina, /conversa de 20 minutos/)
  assert.match(pagina, /R\$\\u00A0600/)
  assert.match(pagina, /Você já corre assessoria, family office, banco ou gestora\./)
  assert.match(pagina, /Você chega para somar, não para vender\./)
  assert.doesNotMatch(pagina, /450|350|40\+|organiz|depoimento|rentabilidade|recomend|clientes|\bCVM\b|\bB3\b/i)
  assert.equal(descricao.length <= 160, true, String(descricao.length))
})

test('a página é navy contínuo, com pílula creme, e o header do produto não entra', () => {
  assert.match(pagina, /#0c1524/)
  assert.match(pagina, /#2f6aff/)
  assert.match(pagina, /#f5f1ea/)
  assert.match(pagina, /var\(--nu-font\)/)
  assert.match(pagina, /background:\s*#f5f1ea;\s*color:\s*#0c1524/)
  assert.match(layout, /logo-azul\.svg/)
  assert.match(layout, /background:\s*#f5f1ea;\s*color:\s*#0c1524/)
  assert.doesNotMatch(pagina, /3[Dd][Dd][Cc]97|Noto Serif|noto-serif|inter-latin|font-family:\s*Inter|jt__bloco--creme|jt__bloco--azul/)
  assert.doesNotMatch(layout, /3[Dd][Dd][Cc]97|Noto Serif|noto-serif|inter-latin|nuh-wrap|nuh__navitem/)
  assert.match(nav, /\.nuh-wrap \{[^}]*background:\s*var\(--nu-white\)/)
  // o header do produto é o "editorial calmo" de 02/11 (a marca é o NuTopoMarca, sem o quadrado azul)
  assert.match(nav, /<NuTopoMarca class="nuh__marca"/)
  assert.doesNotMatch(nav, /nuh__brand--clara|marcaClara/)
  assert.equal(existsSync(new URL('../public/fonts/inter-latin.woff2', import.meta.url)), false)
  assert.equal(existsSync(new URL('../public/fonts/noto-serif-display-latin.woff2', import.meta.url)), false)
})

test('a URL entra no sitemap de páginas, com o mesmo título e a mesma description', () => {
  assert.match(paginas, /path: '\/jantar'/)
  assert.match(paginas, /title: 'Redentia Wealth Intelligence Dinner'/)
  assert.ok(paginas.includes(descricao))
  assert.ok(pagina.includes(descricao))
  assert.match(pagina, /path: '\/jantar'/)
  assert.match(cache, /'\/jantar': HORA/)
})
