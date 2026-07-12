<script setup lang="ts">
// 'Sua renda passiva.' (design Carteira Nu): seção azul #2F6BFF com 3 cards
// #2456C9 radius 26 — (1) mês corrente com badge 'N pagamentos' mint, total
// mint gigante e lista dia/ticker/tipo/valor; (2) recorde/média com mini bar
// chart de 6 meses (barra máxima mint, demais creme .22); (3) próximos
// pagamentos com tile de data 44px, badge 'Confirmado' mint e rodapé
// 'Previsto até X'. Badge 'Previsão IA' do design NÃO existe no backend →
// só 'Confirmado' (decisão documentada).
// ESTADOS: cards ausentes (sem histórico/sem agenda) somem do grid auto-fit;
// a seção inteira some quando não há nada (decisão no useCarteira).
// Máscara de privacidade: '+R$ ••' / 'R$ ••••' (padrões do design).
import type { CarteiraIncomeVM } from '~/types/carteira'

defineProps<{ income: CarteiraIncomeVM }>()
const { hidden } = useHiddenValues()

const maskPlus = (v: string) => (hidden.value ? '+R$ ••' : v)
const maskVal = (v: string, dots = 4) => (hidden.value ? `R$ ${'•'.repeat(dots)}` : v)
</script>

<template>
  <section class="cin">
    <div class="cin__head">
      <h2 class="cin__title">Sua renda passiva.</h2>
      <span class="cin__sub">{{ hidden ? 'R$ •• nos últimos 12 meses' : income.sub }}</span>
    </div>
    <div class="cin__grid">
      <!-- (1) mês corrente -->
      <div v-if="income.month" class="cin__card">
        <div class="cin__card-head">
          <span class="cin__kicker">{{ income.month.label }}</span>
          <span class="cin__badge">{{ income.month.countBadge }}</span>
        </div>
        <div class="cin__hero">{{ hidden ? '+R$ ••••' : income.month.total }}</div>
        <div class="cin__hero-sub">{{ income.month.subLabel }}</div>
        <div class="cin__list">
          <div v-for="p in income.month.payments" :key="p.d + p.ticker + p.val" class="cin__row">
            <span class="cin__row-day">{{ p.d }}</span>
            <span class="cin__row-main">
              <span class="cin__row-ticker">{{ p.ticker }}</span>
              <span class="cin__row-tipo">{{ p.tipo }}</span>
            </span>
            <span class="cin__row-val">{{ maskPlus(p.val) }}</span>
          </div>
        </div>
      </div>

      <!-- (2) recorde e média -->
      <div v-if="income.record" class="cin__card">
        <span class="cin__kicker">Recorde e média</span>
        <div class="cin__hero cin__hero--cream">{{ maskVal(income.record.value) }}</div>
        <div class="cin__hero-sub">{{ income.record.sub }}</div>
        <div class="cin__bars">
          <div v-for="b in income.record.bars" :key="b.mes" class="cin__bar-col">
            <div class="cin__bar" :class="{ 'cin__bar--top': b.top }" :style="{ height: `${Math.max(b.hPct, 1)}%` }" />
          </div>
        </div>
        <div class="cin__bar-labels">
          <span v-for="b in income.record.bars" :key="b.mes" class="cin__bar-mes" :class="{ 'cin__bar-mes--top': b.top }">{{ b.mes }}</span>
        </div>
        <div class="cin__foot">
          <span class="cin__foot-label">Média 6 meses</span>
          <span class="cin__foot-val">{{ maskVal(income.record.avg, 2) }}</span>
        </div>
      </div>

      <!-- (3) próximos pagamentos -->
      <div v-if="income.agenda" class="cin__card">
        <span class="cin__kicker">Próximos pagamentos</span>
        <div class="cin__list cin__list--agenda">
          <div v-for="a in income.agenda.rows" :key="a.d + a.m + a.ticker" class="cin__row cin__row--agenda">
            <span class="cin__date-tile">
              <span class="cin__date-d">{{ a.d }}</span>
              <span class="cin__date-m">{{ a.m }}</span>
            </span>
            <span class="cin__row-main">
              <span class="cin__row-ticker">{{ a.ticker }}</span>
              <span class="cin__row-tipo">{{ a.tipo }}</span>
            </span>
            <span class="cin__row-right">
              <span class="cin__row-val cin__row-val--cream">{{ maskPlus(a.val) }}</span>
              <span class="cin__ok-badge">Confirmado</span>
            </span>
          </div>
        </div>
        <div class="cin__foot">
          <span class="cin__foot-label">{{ income.agenda.footLabel }}</span>
          <span class="cin__foot-val cin__foot-val--mint">{{ maskPlus(income.agenda.footVal) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cin {
  background: var(--nu-blue);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.cin__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.cin__title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.cin__sub { color: var(--nu-cream-text-60); font-size: 16px; font-weight: 600; }
.cin__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 40px; }
.cin__card { background: var(--nu-blue-deep); border-radius: var(--nu-r-card-lg); padding: 28px; display: flex; flex-direction: column; }
.cin__card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.cin__kicker { color: var(--nu-cream-text-60); font-size: 12.5px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
.cin__badge {
  display: inline-flex; align-items: center; background: var(--nu-green-soft-18); color: var(--nu-green-soft);
  font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: var(--nu-r-pill);
}
.cin__hero {
  color: var(--nu-green-soft); font-size: clamp(32px, 2.8vw, 42px); font-weight: 800;
  letter-spacing: -1px; line-height: 1; margin-top: 24px; font-variant-numeric: tabular-nums;
}
.cin__hero--cream { color: var(--nu-cream-text); }
.cin__hero-sub { color: var(--nu-cream-text-60); font-size: 15px; font-weight: 600; margin-top: 7px; }
.cin__list { margin-top: 14px; }
.cin__list--agenda { margin-top: 16px; }
.cin__row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-top: 1px solid var(--nu-cream-text-14); }
.cin__row--agenda { padding: 13px 0; }
.cin__row-day { color: var(--nu-cream-text-55); font-size: 12.5px; font-weight: 700; width: 38px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.cin__row-main { flex: 1; min-width: 0; overflow: hidden; }
.cin__row-ticker { display: block; color: var(--nu-cream-text); font-size: 15px; font-weight: 800; white-space: nowrap; }
.cin__row-tipo {
  display: block; color: var(--nu-cream-text-55); font-size: 12px; font-weight: 600; margin-top: 1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cin__row-val { color: var(--nu-green-soft); font-size: 14.5px; font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.cin__row-val--cream { display: block; color: var(--nu-cream-text); }
.cin__row-right { text-align: right; flex-shrink: 0; }
.cin__ok-badge {
  display: inline-flex; align-items: center; background: var(--nu-green-soft-18); color: var(--nu-green-soft);
  font-size: 10.5px; font-weight: 800; padding: 3px 9px; border-radius: var(--nu-r-pill);
  margin-top: 4px; white-space: nowrap;
}
.cin__date-tile {
  width: 44px; height: 44px; flex-shrink: 0; border-radius: var(--nu-r-chip);
  background: var(--nu-cream-text-10); display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.cin__date-d { color: var(--nu-cream-text); font-size: 14px; font-weight: 800; line-height: 1; }
.cin__date-m { color: var(--nu-cream-text-55); font-size: 8.5px; font-weight: 800; letter-spacing: .5px; margin-top: 2px; }
.cin__bars { display: flex; align-items: flex-end; gap: 8px; height: 110px; margin-top: 22px; }
.cin__bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
.cin__bar { width: 100%; max-width: 34px; min-height: 14px; border-radius: 8px; background: var(--nu-cream-text-22); }
.cin__bar--top { background: var(--nu-green-soft); }
.cin__bar-labels { display: flex; gap: 8px; margin-top: 8px; }
.cin__bar-mes { flex: 1; text-align: center; color: var(--nu-cream-text-45); font-size: 11.5px; font-weight: 600; }
.cin__bar-mes--top { color: var(--nu-green-soft); font-weight: 800; }
.cin__foot {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  border-top: 1px solid var(--nu-cream-text-14); margin-top: auto; padding-top: 16px;
}
.cin__foot-label { color: var(--nu-cream-text-60); font-size: 14px; font-weight: 600; }
.cin__foot-val { color: var(--nu-cream-text); font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums; }
.cin__foot-val--mint { color: var(--nu-green-soft); }
</style>
