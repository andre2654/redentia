<script setup lang="ts">
/**
 * AiCursorOverlay
 *
 * Visual da feature "ask anywhere":
 *   - Bolinha amber com "R" no centro, posicionada perto do cursor
 *   - Anel de progresso ao redor que enche em ~2s
 *   - Quando completo, expande pra um card com a pergunta sugerida
 *   - Click ou Enter confirma e leva pro chat com contexto
 *
 * Não decide nada — só renderiza. Toda lógica vive em useAiCursor.
 */

interface Props {
  visible: boolean
  /** viewport coords */
  x: number
  y: number
  /** 0..1 */
  progress: number
  phase: 'idle' | 'loading' | 'ready'
  teaser?: string
  breadcrumb?: string
}

const props = withDefaults(defineProps<Props>(), {
  teaser: '',
  breadcrumb: '',
})

defineEmits<{
  confirm: []
  dismiss: []
}>()

const RADIUS = 22
const STROKE = 2.5
const SIZE = 56
const CIRC = 2 * Math.PI * RADIUS

const dashOffset = computed(() => CIRC * (1 - Math.max(0, Math.min(1, props.progress))))

// Posicionamento: 18px offset do cursor, com flip se chegar perto da borda direita/baixo
const positionStyle = computed(() => {
  if (typeof window === 'undefined') return {}
  const margin = 18
  const bubbleW = props.phase === 'ready' ? 280 : SIZE
  const bubbleH = props.phase === 'ready' ? 140 : SIZE

  let left = props.x + margin
  let top = props.y + margin

  if (left + bubbleW > window.innerWidth - 16) {
    left = props.x - bubbleW - margin
  }
  if (top + bubbleH > window.innerHeight - 16) {
    top = props.y - bubbleH - margin
  }

  return {
    left: `${Math.max(8, left)}px`,
    top: `${Math.max(8, top)}px`,
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="visible"
        class="ai-cursor-root"
        :style="positionStyle"
        role="dialog"
        aria-label="Perguntar à Redentia sobre o que você está vendo"
        @click.stop="$emit('confirm')"
      >
        <div class="ai-cursor-stack">
          <!-- Bolinha + anel -->
          <div class="ai-cursor-orb" :data-phase="phase">
            <svg
              class="ai-cursor-ring"
              :viewBox="`0 0 ${SIZE} ${SIZE}`"
              :width="SIZE"
              :height="SIZE"
              aria-hidden="true"
            >
              <circle
                :cx="SIZE / 2"
                :cy="SIZE / 2"
                :r="RADIUS"
                fill="var(--bg-elevated)"
                stroke="var(--border-subtle)"
                stroke-width="1"
              />
              <circle
                :cx="SIZE / 2"
                :cy="SIZE / 2"
                :r="RADIUS"
                fill="none"
                stroke="var(--brand-primary)"
                :stroke-width="STROKE"
                stroke-linecap="round"
                :stroke-dasharray="CIRC"
                :stroke-dashoffset="dashOffset"
                :transform="`rotate(-90 ${SIZE / 2} ${SIZE / 2})`"
                class="ai-cursor-ring-progress"
              />
            </svg>
            <div class="ai-cursor-logo">
              <span class="ai-cursor-disc">
                <img
                  src="/brand/redentia/dark-logo-icon.png"
                  alt="Redentia"
                  class="ai-cursor-icon"
                  draggable="false"
                >
              </span>
            </div>
          </div>

          <!-- Bubble (após carregar) -->
          <Transition name="bubble">
            <div v-if="phase === 'ready'" class="ai-cursor-bubble" @click.stop="$emit('confirm')">
              <div class="ai-cursor-bubble-rule" aria-hidden="true" />

              <header class="ai-cursor-bubble-head">
                <span class="ai-cursor-bubble-dot" aria-hidden="true" />
                <span class="ai-cursor-bubble-eyebrow">Perguntar à Redentia</span>
              </header>

              <div v-if="breadcrumb" class="ai-cursor-bubble-chip" :title="breadcrumb">
                {{ breadcrumb }}
              </div>

              <p class="ai-cursor-bubble-question">
                {{ teaser || 'Sobre o que você está vendo' }}
              </p>

              <button
                type="button"
                class="ai-cursor-bubble-cta"
                @click.stop="$emit('confirm')"
              >
                <span class="ai-cursor-bubble-cta-kbd">
                  <span class="ai-cursor-bubble-kbd">Enter</span>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path
                      d="M9 2v3.2a1.5 1.5 0 0 1-1.5 1.5H2.5M5 4 2 6.7 5 9.5"
                      stroke="currentColor"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span class="ai-cursor-bubble-cta-label">perguntar no chat</span>
                <svg class="ai-cursor-bubble-cta-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>

              <div class="ai-cursor-bubble-foot">
                <kbd class="ai-cursor-bubble-kbd-mini">Esc</kbd>
                <span>fechar</span>
                <span class="ai-cursor-bubble-foot-spacer" />
                <span class="ai-cursor-bubble-foot-brand">redent<span style="color: var(--brand-primary)">.</span>ia</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ai-cursor-root {
  position: fixed;
  z-index: 9999;
  pointer-events: auto;
  font-family: var(--brand-font), sans-serif;
}

.ai-cursor-stack {
  position: relative;
  display: inline-block;
}

.ai-cursor-orb {
  position: relative;
  width: 56px;
  height: 56px;
  cursor: pointer;
  transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.18))
    drop-shadow(0 0 24px color-mix(in srgb, var(--brand-primary) 22%, transparent));
}

.ai-cursor-orb:hover {
  transform: scale(1.06);
}

.ai-cursor-orb[data-phase='ready'] {
  transform: scale(1.04);
}

.ai-cursor-ring {
  display: block;
}

.ai-cursor-ring-progress {
  transition: stroke-dashoffset 60ms linear;
}

.ai-cursor-logo {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-cursor-disc {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  background: var(--brand-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}

.ai-cursor-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

.ai-cursor-bubble {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: 320px;
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 8%, var(--border-subtle));
  border-radius: 12px;
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  box-shadow:
    0 20px 60px -16px rgba(0, 0, 0, 0.5),
    0 40px 80px -40px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 4%, transparent);
  cursor: pointer;
  user-select: none;
  overflow: hidden;
}

.ai-cursor-bubble-rule {
  position: absolute;
  top: 0;
  left: 18px;
  right: 18px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--brand-primary) 60%, transparent) 35%,
    color-mix(in srgb, var(--brand-primary) 60%, transparent) 65%,
    transparent
  );
}

