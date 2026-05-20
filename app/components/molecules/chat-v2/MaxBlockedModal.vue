<!--
  MaxBlockedModal — modal global que abre quando o backend emite
  `max.blocked` (count diario de tier=max >= limite do plano).
  Mount unico em /help, controlado pela store `useMaxBlock`.

  Mostra:
   - Quantas analises foram usadas (used/limit)
   - Countdown HH:MM:SS ate o reset (00:00 UTC)
   - Acoes: continuar no Basic, ou upgrade pra Max (link /pricing)
-->
<template>
  <Teleport to="body">
    <Transition name="max-modal">
      <div
        v-if="open"
        class="max-modal__backdrop"
        @click.self="onClose"
        @keydown.esc="onClose"
      >
        <div class="max-modal__panel" role="dialog" aria-modal="true" aria-labelledby="max-modal-title">
          <button
            type="button"
            class="max-modal__close"
            aria-label="Fechar"
            @click="onClose"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>

          <div class="max-modal__icon" aria-hidden="true">
            <UIcon name="i-lucide-clock-alert" class="size-7" />
          </div>

          <span class="max-modal__eyebrow">Limite diário atingido</span>
          <h2 id="max-modal-title" class="max-modal__title">
            Você usou todas as <em>{{ stats?.limit ?? '—' }}</em> análises MAX de hoje.
          </h2>
          <p class="max-modal__lead">
            O contador reseta à meia-noite ({{ resetAtLocal }}). Enquanto isso, o tier Basic continua liberado
            <span v-if="stats?.planSlug === 'pro'">— ou faça upgrade pra Max e tenha análises ilimitadas.</span>
          </p>

          <div class="max-modal__timer" :title="resetAtLocal">
            <UIcon name="i-lucide-timer" class="size-4" />
            <span class="max-modal__timer-label">Mais MAX em</span>
            <span class="max-modal__timer-value">{{ timeRemaining }}</span>
          </div>

          <div class="max-modal__actions">
            <button
              type="button"
              class="max-modal__btn max-modal__btn--ghost"
              @click="onClose"
            >
              <UIcon name="i-lucide-zap" class="size-4" />
              Continuar no Basic
            </button>
            <NuxtLink
              v-if="stats?.planSlug === 'pro'"
              to="/pricing?from=max-blocked"
              class="max-modal__btn max-modal__btn--primary"
              @click="onClose"
            >
              <UIcon name="i-lucide-sparkles" class="size-4" />
              Upgrade pra Max
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const block = useMaxBlock()

const open = block.modalOpen
const stats = block.usedAndLimit
const timeRemaining = block.timeRemaining

const resetAtLocal = computed(() => {
  const r = block.resetAt.value
  if (!r) return ''
  // Mostra hora local ("00:00") quando reset cai em algum momento <24h.
  // Pra reset distante (ex: vindo de plano sem cap), mostra data+hora.
  const isToday = r.toDateString() === new Date().toDateString()
  const isTomorrow = r.toDateString() === new Date(Date.now() + 86400_000).toDateString()
  if (isToday || isTomorrow) {
    return r.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  return r.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
})

function onClose() {
  block.closeModal()
}
</script>

<style scoped>
.max-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}

.max-modal__panel {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 32px 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  border-radius: 18px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  box-shadow:
    0 30px 80px -20px var(--shadow-ambient),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 8%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--brand-primary) 8%, transparent);
}

.max-modal__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms, color 150ms;
}
.max-modal__close:hover {
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text);
}

.max-modal__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  margin-bottom: 4px;
}

.max-modal__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.max-modal__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.018em;
  color: var(--brand-text);
  max-width: 360px;
}
.max-modal__title em {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}

.max-modal__lead {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  max-width: 360px;
}
.max-modal__lead strong {
  color: var(--brand-text);
  font-weight: 600;
}

.max-modal__timer {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  color: var(--brand-text);
}
.max-modal__timer-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}
.max-modal__timer-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  color: var(--brand-primary);
}

.max-modal__actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.max-modal__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 999px;
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: filter 150ms, transform 100ms, background 150ms, border-color 150ms;
  text-decoration: none;
}
.max-modal__btn:active {
  transform: scale(0.98);
}
.max-modal__btn--primary {
  background: var(--brand-primary);
  color: var(--text-on-primary);
  box-shadow: 0 14px 32px -16px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.max-modal__btn--primary:hover {
  filter: brightness(0.94);
}
.max-modal__btn--ghost {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: var(--brand-text);
  border-color: color-mix(in srgb, var(--brand-text) 12%, transparent);
}
.max-modal__btn--ghost:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 28%, transparent);
}

/* Transitions */
.max-modal-enter-active { transition: opacity 200ms ease; }
.max-modal-leave-active { transition: opacity 150ms ease; }
.max-modal-enter-active .max-modal__panel,
.max-modal-leave-active .max-modal__panel {
  transition: transform 240ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.max-modal-enter-from,
.max-modal-leave-to { opacity: 0; }
.max-modal-enter-from .max-modal__panel { transform: translateY(20px) scale(0.96); }
.max-modal-leave-to .max-modal__panel { transform: translateY(8px) scale(0.98); }
</style>
