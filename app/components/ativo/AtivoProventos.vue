<script setup lang="ts">
// Os proventos das direções do /asset: as mesmas linhas, barras e links do
// AcaoDividends (os destinos e as condições de cada link são os de lá: ver o
// comentário do DONO DO CLUSTER naquele arquivo). As barras têm altura fixa e
// saem do servidor; a pílula "Suas N cotas" só existe para quem entrou e
// nasce no cliente, no fim do bloco, sem empurrar nada acima dela.
import type { AcaoDividendsVM } from '~/types/acao'
import type { AcaoPosition } from '~/composables/useAcao'

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
</script>

<template>
  <div v-contexto-chat="contexto" class="apv" :class="`apv--${forma}`">
    <div class="apv__dados">
      <p class="apv__sub">{{ dividends.subtitle }}</p>
      <dl class="apv__linhas">
        <div v-for="r in dividends.rows" :key="r.l" class="apv__linha">
          <dt>{{ r.l }}</dt>
          <dd>{{ r.v }}</dd>
        </div>
      </dl>
      <div class="apv__ctas">
        <NuxtLink v-if="dividendosHref" :to="dividendosHref" class="apv__cta apv__cta--1">
          Ver histórico de dividendos
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
        <NuxtLink v-if="quantoRendeHref" :to="quantoRendeHref" class="apv__cta">Quanto rende um valor</NuxtLink>
        <NuxtLink v-if="simuladorHref" :to="simuladorHref" class="apv__cta">Simulador de dividendos</NuxtLink>
        <NuxtLink v-else :to="`/calculadora/dividend-yield?ticker=${ticker}`" class="apv__cta">Simular renda com {{ ticker }}</NuxtLink>
      </div>
    </div>

    <figure v-if="dividends.bars.length" class="apv__barras">
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
.apv__sub { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }
.apv__linhas { margin: 16px 0 0; }
.apv__linha { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; min-height: 46px; padding: 12px 0; border-top: 1px solid var(--nu-cream-line); }
.apv__linha:last-child { border-bottom: 1px solid var(--nu-cream-line); }
.apv__linha dt { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.apv__linha dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
.apv__ctas { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.apv__cta {
  display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600;
  transition: background .2s ease, box-shadow .2s ease, transform .45s cubic-bezier(.34, 1.56, .64, 1);
}
.apv__cta:hover { transform: translateY(-1px); }
.apv__cta:active { transform: scale(.97); }
.apv__cta:hover { background: var(--nu-cream-hover); color: var(--nu-ink); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.apv__cta--1 { background: var(--nu-ink); color: var(--nu-white); }
.apv__cta--1:hover { background: var(--nu-ink-hover); color: var(--nu-white); box-shadow: none; }

.apv__barras { margin: 0; }
.apv__cols { list-style: none; margin: 0; padding: 0; display: flex; align-items: stretch; gap: clamp(6px, 1.4vw, 16px); height: 220px; }
.apv__col { position: relative; flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; outline: none; cursor: default; transition: opacity .2s ease; }
.apv__col--recua { opacity: .5; }
.apv__col:focus-visible .apv__barra { box-shadow: 0 0 0 2px var(--nu-blue); }
.apv__col--on .apv__barra { background: var(--nu-ink-30); transform: scaleY(1.02); }
.apv__col--on.apv__col--atual .apv__barra { background: var(--nu-blue-hover); }
.apv__dica {
  position: absolute; top: -8px; transform: translateY(-100%); z-index: 3; pointer-events: none;
  display: flex; flex-direction: column; gap: 2px; padding: 8px 11px; border-radius: var(--nu-r-chip); white-space: nowrap;
  background: var(--nu-navy); color: var(--nu-cream-text); box-shadow: var(--nu-shadow-float); font-variant-numeric: tabular-nums;
  animation: apv-entra .18s ease both;
}
@keyframes apv-entra { from { opacity: 0; } }
.apv__dica--meio { left: 50%; transform: translate(-50%, -100%); }
.apv__dica--esq { left: 0; }
.apv__dica--dir { right: 0; }
.apv__dica-a { color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: 600; }
.apv__dica-v { font-size: var(--nu-fs-sm); font-weight: 700; }
.apv__val { color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.apv__trilho { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.apv__barra { display: block; width: 100%; border-radius: 8px 8px 3px 3px; background: var(--nu-bar-inactive); transform-origin: 50% 100%; transition: background .2s ease, transform .45s cubic-bezier(.34, 1.56, .64, 1); }
.apv__col--atual .apv__barra { background: var(--nu-blue); }
.apv__col--atual .apv__val { color: var(--nu-blue-text); font-weight: 700; }
.apv__ano { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; font-variant-numeric: tabular-nums; }
.apv__col--atual .apv__ano { color: var(--nu-ink); font-weight: 700; }
.apv__nota { margin: 12px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.apv__renda {
  grid-column: 1 / -1; justify-self: start; margin: 0; padding: 9px 16px; border-radius: var(--nu-r-pill);
  background: var(--nu-blue-tint); color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}
@media (prefers-reduced-motion: reduce) {
  .apv__col, .apv__barra, .apv__cta { transition: none; }
  .apv__dica { animation: none; }
  .apv__cta:hover, .apv__cta:active, .apv__col--on .apv__barra { transform: none; }
}
@media (max-width: 520px) {
  .apv__cols { height: 180px; }
  .apv__cols { gap: 4px; }
  .apv__val { letter-spacing: -0.02em; }
}
</style>
