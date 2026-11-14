<script setup lang="ts">
// Índice sticky "NESTE GUIA" com scrollspy — ativo = última seção cujo topo
// passou de 40% do viewport (regra exata do design Guia Open Finance). Item
// ativo: border-left 2.5px azul + texto preto 800. Some abaixo de 1080px.
// Slot pro card promocional inferior (NuAiPromptCard no guia).
//
// ROBUSTEZ (11/11/2026): o sumário acompanha a leitura. A marca da seção atual
// é UM traço cobalto de 2px que DESLIZA de item em item (translateY + altura
// medidos, --nu-dur-lenta --nu-ease-troca), como a pílula do NuTrilho. No
// servidor (e até o JS medir) quem pinta a atual é a borda do próprio item, no
// mesmo lugar: a hidratação não pula. O clique rola suave até a seção e acende
// o item na hora (a resposta antes da rolagem acabar); o link segue sendo
// `#âncora`. Sumário mais alto que a tela rola por dentro e traz o item atual
// para a vista. Itens em 14px/500, cinza; o atual e o do ponteiro em carvão.
const props = withDefaults(defineProps<{
  items: { label: string; targetId: string }[]
  label?: string
}>(), { label: 'Neste guia' })

const active = ref(0)
const caixa = ref<HTMLElement | null>(null)
const lista = ref<HTMLElement | null>(null)
const marca = ref({ y: 0, h: 0 })
const medido = ref(false)
const quieto = ref(true)
/** o sumário rola por dentro: a ponta que ainda tem item esmaece */
const rolaCima = ref(false)
const rolaBaixo = ref(false)
function pontas() {
  const c = caixa.value
  if (!c) return
  rolaCima.value = c.scrollTop > 1
  rolaBaixo.value = c.scrollTop + c.clientHeight < c.scrollHeight - 1
}
/** enquanto a rolagem do clique anda, o item pedido fica aceso (o espião espera) */
let fixo = false

useNuScrollFrame(() => {
  if (fixo) return
  const vh = window.innerHeight || 800
  let idx = 0
  props.items.forEach((it, i) => {
    const el = document.getElementById(it.targetId)
    if (el && el.getBoundingClientRect().top < vh * 0.4) idx = i
  })
  active.value = idx
})

function itemAtual(): HTMLElement | null {
  return (lista.value?.querySelectorAll<HTMLElement>('.ntoc__item')[active.value]) ?? null
}
function medir(): boolean {
  const a = itemAtual()
  if (!a || !a.offsetHeight) return false
  marca.value = { y: a.offsetTop, h: a.offsetHeight }
  return true
}
const reduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
/** sumário mais alto que a tela: rola por dentro até o item atual aparecer */
function manterAVista() {
  const c = caixa.value
  const a = itemAtual()
  const l = lista.value
  if (!c || !a || !l || c.scrollHeight <= c.clientHeight + 1) return
  const y = l.offsetTop + a.offsetTop
  const folga = 12
  let alvo: number | null = null
  if (y - folga < c.scrollTop) alvo = y - folga
  else if (y + a.offsetHeight + folga > c.scrollTop + c.clientHeight) alvo = y + a.offsetHeight + folga - c.clientHeight
  if (alvo !== null) c.scrollTo({ top: Math.max(0, alvo), behavior: reduzido() ? 'auto' : 'smooth' })
}
/** põe a marca no lugar SEM animar (primeira medida, tamanho ou fonte que mudou) */
let vez = 0
async function assentar() {
  const esta = ++vez
  quieto.value = true
  if (!medir()) return
  medido.value = true
  pontas()
  await nextTick()
  void lista.value?.offsetWidth
  requestAnimationFrame(() => { if (esta === vez) quieto.value = false })
}
watch(active, () => { medir(); manterAVista() })

let ro: ResizeObserver | null = null
onMounted(() => {
  void assentar()
  ro = new ResizeObserver(() => { void assentar() })
  if (lista.value) ro.observe(lista.value)
  if (caixa.value) ro.observe(caixa.value)
  document.fonts?.ready.then(() => { void assentar() }).catch(() => {})
})
onBeforeUnmount(() => { ro?.disconnect(); ro = null })

