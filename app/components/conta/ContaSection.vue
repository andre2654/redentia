<script setup lang="ts">
// Painel de uma seção de /conta: card branco com título + subtítulo + conteúdo.
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
.cse { background: var(--nu-white); border-radius: var(--nu-r-card-lg); padding: clamp(24px, 3vw, 40px); }
.cse__title { margin: 0; color: var(--nu-ink); font-size: clamp(26px, 3vw, 34px); font-weight: 800; letter-spacing: -.02em; }
.cse__sub { margin: 8px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 500; line-height: 1.5; }
.cse__body { margin-top: clamp(24px, 3vw, 34px); }
</style>
