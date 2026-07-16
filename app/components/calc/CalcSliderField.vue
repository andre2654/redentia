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
// cancela. Parse pt-BR ('.' milhar, ',' decimal) + arredonda pra precisão do
// step. Sem branding, sem tocar em nenhum call site: o componente já recebe
// modelValue/min/max/step, então vale pra TODAS as calculadoras de uma vez.
//
// IMPORTANTE (dono 2026-07-14): min/max são só a FAIXA DE ARRASTO do slider, NÃO
// o limite do valor. Digitar NÃO é preso nesses limites — dá pra colocar acima
// do max e abaixo do min (renda de 50k num slider que vai até 30k, etc.). Único
// piso: 0 pra campos naturalmente não-negativos (min>=0), pra não gerar valor
// sem sentido/NaN; campos que aceitam negativo (min<0) ficam totalmente livres.
// O thumb do slider fica encostado na ponta quando o valor passa da faixa.
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
  // NÃO prende nos limites do slider (min/max = só faixa de arrasto). Único
  // piso: 0 pra campos não-negativos (min>=0); campos com min<0 aceitam negativo
  // livre. Arredonda só pra precisão do step (respeita o valor digitado).
  let v = props.min >= 0 ? Math.max(0, parsed) : parsed
  v = Number(v.toFixed(stepDecimals.value))
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
      :aria-valuetext="valueText"
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
.csf__row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.csf__label { color: var(--nu-gray); font-size: 14px; font-weight: 700; }

/* valor = campo editável: box levemente mais clara que o creme + arredondada,
   sinalizando "passe o mouse e troque". Idle = branco suave + lapiseira quieta;
   hover/foco = branco cheio + borda + azul; editando = borda azul. Mesmas
   medidas de box nos estados (borda 1.5px sempre reservada) → sem pulo. */
.csf__value {
  display: inline-flex; align-items: center; gap: 7px;
  margin: 0; padding: 3px 11px; border: 1.5px solid transparent; border-radius: 10px;
  background: var(--nu-white-75);
  font-family: inherit; color: var(--nu-ink);
  font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.15;
  transition: background .18s, border-color .18s, color .18s;
}
button.csf__value { cursor: pointer; }
button.csf__value:hover, button.csf__value:focus-visible {
  background: var(--nu-white); border-color: var(--nu-sand-border); color: var(--nu-blue); outline: none;
}
.csf__edit-ic { color: var(--nu-gray); flex-shrink: 0; transition: color .18s; }
button.csf__value:hover .csf__edit-ic, button.csf__value:focus-visible .csf__edit-ic { color: var(--nu-blue); }

/* editando: box branca com borda azul; input transparente por dentro */
.csf__value--edit { background: var(--nu-white); border-color: var(--nu-blue); }
.csf__input {
  font: inherit; font-variant-numeric: tabular-nums;
  color: var(--nu-ink); text-align: right; line-height: 1.15;
  min-width: 3ch; max-width: 62vw;
  border: none; background: none; padding: 0; margin: 0; outline: none;
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
/* foco de teclado visível: outline:none acima tirava QUALQUER indicação de
   qual slider está focado (o usuário mexia com as setas "no escuro"). */
.csf__range:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px var(--nu-white), 0 0 0 6px var(--nu-blue);
}
.csf__range:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3px var(--nu-white), 0 0 0 6px var(--nu-blue);
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
