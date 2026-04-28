<template>
  <section v-if="fii" class="flex flex-col gap-10">
    <!-- FII SNAPSHOT: DY + P/VP + VPA em destaque -->
    <div>
      <header class="mb-4 flex flex-col gap-1">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: 'var(--brand-primary)' }"
        >
          Snapshot do FII
        </span>
        <h3
          class="text-lg font-semibold md:text-xl"
          :style="{ color: 'var(--brand-text)' }"
        >
          Indicadores do fundo
        </h3>
        <p
          class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          &gt; RENDIMENTO · VALOR PATRIMONIAL · LIQUIDEZ
        </p>
      </header>
      <div
        class="grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-6"
        :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
      >
        <div
          v-for="(cell, idx) in snapshotCells"
          :key="cell.label"
          class="flex flex-col gap-1.5 px-4 py-4"
          :style="{ backgroundColor: 'var(--brand-surface)' }"
        >
          <div class="flex items-center justify-end">
            <UTooltip v-if="cell.tooltip" :text="cell.tooltip" :delay-duration="0">
              <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: 'var(--brand-text-muted)' }" />
            </UTooltip>
          </div>
          <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
            {{ cell.label }}
          </span>
          <span
            class="font-mono-tab text-lg font-bold tabular-nums"
            :style="{ color: cell.accent || brand.colors.text }"
          >
            {{ cell.value }}
          </span>
        </div>
      </div>
    </div>

    <!-- HERO cards: DY + P/VP grandes -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- DY hero -->
      <div
        class="flex flex-col justify-between border p-5 lg:col-span-1"
        :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
      >
        <div class="flex items-center justify-between">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-text-muted)' }">
            DIVIDEND YIELD · 12M
          </span>
          <UTooltip text="Rendimento distribuído nos últimos 12 meses sobre o preço atual da cota. É o retorno que você recebe em forma de dividendos." :delay-duration="0">
            <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: 'var(--brand-text-muted)' }" />
          </UTooltip>
        </div>
        <span
          class="my-3 font-mono-tab text-5xl font-bold tabular-nums"
          :style="{ color: dyColor }"
        >
          {{ formatPercent(fii.dividend_yield_12m) }}
        </span>
        <div
          v-if="fii.monthly_income_avg_24m !== null"
          class="flex items-center justify-between border-t pt-3"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-text-muted)' }">
            MÉDIA MENSAL · 24M
          </span>
          <span class="font-mono-tab text-base font-bold tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ formatMoneyBR(fii.monthly_income_avg_24m) }}
          </span>
        </div>
      </div>

      <!-- P/VP hero -->
      <div
        class="flex flex-col justify-between border p-5 lg:col-span-1"
        :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
      >
        <div class="flex items-center justify-between">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-text-muted)' }">
            P/VP
          </span>
          <UTooltip text="Preço da cota dividido pelo valor patrimonial por cota. Abaixo de 1,00 indica que o fundo negocia abaixo do patrimônio." :delay-duration="0">
            <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: 'var(--brand-text-muted)' }" />
          </UTooltip>
        </div>
        <span
          class="my-3 font-mono-tab text-5xl font-bold tabular-nums"
          :style="{ color: pvpColor }"
        >
          {{ formatRatio(fii.price_to_book) }}
        </span>
        <div
          class="flex items-center justify-between border-t pt-3"
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-text-muted)' }">
            VPA
          </span>
          <span class="font-mono-tab text-base font-bold tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ formatMoneyBR(fii.book_value_per_share) }}
          </span>
        </div>
      </div>

      <!-- Liquidez + Cotistas -->
      <div class="lg:col-span-1 flex flex-col gap-px border" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }">
        <div class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: 'var(--brand-surface)' }">
          <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-text-muted)' }">
            COTISTAS
          </span>
          <span class="font-mono-tab text-2xl font-bold tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ formatInteger(fii.num_shareholders) }}
          </span>
        </div>
        <div class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: 'var(--brand-surface)' }">
          <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-text-muted)' }">
            VALOR EM CAIXA
          </span>
          <span class="font-mono-tab text-2xl font-bold tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ formatMoneyBR(fii.cash_and_equivalents) }}
          </span>
        </div>
        <div class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: 'var(--brand-surface)' }">
          <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-text-muted)' }">
            PARTICIPAÇÃO NO IFIX
          </span>
          <span class="font-mono-tab text-2xl font-bold tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ fii.ifix_share !== null ? formatPercent(fii.ifix_share) : '-' }}
          </span>
        </div>
      </div>
    </div>

    <!-- FUND PROFILE (identidade ANBIMA + datas) -->
    <div v-if="hasProfile">
      <header class="mb-4 flex flex-col gap-1">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: 'var(--brand-primary)' }"
        >
          Perfil do FII
        </span>
        <h3
          class="text-lg font-semibold md:text-xl"
          :style="{ color: 'var(--brand-text)' }"
        >
          Sobre o fundo
        </h3>
        <p
          class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          &gt; CLASSIFICAÇÃO ANBIMA · ESTRUTURA
        </p>
      </header>
      <div
        class="grid grid-cols-1 gap-px border md:grid-cols-2 lg:grid-cols-3"
        :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
      >
        <div
          v-for="(cell, idx) in profileCells"
          :key="cell.label"
          class="flex flex-col gap-1.5 px-4 py-4"
          :style="{ backgroundColor: 'var(--brand-surface)' }"
        >
          <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
            {{ cell.label }}
          </span>
          <span class="font-mono-tab text-sm font-bold" :style="{ color: 'var(--brand-text)' }">
            {{ cell.value || '-' }}
          </span>
        </div>
      </div>
    </div>

    <!-- AI interpretations -->
    <div v-if="interpretations.length">
      <header class="mb-4 flex items-center gap-2">
        <IconAi class="h-3 w-3" :style="{ fill: 'var(--brand-primary)' }" />
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: 'var(--brand-primary)' }"
        >
          Interpretações IA
        </span>
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          &gt; LEITURA DOS NÚMEROS
        </span>
      </header>
      <div
        class="flex flex-col gap-px border"
        :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
      >
        <div
          v-for="(line, idx) in interpretations"
          :key="idx"
          class="flex items-start gap-3 px-5 py-3"
          :style="{ backgroundColor: 'var(--brand-surface)' }"
        >
          <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text)' }" v-html="line" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ScrapeExtrasFii } from '~/types/asset'

