<script setup lang="ts">
// "Ver o relatório completo" (07/11/2026; plano, Parte 4.4): o relatório da
// carteira no lugar da "Análise completa" e do Raio-X. Fechado, é o mesmo
// botão-cartão da análise (CarteiraAnalise). Aberto, busca o
// GET /me/carteira/relatorio (com esqueleto enquanto carrega) e mostra:
//  - a nota grande, a mediana dos 4 pilares (retorno, risco, eficiência e
//    diversificação), cada pilar com a barrinha dele;
//  - os indicadores por pilar: o valor, o do benchmark, a barrinha da nota e o
//    "Como calculei", que abre a definição e a conta;
//  - contra o quê: o período, o selo de "histórico curto" e o benchmark
//    composto pelas classes da carteira;
//  - o desempenho (VisaoDesempenho, 07/11): a rentabilidade (TWR) das séries
//    do mesmo relatório contra o benchmark, e não mais a curva do patrimônio
//    com os aportes (o "Você +51%" contra a TWR de ~20%);
//  - depois, os componentes de sempre: as movimentações (com o selo do
//    imposto nas vendas, cruzando com o histórico do imposto) e o P&L mês a
//    mês.
// Chegar com âncora de uma dessas partes (#relatorio, #movimentacoes…, o link
// do relatório mensal) abre sozinho, e, desde 08/11, também a troca do hash com
// a página aberta (as ações dos avisos).
import type { CarteiraPayload } from '~/types/carteira'
import type { MesHistorico } from '~/types/carteiraVisao'
import { composicaoTxt, fraseDaNota, indicadoresPorPilar, periodoTxt, valorDoIndicador } from '~/utils/relatorioCarteira'
import { selosDasVendas } from '~/utils/impostoVisao'
import VisaoDesempenho from './VisaoDesempenho.vue'

const props = defineProps<{ payload: CarteiraPayload; historico: MesHistorico[]; mock?: boolean }>()

const { estado, relatorio, carregar } = useCarteiraRelatorio({ mock: props.mock })
const aberta = ref(false)
function alternar() {
  aberta.value = !aberta.value
  if (aberta.value) void carregar()
}

const partes = computed(() => {
  const p = props.payload
  // o desempenho sai do próprio relatório (as séries da TWR e do benchmark)
  const l = ['a nota e os indicadores', 'o desempenho contra o benchmark']
  if (p.movements) l.push('as movimentações')
  if (p.heatmap) l.push('o P&L mês a mês')
  const t = l.length === 1 ? l[0]! : `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}`
  return `${t.charAt(0).toUpperCase()}${t.slice(1)}.`
})

const r = computed(() => relatorio.value)
const grupos = computed(() => (r.value ? indicadoresPorPilar(r.value) : []))
const periodo = computed(() => (r.value ? periodoTxt(r.value.periodo) : null))
const COR: Record<string, string> = { CDI: 'var(--nu-alloc-fixed)', IBOV: 'var(--nu-alloc-stock)', IFIX: 'var(--nu-alloc-fii)', IVVB11: 'var(--nu-sage)' }
const composicao = computed(() => (r.value?.benchmark.composicao ?? []).map((c) => ({ ...c, cor: COR[c.indice] ?? 'var(--nu-alloc-cash)' })))
const comoAberto = ref<string | null>(null)
const alternarComo = (chave: string) => { comoAberto.value = comoAberto.value === chave ? null : chave }
const largura = (nota: number | null) => `${Math.max(0, Math.min(100, nota ?? 0))}%`

// as vendas da lista de movimentações com o selo do mês delas no imposto
const selos = computed(() => selosDasVendas(props.historico))

const route = useRoute()
const ANCORAS = ['relatorio', 'desempenho', 'movimentacoes', 'pnl']
/** o hash de uma parte do relatório abre a seção, busca o relatório e rola até a parte */
function abrirNaAncora(hash: string) {
  const id = hash.slice(1)
  if (!ANCORAS.includes(id)) return
  aberta.value = true
  void carregar()
  nextTick(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }))
}
onMounted(() => abrirNaAncora(route.hash))
// 08/11/2026: com a página aberta, o "Ver o relatório" de um aviso (#relatorio)
// e o "Ver as vendas" (#movimentacoes) só trocam o hash. Sem isto, a seção
// ficava fechada, e a parte de dentro nem existia para a página rolar até ela
watch(() => route.hash, abrirNaAncora)
</script>

