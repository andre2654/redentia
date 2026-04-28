<template>
  <div
    class="flex flex-col gap-0.5"
    :class="{ 'items-start': !emphasized, 'items-start': emphasized }"
  >
    <span
      class="text-[13px] font-semibold tabular-nums md:text-sm"
      :class="{ 'opacity-100': emphasized, 'opacity-90': !emphasized }"
      :style="{ color: valueColor }"
    >
      {{ formatted }}
    </span>
    <span
      class="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide"
      :style="{ color: 'var(--brand-text-muted)' }"
    >
      <span
        class="inline-block size-1.5 rounded-full"
        :class="{ 'border ring-0': outlined }"
        :style="dotStyle"
      />
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface BrandShape {
  colors: {
    text: string
    textMuted: string
    positive: string
    negative: string
    border: string
  }
}

const props = defineProps<{
  label: string
  value: number | null
  dotColor: 'negative' | 'positive' | 'neutral' | 'text'
  emphasized?: boolean
  outlined?: boolean
  brand: BrandShape
}>()

const formatted = computed(() => {
  if (props.value === null || props.value === undefined) return '—'
  return props.value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  })
})

const valueColor = computed(() => props.brand.colors.text)

const dotStyle = computed(() => {
  const colors = props.brand.colors
  const base =
    props.dotColor === 'negative'
      ? colors.negative
      : props.dotColor === 'positive'
        ? colors.positive
        : props.dotColor === 'text'
          ? colors.text
          : colors.textMuted

  if (props.outlined) {
    return { backgroundColor: 'transparent', borderColor: base }
  }
  return { backgroundColor: base }
})
</script>
