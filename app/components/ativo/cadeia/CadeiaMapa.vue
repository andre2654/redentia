<script setup lang="ts">
// Cadeia, direção 2: "O mapa calmo" (?cadeia=2, 03/11/2026). O mapa de hoje
// sem o emaranhado: fornecedoras à esquerda, clientes à direita, a empresa no
// centro só em texto (sem o bloco navy), e um fio fino, todos da mesma
// espessura: a espessura por valor dava o traço mais grosso ao que NÃO
// sabemos. Quem está nas duas pontas fica no centro, embaixo da empresa, uma
// vez só. O valor vai escrito ao lado do nome, nunca numa pílula; sem valor,
// só o que circula. Passar o mouse acende o caminho até o centro (os outros
// recuam) e a legenda embaixo diz a relação inteira; sem mouse, ela diz o que
// a conta explica. No celular o mapa não cabe: vira a lista por lado.
// Geometria por conta (linhas de altura fixa): o SSR já entrega o desenho.
import AcaoCadeiaDetalhe from '~/components/acao/AcaoCadeiaDetalhe.vue'
import type { EmpresaDaCadeia } from '~/utils/cadeiaLeitura'

import type { AcaoCadeiaVM } from '~/types/acao'

// os props por extenso: o compilador do Vue não resolve tipo importado sem o TypeScript instalado
const props = defineProps<{ cadeia: AcaoCadeiaVM; nome: string; ticker: string; tom?: 'branco' | 'creme' }>()
const { empresas, cobertura, resto, aberto, ativo, titulo, contexto, fontes } = useCadeiaLeitura(() => props)
const fornecedoras = computed(() => empresas.value.filter((e) => e.papel === 'fornecedora'))
const clientes = computed(() => empresas.value.filter((e) => e.papel === 'cliente'))
const ambas = computed(() => empresas.value.filter((e) => e.papel === 'ambas'))

const ROW = 60
const GAP = 8
const FIO = 140 // largura do fio, em px (o SVG não tem viewBox: as contas são em px)
const alto = (n: number) => Math.max(1, n) * ROW + Math.max(0, n - 1) * GAP
// as das duas pontas ficam embaixo do centro, no fluxo (a coluna cresce para baixo)
const total = computed(() => Math.max(alto(fornecedoras.value.length), alto(clientes.value.length), 120))
const yc = computed(() => total.value / 2)
function caminhos(lista: EmpresaDaCadeia[], lado: 'esq' | 'dir') {
  const topo = (total.value - alto(lista.length)) / 2
  return lista.map((e, i) => {
    const y = topo + i * (ROW + GAP) + ROW / 2
    const d = lado === 'esq'
      ? `M0 ${y} C${FIO / 2} ${y} ${FIO / 2} ${yc.value} ${FIO} ${yc.value}`
      : `M0 ${yc.value} C${FIO / 2} ${yc.value} ${FIO / 2} ${y} ${FIO} ${y}`
    return { e, d }
  })
}
const fiosEsq = computed(() => caminhos(fornecedoras.value, 'esq'))
const fiosDir = computed(() => caminhos(clientes.value, 'dir'))
const topoEsq = computed(() => (total.value - alto(fornecedoras.value.length)) / 2)
const topoDir = computed(() => (total.value - alto(clientes.value.length)) / 2)

const legenda = computed(() => {
  const e = empresas.value.find((x) => x.ticker === ativo.value)
  if (!e) return cobertura.value[0] ?? fontes.value
  return [e.compra && relacaoDaLigacao(e.compra), e.venda && relacaoDaLigacao(e.venda)].filter(Boolean).join('  ·  ')
})
const linha = (e: EmpresaDaCadeia) => [e.compra && valorDaLigacao(e.compra), e.venda && valorDaLigacao(e.venda)].filter(Boolean).join(' · ')
const oQue = (e: EmpresaDaCadeia) => [e.compra?.oQue, e.venda?.oQue].filter(Boolean).join(' / ')
</script>

