<script setup lang="ts">
// "Quem mexeu hoje" (24/11/2026, o canvas do meio-termo): os três ativos que
// mais subiram e os três que mais caíram no dia, em barras que saem de um eixo
// no meio, e a frase que diz de onde veio o dia em reais. Embaixo, o par de
// ações que anda junto (a correlação da lente Riscos), quando há.
import type { CarteiraVisao } from '~/types/carteiraVisao'
import type { LinhaDoResultado, ResultadoDaCarteira } from '~/utils/resultadoDaCarteira'
import { reaisComSinal } from '~/utils/resultadoDaCarteira'
import { pctComSinal } from '~/utils/diaDaCarteira'
import { pctTxt } from '~/utils/carteiraVisao'
import DocSecao from '~/components/carteira/doc/DocSecao.vue'
import DocPainel from '~/components/carteira/doc/DocPainel.vue'
import DocAtencao from '~/components/carteira/doc/DocAtencao.vue'

const props = defineProps<{ resultado: ResultadoDaCarteira; visao: CarteiraVisao }>()
defineEmits<{ (e: 'riscos'): void }>()
const { mask } = useHiddenValues()
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const reais = (v: number) => mask(`R$ ${nf0.format(Math.abs(v))}`)

const linhas = computed(() => [...props.resultado.sobem, ...props.resultado.caem])
const maior = computed(() => Math.max(...linhas.value.map((l) => Math.abs(l.diaPct ?? 0)), 0.01))
const larg = (l: LinhaDoResultado) => `${Math.max(4, (Math.abs(l.diaPct ?? 0) / maior.value) * 100)}%`
const nomeDe = (l: LinhaDoResultado) => (l.ticker.length > 8 ? l.nome : l.ticker)
const hrefDe = (l: LinhaDoResultado) => (l.classe === 'TREASURY' || l.classe === 'FIXED_INCOME' ? null : `/asset/${l.ticker}`)
const Link = resolveComponent('NuxtLink')

const lista = (ls: LinhaDoResultado[]) => (ls.length === 1 ? nomeDe(ls[0]!) : `${nomeDe(ls[0]!)} e ${nomeDe(ls[1]!)}`)
const frase = computed(() => {
  const r = props.resultado
  const dia = r.linhas.reduce((s, l) => s + (l.diaValor ?? 0), 0)
  const cai = r.caem.slice(0, 2), sobe = r.sobem.slice(0, 2)
  const soma = (ls: LinhaDoResultado[]) => ls.reduce((s, l) => s + (l.diaValor ?? 0), 0)
  const partes: string[] = []
  if (cai.length) partes.push(`${lista(cai)} ${cai.length === 1 ? 'tirou' : 'tiraram'} ${reais(soma(cai))}`)
  if (sobe.length) partes.push(`${lista(sobe)} ${cai.length ? (sobe.length === 1 ? 'devolveu' : 'devolveram') : (sobe.length === 1 ? 'trouxe' : 'trouxeram')} ${reais(soma(sobe))}`)
  return `No seu caso, o dia soma ${mask(reaisComSinal(dia))}. ${partes.join(', e ')}.`
})

/** o par que anda junto, com quanto os dois pesam na carteira */
const par = computed(() => {
  // o primeiro da lista: o backend já manda os pares na ordem que importa (o mais colado costuma ser dois títulos do Tesouro, que não é notícia)
  const j = props.visao.juntos[0]
  if (!j) return null
  const valor = props.visao.posicoes.filter((p) => [j.a, j.b].includes(p.ticker) || [j.a, j.b].includes(p.nome)).reduce((s, p) => s + p.valor, 0)
  const peso = props.visao.patrimonio > 0 ? (valor / props.visao.patrimonio) * 100 : 0
  return {
    titulo: `${j.a} e ${j.b} andam juntas`,
    // o peso só entra quando as duas estão na carteira com algum tamanho
    texto: `Correlação de ${j.correlacao.toFixed(2).replace('.', ',')}: quando uma cai, a outra costuma cair.${peso >= 1 ? ` Juntas, são ${pctTxt(peso)} da carteira.` : ''}`,
  }
})
</script>

