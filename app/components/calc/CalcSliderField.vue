<script setup lang="ts">
// PR10 — campo de slider do kit das calculadoras. Valores exatos do design
// (Redentia Calculadoras Nu.dc.html): linha label (14px w700 muted) vs valor
// formatado (19px w800 tabular-nums); track 8px creme radius 999 com fill azul
// até o valor; thumb 26px azul com borda branca 4px e sombra; chips de preset
// opcionais (ativo = pill preta, inativo = branco com borda sand).
//
// ENTRADA MANUAL (dono 2026-07-14): além de arrastar, o valor é EDITÁVEL. O
// número (à direita) vira um botão discreto com lapiseira; clicou, vira um
// input inline (mesma tipografia), digita, Enter/clicar-fora confirma, Esc
// cancela. Parse pt-BR ('.' milhar, ',' decimal), clampa em [min,max] e
// arredonda pra precisão do step. Sem branding, sem tocar em nenhum call site:
// o componente já recebe modelValue/min/max/step, então vale pra TODAS as
// calculadoras de uma vez.
const props = defineProps<{
  label: string
  modelValue: number
  min: number
  max: number
  step: number
  /** valor já formatado pra exibição (ex.: 'R$ 1.000', '11% a.a.') */
  valueText: string
  presets?: { label: string; value: number }[]
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>()

const fillPct = computed(() => {
  const span = props.max - props.min
  if (span <= 0) return 0
  return Math.max(0, Math.min(100, ((props.modelValue - props.min) / span) * 100))
})

function onInput(e: Event) {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}

function isActive(v: number) {
  return Math.abs(props.modelValue - v) < 0.01
}

/* ————— edição manual ————— */

// casas decimais derivadas do step (step 0.25 → 2, step 1 → 0, step 500 → 0)
const stepDecimals = computed(() => {
  const s = String(props.step)
  const dot = s.indexOf('.')
  return dot === -1 ? 0 : s.length - dot - 1
})

const editing = ref(false)
const draft = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

// número cru em pt-BR pro rascunho, sem unidade e sem zeros à toa
function formatDraft(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: Math.max(stepDecimals.value, 0) })
}

// pt-BR de volta pra number ('5.000' → 5000, '6,17' → 6.17); null = inválido
function parseDraft(str: string): number | null {
  const cleaned = str.trim().replace(/[^\d.,-]/g, '')
  if (!cleaned || cleaned === '-' || cleaned === ',' || cleaned === '.') return null
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

async function startEdit() {
  draft.value = formatDraft(props.modelValue)
  editing.value = true
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
}

function commit() {
  if (!editing.value) return
  editing.value = false
  const parsed = parseDraft(draft.value)
  if (parsed === null) return // entrada vazia/inválida → mantém o valor atual
  // clampa em [min,max] e arredonda pra precisão do step (respeita o valor
  // digitado — não força múltiplo exato do step)
  let v = Math.min(props.max, Math.max(props.min, parsed))
  v = Number(v.toFixed(stepDecimals.value))
  v = Math.min(props.max, Math.max(props.min, v))
  if (v !== props.modelValue) emit('update:modelValue', v)
}

function cancel() {
  editing.value = false
}
</script>

<template>
  <div class="csf">
    <div class="csf__row">
      <span class="csf__label">{{ label }}</span>

      <!-- valor editável: botão discreto (lapiseira) → input inline -->
      <button
        v-if="!editing"
        type="button"
        class="csf__value"
        :aria-label="`Editar ${label}. Valor atual: ${valueText}`"
        @click="startEdit"
      >
        <svg class="csf__edit-ic" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
        <span>{{ valueText }}</span>
      </button>
      <span v-else class="csf__value csf__value--edit">
        <input
          ref="inputEl"
          v-model="draft"
          type="text"
          inputmode="decimal"
          class="csf__input"
          :style="{ width: (Math.max(3, draft.length) + 1) + 'ch' }"
          :aria-label="label"
          @keydown.enter.prevent="commit"
          @keydown.esc.prevent="cancel"
          @blur="commit"
        >
      </span>
    </div>

    <input
      class="csf__range"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :aria-label="label"
      :style="{ background: `linear-gradient(to right, var(--nu-blue) 0% ${fillPct}%, var(--nu-sand-2) ${fillPct}% 100%)` }"
      @input="onInput"
    >
    <div v-if="presets?.length" class="csf__chips">
      <button
        v-for="p in presets"
        :key="p.label"
        type="button"
        class="csf__chip"
        :class="{ 'csf__chip--active': isActive(p.value) }"
        @click="emit('update:modelValue', p.value)"
      >{{ p.label }}</button>
    </div>
  </div>
</template>

<style scoped>
.csf__row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.csf__label { color: var(--nu-gray); font-size: 14px; font-weight: 700; }

/* valor: mesma tipografia do design; vira alvo de clique pra editar. Idle =
   número + lapiseira quieta (sand); hover/foco = tudo azul (afeta "editável"). */
.csf__value {
  display: inline-flex; align-items: center; gap: 7px;
  border: none; background: none; padding: 0; margin: 0; font-family: inherit;
  color: var(--nu-ink); font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums;
  cursor: pointer; line-height: 1.1; transition: color .18s;
}
.csf__value:hover, .csf__value:focus-visible { color: var(--nu-blue); outline: none; }
.csf__edit-ic { color: var(--nu-sand-border); flex-shrink: 0; transition: color .18s; }
.csf__value:hover .csf__edit-ic, .csf__value:focus-visible .csf__edit-ic { color: var(--nu-blue); }

/* input inline: some a borda, fica só um traço azul embaixo pra sinalizar edição */
.csf__value--edit { display: inline-flex; }
.csf__input {
  font-family: inherit; font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums;
  color: var(--nu-ink); text-align: right; line-height: 1.1;
  min-width: 3ch; max-width: 62vw;
  border: none; border-bottom: 2px solid var(--nu-blue);
  background: none; padding: 0 0 1px; margin: 0; outline: none;
  caret-color: var(--nu-blue);
}

.csf__range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: var(--nu-r-pill);
  outline: none;
  margin-top: 14px;
  display: block;
}
.csf__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--nu-blue);
  border: 4px solid var(--nu-white);
  box-shadow: var(--nu-shadow-slider-thumb);
  cursor: pointer;
}
.csf__range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--nu-blue);
  border: 4px solid var(--nu-white);
  box-shadow: var(--nu-shadow-slider-thumb);
  cursor: pointer;
}

.csf__chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.csf__chip {
  padding: 8px 14px;
  border-radius: var(--nu-r-pill);
  font-size: 12.5px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  border: 2px solid var(--nu-sand-border);
  background: var(--nu-white);
  color: var(--nu-gray-2);
  transition: all .2s;
}
.csf__chip--active {
  border-color: var(--nu-ink);
  background: var(--nu-ink);
  color: var(--nu-white);
}
</style>
