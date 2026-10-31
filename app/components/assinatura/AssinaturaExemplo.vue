<script setup lang="ts">
// O cartão navy do /assinar e do paywall (31/10/2026): a FORMA do que a
// pessoa recebe — o leque dos 2.000 cenários — sem número nenhum. Os
// caminhos são sorteados de uma conta genérica (caminhosDeExemplo) e se
// desenham como na Simulação dos apps (AssinaturaExemploCaminhos): nada aqui
// finge ser a carteira de ninguém. Com a assinatura, o leque sai com os
// valores dela na /carteira.
const emit = defineEmits<{ (e: 'pronto'): void }>()
</script>

<template>
  <figure class="aex">
    <figcaption class="aex__topo">
      <span class="aex__titulo">Os próximos 5 anos da sua carteira.</span>
    </figcaption>
    <AssinaturaExemploCaminhos :altura="300" @pronto="emit('pronto')" />
    <span class="aex__nota">Projeção estatística, não previsão nem recomendação.</span>
  </figure>
</template>

<style scoped>
/* sem caixa (pedido do dono, 31/10/2026): o leque fica solto no azul-marinho do topo */
.aex { margin: 0; display: flex; flex-direction: column; gap: clamp(18px, 2.4vw, 28px); }
.aex__topo { display: flex; flex-direction: column; gap: 8px; }
.aex__titulo { color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.aex__nota { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; }
</style>
