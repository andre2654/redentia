<script setup lang="ts">
// Painel de uma seção de /conta: o cartão creme da Aportou (raio 28, a sombra
// quente) com título em 800 + subtítulo + conteúdo. Dentro dele, o branco fica
// para os campos e para os cartões de dado.
// Mesmo shape em todas as seções (Perfil, Notificações, Segurança, ...) → uma
// implementação só. O título é h2 (o h1 da página é o nome da conta no topo).
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <section class="cse">
    <header class="cse__head">
      <h2 class="cse__title">{{ title }}</h2>
      <p v-if="subtitle" class="cse__sub">{{ subtitle }}</p>
    </header>
    <div class="cse__body"><slot /></div>
  </section>
</template>

<style scoped>
.cse { background: var(--nu-card); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); padding: clamp(24px, 3vw, 40px); }
.cse__title { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -.025em; line-height: 1.05; }
.cse__sub { margin: 10px 0 0; max-width: 62ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.cse__body { margin-top: clamp(24px, 3vw, 34px); }
</style>
