<template>
  <section v-if="extras" class="flex flex-col gap-10">
    <!-- VALUATION -->
    <div>
      <header class="mb-4 flex flex-col gap-1">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: brand.colors.primary }"
        >
          [VALUATION]
        </span>
        <h3
          class="text-lg font-semibold md:text-xl"
          :style="{ color: brand.colors.text }"
        >
          Indicadores de valuation
        </h3>
        <p
          class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
          :style="{ color: brand.colors.textMuted }"
        >
          &gt; O QUANTO A AÇÃO ESTÁ CARA OU BARATA
        </p>
      </header>
      <div
        class="grid grid-cols-2 gap-px border md:grid-cols-4 lg:grid-cols-6"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
      >
        <div
          v-for="(cell, idx) in valuationCells"
          :key="cell.label"
          class="flex flex-col gap-1.5 px-4 py-4"
          :style="{ backgroundColor: brand.colors.surface }"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              [{{ String(idx + 1).padStart(2, '0') }}]
            </span>
            <UTooltip v-if="cell.tooltip" :text="cell.tooltip" :delay-duration="0">
              <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: brand.colors.textMuted }" />
            </UTooltip>
          </div>
          <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
            {{ cell.label }}
          </span>
          <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: cell.accent || brand.colors.text }">
            {{ cell.value }}
          </span>
        </div>
      </div>
    </div>

    <!-- ENDIVIDAMENTO -->
    <div>
      <header class="mb-4 flex flex-col gap-1">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: brand.colors.primary }"
        >
          [ENDIVIDAMENTO]
        </span>
        <h3
          class="text-lg font-semibold md:text-xl"
          :style="{ color: brand.colors.text }"
        >
          Indicadores de endividamento
        </h3>
        <p
          class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
          :style="{ color: brand.colors.textMuted }"
        >
          &gt; O QUANTO A EMPRESA DEVE E SUA CAPACIDADE DE PAGAR
        </p>
      </header>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Debt health bar (col 1) -->
        <div class="border p-5 lg:col-span-1" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="mb-3 flex items-center justify-between">
            <span
              class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
              :style="{ color: brand.colors.textMuted }"
            >
              DÍV.LÍQUIDA/EBITDA
            </span>
            <span
              class="font-mono-tab text-[11px] font-bold uppercase"
              :style="{ color: debtHealth.color }"
            >
              {{ debtHealth.label }}
            </span>
          </div>

          <div class="mb-3 flex h-2.5 w-full gap-[2px]">
            <div
              v-for="i in debtBars"
              :key="i"
              class="h-full flex-1 rounded-[1px]"
              :style="{
                backgroundColor: debtBarColor(i),
                opacity: i <= debtActiveBars ? 1 : 0.15,
              }"
            />
          </div>

          <div class="flex items-baseline justify-between">
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              SAUDÁVEL · 0–2x
            </span>
            <span class="font-mono-tab text-2xl font-bold tabular-nums" :style="{ color: brand.colors.text }">
              {{ formatRatio(extras.leverage.net_debt_to_ebitda) }}
            </span>
          </div>
        </div>

        <!-- Leverage register (col 2-3) -->
        <div
          class="grid grid-cols-2 gap-px border md:grid-cols-3 lg:col-span-2"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
        >
          <div
            v-for="(cell, idx) in leverageCells"
            :key="cell.label"
            class="flex flex-col gap-1.5 px-4 py-4"
            :style="{ backgroundColor: brand.colors.surface }"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                [{{ String(idx + 1).padStart(2, '0') }}]
              </span>
              <UTooltip v-if="cell.tooltip" :text="cell.tooltip" :delay-duration="0">
                <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: brand.colors.textMuted }" />
              </UTooltip>
            </div>
            <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
              {{ cell.label }}
            </span>
            <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: brand.colors.text }">
              {{ cell.value }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- EFICIÊNCIA + RENTABILIDADE + CRESCIMENTO (3 colunas) -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- EFICIÊNCIA (margens em cascata) -->
      <div class="lg:col-span-1">
        <header class="mb-4 flex flex-col gap-1">
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
            :style="{ color: brand.colors.primary }"
          >
            [EFICIÊNCIA]
          </span>
          <h3
            class="text-lg font-semibold md:text-xl"
            :style="{ color: brand.colors.text }"
          >
            Margens operacionais
          </h3>
          <p
            class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
            :style="{ color: brand.colors.textMuted }"
          >
            &gt; QUANTO SOBRA DE CADA REAL VENDIDO
          </p>
        </header>
        <div
          class="flex flex-col gap-px border"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
        >
          <div
            v-for="(m, idx) in marginCascade"
            :key="m.label"
            class="flex items-center justify-between gap-4 px-4 py-3"
            :style="{ backgroundColor: brand.colors.surface }"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em] shrink-0" :style="{ color: brand.colors.primary }">
                [{{ String(idx + 1).padStart(2, '0') }}]
              </span>
              <span class="font-mono-tab text-[11px] uppercase tracking-wider shrink-0" :style="{ color: brand.colors.textMuted }">
                {{ m.label }}
              </span>
              <div class="flex-1 h-1" :style="{ backgroundColor: brand.colors.border }">
                <div
                  class="h-full transition-[transform,opacity,box-shadow,background-color,border-color,filter]"
                  :style="{
                    width: `${Math.min(Math.max(Number(m.value ?? 0), 0), 100)}%`,
                    backgroundColor: m.color,
                  }"
                />
              </div>
            </div>
            <span
              class="font-mono-tab text-base font-bold tabular-nums shrink-0"
              :style="{ color: brand.colors.text }"
            >
              {{ formatPercent(m.value) }}
            </span>
          </div>
        </div>
      </div>

      <!-- RENTABILIDADE (ROE, ROA, ROIC, Giro Ativos) -->
      <div class="lg:col-span-1">
        <header class="mb-4 flex flex-col gap-1">
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
            :style="{ color: brand.colors.primary }"
          >
            [RENTABILIDADE]
          </span>
          <h3
            class="text-lg font-semibold md:text-xl"
            :style="{ color: brand.colors.text }"
          >
            Retorno sobre capital
          </h3>
          <p
            class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
            :style="{ color: brand.colors.textMuted }"
          >
            &gt; O QUE A EMPRESA GERA COM O DINHEIRO INVESTIDO
          </p>
        </header>

        <!-- ROIC hero -->
        <div
          class="mb-3 border p-5"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              ROIC · CAPITAL INVESTIDO
            </span>
            <UTooltip text="Quanto a empresa gera de retorno para cada real investido. Acima de 10% é considerado bom." :delay-duration="0">
              <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: brand.colors.textMuted }" />
            </UTooltip>
          </div>
          <span
            class="mt-1 block font-mono-tab text-4xl font-bold tabular-nums"
            :style="{ color: roicColor }"
          >
            {{ formatPercent(extras.quality.return_on_invested_capital) }}
          </span>
          <div v-if="governanceLabel" class="mt-3 flex items-center justify-between border-t pt-3" :style="{ borderColor: brand.colors.border }">
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              GOVERNANÇA
            </span>
            <UTooltip :text="governanceTooltip" :delay-duration="0">
              <span
                class="font-mono-tab text-[11px] font-bold uppercase tracking-wide"
                :style="{ color: governanceColor }"
              >
                {{ governanceLabel }}
              </span>
            </UTooltip>
          </div>
        </div>

        <!-- ROE/ROA/Giro register -->
        <div
          class="grid grid-cols-3 gap-px border"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
        >
          <div
            v-for="(cell, idx) in profitabilityCells"
            :key="cell.label"
            class="flex flex-col gap-1 px-3 py-3"
            :style="{ backgroundColor: brand.colors.surface }"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                [{{ String(idx + 1).padStart(2, '0') }}]
              </span>
              <UTooltip v-if="cell.tooltip" :text="cell.tooltip" :delay-duration="0">
                <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: brand.colors.textMuted }" />
              </UTooltip>
            </div>
            <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
              {{ cell.label }}
            </span>
            <span class="font-mono-tab text-base font-bold tabular-nums" :style="{ color: brand.colors.text }">
              {{ cell.value }}
            </span>
          </div>
        </div>
      </div>

      <!-- CRESCIMENTO (CAGR) -->
      <div v-if="hasGrowth" class="lg:col-span-1">
        <header class="mb-4 flex flex-col gap-1">
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
            :style="{ color: brand.colors.primary }"
          >
            [CRESCIMENTO]
          </span>
          <h3
            class="text-lg font-semibold md:text-xl"
            :style="{ color: brand.colors.text }"
          >
            Crescimento 5 anos
          </h3>
          <p
            class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
            :style="{ color: brand.colors.textMuted }"
          >
            &gt; TAXA ANUAL MÉDIA COMPOSTA (CAGR)
          </p>
        </header>
        <div
          class="flex flex-col gap-px border"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
        >
          <div class="flex flex-col gap-2 px-5 py-5" :style="{ backgroundColor: brand.colors.surface }">
            <div class="flex items-center justify-between">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                [01]
              </span>
              <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                RECEITAS
              </span>
            </div>
            <span
              class="font-mono-tab text-2xl font-bold tabular-nums"
              :style="{ color: growthColor(extras.growth.revenue_cagr_5y) }"
            >
              {{ formatPercent(extras.growth.revenue_cagr_5y) }}
            </span>
            <div class="h-1.5 w-full" :style="{ backgroundColor: brand.colors.border }">
              <div
                class="h-full"
                :style="{
                  width: `${growthBarPct(extras.growth.revenue_cagr_5y)}%`,
                  backgroundColor: growthColor(extras.growth.revenue_cagr_5y),
                }"
              />
            </div>
          </div>
          <div class="flex flex-col gap-2 px-5 py-5" :style="{ backgroundColor: brand.colors.surface }">
            <div class="flex items-center justify-between">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                [02]
              </span>
              <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                LUCROS
              </span>
            </div>
            <span
              class="font-mono-tab text-2xl font-bold tabular-nums"
              :style="{ color: growthColor(extras.growth.earnings_cagr_5y) }"
            >
              {{ formatPercent(extras.growth.earnings_cagr_5y) }}
            </span>
            <div class="h-1.5 w-full" :style="{ backgroundColor: brand.colors.border }">
              <div
                class="h-full"
                :style="{
                  width: `${growthBarPct(extras.growth.earnings_cagr_5y)}%`,
                  backgroundColor: growthColor(extras.growth.earnings_cagr_5y),
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI INTERPRETATIONS -->
    <div v-if="interpretations.length">
      <header class="mb-4 flex items-center gap-2">
        <IconAi class="h-3 w-3" :style="{ fill: brand.colors.primary }" />
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: brand.colors.primary }"
        >
          [AI.INTERPRETATIONS]
        </span>
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
          :style="{ color: brand.colors.textMuted }"
        >
          &gt; LEITURA DOS NÚMEROS
        </span>
      </header>
      <div
        class="flex flex-col gap-px border"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
      >
        <div
          v-for="(line, idx) in interpretations"
          :key="idx"
          class="flex items-start gap-3 px-5 py-3"
          :style="{ backgroundColor: brand.colors.surface }"
        >
          <span
            class="font-mono-tab text-[9px] uppercase tracking-[0.18em] shrink-0 mt-[3px]"
            :style="{ color: brand.colors.primary }"
          >
            [{{ String(idx + 1).padStart(2, '0') }}]
          </span>
          <p
            class="text-sm leading-relaxed"
            :style="{ color: brand.colors.text }"
            v-html="line"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ScrapeExtras } from '~/types/asset'

