<script setup lang="ts">
// O trilho da carteira (24/11/2026): o que a pessoa quer ver sem procurar.
// Quanto tem, quanto ganhou, o dia, os proventos e quem mais mexeu, sempre no
// mesmo lugar, no Início e na /carteira. A régua é a calma do canvas: rótulo
// cinza em peso de texto, número em peso médio, fio fino, uma família de cor.
// Os R$ seguem o olho da tela (useValoresVisiveis); o % nunca se esconde.
import type { CarteiraAllocationVM } from '~/types/carteira'
import type { NuDir } from '~/types/market'
import type { LinhaDoResultado, ResultadoDaCarteira } from '~/utils/resultadoDaCarteira'
import { reaisComSinal } from '~/utils/resultadoDaCarteira'
import { pctComSinal } from '~/utils/diaDaCarteira'

const props = defineProps<{
  /** 'R$ 644.967,39' */
  patrimonio: string
  alocacao?: CarteiraAllocationVM[] | null
  resultado?: ResultadoDaCarteira | null
  /** '+R$ 412,30' e '+0,62%' */
  diaValor?: string | null
  diaPct?: string | null
  diaDir?: NuDir
  /** proventos recebidos em 12 meses, em R$ */
  proventos?: number | null
  /** a linha do pé: 'Nubank, atualizado hoje às 9h12' */
  fonte?: string | null
}>()

const { visiveis, alternar } = useValoresVisiveis()
const OCULTO = 'R$ ••••'
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const reais = (v: string | null | undefined) => (v == null ? null : visiveis.value ? v : OCULTO)
/** o R$ do dia sem os centavos: no trilho todo número fora o patrimônio é redondo ('+R$ 1.978,92' vira '+R$ 1.979') */
const semCentavos = (v: string | null | undefined) => {
  if (v == null) return null
  const m = v.match(/^([+−-]?)R\$\s?([\d.]+),(\d{2})$/)
  if (!m) return v
  const n = Math.round(Number(m[2]!.replace(/\./g, '') + '.' + m[3]))
  return `${m[1]}R$ ${nf0.format(n)}`
}

const ganho = computed(() => {
  const r = props.resultado
  if (!r || r.ganho == null || r.ganhoPct == null) return null
  return {
    valor: visiveis.value ? reaisComSinal(r.ganho) : OCULTO,
    pct: pctComSinal(r.ganhoPct),
    // com preço médio só em parte dos ativos, o rótulo diz de quantos
    rotulo: r.comCusto < r.linhas.length ? `Quanto ganhei, em ${r.comCusto} de ${r.linhas.length} ativos` : 'Quanto ganhei',
  }
})
const provento = computed(() => (props.proventos != null && props.proventos > 0 ? (visiveis.value ? `R$ ${nf0.format(props.proventos)}` : OCULTO) : null))
const fatias = computed(() => (props.alocacao ?? []).filter((a) => a.pctNum > 0))
const rotuloAlocacao = computed(() => fatias.value.map((a) => `${a.name} ${a.pct}`).join(', '))
const mexeu = computed(() => {
  const r = props.resultado
  return r && (r.sobem.length || r.caem.length) ? { sobem: r.sobem, caem: r.caem } : null
})
const nomeDe = (l: LinhaDoResultado) => (l.ticker.length > 8 ? l.nome : l.ticker)
const hrefDe = (l: LinhaDoResultado) => (l.classe === 'TREASURY' || l.classe === 'FIXED_INCOME' ? null : `/asset/${l.ticker}`)
const Link = resolveComponent('NuxtLink')
</script>

