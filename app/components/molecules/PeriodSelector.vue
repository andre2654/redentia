<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    options?: { label: string; value: string }[]
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    options: () => [
      { label: 'Mês', value: 'month' },
      { label: 'Ano', value: 'year' },
      { label: '3 anos', value: '3years' },
      { label: 'Tudo', value: 'full' },
    ],
    disabled: false,
    loading: false,
  }
)

const modelValue = defineModel<string>({ required: true, default: 'month' })

const options = computed(() => props.options ?? [])

const isLoading = computed(() => props.loading)
const isDisabled = computed(() => props.disabled || isLoading.value)

const brand = useBrand()

// Mobile dropdown state — keeps the same terminal look but collapses into
// a single trigger + popover in viewports below md to save horizontal space
// on narrow screens where 4 pills eat the whole header row.
const mobileOpen = ref(false)
const mobileRef = ref<HTMLElement | null>(null)

const activeLabel = computed(
  () => options.value.find((o) => o.value === modelValue.value)?.label ?? options.value[0]?.label ?? '',
)

function toggleMobile() {
  if (isDisabled.value) return
  mobileOpen.value = !mobileOpen.value
}

function selectOption(value: string) {
  modelValue.value = value
  mobileOpen.value = false
}

function handleOutside(e: MouseEvent) {
  if (!mobileOpen.value) return
  const target = e.target as Node | null
  if (mobileRef.value && target && !mobileRef.value.contains(target)) {
    mobileOpen.value = false
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && mobileOpen.value) {
    mobileOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutside)
  document.addEventListener('keydown', handleEscape)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div v-if="options.length" class="period-selector">
    <!-- Desktop: segmented control (md+) -->
    <div
      class="hidden items-center gap-px border font-mono-tab text-[10px] uppercase tracking-[0.15em] md:flex"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
      role="group"
      aria-label="Período do gráfico"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        :class="[isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']"
        :style="{
          backgroundColor: modelValue === option.value ? brand.colors.primary : brand.colors.surface,
          color: modelValue === option.value ? brand.colors.background : brand.colors.textMuted,
        }"
        :disabled="isDisabled"
        :aria-pressed="modelValue === option.value"
        @click="modelValue = option.value"
      >
        <span v-if="isLoading && modelValue === option.value" class="inline-flex items-center gap-1">
          <UIcon name="i-lucide-loader-2" class="h-3 w-3 motion-safe:animate-spin" aria-hidden="true" />
          {{ option.label }}
        </span>
        <span v-else>{{ option.label }}</span>
      </button>
    </div>

    <!-- Mobile: dropdown with terminal aesthetic -->
    <div ref="mobileRef" class="relative md:hidden">
      <button
        type="button"
        class="flex items-center gap-2 border px-3 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        :class="[isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']"
        :style="{
          borderColor: brand.colors.border,
          backgroundColor: brand.colors.surface,
          color: brand.colors.text,
        }"
        :disabled="isDisabled"
        :aria-expanded="mobileOpen"
        aria-haspopup="listbox"
        aria-label="Selecionar período do gráfico"
        @click="toggleMobile"
      >
        <UIcon
          v-if="isLoading"
          name="i-lucide-loader-2"
          class="h-3 w-3 motion-safe:animate-spin"
          aria-hidden="true"
        />
        <span translate="no">{{ activeLabel.toUpperCase() }}</span>
        <UIcon
          name="i-lucide-chevron-down"
          class="h-3 w-3 transition-transform duration-200"
          :class="mobileOpen ? 'rotate-180' : ''"
          aria-hidden="true"
        />
      </button>

      <div
        v-if="mobileOpen"
        class="absolute right-0 top-full z-20 mt-1 flex min-w-[8rem] flex-col border font-mono-tab text-[10px] uppercase tracking-[0.15em] shadow-lg"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        role="listbox"
        aria-label="Período do gráfico"
      >
        <button
          v-for="option in options"
          :key="`m-${option.value}`"
          type="button"
          class="flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          :style="{
            backgroundColor: modelValue === option.value ? brand.colors.primary : 'transparent',
            color: modelValue === option.value ? brand.colors.background : brand.colors.textMuted,
          }"
          :disabled="isDisabled"
          role="option"
          :aria-selected="modelValue === option.value"
          @click="selectOption(option.value)"
        >
          <span>{{ option.label }}</span>
          <UIcon
            v-if="modelValue === option.value"
            name="i-lucide-check"
            class="h-3 w-3 shrink-0"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </div>
</template>
