<script setup lang="ts">
// "Quem subiu e quem caiu hoje" (24/11/2026): os ativos da pessoa que mais
// andaram no dia, em duas colunas. Era a pergunta que mandava a pessoa a outro
// site: a home dizia o dia do total, mas não de quem ele veio.
// O % nunca se esconde; o R$ segue o olho da tela (`mostrarReais`).
import type { LinhaDoResultado, ResultadoDaCarteira } from '~/utils/resultadoDaCarteira'
import { reaisComSinal } from '~/utils/resultadoDaCarteira'
import { pctComSinal } from '~/utils/diaDaCarteira'

const props = withDefaults(defineProps<{
  resultado: ResultadoDaCarteira
  mostrarReais?: boolean
  /** o rótulo do dia ('hoje', 'no último pregão') */
  quando?: string
  /** para onde vai o "ver todos" */
  para?: string
}>(), { mostrarReais: false, quando: 'hoje', para: '/carteira#onde' })

const colunas = computed(() => [
  { id: 'sobem', titulo: 'Subindo', n: props.resultado.nSobem, itens: props.resultado.sobem, vazio: `Nenhum ativo seu subiu ${props.quando}.` },
  { id: 'caem', titulo: 'Caindo', n: props.resultado.nCaem, itens: props.resultado.caem, vazio: `Nenhum ativo seu caiu ${props.quando}.` },
])
const temDia = computed(() => props.resultado.nSobem + props.resultado.nCaem > 0)
const hrefDe = (l: LinhaDoResultado) => (l.classe === 'TREASURY' || l.classe === 'FIXED_INCOME' ? null : `/asset/${l.ticker}`)
const Link = resolveComponent('NuxtLink')
</script>

<template>
  <section v-if="temDia" class="csd" aria-labelledby="csd-t">
    <header class="csd__cab">
      <h3 id="csd-t" class="csd__t">Quem subiu e quem caiu {{ quando }}?</h3>
      <NuLinkSeta :to="para" class="csd__todos">Ver todos os ativos</NuLinkSeta>
    </header>
    <div class="csd__cols">
      <div v-for="c in colunas" :key="c.id" class="csd__col nu-cartao" :class="`csd__col--${c.id}`">
        <p class="csd__col-t"><i aria-hidden="true" />{{ c.titulo }} <span>{{ c.n }} {{ c.n === 1 ? 'ativo' : 'ativos' }}</span></p>
        <ul v-if="c.itens.length" class="csd__lista">
          <li v-for="l in c.itens" :key="l.ticker" class="csd__linha">
            <component :is="hrefDe(l) ? Link : 'span'" :to="hrefDe(l) ?? undefined" class="csd__nome">
              <b>{{ l.ticker.length > 8 ? l.nome : l.ticker }}</b>
              <span v-if="l.ticker.length <= 8 && l.nome !== l.ticker">{{ l.nome }}</span>
            </component>
            <span class="csd__num">
              <b>{{ pctComSinal(l.diaPct ?? 0) }}</b>
              <span v-if="mostrarReais && l.diaValor != null">{{ reaisComSinal(l.diaValor) }}</span>
            </span>
          </li>
        </ul>
        <p v-else class="csd__vazio">{{ c.vazio }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.csd { margin: clamp(24px, 3vw, 40px) 0 0; font-variant-numeric: tabular-nums; }
.csd__cab { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px 20px; margin: 0 0 clamp(12px, 1.4vw, 16px); }
.csd__t { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.4; }
.csd__cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: clamp(12px, 1.4vw, 16px); }
.csd__col { padding: clamp(16px, 1.8vw, 22px) clamp(18px, 2vw, 26px); border-radius: var(--nu-r-card); background: var(--nu-card); box-shadow: var(--nu-shadow-quente); }
.csd__col-t { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); }
.csd__col-t i { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green-text); }
.csd__col--caem .csd__col-t i { background: var(--nu-red-text); }
.csd__col-t span { margin-left: auto; color: var(--nu-gray); font-weight: var(--nu-w-texto); }
.csd__lista { margin: 0; padding: 0; list-style: none; }
.csd__linha { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 52px; padding: 8px 0; border-top: 1px solid var(--nu-line); }
.csd__linha:first-child { border-top: 0; }
.csd__nome { display: flex; flex-direction: column; min-width: 0; color: var(--nu-ink); text-decoration: none; line-height: 1.3; }
.csd__nome b { font-weight: var(--nu-w-forte); }
.csd__nome span { overflow: hidden; color: var(--nu-gray); font-size: var(--nu-fs-sm); text-overflow: ellipsis; white-space: nowrap; }
a.csd__nome:hover b { text-decoration: underline; text-underline-offset: 3px; }
a.csd__nome:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; border-radius: 4px; }
.csd__num { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; line-height: 1.3; }
.csd__num b { color: var(--nu-green-text); font-weight: var(--nu-w-forte); }
.csd__col--caem .csd__num b { color: var(--nu-red-text); }
.csd__num span { color: var(--nu-gray); font-size: var(--nu-fs-sm); }
.csd__vazio { margin: 6px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); line-height: 1.5; }
</style>
