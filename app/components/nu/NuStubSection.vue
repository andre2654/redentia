<script setup lang="ts">
// Placeholder de página em construção (PR0) — some conforme os PRs entregam.
// Usa a linguagem do design (creme, headline 800, pill azul) pra o shell já
// parecer produto enquanto as telas reais chegam.
defineProps<{ title: string }>()
</script>

<template>
  <section class="stub">
    <div class="stub__pill">Redentia Nu · em construção</div>
    <h1 class="stub__title">{{ title }}</h1>
    <p class="stub__dek">Esta tela será implementada com UX idêntica ao design aprovado.</p>
  </section>
</template>

<style scoped>
.stub {
  background: var(--nu-cream);
  padding: clamp(64px, 9vw, 120px) clamp(22px, 5.5vw, 80px);
  min-height: 46vh;
}
.stub__pill {
  display: inline-flex; align-items: center;
  background: var(--nu-blue-tint); color: var(--nu-blue);
  border-radius: var(--nu-r-pill); padding: 8px 16px;
  font-size: 13px; font-weight: 800; letter-spacing: 0.4px;
}
.stub__title {
  margin: 18px 0 0; color: var(--nu-ink);
  font-size: clamp(40px, 5.4vw, 78px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.0;
}
.stub__dek {
  color: var(--nu-gray); font-size: clamp(16px, 1.8vw, 20px);
  font-weight: 600; line-height: 1.55; margin-top: 18px; max-width: 560px;
}
</style>
