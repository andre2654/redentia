<script setup lang="ts">
// "Onde está o dinheiro" (24/11/2026, o canvas do meio-termo): uma barra por
// classe e uma linha por classe, no mesmo painel. Cada linha abre os ativos
// dela, com o peso, o valor, quanto rendeu e o dia. Substitui os cartões de
// classe da lente Ativos; a regra de classe é a mesma (grupoDaPosicao: o ETF de
// CDI mora na renda fixa). Embaixo, o fator que mais pesa (a lente Riscos).
import type { CarteiraVisao, PosicaoVisao } from '~/types/carteiraVisao'
import type { LinhaDoResultado, ResultadoDaCarteira } from '~/utils/resultadoDaCarteira'
import { pctComSinal } from '~/utils/diaDaCarteira'
import { GRUPOS_DA_CARTEIRA, brl0, fraseDosAtivos, grupoDaPosicao, nomeCurto, pctTxt } from '~/utils/carteiraVisao'
import DocSecao from '~/components/carteira/doc/DocSecao.vue'
import DocPainel from '~/components/carteira/doc/DocPainel.vue'
import DocAtencao from '~/components/carteira/doc/DocAtencao.vue'

const props = defineProps<{ visao: CarteiraVisao; resultado?: ResultadoDaCarteira | null }>()
defineEmits<{ (e: 'riscos'): void }>()
const { mask } = useHiddenValues()

const total = computed(() => props.visao.patrimonio)
const porTicker = computed(() => new Map((props.resultado?.linhas ?? []).map((l) => [l.ticker.toUpperCase(), l])))
const linhaDe = (p: PosicaoVisao): LinhaDoResultado | undefined => porTicker.value.get(p.ticker.toUpperCase())
const grupos = computed(() => {
  const m = new Map<string, PosicaoVisao[]>()
  for (const p of props.visao.posicoes) m.set(grupoDaPosicao(p), [...(m.get(grupoDaPosicao(p)) ?? []), p])
  return [...m.entries()]
    .map(([classe, ps]) => {
      const c = GRUPOS_DA_CARTEIRA[classe] ?? { nome: classe, naFrase: classe, cor: 'var(--nu-gray)' }
      const valor = ps.reduce((s, p) => s + p.valor, 0)
      return { classe, nome: c.nome, cor: c.cor, valor, pct: total.value > 0 ? (valor / total.value) * 100 : 0, itens: [...ps].sort((a, b) => b.valor - a.valor) }
    })
    .sort((a, b) => b.valor - a.valor)
})
const frase = computed(() => `No seu caso, são ${fraseDosAtivos(props.visao.posicoes, total.value).replace(/\.$/, '')}.`)
const nomeDe = (p: PosicaoVisao) => (p.classe === 'TREASURY' ? nomeCurto(p.nome) : p.ticker)
const subDe = (p: PosicaoVisao) => (p.classe !== 'TREASURY' && p.nome && p.nome !== p.ticker ? p.nome : null)
const hrefDe = (p: PosicaoVisao) => (p.classe === 'TREASURY' ? null : `/asset/${p.ticker}`)
const Link = resolveComponent('NuxtLink')
const tom = (v: number | null | undefined) => (v == null || Math.abs(v) < 0.005 ? '' : v > 0 ? 'vcl__sobe' : 'vcl__cai')

/** o fator que mais pesa na carteira, com o cenário do motor */
const fator = computed(() => {
  const f = [...props.visao.fatores].sort((a, b) => b.pct - a.pct)[0]
  if (!f || f.pct < 10) return null
  const nome = f.nome.charAt(0).toLowerCase() + f.nome.slice(1)
  return {
    titulo: `${pctTxt(f.pct)} da carteira responde a ${nome}`,
    texto: f.seCenario && f.efeito ? `${f.seCenario}, a simulação da ${MARCA.nome} aponta ${mask(f.efeito)}. Simulação não garante resultado.` : null,
  }
})
</script>

<template>
  <DocSecao titulo="Onde está o dinheiro" id-titulo="vcl-t">
    <template #frase>{{ frase }}</template>
    <DocPainel rotulo="Por classe">
      <template #colunas><span class="vcl__c vcl__c--pct">Peso</span><span class="vcl__c vcl__c--rs">Valor</span><span class="vcl__c vcl__c--seta" /></template>
      <div class="vcl__barra" role="img" :aria-label="grupos.map((g) => `${g.nome} ${pctTxt(g.pct)}`).join(', ')">
        <span v-for="g in grupos" :key="g.classe" :style="{ flexGrow: g.valor, background: g.cor }" :title="`${g.nome}: ${pctTxt(g.pct)}`" />
      </div>
      <details v-for="g in grupos" :key="g.classe" class="vcl__classe">
        <summary class="vcl__linha">
          <i class="vcl__cor" :style="{ background: g.cor }" aria-hidden="true" />
          <span class="vcl__nome">{{ g.nome }} <span class="vcl__n">{{ g.itens.length }} {{ g.itens.length === 1 ? 'ativo' : 'ativos' }}</span></span>
          <span class="vcl__pct">{{ pctTxt(g.pct) }}</span>
          <span class="vcl__rs">{{ mask(brl0(g.valor)) }}</span>
          <svg class="vcl__seta" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <ul class="vcl__ativos">
          <li v-for="p in g.itens" :key="p.ticker" class="vcl__ativo">
            <component :is="hrefDe(p) ? Link : 'span'" :to="hrefDe(p) ?? undefined" class="vcl__a-nome">
              <span class="vcl__a-t">{{ nomeDe(p) }}</span><span v-if="subDe(p)" class="vcl__a-s">{{ subDe(p) }}</span>
            </component>
            <span class="vcl__a-pct">{{ pctTxt(total > 0 ? (p.valor / total) * 100 : 0) }}</span>
            <span class="vcl__a-rs">{{ mask(brl0(p.valor)) }}</span>
            <span class="vcl__a-res">
              <span v-if="linhaDe(p)?.ganhoPct != null" :class="tom(linhaDe(p)?.ganhoPct)">{{ pctComSinal(linhaDe(p)!.ganhoPct!) }}</span>
              <span v-if="linhaDe(p)?.diaPct != null" class="vcl__a-dia" :class="tom(linhaDe(p)?.diaPct)">hoje {{ pctComSinal(linhaDe(p)!.diaPct!) }}</span>
            </span>
          </li>
        </ul>
      </details>
      <p class="vcl__nota">Toque numa classe para ver os ativos. O percentual colorido é a valorização sobre o preço médio de compra, sem contar proventos.</p>
    </DocPainel>
    <DocAtencao v-if="fator" :titulo="fator.titulo" :texto="fator.texto" @abrir="$emit('riscos')" />
  </DocSecao>
