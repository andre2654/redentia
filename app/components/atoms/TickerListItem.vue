<template>
  <NuxtLink
    :to="`/asset/${stock?.ticker?.toLowerCase?.() || stock?.ticker || ''}`"
    class="flex items-center gap-4 bg-white/5 px-4 py-2 transition-colors hover:bg-white/10"
  >
    <img
      v-if="hasLogo"
      width="40"
      class="rounded-full"
      :src="stock?.logo"
      :alt="stock?.name ? `Logo de ${normalizeText(stock.name)}` : `Logo do ativo ${stock?.ticker || ''}`"
    />
    <div
      v-else
      class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
    >
      <span class="text-xs font-bold text-white/50">
        {{ (stock?.ticker || '').substring(0, 2) }}
      </span>
    </div>
    <div class="flex w-full justify-between">
      <div class="flex flex-col">
        <span
          class="max-w-[10ch] overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium"
        >
          {{ normalizeText(stock?.name) }}
        </span>
        <span class="text-[15px] text-white/70">{{ stock?.ticker }}</span>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-[15px] text-white/70">
          R$ {{ stock.market_price }}
        </span>
        <span
          class="text-[16px]"
          :class="[
            stock.change_percent > 0 ? 'text-green-400' : 'text-red-400',
          ]"
        >
          {{ stock.change_percent.toFixed(2) }}%
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps<{
  stock?: any
}>()

function normalizeText(text: string) {
  return text?.replace(/\s+/g, ' ')
}

const hasLogo = computed(() => {
  return (
    props.stock?.logo &&
    props.stock?.logo !== 'https://icons.brapi.dev/icons/BRAPI.svg'
  )
})
</script>
