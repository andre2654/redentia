<script setup lang="ts">
// PROTÓTIPO /simulacao — montador de carteira v3 (feedback do dono, 25/08):
// a tela mostra só a CARTEIRA; um input-gatilho abre o modal de busca com os
// ativos (busca + pills de classe, toggle sem fechar — monta com vários
// toques). Modal no padrão da casa: Teleport + useModalA11y + Esc/scrim/X.
import { ASSET_CATALOG, EXAMPLE_PORTFOLIO, fmtBRLFull, type SimPortfolioInput } from './simMock'

const model = defineModel<SimPortfolioInput[]>({ required: true })

const CLASSES = ['Todos', 'Ação', 'FII', 'ETF', 'BDR'] as const
const klass = ref<(typeof CLASSES)[number]>('Todos')
const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return ASSET_CATALOG.filter((a) => {
    if (klass.value !== 'Todos' && a.klass !== klass.value) return false
    if (!q) return true
    return a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
  })
})

const DEFAULT_VALUE = 25_000
const held = computed(() => new Set(model.value.map((p) => p.ticker)))
function toggle(ticker: string) {
  if (held.value.has(ticker)) model.value = model.value.filter((p) => p.ticker !== ticker)
  else model.value = [...model.value, { ticker, value: DEFAULT_VALUE }]
}
function setValue(ticker: string, raw: string) {
  const v = Number(raw.replace(/\D/g, ''))
  model.value = model.value.map((p) => (p.ticker === ticker ? { ...p, value: Number.isFinite(v) ? v : 0 } : p))
}
function remove(ticker: string) {
  model.value = model.value.filter((p) => p.ticker !== ticker)
}
function loadExample() {
  model.value = [...EXAMPLE_PORTFOLIO]
}

const total = computed(() => model.value.reduce((s, p) => s + p.value, 0))
function meta(ticker: string) {
  return ASSET_CATALOG.find((a) => a.ticker === ticker)
}
function weightPct(p: SimPortfolioInput): string {
  return total.value > 0 ? `${Math.round((p.value / total.value) * 100)}%` : '—'
}

const CLASS_COLOR: Record<string, string> = {
  'Ação': 'var(--nu-alloc-stock)',
  'FII': 'var(--nu-alloc-fii)',
  'ETF': 'var(--nu-class-etf)',
  'BDR': 'var(--nu-class-bdr)',
}
const allocation = computed(() => {
  if (total.value <= 0) return []
  const byClass = new Map<string, number>()
  for (const p of model.value) {
    const k = meta(p.ticker)?.klass ?? 'Ação'
    byClass.set(k, (byClass.get(k) ?? 0) + p.value)
  }
  return [...byClass.entries()]
    .map(([k, v]) => ({ klass: k, pct: (v / total.value) * 100, color: CLASS_COLOR[k] ?? 'var(--nu-sand)' }))
    .sort((a, b) => b.pct - a.pct)
})
const fmt = fmtBRLFull

/* ——— modal de busca (padrão da casa) ——— */
const open = ref(false)
const cardRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
useModalA11y(cardRef, open)
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
watch(open, (o) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = o ? 'hidden' : ''
  if (o) {
    document.addEventListener('keydown', onKey)
    search.value = ''
    nextTick(() => searchRef.value?.focus())
  }
  else {
    document.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', onKey)
    if (open.value) document.documentElement.style.overflow = ''
  }
})
// Enter adiciona o primeiro resultado e limpa a busca — montar no teclado
function onSearchEnter() {
  const first = filtered.value.find((a) => !held.value.has(a.ticker)) ?? filtered.value[0]
  if (!first) return
  toggle(first.ticker)
  search.value = ''
}
</script>

