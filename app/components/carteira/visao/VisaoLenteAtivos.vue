<script setup lang="ts">
// A lente Ativos (06/11/2026): as posições numa barra por classe e na lista,
// no idioma do "No mundo" (a frase grande, a lista que diz tudo).
//
// 07/11, revisão do dono com a carteira dele: a classe é a do que o ativo É.
// O AUPO11 (um ETF de CDI) mora na renda fixa, junto com o Tesouro, e não em
// "ETFs" com o ouro; a frase só fala de concentração na renda variável
// (fraseDosAtivos). A linha "os ativos somam o mesmo valor do topo" saiu: era
// conferência de teste. Fica só o aviso de quando a soma NÃO bate.
import type { CarteiraVisao, PosicaoVisao } from '~/types/carteiraVisao'
import FraseDestaque from './FraseDestaque.vue'
import { GRUPOS_DA_CARTEIRA, brl0, brl2, confereComOTopo, fraseDosAtivos, grupoDaPosicao, pctTxt } from '~/utils/carteiraVisao'

const props = defineProps<{ visao: CarteiraVisao }>()
const { mask } = useHiddenValues()

const total = computed(() => props.visao.patrimonio)
const grupos = computed(() => {
  const m = new Map<string, PosicaoVisao[]>()
  for (const p of props.visao.posicoes) m.set(grupoDaPosicao(p), [...(m.get(grupoDaPosicao(p)) ?? []), p])
  return [...m.entries()]
    .map(([classe, ps]) => {
      const c = GRUPOS_DA_CARTEIRA[classe] ?? { nome: classe, naFrase: classe, cor: 'var(--nu-gray)' }
      const valor = ps.reduce((s, p) => s + p.valor, 0)
      return { classe, nome: c.nome, cor: c.cor, valor, pct: (valor / total.value) * 100, itens: [...ps].sort((a, b) => b.valor - a.valor) }
    })
    .sort((a, b) => b.valor - a.valor)
})
const maior = computed(() => [...props.visao.posicoes].sort((a, b) => b.valor - a.valor)[0])
const frase = computed(() => fraseDosAtivos(props.visao.posicoes, total.value))
const confere = computed(() => confereComOTopo(props.visao))
// a soma de verdade das linhas (o backend garante que é o patrimônio; se um dia não for, a tela diz)
const soma = computed(() => props.visao.posicoes.reduce((s, p) => s + p.valor, 0))

const Link = resolveComponent('NuxtLink')
const aberto = ref<string | null>(null)
// cada classe mostra os 3 maiores; o resto sob pedido (a lista não vira um extrato)
const NA_LISTA = 3
const expandidos = ref<Set<string>>(new Set())
function expandir(c: string) { expandidos.value = new Set([...expandidos.value, c]) }
const visiveis = (g: { classe: string; itens: PosicaoVisao[] }) => (expandidos.value.has(g.classe) ? g.itens : g.itens.slice(0, NA_LISTA))
const NOME_PLURAL: Record<string, [string, string]> = { STOCK: ['ação', 'ações'], REIT: ['FII', 'FIIs'], ETF: ['ETF', 'ETFs'], RF: ['ativo', 'ativos'] }
function maisDe(g: { classe: string; itens: PosicaoVisao[] }) {
  const n = g.itens.length - NA_LISTA
  const [um, varios] = NOME_PLURAL[g.classe] ?? ['ativo', 'ativos']
  return `Mais ${n} ${n === 1 ? um : varios}`
}
const hrefDe = (p: PosicaoVisao) => (p.classe === 'TREASURY' ? null : `/asset/${p.ticker}`)
</script>

<template>
  <div class="vla">
    <h3 class="vla__frase"><FraseDestaque :texto="frase" /></h3>

    <div class="vla__barra" role="img" :aria-label="grupos.map((g) => `${g.nome} ${pctTxt(g.pct)}`).join(', ')">
      <span
        v-for="g in grupos" :key="g.classe" class="vla__seg" :class="{ 'vla__seg--apagado': aberto && aberto !== g.classe }"
        :style="{ flexGrow: g.valor, background: g.cor }" :title="`${g.nome}: ${pctTxt(g.pct)}`"
      />
    </div>

    <div class="vla__grupos">
      <div v-for="g in grupos" :key="g.classe" class="vla__grupo" @pointerenter="aberto = g.classe" @pointerleave="aberto = null">
        <div class="vla__grupo-cab">
          <span class="vla__ponto" :style="{ background: g.cor }" aria-hidden="true" />
          <span class="vla__grupo-n">{{ g.nome }}</span>
          <span class="vla__grupo-pct">{{ pctTxt(g.pct) }}</span>
          <span class="vla__grupo-v">{{ mask(brl0(g.valor)) }}</span>
        </div>
        <ul class="vla__lista">
          <li v-for="p in visiveis(g)" :key="p.ticker" class="vla__linha">
            <component :is="hrefDe(p) ? Link : 'span'" :to="hrefDe(p) ?? undefined" class="vla__nome">
              <span class="vla__nome-t">{{ p.classe === 'TREASURY' ? p.nome : p.ticker }}</span>
              <span v-if="p.classe !== 'TREASURY' && p.nome !== p.ticker" class="vla__nome-s">{{ p.nome }}</span>
            </component>
            <span class="vla__peso" aria-hidden="true"><i :style="{ width: `${Math.max(2, (p.valor / maior!.valor) * 100)}%`, background: g.cor }" /></span>
            <span class="vla__pct">{{ pctTxt((p.valor / total) * 100) }}</span>
            <span class="vla__v">{{ mask(brl0(p.valor)) }}</span>
          </li>
        </ul>
        <button v-if="g.itens.length > NA_LISTA && !expandidos.has(g.classe)" type="button" class="vla__mais" @click="expandir(g.classe)">
          <span class="vla__mais-t">{{ maisDe(g) }}</span><span class="vla__mais-v">{{ mask(brl0(g.itens.slice(NA_LISTA).reduce((s, p) => s + p.valor, 0))) }}</span>
        </button>
      </div>
    </div>

    <!-- só quando a soma das linhas não bate com o topo (o backend garante que bate) -->
    <p v-if="!confere" class="vla__confere vla__confere--nao">
      {{ visao.posicoes.length }} ativos somam {{ mask(brl2(soma)) }}, e o topo mostra {{ mask(brl2(total)) }}.
    </p>
  </div>
