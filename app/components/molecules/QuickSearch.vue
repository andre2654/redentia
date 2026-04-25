<!--
  QuickSearch — pílula flutuante de busca global. Fica fixa no bottom-
  center da viewport em todas as páginas, ocupando espaço mínimo até ser
  acionada. Quando aberta:
    - mostra um painel ACIMA da pílula com 1 ativo representativo de cada
      grupo (ações, FIIs, ETFs, BDRs, cripto, tesouro);
    - filtra os ativos por digitação (matching em ticker e nome);
    - é navegável por teclado (↑↓ + Enter) e fecha com Esc.

  Atalho global: Ctrl/Cmd+K abre/fecha. Inspirado nas command palettes
  do Linear / Vercel e na pílula "Ask CMC AI" do CoinMarketCap.

  Reusa os mesmos serviços do antigo MoleculesSearchAssets (assets,
  tesouro, crypto) para evitar duplicação de fetch logic.
-->
<template>
  <!-- Backdrop fade when open. Click to close. Lower opacity, deeper blur
       so the panel above feels integrated with the page (modern glass). -->
  <Transition name="qs-backdrop">
    <div
      v-if="open"
      class="quick-search-backdrop fixed inset-0 z-40"
      :style="{ backgroundColor: 'rgba(0, 0, 0, 0.32)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }"
      aria-hidden="true"
      @click="close"
    />
  </Transition>

  <div
    ref="rootEl"
    class="quick-search-root fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none md:bottom-6"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
  >
    <div
      class="quick-search-shell w-full max-w-md pointer-events-auto"
      :style="{
        '--qs-primary': brand.colors.primary,
        '--qs-primary-soft': `${brand.colors.primary}40`,
      } as any"
    >
      <!-- STAGED preview — when the user clicked a rotating suggestion in
           the pill, we open the panel with the input clean and surface
           that one suggestion as a minimalist confirm chip. A second
           click on the chip commits and navigates. -->
      <Transition name="qs-chips">
        <div
          v-if="open && stagedSuggestion"
          class="qs-staged mb-3 flex items-center justify-center"
        >
          <button
            type="button"
            class="qs-staged-chip group/staged inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-[transform,background-color,border-color]"
            :style="{
              borderColor: chipBorder,
              backgroundColor: chipBg,
              color: brand.colors.text,
            }"
            :aria-label="`Confirmar: ${stagedSuggestion.text}`"
            @click="commitStagedSuggestion"
          >
            <NuxtImg
              v-if="stagedSuggestion.logo"
              :src="stagedSuggestion.logo"
              alt=""
              width="18"
              height="18"
              loading="lazy"
              decoding="async"
              class="size-[18px] shrink-0 rounded-full object-cover"
            />
            <UIcon
              v-else-if="stagedSuggestion.icon"
              :name="stagedSuggestion.icon"
              class="size-4 shrink-0"
              :style="{ color: brand.colors.primary }"
              aria-hidden="true"
            />
            <span class="truncate">
              <span v-if="stagedSuggestion.prefix" :style="{ color: brand.colors.textMuted }">{{ stagedSuggestion.prefix }}</span>
              <span
                class="font-semibold"
                :class="stagedSuggestion.mono ? 'font-mono-tab tracking-tight' : ''"
                :style="{ color: brand.colors.text }"
              >{{ stagedSuggestion.highlight }}</span>
              <span v-if="stagedSuggestion.suffix" :style="{ color: brand.colors.textMuted }">{{ stagedSuggestion.suffix }}</span>
            </span>
            <span
              class="font-mono-tab text-[10px] uppercase tracking-[0.14em]"
              :style="{ color: brand.colors.primary }"
              aria-hidden="true"
            >
              ↵
            </span>
          </button>
        </div>
      </Transition>

      <!-- IDLE loading — minimalist inline spinner shown above the input
           while the chip data is being fetched. No surface, no border;
           just a small spinner + "Carregando…" so the user knows we're
           working without seeing a flash of empty space. -->
      <Transition name="qs-chips">
        <div
          v-if="open && !searchTerm && isLoading && idleChips.length === 0"
          class="mb-3 flex items-center justify-center gap-2 text-[12px]"
          :style="{ color: brand.colors.textMuted }"
          role="status"
          aria-live="polite"
        >
          <UIcon name="i-lucide-loader-2" class="size-3.5 motion-safe:animate-spin" aria-hidden="true" />
          <span>Carregando…</span>
        </div>
      </Transition>

      <!-- IDLE state — when the panel is open and the user hasn't typed
           anything, we float a row of brand chips above the input. The
           staged suggestion (if any) renders above these chips so the
           user always has the regular browse pills available. -->
      <Transition name="qs-chips">
        <div
          v-if="open && !searchTerm && idleChips.length > 0"
          class="qs-chips mb-3 flex flex-wrap justify-center gap-2"
          role="listbox"
          aria-label="Sugestões rápidas"
        >
          <NuxtLink
            v-for="chip in idleChips"
            :key="chip.id"
            :to="chip.to"
            class="qs-chip group/chip inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-[transform,background-color,border-color]"
            :class="isFocused(chip.groupType, 0) ? 'qs-chip-focused' : ''"
            :style="{
              borderColor: chipBorder,
              backgroundColor: chipBg,
              color: brand.colors.text,
            }"
            role="option"
            :aria-selected="isFocused(chip.groupType, 0)"
            @click="close"
            @mouseenter="setFocus(chip.groupType, 0)"
          >
            <NuxtImg
              v-if="chip.logo"
              :src="chip.logo"
              :alt="''"
              role="presentation"
              width="16"
              height="16"
              loading="lazy"
              decoding="async"
              class="size-4 rounded-full object-cover"
            />
            <span class="font-mono-tab tracking-tight" translate="no">{{ chip.ticker }}</span>
          </NuxtLink>
        </div>
      </Transition>

      <!-- SEARCH panel — translucent glass surface, minimalist. Soft
           rounded corners (24px), subtle border, no primary halos or
           glows. The shape stays consistent with the input pill at
           the bottom but pulls back on the visual noise. -->
      <Transition name="qs-panel">
        <div
          v-if="open && searchTerm"
          class="qs-panel relative mb-2 overflow-hidden rounded-2xl border"
          :style="{
            backgroundColor: panelBg,
            borderColor: panelBorder,
            color: brand.colors.text,
          }"
          role="listbox"
          aria-label="Sugestões de ativos"
        >
          <!-- Loading state -->
          <div
            v-if="isLoading && filteredItems.length === 0"
            class="relative flex items-center gap-2 px-5 py-6 text-sm"
            :style="{ color: brand.colors.textMuted }"
            role="status"
            aria-live="polite"
          >
            <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" aria-hidden="true" />
            Carregando ativos…
          </div>

          <!-- Empty state -->
          <div
            v-else-if="filteredItems.length === 0 && !askAiItem"
            class="relative flex flex-col items-center gap-1 px-4 py-8 text-center text-sm"
            :style="{ color: brand.colors.textMuted }"
          >
            <UIcon name="i-lucide-search-x" class="size-5 opacity-60" aria-hidden="true" />
            <span>Nenhum ativo encontrado</span>
          </div>

          <ul v-else class="qs-scroll relative max-h-[60vh] overflow-y-auto px-2 py-2">
            <!-- "Ask AI" row — clean, minimal. No primary border, no
                 glow. The sparkles icon already signals the AI action,
                 the rest of the styling matches the other pill rows. -->
            <li v-if="askAiItem" class="mb-1.5">
              <NuxtLink
                :to="askAiItem.to"
                class="qs-hero group/qs-hero relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors focus-visible:outline-none"
                :style="{
                  backgroundColor: isFocused('AI', 0)
                    ? `color-mix(in srgb, ${brand.colors.text} 6%, transparent)`
                    : 'transparent',
                }"
                role="option"
                :aria-selected="isFocused('AI', 0)"
                @click="close"
                @mouseenter="setFocus('AI', 0)"
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  :style="{
                    backgroundColor: `${brand.colors.primary}1F`,
                    color: brand.colors.primary,
                  }"
                  aria-hidden="true"
                >
                  <UIcon name="i-lucide-sparkles" class="size-4" />
                </span>
                <div class="flex min-w-0 flex-1 flex-col leading-tight">
                  <span
                    class="truncate text-[13px] font-semibold tracking-tight"
                    :style="{ color: brand.colors.text }"
                  >
                    Perguntar para a IA
                  </span>
                  <span
                    class="truncate text-[11.5px]"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    "{{ searchTerm }}"
                  </span>
                </div>
                <span
                  class="font-mono-tab text-[10px] uppercase tracking-[0.14em]"
                  :style="{ color: brand.colors.primary }"
                  aria-hidden="true"
                >
                  ↵
                </span>
              </NuxtLink>
            </li>

            <template v-for="(group, gIdx) in groupedItems" :key="group.type">
              <li
                v-if="group.items.length > 0"
                :class="(gIdx > 0 || askAiItem) ? 'mt-2 pt-1' : ''"
              >
                <div
                  class="flex items-center justify-between gap-2 px-3 pb-1 pt-1 font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.textMuted} 65%, transparent)` }"
                >
                  <span class="flex items-center gap-1.5" translate="no">
                    <span
                      class="size-1 shrink-0 rounded-full"
                      :style="{ backgroundColor: brand.colors.primary }"
                      aria-hidden="true"
                    />
                    {{ group.label }}
                  </span>
                  <span v-if="searchTerm" tabular-nums class="opacity-70">{{ group.items.length }}</span>
                </div>
                <ul class="flex flex-col gap-1.5">
                  <li
                    v-for="(item, idx) in group.items"
                    :key="`${group.type}-${item.id}`"
                  >
                    <!-- Result row pill — minimal: subtle surface, soft
                         rounded corners, no glow. The focused state is
                         a slightly stronger background tint, nothing
                         else. -->
                    <NuxtLink
                      :to="item.to"
                      class="qs-pill-row group/qs-row relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors focus-visible:outline-none"
                      :class="isFocused(group.type, idx) ? 'qs-pill-row-focused' : ''"
                      :style="{
                        backgroundColor: isFocused(group.type, idx)
                          ? `color-mix(in srgb, ${brand.colors.text} 7%, transparent)`
                          : `color-mix(in srgb, ${brand.colors.surface} 50%, transparent)`,
                      }"
                      role="option"
                      :aria-selected="isFocused(group.type, idx)"
                      @click="close"
                      @mouseenter="setFocus(group.type, idx)"
                    >
                      <div
                        class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                        :style="{
                          backgroundColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)`,
                        }"
                      >
                        <NuxtImg
                          v-if="item.logo"
                          :src="item.logo"
                          :alt="''"
                          role="presentation"
                          width="36"
                          height="36"
                          loading="lazy"
                          decoding="async"
                          class="size-full object-cover"
                        />
                        <span
                          v-else
                          class="font-mono-tab text-[11px] font-bold"
                          :style="{ color: brand.colors.primary }"
                          translate="no"
                        >
                          {{ item.ticker.slice(0, 3) }}
                        </span>
                      </div>
                      <div class="flex min-w-0 flex-1 flex-col leading-tight">
                        <span
                          class="truncate font-mono-tab text-[14px] font-semibold tracking-tight"
                          :style="{ color: brand.colors.text }"
                          translate="no"
                        >
                          {{ item.ticker }}
                        </span>
                        <span
                          class="truncate text-[11.5px]"
                          :style="{ color: brand.colors.textMuted }"
                        >
                          {{ item.name }}
                        </span>
                      </div>
                      <div class="flex flex-col items-end gap-0.5 text-right leading-tight">
                        <span
                          v-if="item.priceLabel"
                          class="font-mono-tab text-[13px] font-semibold tabular-nums"
                          :style="{ color: brand.colors.text }"
                          translate="no"
                        >
                          {{ item.priceLabel }}
                        </span>
                        <span
                          v-if="item.changeLabel"
                          class="font-mono-tab text-[11px] font-semibold tabular-nums"
                          :style="{ color: changeColor(item.changePercent) }"
                          translate="no"
                        >
                          {{ item.changeLabel }}
                        </span>
                      </div>
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </template>
          </ul>

          <!-- Footer with shortcuts — kbd-style badges echo the ⌘K
               affordance on the input pill so the whole search feels
               like a unified keyboard-first surface. -->
          <div
            class="relative flex items-center justify-between gap-3 px-4 py-2.5 text-[10px]"
            :style="{
              borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
              color: `color-mix(in srgb, ${brand.colors.textMuted} 75%, transparent)`,
            }"
          >
            <div class="hidden items-center gap-2 sm:flex">
              <span class="inline-flex items-center gap-1">
                <kbd
                  class="font-mono-tab inline-flex h-4 min-w-[16px] items-center justify-center rounded border px-1 text-[10px] font-semibold leading-none"
                  :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)` }"
                  aria-hidden="true"
                >↑</kbd>
                <kbd
                  class="font-mono-tab inline-flex h-4 min-w-[16px] items-center justify-center rounded border px-1 text-[10px] font-semibold leading-none"
                  :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)` }"
                  aria-hidden="true"
                >↓</kbd>
                <span class="font-mono-tab uppercase tracking-[0.14em]">navegar</span>
              </span>
              <span :style="{ color: brand.colors.border }" aria-hidden="true">·</span>
              <span class="inline-flex items-center gap-1">
                <kbd
                  class="font-mono-tab inline-flex h-4 min-w-[16px] items-center justify-center rounded border px-1 text-[10px] font-semibold leading-none"
                  :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)` }"
                  aria-hidden="true"
                >↵</kbd>
                <span class="font-mono-tab uppercase tracking-[0.14em]">abrir</span>
              </span>
            </div>
            <span class="inline-flex items-center gap-1">
              <kbd
                class="font-mono-tab inline-flex h-4 items-center justify-center rounded border px-1.5 text-[10px] font-semibold leading-none"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)` }"
                aria-hidden="true"
              >Esc</kbd>
              <span class="font-mono-tab uppercase tracking-[0.14em]">fechar</span>
            </span>
          </div>
        </div>
      </Transition>

      <!-- Pill input — translucent glass with hover ring + open-state ring -->
      <div
        class="quick-search-pill flex items-center gap-2 rounded-full border px-4 py-3 transition-[border-color,box-shadow]"
        :class="[open ? 'qs-pill-open' : '', !open ? 'qs-pill-idle' : '']"
        :style="{
          borderColor: open ? brand.colors.primary : pillBorder,
          backgroundColor: pillBg,
          color: brand.colors.text,
        }"
      >
        <UIcon
          name="i-lucide-search"
          class="size-4 shrink-0"
          :style="{ color: open ? brand.colors.primary : brand.colors.textMuted }"
          aria-hidden="true"
        />
        <!-- Input + rotating suggestion overlay. The wrapper intercepts
             clicks on empty space and focuses the input; clicks that land
             on the suggestion link itself bubble through to NuxtLink,
             which navigates normally. -->
        <div
          class="relative flex min-w-0 flex-1 items-center"
          @click="onInputAreaClick"
        >
          <input
            ref="inputEl"
            v-model="searchTerm"
            type="search"
            autocomplete="off"
            spellcheck="false"
            :placeholder="open ? 'Digite ticker ou nome…' : ''"
            class="w-full min-w-0 bg-transparent text-sm outline-none placeholder:opacity-60"
            :style="{ color: brand.colors.text }"
            aria-label="Buscar ativos"
            aria-controls="quick-search-listbox"
            @focus="open = true"
            @keydown="onKeydown"
          />

          <!-- ClientOnly because the rotation depends on Math.random and
               the live route, both of which would diverge between SSR
               and client and cause hydration mismatches. The suggestion
               is purely decorative — losing it on first paint is fine.
               It's a <button>, not a link: clicking should NEVER navigate
               on its own; instead we stage the suggestion in the panel
               and wait for explicit confirm. -->
          <ClientOnly>
            <Transition name="qs-suggest" mode="out-in">
              <button
                v-if="!open && currentSuggestion"
                :key="currentSuggestion.id"
                type="button"
                class="qs-suggest pointer-events-auto absolute inset-y-0 left-0 inline-flex max-w-full cursor-pointer items-center gap-1.5 truncate border-0 bg-transparent p-0 text-left text-sm focus-visible:outline-none"
                :style="{ color: brand.colors.text }"
                :aria-label="`Sugestão: ${currentSuggestion.text}`"
                @click.stop.prevent="onSuggestionClick"
              >
                <NuxtImg
                  v-if="currentSuggestion.logo"
                  :src="currentSuggestion.logo"
                  alt=""
                  width="18"
                  height="18"
                  loading="lazy"
                  decoding="async"
                  class="size-[18px] shrink-0 rounded-full object-cover"
                />
                <UIcon
                  v-else-if="currentSuggestion.icon"
                  :name="currentSuggestion.icon"
                  class="size-4 shrink-0"
                  :style="{ color: brand.colors.primary }"
                  aria-hidden="true"
                />
                <span class="qs-suggest-text truncate">
                  <span v-if="currentSuggestion.prefix" :style="{ color: brand.colors.textMuted }">{{ currentSuggestion.prefix }}</span>
                  <span
                    class="font-semibold"
                    :class="currentSuggestion.mono ? 'font-mono-tab tracking-tight' : ''"
                    :style="{ color: brand.colors.text }"
                  >{{ currentSuggestion.highlight }}</span>
                  <span v-if="currentSuggestion.suffix" :style="{ color: brand.colors.textMuted }">{{ currentSuggestion.suffix }}</span>
                </span>
              </button>
            </Transition>
          </ClientOnly>
        </div>
        <button
          v-if="searchTerm"
          type="button"
          class="inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors hover:opacity-80"
          :style="{ color: brand.colors.textMuted }"
          aria-label="Limpar busca"
          @click="searchTerm = ''"
        >
          <UIcon name="i-lucide-x" class="size-3.5" aria-hidden="true" />
        </button>
        <kbd
          v-if="!open"
          class="hidden shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 font-mono-tab text-[10px] tabular-nums sm:inline-flex"
          :style="{
            borderColor: brand.colors.border,
            color: brand.colors.textMuted,
            backgroundColor: brand.colors.background,
          }"
          aria-hidden="true"
        >
          <span>{{ shortcutModifier }}</span>
          <span>K</span>
        </kbd>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { IAsset } from '~/types/asset'

interface SearchItem {
  id: string
  ticker: string
  name: string
  to: string
  logo?: string | null
  priceLabel?: string | null
  changePercent?: number | null
  changeLabel?: string | null
}

type GroupType = 'STOCK' | 'REIT' | 'ETF' | 'BDR' | 'CRYPTO' | 'TESOURO' | 'AI'

interface Group {
  type: GroupType
  label: string
  items: SearchItem[]
}

const brand = useBrand()
const open = ref(false)
const searchTerm = ref('')
const focusedKey = ref<string | null>(null)
const isLoading = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)

const placeholder = computed(() => {
  if (open.value) return 'Digite ticker ou nome…'
  return 'Buscar ativos'
})

// ==========================================================
// Visual surfaces — translucent glass for both panel + pill.
// Panel sits ~55% opacity so the page reads through clearly,
// paired with strong backdrop blur in CSS. Pill stays a bit
// more solid so its content is always readable.
// ==========================================================
const panelBg = computed(() => `${brand.colors.surface}8C`) // ~55%
const panelBorder = computed(() => `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`)
const pillBg = computed(() => `${brand.colors.surface}D9`) // ~85%
const pillBorder = computed(() => `color-mix(in srgb, ${brand.colors.border} 70%, transparent)`)

// Chips inherit the same translucent vibe but at chip scale.
const chipBg = computed(() => `${brand.colors.surface}B3`) // ~70%
const chipBorder = computed(() => `color-mix(in srgb, ${brand.colors.border} 70%, transparent)`)

// Default to '⌘' on both server and client so the initial markup matches,
// then upgrade to 'Ctrl' on non-Mac platforms after mount. This sidesteps
// an SSR-vs-client hydration mismatch on the kbd badge.
const shortcutModifier = ref('⌘')

// ==========================================================
// Route context — when the user is sitting on an asset, crypto
// or tesouro detail page we promote contextual prompts so the
// teaser feels relevant ("Vale investir em PETR4?" vs a random
// suggestion). The route ref is reactive, so navigating swaps
// the pool automatically.
// ==========================================================
const route = useRoute()

const routeContext = computed(() => {
  const path = route.path || ''
  if (path.startsWith('/asset/')) {
    return { type: 'asset' as const, slug: path.split('/')[2] || '' }
  }
  if (path.startsWith('/crypto/')) {
    return { type: 'crypto' as const, slug: path.split('/')[2] || '' }
  }
  if (path.startsWith('/tesouro/')) {
    return { type: 'tesouro' as const, slug: path.split('/')[2] || '' }
  }
  return null
})

// ==========================================================
// Data sources (reuses the same services as old SearchAssets)
// ==========================================================
const stocks = ref<IAsset[]>([])
const tesouros = ref<any[]>([])
const cryptos = ref<any[]>([])
let dataLoaded = false

async function loadData() {
  if (dataLoaded) return
  isLoading.value = true
  try {
    const assetsService = useAssetsService()
    const tesouroService = useTesouroService()
    const cryptoService = useCryptoService()

    const [assetsRes, tesouroRes, cryptoRes] = await Promise.allSettled([
      assetsService.getAssets?.() ?? Promise.resolve([]),
      tesouroService.listTesouros?.() ?? Promise.resolve([]),
      cryptoService.listCryptos?.(500) ?? Promise.resolve([]),
    ])

    if (assetsRes.status === 'fulfilled') stocks.value = assetsRes.value || []
    if (tesouroRes.status === 'fulfilled') tesouros.value = tesouroRes.value || []
    if (cryptoRes.status === 'fulfilled') cryptos.value = cryptoRes.value || []
    dataLoaded = true
  } catch {
    // graceful degrade
  } finally {
    isLoading.value = false
  }
}

// ==========================================================
// Mappers — normalize each source to the SearchItem shape
// ==========================================================
function fmtBRL(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value).replace(/\s/g, '\u00A0')
}

function fmtPct(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function mapStock(a: IAsset): SearchItem {
  return {
    id: `stock-${a.ticker}`,
    ticker: a.ticker,
    name: a.name || a.ticker,
    to: `/asset/${a.ticker.toLowerCase()}`,
    logo: a.logo || null,
    priceLabel: a.market_price != null ? fmtBRL(a.market_price) : null,
    changePercent: a.change_percent ?? null,
    changeLabel: a.change_percent != null ? fmtPct(a.change_percent) : null,
  }
}

function mapTesouro(t: any): SearchItem {
  const indexer = (t.indexer || t.indexer_label || '').toString().toUpperCase()
  const yearShort = t.maturity_date ? new Date(t.maturity_date).getFullYear() : ''
  const ticker = `${indexer || 'TD'}${yearShort ? ` ${yearShort}` : ''}`.trim()
  const rate = t.rate || (t.rate_numeric != null ? `${t.rate_numeric.toFixed(2)}%` : null)
  return {
    id: `tesouro-${t.slug ?? t.id}`,
    ticker,
    name: t.name || 'Tesouro Direto',
    to: `/tesouro/${t.slug ?? ''}`,
    logo: null,
    priceLabel: rate,
    changePercent: null,
    changeLabel: null,
  }
}

function mapCrypto(c: any): SearchItem {
  const sym = (c.symbol || c.id || '').toString().toUpperCase()
  return {
    id: `crypto-${c.id ?? sym}`,
    ticker: sym,
    name: c.name || sym,
    to: `/crypto/${(c.id ?? sym).toString().toLowerCase()}`,
    logo: c.image || null,
    priceLabel: c.price_brl != null ? fmtBRL(c.price_brl) : null,
    changePercent: c.change_24h_pct ?? null,
    changeLabel: c.change_24h_pct != null ? fmtPct(c.change_24h_pct) : null,
  }
}

// ==========================================================
// Grouping + filtering
// ==========================================================
const stockItems = computed(() => stocks.value.filter((a) => a.type === 'STOCK').map(mapStock))
const reitItems = computed(() => stocks.value.filter((a) => a.type === 'REIT').map(mapStock))
const etfItems = computed(() => stocks.value.filter((a) => a.type === 'ETF').map(mapStock))
const bdrItems = computed(() => stocks.value.filter((a) => a.type === 'BDR').map(mapStock))
const cryptoItems = computed(() => cryptos.value.map(mapCrypto))
const tesouroItems = computed(() => tesouros.value.map(mapTesouro))

function matches(item: SearchItem, q: string): boolean {
  const lower = q.toLowerCase()
  return item.ticker.toLowerCase().includes(lower) || item.name.toLowerCase().includes(lower)
}

const groupedItems = computed<Group[]>(() => {
  const q = searchTerm.value.trim().toLowerCase()
  // Limits: when idle = 1 representative per group; when searching = 5 per group
  const limit = q.length > 0 ? 5 : 1

  const filterAndSlice = (items: SearchItem[]) => {
    const filtered = q ? items.filter((i) => matches(i, q)) : items
    return filtered.slice(0, limit)
  }

  return [
    { type: 'STOCK', label: 'Ações', items: filterAndSlice(stockItems.value) },
    { type: 'REIT', label: 'FIIs', items: filterAndSlice(reitItems.value) },
    { type: 'ETF', label: 'ETFs', items: filterAndSlice(etfItems.value) },
    { type: 'BDR', label: 'BDRs', items: filterAndSlice(bdrItems.value) },
    { type: 'CRYPTO', label: 'Criptomoedas', items: filterAndSlice(cryptoItems.value) },
    { type: 'TESOURO', label: 'Tesouro Direto', items: filterAndSlice(tesouroItems.value) },
  ]
})

const filteredItems = computed(() => groupedItems.value.flatMap((g) => g.items))

// Idle chips — flat list of one representative per group, used to render
// minimal pills above the input when the user hasn't typed anything yet.
// We tag each chip with its group type so keyboard focus tracking still
// works against the existing `(groupType, idx)` focus-key scheme.
const idleChips = computed<Array<SearchItem & { groupType: GroupType }>>(() => {
  const out: Array<SearchItem & { groupType: GroupType }> = []
  for (const g of groupedItems.value) {
    if (g.items[0]) out.push({ ...g.items[0], groupType: g.type })
  }
  return out
})

// ==========================================================
// Idle rotating suggestions — while the user isn't using the
// input, we cycle through teaser prompts inside the pill:
//   1. Random ticker chip → /asset/{ticker}
//   2. "Como está o {ticker} hoje?" → /help?q=...
//   3. "O {ticker} está caindo?" → /help?q=...
//   4. "O {ticker} caiu?" → /help?q=...
//   5. Category shortcuts → /search?... (Tesouro, Cripto,
//      Small caps, Altas/Quedas de hoje)
// Each suggestion has prefix/highlight/suffix segments so the
// ticker can be styled differently from the surrounding copy.
// ==========================================================
interface Suggestion {
  id: string
  to: string
  prefix?: string
  highlight: string
  suffix?: string
  text: string // plain text used for aria-label
  logo?: string | null
  icon?: string | null
  mono?: boolean // monospace font for tickers only
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr || arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]!
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

// Build a chat-style suggestion that goes to /help with the question
// pre-filled. We always wrap the asset's ticker in `highlight` so the
// dim/bold rhythm stays consistent across every variant.
function buildAssetChat(opts: {
  prefix: string
  highlight: string
  suffix?: string
  logo?: string | null
  mono?: boolean
  idTag: string
}): Suggestion {
  const text = `${opts.prefix}${opts.highlight}${opts.suffix ?? ''}`
  return {
    id: opts.idTag,
    to: `/help?q=${encodeURIComponent(text)}`,
    prefix: opts.prefix,
    highlight: opts.highlight,
    suffix: opts.suffix,
    text,
    logo: opts.logo ?? null,
    mono: opts.mono ?? false,
  }
}

// Long-form chat templates per asset class. Each template carries the
// "{ticker}" placeholder which is replaced when we know the asset on
// the current route. The list is intentionally generous — the rotation
// shuffles and the user sees a fresh question every refresh.
const STOCK_TEMPLATES: Array<{ prefix: string; suffix?: string }> = [
  { prefix: 'Por que o ', suffix: ' está caindo?' },
  { prefix: 'Por que o ', suffix: ' está subindo?' },
  { prefix: 'Vale investir em ', suffix: '?' },
  { prefix: 'Relatório completo do ', suffix: '' },
  { prefix: 'Análise técnica do ', suffix: '' },
  { prefix: 'Análise fundamentalista do ', suffix: '' },
  { prefix: 'Qual o dividend yield do ', suffix: '?' },
  { prefix: 'O ', suffix: ' paga bons dividendos?' },
  { prefix: 'Histórico de dividendos do ', suffix: '' },
  { prefix: 'Quais os fundamentos do ', suffix: '?' },
  { prefix: 'P/L atual do ', suffix: '' },
  { prefix: 'ROE do ', suffix: '' },
  { prefix: 'Endividamento do ', suffix: '' },
  { prefix: 'Quem são os concorrentes do ', suffix: '?' },
  { prefix: 'Setor de atuação do ', suffix: '' },
  { prefix: 'Próximos resultados do ', suffix: '' },
  { prefix: 'Riscos de investir em ', suffix: '' },
  { prefix: 'Devo comprar ', suffix: ' agora?' },
  { prefix: 'Devo vender ', suffix: ' agora?' },
  { prefix: 'Maior alta de ', suffix: ' no ano' },
  { prefix: 'Maior queda de ', suffix: ' no ano' },
  { prefix: 'Histórico de cotações do ', suffix: '' },
  { prefix: 'Comparar ', suffix: ' com pares' },
  { prefix: 'O ', suffix: ' vai bater novo topo?' },
  { prefix: 'Tese de investimento em ', suffix: '' },
]

const CRYPTO_TEMPLATES: Array<{ prefix: string; suffix?: string }> = [
  { prefix: 'Por que o ', suffix: ' está caindo?' },
  { prefix: 'Por que o ', suffix: ' está subindo?' },
  { prefix: 'Vale comprar ', suffix: ' agora?' },
  { prefix: 'O ', suffix: ' vai subir?' },
  { prefix: 'Análise técnica do ', suffix: '' },
  { prefix: 'Quanto vale 1 ', suffix: '?' },
  { prefix: 'Quanto valia o ', suffix: ' há 1 ano?' },
  { prefix: 'Histórico de preços do ', suffix: '' },
  { prefix: 'Capitalização de mercado do ', suffix: '' },
  { prefix: 'O ', suffix: ' é seguro?' },
  { prefix: 'Como funciona o ', suffix: '?' },
  { prefix: 'Quem criou o ', suffix: '?' },
  { prefix: 'Qual a tecnologia do ', suffix: '?' },
  { prefix: 'Volume de negociação do ', suffix: '' },
  { prefix: 'Carteiras compatíveis com ', suffix: '' },
  { prefix: 'O ', suffix: ' tem futuro?' },
  { prefix: 'Riscos de investir em ', suffix: '' },
  { prefix: 'Onde comprar ', suffix: '?' },
  { prefix: 'Comparar ', suffix: ' com Bitcoin' },
  { prefix: 'Comparar ', suffix: ' com Ethereum' },
  { prefix: 'Próximo halving do ', suffix: '' },
  { prefix: 'Devo manter ', suffix: ' na carteira?' },
  { prefix: 'O ', suffix: ' vai voltar a subir?' },
  { prefix: 'Maior alta histórica de ', suffix: '' },
  { prefix: 'Maior queda histórica de ', suffix: '' },
]

const TESOURO_TEMPLATES: Array<{ prefix: string; suffix?: string }> = [
  { prefix: 'Vale investir em ', suffix: '?' },
  { prefix: 'Quanto rende o ', suffix: '?' },
  { prefix: 'O ', suffix: ' é seguro?' },
  { prefix: 'Posso resgatar ', suffix: ' antes do vencimento?' },
  { prefix: 'Tributação do ', suffix: '' },
  { prefix: 'Marcação a mercado do ', suffix: '' },
  { prefix: 'Como funciona o ', suffix: '?' },
  { prefix: 'Quando vence o ', suffix: '?' },
  { prefix: 'Como comprar o ', suffix: '' },
  { prefix: 'Vale a pena no cenário atual o ', suffix: '?' },
  { prefix: 'Histórico de rentabilidade do ', suffix: '' },
  { prefix: 'Comparar ', suffix: ' com a Selic' },
  { prefix: 'Comparar ', suffix: ' com CDB' },
  { prefix: 'Comparar ', suffix: ' com LCI' },
  { prefix: 'Custos de investir em ', suffix: '' },
  { prefix: 'Risco de perder dinheiro com ', suffix: '?' },
  { prefix: 'Imposto de renda no ', suffix: '' },
  { prefix: 'Pagamento de juros do ', suffix: '' },
  { prefix: 'Indicado para reserva de emergência o ', suffix: '?' },
  { prefix: 'Vale para aposentadoria o ', suffix: '?' },
]

// Build a contextual pool for the current route. Returns null when we
// can't resolve the asset (data still loading, slug not found, etc).
function buildContextualPool(): Suggestion[] | null {
  const ctx = routeContext.value
  if (!ctx) return null

  if (ctx.type === 'asset') {
    const ticker = ctx.slug.toUpperCase()
    const stock = stocks.value.find((s) => s.ticker?.toUpperCase() === ticker)
    if (!stock) return null
    const logo = stock.logo || null
    const pool = STOCK_TEMPLATES.map((t, i) =>
      buildAssetChat({
        prefix: t.prefix,
        highlight: stock.ticker,
        suffix: t.suffix,
        logo,
        mono: true,
        idTag: `ctx-stock-${i}-${stock.ticker}`,
      }),
    )
    // Always include a "go to asset" deep-link as the first card so the
    // contextual variant doesn't push the user away from the page they're
    // already on; this teaser links to the help chat instead via templates,
    // so we add an explicit "Análise de" pointing to the same page.
    pool.unshift({
      id: `ctx-stock-asset-${stock.ticker}`,
      to: `/asset/${stock.ticker.toLowerCase()}`,
      prefix: 'Análise de ',
      highlight: stock.ticker,
      text: `Análise de ${stock.ticker}`,
      logo,
      mono: true,
    })
    return shuffleInPlace(pool)
  }

  if (ctx.type === 'crypto') {
    const slug = ctx.slug.toLowerCase()
    const crypto = cryptos.value.find(
      (c: any) => (c.id || '').toString().toLowerCase() === slug || (c.symbol || '').toString().toLowerCase() === slug,
    )
    if (!crypto) return null
    const sym = (crypto.symbol || '').toUpperCase()
    const logo = crypto.image || null
    const pool = CRYPTO_TEMPLATES.map((t, i) =>
      buildAssetChat({
        prefix: t.prefix,
        highlight: sym,
        suffix: t.suffix,
        logo,
        mono: true,
        idTag: `ctx-crypto-${i}-${sym}`,
      }),
    )
    pool.unshift({
      id: `ctx-crypto-asset-${sym}`,
      to: `/crypto/${(crypto.id ?? sym).toString().toLowerCase()}`,
      prefix: 'Análise de ',
      highlight: sym,
      text: `Análise de ${sym}`,
      logo,
      mono: true,
    })
    return shuffleInPlace(pool)
  }

  if (ctx.type === 'tesouro') {
    const slug = ctx.slug
    const t = tesouros.value.find((x: any) => (x.slug || '').toString() === slug)
    if (!t) return null
    // Normalise the indexer into a short, recognisable label so the
    // suggestion reads naturally ("Tesouro IPCA+ 2026" vs the raw
    // "Indexados ao IPCA" coming from the API).
    const rawIndexer = (t.indexer || t.indexer_label || '').toString().toLowerCase()
    let shortIndexer = 'TD'
    if (rawIndexer.includes('ipca')) shortIndexer = 'IPCA+'
    else if (rawIndexer.includes('selic')) shortIndexer = 'Selic'
    else if (rawIndexer.includes('prefixado')) shortIndexer = 'Prefixado'
    else if (rawIndexer.includes('igp')) shortIndexer = 'IGP-M'
    const year = t.maturity_date ? new Date(t.maturity_date).getFullYear() : ''
    const ticker = year ? `Tesouro ${shortIndexer} ${year}` : `Tesouro ${shortIndexer}`
    const pool = TESOURO_TEMPLATES.map((tpl, i) =>
      buildAssetChat({
        prefix: tpl.prefix,
        highlight: ticker,
        suffix: tpl.suffix,
        logo: null,
        mono: false,
        idTag: `ctx-tesouro-${i}-${slug}`,
      }),
    )
    return shuffleInPlace(pool)
  }

  return null
}

const suggestionsPool = computed<Suggestion[]>(() => {
  // Prefer route-aware suggestions when the user is on an asset, crypto
  // or tesouro detail page. Falls back to the generic browse pool when
  // we can't resolve the route asset (data still loading, slug typo,
  // etc) or when not on a recognised page.
  const contextual = buildContextualPool()
  if (contextual && contextual.length > 0) return contextual

  const pool: Suggestion[] = []
  const stockPool = stocks.value.filter((a) => a.type === 'STOCK' && a.logo)
  const cryptoPool = cryptos.value.filter((c) => c.image && c.symbol)

  // Pick distinct random samples to avoid the same ticker appearing in
  // every suggestion. We rebuild the pool whenever data changes, so the
  // page feels alive across refresh.
  const stockA = pickRandom(stockPool)
  const stockB = pickRandom(stockPool.filter((s) => s !== stockA))
  const cryptoA = pickRandom(cryptoPool)
  const cryptoB = pickRandom(cryptoPool.filter((c) => c !== cryptoA))

  // Variant 1: ticker chip with action verb prefix, goes to the asset.
  // We always wrap the highlight with at least one muted segment so the
  // contrast between dim copy and bold ticker reads consistently.
  if (stockA) {
    pool.push({
      id: `t-asset-${stockA.ticker}`,
      to: `/asset/${stockA.ticker.toLowerCase()}`,
      prefix: 'Análise de ',
      highlight: stockA.ticker,
      text: `Análise de ${stockA.ticker}`,
      logo: stockA.logo || null,
      mono: true,
    })
  }
  if (cryptoA) {
    const sym = (cryptoA.symbol || '').toUpperCase()
    pool.push({
      id: `c-asset-${sym}`,
      to: `/crypto/${(cryptoA.id ?? sym).toString().toLowerCase()}`,
      prefix: 'Análise de ',
      highlight: sym,
      text: `Análise de ${sym}`,
      logo: cryptoA.image || null,
      mono: true,
    })
  }

  // Variant 2: "Como está o {ticker} hoje?" — goes to chat
  if (stockA) {
    const q = `Como está o ${stockA.ticker} hoje?`
    pool.push({
      id: `q-status-${stockA.ticker}`,
      to: `/help?q=${encodeURIComponent(q)}`,
      prefix: 'Como está o ',
      highlight: stockA.ticker,
      suffix: ' hoje?',
      text: q,
      logo: stockA.logo || null,
      mono: true,
    })
  }
  if (cryptoA) {
    const sym = (cryptoA.symbol || '').toUpperCase()
    const q = `Como está o ${sym} hoje?`
    pool.push({
      id: `q-status-${sym}`,
      to: `/help?q=${encodeURIComponent(q)}`,
      prefix: 'Como está o ',
      highlight: sym,
      suffix: ' hoje?',
      text: q,
      logo: cryptoA.image || null,
      mono: true,
    })
  }

  // Variant 3: "O {ticker} está caindo?"
  if (stockB) {
    const q = `O ${stockB.ticker} está caindo?`
    pool.push({
      id: `q-falling-${stockB.ticker}`,
      to: `/help?q=${encodeURIComponent(q)}`,
      prefix: 'O ',
      highlight: stockB.ticker,
      suffix: ' está caindo?',
      text: q,
      logo: stockB.logo || null,
      mono: true,
    })
  }
  if (cryptoB) {
    const sym = (cryptoB.symbol || '').toUpperCase()
    const q = `O ${sym} caiu?`
    pool.push({
      id: `q-crashed-${sym}`,
      to: `/help?q=${encodeURIComponent(q)}`,
      prefix: 'O ',
      highlight: sym,
      suffix: ' caiu?',
      text: q,
      logo: cryptoB.image || null,
      mono: true,
    })
  }

  // Variant 4: category links (no logo, lucide icon instead).
  // Same dim-prefix / bold-keyword pattern as the question variants so
  // the visual rhythm stays consistent across the rotation.
  pool.push(
    {
      id: 'cat-tesouro',
      to: '/search?indexer=IPCA',
      prefix: 'Explorar ',
      highlight: 'Tesouro Direto',
      text: 'Explorar Tesouro Direto',
      icon: 'i-lucide-shield-check',
    },
    {
      id: 'cat-cripto',
      to: '/search?crypto=1&sort=MCAP',
      prefix: 'Explorar ',
      highlight: 'Criptomoedas',
      text: 'Explorar Criptomoedas',
      icon: 'i-lucide-bitcoin',
    },
    {
      id: 'cat-smallcaps',
      to: '/search?group=stocks&mc_max=2000000000',
      prefix: 'Conheça as ',
      highlight: 'Small Caps',
      text: 'Conheça as Small Caps',
      icon: 'i-lucide-zap',
    },
    {
      id: 'cat-up',
      to: '/search?group=stocks&ch_min=0',
      prefix: 'Quem subiu ',
      highlight: 'hoje',
      suffix: '?',
      text: 'Quem subiu hoje?',
      icon: 'i-lucide-trending-up',
    },
    {
      id: 'cat-down',
      to: '/search?group=stocks&ch_max=0',
      prefix: 'Quem caiu ',
      highlight: 'hoje',
      suffix: '?',
      text: 'Quem caiu hoje?',
      icon: 'i-lucide-trending-down',
    },
  )

  // Shuffle so the user gets a different sequence each refresh
  return shuffleInPlace(pool)
})

// Reset the rotation when the route changes — a contextual pool may
// have just been built and we want the very first suggestion the user
// sees to be relevant to the page they're on.
watch(
  () => route.path,
  () => {
    suggestionIndex.value = 0
  },
)

const suggestionIndex = ref(0)
const currentSuggestion = computed<Suggestion | null>(() => {
  const pool = suggestionsPool.value
  if (pool.length === 0) return null
  return pool[suggestionIndex.value % pool.length] ?? null
})

let suggestionTimer: ReturnType<typeof setInterval> | null = null

function startSuggestionRotation() {
  stopSuggestionRotation()
  // Honour reduced-motion: don't auto-cycle content if the user has
  // asked for less motion. We still show the first suggestion as a
  // static teaser so the link affordance stays visible.
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    return
  }
  // Rotate every ~3.6s. Long enough to read a sentence, short enough
  // to feel alive. Skipped automatically when the panel is open.
  suggestionTimer = setInterval(() => {
    if (open.value) return
    if (suggestionsPool.value.length <= 1) return
    suggestionIndex.value = (suggestionIndex.value + 1) % suggestionsPool.value.length
  }, 3600)
}

function stopSuggestionRotation() {
  if (suggestionTimer) {
    clearInterval(suggestionTimer)
    suggestionTimer = null
  }
}

// stagedSuggestion is the rotating suggestion the user clicked while
// idle. We DON'T navigate immediately on that first click — instead we
// open the panel and surface a minimal preview chip above the input.
// A second click on that chip commits and navigates.
const stagedSuggestion = ref<Suggestion | null>(null)

function onSuggestionClick() {
  // The trigger is a <button>, so the browser doesn't navigate on its
  // own. We stage the suggestion as a confirm chip above the input —
  // navigation only happens on the user's second click on that chip.
  if (!currentSuggestion.value) return
  stagedSuggestion.value = currentSuggestion.value
  // Stop the rotation while staged so the user's choice doesn't shift
  // under their cursor before they confirm.
  stopSuggestionRotation()
  open.value = true
  void nextTick(() => inputEl.value?.focus())
}

function commitStagedSuggestion() {
  const s = stagedSuggestion.value
  if (!s) return
  router.push(s.to)
  // Reset state after navigation
  stagedSuggestion.value = null
  close()
}

// Wrapper around the input + suggestion overlay. The link's @click.stop
// keeps suggestion clicks from bubbling here; everything else falls
// through to open the panel and focus the input. We set `open` directly
// because programmatic .focus() doesn't always fire the focus event in
// every browser (especially when the input was already the active
// element after a back-navigation), so relying on @focus alone can miss.
function onInputAreaClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (target?.closest('a')) return
  open.value = true
  void nextTick(() => inputEl.value?.focus())
}

// "Ask the AI" virtual item — only present when the user typed something.
// Routes to /help so the chat handles the actual answering. Pre-fills the
// query via ?q= so help.vue can prompt with it on mount.
const askAiItem = computed<SearchItem | null>(() => {
  const q = searchTerm.value.trim()
  if (!q) return null
  return {
    id: 'ai-ask',
    ticker: 'IA',
    name: 'Perguntar para a IA',
    to: `/help?q=${encodeURIComponent(q)}`,
    logo: null,
    priceLabel: null,
    changePercent: null,
    changeLabel: null,
  }
})

// ==========================================================
// Focus / keyboard navigation
// ==========================================================
function focusKey(type: GroupType, idx: number): string {
  return `${type}-${idx}`
}

function isFocused(type: GroupType, idx: number): boolean {
  return focusedKey.value === focusKey(type, idx)
}

function setFocus(type: GroupType, idx: number) {
  focusedKey.value = focusKey(type, idx)
}

const flatNavigable = computed(() => {
  const out: { type: GroupType; idx: number; item: SearchItem }[] = []
  // Ask-AI row is always first when present
  if (askAiItem.value) {
    out.push({ type: 'AI', idx: 0, item: askAiItem.value })
  }
  for (const g of groupedItems.value) {
    g.items.forEach((item, idx) => {
      out.push({ type: g.type, idx, item })
    })
  }
  return out
})

function focusedItemMeta() {
  const flat = flatNavigable.value
  return flat.find((f) => focusKey(f.type, f.idx) === focusedKey.value)
}

function moveFocus(delta: 1 | -1) {
  const flat = flatNavigable.value
  if (flat.length === 0) return
  const currentIdx = flat.findIndex((f) => focusKey(f.type, f.idx) === focusedKey.value)
  let nextIdx = currentIdx + delta
  if (nextIdx < 0) nextIdx = flat.length - 1
  if (nextIdx >= flat.length) nextIdx = 0
  const next = flat[nextIdx]
  focusedKey.value = focusKey(next.type, next.idx)
}

function changeColor(pct: number | null | undefined): string {
  if (pct == null) return brand.colors.textMuted
  if (pct > 0) return brand.colors.positive
  if (pct < 0) return brand.colors.negative
  return brand.colors.textMuted
}

const router = useRouter()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveFocus(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveFocus(-1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const focused = focusedItemMeta()
    if (focused) {
      router.push(focused.item.to)
      close()
    } else if (flatNavigable.value[0]) {
      router.push(flatNavigable.value[0].item.to)
      close()
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

function close() {
  open.value = false
  focusedKey.value = null
  // Clear input + staged suggestion so the next time the user opens the
  // search they start from a clean slate (matches the user expectation
  // that closing wipes any in-progress query).
  searchTerm.value = ''
  stagedSuggestion.value = null
  if (inputEl.value && document.activeElement === inputEl.value) {
    inputEl.value.blur()
  }
}

// Clear the staged preview as soon as the user starts typing — they're
// committing to a new query and the old suggestion is no longer relevant.
watch(searchTerm, (val) => {
  if (val && stagedSuggestion.value) {
    stagedSuggestion.value = null
  }
})

// Reset focus when results change so the first item is highlighted
watch([filteredItems, askAiItem], () => {
  if (open.value && flatNavigable.value.length > 0) {
    const first = flatNavigable.value[0]
    if (first) focusedKey.value = focusKey(first.type, first.idx)
  } else {
    focusedKey.value = null
  }
})

// Load data the first time the panel opens; warm up shortcut handler
watch(open, async (val) => {
  if (val) {
    await loadData()
    await nextTick()
    inputEl.value?.focus()
  }
})

// Global Cmd/Ctrl+K shortcut
function onGlobalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value = !open.value
    if (open.value) {
      // Refocus input on next tick
      nextTick(() => inputEl.value?.focus())
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', onGlobalKey)
  if (typeof navigator !== 'undefined' && !/Mac|iP(hone|ad)/.test(navigator.platform)) {
    shortcutModifier.value = 'Ctrl'
  }
  // Kick off rotation. Data may still be loading, in which case the pool
  // contains only category suggestions (no ticker variants); the watcher
  // below will refresh once tickers arrive.
  void loadData().then(() => {
    // Reset index so the first suggestion shown picks from the freshly
    // populated pool rather than something pre-shuffled from a partial set.
    suggestionIndex.value = 0
    startSuggestionRotation()
  })
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onGlobalKey)
  stopSuggestionRotation()
})

// Pause/resume rotation around the open state — no point cycling text
// the user can't see while they're typing.
watch(open, (val) => {
  if (val) stopSuggestionRotation()
  else startSuggestionRotation()
})
</script>

<style scoped>
/* ============================================================
   Panel — translucent glass surface. The blur is here (not
   inline) so the browser composites it once and we keep
   reactivity on the colored layer above.
   ============================================================ */
.qs-panel {
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  box-shadow:
    0 24px 60px -20px rgba(0, 0, 0, 0.55),
    0 1px 0 rgba(255, 255, 255, 0.04) inset;
}

/* Hide the scrollbar but keep scrolling functional */
.qs-scroll {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
.qs-scroll::-webkit-scrollbar {
  width: 6px;
}
.qs-scroll::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 999px;
}
.qs-scroll:hover::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}

/* ============================================================
   Pill — idle hover applies a soft primary ring so the user
   gets immediate affordance feedback. Open state already gets
   primary border via inline style; we just upgrade the shadow.
   ============================================================ */
.quick-search-pill {
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.4);
}

/* Hide the native browser "clear" affordance on type="search" inputs
   (the small × that Chrome/Safari render on the right). We provide our
   own clear button so showing both would duplicate the control. */
.quick-search-pill input[type='search']::-webkit-search-cancel-button,
.quick-search-pill input[type='search']::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}
.quick-search-pill input[type='search'] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.qs-pill-idle:hover {
  border-color: var(--qs-primary) !important;
  box-shadow:
    0 12px 32px -12px rgba(0, 0, 0, 0.4),
    0 0 0 3px var(--qs-primary-soft);
}

.qs-pill-open {
  box-shadow:
    0 24px 50px -16px rgba(0, 0, 0, 0.6),
    0 0 0 3px var(--qs-primary-soft);
}

/* ============================================================
   Result pill rows — minimalist surfaces. No border, no glow,
   just a soft tinted background that gets slightly stronger on
   hover/focus. Soft-rounded corners (rounded-xl in the template)
   keep the panel feeling clean and modern.
   ============================================================ */
.qs-pill-row:hover {
  background-color: color-mix(in srgb, currentColor 8%, transparent);
}

/* Hero (Ask AI) — same minimal language: subtle hover tint, no
   glow, no primary border. Sparkles icon does the AI signalling. */
.qs-hero:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
}

/* Staged confirm chip — full primary ring on hover so the user
   knows this is the commit step. Inherits the chip base styling
   already defined below. */
.qs-staged-chip {
  box-shadow: 0 6px 18px -10px rgba(0, 0, 0, 0.5);
}
.qs-staged-chip:hover {
  border-color: var(--qs-primary, #f5b301) !important;
  background-color: color-mix(in srgb, var(--qs-primary, #f5b301) 14%, transparent) !important;
  transform: translateY(-1px);
}

/* ============================================================
   Chips (idle state) — small translucent pills floating above
   the pill. Hover lifts gently and tints the border primary so
   keyboard nav and mouse hover both feel responsive.
   ============================================================ */
.qs-chips {
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
}

.qs-chip {
  box-shadow: 0 4px 14px -8px rgba(0, 0, 0, 0.45);
}
.qs-chip:hover {
  border-color: var(--qs-primary) !important;
  background-color: color-mix(in srgb, var(--qs-primary, #f5b301) 12%, transparent) !important;
  transform: translateY(-1px);
}
.qs-chip-focused {
  border-color: var(--qs-primary) !important;
  background-color: color-mix(in srgb, var(--qs-primary, #f5b301) 12%, transparent) !important;
}

/* Stagger entrance — pure CSS, runs once on mount */
.qs-chips-enter-active {
  transition:
    opacity 220ms ease,
    transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.qs-chips-leave-active {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}
.qs-chips-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.qs-chips-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* ============================================================
   Rotating suggestion overlay — fades in from below, fades out
   upward. Slow enough to feel composed (220ms) but quick enough
   to keep up with the 3.6s cycle.
   ============================================================ */
.qs-suggest {
  cursor: pointer;
  border-radius: 999px;
  transition: color 140ms ease, opacity 140ms ease;
}
.qs-suggest:hover .qs-suggest-text > span:not(:first-child) {
  /* On hover, lift the muted text a bit so the link feels live */
  opacity: 1;
}

.qs-suggest-enter-active {
  transition:
    opacity 220ms cubic-bezier(0.2, 0.7, 0.3, 1),
    transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.qs-suggest-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
  position: absolute;
}
.qs-suggest-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.qs-suggest-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ============================================================
   Transitions
   ============================================================ */
.qs-backdrop-enter-active,
.qs-backdrop-leave-active {
  transition: opacity 200ms ease;
}
.qs-backdrop-enter-from,
.qs-backdrop-leave-to {
  opacity: 0;
}

.qs-panel-enter-active,
.qs-panel-leave-active {
  transition:
    opacity 200ms cubic-bezier(0.2, 0.7, 0.3, 1),
    transform 200ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.qs-panel-enter-from,
.qs-panel-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .qs-backdrop-enter-active,
  .qs-backdrop-leave-active,
  .qs-panel-enter-active,
  .qs-panel-leave-active,
  .qs-suggest-enter-active,
  .qs-suggest-leave-active,
  .qs-pill-row {
    transition: none;
  }
  .qs-pill-row:hover {
    transform: none;
  }
}
</style>
