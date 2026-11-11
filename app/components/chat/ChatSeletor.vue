<script setup lang="ts">
// O cursor mágico (02/11/2026, pedido do dono: "com o chat aberto o mouse fica
// com um efeito mágico que podemos clicar pra adicionar o contexto do
// componente no chat"). Só com o painel aberto e em aparelho de mouse
// (hover + pointer fine): uma luz nas cores do anel da Aportou (cobalto, céu e
// areia: --nu-chat-luz-*) segue o ponteiro; o pedaço da página marcado com
// v-contexto-chat (ou um link para /asset/X) ganha o contorno do anel
// (--nu-anel correndo); o clique anexa o pedaço ao campo do
// painel em vez de navegar. Botões e links DENTRO de um pedaço continuam
// funcionando (trocar o período do gráfico, seguir o ativo).
// Movimento reduzido: sem a luz que segue; o contorno fica, sem animação.
// Teclado: nada muda (não há armadilha); o painel continua no Tab normal.
import { contextoDoLinkDeAtivo, MAX_CONTEXTOS, rotuloCurto, textoCompacto } from '~/utils/chat-painel'
import type { ContextoDoChat } from '~/composables/useChatPainel'

const painel = useChatPainel()
const route = useRoute()

const ligado = ref(false)
const calmo = ref(false)
const luz = ref<HTMLElement | null>(null)
const alvo = ref<{ x: number; y: number; w: number; h: number; r: string } | null>(null)
const rotulo = ref('')
const etiqueta = ref<HTMLElement | null>(null)
const pulso = ref(0)

const INTERATIVO = 'a, button, input, select, textarea, summary, label, [role="button"], [role="tab"], [role="switch"], [contenteditable="true"]'

let elAlvo: HTMLElement | null = null
let px = -999, py = -999, lx = -999, ly = -999
let raf = 0

/** A seção (ou o artigo) com título mais próxima: o pedaço genérico de
 *  qualquer página que ninguém marcou (um bloco de guia, de glossário). */
function secaoDe(el: Element): HTMLElement | null {
  let s = el.closest<HTMLElement>('section, article')
  while (s) {
    if (s.closest('footer, nav, header')) return null
    if (s.querySelector('h1, h2, h3')) return s
    s = s.parentElement?.closest<HTMLElement>('section, article') ?? null
  }
  return null
}

/**
 * O pedaço sob o ponteiro: o mais de dentro entre o marcado com
 * v-contexto-chat, um link para /asset/X e a seção com título. Assim o card
 * dentro da seção ganha do bloco, e a linha dentro do card ganha do card.
 */
function pedacoDe(t: EventTarget | null): HTMLElement | null {
  const el = t instanceof Element ? t : null
  // o painel, a barra, os modais e o header/faixa sticky (o contorno passa por
  // baixo deles e o clique anexaria sem ninguém ver) ficam de fora
  if (!el || el.closest('.cpn, .cba, [aria-modal="true"], .nuh-wrap, .nut-wrap, .nsr-wrap')) return null
  const cands = [
    el.closest<HTMLElement>('[data-chat-contexto]'),
    el.closest<HTMLElement>('a[href^="/asset/"]'),
    secaoDe(el),
  ].filter((c): c is HTMLElement => !!c)
  const alvo = cands.find((c) => cands.every((o) => o === c || !c.contains(o))) ?? null
  const inter = el.closest<HTMLElement>(INTERATIVO)
  // um controle dentro do pedaço (e que não é o próprio pedaço) segue sendo controle
  if (alvo && inter && inter !== alvo && alvo.contains(inter)) return null
  return alvo
}

