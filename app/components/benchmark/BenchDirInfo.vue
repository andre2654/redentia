<script setup lang="ts">
// Os dois botões de cada índice do /benchmark-ia "A noite": "Leitura"
// (a opinião da casa, com o selo) e "i" (como ler o gráfico). Os dois abrem
// o modal da casa (NuDayModal).
import type { BenchChartInfo } from '~/types/benchmark'
import type { Leitura } from '~/content/benchmark-ia/leituras'
import type { NuDayBlock } from '~/types/market'

const props = withDefaults(defineProps<{ titulo: string; info?: BenchChartInfo; leitura?: Leitura; tom?: 'claro' | 'escuro' }>(), { info: undefined, leitura: undefined, tom: 'claro' })

const abertoInfo = ref(false)
const abertaLeitura = ref(false)
const CORES = ['var(--nu-blue-text)', 'var(--nu-green-2)', 'var(--nu-amber-text)']
// o modal usa v-html: o texto é constante nossa, mas escapa mesmo assim
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const blocos = computed<NuDayBlock[]>(() =>
  (props.info?.blocos ?? []).map((b, i) => ({ label: b.rotulo, color: CORES[i % CORES.length]!, html: esc(b.texto) })))
const blocosLeitura = computed<NuDayBlock[]>(() => (props.leitura
  ? [
      { label: 'A leitura', color: CORES[0]!, html: esc(`${props.leitura.numero} ${props.leitura.frase}`) },
      ...(props.leitura.detalhe ? [{ label: 'O detalhe', color: CORES[1]!, html: esc(props.leitura.detalhe) }] : []),
    ]
  : []))
</script>

<template>
  <span v-if="info || leitura" class="bdi" :class="`bdi--${tom}`">
    <button v-if="leitura" type="button" class="bdi__b bdi__b--leitura" :aria-label="`Leitura da Aportou: ${titulo}`" aria-haspopup="dialog" @click="abertaLeitura = true">
      <MarcaCorte :largura="20" />
      <span class="bdi__txt">Leitura</span>
    </button>
    <button v-if="info" type="button" class="bdi__b bdi__b--i" :aria-label="`Como ler: ${info.titulo}`" aria-haspopup="dialog" @click="abertoInfo = true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.6v.01" stroke-width="2.4" />
      </svg>
    </button>
    <NuDayModal v-if="info" :open="abertoInfo" eyebrow="Como ler" :title="info.titulo" :date-line="info.sub" :blocks="blocos" @close="abertoInfo = false" />
    <NuDayModal v-if="leitura" :open="abertaLeitura" eyebrow="Leitura da Aportou" :title="leitura.numero" :date-line="titulo" :blocks="blocosLeitura" @close="abertaLeitura = false" />
  </span>
</template>

<style scoped>
.bdi { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; }
.bdi__b {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font: inherit; font-size: 14.5px; font-weight: var(--nu-w-medio); cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-rapida) var(--nu-ease-cor), color var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.bdi__b--i { width: 44px; }
.bdi__b--leitura { padding: 0 16px 0 12px; }
.bdi__b:hover { background: var(--nu-line-2); }
.bdi__b:active { transform: scale(.98); }
.bdi--escuro .bdi__b { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); }
.bdi--escuro .bdi__b:hover { background: var(--nu-white-18); box-shadow: none; color: var(--nu-agora-texto); }
@media (max-width: 560px) {
  .bdi__b--leitura { width: 44px; padding: 0; }
  .bdi__txt { display: none; }
}
</style>
