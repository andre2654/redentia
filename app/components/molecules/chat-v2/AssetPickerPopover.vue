<!--
  AssetPickerPopover — searchable asset list shown above the
  composer pill.

  Two trigger paths:
    1. Click the asset-picker button next to the attach paperclip
       in `Input.vue`. Opens with empty query; user types to
       filter.
    2. User types `@` followed by characters in the textarea.
       Input.vue catches the trigger via keydown + caret-context
       parsing and opens this popover with that prefix as the
       initial query.

  Selecting an item emits `select` with the AssetSearchItem; the
  parent decides what to insert (typically `${ticker}` plus a
  trailing space) and closes the popover.

  Visual: vertically scrollable list of rows, each with TickerLogo +
  ticker + name + kind chip. Brand-aware colors via CSS vars so
  white-label tenants get the right tint with no extra wiring.
-->
<template>
  <Transition name="asset-picker">
    <div
      v-if="open"
      class="asset-picker"
      role="dialog"
      aria-label="Buscar ativo"
      @keydown.escape.stop="onClose"
      @keydown.down.prevent="moveSelection(1)"
      @keydown.up.prevent="moveSelection(-1)"
      @keydown.enter.prevent="confirmSelection"
    >
      <div class="asset-picker__header">
        <UIcon name="i-lucide-search" class="asset-picker__search-icon size-4" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          class="asset-picker__input"
          :placeholder="placeholder"
          autocomplete="off"
          spellcheck="false"
          @input="onInput"
        />
        <button
          v-if="query"
          type="button"
          class="asset-picker__clear"
          aria-label="Limpar busca"
          @click="query = ''"
        >
          <UIcon name="i-lucide-x" class="size-3.5" />
        </button>
      </div>

      <div v-if="loading && !items.length" class="asset-picker__state">
        <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
        Carregando catálogo…
      </div>
      <div v-else-if="!items.length && query" class="asset-picker__state">
        <UIcon name="i-lucide-search-x" class="size-4" />
        Nenhum ativo encontrado para "{{ query }}".
      </div>
      <div v-else-if="!items.length" class="asset-picker__state">
        <UIcon name="i-lucide-info" class="size-4" />
        Digite um ticker ou nome para buscar.
      </div>

      <ul v-else class="asset-picker__list" role="listbox">
        <li
          v-for="(item, i) in items"
          :key="item.id"
          class="asset-picker__row"
          :class="{ 'is-selected': i === selectedIndex }"
          role="option"
          :aria-selected="i === selectedIndex"
          @mouseenter="selectedIndex = i"
          @click="onSelectItem(item)"
        >
          <AtomsTickerLogo
            :ticker="item.ticker"
            :logo="item.logo"
            :size="28"
          />
          <div class="asset-picker__info">
            <span class="asset-picker__ticker">{{ item.ticker }}</span>
            <span class="asset-picker__name">{{ item.name }}</span>
          </div>
          <span class="asset-picker__kind" :data-kind="item.kind">
            {{ kindLabel(item.kind) }}
          </span>
        </li>
      </ul>

      <div class="asset-picker__footer">
        <span class="asset-picker__hint">
          <kbd>↑↓</kbd> navegar
          <kbd>Enter</kbd> selecionar
          <kbd>Esc</kbd> fechar
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useAssetSearch, type AssetKind, type AssetSearchItem } from '~/composables/useAssetSearch'

const props = withDefaults(
  defineProps<{
    open: boolean
    /** Initial query; useful when the picker is opened by an `@`
     *  trigger in the textarea (so the prefix typed after the @
     *  pre-fills the search). */
    initialQuery?: string
    /** Placeholder for the search input. */
    placeholder?: string
  }>(),
  {
    initialQuery: '',
    placeholder: 'Buscar por ticker ou nome…',
  },
)

const emit = defineEmits<{
  /** User picked an asset (click or Enter on highlighted row). */
  select: [item: AssetSearchItem]
  /** User pressed Esc / clicked away / cleared the prefix the
   *  parent was matching against. Parent should call `open = false`. */
  close: []
  /** User edited the search query. Useful when the parent wants
   *  to keep the textarea in sync (e.g. while the `@`-trigger
   *  prefix is being typed). */
  'query-change': [value: string]
}>()

const { ensureLoaded, search, loading } = useAssetSearch()
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const selectedIndex = ref(0)

const items = computed(() => search(query.value, 12))

watch(
  () => props.initialQuery,
  (q) => {
    query.value = q
    selectedIndex.value = 0
  },
  { immediate: true },
)

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    await ensureLoaded()
    // Defer focus so the Transition's enter animation doesn't
    // steal the steady-state caret.
    await nextTick()
    inputRef.value?.focus()
    inputRef.value?.select()
  },
  { immediate: true },
)

watch(query, () => {
  selectedIndex.value = 0
  emit('query-change', query.value)
})

function moveSelection(delta: number): void {
  const total = items.value.length
  if (!total) return
  selectedIndex.value = (selectedIndex.value + delta + total) % total
}

function confirmSelection(): void {
  const item = items.value[selectedIndex.value]
  if (item) onSelectItem(item)
}

function onSelectItem(item: AssetSearchItem): void {
  emit('select', item)
}

function onInput(e: Event): void {
  query.value = (e.target as HTMLInputElement).value
}

function onClose(): void {
  emit('close')
}

const KIND_LABELS: Record<AssetKind, string> = {
  stock: 'Ação',
  reit: 'FII',
  etf: 'ETF',
  bdr: 'BDR',
  crypto: 'Cripto',
  tesouro: 'Tesouro',
}
function kindLabel(kind: AssetKind): string {
  return KIND_LABELS[kind] ?? kind
}
</script>

<style scoped>
.asset-picker {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  max-height: 380px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--brand-surface) 96%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  box-shadow:
    0 18px 40px -20px color-mix(in srgb, var(--brand-primary) 28%, transparent),
    0 6px 14px -8px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  font-family: var(--brand-font, system-ui);
  pointer-events: auto;
}

.asset-picker__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}

.asset-picker__search-icon {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.asset-picker__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--brand-text);
  font-size: 14px;
  font-weight: 500;
}
.asset-picker__input::placeholder {
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

.asset-picker__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  transition: background-color 140ms;
}
.asset-picker__clear:hover {
  background: color-mix(in srgb, var(--brand-text) 12%, transparent);
  color: var(--brand-text);
}

.asset-picker__state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 16px;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.asset-picker__list {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
  scrollbar-width: thin;
}

.asset-picker__row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 120ms;
}
.asset-picker__row.is-selected {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}

.asset-picker__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.asset-picker__ticker {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-text);
  letter-spacing: -0.005em;
}

.asset-picker__name {
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-picker__kind {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: color-mix(in srgb, var(--brand-primary) 80%, var(--brand-text));
}
.asset-picker__kind[data-kind='crypto'] {
  background: color-mix(in srgb, #fb923c 14%, transparent);
  color: color-mix(in srgb, #fb923c 80%, var(--brand-text));
}
.asset-picker__kind[data-kind='tesouro'] {
  background: color-mix(in srgb, var(--brand-positive, #0aae7c) 14%, transparent);
  color: color-mix(in srgb, var(--brand-positive, #0aae7c) 80%, var(--brand-text));
}

.asset-picker__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
}

.asset-picker__hint {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.asset-picker__hint kbd {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
}

.asset-picker-enter-active,
.asset-picker-leave-active {
  transition:
    opacity 150ms ease-out,
    transform 180ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.asset-picker-enter-from,
.asset-picker-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
