<script setup lang="ts">
// Seção "O fundo" (ETFs): dados cadastrais da B3 no lugar dos fundamentos de
// empresa (ETF não tem DRE/valuation próprios — o bloco scrape_extras.etf é a
// única fonte). Mesma linguagem das outras seções claras: H2 2 linhas +
// subtítulo + NuStatList light. O pai só renderiza com payload presente.
// Robustez (11/11/2026): abre com o eyebrow da seção (o mesmo rótulo da barra,
// "Por dentro"), como as outras do /asset; entra com o v-revelar ao chegar
// perto da tela (não mais com nu-fade no mount, que rodava fora da vista).
import type { AcaoFundInfoVM } from '~/types/acao'

defineProps<{ info: AcaoFundInfoVM; eyebrow?: string }>()
const sobre = useSobreDoContexto()
</script>

<template>
  <section v-contexto-chat="{ id: `fundo:${sobre}`, tipo: 'grafico', rotulo: rotuloComSobre('O fundo', sobre) }" class="afi">
    <div class="afi__cols">
      <div v-revelar class="afi__left">
        <NuEyebrow v-if="eyebrow" como="p" class="afi__eyebrow">{{ eyebrow }}</NuEyebrow>
        <h2 class="afi__title">{{ info.heading[0] }}<br>{{ info.heading[1] }}</h2>
        <div class="afi__sub">{{ info.sub }}</div>
      </div>
      <div v-revelar class="afi__rows">
        <NuStatList :rows="info.rows" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.afi {
  background: var(--nu-page);
  padding: clamp(72px, 8vw, 128px) var(--nu-coluna);
}
.afi__cols { display: flex; gap: clamp(32px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.afi__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.afi__eyebrow { margin-bottom: 16px; }
.afi__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02;
}
.afi__sub { color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5; margin-top: 16px; }
.afi__rows { flex: 1.2 1 380px; min-width: min(320px, 100%); }
</style>