<template>
  <div class="spb">
    <button type="button" class="spb__trigger" @click="open = true">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
      <span class="spb__trigger-txt">Buscar ativo…</span>
      <span class="spb__trigger-add" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </span>
    </button>

    <!-- a carteira montada -->
    <div v-if="model.length" class="spb__cart">
      <div class="spb__cart-head">
        <span class="spb__cart-title">Sua carteira</span>
        <span class="spb__cart-total">{{ fmt(total) }}</span>
      </div>

      <div class="spb__alloc" aria-hidden="true">
        <i v-for="a in allocation" :key="a.klass" :style="{ width: `${a.pct}%`, background: a.color }" :title="`${a.klass} ${Math.round(a.pct)}%`" />
      </div>

      <div v-for="p in model" :key="p.ticker" class="spb__row">
        <NuAssetLogo :ticker="p.ticker" :letter="p.ticker[0]!" :tile-bg="CLASS_COLOR[meta(p.ticker)?.klass ?? 'Ação'] ?? 'var(--nu-sand)'" tile-fg="var(--nu-white)" :size="30" :radius="9" />
        <span class="spb__row-main">
          <b class="spb__row-ticker">{{ p.ticker }}</b>
          <em class="spb__row-weight">{{ weightPct(p) }}</em>
        </span>
        <label class="spb__row-value">
          <span class="spb__row-rs">R$</span>
          <input
            class="spb__row-input" type="text" inputmode="numeric"
            :value="p.value.toLocaleString('pt-BR')"
            @change="setValue(p.ticker, ($event.target as HTMLInputElement).value)"
          >
        </label>
        <button type="button" class="spb__row-del" aria-label="Remover" @click="remove(p.ticker)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>

    <div v-else class="spb__cart-actions">
      <button type="button" class="spb__ghost" @click="loadExample">Carteira de exemplo</button>
    </div>

    <!-- ——— modal de busca ——— -->
    <Teleport to="body">
      <div v-if="open" class="spbm" role="presentation" @click.self="open = false">
        <div ref="cardRef" class="spbm__card" role="dialog" aria-modal="true" aria-label="Buscar ativo" tabindex="-1">
          <div class="spbm__search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
            <input
              ref="searchRef" v-model="search" type="text" class="spbm__search-input"
              placeholder="Buscar por ticker ou nome…" @keydown.enter.prevent="onSearchEnter"
            >
            <button type="button" class="spbm__close" aria-label="Fechar" @click="open = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <div class="spbm__filters">
            <button
              v-for="c in CLASSES" :key="c" type="button"
              class="spbm__filter" :class="{ 'spbm__filter--on': klass === c }"
              @click="klass = c"
            >{{ c === 'Todos' ? 'Todos' : c + 's' }}</button>
          </div>

          <div class="spbm__list">
            <button
              v-for="a in filtered" :key="a.ticker" type="button"
              class="spbm__asset" :class="{ 'spbm__asset--held': held.has(a.ticker) }"
              @click="toggle(a.ticker)"
            >
              <NuAssetLogo :ticker="a.ticker" :letter="a.ticker[0]!" :tile-bg="CLASS_COLOR[a.klass] ?? 'var(--nu-sand)'" tile-fg="var(--nu-white)" :size="34" :radius="10" />
              <span class="spbm__asset-main">
                <b class="spbm__asset-ticker">{{ a.ticker }}</b>
                <span class="spbm__asset-name">{{ a.name }}</span>
              </span>
              <span class="spbm__asset-act" :class="{ 'spbm__asset-act--held': held.has(a.ticker) }" aria-hidden="true">
                <svg v-if="held.has(a.ticker)" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l5 5L20 7" /></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </button>
            <p v-if="!filtered.length" class="spbm__empty">Nada com "{{ search }}" neste protótipo.</p>
          </div>

          <div class="spbm__foot">
            <span class="spbm__count">{{ model.length }} na carteira</span>
            <button type="button" class="spbm__done" @click="open = false">Pronto</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.spb { max-width: 640px; display: flex; flex-direction: column; gap: 14px; }

/* input-gatilho: cara de campo de busca, abre o modal */
.spb__trigger {
  display: flex; align-items: center; gap: 11px; width: 100%;
  background: var(--nu-white); border: 1.5px solid transparent; border-radius: var(--nu-r-pill);
  padding: 15px 20px; cursor: pointer; font-family: inherit;
  color: var(--nu-gray); box-shadow: var(--nu-shadow-card);
  transition: border-color 0.15s, transform 0.15s;
}
.spb__trigger:hover { border-color: var(--nu-blue); transform: translateY(-1px); }
.spb__trigger-txt { flex: 1; text-align: left; font-size: 15.5px; font-weight: 600; color: var(--nu-sand); }
.spb__trigger-add {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-blue); color: var(--nu-white);
}

