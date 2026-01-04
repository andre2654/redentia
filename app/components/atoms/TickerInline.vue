<template>
  <AtomsTickerEmbed
    :ticker="ticker"
    :show-change="showChange"
    :size="size"
  />
</template>

<script setup lang="ts">
interface Props {
  ticker: string
  showChange?: boolean
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  showChange: true,
  size: 'sm',
})
</script>
