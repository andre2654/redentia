<!--
  SlideIntro — opening cinematic. Letter-by-letter reveal with a
  blur-to-sharp pop on each character, a beating dot in the kicker,
  and a soft amber glow swelling behind the title.
-->
<template>
  <div class="sl-intro">
    <div class="sl-intro__halo" aria-hidden="true" />

    <div class="sl-intro__inner">
      <p class="sl-intro__kicker rxh-stagger" style="--rxh-delay: 0ms">
        <span class="sl-intro__dot" aria-hidden="true" />
        Raio-X · Highlights
      </p>

      <h1 class="sl-intro__title">
        <span class="sl-intro__line">
          <span
            v-for="(ch, i) in line1"
            :key="`a-${i}`"
            class="sl-intro__char"
            :style="{ '--ch-delay': `${200 + i * 36}ms` }"
            v-html="ch === ' ' ? '&nbsp;' : ch"
          />
        </span>
        <span class="sl-intro__line sl-intro__line--italic">
          <span
            v-for="(ch, i) in line2"
            :key="`b-${i}`"
            class="sl-intro__char sl-intro__char--italic"
            :style="{ '--ch-delay': `${720 + i * 30}ms` }"
            v-html="ch === ' ' ? '&nbsp;' : ch"
          />
        </span>
      </h1>

      <p class="sl-intro__sub rxh-stagger" style="--rxh-delay: 1400ms">
        <template v-if="userName">Vamos lá, {{ userName }}. </template>Toque na tela pra avançar.
      </p>

      <p
        v-if="formattedDate"
        class="sl-intro__date rxh-stagger"
        style="--rxh-delay: 1600ms"
      >
        {{ formattedDate }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  userName?: string
  generatedAt?: string
}
const props = withDefaults(defineProps<Props>(), {
  userName: '',
  generatedAt: '',
})

const line1 = Array.from('Sua carteira')
const line2 = Array.from('em 8 cenas.')

const formattedDate = computed(() => {
  if (!props.generatedAt) return ''
  try {
    return new Date(props.generatedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
})
</script>

<style scoped>
.sl-intro {
  position: relative;
  width: 100%;
  max-width: 720px;
  text-align: center;
}

.sl-intro__halo {
  position: absolute;
  left: 50%;
  top: 55%;
  width: 700px;
  height: 700px;
  margin-left: -350px;
  margin-top: -350px;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary, var(--brand-primary)) 18%, transparent), transparent 65%);
  filter: blur(50px);
  z-index: 0;
  pointer-events: none;
  animation: sl-intro-halo-breath 5.5s ease-in-out infinite;
}

@keyframes sl-intro-halo-breath {
  0%, 100% { transform: scale(0.92); opacity: 0.5; }
  50%      { transform: scale(1.06); opacity: 0.9; }
}

.sl-intro__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.sl-intro__kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--brand-primary, var(--brand-primary));
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.sl-intro__dot {
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
  animation: sl-intro-pulse 1.6s ease-in-out infinite;
}
.sl-intro__dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.5;
  animation: sl-intro-dot-ring 1.6s ease-out infinite;
}

@keyframes sl-intro-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.6); }
}
@keyframes sl-intro-dot-ring {
  0%   { transform: scale(0.6); opacity: 0.6; }
  100% { transform: scale(2.4); opacity: 0; }
}

.sl-intro__title {
  font-size: clamp(40px, 9vw, 88px);
  line-height: 1.02;
  font-weight: 300;
  letter-spacing: -0.03em;
  color: #fff;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.04em;
}

.sl-intro__line {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
}

.sl-intro__char {
  display: inline-block;
  opacity: 0;
  transform: translate3d(0, 22px, 0);
  filter: blur(14px);
  animation: sl-intro-letter 720ms cubic-bezier(0.16, 1, 0.3, 1) var(--ch-delay, 0ms) forwards;
}

.sl-intro__char--italic {
  background: linear-gradient(180deg, #fff 0%, color-mix(in srgb, var(--brand-primary, var(--brand-primary)) 60%, #fff) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-style: italic;
}

@keyframes sl-intro-letter {
  0%   { opacity: 0; transform: translate3d(0, 22px, 0); filter: blur(14px); }
  60%  { opacity: 1; filter: blur(0); }
  100% { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
}

.sl-intro__sub {
  font-size: clamp(15px, 2.2vw, 18px);
  color: rgba(255, 255, 255, 0.7);
  margin-top: 10px;
}

.sl-intro__date {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}

.rxh-stagger {
  opacity: 0;
  transform: translate3d(0, 16px, 0);
  animation: rxh-stagger-in 700ms cubic-bezier(0.16, 1, 0.3, 1) var(--rxh-delay, 0ms) forwards;
}

@keyframes rxh-stagger-in {
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rxh-stagger,
  .sl-intro__char {
    opacity: 1;
    transform: none;
    filter: none;
    animation: none;
  }
  .sl-intro__dot,
  .sl-intro__dot::after,
  .sl-intro__halo {
    animation: none;
  }
}
</style>
