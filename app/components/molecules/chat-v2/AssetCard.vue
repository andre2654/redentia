<!--
  Inline asset card with logo, ticker, price, change. Click navigates
  to the asset detail page in a new tab.
-->
<template>
  <NuxtLink
    :to="assetUrl"
    class="chat-asset-card group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors"
    :style="{
      borderColor: `color-mix(in srgb, var(--brand-border) 60%, transparent)`,
      backgroundColor: `color-mix(in srgb, var(--brand-surface) 65%, transparent)`,
      color: 'var(--brand-text)',
    }"
  >
    <div
      class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg"
      :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 6%, transparent)` }"
    >
      <NuxtImg
        v-if="logo && !failedLogos.isFailed(logo)"
        :src="logo"
        alt=""
        width="40"
        height="40"
        class="size-full object-cover"
        @error="failedLogos.markFailed(logo)"
      />
      <span v-else class="font-mono-tab text-[10px] font-bold" :style="{ color: 'var(--brand-primary)' }">
        {{ card.ticker.slice(0, 3) }}
      </span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col leading-tight">
      <span class="font-mono-tab text-[14px] font-semibold tracking-tight" :style="{ color: 'var(--brand-text)' }">
        {{ card.ticker }}
      </span>
      <span class="line-clamp-1 text-[11.5px]" :style="{ color: 'var(--brand-text-muted)' }">
        {{ name }}
      </span>
    </div>

    <div class="flex flex-col items-end gap-0.5 text-right leading-tight">
      <span v-if="price" class="font-mono-tab text-[13px] font-semibold tabular-nums" :style="{ color: 'var(--brand-text)' }">
        {{ price }}
      </span>
      <span v-if="changeLabel" class="font-mono-tab text-[11px] font-semibold tabular-nums" :style="{ color: changeColor }">
        {{ changeLabel }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatAssetCard } from '~/composables/useChatStream'

const props = defineProps<{
  card: ChatAssetCard
}>()

const brand = useBrand()
const failedLogos = useFailedLogos()

const logo = computed(() => (props.card.snapshot.logo as string | undefined) ?? undefined)
const name = computed(() => (props.card.snapshot.name as string | undefined) ?? props.card.ticker)
const price = computed(() => {
  const p = props.card.snapshot.price
  if (typeof p !== 'number') return null
  return p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})
const changePct = computed(() => {
  const c = props.card.snapshot.changePct
  if (typeof c !== 'number') return null
  return c
})
const changeLabel = computed(() => {
  if (changePct.value == null) return null
  const sign = changePct.value >= 0 ? '+' : ''
  return `${sign}${changePct.value.toFixed(2)}%`
})
const changeColor = computed(() => {
  if (changePct.value == null) return brand.colors.textMuted
  if (changePct.value > 0) return brand.colors.positive
  if (changePct.value < 0) return brand.colors.negative
  return brand.colors.textMuted
})

const assetUrl = computed(() => {
  if (props.card.assetClass === 'CRYPTO') return `/crypto/${props.card.ticker.toLowerCase()}`
  if (props.card.assetClass === 'TESOURO') return `/tesouro/${props.card.ticker}`
  return `/asset/${props.card.ticker.toLowerCase()}`
})
</script>

<style scoped>
.chat-asset-card:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent) !important;
}
</style>
