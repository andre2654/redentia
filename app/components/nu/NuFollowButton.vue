<script setup lang="ts">
// Botão toggle de seguir (PR5, hero da tese): off = pill creme + bookmark +
// 'Acompanhar tese' · on = verde-accent + check + 'Acompanhando'.
// Reusável pra seguir teses/ativos — quem decide o que o clique faz é o pai
// (V1: anônimo → /login com redirect; logado → toggle local; a persistência
// em thesis_favorites entra com o fluxo logado do PR6+).
//
// Variante de ATIVO (29/09/2026, /asset e /dividendos): icon="star" +
// surface="cream". Off = pill branca sobre o creme do hero com estrela vazada
// e 'Seguir'; on = azul-claro (o mesmo par do badge "Acompanhar") com estrela
// cheia e 'Seguindo'. Mesma altura dos CTAs do AcaoHero (17px/700, padding
// 17px) pra fileira não ficar serrilhada. A tese segue no default (navy).
const props = withDefaults(defineProps<{
  following: boolean
  labelOff?: string
  labelOn?: string
  icon?: 'bookmark' | 'star'
  /** superfície onde o botão pousa: navy (hero da tese) | cream (hero de ativo) */
  surface?: 'navy' | 'cream'
  /** request em voo: cursor de progresso, botão continua clicável (nunca botão morto) */
  pending?: boolean
}>(), { icon: 'bookmark', surface: 'navy', pending: false })

defineEmits<{ toggle: [] }>()

const label = computed(() => {
  if (props.following) return props.labelOn ?? (props.icon === 'star' ? 'Seguindo' : 'Acompanhando')
  return props.labelOff ?? (props.icon === 'star' ? 'Seguir' : 'Acompanhar tese')
})
</script>

<template>
  <button
    type="button" class="nfb" :class="[`nfb--${surface}`, { 'nfb--on': following }]"
    :aria-pressed="following" :aria-busy="pending || undefined" @click="$emit('toggle')"
  >
    <svg v-if="icon === 'star'" width="18" height="18" viewBox="0 0 24 24" :fill="following ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.3l2.63 5.52 6.07.77-4.45 4.2 1.13 6.02L12 16.9l-5.38 2.91 1.13-6.02-4.45-4.2 6.07-.77z" /></svg>
    <svg v-else-if="!following" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
    {{ label }}
  </button>
</template>

<style scoped>
.nfb {
  pointer-events: auto; display: inline-flex; align-items: center; gap: 10px;
  border: none; border-radius: var(--nu-r-pill); padding: 15px 28px;
  font-size: 15.5px; font-weight: 800; cursor: pointer;
  background: var(--nu-cream); color: var(--nu-navy);
  transition: background .2s, color .2s, transform .15s;
}
.nfb--on { background: var(--nu-green-soft); }

/* ativo sobre o creme (card sobre creme é branco — regra 2 do design system) */
.nfb--cream {
  background: var(--nu-white); color: var(--nu-ink);
  padding: 17px 26px; font-size: 17px; font-weight: 700;
}
.nfb--cream:hover { transform: translateY(-2px); }
.nfb--cream.nfb--on { background: var(--nu-blue-bg); color: var(--nu-blue); }
.nfb[aria-busy='true'] { cursor: progress; }
.nfb:focus-visible { outline: 3px solid var(--nu-blue-30); outline-offset: 2px; }
</style>