const props = defineProps<{ extras: ScrapeExtras | null }>()
const brand = useBrand()

const valuationCells = computed(() => {
  const v = props.extras?.valuation
  if (!v) return []
  return [
    { label: 'D.Y', value: formatPercent(v.dividend_yield), tooltip: 'Dividend Yield. Quanto a empresa pagou em dividendos nos últimos 12 meses sobre o preço atual.', accent: brand.colors.primary },
    { label: 'P/L', value: formatRatio(v.price_to_earnings), tooltip: 'Preço sobre lucro. Quantos anos a empresa levaria pra pagar o preço da ação com o lucro atual.' },
    { label: 'PEG', value: formatRatio(v.peg_ratio), tooltip: 'P/L ajustado pelo crescimento. Abaixo de 1 sugere que a ação está barata em relação ao ritmo de crescimento.' },
    { label: 'P/VP', value: formatRatio(v.price_to_book), tooltip: 'Preço sobre valor patrimonial. Abaixo de 1 indica que o mercado precifica a ação por menos do que o patrimônio por ação.' },
    { label: 'EV/EBITDA', value: formatRatio(v.ev_ebitda), tooltip: 'Enterprise Value sobre EBITDA. Múltiplo mais usado em comparações setoriais porque ignora estrutura de dívida.' },
    { label: 'EV/EBIT', value: formatRatio(v.ev_ebit), tooltip: 'Enterprise Value sobre EBIT. Similar ao EV/EBITDA mas considera depreciação.' },
    { label: 'P/EBITDA', value: formatRatio(v.price_to_ebitda), tooltip: 'Preço sobre EBITDA.' },
    { label: 'P/EBIT', value: formatRatio(v.price_to_ebit), tooltip: 'Preço sobre EBIT.' },
    { label: 'VPA', value: formatMoneyShortBR(v.book_value_per_share), tooltip: 'Valor Patrimonial por Ação. Quanto cada ação representa em patrimônio líquido.' },
    { label: 'P/ATIVO', value: formatRatio(v.price_to_assets), tooltip: 'Preço sobre ativo total.' },
    { label: 'LPA', value: formatMoneyShortBR(v.earnings_per_share), tooltip: 'Lucro por Ação. Quanto cada ação gerou de lucro no último ano.' },
    { label: 'P/SR', value: formatRatio(v.price_to_sales), tooltip: 'Preço sobre Receita (Sales Ratio). Útil pra empresas com prejuízo contábil.' },
    { label: 'P/CAP.GIRO', value: formatRatio(v.price_to_working_capital), tooltip: 'Preço sobre capital de giro.' },
    { label: 'P/AT.CIRC.LIQ', value: formatRatio(v.price_to_net_current_assets), tooltip: 'Preço sobre ativo circulante líquido. Métrica clássica do Benjamin Graham.' },
  ]
})

