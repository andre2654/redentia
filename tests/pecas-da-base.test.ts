/**
 * As peças da base da robustez (11/11/2026, docs/aportou/robustez.md, seção 4):
 * NuTrilho, NuSelo, NuLinkSeta, NuMais, NuAcordeao e as classes globais. O que
 * cada uma promete e não pode se desfazer numa edição futura:
 *  - o trilho sai do servidor já com a escolhida pintada (a hidratação não pula)
 *    e o indicador desliza na curva e no tempo de "mudar de lugar";
 *  - o acordeão nunca tira o conteúdo do HTML (SEO), só o fecha com `inert`;
 *  - o FAQ segue emitindo o FAQPage e veste a Redentia (B2B) como antes;
 *  - cor só por token, peso só por token, curva e tempo só por token;
 *  - uma peça só para a mesma função: as cópias locais saíram.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const raiz = new URL('../', import.meta.url).pathname
const ler = (p: string) => readFileSync(join(raiz, p), 'utf8')
const estilo = (src: string) => src.slice(src.indexOf('<style'), src.lastIndexOf('</style>'))
const PECAS = ['NuTrilho', 'NuSelo', 'NuLinkSeta', 'NuMais', 'NuAcordeao'].map((n) => `app/components/nu/${n}.vue`)

test('o trilho sai do servidor com a escolhida pintada e o indicador desliza', () => {
  const t = ler('app/components/nu/NuTrilho.vue')
  // até o JS medir, quem pinta a escolhida é o fundo da própria opção
  assert.match(t, /\.ntr:not\(\.ntr--medido\) \.ntr__op--on[^{]*\{ background-color: var\(--ntr-pilula\)/)
  assert.match(t, /\.ntr--medido \.ntr__pilula \{ visibility: visible; \}/)
  // um indicador só, que muda de lugar em --nu-dur-lenta --nu-ease-troca (o espelho dos rótulos junto)
  assert.match(t, /transition: transform var\(--nu-dur-lenta\) var\(--nu-ease-troca\), width var\(--nu-dur-lenta\) var\(--nu-ease-troca\)/)
  assert.match(t, /\.ntr__espelho \{[^}]*transition: transform var\(--nu-dur-lenta\) var\(--nu-ease-troca\)/)
  // remede no tamanho e na fonte; teclado do grupo de rádio
  assert.match(t, /new ResizeObserver/)
  assert.match(t, /document\.fonts\?\.ready/)
  for (const k of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) assert.match(t, new RegExp(`'${k}'`))
  assert.match(t, /:role="papel === 'tablist' \? 'tab' : 'radio'"/)
  assert.match(t, /:aria-checked="papel === 'radiogroup' \? i === escolhida : undefined"/)
})

test('o acordeão fecha sem tirar o conteúdo do HTML', () => {
  const a = ler('app/components/nu/NuAcordeao.vue')
  assert.match(a, /:aria-expanded="aberto" :aria-controls="dobraId"/)
  assert.match(a, /:inert="!aberto \|\| undefined"/)
  assert.doesNotMatch(a, /v-if="aberto"|v-show="aberto"/)
  assert.match(a, /grid-template-rows: 0fr/)
  assert.match(a, /\.nac--aberto \.nac__dobra \{ grid-template-rows: 1fr; opacity: 1; \}/)
  assert.match(a, /grid-template-rows var\(--nu-dur-lenta\) var\(--nu-ease-troca\)/)
  // o "+" do NuMais gira 45° na mesma curva
  const m = ler('app/components/nu/NuMais.vue')
  assert.match(m, /transform: rotate\(45deg\)/)
  assert.match(m, /transition: transform var\(--nu-dur-lenta\) var\(--nu-ease-troca\)/)
  assert.match(m, /details\[open\] > summary \.nmx__x/)
})

test('o FAQ usa o acordeão da base, segue emitindo o FAQPage e veste a Redentia como antes', () => {
  const f = ler('app/components/nu/NuFaqAccordion.vue')
  assert.match(f, /<NuAcordeao\b/)
  assert.match(f, /if \(props\.schema\) useFaqSchema\(props\.items\)/)
  assert.match(f, /defaultOpen: 0/)
  // a Redentia (B2B): os cartões creme, o "+" solto e a resposta com nu-fade
  assert.match(f, /\.marca-redentia \.nfa__item \{ background: var\(--nu-cream\); border-radius: 18px; padding: 26px 28px; border-bottom: 0; \}/)
  assert.match(f, /\.marca-redentia \.nfa__a--open \{ animation: nu-fade \.3s ease both; \}/)
  assert.match(f, /\.marca-redentia \.nfa__item :deep\(\.nac__dobra\) \{ opacity: 1; transition: none; \}/)
})

test('o selo tem os sete tons, os dois tamanhos e a versão sobre o carvão', () => {
  const s = ler('app/components/nu/NuSelo.vue')
  for (const tom of ['azul', 'verde', 'vermelho', 'ambar', 'carvao', 'contorno']) assert.match(s, new RegExp(`\\.nsl--${tom} \\{`), tom)
  assert.match(s, /height: 28px/)
  assert.match(s, /:where\(\.nsl--p\) \{ height: 22px;/)
  assert.match(s, /\.nsl--escuro\.nsl--verde/)
})

test('o link com seta: alvo de 44px sem mexer no fluxo e outra aba com noopener', () => {
  const l = ler('app/components/nu/NuLinkSeta.vue')
  assert.match(l, /--nls-folga: max\(0px, calc\(\(44px - 1lh\) \/ 2\)\)/)
  assert.match(l, /padding: var\(--nls-folga\) 0; margin: calc\(var\(--nls-folga\) \* -1\) 0;/)
  assert.match(l, /target: '_blank', rel: 'noopener'/)
  assert.match(l, /\.nls:hover \.nls__seta \{ transform: translateX\(3px\); \}/)
})

test('as peças só usam token: nada de cor em hex, peso em número nem curva escrita no CSS', () => {
  for (const p of PECAS) {
    const css = estilo(ler(p))
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, `${p}: cor em hex`)
    assert.doesNotMatch(css, /font-weight:\s*\d/, `${p}: peso em número`)
    assert.doesNotMatch(css, /cubic-bezier|\b\d+(\.\d+)?m?s\s+(ease|linear)/, `${p}: curva ou tempo à mão`)
  }
})

test('as classes globais da robustez existem no base.css', () => {
  const b = ler('app/assets/css/base.css')
  for (const c of ['.nu-cartao', '.nu-cartao--branco', '.nu-cartao--vivo', '.nu-num', '.nu-sr', '.nu-legenda']) assert.ok(b.includes(`${c} {`) || b.includes(`${c}:`), c)
  assert.match(b, /\.nu-cartao--vivo:hover \{ transform: translateY\(-2px\); box-shadow: var\(--nu-shadow-card\); \}/)
  // descritor de @font-face não aceita var(): o peso da face fica escrito (senão ela cai no 400)
  const faces = b.match(/@font-face \{[^}]*\}/g) ?? []
  for (const f of faces) assert.doesNotMatch(f, /font-weight: var\(/)
})

test('uma peça só para a mesma função: as cópias locais saíram e ninguém as chama', () => {
  for (const p of ['app/components/ranking/MercadoTrilho.vue', 'app/components/tese/TeseSelo.vue', 'app/components/tese/TeseMais.vue']) {
    assert.equal(existsSync(join(raiz, p)), false, p)
  }
  const varrer = (dir: string): string[] => readdirSync(join(raiz, dir)).flatMap((n) => {
    const p = `${dir}/${n}`
    return statSync(join(raiz, p)).isDirectory() ? varrer(p) : p.endsWith('.vue') ? [p] : []
  })
  for (const p of varrer('app')) assert.doesNotMatch(ler(p), /<(MercadoTrilho|TeseSelo|TeseMais)\b/, p)
})
