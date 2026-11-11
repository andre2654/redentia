<script setup lang="ts">
// Campo de valor e os números do resultado. Tudo empilha em 390 px: nada de
// tabela com rolagem lateral. O R$ fica ao lado do campo, não por cima.
// Robustez (11/11/2026): os valores prontos são o NuTrilho (escolher um entre
// poucos: a pílula carvão desliza até o novo; com um valor digitado que não é
// nenhum deles, nenhum fica aceso); o campo escurece a borda sob o ponteiro; o
// número do resultado troca com um fade curto nos tokens.
import { lerValorBr, valorQuantoRende, dinheiroFmt, VALOR_PADRAO } from '~/utils/quanto-rende'
import type { OpcaoDoTrilho } from '~/components/nu/NuTrilho.vue'

const props = defineProps<{
  modelValue: number
  cards: { rotulo: string; valor: string; fonte: string }[]
  aviso: string
}>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const texto = ref(dinheiroFmt(props.modelValue).replace(/^R\$\s*/, ''))
const atalhos: OpcaoDoTrilho<number>[] = [1000, 5000, 10_000, 100_000].map((a) => ({ valor: a, rotulo: dinheiroFmt(a) }))

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
    <div class="qr__entrada">
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
        <NuTrilho :opcoes="atalhos" :model-value="modelValue" tamanho="p" rotulo="Valores prontos" class="qr__atalhos" @update:model-value="aplicar" />
      </div>
      <p class="qr__aviso">{{ aviso }}</p>
      <div v-if="$slots.default" class="qr__notas"><slot /></div>
    </div>

    <!-- o resultado: o cartão carvão com a faixa da marca; o número troca com um fade curto -->
    <NuFaixaMarca rotulo="O resultado" como="p" :altura="52" class="qr__cards" aria-live="polite">
      <article v-for="c in cards" :key="c.rotulo" v-contexto-chat="{ id: `quanto-rende:${sobre}:${c.rotulo}`, tipo: 'proventos', rotulo: rotuloComSobre(c.rotulo, sobre), texto: `${c.rotulo}${sobre ? ` (${sobre})` : ''}: ${c.valor}. ${c.fonte}` }" class="qr__card">
        <h3 class="qr__card-rotulo">{{ c.rotulo }}</h3>
        <Transition name="qr-n" mode="out-in">
          <p :key="c.valor" class="qr__card-valor">{{ c.valor }}</p>
        </Transition>
        <p class="qr__card-fonte">{{ c.fonte }}</p>
      </article>
    </NuFaixaMarca>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): o campo é o da marca (56px, borda 1,5px, raio 16, foco
   cobalto de 3px) e os atalhos são chips de 44px. 2ª rodada: a ferramenta em
   duas colunas, o valor à esquerda e os números no cartão carvão com a faixa
   da marca à direita (empilha no celular, sem rolagem lateral). */
.qr {
  max-width: 1080px; margin: clamp(28px, 4vw, 40px) auto 0;
  display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(24px, 3vw, 36px); align-items: start;
}
@media (min-width: 900px) { .qr { grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr); column-gap: clamp(32px, 4vw, 56px); } }
.qr__entrada { min-width: 0; }
.qr__campo { max-width: 520px; }
.qr__rotulo { display: block; margin: 0 0 8px; color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-medio); }
.qr__linha {
  display: flex; align-items: center; gap: 10px; min-height: 56px; cursor: text;
  background: var(--nu-white); border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-input);
  padding: 0 6px 0 16px; min-width: 0; transition: border-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor);
}
/* a borda sob o ponteiro: o token da base (o segundo valor só vale enquanto ele não resolve) */
.qr__linha:hover { border-color: var(--nu-borda-campo-hover, color-mix(in srgb, var(--nu-ink) 45%, var(--nu-borda-campo))); }
.qr__prefixo { flex: 0 0 auto; color: var(--nu-gray); font-size: 18px; font-weight: var(--nu-w-medio); }
.qr__input {
  flex: 1 1 auto; min-width: 0; width: 100%;
  border: 0; background: transparent; color: var(--nu-ink);
  font: inherit; font-size: 20px; font-weight: var(--nu-w-forte); letter-spacing: -.02em;
  font-variant-numeric: tabular-nums; padding: 10px 12px 10px 0;
}
.qr__input:focus, .qr__input:focus-visible { outline: none; }
.qr__linha:focus-within { outline: 3px solid var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.qr__atalhos { margin-top: 12px; }

.qr__cards { --pad: clamp(20px, 2.4vw, 30px); overflow: hidden; min-width: 0; padding-bottom: 6px; }
.qr__card {
  margin: 0 var(--pad); padding: clamp(16px, 1.8vw, 22px) 0; min-width: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.qr__card + .qr__card { border-top: 1px solid var(--nu-dark-line); }
.qr__card-rotulo { margin: 0; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); line-height: 1.35; }
.qr__card-valor {
  margin: 0; color: var(--nu-white); font-size: clamp(28px, 3vw, 40px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: 1.05; font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.qr__card-fonte { margin: 0; color: var(--nu-on-dark-2); font-size: 13px; font-weight: var(--nu-w-texto); line-height: 1.45; overflow-wrap: anywhere; }
/* o número que muda: sai e volta com um fade curto (rápido o bastante para quem digita) */
.qr-n-enter-active, .qr-n-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor); }
.qr-n-enter-from, .qr-n-leave-to { opacity: 0; }
.qr__aviso { margin: 24px 0 0; color: var(--nu-ink); font-size: 13.5px; font-weight: var(--nu-w-medio); line-height: 1.5; max-width: 72ch; }
.qr__notas { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.qr__notas :deep(p) { margin: 0; color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); line-height: 1.5; max-width: 72ch; overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .qr__linha, .qr-n-enter-active, .qr-n-leave-active { transition: none; } }
</style>
