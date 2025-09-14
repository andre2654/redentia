<template>
  <div class="flex items-center gap-2 rounded-md p-2">
    <img
      width="50"
      class="rounded-lg"
      :src="stock?.logo"
      alt="Descrição da imagem"
    />
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
        <span class="text-primary text-[13px]"
          >({{ stock.change_percent }}% hoje)</span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  stock?: any
}>()

function normalizeText(text: string) {
  return text?.replace(/\s+/g, ' ')
}
</script>
