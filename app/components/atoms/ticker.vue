<template>
  <NuxtLink
    :to="`/asset/${stock?.ticker}`"
    class="bg-white/10 flex items-center gap-4 p-2 hover:brightness-105"
  >
    <img
      v-if="hasLogo"
      width="40"
      class="rounded-full"
      :src="stock?.logo"
      alt="Descrição da imagem"
    />
    <IconLogo v-else class="h-[40px] w-[40px] fill-black dark:fill-white" />
    <div class="flex justify-between w-full">
      <div class="flex flex-col">
        <span class="text-[14px] font-medium">{{
          normalizeText(stock?.name)
        }}</span>
        <span class="text-[15px] text-white/70">{{ stock?.ticker }}</span>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-[15px] text-white/70"
          >R$ {{ stock.market_price }}</span
        >
        <span
          class="text-[16px]"
          :class="[
            stock.change_percent > 0 ? 'text-green-400' : 'text-red-400',
          ]"
          >{{ stock.change_percent.toFixed(2) }}%</span
        >
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