const leverageCells = computed(() => {
  const l = props.extras?.leverage
  if (!l) return []
  return [
    { label: 'DÍV.LÍQ/PL', value: formatRatio(l.net_debt_to_equity), tooltip: 'Dívida líquida sobre patrimônio líquido. Abaixo de 1 indica estrutura de capital saudável.' },
    { label: 'DÍV.LÍQ/EBIT', value: formatRatio(l.net_debt_to_ebit), tooltip: 'Dívida líquida sobre lucro operacional (EBIT). Abaixo de 3 é confortável.' },
    { label: 'PL/ATIVOS', value: formatRatioOrPercent(l.equity_to_assets), tooltip: 'Patrimônio líquido sobre ativos totais. Indica quanto da empresa é financiada por capital próprio.' },
    { label: 'PASSIVOS/ATIVOS', value: formatRatioOrPercent(l.liabilities_to_assets), tooltip: 'Passivos totais sobre ativos. O contrário do PL/Ativos, indica quanto da empresa é financiada por dívida.' },
    { label: 'LIQ.CORRENTE', value: formatRatio(l.current_ratio), tooltip: 'Liquidez corrente. Acima de 1 indica que ativos de curto prazo cobrem passivos de curto prazo.' },
    { label: 'CAIXA', value: formatMoneyShort(l.cash_and_equivalents), tooltip: 'Caixa e equivalentes de caixa disponíveis.' },
  ]
})

