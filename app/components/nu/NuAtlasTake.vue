<script setup lang="ts">
// Cartão creme "A LEITURA DA IA": o sinal da marca + rótulo em caixa alta
// espaçada + o parágrafo da leitura. Compartilhado: qualquer tela que mostre a
// leitura da IA (notícia, ativo, mercado, briefing).
// APORTOU (11/11/2026): o selo quadrado azul com o losango da Redentia deu
// lugar ao corte azul do "t" (o sinal da IA da Aportou), no rótulo da marca.
withDefaults(defineProps<{ text: string; label?: string }>(), { label: 'A leitura da IA' })
</script>

<template>
  <div class="nat">
    <div class="nat__head">
      <MarcaCorte :largura="20" />
      <span class="nat__label">{{ label }}</span>
    </div>
    <div class="nat__body">{{ text }}</div>
  </div>
</template>

<style scoped>
.nat { background: var(--nu-card); border-radius: var(--nu-r-panel); padding: 20px 22px; box-shadow: var(--nu-shadow-quente); }
.nat__head { display: flex; align-items: center; gap: 9px; }
.nat__label {
  color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
}
.nat__body { color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; margin-top: 10px; }
</style>
