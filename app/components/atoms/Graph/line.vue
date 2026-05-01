<template>
  <div
    class="graph relative flex h-full w-full flex-col gap-4"
    @mouseleave="onRootMouseLeave"
  >
    <!-- Toolbar slot: parents inject period selector, chart-type toggle,
         screenshot button, etc. Rendered as a flex row so chips/buttons
         align naturally; hidden when nothing's provided. -->
    <div v-if="$slots.toolbar" class="flex flex-wrap items-center gap-2">
      <slot name="toolbar" />
    </div>

    <!-- Container do gráfico. `data-chart-capture-root` marks the element
         that screenshot modals should target, it excludes the toolbar
         above, keeping only the plotting area in the exported PNG.

         Mobile height: when the consumer doesn't pass `mobileHeight`
         explicitly, we derive a smaller default from the desktop
         height (`effectiveMobileHeight`). Phones don't have the
         vertical room a desktop chart assumes, so without this every
         page using the chart felt cramped on mobile. -->
    <div
      ref="chartContainerRef"
      data-chart-capture-root
      :style="{
        '--chart-h': `${height}px`,
        '--chart-h-mobile': `${effectiveMobileHeight}px`,
      } as any"
      class="relative w-full rounded-lg h-[var(--chart-h-mobile)] md:h-[var(--chart-h)]"
    >
      <!-- Estado de carregamento (não-invasivo) -->
      <Transition name="fade">
        <div
          v-if="loading"
          class="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs backdrop-blur"
          :style="{ borderColor: cc.border, backgroundColor: cc.loadingBg, color: cc.textMuted }"
          role="status"
          aria-live="polite"
        >
          <span
            class="h-3 w-3 motion-safe:animate-spin rounded-full border"
            :style="{ borderColor: cc.tickColorMuted, borderTopColor: cc.labelColor }"
          />
          <span>Carregando…</span>
        </div>
      </Transition>

      <!-- Gráfico -->
      <Line
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
        :plugins="localPlugins"
      />

      <!-- Prev-close pill minimalista: pill compacto inline, sem glow,
           apenas border subtle e bg semi-transparente. Eyebrow muted +
           valor tabular na mesma linha, separados por middle dot. -->
      <div
        v-if="prevClosePillPos && prevClosePillPos.visible"
        class="pointer-events-none absolute z-[4] inline-flex items-center gap-2 whitespace-nowrap rounded-md border px-2.5 py-1"
        :style="{
          left: `${prevClosePillPos.right - 12}px`,
          top: `${prevClosePillPos.y}px`,
          transform: 'translate(-100%, -50%)',
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'color-mix(in srgb, var(--bg-elevated) 96%, transparent)',
        }"
        aria-hidden="true"
      >
        <span class="text-[10px] font-medium uppercase tracking-[0.1em]" :style="{ color: 'var(--text-muted)' }">
          Fech. anterior
        </span>
        <span class="font-mono-tab text-[11px] font-medium tabular-nums" :style="{ color: 'var(--text-heading)' }" translate="no">
          {{ currency }} {{ Number(prevClosePillPos.value).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
        </span>
      </div>

      <!-- Marker overlay (HTML icons positioned above chart points) -->
      <div class="pointer-events-none absolute inset-0 z-[5]">
        <button
          v-for="group in markerPositions"
          :key="group.idx"
          type="button"
          class="marker-pin pointer-events-auto absolute"
          :style="{
            left: `${group.x}px`,
            top: `${Math.max(12, group.y - 28)}px`,
          }"
          :class="activeMarkerIdx === group.idx && 'is-active'"
          @click.stop="onMarkerIconClick(group)"
        >
          <span
            class="marker-icon-wrap"
            :style="{
              backgroundColor: activeMarkerIdx === group.idx ? dynamicColor : `${dynamicColor}e6`,
              boxShadow: `0 2px 8px ${dynamicColor}40`,
            }"
          >
            <UIcon name="i-lucide-sparkles" class="size-3 text-white" />
          </span>
          <span
            v-if="group.items.length > 1"
            class="marker-badge"
            :style="{ backgroundColor: dynamicColor }"
          >
            +{{ group.items.length - 1 }}
          </span>
        </button>
      </div>

      <!-- Marker popover (clicked) -->
      <div
        v-if="activeMarker"
        class="marker-popover absolute z-[20]"
        :style="popoverStyle"
      >
        <div
          class="marker-popover-card relative overflow-hidden rounded-2xl border"
          :style="{
            backgroundColor: popoverBg,
            borderColor: cc.border,
            width: '300px',
          }"
        >
          <!-- Accent gradient strip at top -->
          <div
            class="absolute inset-x-0 top-0 h-[2px]"
            :style="{
              background: `linear-gradient(90deg, transparent, ${dynamicColor}, transparent)`,
            }"
          />

          <!-- Soft accent glow -->
          <div
            class="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full opacity-[0.08] blur-2xl"
            :style="{ backgroundColor: dynamicColor }"
          />

          <div class="relative p-4">
            <!-- Close button -->
            <button
              type="button"
              class="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full transition hover:bg-white/5"
              :style="{ color: cc.textMuted }"
              @click.stop="closePopover"
              aria-label="Fechar"
            >
              <UIcon name="i-lucide-x" class="size-3" />
            </button>

            <!-- Header: icon + label + date -->
            <div class="mb-3 flex items-center gap-2">
              <span
                class="flex size-7 items-center justify-center rounded-lg"
                :style="{
                  background: `linear-gradient(135deg, ${dynamicColor}, ${dynamicColor}cc)`,
                  boxShadow: `0 4px 12px ${dynamicColor}40`,
                }"
              >
                <UIcon name="i-lucide-sparkles" class="size-3.5 text-white" />
              </span>
              <div class="flex flex-col leading-tight">
                <span
                  class="text-[9px] font-semibold uppercase tracking-[0.15em]"
                  :style="{ color: cc.textMuted }"
                >
                  Análise · IA
                </span>
                <span class="text-[10px]" :style="{ color: cc.labelColor }">
                  {{ formatPopoverDate(activeMarker.date) }}
                </span>
              </div>
            </div>

            <!-- Title -->
            <h4
              class="mb-3.5 pr-4 text-[13.5px] font-semibold leading-snug"
              :style="{ color: cc.labelColor }"
            >
              {{ activeMarker.title }}
            </h4>

            <!-- Variation pill + Read more link -->
            <div class="flex items-center justify-between gap-2">
              <span
                class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums"
                :style="{
                  color: activeMarker.changePercent >= 0 ? DEFAULTS.POSITIVE_COLOR : DEFAULTS.NEGATIVE_COLOR,
                  borderColor: activeMarker.changePercent >= 0 ? `${DEFAULTS.POSITIVE_COLOR}33` : `${DEFAULTS.NEGATIVE_COLOR}33`,
                  backgroundColor: activeMarker.changePercent >= 0 ? `${DEFAULTS.POSITIVE_COLOR}14` : `${DEFAULTS.NEGATIVE_COLOR}14`,
                }"
              >
                <UIcon
                  :name="activeMarker.changePercent >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                  class="size-3"
                />
                {{ activeMarker.changePercent >= 0 ? '+' : '' }}{{ Number(activeMarker.changePercent).toFixed(2) }}%
              </span>

              <button
                type="button"
                class="group inline-flex items-center gap-1 text-[11px] font-semibold transition"
                :style="{ color: dynamicColor }"
                @click.stop="onPopoverReadMore"
              >
                Ler análise completa
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-3 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Arrow pointing to marker -->
        <div class="marker-popover-arrow" :style="{ borderTopColor: cc.border }" />
      </div>
    </div>

    <!-- Tooltip dinâmico -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="showTooltip && tooltipData"
          class="chart-tooltip pointer-events-none fixed z-50 will-change-transform"
          :style="tooltipStyle"
          :aria-hidden="!showTooltip"
        >
          <div
            class="chart-tooltip-card relative overflow-hidden rounded-xl border backdrop-blur-xl"
            :style="{
              borderColor: cc.border,
              backgroundColor: tooltipBgColor,
              minWidth: '200px',
            }"
          >
            <!-- Accent stripe on left edge -->
            <div
              class="absolute inset-y-0 left-0 w-[3px]"
              :style="{
                background:
                  tooltipData.changeColor ||
                  tooltipData.color ||
                  DEFAULTS.COLORS[0],
              }"
            />

            <div class="relative px-4 py-3">
              <!-- Top row: day of week (hover) OR "INTERVALO" label (drag) + duration -->
              <div
                v-if="tooltipData.dayOfWeek || tooltipData.isRange"
                class="mb-1.5 flex items-center justify-between gap-2"
              >
                <span
                  v-if="tooltipData.dayOfWeek && !tooltipData.isRange"
                  class="text-[9px] font-semibold uppercase tracking-[0.15em]"
                  :style="{ color: cc.textMuted }"
                >
                  {{ tooltipData.dayOfWeek }}
                </span>
                <span
                  v-else-if="tooltipData.isRange"
                  class="text-[9px] font-semibold uppercase tracking-[0.15em]"
                  :style="{ color: cc.textMuted }"
                >
                  Intervalo
                </span>
                <span
                  v-if="tooltipData.durationLabel"
                  class="text-[10px] tabular-nums"
                  :style="{ color: cc.textMuted }"
                >
                  {{ tooltipData.durationLabel }}
                </span>
              </div>

              <!-- Date label -->
              <div
                class="mb-1 text-[11px]"
                :style="{ color: cc.textMuted }"
              >
                {{ tooltipData.label }}
              </div>

              <!-- Main price value -->
              <div
                class="text-[17px] font-semibold leading-tight tabular-nums"
                :style="{ color: cc.labelColor }"
              >
                {{ tooltipData.value }}
              </div>

              <!-- Change row -->
              <div
                v-if="tooltipData.changeValue"
                class="mt-2 flex items-center justify-between gap-3 border-t pt-2"
                :style="{ borderColor: cc.border }"
              >
                <span
                  class="text-[9px] font-medium uppercase tracking-wider"
                  :style="{ color: cc.textMuted }"
                >
                  {{ tooltipData.changeLabel }}
                </span>
                <span
                  class="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums"
                  :style="{ color: tooltipData.changeColor }"
                >
                  <svg
                    v-if="tooltipData.isPositive"
                    class="size-2.5"
                    viewBox="0 0 8 8"
                    fill="currentColor"
                  >
                    <path d="M4 0l4 6H0z" />
                  </svg>
                  <svg
                    v-else
                    class="size-2.5"
                    viewBox="0 0 8 8"
                    fill="currentColor"
                  >
                    <path d="M4 8L0 2h8z" />
                  </svg>
                  {{ tooltipData.changeValue }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  nextTick,
  watch,
  reactive,
  shallowRef,
  type Ref,
} from 'vue'
import colorLib from '@kurkle/color'
import type { Chart as ChartJS, Plugin } from 'chart.js'
import {
  Chart as ChartCore,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { getRelativePosition } from 'chart.js/helpers'
import { useChartColors } from '~/design/chartColors'

const cc = useChartColors()
const brand = useBrand()

/* ========== Tipos ========== */
interface IChartDataPoint {
  date: string
  value: number
  timestamp: number
}

interface IChartLegendItem {
  label: string
  color: string
  value?: string | number
}

interface ITooltipData {
  label: string
  value: string
  color: string
  dayOfWeek?: string
  changeLabel?: string
  changeValue?: string
  changeColor?: string
  isPositive?: boolean
  isRange?: boolean
  durationLabel?: string
}

interface IDragState {
  startIndex: number | null
  endIndex: number | null
}

interface IHoverState {
  index: number | null
  position: { x: number; y: number }
}

type ChartPointLike = { x: number; y: number }
type ChartFillStyle = CanvasGradient | string

interface IClosingFillGradients {
  positive: ChartFillStyle
  negative: ChartFillStyle
}

export interface IChartMarker {
  date: string
  title: string
  changePercent: number
}

interface Props {
  data: IChartDataPoint[]
  colors?: string[]
  legend?: IChartLegendItem[]
  /**
   * Desktop height in pixels. Always wins on screens ≥ 768px (md
   * breakpoint).
   */
  height?: number
  /**
   * Mobile height in pixels (screens < 768px).
   *
   * When omitted (the common case across pages), the component
   * applies a sensible default: roughly 78% of `height` floored at
   * 180px. The 78% ratio mirrors what `/asset/[ticker]` was using
   * manually (320 → 250) and the 180 floor keeps very small charts
   * legible. Examples:
   *   240 → 187   320 → 250   480 → 374   550 → 429
   *
   * Override explicitly only when you need a tighter / taller
   * mobile layout than the default. Passing the same value as
   * `height` disables responsive scaling entirely.
   */
  mobileHeight?: number
  showLegend?: boolean
  loading?: boolean
  locale?: string
  currency?: string
  markers?: IChartMarker[]
}

/* ========== Configurações padrão ========== */
const DEFAULTS = {
  COLORS: [cc.positive],
  HEIGHT: 300,
  LOCALE: 'pt-BR',
  CURRENCY: 'R$',
  LOADING_ANIMATION_INTERVAL: 800,
  DRAG_END_DELAY: 150,
  SCROLL_DEBOUNCE: 100,
  POSITIVE_COLOR: cc.positive,
  NEGATIVE_COLOR: cc.negative,
  GRAY_COLOR: cc.neutral,
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => [],
  legend: () => [],
  height: 300,
  showLegend: true,
  loading: false,
  locale: 'pt-BR',
  currency: 'R$',
  markers: () => [],
})

