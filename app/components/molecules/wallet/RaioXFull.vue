<!--
  RaioXFull — single-component renderer for the AI snapshot panels
  that used to live on the dedicated `/wallet/raio-x` page. Now
  consolidated into `/wallet` itself so the user has ONE surface for
  the entire portfolio diagnosis.

  Sections (each only renders when its source data is present):
    - Score gauge (0-100) + 9 deterministic dimensions
    - Strengths / Risks / Recommendations triptych
    - Per-asset thesis table (with TickerLogo)
    - Stress scenarios grid
    - Macro sensitivity cards
    - DE/PARA alternatives (with TickerLogo)

  Empty state is handled by the parent — when `analysis` is null the
  caller decides whether to render an inline empty card or hide
  everything entirely.
-->
<template>
  <div v-if="analysis" class="flex flex-col gap-12">
    <!-- 9 dimensoes em largura total. O SectionHeading deste bloco
         + analysis.summary_md foram MOVIDOS pra acima do Snowflake
         em wallet/index.vue, pois introduzem toda a zona de raio-X
         (snowflake + dimensoes + diagnostico + ...). Aqui sobra so o
         article com as barras das 9 dimensoes. -->
    <section class="flex flex-col gap-5">
      <article class="flex flex-col gap-4 rounded-2xl border p-6" :style="cardStyle">
        <ul v-if="analysis.dimensions?.length" class="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="d in analysis.dimensions" :key="d.key" class="flex flex-col gap-1.5">
            <div class="flex items-baseline justify-between gap-2">
              <span class="text-[12.5px]" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.005em' }">{{ d.label }}</span>
              <span
                class="font-mono-tab text-[12.5px] tabular-nums"
                :style="{ color: dimensionColor(d.value) }"
              >{{ d.value }}</span>
            </div>
            <div
              class="h-1 w-full overflow-hidden rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 7%, transparent)` }"
            >
              <div
                class="h-full rounded-full"
                :style="{ width: Math.max(0, Math.min(100, d.value)) + '%', backgroundColor: dimensionColor(d.value) }"
              />
            </div>
            <span
              v-if="d.note"
              class="text-[10.5px]"
              :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)`, lineHeight: 1.4 }"
            >{{ d.note }}</span>
          </li>
        </ul>
        <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 60%, transparent)` }">Sem dimensões registradas neste snapshot.</p>
      </article>
    </section>

    <!-- Strengths / Risks / Recommendations -->
    <section
      v-if="analysis.strengths?.length || analysis.risks?.length || analysis.recommendations?.length"
      class="flex flex-col gap-5"
    >
      <SectionHeading
        :brand="brand"
        eyebrow="Diagnóstico"
        title="Pontos fortes, riscos e o caminho à frente"
      />
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="strengthCardStyle">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-circle-check" class="size-4" :style="{ color: 'var(--brand-positive)' }" />
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: 'var(--brand-positive)' }"
            >Pontos fortes ({{ analysis.strengths?.length || 0 }})</span>
          </div>
          <ul v-if="analysis.strengths?.length" class="flex flex-col gap-3">
            <li v-for="s in analysis.strengths" :key="s.title" class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium" :style="{ color: 'var(--brand-text)' }">{{ s.title }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 65%, transparent)`, lineHeight: 1.5 }">{{ s.body }}</span>
            </li>
          </ul>
          <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 60%, transparent)` }">Nada destacado neste snapshot.</p>
        </article>

        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="warnCardStyle">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" class="size-4" :style="{ color: warnColor }" />
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: warnColor }"
            >Riscos ({{ analysis.risks?.length || 0 }})</span>
          </div>
          <ul v-if="analysis.risks?.length" class="flex flex-col gap-3">
            <li v-for="r in analysis.risks" :key="r.title" class="flex flex-col gap-0.5">
              <div class="flex items-center gap-2">
                <span class="text-[13px] font-medium" :style="{ color: 'var(--brand-text)' }">{{ r.title }}</span>
                <span
                  class="rounded px-1.5 py-0.5 font-mono-tab text-[9px] font-medium uppercase"
                  :style="{
                    letterSpacing: '0.14em',
                    backgroundColor: `color-mix(in srgb, ${severityColor(r.severity)} 14%, transparent)`,
                    color: severityColor(r.severity),
                  }"
                >{{ r.severity }}</span>
              </div>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
            </li>
          </ul>
          <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 60%, transparent)` }">Sem riscos detectados.</p>
        </article>

        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="cardStyle">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sparkles" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: 'var(--brand-primary)' }"
            >Próximos passos</span>
          </div>
          <ul v-if="analysis.recommendations?.length" class="flex flex-col gap-3">
            <li v-for="r in analysis.recommendations" :key="r.title" class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium" :style="{ color: 'var(--brand-text)' }">{{ r.title }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
            </li>
          </ul>
          <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 60%, transparent)` }">Sem recomendações novas.</p>
          <NuxtLink
            to="/help?intent=portfolio-review"
            class="mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium"
            :style="{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-background)' }"
          >
            <UIcon name="i-lucide-sparkles" class="size-3.5" />
            Discutir no chat
          </NuxtLink>
        </article>
      </div>
    </section>

    <!-- Per-asset thesis -->
    <!-- "Tese por ativo" foi UNIFICADA com PositionsTable. Cada
         posicao na tabela principal agora ganha um dot de status +
         linha expansivel com tese + multiplos. Evita 2 tabelas
         redundantes sobre o mesmo dado. -->


    <!-- Stress test — usa cenarios historicos REAIS (COVID, 2008) +
         1 cenario futuro (bolha de IA). Calcula impacto na carteira
         do user a partir da composicao por asset_class. Renderiza
         apenas se temos positions; AI-generated stress_scenarios
         agora sao opcionais e aparecem como "Cenários adicionais"
         quando o modelo trouxe contexto especifico que nao cabe nos
         3 canonicos. -->
    <MoleculesWalletStressTestCard
      v-if="positions && positions.length > 0"
      :positions="positions"
      :total-value="totalValue || 0"
    />

    <!-- Cenarios extras vindos da IA (custom, nao-historicos) -->
    <section v-if="analysis.stress_scenarios?.length && (!positions || !positions.length)" class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Cenários adicionais"
        title="Outros riscos sinalizados pela análise"
      />
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="s in analysis.stress_scenarios"
          :key="s.name"
          class="flex flex-col gap-2 rounded-xl border p-5"
          :style="cardStyle"
        >
          <span class="font-mono-tab text-[10.5px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: 'var(--brand-primary)' }">Cenário</span>
          <h3 class="text-[15px] font-medium" :style="{ color: 'var(--brand-text)' }">{{ s.name }}</h3>
          <div
            class="font-mono-tab text-[24px] font-light tabular-nums"
            :style="{
              color: s.change_pct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
              letterSpacing: '-0.4px',
            }"
          >{{ formatPctSigned(s.change_pct) }}</div>
          <p class="text-[11.5px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 65%, transparent)`, lineHeight: 1.5 }">{{ s.note }}</p>
        </article>
      </div>
    </section>

    <!-- Macro sensitivity -->
    <section v-if="analysis.macro_factors?.length" class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Sensibilidade macro"
        title="Como sua carteira reage a fatores externos"
      />
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="m in analysis.macro_factors"
          :key="m.label"
          class="flex flex-col gap-2 rounded-xl border p-5"
          :style="cardStyle"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="macroIcon(m.label)" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            <span class="text-[13px] font-medium" :style="{ color: 'var(--brand-text)' }">{{ m.label }}</span>
          </div>
          <span
            class="font-mono-tab text-[10.5px] font-medium uppercase"
            :style="{
              letterSpacing: '0.16em',
              color: m.sensitivity === 'baixa'
                ? 'var(--brand-positive)'
                : m.sensitivity === 'média'
                  ? warnColor
                  : 'var(--brand-negative)',
            }"
          >Sensibilidade {{ m.sensitivity }}</span>
          <p class="text-[11.5px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 65%, transparent)`, lineHeight: 1.5 }">{{ m.note }}</p>
        </article>
      </div>
    </section>

    <!-- DE/PARA suggestions -->
    <section v-if="analysis.alternatives?.length" class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Considerações"
        title="Alternativas que melhorariam o equilíbrio"
        lead="Sugestões geradas pela IA com base na sua tese atual. São pontos de partida pra discussão, não recomendações de compra."
      />
      <article class="overflow-hidden rounded-xl border" :style="cardStyle">
        <ul>
          <li
            v-for="(alt, i) in analysis.alternatives"
            :key="`${alt.from}-${alt.to}-${i}`"
            class="grid items-center gap-4 px-5 py-4 md:grid-cols-[1fr_auto_1fr_auto]"
            :style="{ borderBottom: i < analysis.alternatives.length - 1 ? `1px solid color-mix(in srgb, var(--brand-border) 25%, transparent)` : 'none' }"
          >
            <div class="flex items-center gap-2.5">
              <span class="font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: `color-mix(in srgb, var(--brand-text) 50%, transparent)` }">DE</span>
              <AtomsTickerLogo
                :ticker="alt.from"
                :logo="snapshots.get(alt.from.toUpperCase())?.logo ?? null"
                :size="22"
              />
              <span class="font-mono-tab text-[13px] font-medium" :style="{ color: 'var(--brand-text)' }">{{ alt.from }}</span>
            </div>
            <UIcon name="i-lucide-arrow-right" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            <div class="flex items-center gap-2.5">
              <span class="font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: 'var(--brand-primary)' }">PARA</span>
              <AtomsTickerLogo
                :ticker="alt.to"
                :logo="snapshots.get(alt.to.toUpperCase())?.logo ?? null"
                :size="22"
              />
              <span class="font-mono-tab text-[13px] font-medium" :style="{ color: 'var(--brand-text)' }">{{ alt.to }}</span>
            </div>
            <span class="text-[12px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 65%, transparent)`, lineHeight: 1.5 }">{{ alt.reason }}</span>
          </li>
        </ul>
      </article>
    </section>

  </div>
