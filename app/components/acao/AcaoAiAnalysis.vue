<script setup lang="ts">
// Seção "O que a Redentia vê" (design Acoes Nu): banda azul com grid auto-fit
// de 3 cards #2456C9 — NuScoreCard (score real ×10, escala 0-10 do backend),
// consenso de analistas e Leitura da IA. Degradação por card: sem cobertura de
// consenso (coverage:'none'/204) o card some e o grid vira 2; sem score
// (ticker fora do universo ranqueado) idem; a SEÇÃO inteira some se os três
// faltarem (o pai já não a renderiza).
import type { AcaoAiVM } from '~/types/acao'

defineProps<{ ticker: string; ai: AcaoAiVM }>()
</script>

<template>
  <section class="aai">
    <h2 class="aai__title">O que a Redentia vê.</h2>
    <div class="aai__sub">Análise gerada pela Redentia AI{{ ai.updatedLabel ? ` · ${ai.updatedLabel}` : '' }}</div>
    <div class="aai__grid">
      <NuScoreCard v-if="ai.score" :score="ai.score" />

      <div v-if="ai.consensus" class="aai__card">
        <div class="aai__card-head">
          <span class="aai__card-label">Consenso</span>
          <span class="aai__rec" :class="`aai__rec--${ai.consensus.pillVariant}`">{{ ai.consensus.pill }}</span>
        </div>
        <div class="aai__upside">{{ ai.consensus.upsideFmt }}</div>
        <div class="aai__upside-sub">{{ ai.consensus.subLine }}</div>
        <div class="aai__range">
          <div class="aai__range-fill" :style="{ left: `${ai.consensus.rangeBar.fromPct}%`, width: `${ai.consensus.rangeBar.widthPct}%` }" />
          <div class="aai__range-target" :style="{ left: `${ai.consensus.rangeBar.targetPct}%` }" />
          <div class="aai__range-dot" :style="{ left: `${ai.consensus.rangeBar.dotPct}%` }" />
        </div>
        <div class="aai__range-labels">
          <span><span class="aai__price">{{ ai.consensus.labels.current }}</span><span class="aai__price-sub">atual</span></span>
          <span class="aai__range-mid"><span class="aai__price aai__price--green">{{ ai.consensus.labels.avg }}</span><span class="aai__price-sub">alvo médio</span></span>
          <span class="aai__range-end"><span class="aai__price">{{ ai.consensus.labels.high }}</span><span class="aai__price-sub">alvo máx.</span></span>
        </div>
        <div class="aai__footnote">{{ ai.consensus.footnote }}</div>
      </div>

      <div v-if="ai.read" class="aai__card">
        <span class="aai__card-label">Leitura da IA</span>
        <div class="aai__read-head aai__read-head--pros">Pontos fortes</div>
        <div class="aai__read-list">
          <span v-for="(p, i) in ai.read.pros" :key="i" class="aai__read-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="aai__icon aai__icon--check"><path d="M20 6L9 17l-5-5" /></svg>
            <span class="aai__read-text">{{ p }}</span>
          </span>
        </div>
        <div class="aai__read-head aai__read-head--cons">Pontos de atenção</div>
        <div class="aai__read-list">
          <span v-for="(c, i) in ai.read.cons" :key="i" class="aai__read-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="aai__icon aai__icon--warn"><path d="M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
            <span class="aai__read-text">{{ c }}</span>
          </span>
        </div>
      </div>
    </div>
    <NuxtLink to="/busca" class="aai__chat">
      <span class="aai__chat-circle">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" class="aai__chat-chevron"><path d="M9 6l6 6-6 6" /></svg>
      </span>
      <span class="aai__chat-label">Conversar sobre {{ ticker }} com a IA</span>
    </NuxtLink>
  </section>
</template>