const emit = defineEmits<{
  (e: 'marker-click', date: string): void
}>()

/**
 * Resolved mobile height. When the consumer passes `mobileHeight`
 * explicitly we honor it; otherwise we derive a smaller default from
 * `height` so every page using this chart gets a sensible mobile
 * layout without each consumer having to know the magic number.
 *
 * Formula: `max(180, round(height * 0.78))`. The 0.78 ratio matches
 * what /asset/[ticker] was already doing manually (320 → 250); the
 * 180 floor protects very small charts (e.g. the 240px desktop
 * planning calc) from becoming unreadable.
 */
const effectiveMobileHeight = computed<number>(() => {
  if (props.mobileHeight !== undefined) return props.mobileHeight
  return Math.max(180, Math.round(props.height * 0.78))
})

// Map chart data-point indices to an ARRAY of markers (supports multiple commentaries per date)
const markerIndexMap = computed(() => {
  const map = new Map<number, IChartMarker[]>()
  if (!props.markers || props.markers.length === 0 || !props.data) return map

  const dateToIndex = new Map<string, number>()
  props.data.forEach((point, idx) => {
    const normalized = (point.date || '').slice(0, 10)
    dateToIndex.set(normalized, idx)
  })

  for (const marker of props.markers) {
    const normalized = (marker.date || '').slice(0, 10)
    const idx = dateToIndex.get(normalized)
    if (idx !== undefined) {
      const existing = map.get(idx) || []
      existing.push(marker)
      map.set(idx, existing)
    }
  }

  return map
})

// Reactive marker positions (updated by plugin on every chart draw)
interface MarkerPosition {
  idx: number
  x: number
  y: number
  items: IChartMarker[]
}
// shallowRef: marker positions are reassigned wholesale on every chart
// draw (never mutated in place), so deep reactivity would just burn
// cycles walking through objects that never trigger watchers anyway.
const markerPositions = shallowRef<MarkerPosition[]>([])

// Position + value of the "prev close" dashed line label. Populated by the
// closingDeltaFill plugin on every draw; consumed by an absolutely
// positioned HTML pill in the template so typography stays crisp on HiDPI.
const prevClosePillPos = ref<{
  y: number
  right: number
  value: number
  visible: boolean
} | null>(null)

// Popover state
const activeMarkerIdx = ref<number | null>(null)
const activeMarker = computed<IChartMarker | null>(() => {
  if (activeMarkerIdx.value === null) return null
  const group = markerPositions.value.find((g) => g.idx === activeMarkerIdx.value)
  return group?.items[0] || null
})

const popoverStyle = computed(() => {
  if (activeMarkerIdx.value === null) return {}
  const group = markerPositions.value.find((g) => g.idx === activeMarkerIdx.value)
  if (!group) return {}

  // Popover is 280px wide (max). Clamp horizontally inside the chart container.
  const containerWidth = chartContainerRef.value?.clientWidth ?? 640
  const popoverWidth = 300
  const halfW = popoverWidth / 2
  const edge = 12
  const minLeft = halfW + edge
  const maxLeft = containerWidth - halfW - edge
  const clampedX = Math.min(maxLeft, Math.max(minLeft, group.x))

  // Popover appears below the marker by default. If marker is near bottom, show above.
  const containerHeight = chartContainerRef.value?.clientHeight ?? 320
  const popoverHeight = 140
  const belowTop = Math.max(12, group.y - 28) + 36
  const willOverflow = belowTop + popoverHeight > containerHeight - edge
  const top = willOverflow
    ? Math.max(12, group.y - 28 - popoverHeight - 8)
    : belowTop

  return {
    left: `${clampedX}px`,
    top: `${top}px`,
    transform: 'translateX(-50%)',
    '--arrow-side': willOverflow ? 'bottom' : 'top',
  } as Record<string, string>
})

