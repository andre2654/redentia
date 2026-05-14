<!--
  RankingUiHero: bloco esquerdo do split V5.
  Slots: title (markup do H1 com em pra italic serif), lead (parágrafo descritivo).
  Props: eyebrow, chips. O H1 vem do slot pra preservar o markup SEO da página.
-->
<template>
  <div class="rk-hero">
    <p v-if="eyebrow" class="rk-eyebrow">{{ eyebrow }}</p>

    <h1 class="rk-h1">
      <slot name="title" />
    </h1>

    <p v-if="$slots.lead" class="rk-lead">
      <slot name="lead" />
    </p>

    <ul v-if="chips && chips.length" class="rk-chips">
      <li v-for="chip in chips" :key="chip.label">
        <span :class="['rk-chip-dot', chip.tone === 'positive' && 'is-positive']" />
        {{ chip.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
export type RankingHeroChip = {
  label: string
  tone?: 'default' | 'positive'
}

defineProps<{
  eyebrow?: string
  chips?: RankingHeroChip[]
}>()
</script>

<style scoped>
.rk-hero { display: contents; }

.rk-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
  margin: 0 0 20px;
}

.rk-h1 {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--text-heading);
  margin: 0 0 20px;
}
.rk-h1 :deep(em) {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}

.rk-lead {
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-body);
  max-width: 56ch;
  margin: 0 0 24px;
}

.rk-chips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  font-size: 13px;
  color: var(--text-muted);
}
.rk-chips li { display: inline-flex; align-items: center; gap: 6px; }
.rk-chip-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--brand-primary);
}
.rk-chip-dot.is-positive { background: var(--brand-positive); }
</style>
