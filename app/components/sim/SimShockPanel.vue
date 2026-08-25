<script setup lang="ts">
// PROTÓTIPO /simulacao — o assessor DESENHA o choque (pivô do dono, 25/08):
// cards por variável macro (Dólar, Selic, Bolsa, Petróleo) com o valor de
// hoje e alvos pré-definidos em chips. "Hoje" = sem choque naquela variável.
// Vários choques empilham; o motor propaga por regra declarada.
import { SHOCK_VARS, shocksTitle, type SimShocks } from './simMock'

const model = defineModel<SimShocks>({ required: true })

function pick(key: keyof SimShocks, value: number | null) {
  const next = { ...model.value }
  if (value === null || next[key] === value) delete next[key]
  else next[key] = value
  model.value = next
}
const summary = computed(() => shocksTitle(model.value))
const hasShock = computed(() => Object.keys(model.value).length > 0)
</script>

<template>
  <div class="ssp">
    <div class="ssp__grid">
      <div v-for="v in SHOCK_VARS" :key="v.key" class="ssp__card" :class="{ 'ssp__card--on': model[v.key] !== undefined }">
        <div class="ssp__head">
          <span class="ssp__label">{{ v.label }}</span>
          <span class="ssp__now">{{ v.now }}</span>
        </div>
        <div class="ssp__chips">
          <button
            type="button" class="ssp__chip"
            :class="{ 'ssp__chip--on': model[v.key] === undefined }"
            @click="pick(v.key, null)"
          >Hoje</button>
          <button
            v-for="p in v.presets" :key="p.label" type="button"
            class="ssp__chip" :class="{ 'ssp__chip--on': model[v.key] === p.value }"
            @click="pick(v.key, p.value)"
          >{{ p.label }}</button>
        </div>
      </div>
    </div>
    <p class="ssp__summary">
      <span class="ssp__summary-label">{{ hasShock ? 'Choque desenhado:' : 'Nenhum choque —' }}</span>
      {{ hasShock ? summary : 'a simulação roda o caminho base.' }}
    </p>
  </div>
</template>

<style scoped>
.ssp__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 12px; }
.ssp__card {
  background: var(--nu-white); border: 1.5px solid transparent; border-radius: var(--nu-r-tile);
  padding: 16px 18px; box-shadow: var(--nu-shadow-card);
  transition: border-color 0.2s;
}
.ssp__card--on { border-color: var(--nu-blue); }
.ssp__head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.ssp__label { color: var(--nu-ink); font-size: 15.5px; font-weight: 800; letter-spacing: -0.01em; }
.ssp__now { color: var(--nu-gray); font-size: 11.5px; font-weight: 700; }
.ssp__chips { margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
.ssp__chip {
  border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-gray-2);
  padding: 7px 13px; font-size: 13px; font-weight: 800; cursor: pointer; font-family: inherit;
  font-variant-numeric: tabular-nums;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.ssp__chip:hover { border-color: var(--nu-blue); color: var(--nu-blue); }
.ssp__chip--on { background: var(--nu-ink); border-color: var(--nu-ink); color: var(--nu-white); }
.ssp__summary { margin: 16px 0 0; color: var(--nu-ink); font-size: 14.5px; font-weight: 700; }
.ssp__summary-label { color: var(--nu-gray); font-weight: 800; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.07em; margin-right: 6px; }
</style>