<style scoped>
.aai {
  background: var(--nu-blue);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.aai__title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.aai__sub { color: var(--nu-cream-text-60); font-size: 16px; font-weight: 600; margin-top: 14px; }
.aai__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 40px; }
.aai__card {
  background: var(--nu-blue-deep); border-radius: var(--nu-r-card-lg); padding: 28px;
  display: flex; flex-direction: column; transition: transform .18s;
}
.aai__card:hover { transform: translateY(-3px); }
.aai__card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.aai__card-label {
  color: var(--nu-cream-text-60); font-size: 12.5px; font-weight: 800;
  letter-spacing: 1.4px; text-transform: uppercase;
}
.aai__rec {
  display: inline-flex; align-items: center; font-size: 12px; font-weight: 800;
  letter-spacing: .8px; padding: 6px 14px; border-radius: var(--nu-r-pill);
}
.aai__rec--green { background: var(--nu-green-soft); color: var(--nu-navy); }
.aai__rec--amber { background: var(--nu-amber-soft); color: var(--nu-navy); }
.aai__rec--gray { background: var(--nu-cream-text-18); color: var(--nu-cream-text); }
.aai__upside {
  color: var(--nu-green-soft); font-size: clamp(34px, 3vw, 44px); font-weight: 800;
  letter-spacing: -1px; line-height: 1; margin-top: 24px; font-variant-numeric: tabular-nums;
}
.aai__upside-sub { color: var(--nu-cream-text-60); font-size: 15.5px; font-weight: 600; margin-top: 7px; }
.aai__range { position: relative; height: 8px; border-radius: var(--nu-r-pill); background: var(--nu-cream-text-18); margin-top: 26px; }
.aai__range-fill {
  position: absolute; top: 0; bottom: 0;
  background: linear-gradient(90deg, var(--nu-green-soft-35), var(--nu-green-soft));
  border-radius: var(--nu-r-pill);
}
.aai__range-target {
  position: absolute; top: 50%; width: 3px; height: 20px; background: var(--nu-green-soft);
  transform: translate(-50%, -50%); border-radius: 2px;
}
.aai__range-dot {
  position: absolute; top: 50%; width: 15px; height: 15px; border-radius: 50%;
  background: var(--nu-white); border: 3px solid var(--nu-blue-deep);
  transform: translate(-50%, -50%); box-shadow: 0 0 0 2px var(--nu-white-35);
}
.aai__range-labels { display: flex; justify-content: space-between; gap: 12px; margin-top: 14px; }
.aai__range-mid { text-align: center; }
.aai__range-end { text-align: right; }
.aai__price { display: block; color: var(--nu-cream-text); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.aai__price--green { color: var(--nu-green-soft); }
.aai__price-sub { display: block; color: var(--nu-cream-text-55); font-size: 12px; font-weight: 600; margin-top: 2px; }
.aai__footnote { color: var(--nu-cream-text-78); font-size: 14.5px; font-weight: 500; line-height: 1.6; margin-top: auto; padding-top: 20px; }
.aai__read-head { font-size: 13.5px; font-weight: 800; margin-top: 22px; }
.aai__read-head--pros { color: var(--nu-green-soft); }
.aai__read-head--cons { color: var(--nu-amber-soft); }
.aai__read-list { display: flex; flex-direction: column; gap: 11px; margin-top: 12px; }
.aai__read-item { display: flex; align-items: flex-start; gap: 9px; }
.aai__icon { flex-shrink: 0; margin-top: 2px; }
.aai__icon--check { color: var(--nu-green-soft); }
.aai__icon--warn { color: var(--nu-amber-soft); }
.aai__read-text { color: var(--nu-cream-text-85); font-size: 14.5px; font-weight: 500; line-height: 1.45; }
.aai__chat { display: inline-flex; align-items: center; gap: 14px; margin-top: 40px; transition: gap .2s; }
.aai__chat:hover { gap: 19px; }
.aai__chat-circle {
  width: 52px; height: 52px; border-radius: 50%; background: var(--nu-cream);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.aai__chat-chevron { color: var(--nu-blue); }
.aai__chat-label { color: var(--nu-cream-text); font-size: 18px; font-weight: 800; }
</style>
