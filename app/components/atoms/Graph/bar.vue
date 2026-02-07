<template>
  <div class="flex flex-col gap-6">
    <span class="text-[16px]">Setores</span>
    <AtomsDraggableContainer v-if="chartData.length" class="no-scrollbar gap-2">
      <div
        v-for="item in chartData"
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
    </AtomsDraggableContainer>
    <p v-else class="text-[14px] text-white/50">
      Nenhum setor disponível.
    </p>
  </div>
</template>

<script setup lang="ts">
interface BarItem {
  label: string
  actual: number
  ideal: number
}

const props = withDefaults(
  defineProps<{
    /** Lista de setores com percentual atual e ideal (0–100). Se vazio, usa dados estáticos de exemplo. */
    portfolioData?: BarItem[]
  }>(),
  { portfolioData: () => [] }
)

const chartData = computed(() => {
  if (props.portfolioData?.length) {
    return props.portfolioData.map((s) => ({
      label: s.label,
      actual: s.actual,
      ideal: s.ideal,
    }))
  }
  return []
})

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
