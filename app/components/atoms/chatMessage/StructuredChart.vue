<template>
  <div class="h-[250px] w-full">
    <AtomsGraphLine :data="chartData" :show-legend="false" :height="250" />
  </div>
</template>

<script setup lang="ts">
import AtomsGraphLine from '~/components/atoms/Graph/line.vue'

const props = defineProps<{ data: any }>()

const chartData = computed(() => {
  if (!Array.isArray(props.data.data)) return []
  return props.data.data.map((point: any) => ({
    date: point.x,
    value: point.y,
    timestamp: new Date(point.x).getTime(),
  }))
})
</script>
