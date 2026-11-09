<script setup lang="ts">
// O seletor de período do gráfico (1M · 6M · 12M · 5A) do /asset: o
// segmentado da /teses. Desabilita enquanto a série nova chega.
import type { AcaoRange } from '~/types/acao'

// `opcoes` deixa só os períodos que a série cobre (a curva da /carteira começa
// quando a pessoa conectou; 05/11/2026); sem ela, os quatro
const props = withDefaults(defineProps<{ modelValue: AcaoRange; disabled?: boolean; tom?: 'claro' | 'escuro'; opcoes?: AcaoRange[] | null }>(), { disabled: false, tom: 'claro', opcoes: null })
const emit = defineEmits<{ 'update:modelValue': [AcaoRange] }>()
const TODAS: { v: AcaoRange; r: string; nome: string }[] = [
  { v: '1mo', r: '1M', nome: '1 mês' },
  { v: '6mo', r: '6M', nome: '6 meses' },
  { v: '12mo', r: '12M', nome: '12 meses' },
  // 5 anos: GET /tickers/{t}/prices?mode=5y e /indices/IBOV/prices?mode=5y
  // respondem com ~1.250 pregões (conferido em 03/11/2026)
  { v: '5y', r: '5A', nome: '5 anos' },
]
const ABAS = computed(() => (props.opcoes ? TODAS.filter((a) => props.opcoes!.includes(a.v)) : TODAS))
</script>

<template>
  <div class="ape" :class="`ape--${tom}`" role="radiogroup" aria-label="Período do gráfico">
    <button
      v-for="a in ABAS" :key="a.v" type="button" role="radio" class="ape__b" :class="{ 'ape__b--on': modelValue === a.v }"
      :aria-checked="modelValue === a.v" :aria-label="a.nome" :disabled="disabled" @click="emit('update:modelValue', a.v)"
    >{{ a.r }}</button>
  </div>
</template>

<style scoped>
.ape { display: inline-flex; padding: 3px; border-radius: var(--nu-r-pill); flex-shrink: 0; }
.ape__b {
  height: 32px; min-width: 48px; padding: 0 14px; border: 0; border-radius: var(--nu-r-pill); background: transparent;
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; cursor: pointer; transition: background .2s, color .2s, box-shadow .2s;
}
.ape__b:disabled { cursor: progress; }
.ape__b:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.ape--claro { background: var(--nu-cream); }
.ape--claro .ape__b { color: var(--nu-gray-2); }
.ape--claro .ape__b:hover { color: var(--nu-ink); }
.ape--claro .ape__b--on { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 1px 3px var(--nu-ink-14); }
.ape--escuro { background: var(--nu-agora-pilula); }
.ape--escuro .ape__b { color: var(--nu-agora-sub); }
.ape--escuro .ape__b:hover { color: var(--nu-agora-texto); }
/* o ativo vence o hover: sem isso, o ponteiro em cima do período escolhido deixava o texto branco no fundo branco */
.ape--escuro .ape__b--on, .ape--escuro .ape__b--on:hover { background: var(--nu-agora-texto); color: var(--nu-agora-bg); }
@media (prefers-reduced-motion: reduce) { .ape__b { transition: none; } }
</style>
