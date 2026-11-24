<script setup lang="ts">
// O ponto de atenção do documento: um cartão só de contorno, com o ponto
// laranja, o título e uma linha. É um botão quando abre algo na página e um
// link quando leva a outra.
const props = defineProps<{ titulo: string; texto?: string | null; to?: string }>()
defineEmits<{ (e: 'abrir'): void }>()
const Link = resolveComponent('NuxtLink')
</script>

<template>
  <component :is="props.to ? Link : 'button'" :to="props.to" :type="props.to ? undefined : 'button'" class="dat" @click="!props.to && $emit('abrir')">
    <span class="dat__txt">
      <span class="dat__t"><i aria-hidden="true" />{{ titulo }}</span>
      <span v-if="texto" class="dat__s">{{ texto }}</span>
    </span>
    <svg class="dat__seta" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
  </component>
</template>

<style scoped>
.dat { display: flex; align-items: flex-start; gap: 16px; width: 100%; padding: 18px 20px 18px 22px; border: 1px solid var(--nu-line-2); border-radius: 12px; background: transparent; color: var(--nu-ink); font: inherit; text-align: left; text-decoration: none; cursor: pointer; transition: border-color var(--nu-dur-media) var(--nu-ease-saida), background var(--nu-dur-media) var(--nu-ease-saida); }
.dat:hover { border-color: var(--nu-line); background: var(--nu-card); }
.dat:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 1px; }
.dat__txt { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.dat__t { display: flex; align-items: baseline; gap: 10px; font-size: 17.5px; line-height: 1.35; }
.dat__t i { flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--nu-amber-fill); transform: translateY(-3px); }
.dat__s { color: var(--nu-gray); font-size: 15.5px; line-height: 1.5; }
.dat__seta { flex: none; margin-top: 4px; color: var(--nu-gray); opacity: .7; }
</style>