<template>
  <section v-contexto-chat="contexto" class="cmp" :class="`cmp--${tom ?? 'creme'}`">
    <header class="cmp__cab">
      <p class="cmp__tipo">Cadeia</p>
      <h2 class="cmp__h2">{{ titulo }}</h2>
    </header>

    <!-- desktop: o mapa -->
    <div class="cmp__mapa" :class="{ 'cmp__mapa--lendo': ativo }" :style="{ '--row': `${ROW}px`, '--gap': `${GAP}px`, '--fio': `${FIO}px` }" @mouseleave="ativo = null">
      <div class="cmp__col cmp__col--esq">
        <p class="cmp__lado">Compra de</p>
        <ul class="cmp__nos" :style="{ height: `${total}px`, paddingTop: `${topoEsq}px` }">
          <li v-if="!fornecedoras.length && ambas.length" class="cmp__no cmp__no--nota">As fornecedoras listadas também compram da {{ nome }}: estão no centro.</li>
          <li v-for="e in fornecedoras" :key="e.ticker" :class="{ 'cmp__no--on': ativo === e.ticker }" class="cmp__no" @mouseenter="ativo = e.ticker">
            <NuxtLink :to="`/asset/${e.ticker}`" class="cmp__quem cmp__quem--esq" @focus="ativo = e.ticker" @blur="ativo = null">
              <span class="cmp__ticker">{{ e.ticker }}</span>
              <span class="cmp__oque">{{ oQue(e) || e.nome }}</span>
            </NuxtLink>
            <button v-if="linha(e)" type="button" class="cmp__valor" @click="aberto = e.compra!.detalhe">{{ linha(e) }}</button>
          </li>
        </ul>
      </div>
      <svg class="cmp__fio" :style="{ height: `${total}px` }" aria-hidden="true">
        <path v-for="f in fiosEsq" :key="f.e.ticker" :d="f.d" :class="{ 'cmp__fio--on': ativo === f.e.ticker }" />
      </svg>
      <div class="cmp__centro" :style="{ minHeight: `${total}px`, paddingTop: `${yc - 36}px` }">
        <div class="cmp__eu">
          <span class="cmp__eu-t">{{ ticker }}</span>
          <span class="cmp__eu-n">{{ nome }}</span>
        </div>
        <ul v-if="ambas.length" class="cmp__ambas">
          <li v-for="e in ambas" :key="e.ticker" class="cmp__no cmp__no--ambas" :class="{ 'cmp__no--on': ativo === e.ticker }" @mouseenter="ativo = e.ticker">
            <span class="cmp__vai" aria-hidden="true" />
            <NuxtLink :to="`/asset/${e.ticker}`" class="cmp__quem" @focus="ativo = e.ticker" @blur="ativo = null">
              <span class="cmp__ticker">{{ e.ticker }} <span class="cmp__marca">fornecedora e cliente</span></span>
              <span class="cmp__oque cmp__oque--2">compra {{ e.compra?.oQue ?? '' }} · vende {{ e.venda?.oQue ?? '' }}</span>
            </NuxtLink>
            <button v-if="linha(e)" type="button" class="cmp__valor" @click="aberto = (e.venda?.valor ? e.venda : e.compra)!.detalhe">{{ linha(e) }}</button>
          </li>
        </ul>
      </div>
      <svg class="cmp__fio" :style="{ height: `${total}px` }" aria-hidden="true">
        <path v-for="f in fiosDir" :key="f.e.ticker" :d="f.d" :class="{ 'cmp__fio--on': ativo === f.e.ticker }" />
      </svg>
      <div class="cmp__col cmp__col--dir">
        <p class="cmp__lado">Vende para</p>
        <ul class="cmp__nos" :style="{ height: `${total}px`, paddingTop: `${topoDir}px` }">
          <li v-if="!clientes.length && ambas.length" class="cmp__no cmp__no--nota">Os clientes listados também vendem para a {{ nome }}: estão no centro.</li>
          <li v-for="e in clientes" :key="e.ticker" :class="{ 'cmp__no--on': ativo === e.ticker }" class="cmp__no" @mouseenter="ativo = e.ticker">
            <NuxtLink :to="`/asset/${e.ticker}`" class="cmp__quem" @focus="ativo = e.ticker" @blur="ativo = null">
              <span class="cmp__ticker">{{ e.ticker }}</span>
              <span class="cmp__oque">{{ oQue(e) || e.nome }}</span>
            </NuxtLink>
            <button v-if="linha(e)" type="button" class="cmp__valor" @click="aberto = e.venda!.detalhe">{{ linha(e) }}</button>
          </li>
        </ul>
      </div>
    </div>
    <p class="cmp__legenda" aria-live="polite">{{ legenda }}</p>

    <!-- celular: a lista por lado -->
    <div class="cmp__lista">
      <template v-for="g in [{ id: 'compra', r: 'Compra de', l: fornecedoras }, { id: 'ambas', r: 'Compra e vende', l: ambas }, { id: 'venda', r: 'Vende para', l: clientes }]" :key="g.id">
        <div v-if="g.l.length" class="cmp__grupo">
          <p class="cmp__lado">{{ g.r }}</p>
          <ul>
            <li v-for="e in g.l" :key="e.ticker" class="cmp__li">
              <NuxtLink :to="`/asset/${e.ticker}`" class="cmp__li-q">
                <span class="cmp__ticker">{{ e.ticker }}</span>
                <span class="cmp__oque">{{ e.nome }}<template v-if="oQue(e)"> · {{ oQue(e) }}</template></span>
              </NuxtLink>
              <button v-if="linha(e)" type="button" class="cmp__valor" @click="aberto = (e.venda?.valor ? e.venda : e.compra)!.detalhe">{{ linha(e) }}</button>
            </li>
          </ul>
        </div>
      </template>
    </div>

    <div v-if="cobertura.length" class="cmp__conta">
      <p v-for="(f, i) in cobertura" :key="i">{{ f }}</p>
      <p class="cmp__conta-l">
        <button v-if="resto.clientes && cadeia.cobertura?.receita" type="button" class="cmp__link" @click="aberto = resto.clientes">Ver a conta das vendas</button>
        <button v-if="resto.custo && cadeia.cobertura?.custo" type="button" class="cmp__link" @click="aberto = resto.custo">Ver a conta do custo</button>
      </p>
    </div>
    <p v-if="fontes" class="cmp__fontes">{{ fontes }}</p>
    <AcaoCadeiaDetalhe :detalhe="aberto" @close="aberto = null" />
  </section>
