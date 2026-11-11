<script setup lang="ts">
// Banner contextual (PR-R6, forma corrigida pelo dono 2026-07-13) — substitui a
// faixa "Mercado agora" nas telas que DECLARAM suas seções (useSectionRail).
//
// PADRÃO (prints do André): uma faixa fina creme com "{pageLabel} · N seções" e
// um chevron à direita; clicar EXPANDE um dropdown com as seções (linha por
// linha, chevron › à direita). Clicar numa seção rola até ela (respeitando o
// scroll-margin-top) e fecha. Fecha também com Escape e clique fora.
// Sticky abaixo do header (mesma mecânica do NuMarketTicker via --nuh-h); o
// dropdown é um overlay absoluto — não empurra o conteúdo da página.
// APORTOU (11/11/2026): no creme da página, com fio leve embaixo; o painel é
// um cartão creme que desce com nu-subir e fios de 1,5px entre as seções.
// ROBUSTEZ (11/11/2026): o estado atual à vista. A faixa diz em que seção a
// pessoa está ("Carteira · Onde está"), e o nome troca num fade curto quando a
// rolagem passa para a próxima. Na coluna do site (--nu-coluna), deslizando no
// tempo do encolher do topo (.32s, o mesmo do NuHeader e da régua). O painel
// desce de cima (entra na curva de saída, sai mais rápido), as linhas chegam em
// cascata de 60ms, a sombra é a de painel; aberto pelo teclado, o foco vai para
// a seção atual e as setas andam entre as linhas.
const rail = useState<RailState | null>('nu:section-rail', () => null)
const sections = computed(() => rail.value?.sections ?? [])
const pageLabel = computed(() => rail.value?.pageLabel ?? '')

const open = ref(false)
const wrapEl = ref<HTMLElement | null>(null)
const painelEl = ref<HTMLElement | null>(null)
const active = ref(0)
const atual = computed(() => sections.value[active.value]?.label ?? '')

// Scrollspy — mesmo padrão do NuTocSidebar (useNuScrollFrame rAF-throttled):
// ativa = última seção cujo topo passou da base da faixa sticky.
useNuScrollFrame(() => {
  const list = sections.value
  if (!list.length) return
  const line = (wrapEl.value?.getBoundingClientRect().bottom ?? 130) + 12
  let idx = 0
  list.forEach((s, i) => {
    const el = document.getElementById(s.id)
    if (el && el.getBoundingClientRect().top <= line) idx = i
  })
  active.value = idx
})

function onRow(id: string, i: number) {
  active.value = i
  open.value = false
  scrollToRailSection(id)
}

function linhas(): HTMLElement[] {
  return Array.from(painelEl.value?.querySelectorAll<HTMLElement>('.nsr__row') ?? [])
}
/** aberto pelo teclado (Enter/Espaço), o foco entra na seção atual */
async function alternar(ev: MouseEvent) {
  open.value = !open.value
  if (open.value && ev.detail === 0) {
    await nextTick()
    linhas()[active.value]?.focus()
  }
}
function setas(e: KeyboardEvent) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
  const l = linhas()
  const i = l.indexOf(document.activeElement as HTMLElement)
  e.preventDefault()
  const prox = e.key === 'ArrowDown' ? (i + 1) % l.length : (i - 1 + l.length) % l.length
  l[prox]?.focus()
}

