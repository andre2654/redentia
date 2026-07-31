<script setup lang="ts">
// Cabeçalho de seção do design Nu: eyebrow azul (opcional) + h2 800 + dek.
// Valores EXATOS de Redentia Mercado Nu.dc.html — slots permitem <br> no título.
defineProps<{ eyebrow?: string; dark?: boolean }>()
</script>

<template>
  <div>
    <div v-if="eyebrow" class="nsh__eyebrow" :class="{ 'nsh__eyebrow--dark': dark }">{{ eyebrow }}</div>
    <h2 class="nsh__title" :class="{ 'nsh__title--dark': dark, 'nsh__title--after-eyebrow': eyebrow }">
      <slot />
    </h2>
    <div v-if="$slots.dek" class="nsh__dek" :class="{ 'nsh__dek--dark': dark }">
      <slot name="dek" />
    </div>
  </div>
</template>

<style scoped>
.nsh__eyebrow { color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
/* dark: o par de acento sobre navy é o blue-soft (o --nu-blue afunda no fundo
   escuro). Aditivo — o único consumidor de `dark` hoje (TeseDrivers) não passa
   eyebrow nem dek, então nada muda no app. */
.nsh__eyebrow--dark { color: var(--nu-blue-soft); }
.nsh__title {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(38px, 4.8vw, 62px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.02;
}
.nsh__title--after-eyebrow { margin: 12px 0 0; }
.nsh__title--dark { color: var(--nu-cream-text); }
.nsh__dek {
  color: var(--nu-gray); font-size: clamp(16px, 1.7vw, 20px); font-weight: 600;
  line-height: 1.55; margin-top: 20px; max-width: 620px;
}
.nsh__dek :deep(strong) { color: var(--nu-ink); font-weight: 800; }
.nsh__dek--dark { color: var(--nu-cream-text-70); }
.nsh__dek--dark :deep(strong) { color: var(--nu-cream-text); }
</style>
