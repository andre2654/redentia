<script setup lang="ts">
// PROTÓTIPO /simulacao — montador de carteira v2 (feedback do dono, 25/08:
// mais agradável, fácil e bonito). Filtro por classe em pills, cards de ativo
// com ação no canto (+ vira ✓), peso por posição na carteira e a barra de
// alocação por classe (cores --nu-alloc-*/--nu-class-* do design system).
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
function clearAll() {
  model.value = []
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
</script>

<template>
  <div class="spb">
    <!-- catálogo -->
    <div class="spb__catalog">
      <div class="spb__toolbar">
        <div class="spb__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
          <input v-model="search" type="text" class="spb__search-input" placeholder="Buscar ativo…">
        </div>
        <div class="spb__filters">
          <button
            v-for="c in CLASSES" :key="c" type="button"
            class="spb__filter" :class="{ 'spb__filter--on': klass === c }"
            @click="klass = c"
          >{{ c === 'Todos' ? 'Todos' : c + 's' }}</button>
        </div>
      </div>

      <div class="spb__grid">
        <button
          v-for="a in filtered" :key="a.ticker" type="button"
          class="spb__asset" :class="{ 'spb__asset--held': held.has(a.ticker) }"
          @click="toggle(a.ticker)"
        >
          <span class="spb__asset-dot" :style="{ background: CLASS_COLOR[a.klass] }" aria-hidden="true" />
          <span class="spb__asset-main">
            <b class="spb__asset-ticker">{{ a.ticker }}</b>
            <span class="spb__asset-name">{{ a.name }}</span>
          </span>
          <span class="spb__asset-act" :class="{ 'spb__asset-act--held': held.has(a.ticker) }" aria-hidden="true">
            <svg v-if="held.has(a.ticker)" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l5 5L20 7" /></svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </span>
        </button>
      </div>
      <p v-if="!filtered.length" class="spb__empty-search">Nada com "{{ search }}" {{ klass !== 'Todos' ? `em ${klass}s` : '' }} neste protótipo.</p>
    </div>

    <!-- a carteira montada -->
    <div class="spb__cart">
      <div class="spb__cart-head">
        <span class="spb__cart-title">Sua carteira</span>
        <span v-if="model.length" class="spb__cart-total">{{ fmt(total) }}</span>
      </div>

      <div v-if="allocation.length" class="spb__alloc" aria-hidden="true">
        <i v-for="a in allocation" :key="a.klass" :style="{ width: `${a.pct}%`, background: a.color }" :title="`${a.klass} ${Math.round(a.pct)}%`" />
      </div>

      <template v-if="model.length">
        <div v-for="p in model" :key="p.ticker" class="spb__row">
          <span class="spb__row-dot" :style="{ background: CLASS_COLOR[meta(p.ticker)?.klass ?? 'Ação'] }" aria-hidden="true" />
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
      </template>
      <p v-else class="spb__cart-empty">Toque nos ativos ao lado — ou comece pelo atalho:</p>

      <div class="spb__cart-actions">
        <button type="button" class="spb__ghost" @click="loadExample">Usar carteira de exemplo</button>
        <button v-if="model.length" type="button" class="spb__ghost spb__ghost--danger" @click="clearAll">Limpar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spb { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(300px, 1fr); gap: 14px; align-items: start; }

/* catálogo */
.spb__catalog { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 16px; box-shadow: var(--nu-shadow-card); }
.spb__toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.spb__search {
  flex: 1; min-width: 180px; display: flex; align-items: center; gap: 9px;
  background: var(--nu-cream); border-radius: var(--nu-r-pill);
  padding: 10px 15px; color: var(--nu-gray);
}
.spb__search-input {
  flex: 1; min-width: 0; border: none; background: transparent; outline: none;
  color: var(--nu-ink); font-size: 14px; font-weight: 600; font-family: inherit;
}
.spb__search-input::placeholder { color: var(--nu-sand); }
.spb__filters { display: flex; gap: 5px; flex-wrap: wrap; }
.spb__filter {
  border: none; border-radius: var(--nu-r-pill); background: transparent;
  color: var(--nu-gray-2); padding: 9px 13px; font-size: 12.5px; font-weight: 800;
  cursor: pointer; font-family: inherit; transition: background 0.15s, color 0.15s;
}
.spb__filter:hover { background: var(--nu-cream-hover); }
.spb__filter--on { background: var(--nu-ink); color: var(--nu-white); }

.spb__grid {
  margin-top: 12px; display: grid; gap: 7px;
  grid-template-columns: repeat(auto-fill, minmax(min(196px, 100%), 1fr));
  max-height: 316px; overflow-y: auto; padding-right: 2px;
}
.spb__asset {
  display: flex; align-items: center; gap: 10px; text-align: left;
  background: var(--nu-cream); border: 1.5px solid transparent; border-radius: 14px;
  padding: 11px 12px; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, transform 0.15s, background 0.15s;
}
.spb__asset:hover { border-color: var(--nu-blue); transform: translateY(-1px); }
.spb__asset--held { background: var(--nu-blue-tint); border-color: var(--nu-blue); }
.spb__asset-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.spb__asset-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.spb__asset-ticker { color: var(--nu-ink); font-size: 14px; font-weight: 800; }
.spb__asset-name { color: var(--nu-gray); font-size: 11.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.spb__asset-act {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-white); color: var(--nu-gray);
  transition: background 0.15s, color 0.15s;
}
.spb__asset:hover .spb__asset-act { color: var(--nu-blue); }
.spb__asset-act--held { background: var(--nu-blue); color: var(--nu-white); }
.spb__asset:hover .spb__asset-act--held { color: var(--nu-white); }
.spb__empty-search { margin: 14px 4px 4px; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }

/* carteira */
.spb__cart { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 16px; box-shadow: var(--nu-shadow-card); }
.spb__cart-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.spb__cart-title { color: var(--nu-gray-2); font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.spb__cart-total { color: var(--nu-ink); font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; }
.spb__alloc {
  margin-top: 12px; height: 10px; border-radius: 999px; overflow: hidden;
  display: flex; gap: 2px; background: var(--nu-cream);
}
.spb__alloc i { display: block; height: 100%; transition: width 0.4s ease; }
.spb__row {
  display: grid; grid-template-columns: 9px minmax(0, 1fr) 116px 26px;
  gap: 10px; align-items: center; padding: 10px 0;
}
.spb__row + .spb__row { border-top: 1.5px solid var(--nu-cream-2); }
.spb__row-dot { width: 9px; height: 9px; border-radius: 50%; }
.spb__row-main { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.spb__row-ticker { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; }
.spb__row-weight { color: var(--nu-gray); font-size: 12px; font-weight: 700; font-style: normal; font-variant-numeric: tabular-nums; }
.spb__row-value {
  display: flex; align-items: center; gap: 5px;
  background: var(--nu-cream); border-radius: 10px; padding: 8px 10px;
}
.spb__row-rs { color: var(--nu-gray); font-size: 12px; font-weight: 700; }
.spb__row-input {
  width: 100%; min-width: 0; border: none; background: transparent; outline: none;
  color: var(--nu-ink); font-size: 13.5px; font-weight: 800; font-family: inherit;
  font-variant-numeric: tabular-nums; text-align: right;
}
.spb__row-del {
  width: 26px; height: 26px; border: none; border-radius: 50%; background: transparent;
  color: var(--nu-gray); cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.spb__row-del:hover { background: var(--nu-red-tint); color: var(--nu-red); }
.spb__cart-empty { margin: 14px 0 8px; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.5; }
.spb__cart-actions { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; }
.spb__ghost {
  border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-gray-2);
  padding: 9px 15px; font-size: 12.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}
.spb__ghost:hover { border-color: var(--nu-blue); color: var(--nu-blue); }
.spb__ghost--danger:hover { border-color: var(--nu-red); color: var(--nu-red); }

@media (max-width: 900px) { .spb { grid-template-columns: 1fr; } }
</style>
