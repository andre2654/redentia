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
// Aportou (11/11/2026): a volta para as calculadoras virou o eyebrow da marca
// (o corte azul + caixa alta espaçada; o texto do link é o mesmo), o fundo é o
// creme da página e o título vai em 800 com o espaçamento dos quadros.
defineProps<{
  /** a linha de apoio embaixo do título */
  desc: string
}>()
</script>

<template>
  <section class="cto">
    <NuxtLink to="/calculadoras" class="cto__voltar nu-eyebrow">
      <svg class="cto__seta" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      <MarcaCorte />
      <span>Calculadoras</span>
    </NuxtLink>
    <h1 class="cto__h1"><slot /></h1>
    <p class="cto__desc">{{ desc }}</p>
  </section>
</template>

<style scoped>
.cto {
  background: var(--nu-page); text-align: center;
  padding: clamp(16px, 2.2vw, 26px) max(clamp(16px, 5.5vw, 80px), calc((100% - 1240px) / 2)) 0;
  animation: nu-fade .5s ease both;
}
.cto__voltar { width: fit-content; min-height: 44px; text-align: left; }
.cto__voltar:hover { color: var(--nu-ink); }
.cto__seta { flex: none; margin-right: -4px; color: var(--nu-gray); transition: transform .25s var(--nu-ease-saida); }
.cto__voltar:hover .cto__seta { transform: translateX(-3px); }
.cto__h1 {
  margin: 10px auto 0; max-width: 1180px; color: var(--nu-ink);
  font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02;
  text-wrap: balance;
}
.cto__desc { margin: 16px auto 0; max-width: 56ch; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; }

@media (max-width: 640px) {
  .cto { text-align: left; }
  .cto__h1 { margin-top: 8px; }
  .cto__desc { margin-top: 12px; }
}
</style>
