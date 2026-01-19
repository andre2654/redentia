<template>
  <div 
    class="pointer-events-none absolute inset-0"
    :class="opacity"
    :style="backgroundStyle"
  />
</template>

<script setup lang="ts">
interface Props {
  size?: number
  color?: string
  opacity?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'rgba(255,255,255,0.12)',
  opacity: 'opacity-30',
})

const backgroundStyle = computed(() => ({
  backgroundImage: `radial-gradient(circle, ${props.color} 1px, transparent 1px)`,
  backgroundSize: `${props.size}px ${props.size}px`,
}))
</script>
