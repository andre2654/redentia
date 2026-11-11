<script setup lang="ts">
// Seção "O fundo" (ETFs): dados cadastrais da B3 no lugar dos fundamentos de
// empresa (ETF não tem DRE/valuation próprios — o bloco scrape_extras.etf é a
// única fonte). Mesma linguagem das outras seções claras: H2 2 linhas +
// subtítulo + NuStatList light. O pai só renderiza com payload presente.
import type { AcaoFundInfoVM } from '~/types/acao'

defineProps<{ info: AcaoFundInfoVM }>()
const sobre = useSobreDoContexto()
</script>

<template>
  <section v-contexto-chat="{ id: `fundo:${sobre}`, tipo: 'grafico', rotulo: rotuloComSobre('O fundo', sobre) }" class="afi">
    <div class="afi__cols">
      <div class="afi__left">
        <h2 class="afi__title">{{ info.heading[0] }}<br>{{ info.heading[1] }}</h2>
        <div class="afi__sub">{{ info.sub }}</div>
      </div>
      <div class="afi__rows">
        <NuStatList :rows="info.rows" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.afi {
  background: var(--nu-page);
  padding: clamp(64px, 7vw, 100px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  animation: nu-fade .5s ease both;
}
.afi__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.afi__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.afi__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02;
}
.afi__sub { color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; margin-top: 22px; }
.afi__rows { flex: 1.2 1 380px; min-width: min(320px, 100%); }
</style>
