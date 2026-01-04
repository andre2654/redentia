<template>
  <div
    class="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-sm"
  >
    <div class="text-center">
      <h2 class="mb-3 text-2xl font-bold text-white">
        {{ title }}
      </h2>
      <p class="text-gray-300">
        {{ description }}
      </p>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <UButton
      class="normal-static-link"
        v-for="(button, index) in buttons"
        :key="index"
        :to="button.to"
        :color="button.variant === 'primary' ? 'secondary' : 'white'"
        :variant="button.variant === 'outline' ? 'outline' : button.variant === 'ghost' ? 'solid' : undefined"
        size="xl"
        :icon="button.icon"
      >
        {{ button.label }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CtaButton {
  label: string
  to: string
  icon?: string
  variant?: 'primary' | 'outline' | 'ghost'
}

interface Props {
  title: string
  description: string
  buttons: CtaButton[]
}

defineProps<Props>()
</script>