</template>

<style scoped>
.cmp { --mola: cubic-bezier(.34, 1.56, .64, 1); padding: clamp(56px, 7vw, 96px) clamp(22px, 5.5vw, 80px); }
.cmp--creme { background: var(--nu-cream); }
.cmp--branco { background: var(--nu-white); }
.cmp__cab { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 720px; margin: 0 auto; }
.cmp__tipo { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.cmp__h2 { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; line-height: 1.05; text-wrap: balance; }

.cmp__mapa { display: grid; grid-template-columns: minmax(0, 1fr) var(--fio) minmax(200px, 260px) var(--fio) minmax(0, 1fr); align-items: start; max-width: 1180px; margin: clamp(32px, 4vw, 52px) auto 0; }
.cmp__lado { margin: 0 0 10px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.cmp__col--esq .cmp__lado { text-align: right; }
.cmp__nos { list-style: none; margin: 0; padding: 0; box-sizing: border-box; }
.cmp__no { display: flex; flex-direction: column; justify-content: center; height: var(--row); margin-bottom: var(--gap); transition: opacity .2s ease; }
.cmp__col--esq .cmp__no { align-items: flex-end; text-align: right; }
.cmp__no--nota { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; height: auto; }
.cmp__mapa--lendo .cmp__no:not(.cmp__no--on) { opacity: .45; }
.cmp__quem { display: flex; flex-direction: column; min-width: 0; max-width: 100%; color: inherit; border-radius: 8px; transition: transform .45s var(--mola); }
.cmp__quem--esq { align-items: flex-end; }
.cmp__no--on .cmp__quem { transform: translateX(3px); }
.cmp__col--esq .cmp__no--on .cmp__quem { transform: translateX(-3px); }
.cmp__ticker { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; transition: color .2s ease; }
.cmp__no--on .cmp__ticker { color: var(--nu-blue-text); }
.cmp__oque { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.cmp__valor {
  padding: 0; border: 0; background: none; font: inherit; cursor: pointer; text-align: inherit;
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
  text-decoration: underline; text-decoration-color: var(--nu-ink-14); text-underline-offset: 3px; transition: color .2s ease;
}
.cmp__valor:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.cmp__fio { display: block; width: var(--fio); margin-top: 28px; overflow: visible; }
.cmp__fio path { fill: none; stroke: var(--nu-sand); stroke-width: 1.25; opacity: .8; transition: stroke .2s ease, stroke-width .2s ease, opacity .2s ease; }
.cmp__mapa--lendo .cmp__fio path { opacity: .25; }
.cmp__mapa--lendo .cmp__fio path.cmp__fio--on { stroke: var(--nu-blue); stroke-width: 2; opacity: 1; }

.cmp__centro { position: relative; display: flex; flex-direction: column; align-items: center; margin-top: 28px; box-sizing: border-box; }
.cmp__eu { align-self: stretch; display: flex; flex-direction: column; align-items: center; padding: 14px 22px; border-radius: var(--nu-r-panel); background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.cmp--branco .cmp__eu { background: var(--nu-cream); }
.cmp__eu-t { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }
.cmp__eu-n { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.cmp__ambas { list-style: none; margin: 4px 0 0; padding: 0; width: 100%; }
.cmp__oque--2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.cmp__no--ambas { position: relative; align-items: center; text-align: center; height: auto; padding-top: 22px; margin: 0; }
.cmp__no--ambas .cmp__quem { align-items: center; }
.cmp__no--ambas .cmp__oque { white-space: normal; }
.cmp__no--on.cmp__no--ambas .cmp__quem { transform: translateY(2px); }
.cmp__vai { position: absolute; top: 0; left: 50%; width: 1.25px; height: 18px; background: var(--nu-sand); transition: background .2s ease; }
.cmp__no--on .cmp__vai { background: var(--nu-blue); width: 2px; }
.cmp__marca { margin-left: 4px; color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; }
.cmp__legenda { max-width: 760px; min-height: 3.2em; margin: 28px auto 0; text-align: center; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; font-variant-numeric: tabular-nums; }

.cmp__lista { display: none; }
.cmp__conta { max-width: 760px; margin: 20px auto 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; font-variant-numeric: tabular-nums; }
.cmp__conta p { margin: 0 0 6px; }
.cmp__conta-l { display: flex; gap: 18px; }
.cmp__link { padding: 0; border: 0; background: none; font: inherit; color: var(--nu-blue-text); font-weight: 700; cursor: pointer; }
.cmp__link:hover { color: var(--nu-blue-hover); }
.cmp__fontes { max-width: 760px; margin: 14px auto 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }

@media (max-width: 900px) {
  .cmp__mapa, .cmp__legenda { display: none; }
  .cmp__lista { display: grid; gap: 22px; max-width: 560px; margin: 28px auto 0; }
  .cmp__grupo ul { list-style: none; margin: 0; padding: 0; }
  .cmp__li { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid var(--nu-cream-line); }
  .cmp__li-q { display: flex; flex-direction: column; color: inherit; }
  .cmp__li .cmp__oque { white-space: normal; }
  .cmp__conta { margin-top: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .cmp__no, .cmp__quem, .cmp__fio path, .cmp__vai { transition: none; }
  .cmp__no--on .cmp__quem { transform: none !important; }
}
</style>
