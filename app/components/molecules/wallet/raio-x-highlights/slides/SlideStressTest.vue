<!--
  SlideStressTest — 3D camera dolly across all historical scenarios.

  We arrange up to three crisis cards in 3D space (perspective + preserve-3d):

        Subprime          COVID            Bolha IA
        (back-left)       (center)         (back-right)

  Then a "camera" rig pans + dollies across the rig in 4 stages
  over ~9.5s, so each card sits centered + face-on at its peak:

    0–25%   Wide establishing shot — all three visible angled
    25–50%  Camera glides left, Subprime fills the frame
    50–75%  Camera glides centre, COVID becomes hero
    75–100% Camera glides right, Bolha IA hero

  Implementation: the camera moves the WHOLE rig (translateX/translateZ/rotateY)
  via a keyframe animation that runs once. Each card is positioned absolute in
  3D space and never moves on its own. The result feels like a single locked
  shot rather than separate slide transitions.
-->
<template>
  <div class="sl-stress">
    <p class="sl-stress__kicker rxh-stagger" style="--rxh-delay: 0ms">
      Cenário de estresse · histórico
    </p>

    <h2 class="sl-stress__title rxh-stagger" style="--rxh-delay: 200ms">
      Como sua carteira sobreviveria
      <span class="sl-stress__title-italic">a cada crise.</span>
    </h2>

    <!-- 3D stage. perspective creates the depth illusion. -->
    <div class="sl-stress__stage" :style="{ '--cam-duration': `${camDurationMs}ms` }">
      <div class="sl-stress__rig">
        <article
          v-for="(s, i) in normalized"
          :key="i"
          class="sl-stress__card"
          :class="positionClass(i)"
          :style="cardStyle(i, s)"
        >
          <!-- Vintage year stamp in the background of the card -->
          <span v-if="s.year" class="sl-stress__year" aria-hidden="true">{{ s.year }}</span>

          <header class="sl-stress__card-head">
            <span class="sl-stress__card-eyebrow">Cenário {{ i + 1 }} de {{ normalized.length }}</span>
            <h3 class="sl-stress__card-name">{{ s.label }}</h3>
          </header>

          <div class="sl-stress__card-impact">
            <span class="sl-stress__impact-sign">{{ s.change_pct < 0 ? '−' : '+' }}</span>
            <span class="sl-stress__impact-num">{{ Math.abs(s.change_pct).toFixed(1).replace('.', ',') }}</span>
            <span class="sl-stress__impact-pct">%</span>
          </div>

          <div class="sl-stress__card-bar">
            <div class="sl-stress__card-bar-track">
              <div
                class="sl-stress__card-bar-fill"
                :style="{
                  '--fill-pct': `${s.fillPct}%`,
                  '--fill-color': s.tint,
                  '--fill-glow': s.glow,
                  '--fill-delay': `${i * 320 + 600}ms`,
                }"
              />
            </div>
          </div>

          <p class="sl-stress__card-note">{{ s.note }}</p>

          <div class="sl-stress__card-verdict" :style="{ color: s.tint, borderColor: s.tint }">
            <span class="sl-stress__verdict-dot" :style="{ background: s.tint, boxShadow: `0 0 10px ${s.tint}` }" />
            {{ s.verdict }}
          </div>
        </article>

        <!-- Ground reflection plane — sells the 3D illusion -->
        <div class="sl-stress__floor" aria-hidden="true" />
      </div>
    </div>

    <p class="sl-stress__hint rxh-stagger" style="--rxh-delay: 600ms">
      A câmera percorre os três cenários
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioAnalysisStressScenario } from '~/services/walletData'

interface Props {
  scenarios?: PortfolioAnalysisStressScenario[]
}
const props = withDefaults(defineProps<Props>(), {
  scenarios: () => [],
})

// Map scenario name to a vintage year stamp for the 3D card backdrop.
// Anything we don't recognize falls back to extracting digits from the name.
function inferYear(name: string): string {
  const m = name.match(/(19|20)\d{2}/)
  if (m) return m[0]
  const lower = name.toLowerCase()
  if (lower.includes('covid')) return '2020'
  if (lower.includes('subprime') || lower.includes('lehman')) return '2008'
  if (lower.includes('bolha') && (lower.includes('ia') || lower.includes('ai'))) return '202X'
  if (lower.includes('selic')) return 'BCB'
  if (lower.includes('dólar') || lower.includes('dolar') || lower.includes('cambio') || lower.includes('câmbio')) return 'USD'
  return ''
}

