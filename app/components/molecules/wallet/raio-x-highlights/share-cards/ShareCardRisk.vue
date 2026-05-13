<!--
  ShareCardRisk — deep red/burgundy polaroid surfacing the user's
  biggest portfolio risk. Big percentage, underline accent, severity
  pill at the bottom.
-->
<template>
  <ShareCardChrome
    paper="linear-gradient(160deg, #2a0808 0%, #4a1010 45%, #5a1414 100%)"
    glow="radial-gradient(ellipse 65% 55% at 50% 45%, rgba(255, 100, 100, 0.22), transparent 75%)"
  >
    <template #label>Risco Identificado</template>

    <h1 class="rk-title">
      <span class="rk-title__line">A Redentia</span>
      <span class="rk-title__line rk-title__line--gold">encontrou</span>
      <span class="rk-title__line rk-title__line--italic">um risco</span>
    </h1>

    <div class="rk-title__rule" aria-hidden="true" />

    <div class="rk-value">
      <span class="rk-value__num">{{ valueLabel }}</span>
      <span v-if="suffix" class="rk-value__suffix">{{ suffix }}</span>
    </div>

    <p v-if="body" class="rk-context">
      <span v-html="bodyHtml" />
    </p>

    <span class="rk-pill">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
      {{ pillLabel }}
    </span>

    <template #corner>
      <div class="rk-seal">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      </div>
    </template>
  </ShareCardChrome>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ShareCardChrome from './ShareCardChrome.vue'

interface Props {
  /** Either a percentage (e.g. 26) or any string to display big. */
  value: number | string
  /** Optional suffix appended to the big number (e.g. "%"). */
  suffix?: string
  /** Sentence describing the risk; supports inline highlight via {hl}…{/hl}. */
  body?: string
  /** Short tag at the bottom (e.g. "Risco de concentração"). */
  pillLabel?: string
}
const props = withDefaults(defineProps<Props>(), {
  suffix: '',
  body: '',
  pillLabel: 'Risco identificado',
})

const valueLabel = computed(() => typeof props.value === 'number'
  ? props.value.toLocaleString('pt-BR')
  : props.value)

// Allow {hl}word{/hl} markers in the body string to be rendered gold.
const bodyHtml = computed(() => {
  const escape = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escape(props.body)
    .replace(/\{hl\}([^{]+)\{\/hl\}/g, '<strong class="rk-context__hi">$1</strong>')
})
</script>

<style scoped>
.rk-title {
  font-family: 'Instrument Serif', 'Didot', serif;
  font-size: 38px;
  line-height: 0.96;
  font-weight: 400;
  color: #fff;
  margin: 0;
  text-align: left;
  align-self: stretch;
  letter-spacing: -0.01em;
}

.rk-title__line { display: block; }
.rk-title__line--gold { color: #d9a635; }
.rk-title__line--italic {
  font-style: italic;
  font-weight: 400;
}

.rk-title__rule {
  height: 2px;
  width: 50px;
  background: linear-gradient(90deg, transparent 0%, #d9a635 25%, #d9a635 75%, transparent 100%);
  border-radius: 999px;
  align-self: flex-start;
  margin: 6px 0 0;
}

.rk-value {
  margin: 30px 0 8px;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-family: 'Instrument Serif', serif;
  font-variant-numeric: tabular-nums;
  position: relative;
}

.rk-value::before {
  content: '';
  position: absolute;
  inset: -45% -25%;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.32) 0%, transparent 60%);
  filter: blur(22px);
  z-index: -1;
}

.rk-value__num {
  font-size: 150px;
  font-weight: 400;
  color: #fff;
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-shadow: 0 0 32px rgba(255, 255, 255, 0.5);
}

.rk-value__suffix {
  font-size: 56px;
  font-weight: 400;
  color: #fff;
  line-height: 0.9;
}

.rk-context {
  font-size: 14px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.85);
  margin: 8px 0 0;
  max-width: 84%;
  text-align: center;
}

:deep(.rk-context__hi) {
  color: #d9a635;
  font-weight: 500;
  font-style: italic;
}

.rk-pill {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 20px;
  border: 1px solid rgba(255, 122, 122, 0.55);
  color: #ff9a9a;
  border-radius: 999px;
  font-family: 'Instrument Serif', serif;
  font-size: 16px;
  font-weight: 400;
}

.rk-seal {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #f3c870, #a07310 70%, #6b4e0a);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 -3px 8px rgba(0, 0, 0, 0.4),
    inset 0 3px 6px rgba(255, 240, 200, 0.4),
    0 4px 10px -3px rgba(0, 0, 0, 0.5);
  color: #a01010;
}
</style>