/** o clique: acende na hora e rola suave até a seção (a âncora do link fica) */
function ir(i: number, ev: MouseEvent) {
  const it = props.items[i]
  const alvo = it ? document.getElementById(it.targetId) : null
  if (!it || !alvo || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return
  ev.preventDefault()
  active.value = i
  fixo = true
  const solta = () => { fixo = false }
  window.addEventListener('scrollend', solta, { once: true })
  setTimeout(solta, 1200)
  alvo.scrollIntoView({ behavior: reduzido() ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#${it.targetId}`)
  // pelo teclado, o foco vai junto (o Tab seguinte continua da seção, como na âncora)
  if (ev.detail === 0) {
    if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1')
    alvo.focus({ preventScroll: true })
  }
}
const estiloMarca = computed(() => ({ height: `${marca.value.h}px`, transform: `translateY(${marca.value.y}px)` }))
</script>

<template>
  <div
    ref="caixa" class="ntoc" :class="{ 'ntoc--medido': medido, 'ntoc--quieto': quieto, 'ntoc--rola-cima': rolaCima, 'ntoc--rola-baixo': rolaBaixo }" data-nu-toc
    @scroll.passive="pontas"
  >
    <div class="ntoc__label"><MarcaCorte :largura="18" />{{ label }}</div>
    <div ref="lista" class="ntoc__list">
      <span v-if="medido" class="ntoc__marca" :style="estiloMarca" aria-hidden="true" />
      <a
        v-for="(it, i) in items" :key="it.targetId" :href="`#${it.targetId}`"
        class="ntoc__item" :class="{ 'ntoc__item--active': active === i }"
        :aria-current="active === i ? 'location' : undefined"
        @click="ir(i, $event)"
      >{{ it.label }}</a>
    </div>
    <div v-if="$slots.default" class="ntoc__extra"><slot /></div>
  </div>
</template>

<style scoped>
/* Gruda abaixo do header (--nuh-h: 72px, 60px encolhido) e da régua do
   mercado (ou da faixa de seções), ~40px, com 24px de folga: o mesmo
   scroll-margin-top dos títulos que ele aponta. */
.ntoc {
  /* 250px de coluna; os 4px de folga em volta (devolvidos pela margem) deixam
     a sombra do cartão do slot inteira quando o sumário rola por dentro */
  width: 258px; margin: -4px -4px 0; padding: 4px 4px 8px; flex-shrink: 0; position: sticky; z-index: 2;
  top: calc(var(--nuh-h, 72px) + 60px);
  max-height: calc(100vh - var(--nuh-h, 72px) - 84px); overflow-y: auto; overscroll-behavior: contain;
  scrollbar-width: none;
}
.ntoc__label {
  display: flex; align-items: center; gap: 8px;
  color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio);
  letter-spacing: var(--nu-ls-caixa); text-transform: uppercase;
}
.ntoc__list {
  position: relative; display: flex; flex-direction: column; margin-top: 16px;
  border-left: 1px solid var(--nu-line);
}
.ntoc__item {
  display: block; padding: 9px 0 9px 18px; margin-left: -1.5px;
  border-left: 2px solid transparent; border-radius: 0 6px 6px 0;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.4;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), border-color var(--nu-dur-media) var(--nu-ease-cor);
}
.ntoc__item:hover { color: var(--nu-ink); }
.ntoc__item:active { opacity: .72; }
.ntoc__item:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: -3px; }
.ntoc__item--active { border-left-color: var(--nu-blue); color: var(--nu-ink); }
/* medido: quem marca a atual é o traço que desliza (a borda do item some) */
.ntoc--medido .ntoc__item--active { border-left-color: transparent; }
.ntoc__marca {
  position: absolute; left: -1.5px; top: 0; width: 2px; border-radius: 2px; background: var(--nu-blue); pointer-events: none;
  transition: transform var(--nu-dur-lenta) var(--nu-ease-troca), height var(--nu-dur-lenta) var(--nu-ease-troca);
}
.ntoc--quieto .ntoc__marca { transition: none; }
.ntoc__extra { margin-top: 32px; }
/* rolando por dentro: as pontas esmaecem onde ainda tem item (a máscara usa só o alfa) */
.ntoc--rola-baixo { -webkit-mask-image: linear-gradient(180deg, var(--nu-ink) calc(100% - 48px), transparent); mask-image: linear-gradient(180deg, var(--nu-ink) calc(100% - 48px), transparent); }
.ntoc--rola-cima { -webkit-mask-image: linear-gradient(180deg, transparent, var(--nu-ink) 48px); mask-image: linear-gradient(180deg, transparent, var(--nu-ink) 48px); }
.ntoc--rola-cima.ntoc--rola-baixo {
  -webkit-mask-image: linear-gradient(180deg, transparent, var(--nu-ink) 48px, var(--nu-ink) calc(100% - 48px), transparent);
  mask-image: linear-gradient(180deg, transparent, var(--nu-ink) 48px, var(--nu-ink) calc(100% - 48px), transparent);
}

@media (max-width: 1080px) {
  .ntoc { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ntoc__item, .ntoc__marca { transition: none; }
}
</style>