const popoverBg = computed(() => {
  // Build an opaque bg from the base color
  const base = cc.background || '#0a0a0a'
  return base
})

function onMarkerIconClick(group: MarkerPosition) {
  if (activeMarkerIdx.value === group.idx) {
    activeMarkerIdx.value = null
  } else {
    activeMarkerIdx.value = group.idx
  }
}

function closePopover() {
  activeMarkerIdx.value = null
}

function onPopoverReadMore() {
  if (!activeMarker.value) return
  emit('marker-click', activeMarker.value.date)
  activeMarkerIdx.value = null
}

function formatPopoverDate(dateStr: string): string {
  try {
    const d = new Date(dateStr.slice(0, 10) + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// Close popover when clicking anywhere else
function onGlobalClick(e: MouseEvent) {
  if (activeMarkerIdx.value === null) return
  const target = e.target as HTMLElement
  if (target.closest('.marker-popover') || target.closest('.marker-pin')) return
  activeMarkerIdx.value = null
}

/* ========== Validação de dados ========== */
const isDataValid = computed(() => {
  return (
    Array.isArray(props.data) &&
    props.data.length > 0 &&
    props.data.every(
      (d) =>
        d &&
        typeof d.value === 'number' &&
        !Number.isNaN(d.value) &&
        typeof d.date === 'string'
    )
  )
})

/* ========== Estados ========== */
const dragState = reactive<IDragState>({
  startIndex: null,
  endIndex: null,
})

const hoverState = reactive<IHoverState>({
  index: null,
  position: { x: 0, y: 0 },
})

const isDragging = computed({
  get: () => dragState.startIndex !== null,
  set: (value) => {
    if (!value) {
      dragState.startIndex = null
      dragState.endIndex = null
    }
  },
})

const isHovering = computed({
  get: () => hoverState.index !== null,
  set: (value) => {
    if (!value) {
      hoverState.index = null
    }
  },
})

/* ========== Dados de loading ========== */
// shallowRef: loading data is reassigned on each frame (generateLoadingData
// returns a new array); no in-place mutations. Skips deep reactivity cost.
const loadingData = shallowRef<IChartDataPoint[]>([])
const loadingAnimationFrame: Ref<number | null> = ref(null)
const loadingTimeoutId: Ref<NodeJS.Timeout | null> = ref(null)

function generateLoadingData(): IChartDataPoint[] {
  const now = new Date()
  const data: IChartDataPoint[] = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const baseValue = 1000 + Math.sin(i * 0.1) * 200
    const randomVariation = (Math.random() - 0.5) * 100
    const value = Math.max(800, baseValue + randomVariation)

    data.push({
      date: date.toLocaleDateString(props.locale, {
        day: '2-digit',
        month: '2-digit',
      }),
      value: Math.round(value),
      timestamp: date.getTime(),
    })
  }

  return data
}

function animateLoadingData(): void {
  if (!props.loading) return

  loadingData.value = generateLoadingData()

  loadingAnimationFrame.value = requestAnimationFrame(() => {
    loadingTimeoutId.value = setTimeout(() => {
      animateLoadingData()
    }, DEFAULTS.LOADING_ANIMATION_INTERVAL)
  })
}

function stopLoadingAnimation(): void {
  if (loadingAnimationFrame.value !== null) {
    cancelAnimationFrame(loadingAnimationFrame.value)
    loadingAnimationFrame.value = null
  }
  if (loadingTimeoutId.value !== null) {
    clearTimeout(loadingTimeoutId.value)
    loadingTimeoutId.value = null
  }
}

/* ========== Utilitários ========== */
function transparentize(hex: string, opacity: number): string {
  try {
    const alpha = opacity === undefined ? 0.5 : 1 - opacity
    return colorLib(hex).alpha(alpha).rgbString()
  } catch {
    return `rgba(0, 0, 0, ${1 - opacity})`
  }
}

function formatCurrency(value: number): string {
  try {
    return `${props.currency} ${value.toLocaleString(props.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  } catch {
    return `${props.currency} ${value.toFixed(2)}`
  }
}

function formatPercentage(value: number): string {
  try {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  } catch {
    return `${value}%`
  }
}

function parseNumericValue(value?: number | string | null): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null

  const sanitized = value.replace(/\s/g, '').replace(/[^\d,.-]/g, '')
  if (!sanitized) return null

  const commaIndex = sanitized.lastIndexOf(',')
  const dotIndex = sanitized.lastIndexOf('.')

  let normalized = sanitized
  if (commaIndex > dotIndex) {
    normalized = sanitized.replace(/\./g, '').replace(',', '.')
  } else if (dotIndex > commaIndex) {
    normalized = sanitized.replace(/,/g, '')
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function formatAxisCurrency(value: number): string {
  try {
    return `${props.currency} ${Number(value).toLocaleString(props.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  } catch {
    return `${props.currency} ${value}`
  }
}

function formatXAxisLabel(rawLabel: string): string {
  if (!rawLabel) return rawLabel

  const parsed = Date.parse(rawLabel)
  if (!Number.isNaN(parsed)) {
    try {
      return new Date(parsed).toLocaleDateString(props.locale, {
        day: '2-digit',
        month: props.locale === 'en-US' ? 'short' : '2-digit',
      })
    } catch {
      // fall through to default return
    }
  }

  return rawLabel
}

function formatTooltipDate(rawDate: string): string {
  if (!rawDate) return rawDate

  const monthNames = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ]

  const tryParse = (value: string): Date | null => {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed

    const slashMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
    if (slashMatch) {
      const [, dayStr, monthStr, yearStr] = slashMatch
      const day = Number(dayStr)
      const month = Number(monthStr) - 1
      const year = Number(yearStr.length === 2 ? `20${yearStr}` : yearStr)
      if (
        Number.isFinite(day) &&
        Number.isFinite(month) &&
        Number.isFinite(year) &&
        month >= 0 &&
        month < 12
      ) {
        const candidate = new Date(year, month, day)
        if (!Number.isNaN(candidate.getTime())) return candidate
      }
    }

    return null
  }

  const date = tryParse(rawDate)
  if (!date) return rawDate

  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()

  return `${day} de ${month} de ${year}`
}

function evaluateVariation(
  reference: number,
  data: IChartDataPoint[] | undefined | null
): { hasAbove: boolean; hasBelow: boolean } {
  const result = { hasAbove: false, hasBelow: false }

  if (
    !Number.isFinite(reference) ||
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return result
  }

  for (const point of data) {
    if (
      !point ||
      typeof point.value !== 'number' ||
      Number.isNaN(point.value)
    ) {
      continue
    }

    if (point.value > reference) {
      result.hasAbove = true
    } else if (point.value < reference) {
      result.hasBelow = true
    }

    if (result.hasAbove && result.hasBelow) break
  }

  return result
}

function getIndexFromEvt(chart: ChartJS, e: MouseEvent): number | null {
  try {
    const pos = getRelativePosition(e, chart)
    const { chartArea, scales } = chart
    const xScale = scales?.x

    if (!xScale || !chartArea) return null

    const insideChart =
      pos.x >= chartArea.left &&
      pos.x <= chartArea.right &&
      pos.y >= chartArea.top &&
      pos.y <= chartArea.bottom

    if (!insideChart) return null

    const idx = xScale.getValueForPixel(pos.x)
    return typeof idx === 'number' && !Number.isNaN(idx)
      ? Math.max(0, Math.min(Math.round(idx), props.data.length - 1))
      : null
  } catch {
    return null
  }
}

/* ========== Tooltip computado ========== */
function getDayOfWeekLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr.slice(0, 10) + 'T12:00:00')
    const days = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ]
    return days[d.getDay()] || ''
  } catch {
    return ''
  }
}

function getDurationLabel(startDate: string, endDate: string): string {
  try {
    const s = new Date(startDate.slice(0, 10) + 'T12:00:00')
    const e = new Date(endDate.slice(0, 10) + 'T12:00:00')
    const diffMs = e.getTime() - s.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return ''
    if (diffDays === 1) return '1 dia'
    if (diffDays < 30) return `${diffDays} dias`
    if (diffDays < 365) {
      const months = Math.round(diffDays / 30)
      return `${months} ${months === 1 ? 'mês' : 'meses'}`
    }
    const years = (diffDays / 365).toFixed(1)
    return `${years} anos`
  } catch {
    return ''
  }
}

