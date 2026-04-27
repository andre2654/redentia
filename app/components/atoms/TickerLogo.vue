<script setup lang="ts">
/**
 * TickerLogo — single source of truth for rendering an asset logo.
 *
 *   <TickerLogo :ticker="PETR4" :logo="snapshot?.logo" :size="20" />
 *
 * Behaviour:
 *   1. If `logo` is null/empty OR has been marked as failed earlier
 *      this session (via useFailedLogos), render the initials fallback.
 *   2. Otherwise render an <img>. On `@error`, mark the URL as failed
 *      globally — every other TickerLogo on the page that points at
 *      the same URL re-renders to initials.
 *
 * Visuals:
 *   - Circular crop, 1px inner ring (matches TickerChip / decision card)
 *   - Initials use the ticker's first 2 chars in a mono-tab font
 *   - Brand-aware colors via useBrand
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    ticker: string
    logo?: string | null
    /** Pixel size of the rendered circle. */
    size?: number
    /** Override initials when ticker isn't a clean source (e.g. crypto). */
    initials?: string
  }>(),
  { size: 20, logo: null, initials: '' },
)

const brand = useBrand()
const failed = useFailedLogos()

const showImg = computed(
  () => !!props.logo && !failed.isFailed(props.logo),
)

const initialsText = computed(() => {
  if (props.initials) return props.initials.slice(0, 2).toUpperCase()
  return props.ticker.slice(0, 2).toUpperCase()
})

const wrapStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  backgroundColor: `color-mix(in srgb, ${brand.colors.text} 8%, transparent)`,
  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.text} 8%, transparent)`,
}))

const initialsStyle = computed(() => ({
  color: brand.colors.textMuted,
  // Scale font with the wrapper so 16px wraps look readable.
  fontSize: `${Math.max(8, Math.round(props.size * 0.45))}px`,
}))

function onError(): void {
  failed.markFailed(props.logo)
}
</script>

<template>
  <span
    class="ticker-logo inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full align-middle"
    :style="wrapStyle"
    aria-hidden="true"
  >
    <img
      v-if="showImg"
      :src="logo!"
      :width="size"
      :height="size"
      loading="lazy"
      class="size-full object-cover"
      alt=""
      @error="onError"
    />
    <span
      v-else
      class="font-mono-tab font-bold tracking-tight leading-none"
      :style="initialsStyle"
    >{{ initialsText }}</span>
  </span>
</template>
