<script setup lang="ts">
// O topo das calculadoras na frase (dono, 21/10/2026: "redesenhar levemente
// esse início das calculadoras, inspirado na Apple"). No lugar do CalcHero com
// o título de SEO em três linhas e de um segundo título "Aposentadoria." logo
// abaixo, um topo só: a volta para as calculadoras, a pergunta grande no h1 e
// uma linha de apoio. A conta vem logo embaixo, na primeira tela (CalcConta).
// O nome da calculadora com o ícone e o prefixo "Calculadora de … 2026" saíram
// a pedido do dono no mesmo dia ("eles são meio inúteis"): a palavra-chave
// segue no <title>, no JSON-LD e na faixa "Como Usar a Calculadora de …".
// O CalcHero segue nas outras calculadoras, inclusive na preço-teto (veto).
defineProps<{
  /** a linha de apoio embaixo do título */
  desc: string
}>()
</script>

<template>
  <section class="cto">
    <NuxtLink to="/calculadoras" class="cto__voltar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      Calculadoras
    </NuxtLink>
    <h1 class="cto__h1"><slot /></h1>
    <p class="cto__desc">{{ desc }}</p>
  </section>
</template>

<style scoped>
.cto {
  background: var(--nu-cream); text-align: center;
  padding: clamp(16px, 2.2vw, 26px) clamp(16px, 5.5vw, 80px) 0;
  animation: nu-fade .5s ease both;
}
.cto__voltar {
  display: flex; align-items: center; gap: 4px; width: fit-content;
  color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; text-align: left;
}
.cto__voltar:hover { color: var(--nu-ink); }
.cto__h1 {
  margin: 18px auto 0; max-width: 1180px; color: var(--nu-ink);
  font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.05em; line-height: 1.04;
  text-wrap: balance;
}
.cto__desc { margin: 14px auto 0; max-width: 56ch; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; }

@media (max-width: 640px) {
  .cto { text-align: left; }
  .cto__h1 { margin-top: 16px; }
  .cto__desc { margin-top: 12px; }
}
</style>
