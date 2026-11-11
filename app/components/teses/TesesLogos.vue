<script setup lang="ts">
// Os papéis de uma tese em logos sobrepostos (as direções novas da /teses,
// 02/11/2026). Logo real da Brapi via NuAssetLogo; sem logo, o tile de letra.
// `tom="escuro"` para as bandas navy/preto. O texto dos tickers vai junto
// (leitor de tela e quem não reconhece a marca).
withDefaults(defineProps<{
  tickers: string[]
  mais?: number
  tamanho?: number
  tom?: 'claro' | 'escuro'
  /** mostra os tickers por extenso ao lado dos logos */
  nomes?: boolean
}>(), { mais: 0, tamanho: 28, tom: 'claro', nomes: true })
</script>

<template>
  <span class="tlg" :class="`tlg--${tom}`">
    <span class="tlg__pilha" aria-hidden="true">
      <span v-for="t in tickers" :key="t" class="tlg__logo" :style="{ width: `${tamanho}px`, height: `${tamanho}px` }">
        <NuAssetLogo
          :ticker="t" :letter="t.slice(0, 1)" :size="tamanho" :radius="Math.round(tamanho * 0.3)"
          :tile-bg="tom === 'escuro' ? 'var(--nu-navy-3)' : 'var(--nu-sand-2)'"
          :tile-fg="tom === 'escuro' ? 'var(--nu-cream-text)' : 'var(--nu-gray-2)'"
        />
      </span>
    </span>
    <span v-if="nomes" class="tlg__nomes">{{ tickers.join(' · ') }}<template v-if="mais"> +{{ mais }}</template></span>
    <span v-else class="tlg__sr">{{ tickers.join(', ') }}<template v-if="mais"> e mais {{ mais }}</template></span>
  </span>
</template>

<style scoped>
.tlg { display: inline-flex; align-items: center; gap: 10px; min-width: 0; }
.tlg__pilha { display: inline-flex; flex-shrink: 0; }
.tlg__logo {
  display: inline-flex; border-radius: 30%; overflow: hidden; flex-shrink: 0;
  box-shadow: 0 0 0 2px var(--nu-white);
}
.tlg__logo + .tlg__logo { margin-left: -6px; }
.tlg--escuro .tlg__logo { box-shadow: 0 0 0 2px var(--nu-navy); }
.tlg__nomes {
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: 0.02em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; font-variant-numeric: tabular-nums;
}
.tlg--escuro .tlg__nomes { color: var(--nu-cream-text-60); }
.tlg__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
