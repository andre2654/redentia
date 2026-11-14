<script setup lang="ts">
// "O que a Redentia vê" nas direções do /asset: o score, o consenso e a
// leitura da IA do AcaoAiAnalysis, em três colunas separadas por fios (sem
// cartão azul dentro da banda azul). O consenso mostra os FATOS dos analistas
// (os alvos e a distância até eles) e tira a pílula "COMPRAR": numa página
// pública, um selo verde de compra lê como recomendação (CVM), mesmo citado.
// "Conversar sobre X" abre o painel do chat com a análise anexada.
// Robustez (11/11/2026): o selo do score é o NuSelo; a legenda, a data e os
// rótulos em texto pequeno de 13–14px; as três colunas entram em cascata
// (v-revelar) e a barra do score cresce da esquerda quando chega perto da tela
// (só no cliente e só o que nasceu abaixo da dobra; nada escondido no HTML).
import type { AcaoAiVM } from '~/types/acao'
import { deveRevelar, REVELACAO } from '~/utils/revelar'

const props = defineProps<{ ticker: string; ai: AcaoAiVM }>()
const emit = defineEmits<{ conversar: [] }>()
const ctxScore = computed(() => props.ai.score
  ? { id: `score:${props.ticker}`, tipo: 'grafico', rotulo: `Aportou Score ${props.ticker}`, texto: [`Aportou Score de ${props.ticker}: ${props.ai.score.score100}/100 (${props.ai.score.pill.text})`, ...props.ai.score.subScores.map((s) => `${s.name}: ${s.value}`)].join('\n') }
  : null)
const ctxConsenso = computed(() => {
  const c = props.ai.consensus
  return c ? { id: `consenso:${props.ticker}`, tipo: 'grafico', rotulo: `Consenso ${props.ticker}`, texto: [`Alvos dos analistas para ${props.ticker}: atual ${c.labels.current}, alvo médio ${c.labels.avg}, alvo máx. ${c.labels.high}`, `${c.upsideFmt} ${c.subLine}`, c.footnote].filter(Boolean).join('\n') } : null
})
const ctxLeitura = computed(() => {
  const r = props.ai.read
  return r ? { id: `leitura:${props.ticker}`, tipo: 'grafico', rotulo: `Leitura da IA · ${props.ticker}`, texto: [`Leitura da IA sobre ${props.ticker}.`, `A favor: ${r.pros.join('; ')}`, `Contra: ${r.cons.join('; ')}`].join('\n') } : null
})
const tomDoSelo = (v: string) => (v === 'green' ? 'verde' : v === 'amber' ? 'ambar' : 'neutro')

// a barra do score cresce da esquerda quando chega perto da tela (uma vez só)
const trilho = ref<HTMLElement | null>(null)
let obsTrilho: IntersectionObserver | null = null
onMounted(() => {
  const el = trilho.value
  const fill = el?.firstElementChild as HTMLElement | null
  if (!el || !fill || typeof IntersectionObserver === 'undefined' || typeof fill.animate !== 'function') return
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!deveRevelar(el.getBoundingClientRect().top, window.innerHeight, reduzido)) return
  obsTrilho = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    obsTrilho?.disconnect()
    fill.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: REVELACAO.duracao * 1.5, easing: REVELACAO.curva, delay: 200, fill: 'backwards' })
  }, { rootMargin: REVELACAO.margem })
  obsTrilho.observe(el)
})
onBeforeUnmount(() => obsTrilho?.disconnect())
</script>

