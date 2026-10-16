<script setup lang="ts">
// "Leitura da Redentia": a opinião da casa sobre o número da seção, separada do
// dado (o gráfico vem logo abaixo e não muda). O texto sai de
// content/benchmark-ia/leituras.ts; `**...**` vira negrito, sem v-html.
const props = defineProps<{ texto: string }>()
const partes = computed(() =>
  props.texto.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
    .map((p) => (p.startsWith('**') && p.endsWith('**') ? { b: true, t: p.slice(2, -2) } : { b: false, t: p })),
)
</script>

<template>
  <aside class="ble" aria-label="Leitura da Redentia">
    <span class="ble__tag">Leitura da Redentia</span>
    <p class="ble__txt"><template v-for="(p, i) in partes" :key="i"><b v-if="p.b">{{ p.t }}</b><template v-else>{{ p.t }}</template></template></p>
  </aside>
</template>

<style scoped>
.ble {
  margin: 0 0 22px; padding: 14px 18px; border-left: 3px solid var(--nu-blue);
  background: var(--b-surface, var(--nu-cream)); border-radius: 0 var(--nu-r-tile) var(--nu-r-tile) 0;
}
.ble__tag { display: block; margin-bottom: 4px; color: var(--nu-blue); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }
.ble__txt { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.ble__txt b { font-weight: 800; }
</style>
