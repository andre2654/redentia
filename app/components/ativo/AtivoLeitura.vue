<script setup lang="ts">
// "O que a Redentia vê" nas direções do /asset: o score, o consenso e a
// leitura da IA do AcaoAiAnalysis, em três colunas separadas por fios (sem
// cartão azul dentro da banda azul). O consenso mostra os FATOS dos analistas
// (os alvos e a distância até eles) e tira a pílula "COMPRAR": numa página
// pública, um selo verde de compra lê como recomendação (CVM), mesmo citado.
// "Conversar sobre X" abre o painel do chat com a análise anexada.
import type { AcaoAiVM } from '~/types/acao'

const props = defineProps<{ ticker: string; ai: AcaoAiVM }>()
const emit = defineEmits<{ conversar: [] }>()
const ctxScore = computed(() => props.ai.score
  ? { id: `score:${props.ticker}`, tipo: 'grafico', rotulo: `Redentia Score ${props.ticker}`, texto: [`Redentia Score de ${props.ticker}: ${props.ai.score.score100}/100 (${props.ai.score.pill.text})`, ...props.ai.score.subScores.map((s) => `${s.name}: ${s.value}`)].join('\n') }
  : null)
const ctxConsenso = computed(() => {
  const c = props.ai.consensus
  return c ? { id: `consenso:${props.ticker}`, tipo: 'grafico', rotulo: `Consenso ${props.ticker}`, texto: [`Alvos dos analistas para ${props.ticker}: atual ${c.labels.current}, alvo médio ${c.labels.avg}, alvo máx. ${c.labels.high}`, `${c.upsideFmt} ${c.subLine}`, c.footnote].filter(Boolean).join('\n') } : null
})
const ctxLeitura = computed(() => {
  const r = props.ai.read
  return r ? { id: `leitura:${props.ticker}`, tipo: 'grafico', rotulo: `Leitura da IA · ${props.ticker}`, texto: [`Leitura da IA sobre ${props.ticker}.`, `A favor: ${r.pros.join('; ')}`, `Contra: ${r.cons.join('; ')}`].join('\n') } : null
})
</script>

<template>
  <div class="ale">
    <p class="ale__sub">Análise gerada pela Redentia AI{{ ai.updatedLabel ? ` · ${ai.updatedLabel}` : '' }}</p>
    <div class="ale__cols">
      <div v-if="ai.score" v-contexto-chat="ctxScore" class="ale__col">
        <p class="ale__r">Redentia Score <span class="ale__pill" :class="`ale__pill--${ai.score.pill.variant}`">{{ ai.score.pill.text }}</span></p>
        <p class="ale__num">{{ ai.score.score100 }}<span class="ale__num-max">/100</span></p>
        <span class="ale__trilho" aria-hidden="true"><span class="ale__fill" :style="{ width: `${ai.score.score100}%` }" /></span>
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
    <NuxtLink to="/busca" class="ale__chat" @click.prevent="emit('conversar')">
      Conversar sobre {{ ticker }} com a IA
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
    </NuxtLink>
  </div>
</template>

<style scoped>
.ale__sub { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.ale__cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 0; margin-top: 20px; }
.ale__col { padding: 20px 24px 22px 0; border-top: 1px solid var(--nu-cream-line); }
.ale__col + .ale__col { padding-left: 24px; border-left: 1px solid var(--nu-cream-line); }
@media (max-width: 860px) { .ale__col + .ale__col { padding-left: 0; border-left: 0; } }
.ale__r { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.ale__pill { display: inline-flex; align-items: center; height: 22px; padding: 0 9px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: 0; text-transform: none; }
.ale__pill--green { background: var(--nu-green-bg); color: var(--nu-green-2); }
.ale__pill--amber { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.ale__pill--gray { background: var(--nu-sand-2); color: var(--nu-gray-tag); }
.ale__num { margin: 14px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 600; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.ale__num--up { color: var(--nu-green-text); }
.ale__num-max { margin-left: 4px; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; letter-spacing: 0; }
.ale__trilho { display: block; height: 6px; margin-top: 16px; border-radius: var(--nu-r-pill); background: var(--nu-cream-3); overflow: hidden; }
.ale__fill { display: block; height: 100%; border-radius: inherit; background: var(--nu-blue); }
.ale__subs { margin: 14px 0 0; }
.ale__subs div, .ale__alvos div { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; }
.ale__subs dt { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.ale__subs dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.ale__linha { margin: 6px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.ale__faixa { position: relative; height: 6px; margin-top: 18px; border-radius: var(--nu-r-pill); background: var(--nu-cream-3); }
.ale__faixa-f { position: absolute; top: 0; bottom: 0; border-radius: inherit; background: var(--nu-green-bg); box-shadow: inset 0 0 0 1px var(--nu-green); }
.ale__faixa-alvo { position: absolute; top: 50%; width: 3px; height: 16px; border-radius: 2px; background: var(--nu-green); transform: translate(-50%, -50%); }
.ale__faixa-hoje { position: absolute; top: 50%; width: 12px; height: 12px; border-radius: 50%; background: var(--nu-ink); box-shadow: 0 0 0 3px var(--nu-white); transform: translate(-50%, -50%); }
.ale__alvos { display: flex; justify-content: space-between; gap: 8px; margin: 10px 0 0; }
.ale__alvos div { flex-direction: column-reverse; gap: 2px; padding: 0; }
.ale__alvos div:nth-child(2) { text-align: center; }
.ale__alvos div:last-child { text-align: right; }
.ale__alvos dt { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.ale__alvos dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.ale__nota { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.ale__lado { margin: 14px 0 0; font-size: var(--nu-fs-sm); font-weight: 700; }
.ale__lado--pro { color: var(--nu-green-text); }
.ale__lado--con { color: var(--nu-amber-text); }
.ale__itens { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.ale__itens li { display: flex; gap: 10px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.ale__marca { flex-shrink: 0; width: 6px; height: 6px; margin-top: 8px; border-radius: 50%; }
.ale__marca--pro { background: var(--nu-green); }
.ale__marca--con { background: var(--nu-amber-fill); }
.ale__chat { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.ale__chat { transition: gap .2s ease, color .2s ease; }
.ale__chat:hover { gap: 12px; color: var(--nu-blue-hover); }
.ale__subs div { transition: background .2s ease; border-radius: 6px; }
.ale__subs div:hover { background: var(--nu-ink-04); }
@media (prefers-reduced-motion: reduce) { .ale__chat, .ale__subs div { transition: none; } }
</style>