<template>
  <div class="vrl__raiz">
    <section class="can" :class="{ 'can--aberta': aberta }">
      <button type="button" class="can__botao" :aria-expanded="aberta" aria-controls="vrl-conteudo" @click="alternar">
        <span class="can__textos">
          <span class="can__titulo">{{ aberta ? 'Esconder o relatório' : 'Ver o relatório completo' }}</span>
          <span class="can__sub">{{ partes }}</span>
        </span>
        <svg class="can__seta" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </section>

    <div v-if="aberta" id="vrl-conteudo" class="vrl__conteudo">
      <section class="vrl" aria-labelledby="vrl-titulo" :aria-busy="estado === 'carregando'" data-clarity-mask="true">
        <NuEyebrow>Relatório da carteira</NuEyebrow>

        <!-- carregando: o esqueleto na forma do relatório -->
        <div v-if="estado === 'carregando' || estado === 'fechado'" class="vrl__esq" aria-hidden="true">
          <NuSkeleton width="min(560px, 90%)" height="44px" radius="chip" />
          <NuSkeleton variant="text" :lines="2" last-width="55%" class="vrl__esq-sub" />
          <div class="vrl__pilares">
            <div v-for="i in 4" :key="i" class="vrl__pilar"><NuSkeleton width="60%" height="14px" /><NuSkeleton width="48px" height="34px" radius="chip" /><NuSkeleton height="6px" radius="pill" /></div>
          </div>
          <div class="vrl__esq-linhas">
            <NuSkeleton v-for="i in 6" :key="i" height="20px" radius="chip" />
          </div>
        </div>

        <template v-else-if="estado === 'erro'">
          <h2 id="vrl-titulo" class="vrl__frase">O relatório não abriu agora.</h2>
          <p class="vrl__sub">A conta dos indicadores falhou deste lado. O resto da carteira está certo.</p>
          <button type="button" class="vrl__tentar" @click="carregar">Tentar de novo</button>
        </template>

        <template v-else-if="r">
          <h2 id="vrl-titulo" class="vrl__frase">{{ fraseDaNota(r.nota) }}</h2>
          <p class="vrl__sub">
            A nota é a mediana de 4 pilares, para um número extremo não puxar o resto.
            <template v-if="periodo">{{ periodo }}</template>
            <span v-if="r.periodo.historicoCurto" class="vrl__curto">Histórico curto</span>
          </p>
          <p v-if="r.periodo.historicoCurto" class="vrl__curto-x">Com menos de 12 meses, as taxas ao ano ficam sem nota e aparecem em cinza.</p>

          <ul class="vrl__pilares">
            <li v-for="p in r.pilares" :key="p.chave" class="vrl__pilar">
              <span class="vrl__p-n">{{ p.nome }}</span>
              <span class="vrl__p-v" :class="{ 'vrl__p-v--sem': p.nota == null }">{{ p.nota ?? '—' }}</span>
              <span class="vrl__barra" role="img" :aria-label="p.nota == null ? `${p.nome}: sem nota` : `${p.nome}: ${p.nota} de 100`"><i :style="{ width: largura(p.nota) }" /></span>
            </li>
          </ul>

          <div v-for="g in grupos" :key="g.pilar.chave" class="vrl__grupo">
            <h3 class="vrl__h3">{{ g.pilar.nome }}<span v-if="g.pilar.nota != null">nota {{ g.pilar.nota }}</span></h3>
            <ul class="vrl__inds">
              <li v-for="i in g.indicadores" :key="i.chave" class="vrl__ind">
                <span class="vrl__ind-n">{{ i.nome }}</span>
                <span class="vrl__ind-v" :class="{ 'vrl__ind-v--cinza': i.nota == null }">{{ valorDoIndicador(i.valor, i.unidade) }}</span>
                <span class="vrl__ind-b">{{ i.bench != null ? `benchmark ${valorDoIndicador(i.bench, i.unidade)}` : '' }}</span>
                <span class="vrl__ind-nota">
                  <span class="vrl__barra" aria-hidden="true"><i :style="{ width: largura(i.nota) }" /></span>
                  <span class="vrl__ind-nn">{{ i.nota == null ? 'sem nota' : `nota ${i.nota}` }}</span>
                </span>
                <button type="button" class="vrl__como" :aria-expanded="comoAberto === i.chave" :aria-controls="`vrl-como-${i.chave}`" @click="alternarComo(i.chave)">
                  Como calculei
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                <div v-if="comoAberto === i.chave" :id="`vrl-como-${i.chave}`" class="vrl__prova">
                  <p>{{ i.descricao }}</p>
                  <p class="vrl__prova-c">{{ i.comoCalculei }}</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="vrl__bench">
            <h3 class="vrl__h3">Contra o quê</h3>
            <p v-if="composicao.length" class="vrl__bench-x">{{ r.benchmark.nome }}: {{ composicaoTxt(r.benchmark.composicao) }}, na média do período.</p>
            <div v-if="composicao.length" class="vrl__comp" role="img" :aria-label="`Benchmark: ${composicaoTxt(r.benchmark.composicao)}`">
              <span v-for="c in composicao" :key="c.indice" :style="{ width: `${c.peso}%`, background: c.cor }" />
            </div>
            <ul v-if="composicao.length" class="vrl__comp-l">
              <li v-for="c in composicao" :key="c.indice"><i :style="{ background: c.cor }" aria-hidden="true" />{{ c.indice }} <b>{{ Math.round(c.peso) }}%</b></li>
            </ul>
            <ul class="vrl__notas">
              <li v-for="n in r.benchmark.notas" :key="n">{{ n }}</li>
            </ul>
          </div>
        </template>
      </section>

      <VisaoDesempenho id="desempenho" class="vrl__sec" :relatorio="r" :estado="estado" data-clarity-mask="true" />
      <CarteiraMovements v-if="payload.movements" id="movimentacoes" class="vrl__sec" :movements="payload.movements" :selos="selos" data-clarity-mask="true" />
      <CarteiraHeatmap v-if="payload.heatmap" id="pnl" class="vrl__sec" :heatmap="payload.heatmap" data-clarity-mask="true" />
    </div>
  </div>
