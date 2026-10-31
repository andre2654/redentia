<script setup lang="ts">
// Um termo do mercado com a explicação ao lado (31/10/2026), para quem está
// começando: sublinhado pontilhado, e no hover, no toque ou no foco abre uma
// caixinha com a frase curta e o link para a página do glossário. A frase vem
// do glossário do site (carregado só quando alguém abre um termo, para não
// pesar na home) ou de utils/termosDoDia.ts, para o que o glossário não tem.
import { EXPLICACOES_DO_DIA } from '~/utils/termosDoDia'

const props = defineProps<{ texto: string; termo: string; slug: string | null }>()

const aberto = ref(false)
const definicao = ref<string | null>(EXPLICACOES_DO_DIA[props.termo] ?? null)
const raiz = ref<HTMLElement | null>(null)
const aDireita = ref(false)
const id = useId()

async function carregar() {
  if (definicao.value || !props.slug) return
  const { getTerm } = await import('~/content/glossario')
  definicao.value = getTerm(props.slug)?.short ?? null
}
function abrir() {
  aberto.value = true
  void carregar()
  // perto da borda direita, a caixa abre para a esquerda
  nextTick(() => {
    const r = raiz.value?.getBoundingClientRect()
    aDireita.value = !!r && r.left + 300 > window.innerWidth - 16
  })
}
function fechar() { aberto.value = false }
function saiuDoFoco(e: FocusEvent) {
  if (!raiz.value?.contains(e.relatedTarget as Node | null)) fechar()
}
</script>

<template>
  <span ref="raiz" class="hte" @mouseenter="abrir" @mouseleave="fechar" @focusout="saiuDoFoco" @keydown.esc="fechar">
    <button type="button" class="hte__termo" :aria-expanded="aberto" :aria-describedby="aberto ? id : undefined" @click="aberto ? fechar() : abrir()" @focus="abrir">{{ texto }}</button>
    <span v-if="aberto" :id="id" role="tooltip" class="hte__caixa" :class="{ 'hte__caixa--dir': aDireita }">
      <span v-if="definicao" class="hte__def">{{ definicao }}</span>
      <NuSkeleton v-else variant="text" :lines="2" last-width="60%" />
      <NuxtLink v-if="slug" :to="`/glossario/${slug}`" class="hte__link">Ver no glossário →</NuxtLink>
    </span>
  </span>
</template>

<style scoped>
.hte { position: relative; display: inline; }
.hte__termo {
  display: inline; padding: 0; border: 0; background: none; cursor: help; font: inherit; color: inherit;
  text-decoration: underline dotted; text-decoration-thickness: 1.5px; text-underline-offset: 4px;
}
.hte__termo:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; border-radius: 3px; }
.hte__caixa {
  position: absolute; z-index: 5; left: 0; top: calc(100% + 8px); width: min(300px, calc(100vw - 44px));
  display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; border-radius: 14px;
  background: var(--nu-white); color: var(--nu-ink); box-shadow: var(--nu-shadow-card);
  font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; text-align: left; white-space: normal;
}
.hte__caixa--dir { left: auto; right: 0; }
.hte__def { color: var(--nu-ink); }
.hte__link { color: var(--nu-blue-text); font-weight: 700; }
.hte__link:hover { color: var(--nu-blue-hover); }
</style>