// fecha com clique fora / Escape (listeners só enquanto aberto)
function onDocClick(e: MouseEvent) {
  if (wrapEl.value && !wrapEl.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
watch(open, (o) => {
  if (!import.meta.client) return
  if (o) {
    document.addEventListener('click', onDocClick, true)
    document.addEventListener('keydown', onKey)
  } else {
    document.removeEventListener('click', onDocClick, true)
    document.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick, true)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="wrapEl" class="nsr-wrap" :class="{ 'nsr-wrap--aberto': open }">
    <button
      type="button" class="nsr" :aria-expanded="open"
      aria-label="Seções da página" @click="alternar"
    >
      <span class="nsr__head">
        <span class="nsr__title">{{ pageLabel }}</span>
        <span v-if="atual" class="nsr__sep" aria-hidden="true" />
        <span class="nsr__atual-caixa">
          <Transition name="nsr-atual" mode="out-in">
            <span :key="atual" class="nsr__atual">{{ atual }}</span>
          </Transition>
        </span>
      </span>
      <span class="nsr__fim">
        <span class="nsr__count">{{ sections.length }} seções</span>
        <svg
          class="nsr__chev" :class="{ 'nsr__chev--open': open }"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        ><path d="M6 9l6 6 6-6" /></svg>
      </span>
    </button>

    <!-- dropdown overlay (não empurra a página) -->
    <Transition name="nsr-painel">
      <nav v-if="open" ref="painelEl" class="nsr__panel" aria-label="Ir para a seção" @keydown="setas">
        <button
          v-for="(s, i) in sections" :key="s.id" type="button"
          class="nsr__row" :class="{ 'nsr__row--active': active === i }"
          :aria-current="active === i ? 'true' : undefined"
          @click="onRow(s.id, i)"
        >
          <span>{{ s.label }}</span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </nav>
    </Transition>
  </div>
</template>

<style scoped>
.nsr-wrap {
  background: var(--nu-page); border-bottom: 1px solid var(--nu-line-2);
  /* MESMO mecanismo do NuMarketTicker: gruda abaixo do header sticky; --nuh-h
     vive no <html> (72px normal, 60px encolhido; no celular 52 e 46). O tempo
     é o do encolher do topo (.32s --nu-ease-saida), para andarem juntos. */
  position: sticky; top: var(--nuh-h, 72px); z-index: 40;
  transition: top .32s var(--nu-ease-saida);
}
.nsr {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  width: 100%; border: none; background: transparent; cursor: pointer;
  min-height: 44px; padding: 10px var(--nu-coluna); font-family: inherit; text-align: left;
  color: var(--nu-ink); -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor);
}
@media (hover: hover) { .nsr:hover { background: color-mix(in srgb, var(--nu-band) 55%, var(--nu-page)); } }
.nsr:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: -3px; }
.nsr__head { display: inline-flex; align-items: center; gap: 12px; min-width: 0; }
.nsr__title { color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap; }
.nsr__sep { flex: none; width: 1px; height: 14px; background: var(--nu-line); }
.nsr__atual-caixa { display: inline-flex; min-width: 0; overflow: hidden; }
.nsr__atual { color: var(--nu-gray-3); font-size: 15px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nsr__fim { display: inline-flex; align-items: center; gap: 10px; flex-shrink: 0; }
.nsr__count { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); white-space: nowrap; font-variant-numeric: tabular-nums; }
.nsr__chev { flex-shrink: 0; color: var(--nu-ink); transition: transform var(--nu-dur-lenta) var(--nu-ease-troca); }
.nsr__chev--open { transform: rotate(180deg); }
/* o nome da seção atual troca num fade curto, sem empurrar nada */
.nsr-atual-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida); }
.nsr-atual-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.nsr-atual-enter-from { opacity: 0; transform: translateY(6px); }
.nsr-atual-leave-to { opacity: 0; transform: translateY(-4px); }

.nsr__panel {
  position: absolute; top: calc(100% + 1px); left: 0; right: 0; z-index: 41;
  background: var(--nu-page);
  border-bottom: 1px solid var(--nu-line-2);
  box-shadow: var(--nu-shadow-float);
  display: flex; flex-direction: column;
  max-height: min(62vh, 480px); overflow-y: auto; overscroll-behavior: contain;
}
/* o painel desce da faixa; sair é mais rápido */
.nsr-painel-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.nsr-painel-enter-from { opacity: 0; transform: translateY(-8px); }
.nsr-painel-leave-active { pointer-events: none; transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.nsr-painel-leave-to { opacity: 0; transform: translateY(-4px); }
/* as linhas chegam em cascata de 60ms */
.nsr-painel-enter-active .nsr__row { animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.nsr-painel-enter-active .nsr__row:nth-child(2) { animation-delay: var(--nu-passo-cascata); }
.nsr-painel-enter-active .nsr__row:nth-child(3) { animation-delay: calc(var(--nu-passo-cascata) * 2); }
.nsr-painel-enter-active .nsr__row:nth-child(4) { animation-delay: calc(var(--nu-passo-cascata) * 3); }
.nsr-painel-enter-active .nsr__row:nth-child(n+5) { animation-delay: calc(var(--nu-passo-cascata) * 4); }
.nsr__row {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  border: none; background: transparent; cursor: pointer; text-align: left;
  min-height: 52px; padding: 14px var(--nu-coluna); font-family: inherit;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-rapida) var(--nu-ease-cor), color var(--nu-dur-rapida) var(--nu-ease-cor);
}
.nsr__row + .nsr__row { border-top: 1px solid var(--nu-line-2); }
.nsr__row:hover { background: var(--nu-band); }
.nsr__row:active { background: var(--nu-cream-2); }
.nsr__row:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: -3px; }
.nsr__row svg { color: var(--nu-gray); flex-shrink: 0; transition: transform var(--nu-dur-media) var(--nu-ease-saida), color var(--nu-dur-media) var(--nu-ease-cor); }
.nsr__row:hover svg { transform: translateX(3px); color: var(--nu-ink); }
.nsr__row--active { color: var(--nu-blue-text); font-weight: var(--nu-w-medio); }
.nsr__row--active svg { color: var(--nu-blue); }
@media (max-width: 640px) {
  .nsr__head { gap: 10px; }
  .nsr__count { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .nsr-wrap, .nsr, .nsr__chev, .nsr__row, .nsr__row svg { transition: none; }
  .nsr-painel-enter-active .nsr__row { animation: none; }
}
</style>
