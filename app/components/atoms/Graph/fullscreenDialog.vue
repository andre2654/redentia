<!--
  Fullscreen chart dialog. Native <dialog> with showModal() so Esc closes
  and focus is trapped for free. The parent stays the source of truth for
  chart data and props; this component just renders a large frame and
  re-emits the same slot content expanded to ~85vh.

  Usage:
    <AtomsGraphFullscreenDialog ref="fsRef" :title="..." :subtitle="...">
      <template #chart>
        <AtomsGraphLine :data="data" :height="expandedHeight" ... />
      </template>
    </AtomsGraphFullscreenDialog>

  Then `fsRef.value?.open()` from the toolbar @fullscreen handler.
-->
<template>
  <dialog
    ref="dialogEl"
    class="fullscreen-chart w-[min(95vw,1400px)] max-w-none rounded-2xl border p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
    @close="handleClose"
    @cancel="handleCancel"
  >
    <div class="flex h-[85vh] flex-col">
      <!-- Header -->
      <header
        class="flex items-center justify-between gap-4 border-b px-6 py-4"
        :style="{ borderColor: brand.colors.border }"
      >
        <div class="flex min-w-0 flex-col">
          <span
            v-if="subtitle"
            class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
            :style="{ color: brand.colors.primary }"
            translate="no"
          >
            {{ subtitle }}
          </span>
          <h2
            class="truncate text-xl font-bold tracking-tight"
            :style="{ color: brand.colors.text }"
          >
            {{ title }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-if="changeLabel"
            class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-mono-tab text-sm font-semibold tabular-nums"
            :style="{
              backgroundColor: `${isPositive ? brand.colors.positive : brand.colors.negative}1F`,
              color: isPositive ? brand.colors.positive : brand.colors.negative,
            }"
            translate="no"
          >
            {{ changeLabel }}
          </span>
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-md border transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            :style="{
              borderColor: brand.colors.border,
              color: brand.colors.text,
              backgroundColor: brand.colors.background,
            }"
            aria-label="Fechar tela cheia"
            @click="close"
          >
            <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <!-- Chart area fills remaining space -->
      <div class="relative flex-1 overflow-hidden px-6 pb-6 pt-4">
        <slot name="chart" :expanded-height="expandedHeight" />
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  title: string
  subtitle?: string
  changeLabel?: string
  isPositive?: boolean
}>()

const brand = useBrand()
const dialogEl = ref<HTMLDialogElement | null>(null)
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 900)

// Chart fills the flex container; a numeric px height is still needed
// because <AtomsGraphLine> takes a prop. 85vh - header (~80px) - padding
// (~40px) leaves room for the canvas without overflow.
const expandedHeight = computed(() => Math.max(360, Math.floor(windowHeight.value * 0.85 - 120)))

function onResize() {
  windowHeight.value = window.innerHeight
}

async function open() {
  await nextTick()
  dialogEl.value?.showModal()
}

function close() {
  if (dialogEl.value?.open) {
    dialogEl.value.close()
  }
}

function handleClose() {
  // noop — slot content unmounts implicitly if parent uses v-if
}

function handleCancel(e: Event) {
  // Let Esc close cleanly via native dialog, but prevent form-submission default
  e.preventDefault()
  close()
}

onMounted(() => {
  window.addEventListener('resize', onResize, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

defineExpose({ open, close })
</script>

<style scoped>
.fullscreen-chart {
  /* Viewport-centered regardless of browser engine. See note in
     screenshotModal.vue — same rationale. */
  margin: auto;
  inset: 0;
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.7);
}
.fullscreen-chart[open] {
  animation: fullscreen-fade-in 0.22s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .fullscreen-chart[open] {
    animation: none;
  }
}
@keyframes fullscreen-fade-in {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
