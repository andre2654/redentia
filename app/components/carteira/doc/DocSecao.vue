<script setup lang="ts">
// Uma seção do documento da /carteira (24/11/2026, o canvas do meio-termo):
// o título, a frase "no seu caso" e, embaixo, um painel. Uma ideia por seção.
// É um contêiner de consulta: o que vai dentro se arruma pela largura da SEÇÃO,
// não da janela (com o painel do chat aberto a coluna encolhe e a janela não).
defineProps<{ titulo: string; idTitulo: string }>()
</script>

<template>
  <section class="dsc" :aria-labelledby="idTitulo" data-clarity-mask="true">
    <h2 :id="idTitulo" class="dsc__t">{{ titulo }}</h2>
    <p v-if="$slots.frase" class="dsc__frase"><slot name="frase" /></p>
    <div class="dsc__corpo"><slot /></div>
  </section>
</template>

<style scoped>
.dsc { position: relative; padding: var(--cvi-v, 56px) var(--cvi-g, 32px); container: secao / inline-size; scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.dsc::before { content: ''; position: absolute; top: 0; left: var(--cvi-g, 32px); right: var(--cvi-g, 32px); height: 1px; background: var(--nu-line-2); }
.dsc__t { margin: 0; color: var(--nu-ink); font-size: 26px; line-height: 1.2; font-weight: var(--nu-w-display); letter-spacing: -0.02em; }
.dsc__frase { margin: 14px 0 0; max-width: 820px; color: var(--nu-ink); font-size: 17.5px; font-weight: 400; line-height: 1.7; font-variant-numeric: tabular-nums; }
.dsc__corpo { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
</style>