const tooltipData = computed<ITooltipData | null>(() => {
  try {
    // Estado de drag (range selection)
    if (
      isDragging.value &&
      dragState.startIndex !== null &&
      dragState.endIndex !== null
    ) {
      const startIdx = Math.min(dragState.startIndex, dragState.endIndex)
      const endIdx = Math.max(dragState.startIndex, dragState.endIndex)

      const startData = props.data[startIdx]
      const endData = props.data[endIdx]

      if (!startData || !endData || startIdx === endIdx) return null

      const change = endData.value - startData.value
      const changePercent = (change / startData.value) * 100
      const isPositive = change >= 0
      const color = isPositive ? DEFAULTS.POSITIVE_COLOR : DEFAULTS.NEGATIVE_COLOR

      return {
        label: `${formatTooltipDate(startData.date)} → ${formatTooltipDate(endData.date)}`,
        value: formatCurrency(endData.value),
        color,
        changeLabel: 'Variação no período',
        changeValue: `${isPositive ? '+' : ''}${formatCurrency(change)} · ${formatPercentage(changePercent)}`,
        changeColor: color,
        isPositive,
        isRange: true,
        durationLabel: getDurationLabel(startData.date, endData.date),
      }
    }

    // Estado de hover (single point)
    if (isHovering.value && hoverState.index !== null && isDataValid.value) {
      const dataPoint = props.data[hoverState.index]
      if (!dataPoint) return null

      // Compute change vs previous data point if available
      const previousPoint =
        hoverState.index > 0 ? props.data[hoverState.index - 1] : null

      let changeValue: string | undefined
      let changeColor: string | undefined
      let isPositive = true

      if (previousPoint && typeof previousPoint.value === 'number') {
        const delta = dataPoint.value - previousPoint.value
        const deltaPct = (delta / previousPoint.value) * 100
        isPositive = delta >= 0
        const sign = isPositive ? '+' : ''
        changeValue = `${sign}${formatCurrency(delta)} · ${sign}${deltaPct.toFixed(2).replace('.', ',')}%`
        changeColor = isPositive ? DEFAULTS.POSITIVE_COLOR : DEFAULTS.NEGATIVE_COLOR
      }

      return {
        label: formatTooltipDate(dataPoint.date),
        value: formatCurrency(dataPoint.value),
        color: props.colors[0] || DEFAULTS.COLORS[0],
        dayOfWeek: getDayOfWeekLabel(dataPoint.date),
        changeLabel: previousPoint ? 'vs. dia anterior' : undefined,
        changeValue,
        changeColor,
        isPositive,
      }
    }

    return null
  } catch {
    return null
  }
})

const showTooltip = computed(() => {
  return (isHovering.value || isDragging.value) && tooltipData.value !== null
})

const tooltipStyle = computed(() => {
  if (!showTooltip.value) return {}

  const offsetX = 14
  const tooltipWidth = 240
  const tooltipHeight = tooltipData.value?.changeValue ? 124 : 80

  // Position vertically so tooltip is above-ish the cursor but doesn't clip
  let top = hoverState.position.y - tooltipHeight - 12
  let left = hoverState.position.x + offsetX

  if (typeof window !== 'undefined') {
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Horizontal clamp
    const rightEdge = left + tooltipWidth
    if (rightEdge > vw - 12) {
      left = Math.max(12, hoverState.position.x - tooltipWidth - offsetX)
    }

    // Vertical clamp: if above would go off top, show below cursor
    if (top < 12) {
      top = Math.min(vh - tooltipHeight - 12, hoverState.position.y + 18)
    }
    // Final safety clamp
    top = Math.max(12, Math.min(vh - tooltipHeight - 12, top))
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  }
})

const tooltipBgColor = computed(() => {
  // Use a slightly transparent version of the background for the glass effect
  const bg = cc.background || '#0a0a0a'
  // If it's a hex, add alpha; otherwise fall back to a solid-ish value
  if (bg.startsWith('#') && bg.length === 7) {
    return bg + 'ee' // ~93% opacity
  }
  return bg
})

const tooltipClasses = computed(() => {
  if (isDragging.value) {
    return 'bg-white/20'
  }
  return 'bg-gray-500/20 border-white border'
})

/* ========== Cor dinâmica ========== */
const dynamicColor = computed(() => {
  if (props.loading) return DEFAULTS.GRAY_COLOR

  if (
    isDragging.value &&
    dragState.startIndex !== null &&
    dragState.endIndex !== null
  ) {
    const startIdx = Math.min(dragState.startIndex, dragState.endIndex)
    const endIdx = Math.max(dragState.startIndex, dragState.endIndex)

    const startData = props.data[startIdx]
    const endData = props.data[endIdx]

    if (startData && endData) {
      return endData.value >= startData.value
        ? DEFAULTS.POSITIVE_COLOR
        : DEFAULTS.NEGATIVE_COLOR
    }
  }

  return props.colors[0] || DEFAULTS.COLORS[0]
})

const datasetStats = computed<{
  min: number
  max: number
  first: number
  last: number
} | null>(() => {
  if (
    !isDataValid.value ||
    !Array.isArray(props.data) ||
    props.data.length === 0
  )
    return null

  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let first: number | null = null
  let last: number | null = null

  for (const point of props.data) {
    if (!point || typeof point.value !== 'number' || Number.isNaN(point.value))
      continue

    if (first === null) first = point.value
    last = point.value

    if (point.value < min) min = point.value
    if (point.value > max) max = point.value
  }

  if (
    first === null ||
    last === null ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return null
  }

  return { min, max, first, last }
})

/**
 * Previous close — the second-to-last point of the series. This is the
 * reference line drawn across the chart so users can see how the latest
 * close moved versus the prior day. Falls back to null on a one-point
 * series (nothing to compare against).
 */
const prevCloseValue = computed<number | null>(() => {
  if (!isDataValid.value || !Array.isArray(props.data) || props.data.length < 2) {
    return null
  }

  const prev = props.data[props.data.length - 2]?.value
  return typeof prev === 'number' && Number.isFinite(prev) ? prev : null
})

const closingLineValue = computed<number | null>(() => {
  try {
    if (!isDataValid.value) return null

    const legendValue = props.legend?.find(
      (item) =>
        typeof item.label === 'string' &&
        item.label.toLowerCase().includes('fechamento')
    )?.value

    const parsedLegend = parseNumericValue(legendValue ?? null)
    if (parsedLegend !== null) return parsedLegend

    const prevClose = prevCloseValue.value
    if (prevClose !== null) return prevClose

    const stats = datasetStats.value
    if (!stats) return null

    return stats.last
  } catch {
    return null
  }
})

const hasReferenceVariation = computed<boolean>(() => {
  if (!isDataValid.value) return false

  const reference = closingLineValue.value
  if (reference === null) return false

  const variation = evaluateVariation(reference, props.data)
  return variation.hasAbove && variation.hasBelow
})

const displayedData = computed(() => {
  if (props.loading && !isDataValid.value) {
    return loadingData.value
  }
  return props.data
})

const yAxisExtents = computed<{
  min: number
  max: number
} | null>(() => {
  const dataSource = displayedData.value
  if (!Array.isArray(dataSource) || dataSource.length === 0) return null

  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const point of dataSource) {
    if (!point || typeof point.value !== 'number' || Number.isNaN(point.value))
      continue

    if (point.value < min) min = point.value
    if (point.value > max) max = point.value
  }

  const referenceValue = closingLineValue.value
  if (Number.isFinite(referenceValue)) {
    min = Math.min(min, referenceValue!)
    max = Math.max(max, referenceValue!)
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return null

  if (min === max) {
    const padding = Math.max(1, Math.abs(min) * 0.01)
    return {
      min: min - padding,
      max: max + padding,
    }
  }

  return { min, max }
})

function fillRegionBetween(
  ctx: CanvasRenderingContext2D,
  pointA: ChartPointLike,
  pointB: ChartPointLike,
  closingY: number,
  orientation: 'above' | 'below',
  fillStyle: ChartFillStyle
): void {
  if (
    !pointA ||
    !pointB ||
    !Number.isFinite(pointA.x) ||
    !Number.isFinite(pointA.y) ||
    !Number.isFinite(pointB.x) ||
    !Number.isFinite(pointB.y) ||
    !Number.isFinite(closingY)
  ) {
    return
  }

  if (pointA.x === pointB.x && pointA.y === pointB.y) return

  const relevantY =
    orientation === 'below'
      ? Math.max(pointA.y, pointB.y)
      : Math.min(pointA.y, pointB.y)
  if (relevantY === closingY) return

  ctx.beginPath()
  ctx.moveTo(pointA.x, pointA.y)
  ctx.lineTo(pointB.x, pointB.y)
  ctx.lineTo(pointB.x, closingY)
  ctx.lineTo(pointA.x, closingY)
  ctx.closePath()
  ctx.fillStyle = fillStyle
  ctx.fill()
}

