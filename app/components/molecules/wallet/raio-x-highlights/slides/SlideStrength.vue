<!--
  SlideStrength — celebrates the strongest aspect of the portfolio.
  Big icon, kicker, large title, supporting body. Green-tinted accent.
-->
<template>
  <div class="sl-streng">
    <div class="sl-streng__icon-wrap rxh-stagger" style="--rxh-delay: 0ms">
      <div class="sl-streng__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <span class="sl-streng__pulse" aria-hidden="true" />
    </div>

    <p class="sl-streng__kicker rxh-stagger" style="--rxh-delay: 200ms">
      O que você acertou
    </p>

    <h2 class="sl-streng__title rxh-stagger" style="--rxh-delay: 380ms">
      {{ strength.title }}
    </h2>

    <p class="sl-streng__body rxh-stagger" style="--rxh-delay: 620ms">
      {{ strength.body }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PortfolioAnalysisStrength } from '~/services/walletData'

interface Props {
  strength: PortfolioAnalysisStrength
}
defineProps<Props>()
</script>

<style scoped>
.sl-streng {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
}

.sl-streng__icon-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sl-streng__icon {
  position: relative;
  z-index: 2;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: #10b981;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 6px rgba(16, 185, 129, 0.16),
    0 14px 40px -8px rgba(16, 185, 129, 0.4);
}

.sl-streng__pulse {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.32);
  animation: sl-streng-pulse 1.8s ease-out infinite;
}

@keyframes sl-streng-pulse {
  0%   { transform: scale(0.6); opacity: 0.7; }
  100% { transform: scale(1.6); opacity: 0; }
}

.sl-streng__kicker {
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}

.sl-streng__title {
  font-size: clamp(32px, 6vw, 56px);
  line-height: 1.08;
  font-weight: 300;
  letter-spacing: -0.025em;
  color: #fff;
  margin: 0;
  max-width: 620px;
}

.sl-streng__body {
  font-size: clamp(15px, 2.2vw, 18px);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  max-width: 540px;
  margin: 0;
}

.rxh-stagger {
  opacity: 0;
  transform: translate3d(0, 14px, 0);
  animation: rxh-stagger-in 700ms cubic-bezier(0.16, 1, 0.3, 1) var(--rxh-delay, 0ms) forwards;
}

@keyframes rxh-stagger-in {
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sl-streng__pulse,
  .rxh-stagger {
    animation: none;
  }
  .rxh-stagger {
    opacity: 1;
    transform: none;
  }
}
</style>
