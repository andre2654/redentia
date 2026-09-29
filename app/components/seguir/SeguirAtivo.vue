<script setup lang="ts">
// Estrela "Seguir" de um ativo + retorno curto — hero do /asset (fileira de
// CTAs do AcaoHero) e do /dividendos. A lógica mora no useSeguirAtivo
// (anônimo → /login com a intenção; ?seguir=1 → segue uma vez; otimista com
// rollback). O SSR renderiza sempre "Seguir": a página é cacheada na borda e
// o estado real só existe no client, depois do mount.
//
// DOIS nós na raiz de propósito: o pai é uma fileira flex-wrap e a linha de
// retorno precisa virar LINHA PRÓPRIA abaixo dos botões (flex-basis 100% +
// order 1), não um item espremido ao lado. Vazia, a linha sai do fluxo
// (sr-only) mas continua no DOM: região aria-live que já existia anuncia o
// texto novo; uma que nasce junto com o texto costuma ser ignorada.
const props = defineProps<{ ticker: string; path: string }>()

const { following, pending, toggle, feedback } = useSeguirAtivo(() => props.ticker, () => props.path)
</script>

<template>
  <NuFollowButton icon="star" surface="cream" :following="following" :pending="pending" @toggle="toggle" />
  <p class="sga__msg" :class="{ 'sga__msg--on': !!feedback, 'sga__msg--err': feedback?.kind === 'error' }" aria-live="polite">{{ feedback?.text ?? '' }}</p>
</template>

<style scoped>
.sga__msg {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; margin: 0;
}
.sga__msg--on {
  position: static; width: auto; height: auto; overflow: visible; clip: auto; clip-path: none;
  white-space: normal; order: 1; flex-basis: 100%;
  color: var(--nu-green-2); font-size: 15px; font-weight: 700; line-height: 1.5;
  animation: nu-fade .2s ease both;
}
.sga__msg--err { color: var(--nu-red-2); }
</style>
