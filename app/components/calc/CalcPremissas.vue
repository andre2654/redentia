<script setup lang="ts">
// As premissas das calculadoras na frase (21/10/2026): o que não está na frase
// fica aqui, fechado e já preenchido com valores de mercado. Fechado, mostra
// a linha que resume a conta ("retorno de 10% a.a. · inflação de 4%…") e o
// "Ajustar premissas". Aberto, uma grade de campos (cada filho com a classe
// `cpr-item`, um CalcSliderField dentro) e o "Restaurar padrão".
// 11/11/2026 (a preço-teto): a mesma linha serve para "Os dados desta conta".
// O nome, o texto do botão e o resumo (slot `resumo`, para valores que viram
// selos) vêm de fora; sem o slot padrão não há painel, e o botão só liga e
// desliga `aberto` (v-model:aberto) para quem usa. Sem painel e sem `abrir`, a
// linha é só para ler (as páginas de método). Sem nada disso, é a linha de
// premissas de sempre.
withDefaults(defineProps<{
  /** a linha que resume as premissas atuais (ou o slot `resumo`) */
  resumo?: string
  /** o nome da linha */
  nome?: string
  /** o texto do botão fechado e aberto */
  abrir?: string
  fechar?: string
}>(), { resumo: '', nome: 'Premissas', abrir: undefined, fechar: 'Fechar premissas' })
const emit = defineEmits<{ restaurar: [] }>()

const aberto = defineModel<boolean>('aberto', { default: false })
const id = useId()
</script>

<template>
  <div class="cpr">
    <div class="cpr__linha">
      <p class="cpr__resumo"><span class="cpr__nome">{{ nome }}:</span> <slot name="resumo">{{ resumo }}</slot></p>
      <button v-if="$slots.default || abrir" type="button" class="cpr__botao" :aria-expanded="aberto" :aria-controls="$slots.default ? id : undefined" @click="aberto = !aberto">
        {{ aberto ? fechar : (abrir ?? 'Ajustar premissas') }}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ 'cpr__seta--aberta': aberto }" class="cpr__seta"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
    <div v-if="$slots.default" v-show="aberto" :id="id" class="cpr__painel">
      <div class="cpr__cabeca">
        <span class="cpr__nota">Cada uma já vem num valor de mercado. Mexa só se quiser.</span>
        <button type="button" class="cpr__restaurar" @click="emit('restaurar')">Restaurar padrão</button>
      </div>
      <div class="cpr__grade"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.cpr__linha { display: flex; align-items: center; gap: 16px; }
.cpr__resumo { flex: 1; min-width: 0; margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.cpr__nome { color: var(--nu-ink); font-weight: 700; }
.cpr__botao {
  flex: none; display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0; border: 0; cursor: pointer;
  background: transparent; color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
}
.cpr__seta { transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.cpr__botao:hover .cpr__seta:not(.cpr__seta--aberta) { transform: translateX(3px); }
.cpr__seta--aberta { transform: rotate(90deg); }
.cpr__painel { margin-top: 16px; padding: 20px 22px 22px; border-radius: var(--nu-r-panel); background: var(--nu-band); animation: nu-fade .3s ease both; }
.cpr__cabeca { display: flex; align-items: baseline; gap: 14px; }
.cpr__nota { flex: 1; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.cpr__restaurar {
  flex: none; min-height: 44px; padding: 0; border: 0; cursor: pointer; background: transparent;
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
  text-decoration: underline; text-underline-offset: 3px;
}
.cpr__grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 16px; }
.cpr__grade :slotted(.cpr-item) { padding: 18px 20px 20px; border-radius: var(--nu-r-tile); background: var(--nu-white); }

@media (max-width: 1100px) { .cpr__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) {
  .cpr__linha { flex-direction: column; align-items: flex-start; gap: 4px; }
  .cpr__painel { padding: 16px 14px 16px; border-radius: var(--nu-r-tile); }
  .cpr__grade { grid-template-columns: minmax(0, 1fr); }
}
</style>
