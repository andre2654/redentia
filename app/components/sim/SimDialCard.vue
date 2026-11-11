<script setup lang="ts">
// PROTÓTIPO /simulacao — dial-card v4 (referência do dono, 25/08: card escuro
// com número gigante, chip de delta e RÉGUA de ticks; o fundo ganha vida
// conforme o slider sai de "hoje"). Cada card tem PERSONALIDADE de cor:
//   dolar → aurora verde · selic → calor âmbar · bolsa → verde/vermelho pela
//   direção · petroleo → energia laranja-vermelha.
// Intensidade (0..1) = distância de hoje → opacidade/ritmo dos glows.
const props = withDefaults(defineProps<{
  label: string
  modelValue: number
  min: number
  max: number
  step: number
  valueText: string
  deltaText: string
  personality: 'dolar' | 'selic' | 'bolsa' | 'petroleo'
  intensity: number
  direction?: -1 | 0 | 1
  /** "acontece em" POR VARIÁVEL (dono 25/08) — aparece quando o dial sai de hoje */
  year?: number
  years?: number[]
  /** honestidade de escopo (ex.: petróleo afeta as posições mas não desenha linha) */
  note?: string
}>(), { direction: 0, year: undefined, years: undefined, note: undefined })
const emit = defineEmits<{ 'update:modelValue': [v: number]; 'update:year': [y: number] }>()

function onInput(e: Event) {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}
function onYear(e: Event) {
  emit('update:year', Number((e.target as HTMLSelectElement).value))
}

const FX: Record<string, { a: string; b: string }> = {
  dolar: { a: 'var(--nu-green-soft)', b: 'var(--nu-blue-soft)' },
  selic: { a: 'var(--nu-amber)', b: 'var(--nu-red-soft)' },
  petroleo: { a: 'var(--nu-amber)', b: 'var(--nu-red-soft)' },
}
const fx = computed(() => {
  if (props.personality === 'bolsa') {
    // a bolsa muda de humor com a DIREÇÃO
    return props.direction < 0
      ? { a: 'var(--nu-red-soft)', b: 'var(--nu-red-soft)' }
      : { a: 'var(--nu-green-soft)', b: 'var(--nu-blue-soft)' }
  }
  return FX[props.personality]!
})
const style = computed(() => ({
  '--i': String(Math.max(0, Math.min(1, props.intensity))),
  '--fx-a': fx.value.a,
  '--fx-b': fx.value.b,
}))
</script>

<template>
  <div class="sdc" :style="style">
    <div class="sdc__fx sdc__fx--ring" aria-hidden="true" />
    <div class="sdc__fx sdc__fx--glow" aria-hidden="true" />

    <span class="sdc__label">{{ label }}</span>
    <span class="sdc__value">{{ valueText }}</span>
    <span class="sdc__delta" :class="{ 'sdc__delta--live': intensity > 0.02 }">{{ deltaText }}</span>

    <span v-if="note && intensity > 0.02" class="sdc__note">{{ note }}</span>

    <label v-if="years && intensity > 0.02" class="sdc__year">
      em
      <select class="sdc__year-select" :value="year" :aria-label="`Ano do cenário de ${label}`" @change="onYear">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <svg class="sdc__year-seta" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
    </label>

    <div class="sdc__ruler">
      <div class="sdc__ticks" aria-hidden="true" />
      <input
        class="sdc__range" type="range"
        :min="min" :max="max" :step="step" :value="modelValue"
        :aria-label="label"
        @input="onInput"
      >
    </div>
  </div>
</template>

<style scoped>
/* o cartão carvão da marca: raio 28 e a sombra do cartão escuro */
.sdc {
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: var(--nu-ink); border-radius: var(--nu-r-card);
  padding: 24px 20px 18px;
  box-shadow: var(--nu-shadow-escuro);
}

