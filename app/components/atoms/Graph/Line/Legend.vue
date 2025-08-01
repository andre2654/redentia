<script setup lang="ts">
interface IChartLegendItem {
  label: string;
  color: string;
  value?: string | number;
}

interface Props {
  legendItems: IChartLegendItem[];
}

defineProps<Props>();
</script>

<template>
  <div class="flex items-center gap-6">
    <div
      v-for="(item, index) in legendItems"
      :key="`legend-item-${index}-${item.label}`"
      class="flex items-center gap-3"
    >
      <div
        class="h-2 w-2 rounded-full"
        :style="{ backgroundColor: item.color }"
      />
      <div class="flex flex-col gap-1">
        <span
          v-if="item.label"
          class="text-sm font-medium text-white"
        >
          {{ item.label }}
        </span>
        <span
          v-if="item.value"
          class="text-xs text-white/70"
        >
          {{ item.value }}
        </span>
      </div>
    </div>
  </div>
</template>
