<!--
  Screenshot modal for charts. Mirrors the Perplexity pattern:
  - aspect ratio toggle (1:1, 3:4, 16:9)
  - dark / light theme preview
  - preview pane rendered live
  - copy to clipboard OR download PNG

  Usage:
    <AtomsGraphScreenshotModal
      ref="screenshotRef"
      :title="heroTitle"
      :subtitle="heroSubtitle"
      :price-label="priceLabel"
      :change-label="changeLabel"
      :is-positive="isPositive"
      :capture-target="chartContainerRef"
    />

  Then `screenshotRef.value?.open()` from the parent.
-->
<template>
  <dialog
    ref="dialogEl"
    class="screenshot-modal w-full max-w-2xl rounded-2xl border p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
    @close="handleClose"
    @cancel="handleCancel"
  >
    <div class="flex flex-col gap-5 p-6">
      <header class="flex items-start justify-between gap-4">
        <h2 class="text-lg font-semibold" :style="{ color: brand.colors.text }">
          Compartilhar imagem
        </h2>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          :style="{ color: brand.colors.textMuted }"
          aria-label="Fechar"
          @click="close"
        >
          <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
        </button>
      </header>

      <!-- Controls row: aspect + theme -->
      <div class="flex flex-wrap items-center gap-3">
        <div
          class="inline-flex items-center border"
          :style="{ borderColor: brand.colors.border }"
          role="group"
          aria-label="Proporção da imagem"
        >
          <button
            v-for="opt in aspectOptions"
            :key="opt.value"
            type="button"
            class="inline-flex h-8 min-w-12 items-center justify-center px-3 font-mono-tab text-[11px] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
            :style="{
              backgroundColor: aspect === opt.value ? brand.colors.primary : 'transparent',
              color: aspect === opt.value ? brand.colors.background : brand.colors.textMuted,
            }"
            :aria-pressed="aspect === opt.value"
            @click="aspect = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <div
          class="inline-flex items-center border"
          :style="{ borderColor: brand.colors.border }"
          role="group"
          aria-label="Tema"
        >
          <button
            type="button"
            class="inline-flex size-8 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
            :style="{
              backgroundColor: theme === 'light' ? brand.colors.primary : 'transparent',
              color: theme === 'light' ? brand.colors.background : brand.colors.textMuted,
            }"
            :aria-pressed="theme === 'light'"
            aria-label="Tema claro"
            @click="theme = 'light'"
          >
            <UIcon name="i-lucide-sun" class="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="inline-flex size-8 items-center justify-center border-l transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: theme === 'dark' ? brand.colors.primary : 'transparent',
              color: theme === 'dark' ? brand.colors.background : brand.colors.textMuted,
            }"
            :aria-pressed="theme === 'dark'"
            aria-label="Tema escuro"
            @click="theme = 'dark'"
          >
            <UIcon name="i-lucide-moon" class="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Preview pane -->
      <div
        class="relative mx-auto w-full overflow-hidden rounded-xl border"
        :style="{
          aspectRatio: aspectRatio,
          maxHeight: '50vh',
          borderColor: themeColors.border,
          backgroundColor: themeColors.background,
        }"
      >
        <div ref="previewEl" class="flex h-full w-full flex-col gap-3 p-5">
          <!-- Header: ticker + name -->
          <div class="flex items-center gap-2.5">
            <div
              v-if="avatarText"
              class="flex size-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold"
              :style="{
                borderColor: themeColors.border,
                backgroundColor: themeColors.surface,
                color: themeColors.text,
              }"
            >
              {{ avatarText }}
            </div>
            <div class="flex min-w-0 flex-col">
              <span class="truncate text-base font-semibold leading-tight" :style="{ color: themeColors.text }">
                {{ title }}
              </span>
              <span v-if="subtitle" class="truncate text-[11px] font-mono-tab leading-tight" :style="{ color: themeColors.textMuted }">
                {{ subtitle }}
              </span>
            </div>
            <span
              v-if="brand.name"
              class="ml-auto text-[10px] font-mono-tab uppercase tracking-[0.18em]"
              :style="{ color: themeColors.textMuted }"
            >
              {{ brand.name }}
            </span>
          </div>

          <!-- Price block -->
          <div v-if="priceLabel" class="flex items-baseline gap-2">
            <span
              class="font-mono-tab text-2xl font-bold tabular-nums"
              :style="{ color: themeColors.text }"
              translate="no"
            >
              {{ priceLabel }}
            </span>
            <span
              v-if="changeLabel"
              class="font-mono-tab text-xs font-semibold tabular-nums"
              :style="{ color: isPositive ? '#22c55e' : '#ef4444' }"
              translate="no"
            >
              {{ changeLabel }}
            </span>
          </div>

          <!-- Chart preview (captured as image from source) -->
          <div
            class="relative flex-1 overflow-hidden rounded-lg"
            :style="{ backgroundColor: themeColors.background }"
          >
            <img
              v-if="sourceImage"
              :src="sourceImage"
              alt=""
              class="h-full w-full object-contain"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-sm"
              :style="{ color: themeColors.textMuted }"
            >
              Capturando gráfico…
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <footer class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :disabled="isRendering || !sourceImage"
          :style="{
            borderColor: brand.colors.border,
            color: brand.colors.text,
            backgroundColor: brand.colors.surface,
          }"
          @click="copyToClipboard"
        >
          <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-4" aria-hidden="true" />
          {{ copied ? 'Copiado' : 'Copiar' }}
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :disabled="isRendering || !sourceImage"
          :style="{
            backgroundColor: brand.colors.primary,
            color: brand.colors.background,
            borderColor: brand.colors.primary,
          }"
          @click="downloadPng"
        >
          <UIcon name="i-lucide-download" class="size-4" aria-hidden="true" />
          Baixar PNG
        </button>
      </footer>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