function drawClosingFillSegment(
  ctx: CanvasRenderingContext2D,
  pointA: ChartPointLike,
  pointB: ChartPointLike,
  valueA: number,
  valueB: number,
  closingValue: number,
  closingY: number,
  gradients: IClosingFillGradients
): 'above' | 'below' | 'mixed' {
  if (
    !Number.isFinite(valueA) ||
    !Number.isFinite(valueB) ||
    !Number.isFinite(closingValue)
  ) {
    return 'mixed'
  }

  const deltaA = valueA - closingValue
  const deltaB = valueB - closingValue

  if (deltaA === 0 && deltaB === 0) return 'mixed'

  if ((deltaA <= 0 && deltaB <= 0) || (deltaA >= 0 && deltaB >= 0)) {
    const targetOrientation = deltaA < 0 ? 'below' : 'above'
    const targetGradient =
      targetOrientation === 'below' ? gradients.negative : gradients.positive

    fillRegionBetween(
      ctx,
      pointA,
      pointB,
      closingY,
      targetOrientation,
      targetGradient
    )
    return targetOrientation
  }

  const denominator = valueB - valueA
  if (denominator === 0) return 'mixed'

  const t = (closingValue - valueA) / denominator
  if (!Number.isFinite(t)) return 'mixed'

  const clampedT = Math.max(0, Math.min(1, t))
  if (clampedT <= 0 || clampedT >= 1) {
    fillRegionBetween(
      ctx,
      pointA,
      pointB,
      closingY,
      deltaA < 0 ? 'below' : 'above'
    )
    return deltaA < 0 ? 'below' : 'above'
  }

  const intersectionPoint: ChartPointLike = {
    x: pointA.x + (pointB.x - pointA.x) * clampedT,
    y: closingY,
  }

  if (deltaA < 0) {
    fillRegionBetween(
      ctx,
      pointA,
      intersectionPoint,
      closingY,
      'below',
      gradients.negative
    )
    fillRegionBetween(
      ctx,
      intersectionPoint,
      pointB,
      closingY,
      'above',
      gradients.positive
    )
    return 'mixed'
  } else {
    fillRegionBetween(
      ctx,
      pointA,
      intersectionPoint,
      closingY,
      'above',
      gradients.positive
    )
    fillRegionBetween(
      ctx,
      intersectionPoint,
      pointB,
      closingY,
      'below',
      gradients.negative
    )
    return 'mixed'
  }
}

/* ========== Chart setup ========== */
const chartRef = shallowRef<InstanceType<typeof Line> | null>(null)
const chartContainerRef = ref<HTMLElement | null>(null)
const chartInstance: Ref<ChartJS | null> = ref(null)
let removeCanvasEvents: (() => void) | null = null
let scrollDebounceTimer: NodeJS.Timeout | null = null

function setupCanvasEvents(chart: ChartJS): () => void {
  const canvas = chart.canvas

  // ========== Handlers de Mouse (Desktop) ==========
  const handleMouseDown = (e: MouseEvent): void => {
    if (props.loading || !isDataValid.value) return

    const idx = getIndexFromEvt(chart, e)
    if (idx === null) return

    dragState.startIndex = idx
    dragState.endIndex = idx
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent): void => {
    if (props.loading || !isDataValid.value) return

    hoverState.position = { x: e.clientX, y: e.clientY }

    if (isDragging.value) {
      const idx = getIndexFromEvt(chart, e)
      if (idx !== null) dragState.endIndex = idx
      e.preventDefault()
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const insideCanvas = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height

    if (!insideCanvas) {
      isHovering.value = false
      hoverState.index = null
      return
    }

    // Verifica se o elemento sob o mouse é o canvas ou está dentro dele
    const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY)
    const isCanvasOrChild =
      elementUnderMouse === canvas || canvas.contains(elementUnderMouse as Node)

    if (!isCanvasOrChild) {
      isHovering.value = false
      hoverState.index = null
      return
    }

    const idx = getIndexFromEvt(chart, e)
    if (idx !== null) {
      hoverState.index = idx
    } else {
      isHovering.value = false
      hoverState.index = null
    }
  }

  const handleMouseLeave = (): void => {
    isHovering.value = false
    hoverState.index = null
    if (!isDragging.value) {
      dragState.startIndex = null
      dragState.endIndex = null
    }
  }

  const handleMouseUp = (): void => {
    if (!isDragging.value) return

    setTimeout(() => {
      isDragging.value = false
      isHovering.value = false
      hoverState.index = null
    }, DEFAULTS.DRAG_END_DELAY)
  }

  // ========== Handlers de Touch (Mobile) ==========
  const handleTouchStart = (e: TouchEvent): void => {
    if (props.loading || !isDataValid.value) return

    // Se há 2 dedos, preparar para drag
    if (e.touches.length === 2) {
      // Ordenar os dedos por posição X (esquerda para direita)
      const touches = Array.from(e.touches)
      touches.sort((a, b) => a.clientX - b.clientX)

      const leftTouch = touches[0]
      const rightTouch = touches[1]

      const leftIdx = getIndexFromEvt(chart, {
        clientX: leftTouch.clientX,
        clientY: leftTouch.clientY,
      } as any)

      const rightIdx = getIndexFromEvt(chart, {
        clientX: rightTouch.clientX,
        clientY: rightTouch.clientY,
      } as any)

      if (leftIdx === null || rightIdx === null) return

      dragState.startIndex = leftIdx
      dragState.endIndex = rightIdx
      hoverState.position = { x: leftTouch.clientX, y: leftTouch.clientY }
      e.preventDefault()
      return
    }

    // Se há apenas 1 dedo, mostrar tooltip simples
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      hoverState.position = { x: touch.clientX, y: touch.clientY }

      const idx = getIndexFromEvt(chart, {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as any)

      if (idx !== null) {
        hoverState.index = idx
      }

      // NÃO previne o scroll aqui
      return
    }
  }

  const handleTouchMove = (e: TouchEvent): void => {
    if (props.loading || !isDataValid.value) return

    // Drag com 2 dedos
    if (e.touches.length === 2) {
      // Ordenar os dedos por posição X (esquerda para direita)
      const touches = Array.from(e.touches)
      touches.sort((a, b) => a.clientX - b.clientX)

      const leftTouch = touches[0]
      const rightTouch = touches[1]

      hoverState.position = { x: leftTouch.clientX, y: leftTouch.clientY }

      const rect = canvas.getBoundingClientRect()
      const xLeft = leftTouch.clientX - rect.left
      const yLeft = leftTouch.clientY - rect.top
      const xRight = rightTouch.clientX - rect.left
      const yRight = rightTouch.clientY - rect.top

      const insideCanvas =
        xLeft >= 0 &&
        xLeft <= rect.width &&
        yLeft >= 0 &&
        yLeft <= rect.height &&
        xRight >= 0 &&
        xRight <= rect.width &&
        yRight >= 0 &&
        yRight <= rect.height

      if (!insideCanvas) {
        isDragging.value = false
        dragState.startIndex = null
        dragState.endIndex = null
        return
      }

      const leftIdx = getIndexFromEvt(chart, {
        clientX: leftTouch.clientX,
        clientY: leftTouch.clientY,
      } as any)

      const rightIdx = getIndexFromEvt(chart, {
        clientX: rightTouch.clientX,
        clientY: rightTouch.clientY,
      } as any)

      if (isDragging.value) {
        if (leftIdx !== null) dragState.startIndex = leftIdx
        if (rightIdx !== null) dragState.endIndex = rightIdx
      }

      e.preventDefault()
      return
    }

    // Tooltip simples com 1 dedo
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      hoverState.position = { x: touch.clientX, y: touch.clientY }

      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const insideCanvas =
        x >= 0 && x <= rect.width && y >= 0 && y <= rect.height

      if (!insideCanvas) {
        isHovering.value = false
        hoverState.index = null
        return
      }

      const idx = getIndexFromEvt(chart, {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as any)

      if (idx !== null) {
        hoverState.index = idx
      } else {
        isHovering.value = false
        hoverState.index = null
      }

      // NÃO previne o scroll aqui
      return
    }

    // Se há mais de 2 dedos, cancelar tudo
    if (e.touches.length > 2) {
      isHovering.value = false
      hoverState.index = null
      isDragging.value = false
      dragState.startIndex = null
      dragState.endIndex = null
    }
  }

  const handleTouchEnd = (e: TouchEvent): void => {
    // Se ainda há dedos no canvas, continuar
    if (e.touches.length > 0) return

    if (!isDragging.value && hoverState.index !== null) {
      // Se era apenas tooltip, manter por um tempo
      setTimeout(() => {
        if (e.touches.length === 0) {
          isHovering.value = false
          hoverState.index = null
        }
      }, 300)
      return
    }

    if (isDragging.value) {
      setTimeout(() => {
        isDragging.value = false
        isHovering.value = false
        hoverState.index = null
      }, DEFAULTS.DRAG_END_DELAY)
    }
  }

  const handleTouchCancel = (): void => {
    isHovering.value = false
    hoverState.index = null
    isDragging.value = false
    dragState.startIndex = null
    dragState.endIndex = null
  }

  // ========== Scroll ==========
  const handleScroll = (): void => {
    if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)

    scrollDebounceTimer = setTimeout(() => {
      isHovering.value = false
      isDragging.value = false
      hoverState.index = null
      scrollDebounceTimer = null
    }, DEFAULTS.SCROLL_DEBOUNCE)
  }

  // ========== Registrar Eventos ==========
  // Mouse events (desktop)
  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mouseleave', handleMouseLeave)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // Touch events (mobile)
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
  canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
  canvas.addEventListener('touchend', handleTouchEnd, { passive: true })
  canvas.addEventListener('touchcancel', handleTouchCancel, { passive: true })

  // Scroll
  window.addEventListener('scroll', handleScroll, { passive: true })

  // ========== Cleanup ==========
  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('mouseleave', handleMouseLeave)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    canvas.removeEventListener('touchstart', handleTouchStart)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleTouchEnd)
    canvas.removeEventListener('touchcancel', handleTouchCancel)

    window.removeEventListener('scroll', handleScroll)
    if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
  }
}

