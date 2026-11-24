<script setup lang="ts">
// "Ver em detalhe": uma linha que abre o que a seção guarda (a lista inteira,
// os riscos, a cadeia). O conteúdo só monta quando abre pela primeira vez, e
// fica montado depois (as buscas de dentro não se repetem).
const props = defineProps<{ titulo: string; sub?: string; id?: string }>()
const aberto = defineModel<boolean>({ default: false })
const jaAbriu = ref(aberto.value)
watch(aberto, (v) => { if (v) jaAbriu.value = true })
const uid = useId()
const idCorpo = computed(() => `${props.id ?? uid}-corpo`)
</script>

<template>
  <div :id="id" class="dma" :class="{ 'dma--aberto': aberto }">
    <button type="button" class="dma__b" :aria-expanded="aberto" :aria-controls="idCorpo" @click="aberto = !aberto">
      <span class="dma__txt"><span class="dma__t">{{ titulo }}</span><span v-if="sub" class="dma__s">{{ sub }}</span></span>
      <svg class="dma__seta" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    <div v-if="jaAbriu" v-show="aberto" :id="idCorpo" class="dma__corpo"><slot /></div>
  </div>
</template>

<style scoped>
.dma { border-top: 1px solid var(--nu-line-2); scroll-margin-top: calc(var(--nuh-h, 76px) + 64px); }
.dma:last-child { border-bottom: 1px solid var(--nu-line-2); }
.dma__b { display: flex; align-items: center; gap: 16px; width: 100%; min-height: 60px; padding: 12px 0; border: 0; background: transparent; color: var(--nu-ink); font: inherit; text-align: left; cursor: pointer; }
.dma__b:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; border-radius: 8px; }
.dma__txt { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.dma__t { font-size: 16.5px; }
.dma__s { color: var(--nu-gray); font-size: 14px; line-height: 1.45; }
.dma__seta { flex: none; color: var(--nu-gray); transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.dma--aberto .dma__seta { transform: rotate(180deg); }
.dma__corpo { padding: 8px 0 28px; }
@media (prefers-reduced-motion: reduce) { .dma__seta { transition: none; } }
</style>
