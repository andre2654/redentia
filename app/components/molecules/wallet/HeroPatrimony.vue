<!--
  HeroPatrimony — total + variation + CTAs row.

  Pure presentational; receives totals as props. The "Importar via chat"
  CTA is a NuxtLink to /help?intent=import-portfolio (the legacy XLSX
  flow has been removed from this surface).
-->
<template>
  <header class="flex flex-col gap-3">
    <span
      class="font-mono-tab text-[11px] font-medium uppercase"
      :style="{ letterSpacing: '0.18em', color: 'var(--brand-primary)' }"
    >Carteira · {{ updatedLabel }}</span>
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div class="flex min-w-0 flex-col gap-1">
        <h1
          class="font-light tabular-nums"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(40px, 5.5vw, 56px)',
            lineHeight: 1.0,
            letterSpacing: '-1.5px',
          }"
        >{{ maskedBRL(totalValue) }}</h1>
        <div class="mt-1 flex flex-wrap items-baseline gap-3">
          <span
            v-if="pnlAmount !== null"
            class="font-mono-tab text-[15px] tabular-nums"
            :style="{ color: pnlAmount >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
          >{{ interfaceStore.revealAmount ? (pnlAmount >= 0 ? '+' : '') + formatBRL(pnlAmount) : 'R$ ••••••' }}</span>
          <span
            v-if="pnlPct !== null"
            class="rounded-md px-2 py-0.5 font-mono-tab text-[12px] font-medium tabular-nums"
            :style="{
              backgroundColor: `color-mix(in srgb, ${pnlPct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'} 16%, transparent)`,
              color: pnlPct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
            }"
          >{{ formatPct(pnlPct) }}</span>
          <span
            class="font-mono-tab text-[12.5px]"
            :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }"
          >{{ positionsCount }} ativos<span v-if="ytdPct !== null"> · YTD {{ formatPct(ytdPct) }}</span><span v-if="vsCdiPct !== null"> · {{ formatPct(vsCdiPct) }} vs CDI</span></span>
        </div>
      </div>
      <!-- Botoes "Atualizar dados" e "Atualizar via chat" removidos
           daqui — agora ficam no ActionBar unificado no topo do
           dashboard, que tambem mostra status do Open Finance. -->

    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  totalValue: number
  pnlAmount?: number | null
  pnlPct?: number | null
  positionsCount: number
  ytdPct?: number | null
  vsCdiPct?: number | null
  updatedLabel?: string
  /** Mantido por compat — refresh foi movido pro ActionBar topo. */
  refreshing?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  pnlAmount: null,
  pnlPct: null,
  ytdPct: null,
  vsCdiPct: null,
  updatedLabel: 'Atualizada agora',
  refreshing: false,
})

void props

const brand = useBrand()
// Mascarar patrimonio + P&L quando interfaceStore.revealAmount = false.
// Mesmo store usado pela sidebar autenticada (eye toggle), entao
// togglar em qualquer lugar (sidebar default, mobile menu, chat
// sidebar) reflete aqui.
const interfaceStore = useInterfaceStore()

function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
}
function maskedBRL(n: number): string {
  if (!interfaceStore.revealAmount) return 'R$ ••••••'
  return formatBRL(n)
}
function formatPct(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}
</script>
