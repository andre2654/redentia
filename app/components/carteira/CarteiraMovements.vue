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
import type { SeloImposto } from '~/types/carteiraVisao'
import { SELO } from '~/utils/impostoVisao'

// selos (a /carteira nova, 07/11/2026): o selo do imposto do mês de cada venda,
// pela chave 'AAAA-MM|TICKER' do histórico do imposto; venda fora dele fica sem
const props = defineProps<{ movements: CarteiraMovementsVM; selos?: Record<string, SeloImposto> }>()
const { hidden } = useHiddenValues()
const seloDe = (e: CarteiraMovementVM): SeloImposto | null =>
  (e.badge === 'Venda' && e.mes ? props.selos?.[`${e.mes}|${e.ticker}`] ?? null : null)

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
  <section v-contexto-chat="{ id: 'carteira:movimentacoes', tipo: 'carteira', rotulo: 'Movimentações' }" class="cmv">
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
      <div v-for="e in rows" :key="e.key" v-contexto-chat="{ id: `carteira:mov:${e.key}`, tipo: 'posicao', rotulo: `${e.badge} ${e.ticker} ${e.d}/${e.m}` }" class="cmv__row">
        <span class="cmv__date-tile">
          <span class="cmv__date-d">{{ e.d }}</span>
          <span class="cmv__date-m">{{ e.m }}</span>
        </span>
        <NuAssetLogo :ticker="e.ticker" :letter="e.letter" :tile-bg="e.tileBg" :tile-fg="e.tileFg" :size="48" :radius="14" />
        <span class="cmv__main">
          <span class="cmv__ticker-row">
            <span class="cmv__ticker">{{ e.ticker }}</span>
            <span class="cmv__badge" :class="`cmv__badge--${e.badge.toLowerCase()}`">{{ e.badge }}</span>
            <span v-if="seloDe(e)" class="cmv__selo" :class="`cmv__selo--${seloDe(e)}`">{{ SELO[seloDe(e)!] }}</span>
          </span>
          <span class="cmv__desc">{{ e.sub }}</span>
        </span>
        <span class="cmv__val" :class="{ 'cmv__val--pos': e.valRaw >= 0 }">{{ maskVal(e) }}</span>
      </div>
      <div v-if="!rows.length" class="cmv__empty">Nenhuma operação nesse filtro em {{ periodLabel.toLowerCase() }}.</div>
    </div>
    <NuBotaoSeta v-if="hasMore && !expanded" variante="carvao" tamanho="m" class="cmv__more" @click="expanded = true">Ver extrato completo</NuBotaoSeta>
  </section>
</template>

<style scoped>
.cmv {
  background: var(--nu-page);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.cmv__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.cmv__title {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.02;
}
.cmv__sub { color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; margin-top: 14px; }
.cmv__saldo--up { color: var(--nu-green-text); font-weight: 800; }
.cmv__saldo--down { color: var(--nu-ink); font-weight: 800; }
/* as operações num cartão quente, com fios de 1,5px */
.cmv__list { margin-top: 26px; padding: clamp(6px, 1vw, 12px) clamp(18px, 2.4vw, 28px); border-radius: var(--nu-r-card); background: var(--nu-band); box-shadow: var(--nu-shadow-quente); }
.cmv__row { display: flex; align-items: center; gap: 16px; padding: 15px 0; border-top: 1.5px solid var(--nu-line); }
.cmv__row:first-child { border-top-color: transparent; }
.cmv__date-tile {
  width: 48px; height: 48px; flex-shrink: 0; border-radius: var(--nu-r-chip);
  background: var(--nu-cream-2); display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.cmv__date-d { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; line-height: 1; }
.cmv__date-m { color: var(--nu-gray); font-size: 9px; font-weight: 800; letter-spacing: .5px; margin-top: 2px; }
.cmv__main { flex: 1; min-width: 0; overflow: hidden; }
.cmv__ticker-row { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 10px; }
.cmv__ticker { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; white-space: nowrap; }
.cmv__badge {
  display: inline-flex; align-items: center; font-size: var(--nu-fs-xs); font-weight: 700;
  padding: 3px 9px; border-radius: var(--nu-r-tag); white-space: nowrap; flex-shrink: 0;
}
.cmv__badge--provento { background: var(--nu-green-bg); color: var(--nu-green-text); }
.cmv__badge--compra { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.cmv__badge--venda { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
/* o selo do imposto da venda: contorno, para não brigar com o tipo */
.cmv__selo { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: var(--nu-r-tag); font-size: var(--nu-fs-xs); font-weight: 700; white-space: nowrap; box-shadow: inset 0 0 0 1px currentColor; }
.cmv__selo--isento { color: var(--nu-green-text); }
.cmv__selo--pago { color: var(--nu-blue-text); }
.cmv__selo--a_conferir, .cmv__selo--custo_desconhecido { color: var(--nu-amber-text); }
.cmv__desc {
  display: block; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; margin-top: 3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cmv__val { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.cmv__val--pos { color: var(--nu-green-text); }
.cmv__empty { color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; padding: 22px 0; }
.cmv__more { margin-top: 24px; }
/* no celular (07/11/2026): com a data, a logo e o valor na mesma linha, sobravam
   59 px para o ticker em 375 (o GOLD11 saía cortado). O ticker e os selos ganham
   a largura toda; a descrição e o valor descem para a segunda linha. */
@media (max-width: 640px) {
  .cmv__row { display: grid; grid-template-columns: 48px 48px minmax(0, 1fr) auto; grid-template-areas: 'd l t t' 'd l s v'; align-items: center; column-gap: 12px; row-gap: 2px; }
  .cmv__date-tile { grid-area: d; }
  .cmv__row > :nth-child(2) { grid-area: l; }
  .cmv__main { display: contents; }
  .cmv__ticker-row { grid-area: t; }
  .cmv__desc { grid-area: s; margin-top: 0; }
  .cmv__val { grid-area: v; }
}
</style>
