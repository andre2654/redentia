<template>
  <div class="brand-card overflow-hidden border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
    <button
      type="button"
      class="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:opacity-80"
      :aria-expanded="open"
      @click="open = !open"
    >
      <div v-if="icon" class="flex h-7 w-7 items-center justify-center rounded-md bg-secondary/15">
        <UIcon :name="icon" class="size-3.5 text-secondary" />
      </div>
      <div class="min-w-0 flex-1">
        <span class="text-sm font-semibold" :style="{ color: brand.colors.text }">{{ title }}</span>
        <p v-if="hint && !open" class="mt-0.5 truncate text-[11px]" :style="{ color: brand.colors.textMuted }">{{ hint }}</p>
      </div>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-4 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        :style="{ color: brand.colors.textMuted }"
      />
    </button>
    <div v-show="open" class="border-t px-6 py-5" :style="{ borderColor: brand.colors.border }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()

const props = defineProps<{
  title: string
  icon?: string
  defaultOpen?: boolean
  hint?: string
}>()

const open = ref(props.defaultOpen ?? false)
</script>
