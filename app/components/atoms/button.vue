<template>
  <UButton
    v-bind="attrs"
    :type="type"
    :color="color"
    :variant="variant"
    :size="size"
  >
    <slot />
  </UButton>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    color?: string
    variant?: string
    size?: string
  }>(),
  {
    type: 'button',
    color: 'tertiary',
    variant: 'soft',
    size: 'lg',
  }
)
</script>