/* ========== Plugin do hover line ========== */
function getSegmentOrientation(index: number): 'above' | 'below' | 'mixed' {
  const orientations: ('above' | 'below' | 'mixed')[] | undefined = (
    chartInstance.value as any
  )?._segmentOrientations
  if (!orientations || orientations.length === 0) return 'mixed'

  const segmentIndex = Math.min(Math.max(index - 1, 0), orientations.length - 1)
  return orientations[segmentIndex] ?? 'mixed'
}

// Tons pastel para casar com o hero live preview card. Substituem o cc.positive
// (verde forte) e cc.negative (vermelho forte) somente no traço da linha — area
// fill ja foi pastelizada acima nos gradients.
const PASTEL_POSITIVE = '#4ADE80'
const PASTEL_NEGATIVE = '#F87171'

function dynamicLineColor(index: number, fallback = true): string {
  const orientation = getSegmentOrientation(index)
  if (orientation === 'above') return PASTEL_POSITIVE
  if (orientation === 'below') return PASTEL_NEGATIVE
  return fallback ? dynamicColor.value : 'rgba(148, 163, 184, 0.6)'
}

const hoverLinePlugin: Plugin<'line'> = {
  id: 'hover-line-plugin',
  afterDraw: (chart) => {
    try {
      const { ctx, chartArea, scales } = chart

      if (
        !ctx ||
        !chartArea ||
        !scales?.x ||
        !scales?.y ||
        !isDataValid.value
      ) {
        return
      }

      const { top, bottom, left, right } = chartArea
      const xScale = scales.x
      const yScale = scales.y

      // Linha do fechamento anterior
      const segmentOrientations: ('above' | 'below' | 'mixed')[] =
        (chart as any)._segmentOrientations ?? []

      if (
        !props.loading &&
        props.data.length > 0 &&
        hasReferenceVariation.value
      ) {
        const currentValue = prevCloseValue.value
        if (currentValue === null) return
        const yPosition = yScale.getPixelForValue(currentValue)

        if (typeof yPosition === 'number' && !Number.isNaN(yPosition)) {
          ctx.save()

          // Linha tracejada
          ctx.beginPath()
          ctx.setLineDash([3, 4])
          ctx.lineWidth = 1
          ctx.strokeStyle = cc.crosshairColor
          ctx.moveTo(left, yPosition)
          ctx.lineTo(right, yPosition)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.closePath()

          // Prev-close pill position is computed here and consumed by the
          // HTML overlay outside the canvas (see template). Keeps typography
          // crisp at any DPR vs. canvas fillText which rasterizes blurry.
          prevClosePillPos.value = {
            y: yPosition,
            right: right,
            value: currentValue,
            visible: !isHovering.value,
          }

          ctx.restore()
        }
      }

      // Linha de hover
      if (isHovering.value && hoverState.index !== null && !isDragging.value) {
        const xCoor = xScale.getPixelForValue(hoverState.index)

        if (typeof xCoor === 'number' && !Number.isNaN(xCoor)) {
          ctx.save()
          ctx.beginPath()
          ctx.lineWidth = 1.5
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)'
          ctx.setLineDash([4, 4])
          ctx.moveTo(xCoor, top)
          ctx.lineTo(xCoor, bottom)
          ctx.stroke()
          ctx.closePath()
          ctx.restore()
        }
      }

      // Seleção por drag
      if (
        isDragging.value &&
        dragState.startIndex !== null &&
        dragState.endIndex !== null
      ) {
        const startIdx = Math.min(dragState.startIndex, dragState.endIndex)
        const endIdx = Math.max(dragState.startIndex, dragState.endIndex)

        const startX = xScale.getPixelForValue(startIdx)
        const endX = xScale.getPixelForValue(endIdx)

        if (
          [startX, endX].some((v) => typeof v !== 'number' || Number.isNaN(v))
        ) {
          return
        }

        const startData = props.data[startIdx]
        const endData = props.data[endIdx]

        if (!startData || !endData) return

        ctx.save()

        // Áreas escurecidas
        ctx.fillStyle = cc.loadingBg
        if (startX > left) {
          ctx.fillRect(left, top, startX - left, bottom - top)
        }
        if (endX < right) {
          ctx.fillRect(endX, top, right - endX, bottom - top)
        }

        // Overlay na seleção
        ctx.fillStyle = 'rgba(148, 163, 184, 0.1)'
        ctx.fillRect(startX, top, endX - startX, bottom - top)

        ctx.restore()
      }
    } catch {
      // Silently handle chart rendering errors
    }
  },
}

