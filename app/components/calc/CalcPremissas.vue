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
// Robustez (11/11/2026): o painel abre como o acordeão da base (NuAcordeao): a
// altura anima de 0 ao conteúdo com a opacidade junto (--nu-dur-lenta
// --nu-ease-troca) e a seta gira na mesma curva. Fechado, o painel segue no
// HTML com `inert` (o leitor de tela e o Tab não entram).
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
    <div v-if="$slots.default" :id="id" class="cpr__dobra" :class="{ 'cpr__dobra--aberta': aberto }" :inert="!aberto || undefined">
      <div class="cpr__dentro">
        <div class="cpr__painel">
          <div class="cpr__cabeca">
            <span class="cpr__nota">Cada uma já vem num valor de mercado. Mexa só se quiser.</span>
            <button type="button" class="cpr__restaurar" @click="emit('restaurar')">Restaurar padrão</button>
          </div>
          <div class="cpr__grade"><slot /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cpr__linha { display: flex; align-items: center; gap: 16px; }
.cpr__resumo { flex: 1; min-width: 0; margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; }
.cpr__nome { color: var(--nu-ink); font-weight: var(--nu-w-medio); }
.cpr__botao {
  position: relative; flex: none; display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0; border: 0; cursor: pointer;
  background: transparent; color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap;
  text-decoration-line: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: transparent;
  -webkit-tap-highlight-color: transparent;
  transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor), opacity var(--nu-dur-rapida) var(--nu-ease-cor);
}
.cpr__botao:hover { text-decoration-color: currentColor; }
.cpr__botao:active { opacity: .72; }
/* o anel de foco abraça o texto e a seta, não a área de toque */
.cpr__botao:focus-visible { outline: none; }
.cpr__botao:focus-visible::after { content: ''; position: absolute; inset: 8px -6px; border-radius: 6px; pointer-events: none; outline: 3px solid var(--nu-blue); outline-offset: 2px; }
.cpr__seta { transition: transform var(--nu-dur-lenta) var(--nu-ease-troca); }
.cpr__botao:hover .cpr__seta:not(.cpr__seta--aberta) { transform: translateX(3px); transition-duration: var(--nu-dur-media); transition-timing-function: var(--nu-ease-saida); }
.cpr__seta--aberta { transform: rotate(90deg); }
/* o painel abre como o acordeão: a altura de 0 ao conteúdo, com a opacidade junto */
.cpr__dobra {
  display: grid; grid-template-rows: 0fr; opacity: 0;
  transition: grid-template-rows var(--nu-dur-lenta) var(--nu-ease-troca), opacity var(--nu-dur-lenta) var(--nu-ease-troca);
}
.cpr__dobra--aberta { grid-template-rows: 1fr; opacity: 1; }
.cpr__dentro { min-height: 0; overflow: hidden; }
.cpr__painel { margin-top: 16px; padding: 20px 22px 22px; border-radius: var(--nu-r-panel); background: var(--nu-band); }
.cpr__cabeca { display: flex; align-items: baseline; gap: 14px; }
.cpr__nota { flex: 1; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }
.cpr__restaurar {
  flex: none; min-height: 44px; padding: 0; border: 0; cursor: pointer; background: transparent;
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio);
  text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px;
  text-decoration-color: color-mix(in srgb, var(--nu-ink) 35%, transparent);
  transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor), opacity var(--nu-dur-rapida) var(--nu-ease-cor);
}
.cpr__restaurar:hover { text-decoration-color: currentColor; }
.cpr__restaurar:active { opacity: .72; }
.cpr__grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
.cpr__grade :slotted(.cpr-item) { padding: 18px 20px 20px; border-radius: var(--nu-r-tile); background: var(--nu-white); }

@media (max-width: 1100px) { .cpr__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) {
  .cpr__linha { flex-direction: column; align-items: flex-start; gap: 4px; }
  .cpr__painel { padding: 16px 14px 16px; border-radius: var(--nu-r-tile); }
  .cpr__grade { grid-template-columns: minmax(0, 1fr); }
}
</style>
