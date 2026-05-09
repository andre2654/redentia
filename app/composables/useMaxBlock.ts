/**
 * useMaxBlock — estado global do bloqueio diario do tier MAX.
 *
 * Disparado quando o backend emite o SSE event `max.blocked` (vide
 * `chat-service/src/llm/agent.ts` apos count >= limit no /help).
 *
 * State:
 *   - isBlocked: boolean — true se ainda nao chegou o resetAt
 *   - resetAt: Date | null — quando o cap diario reseta
 *   - usedAndLimit: { used, limit } | null — pra mostrar no modal
 *   - timeRemaining: string — countdown formatado HH:MM:SS
 *
 * Persistencia: localStorage com key `redentia:max-block` pra que
 * F5 nao "destrave" o user (ele ainda esta bloqueado server-side
 * — qualquer tentativa de mandar MAX volta o evento).
 *
 * Auto-clear: quando timeRemaining hits 0, isBlocked vira false.
 *
 * Modal global: o componente <MoleculesMaxBlockedModal /> consome
 * essa store e abre/fecha automaticamente.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface BlockState {
  resetAt: string  // ISO
  used: number
  limit: number
  planSlug: string | null
}

const STORAGE_KEY = 'redentia:max-block'
const VERSION_KEY = 'redentia:max-block:v'
// Bump quando o shape do payload ou a logica de resetAt mudar, pra
// que clientes com state antigo sejam forcados a reset (em vez de
// arrastar valor invalido). v2: resetAt agora e midnight BRT em vez
// de UTC.
const CURRENT_VERSION = '2'

// State global no escopo de modulo (igual useAlerts) — todas as
// surfaces (Input, Modal, etc) compartilham a mesma referencia.
const _state = ref<BlockState | null>(null)
const _now = ref<number>(Date.now())
const _modalOpen = ref(false)
let _ticker: ReturnType<typeof setInterval> | null = null
let _hydrated = false

function loadFromStorage(): BlockState | null {
  if (typeof window === 'undefined') return null
  try {
    // Migracao de versao — se o cliente tem state escrito por uma
    // versao anterior do codigo (ex: resetAt em UTC midnight em vez
    // de BRT), descarta. Backend re-emite com timestamp correto.
    const storedVersion = localStorage.getItem(VERSION_KEY)
    if (storedVersion !== CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      return null
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BlockState
    if (!parsed.resetAt) return null
    const resetMs = new Date(parsed.resetAt).getTime()
    const nowMs = Date.now()
    // Expirou? remove.
    if (resetMs <= nowMs) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    // Stale check: cap diario nunca tem resetAt > 25h. Se aparece (state
    // migrou de codigo antigo que usava UTC midnight em vez de BRT,
    // gerando ~21h+ pra reset), descarta. Backend re-emite o evento com
    // timestamp correto na proxima tentativa de MAX.
    const MAX_RESET_AHEAD_MS = 25 * 60 * 60 * 1000
    if (resetMs - nowMs > MAX_RESET_AHEAD_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch { return null }
}

function saveToStorage(s: BlockState | null): void {
  if (typeof window === 'undefined') return
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* silent */ }
}

function ensureTicker(): void {
  if (_ticker) return
  _ticker = setInterval(() => { _now.value = Date.now() }, 1000)
}

function stopTicker(): void {
  if (_ticker) { clearInterval(_ticker); _ticker = null }
}

export function useMaxBlock() {
  // Hidrata do localStorage so na 1a chamada por sessao (client-side).
  if (!_hydrated && typeof window !== 'undefined') {
    _hydrated = true
    const stored = loadFromStorage()
    if (stored) _state.value = stored
  }

  const resetAt = computed<Date | null>(() => _state.value ? new Date(_state.value.resetAt) : null)

  const isBlocked = computed<boolean>(() => {
    if (!_state.value) return false
    return new Date(_state.value.resetAt).getTime() > _now.value
  })

  const usedAndLimit = computed(() => _state.value
    ? { used: _state.value.used, limit: _state.value.limit, planSlug: _state.value.planSlug }
    : null,
  )

  const timeRemaining = computed<string>(() => {
    if (!_state.value) return '00:00:00'
    const ms = new Date(_state.value.resetAt).getTime() - _now.value
    if (ms <= 0) return '00:00:00'
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return [h, m, s].map(n => n.toString().padStart(2, '0')).join(':')
  })

  /**
   * Disparado pelo SSE handler em useChatStream quando o evento
   * `max.blocked` chega. Persiste no localStorage e abre o modal.
   */
  function applyBlock(payload: { used: number; limit: number; resetAt: string; planSlug: string | null }): void {
    _state.value = {
      used: payload.used,
      limit: payload.limit,
      resetAt: payload.resetAt,
      planSlug: payload.planSlug,
    }
    saveToStorage(_state.value)
    _modalOpen.value = true
    ensureTicker()
  }

  function clearBlock(): void {
    _state.value = null
    saveToStorage(null)
    _modalOpen.value = false
  }

  function openModal(): void { _modalOpen.value = true }
  function closeModal(): void { _modalOpen.value = false }

  return {
    isBlocked,
    resetAt,
    timeRemaining,
    usedAndLimit,
    modalOpen: _modalOpen,
    applyBlock,
    clearBlock,
    openModal,
    closeModal,
    ensureTicker,
    stopTicker,
  }
}

/**
 * Lifecycle helper — chamado uma vez na app pra que o ticker rode
 * enquanto qualquer surface estiver ativa. Tambem limpa o estado
 * automaticamente quando timeRemaining hits 0 (auto-unlock UX).
 */
export function setupMaxBlockLifecycle(): void {
  const inbox = useMaxBlock()
  onMounted(() => {
    inbox.ensureTicker()
  })
  onBeforeUnmount(() => {
    inbox.stopTicker()
  })
}
