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
    <!-- o cartão que abre o relatório: o vivo da base (.nu-cartao--vivo) com o "+" que gira (NuMais 36) -->
    <section v-revelar class="can" :class="{ 'can--aberta': aberta }">
      <button type="button" class="can__botao nu-cartao nu-cartao--vivo" :aria-expanded="aberta" aria-controls="vrl-conteudo" @click="alternar">
        <span class="can__textos">
          <span class="can__titulo">{{ aberta ? 'Esconder o relatório' : 'Ver o relatório completo' }}</span>
          <span class="can__sub">{{ partes }}</span>
        </span>
        <NuMais :tamanho="36" :aberto="aberta" class="can__mais" />
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
          <NuBotaoSeta variante="contorno" tamanho="m" class="vrl__tentar" @click="carregar">Tentar de novo</NuBotaoSeta>
        </template>

        <template v-else-if="r">
          <h2 id="vrl-titulo" class="vrl__frase">{{ fraseDaNota(r.nota) }}</h2>
          <p class="vrl__sub">
            A nota é a mediana de 4 pilares, para um número extremo não puxar o resto.
            <template v-if="periodo">{{ periodo }}</template>
            <NuSelo v-if="r.periodo.historicoCurto" tom="ambar" tamanho="p" class="vrl__curto">Histórico curto</NuSelo>
          </p>
          <p v-if="r.periodo.historicoCurto" class="vrl__curto-x">Com menos de 12 meses, as taxas ao ano ficam sem nota e aparecem em cinza.</p>

          <!-- o cartão carvão da nota: a nota geral em número-herói (a mesma da frase) e os 4 pilares de que ela é a mediana -->
          <div class="vrl__nota">
          <p v-if="r.nota != null" class="vrl__nota-n" aria-hidden="true">
            <b>{{ Math.round(r.nota) }}</b><span>de 100</span>
            <small>A mediana dos 4 pilares</small>
          </p>
          <ul class="vrl__pilares">
            <li v-for="p in r.pilares" :key="p.chave" class="vrl__pilar">
              <span class="vrl__p-n">{{ p.nome }}</span>
              <span class="vrl__p-v" :class="{ 'vrl__p-v--sem': p.nota == null }">{{ p.nota ?? '—' }}</span>
              <span class="vrl__barra" role="img" :aria-label="p.nota == null ? `${p.nome}: sem nota` : `${p.nome}: ${p.nota} de 100`"><i :style="{ width: largura(p.nota) }" /></span>
            </li>
          </ul>
          </div>

          <div v-for="g in grupos" :key="g.pilar.chave" class="vrl__grupo">
            <h3 class="vrl__h3">{{ g.pilar.nome }}<NuSelo v-if="g.pilar.nota != null" tom="carvao">nota {{ g.pilar.nota }}</NuSelo></h3>
            <ul class="vrl__inds">
              <li v-for="i in g.indicadores" :key="i.chave" class="vrl__ind">
                <span class="vrl__ind-n">{{ i.nome }}</span>
                <span class="vrl__ind-v" :class="{ 'vrl__ind-v--cinza': i.nota == null }">{{ valorDoIndicador(i.valor, i.unidade) }}</span>
                <span class="vrl__ind-b">{{ i.bench != null ? `benchmark ${valorDoIndicador(i.bench, i.unidade)}` : '' }}</span>
                <span class="vrl__ind-nota">
                  <span class="vrl__barra" aria-hidden="true"><i :style="{ width: largura(i.nota) }" /></span>
                  <span class="vrl__ind-nn">{{ i.nota == null ? 'sem nota' : `nota ${i.nota}` }}</span>
                </span>
                <!-- "Como calculei": o "+" quieto da base (são 12 numa lista: cheios pesariam); a conta abre na dobra da base e fica no HTML -->
                <button type="button" class="vrl__como" :aria-expanded="comoAberto === i.chave" :aria-controls="`vrl-como-${i.chave}`" @click="alternarComo(i.chave)">
                  Como calculei
                  <NuMais :tamanho="28" tom="quieto" :aberto="comoAberto === i.chave" />
                </button>
                <NuDobra :id="`vrl-como-${i.chave}`" class="vrl__dobra" :aberta="comoAberto === i.chave">
                  <div class="vrl__prova">
                    <p>{{ i.descricao }}</p>
                    <p class="vrl__prova-c">{{ i.comoCalculei }}</p>
                  </div>
                </NuDobra>
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
.can { background: var(--nu-page); padding: 0 var(--cvi-g, clamp(20px, 5.5vw, 80px)) var(--cvi-v, clamp(64px, 7vw, 100px)); scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
/* o cartão, a sombra, o hover (sobe 2px), o apertado e o foco são da base (.nu-cartao--vivo); aqui o fundo da faixa e a caixa */
.can__botao {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 24px;
  background: var(--nu-band); border: none; font-family: inherit; text-align: left;
  padding: clamp(20px, 2.6vw, 28px) clamp(24px, 3vw, 32px);
}
.can__botao:hover .can__titulo { color: var(--nu-blue-text); }
.can__botao:hover .can__mais { background: var(--nu-blue); }
.can__textos { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.can__titulo { color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.can__sub { color: var(--nu-gray); font-size: 15px; font-weight: var(--nu-w-texto); }
/* a seta no círculo carvão de 44px, que gira ao abrir */
/* abrir é uma troca de estado: o conteúdo chega com o fade curto (280ms), sem esperar a rolagem */
.vrl__conteudo { animation: nu-fade var(--nu-dur-media) var(--nu-ease-saida) backwards; }
.vrl__sec { scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }

/* aberto: no idioma de "Quanto ele te paga" */
.vrl { background: var(--nu-band); padding: var(--cvi-v, clamp(64px, 7vw, 100px)) var(--cvi-g, clamp(20px, 5.5vw, 80px)); scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.vrl__frase { margin: 18px 0 0; max-width: 900px; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.04; font-variant-numeric: tabular-nums; text-wrap: balance; }
.vrl__sub { margin: 16px 0 0; max-width: 760px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); line-height: 1.45; font-variant-numeric: tabular-nums; }
.vrl__curto { margin-left: 8px; vertical-align: 2px; }
.vrl__curto-x { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }
.vrl__tentar { margin-top: 24px; }

/* a nota e os 4 pilares no cartão carvão: é o momento de destaque do relatório */
.vrl__nota { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: clamp(24px, 4vw, 56px); margin: clamp(26px, 3.4vw, 40px) 0 0; padding: clamp(22px, 2.8vw, 34px); box-sizing: border-box; border-radius: var(--nu-r-card); background: var(--nu-ink); box-shadow: var(--nu-shadow-escuro); }
.vrl__nota-n { display: grid; grid-template-columns: auto auto; align-items: baseline; justify-content: start; column-gap: 10px; margin: 0; color: var(--nu-on-dark); font-variant-numeric: tabular-nums; }
.vrl__nota-n b { color: var(--nu-white); font-size: clamp(72px, 8vw, 112px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: .9; }
.vrl__nota-n span { font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-medio); }
.vrl__nota-n small { grid-column: 1 / -1; margin-top: 10px; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-medio); }
.vrl__pilares { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px clamp(20px, 3vw, 40px); list-style: none; margin: 0; padding: 0; }
.vrl__pilar { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.vrl__p-n { color: var(--nu-on-dark); font-size: 15px; font-weight: var(--nu-w-medio); }
.vrl__p-v { color: var(--nu-white); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1; font-variant-numeric: tabular-nums; }
.vrl__p-v--sem { color: var(--nu-on-dark-2); }
.vrl__barra { display: block; height: 8px; border-radius: var(--nu-r-pill); background: var(--nu-line-2); overflow: hidden; }
.vrl__pilar .vrl__barra { background: var(--nu-dark-chip-line); }
.vrl__pilar .vrl__barra i { background: var(--nu-blue-on-dark); }
.vrl__barra i { display: block; height: 100%; border-radius: inherit; background: var(--nu-blue); transform-origin: left; animation: vrl-cresce var(--nu-dur-entrada) var(--nu-ease-saida) .1s both; }
@keyframes vrl-cresce { from { transform: scaleX(0); } }

/* cada pilar num cartão creme, com a nota num selo carvão */
.vrl__grupo { margin-top: clamp(14px, 1.6vw, 20px); box-sizing: border-box; padding: clamp(20px, 2.6vw, 30px) clamp(20px, 2.6vw, 30px) clamp(10px, 1.4vw, 16px); border-radius: var(--nu-r-card); background: var(--nu-page); box-shadow: var(--nu-shadow-quente); }
.vrl__h3 { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }

.vrl__inds { list-style: none; margin: 10px 0 0; padding: 0; }
.vrl__ind {
  display: grid; grid-template-columns: minmax(0, 1.6fr) 96px minmax(0, 1fr) 150px auto; grid-template-areas: 'n v b nota como' 'prova prova prova prova prova';
  align-items: center; gap: 0 16px; padding: 13px 0; border-top: 1px solid var(--nu-line); font-variant-numeric: tabular-nums;
}
.vrl__ind:first-child { border-top: 0; }
.vrl__ind-n { grid-area: n; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); }
.vrl__ind-v { grid-area: v; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); text-align: right; white-space: nowrap; }
.vrl__ind-v--cinza { color: var(--nu-gray); }
.vrl__ind-b { grid-area: b; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); white-space: nowrap; }
.vrl__ind-nota { grid-area: nota; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px; }
.vrl__ind-nn { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); white-space: nowrap; }
/* "Como calculei": o rótulo e o "+" (NuMais 28) num botão de 44px; sob o ponteiro vão ao cobalto, como no NuAcordeao */
.vrl__como {
  grid-area: como; display: inline-flex; align-items: center; gap: 8px; justify-self: end; min-height: 44px; padding: 0; border: 0; border-radius: var(--nu-r-tag);
  background: none; cursor: pointer; color: var(--nu-gray-3); font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); white-space: nowrap;
  transition: color var(--nu-dur-media) var(--nu-ease-cor);
}
.vrl__como:hover { color: var(--nu-blue-text); }
/* a conta (NuDobra): só o lugar na grade */
.vrl__dobra { grid-area: prova; }
.vrl__prova { margin-top: 8px; padding: 12px 16px; border-radius: var(--nu-r-chip); background: var(--nu-band); }
.vrl__prova p { margin: 0; max-width: 80ch; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); line-height: 1.55; }
.vrl__prova .vrl__prova-c { margin-top: 6px; color: var(--nu-gray-3); font-weight: var(--nu-w-texto); }