const profitabilityCells = computed(() => {
  const q = props.extras?.quality
  if (!q) return []
  return [
    { label: 'ROE', value: formatPercent(q.return_on_equity), tooltip: 'Retorno sobre patrimônio líquido. Mede a eficiência em gerar lucro com o capital dos sócios.' },
    { label: 'ROA', value: formatPercent(q.return_on_assets), tooltip: 'Retorno sobre ativos totais.' },
    { label: 'GIRO ATIVOS', value: formatRatio(q.asset_turnover), tooltip: 'Quantas vezes a empresa "gira" seus ativos em receita no ano.' },
  ]
})

const hasGrowth = computed(() => {
  const g = props.extras?.growth
  return g?.revenue_cagr_5y != null || g?.earnings_cagr_5y != null
})

const marginCascade = computed(() => {
  const q = props.extras?.quality
  if (!q) return []
  return [
    { label: 'BRUTA', value: q.gross_margin, color: brand.colors.textMuted },
    { label: 'EBITDA', value: q.ebitda_margin, color: brand.colors.primary },
    { label: 'EBIT', value: q.ebit_margin, color: brand.colors.primary },
    { label: 'LÍQUIDA', value: q.net_margin, color: brand.colors.positive },
  ]
})

// --- Debt health bar ---
const debtBars = 32

