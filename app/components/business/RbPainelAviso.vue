<script setup lang="ts">
/**
 * O retorno de uma ação do painel ("Chave pausada", "Nome salvo"): uma pílula
 * escura no pé da tela, que entra, fica uns segundos e sai. A região
 * aria-live existe sempre (vazia quando não há aviso), para o leitor de tela
 * anunciar a mudança, que é o único jeito de ele saber que a ação deu certo.
 */
defineProps<{ texto: string | null }>()
</script>

<template>
  <div class="rbpa" role="status" aria-live="polite">
    <Transition name="rbpa">
      <div v-if="texto" :key="texto" class="rbpa__pilula">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span>{{ texto }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.rbpa { position: fixed; left: 0; right: 0; bottom: max(24px, env(safe-area-inset-bottom)); z-index: 60; display: flex; justify-content: center; pointer-events: none; padding: 0 16px; }
.rbpa__pilula {
  display: inline-flex; align-items: center; gap: 10px; max-width: 520px; padding: 12px 20px 12px 16px; border-radius: var(--nu-r-pill);
  background: var(--nu-navy); color: var(--nu-cream-text); box-shadow: var(--nu-shadow-float);
  font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.4;
}
.rbpa__pilula svg { flex: none; width: 18px; height: 18px; padding: 2px; border-radius: 50%; background: var(--nu-green); color: var(--nu-white); }
.rbpa-enter-active, .rbpa-leave-active { transition: opacity .25s ease, transform .3s cubic-bezier(.2, .8, .2, 1); }
.rbpa-enter-from, .rbpa-leave-to { opacity: 0; transform: translateY(12px) scale(.97); }
@media (prefers-reduced-motion: reduce) {
  .rbpa-enter-active, .rbpa-leave-active { transition: opacity .15s linear; }
  .rbpa-enter-from, .rbpa-leave-to { transform: none; }
}
</style>
