<!--
  MoleculesRaioXAIInsights — "O que a Redent.IA está vendo na sua carteira"

  USADO EM:
  /raio-x apos o MoleculesRaioXHeroResult (parte do flow nao-auth)

  RENDERIZA:
  Cards com os AI insights do report (icon + paragraph). Layout grid 2x
  no desktop, 1x no mobile. Cada card amber-tinted, hover lift.

  PROPS:
  report: PortfolioReport — fonte de aiInsights[]
-->
<script setup lang="ts">
import type { PortfolioReport } from '~/composables/usePortfolioScore'

const props = defineProps<{
  report: PortfolioReport
}>()

const brand = useBrand()

const insights = computed(() => props.report.aiInsights || [])
</script>

<template>
  <section v-if="insights.length > 0" class="rx-insights">
    <header class="rx-insights__header">
      <p class="eyebrow">O QUE A REDENT.IA ESTÁ VENDO NA SUA CARTEIRA</p>
      <h2 class="rx-insights__title">
        Insights que ninguém te conta
      </h2>
    </header>

    <div class="rx-insights__grid">
      <article
        v-for="(insight, idx) in insights"
        :key="idx"
        class="rx-insights__card"
      >
        <div class="rx-insights__icon" aria-hidden="true">
          <UIcon
            :name="insight.icon || 'i-lucide-sparkles'"
            class="size-5"
            :style="{ color: 'var(--brand-primary)' }"
          />
        </div>
        <p class="rx-insights__text">
          {{ insight.paragraph }}
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.rx-insights {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 0;
}

.rx-insights__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0;
}

.rx-insights__title {
  font-family: var(--brand-font);
  font-size: 28px;
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 0;
  text-wrap: balance;
}

@media (min-width: 768px) {
  .rx-insights__title { font-size: 36px; }
}

.rx-insights__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .rx-insights__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

.rx-insights__card {
  display: flex;
  gap: 14px;
  padding: 22px 24px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--brand-primary) 4%, var(--bg-elevated));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  transition: transform 220ms, border-color 220ms, box-shadow 220ms;
}

.rx-insights__card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  box-shadow: 0 12px 32px -16px color-mix(in srgb, var(--brand-primary) 30%, transparent);
}

.rx-insights__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  flex-shrink: 0;
}

.rx-insights__text {
  font-family: var(--brand-font);
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-body);
  margin: 0;
  flex: 1;
}

@media (min-width: 768px) {
  .rx-insights__text { font-size: 15px; }
}
</style>
