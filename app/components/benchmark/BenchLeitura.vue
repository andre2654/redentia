<script setup lang="ts">
// "Leitura da Redentia": um número grande e uma linha (dono, 16/10: "mentalidade
// de Apple, tirar muito texto, tudo meio autoexplicativo"). O selo da marca ao
// lado do número assina sem precisar de rótulo; o nome vai no leitor de tela e
// no title. Os dados saem de content/benchmark-ia/leituras.ts.
defineProps<{ numero: string; frase: string }>()
</script>

<template>
  <figure class="ble" title="Leitura da Redentia">
    <div class="ble__num">
      <span class="ble__badge" aria-hidden="true"><img src="/logo-branca.svg" alt="" class="ble__logo" width="12" height="12"></span>
      <span class="ble__sr">Leitura da Redentia: </span>{{ numero }}
    </div>
    <figcaption class="ble__frase">{{ frase }}</figcaption>
  </figure>
</template>

<style scoped>
.ble { margin: 0 0 clamp(28px, 3.4vw, 44px); }
.ble__num {
  display: flex; align-items: center; gap: 12px;
  color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
}
.ble__badge {
  width: 24px; height: 24px; flex-shrink: 0; border-radius: 8px; background: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.ble__logo { width: 12px; height: 12px; display: block; object-fit: contain; }
.ble__frase { max-width: 560px; margin: 8px 0 0 36px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; }
.ble__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (max-width: 640px) { .ble__frase { margin-left: 0; } }
</style>
