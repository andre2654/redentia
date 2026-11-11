<script setup lang="ts">
// Os proventos das direções do /asset: as mesmas linhas, barras e links do
// AcaoDividends (os destinos e as condições de cada link são os de lá: ver o
// comentário do DONO DO CLUSTER naquele arquivo). As barras têm altura fixa e
// saem do servidor; a pílula "Suas N cotas" só existe para quem entrou e
// nasce no cliente, no fim do bloco, sem empurrar nada acima dela.
// Robustez (11/11/2026): uma ação principal na dobra (a pílula do histórico);
// as outras duas viraram o link com seta (NuLinkSeta), com o mesmo texto e o
// mesmo destino. As barras crescem do chão quando chegam perto da tela (a
// regra do v-revelar: só no cliente, só o que nasceu abaixo da dobra, nada
// escondido no HTML), em cascata de 60ms; a dica flutua e entra no tempo dos tokens.
import type { AcaoDividendsVM } from '~/types/acao'
import type { AcaoPosition } from '~/composables/useAcao'
import { atrasoDoFilho, deveRevelar, REVELACAO } from '~/utils/revelar'

const props = withDefaults(defineProps<{
  ticker: string
  dividends: AcaoDividendsVM
  position: AcaoPosition | null
  simuladorHref?: string | null
  quantoRendeHref?: string | null
  dividendosHref?: string | null
  /** 'lado': linhas à esquerda e barras à direita; 'pilha': uma coisa embaixo da outra */
  forma?: 'lado' | 'pilha'
}>(), { simuladorHref: null, quantoRendeHref: null, dividendosHref: null, forma: 'lado' })

const sobre = useSobreDoContexto()
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const contexto = computed(() => ({
  id: `proventos:${props.ticker}`,
  tipo: 'proventos',
  rotulo: `Proventos ${props.ticker}`,
  texto: [
    `Proventos de ${props.ticker}. ${props.dividends.subtitle}`,
    textoDeLinhas(props.dividends.rows),
    props.dividends.bars.length ? `Por ano: ${props.dividends.bars.map((b) => `${b.year} ${b.valFmt}`).join('; ')}` : '',
    props.dividends.barsNote,
  ].filter(Boolean).join('\n'),
}))
// a barra sob o mouse (ou em foco) acende e diz o ano e o valor; as outras recuam
const barra = ref<number | null>(null)
const unidade = computed(() => (/por cota/.test(props.dividends.subtitle) ? 'por cota' : 'por ação'))
const lado = (i: number) => (i === 0 ? 'esq' : i === props.dividends.bars.length - 1 ? 'dir' : 'meio')
const renda = computed(() => {
  if (!props.position || props.dividends.sum12 <= 0) return null
  return `Suas ${nf0.format(props.position.qty)} cotas geraram R$ ${nf0.format(props.position.qty * props.dividends.sum12)} em 12 meses`
})

// as barras crescem do chão quando o gráfico chega perto da tela (uma vez só)
const figura = ref<HTMLElement | null>(null)
let obsBarras: IntersectionObserver | null = null
onMounted(() => {
  const el = figura.value
  if (!el || typeof IntersectionObserver === 'undefined' || typeof el.animate !== 'function') return
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!deveRevelar(el.getBoundingClientRect().top, window.innerHeight, reduzido)) return
  obsBarras = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    obsBarras?.disconnect()
    el.querySelectorAll<HTMLElement>('.apv__barra').forEach((b, i) => {
      b.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: REVELACAO.duracao, easing: REVELACAO.curva, delay: 120 + atrasoDoFilho(i), fill: 'backwards' })
    })
  }, { rootMargin: REVELACAO.margem })
  obsBarras.observe(el)
})
onBeforeUnmount(() => obsBarras?.disconnect())
</script>

<template>
  <div v-contexto-chat="contexto" class="apv" :class="`apv--${forma}`">
    <div v-revelar class="apv__dados">
      <p class="apv__sub">{{ dividends.subtitle }}</p>
      <dl class="apv__linhas">
        <div v-for="r in dividends.rows" :key="r.l" class="apv__linha">
          <dt>{{ r.l }}</dt>
          <dd>{{ r.v }}</dd>
        </div>
      </dl>
      <div class="apv__ctas">
        <NuBotaoSeta v-if="dividendosHref" :to="dividendosHref" variante="carvao" tamanho="m">Ver histórico de dividendos</NuBotaoSeta>
        <span class="apv__links">
          <NuLinkSeta v-if="quantoRendeHref" :to="quantoRendeHref">Quanto rende um valor</NuLinkSeta>
          <NuLinkSeta v-if="simuladorHref" :to="simuladorHref">Simulador de dividendos</NuLinkSeta>
          <NuLinkSeta v-else :to="`/calculadora/dividend-yield?ticker=${ticker}`">Simular renda com {{ ticker }}</NuLinkSeta>
        </span>
      </div>
    </div>

    <figure v-if="dividends.bars.length" ref="figura" v-revelar class="apv__barras">
      <ol class="apv__cols" @mouseleave="barra = null">
        <li
          v-for="(b, i) in dividends.bars" :key="b.year"
          v-contexto-chat="{ id: `provento-ano:${sobre}:${b.year}`, tipo: 'proventos', rotulo: rotuloComSobre(`Proventos ${b.year}`, sobre), texto: `Proventos${sobre ? ` de ${sobre}` : ''} em ${b.year}: ${b.valFmt}${b.current ? ' (ano corrente)' : ''}. ${dividends.barsNote}` }"
          class="apv__col" :class="{ 'apv__col--atual': b.current, 'apv__col--on': barra === i, 'apv__col--recua': barra != null && barra !== i }"
          tabindex="0" :aria-label="`${b.current ? 'Últimos 12 meses' : b.year}: ${b.valFmt} ${unidade}`"
          @mouseenter="barra = i" @focus="barra = i" @blur="barra === i && (barra = null)"
        >
          <span class="apv__val">{{ b.valFmt }}</span>
          <span class="apv__trilho"><span class="apv__barra" :style="{ height: `${Math.max(2, b.hPct)}%` }" /></span>
          <!-- a barra corrente soma os ÚLTIMOS 12 MESES (proventosChart): o rótulo diz
               isso, para não brigar com o "2026 até agora" do resumo -->
          <span class="apv__ano">{{ b.current ? '12 meses' : b.year }}</span>
          <span v-if="barra === i" class="apv__dica" :class="`apv__dica--${lado(i)}`" aria-hidden="true">
            <span class="apv__dica-a">{{ b.current ? 'Últimos 12 meses' : b.year }}</span>
            <span class="apv__dica-v">{{ b.valFmt }} {{ unidade }}</span>
          </span>
        </li>
      </ol>
      <figcaption class="apv__nota">{{ dividends.barsNote }}</figcaption>
    </figure>
    <p v-else class="apv__nota">{{ dividends.barsNote }}</p>
    <p v-if="renda" class="apv__renda">{{ renda }}</p>
  </div>