</template>

<style scoped>
/* fechado: o mesmo botão-cartão da análise completa (CarteiraAnalise) */
.vrl__raiz { scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.can { background: var(--nu-page); padding: 0 clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px); scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.can__botao {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 20px;
  background: var(--nu-band); border: none; cursor: pointer; font-family: inherit; text-align: left;
  border-radius: var(--nu-r-card); padding: clamp(20px, 2.6vw, 28px) clamp(22px, 3vw, 32px); box-shadow: var(--nu-shadow-quente);
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s;
}
/* cartão clicável: sobe 2px e ganha a sombra de cartão flutuando */
.can__botao:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.can__botao:active { transform: scale(.995); }
.can__textos { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.can__titulo { color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.025em; }
.can__sub { color: var(--nu-gray); font-size: 15px; font-weight: 500; }
/* a seta no círculo carvão de 44px, que gira ao abrir */
.can__seta { box-sizing: content-box; padding: 11px; border-radius: 50%; background: var(--nu-ink); color: var(--nu-white); flex-shrink: 0; transition: transform .25s; }
.can--aberta .can__seta { transform: rotate(180deg); }
.vrl__conteudo { animation: nu-fade .4s ease both; }
.vrl__sec { scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }

/* aberto: no idioma de "Quanto ele te paga" */
.vrl { background: var(--nu-band); padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.vrl__frase { margin: 18px 0 0; max-width: 900px; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.04; font-variant-numeric: tabular-nums; text-wrap: balance; }
.vrl__sub { margin: 16px 0 0; max-width: 760px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; font-variant-numeric: tabular-nums; }
.vrl__curto { display: inline-flex; align-items: center; height: 26px; margin-left: 6px; padding: 0 9px; border-radius: var(--nu-r-tag); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 700; vertical-align: 2px; }
.vrl__curto-x { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.vrl__tentar { margin-top: 18px; height: 48px; padding: 0 22px; border: 0; border-radius: var(--nu-r-pill); background: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-ink); color: var(--nu-ink); font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; transition: background .2s, transform .15s; }
.vrl__tentar:hover { background: var(--nu-row-hover); }
.vrl__tentar:active { transform: scale(.98); }

/* os 4 pilares no cartão carvão: a nota é o momento de destaque do relatório */
.vrl__pilares { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px clamp(20px, 3vw, 40px); list-style: none; margin: clamp(26px, 3.4vw, 40px) 0 0; padding: clamp(22px, 2.8vw, 32px); max-width: 1100px; box-sizing: border-box; border-radius: var(--nu-r-card); background: var(--nu-ink); box-shadow: var(--nu-shadow-escuro); }
.vrl__pilar { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.vrl__p-n { color: var(--nu-on-dark); font-size: 15px; font-weight: 600; }
.vrl__p-v { color: var(--nu-white); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.vrl__p-v--sem { color: var(--nu-on-dark-2); }
.vrl__barra { display: block; height: 8px; border-radius: var(--nu-r-pill); background: var(--nu-line-2); overflow: hidden; }
.vrl__pilar .vrl__barra { background: var(--nu-dark-chip-line); }
.vrl__pilar .vrl__barra i { background: var(--nu-blue-on-dark); }
.vrl__esq .vrl__pilares { background: transparent; box-shadow: none; padding: 0; }
.vrl__barra i { display: block; height: 100%; border-radius: inherit; background: var(--nu-blue); transform-origin: left; animation: vrl-cresce .9s cubic-bezier(.22, 1, .36, 1) .1s both; }
@keyframes vrl-cresce { from { transform: scaleX(0); } }

/* cada pilar num cartão creme, com a nota num selo carvão */
.vrl__grupo { margin-top: clamp(14px, 1.6vw, 20px); max-width: 1100px; box-sizing: border-box; padding: clamp(20px, 2.6vw, 30px) clamp(20px, 2.6vw, 30px) clamp(10px, 1.4vw, 16px); border-radius: var(--nu-r-card); background: var(--nu-page); box-shadow: var(--nu-shadow-quente); }
.vrl__h3 { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.025em; }
.vrl__h3 span { display: inline-flex; align-items: center; height: 28px; padding: 0 10px; border-radius: var(--nu-r-tag); background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 700; letter-spacing: 0; font-variant-numeric: tabular-nums; }
.vrl__inds { list-style: none; margin: 10px 0 0; padding: 0; }
.vrl__ind {
  display: grid; grid-template-columns: minmax(0, 1.6fr) 96px minmax(0, 1fr) 150px auto; grid-template-areas: 'n v b nota como' 'prova prova prova prova prova';
  align-items: center; gap: 0 16px; padding: 13px 0; border-top: 1.5px solid var(--nu-line); font-variant-numeric: tabular-nums;
}
.vrl__ind:first-child { border-top: 0; }
.vrl__ind-n { grid-area: n; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.vrl__ind-v { grid-area: v; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; text-align: right; white-space: nowrap; }
.vrl__ind-v--cinza { color: var(--nu-gray); }
.vrl__ind-b { grid-area: b; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap; }
.vrl__ind-nota { grid-area: nota; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px; }
.vrl__ind-nn { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.vrl__como { grid-area: como; display: inline-flex; align-items: center; gap: 4px; justify-self: end; padding: 4px 0; border: 0; background: none; cursor: pointer; color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.vrl__como[aria-expanded='true'] svg { transform: rotate(180deg); }
.vrl__como svg { transition: transform .2s; }
.vrl__como:focus-visible { border-radius: 4px; }
.vrl__prova { grid-area: prova; margin-top: 10px; padding: 12px 14px; border-radius: var(--nu-r-chip); background: var(--nu-band); animation: nu-fade .2s ease both; }
.vrl__prova p { margin: 0; max-width: 80ch; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.55; }
.vrl__prova .vrl__prova-c { margin-top: 6px; color: var(--nu-gray-3); font-weight: 500; }

.vrl__bench { margin-top: clamp(14px, 1.6vw, 20px); max-width: 1100px; box-sizing: border-box; padding: clamp(20px, 2.6vw, 30px); border-radius: var(--nu-r-card); background: var(--nu-page); box-shadow: var(--nu-shadow-quente); }
.vrl__bench-x { margin: 10px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 600; line-height: 1.5; font-variant-numeric: tabular-nums; }
.vrl__comp { display: flex; gap: 4px; height: 26px; margin-top: 14px; border-radius: 15px; overflow: hidden; }
.vrl__comp span { display: block; height: 100%; border-radius: 6px; }
.vrl__comp-l { display: flex; flex-wrap: wrap; gap: 6px 20px; list-style: none; margin: 10px 0 0; padding: 0; }
.vrl__comp-l li { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.vrl__comp-l i { width: 12px; height: 12px; border-radius: 50%; }
.vrl__comp-l b { color: var(--nu-ink); font-weight: 800; }
.vrl__notas { margin: 14px 0 0; padding: 0 0 0 18px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.6; }

.vrl__esq { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; max-width: 1100px; }
.vrl__esq-sub { max-width: 640px; }
.vrl__esq .vrl__pilares { margin-top: 18px; }
.vrl__esq-linhas { display: flex; flex-direction: column; gap: 14px; margin-top: 26px; }

@media (max-width: 760px) {
  .vrl__pilares { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .vrl__ind { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'n v' 'b nota' 'como como' 'prova prova'; gap: 6px 12px; }
  .vrl__ind-nota { grid-template-columns: 72px auto; justify-self: end; }
  .vrl__como { justify-self: start; }
}
@media (prefers-reduced-motion: reduce) {
  .vrl__barra i, .vrl__prova, .vrl__conteudo { animation: none; }
  .can__seta, .vrl__como svg { transition: none; }
}
</style>