</template>

<script setup lang="ts">
import type { PortfolioAnalysis } from '~/services/walletData'
import type { UnifiedPosition } from '~/services/portfolio'

interface Props {
  analysis: PortfolioAnalysis | null
  // positions/totalValue sao opcionais — quando presentes, o
  // StressTestCard usa pra calcular o impacto historico real
  // ponderado pela composicao da carteira do user.
  positions?: UnifiedPosition[]
  totalValue?: number
}
const props = defineProps<Props>()

const brand = useBrand()

// Subscribe to ticker snapshots for any tickers referenced in the
// analysis (thesis_per_asset + alternatives.from/to). The
// composable batches all subscribers into a single backend call,
// so subscribing 30 thesis tickers + 6 alternative tickers still
// produces ONE request per refresh interval.
const tickerSnaps = useTickerSnapshots()
const snapshots = tickerSnaps.snapshots
const subscribed = new Set<string>()

const referencedTickers = computed(() => {
  const set = new Set<string>()
  for (const t of props.analysis?.thesis_per_asset ?? []) {
    if (t.ticker) set.add(t.ticker.toUpperCase())
  }
  for (const a of props.analysis?.alternatives ?? []) {
    if (a.from) set.add(a.from.toUpperCase())
    if (a.to) set.add(a.to.toUpperCase())
  }
  return Array.from(set)
})