function contextoDe(el: HTMLElement): ContextoDoChat | null {
  const rota = route.path
  const v = contextoChatDoElemento(el)
  if (v) return { id: v.id, tipo: v.tipo, rotulo: v.rotulo, texto: textoCompacto(v.texto ?? el.innerText), rota }
  const href = el.getAttribute('href')
  if (href && el.matches('a')) return contextoDoLinkDeAtivo(href, el.innerText, rota)
  // innerText: o <br> do título vira espaço ("O que sustenta e o que ameaça")
  const titulo = el.querySelector<HTMLElement>('h1, h2, h3')?.innerText ?? ''
  const rotulo = rotuloCurto(titulo, 34)
  return rotulo ? { id: `secao:${rota}:${rotulo}`, tipo: 'secao', rotulo, texto: textoCompacto(el.innerText), rota } : null
}

function rotuloDe(el: HTMLElement): string {
  return contextoChatDoElemento(el)?.rotulo ?? contextoDe(el)?.rotulo ?? ''
}

/**
 * O retângulo do contorno. Seção que sangra até a borda (o hero do ativo, a
 * bolsa da home) tem o conteúdo bem menor que a caixa: o contorno abraça a
 * união dos filhos visíveis, não o padding.
 */
function uniaoDosFilhos(el: Element, fundo: number, acc: { x0: number; y0: number; x1: number; y1: number }) {
  const largura = el.getBoundingClientRect().width
  for (const f of Array.from(el.children)) {
    const q = f.getBoundingClientRect()
    if (q.width < 1 || q.height < 1) continue
    // filho de bloco que ocupa a linha toda: o que conta é o conteúdo dele
    if (fundo > 0 && f.children.length && q.width > largura * 0.9) { uniaoDosFilhos(f, fundo - 1, acc); continue }
    acc.x0 = Math.min(acc.x0, q.left); acc.y0 = Math.min(acc.y0, q.top)
    acc.x1 = Math.max(acc.x1, q.right); acc.y1 = Math.max(acc.y1, q.bottom)
  }
}
/** Onde acabam o header e a faixa sticky (o contorno não passa por baixo deles). */
function topoLivre(): number {
  let y = 0
  for (const el of Array.from(document.querySelectorAll('.nuh-wrap, .nut-wrap, .nsr-wrap'))) {
    const q = el.getBoundingClientRect()
    if (q.top <= y + 1 && q.bottom > y) y = q.bottom
  }
  return y
}

function bandaEscura(cor: string): boolean {
  const m = cor.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/)
  if (!m || (m[4] !== undefined && Number(m[4]) < 0.5)) return false
  const [r, g, bl] = [Number(m[1]), Number(m[2]), Number(m[3])]
  return (0.2126 * r + 0.7152 * g + 0.0722 * bl) / 255 < 0.35
}

function retanguloDe(el: HTMLElement): DOMRect {
  const r = el.getBoundingClientRect()
  if (r.width < window.innerWidth * 0.6) return r
  // banda escura (o gráfico navy, que sangra até a borda): o contorno fica
  // dentro dela, a 18px da borda visível. Banda clara abraça o conteúdo.
  if (bandaEscura(getComputedStyle(el).backgroundColor)) {
    const vw = document.documentElement.clientWidth
    const x0 = Math.max(r.left, 0) + 18, x1 = Math.min(r.right, vw) - 18
    const y0 = Math.max(r.top, topoLivre()) + 18, y1 = Math.min(r.bottom, window.innerHeight) - 18
    return new DOMRect(x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0))
  }
  const acc = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
  uniaoDosFilhos(el, 2, acc)
  return acc.x0 === Infinity ? r : new DOMRect(acc.x0 - 10, acc.y0 - 10, acc.x1 - acc.x0 + 20, acc.y1 - acc.y0 + 20)
}

function medir() {
  if (!elAlvo || !elAlvo.isConnected) { alvo.value = null; return }
  // o contorno fica sempre inteiro na tela: bloco maior que a tela ganha a
  // janela visível dele (abaixo do header, acima do pé)
  const q = retanguloDe(elAlvo)
  const topo = topoLivre() + 8
  const x0 = Math.max(q.left, 8), x1 = Math.min(q.right, document.documentElement.clientWidth - 8)
  const y0 = Math.max(q.top, topo), y1 = Math.min(q.bottom, window.innerHeight - 8)
  if (x1 - x0 < 8 || y1 - y0 < 8) { alvo.value = null; return }
  const r = new DOMRect(x0, y0, x1 - x0, y1 - y0)
  const raio = parseFloat(getComputedStyle(elAlvo).borderTopLeftRadius) || 0
  alvo.value = { x: r.left, y: r.top, w: r.width, h: r.height, r: `${Math.max(14, raio + 6)}px` }
}

