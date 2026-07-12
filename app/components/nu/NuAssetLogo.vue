<script setup lang="ts">
// Logo REAL do ativo com fallback pro tile de letra colorido — padrão do PR7
// pós-batch (UX do dono 2026-07-11), extraído do HomePositions no PR8 pra
// /carteira reusar (posições e movimentações). Fonte: icons.brapi.dev (a
// mesma da tabela `tickers` do backend); 404/erro → tile de letra (design
// original). Cores SEMPRE via var(--nu-*) passadas por prop.
const props = defineProps<{
  ticker: string
  letter: string
  tileBg: string
  tileFg: string
  /** lado em px (design: 40 nas posições, 48 nas movimentações, 52 na Home) */
  size?: number
  /** radius em px (design: 12 p/ 40px, 14 p/ 48px, 16 p/ 52px) */
  radius?: number
}>()

const failed = ref(false)
// font-size da letra por tamanho — valores EXATOS do design (40→15, 48→17,
// 52→19 na Home); tamanho fora do mapa cai numa proporção equivalente.
const FONT: Record<number, number> = { 40: 15, 48: 17, 52: 19 }
const fontPx = computed(() => FONT[props.size ?? 40] ?? Math.round((props.size ?? 40) * 0.36))
const src = computed(() => `https://icons.brapi.dev/icons/${encodeURIComponent(props.ticker.toUpperCase())}.svg`)
// Tickers não-B3 (Tesouro, CDB, cripto, saldo) não têm ícone na Brapi — vai
// direto pro tile de letra sem tentar request fadado a 404.
const eligible = computed(() => /^[A-Z]{4}\d{1,2}$/.test(props.ticker.toUpperCase()))
const showImg = computed(() => eligible.value && !failed.value)
</script>

<template>
  <span
    class="nal"
    :style="{
      width: `${size ?? 40}px`, height: `${size ?? 40}px`,
      borderRadius: `${radius ?? 12}px`,
      fontSize: `${fontPx}px`,
      ...(showImg ? {} : { background: tileBg, color: tileFg }),
    }"
  >
    <img
      v-if="showImg" :src="src" :alt="ticker" class="nal__img"
      loading="lazy" @error="failed = true"
    >
    <template v-else>{{ letter }}</template>
  </span>
</template>

<style scoped>
.nal {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  font-weight: 800; overflow: hidden; background: var(--nu-cream);
}
.nal__img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
