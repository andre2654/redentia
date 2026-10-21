<script setup lang="ts">
// "Compartilhar" das calculadoras na frase (21/10/2026): o link da conta com
// os valores na URL, a mesma que o salvar grava e a calculadora reabre. No
// celular usa o compartilhar do sistema; no computador copia o link.
const props = defineProps<{
  /** caminho com os parâmetros da conta ("/calculadora/aposentadoria?age=35…") */
  link: string
  titulo: string
}>()

const copiado = ref(false)
let volta: ReturnType<typeof setTimeout> | null = null

async function compartilhar() {
  const url = new URL(props.link, window.location.origin).href
  const toque = window.matchMedia('(pointer: coarse)').matches
  if (toque && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: props.titulo, url })
      return
    }
    catch (e) {
      // quem fecha o painel do sistema não quer o link copiado
      if ((e as DOMException)?.name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    copiado.value = true
    if (volta) clearTimeout(volta)
    volta = setTimeout(() => { copiado.value = false }, 2200)
  }
  catch { /* sem a área de transferência, o link segue na barra do navegador */ }
}
onBeforeUnmount(() => { if (volta) clearTimeout(volta) })
</script>

<template>
  <button type="button" class="ccp" :class="{ 'ccp--feito': copiado }" :aria-label="copiado ? 'Link copiado' : 'Compartilhar'" @click="compartilhar">
    <svg v-if="!copiado" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>
    <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    <span class="ccp__texto" aria-hidden="true">{{ copiado ? 'Link copiado' : 'Compartilhar' }}</span>
  </button>
</template>

<style scoped>
.ccp {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 52px; padding: 0 22px;
  border: 0; border-radius: 999px; cursor: pointer; white-space: nowrap;
  background: var(--nu-white); color: var(--nu-ink); box-shadow: inset 0 0 0 2px var(--nu-cream-2);
  font: inherit; font-size: var(--nu-fs-md); font-weight: 700; transition: box-shadow .18s ease, color .18s ease;
}
.ccp:hover { box-shadow: inset 0 0 0 2px var(--nu-gray); }
.ccp--feito { color: var(--nu-green); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--nu-green) 35%, transparent); }
.ccp:focus-visible { outline: 3px solid color-mix(in srgb, var(--nu-blue) 45%, transparent); outline-offset: 2px; }
/* na barra do celular, só o ícone ao lado do salvar */
@media (max-width: 900px) {
  .ccp { flex: none; width: 52px; padding: 0; }
  .ccp__texto { display: none; }
}
</style>
