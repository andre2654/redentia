<script setup lang="ts">
// As premissas das calculadoras na frase (21/10/2026): o que não está na frase
// fica aqui, fechado e já preenchido com valores de mercado. Fechado, mostra
// a linha que resume a conta ("retorno de 10% a.a. · inflação de 4%…") e o
// "Ajustar premissas". Aberto, uma grade de campos (cada filho com a classe
// `cpr-item`, um CalcSliderField dentro) e o "Restaurar padrão".
defineProps<{
  /** a linha que resume as premissas atuais */
  resumo: string
}>()
const emit = defineEmits<{ restaurar: [] }>()

const aberto = ref(false)
const id = useId()
</script>

<template>
  <div class="cpr">
    <div class="cpr__linha">
      <p class="cpr__resumo"><span class="cpr__nome">Premissas:</span> {{ resumo }}</p>
      <button type="button" class="cpr__botao" :aria-expanded="aberto" :aria-controls="id" @click="aberto = !aberto">
        {{ aberto ? 'Fechar premissas' : 'Ajustar premissas' }}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ 'cpr__seta--aberta': aberto }" class="cpr__seta"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
    <div v-show="aberto" :id="id" class="cpr__painel">
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
.cpr__nome { color: var(--nu-gray-2); font-weight: 700; }
.cpr__botao {
  flex: none; display: inline-flex; align-items: center; gap: 4px; padding: 6px 0; border: 0; cursor: pointer;
  background: transparent; color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
}
.cpr__seta { transition: transform .2s ease; }
.cpr__seta--aberta { transform: rotate(90deg); }
.cpr__painel { margin-top: 16px; padding: 20px 22px 22px; border-radius: 24px; background: var(--nu-cream); }
.cpr__cabeca { display: flex; align-items: baseline; gap: 14px; }
.cpr__nota { flex: 1; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.cpr__restaurar {
  flex: none; padding: 0; border: 0; cursor: pointer; background: transparent;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
}
.cpr__grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 16px; }
.cpr__grade :slotted(.cpr-item) { padding: 18px 20px 20px; border-radius: 20px; background: var(--nu-white); }

@media (max-width: 1100px) { .cpr__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) {
  .cpr__linha { flex-direction: column; align-items: flex-start; gap: 4px; }
  .cpr__painel { padding: 16px 14px 16px; border-radius: 20px; }
  .cpr__grade { grid-template-columns: minmax(0, 1fr); }
}
</style>