/* carteira */
.spb__cart { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 18px 18px 12px; box-shadow: var(--nu-shadow-card); }
.spb__cart-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 0 4px; }
.spb__cart-title { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.spb__cart-total { color: var(--nu-ink); font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; }
.spb__alloc {
  margin: 12px 4px 8px; height: 7px; border-radius: 999px; overflow: hidden;
  display: flex; background: var(--nu-cream-3);
}
.spb__alloc i { display: block; height: 100%; transition: width 0.35s cubic-bezier(0.22, 0.61, 0.36, 1); }
.spb__row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 4px; border-top: 1px solid var(--nu-cream);
}
.spb__row:first-of-type { border-top: none; }
.spb__row-main { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 8px; }
.spb__row-ticker { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; }
.spb__row-weight { color: var(--nu-gray); font-size: 12px; font-weight: 700; font-style: normal; font-variant-numeric: tabular-nums; }
.spb__row-value {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--nu-cream); border-radius: var(--nu-r-chip); padding: 7px 11px;
}
.spb__row-rs { color: var(--nu-gray); font-size: 12px; font-weight: 700; }
.spb__row-input {
  width: 74px; border: none; background: transparent; outline: none; text-align: right;
  color: var(--nu-ink); font-size: 14px; font-weight: 800; font-family: inherit; font-variant-numeric: tabular-nums;
}
.spb__row-del {
  width: 28px; height: 28px; flex-shrink: 0; border: none; border-radius: 50%;
  background: transparent; color: var(--nu-sand); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.spb__row-del:hover { background: var(--nu-cream); color: var(--nu-red); }

.spb__cart-actions { display: flex; }
.spb__ghost {
  border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-gray-2);
  padding: 10px 18px; font-size: 13.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}
.spb__ghost:hover { border-color: var(--nu-blue); color: var(--nu-blue); }

/* ——— modal (anatomia da casa: scrim + card dia) ——— */
.spbm {
  position: fixed; inset: 0; z-index: 120;
  display: flex; align-items: flex-start; justify-content: center; padding: clamp(18px, 8vh, 88px) 18px 18px;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  animation: nu-fade 0.22s ease both;
}
.spbm__card {
  width: min(560px, 100%); max-height: min(640px, calc(100dvh - 36px));
  display: flex; flex-direction: column;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 18px 18px 14px; box-shadow: var(--nu-shadow-day-modal);
  outline: none; animation: nu-fade 0.28s ease both;
}
.spbm__search {
  display: flex; align-items: center; gap: 10px;
  background: var(--nu-cream); border-radius: var(--nu-r-pill);
  padding: 11px 15px; color: var(--nu-gray);
}
.spbm__search-input {
  flex: 1; min-width: 0; border: none; background: transparent; outline: none;
  color: var(--nu-ink); font-size: 15.5px; font-weight: 600; font-family: inherit;
}
.spbm__search-input::placeholder { color: var(--nu-sand); }
.spbm__close {
  width: 30px; height: 30px; flex-shrink: 0; border: none; border-radius: 50%;
  background: var(--nu-white); color: var(--nu-ink); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.spbm__close:hover { background: var(--nu-cream-hover); }

.spbm__filters { margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap; }
.spbm__filter {
  border: none; border-radius: var(--nu-r-pill); background: transparent;
  color: var(--nu-gray-2); padding: 8px 13px; font-size: 12.5px; font-weight: 800;
  cursor: pointer; font-family: inherit; transition: background 0.15s, color 0.15s;
}
.spbm__filter:hover { background: var(--nu-cream-hover); }
.spbm__filter--on { background: var(--nu-ink); color: var(--nu-white); }

.spbm__list { margin-top: 10px; flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; padding-right: 2px; }
.spbm__asset {
  display: flex; align-items: center; gap: 11px; text-align: left;
  background: var(--nu-cream); border: 1.5px solid transparent; border-radius: 14px;
  padding: 10px 12px; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}
.spbm__asset:hover { border-color: var(--nu-blue); }
.spbm__asset--held { background: var(--nu-blue-tint); border-color: var(--nu-blue); }
.spbm__asset-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.spbm__asset-ticker { color: var(--nu-ink); font-size: 14px; font-weight: 800; }
.spbm__asset-name { color: var(--nu-gray); font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.spbm__asset-act {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-white); color: var(--nu-gray-2);
  transition: background 0.15s, color 0.15s;
}
.spbm__asset-act--held { background: var(--nu-blue); color: var(--nu-white); }
.spbm__empty { margin: 14px 4px; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }

.spbm__foot { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.spbm__count { color: var(--nu-gray); font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.spbm__done {
  border: none; border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white);
  padding: 11px 24px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: transform 0.15s;
}
.spbm__done:hover { transform: translateY(-1px); }
</style>
