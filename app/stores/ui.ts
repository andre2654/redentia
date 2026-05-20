/**
 * ui store — estado de UI EFÊMERO (não persistido).
 *
 * Centraliza modais abertos (Pluggy widget, upgrade, lead capture),
 * toasts custom e estado da sidebar. Distinta da `interface` store
 * que cuida de preferências PERSISTIDAS (revealAmount, install banner).
 *
 * Não substitui:
 *   - `useInterfaceStore` (preferências de display que sobrevivem ao
 *     refresh — revealAmount, hideInstallBanner). Continua intacta.
 *   - `useUpgradeModal` (singleton via useState — funciona em paralelo
 *     pra não quebrar callers existentes). Esta store oferece um
 *     ponto único pra orquestrar QUALQUER modal global. Quando a
 *     migração rolar, useUpgradeModal pode delegar pra cá.
 *   - `useNotify` (showSuccessNotification/etc usa @nuxt/ui useToast).
 *     A store oferece um canal paralelo pra toasts custom com TTL
 *     próprio e referência via id (ex: progress toast de sync Pluggy).
 *
 * Quando usar STORE vs COMPOSABLE:
 *   - Use a STORE (`useUiStore`) quando precisar de um único estado
 *     compartilhado entre múltiplos componentes (ex: hamburger no
 *     header abre sidebar, page principal observa `sidebarOpen` pra
 *     ajustar margem). Modais globais (1 modal por vez) também.
 *   - Use `useNotify` pros toasts que vão pro @nuxt/ui — eles já têm
 *     a estilização tematizada da marca. A fila de toasts aqui é pra
 *     casos custom (status persistente, sync em andamento, etc).
 */

/**
 * Catálogo de modais globais. Adicione novos aqui conforme a UI cresce
 * pra ter um único enum compartilhado e evitar strings mágicas.
 */
export type GlobalModalName =
  | 'pluggy'
  | 'upgrade'
  | 'phoneGate'
  | 'onboardingName'
  | 'reportProblem'
  | 'leadCapture'

export interface ModalState {
  name: GlobalModalName
  /** Payload opcional pro modal (varia por tipo). */
  payload?: Record<string, unknown>
}

export interface UiToast {
  /** UUID gerado client-side. */
  id: string
  kind: 'success' | 'error' | 'info' | 'progress'
  title: string
  description?: string
  /** ms até auto-fechar. null = manual close (ex: progress). */
  duration: number | null
  /** Timestamp de criação (ms). */
  createdAt: number
}

export const useUiStore = defineStore('ui', () => {
  // ============================================================
  // STATE
  // ============================================================
  /**
   * Modal global atualmente aberto. null = nenhum.
   * Política: 1 modal por vez. Abrir um novo fecha o anterior.
   */
  const currentModal = ref<ModalState | null>(null)

  /** Sidebar (drawer mobile + nav lateral desktop) aberta? */
  const sidebarOpen = ref(false)

  /** Fila de toasts custom (paralela ao @nuxt/ui useToast). */
  const toasts = ref<UiToast[]>([])

  /**
   * Estado bruto pra "fora-do-fluxo" tipo command palette / quick search.
   * Útil pra que um shortcut Cmd+K em qualquer page possa abrir o mesmo
   * componente que vive no layout.
   */
  const commandPaletteOpen = ref(false)

  // ============================================================
  // GETTERS
  // ============================================================
  /** Tem algum modal aberto? */
  const isAnyModalOpen = computed(() => currentModal.value !== null)

  /** Helper pra checar modal específico (ex: ui.isModalOpen('pluggy')). */
  const isModalOpen = computed(() => (name: GlobalModalName) => {
    return currentModal.value?.name === name
  })

  /** Tem toast ativo? */
  const hasToasts = computed(() => toasts.value.length > 0)

  // ============================================================
  // ACTIONS — MODAIS
  // ============================================================
  /**
   * Abre um modal. Se já há outro aberto, troca (sem animação de fechar
   * antes — UX decision; componente que mounta o modal cuida da transição).
   *
   * @example
   *   ui.openModal('pluggy')
   *   ui.openModal('upgrade', { reason: 'limit-reached', plan: 'max' })
   */
  function openModal(
    name: GlobalModalName,
    payload?: Record<string, unknown>,
  ): void {
    currentModal.value = { name, payload }
  }

  /** Fecha o modal atual. */
  function closeModal(): void {
    currentModal.value = null
  }

  /**
   * Fecha apenas se for o modal `name`. Útil quando um componente quer
   * fechar "o seu modal" sem risco de fechar outro que apareceu por
   * cima (ex: race de double-click).
   */
  function closeModalIf(name: GlobalModalName): void {
    if (currentModal.value?.name === name) {
      currentModal.value = null
    }
  }

  // ============================================================
  // ACTIONS — SIDEBAR
  // ============================================================
  function toggleSidebar(): void {
    sidebarOpen.value = !sidebarOpen.value
  }
  function openSidebar(): void {
    sidebarOpen.value = true
  }
  function closeSidebar(): void {
    sidebarOpen.value = false
  }

  // ============================================================
  // ACTIONS — TOASTS
  // ============================================================
  /**
   * Push toast custom na fila. Retorna o id pra remoção manual
   * (útil em progress toasts que precisam virar success/error depois).
   *
   * @example
   *   const id = ui.pushToast({ kind: 'progress', title: 'Sincronizando…', duration: null })
   *   // … sync termina
   *   ui.dismissToast(id)
   *   ui.pushToast({ kind: 'success', title: 'Sync completo', duration: 4000 })
   */
  function pushToast(input: Omit<UiToast, 'id' | 'createdAt'>): string {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const toast: UiToast = {
      id,
      kind: input.kind,
      title: input.title,
      description: input.description,
      duration: input.duration,
      createdAt: Date.now(),
    }
    toasts.value = [...toasts.value, toast]

    // Auto-dismiss se duration não-null
    if (toast.duration && toast.duration > 0 && typeof window !== 'undefined') {
      setTimeout(() => {
        dismissToast(id)
      }, toast.duration)
    }

    return id
  }

  function dismissToast(id: string): void {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function clearAllToasts(): void {
    toasts.value = []
  }

  // ============================================================
  // ACTIONS — COMMAND PALETTE
  // ============================================================
  function toggleCommandPalette(): void {
    commandPaletteOpen.value = !commandPaletteOpen.value
  }
  function openCommandPalette(): void {
    commandPaletteOpen.value = true
  }
  function closeCommandPalette(): void {
    commandPaletteOpen.value = false
  }

  /**
   * Reset completo do estado de UI. Chamado em logout pra garantir que
   * modais ou toasts não vazem entre sessões.
   */
  function reset(): void {
    currentModal.value = null
    sidebarOpen.value = false
    toasts.value = []
    commandPaletteOpen.value = false
  }

  return {
    // state
    currentModal,
    sidebarOpen,
    toasts,
    commandPaletteOpen,
    // getters
    isAnyModalOpen,
    isModalOpen,
    hasToasts,
    // actions
    openModal,
    closeModal,
    closeModalIf,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    pushToast,
    dismissToast,
    clearAllToasts,
    toggleCommandPalette,
    openCommandPalette,
    closeCommandPalette,
    reset,
  }
})
