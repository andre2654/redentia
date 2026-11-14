<script setup lang="ts">
// A frase de cada seção da /carteira, com o número que importa em cobalto (a
// linha "A frase", 10/11/2026; na Aportou a frase vai em 800 e o destaque herda o peso). O trecho sai de utils/fraseDestaque.ts; o texto
// não muda, só ganha o <b>. Fica dentro do título de quem usa (h2 ou h3).
import { partesDaFrase } from '~/utils/fraseDestaque'

const props = defineProps<{ texto: string }>()
const p = computed(() => partesDaFrase(props.texto))
</script>

<template>
  {{ p[0] }}<b v-if="p[1]" class="cfr">{{ p[1] }}</b>{{ p[2] }}
</template>

<style scoped>
.cfr { color: var(--nu-blue); font-weight: inherit; }
</style>