const props = defineProps<{ extras: ScrapeExtrasFii }>()
const brand = useBrand()

const fii = computed(() => props.extras?.fii ?? null)

const snapshotCells = computed(() => {
  const f = fii.value
  if (!f) return []
  return [
    { label: 'D.Y 12M', value: formatPercent(f.dividend_yield_12m), tooltip: 'Dividend Yield dos últimos 12 meses.', accent: brand.colors.primary },
    { label: 'P/VP', value: formatRatio(f.price_to_book), tooltip: 'Preço/Valor Patrimonial. Abaixo de 1 indica cota negociada abaixo do patrimônio.' },
    { label: 'VPA', value: formatMoneyBR(f.book_value_per_share), tooltip: 'Valor Patrimonial por Cota.' },
    { label: 'REND.MENSAL', value: formatMoneyBR(f.monthly_income_avg_24m), tooltip: 'Média mensal dos rendimentos distribuídos nos últimos 24 meses.' },
    { label: 'IFIX', value: f.ifix_share !== null ? formatPercent(f.ifix_share) : '-', tooltip: 'Participação do fundo no índice IFIX.' },
    { label: 'VAR.12M', value: f.change_12m !== null ? formatPercent(f.change_12m) : '-', tooltip: 'Variação da cota nos últimos 12 meses.', accent: changeColor(f.change_12m) },
  ]
})

