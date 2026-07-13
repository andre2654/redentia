<script setup lang="ts">
// "O mercado hoje": banda navy com tabs por classe (Ações/FIIs/Cripto/BDRs),
// linha de índices e 2 cards de rankings (altas/baixas). Valores exatos do
// design; troca de dataset é client-side, como no protótipo.
import type { NuMoverTab } from '~/types/market'

const { tabs, movers, indices } = useNuMovers()
const activeTab = ref<NuMoverTab>('Ações')
const active = computed(() => movers.value[activeTab.value])
</script>

<template>
  <section class="mmv">
    <div class="mmv__head">
      <h2 class="mmv__title">O mercado hoje.</h2>
      <div class="mmv__tabs">
        <button
          v-for="tb in tabs" :key="tb" type="button"
          class="mmv__tab" :class="{ 'mmv__tab--active': tb === activeTab }"
          @click="activeTab = tb"
        >{{ tb }}</button>
      </div>
    </div>

    <div class="mmv__indices">
      <span v-for="ix in indices" :key="ix.label" class="mmv__index">
        <span class="mmv__index-label">{{ ix.label }}</span>
        <span class="mmv__index-value">{{ ix.value }}</span>
        <span class="mmv__index-pct" :class="`mmv__index-pct--${ix.dir}`">{{ ix.pct }}</span>
      </span>
    </div>

    <div class="mmv__grid">
      <div class="mmv__card">
        <div class="mmv__card-head">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8FF0B5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
          <span class="mmv__card-title">Maiores altas</span>
        </div>
        <div class="mmv__rows">
          <NuxtLink v-for="r in active.gainers" :key="r.ticker" :to="`/asset/${r.ticker}`" class="mmv__row">
            <span class="mmv__rank">{{ r.rank }}</span>
            <span class="mmv__id">
              <span class="mmv__ticker">{{ r.ticker }}</span>
              <span class="mmv__name">{{ r.name }}</span>
            </span>
            <span data-nu-hide class="mmv__price">{{ r.price }}</span>
            <span class="mmv__pct" :class="`mmv__pct--${r.dir}`">{{ r.pct }}</span>
            <span class="mmv__go" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </NuxtLink>
        </div>
      </div>

      <div class="mmv__card">
        <div class="mmv__card-head">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFB3B8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l6 6 4-4 8 8" /><path d="M14 17h7v-7" /></svg>
          <span class="mmv__card-title">Maiores baixas</span>
        </div>
        <div class="mmv__rows">
          <NuxtLink v-for="r in active.losers" :key="r.ticker" :to="`/asset/${r.ticker}`" class="mmv__row">
            <span class="mmv__rank">{{ r.rank }}</span>
            <span class="mmv__id">
              <span class="mmv__ticker">{{ r.ticker }}</span>
              <span class="mmv__name">{{ r.name }}</span>
            </span>
            <span data-nu-hide class="mmv__price">{{ r.price }}</span>
            <span class="mmv__pct" :class="`mmv__pct--${r.dir}`">{{ r.pct }}</span>
            <span class="mmv__go" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <NuxtLink to="/login" class="mmv__cta">
      <span class="mmv__cta-circle">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0C1524" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
      <span class="mmv__cta-label">Criar conta para receber alertas destes ativos</span>
    </NuxtLink>
  </section>
</template>

<style scoped>
.mmv { background: var(--nu-navy); padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mmv__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.mmv__title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(36px, 5vw, 64px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.mmv__tabs { display: flex; gap: 6px; flex-shrink: 0; flex-wrap: wrap; }
.mmv__tab {
  padding: 10px 18px; border-radius: var(--nu-r-pill); font-size: 15px; font-weight: 700;
  cursor: pointer; border: none; background: transparent; color: var(--nu-cream-text-50); transition: all .2s;
}
.mmv__tab--active { font-weight: 800; background: var(--nu-cream); color: var(--nu-navy); }

.mmv__indices { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; margin-top: 20px; }
.mmv__index { display: inline-flex; align-items: baseline; gap: 9px; }
.mmv__index-label { color: var(--nu-cream-text-50); font-size: 15px; font-weight: 700; }
.mmv__index-value { color: var(--nu-cream-text-85); font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }
.mmv__index-pct { font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.mmv__index-pct--up { color: var(--nu-green-soft); }
.mmv__index-pct--down { color: var(--nu-red-soft); }

.mmv__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-top: 36px; }
.mmv__card { background: var(--nu-navy-2); border-radius: var(--nu-r-card-lg); padding: 28px; }
.mmv__card-head { display: flex; align-items: center; gap: 10px; }
.mmv__card-title { color: var(--nu-cream-text); font-size: 20px; font-weight: 800; letter-spacing: -.3px; }
.mmv__rows { margin-top: 14px; }
.mmv__row {
  display: flex; align-items: center; gap: 14px; padding: 13px 12px; margin: 0 -12px;
  border-top: 1px solid var(--nu-cream-text-12); border-radius: var(--nu-r-card);
  transition: background .16s;
}
.mmv__rows > .mmv__row:first-child { border-top: none; }
.mmv__row:hover { background: var(--nu-cream-text-08); }
.mmv__row:hover .mmv__go { background: var(--nu-blue-hover); }
/* botão azul da Redentia: indica que a linha leva pro ativo */
.mmv__go {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; transition: background .16s;
}
.mmv__rank {
  color: var(--nu-cream-text-45); font-size: 15px; font-weight: 800; width: 18px;
  flex-shrink: 0; font-variant-numeric: tabular-nums;
}
.mmv__id { flex: 1; min-width: 0; overflow: hidden; }
.mmv__ticker { display: block; color: var(--nu-cream-text); font-size: 15.5px; font-weight: 800; white-space: nowrap; }
.mmv__name {
  display: block; color: var(--nu-cream-text-50); font-size: 12.5px; font-weight: 600;
  margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mmv__price {
  color: var(--nu-cream-text-85); font-size: 14px; font-weight: 700;
  white-space: nowrap; font-variant-numeric: tabular-nums;
}
.mmv__pct {
  font-size: 15px; font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums;
  flex-shrink: 0; min-width: 62px; text-align: right;
}
.mmv__pct--up { color: var(--nu-green-soft); }
.mmv__pct--down { color: var(--nu-red-soft); }

.mmv__cta { display: inline-flex; align-items: center; gap: 14px; margin-top: 38px; transition: gap .2s; }
.mmv__cta:hover { gap: 19px; }
.mmv__cta-circle {
  width: 52px; height: 52px; border-radius: 50%; background: var(--nu-cream);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mmv__cta-label { color: var(--nu-cream-text); font-size: 18px; font-weight: 800; }
</style>