function tintFor(impact: number): string {
  const a = Math.abs(impact)
  if (a >= 30) return '#ef4444'        // catastrophic — red
  if (a >= 18) return '#f97316'        // severe — orange
  if (a >= 8) return '#f59e0b'         // moderate — amber
  return '#10b981'                      // resilient — green
}

function glowFor(impact: number): string {
  return `color-mix(in srgb, ${tintFor(impact)} 38%, transparent)`
}

function verdictFor(impact: number): string {
  const a = Math.abs(impact)
  if (a >= 30) return 'Vulnerável'
  if (a >= 18) return 'Resiliência moderada'
  if (a >= 8) return 'Resistente'
  return 'Muito resiliente'
}

const normalized = computed(() => {
  // Cap to 3 — the 3D rig is built for left/center/right. Defensive
  // against the prop arriving as undefined / null on a fresh mount.
  const list = Array.isArray(props.scenarios) ? props.scenarios : []
  return list.slice(0, 3).map((s) => {
    const fillPct = Math.min(100, Math.round((Math.abs(s.change_pct) / 50) * 100))
    return {
      label: s.name,
      change_pct: s.change_pct,
      note: s.note,
      year: inferYear(s.name),
      fillPct,
      tint: tintFor(s.change_pct),
      glow: glowFor(s.change_pct),
      verdict: verdictFor(s.change_pct),
    }
  })
})

// Each card's local 3D transform. We arrange them in a shallow arc so
// the camera can pan over and have each one rotate into the camera as
// the rig translates.
function cardStyle(i: number, _s: ReturnType<typeof normalized.value[0]>) {
  const count = normalized.value.length
  if (count === 1) {
    return { transform: 'translate3d(0, 0, 0)' }
  }
  // Three-card layout: positions at x = -380, 0, +380, with the side
  // ones pushed back a touch and rotated to face the centre slightly.
  const positions = [
    { x: -440, z: -120, rot: 22 },
    { x: 0,    z: 0,    rot: 0 },
    { x: 440,  z: -120, rot: -22 },
  ]
  // Two-card fallback: side-by-side, slight angles.
  const positions2 = [
    { x: -260, z: -40, rot: 14 },
    { x: 260,  z: -40, rot: -14 },
  ]
  const p = (count === 3 ? positions : positions2)[i] ?? positions[1]!
  return {
    transform: `translate3d(${p.x}px, 0, ${p.z}px) rotateY(${p.rot}deg)`,
  }
}

function positionClass(i: number): string {
  if (normalized.value.length === 1) return 'sl-stress__card--hero'
  if (normalized.value.length === 2) {
    return i === 0 ? 'sl-stress__card--left' : 'sl-stress__card--right'
  }
  return ['sl-stress__card--left', 'sl-stress__card--hero', 'sl-stress__card--right'][i] ?? ''
}

// Camera animation duration. The single pan (Subprime → COVID → Bolha)
// reads naturally in ~7s; longer feels slow.
const camDurationMs = 7000
</script>