</template>

<style scoped>
.apv { display: grid; gap: 28px clamp(28px, 4vw, 56px); }
.apv--lado { grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); align-items: start; }
@media (max-width: 860px) { .apv--lado { grid-template-columns: minmax(0, 1fr); } }
.apv__sub { margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-medio); letter-spacing: -0.01em; line-height: 1.5; font-variant-numeric: tabular-nums; }
.apv__linhas { margin: 16px 0 0; }
.apv__linha { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; min-height: 48px; padding: 12px 0; border-top: 1px solid var(--nu-line-2); }
.apv__linha:last-child { border-bottom: 1px solid var(--nu-line-2); }
.apv__linha dt { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
.apv__linha dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); font-variant-numeric: tabular-nums; text-align: right; }
/* a chamada da seção é a pílula com a seta (NuBotaoSeta); as outras, links com seta */
.apv__ctas { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 28px; margin-top: 32px; }
.apv__links { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 24px; font-size: var(--nu-fs-sm); }

.apv__barras { margin: 0; }
.apv__cols { list-style: none; margin: 0; padding: 0; display: flex; align-items: stretch; gap: clamp(8px, 1.4vw, 16px); height: 224px; }
.apv__col { position: relative; flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; outline: none; cursor: default; transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.apv__col--recua { opacity: .5; }
.apv__col:focus-visible .apv__barra { box-shadow: 0 0 0 3px var(--nu-blue); }
.apv__col--on .apv__barra { background: var(--nu-ink); transform: scaleY(1.02); }
.apv__col--on.apv__col--atual .apv__barra { background: var(--nu-blue-hover); }
/* a dica: carvão, flutuando, entra subindo 4px */
.apv__dica {
  position: absolute; top: -8px; transform: translateY(-100%); z-index: 3; pointer-events: none;
  display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; border-radius: var(--nu-r-chip); white-space: nowrap;
  background: var(--nu-ink); color: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-dark-chip-line), var(--nu-shadow-float); font-variant-numeric: tabular-nums;
  animation: apv-entra var(--nu-dur-media) var(--nu-ease-saida) both;
}
@keyframes apv-entra { from { opacity: 0; translate: 0 4px; } }
.apv__dica--meio { left: 50%; transform: translate(-50%, -100%); }
.apv__dica--esq { left: 0; }
.apv__dica--dir { right: 0; }
.apv__dica-a { color: var(--nu-on-dark-2); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); }
.apv__dica-v { font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.apv__val { color: var(--nu-gray-3); font-size: 13px; font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; white-space: nowrap; transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.apv__col--on .apv__val { color: var(--nu-ink); }
.apv__trilho { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.apv__barra { display: block; width: 100%; border-radius: 10px 10px 4px 4px; background: var(--nu-line); transform-origin: 50% 100%; transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida); }
.apv__col--atual .apv__barra { background: var(--nu-blue); }
.apv__col--atual .apv__val { color: var(--nu-blue-text); font-weight: var(--nu-w-forte); }
.apv__ano { color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.apv__col--atual .apv__ano { color: var(--nu-ink); font-weight: var(--nu-w-forte); }
.apv__nota { margin: 16px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); line-height: 1.5; }
.apv__renda {
  grid-column: 1 / -1; justify-self: start; margin: 0; padding: 8px 12px; border-radius: var(--nu-r-tag);
  background: var(--nu-blue-bg); color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums;
}
@media (prefers-reduced-motion: reduce) {
  .apv__col, .apv__barra, .apv__val { transition: none; }
  .apv__dica { animation: none; }
  .apv__col--on .apv__barra { transform: none; }
}
@media (max-width: 520px) {
  .apv__cols { height: 184px; gap: 4px; }
  .apv__val { letter-spacing: var(--nu-ls-titulo); }
  .apv__ctas { gap: 16px; }
}
</style>
