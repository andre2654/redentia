<script setup lang="ts">
// Índice sticky "NESTE GUIA" com scrollspy — ativo = última seção cujo topo
// passou de 40% do viewport (regra exata do design Guia Open Finance). Item
// ativo: border-left 2.5px azul + texto preto 800. Some abaixo de 1080px.
// Slot pro card promocional inferior (NuAiPromptCard no guia).
const props = withDefaults(defineProps<{
  items: { label: string; targetId: string }[]
  label?: string
}>(), { label: 'Neste guia' })

const active = ref(0)

useNuScrollFrame(() => {
  const vh = window.innerHeight || 800
  let idx = 0
  props.items.forEach((it, i) => {
    const el = document.getElementById(it.targetId)
    if (el && el.getBoundingClientRect().top < vh * 0.4) idx = i
  })
  active.value = idx
})
</script>

<template>
  <div class="ntoc" data-nu-toc>
    <div class="ntoc__label">{{ label }}</div>
    <div class="ntoc__list">
      <a
        v-for="(it, i) in items" :key="it.targetId" :href="`#${it.targetId}`"
        class="ntoc__item" :class="{ 'ntoc__item--active': active === i }"
      >{{ it.label }}</a>
    </div>
    <div v-if="$slots.default" class="ntoc__extra"><slot /></div>
  </div>
</template>

<style scoped>
/* Gruda abaixo do header (--nuh-h: 76px, 58px encolhido) e da faixa
   "Mercado agora", que cola no header (~49px + folga). 84px fixo entrava
   debaixo da faixa e o índice sumia sob o header (z-index 50). */
.ntoc {
  width: 250px; flex-shrink: 0; position: sticky; z-index: 2;
  top: calc(var(--nuh-h, 76px) + 60px);
}
.ntoc__label {
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 700;
  letter-spacing: 1.2px; text-transform: uppercase;
}
.ntoc__list {
  display: flex; flex-direction: column; margin-top: 16px;
  border-left: 2px solid var(--nu-cream-2);
}
.ntoc__item {
  display: block; padding: 9px 0 9px 18px; margin-left: -2px;
  border-left: 2.5px solid transparent;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.35;
  transition: color .2s, border-color .2s;
}
.ntoc__item--active {
  border-left-color: var(--nu-blue);
  color: var(--nu-ink); font-weight: 800;
}
.ntoc__extra { margin-top: 28px; }

@media (max-width: 1080px) {
  .ntoc { display: none; }
}
</style>
