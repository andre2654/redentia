<template>
  <div class="rounded-2xl border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
    <UProgress
      :model-value="score"
      :max="requirements.length"
      :color="color"
      :indicator="text"
      size="sm"
    />

    <div class="mt-4 flex flex-col gap-3 text-sm font-medium">
      <span class="text-center text-[13px] font-light" :style="{ color: 'var(--brand-text)' }">{{ text }}</span>
      <span class="text-[13px] font-extralight" :style="{ color: 'var(--brand-text-muted)' }">
        Sua senha precisa ter:
      </span>
    </div>

    <ul class="mt-2 space-y-2" aria-label="Requisitos da senha">
      <li
        v-for="req in requirements"
        :key="req.text"
        class="flex items-center gap-2"
        :style="{ color: req.met ? brand.colors.primary : 'var(--brand-text-muted)' }"
      >
        <UIcon
          :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
          class="size-4 shrink-0"
        />
        <span class="text-xs font-medium">{{ req.text }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Requirement {
  text: string
  met: boolean
}

defineProps<{
  requirements: Requirement[]
  score: number
  text: string
  color: string
}>()

const brand = useBrand()
</script>
