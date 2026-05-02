<!--
  MoleculesPortfolioAssetPicker — multi-select asset picker for the Raio-X
  flow.

  UX inspired by QuickSearch (the floating ⌘K pill): the trigger looks like
  a search input pill, and tapping it floats a glass panel BELOW with the
  search field, sticky chips of selected assets, grouped results, and a
  footer CTA. Not a modal — the panel is teleported to <body> and absolutely
  positioned via getBoundingClientRect() so it can escape parents with
  overflow: hidden (the hero radial bg has it).

  Why not a real modal:
    - Modals feel heavy on a marketing page; the picker is a CTA primitive,
      not a destination.
    - QuickSearch already established the "floating glass panel" pattern in
      this product, so reusing it keeps the visual vocabulary consistent.

  Flow on submit:
    - Picker only emits `submit` with the selected tickers — it does NOT
      navigate. The parent page intercepts the emit, opens the simulation
      disclaimer modal (with the video + signup pitch), and only on the
      modal's confirm CTA does it `router.push('/raio-x?tickers=…')`.
-->
<script setup lang="ts">
import { useAssetSearch, type AssetSearchItem } from '~/composables/useAssetSearch'

const props = withDefaults(defineProps<{
  /** Label on the primary CTA button inside the dropdown footer. */
  ctaLabel?: string
  /** Short variant for ≤480px viewports where the trigger button shrinks. */
  ctaLabelShort?: string
  /** Initial selection (tickers as strings). Used when the user lands
   *  with `?tickers=` already in the URL and re-opens the picker. */
  initial?: string[]
}>(), {
  ctaLabel: 'Analisar minha carteira',
  ctaLabelShort: 'Analisar',
  initial: () => [],
})

const emit = defineEmits<{
  submit: [tickers: string[]]
}>()

const { ensureLoaded, search, loading } = useAssetSearch()

const isOpen = ref(false)
const query = ref('')
const selected = ref<AssetSearchItem[]>([])
const triggerEl = ref<HTMLButtonElement | null>(null)
const popoverEl = ref<HTMLDivElement | null>(null)
const searchInputEl = ref<HTMLInputElement | null>(null)

// Popover position (fixed, computed from trigger rect on every open + on
// scroll/resize while open).
const popoverStyle = ref<{ top: string, left: string, width: string }>({
  top: '0px',
  left: '0px',
  width: '0px',
})

