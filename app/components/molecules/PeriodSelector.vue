<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    options?: { label: string; value: string }[]
    disabled?: boolean
    loading?: boolean
    /**
     * Force dropdown rendering on every breakpoint. By default the
     * component renders segmented pills on md+ and a dropdown on
     * mobile; pass `dropdown` when the surrounding layout is too
     * tight for 4 inline pills (centered hero card, narrow column,
     * etc.) so the trigger stays compact regardless of viewport.
     */
    dropdown?: boolean
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
    dropdown: false,
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
    <!-- Segmented (md+ default). Hidden completamente quando o caller
         passa `dropdown` pra forçar a versão compacta em qualquer
         viewport. Loading aparece via spinner sutil ao lado direito. -->
    <div :class="['relative', dropdown ? 'hidden' : 'hidden md:block']">
      <AtomsSegmented
        v-model="modelValue"
        :options="options"
        :disabled="isDisabled"
        aria-label="Período do gráfico"
      />
      <UIcon
        v-if="isLoading"
        name="i-lucide-loader-2"
        class="absolute -right-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 motion-safe:animate-spin"
        :style="{ color: 'var(--text-muted)' }"
        aria-hidden="true"
      />
    </div>

    <!-- Dropdown quiet. Default em mobile (md:hidden); virou padrão em
         qualquer viewport quando `dropdown=true`. Trigger pill + popover
         com sombra-card. -->
    <div ref="mobileRef" :class="['relative', dropdown ? '' : 'md:hidden']">
      <button
        type="button"
        class="flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring-focus)]"
        :class="[isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']"
        style="border-color: var(--border-default); background-color: var(--bg-input); color: var(--text-heading);"
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
        <span>{{ activeLabel }}</span>
        <UIcon
          name="i-lucide-chevron-down"
          class="h-3 w-3 transition-transform duration-200"
          :class="mobileOpen ? 'rotate-180' : ''"
          aria-hidden="true"
        />
      </button>

      <div
        v-if="mobileOpen"
        class="absolute right-0 top-full z-20 mt-1.5 flex min-w-[9rem] flex-col rounded-md border p-1 text-[13px] font-medium"
        style="border-color: var(--border-subtle); background-color: var(--bg-elevated); box-shadow: var(--shadow-popover);"
        role="listbox"
        aria-label="Período do gráfico"
      >
        <button
          v-for="option in options"
          :key="`m-${option.value}`"
          type="button"
          class="flex items-center justify-between gap-3 rounded-[4px] px-3 py-2 text-left transition-colors focus-visible:outline-none"
          :style="modelValue === option.value
            ? { backgroundColor: 'var(--brand-primary)', color: '#1A0A2E' }
            : { backgroundColor: 'transparent', color: 'var(--text-body)' }"
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