</template>

<style scoped>
.vcl__c { text-align: right; }
.vcl__c--pct { width: 70px; }
.vcl__c--rs { width: 124px; }
.vcl__c--seta { width: 32px; }
.vcl__barra { display: flex; gap: 3px; height: 10px; margin: 6px 0 8px; }
.vcl__barra span { flex: 0 0 0; min-width: 4px; border-radius: 2px; }
.vcl__barra span:first-child { border-radius: 5px 2px 2px 5px; }
.vcl__barra span:last-child { border-radius: 2px 5px 5px 2px; }
.vcl__classe { border-top: 1px solid var(--nu-line-2); }
.vcl__classe:first-of-type { border-top: 0; }
.vcl__linha { display: grid; grid-template-columns: 10px minmax(0, 1fr) 70px 124px 32px; align-items: center; gap: 0 12px; min-height: 54px; cursor: pointer; list-style: none; font-variant-numeric: tabular-nums; }
.vcl__linha::-webkit-details-marker { display: none; }
.vcl__linha:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; border-radius: 8px; }
.vcl__cor { width: 10px; height: 10px; border-radius: 3px; }
.vcl__nome { display: flex; align-items: baseline; gap: 10px; min-width: 0; font-size: 16.5px; }
.vcl__n { color: var(--nu-gray); font-size: 13px; white-space: nowrap; }
.vcl__pct { color: var(--nu-gray); font-size: 16px; text-align: right; }
.vcl__rs { font-size: 16.5px; font-weight: var(--nu-w-display); text-align: right; white-space: nowrap; }
.vcl__seta { justify-self: end; color: var(--nu-gray); transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.vcl__classe[open] .vcl__seta { transform: rotate(180deg); }
.vcl__ativos { margin: 0 0 12px; padding: 4px 0 0 22px; list-style: none; }
.vcl__ativo { display: grid; grid-template-columns: minmax(0, 1fr) 58px 104px 92px; align-items: center; gap: 0 12px; min-height: 46px; border-top: 1px solid var(--nu-line-2); font-variant-numeric: tabular-nums; }
.vcl__a-nome { display: flex; flex-direction: column; min-width: 0; color: var(--nu-ink); line-height: 1.25; text-decoration: none; }
a.vcl__a-nome:hover .vcl__a-t { text-decoration: underline; text-underline-offset: 3px; }
.vcl__a-t { overflow: hidden; font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.vcl__a-s { overflow: hidden; color: var(--nu-gray); font-size: 12.5px; text-overflow: ellipsis; white-space: nowrap; }
.vcl__a-pct { color: var(--nu-gray); font-size: 14.5px; text-align: right; }
.vcl__a-rs { font-size: 14.5px; text-align: right; white-space: nowrap; }
.vcl__a-res { display: flex; flex-direction: column; align-items: flex-end; color: var(--nu-gray); font-size: 14px; line-height: 1.25; white-space: nowrap; }
.vcl__a-dia { font-size: 12px; }
.vcl__sobe { color: var(--nu-green-text); }
.vcl__cai { color: var(--nu-red-text); }
.vcl__nota { margin: 10px 0 0; color: var(--nu-gray); font-size: 13px; line-height: 1.45; }
/* a seção estreita (celular, ou o painel do chat aberto): o peso do ativo sai e as colunas apertam, nada vaza */
@container secao (max-width: 620px) {
  .vcl__linha { grid-template-columns: 10px minmax(0, 1fr) 52px 100px 20px; gap: 0 8px; }
  .vcl__c--pct { width: 52px; }
  .vcl__c--rs { width: 108px; }
  .vcl__c--seta { width: 20px; }
  .vcl__n { display: none; }
  .vcl__ativos { padding-left: 0; }
  .vcl__ativo { grid-template-columns: minmax(0, 1fr) 96px 78px; gap: 0 8px; }
  .vcl__a-pct { display: none; }
}
@media (prefers-reduced-motion: reduce) { .vcl__seta { transition: none; } }
</style>
