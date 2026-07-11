<script setup lang="ts">
// Seção de dividendos (design Acoes Nu): esquerda com H2 + subtítulo (soma 12M
// real) + NuStatList light + pill personalizada (AUTH-ONLY: "Suas N cotas
// geraram R$ X em 12 meses" — anônimo nunca vê) + CTA pra calculadoras;
// direita com NuDividendBars por ano. A linha de Payout do design foi OMITIDA
// (não existe payout em endpoint público). Seção some sem proventos em 24M.
import type { AcaoDividendsVM } from '~/types/acao'
import type { AcaoPosition } from '~/composables/useAcao'

const props = defineProps<{
  ticker: string
  dividends: AcaoDividendsVM
  position: AcaoPosition | null
}>()

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const incomePill = computed(() => {
  if (!props.position || props.dividends.sum12 <= 0) return null
  const total = props.position.qty * props.dividends.sum12
  return `Suas ${nf0.format(props.position.qty)} cotas geraram R$ ${nf0.format(total)} em 12 meses`
})
</script>

<template>
  <section class="adv">
    <div class="adv__cols">
      <div class="adv__left">
        <h2 class="adv__title">{{ dividends.heading[0] }}<br>{{ dividends.heading[1] }}</h2>
        <div class="adv__sub">{{ dividends.subtitle }}</div>
        <div class="adv__stats">
          <NuStatList :rows="dividends.rows" />
        </div>
        <div v-if="incomePill" class="adv__income">{{ incomePill }}</div>
        <div class="adv__cta-row">
          <NuxtLink to="/calculadoras" class="adv__cta">Simular renda com {{ ticker }}</NuxtLink>
        </div>
      </div>
      <div class="adv__right">
        <NuDividendBars
          :bars="dividends.bars"
          :footnote="`Dividendos + JCP por ação, por ano · ${dividends.bars[dividends.bars.length - 1]?.year ?? ''} considera os últimos 12 meses`"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.adv {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.adv__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.adv__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.adv__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.adv__sub { color: var(--nu-gray); font-size: 17px; font-weight: 600; line-height: 1.5; margin-top: 22px; }
.adv__stats { margin-top: 26px; }
.adv__income {
  display: inline-flex; align-items: center; gap: 8px; background: var(--nu-blue-tint);
  color: var(--nu-blue); font-size: 14.5px; font-weight: 800; padding: 11px 18px;
  border-radius: var(--nu-r-pill); margin-top: 24px; font-variant-numeric: tabular-nums;
}
.adv__cta-row { margin-top: 28px; }
.adv__cta {
  display: inline-flex; align-items: center; gap: 10px; background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 14px 26px;
  font-size: 16px; font-weight: 700; transition: background .2s;
}
.adv__cta:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
.adv__right { flex: 1.6 1 460px; min-width: min(320px, 100%); }
</style>
