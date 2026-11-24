<script setup lang="ts">
// O mesmo "Veja também" do /asset, na coluna das páginas de calculadora,
// proventos e quanto rende. Os chips quebram a linha; nada flutua por cima.
defineProps<{ links: { href: string; label: string }[] }>()
</script>

<template>
  <section v-if="links.length" class="nvt">
    <AtivoVejaTambem :links="links" />
  </section>
</template>

<style scoped>
.nvt {
  background: var(--nu-page);
  padding: 0 max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(48px, 6vw, 72px);
}
</style>
