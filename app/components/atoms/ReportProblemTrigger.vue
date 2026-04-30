<!--
  ReportProblemTrigger — drop-in button that opens the
  ReportProblemModal. Owns its own modal state so embedding the
  feature anywhere is literally `<AtomsReportProblemTrigger />`.

  Three variants tuned for the three placements we ship today:

    - `link` (default): plain underlined-on-hover text. For footer
      and any inline copy. Inherits color from the parent.

    - `subtle-row`: full-width sidebar-style row with a small icon
      + label. Used inside the chat takeover sidebar drawer where
      the rest of the items follow the same shape (Painel, Goals,
      etc.). No border, low contrast on rest, primary tint on hover.

    - `chip`: bordered pill. Reserved for callouts (empty states,
      error toasts). Not wired anywhere yet but kept for future.
-->
<template>
  <span class="contents">
    <button
      v-if="variant === 'link'"
      type="button"
      class="report-trigger-link"
      :class="$attrs.class"
      @click="open = true"
    >
      <slot>Reportar problema</slot>
    </button>

    <button
      v-else-if="variant === 'subtle-row'"
      type="button"
      class="report-trigger-row"
      :class="$attrs.class"
      :style="{ color: brand.colors.textMuted }"
      @click="open = true"
    >
      <UIcon
        name="i-lucide-life-buoy"
        class="size-3.5 shrink-0"
        :style="{ color: 'inherit' }"
      />
      <span class="truncate"><slot>Reportar problema</slot></span>
    </button>

    <button
      v-else
      type="button"
      class="report-trigger-chip"
      :class="$attrs.class"
      :style="{
        borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
        color: brand.colors.text,
      }"
      @click="open = true"
    >
      <UIcon name="i-lucide-life-buoy" class="size-3.5" />
      <slot>Reportar problema</slot>
    </button>

    <MoleculesReportProblemModal v-model:open="open" />
  </span>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    /** Visual variant. See file header for what each one is for. */
    variant?: 'link' | 'subtle-row' | 'chip'
  }>(),
  { variant: 'link' },
)

const brand = useBrand()
const open = ref(false)
</script>

<style scoped>
.report-trigger-link {
  background: transparent;
  border: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-underline-offset: 3px;
  transition: opacity 150ms;
}
.report-trigger-link:hover {
  text-decoration: underline;
  opacity: 0.85;
}
.report-trigger-link:focus-visible {
  outline: 2px solid var(--brand-primary, currentColor);
  outline-offset: 3px;
  border-radius: 2px;
}

.report-trigger-row {
  display: inline-flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 0;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 140ms, color 140ms;
}
.report-trigger-row:hover {
  background-color: color-mix(in srgb, var(--brand-text, currentColor) 5%, transparent);
  color: var(--brand-text, currentColor);
}
.report-trigger-row:focus-visible {
  outline: 2px solid var(--brand-primary, currentColor);
  outline-offset: 1px;
}

.report-trigger-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid currentColor;
  border-radius: 9999px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 140ms, transform 140ms;
}
.report-trigger-chip:hover {
  opacity: 0.85;
}
.report-trigger-chip:active {
  transform: translateY(1px);
}
</style>
