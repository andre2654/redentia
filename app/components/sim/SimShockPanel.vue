<script setup lang="ts">
// PROTÓTIPO /simulacao — painel de choques v4 (referência do dono, 25/08):
// cada variável é um DIAL-CARD escuro com número gigante, chip de delta,
// régua de ticks e fundo vivo que intensifica conforme sai de "hoje" — cada
// um com sua personalidade de cor. Replays históricos puxam os 4 de uma vez.
import { MACRO_NOW, REPLAYS, DIAL_DEFAULTS, type SimDials } from './simMock'

const model = defineModel<SimDials>({ required: true })

function set<K extends keyof SimDials>(key: K, v: number) {
  model.value = { ...model.value, [key]: v }
}
function applyReplay(d: SimDials) {
  model.value = { ...d }
}
function resetToday() {
  model.value = { ...DIAL_DEFAULTS }
}
const isToday = computed(() =>
  Math.abs(model.value.dolar - DIAL_DEFAULTS.dolar) < 0.03
  && Math.abs(model.value.selic - DIAL_DEFAULTS.selic) < 0.2
  && Math.abs(model.value.bolsa) < 1
  && Math.abs(model.value.petroleo) < 2,
)

const fmt = (v: number, dec = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
const signPct = (v: number) => `${v > 0 ? '+' : ''}${Math.round(v)}% vs hoje`

// deltas e intensidades (0..1 = distância de hoje sobre o curso do dial)
const dolarDelta = computed(() => (model.value.dolar / MACRO_NOW.dolar - 1) * 100)
const dolarTxt = computed(() => (Math.abs(dolarDelta.value) < 0.6 ? 'hoje' : `${dolarDelta.value > 0 ? '+' : ''}${fmt(dolarDelta.value, 1)}% vs hoje`))
const selicDelta = computed(() => model.value.selic - MACRO_NOW.selic)
const selicTxt = computed(() => (Math.abs(selicDelta.value) < 0.2 ? 'hoje' : `${selicDelta.value > 0 ? '+' : ''}${fmt(selicDelta.value, 1)} p.p. vs hoje`))
const bolsaTxt = computed(() => (Math.abs(model.value.bolsa) < 1 ? 'hoje' : signPct(model.value.bolsa)))
const petroleoTxt = computed(() => (Math.abs(model.value.petroleo) < 2 ? 'hoje' : signPct(model.value.petroleo)))

const iDolar = computed(() => Math.abs(model.value.dolar - MACRO_NOW.dolar) / 1.85)
const iSelic = computed(() => Math.abs(selicDelta.value) / 7.9)
const iBolsa = computed(() => Math.abs(model.value.bolsa) / 45)
const iPetroleo = computed(() => Math.abs(model.value.petroleo) / 60)
</script>

<template>
  <div class="ssp">
    <div class="ssp__replays">
      <button
        v-for="r in REPLAYS" :key="r.label" type="button" class="ssp__replay"
        :title="r.sub" @click="applyReplay(r.dials)"
      >{{ r.label }}<em>{{ r.sub }}</em></button>
      <button v-if="!isToday" type="button" class="ssp__replay ssp__replay--reset" @click="resetToday">↺ hoje</button>
    </div>

    <div class="ssp__cards">
      <SimDialCard
        label="Dólar" personality="dolar"
        :model-value="model.dolar" :min="4.4" :max="7" :step="0.05"
        :value-text="`R$ ${fmt(model.dolar)}`" :delta-text="dolarTxt"
        :intensity="iDolar" @update:model-value="set('dolar', $event)"
      />
      <SimDialCard
        label="Selic" personality="selic"
        :model-value="model.selic" :min="6" :max="20" :step="0.25"
        :value-text="`${fmt(model.selic, 1)}%`" :delta-text="selicTxt"
        :intensity="iSelic" @update:model-value="set('selic', $event)"
      />
      <SimDialCard
        label="Bolsa (IBOV)" personality="bolsa"
        :model-value="model.bolsa" :min="-45" :max="45" :step="1"
        :value-text="`${model.bolsa > 0 ? '+' : ''}${Math.round(model.bolsa)}%`" :delta-text="bolsaTxt"
        :intensity="iBolsa" :direction="model.bolsa < 0 ? -1 : model.bolsa > 0 ? 1 : 0"
        @update:model-value="set('bolsa', $event)"
      />
      <SimDialCard
        label="Petróleo" personality="petroleo"
        :model-value="model.petroleo" :min="-60" :max="60" :step="2"
        :value-text="`${model.petroleo > 0 ? '+' : ''}${Math.round(model.petroleo)}%`" :delta-text="petroleoTxt"
        :intensity="iPetroleo" @update:model-value="set('petroleo', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.ssp__replays { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
/* mesma anatomia do "Voltar"/"Gerar resumo" (dono 25/08): pill sólida
   branca sem borda, texto ink, hover creme + lift */
.ssp__replay {
  display: inline-flex; align-items: baseline; gap: 7px;
  border: none; border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-ink);
  padding: 14px 24px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: background 0.15s, transform 0.15s;
}
.ssp__replay:hover { background: var(--nu-cream); transform: translateY(-1px); }
.ssp__replay em { color: var(--nu-gray); font-size: 11.5px; font-weight: 600; font-style: normal; }

.ssp__cards {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
@media (max-width: 700px) { .ssp__cards { grid-template-columns: 1fr; } }
</style>
