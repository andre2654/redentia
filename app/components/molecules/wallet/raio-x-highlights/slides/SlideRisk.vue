<!--
  SlideRisk — alarming variant of the strength slide.

  Extra UAU:
    - Edge vignette pulsing in the risk tint (subtle, not strobe-flash)
    - 3-stage ripple emanating from the icon (3 concentric rings)
    - Slight pre-roll shake to draw the eye to the icon
    - Severity badge slides in with a glowing border
-->
<template>
  <div class="sl-risk">
    <!-- Border-pulse vignette in the risk tint -->
    <div
      class="sl-risk__edge"
      :style="{
        boxShadow: `inset 0 0 200px 40px ${edgeTint}, inset 0 0 60px 10px ${edgeTintInner}`,
      }"
      aria-hidden="true"
    />

    <div class="sl-risk__inner">
      <div class="sl-risk__icon-wrap rxh-stagger" style="--rxh-delay: 0ms">
        <span
          v-for="i in 3"
          :key="`ring-${i}`"
          class="sl-risk__ripple"
          :style="{ '--ripple-delay': `${(i - 1) * 0.5}s`, background: pulseColor }"
          aria-hidden="true"
        />
        <div
          class="sl-risk__icon"
          :style="{ background: tintColor, boxShadow: `0 0 0 6px ${pulseColor}, 0 14px 40px -8px ${shadowColor}` }"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
      </div>

      <p class="sl-risk__kicker rxh-stagger" style="--rxh-delay: 200ms" :style="{ color: tintColor }">
        O que merece atenção
      </p>

      <h2 class="sl-risk__title rxh-stagger" style="--rxh-delay: 380ms">
        {{ risk.title }}
      </h2>

      <p class="sl-risk__body rxh-stagger" style="--rxh-delay: 620ms">
        {{ risk.body }}
      </p>

      <span
        class="sl-risk__sev rxh-stagger"
        style="--rxh-delay: 820ms"
        :style="{ borderColor: tintColor, color: tintColor, boxShadow: `0 0 16px ${pulseColor}` }"
      >
        <span class="sl-risk__sev-dot" :style="{ background: tintColor }" />
        {{ severityLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioAnalysisRisk } from '~/services/walletData'

interface Props {
  risk: PortfolioAnalysisRisk
}
const props = defineProps<Props>()

const tintColor = computed(() => {
  switch (props.risk.severity) {
    case 'high': return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low': return '#fbbf24'
    default: return '#f59e0b'
  }
})

const pulseColor = computed(() => `color-mix(in srgb, ${tintColor.value} 32%, transparent)`)
const shadowColor = computed(() => `color-mix(in srgb, ${tintColor.value} 45%, transparent)`)
const edgeTint = computed(() => `color-mix(in srgb, ${tintColor.value} 14%, transparent)`)
const edgeTintInner = computed(() => `color-mix(in srgb, ${tintColor.value} 8%, transparent)`)

const severityLabel = computed(() => {
  switch (props.risk.severity) {
    case 'high': return 'Risco alto'
    case 'medium': return 'Risco médio'
    case 'low': return 'Risco baixo'
    default: return 'Risco médio'
  }
})
</script>

<style scoped>
.sl-risk {
  position: relative;
  width: 100%;
  max-width: 760px;
}

.sl-risk__edge {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  animation: sl-risk-edge-in 700ms ease-out 100ms forwards, sl-risk-edge-pulse 3.5s ease-in-out 800ms infinite;
}

@keyframes sl-risk-edge-in {
  to { opacity: 1; }
}
@keyframes sl-risk-edge-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}

.sl-risk__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;
}

.sl-risk__icon-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sl-risk__icon {
  position: relative;
  z-index: 2;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: sl-risk-icon-shake 600ms cubic-bezier(0.36, 0.07, 0.19, 0.97) 200ms;
}

@keyframes sl-risk-icon-shake {
  0%, 100% { transform: translate3d(0, 0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 40%, 60%, 80% { transform: translate3d(2px, 0, 0); }
}

.sl-risk__ripple {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  opacity: 0;
  animation: sl-risk-ripple 2s ease-out var(--ripple-delay, 0s) infinite;
}

@keyframes sl-risk-ripple {
  0%   { transform: scale(0.6); opacity: 0.7; }
  100% { transform: scale(2.2); opacity: 0; }
}

.sl-risk__kicker {
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 500;
}

.sl-risk__title {
  font-size: clamp(30px, 6vw, 52px);
  line-height: 1.1;
  font-weight: 300;
  letter-spacing: -0.025em;
  color: #fff;
  margin: 0;
  max-width: 620px;
}

.sl-risk__body {
  font-size: clamp(15px, 2.2vw, 18px);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  max-width: 540px;
  margin: 0;
}

.sl-risk__sev {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.sl-risk__sev-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  box-shadow: 0 0 8px currentColor;
}

.rxh-stagger {
  opacity: 0;
  transform: translate3d(0, 14px, 0);
  animation: rxh-stagger-in 700ms cubic-bezier(0.16, 1, 0.3, 1) var(--rxh-delay, 0ms) forwards;
}

@keyframes rxh-stagger-in {
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .sl-risk__icon,
  .sl-risk__ripple,
  .sl-risk__edge,
  .rxh-stagger {
    animation: none;
  }
  .rxh-stagger { opacity: 1; transform: none; }
  .sl-risk__edge { opacity: 1; }
}
</style>
