<template>
  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
        <div class="text-xs opacity-60">P/L</div>
        <div class="text-lg font-bold">{{ data.data.pe ?? '-' }}</div>
      </div>
      <div class="rounded bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
        <div class="text-xs opacity-60">Dividend Yield</div>
        <div class="text-lg font-bold" :style="{ color: brand.colors.positive }">
          {{ data.data.dy ?? '-' }}%
        </div>
      </div>
      <div class="rounded bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
        <div class="text-xs opacity-60">Setor</div>
        <div class="font-medium">{{ data.data.sector ?? '-' }}</div>
      </div>
      <div class="rounded bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
        <div class="text-xs opacity-60">Valor de Mercado</div>
        <div class="font-medium">{{ data.data.marketCap ?? '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()
defineProps<{ data: any }>()
</script>
