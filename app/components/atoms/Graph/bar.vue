<template>
  <div class="flex gap-2">
    <div
      v-for="item in portfolioData"
      :key="item.label"
      class="flex flex-col gap-2"
    >
      <div class="flex h-[150px] flex-col gap-1">
        <div
          class="w-[12px] rounded-full bg-white/20"
          :style="{
            height: 100 - percentageHeight(item.actual, item.ideal) + '%',
          }"
        />
        <div
          class="w-[12px] rounded-full bg-[#A7D6FF]"
          :style="{
            height: percentageHeight(item.actual, item.ideal) + '%',
          }"
        />
      </div>
      <span class="label -ml-1 max-w-fit text-[14px]">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const portfolioData = [
  { label: 'Bancos', actual: 5, ideal: 10, color: '#60A5FA' },
  { label: 'Serviços', actual: 5, ideal: 15, color: '#60A5FA' },
  { label: 'Bancos', actual: 10, ideal: 5, color: '#60A5FA' },
  { label: 'Serviços', actual: 3, ideal: 25, color: '#60A5FA' },
  { label: 'Bancos', actual: 2, ideal: 5, color: '#60A5FA' },
]

function percentageHeight(actual: number, ideal: number): number {
  if (ideal === 0) return 0
  if (actual > ideal) return 100

  return Math.round((actual / ideal) * 100)
}
</script>

<style scoped>
.label {
  writing-mode: sideways-lr;
}
</style>
