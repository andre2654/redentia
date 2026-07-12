<script setup lang="ts">
// "O que fazer agora." (design Home Nu): banda azul #2F6BFF com cards
// #2456C9 de sugestão DETERMINÍSTICA (regras documentadas no useHome:
// Reinvestir/Rebalancear/Oportunidade — só dado real, 0 cards ⇒ a seção nem
// monta, o pai já esconde). Botão 'Atualizar' = refetch do payload (emit).
// O número do card Reinvestir respeita o modo "valores ocultos".
import type { HomeActionCardVM } from '~/types/home'

defineProps<{ cards: HomeActionCardVM[]; refreshing?: boolean }>()
defineEmits<{ refresh: [] }>()
const { hidden } = useHiddenValues()
</script>

<template>
  <section class="hac">
    <div class="hac__head">
      <div>
        <h2 class="hac__title">O que fazer agora.</h2>
        <div class="hac__sub">Sugestões da Redentia AI para a sua carteira</div>
      </div>
      <button type="button" class="hac__refresh" :disabled="refreshing" @click="$emit('refresh')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" :class="{ 'hac__spin': refreshing }"><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></svg>
        {{ refreshing ? 'Atualizando…' : 'Atualizar' }}
      </button>
    </div>

    <div class="hac__grid">
      <div v-for="c in cards" :key="c.kind" class="hac__card">
        <div class="hac__card-top">
          <span class="hac__kicker">{{ c.kicker }}</span>
          <span class="hac__badge" :class="`hac__badge--${c.badgeTone}`">{{ c.badge }}</span>
        </div>
        <div class="hac__hero" :class="{ 'hac__hero--green': c.heroTone === 'green' }">
          {{ c.kind === 'reinvest' && hidden ? 'R$ ••••' : c.hero }}
        </div>
        <div class="hac__sublabel">{{ c.sublabel }}</div>

        <div v-if="c.bars" class="hac__bars">
          <div class="hac__bar">
            <span
              v-for="(b, i) in c.bars" :key="b.label" class="hac__bar-seg"
              :style="{ width: `${b.pct}%` }" :class="`hac__bar-seg--${i}`"
            />
          </div>
          <div class="hac__bar-legend">
            <span v-for="(b, i) in c.bars" :key="b.label" class="hac__bar-item">
              <span class="hac__bar-dot" :class="`hac__bar-seg--${i}`" />
              <span class="hac__bar-label">{{ b.label }}</span>
              <span class="hac__bar-val">{{ b.value }}</span>
            </span>
          </div>
        </div>

        <div v-if="c.pair" class="hac__pair">
          <span><span class="hac__pair-val">{{ c.pair.current }}</span><span class="hac__pair-sub">atual</span></span>
          <span><span class="hac__pair-val">{{ c.pair.target }}</span><span class="hac__pair-sub">{{ c.pair.targetSub }}</span></span>
        </div>

        <div class="hac__body">{{ c.body }}</div>
        <div class="hac__cta-row">
          <NuxtLink :to="c.ctaHref" class="hac__cta" :class="`hac__cta--${c.ctaVariant}`">{{ c.cta }}</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hac { background: var(--nu-blue); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hac__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.hac__title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.hac__sub { color: var(--nu-cream-text-60); font-size: 16px; font-weight: 600; margin-top: 14px; }
.hac__refresh {
  display: inline-flex; align-items: center; gap: 9px; background: transparent; color: var(--nu-cream-text);
  border: 2px solid var(--nu-cream-text-35); border-radius: var(--nu-r-pill); padding: 12px 22px;
  font-size: 15px; font-weight: 700; cursor: pointer; transition: background .2s, border-color .2s;
}
.hac__refresh:hover { background: var(--nu-cream-text-10); border-color: var(--nu-cream-text-60); }
.hac__refresh:disabled { opacity: .7; cursor: default; }
@keyframes hac-rotate { to { transform: rotate(360deg); } }
.hac__spin { animation: hac-rotate 1s linear infinite; }
.hac__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 40px; }
.hac__card {
  background: var(--nu-blue-deep); border-radius: var(--nu-r-card-lg); padding: 28px;
  display: flex; flex-direction: column; transition: transform .18s;
}
.hac__card:hover { transform: translateY(-3px); }
.hac__card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.hac__kicker {
  color: var(--nu-cream-text-60); font-size: 12.5px; font-weight: 800;
  letter-spacing: 1.4px; text-transform: uppercase;
}
.hac__badge {
  display: inline-flex; align-items: center; font-size: 12px; font-weight: 800;
  padding: 6px 12px; border-radius: var(--nu-r-pill); white-space: nowrap;
}
.hac__badge--priority { background: var(--nu-cream); color: var(--nu-navy); font-size: 11px; letter-spacing: 1px; }
.hac__badge--warning { background: var(--nu-warning-bg); color: var(--nu-amber-soft); }
.hac__badge--positive { background: var(--nu-green-soft-18); color: var(--nu-green-soft); }
.hac__hero {
  color: var(--nu-cream-text); font-size: clamp(34px, 3vw, 44px); font-weight: 800;
  letter-spacing: -1px; line-height: 1; margin-top: 24px; font-variant-numeric: tabular-nums;
}
.hac__hero--green { color: var(--nu-green-soft); }
.hac__sublabel { color: var(--nu-cream-text-60); font-size: 15.5px; font-weight: 600; margin-top: 7px; }
.hac__bars { margin-top: 18px; }
.hac__bar { display: flex; height: 12px; border-radius: var(--nu-r-pill); overflow: hidden; gap: 3px; }
.hac__bar-seg { height: 100%; }
.hac__bar-seg--0 { background: var(--nu-cream); }
.hac__bar-seg--1 { background: rgba(245, 241, 234, 0.55); }
.hac__bar-seg--2 { background: rgba(245, 241, 234, 0.22); }
.hac__bar-legend { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 12px; }
.hac__bar-item { display: inline-flex; align-items: center; gap: 6px; }
.hac__bar-dot { width: 9px; height: 9px; border-radius: 3px; }
.hac__bar-label { color: var(--nu-cream-text-60); font-size: 13px; font-weight: 600; }
.hac__bar-val { color: var(--nu-cream-text); font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }
.hac__pair { display: flex; gap: 28px; margin-top: 18px; flex-wrap: wrap; }
.hac__pair-val { display: block; color: var(--nu-cream-text); font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; }
.hac__pair-sub { display: block; color: var(--nu-cream-text-55); font-size: 12.5px; font-weight: 600; margin-top: 2px; }
.hac__body { color: var(--nu-cream-text-78); font-size: 14.5px; font-weight: 500; line-height: 1.6; margin-top: 18px; }
.hac__cta-row { margin-top: auto; padding-top: 26px; }
.hac__cta { display: inline-flex; align-items: center; border-radius: var(--nu-r-pill); font-size: 15px; font-weight: 800; }
.hac__cta--filled { background: var(--nu-cream); color: var(--nu-navy); padding: 13px 24px; transition: background .2s; }
.hac__cta--filled:hover { background: var(--nu-white); color: var(--nu-navy); }
.hac__cta--outline {
  background: transparent; color: var(--nu-cream-text); border: 2px solid var(--nu-cream-text-40);
  padding: 11px 22px; transition: background .2s, border-color .2s;
}
.hac__cta--outline:hover { background: var(--nu-cream-text-10); border-color: var(--nu-cream-text-70); color: var(--nu-cream-text); }
</style>
