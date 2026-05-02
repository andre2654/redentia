<!--
  MoleculesRaioXSimulationModal — disclaimer/onboarding modal that appears
  AFTER the user picks tickers in the asset picker but BEFORE we navigate
  them into the demo diagnostic.

  Why have it:
    - Sets expectation that the on-screen result is a SIMULATION (just the
      tickers, no weights/quantities/profile), not the real Raio-X.
    - Pitches the signup → real Raio-X with the actual portfolio + live
      monitoring + alerts. This is the highest-intent moment of the funnel
      because the user just expressed which assets they own.
    - Replays the explainer video here so the value prop is visible
      without scrolling back up.

  Two CTAs:
    - PRIMARY → "Cadastrar grátis e ver Raio-X real" (registers).
    - SECONDARY → "Continuar para o demo" (navigate emit, no signup).
  Order is intentional: most users will click "continuar" because the
  friction to register is real, but registering during peak intent is a
  meaningful conversion lift, so we put it first visually.
-->
<script setup lang="ts">
const props = defineProps<{
  open: boolean
  /** Tickers selected by the user — shown in the modal as "N ativos" preview. */
  tickers: string[]
}>()

const emit = defineEmits<{
  /** User accepted the demo disclaimer; parent should navigate now. */
  confirm: []
  /** User dismissed the modal. */
  close: []
}>()

const videoSrc = '/assets/videos/raio-x.mp4'

function close() {
  emit('close')
}

function confirm() {
  emit('confirm')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

// Body scroll lock while open.
watch(() => props.open, (next) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = next ? 'hidden' : ''
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="raio-x-modal">
      <div
        v-if="open"
        class="raio-x-sim"
        role="dialog"
        aria-modal="true"
        aria-labelledby="raio-x-sim-title"
        @keydown="onKeydown"
      >
        <button class="raio-x-sim__backdrop" tabindex="-1" aria-label="Fechar" @click="close" />

        <div class="raio-x-sim__dialog">
          <button class="raio-x-sim__close" aria-label="Fechar modal" @click="close">
            <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
          </button>

          <!-- Video at the top — same explainer reused from the page hero. -->
          <div class="raio-x-sim__video-wrapper">
            <video
              class="raio-x-sim__video"
              :src="videoSrc"
              autoplay
              muted
              loop
              playsinline
              preload="metadata"
              aria-label="Apresentacao em video do Raio-X"
            />
            <span class="raio-x-sim__video-badge" aria-hidden="true">
              <span class="raio-x-sim__video-badge-dot" />
              Demo
            </span>
          </div>

          <div class="raio-x-sim__body">
            <p class="raio-x-sim__eyebrow">VOCÊ VAI VER UMA SIMULAÇÃO</p>
            <h2 id="raio-x-sim-title" class="raio-x-sim__title">
              Antes de continuar, dois minutos.
            </h2>

            <p class="raio-x-sim__intro">
              O que vem a seguir é uma <strong>prévia gratuita</strong> da Redent.IA usando apenas
              os {{ tickers.length }} {{ tickers.length === 1 ? 'ticker' : 'tickers' }} que você selecionou.
              É o suficiente pra mostrar o tipo de análise que entregamos, mas o Raio-X de verdade
              precisa da sua carteira real.
            </p>

            <ul class="raio-x-sim__compare">
              <li class="raio-x-sim__compare-row raio-x-sim__compare-row--demo">
                <span class="raio-x-sim__compare-label">DEMO (agora)</span>
                <ul class="raio-x-sim__compare-items">
                  <li>
                    <UIcon name="i-lucide-check" class="size-3.5" aria-hidden="true" />
                    Score 0–100 com base nos seus tickers
                  </li>
                  <li>
                    <UIcon name="i-lucide-check" class="size-3.5" aria-hidden="true" />
                    Pontos fortes, riscos e eventos
                  </li>
                  <li>
                    <UIcon name="i-lucide-x" class="size-3.5 raio-x-sim__compare-x" aria-hidden="true" />
                    Sem pesos, quantidades ou seu perfil
                  </li>
                  <li>
                    <UIcon name="i-lucide-x" class="size-3.5 raio-x-sim__compare-x" aria-hidden="true" />
                    Snapshot único, sem monitoramento
                  </li>
                </ul>
              </li>
              <li class="raio-x-sim__compare-row raio-x-sim__compare-row--real">
                <span class="raio-x-sim__compare-label">RAIO-X REAL (com cadastro)</span>
                <ul class="raio-x-sim__compare-items">
                  <li>
                    <UIcon name="i-lucide-check" class="size-3.5" aria-hidden="true" />
                    Sua carteira completa com pesos e custos
                  </li>
                  <li>
                    <UIcon name="i-lucide-check" class="size-3.5" aria-hidden="true" />
                    Dados atualizados automaticamente
                  </li>
                  <li>
                    <UIcon name="i-lucide-check" class="size-3.5" aria-hidden="true" />
                    Alertas e plano de ação contínuos
                  </li>
                  <li>
                    <UIcon name="i-lucide-check" class="size-3.5" aria-hidden="true" />
                    Histórico semanal e dividendos esperados
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <footer class="raio-x-sim__footer">
            <NuxtLink to="/auth/register" class="raio-x-sim__btn-primary quiet-btn-primary">
              <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
              <span>Cadastrar grátis e ver Raio-X real</span>
            </NuxtLink>
            <button type="button" class="raio-x-sim__btn-secondary" @click="confirm">
              <span>Continuar para o demo</span>
              <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.raio-x-sim {
  position: fixed;
  inset: 0;
  z-index: 9100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

@media (min-width: 768px) {
  .raio-x-sim {
    padding: 40px 24px;
  }
}

.raio-x-sim__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--bg-base) 65%, rgba(0, 0, 0, 0.55));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 0;
  cursor: pointer;
}

