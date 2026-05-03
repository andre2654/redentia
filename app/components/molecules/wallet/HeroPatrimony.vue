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
      :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
    >Carteira · {{ updatedLabel }}</span>
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div class="flex min-w-0 flex-col gap-1">
        <h1
          class="font-light tabular-nums"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(40px, 5.5vw, 56px)',
            lineHeight: 1.0,
            letterSpacing: '-1.5px',
          }"
        >{{ maskedBRL(totalValue) }}</h1>
        <div class="mt-1 flex flex-wrap items-baseline gap-3">
          <span
            v-if="pnlAmount !== null"
            class="font-mono-tab text-[15px] tabular-nums"
            :style="{ color: pnlAmount >= 0 ? brand.colors.positive : brand.colors.negative }"
          >{{ interfaceStore.revealAmount ? (pnlAmount >= 0 ? '+' : '') + formatBRL(pnlAmount) : 'R$ ••••••' }}</span>
          <span
            v-if="pnlPct !== null"
            class="rounded-md px-2 py-0.5 font-mono-tab text-[12px] font-medium tabular-nums"
            :style="{
              backgroundColor: `color-mix(in srgb, ${pnlPct >= 0 ? brand.colors.positive : brand.colors.negative} 16%, transparent)`,
              color: pnlPct >= 0 ? brand.colors.positive : brand.colors.negative,
            }"
          >{{ formatPct(pnlPct) }}</span>
          <span
            class="font-mono-tab text-[12.5px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
          >{{ positionsCount }} ativos<span v-if="ytdPct !== null"> · YTD {{ formatPct(ytdPct) }}</span><span v-if="vsCdiPct !== null"> · {{ formatPct(vsCdiPct) }} vs CDI</span></span>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-[background-color]"
          :style="{
            borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
            color: brand.colors.text,
          }"
          :disabled="refreshing"
          @click="$emit('refresh')"
        >
          <UIcon
            name="i-lucide-rotate-ccw"
            class="size-4"
            :class="{ 'motion-safe:animate-spin': refreshing }"
          />
          Atualizar dados
        </button>
        <NuxtLink
          to="/help?intent=import-portfolio"
          class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-[background-color]"
          :style="{
            backgroundColor: brand.colors.primary,
            color: brand.colors.background,
            boxShadow: `0 8px 18px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent)`,
          }"
        >
          <UIcon name="i-lucide-sparkles" class="size-4" />
          Atualizar via chat
        </NuxtLink>
      </div>
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

defineEmits<{
  (e: 'refresh'): void
}>()

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
