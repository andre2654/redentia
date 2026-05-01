<!--
  ReportProblemTrigger — drop-in button that opens the
  ReportProblemModal. Owns its own modal state so embedding the
  feature anywhere is literally `<AtomsReportProblemTrigger />`.

  Two variants:

    - `link`: bare inline text. Inherits parent font + color. For
      flowing copy where the trigger shouldn't read as a button.

    - `chip` (default): bordered pill with bug icon. Reads clearly
      as a button. Two sizes via the `size` prop:
        * `md` (default): footer-sized, ~32 px tall.
        * `sm`: compact, ~24 px tall. For tight chrome (chat sidebar
          footer, etc).
      Plus an `iconOnly` boolean: collapses the chip to a square,
      hides the label visually (kept on aria-label for SR users).
      Used in the chat sidebar where the rail sits beside another
      button and horizontal real estate is scarce.

  Icon is `i-lucide-bug` because the feature is fundamentally
  defect-reporting; bug is more accurate semantically than a
  generic life-buoy.
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
      v-else
      type="button"
      class="report-trigger-chip"
      :class="[$attrs.class, size === 'sm' ? 'is-sm' : 'is-md', iconOnly ? 'is-icon-only' : '']"
      :aria-label="iconOnly ? labelText : undefined"
      :title="iconOnly ? labelText : undefined"
      @click="open = true"
    >
      <UIcon name="i-lucide-bug" class="report-trigger-chip__icon" />
      <span class="report-trigger-chip__label"><slot>Reportar problema</slot></span>
    </button>

    <MoleculesReportProblemModal v-model:open="open" />
  </span>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    /**
     * Visual variant.
     *   - `link`: bare inline text. Inherits color from parent. Use
     *     when the trigger sits in flowing copy and shouldn't read as
     *     a button (e.g. an info paragraph that ends with "...you can
     *     report a problem").
     *   - `chip` (default): bordered pill, bug icon, button-shaped.
     *     The right choice for sticky placements like the footer or
     *     sidebar.
     */
    variant?: 'link' | 'chip'
    /**
     * Chip size:
     *   - `md` (default): footer-sized, ~32 px tall, 12 px font.
     *   - `sm`: compact, ~24 px tall, 10.5 px font. For tight spaces
     *     (chat sidebar footer, settings drawer, etc.).
     * Ignored when `variant === 'link'`.
     */
    size?: 'sm' | 'md'
    /**
     * Icon-only chip. Hides the visible label (kept on aria-label +
     * title for SR / hover users) and squishes the chip into a square.
     * Useful when the trigger sits beside another button and there's
     * no room for two textual labels (e.g. chat sidebar footer next
     * to "Ver auditoria").
     */
    iconOnly?: boolean
  }>(),
  { variant: 'chip', size: 'md', iconOnly: false },
)

const labelText = 'Reportar problema'
const open = ref(false)
</script>

<style scoped>
/* ============================================================
   `link` variant: inline text. Inherits font + color from the
   parent so it slots into prose without surprising the eye.
   ============================================================ */
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

/* ============================================================
   `chip` variant: pill with bug icon. Reads as a button at rest
   (subtle background tint + 1 px border) and lights up on hover
   to brand primary. Two sizes: `is-md` for the footer, `is-sm`
   for tight chrome like the chat sidebar footer.
   ============================================================ */
.report-trigger-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background-color: color-mix(in srgb, var(--brand-text-muted, currentColor) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border, currentColor) 55%, transparent);
  color: var(--brand-text-muted, currentColor);
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 100ms ease;
}

.report-trigger-chip.is-md {
  gap: 6px;
  padding: 7px 14px;
  font-size: 12px;
  letter-spacing: 0.01em;
}
.report-trigger-chip.is-md .report-trigger-chip__icon {
  width: 14px;
  height: 14px;
}

.report-trigger-chip.is-sm {
  gap: 5px;
  padding: 4px 10px;
  font-size: 10.5px;
  letter-spacing: 0.02em;
}
.report-trigger-chip.is-sm .report-trigger-chip__icon {
  width: 12px;
  height: 12px;
}

/* Icon-only modifier: collapses the chip to a square, hides the
   label visually (aria-label + title carry the meaning). Square
   side equals the chip's intrinsic height in each size, so the
   shape stays balanced beside other small controls. */
.report-trigger-chip.is-icon-only {
  padding: 0;
  gap: 0;
  justify-content: center;
}
.report-trigger-chip.is-icon-only.is-md {
  width: 32px;
  height: 32px;
}
.report-trigger-chip.is-icon-only.is-sm {
  width: 24px;
  height: 24px;
}
.report-trigger-chip.is-icon-only .report-trigger-chip__label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.report-trigger-chip:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  color: var(--brand-primary);
}

.report-trigger-chip:active {
  transform: translateY(1px);
}

.report-trigger-chip:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
</style>
