<script setup lang="ts">
// 'Raio-X da carteira.' (design Carteira Nu): esquerda com score gigante
// N/100, barra de progresso azul (max 360px) e badge âmbar de status; direita
// com grid auto-fit minmax(235px,1fr) de cards creme (label uppercase, valor,
// tag pill, barra 8px, nota) + banner-link azul 'REDENTIA AI · PONTO DE
// ATENÇÃO' com círculo creme e seta (hover escurece + sobe 2px).
// ESTADOS: métricas ausentes (sem beta/sem cobertura de score) simplesmente
// não renderizam (grid auto-fit absorve); banner SÓ com insight real do
// /portfolio/analysis — sem análise, o banner some (nunca IA inventada).
import type { CarteiraRaioXVM } from '~/types/carteira'

defineProps<{ raiox: CarteiraRaioXVM }>()
</script>

<template>
  <section class="crx">
    <div class="crx__cols">
      <div class="crx__left">
        <h2 class="crx__title">Raio-X da<br>carteira.</h2>
        <div class="crx__sub">Diagnóstico automático da Redentia AI · atualizado hoje</div>
        <div class="crx__score">
          <span class="crx__score-num">{{ raiox.score }}</span>
          <span class="crx__score-max">/100</span>
        </div>
        <div class="crx__track">
          <div class="crx__fill" :style="{ width: `${raiox.score}%` }" />
        </div>
        <div class="crx__badge">{{ raiox.badge }}</div>
      </div>

      <div class="crx__right">
        <div class="crx__grid">
          <div v-for="m in raiox.metrics" :key="m.label" class="crx__card">
            <div class="crx__card-label">{{ m.label }}</div>
            <div class="crx__card-row">
              <span class="crx__card-value">{{ m.value }}</span>
              <span class="crx__tag" :class="`crx__tag--${m.tagTone}`">{{ m.tag }}</span>
            </div>
            <div class="crx__card-track">
              <div class="crx__card-fill" :class="`crx__card-fill--${m.fillTone}`" :style="{ width: `${m.fillPct}%` }" />
            </div>
            <div class="crx__card-note">{{ m.note }}</div>
          </div>
        </div>

        <NuxtLink v-if="raiox.insight" to="/busca" class="crx__banner">
          <span class="crx__banner-main">
            <span class="crx__banner-eyebrow">Redentia AI · ponto de atenção</span>
            <span class="crx__banner-text">{{ raiox.insight }}</span>
          </span>
          <span class="crx__banner-circle">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--nu-blue)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.crx {
  background: var(--nu-white);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.crx__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.crx__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.crx__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.crx__sub { color: var(--nu-gray); font-size: 17px; font-weight: 600; line-height: 1.5; margin-top: 22px; }
.crx__score { display: flex; align-items: flex-end; gap: 9px; margin-top: 38px; }
.crx__score-num {
  color: var(--nu-ink); font-size: clamp(64px, 6vw, 92px); font-weight: 800;
  letter-spacing: -3px; line-height: .85; font-variant-numeric: tabular-nums;
}
.crx__score-max { color: var(--nu-gray); font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.crx__track { height: 10px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); overflow: hidden; margin-top: 20px; max-width: 360px; }
.crx__fill { height: 100%; border-radius: var(--nu-r-pill); background: var(--nu-blue); }
.crx__badge {
  display: inline-flex; align-items: center; background: var(--nu-amber-bg); color: var(--nu-amber-text);
  font-size: 13px; font-weight: 800; padding: 6px 14px; border-radius: var(--nu-r-pill); margin-top: 18px;
}
.crx__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
.crx__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(235px, 1fr)); gap: 14px; }
.crx__card { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
.crx__card-label { color: var(--nu-gray); font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; }
.crx__card-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
.crx__card-value {
  color: var(--nu-ink); font-size: clamp(23px, 1.9vw, 28px); font-weight: 800;
  letter-spacing: -.5px; white-space: nowrap; font-variant-numeric: tabular-nums;
}
.crx__tag {
  display: inline-flex; align-items: center; font-size: 12px; font-weight: 800;
  padding: 4px 11px; border-radius: var(--nu-r-pill); white-space: nowrap; flex-shrink: 0;
}
.crx__tag--green { background: var(--nu-green-bg); color: var(--nu-green-2); }
.crx__tag--amber { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.crx__card-track { height: 8px; border-radius: var(--nu-r-pill); background: var(--nu-sand-2); overflow: hidden; margin-top: 14px; }
.crx__card-fill { height: 100%; border-radius: var(--nu-r-pill); }
.crx__card-fill--green { background: var(--nu-hm-green); }
.crx__card-fill--amber { background: var(--nu-amber-fill); }
.crx__card-note { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.5; margin-top: 12px; }
.crx__banner {
  display: flex; align-items: center; gap: 18px; background: var(--nu-blue);
  border-radius: var(--nu-r-panel); padding: 24px 26px; margin-top: 14px; cursor: pointer;
  transition: background .2s, transform .15s;
}
.crx__banner:hover { background: var(--nu-blue-hover); transform: translateY(-2px); }
.crx__banner-main { flex: 1; min-width: 0; }
.crx__banner-eyebrow {
  display: block; color: var(--nu-white-75); font-size: 11.5px; font-weight: 800;
  letter-spacing: 1.3px; text-transform: uppercase;
}
.crx__banner-text { display: block; color: var(--nu-white); font-size: 16px; font-weight: 600; line-height: 1.55; margin-top: 10px; }
.crx__banner-circle {
  width: 46px; height: 46px; flex-shrink: 0; border-radius: 50%; background: var(--nu-cream);
  display: flex; align-items: center; justify-content: center;
}
</style>
