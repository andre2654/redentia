<script setup lang="ts">
// PR10 — card de fórmula do design: card creme radius 26, fórmula centrada
// (slot com HTML local: sup, fração com border-bottom) + glossário de termos
// (letra azul w800 largura 26 + descrição), linhas separadas por hairline.
defineProps<{
  terms?: { sym: string; desc: string }[]
  /** 'white' = card branco (quando a banda é creme — alternância do design) */
  tone?: 'white'
}>()
</script>

<template>
  <div class="cfc" :class="{ 'cfc--white': tone === 'white' }">
    <div class="cfc__formula"><slot /></div>
    <div v-if="terms?.length" class="cfc__terms">
      <div v-for="t in terms" :key="t.sym" class="cfc__term">
        <span class="cfc__sym">{{ t.sym }}</span>
        <!-- '=' literal no DOM: o glossário antigo era "LPA = Lucro por Ação…"
             e a paridade de texto SEO exige o conector presente. -->
        <span class="cfc__eq">=</span>
        <span class="cfc__desc">{{ t.desc }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cfc {
  background: var(--nu-cream);
  border-radius: var(--nu-r-card-lg);
  padding: clamp(26px, 3.5vw, 44px);
}
.cfc--white { background: var(--nu-white); }
.cfc__formula {
  color: var(--nu-ink);
  font-size: clamp(22px, 2.4vw, 32px);
  font-weight: var(--nu-w-forte);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.cfc__formula :deep(sup) { font-size: .6em; }
.cfc__formula :deep(.cfc-frac) { display: inline-block; vertical-align: middle; text-align: center; margin: 0 4px; }
.cfc__formula :deep(.cfc-frac-top) { display: block; border-bottom: 2.5px solid var(--nu-ink); padding: 0 8px 4px; }
.cfc__formula :deep(.cfc-frac-bottom) { display: block; padding: 4px 8px 0; }
/* três colunas alinhadas entre as linhas: a do símbolo cresce com o símbolo
   mais longo ("Patrimônio", "DY médio"), que antes vazava por cima do texto */
.cfc__terms { margin-top: 26px; display: grid; grid-template-columns: minmax(26px, max-content) auto minmax(0, 1fr); column-gap: 16px; }
.cfc__term {
  display: grid; grid-template-columns: subgrid; grid-column: 1 / -1; align-items: baseline;
  padding: 12px 0; border-top: 1px solid var(--nu-line);
}
.cfc__sym { color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); }
.cfc__eq { color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; flex-shrink: 0; }
.cfc__desc { color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; }
</style>
