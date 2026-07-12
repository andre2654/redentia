<script setup lang="ts">
// Renderiza LegalText (string OU runs) como conteúdo inline: <strong> pra
// ênfase, <a> pra email/site. Sem v-html — o texto (com acentos) vem do dado.
// v-for gera os runs adjacentes SEM whitespace entre eles (o espaço faz parte
// do texto do run, ex.: ' – toda informação…'), preservando o texto original.
import type { LegalText } from '~/types/legal'

defineProps<{ value: LegalText }>()
</script>

<template>
  <template v-if="typeof value === 'string'">{{ value }}</template>
  <template v-else><template v-for="(r, i) in value" :key="i"><a
        v-if="r.href"
        class="ltx__a"
        :href="r.href"
        :target="r.external ? '_blank' : undefined"
        :rel="r.external ? 'noopener noreferrer' : undefined"
      >{{ r.text }}</a><strong v-else-if="r.bold" class="ltx__b">{{ r.text }}</strong><span v-else>{{ r.text }}</span></template></template>
</template>

<style scoped>
.ltx__b { font-weight: 800; color: var(--nu-ink); }
.ltx__a {
  color: var(--nu-blue); text-decoration: underline;
  text-underline-offset: 2px; text-decoration-thickness: 1px;
  transition: color .2s;
}
.ltx__a:hover { color: var(--nu-blue-hover); }
</style>
