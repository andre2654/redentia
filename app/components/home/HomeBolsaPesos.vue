<script setup lang="ts">
// Quem mexeu no índice, desenhado (31/10/2026): barras para os dois lados do
// zero, em pontos do Ibovespa (peso × variação; as classes da mesma empresa
// juntas). Em cima, as cinco que fizeram o movimento do dia; embaixo, as três
// que andaram contra. Cada linha leva à página do ativo e mostra a variação
// do papel no hover. Embaixo, a contagem das 76 ações numa régua só.
// Cores: queda --nu-chart-queda e alta --nu-chart-alta, o par validado contra
// daltonismo sobre o creme (o verde da casa com o vermelho falha no deutan).
// O lado do zero e o sinal do número também dizem o sentido: a cor não está
// sozinha.
import type { EmpresaDoDia } from '~/utils/bolsaDoDia'

const props = defineProps<{
  pesos: { variacao: number; negativas: EmpresaDoDia[]; positivas: EmpresaDoDia[] }
  contagem: { altas: number; quedas: number; total: number } | null
  /** "tirou"/"somou" no passado; "tira"/"soma" ao vivo */
  aoVivo: boolean
}>()
const emit = defineEmits<{ (e: 'clique'): void }>()

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pontos = (v: number) => {
  const n = Math.trunc(v)
  return n === 0 ? '0' : `${n > 0 ? '+' : '−'}${nf0.format(Math.abs(n))}`
}
const pct = (v: number | null) => (v == null ? null : `${v > 0 ? '+' : v < 0 ? '−' : ''}${nf2.format(Math.abs(v))}%`)

const queda = computed(() => props.pesos.variacao < 0)
const linhas = computed(() => {
  const fizeram = (queda.value ? props.pesos.negativas : props.pesos.positivas).slice(0, 5)
  const contra = (queda.value ? props.pesos.positivas : props.pesos.negativas).slice(0, 3)
  return [...fizeram, ...contra]
})
const maximo = computed(() => Math.max(1, ...linhas.value.map((l) => Math.abs(l.pontos))))
const largura = (v: number) => `${Math.max(2, (Math.abs(v) / maximo.value) * 100)}%`
const nFizeram = computed(() => Math.min(5, (queda.value ? props.pesos.negativas : props.pesos.positivas).length))

const rotuloFizeram = computed(() => (queda.value ? (props.aoVivo ? 'tiram pontos' : 'tiraram pontos') : (props.aoVivo ? 'somam pontos' : 'somaram pontos')))
const rotuloContra = computed(() => (queda.value ? (props.aoVivo ? 'somam' : 'somaram') : (props.aoVivo ? 'tiram' : 'tiraram')))

const estaveis = computed(() => (props.contagem ? Math.max(0, props.contagem.total - props.contagem.altas - props.contagem.quedas) : 0))
</script>

<template>
  <figure class="hbp">
    <figcaption class="hbp__cabeca">
      <span class="hbp__titulo">Quem mais mexeu no índice</span>
      <span class="hbp__legenda">
        <span class="hbp__chave"><i class="hbp__amostra hbp__amostra--queda" />tirou pontos</span>
        <span class="hbp__chave"><i class="hbp__amostra hbp__amostra--alta" />somou pontos</span>
      </span>
    </figcaption>

    <ol class="hbp__lista" :aria-label="`As que mais ${rotuloFizeram} e as que ${rotuloContra}, em pontos do Ibovespa`">
      <li v-for="(l, i) in linhas" :key="l.ticker" class="hbp__linha" :class="{ 'hbp__linha--contra': i === nFizeram }">
        <NuxtLink :to="`/asset/${l.ticker}`" class="hbp__link" @click="emit('clique')">
          <span class="hbp__nome"><span class="hbp__nome-txt">{{ l.nome }}</span><span v-if="pct(l.pct)" class="hbp__pct">{{ pct(l.pct) }}</span></span>
          <span class="hbp__meia hbp__meia--esq">
            <template v-if="l.pontos < 0">
              <span class="hbp__valor">{{ pontos(l.pontos) }}</span>
              <span class="hbp__barra hbp__barra--queda" :style="{ width: largura(l.pontos) }" />
            </template>
          </span>
          <span class="hbp__meia hbp__meia--dir">
            <template v-if="l.pontos > 0">
              <span class="hbp__barra hbp__barra--alta" :style="{ width: largura(l.pontos) }" />
              <span class="hbp__valor">{{ pontos(l.pontos) }}</span>
            </template>
          </span>
        </NuxtLink>
      </li>
    </ol>

    <!-- a contagem: as 76 ações do índice numa régua -->
    <div v-if="contagem" class="hbp__contagem">
      <div class="hbp__regua" role="img" :aria-label="`${contagem.altas} das ${contagem.total} ações do Ibovespa subiram, ${contagem.quedas} caíram`">
        <span class="hbp__parte hbp__parte--alta" :style="{ flexGrow: contagem.altas }" />
        <span v-if="estaveis" class="hbp__parte hbp__parte--zero" :style="{ flexGrow: estaveis }" />
        <span class="hbp__parte hbp__parte--queda" :style="{ flexGrow: contagem.quedas }" />
      </div>
      <p class="hbp__contagem-txt" aria-hidden="true">
        <span><strong>{{ contagem.altas }}</strong> {{ aoVivo ? 'sobem' : 'subiram' }}</span>
        <span><strong>{{ contagem.quedas }}</strong> {{ aoVivo ? 'caem' : 'caíram' }}</span>
      </p>
    </div>
  </figure>
