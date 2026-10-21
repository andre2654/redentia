<script setup lang="ts">
// O topo das calculadoras na frase (dono, 21/10/2026: "redesenhar levemente
// esse início das calculadoras, inspirado na Apple"). No lugar do CalcHero com
// o título de SEO em três linhas e de um segundo título "Aposentadoria." logo
// abaixo, um topo só: o nome da calculadora, o h1 em duas camadas (o prefixo
// de SEO pequeno e a pergunta grande, as mesmas palavras de antes) e uma linha
// de apoio. A conta vem logo embaixo, na primeira tela (CalcConta).
// O CalcHero segue nas outras calculadoras, inclusive na preço-teto (veto).
defineProps<{
  /** o nome curto da calculadora, ao lado do ícone */
  produto: string
  icone?: 'relogio' | 'curva'
  /** a linha de apoio embaixo do título */
  desc: string
}>()

const ICONES = {
  relogio: ['M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z', 'M12 7.5V12l3 2'],
  curva: ['M4 19h16', 'M5 16c4-1 7-4 9-9l1.5-2.5', 'M16 5h3v3'],
}
</script>

<template>
  <section class="cto">
    <NuxtLink to="/calculadoras" class="cto__voltar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      Calculadoras
    </NuxtLink>
    <p class="cto__produto">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path v-for="d in ICONES[icone ?? 'curva']" :key="d" :d="d" />
      </svg>
      {{ produto }}
    </p>
    <h1 class="cto__h1">
      <span v-if="$slots.prefixo" class="cto__prefixo"><slot name="prefixo" /></span>
      <slot />
    </h1>
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
.cto__produto {
  display: inline-flex; align-items: center; gap: 9px; margin: 2px 0 0;
  color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700;
}
.cto__produto svg { color: var(--nu-blue); }
.cto__h1 {
  margin: 10px auto 0; max-width: 1180px; color: var(--nu-ink);
  font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.05em; line-height: 1.04;
  text-wrap: balance;
}
.cto__prefixo {
  display: block; margin-bottom: 6px; color: var(--nu-gray);
  font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: 0; line-height: 1.4;
}
.cto__desc { margin: 12px auto 0; max-width: 56ch; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; }

@media (max-width: 640px) {
  .cto { text-align: left; }
  .cto__produto { display: flex; margin-top: 14px; font-size: var(--nu-fs-md); }
  .cto__h1 { margin-top: 8px; }
  .cto__prefixo { margin-bottom: 6px; font-size: var(--nu-fs-dense); }
  .cto__desc { margin-top: 12px; }
}
</style>