const props = defineProps<{
  title: string
  subtitle?: string
  priceLabel?: string
  changeLabel?: string
  isPositive?: boolean
  avatarText?: string
  /**
   * Either an HTMLElement, a ref to one, or a function returning one.
   * The element is passed to html2canvas-pro to produce the snapshot.
   */
  captureTarget?: HTMLElement | (() => HTMLElement | null | undefined) | null
}>()

const brand = useBrand()
const dialogEl = ref<HTMLDialogElement | null>(null)
const previewEl = ref<HTMLElement | null>(null)

type Aspect = '16:9' | '3:4' | '1:1'
type Theme = 'dark' | 'light'

const aspect = ref<Aspect>('16:9')
const theme = ref<Theme>('dark')

const aspectOptions: { label: string; value: Aspect }[] = [
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '16:9', value: '16:9' },
]

const aspectRatio = computed(() => aspect.value.replace(':', ' / '))

// Theme-aware colors for the preview pane
const themeColors = computed(() => {
  if (theme.value === 'light') {
    return {
      background: '#ffffff',
      surface: '#f5f5f5',
      border: '#e5e7eb',
      text: '#0a0a0a',
      textMuted: '#6b7280',
    }
  }
  return {
    background: brand.colors.background,
    surface: brand.colors.surface,
    border: brand.colors.border,
    text: brand.colors.text,
    textMuted: brand.colors.textMuted,
  }
})

const sourceImage = ref<string | null>(null)
const isRendering = ref(false)
const copied = ref(false)

function resolveCaptureTarget(): HTMLElement | null {
  const t = props.captureTarget
  if (!t) return null
  if (typeof t === 'function') return t() ?? null
  return t
}

async function captureSource() {
  const target = resolveCaptureTarget()
  if (!target) return
  isRendering.value = true
  try {
    const { default: html2canvas } = await import('html2canvas-pro')
    const canvas = await html2canvas(target, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
    })
    sourceImage.value = canvas.toDataURL('image/png')
  } catch (err) {
    console.warn('[screenshotModal] capture failed', err)
  } finally {
    isRendering.value = false
  }
}

async function renderFinal(): Promise<string | null> {
  if (!previewEl.value) return null
  try {
    const { default: html2canvas } = await import('html2canvas-pro')
    const canvas = await html2canvas(previewEl.value, {
      backgroundColor: themeColors.value.background,
      scale: 2,
      logging: false,
      useCORS: true,
    })
    return canvas.toDataURL('image/png')
  } catch (err) {
    console.warn('[screenshotModal] render failed', err)
    return null
  }
}

async function downloadPng() {
  const dataUrl = await renderFinal()
  if (!dataUrl) return
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${brand.name.toLowerCase().replace(/\s+/g, '-')}-${props.title.toLowerCase().replace(/\s+/g, '-')}.png`
  link.click()
}

async function copyToClipboard() {
  const dataUrl = await renderFinal()
  if (!dataUrl) return
  try {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch (err) {
    console.warn('[screenshotModal] clipboard failed', err)
  }
}

async function open() {
  sourceImage.value = null
  copied.value = false
  await nextTick()
  dialogEl.value?.showModal()
  await nextTick()
  captureSource()
}

function close() {
  if (dialogEl.value?.open) {
    dialogEl.value.close()
  }
}

function handleClose() {
  sourceImage.value = null
}

function handleCancel(e: Event) {
  e.preventDefault()
  close()
}

defineExpose({ open, close })
</script>

<style scoped>
.screenshot-modal {
  /* Viewport-centered. Native <dialog> positioning is inconsistent across
     engines (Chromium: centered by default; Safari/older: top-left).
     `margin: auto` + `inset: 0` forces centered layout everywhere the
     modern dialog element is supported. */
  margin: auto;
  inset: 0;
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.6);
}
.screenshot-modal[open] {
  animation: screenshot-fade-in 0.2s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .screenshot-modal[open] {
    animation: none;
  }
}
@keyframes screenshot-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
