<template>
  <div class="colors-form">
    <p class="colors-form__hint">
      <UIcon name="i-lucide-info" class="size-3.5" />
      Cores base. <code>themes.light/dark</code> permitem overrides por modo (configurar abaixo em "Theme").
    </p>

    <div class="colors-form__grid">
      <ColorField
        v-for="def in COLOR_DEFS"
        :key="def.key"
        :label="def.label"
        :hint="def.hint"
        :model-value="colorAt(def.key)"
        @update:model-value="onChange(def.key, $event)"
      />
    </div>

    <details class="colors-form__advanced">
      <summary>Gradient (3 stops)</summary>
      <div class="colors-form__gradient">
        <ColorField label="From" :model-value="colorAt('gradient.from')" @update:model-value="onChange('gradient.from', $event)" />
        <ColorField label="Via" :model-value="colorAt('gradient.via')" @update:model-value="onChange('gradient.via', $event)" />
        <ColorField label="To" :model-value="colorAt('gradient.to')" @update:model-value="onChange('gradient.to', $event)" />
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** Subtree do parsedConfig.colors. Pode estar undefined (tenant novo). */
  colors: Record<string, any> | undefined
  /**
   * Optional namespace pra escrever no theme override em vez de colors base.
   * Ex: 'themes.light' grava em themes.light.X em vez de colors.X.
   */
  namespace?: string
}>()

const emit = defineEmits<{
  (e: 'change', path: string, value: any): void
}>()

// Subset das cores que admins editam. Resto fica no JSON cru.
const COLOR_DEFS = [
  { key: 'primary',      label: 'Primary',      hint: 'CTA, accent, links' },
  { key: 'secondary',    label: 'Secondary',    hint: 'Hover/emphasis' },
  { key: 'tertiary',     label: 'Tertiary',     hint: 'Charcoal/elevated' },
  { key: 'positive',     label: 'Positive',     hint: 'Lucros, gains' },
  { key: 'negative',     label: 'Negative',     hint: 'Perdas, errors' },
  { key: 'neutral',      label: 'Neutral',      hint: 'Muted/inactive' },
  { key: 'background',   label: 'Background',   hint: 'Page bg' },
  { key: 'surface',      label: 'Surface',      hint: 'Cards' },
  { key: 'surfaceHover', label: 'Surface hover', hint: 'Card hover' },
  { key: 'border',       label: 'Border',       hint: 'Subtle dividers' },
  { key: 'text',         label: 'Text',         hint: 'Headings' },
  { key: 'textMuted',    label: 'Text muted',   hint: 'Body/secondary' },
  { key: 'inputBg',      label: 'Input bg' },
  { key: 'inputBgHover', label: 'Input bg hover' },
  { key: 'inputBorder',  label: 'Input border' },
] as const

function colorAt(key: string): string {
  // Suporta nested gradient.from etc
  const parts = key.split('.')
  let cur: any = props.colors
  for (const p of parts) cur = cur?.[p]
  return typeof cur === 'string' ? cur : ''
}

function onChange(key: string, value: string) {
  const path = props.namespace ? `${props.namespace}.${key}` : `colors.${key}`
  emit('change', path, value)
}
</script>

<style scoped>
.colors-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.colors-form__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.colors-form__hint code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  padding: 1px 5px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.colors-form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.colors-form__advanced {
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  padding-top: 12px;
}
.colors-form__advanced summary {
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-text);
  user-select: none;
}
.colors-form__gradient {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 10px;
}
</style>
