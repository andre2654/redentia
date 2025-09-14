<template>
  <div class="flex items-center gap-2 rounded-md p-2">
    <img
      v-if="hasLogo"
      width="50"
      class="rounded-lg"
      :src="stock?.logo"
      alt="Descrição da imagem"
    />
    <IconLogo v-else class="h-[50px] w-[50px] fill-black dark:fill-white" />
    <div class="flex flex-col">
      <div class="flex gap-2">
        <span class="text-[16px] font-semibold">{{ stock?.ticker }}</span>
        <span class="text-[13px] text-white/70">{{
          normalizeText(stock?.name)
        }}</span>
      </div>
      <div class="flex gap-2">
        <span class="text-[16px] font-semibold"
          >R$ {{ stock.market_price }}</span
        >
        <span
          class="text-[13px]"
          :class="[
            stock.change_percent > 0 ? 'text-green-400' : 'text-red-400',
          ]"
          >({{ stock.change_percent }}% hoje)</span
        >
      </div>
    </div>
  </div>
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
