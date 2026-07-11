<script setup lang="ts">
// Card creme "A LEITURA DO ATLAS" (mini-badge quadrado azul com a marca +
// label uppercase espaçada + parágrafo da leitura da IA) — valores exatos do
// design (Redentia Noticias Nu.dc.html). Compartilhado: qualquer tela que
// mostre take do Atlas (notícia, ativo, mercado, briefing).
withDefaults(defineProps<{ text: string; label?: string }>(), { label: 'A leitura do Atlas' })
</script>

<template>
  <div class="nat">
    <div class="nat__head">
      <span class="nat__badge"><img src="/logo-branca.svg" alt="" class="nat__logo"></span>
      <span class="nat__label">{{ label }}</span>
    </div>
    <div class="nat__body">{{ text }}</div>
  </div>
</template>

<style scoped>
.nat { background: var(--nu-cream); border-radius: 20px; padding: 20px 22px; }
.nat__head { display: flex; align-items: center; gap: 9px; }
.nat__badge {
  width: 26px; height: 26px; flex-shrink: 0; border-radius: 8px; background: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.nat__logo { width: 14px; height: 14px; display: block; object-fit: contain; }
.nat__label {
  color: var(--nu-blue); font-size: 11.5px; font-weight: 800;
  letter-spacing: 1.2px; text-transform: uppercase;
}
.nat__body { color: var(--nu-gray-3); font-size: 15.5px; font-weight: 500; line-height: 1.65; margin-top: 10px; }
</style>
