<script setup lang="ts">
/**
 * "Comece por aqui" (banda branca): as frases para colar no assistente, em
 * cartões lado a lado. No lugar do pack de skills: o servidor já ensina o
 * assistente na conexão, e a frase certa leva direto a uma tela da Redentia.
 */
import type { FrasePronta } from '~/content/business/frases'

defineProps<{ frases: FrasePronta[] }>()

const copiada = ref<number | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

async function copiar(i: number, texto: string) {
  try { await navigator.clipboard?.writeText(texto) }
  catch { /* clipboard bloqueado: o texto continua na tela para selecionar */ }
  copiada.value = i
  clearTimeout(timer)
  timer = setTimeout(() => { copiada.value = null }, 1600)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <RbPainelSecao
    id="comece"
    tom="branco"
    eyebrow="Comece por aqui"
    titulo="Cole e pergunte."
    dek="O assistente conectado já sabe quando chamar a Redentia. A resposta vem pronta, quase sempre numa tela com os próximos passos. Não há nada para instalar."
  >
    <div class="rbpc">
      <article v-for="(f, i) in frases" :key="f.texto" class="rbpc__cartao">
        <span class="rbpc__n">{{ String(i + 1).padStart(2, '0') }}</span>
        <p class="rbpc__frase">“{{ f.texto }}”</p>
        <p class="rbpc__res">{{ f.resultado }}</p>
        <button type="button" class="rbpc__copiar" :aria-label="`Copiar a frase ${i + 1}`" @click="copiar(i, f.texto)">
          {{ copiada === i ? 'Copiada' : 'Copiar a frase' }}
        </button>
      </article>
    </div>
  </RbPainelSecao>
</template>

<style scoped>
.rbpc { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.rbpc__cartao { display: flex; flex-direction: column; gap: 12px; padding: 26px; border-radius: var(--nu-r-card); background: var(--rbp-painel); }
.rbpc__n { color: var(--nu-blue); font-size: var(--nu-fs-sm); font-weight: 800; letter-spacing: .02em; font-variant-numeric: tabular-nums; }
.rbpc__frase { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.02em; line-height: 1.3; }
.rbpc__res { margin: 0; flex: 1; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.rbpc__copiar {
  align-self: flex-start; min-height: 40px; padding: 0 18px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-ink); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-sm); font-weight: 800;
  transition: background .2s;
}
.rbpc__copiar:hover { background: var(--nu-gray-3); }
.rbpc__copiar:focus-visible { outline: 3px solid var(--nu-blue-30); outline-offset: 2px; }
</style>
