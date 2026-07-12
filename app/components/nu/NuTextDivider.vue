<script setup lang="ts">
// Divider horizontal com texto central ('ou'): duas linhas 1.5px + label
// 13px/700 — separa o método primário dos alternativos nas telas de auth.
withDefaults(defineProps<{ label?: string }>(), { label: 'ou' })
</script>

<template>
  <div class="ntd" role="separator">
    <span class="ntd__line" />
    <span class="ntd__label">{{ label }}</span>
    <span class="ntd__line" />
  </div>
</template>

<style scoped>
.ntd { display: flex; align-items: center; gap: 14px; }
.ntd__line { flex: 1; height: 1.5px; background: var(--nu-cream-2); }
.ntd__label { color: var(--nu-sand); font-size: 13px; font-weight: 700; }
</style>
