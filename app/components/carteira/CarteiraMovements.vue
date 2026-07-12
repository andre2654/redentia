<script setup lang="ts">
// 'Movimentações.' (design Carteira Nu): tabs pill Tudo/Compras/Vendas/
// Proventos (NuFilterPills — mesmo padrão do design: ativa preta sólida),
// subtítulo 'Mês Ano · saldo do mês +R$ X · N operações' (contagem reage ao
// filtro; saldo fixo, como no design), linhas com tile de data 48px, logo do
// ativo (NuAssetLogo 48px), ticker + badge do tipo, sub descritiva e valor
// com sinal (positivo verde, negativo ink). CTA 'Ver extrato completo' com
// círculo azul 52px e gap 14→19px no hover — aqui ele é FUNCIONAL: expande
// a lista pros últimos 12 meses buscados (não existe página de extrato).
import type { CarteiraMovementsVM, CarteiraMovementVM } from '~/types/carteira'

const props = defineProps<{ movements: CarteiraMovementsVM }>()
const { hidden } = useHiddenValues()

const TABS = ['Tudo', 'Compras', 'Vendas', 'Proventos'] as const
const tab = ref<string>('Tudo')
const expanded = ref(false)

const BADGE_OF: Record<string, CarteiraMovementVM['badge'] | null> = {
  Tudo: null, Compras: 'Compra', Vendas: 'Venda', Proventos: 'Provento',
}

const pool = computed(() => (expanded.value ? props.movements.allEvents : props.movements.monthEvents))
const rows = computed(() => {
  const want = BADGE_OF[tab.value]
  return want ? pool.value.filter((e) => e.badge === want) : pool.value
})
const countLabel = computed(() => `${rows.value.length} ${rows.value.length === 1 ? 'operação' : 'operações'}`)
const periodLabel = computed(() => (expanded.value ? 'Últimos 12 meses' : props.movements.monthLabel))
const saldoLabel = computed(() => (expanded.value ? 'saldo do período' : 'saldo do mês'))

const maskVal = (e: CarteiraMovementVM) => (hidden.value ? (e.valRaw < 0 ? '-R$ ••' : '+R$ ••') : e.val)
const saldoMasked = computed(() => (hidden.value ? (props.movements.saldoDir === 'down' ? '-R$ ••' : '+R$ ••') : props.movements.saldo))

const hasMore = computed(() => props.movements.allEvents.length > props.movements.monthEvents.length)
</script>

<template>
  <section class="cmv">
    <div class="cmv__head">
      <h2 class="cmv__title">Movimentações.</h2>
      <NuFilterPills v-model="tab" :items="TABS" />
    </div>
    <div class="cmv__sub">
      {{ periodLabel }} · {{ saldoLabel }}
      <span class="cmv__saldo" :class="`cmv__saldo--${movements.saldoDir}`">{{ saldoMasked }}</span>
      · {{ countLabel }}
    </div>
    <div class="cmv__list">
      <div v-for="e in rows" :key="e.key" class="cmv__row">
        <span class="cmv__date-tile">
          <span class="cmv__date-d">{{ e.d }}</span>
          <span class="cmv__date-m">{{ e.m }}</span>
        </span>
        <NuAssetLogo :ticker="e.ticker" :letter="e.letter" :tile-bg="e.tileBg" :tile-fg="e.tileFg" :size="48" :radius="14" />
        <span class="cmv__main">
          <span class="cmv__ticker-row">
            <span class="cmv__ticker">{{ e.ticker }}</span>
            <span class="cmv__badge" :class="`cmv__badge--${e.badge.toLowerCase()}`">{{ e.badge }}</span>
          </span>
          <span class="cmv__desc">{{ e.sub }}</span>
        </span>
        <span class="cmv__val" :class="{ 'cmv__val--pos': e.valRaw >= 0 }">{{ maskVal(e) }}</span>
      </div>
      <div v-if="!rows.length" class="cmv__empty">Nenhuma operação nesse filtro em {{ periodLabel.toLowerCase() }}.</div>
    </div>
    <button v-if="hasMore && !expanded" type="button" class="cmv__more" @click="expanded = true">
      <span class="cmv__more-circle">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--nu-white)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
      <span class="cmv__more-label">Ver extrato completo</span>
    </button>
  </section>
</template>

<style scoped>
.cmv {
  background: var(--nu-white);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.cmv__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.cmv__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.cmv__sub { color: var(--nu-gray); font-size: 16px; font-weight: 600; margin-top: 14px; }
.cmv__saldo--up { color: var(--nu-green-2); font-weight: 800; }
.cmv__saldo--down { color: var(--nu-ink); font-weight: 800; }
.cmv__list { margin-top: 26px; }
.cmv__row { display: flex; align-items: center; gap: 16px; padding: 15px 0; border-top: 1.5px solid var(--nu-cream-2); }
.cmv__date-tile {
  width: 48px; height: 48px; flex-shrink: 0; border-radius: var(--nu-r-input);
  background: var(--nu-cream); display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.cmv__date-d { color: var(--nu-ink); font-size: 15px; font-weight: 800; line-height: 1; }
.cmv__date-m { color: var(--nu-gray); font-size: 9px; font-weight: 800; letter-spacing: .5px; margin-top: 2px; }
.cmv__main { flex: 1; min-width: 0; overflow: hidden; }
.cmv__ticker-row { display: flex; align-items: center; gap: 10px; }
.cmv__ticker { color: var(--nu-ink); font-size: 17px; font-weight: 800; white-space: nowrap; }
.cmv__badge {
  display: inline-flex; align-items: center; font-size: 11px; font-weight: 800;
  padding: 3px 10px; border-radius: var(--nu-r-pill); white-space: nowrap; flex-shrink: 0;
}
.cmv__badge--provento { background: var(--nu-green-bg); color: var(--nu-green-2); }
.cmv__badge--compra { background: var(--nu-blue-tint); color: var(--nu-blue); }
.cmv__badge--venda { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cmv__desc {
  display: block; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-top: 3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cmv__val { color: var(--nu-ink); font-size: 17px; font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.cmv__val--pos { color: var(--nu-green-2); }
.cmv__empty { color: var(--nu-gray); font-size: 15px; font-weight: 600; padding: 22px 0; border-top: 1.5px solid var(--nu-cream-2); }
.cmv__more {
  display: inline-flex; align-items: center; gap: 14px; margin-top: 34px;
  background: transparent; border: none; padding: 0; cursor: pointer; transition: gap .2s;
}
.cmv__more:hover { gap: 19px; }
.cmv__more-circle {
  width: 52px; height: 52px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cmv__more-label { color: var(--nu-ink); font-size: 18px; font-weight: 800; }
</style>