function quadro() {
  raf = 0
  // a luz chega ao ponteiro com uma folga (lerp): o "mágico" é ela flutuar
  lx += (px - lx) * 0.22
  ly += (py - ly) * 0.22
  if (luz.value) luz.value.style.transform = `translate3d(${lx}px, ${ly}px, 0)`
  // a etiqueta "+ PETR4" anda colada ao ponteiro (nunca some atrás do header)
  // perto da borda (ou do painel), a etiqueta vira para o outro lado do ponteiro
  if (etiqueta.value) {
    const limite = document.querySelector('.nu-shell')?.getBoundingClientRect().right ?? window.innerWidth
    const w = etiqueta.value.offsetWidth, h = etiqueta.value.offsetHeight
    const ex = px + 16 + w > limite - 8 ? px - 12 - w : px + 16
    const ey = py + 18 + h > window.innerHeight - 8 ? py - 12 - h : py + 18
    etiqueta.value.style.transform = `translate3d(${ex}px, ${ey}px, 0)`
  }
  medir()
  if (Math.abs(px - lx) > 0.5 || Math.abs(py - ly) > 0.5) raf = requestAnimationFrame(quadro)
}
function pedirQuadro() { if (!raf) raf = requestAnimationFrame(quadro) }

function onMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
  if (lx < -900) { lx = e.clientX; ly = e.clientY }
  px = e.clientX; py = e.clientY
  const novo = pedacoDe(e.target)
  if (novo !== elAlvo) {
    elAlvo?.classList.remove('nu-ctx-sobre')
    elAlvo = novo
    elAlvo?.classList.add('nu-ctx-sobre')
    rotulo.value = elAlvo ? rotuloDe(elAlvo) : ''
  }
  pedirQuadro()
}
function onScroll() { pedirQuadro() }
function onLeave() {
  px = py = lx = ly = -999
  elAlvo?.classList.remove('nu-ctx-sobre')
  elAlvo = null
  alvo.value = null
  rotulo.value = ''
  if (luz.value) luz.value.style.transform = 'translate3d(-999px, -999px, 0)'
}

function onClick(e: MouseEvent) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const el = pedacoDe(e.target)
  if (!el) return
  const c = contextoDe(el)
  if (!c) return
  e.preventDefault()
  e.stopPropagation()
  if (painel.contextos.value.length >= MAX_CONTEXTOS && !painel.contextos.value.some((x) => x.id === c.id)) return
  painel.anexar(c)
  pulso.value++
}

function ligar() {
  if (ligado.value) return
  ligado.value = true
  document.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('click', onClick, true)
  document.documentElement.addEventListener('pointerleave', onLeave)
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
  window.addEventListener('resize', onScroll, { passive: true })
  document.documentElement.classList.add('nu-ctx-ligado')
}
function desligar() {
  if (!ligado.value) return
  ligado.value = false
  document.removeEventListener('pointermove', onMove)
  document.removeEventListener('click', onClick, true)
  document.documentElement.removeEventListener('pointerleave', onLeave)
  window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions)
  window.removeEventListener('resize', onScroll)
  document.documentElement.classList.remove('nu-ctx-ligado')
  onLeave()
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

let mqMouse: MediaQueryList | null = null
let mqLargo: MediaQueryList | null = null
function avaliar() {
  const pode = painel.aberto.value && !!mqMouse?.matches && !!mqLargo?.matches
  if (pode) ligar()
  else desligar()
}

