/**
 * O fecho do rodapé (13/11/2026): a esteira de ativos, cada um dentro da
 * bandeira da marca, uma fila em cima e outra embaixo do wordmark gigante, que
 * vai de beira a beira da tela. O que este teste segura é o contrato da peça:
 * ornamento (sem preço, sem link, fora da leitura de tela), movimento que custa
 * pouco e para, ícone pedido só perto do rodapé, e tudo em token.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ATIVOS_DO_RODAPE, iconeDoAtivo } from '../app/content/rodape-ativos.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const esteira = ler('app/components/nu/rodape/NuRodapeEsteira.vue')
const rodape = ler('app/components/nu/NuFooterAportou.vue')
const molde = (s: string) => s.slice(s.indexOf('<template>'), s.lastIndexOf('</template>'))
const estilo = (s: string) => s.slice(s.indexOf('<style scoped>'))

test('os ativos da esteira: duas filas de 16 tickers da B3, sem repetir', () => {
  assert.equal(ATIVOS_DO_RODAPE.length, 2, 'uma fila em cima e outra embaixo do wordmark')
  const todos = ATIVOS_DO_RODAPE.flat()
  for (const fila of ATIVOS_DO_RODAPE) assert.equal(fila.length, 16)
  assert.equal(new Set(todos).size, todos.length, 'ticker repetido')
  // ticker da B3: quatro caracteres (letra primeiro; B3SA3 e M1TA34 têm número no meio) e o sufixo
  for (const t of todos) assert.match(t, /^[A-Z][A-Z0-9]{3}\d{1,2}$/, t)
  // a de cima é de ações (3, 4 e units 11 de empresa); a de baixo, de fundos, ETFs e BDRs (11 e 34)
  for (const t of ATIVOS_DO_RODAPE[1]!) assert.match(t, /(11|34)$/, t)
  assert.equal(iconeDoAtivo('petr4'), 'https://icons.brapi.dev/icons/PETR4.svg')
})

test('a esteira é ornamento: sem link, sem preço, fora da leitura de tela, com uma frase no lugar', () => {
  const m = molde(esteira)
  // sem link (o rodapé é o maior distribuidor de link interno do site: 32 links novos por página são decisão de SEO)
  assert.doesNotMatch(m, /<a\b|<NuxtLink\b|\bhref=|\bto=/)
  // sem cotação: nada de preço nem de variação (o `%` do molde é só a conta de qual fila é a de baixo)
  assert.doesNotMatch(m, /R\$|change|price|varia/i)
  assert.doesNotMatch(m.replace('k % 2 === 1', ''), /%/)
  // as filas ficam fora da leitura de tela, e uma frase diz o que são
  assert.match(m, /<div class="nre__fila" :class="\{ 'nre__fila--volta': k % 2 === 1 \}" aria-hidden="true">/)
  assert.match(m, /<p class="nu-sr">Ações, fundos imobiliários, ETFs e BDRs negociados na B3\.<\/p>/)
  // o dono tirou o título de cima ("pode remover isso")
  assert.doesNotMatch(m, /NuEyebrow|O que a Aportou acompanha/)
  // cada fila entra duas vezes (a volta não tem emenda) e o que vier no slot fica entre a de cima e a de baixo
  assert.match(m, /v-for="\(t, i\) in \[\.\.\.fila, \.\.\.fila\]"/)
  assert.match(m, /<slot v-if="k === 1" \/>/)
})

test('cada ativo vai dentro da bandeira da marca, pintada pelo próprio ícone', () => {
  const m = molde(esteira)
  const css = estilo(esteira)
  // a bandeira é o corte do "t": o mesmo desenho do MarcaCorte, como máscara
  const corte = ler('app/components/marca/MarcaCorte.vue').match(/<path d="([^"]+)"/)![1]!
  assert.ok(css.includes(`%3Cpath d='${corte}'/%3E`), 'o recorte da bandeira não é o desenho do MarcaCorte')
  // o ícone entra como border-image com fill (a beirada estica e cobre o pano); nenhum <img>
  assert.doesNotMatch(m, /<img\b/)
  assert.match(m, /<span class="nre__pano" :style="\{ '--nre-icone': `url\(\$\{iconeDoAtivo\(t\)\}\)` \}" \/>/)
  assert.match(css, /\.nre--perto \.nre__pano \{ border-image: var\(--nre-icone\) 1 fill stretch; \}/)
  // sem o ícone: a bandeira no cobalto, com a primeira letra do ticker
  assert.match(m, /<span class="nre__reserva">\{\{ t\.slice\(0, 1\) \}\}<\/span>/)
  assert.match(css, /\.nre__reserva \{[^}]*background: var\(--nu-blue\);/)
  // o fio de 1px por fora segura a silhueta das bandeiras escuras
  assert.match(css, /\.nre__bandeira \{[^}]*background: var\(--nu-dark-chip-line\);/)
  assert.match(css, /\.nre__reserva, \.nre__pano \{\n  position: absolute; inset: 1px;/)
})

test('o movimento custa pouco: só transform, para fora da tela, some com movimento reduzido, e tem como pausar', () => {
  const css = estilo(esteira)
  assert.match(css, /animation: nre-anda var\(--nu-dur-esteira\) linear infinite; will-change: transform;/)
  assert.match(css, /@keyframes nre-anda \{ to \{ transform: translate3d\(-50%, 0, 0\); \} \}/)
  // a de baixo anda para o outro lado
  assert.match(css, /\.nre__fila--volta \.nre__trilho \{ animation-direction: reverse;/)
  // para fora da tela e no botão
  assert.match(css, /\.nre--parada \.nre__trilho \{ animation-play-state: paused; \}/)
  assert.match(esteira, /:class="\{ 'nre--parada': pausada \|\| !aVista, 'nre--perto': perto \}"/)
  assert.match(esteira, /new IntersectionObserver\(\(\[e\]\) => \{ aVista\.value = !!e\?\.isIntersecting \}/)
  // os ícones só são pedidos quando o rodapé chega perto, e ficam
  assert.match(esteira, /if \(e\?\.isIntersecting\) \{ perto\.value = true; chegando\.disconnect\(\) \}/)
  // movimento reduzido: nada anda
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[^@]*\.nre__trilho \{ animation: none; \}/)
  // o botão de pausa existe para o teclado e só aparece com o foco (WCAG 2.2.2)
  assert.match(esteira, /<button type="button" class="nre__pausa" :aria-pressed="pausada" @click="pausada = !pausada">Pausar o movimento dos ativos<\/button>/)
  assert.match(css, /\.nre__pausa:not\(:focus-visible\) \{[^}]*clip-path: inset\(50%\);/)
  // a duração é token
  assert.match(ler('app/assets/css/tokens.css'), /--nu-dur-esteira: 90s;/)
})

test('a esteira só usa token: sem cor em hex, sem peso em número, sem curva nem tempo à mão', () => {
  // o recorte da bandeira é um SVG embutido (sem cor): sai da conta
  const css = estilo(esteira).replace(/url\("data:image\/svg\+xml[^"]*"\)/g, 'url()')
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'cor em hex')
  assert.doesNotMatch(css, /font-weight:\s*\d/, 'peso em número')
  assert.doesNotMatch(css, /font-size:\s*\d/, 'tamanho de letra fora da escala')
  assert.doesNotMatch(css, /cubic-bezier|\b\d+(\.\d+)?m?s\s+(ease|linear)/, 'curva ou tempo à mão')
})

test('o rodapé fecha com a fila de cima, o wordmark na largura da tela e a fila de baixo', () => {
  const m = molde(rodape)
  // fora da coluna: a esteira é irmã do .nfa__in, e o wordmark vai no slot dela
  assert.match(m, /<\/div>\n\n    <!-- o fecho da marca[^\n]*-->\n    <NuRodapeEsteira class="nfa__esteira">\n      <svg v-revelar="\{ y: 24 \}" class="nfa__gigante" viewBox="-2 -40 681 142" role="img" aria-label="aportou">/)
  const css = estilo(rodape)
  assert.match(css, /\.nfa__gigante \{\n  display: block; width: 100%; overflow: visible;/)
  // as letras em degradê, o corte no cobalto
  assert.match(m, /<linearGradient :id="idDoDegrade" gradientUnits="userSpaceOnUse"/)
  assert.match(css, /\.nfa__gigante-corte \{ fill: var\(--nu-blue\); \}/)
  // a bandeira do "t" sobe com a rolagem, só onde o navegador sabe e sem movimento reduzido
  assert.match(css, /@supports \(animation-timeline: view\(\)\) \{\n  @media \(prefers-reduced-motion: no-preference\) \{\n    \.nfa__gigante-corte \{ animation: nfa-hasteia linear both; animation-timeline: --nfa-marca; animation-range: entry 10% entry 100%; \}/)
  assert.match(css, /view-timeline: --nfa-marca block;/)
  // o recorte do rodapé é clip: com hidden ele viraria a caixa de rolagem do wordmark e a bandeira não subiria
  assert.match(css, /\.nfa \{[^}]*overflow: hidden; overflow: clip; \}/)
  // as colunas de links seguem como estavam (são decisão de SEO)
  assert.match(m, /<NuxtLink v-for="l in col\.links" :key="l\.label" :to="l\.to" class="nfa__link">\{\{ l\.label \}\}<\/NuxtLink>/)
})