<template>
  <DocSecao titulo="Quem mexeu hoje" id-titulo="vmx-t">
    <template #frase>{{ frase }}</template>
    <DocPainel :rotulo="linhas.length > 3 ? 'Os que mais subiram e os que mais caíram' : 'Os que mais mexeram'">
      <template #colunas><span class="vmx__c vmx__c--pct">Hoje</span><span class="vmx__c vmx__c--rs">Em reais</span></template>
      <ul class="vmx__lista">
        <li v-for="l in linhas" :key="l.ticker" class="vmx__linha">
          <component :is="hrefDe(l) ? Link : 'span'" :to="hrefDe(l) ?? undefined" class="vmx__nome">
            <span class="vmx__n">{{ l.nome && l.nome !== l.ticker ? l.nome : nomeDe(l) }}</span>
            <span v-if="l.nome && l.nome !== l.ticker && l.ticker.length <= 8" class="vmx__tk">{{ l.ticker }}</span>
          </component>
          <span class="vmx__eixo" aria-hidden="true">
            <span class="vmx__lado vmx__lado--e"><i v-if="(l.diaPct ?? 0) < 0" class="vmx__b vmx__b--cai" :style="{ width: larg(l) }" /></span>
            <span class="vmx__lado vmx__lado--d"><i v-if="(l.diaPct ?? 0) >= 0" class="vmx__b vmx__b--sobe" :style="{ width: larg(l) }" /></span>
          </span>
          <span class="vmx__pct" :class="(l.diaPct ?? 0) < 0 ? 'vmx__pct--cai' : 'vmx__pct--sobe'">{{ l.diaPct != null ? pctComSinal(l.diaPct) : '' }}</span>
          <span class="vmx__rs">{{ l.diaValor != null ? mask(reaisComSinal(l.diaValor)) : '' }}</span>
        </li>
      </ul>
    </DocPainel>
    <DocAtencao v-if="par" :titulo="par.titulo" :texto="par.texto" @abrir="$emit('riscos')" />
  </DocSecao>
</template>

<style scoped>
.vmx__c { text-align: right; }
.vmx__c--pct { width: 84px; }
.vmx__c--rs { width: 96px; }
.vmx__lista { margin: 0; padding: 0; list-style: none; }
.vmx__linha { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 2fr) 84px 96px; align-items: center; min-height: 50px; font-variant-numeric: tabular-nums; }
.vmx__nome { display: flex; align-items: baseline; gap: 10px; min-width: 0; color: var(--nu-ink); text-decoration: none; }
a.vmx__nome:hover .vmx__n { text-decoration: underline; text-underline-offset: 3px; }
.vmx__n { overflow: hidden; font-size: 16px; text-overflow: ellipsis; white-space: nowrap; }
.vmx__tk { flex: none; color: var(--nu-gray); font-size: 12.5px; }
.vmx__eixo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.vmx__lado { display: flex; align-items: center; height: 22px; }
.vmx__lado--e { justify-content: flex-end; padding-right: 3px; border-right: 1px solid var(--nu-borda-campo, var(--nu-line)); }
.vmx__lado--d { padding-left: 3px; }
.vmx__b { display: block; height: 6px; border-radius: 3px; }
.vmx__b--sobe { background: var(--nu-green); }
.vmx__b--cai { background: var(--nu-red); }
.vmx__pct { font-size: 15.5px; text-align: right; }
.vmx__pct--sobe { color: var(--nu-green-text); }
.vmx__pct--cai { color: var(--nu-red-text); }
.vmx__rs { color: var(--nu-gray); font-size: 14px; text-align: right; }
/* a seção estreita (celular, ou o painel do chat aberto): o eixo sai, ficam o nome e os dois números */
@container secao (max-width: 620px) {
  .vmx__linha { grid-template-columns: minmax(0, 1fr) 76px 84px; }
  .vmx__eixo { display: none; }
  .vmx__c--pct { width: 76px; }
  .vmx__c--rs { width: 84px; }
  .vmx__tk { display: none; }
}
</style>