watch(
  referencedTickers,
  (tickers) => {
    for (const t of tickers) {
      if (!subscribed.has(t)) {
        tickerSnaps.subscribe(t)
        subscribed.add(t)
      }
    }
    for (const t of Array.from(subscribed)) {
      if (!tickers.includes(t)) {
        tickerSnaps.unsubscribe(t)
        subscribed.delete(t)
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  for (const t of subscribed) tickerSnaps.unsubscribe(t)
  subscribed.clear()
})

// ---- Visuals + helpers ----------------------------------------
const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
}))
const strengthCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, var(--brand-positive) 5%, var(--brand-surface))`,
  borderColor: `color-mix(in srgb, var(--brand-positive) 22%, transparent)`,
}))
const warnColor = computed(() => 'var(--brand-warning)')
const warnCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${warnColor.value} 5%, var(--brand-surface))`,
  borderColor: `color-mix(in srgb, ${warnColor.value} 22%, transparent)`,
}))

function dimensionColor(value: number): string {
  if (value >= 75) return 'var(--brand-positive)'
  if (value >= 50) return warnColor.value
  return 'var(--brand-negative)'
}
function severityColor(s: 'low' | 'medium' | 'high'): string {
  return s === 'high' ? 'var(--brand-negative)'
       : s === 'medium' ? warnColor.value
       : 'var(--brand-primary)'
}
// thesisStatusLabel/thesisStatusColor moveram pro PositionsTable
// (a tese agora vive como linha expansivel da tabela unificada).

function macroIcon(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('selic') || l.includes('juro')) return 'i-lucide-trending-up'
  if (l.includes('ipca') || l.includes('inflaç')) return 'i-lucide-flame'
  if (l.includes('câmb') || l.includes('cambi') || l.includes('usd') || l.includes('dólar')) return 'i-lucide-globe'
  if (l.includes('commod')) return 'i-lucide-zap'
  return 'i-lucide-activity'
}
function formatPctSigned(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}
</script>

<style scoped>
.th {
  padding: 10px 16px;
  text-align: left;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.th-num { text-align: right; }
.td {
  padding: 12px 16px;
  font-size: 12.5px;
  color: var(--brand-text);
}
.td-num {
  text-align: right;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
}
</style>
