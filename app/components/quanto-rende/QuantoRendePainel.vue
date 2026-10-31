<script setup lang="ts">
// Campo de valor e os cartões do resultado. Cartões empilham em 390 px:
// nada de tabela com rolagem lateral. O R$ fica ao lado do campo, não por cima.
import { lerValorBr, valorQuantoRende, dinheiroFmt, VALOR_PADRAO } from '~/utils/quanto-rende'

const props = defineProps<{
  modelValue: number
  cards: { rotulo: string; valor: string; fonte: string }[]
  aviso: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const texto = ref(dinheiroFmt(props.modelValue).replace(/^R\$\s*/, ''))
const atalhos = [1000, 5000, 10_000, 100_000]

function aplicar(bruto: number) {
  const n = valorQuantoRende(bruto)
  emit('update:modelValue', n)
  texto.value = dinheiroFmt(n).replace(/^R\$\s*/, '')
}
function aoDigitar(e: Event) {
  const t = (e.target as HTMLInputElement).value
  texto.value = t
  const n = lerValorBr(t)
  if (n != null && n >= 1 && n <= 100_000_000) emit('update:modelValue', Math.round(n * 100) / 100)
}
function aoSair() {
  aplicar(lerValorBr(texto.value) ?? props.modelValue)
}
</script>

<template>
  <div class="qr">
    <div class="qr__campo">
      <label class="qr__rotulo" for="quanto-rende-valor">Valor</label>
      <div class="qr__linha">
        <span class="qr__prefixo" aria-hidden="true">R$</span>
        <input
          id="quanto-rende-valor"
          class="qr__input"
          :value="texto"
          inputmode="decimal"
          autocomplete="off"
          spellcheck="false"
          :aria-label="`Valor, padrão ${dinheiroFmt(VALOR_PADRAO)}`"
          @input="aoDigitar"
          @blur="aoSair"
          @keydown.enter.prevent="aoSair"
        >
      </div>
      <div class="qr__atalhos">
        <button
          v-for="a in atalhos"
          :key="a"
          type="button"
          class="qr__atalho"
          :aria-pressed="modelValue === a"
          @click="aplicar(a)"
        >
          {{ dinheiroFmt(a) }}
        </button>
      </div>
    </div>

    <div class="qr__cards">
      <article v-for="c in cards" :key="c.rotulo" class="qr__card">
        <h3 class="qr__card-rotulo">{{ c.rotulo }}</h3>
        <p class="qr__card-valor">{{ c.valor }}</p>
        <p class="qr__card-fonte">{{ c.fonte }}</p>
      </article>
    </div>

    <p class="qr__aviso">{{ aviso }}</p>
    <div v-if="$slots.default" class="qr__notas"><slot /></div>
  </div>
</template>

<style scoped>
.qr { max-width: 1080px; margin: clamp(28px, 4vw, 40px) auto 0; }
.qr__campo { max-width: 520px; }
.qr__rotulo {
  display: block; margin: 0 0 8px; color: var(--nu-gray);
  font-size: var(--nu-fs-sm); font-weight: 700;
}
.qr__linha {
  display: flex; align-items: center; gap: 10px;
  background: var(--nu-cream); border-radius: var(--nu-r-tile);
  padding: 6px 6px 6px 16px; min-width: 0;
}
.qr__prefixo {
  flex: 0 0 auto; color: var(--nu-ink); font-size: 18px; font-weight: 800;
}
.qr__input {
  flex: 1 1 auto; min-width: 0; width: 100%;
  border: 0; background: transparent; color: var(--nu-ink);
  font: inherit; font-size: 20px; font-weight: 800; letter-spacing: -.02em;
  font-variant-numeric: tabular-nums; padding: 10px 12px 10px 0;
}
.qr__input:focus { outline: none; }
.qr__linha:focus-within { box-shadow: 0 0 0 2px var(--nu-blue); }
.qr__atalhos { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.qr__atalho {
  background: var(--nu-cream); color: var(--nu-ink); border: 0; cursor: pointer;
  border-radius: var(--nu-r-pill); padding: 8px 14px;
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.qr__atalho[aria-pressed="true"] { background: var(--nu-blue); color: var(--nu-white); }

.qr__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 12px; margin-top: 22px;
}
.qr__card {
  background: var(--nu-cream); border-radius: var(--nu-r-tile);
  padding: 16px 18px; min-width: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.qr__card-rotulo {
  margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.35;
}
.qr__card-valor {
  margin: 0; color: var(--nu-ink); font-size: clamp(22px, 2.4vw, 28px); font-weight: 800;
  letter-spacing: -.03em; line-height: 1.15; font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.qr__card-fonte {
  margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500;
  line-height: 1.45; overflow-wrap: anywhere;
}
.qr__aviso {
  margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700;
  line-height: 1.5; max-width: 72ch;
}
.qr__notas { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
.qr__notas :deep(p) {
  margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500;
  line-height: 1.55; max-width: 72ch; overflow-wrap: anywhere;
}
</style>
