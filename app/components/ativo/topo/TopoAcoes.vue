<script setup lang="ts">
// As ações do topo do ativo (TopoBolsa) como botões-ícone redondos, com rótulo
// embaixo e dica no hover (03/11/2026): Seguir (a mesma lógica da
// estrela de hoje, useSeguirAtivo), Adicionar à carteira (o mesmo link),
// Compartilhar (a folha do sistema; sem ela, copia o link) e Perguntar (abre o
// painel do chat com o ativo anexado). Mola só no toque. O botão é o
// TopoBotao, o mesmo do topo da /carteira (05/11/2026).
import TopoBotao from './TopoBotao.vue'

const props = defineProps<{ ticker: string; seguivel: boolean }>()
const emit = defineEmits<{ perguntar: [] }>()

const caminho = computed(() => `/asset/${props.ticker}`)
const { following, pending, toggle, feedback } = useSeguirAtivo(() => props.ticker, caminho)
const copiado = ref(false)
async function compartilhar() {
  const url = `${window.location.origin}${caminho.value}`
  try {
    if (navigator.share) { await navigator.share({ title: `${props.ticker} · Redentia`, url }); return }
    await navigator.clipboard.writeText(url)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 1800)
  } catch { /* a pessoa fechou a folha */ }
}
</script>

<template>
  <div class="tac">
    <TopoBotao
      v-if="seguivel" :rotulo="following ? 'Seguindo' : 'Seguir'" :on="following" :aria-pressed="following" :aria-busy="pending || undefined"
      :title="following ? 'Deixar de seguir' : 'Seguir'" @click="toggle"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" :fill="following ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.3l2.63 5.52 6.07.77-4.45 4.2 1.13 6.02L12 16.9l-5.38 2.91 1.13-6.02-4.45-4.2 6.07-.77z" /></svg>
    </TopoBotao>
    <TopoBotao to="/" rotulo="Adicionar à carteira" title="Adicionar à carteira">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
    </TopoBotao>
    <TopoBotao :rotulo="copiado ? 'Link copiado' : 'Compartilhar'" title="Compartilhar" @click="compartilhar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
    </TopoBotao>
    <TopoBotao rotulo="Perguntar" title="Perguntar à Redentia sobre este ativo" @click="emit('perguntar')">
      <img src="/logo-azul.svg" alt="" width="16" height="16" class="tac__logo">
    </TopoBotao>
    <p class="tac__msg" :class="{ 'tac__msg--on': !!feedback }" aria-live="polite">{{ feedback?.text ?? '' }}</p>
  </div>
</template>

<style scoped>
/* o botão redondo mora no TopoBotao (o mesmo do topo da /carteira) */
.tac { --mola: cubic-bezier(.34, 1.56, .64, 1); position: relative; display: flex; align-items: flex-start; gap: 14px; }
.tac__logo { filter: brightness(0) invert(1); }
.tac__msg { position: absolute; top: 100%; left: 0; margin: 6px 0 0; font-size: var(--nu-fs-xs); font-weight: 600; opacity: 0; transition: opacity .2s ease; white-space: nowrap; }
.tac__msg { color: var(--nu-agora-sub); }
.tac__msg--on { opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  .tac__msg { transition: none; }
}
</style>
