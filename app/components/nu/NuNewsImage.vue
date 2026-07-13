<script setup lang="ts">
// Imagem de notícia com fallback ÚNICO (1 implementação pra todo lugar que
// renderizar imagem de matéria): src null/vazio OU <img> que dispara @error
// degradam pro mesmo estado — bloco na paleta, logo Redentia pequena centrada
// e o aviso "Não conseguimos carregar essa imagem". O container mantém o
// tamanho/radius do pai (sizing vem por classe do pai; aqui só o miolo).
// tone 'light' = fundo creme + /logo-azul.svg · 'dark' = navy + /logo-branca.svg.
const props = withDefaults(defineProps<{
  src: string | null | undefined
  alt: string
  tone?: 'light' | 'dark'
}>(), { tone: 'light' })

// falha por src: quando a URL troca (seed → real), a imagem ganha nova chance
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })

const showImg = computed(() => !!props.src && !failed.value)
</script>

<template>
  <div class="nni" :class="`nni--${tone}`">
    <img
      v-if="showImg"
      :src="src!" :alt="alt" class="nni__img"
      loading="lazy" @error="failed = true"
    >
    <div v-else class="nni__fallback" role="img" :aria-label="alt || 'Não conseguimos carregar essa imagem'">
      <img :src="tone === 'dark' ? '/logo-branca.svg' : '/logo-azul.svg'" alt="" class="nni__logo">
      <span class="nni__msg">Não conseguimos carregar essa imagem</span>
    </div>
  </div>
</template>

<style scoped>
/* sizing (flex/min-height/aspect) e radius vêm da classe do pai */
.nni { position: relative; overflow: hidden; }
.nni--light { background: var(--nu-cream); }
.nni--dark { background: var(--nu-navy); }
.nni__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.nni__fallback {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 20px; text-align: center;
  animation: nu-fade .35s ease both;
}
.nni__logo { width: 88px; max-width: 42%; height: auto; opacity: .38; }
.nni__msg { color: var(--nu-gray); font-size: 13px; font-weight: 600; line-height: 1.4; }
/* sobre navy o gray afunda; sobe pro texto-sobre-navy translúcido da paleta */
.nni--dark .nni__msg { color: var(--nu-cream-text-60); }
</style>
