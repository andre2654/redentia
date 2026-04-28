<!--
  AtomsSegmented — controle segmented oficial da identidade quiet.

  USE este componente sempre que precisar de um toggle/tab de 2-5 opcoes
  inline. Nao reescreva inline. Padrao definido em design/IDENTITY.md
  secao 3.3.

  - Active: bg amber primary, color #1A0A2E (contraste >= 7:1 em qualquer tenant)
  - Inactive: bg transparent, color var(--text-body), hover bg-overlay
  - Container: rounded-md border-default bg-input p-0.5
  - Inner: rounded-[4px] px-3 py-1.5
  - Focus: var(--shadow-ring-focus)
  - Sem mono-tab, sem uppercase, sem letter-spacing wide

  v-model recebe o `value` selecionado.

  Exemplo:
    <AtomsSegmented
      v-model="period"
      :options="[
        { value: 'm', label: 'Mes' },
        { value: 'y', label: 'Ano' },
        { value: '3y', label: '3 anos' },
        { value: 'all', label: 'Tudo' },
      ]"
      aria-label="Periodo do grafico"
    />

  Com icone (Lucide):
    <AtomsSegmented
      v-model="view"
      :options="[
        { value: 'list', label: 'List', icon: 'i-lucide-list' },
        { value: 'map', label: 'Map', icon: 'i-lucide-grid-2x2' },
      ]"
      aria-label="Visualizacao"
    />
-->
<template>
  <div
    v-if="options.length"
    class="inline-flex items-center gap-0.5 rounded-md border p-0.5 font-medium"
    :class="[size === 'sm' ? 'text-[11px]' : 'text-[12px]']"
    style="border-color: var(--border-default); background-color: var(--bg-input);"
    role="group"
    :aria-label="ariaLabel"
  >
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[4px] transition-all duration-150 focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring-focus)] disabled:cursor-not-allowed disabled:opacity-50"
      :class="[size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5']"
      :style="modelValue === option.value
        ? { backgroundColor: 'var(--brand-primary)', color: '#1A0A2E' }
        : { backgroundColor: 'transparent', color: 'var(--text-body)' }"
      :disabled="disabled"
      :aria-pressed="modelValue === option.value"
      :aria-label="option.ariaLabel ?? option.label"
      @click="modelValue = option.value"
      @mouseenter="handleHover($event, true, option.value)"
      @mouseleave="handleHover($event, false, option.value)"
    >
      <UIcon
        v-if="option.icon"
        :name="option.icon"
        class="shrink-0"
        :class="[size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5']"
        aria-hidden="true"
      />
      <span v-if="option.label" :class="hideLabelOnMobile ? 'max-sm:hidden' : ''">{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
type Option = {
  value: T
  label?: string
  icon?: string
  ariaLabel?: string
}

withDefaults(
  defineProps<{
    options: Option[]
    size?: 'sm' | 'md'
    disabled?: boolean
    ariaLabel?: string
    /** Esconde o label em viewports < sm, mantendo so o icon. Util pra header tight. */
    hideLabelOnMobile?: boolean
  }>(),
  {
    size: 'md',
    disabled: false,
    ariaLabel: undefined,
    hideLabelOnMobile: false,
  }
)

const modelValue = defineModel<T>({ required: true })

// Hover em inactive: bg-overlay. Active mantem amber, ignora hover.
function handleHover(e: MouseEvent, hovering: boolean, optionValue: T) {
  if (modelValue.value === optionValue) return
  const el = e.currentTarget as HTMLElement
  el.style.backgroundColor = hovering ? 'var(--bg-overlay)' : 'transparent'
}
</script>
