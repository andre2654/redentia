<!--
  ModalManager — orquestrador de modais e enquetes (type=modal e
  type=poll com placement=modal). Carrega o primeiro ativo, exibe
  como overlay, e marca dismissed quando fecha.

  Frequency: 1× por session. Sessão é resetada quando o user fecha
  o browser/aba (sessionStorage).

  Para enquetes, mostra opções clicáveis e revela resultados se
  poll_results_visible=true.
-->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modal && !sessionDismissed.has(modal.id)"
        class="modal-backdrop"
        @click.self="onClose"
      >
        <div
          class="modal-card"
          :class="`modal-card--${modal.modal_size || 'md'}`"
          role="dialog"
          aria-modal="true"
        >
          <button
            v-if="modal.dismissible"
            type="button"
            class="modal-card__close"
            aria-label="Fechar"
            @click="onClose"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>

          <img
            v-if="modal.image_url"
            :src="modal.image_url"
            :alt="modal.title"
            class="modal-card__image"
            loading="lazy"
          >

          <div class="modal-card__inner">
            <header class="modal-card__head">
              <UIcon
                v-if="modal.icon"
                :name="modal.icon"
                class="size-6 shrink-0"
                :style="{ color: 'var(--brand-primary)' }"
                aria-hidden="true"
              />
              <h2 class="modal-card__title">{{ modal.title }}</h2>
            </header>

            <p v-if="modal.body" class="modal-card__body">{{ modal.body }}</p>

            <!-- Poll options -->
            <div v-if="modal.type === 'poll' && !voted" class="modal-card__poll">
              <button
                v-for="opt in modal.poll_options || []"
                :key="opt.id"
                type="button"
                class="modal-card__poll-opt"
                :class="{ 'modal-card__poll-opt--selected': selectedOptions.has(opt.id) }"
                @click="toggleOption(opt.id)"
              >
                <span
                  class="modal-card__poll-check"
                  :style="{ borderColor: opt.color || 'var(--brand-primary)' }"
                >
                  <UIcon
                    v-if="selectedOptions.has(opt.id)"
                    name="i-lucide-check"
                    class="size-3"
                    :style="{ color: opt.color || 'var(--brand-primary)' }"
                  />
                </span>
                <span>{{ opt.label }}</span>
              </button>
              <button
                type="button"
                class="modal-card__action"
                :disabled="!selectedOptions.size || submitting"
                @click="submitVote"
              >
                <UIcon
                  :name="submitting ? 'i-lucide-loader-2' : 'i-lucide-check'"
                  :class="['size-4', submitting && 'motion-safe:animate-spin']"
                />
                {{ submitting ? 'Enviando...' : 'Votar' }}
              </button>
            </div>

            <!-- Poll results (após voto, se visible) -->
            <div v-else-if="modal.type === 'poll' && voted && pollResults" class="modal-card__results">
              <span class="modal-card__results-label">Resultados</span>
              <div
                v-for="opt in modal.poll_options || []"
                :key="opt.id"
                class="modal-card__result-row"
              >
                <span class="modal-card__result-label">{{ opt.label }}</span>
                <span class="modal-card__result-bar">
                  <span
                    class="modal-card__result-fill"
                    :style="{
                      width: resultPct(opt.id) + '%',
                      background: opt.color || 'var(--brand-primary)',
                    }"
                  />
                </span>
                <span class="modal-card__result-pct">{{ resultPct(opt.id).toFixed(0) }}%</span>
              </div>
            </div>

            <!-- Link CTA (para modal normal) -->
            <a
              v-if="modal.type === 'modal' && modal.link_url"
              :href="modal.link_url"
              class="modal-card__action"
              target="_blank"
              rel="noopener"
              @click="onClick"
            >
              <UIcon name="i-lucide-sparkles" class="size-4" />
              {{ modal.link_label || 'Ir agora' }}
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { CommunicationPublic } from '~/services/communications'

const SESSION_KEY = 'redentia.modal_dismissed'

const service = useCommunicationsService()
const modal = ref<CommunicationPublic | null>(null)
const sessionDismissed = ref<Set<number>>(new Set())
const selectedOptions = ref<Set<string>>(new Set())
const voted = ref(false)
const submitting = ref(false)
const pollResults = ref<Record<string, number> | null>(null)