<style scoped>
.sl-stress {
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.sl-stress__kicker {
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}

.sl-stress__title {
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: #fff;
  margin: 0;
  max-width: 720px;
}

.sl-stress__title-italic {
  font-style: italic;
  background: linear-gradient(180deg, #fff 0%, color-mix(in srgb, var(--brand-primary, #f5a623) 70%, #fff) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ============ 3D Stage ============ */
.sl-stress__stage {
  position: relative;
  width: 100%;
  height: clamp(360px, 50vh, 460px);
  perspective: 1500px;
  perspective-origin: 50% 45%;
  margin: 8px 0 4px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
}

/* The rig holds all cards in 3D space. The camera move is just a
   single keyframe animation on the rig itself. */
.sl-stress__rig {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: sl-stress-camera var(--cam-duration, 9000ms) cubic-bezier(0.65, 0, 0.35, 1) 400ms both;
}

@keyframes sl-stress-camera {
  /* 0%: open already framed on Subprime (left card). Rig is pushed
     right so the left card sits centre, with a slight yaw so we see
     into its face. */
  0%   { transform: translate3d(440px, 0, 60px) rotateY(-14deg); }
  /* 50%: dolly across to COVID, face-on. */
  50%  { transform: translate3d(0, 0, 80px) rotateY(0deg); }
  /* 100%: arrive at Bolha IA on the right, symmetric yaw. */
  100% { transform: translate3d(-440px, 0, 60px) rotateY(14deg); }
}

/* ============ Cards ============ */
.sl-stress__card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(280px, 32vw, 380px);
  height: clamp(320px, 42vh, 420px);
  margin: calc(clamp(320px, 42vh, 420px) / -2) 0 0 calc(clamp(280px, 32vw, 380px) / -2);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%),
    rgba(20, 12, 30, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 22px 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  backdrop-filter: blur(14px);
  overflow: hidden;
  box-shadow:
    0 30px 80px -20px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transform-style: preserve-3d;
}

/* Subtle inner glow tinted by the card severity — built per-card via
   inline --fill-color. */
.sl-stress__card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--card-tint, #f59e0b) 18%, transparent), transparent 60%);
  pointer-events: none;
}

.sl-stress__year {
  position: absolute;
  bottom: -36px;
  right: -10px;
  font-size: clamp(140px, 22vw, 220px);
  font-weight: 200;
  letter-spacing: -0.04em;
  color: rgba(255, 255, 255, 0.04);
  pointer-events: none;
  font-variant-numeric: tabular-nums;
  line-height: 0.85;
  user-select: none;
}

.sl-stress__card-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  z-index: 1;
}

.sl-stress__card-eyebrow {
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
}

.sl-stress__card-name {
  font-size: clamp(20px, 2.5vw, 26px);
  font-weight: 400;
  letter-spacing: -0.01em;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.sl-stress__card-impact {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 6px;
  position: relative;
  z-index: 1;
}

.sl-stress__impact-sign {
  font-size: clamp(40px, 5vw, 56px);
  font-weight: 200;
  color: rgba(255, 255, 255, 0.55);
  line-height: 0.9;
}

.sl-stress__impact-num {
  font-size: clamp(60px, 8vw, 84px);
  font-weight: 200;
  letter-spacing: -0.04em;
  color: #fff;
  line-height: 0.9;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
}

.sl-stress__impact-pct {
  font-size: clamp(28px, 3.6vw, 40px);
  font-weight: 200;
  color: rgba(255, 255, 255, 0.55);
}

.sl-stress__card-bar {
  position: relative;
  z-index: 1;
}

.sl-stress__card-bar-track {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.sl-stress__card-bar-fill {
  height: 100%;
  width: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--fill-color, #f59e0b) 0%, color-mix(in srgb, var(--fill-color, #f59e0b) 55%, transparent) 100%);
  box-shadow: 0 0 14px var(--fill-glow, transparent);
  animation: sl-stress-bar-grow 1400ms cubic-bezier(0.16, 1, 0.3, 1) var(--fill-delay, 0ms) forwards;
}

@keyframes sl-stress-bar-grow {
  to { width: var(--fill-pct, 50%); }
}

.sl-stress__card-note {
  font-size: 12.5px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.62);
  margin: 0;
  flex: 1;
  position: relative;
  z-index: 1;
}

.sl-stress__card-verdict {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  align-self: flex-start;
  position: relative;
  z-index: 1;
}

.sl-stress__verdict-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

/* Bind --card-tint per position so the inner glow matches the severity
   of the data without needing JS for it. We piggy-back on the bar fill
   color which is already set inline. */
.sl-stress__card {
  --card-tint: #f59e0b;
}

/* ============ Floor reflection plane ============ */
.sl-stress__floor {
  position: absolute;
  left: 50%;
  bottom: -20px;
  width: 1400px;
  height: 220px;
  margin-left: -700px;
  background: radial-gradient(ellipse 50% 80% at 50% 0%, color-mix(in srgb, var(--brand-primary, #f5a623) 20%, transparent), transparent 70%);
  transform: rotateX(75deg) translateZ(-180px);
  transform-origin: center top;
  filter: blur(20px);
  opacity: 0.45;
  pointer-events: none;
}

.sl-stress__hint {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
  margin-top: 4px;
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
  .sl-stress__rig {
    animation: none;
    transform: translate3d(0, 0, 0);
  }
  .sl-stress__card-bar-fill {
    animation: none;
    width: var(--fill-pct, 50%);
  }
  .rxh-stagger { opacity: 1; transform: none; animation: none; }
}
</style>