const debtActiveBars = computed(() => {
  const r = props.extras?.leverage.net_debt_to_ebitda
  if (r == null) return 0
  const pct = Math.min(Math.max(r / 4, 0), 1)
  return Math.max(1, Math.round(pct * debtBars))
})

const debtHealth = computed(() => {
  const r = props.extras?.leverage.net_debt_to_ebitda
  if (r == null) return { label: 'N/A', color: brand.colors.textMuted }
  if (r < 1.5) return { label: 'SAUDÁVEL', color: brand.colors.positive }
  if (r < 3) return { label: 'MODERADO', color: brand.colors.primary }
  if (r < 5) return { label: 'ELEVADO', color: brand.colors.negative }
  return { label: 'CRÍTICO', color: brand.colors.negative }
})

function debtBarColor(index: number): string {
  const pct = (index - 1) / (debtBars - 1)
  if (pct < 0.4) return brand.colors.positive
  if (pct < 0.75) return brand.colors.primary
  return brand.colors.negative
}

// --- Growth color ---
function growthColor(v: number | null | undefined): string {
  if (v == null) return brand.colors.textMuted
  if (v < 0) return brand.colors.negative
  if (v < 5) return brand.colors.textMuted
  if (v < 15) return brand.colors.primary
  return brand.colors.positive
}

function growthBarPct(v: number | null | undefined): number {
  if (v == null) return 0
  return Math.min(Math.max(v * 2.5, 0), 100)
}

// --- ROIC color ---
const roicColor = computed(() => {
  const r = props.extras?.quality.return_on_invested_capital
  if (r == null) return brand.colors.textMuted
  if (r < 5) return brand.colors.negative
  if (r < 10) return brand.colors.primary
  return brand.colors.positive
})

// --- Governance — friendly label + color + tooltip explaining what it means ---
const governanceLabel = computed(() => {
  const s = props.extras?.quality.listing_segment ?? ''
  if (!s) return null
  const norm = s.toLowerCase()
  if (norm.includes('novo mercado')) return 'MÁXIMA'
  if (norm.includes('nível 2') || norm.includes('n2')) return 'AVANÇADA'
  if (norm.includes('nível 1') || norm.includes('n1')) return 'BÁSICA'
  if (norm.includes('tradicional')) return 'TRADICIONAL'
  return s.toUpperCase()
})

const governanceColor = computed(() => {
  const label = governanceLabel.value
  if (label === 'MÁXIMA') return brand.colors.positive
  if (label === 'AVANÇADA') return brand.colors.primary
  if (label === 'BÁSICA') return brand.colors.text
  return brand.colors.textMuted
})

const governanceTooltip = computed(() => {
  const label = governanceLabel.value
  if (label === 'MÁXIMA') return 'Listada no Novo Mercado da B3: o mais alto padrão de governança, com 100% tag along (proteção do minoritário numa venda de controle) e conselho independente.'
  if (label === 'AVANÇADA') return 'Listada no Nível 2 da B3: bom padrão de governança, com tag along obrigatório também pras ações preferenciais.'
  if (label === 'BÁSICA') return 'Listada no Nível 1 da B3: exigências mínimas de transparência e liquidez.'
  if (label === 'TRADICIONAL') return 'Listada no segmento tradicional da B3: segue apenas a legislação padrão.'
  return 'Nível de governança corporativa da B3.'
})