const profileCells = computed(() => {
  const f = fii.value
  if (!f) return []
  const cells: { label: string; value: string | null }[] = []
  if (f.anbima_segment) cells.push({ label: 'SEGMENTO ANBIMA', value: f.anbima_segment })
  if (f.anbima_type) cells.push({ label: 'TIPO ANBIMA', value: f.anbima_type })
  if (f.trading_name) cells.push({ label: 'NOME PREGÃO', value: f.trading_name })
  if (f.cnpj) cells.push({ label: 'CNPJ', value: f.cnpj })
  if (f.fund_start_date) cells.push({ label: 'INÍCIO DO FUNDO', value: f.fund_start_date })
  if (f.fund_duration) cells.push({ label: 'PRAZO DE DURAÇÃO', value: f.fund_duration })
  return cells
})

const hasProfile = computed(() => profileCells.value.length > 0)

const dyColor = computed(() => {
  const v = fii.value?.dividend_yield_12m
  if (v === null || v === undefined) return brand.colors.textMuted
  if (v >= 10) return brand.colors.positive
  if (v >= 7) return brand.colors.primary
  return brand.colors.text
})

const pvpColor = computed(() => {
  const v = fii.value?.price_to_book
  if (v === null || v === undefined) return brand.colors.textMuted
  if (v < 0.9) return brand.colors.positive
  if (v > 1.1) return brand.colors.negative
  return brand.colors.text
})

function changeColor(v: number | null): string {
  if (v === null) return brand.colors.text
  if (v > 0) return brand.colors.positive
  if (v < 0) return brand.colors.negative
  return brand.colors.text
}

const interpretations = computed<string[]>(() => {
  const f = fii.value
  if (!f) return []
  const lines: string[] = []
  const accent = (t: string) => `<strong style="color: ${brand.colors.primary}">${t}</strong>`
  const pos = (t: string) => `<strong style="color: ${brand.colors.positive}">${t}</strong>`
  const neg = (t: string) => `<strong style="color: ${brand.colors.negative}">${t}</strong>`

  const dy = f.dividend_yield_12m
  if (dy !== null) {
    if (dy >= 10) lines.push(`DY de ${pos(formatPercent(dy))} é elevado para a média do mercado de FIIs (~8% a.a.), mas vale checar se é sustentável ou veio de distribuições não recorrentes.`)
    else if (dy >= 7) lines.push(`DY de ${accent(formatPercent(dy))} está na média histórica do mercado brasileiro de FIIs, geralmente considerado atrativo frente ao CDI.`)
    else lines.push(`DY de ${formatPercent(dy)} está abaixo da média do mercado de FIIs, o fundo pode estar priorizando valorização da cota ou enfrentando pressão nas distribuições.`)
  }

  const pvp = f.price_to_book
  if (pvp !== null) {
    if (pvp < 0.9) lines.push(`P/VP em ${pos(formatRatio(pvp))} indica que a cota negocia ${pos('abaixo do patrimônio')} — oportunidade se os fundamentos se mantiverem ou alerta se refletir deterioração dos ativos.`)
    else if (pvp > 1.1) lines.push(`P/VP em ${neg(formatRatio(pvp))} indica que a cota negocia ${neg('acima do patrimônio')} — mercado está precificando uma expectativa de valorização dos imóveis ou qualidade da gestão.`)
    else lines.push(`P/VP em ${accent(formatRatio(pvp))} próximo de 1,00, a cota negocia em linha com o patrimônio líquido do fundo.`)
  }

  if (f.anbima_segment) {
    lines.push(`Segmento ANBIMA: ${accent(f.anbima_segment)}${f.anbima_type ? ` · Tipo: ${accent(f.anbima_type)}` : ''}. Esse enquadramento define a classe de ativos e o perfil de risco/retorno esperado.`)
  }

  if (f.monthly_income_avg_24m !== null && f.price !== null && f.price > 0) {
    const monthlyYield = (f.monthly_income_avg_24m / f.price) * 100
    lines.push(`Rendimento mensal médio nos últimos 24 meses foi de ${accent(formatMoneyBR(f.monthly_income_avg_24m))}, equivalente a ${accent(monthlyYield.toFixed(2) + '%')} ao mês sobre o preço atual da cota.`)
  }

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

function formatMoneyBR(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(v)
}

function formatInteger(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  return new Intl.NumberFormat('pt-BR').format(v)
}
</script>