<template>
  <div class="ctr" data-clarity-mask="true">
    <div class="ctr__grupo">
      <div class="ctr__topo">
        <NuxtLink to="/carteira" class="ctr__rotulo">Patrimônio <span aria-hidden="true">›</span></NuxtLink>
        <!-- o olho da tela: vale para o trilho, as frases e o gráfico -->
        <button type="button" class="ctr__olho" :aria-pressed="visiveis" :aria-label="visiveis ? 'Esconder os valores' : 'Mostrar os valores'" :title="visiveis ? 'Esconder os valores' : 'Mostrar os valores'" @click="alternar">
          <svg v-if="visiveis" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.500 9.500 6.500-3.500 6.500-9.500 6.500S2.500 12 2.500 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>
          <svg v-else width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4l16 16" /><path d="M9.900 5.800A9.700 9.700 0 0 1 12 5.500c6 0 9.500 6.500 9.500 6.500a17 17 0 0 1-2.700 3.500M6.300 7.400A16.600 16.600 0 0 0 2.500 12s3.500 6.500 9.500 6.500a9.300 9.300 0 0 0 4.200-1" /><path d="M10 10.100a2.800 2.800 0 0 0 3.900 3.900" /></svg>
        </button>
      </div>
      <p class="ctr__total">{{ reais(patrimonio) }}</p>
      <div v-if="fatias.length" class="ctr__barra" role="img" :aria-label="rotuloAlocacao">
        <span v-for="a in fatias" :key="a.name" :style="{ flexGrow: a.pctNum, background: a.color }" :title="`${a.name} ${a.pct}`" />
      </div>
    </div>

    <div class="ctr__grupo">
      <NuxtLink to="/carteira#onde" class="ctr__rotulo">Resultado <span aria-hidden="true">›</span></NuxtLink>
      <dl class="ctr__fatos">
        <div v-if="ganho" class="ctr__fato">
          <dd>{{ ganho.valor }}</dd><dt>{{ ganho.rotulo }}</dt>
        </div>
        <div v-if="ganho" class="ctr__fato">
          <dd>{{ ganho.pct }}</dd><dt>Sobre o que pôs</dt>
        </div>
        <div v-if="diaValor || diaPct" class="ctr__fato">
          <dd>{{ reais(semCentavos(diaValor)) ?? diaPct }}</dd><dt>Hoje<template v-if="diaValor && diaPct">, <b :class="`ctr__dir--${diaDir ?? 'flat'}`">{{ diaPct }}</b></template></dt>
        </div>
        <div v-if="provento" class="ctr__fato">
          <dd>{{ provento }}</dd><dt>Proventos, 12 meses</dt>
        </div>
      </dl>
    </div>

    <div v-if="mexeu" class="ctr__grupo">
      <NuxtLink to="/carteira#onde" class="ctr__rotulo">Quem mexeu hoje <span aria-hidden="true">›</span></NuxtLink>
      <div class="ctr__mexeu">
        <ul v-for="(lista, i) in [mexeu.sobem, mexeu.caem]" :key="i" class="ctr__lista">
          <li v-for="l in lista" :key="l.ticker">
            <component :is="hrefDe(l) ? Link : 'span'" :to="hrefDe(l) ?? undefined" class="ctr__papel">
              <span class="ctr__tk">{{ nomeDe(l) }}</span>
              <span v-if="l.diaPct != null" :class="i === 0 ? 'ctr__dir--up' : 'ctr__dir--down'">{{ pctComSinal(l.diaPct) }}</span>
            </component>
          </li>
        </ul>
      </div>
    </div>

    <p v-if="fonte" class="ctr__fonte"><i aria-hidden="true" />{{ fonte }}</p>
  </div>
</template>

<style scoped>
.ctr { display: flex; flex-direction: column; gap: 34px; color: var(--nu-ink); font-variant-numeric: tabular-nums; }
.ctr__grupo { display: flex; flex-direction: column; min-width: 0; }
.ctr__rotulo { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; min-height: 28px; color: var(--nu-gray); font-size: 15px; font-weight: 400; text-decoration: none; transition: color var(--nu-dur-rapida, .15s) var(--nu-ease-saida, ease); }
.ctr__rotulo:hover { color: var(--nu-ink); }
.ctr__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ctr__olho { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; margin: -8px -12px -8px 0; border: 0; border-radius: 50%; background: transparent; color: var(--nu-gray); cursor: pointer; transition: color var(--nu-dur-rapida, .15s) var(--nu-ease-saida, ease), background var(--nu-dur-rapida, .15s) var(--nu-ease-saida, ease); }
.ctr__olho:hover { background: var(--nu-band); color: var(--nu-ink); }
.ctr__olho:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 1px; }
.ctr__rotulo span { color: var(--nu-gray); opacity: .7; }
.ctr__total { margin: 0; font-size: 30px; line-height: 1.25; font-weight: var(--nu-w-display); letter-spacing: -0.025em; white-space: nowrap; }
.ctr__barra { display: flex; gap: 3px; height: 5px; margin-top: 14px; }
.ctr__barra span { flex: 0 0 0; min-width: 3px; border-radius: 3px; }
.ctr__fatos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 16px; margin: 12px 0 0; }
.ctr__fato { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ctr__fato dd { margin: 0; font-size: 18.5px; font-weight: var(--nu-w-display); letter-spacing: -0.015em; white-space: nowrap; }
.ctr__fato dt { order: 2; color: var(--nu-gray); font-size: 13.5px; font-weight: 400; line-height: 1.35; }
.ctr__fato dt b { font-weight: 400; }
.ctr__mexeu { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 24px; margin-top: 8px; }
.ctr__lista { margin: 0; padding: 0; list-style: none; }
.ctr__papel { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; min-height: 30px; color: inherit; font-size: 14.5px; text-decoration: none; }
/* o % nunca encolhe; quem cede é o nome, e um ticker de seis letras cabe inteiro na coluna */
.ctr__papel > span:last-child { flex: none; }
a.ctr__papel:hover .ctr__tk { text-decoration: underline; text-underline-offset: 3px; }
.ctr__tk { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ctr__dir--up { color: var(--nu-green-text); }
.ctr__dir--down { color: var(--nu-red-text); }
.ctr__dir--flat { color: var(--nu-gray); }
.ctr__fonte { display: flex; align-items: center; gap: 8px; margin: -4px 0 0; padding-top: 20px; border-top: 1px solid var(--nu-line-2); color: var(--nu-gray); font-size: 13.5px; }
.ctr__fonte i { flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--nu-green); }
/* o trilho no topo da página (a moldura estreita: celular, tablet, ou o painel do chat aberto ao lado):
   em vez de uma coluna comprida, o patrimônio e quem mexeu lado a lado, e os números numa linha embaixo */
@container moldura (max-width: 1040px) {
  .ctr { gap: 24px; }
}
@container moldura (min-width: 620px) and (max-width: 1040px) {
  .ctr { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px clamp(28px, 6cqi, 64px); align-items: start; }
  .ctr__grupo:nth-child(2) { grid-column: 1 / -1; order: 3; }
  .ctr__fatos { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ctr__fonte { grid-column: 1 / -1; order: 4; }
}
</style>
