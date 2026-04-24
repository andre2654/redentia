<template>
  <section v-if="etf" class="flex flex-col gap-10">
    <!-- ETF SNAPSHOT: register com os principais campos -->
    <div>
      <header class="mb-4 flex flex-col gap-1">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: brand.colors.primary }"
        >
          [ETF.SNAPSHOT]
        </span>
        <h3
          class="text-lg font-semibold md:text-xl"
          :style="{ color: brand.colors.text }"
        >
          Indicadores do ETF
        </h3>
        <p
          class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
          :style="{ color: brand.colors.textMuted }"
        >
          &gt; PREÇO · LIQUIDEZ · ESTRUTURA DO FUNDO
        </p>
      </header>
      <div
        class="grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-6"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
      >
        <div
          v-for="(cell, idx) in snapshotCells"
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
          <span
            class="font-mono-tab text-lg font-bold tabular-nums"
            :style="{ color: cell.accent || brand.colors.text }"
          >
            {{ cell.value }}
          </span>
        </div>
      </div>
    </div>

    <!-- Identity + secondary info -->
    <div v-if="hasProfile">
      <header class="mb-4 flex flex-col gap-1">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: brand.colors.primary }"
        >
          [ETF.PROFILE]
        </span>
        <h3
          class="text-lg font-semibold md:text-xl"
          :style="{ color: brand.colors.text }"
        >
          Sobre o fundo
        </h3>
        <p
          class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
          :style="{ color: brand.colors.textMuted }"
        >
          &gt; ESTRUTURA E IDENTIFICAÇÃO
        </p>
      </header>
      <div
        class="grid grid-cols-1 gap-px border md:grid-cols-2 lg:grid-cols-3"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
      >
        <div
          v-for="(cell, idx) in profileCells"
          :key="cell.label"
          class="flex flex-col gap-1.5 px-4 py-4"
          :style="{ backgroundColor: brand.colors.surface }"
        >
          <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
            [{{ String(idx + 1).padStart(2, '0') }}]
          </span>
          <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
            {{ cell.label }}
          </span>
          <span class="font-mono-tab text-sm font-bold" :style="{ color: brand.colors.text }">
            {{ cell.value || '-' }}
          </span>
        </div>
      </div>
    </div>

    <!-- AI interpretation -->
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
          &gt; LEITURA DO ETF
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
          <p class="text-sm leading-relaxed" :style="{ color: brand.colors.text }" v-html="line" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ScrapeExtrasEtf } from '~/types/asset'

const props = defineProps<{ extras: ScrapeExtrasEtf }>()
const brand = useBrand()

const etf = computed(() => props.extras?.etf ?? null)

const snapshotCells = computed(() => {
  const e = etf.value
  if (!e) return []
  return [
    {
      label: 'PREÇO',
      value: formatMoneyBR(e.price),
      tooltip: 'Preço atual da cota no pregão.',
    },
    {
      label: 'VAR.12M',
      value: e.change_12m !== null ? formatPercent(e.change_12m) : '-',
      tooltip: 'Valorização da cota nos últimos 12 meses.',
      accent: changeColor(e.change_12m),
    },
    {
      label: 'VOLUME',
      value: e.volume !== null ? formatNumberShort(e.volume) : '-',
      tooltip: 'Volume negociado no último pregão.',
    },
    {
      label: 'COTISTAS',
      value: e.num_shareholders !== null ? formatInteger(e.num_shareholders) : '-',
      tooltip: 'Número de investidores com cotas deste ETF.',
    },
    {
      label: 'RATIO',
      value: e.ratio !== null ? e.ratio.toString() : '-',
      tooltip: 'Razão de conversão para o índice de referência. Mostra quantas cotas representam uma unidade do índice.',
    },
    {
      label: 'LOTE',
      value: e.lot_size !== null ? formatInteger(e.lot_size) : '-',
      tooltip: 'Lote padrão de negociação.',
    },
  ]
})

const profileCells = computed(() => {
  const e = etf.value
  if (!e) return []
  const cells: { label: string; value: string | null }[] = []
  if (e.trading_name) cells.push({ label: 'NOME PREGÃO', value: e.trading_name })
  if (e.book_name) cells.push({ label: 'GESTORA', value: e.book_name })
  if (e.market) cells.push({ label: 'MERCADO', value: e.market })
  if (e.isin_code) cells.push({ label: 'CÓDIGO ISIN', value: e.isin_code })
  if (e.cnpj) cells.push({ label: 'CNPJ', value: e.cnpj })
  if (e.fund_start_date) cells.push({ label: 'INÍCIO', value: e.fund_start_date })
  return cells
})

const hasProfile = computed(() => profileCells.value.length > 0)

function changeColor(v: number | null): string {
  if (v === null) return brand.colors.text
  if (v > 0) return brand.colors.positive
  if (v < 0) return brand.colors.negative
  return brand.colors.text
}

const interpretations = computed<string[]>(() => {
  const e = etf.value
  if (!e) return []
  const lines: string[] = []
  const accent = (t: string) => `<strong style="color: ${brand.colors.primary}">${t}</strong>`
  const pos = (t: string) => `<strong style="color: ${brand.colors.positive}">${t}</strong>`
  const neg = (t: string) => `<strong style="color: ${brand.colors.negative}">${t}</strong>`

  if (e.change_12m !== null) {
    if (e.change_12m >= 15) lines.push(`Valorização ${pos(formatPercent(e.change_12m))} em 12 meses — retorno forte e acima do CDI no período.`)
    else if (e.change_12m >= 0) lines.push(`Variação de ${accent(formatPercent(e.change_12m))} em 12 meses — retorno positivo, mas vale comparar com o CDI/IPCA do período.`)
    else lines.push(`Queda de ${neg(formatPercent(e.change_12m))} em 12 meses — momento desafiador para o índice que o ETF replica.`)
  }

  if (e.num_shareholders !== null) {
    if (e.num_shareholders >= 100_000)
      lines.push(`Com ${pos(formatInteger(e.num_shareholders) + ' cotistas')}, o fundo tem ${pos('liquidez alta')} e execução confiável mesmo em lotes grandes.`)
    else if (e.num_shareholders >= 10_000)
      lines.push(`Com ${accent(formatInteger(e.num_shareholders) + ' cotistas')}, a liquidez é ${accent('adequada')} para investidores individuais.`)
    else
      lines.push(`Com ${neg(formatInteger(e.num_shareholders) + ' cotistas')}, a liquidez pode ser ${neg('limitada')} — confira o spread antes de entrar/sair de posições grandes.`)
  }

  if (e.book_name) {
    lines.push(`Administrado por ${accent(e.book_name)} — avalie o histórico da gestora e a taxa de administração no prospecto do fundo.`)
  }

  lines.push(
    `ETFs replicam índices a custo baixo — ideal para diversificação em larga escala. ${pos('Tributação')}: IR de 15% sobre o ganho em venda, ${pos('sem isenção')} de R$ 20 mil mensais como ações.`,
  )

  return lines
})

// --- Formatters ---
function formatMoneyBR(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(v)
}

function formatPercent(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(2)}%`
}

function formatInteger(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  return new Intl.NumberFormat('pt-BR').format(v)
}

function formatNumberShort(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '-'
  const abs = Math.abs(v)
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(v)
}
</script>