function recomputePosition() {
  const trigger = triggerEl.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  // Place panel 8px below the trigger; on small viewports we widen it
  // to almost full width and gently center it instead of pinning to the
  // trigger's left edge (which can sit close to the page padding).
  const isMobile = window.innerWidth < 640
  const popoverWidth = isMobile
    ? Math.min(window.innerWidth - 24, 480)
    : rect.width
  const left = isMobile
    ? Math.max(12, (window.innerWidth - popoverWidth) / 2)
    : rect.left
  popoverStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${left}px`,
    width: `${popoverWidth}px`,
  }
}

const results = computed(() => search(query.value, 60))

const grouped = computed(() => {
  const buckets: Record<string, AssetSearchItem[]> = {
    stock: [],
    reit: [],
    etf: [],
    bdr: [],
    tesouro: [],
    crypto: [],
  }
  for (const r of results.value) buckets[r.kind]?.push(r)
  const order: Array<{ kind: string, label: string, items: AssetSearchItem[] }> = [
    { kind: 'stock', label: 'Ações', items: buckets.stock! },
    { kind: 'reit', label: 'Fundos imobiliários', items: buckets.reit! },
    { kind: 'etf', label: 'ETFs', items: buckets.etf! },
    { kind: 'bdr', label: 'BDRs', items: buckets.bdr! },
    { kind: 'tesouro', label: 'Tesouro Direto', items: buckets.tesouro! },
    { kind: 'crypto', label: 'Criptomoedas', items: buckets.crypto! },
  ]
  return order.filter(g => g.items.length > 0)
})

const selectedSet = computed(() => new Set(selected.value.map(s => s.id)))

function isSelected(item: AssetSearchItem): boolean {
  return selectedSet.value.has(item.id)
}

function toggle(item: AssetSearchItem) {
  const idx = selected.value.findIndex(s => s.id === item.id)
  if (idx >= 0) selected.value.splice(idx, 1)
  else selected.value.push(item)
}

function open() {
  recomputePosition()
  isOpen.value = true
  ensureLoaded()
  nextTick(() => searchInputEl.value?.focus())
}

function close() {
  isOpen.value = false
  query.value = ''
}

function submit() {
  if (selected.value.length === 0) return
  const tickers = selected.value.map(s => s.ticker)
  emit('submit', tickers)
  close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
  else if (e.key === 'Enter' && selected.value.length > 0) {
    e.preventDefault()
    submit()
  }
}

// Click-outside: close when the user clicks anywhere that isn't the
// trigger or the popover. Mounted as a document-level listener while the
// popover is open, removed when closed.
function onDocumentClick(e: MouseEvent) {
  const target = e.target as Node | null
  if (!target) return
  if (triggerEl.value?.contains(target)) return
  if (popoverEl.value?.contains(target)) return
  close()
}

watch(isOpen, (next) => {
  if (typeof document === 'undefined') return
  if (next) {
    // Defer attach so the click that opened the popover doesn't
    // immediately bubble to the document and close it again.
    setTimeout(() => {
      document.addEventListener('click', onDocumentClick)
    }, 0)
    window.addEventListener('resize', recomputePosition)
    window.addEventListener('scroll', recomputePosition, true)
  } else {
    document.removeEventListener('click', onDocumentClick)
    window.removeEventListener('resize', recomputePosition)
    window.removeEventListener('scroll', recomputePosition, true)
  }
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', recomputePosition)
  window.removeEventListener('scroll', recomputePosition, true)
})

// Hydrate from `initial` prop on mount.
onMounted(() => {
  if (props.initial.length === 0) return
  ensureLoaded().then(() => {
    const matched: AssetSearchItem[] = []
    for (const t of props.initial) {
      const lower = t.toLowerCase().trim()
      const found = search(lower, 1)[0]
      if (found && found.ticker.toLowerCase() === lower) matched.push(found)
    }
    if (matched.length > 0) selected.value = matched
  })
})

const kindBadges: Record<string, { label: string, color: string }> = {
  stock: { label: 'Ação', color: 'var(--brand-primary)' },
  reit: { label: 'FII', color: 'var(--brand-positive)' },
  etf: { label: 'ETF', color: 'var(--brand-secondary)' },
  bdr: { label: 'BDR', color: 'var(--brand-tertiary)' },
  tesouro: { label: 'TD', color: 'var(--brand-neutral)' },
  crypto: { label: 'Cripto', color: 'var(--brand-primary)' },
}
</script>

<template>
  <div class="picker">
    <!-- ============ TRIGGER ============ -->
    <button
      ref="triggerEl"
      type="button"
      class="picker__trigger"
      :class="{ 'picker__trigger--active': isOpen }"
      :aria-expanded="isOpen"
      :aria-label="selected.length > 0 ? `${selected.length} ativos selecionados, abrir seletor` : 'Abrir seletor de ativos'"
      @click="open"
    >
      <UIcon name="i-lucide-search" class="picker__trigger-icon size-5 shrink-0" aria-hidden="true" />

      <span v-if="selected.length === 0" class="picker__trigger-placeholder">
        Selecionar ativos da sua carteira...
      </span>

      <span v-else class="picker__trigger-chips">
        <span
          v-for="s in selected.slice(0, 4)"
          :key="s.id"
          class="picker__inline-chip"
          translate="no"
        >{{ s.ticker }}</span>
        <span v-if="selected.length > 4" class="picker__trigger-extra">
          +{{ selected.length - 4 }}
        </span>
      </span>

      <span class="picker__trigger-cta">
        <span class="picker__trigger-cta-label--desktop">{{ ctaLabel }}</span>
        <span class="picker__trigger-cta-label--mobile">{{ ctaLabelShort }}</span>
        <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
      </span>
    </button>

    <!-- ============ DROPDOWN POPOVER ============ -->
    <Teleport v-if="isOpen" to="body">
      <Transition name="picker-fade">
        <div
          v-if="isOpen"
          ref="popoverEl"
          class="picker__popover"
          role="dialog"
          aria-label="Seletor de ativos"
          :style="popoverStyle"
          @keydown="onKeydown"
        >
          <!-- Search header -->
          <div class="picker__popover-search">
            <UIcon name="i-lucide-search" class="size-4 shrink-0" :style="{ color: 'var(--text-muted)' }" aria-hidden="true" />
            <input
              ref="searchInputEl"
              v-model="query"
              type="text"
              class="picker__popover-input"
              placeholder="Busque por ticker ou nome..."
              autocomplete="off"
              spellcheck="false"
              @keydown="onKeydown"
            >
            <button
              v-if="query"
              type="button"
              class="picker__popover-clear"
              aria-label="Limpar"
              @click="query = ''"
            >
              <UIcon name="i-lucide-x" class="size-3.5" />
            </button>
            <kbd class="picker__popover-kbd">Esc</kbd>
          </div>

          <!-- Selected chips strip (sticky top, scrolls horizontally if many) -->
          <div v-if="selected.length > 0" class="picker__popover-chips">
            <span class="picker__popover-chips-count">
              {{ selected.length }}
            </span>
            <ul class="picker__popover-chips-list">
              <li v-for="s in selected" :key="s.id">
                <button
                  type="button"
                  class="picker__popover-chip"
                  :aria-label="`Remover ${s.ticker}`"
                  @click="toggle(s)"
                >
                  <span translate="no">{{ s.ticker }}</span>
                  <UIcon name="i-lucide-x" class="size-3" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </div>

          <!-- Results body -->
          <div class="picker__popover-body">
            <div v-if="loading && results.length === 0" class="picker__popover-empty">
              <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" aria-hidden="true" />
              <span>Carregando catálogo...</span>
            </div>
            <div v-else-if="!loading && results.length === 0" class="picker__popover-empty">
              <UIcon name="i-lucide-search-x" class="size-4" aria-hidden="true" />
              <span v-if="query">Nada encontrado para "{{ query }}"</span>
              <span v-else>Comece digitando.</span>
            </div>
            <template v-else>
              <section v-for="g in grouped" :key="g.kind" class="picker__group">
                <header class="picker__group-header">
                  <span>{{ g.label }}</span>
                  <span class="tabular-nums">{{ g.items.length }}</span>
                </header>
                <ul class="picker__items">
                  <li v-for="item in g.items" :key="item.id">
                    <button
                      type="button"
                      class="picker__item"
                      :class="{ 'picker__item--selected': isSelected(item) }"
                      @click="toggle(item)"
                    >
                      <span class="picker__item-logo">
                        <img v-if="item.logo" :src="item.logo" :alt="`Logo ${item.ticker}`" loading="lazy">
                        <span v-else class="picker__item-initials" translate="no">
                          {{ item.ticker.slice(0, 2) }}
                        </span>
                      </span>
                      <span class="picker__item-text">
                        <span class="picker__item-ticker" translate="no">{{ item.ticker }}</span>
                        <span class="picker__item-name">{{ item.name }}</span>
                      </span>
                      <span
                        class="picker__item-kind"
                        :style="{ color: kindBadges[item.kind]?.color, borderColor: `color-mix(in srgb, ${kindBadges[item.kind]?.color} 28%, transparent)` }"
                      >{{ kindBadges[item.kind]?.label }}</span>
                      <span class="picker__item-check" aria-hidden="true">
                        <UIcon
                          v-if="isSelected(item)"
                          name="i-lucide-check"
                          class="size-4"
                          :style="{ color: 'var(--brand-primary)' }"
                        />
                      </span>
                    </button>
                  </li>
                </ul>
              </section>
            </template>
          </div>

          <!-- Footer CTA -->
          <div class="picker__popover-footer">
            <span class="picker__popover-hint">
              <UIcon name="i-lucide-corner-down-left" class="size-3" aria-hidden="true" />
              <span>↵ confirma</span>
            </span>
            <button
              type="button"
              class="quiet-btn-primary picker__popover-submit"
              :disabled="selected.length === 0"
              @click="submit"
            >
              <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
              <span>{{ ctaLabel }}</span>
              <span v-if="selected.length > 0" class="picker__popover-submit-count tabular-nums">
                {{ selected.length }}
              </span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ============ TRIGGER ============ */
.picker {
  position: relative;
  width: 100%;
}

.picker__trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 6px 6px 6px 18px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  color: var(--text-heading);
  font-family: var(--brand-font);
  cursor: pointer;
  transition: border-color 200ms, box-shadow 200ms, transform 120ms;
  text-align: left;
  min-height: 56px;
}

.picker__trigger:hover,
.picker__trigger--active {
  border-color: color-mix(in srgb, var(--brand-primary) 38%, var(--border-default));
  box-shadow: 0 8px 24px -12px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.picker__trigger:focus-visible {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-ring-focus);
}

.picker__trigger-icon {
  color: var(--text-muted);
}

.picker__trigger-placeholder {
  flex: 1;
  font-size: 15px;
  color: var(--text-muted);
}

.picker__trigger-chips {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  overflow: hidden;
  min-width: 0;
}

.picker__inline-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  white-space: nowrap;
}

.picker__trigger-extra {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  margin-left: 4px;
}

.picker__trigger-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--brand-primary);
  color: var(--bg-base);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.picker__trigger-cta-label--mobile {
  display: none;
}

@media (max-width: 480px) {
  .picker__trigger-cta-label--desktop {
    display: none;
  }
  .picker__trigger-cta-label--mobile {
    display: inline;
  }
  .picker__trigger {
    padding-left: 14px;
  }
  .picker__trigger-cta {
    padding: 10px 14px;
  }
}

/* ============ DROPDOWN POPOVER ============ */
/* Floating glass panel below the trigger.
   - Position is computed in script (top/left/width via getBoundingClientRect)
     and applied as inline style to the .picker__popover element.
   - position:fixed escapes overflow:hidden parents (the hero radial bg
     container has overflow:hidden — without this the panel would be clipped).
   - Visual: rounded card with amber-tinted shadow + glass blur, mirroring
     the QuickSearch panel style. */
.picker__popover {
  position: fixed;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  max-height: min(560px, calc(100dvh - 120px));
  background: color-mix(in srgb, var(--bg-elevated) 96%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  box-shadow:
    0 24px 60px -24px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    0 12px 30px -12px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

[data-mode='dark'] .picker__popover,
.dark .picker__popover {
  box-shadow:
    0 24px 60px -24px rgba(0, 0, 0, 0.6),
    0 12px 30px -12px color-mix(in srgb, var(--brand-primary) 14%, transparent);
}

/* Search header */
.picker__popover-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.picker__popover-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--text-heading);
  font-family: var(--brand-font);
}

.picker__popover-input::placeholder {
  color: var(--text-muted);
}

.picker__popover-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  border-radius: 6px;
  transition: background 150ms, color 150ms;
}

.picker__popover-clear:hover {
  background: var(--bg-overlay);
  color: var(--text-heading);
}

.picker__popover-kbd {
  display: inline-flex;
  align-items: center;
  font-family: var(--brand-font);
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  background: var(--bg-base);
}

/* Selected chips strip */
.picker__popover-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}

.picker__popover-chips::-webkit-scrollbar {
  display: none;
}

.picker__popover-chips-count {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-primary);
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.picker__popover-chips-list {
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: nowrap;
}

.picker__popover-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px 3px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 150ms, border-color 150ms;
}

.picker__popover-chip:hover {
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  border-color: var(--brand-primary);
}

/* Results body */
.picker__popover-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 6px;
  min-height: 0;
}

.picker__popover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 14px;
  color: var(--text-muted);
  font-size: 13px;
}

.picker__group + .picker__group {
  margin-top: 2px;
  border-top: 1px solid var(--border-subtle);
}

.picker__group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.picker__items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.picker__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 14px;
  background: transparent;
  border: 0;
  text-align: left;
  cursor: pointer;
  transition: background 120ms;
  font-family: var(--brand-font);
}

.picker__item:hover {
  background: var(--bg-overlay);
}

.picker__item--selected {
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
}

.picker__item-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-base);
  overflow: hidden;
  flex-shrink: 0;
}

.picker__item-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picker__item-initials {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.picker__item-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.picker__item-ticker {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}

.picker__item-name {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker__item-kind {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: transparent;
  flex-shrink: 0;
  opacity: 0.85;
}

.picker__item-check {
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Footer */
.picker__popover-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  flex-shrink: 0;
}

.picker__popover-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

@media (max-width: 480px) {
  .picker__popover-hint {
    display: none;
  }
}

.picker__popover-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
}

.picker__popover-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.picker__popover-submit-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  color: inherit;
  font-size: 11px;
  font-weight: 700;
}

/* Enter/leave transitions */
.picker-fade-enter-active,
.picker-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.picker-fade-enter-from,
.picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .picker-fade-enter-active,
  .picker-fade-leave-active {
    transition: none;
  }
}
</style>
