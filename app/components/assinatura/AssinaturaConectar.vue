<script setup lang="ts">
// O "Conectar carteira" (31/10/2026): o mesmo botão no topo e no fim de cada
// seção do /assinar e do paywall, sempre abrindo o quiz (AssinaturaQuiz, que
// vive no layout). A origem vai no evento quiz_aberto, para saber qual seção
// puxou a pessoa. Na Aportou (11/11/2026) é a pílula com a seta no círculo
// (NuBotaoSeta): azul sobre claro e sobre carvão, creme quando o fundo é azul.
withDefaults(defineProps<{ origem: string; tom?: 'azul' | 'creme' }>(), { tom: 'azul' })
const quiz = useQuizAssinatura()
</script>

<template>
  <NuBotaoSeta class="acn" :variante="tom" aria-haspopup="dialog" @click="quiz.abrir(origem)">Conectar carteira</NuBotaoSeta>
</template>

<style scoped>
/* a pílula é o NuBotaoSeta; aqui só o que é deste lugar: não encolhe na fila */
.acn { flex: none; }
</style>
