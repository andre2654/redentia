<script setup lang="ts">
// O eyebrow da Aportou: o corte azul do "t" + caixa alta espaçada (13,5px,
// 700, 0,2em). Abre toda seção e toda tela ("ENTRAR", "COMO FUNCIONA").
// `claro` é para fundo carvão ou azul: letra branca, corte no cobalto que lê
// sobre escuro (ou branco, sobre o gradiente azul, com `sobre="azul"`). Sobre
// a sálvia (`sobre="salvia"`) a letra fica carvão e o corte também: o cobalto
// não separa do verde.
withDefaults(defineProps<{ como?: string; sobre?: 'claro' | 'escuro' | 'azul' | 'salvia' }>(), { como: 'span', sobre: 'claro' })
</script>

<template>
  <component :is="como" class="nu-eyebrow" :class="{ 'nu-eyebrow--claro': sobre === 'escuro' || sobre === 'azul' }">
    <MarcaCorte :cor="sobre === 'azul' ? 'var(--nu-white)' : sobre === 'escuro' ? 'var(--nu-blue-on-dark)' : sobre === 'salvia' ? 'var(--nu-ink)' : 'var(--nu-blue)'" />
    <span><slot /></span>
  </component>
</template>