const closingDeltaFillPlugin: Plugin<'line'> = {
  id: 'closing-delta-fill',
  beforeDatasetsDraw: (chart) => {
    const segmentColors: ('above' | 'below' | 'mixed')[] = []
    try {
      if (!isDataValid.value || props.loading) return

      const closeValue = closingLineValue.value
      if (closeValue === null) return

      const meta = chart.getDatasetMeta(0)
      if (!meta || !Array.isArray(meta.data) || meta.data.length < 2) return

      const yScale = chart.scales?.y
      const { chartArea } = chart

      if (!yScale || !chartArea) return

      const closingY = yScale.getPixelForValue(closeValue)
      if (!Number.isFinite(closingY)) return

      const dataSource = displayedData.value
      if (!Array.isArray(dataSource) || dataSource.length < 2) return

      const ctx = chart.ctx
      ctx.save()
      ctx.beginPath()
      ctx.rect(
        chartArea.left,
        chartArea.top,
        chartArea.right - chartArea.left,
        chartArea.bottom - chartArea.top
      )
      ctx.clip()

      const chartTop = chartArea.top
      const chartBottom = chartArea.bottom
      const chartHeight = Math.max(1, chartBottom - chartTop)
      const closingRatio = Math.min(
        1,
        Math.max(0, (closingY - chartTop) / chartHeight)
      )

      // Gradient flip + pastelizado para casar com o hero live preview card.
      // Positivo: solido na curva (topo) -> transparente na linha de fechamento (fade pra baixo).
      // Negativo: solido na linha de fechamento (topo da regiao negativa) -> transparente embaixo.
      // Alphas reduzidas (0.32 -> 0.18 max) para ficar pastel/peach como o hero.
      const positiveGradient = ctx.createLinearGradient(
        0,
        chartTop,
        0,
        chartBottom
      )
      positiveGradient.addColorStop(0, 'rgba(134, 239, 172, 0.22)')
      positiveGradient.addColorStop(
        Math.max(0, closingRatio - 0.25),
        'rgba(134, 239, 172, 0.14)'
      )
      positiveGradient.addColorStop(
        Math.max(0, closingRatio - 0.05),
        'rgba(134, 239, 172, 0.04)'
      )
      positiveGradient.addColorStop(
        Math.max(0, closingRatio),
        'rgba(134, 239, 172, 0)'
      )
      positiveGradient.addColorStop(1, 'rgba(134, 239, 172, 0)')

      const negativeGradient = ctx.createLinearGradient(
        0,
        chartTop,
        0,
        chartBottom
      )
      negativeGradient.addColorStop(0, 'rgba(252, 165, 165, 0)')
      negativeGradient.addColorStop(
        Math.max(0, closingRatio - 0.05),
        'rgba(252, 165, 165, 0)'
      )
      negativeGradient.addColorStop(
        Math.min(1, closingRatio),
        'rgba(252, 165, 165, 0.18)'
      )
      negativeGradient.addColorStop(
        Math.min(1, closingRatio + 0.2),
        'rgba(252, 165, 165, 0.10)'
      )
      negativeGradient.addColorStop(
        Math.min(1, closingRatio + 0.45),
        'rgba(252, 165, 165, 0.04)'
      )
      negativeGradient.addColorStop(1, 'rgba(252, 165, 165, 0)')

      const gradients: IClosingFillGradients = {
        positive: positiveGradient,
        negative: negativeGradient,
      }

      for (let i = 1; i < meta.data.length; i++) {
        const previousPoint = meta.data[i - 1] as unknown as ChartPointLike
        const currentPoint = meta.data[i] as unknown as ChartPointLike

        const previousValue = dataSource[i - 1]?.value
        const currentValue = dataSource[i]?.value

        if (
          typeof previousValue !== 'number' ||
          typeof currentValue !== 'number'
        )
          continue

        const segmentOrientation = drawClosingFillSegment(
          ctx,
          previousPoint,
          currentPoint,
          previousValue,
          currentValue,
          closeValue,
          closingY,
          gradients
        )

        segmentColors.push(segmentOrientation)
      }

      ctx.restore()
    } catch {
      // Silently handle chart rendering errors
    } finally {
      ;(chart as any)._segmentOrientations = segmentColors
      chartInstance.value = chart
    }
  },
}

const overlayLabelsPlugin: Plugin<'line'> = {
  id: 'overlayLabels',
  afterDraw: (chart) => {
    try {
      const { ctx, chartArea } = chart
      const xScale = chart.scales?.x
      const yScale = chart.scales?.y

      if (!ctx || !chartArea || !xScale || !yScale) return

      const pluginOptions = (
        (chart.options.plugins ?? {}) as Record<string, unknown>
      ).overlayLabels as
        | {
            fontFamily?: string
            fontSize?: number
            xLabelColor?: string
            yLabelColor?: string
            xLabelOffset?: number
            yLabelOffset?: number
            drawYAxisLine?: boolean
            drawXAxisOverlay?: boolean
            xOverlayBackgroundColor?: string
            xOverlayTextColor?: string
            xOverlayBorderColor?: string
            xOverlayBorderWidth?: number
            xOverlayPaddingX?: number
            xOverlayPaddingY?: number
            xOverlayCornerRadius?: number
            xOverlayOffsetY?: number
            axisLineColor?: string
            axisLineWidth?: number
            maxXLabels?: number
            xLabelRotation?: number
          }
        | undefined

      const fontFamily =
        pluginOptions?.fontFamily ?? `${brand.font.family}, system-ui, sans-serif`
      const fontSize = pluginOptions?.fontSize ?? 11
      const xLabelColor =
        pluginOptions?.xLabelColor ?? 'rgba(127, 140, 175, 0.85)'
      const yLabelColor =
        pluginOptions?.yLabelColor ?? 'rgba(127, 140, 175, 0.8)'
      const xLabelOffset = pluginOptions?.xLabelOffset ?? 24
      const yLabelOffset = pluginOptions?.yLabelOffset ?? 0
      const axisLineColor =
        pluginOptions?.axisLineColor ?? 'rgba(127, 140, 175, 0.2)'
      const axisLineWidth = pluginOptions?.axisLineWidth ?? 1
      const drawYAxisLine = pluginOptions?.drawYAxisLine ?? true
      const drawXAxisOverlay = pluginOptions?.drawXAxisOverlay ?? true
      const xOverlayTextColor =
        pluginOptions?.xOverlayTextColor ?? 'rgba(226, 232, 240, 0.92)'
      const xOverlayBorderWidth = pluginOptions?.xOverlayBorderWidth ?? 0
      const xOverlayPaddingX = pluginOptions?.xOverlayPaddingX ?? 10
      const xOverlayPaddingY = pluginOptions?.xOverlayPaddingY ?? 4
      const xOverlayCornerRadius = pluginOptions?.xOverlayCornerRadius ?? 10
      const xOverlayOffsetY = pluginOptions?.xOverlayOffsetY ?? 16
      const maxXLabels = pluginOptions?.maxXLabels ?? 6
      const xLabelRotation = pluginOptions?.xLabelRotation ?? -32
      const rotationRadians = (xLabelRotation * Math.PI) / 180

      ctx.save()
      ctx.font = `${fontSize}px ${fontFamily}`
      ctx.textBaseline = 'middle'

      if (drawYAxisLine) {
        ctx.beginPath()
        ctx.lineWidth = axisLineWidth
        ctx.strokeStyle = axisLineColor
        ctx.moveTo(chartArea.left, chartArea.top)
        ctx.lineTo(chartArea.left, chartArea.bottom)
        ctx.stroke()
        ctx.closePath()
      }

      ctx.fillStyle = xLabelColor
      ctx.textAlign = 'center'
      ctx.textBaseline = rotationRadians < 0 ? 'bottom' : 'top'

      const labelsArray = Array.isArray(chart.data.labels)
        ? chart.data.labels
        : []
      const totalLabels = labelsArray.length
      const step =
        totalLabels > 0 && maxXLabels > 0
          ? Math.max(1, Math.ceil(totalLabels / maxXLabels))
          : 1

      const xTicks = xScale?.ticks ?? []

      xTicks.forEach((tick: any, tickIndex: number) => {
        if (tickIndex === 0 || tickIndex === xTicks.length - 1) return

        const rawValue = typeof tick.value === 'number' ? tick.value : tickIndex
        const dataIndex = Number.isFinite(rawValue)
          ? Math.round(rawValue)
          : tickIndex

        if (totalLabels > 0) {
          const isEdge = dataIndex === 0 || dataIndex === totalLabels - 1
          if (!isEdge && dataIndex % step !== 0) {
            return
          }
        }

        const rawLabel =
          typeof tick.label === 'string'
            ? tick.label
            : (labelsArray[dataIndex] ?? labelsArray[tickIndex] ?? '')

        const formattedLabel = formatXAxisLabel(String(rawLabel))
        if (!formattedLabel) return

        const pixelGetter =
          typeof xScale.getPixelForTick === 'function'
            ? xScale.getPixelForTick.bind(xScale, tickIndex)
            : xScale.getPixelForValue.bind(xScale, rawValue)

        const x = pixelGetter()
        if (typeof x !== 'number' || Number.isNaN(x)) return

        if (!drawXAxisOverlay) {
          const y = chartArea.bottom + xLabelOffset

          ctx.save()
          ctx.fillStyle = xLabelColor
          ctx.textAlign = 'center'
          ctx.textBaseline = rotationRadians < 0 ? 'bottom' : 'top'
          ctx.translate(x, y)
          if (rotationRadians !== 0) ctx.rotate(rotationRadians)
          ctx.fillText(formattedLabel, 0, 0)
          ctx.restore()
          return
        }

        const targetY = chartArea.bottom - xOverlayOffsetY

        ctx.save()
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const textMetrics = ctx.measureText(formattedLabel)
        const textWidth = textMetrics.width
        const textHeight =
          fontSize + (textMetrics.actualBoundingBoxDescent ?? 0)

        const minLeft = chartArea.left + 4
        const maxRight = chartArea.right - 4
        const halfBoxWidth = Math.max(0, textWidth / 2 + xOverlayPaddingX)
        const boxHeight = textHeight + xOverlayPaddingY * 2

        let centerX = x
        let boxLeft = centerX - halfBoxWidth
        let boxRight = centerX + halfBoxWidth

        if (boxLeft < minLeft) {
          const delta = minLeft - boxLeft
          centerX += delta
          boxLeft += delta
          boxRight += delta
        } else if (boxRight > maxRight) {
          const delta = boxRight - maxRight
          centerX -= delta
          boxLeft -= delta
          boxRight -= delta
        }

        const boxTop = targetY - boxHeight / 2
        const boxBottom = targetY + boxHeight / 2
        const radius = Math.max(
          0,
          Math.min(xOverlayCornerRadius, boxHeight / 2)
        )

        ctx.fillStyle = xOverlayTextColor
        ctx.translate(centerX, targetY)
        if (rotationRadians !== 0) ctx.rotate(rotationRadians)
        ctx.fillText(formattedLabel, 0, 0)
        ctx.restore()
      })

      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      if (!isHovering.value) {
        ctx.fillStyle = yLabelColor

        const yTicks = yScale?.ticks ?? []

        yTicks.forEach((tick: any, tickIndex: number) => {
          if (tickIndex === 0 || tickIndex === yTicks.length - 1) return
          if (typeof tick.value !== 'number') return

          const y = yScale.getPixelForValue(tick.value) + yLabelOffset
          const label = formatAxisCurrency(tick.value)
          ctx.fillText(label, chartArea.left + 6, y)
        })
      }

      ctx.restore()
    } catch {
      // Silently handle chart rendering errors
    }
  },
}

