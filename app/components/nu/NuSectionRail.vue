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
const rail = useState<RailState | null>('nu:section-rail', () => null)
const sections = computed(() => rail.value?.sections ?? [])
const pageLabel = computed(() => rail.value?.pageLabel ?? '')

const open = ref(false)
const wrapEl = ref<HTMLElement | null>(null)
const active = ref(0)

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
  <div ref="wrapEl" class="nsr-wrap">
    <button
      type="button" class="nsr" :aria-expanded="open"
      aria-label="Seções da página" @click="open = !open"
    >
      <span class="nsr__head">
        <span class="nsr__title">{{ pageLabel }}</span>
        <span class="nsr__count">{{ sections.length }} seções</span>
      </span>
      <svg
        class="nsr__chev" :class="{ 'nsr__chev--open': open }"
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      ><path d="M6 9l6 6 6-6" /></svg>
    </button>

    <!-- dropdown overlay (não empurra a página) -->
    <nav v-if="open" class="nsr__panel" aria-label="Ir para a seção">
      <button
        v-for="(s, i) in sections" :key="s.id" type="button"
        class="nsr__row" :class="{ 'nsr__row--active': active === i }"
        :aria-current="active === i ? 'true' : undefined"
        @click="onRow(s.id, i)"
      >
        <span>{{ s.label }}</span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.nsr-wrap {
  background: var(--nu-page); border-bottom: 1.5px solid var(--nu-line-2);
  /* MESMO mecanismo do NuMarketTicker: gruda abaixo do header sticky; --nuh-h
     vive no <html> (76px normal, 58px encolhido). */
  position: sticky; top: var(--nuh-h, 76px); z-index: 40;
  transition: top .28s ease;
}
.nsr {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  width: 100%; border: none; background: transparent; cursor: pointer;
  min-height: 44px; padding: 10px clamp(16px, 3vw, 40px); font-family: inherit; text-align: left;
  color: var(--nu-ink);
}
.nsr__head { display: inline-flex; align-items: baseline; gap: 10px; min-width: 0; }
.nsr__title { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; white-space: nowrap; }
.nsr__count { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; white-space: nowrap; }
.nsr__chev { flex-shrink: 0; color: var(--nu-ink); transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.nsr__chev--open { transform: rotate(180deg); }

.nsr__panel {
  position: absolute; top: calc(100% + 1.5px); left: 0; right: 0; z-index: 41;
  background: var(--nu-page);
  border-bottom: 1.5px solid var(--nu-line-2);
  box-shadow: var(--nu-shadow-card);
  display: flex; flex-direction: column;
  max-height: min(62vh, 480px); overflow-y: auto;
  animation: nu-fade .22s cubic-bezier(.2, .8, .2, 1) both;
}
.nsr__row {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  border: none; background: transparent; cursor: pointer; text-align: left;
  min-height: 52px; padding: 14px clamp(16px, 3vw, 40px); font-family: inherit;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600;
  transition: background .15s;
}
.nsr__row + .nsr__row { border-top: 1.5px solid var(--nu-line-2); }
.nsr__row:hover { background: var(--nu-band); }
.nsr__row svg { color: var(--nu-gray); flex-shrink: 0; transition: transform .2s cubic-bezier(.2, .8, .2, 1); }
.nsr__row:hover svg { transform: translateX(3px); }
.nsr__row--active { color: var(--nu-blue-text); font-weight: 700; }
.nsr__row--active svg { color: var(--nu-blue); }
</style>