.vrl__bench { margin-top: clamp(14px, 1.6vw, 20px); box-sizing: border-box; padding: clamp(20px, 2.6vw, 30px); border-radius: var(--nu-r-card); background: var(--nu-page); box-shadow: var(--nu-shadow-quente); }
.vrl__bench-x { margin: 10px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); line-height: 1.5; font-variant-numeric: tabular-nums; }
.vrl__comp { display: flex; gap: 4px; height: 26px; margin-top: 14px; border-radius: 15px; overflow: hidden; }
.vrl__comp span { display: block; height: 100%; border-radius: 6px; }
.vrl__comp-l { display: flex; flex-wrap: wrap; gap: 6px 20px; list-style: none; margin: 10px 0 0; padding: 0; }
.vrl__comp-l li { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.vrl__comp-l i { width: 12px; height: 12px; border-radius: 50%; }
.vrl__comp-l b { color: var(--nu-ink); font-weight: var(--nu-w-forte); }
.vrl__notas { margin: 14px 0 0; padding: 0 0 0 18px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); line-height: 1.6; }

.vrl__esq { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; max-width: 1100px; }
.vrl__esq-sub { max-width: 640px; }
.vrl__esq .vrl__pilares { margin-top: 18px; }
.vrl__esq-linhas { display: flex; flex-direction: column; gap: 14px; margin-top: 26px; }

@media (max-width: 760px) {
  .vrl__nota { grid-template-columns: minmax(0, 1fr); }
  .vrl__pilares { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .vrl__ind { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'n v' 'b nota' 'como como' 'prova prova'; gap: 6px 12px; }
  .vrl__ind-nota { grid-template-columns: 72px auto; justify-self: end; }
  .vrl__como { justify-self: start; }
}
@media (prefers-reduced-motion: reduce) {
  .vrl__barra i, .vrl__conteudo { animation: none; }
}
</style>
