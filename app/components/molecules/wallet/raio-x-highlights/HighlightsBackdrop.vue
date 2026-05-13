<!--
  HighlightsBackdrop — atmospheric layer behind every slide.

  Three composited layers, all GPU-accelerated CSS:

    1. Aurora — a slowly rotating conic-gradient that paints the
       night-sky behind everything. Subtle hue shift across slides.
    2. Particle field — 80 amber-tinted dots scattered with a
       per-particle drift + opacity twinkle. Runs entirely on the
       compositor (transform/opacity).
    3. Grid mesh — same etched grid we had before, masked into a
       radial vignette so it fades at the edges.

  Designed to feel quiet most of the time and only "breathe" — no
  hard motion that would distract from the slide content.
-->
<template>
  <div class="rxhb" aria-hidden="true">
    <div class="rxhb__aurora" :style="auroraStyle" />
    <div class="rxhb__glow rxhb__glow--a" :style="glowAStyle" />
    <div class="rxhb__glow rxhb__glow--b" :style="glowBStyle" />

    <!-- Particle field. SVG so we get crisp dots at any DPR. The
         drift + twinkle keyframes are randomized per particle via
         inline CSS variables — much cheaper than canvas. -->
    <svg class="rxhb__particles" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <circle
        v-for="(p, i) in particles"
        :key="i"
        :cx="p.x"
        :cy="p.y"
        :r="p.r"
        :fill="brand.colors.primary"
        :style="{
          '--p-delay': `${p.delay}s`,
          '--p-duration': `${p.duration}s`,
          '--p-shift-x': `${p.shiftX}px`,
          '--p-shift-y': `${p.shiftY}px`,
          '--p-opacity': p.opacity,
        }"
      />
    </svg>

    <div class="rxhb__grid" />
    <div class="rxhb__vignette" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Slide accent — drives a subtle hue shift in the aurora. */
  accent?: string
  /** Number of particles. Defaults to 80, tune down on cheap devices. */
  count?: number
}
const props = withDefaults(defineProps<Props>(), {
  accent: '',
  count: 80,
})

const brand = useBrand()

// Generate the particle layout once (deterministic from a seed) so
// SSR and client agree.
function rng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const particles = computed(() => {
  const r = rng(42)
  return Array.from({ length: props.count }).map(() => {
    const opacity = 0.18 + r() * 0.7         // 0.18..0.88
    const radius = 0.08 + r() * 0.32          // 0.08..0.4 (% of viewBox)
    return {
      x: r() * 100,
      y: r() * 100,
      r: radius,
      delay: -(r() * 8),                      // start at random phase
      duration: 4 + r() * 6,                  // 4-10s twinkle
      shiftX: (r() - 0.5) * 4,                // small drift
      shiftY: (r() - 0.5) * 4,
      opacity,
    }
  })
})

const auroraStyle = computed(() => {
  const c = brand.colors.primary
  return {
    background: `conic-gradient(from 0deg at 50% 50%,
      transparent 0deg,
      color-mix(in srgb, ${c} 14%, transparent) 60deg,
      transparent 120deg,
      color-mix(in srgb, ${c} 8%, transparent) 200deg,
      transparent 280deg,
      color-mix(in srgb, ${c} 18%, transparent) 340deg,
      transparent 360deg)`,
  }
})

const glowAStyle = computed(() => ({
  background: `radial-gradient(circle at center, color-mix(in srgb, ${brand.colors.primary} 38%, transparent), transparent 70%)`,
}))
const glowBStyle = computed(() => ({
  background: `radial-gradient(circle at center, color-mix(in srgb, ${brand.colors.primary} 22%, transparent), transparent 70%)`,
}))
</script>

<style scoped>
.rxhb {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ============ Aurora (rotating conic) ============ */
.rxhb__aurora {
  position: absolute;
  inset: -20%;
  filter: blur(80px);
  opacity: 0.55;
  animation: rxhb-aurora-rotate 60s linear infinite;
  will-change: transform;
}

@keyframes rxhb-aurora-rotate {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ============ Soft floating glows ============ */
.rxhb__glow {
  position: absolute;
  width: 700px;
  height: 700px;
  filter: blur(80px);
  opacity: 0.7;
  transform: translate(-50%, -50%);
  will-change: transform;
}

.rxhb__glow--a {
  left: 30%;
  top: 35%;
  animation: rxhb-glow-drift-a 22s ease-in-out infinite alternate;
}

.rxhb__glow--b {
  left: 70%;
  top: 65%;
  animation: rxhb-glow-drift-b 26s ease-in-out infinite alternate;
}

@keyframes rxhb-glow-drift-a {
  0%   { transform: translate(-50%, -50%) translate3d(0, 0, 0); }
  50%  { transform: translate(-50%, -50%) translate3d(120px, -60px, 0); }
  100% { transform: translate(-50%, -50%) translate3d(-80px, 80px, 0); }
}
@keyframes rxhb-glow-drift-b {
  0%   { transform: translate(-50%, -50%) translate3d(0, 0, 0); }
  50%  { transform: translate(-50%, -50%) translate3d(-100px, 40px, 0); }
  100% { transform: translate(-50%, -50%) translate3d(80px, -100px, 0); }
}

/* ============ Particle field ============ */
.rxhb__particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  mix-blend-mode: screen;
}

.rxhb__particles circle {
  filter: drop-shadow(0 0 1.4px currentColor);
  transform-origin: center;
  transform-box: fill-box;
  opacity: 0;
  animation:
    rxhb-particle-twinkle var(--p-duration, 6s) ease-in-out var(--p-delay, 0s) infinite,
    rxhb-particle-drift calc(var(--p-duration, 6s) * 2) ease-in-out var(--p-delay, 0s) infinite alternate;
}

@keyframes rxhb-particle-twinkle {
  0%, 100% { opacity: calc(var(--p-opacity, 0.5) * 0.2); }
  50%      { opacity: var(--p-opacity, 0.5); }
}

@keyframes rxhb-particle-drift {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(var(--p-shift-x, 0), var(--p-shift-y, 0), 0); }
}

/* ============ Etched grid mesh ============ */
.rxhb__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, #000 0%, transparent 75%);
}

/* ============ Vignette ============ */
.rxhb__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 100% 80% at 50% 50%, transparent 50%, rgba(0, 0, 0, 0.55) 100%);
}

@media (prefers-reduced-motion: reduce) {
  .rxhb__aurora,
  .rxhb__glow--a,
  .rxhb__glow--b,
  .rxhb__particles circle {
    animation: none;
  }
}
</style>
