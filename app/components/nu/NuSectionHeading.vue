<script setup lang="ts">
// Cabeçalho de seção: o eyebrow da marca (o corte azul + caixa alta, opcional),
// o h2 em 800 e o dek. Aportou, 11/11/2026: o eyebrow era um texto azul em
// caixa baixa; agora é o NuEyebrow. Slots permitem <br> no título.
// `id` vai no h2 (para a seção apontar com aria-labelledby).
defineProps<{ eyebrow?: string; dark?: boolean; id?: string }>()
</script>

<template>
  <div>
    <NuEyebrow v-if="eyebrow" como="div" :sobre="dark ? 'escuro' : 'claro'">{{ eyebrow }}</NuEyebrow>
    <h2 :id="id" class="nsh__title" :class="{ 'nsh__title--dark': dark, 'nsh__title--after-eyebrow': eyebrow }">
      <slot />
    </h2>
    <div v-if="$slots.dek" class="nsh__dek" :class="{ 'nsh__dek--dark': dark }">
      <slot name="dek" />
    </div>
  </div>
</template>

<style scoped>
.nsh__title {
  margin: 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: 1.02;
}
.nsh__title--after-eyebrow { margin: 18px 0 0; }
.nsh__title--dark { color: var(--nu-cream-text); }
.nsh__dek {
  color: var(--nu-gray-3); font-size: var(--nu-fs-dek); font-weight: var(--nu-w-texto);
  line-height: 1.55; margin-top: 20px; max-width: 620px;
}
.nsh__dek :deep(strong) { color: var(--nu-ink); font-weight: var(--nu-w-forte); }
.nsh__dek--dark { color: var(--nu-cream-text-70); }
.nsh__dek--dark :deep(strong) { color: var(--nu-cream-text); }
</style>
