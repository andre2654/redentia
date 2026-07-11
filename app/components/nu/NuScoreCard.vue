<script setup lang="ts">
// Card do Redentia Score sobre a seção azul (design Acoes Nu): pill de
// classificação, número /100 gigante, progress bar verde-accent e sub-scores
// com hairlines rgba(creme,.14). Card #2456C9 radius 26 hover -3px.
import type { AcaoScoreVM } from '~/types/acao'

defineProps<{ score: AcaoScoreVM }>()
</script>

<template>
  <div class="nsc">
    <div class="nsc__head">
      <span class="nsc__label">Redentia Score</span>
      <span class="nsc__pill" :class="`nsc__pill--${score.pill.variant}`">{{ score.pill.text }}</span>
    </div>
    <div class="nsc__num">
      <span class="nsc__num-main">{{ score.score100 }}</span>
      <span class="nsc__num-max">/100</span>
    </div>
    <div class="nsc__track">
      <div class="nsc__fill" :style="{ width: `${score.score100}%` }" />
    </div>
    <div v-if="score.subScores.length" class="nsc__subs">
      <div v-for="s in score.subScores" :key="s.name" class="nsc__sub">
        <span class="nsc__sub-name">{{ s.name }}</span>
        <span class="nsc__sub-val">{{ s.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nsc {
  background: var(--nu-blue-deep); border-radius: var(--nu-r-card-lg); padding: 28px;
  display: flex; flex-direction: column; transition: transform .18s;
}
.nsc:hover { transform: translateY(-3px); }
.nsc__head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.nsc__label {
  color: var(--nu-cream-text-60); font-size: 12.5px; font-weight: 800;
  letter-spacing: 1.4px; text-transform: uppercase;
}
.nsc__pill {
  display: inline-flex; align-items: center; font-size: 12px; font-weight: 800;
  padding: 6px 12px; border-radius: var(--nu-r-pill);
}
.nsc__pill--green { background: var(--nu-green-soft-18); color: var(--nu-green-soft); }
.nsc__pill--amber { background: var(--nu-cream-text-18); color: var(--nu-amber-soft); }
.nsc__pill--gray { background: var(--nu-cream-text-18); color: var(--nu-cream-text-78); }
.nsc__num { display: flex; align-items: flex-end; gap: 8px; margin-top: 24px; }
.nsc__num-main {
  color: var(--nu-cream-text); font-size: clamp(44px, 4vw, 58px); font-weight: 800;
  letter-spacing: -2px; line-height: 0.9; font-variant-numeric: tabular-nums;
}
.nsc__num-max { color: var(--nu-cream-text-50); font-size: 19px; font-weight: 700; margin-bottom: 4px; }
.nsc__track {
  height: 10px; border-radius: var(--nu-r-pill); background: var(--nu-cream-text-18);
  overflow: hidden; margin-top: 18px;
}
.nsc__fill { height: 100%; border-radius: var(--nu-r-pill); background: var(--nu-green-soft); }
.nsc__subs { margin-top: 18px; }
.nsc__sub {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  padding: 9px 0; border-top: 1px solid var(--nu-cream-text-14);
}
.nsc__sub-name { color: var(--nu-cream-text-60); font-size: 14px; font-weight: 600; }
.nsc__sub-val { color: var(--nu-cream-text); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
</style>