.raio-x-sim__dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 560px;
  height: 100dvh;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  box-shadow:
    0 32px 80px -24px color-mix(in srgb, var(--brand-primary) 26%, transparent),
    0 16px 40px -12px rgba(0, 0, 0, 0.32);
  overflow-y: auto;
}

@media (min-width: 768px) {
  .raio-x-sim__dialog {
    height: auto;
    max-height: calc(100dvh - 80px);
    border-radius: 18px;
  }
}

.raio-x-sim__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  backdrop-filter: blur(8px);
  cursor: pointer;
  color: var(--text-heading);
  transition: background 150ms, border-color 150ms;
}

.raio-x-sim__close:hover {
  background: var(--bg-overlay);
  border-color: var(--border-default);
}

/* Video — full bleed at the top of the modal */
.raio-x-sim__video-wrapper {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-base);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.raio-x-sim__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.raio-x-sim__video-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-subtle);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-heading);
}

.raio-x-sim__video-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand-primary);
  animation: raio-x-sim-pulse 2.4s ease-in-out infinite;
}

@keyframes raio-x-sim-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.85); }
}

/* Body */
.raio-x-sim__body {
  padding: 24px 22px 8px;
  flex: 1;
}

@media (min-width: 768px) {
  .raio-x-sim__body {
    padding: 28px 28px 10px;
  }
}

.raio-x-sim__eyebrow {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin-bottom: 8px;
}

.raio-x-sim__title {
  font-size: 24px;
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin-bottom: 12px;
}

@media (min-width: 768px) {
  .raio-x-sim__title {
    font-size: 28px;
  }
}

.raio-x-sim__intro {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-body);
  margin-bottom: 18px;
}

.raio-x-sim__intro strong {
  color: var(--text-heading);
  font-weight: 600;
}

/* Compare table — demo vs real side by side (stacks on mobile) */
.raio-x-sim__compare {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

@media (min-width: 560px) {
  .raio-x-sim__compare {
    grid-template-columns: 1fr 1fr;
  }
}

.raio-x-sim__compare-row {
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.raio-x-sim__compare-row--real {
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 5%, var(--bg-elevated));
  box-shadow: 0 4px 14px -8px color-mix(in srgb, var(--brand-primary) 20%, transparent);
}

.raio-x-sim__compare-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.raio-x-sim__compare-row--real .raio-x-sim__compare-label {
  color: var(--brand-primary);
}

.raio-x-sim__compare-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.raio-x-sim__compare-items li {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-body);
}

.raio-x-sim__compare-items li :first-child {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--brand-primary);
}

.raio-x-sim__compare-x {
  color: var(--text-muted) !important;
  opacity: 0.6;
}

/* Footer */
.raio-x-sim__footer {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 22px 22px;
  background: linear-gradient(180deg, transparent 0%, var(--bg-elevated) 30%);
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .raio-x-sim__footer {
    padding: 20px 28px 28px;
  }
}

.raio-x-sim__btn-primary,
.raio-x-sim__btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 150ms, transform 120ms, background 150ms;
}

.raio-x-sim__btn-primary {
  text-decoration: none;
}

.raio-x-sim__btn-secondary {
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-heading);
  font-family: var(--brand-font);
}

.raio-x-sim__btn-secondary:hover {
  background: var(--bg-overlay);
  border-color: var(--border-default);
}

/* Transitions */
.raio-x-modal-enter-active,
.raio-x-modal-leave-active {
  transition: opacity 220ms ease;
}
.raio-x-modal-enter-active .raio-x-sim__dialog,
.raio-x-modal-leave-active .raio-x-sim__dialog {
  transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.raio-x-modal-enter-from,
.raio-x-modal-leave-to {
  opacity: 0;
}
.raio-x-modal-enter-from .raio-x-sim__dialog,
.raio-x-modal-leave-to .raio-x-sim__dialog {
  transform: translateY(20px);
}

@media (prefers-reduced-motion: reduce) {
  .raio-x-modal-enter-active,
  .raio-x-modal-leave-active,
  .raio-x-modal-enter-active .raio-x-sim__dialog,
  .raio-x-modal-leave-active .raio-x-sim__dialog {
    transition: none;
  }
  .raio-x-sim__video-badge-dot {
    animation: none;
  }
}
</style>