/* os efeitos: anel no topo + glow difuso, respirando no ritmo da intensidade */
.sdc__fx { position: absolute; pointer-events: none; transition: opacity 0.35s ease; }
.sdc__fx--ring {
  inset: -55% -25% auto -25%; height: 120%;
  background:
    radial-gradient(ellipse at 50% 100%, transparent 38%, var(--fx-a) 47%, transparent 60%),
    radial-gradient(ellipse at 30% 96%, transparent 42%, var(--fx-b) 52%, transparent 62%);
  opacity: calc(0.1 + var(--i) * 0.75);
  filter: blur(6px);
  animation: sdc-breathe calc(5.2s - var(--i) * 3.2s) ease-in-out infinite;
}
.sdc__fx--glow {
  inset: auto -30% -60% -30%; height: 90%;
  background: radial-gradient(ellipse at 50% 100%, var(--fx-a) 0%, transparent 62%);
  opacity: calc(0.04 + var(--i) * 0.3);
  filter: blur(10px);
}
@keyframes sdc-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06) translateY(2px); }
}

.sdc__label {
  position: relative;
  color: var(--nu-on-dark); font-size: 13.5px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
}
.sdc__value {
  position: relative;
  color: var(--nu-white); font-size: clamp(38px, 3.8vw, 52px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums;
}
/* o selo do delta: o chip sobre carvão, raio 8 */
.sdc__delta {
  position: relative;
  padding: 5px 11px; border: 1.5px solid var(--nu-dark-chip-line); border-radius: var(--nu-r-tag);
  background: var(--nu-dark-chip);
  color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s, border-color 0.3s;
}
.sdc__delta--live { color: var(--nu-white); border-color: var(--nu-on-dark-2); }

.sdc__note {
  position: relative;
  color: var(--nu-on-dark-2); font-size: var(--nu-fs-xs); font-weight: 500;
  text-align: center; max-width: 210px; line-height: 1.35;
  animation: nu-fade 0.25s ease both;
}

/* "acontece em [ano]" — só quando o dial saiu de hoje */
.sdc__year {
  position: relative; display: inline-flex; align-items: center; gap: 6px; min-height: 30px;
  color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 700;
  animation: nu-fade 0.25s ease both;
}
.sdc__year-select {
  appearance: none; -webkit-appearance: none;
  border: none; border-bottom: 1.5px dashed var(--nu-on-dark-2); border-radius: 0;
  background: transparent; color: var(--nu-white);
  padding: 3px 18px 4px 2px; font-size: 14.5px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.sdc__year-seta { position: absolute; right: 3px; top: 50%; margin-top: -5px; color: var(--nu-white); pointer-events: none; }
.sdc__year-select option { color: var(--nu-ink); background: var(--nu-white); }

/* a régua: ticks + thumb de linha */
.sdc__ruler { position: relative; width: 100%; height: 40px; margin-top: 8px; }
.sdc__ticks {
  position: absolute; inset: 8px 2px;
  background: repeating-linear-gradient(90deg, var(--nu-on-dark-2) 0 1.5px, transparent 1.5px 9px);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
  opacity: 0.55;
}
.sdc__range {
  position: absolute; inset: 0; width: 100%;
  appearance: none; -webkit-appearance: none;
  background: transparent; cursor: ew-resize; outline: none;
}
.sdc__range::-webkit-slider-thumb {
  appearance: none; -webkit-appearance: none;
  width: 4px; height: 34px; border-radius: 999px;
  background: var(--nu-white);
  box-shadow: 0 0 0 4px var(--nu-white-14), 0 0 18px 2px var(--fx-a);
}
.sdc__range::-moz-range-thumb {
  width: 4px; height: 34px; border: none; border-radius: 999px;
  background: var(--nu-white);
  box-shadow: 0 0 0 4px var(--nu-white-14), 0 0 18px 2px var(--fx-a);
}
.sdc__range:focus-visible { outline: none; }
.sdc__range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px var(--nu-blue-on-dark), 0 0 18px 2px var(--fx-a); }
.sdc__range:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 4px var(--nu-blue-on-dark), 0 0 18px 2px var(--fx-a); }
</style>