// Carrega dismissed da session (1× por session)
function loadSessionDismissed() {
  if (typeof sessionStorage === 'undefined') return
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) sessionDismissed.value = new Set(JSON.parse(raw))
  } catch {
    /* invalid JSON, ignore */
  }
}

function persistSessionDismissed() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...sessionDismissed.value]))
  } catch {
    /* quota / disabled, ignore */
  }
}

async function load() {
  loadSessionDismissed()
  try {
    const items = await service.listActive('modal')
    // Prioridade pra modal/poll que ainda nao foi visto na session
    const candidate = items.find(
      (c) => (c.type === 'modal' || c.type === 'poll')
        && !sessionDismissed.value.has(c.id),
    )
    modal.value = candidate ?? null
    if (modal.value) {
      void service.markSeen(modal.value.id)
      // Se ja votou, refleta no estado
      if (modal.value.user_state?.voted) {
        voted.value = true
        if (modal.value.poll_results) pollResults.value = modal.value.poll_results
      }
    }
  } catch (e) {
    console.warn('[ModalManager] load failed', e)
  }
}

function toggleOption(id: string) {
  if (!modal.value) return
  if (modal.value.poll_multi_choice) {
    if (selectedOptions.value.has(id)) selectedOptions.value.delete(id)
    else selectedOptions.value.add(id)
  } else {
    selectedOptions.value = new Set([id])
  }
}

async function submitVote() {
  if (!modal.value || !selectedOptions.value.size) return
  submitting.value = true
  try {
    const resp = await service.vote(modal.value.id, [...selectedOptions.value])
    voted.value = true
    if (resp.results) pollResults.value = resp.results
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.error || 'Falha ao votar')
  } finally {
    submitting.value = false
  }
}

async function onClick() {
  if (!modal.value) return
  await service.markClicked(modal.value.id)
}

async function onClose() {
  if (!modal.value) return
  const id = modal.value.id
  sessionDismissed.value.add(id)
  persistSessionDismissed()
  modal.value = null
  await service.markDismissed(id)
}

function resultPct(optionId: string): number {
  if (!pollResults.value) return 0
  const total = Object.values(pollResults.value).reduce((s, v) => s + v, 0)
  if (!total) return 0
  return ((pollResults.value[optionId] || 0) / total) * 100
}

onMounted(() => load())
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  position: relative;
  width: 100%;
  border-radius: 18px;
  background: color-mix(in srgb, var(--brand-surface) 95%, var(--brand-background));
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  box-shadow: 0 24px 50px -10px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-card--sm { max-width: 380px; }
.modal-card--md { max-width: 520px; }
.modal-card--lg { max-width: 720px; }

.modal-card__close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  border: 0;
  color: var(--brand-text);
  cursor: pointer;
  z-index: 1;
}
.modal-card__close:hover {
  background: color-mix(in srgb, var(--brand-text) 14%, transparent);
}

.modal-card__image {
  width: 100%;
  height: auto;
  display: block;
  max-height: 240px;
  object-fit: cover;
}

.modal-card__inner {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-card__title {
  margin: 0;
  font-family: var(--brand-font);
  font-weight: 400;
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.018em;
  color: var(--brand-text);
}

.modal-card__body {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  white-space: pre-line;
}

.modal-card__poll {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-card__poll-opt {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 11px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--brand-text);
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
}

.modal-card__poll-opt:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}

.modal-card__poll-opt--selected {
  border-color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}

.modal-card__poll-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid;
  flex-shrink: 0;
}

.modal-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  align-self: flex-start;
  padding: 11px 18px;
  border-radius: 12px;
  background: var(--brand-primary);
  color: var(--text-on-primary, var(--brand-background, #fff));
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  border: 0;
  cursor: pointer;
  transition: filter 150ms, transform 120ms;
  margin-top: 6px;
}

.modal-card__action:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.modal-card__action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.modal-card__results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-card__results-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.modal-card__result-row {
  display: grid;
  grid-template-columns: 1fr 100px 40px;
  align-items: center;
  gap: 10px;
}

.modal-card__result-label {
  font-size: 12.5px;
  color: var(--brand-text);
}

.modal-card__result-bar {
  display: block;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
}

.modal-card__result-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-card__result-pct {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  color: var(--brand-text);
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 220ms;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: translateY(20px) scale(0.97);
}
</style>
