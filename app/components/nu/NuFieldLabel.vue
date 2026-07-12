<script setup lang="ts">
// Label pequena de campo (14px/700) + ícone de ajuda '?' opcional. O design
// não dá handler ao ícone (candidato a tooltip) — aqui ele vira tooltip
// nativo via title quando `help` é passado.
defineProps<{ label: string; help?: string }>()
</script>

<template>
  <div class="nfl">
    <span class="nfl__text">{{ label }}</span>
    <span v-if="help" class="nfl__help" :title="help">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.3a2.5 2.5 0 0 1 4.9.7c0 1.6-2.4 2-2.4 3.2M12 17h.01" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.nfl { display: flex; align-items: center; gap: 7px; }
.nfl__text { color: var(--nu-gray-2); font-size: 14px; font-weight: 700; }
.nfl__help { display: inline-flex; color: var(--nu-sand); cursor: help; }
</style>
