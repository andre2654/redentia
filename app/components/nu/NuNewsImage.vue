<script setup lang="ts">
// Imagem de notícia com fallback ÚNICO (1 implementação pra todo lugar que
// renderizar imagem de matéria): src null/vazio OU <img> que dispara @error
// degradam pro mesmo estado — bloco na paleta, o wordmark da Aportou apagado no
// centro e o aviso "Não conseguimos carregar essa imagem". O container mantém o
// tamanho/radius do pai (sizing vem por classe do pai; aqui só o miolo).
// tone 'light' = faixa creme + wordmark carvão · 'dark' = carvão + wordmark claro
// (o corte do "t" segue azul nos dois: cobalto no claro, o que lê no escuro).
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
      <MarcaAportou class="nni__logo" :altura="28" :sobre="tone === 'dark' ? 'escuro' : 'claro'" />
      <span class="nni__msg">Não conseguimos carregar essa imagem</span>
    </div>
  </div>
</template>

<style scoped>
/* sizing (flex/min-height/aspect) e radius vêm da classe do pai */
.nni { position: relative; overflow: hidden; }
.nni--light { background: var(--nu-band); color: var(--nu-ink); }
.nni--dark { background: var(--nu-ink); color: var(--nu-white); }
.nni__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.nni__fallback {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 20px; text-align: center;
  animation: nu-fade .35s ease both;
}
.nni__logo { width: 108px; max-width: 46%; height: auto; opacity: .42; }
.nni__msg { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.4; }
/* sobre carvão o gray afunda; sobe para a legenda sobre carvão da paleta */
.nni--dark .nni__msg { color: var(--nu-on-dark-2); }
</style>