<template>
  <div v-revelar="{ alvo: 'filhos' }" class="ale">
    <p class="ale__sub">Análise gerada pela IA da Aportou{{ ai.updatedLabel ? ` · ${ai.updatedLabel}` : '' }}</p>
    <div class="ale__cols">
      <div v-if="ai.score" v-contexto-chat="ctxScore" class="ale__col">
        <p class="ale__r">Aportou Score <NuSelo :tom="tomDoSelo(ai.score.pill.variant)" class="ale__pill">{{ ai.score.pill.text }}</NuSelo></p>
        <p class="ale__num">{{ ai.score.score100 }}<span class="ale__num-max">/100</span></p>
        <span ref="trilho" class="ale__trilho" aria-hidden="true"><span class="ale__fill" :style="{ width: `${ai.score.score100}%` }" /></span>
        <dl v-if="ai.score.subScores.length" class="ale__subs">
          <div v-for="s in ai.score.subScores" :key="s.name"><dt>{{ s.name }}</dt><dd>{{ s.value }}</dd></div>
        </dl>
      </div>

      <div v-if="ai.consensus" v-contexto-chat="ctxConsenso" class="ale__col">
        <p class="ale__r">Consenso</p>
        <p class="ale__num ale__num--up">{{ ai.consensus.upsideFmt }}</p>
        <p class="ale__linha">{{ ai.consensus.subLine }}</p>
        <div class="ale__faixa" aria-hidden="true">
          <span class="ale__faixa-f" :style="{ left: `${ai.consensus.rangeBar.fromPct}%`, width: `${ai.consensus.rangeBar.widthPct}%` }" />
          <span class="ale__faixa-alvo" :style="{ left: `${ai.consensus.rangeBar.targetPct}%` }" />
          <span class="ale__faixa-hoje" :style="{ left: `${ai.consensus.rangeBar.dotPct}%` }" />
        </div>
        <dl class="ale__alvos">
          <div><dt>atual</dt><dd>{{ ai.consensus.labels.current }}</dd></div>
          <div><dt>alvo médio</dt><dd>{{ ai.consensus.labels.avg }}</dd></div>
          <div><dt>alvo máx.</dt><dd>{{ ai.consensus.labels.high }}</dd></div>
        </dl>
        <p class="ale__nota">{{ ai.consensus.footnote }}</p>
      </div>

      <div v-if="ai.read" v-contexto-chat="ctxLeitura" class="ale__col">
        <p class="ale__r">Leitura da IA</p>
        <p class="ale__lado ale__lado--pro">Pontos fortes</p>
        <ul class="ale__itens">
          <li v-for="(p, i) in ai.read.pros" :key="i"><span class="ale__marca ale__marca--pro" aria-hidden="true" />{{ p }}</li>
        </ul>
        <p class="ale__lado ale__lado--con">Pontos de atenção</p>
        <ul class="ale__itens">
          <li v-for="(c, i) in ai.read.cons" :key="i"><span class="ale__marca ale__marca--con" aria-hidden="true" />{{ c }}</li>
        </ul>
      </div>
    </div>
    <!-- na captura: o preventDefault chega antes do clique do RouterLink (senão ele levava à /busca com o painel aberto) -->
    <NuBotaoSeta to="/busca" variante="carvao" tamanho="m" class="ale__chat" @click.capture.prevent="emit('conversar')">Conversar sobre {{ ticker }} com a IA</NuBotaoSeta>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): rótulo em caixa alta espaçada, número em 800, selo de
   raio 8 e fios de 1,5px. As três colunas e o conteúdo são os de antes. */
.ale__sub { margin: 0; color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
.ale__cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 0; margin-top: 24px; }
.ale__col { padding: 24px 32px 24px 0; border-top: 1px solid var(--nu-line); }
.ale__col + .ale__col { padding-left: 32px; border-left: 1px solid var(--nu-line-2); }
@media (max-width: 860px) { .ale__col + .ale__col { padding-left: 0; border-left: 0; } }
.ale__r { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 0; color: var(--nu-ink); font-size: 13px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; }
/* o selo dentro do rótulo em caixa alta: a letra dele volta ao normal */
.ale__pill { text-transform: none; }
.ale__num { margin: 16px 0 0; color: var(--nu-ink); font-size: clamp(46px, 5.2vw, 68px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1; font-variant-numeric: tabular-nums; }
.ale__num--up { color: var(--nu-green-text); }
.ale__num-max { margin-left: 6px; color: var(--nu-gray); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-medio); letter-spacing: 0; }
.ale__trilho { display: block; height: 8px; margin-top: 20px; border-radius: var(--nu-r-pill); background: var(--nu-line-2); overflow: hidden; }
.ale__fill { display: block; height: 100%; border-radius: inherit; background: var(--nu-blue); transform-origin: 0 50%; }
.ale__subs { margin: 16px 0 0; }
.ale__subs div, .ale__alvos div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; }
.ale__subs div + div { border-top: 1px solid var(--nu-line-2); }
.ale__subs dt { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }
.ale__subs dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.ale__linha { margin: 8px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }
.ale__faixa { position: relative; height: 10px; margin-top: 20px; border-radius: var(--nu-r-pill); background: var(--nu-line-2); }
.ale__faixa-f { position: absolute; top: 0; bottom: 0; border-radius: inherit; background: var(--nu-green-bg); box-shadow: inset 0 0 0 1.5px var(--nu-green); }
.ale__faixa-alvo { position: absolute; top: 50%; width: 3px; height: 20px; border-radius: 2px; background: var(--nu-green); transform: translate(-50%, -50%); }
.ale__faixa-hoje { position: absolute; top: 50%; width: 14px; height: 14px; border-radius: 50%; background: var(--nu-ink); box-shadow: 0 0 0 3px var(--nu-page); transform: translate(-50%, -50%); }
.ale__alvos { display: flex; justify-content: space-between; gap: 8px; margin: 12px 0 0; }
.ale__alvos div { flex-direction: column-reverse; gap: 2px; padding: 0; }
.ale__alvos div:nth-child(2) { text-align: center; }
.ale__alvos div:last-child { text-align: right; }
.ale__alvos dt { color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); }
.ale__alvos dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.ale__nota { margin: 16px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); line-height: 1.5; }
.ale__lado { margin: 16px 0 0; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); }
.ale__lado--pro { color: var(--nu-green-text); }
.ale__lado--con { color: var(--nu-amber-text); }
.ale__itens { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.ale__itens li { display: flex; gap: 12px; color: var(--nu-gray-3); font-size: 15.5px; font-weight: var(--nu-w-texto); line-height: 1.45; }
.ale__marca { flex-shrink: 0; width: 6px; height: 6px; margin-top: 8px; border-radius: 50%; }
.ale__marca--pro { background: var(--nu-green); }
.ale__marca--con { background: var(--nu-amber); }
.ale__chat { margin-top: 32px; }
</style>
