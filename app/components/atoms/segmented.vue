<!--
  AtomsSegmented — controle segmented oficial da identidade quiet.

  USE este componente sempre que precisar de um toggle/tab de 2-5 opcoes
  inline. Nao reescreva inline. Padrao definido em design/IDENTITY.md
  secao 3.3.

  - Active: bg amber primary, color #fff (texto branco na pill amber)
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
    :role="as === 'tabs' ? 'tablist' : 'group'"
    :aria-label="ariaLabel"
  >
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[4px] transition-all duration-150 focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring-focus)] disabled:cursor-not-allowed disabled:opacity-50"
      :class="[size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5']"
      :style="modelValue === option.value
        ? { backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-primary)' }
        : { backgroundColor: 'transparent', color: 'var(--text-body)' }"
      :disabled="disabled"
      :role="as === 'tabs' ? 'tab' : undefined"
      :aria-pressed="as === 'tabs' ? undefined : modelValue === option.value"
      :aria-selected="as === 'tabs' ? modelValue === option.value : undefined"
      :tabindex="as === 'tabs' && modelValue !== option.value ? -1 : undefined"
      :aria-label="option.ariaLabel ?? option.label"
      @click="modelValue = option.value"
      @keydown="onKeydown($event, option.value)"
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

const props = withDefaults(
  defineProps<{
    options: Option[]
    size?: 'sm' | 'md'
    disabled?: boolean
    ariaLabel?: string
    /** Esconde o label em viewports < sm, mantendo so o icon. Util pra header tight. */
    hideLabelOnMobile?: boolean
    /**
     * Modo de acessibilidade:
     *   - 'group' (default): role="group" + aria-pressed nos buttons.
     *     Pra toggles que sao filtros (ex: "Todos / Day / Swing").
     *   - 'tabs': role="tablist" + role="tab" + aria-selected + arrow
     *     keyboard nav. Pra toggles que mudam o conteudo principal
     *     da pagina (ex: Carteira / Day Trade).
     */
    as?: 'group' | 'tabs'
  }>(),
  {
    size: 'md',
    disabled: false,
    ariaLabel: undefined,
    hideLabelOnMobile: false,
    as: 'group',
  }
)

const modelValue = defineModel<T>({ required: true })

// Hover em inactive: bg-overlay. Active mantem amber, ignora hover.
function handleHover(e: MouseEvent, hovering: boolean, optionValue: T) {
  if (modelValue.value === optionValue) return
  const el = e.currentTarget as HTMLElement
  el.style.backgroundColor = hovering ? 'var(--bg-overlay)' : 'transparent'
}

// Em modo `tabs`, ArrowLeft/Right e Home/End movem entre opcoes —
// padrao WAI-ARIA tabs. No modo `group` deixamos o browser handler
// default (TAB normal entre os botoes).
function onKeydown(e: KeyboardEvent, _val: T) {
  if (props.as !== 'tabs') return
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (!keys.includes(e.key)) return
  e.preventDefault()
  const idx = props.options.findIndex((o) => o.value === modelValue.value)
  if (idx < 0) return
  let next = idx
  if (e.key === 'ArrowLeft') next = idx - 1
  else if (e.key === 'ArrowRight') next = idx + 1
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = props.options.length - 1
  if (next < 0) next = props.options.length - 1
  if (next >= props.options.length) next = 0
  modelValue.value = props.options[next].value
  // Foca o novo tab (igual padrao WAI tabs)
  const target = e.currentTarget as HTMLElement
  const parent = target.parentElement
  const buttons = parent?.querySelectorAll('button')
  buttons?.[next]?.focus()
}
</script>
