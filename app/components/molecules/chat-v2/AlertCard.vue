<!--
  Inline alert card — rendered after an assistant message when the
  agent posts an `alert.fired` event during a turn.

  Restraint:
  - One row, one severity tone (left edge bar — not a tinted box).
  - Two actions: "Ver" (opens watchlist drawer for the ticker) and
    "Dispensar" (dismisses).
-->
<template>
  <article
    class="alert-card relative flex items-stretch gap-3 rounded-lg pl-3 pr-3 py-2.5"
    :style="cardStyle"
    role="status"
    aria-live="polite"
  >
    <!-- Severity bar (left edge) -->
    <span
      class="absolute inset-y-2 left-0 w-[3px] rounded-r-full"
      :style="{ backgroundColor: severityColor }"
      aria-hidden="true"
    />
    <UIcon
      :name="iconName"
      class="mt-0.5 size-4 shrink-0"
      :style="{ color: severityColor }"
      aria-hidden="true"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <header class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          v-if="alert.ticker"
          class="font-mono-tab text-[10.5px] font-bold uppercase tracking-[0.14em]"
          :style="{ color: brand.colors.text }"
        >{{ alert.ticker }}</span>
        <span
          class="text-[13px] font-medium"
          :style="{ color: brand.colors.text }"
        >{{ alert.title }}</span>
      </header>
      <p
        class="text-[12.5px] leading-snug"
        :style="{ color: `color-mix(in srgb, ${brand.colors.text} 80%, transparent)` }"
      >
        {{ alert.body }}
      </p>
      <footer class="mt-1 flex items-center gap-3">
        <button
          v-if="alert.ticker"
          type="button"
          class="alert-action text-[11px] transition-colors"
          :style="{ color: brand.colors.primary }"
          @click="$emit('select', alert)"
        >
          Ver detalhes
        </button>
        <button
          type="button"
          class="alert-action text-[11px] transition-colors"
          :style="{ color: brand.colors.textMuted }"
          @click="$emit('dismiss', alert.id)"
        >
          Dispensar
        </button>
      </footer>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatAlert } from '~/composables/useAlerts'

const props = defineProps<{
  alert: ChatAlert
}>()

defineEmits<{
  select: [alert: ChatAlert]
  dismiss: [id: string]
}>()

const brand = useBrand()

const severityColor = computed(() => {
  if (props.alert.severity === 'critical') return brand.colors.negative
  if (props.alert.severity === 'warning') return brand.colors.primary
  return brand.colors.textMuted
})

const iconName = computed(() => {
  if (props.alert.severity === 'critical') return 'i-lucide-alert-triangle'
  if (props.alert.severity === 'warning') return 'i-lucide-alert-circle'
  return 'i-lucide-info'
})

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))
</script>

<style scoped>
.alert-action {
  touch-action: manipulation;
}
.alert-action:hover {
  filter: brightness(1.1);
}
.alert-action:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 4px;
}
</style>
