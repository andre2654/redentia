<script setup lang="ts">
// O preço grande do topo com os dígitos que trocam suavemente (o numericText
// do app): cada caractere é uma casa, e só a casa que mudou sobe e esmaece.
// Quando a mira passa pelo gráfico, o preço acompanha o dia dela. O SSR
// entrega o texto inteiro, casa por casa, sem cópia escondida. O valor
// escondido da /carteira ('R$ ••••••', 05/11/2026) leva os pontos menores: no
// tamanho do herói, o "•" pesaria mais que os números.
const props = defineProps<{ valor: string }>()
const casas = computed(() => [...props.valor].map((c, i) => ({ c, k: `${i}-${c}` })))
</script>

<template>
  <span class="tpr">
    <span v-for="(x, i) in casas" :key="i" class="tpr__casa">
      <Transition name="tpr">
        <span :key="x.k" class="tpr__c" :class="{ 'tpr__c--ponto': x.c === '•' }">{{ x.c === ' ' ? '\u00a0' : x.c }}</span>
      </Transition>
    </span>
  </span>
</template>

<style scoped>
.tpr { display: inline-flex; font-variant-numeric: tabular-nums; white-space: nowrap; }
.tpr__casa { position: relative; display: inline-block; overflow: hidden; }
.tpr__c { display: inline-block; }
.tpr__c--ponto { transform: scale(.55); margin: 0 -.09em; opacity: .85; }
.tpr-enter-active, .tpr-leave-active { transition: transform .22s cubic-bezier(.2, .8, .2, 1), opacity .22s ease; }
.tpr-leave-active { position: absolute; left: 0; top: 0; }
.tpr-enter-from { transform: translateY(40%); opacity: 0; }
.tpr-leave-to { transform: translateY(-40%); opacity: 0; }
@media (prefers-reduced-motion: reduce) { .tpr-enter-active, .tpr-leave-active { transition: none; } }
</style>