</template>

<style scoped>
.vla__frase { margin: 0; max-width: 900px; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.04; font-variant-numeric: tabular-nums; text-wrap: balance; }
/* a barra empilhada da marca: 28px, vão de 4px, pontas redondas só nos extremos; cresce da esquerda na entrada */
.vla__barra { display: flex; gap: 4px; height: 28px; margin-top: clamp(26px, 3.4vw, 40px); transform-origin: left; animation: vla-cresce .6s cubic-bezier(.2, .8, .2, 1) both; }
@keyframes vla-cresce { from { transform: scaleX(0); opacity: 0; } }
.vla__seg { flex-basis: 0; min-width: 8px; border-radius: 6px; transition: opacity .25s; }
.vla__seg:first-child { border-top-left-radius: 15px; border-bottom-left-radius: 15px; }
.vla__seg:last-child { border-top-right-radius: 15px; border-bottom-right-radius: 15px; }
.vla__seg--apagado { opacity: .3; }
/* cada classe num cartão creme, como a marca veste o dado */
.vla__grupos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: clamp(14px, 1.6vw, 20px); margin-top: clamp(20px, 2.6vw, 28px); }
.vla__grupo { padding: clamp(18px, 2.2vw, 26px) clamp(18px, 2.4vw, 28px) clamp(12px, 1.6vw, 18px); border-radius: var(--nu-r-card); background: var(--nu-page); box-shadow: var(--nu-shadow-quente); animation: nu-fade .5s ease both; }
.vla__grupo:nth-child(2) { animation-delay: 60ms; }
.vla__grupo:nth-child(3) { animation-delay: 120ms; }
.vla__grupo:nth-child(4) { animation-delay: 180ms; }
.vla__grupo-cab { display: flex; align-items: baseline; gap: 10px; padding: 0 0 12px; border-bottom: 1.5px solid var(--nu-line); }
.vla__ponto { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.vla__grupo-n { flex: 1; color: var(--nu-ink); font-size: clamp(20px, 1.8vw, 24px); font-weight: 800; letter-spacing: -0.02em; }
.vla__grupo-pct { color: var(--nu-ink); font-size: clamp(24px, 2.2vw, 30px); font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.vla__grupo-v { min-width: 92px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
.vla__lista { list-style: none; margin: 0; padding: 0; }
.vla__linha { display: grid; grid-template-columns: minmax(0, 1fr) 64px 56px 92px; align-items: center; gap: 12px; padding: 9px 8px; margin: 0 -8px; border-radius: var(--nu-r-chip); transition: background .18s; }
.vla__linha:hover { background: var(--nu-cream-2); }
.vla__nome { display: flex; flex-direction: column; min-width: 0; color: inherit; text-decoration: none; }
.vla__nome-t { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
a.vla__nome:hover .vla__nome-t { color: var(--nu-blue-text); }
.vla__nome-s { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vla__peso { height: 6px; border-radius: 3px; background: var(--nu-line-2); overflow: hidden; }
.vla__peso i { display: block; height: 100%; border-radius: 3px; }
.vla__pct { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; text-align: right; }
.vla__v { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
.vla__mais { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 44px; margin-top: 4px; padding: 6px 0 0; border: 0; border-top: 1.5px solid var(--nu-line-2); background: none; color: var(--nu-blue-text); font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; text-align: left; }
.vla__mais-t { text-decoration: underline; text-underline-offset: 3px; }
.vla__mais:hover { color: var(--nu-blue); }
.vla__mais-v { color: var(--nu-gray); font-weight: 600; font-variant-numeric: tabular-nums; }
.vla__confere { display: flex; align-items: center; gap: 8px; margin: clamp(22px, 3vw, 32px) 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.vla__check { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: var(--nu-green-bg, var(--nu-cream)); color: var(--nu-green-text, var(--nu-green)); }
.vla__confere--nao .vla__check { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
@media (max-width: 900px) { .vla__grupos { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 480px) {
  .vla__linha { grid-template-columns: minmax(0, 1fr) 48px 84px; }
  .vla__peso { display: none; }
  .vla__barra { height: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .vla__barra, .vla__grupo { animation: none; }
}
</style>
