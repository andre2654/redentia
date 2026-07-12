<script setup lang="ts">
// Seção navy "Sua carteira em N meses." (design Home Nu): pills de período
// 1M/6M/12M funcionais, legenda Você/IBOV/CDI e o gráfico do PATRIMÔNIO em R$
// full-bleed (NuPriceChart — mesma anatomia do design: gridlines 'R$ NNk',
// pill 'Patrimônio hoje', crosshair). IBOV/CDI são comparativos DE LEGENDA,
// como no .dc.html (decisão documentada no relatório do PR).
//  - Você  = variação do patrimônio no período (curva real /portfolio/equity-curve)
//  - IBOV  = /indices/IBOV/prices?mode= (12mo pré-buscado no SSR; 1M/6M lazy)
//  - CDI   = linha composta DERIVADA da taxa vigente (/macro/snapshot), base
//            365 corridos — aproximação documentada (não existe série CDI no
//            backend); sem taxa → a legenda CDI simplesmente não renderiza.
// ESTADOS: cheio | 'coletando histórico' (<10 pontos — sem gráfico falso).
import type { HomeChartVM } from '~/types/home'
import type { SeriesPoint } from '~/types/acao'

const props = defineProps<{ chart: HomeChartVM }>()
const { hidden } = useHiddenValues()

const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmtP = (n: number) => `${n >= 0 ? '+' : ''}${nf1.format(n)}%`

type Period = '1M' | '6M' | '12M'
const PERIODS: Period[] = ['1M', '6M', '12M']
const MODE: Record<Period, '1mo' | '6mo' | '12mo'> = { '1M': '1mo', '6M': '6mo', '12M': '12mo' }
const TITLE: Record<Period, string> = { '1M': 'em 1 mês.', '6M': 'em 6 meses.', '12M': 'em 12 meses.' }

const period = ref<Period>('12M')

function cutoffISO(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d.toISOString().slice(0, 10)
}

/** fatia da curva pro período ativo (curva completa vem no payload). */
const slice = computed<SeriesPoint[]>(() => {
  const months = period.value === '1M' ? 1 : period.value === '6M' ? 6 : 12
  const cut = cutoffISO(months)
  const s = props.chart.points.filter((p) => p.t >= cut)
  return s.length >= 2 ? s : props.chart.points
})

const vocePct = computed(() => {
  const s = slice.value
  const first = s[0]
  const last = s[s.length - 1]
  if (!first || !last || first.v <= 0) return null
  return (last.v / first.v - 1) * 100
})

/* IBOV por período: 12mo veio do SSR; 1M/6M são buscados 1× no client. */
const ibovCache = useState<Partial<Record<string, SeriesPoint[] | null>>>(
  'nu:home:ibov',
  () => ({ '12mo': props.chart.ibov12m }),
)
watch(period, async (p) => {
  const mode = MODE[p]
  if (ibovCache.value[mode] !== undefined) return
  try {
    const res = await $fetch<{ data: { market_price: number | null; price_at: string }[] }>(
      `/api/backend/indices/IBOV/prices?mode=${mode}`,
      { headers: { Accept: 'application/json' } },
    )
    ibovCache.value = {
      ...ibovCache.value,
      [mode]: (res?.data ?? [])
        .filter((x) => x.market_price != null)
        .map((x) => ({ t: x.price_at, v: x.market_price as number })),
    }
  } catch {
    ibovCache.value = { ...ibovCache.value, [mode]: null } // legenda IBOV some
  }
})

const ibovPct = computed(() => {
  const s = ibovCache.value[MODE[period.value]]
  const first = s?.[0]
  const last = s?.[s.length - 1]
  if (!first || !last || first.v <= 0) return null
  return (last.v / first.v - 1) * 100
})

const cdiPct = computed(() => {
  const r = props.chart.cdiRate
  const s = slice.value
  const first = s[0]
  const last = s[s.length - 1]
  if (r == null || !first || !last) return null
  const days = Math.max(0, (Date.parse(last.t) - Date.parse(first.t)) / 86_400_000)
  if (!days) return null
  return ((1 + r / 100) ** (days / 365) - 1) * 100
})

const pillValue = computed(() => (hidden.value ? 'R$ ••••' : props.chart.currentLabel))
</script>

<template>
  <section class="hch">
    <div class="hch__head">
      <h2 class="hch__title">Sua carteira<br>{{ TITLE[period] }}</h2>
      <div v-if="!chart.collecting" class="hch__periods">
        <button
          v-for="p in PERIODS" :key="p" type="button" class="hch__period"
          :class="{ 'hch__period--active': period === p }" @click="period = p"
        >{{ p }}</button>
      </div>
    </div>

    <template v-if="!chart.collecting">
      <div class="hch__legend">
        <span v-if="vocePct != null" class="hch__leg"><span class="hch__leg-label">Você</span><span class="hch__leg-val hch__leg-val--you">{{ fmtP(vocePct) }}</span></span>
        <span v-if="ibovPct != null" class="hch__leg"><span class="hch__leg-label">IBOV</span><span class="hch__leg-val">{{ fmtP(ibovPct) }}</span></span>
        <span v-if="cdiPct != null" class="hch__leg"><span class="hch__leg-label">CDI</span><span class="hch__leg-val">{{ fmtP(cdiPct) }}</span></span>
      </div>
      <div class="hch__chart">
        <NuPriceChart :points="slice" ticker="Patrimônio" :current-label="pillValue" :masked="hidden" />
      </div>
    </template>

    <div v-else class="hch__collecting">
      <div class="hch__collecting-kicker">Coletando histórico</div>
      <p class="hch__collecting-body">
        Sua conexão é recente — a curva diária do patrimônio aparece aqui depois
        de alguns pregões. Enquanto isso, suas posições já estão logo abaixo.
      </p>
    </div>
  </section>
</template>

<style scoped>
.hch {
  background: var(--nu-navy);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 76px);
  animation: nu-fade .5s ease both;
}
.hch__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.hch__title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(36px, 5vw, 64px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.hch__periods { display: flex; gap: 6px; flex-shrink: 0; }
.hch__period {
  padding: 11px 20px; border-radius: var(--nu-r-pill); border: none; background: transparent;
  color: var(--nu-cream-text-50); font-size: 15px; font-weight: 700; cursor: pointer;
  transition: color .2s, background .2s;
}
.hch__period:hover { color: var(--nu-cream-text-85); }
.hch__period--active { background: var(--nu-cream); color: var(--nu-navy); font-weight: 800; }
.hch__period--active:hover { color: var(--nu-navy); }
.hch__legend { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; margin-top: 20px; }
.hch__leg { display: inline-flex; align-items: baseline; gap: 9px; }
.hch__leg-label { color: var(--nu-cream-text-50); font-size: 15px; font-weight: 700; }
.hch__leg-val { color: var(--nu-cream-text-85); font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }
.hch__leg-val--you { color: var(--nu-blue-legend); }
.hch__chart {
  position: relative; height: clamp(280px, 36vw, 430px);
  margin: 34px calc(clamp(22px, 5.5vw, 80px) * -1) calc(clamp(48px, 6vw, 76px) * -1);
}
.hch__collecting { margin-top: 34px; max-width: 640px; }
.hch__collecting-kicker {
  color: var(--nu-blue-soft); font-size: 12px; font-weight: 800;
  letter-spacing: 1.4px; text-transform: uppercase;
}
.hch__collecting-body {
  margin: 12px 0 0; color: var(--nu-cream-text-78); font-size: clamp(15.5px, 1.5vw, 17.5px);
  font-weight: 500; line-height: 1.7;
}
</style>
