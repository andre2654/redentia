<!--
  CalcUiAssetSearch — search bar de ativo V5 unificada.
  Usada em FairPrice, DividendYield, Stock pra picker de ações/FIIs.
  Estilo V5: input com underline, dropdown clean, sem rounded-2xl/blur.
-->
<template>
  <div class="cui-search">
    <label v-if="label" class="cui-search-label">{{ label }}</label>

    <div class="cui-search-input" :class="{ 'cui-search-input--focused': focused }">
      <UIcon
        :name="loading ? 'i-lucide-loader-2' : 'i-lucide-search'"
        class="cui-search-icon"
        :class="{ 'animate-spin': loading }"
      />
      <input
        :value="modelValue"
        :placeholder="placeholder"
        type="text"
        autocomplete="off"
        spellcheck="false"
        class="cui-search-field"
        @input="onInput"
        @focus="focused = true"
        @blur="onBlur"
      />
      <button
        v-if="modelValue"
        type="button"
        class="cui-search-clear"
        aria-label="Limpar busca"
        @click="onClear"
      >
        <UIcon name="i-lucide-x" class="cui-search-clear-icon" />
      </button>
    </div>

    <Transition name="cui-search-results">
      <div
        v-if="modelValue && results.length > 0"
        class="cui-search-results"
      >
        <div class="cui-search-results-header">
          <span>{{ results.length }} resultado{{ results.length === 1 ? '' : 's' }}</span>
          <span>{{ resultsBadge ?? 'B3' }}</span>
        </div>
        <div class="cui-search-results-list">
          <button
            v-for="item in results.slice(0, maxResults)"
            :key="item.ticker || item.stock || item.id"
            type="button"
            class="cui-search-result-item"
            @mousedown.prevent="$emit('select', item)"
          >
            <div class="cui-search-result-logo">
              <img
                v-if="item.logo"
                :src="item.logo"
                :alt="item.ticker || item.stock"
                loading="lazy"
              />
              <span v-else>{{ (item.ticker || item.stock || '').slice(0, 2) }}</span>
            </div>
            <div class="cui-search-result-info">
              <span class="cui-search-result-ticker">{{ (item.ticker || item.stock || '').toUpperCase() }}</span>
              <span v-if="item.name" class="cui-search-result-name">{{ item.name }}</span>
            </div>
            <span v-if="item.sector" class="cui-search-result-sector">{{ item.sector }}</span>
            <UIcon name="i-lucide-arrow-right" class="cui-search-result-arrow" />
          </button>
        </div>
      </div>
    </Transition>

    <div
      v-if="modelValue && results.length === 0 && !loading"
      class="cui-search-noresults"
    >
      <UIcon name="i-lucide-search-x" class="cui-search-noresults-icon" />
      <span>Nenhum resultado para <strong>"{{ modelValue }}"</strong></span>
    </div>
  </div>
</template>

<script setup lang="ts">
type Asset = {
  ticker?: string
  stock?: string
  id?: string | number
  name?: string
  logo?: string
  sector?: string
  [key: string]: unknown
}

withDefaults(
  defineProps<{
    modelValue: string
    results: Asset[]
    loading?: boolean
    placeholder?: string
    label?: string
    resultsBadge?: string
    maxResults?: number
  }>(),
  { maxResults: 10, placeholder: 'Buscar ação ou FII...' }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [asset: Asset]
}>()

const focused = ref(false)

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
function onBlur() {
  setTimeout(() => { focused.value = false }, 150)
}
function onClear() {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.cui-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}
.cui-search-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.cui-search-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  transition: border-color 150ms, box-shadow 150ms;
}
.cui-search-input--focused {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.cui-search-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--text-muted);
}
.cui-search-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 400;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
}
.cui-search-field::placeholder {
  color: var(--text-muted);
}
.cui-search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 150ms;
}
.cui-search-clear:hover {
  background: var(--bg-overlay);
  color: var(--text-heading);
}
.cui-search-clear-icon { width: 14px; height: 14px; }

.cui-search-results {
  margin-top: 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
}
.cui-search-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
.cui-search-results-list {
  max-height: 320px;
  overflow-y: auto;
}
.cui-search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  text-align: left;
  cursor: pointer;
  transition: background 150ms;
}
.cui-search-result-item:last-child { border-bottom: none; }
.cui-search-result-item:hover {
  background: var(--bg-overlay);
}
.cui-search-result-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  flex-shrink: 0;
}
.cui-search-result-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.cui-search-result-logo span {
  font-size: 11px;
  font-weight: 700;
  color: var(--brand-primary);
}
.cui-search-result-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.cui-search-result-ticker {
  font-family: ui-monospace, monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-heading);
}
.cui-search-result-name {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cui-search-result-sector {
  display: none;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  font-size: 10px;
  font-weight: 500;
  color: var(--text-body);
  flex-shrink: 0;
}
@media (min-width: 640px) {
  .cui-search-result-sector { display: inline-block; }
}
.cui-search-result-arrow {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform 150ms, color 150ms;
}
.cui-search-result-item:hover .cui-search-result-arrow {
  transform: translateX(2px);
  color: var(--brand-primary);
}

.cui-search-noresults {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 12px 14px;
  background: var(--bg-elevated);
  border: 1px dashed var(--border-subtle);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-muted);
}
.cui-search-noresults-icon { width: 18px; height: 18px; color: var(--text-muted); }
.cui-search-noresults strong { color: var(--text-heading); }

.cui-search-results-enter-active,
.cui-search-results-leave-active {
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
.cui-search-results-enter-from,
.cui-search-results-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
