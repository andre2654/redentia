<template>
  <div class="flex flex-col gap-1">
    <div class="text-sm opacity-70">{{ data.ticker }}</div>
    <div class="flex items-baseline gap-3">
      <span class="text-3xl font-bold">R$ {{ data.data.price }}</span>
      <span :style="{ color: Number(data.data.change) >= 0 ? brand.colors.positive : brand.colors.negative }">
        {{ Number(data.data.change) > 0 ? '+' : '' }}{{ data.data.change }}%
      </span>
    </div>
    <div class="text-xs opacity-50">
      Atualizado em {{ new Date(data.data.lastUpdate).toLocaleTimeString() }}
    </div>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()
defineProps<{ data: any }>()
</script>
