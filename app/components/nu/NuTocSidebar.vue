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
/* sticky top compensa a faixa "Mercado agora" sticky do layout (~48px por
   cima dos 32px do design — o mock não tem a faixa). */
.ntoc { width: 250px; flex-shrink: 0; position: sticky; top: 84px; }
.ntoc__label {
  color: var(--nu-gray); font-size: 12.5px; font-weight: 800;
  letter-spacing: 1.2px; text-transform: uppercase;
}
.ntoc__list {
  display: flex; flex-direction: column; margin-top: 16px;
  border-left: 2px solid var(--nu-cream-2);
}
.ntoc__item {
  display: block; padding: 9px 0 9px 18px; margin-left: -2px;
  border-left: 2.5px solid transparent;
  color: var(--nu-gray); font-size: 14.5px; font-weight: 600; line-height: 1.35;
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