</template>

<style scoped>
.hbp { margin: 0; min-width: 0; }
.hbp__cabeca { display: flex; align-items: baseline; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; }
.hbp__titulo { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.hbp__legenda { display: inline-flex; gap: 14px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.hbp__chave { display: inline-flex; align-items: center; gap: 6px; }
.hbp__amostra { width: 10px; height: 10px; border-radius: 3px; }
.hbp__amostra--queda { background: var(--nu-chart-queda); }
.hbp__amostra--alta { background: var(--nu-chart-alta); }

.hbp__lista { list-style: none; margin: 14px 0 0; padding: 0; }
/* uma linha fina separa as que fizeram o dia das que andaram contra */
.hbp__linha--contra { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--nu-cream-line); }
.hbp__link {
  display: grid; grid-template-columns: minmax(110px, 190px) minmax(0, 1fr) minmax(0, 1fr); align-items: center;
  min-height: 34px; padding: 0 8px; border-radius: 8px; color: var(--nu-ink); transition: background .15s;
}
.hbp__link:hover { background: var(--nu-cream-line); color: var(--nu-ink); }
.hbp__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }
.hbp__nome { display: flex; align-items: baseline; gap: 6px; min-width: 0; padding-right: 8px; font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.hbp__nome-txt { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
/* a variação do papel aparece no hover, no lugar que já estava reservado (nada pula) */
.hbp__pct { flex: none; visibility: hidden; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.hbp__link:hover .hbp__pct, .hbp__link:focus-visible .hbp__pct { visibility: visible; }

/* as duas metades: o zero é a linha entre elas */
.hbp__meia { display: flex; align-items: center; gap: 6px; height: 34px; min-width: 0; }
.hbp__meia--esq { justify-content: flex-end; }
.hbp__meia--dir { border-left: 1px solid var(--nu-ink-30); }
.hbp__barra { height: 14px; flex: 0 1 auto; }
/* 4 px arredondados na ponta, reto no zero */
.hbp__barra--queda { background: var(--nu-chart-queda); border-radius: 4px 0 0 4px; }
.hbp__barra--alta { background: var(--nu-chart-alta); border-radius: 0 4px 4px 0; }
.hbp__valor { flex: none; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums; }

.hbp__contagem { margin-top: 18px; }
.hbp__regua { display: flex; gap: 2px; height: 8px; }
.hbp__parte { flex-basis: 0; min-width: 2px; }
.hbp__parte:first-child { border-radius: 4px 0 0 4px; }
.hbp__parte:last-child { border-radius: 0 4px 4px 0; }
.hbp__parte--alta { background: var(--nu-chart-alta); }
.hbp__parte--zero { background: var(--nu-sand); }
.hbp__parte--queda { background: var(--nu-chart-queda); }
.hbp__contagem-txt { margin: 8px 0 0; display: flex; justify-content: space-between; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.hbp__contagem-txt strong { color: var(--nu-ink); font-weight: 800; }

/* no celular, a coluna dos nomes encolhe para as barras terem onde crescer */
@media (max-width: 560px) {
  .hbp__link { grid-template-columns: minmax(84px, 104px) minmax(0, 1fr) minmax(0, 1fr); padding: 0 4px; }
  .hbp__pct { display: none; }
}
</style>
