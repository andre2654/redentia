<!--
  ShareCardChrome — shared "torn paper polaroid" frame for every share
  card. Stamps the brand decorations (stars, tape, halftone dots,
  concentric arcs, top label, bottom footer) so each card template
  only worries about its own headline + number + accent.

  Slots:
    - default     → main content (title block + big number + sub)
    - label       → top tape-label text (e.g. "MEU RAIO-X", "RISCO IDENTIFICADO")
    - corner      → optional bottom-right corner sticker (e.g. star seal)

  Props control the tinting of the paper and the accent glow.
-->
<template>
  <div class="card-chrome" :style="rootStyle">
    <!-- Outer black grungy backdrop -->
    <div class="card-chrome__backdrop" aria-hidden="true" />

    <!-- Decorative halftone dots cluster (top-right) -->
    <svg class="card-chrome__halftone" viewBox="0 0 100 100" aria-hidden="true">
      <g fill="#d9a635">
        <circle v-for="(d, i) in halftone" :key="i" :cx="d.cx" :cy="d.cy" :r="d.r" :opacity="d.o" />
      </g>
    </svg>

    <!-- The torn-paper card itself, slightly rotated for hand-placed feel -->
    <div class="card-chrome__paper">
      <!-- Subtle radial highlight bleeding through the paper grain -->
      <div class="card-chrome__glow" :style="{ background: glow }" />

      <!-- Concentric arc lines etched into the paper, behind everything -->
      <svg class="card-chrome__arcs" viewBox="0 0 540 960" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.2">
          <circle v-for="r in [120, 180, 240, 300, 360, 420, 480, 540, 600]" :key="r" cx="270" cy="540" :r="r" />
        </g>
      </svg>

      <!-- Top tape label — gold tab with text -->
      <div class="card-chrome__tape">
        <span class="card-chrome__star card-chrome__star--inline" aria-hidden="true">
          <ShareCardStar size="9" />
        </span>
        <slot name="label" />
      </div>

      <!-- Main content slot -->
      <div class="card-chrome__body">
        <slot />
      </div>

      <!-- Footer: Redentia logo + brand + tagline -->
      <div class="card-chrome__footer">
        <span class="card-chrome__logo" aria-hidden="true">
          <ShareCardLogo size="26" />
        </span>
        <span class="card-chrome__brand">REDENTIA</span>
        <span class="card-chrome__tagline">— Faça seu Raio-X com IA —</span>
      </div>

      <!-- Optional bottom-right circular sticker -->
      <div v-if="$slots.corner" class="card-chrome__corner-sticker">
        <slot name="corner" />
      </div>
    </div>

    <!-- Scattered gold stars (placed in fixed positions for predictability) -->
    <div class="card-chrome__stars" aria-hidden="true">
      <ShareCardStar class="card-chrome__star-1" size="38" />
      <ShareCardStar class="card-chrome__star-2" size="22" />
      <ShareCardStar class="card-chrome__star-3" size="28" />
      <ShareCardStar class="card-chrome__star-4" size="20" />
    </div>

    <!-- Transparent tape strip in the upper-right -->
    <div class="card-chrome__tape-strip" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ShareCardStar from './ShareCardStar.vue'
import ShareCardLogo from './ShareCardLogo.vue'

interface Props {
  /** Paper background gradient — fits the card category. */
  paper?: string
  /** Glow color tint for the centre wash. */
  glow?: string
}
const props = withDefaults(defineProps<Props>(), {
  paper: 'linear-gradient(155deg, #1a0c08 0%, #2a1610 50%, #3a2018 100%)',
  glow: 'radial-gradient(ellipse 60% 55% at 50% 45%, rgba(216, 166, 53, 0.18), transparent 75%)',
})

const rootStyle = computed(() => ({
  '--paper': props.paper,
}))

const glow = computed(() => props.glow)

// Halftone dots: pseudo-random pattern in the upper-right corner.
const halftone = (() => {
  const out: Array<{ cx: number; cy: number; r: number; o: number }> = []
  // Grid of dots top-right
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cx = 62 + col * 5
      const cy = 4 + row * 5
      const distFromTopRight = Math.hypot(cx - 95, cy - 5)
      const o = Math.max(0, 1 - distFromTopRight / 35)
      if (o > 0.15) out.push({ cx, cy, r: 0.9, o: o * 0.95 })
    }
  }
  return out
})()
</script>

<style scoped>
.card-chrome {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 18px;
  color: #fff;
}

/* ============ Black grungy backdrop ============ */
.card-chrome__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 60% at 50% 50%, #1a1208 0%, #050203 80%),
    #060106;
  /* Grain noise via SVG filter */
  z-index: 0;
}

.card-chrome__backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 7px 7px, 11px 11px;
  background-position: 0 0, 3px 3px;
  mix-blend-mode: overlay;
}

/* ============ Halftone dots (top-right) ============ */
.card-chrome__halftone {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32%;
  height: 22%;
  z-index: 2;
  pointer-events: none;
  opacity: 0.95;
}