onMounted(() => {
  mqMouse = window.matchMedia('(hover: hover) and (pointer: fine)')
  mqLargo = window.matchMedia('(min-width: 760px)')
  calmo.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  mqMouse.addEventListener('change', avaliar)
  mqLargo.addEventListener('change', avaliar)
  avaliar()
})
watch(() => painel.aberto.value, avaliar)
watch(() => route.path, () => onLeave())
onBeforeUnmount(() => {
  desligar()
  mqMouse?.removeEventListener('change', avaliar)
  mqLargo?.removeEventListener('change', avaliar)
})
</script>

<template>
  <div v-if="ligado" class="cse" aria-hidden="true">
    <span v-if="!calmo" ref="luz" class="cse__luz" :class="{ 'cse__luz--alvo': !!alvo }"><span class="cse__manchas" /></span>
    <span
      v-if="alvo" :key="pulso" class="cse__contorno" :class="{ 'cse__contorno--pulso': pulso > 0 }"
      :style="{ transform: `translate3d(${alvo.x - 6}px, ${alvo.y - 6}px, 0)`, width: `${alvo.w + 12}px`, height: `${alvo.h + 12}px`, borderRadius: alvo.r }"
    />
    <span v-show="alvo && rotulo" ref="etiqueta" class="cse__rotulo"><span class="cse__mais">+</span>{{ rotulo }}</span>
  </div>
</template>

<style scoped>
.cse { position: fixed; inset: 0; z-index: 39; pointer-events: none; overflow: hidden; }

/* a luz que segue o ponteiro: três manchas do anel (cobalto, céu, areia),
   desfocadas, girando devagar em volta do ponto */
.cse__luz {
  position: absolute; left: -75px; top: -75px; width: 150px; height: 150px; border-radius: 50%;
  filter: blur(14px); opacity: .8; will-change: transform;
  transform: translate3d(-999px, -999px, 0); transition: opacity .2s ease;
}
.cse__manchas {
  position: absolute; inset: 0; border-radius: 50%;
  background:
    radial-gradient(closest-side at 38% 40%, var(--nu-chat-luz-1), transparent),
    radial-gradient(closest-side at 64% 56%, var(--nu-chat-luz-2), transparent),
    radial-gradient(closest-side at 46% 70%, var(--nu-chat-luz-3), transparent);
  animation: cse-gira 7s linear infinite;
}
.cse__luz::after {
  content: ''; position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%;
  background: var(--nu-white); box-shadow: 0 0 10px 4px var(--nu-chat-luz-1);
}
.cse__luz--alvo { opacity: .45; }

/* o contorno em volta do pedaço sob o ponteiro: o anel da marca, correndo */
.cse__contorno {
  position: absolute; left: 0; top: 0; padding: 2.5px;
  background: var(--nu-anel); background-size: 200% 100%;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  transition: transform .16s var(--nu-ease-saida), width .16s var(--nu-ease-saida), height .16s var(--nu-ease-saida);
  animation: nu-anel 4s linear infinite;
}
.cse__contorno--pulso { animation: nu-anel 4s linear infinite, cse-pulso .5s var(--nu-ease-saida); }
/* a etiqueta "+ PETR4": a pílula carvão, com o "+" no círculo cobalto */
.cse__rotulo {
  position: absolute; left: 0; top: 0; will-change: transform;
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px 5px 6px; border-radius: var(--nu-r-pill);
  background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); white-space: nowrap;
  box-shadow: var(--nu-chat-sombra-rotulo);
}
.cse__mais { display: grid; place-items: center; width: 16px; height: 16px; border-radius: 50%; background: var(--nu-blue); font-size: 13px; line-height: 1; }

@keyframes cse-gira { to { transform: rotate(360deg); } }
@keyframes cse-pulso { 0% { opacity: 1; } 40% { opacity: .4; box-shadow: 0 0 0 6px var(--nu-chat-luz-2); } 100% { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .cse__contorno { transition: none; animation: none; }
}
</style>

<style>
/* sobre um pedaço que pode ir ao chat, o clique anexa: o cursor diz isso */
html.nu-ctx-ligado .nu-ctx-sobre, html.nu-ctx-ligado .nu-ctx-sobre * { cursor: copy !important; }
</style>
