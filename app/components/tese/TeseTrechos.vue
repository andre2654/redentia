<script setup lang="ts">
// Um texto de revalidação com os marcadores em caixa alta virando selos
// pequenos, no lugar onde estão (docs/aportou/tese.md): "(SELL-SIDE A FAVOR,
// recomposição de margem PENDENTE)" → dois selos, o verde e o âmbar. O texto
// não muda: juntar os trechos devolve o original (utils/teseTexto).
import { trechosDoTexto } from '~/utils/teseTexto'

const props = defineProps<{ texto: string }>()
const trechos = computed(() => trechosDoTexto(props.texto))
</script>

<template>
  <template v-for="(t, i) in trechos" :key="i"><TeseSelo v-if="t.tom" :tom="t.tom" tamanho="p">{{ t.texto }}</TeseSelo><template v-else>{{ t.texto }}</template></template>
</template>
