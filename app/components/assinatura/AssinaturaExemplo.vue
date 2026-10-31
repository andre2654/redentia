<script setup lang="ts">
// O cartão navy do /assinar e do paywall (31/10/2026): a FORMA do que a
// pessoa recebe — o leque dos 2.000 cenários — sem número nenhum. As faixas
// são de uma conta genérica (lequeDeExemplo): nada aqui finge ser a carteira
// de ninguém. Com a assinatura, o mesmo desenho sai com os valores dela na
// /carteira.
import { lequeDeExemplo } from '~/utils/futuro'

const dados = lequeDeExemplo()
</script>

<template>
  <figure class="aex">
    <figcaption class="aex__topo">
      <span class="aex__eyebrow">Daqui a 5 anos</span>
      <span class="aex__titulo">A sua carteira em 2.000 cenários.</span>
      <span class="aex__sub">O otimista, o meio e o pessimista, em dinheiro de hoje.</span>
    </figcaption>
    <CarteiraLeque :dados="dados" :fins="null" :altura="300" :eixo="{ hoje: 'hoje', fim: 'em 5 anos' }" />
    <span class="aex__nota">Projeção estatística, não previsão nem recomendação.</span>
  </figure>
</template>

<style scoped>
.aex {
  margin: 0; background: var(--nu-navy); border-radius: var(--nu-r-card-lg);
  padding: clamp(24px, 3vw, 36px); box-shadow: var(--nu-shadow-float);
  display: flex; flex-direction: column; gap: clamp(18px, 2.4vw, 28px);
}
.aex__topo { display: flex; flex-direction: column; gap: 8px; }
.aex__eyebrow { color: var(--nu-blue-soft); font-size: var(--nu-fs-sm); font-weight: 800; }
.aex__titulo { color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.aex__sub { color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.aex__nota { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; }
</style>
