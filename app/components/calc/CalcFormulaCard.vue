<script setup lang="ts">
// PR10 — card de fórmula do design: card creme radius 26, fórmula centrada
// (slot com HTML local: sup, fração com border-bottom) + glossário de termos
// (letra azul w800 largura 26 + descrição), linhas separadas por hairline.
defineProps<{ terms?: { sym: string; desc: string }[] }>()
</script>

<template>
  <div class="cfc">
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
.cfc__formula {
  color: var(--nu-ink);
  font-size: clamp(22px, 2.4vw, 32px);
  font-weight: 800;
  letter-spacing: -.5px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.cfc__formula :deep(sup) { font-size: .6em; }
.cfc__formula :deep(.cfc-frac) { display: inline-block; vertical-align: middle; text-align: center; margin: 0 4px; }
.cfc__formula :deep(.cfc-frac-top) { display: block; border-bottom: 2.5px solid var(--nu-ink); padding: 0 8px 4px; }
.cfc__formula :deep(.cfc-frac-bottom) { display: block; padding: 4px 8px 0; }
.cfc__terms { margin-top: 26px; }
.cfc__term {
  display: flex; align-items: baseline; gap: 16px;
  padding: 12px 0; border-top: 1.5px solid var(--nu-cream-line-2);
}
.cfc__sym { color: var(--nu-blue); font-size: 16px; font-weight: 800; width: 26px; flex-shrink: 0; }
.cfc__eq { color: var(--nu-gray-2); font-size: 15px; font-weight: 500; flex-shrink: 0; }
.cfc__desc { color: var(--nu-gray-2); font-size: 15px; font-weight: 500; }
</style>
