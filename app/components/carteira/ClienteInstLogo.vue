<script setup lang="ts">
/**
 * Avatar quadrado arredondado da instituição, como na lista do Pluggy
 * Connect: o SVG oficial em public/instituicoes/{slug}.svg quando existe
 * (cor de marca de terceiro: a única exceção à regra do var(--nu-*)); sem
 * logo, as iniciais sobre creme.
 *
 * Usado na carteira vazia e na assinatura (os bancos que a pessoa conecta).
 * Nasceu no widget de conexão do cliente do escritório, que saiu com o B2B em
 * 12/11/2026; o nome ficou para não mexer em quem usa.
 */
import { iniciaisDe, type Instituicao } from '~/content/instituicoes'

const props = withDefaults(defineProps<{ inst: Instituicao, size?: number }>(), { size: 28 })

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: `${Math.round(props.size * 0.28)}px`,
  fontSize: `${Math.max(10, Math.round(props.size * 0.34))}px`,
}))
</script>

<template>
  <span class="cil" :class="{ 'cil--ini': !inst.logo }" :style="style" aria-hidden="true">
    <img v-if="inst.logo" :src="`/instituicoes/${inst.slug}.svg`" alt="" :width="size" :height="size" class="cil__img" loading="lazy" decoding="async">
    <template v-else>{{ iniciaisDe(inst.name) }}</template>
  </span>
</template>

<style scoped>
.cil {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
}
.cil--ini { background: var(--nu-cream); color: var(--nu-gray-2); font-weight: var(--nu-w-forte); letter-spacing: .02em; }
.cil__img { width: 100%; height: 100%; display: block; object-fit: cover; }
</style>
