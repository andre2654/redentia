<script setup lang="ts">
// PROTÓTIPO /simulacao — o montador de carteira (pivô do dono, 24/08: texto
// livre era abstrato demais; o objeto da simulação tem que ser concreto).
// Catálogo clicável (mock — no real vem do /tickers) + posições com valor
// editável + total. Emite a carteira pro pai; quem simula é o motor.
import { ASSET_CATALOG, EXAMPLE_PORTFOLIO, fmtBRLFull, type SimPortfolioInput } from './simMock'

const model = defineModel<SimPortfolioInput[]>({ required: true })

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return ASSET_CATALOG
  return ASSET_CATALOG.filter((a) => a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
})

const DEFAULT_VALUE = 25_000
function isHeld(ticker: string): boolean {
  return model.value.some((p) => p.ticker === ticker)
}
function toggle(ticker: string) {
  if (isHeld(ticker)) model.value = model.value.filter((p) => p.ticker !== ticker)
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
const fmt = fmtBRLFull
</script>

<template>
  <div class="spb">
    <!-- catálogo -->
    <div class="spb__catalog">
      <div class="spb__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
        <input v-model="search" type="text" class="spb__search-input" placeholder="Buscar ativo — PETR4, fundo imobiliário, ETF…">
      </div>
      <div class="spb__grid">
        <button
          v-for="a in filtered" :key="a.ticker" type="button"
          class="spb__asset" :class="{ 'spb__asset--held': isHeld(a.ticker) }"
          @click="toggle(a.ticker)"
        >
          <span class="spb__asset-top">
            <b class="spb__asset-ticker">{{ a.ticker }}</b>
            <em class="spb__asset-class">{{ a.klass }}</em>
          </span>
          <span class="spb__asset-name">{{ a.name }}</span>
          <span class="spb__asset-action" aria-hidden="true">{{ isHeld(a.ticker) ? '✓ na carteira' : '+ adicionar' }}</span>
        </button>
      </div>
      <p v-if="!filtered.length" class="spb__empty-search">Nenhum ativo com "{{ search }}" neste protótipo.</p>
    </div>

    <!-- a carteira montada -->
    <div class="spb__cart">
      <div class="spb__cart-head">
        <span class="spb__cart-title">Sua carteira</span>
        <span v-if="model.length" class="spb__cart-total">{{ fmt(total) }} · {{ model.length }} {{ model.length === 1 ? 'posição' : 'posições' }}</span>
      </div>

      <template v-if="model.length">
        <div v-for="p in model" :key="p.ticker" class="spb__row">
          <span class="spb__row-pill">{{ p.ticker }}</span>
          <span class="spb__row-name">{{ meta(p.ticker)?.name }}</span>
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
      <p v-else class="spb__cart-empty">Toque nos ativos ao lado pra montar — ou comece por um atalho:</p>

      <div class="spb__cart-actions">
        <button type="button" class="spb__ghost" @click="loadExample">Usar carteira de exemplo</button>
        <button v-if="model.length" type="button" class="spb__ghost spb__ghost--danger" @click="clearAll">Limpar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spb { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(300px, 1fr); gap: 18px; align-items: start; }

/* catálogo */
.spb__catalog { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 18px; box-shadow: var(--nu-shadow-card); }
.spb__search {
  display: flex; align-items: center; gap: 10px;
  background: var(--nu-cream); border-radius: var(--nu-r-input);
  padding: 12px 15px; color: var(--nu-gray);
}
.spb__search-input {
  flex: 1; min-width: 0; border: none; background: transparent; outline: none;
  color: var(--nu-ink); font-size: 14.5px; font-weight: 600; font-family: inherit;
}
.spb__search-input::placeholder { color: var(--nu-sand); }
.spb__grid {
  margin-top: 12px; display: grid; gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr));
  max-height: 322px; overflow-y: auto;
}
.spb__asset {
  display: flex; flex-direction: column; gap: 3px; text-align: left;
  background: var(--nu-cream); border: 1.5px solid transparent; border-radius: var(--nu-r-tile);
  padding: 12px 13px; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, transform 0.15s, background 0.15s;
}
.spb__asset:hover { border-color: var(--nu-blue); transform: translateY(-1px); }
.spb__asset--held { background: var(--nu-blue-tint); border-color: var(--nu-blue); }
.spb__asset-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.spb__asset-ticker { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; }
.spb__asset-class { color: var(--nu-gray); font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-style: normal; }
.spb__asset-name { color: var(--nu-gray-2); font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.spb__asset-action { margin-top: 4px; color: var(--nu-blue); font-size: 11.5px; font-weight: 800; }
.spb__empty-search { margin: 14px 4px 4px; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }

/* carteira */
.spb__cart { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 18px; box-shadow: var(--nu-shadow-card); }
.spb__cart-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.spb__cart-title { color: var(--nu-gray-2); font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.spb__cart-total { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.spb__row {
  display: grid; grid-template-columns: 78px minmax(0, 1fr) 118px 28px;
  gap: 10px; align-items: center; padding: 8px 0;
}
.spb__row + .spb__row { border-top: 1.5px solid var(--nu-cream-2); }
.spb__row-pill {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 6px 0; border-radius: var(--nu-r-chip);
  background: var(--nu-blue-tint); color: var(--nu-blue);
  font-size: 12.5px; font-weight: 800;
}
.spb__row-name { color: var(--nu-gray-2); font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.spb__row-value {
  display: flex; align-items: center; gap: 5px;
  background: var(--nu-cream); border-radius: 10px; padding: 7px 10px;
}
.spb__row-rs { color: var(--nu-gray); font-size: 12px; font-weight: 700; }
.spb__row-input {
  width: 100%; min-width: 0; border: none; background: transparent; outline: none;
  color: var(--nu-ink); font-size: 13.5px; font-weight: 800; font-family: inherit;
  font-variant-numeric: tabular-nums; text-align: right;
}
.spb__row-del {
  width: 28px; height: 28px; border: none; border-radius: 50%; background: transparent;
  color: var(--nu-gray); cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.spb__row-del:hover { background: var(--nu-red-tint); color: var(--nu-red); }
.spb__cart-empty { margin: 4px 0 10px; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.5; }
.spb__cart-actions { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; }
.spb__ghost {
  border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-gray-2);
  padding: 9px 16px; font-size: 13px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}
.spb__ghost:hover { border-color: var(--nu-blue); color: var(--nu-blue); }
.spb__ghost--danger:hover { border-color: var(--nu-red); color: var(--nu-red); }

@media (max-width: 900px) { .spb { grid-template-columns: 1fr; } }
</style>