/* ============ Torn-paper card body ============ */
.card-chrome__paper {
  position: absolute;
  inset: 7% 6% 5% 6%;
  background: var(--paper);
  border-radius: 8px;
  transform: rotate(-0.6deg);
  box-shadow:
    0 24px 60px -18px rgba(0, 0, 0, 0.7),
    0 6px 16px -6px var(--shadow-ambient),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  z-index: 3;
  overflow: hidden;
  /* Paper grain on top of the gradient */
  background-image:
    radial-gradient(rgba(0, 0, 0, 0.35) 1px, transparent 1px),
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1.5px),
    var(--paper);
  background-size: 4px 4px, 9px 9px, auto;
  background-blend-mode: multiply, screen, normal;
}

/* Torn paper top edge */
.card-chrome__paper::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -2px;
  right: -2px;
  height: 12px;
  background: inherit;
  clip-path: polygon(
    0% 60%, 3% 30%, 6% 80%, 9% 20%, 12% 70%, 15% 35%, 18% 90%, 22% 25%,
    26% 75%, 30% 40%, 34% 85%, 38% 30%, 42% 70%, 47% 50%, 52% 75%, 57% 35%,
    62% 80%, 67% 40%, 72% 70%, 77% 30%, 82% 80%, 87% 45%, 92% 75%, 96% 35%, 100% 60%, 100% 100%, 0% 100%
  );
}

/* Torn paper bottom edge */
.card-chrome__paper::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: -2px;
  right: -2px;
  height: 12px;
  background: inherit;
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 60%, 96% 30%, 92% 80%, 87% 20%, 82% 70%, 77% 35%,
    72% 85%, 67% 25%, 62% 75%, 57% 40%, 52% 80%, 47% 30%, 42% 70%, 38% 50%,
    34% 75%, 30% 35%, 26% 80%, 22% 40%, 18% 70%, 15% 30%, 12% 80%, 9% 45%, 6% 75%, 3% 35%, 0% 50%
  );
}

.card-chrome__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.card-chrome__arcs {
  position: absolute;
  inset: -10%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.45;
}

/* ============ Top tape label ============ */
.card-chrome__tape {
  position: absolute;
  top: 3%;
  left: 50%;
  transform: translateX(-50%) rotate(-1deg);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background:
    linear-gradient(180deg, #f3c870 0%, #d9a635 100%);
  color: #2a1610;
  border-radius: 3px;
  font-family: 'Instrument Serif', 'Didot', 'Tiempos Headline', 'Times New Roman', serif;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  z-index: 5;
  white-space: nowrap;
  box-shadow:
    0 4px 10px -4px var(--shadow-amber-near),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.card-chrome__star--inline {
  display: inline-flex;
  color: #2a1610;
}

/* ============ Body slot ============ */
.card-chrome__body {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  padding: 13% 8% 16% 8%;
  height: 100%;
  text-align: center;
  align-items: center;
  overflow: hidden;
}

/* ============ Footer ============ */
.card-chrome__footer {
  position: absolute;
  bottom: 6%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 4;
}

.card-chrome__star {
  color: #d9a635;
  margin-bottom: 4px;
}

.card-chrome__logo {
  color: #d9a635;
  margin-bottom: 6px;
  display: inline-flex;
  filter: drop-shadow(0 1px 2px var(--shadow-amber-near));
}

.card-chrome__brand {
  font-family: 'Instrument Serif', 'Didot', serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: #d9a635;
}

.card-chrome__tagline {
  font-size: 9px;
  letter-spacing: 0.15em;
  color: rgba(217, 166, 53, 0.7);
  font-style: italic;
}

/* ============ Bottom-right circular sticker ============ */
.card-chrome__corner-sticker {
  position: absolute;
  right: 8%;
  bottom: 12%;
  width: 14%;
  aspect-ratio: 1;
  z-index: 5;
}

/* ============ Scattered stars ============ */
.card-chrome__stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 6;
  color: #d9a635;
}

.card-chrome__star-1 {
  position: absolute;
  top: 10%;
  left: 5%;
  transform: rotate(-12deg);
  filter: drop-shadow(0 2px 4px var(--shadow-ambient));
}

.card-chrome__star-2 {
  position: absolute;
  top: 38%;
  right: 5%;
  transform: rotate(15deg);
  filter: drop-shadow(0 2px 4px var(--shadow-ambient));
}

.card-chrome__star-3 {
  position: absolute;
  top: 62%;
  left: 4%;
  transform: rotate(8deg);
  filter: drop-shadow(0 2px 4px var(--shadow-ambient));
}

.card-chrome__star-4 {
  position: absolute;
  top: 50%;
  right: 12%;
  transform: rotate(-22deg);
  filter: drop-shadow(0 2px 4px var(--shadow-ambient));
}

/* ============ Tape strip (upper right) ============ */
.card-chrome__tape-strip {
  position: absolute;
  top: -2%;
  right: 8%;
  width: 26%;
  height: 11%;
  background:
    linear-gradient(135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.25) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
  transform: rotate(28deg);
  z-index: 7;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