/* head */
.ai-cursor-bubble-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px 8px;
}
.ai-cursor-bubble-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--brand-primary);
  box-shadow: 0 0 8px color-mix(in srgb, var(--brand-primary) 80%, transparent);
  flex-shrink: 0;
}
.ai-cursor-bubble-eyebrow {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
  font-weight: 500;
}

/* breadcrumb chip */
.ai-cursor-bubble-chip {
  margin: 0 16px 10px;
  padding: 5px 10px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-feature-settings: 'tnum';
}

/* main question */
.ai-cursor-bubble-question {
  margin: 0 16px 14px;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}

/* primary CTA */
.ai-cursor-bubble-cta {
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - 16px);
  margin: 0 8px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  border-radius: 8px;
  color: var(--brand-primary);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 150ms ease-out, border-color 150ms ease-out, filter 150ms ease-out;
}
.ai-cursor-bubble-cta:hover {
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  filter: brightness(1.05);
}
.ai-cursor-bubble-cta-kbd {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.ai-cursor-bubble-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 6px;
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 40%, transparent);
  border-radius: 5px;
  color: var(--brand-primary);
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.ai-cursor-bubble-cta-label {
  flex: 1;
  letter-spacing: -0.005em;
}
.ai-cursor-bubble-cta-arrow {
  flex-shrink: 0;
  color: currentColor;
  opacity: 0.7;
  transition: transform 200ms ease-out, opacity 200ms ease-out;
}
.ai-cursor-bubble-cta:hover .ai-cursor-bubble-cta-arrow {
  transform: translateX(2px);
  opacity: 1;
}

/* foot */
.ai-cursor-bubble-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px 11px;
  margin-top: 10px;
  border-top: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--bg-base) 30%, transparent);
  font-size: 10px;
  color: var(--text-muted);
}
.ai-cursor-bubble-kbd-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 18px;
  padding: 0 5px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-body);
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 10px;
  letter-spacing: 0.02em;
}
.ai-cursor-bubble-foot-spacer {
  flex: 1;
}
.ai-cursor-bubble-foot-brand {
  font-size: 10px;
  font-weight: 300;
  letter-spacing: -0.01em;
  color: var(--text-muted);
}

/* Transitions */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.bubble-enter-active,
.bubble-leave-active {
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .overlay-enter-active,
  .overlay-leave-active,
  .bubble-enter-active,
  .bubble-leave-active,
  .ai-cursor-orb,
  .ai-cursor-ring-progress {
    transition: none;
  }
}
</style>
