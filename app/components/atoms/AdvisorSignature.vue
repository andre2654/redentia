<template>
  <div class="flex items-start gap-5">
    <!-- Avatar placeholder: circular B&W with grain, fictional advisor -->
    <div
      class="size-14 shrink-0 overflow-hidden rounded-full border"
      :style="{ borderColor: hairlineColor }"
    >
      <div
        class="size-full"
        :style="{
          background: `radial-gradient(circle at 35% 40%, var(--brand-surface), var(--brand-background))`,
        }"
      >
        <!-- Simple monogram as avatar stand-in; swap for real photo later -->
        <div
          class="flex size-full items-center justify-center font-editorial-display text-lg"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          {{ initials }}
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-0.5">
      <span
        class="font-editorial-body text-[11px] italic"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
       , {{ closing }}
      </span>
      <span
        class="font-editorial-display text-xl leading-tight"
        :style="{ color: 'var(--brand-text)' }"
      >
        {{ name }}
      </span>
      <span
        class="font-editorial-body text-[12px] italic"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        {{ role }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()

const props = withDefaults(
  defineProps<{
    name?: string
    role?: string
    closing?: string
  }>(),
  {
    name: 'Marcelo Oliveira, CFA',
    role: 'Seu assessor dedicado · Norte Capital',
    closing: 'Atenciosamente,',
  }
)

const initials = computed(() => {
  const parts = props.name.split(/[\s,]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]![0] + parts[1]![0]).toUpperCase()
  return (props.name.slice(0, 2) || '??').toUpperCase()
})

const hairlineColor = computed(
  () => `color-mix(in srgb, ${brand.colors.text} 15%, transparent)`
)
</script>
