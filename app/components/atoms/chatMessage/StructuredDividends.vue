<template>
  <div class="flex flex-col gap-4">
    <div class="font-semibold">Próximos Dividendos</div>
    <div class="h-[350px] w-full">
      <AtomsGraphDividends :data="dividendsData" :show-controls="false" />
    </div>
    <div class="flex flex-col gap-1">
      <div
        v-for="(div, idx) in items"
        :key="idx"
        class="flex justify-between rounded bg-[rgb(var(--brand-overlay)_/_0.05)] px-3 py-2"
      >
        <span>{{ new Date(div.date).toLocaleDateString() }}</span>
        <span class="font-mono font-bold" :style="{ color: brand.colors.positive }">
          R$ {{ div.dividend }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AtomsGraphDividends from '~/components/atoms/Graph/dividends.vue'

const brand = useBrand()
const props = defineProps<{ data: any }>()

const items = computed(() => {
  const raw = props.data.type === 'report' ? props.data.data?.dividends : props.data.data
  return Array.isArray(raw) ? raw.slice(0, 5) : []
})

const dividendsData = computed(() => {
  const raw = props.data.type === 'report' ? props.data.data?.dividends : props.data.data
  if (!Array.isArray(raw)) return []
  return raw.map((d: any) => ({
    ticker: props.data.ticker || '',
    payment_date: d.date,
    rate: String(d.dividend),
    label: '',
  }))
})
</script>