// --- Interpretations ---
const interpretations = computed<string[]>(() => {
  const e = props.extras
  if (!e) return []
  const lines: string[] = []
  const accent = (txt: string) => `<strong style="color: ${brand.colors.primary}">${txt}</strong>`
  const pos = (txt: string) => `<strong style="color: ${brand.colors.positive}">${txt}</strong>`
  const neg = (txt: string) => `<strong style="color: ${brand.colors.negative}">${txt}</strong>`

  const ev = e.valuation.ev_ebitda
  if (ev != null) {
    if (ev < 5) lines.push(`EV/EBITDA de ${accent(formatRatio(ev))} indica múltiplo ${pos('comprimido')} — mercado precifica abaixo da média histórica ou há desconto por risco setorial.`)
    else if (ev < 10) lines.push(`EV/EBITDA de ${accent(formatRatio(ev))} em patamar neutro, próximo da média histórica do mercado brasileiro.`)
    else lines.push(`EV/EBITDA de ${accent(formatRatio(ev))} indica múltiplo ${neg('esticado')} — o preço já embute expectativas altas de crescimento.`)
  }

  const de = e.leverage.net_debt_to_ebitda
  if (de != null) {
    if (de < 1.5) lines.push(`Dívida líquida em ${pos(formatRatio(de) + 'x EBITDA')} — alavancagem saudável, empresa quita o endividamento líquido em menos de 2 anos de geração de caixa operacional.`)
    else if (de < 3) lines.push(`Dívida líquida em ${accent(formatRatio(de) + 'x EBITDA')} — alavancagem moderada, dentro do aceitável pro setor.`)
    else lines.push(`Dívida líquida em ${neg(formatRatio(de) + 'x EBITDA')} — alavancagem elevada, o serviço da dívida consome parcela significativa do caixa operacional.`)
  }

  const rg = e.growth.revenue_cagr_5y
  const eg = e.growth.earnings_cagr_5y
  if (rg != null && eg != null) {
    if (eg > rg + 3) lines.push(`Lucro cresce ${pos(formatPercent(eg))} ao ano contra ${accent(formatPercent(rg))} na receita — ${pos('expansão real de margem')}, sinal de ganhos de escala ou eficiência operacional.`)
    else if (rg > eg + 3) lines.push(`Receita cresce ${accent(formatPercent(rg))} mas lucro só ${neg(formatPercent(eg))} — ${neg('compressão de margem')}, custos subindo mais rápido que faturamento.`)
    else lines.push(`Receita e lucro crescem em ritmo similar (${accent(formatPercent(rg))} vs ${accent(formatPercent(eg))}) — margens estáveis ao longo dos últimos 5 anos.`)
  }

  const roic = e.quality.return_on_invested_capital
  if (roic != null) {
    if (roic > 15) lines.push(`ROIC de ${pos(formatPercent(roic))} é excelente — cada real investido gera retorno muito acima do custo de capital típico (~10%).`)
    else if (roic > 8) lines.push(`ROIC de ${accent(formatPercent(roic))} em patamar razoável, indicando que a empresa cria valor acima do custo de capital.`)
    else lines.push(`ROIC de ${neg(formatPercent(roic))} está ${neg('abaixo')} do custo de capital médio — capital alocado não está gerando retorno suficiente.`)
  }

  const gov = governanceLabel.value
  if (gov === 'MÁXIMA') lines.push(`Governança ${pos('máxima')} (Novo Mercado da B3): 100% tag along (minoritários recebem 100% do valor pago ao controlador numa venda) e conselho independente obrigatório.`)
  else if (gov === 'AVANÇADA') lines.push(`Governança ${accent('avançada')} (Nível 2 da B3): tag along obrigatório também pras ações preferenciais, proteção extra pro investidor minoritário.`)

  return lines
})

// --- Formatters ---
function formatRatio(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  return v.toFixed(2)
}

function formatPercent(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  return `${v.toFixed(2)}%`
}

/**
 * StatusInvest returns some ratios as decimal fractions (0.52 for 52%) and
 * others already as percent values (66.0 for 66%). When the number is <= 1
 * we assume it's a fraction and multiply; otherwise we assume it's already
 * in percent. Not bulletproof but fits the observed data.
 */
function formatRatioOrPercent(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  const pct = v <= 1 ? v * 100 : v
  return `${pct.toFixed(2)}%`
}

function formatMoneyShort(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  const abs = Math.abs(v)
  if (abs >= 1_000_000_000_000) return `R$ ${(v / 1_000_000_000_000).toFixed(1)}T`
  if (abs >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `R$ ${(v / 1_000).toFixed(1)}K`
  return `R$ ${v.toFixed(0)}`
}

function formatMoneyShortBR(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(v)
}
</script>