/* ========== Registro do Chart.js ========== */
if (!(ChartCore as any)._adapters?._customRegisteredOnce) {
  ChartCore.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Filler
  )
  ;(ChartCore as any)._adapters = { _customRegisteredOnce: true }
}

/* ========== Chart data/options ========== */
const chartData = computed(() => {
  const hasRealData = isDataValid.value
  const dataToUse =
    props.loading && !hasRealData ? loadingData.value : props.data

  return {
    labels: dataToUse.map((d) => d.date),
    datasets: [
      {
        data: dataToUse.map((d) => d.value),
        label: props.legend[0]?.label || 'Preço',
        segment: {
          borderColor: (ctx: any) => dynamicLineColor(ctx.p1DataIndex, true),
        },
        backgroundColor: () => 'rgba(34, 197, 94, 0.06)',
        borderWidth: 2.5,
        fill: false,
        clip: false,
        borderColor: (ctx: any) =>
          dynamicLineColor(ctx.p1DataIndex ?? ctx.p0DataIndex ?? 0, true),
        pointHitRadius: props.loading ? 0 : 10,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointBackgroundColor: 'transparent',
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        pointHoverBorderColor: 'transparent',
        tension: props.loading ? 0.5 : 0.25,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const extents = yAxisExtents.value
  const yLimits =
    extents && Number.isFinite(extents.min) && Number.isFinite(extents.max)
      ? {
          min: extents.min,
          max: extents.max,
        }
      : {}

  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    interaction: { intersect: false, mode: 'index' as const },
    scales: {
      x: {
        offset: false,
        bounds: 'data',
        display: false,
        border: { display: false },
        grid: {
          display: false,
          color: cc.gridColor,
          drawBorder: false,
          drawTicks: false,
          lineWidth: 0.4,
          tickLength: 0,
          tickWidth: 0,
        },
        ticks: {
          display: false,
          autoSkip: true,
          autoSkipPadding: 8,
          maxRotation: 45,
          minRotation: 0,
          font: { size: 11, family: `${brand.font.family}, system-ui, sans-serif` },
          maxTicksLimit: 6,
          padding: 20,
        },
      },
      y: {
        display: true,
        reverse: false,
        border: { display: false },
        grid: {
          display: false,
          color: cc.tickColorMuted,
          drawBorder: false,
          drawTicks: false,
          lineWidth: 0.4,
          tickLength: 0,
          tickWidth: 0,
        },
        ticks: {
          display: false,
          maxTicksLimit: 5,
          font: { size: 11, family: `${brand.font.family}, system-ui, sans-serif` },
          callback: (v: string | number) =>
            `${props.currency} ${Number(v).toLocaleString(props.locale, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`,
        },
        ...yLimits,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      colors: { forceOverride: true },
      overlayLabels: {
        fontFamily: `${brand.font.family}, system-ui, sans-serif`,
        fontSize: 13,
        xLabelColor: cc.labelColor,
        yLabelColor: cc.labelColor,
        xOverlayTextColor: cc.labelColor,
        xLabelOffset: 5,
        yLabelOffset: 0,
        drawYAxisLine: false,
        maxXLabels: 6,
        xLabelRotation: 0,
      },
    },
  }
})

/* ========== Plugin: update marker overlay positions on draw ========== */
const markersPlugin: Plugin<'line'> = {
  id: 'markers-positions-plugin',
  afterDraw: (chart) => {
    try {
      const markerMap = markerIndexMap.value
      if (!markerMap || markerMap.size === 0) {
        if (markerPositions.value.length !== 0) {
          markerPositions.value = []
        }
        return
      }

      const { scales } = chart
      if (!scales?.x || !scales?.y) return

      const xScale = scales.x
      const yScale = scales.y
      const dataSource = isDataValid.value ? props.data : []

      const next: MarkerPosition[] = []
      for (const [idx, items] of markerMap.entries()) {
        const point = dataSource[idx]
        if (!point || typeof point.value !== 'number') continue

        const x = xScale.getPixelForValue(idx)
        const y = yScale.getPixelForValue(point.value)

        if (
          typeof x !== 'number' ||
          typeof y !== 'number' ||
          Number.isNaN(x) ||
          Number.isNaN(y)
        ) {
          continue
        }

        next.push({ idx, x, y, items })
      }

      // Only update if meaningful change to avoid reactivity loops
      const prev = markerPositions.value
      if (prev.length !== next.length) {
        markerPositions.value = next
        return
      }
      for (let i = 0; i < next.length; i++) {
        if (
          Math.abs(prev[i].x - next[i].x) > 0.5 ||
          Math.abs(prev[i].y - next[i].y) > 0.5 ||
          prev[i].idx !== next[i].idx
        ) {
          markerPositions.value = next
          return
        }
      }
    } catch {
      // Silent
    }
  },
}

const localPlugins = [
  closingDeltaFillPlugin,
  hoverLinePlugin,
  overlayLabelsPlugin,
  markersPlugin,
]

/* ========== Lifecycle ========== */
onMounted(async () => {
  await nextTick()
  const chart = chartRef.value?.chart

  if (!chart) return

  chartInstance.value = chart
  removeCanvasEvents = setupCanvasEvents(chart)

  if (props.loading && !isDataValid.value) {
    loadingData.value = generateLoadingData()
    animateLoadingData()
  }

  // Listen globally to close popover when clicking outside
  document.addEventListener('click', onGlobalClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onGlobalClick)
})

watch(
  () => props.loading,
  (newLoading) => {
    if (newLoading) {
      if (!isDataValid.value) {
        loadingData.value = generateLoadingData()
        animateLoadingData()
      }
      isDragging.value = false
      isHovering.value = false
      hoverState.index = null
    } else {
      stopLoadingAnimation()
    }
  }
)

watch(
  () => props.data,
  (newData) => {
    if (Array.isArray(newData) && newData.length > 0 && props.loading) {
      stopLoadingAnimation()
    }
  },
  { deep: false }
)

onUnmounted(() => {
  removeCanvasEvents?.()
  stopLoadingAnimation()
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
})

const onRootMouseLeave = (): void => {
  isHovering.value = false
}
</script>

<style scoped>
.graph:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

/* ============================================================
   CHART TOOLTIP (hover / drag)
   ============================================================ */

.chart-tooltip-card {
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.45),
    0 2px 6px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.03);
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition:
    opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-2px) scale(0.98);
}

/* ============================================================
   MARKER PINS (HTML overlay above chart)
   ============================================================ */

.marker-pin {
  transform: translate(-50%, 0);
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  animation: marker-drop 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.marker-pin:hover,
.marker-pin.is-active {
  transform: translate(-50%, -4px);
}

.marker-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  border: 2px solid #fff;
  transition: box-shadow 0.2s ease;
}

.marker-pin::after {
  content: '';
  display: block;
  position: absolute;
  left: 50%;
  bottom: -5px;
  width: 2px;
  height: 8px;
  background-color: inherit;
  transform: translateX(-50%);
  opacity: 0;
}

.marker-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 9999px;
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fff;
  line-height: 1;
}

@keyframes marker-drop {
  from {
    opacity: 0;
    transform: translate(-50%, -8px) scale(0.6);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

/* ============================================================
   MARKER POPOVER
   ============================================================ */

.marker-popover {
  pointer-events: auto;
  animation: popover-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.marker-popover-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid;
  border-top-color: inherit;
}

@keyframes popover-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes tooltipSlide {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
