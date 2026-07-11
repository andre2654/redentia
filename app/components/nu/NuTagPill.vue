<script setup lang="ts">
// Pill semântica de avaliação (design Acoes Nu): 3 variantes — green
// (#DCF2E4/#0E7A42), amber (#F7E8C8/#A66B00), gray (#ECE7DC/#6B6558).
// 12.5px/800, padding 5px 13px, radius 999. `block` = margin-top 14px
// (uso nos metric cards); inline = 0 (perfil qualitativo).
import type { AcaoTag } from '~/types/acao'

defineProps<{ tag: AcaoTag; block?: boolean }>()
</script>

<template>
  <span class="ntp" :class="[`ntp--${tag.variant}`, { 'ntp--block': block }]">{{ tag.text }}</span>
</template>

<style scoped>
.ntp {
  display: inline-flex; align-items: center; font-size: 12.5px; font-weight: 800;
  padding: 5px 13px; border-radius: var(--nu-r-pill); white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.ntp--block { margin-top: 14px; }
.ntp--green { background: var(--nu-green-bg); color: var(--nu-green-2); }
.ntp--amber { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.ntp--gray { background: var(--nu-sand-2); color: var(--nu-gray-tag); }
</style>
