<script setup lang="ts">
// "Desempenho" (24/11/2026, o canvas do meio-termo): quanto a carteira rendeu
// contra a referência, a nota e os quatro pilares, à vista. O relatório é o
// mesmo que o topo já pede (useCarteiraRelatorio, uma resposta para a tela
// toda); o relatório completo abre logo abaixo (VisaoRelatorio).
import { periodoTxt } from '~/utils/relatorioCarteira'
import DocSecao from '~/components/carteira/doc/DocSecao.vue'
import DocPainel from '~/components/carteira/doc/DocPainel.vue'

const props = defineProps<{ mock?: boolean }>()
const { estado, relatorio } = useCarteiraRelatorio({ mock: props.mock })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const pct = (v: number) => `${nf1.format(v)}%`

const r = computed(() => (estado.value === 'pronto' ? relatorio.value : null))
const frase = computed(() => {
  const x = r.value
  if (!x || x.retorno.twr == null) return null
  const periodo = periodoTxt(x.periodo)
  const ref = x.indicadores.find((i) => i.chave === 'twr')?.bench ?? null
  const base = `No seu caso, a carteira rendeu ${pct(x.retorno.twr)}${periodo ? ` ${periodo.charAt(0).toLowerCase()}${periodo.slice(1)}`.replace(/\.$/, '') : ''}.`
  return ref != null ? `${base} Uma carteira de referência com as mesmas classes rendeu ${pct(ref)}.` : base
})
const pilares = computed(() => (r.value?.pilares ?? []).filter((p) => p.nota != null))
</script>

<template>
  <DocSecao v-if="r && (frase || pilares.length)" titulo="Desempenho" id-titulo="vnt-t">
    <template v-if="frase" #frase>{{ frase }}</template>
    <DocPainel v-if="pilares.length" rotulo="Nota da carteira, de 0 a 100">
      <template v-if="r.nota != null" #colunas><span class="vnt__nota">{{ Math.round(r.nota) }}</span></template>
      <ul class="vnt__pilares">
        <li v-for="p in pilares" :key="p.chave" class="vnt__pilar">
          <span class="vnt__nome">{{ p.nome }}</span>
          <span class="vnt__trilho" aria-hidden="true"><i :style="{ width: `${Math.max(0, Math.min(100, p.nota ?? 0))}%` }" /></span>
          <span class="vnt__n">{{ Math.round(p.nota ?? 0) }}</span>
        </li>
      </ul>
    </DocPainel>
  </DocSecao>
</template>

<style scoped>
.vnt__nota { color: var(--nu-ink); font-size: 26px; font-weight: var(--nu-w-display); letter-spacing: -0.02em; line-height: 1; text-transform: none; }
.vnt__pilares { margin: 0; padding: 0; list-style: none; }
.vnt__pilar { display: grid; grid-template-columns: minmax(96px, 150px) minmax(0, 1fr) 40px; align-items: center; gap: 16px; min-height: 46px; font-variant-numeric: tabular-nums; }
.vnt__nome { font-size: 16px; }
.vnt__trilho { display: block; height: 6px; border-radius: 3px; background: var(--nu-line-2); overflow: hidden; }
.vnt__trilho i { display: block; height: 6px; border-radius: 3px; background: var(--nu-blue); }
.vnt__n { font-size: 16px; font-weight: var(--nu-w-display); text-align: right; }
</style>
