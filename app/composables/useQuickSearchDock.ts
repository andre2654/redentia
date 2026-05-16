/**
 * useQuickSearchDock — estado global compartilhado entre o componente
 * MoleculesQuickSearch (singleton global, mounted no default layout)
 * e os MoleculesQuickSearchDock que podem ser plantados em qualquer
 * página como "alvos de docking".
 *
 * Como funciona:
 *   1. Cada <MoleculesQuickSearchDock /> se registra via registerDock()
 *      no onMounted, passando seu elemento DOM raiz. Recebe um id único.
 *   2. O QuickSearch faz polling (via rAF no scroll/resize) das positions
 *      dos docks registrados, calcula qual está mais perto da "zona de
 *      engage" (centro do viewport ± tolerância), e seta activeDockId +
 *      dockProgress (0..1) via setActiveDock().
 *   3. O dock então reage à própria activeness (esconde o ghost placeholder
 *      conforme dockProgress sobe, revela quando cai).
 *
 * State vive em module scope (singleton). Só funciona client-side.
 */
import { computed, readonly, ref } from 'vue'

export interface DockEntry {
  id: string
  el: HTMLElement
}

const docks = ref<DockEntry[]>([])
const activeDockId = ref<string | null>(null)
/** 0..1 — quão "encaixado" o pill está no activeDockId atual. */
const dockProgress = ref(0)

let _idCounter = 0
function genId(): string {
  _idCounter += 1
  return `qs-dock-${_idCounter}`
}

export function registerDock(el: HTMLElement, preferredId?: string): string {
  const id = preferredId ?? genId()
  // Evita duplicatas se o mesmo elemento for registrado duas vezes
  // (HMR / re-mount cenários).
  if (!docks.value.some(d => d.el === el)) {
    docks.value.push({ id, el })
  }
  return id
}

export function unregisterDock(id: string): void {
  docks.value = docks.value.filter(d => d.id !== id)
  if (activeDockId.value === id) {
    activeDockId.value = null
    dockProgress.value = 0
  }
}

export function setActiveDock(id: string | null, progress: number): void {
  activeDockId.value = id
  dockProgress.value = progress
}

export function useQuickSearchDock() {
  return {
    docks: readonly(docks),
    activeDockId: readonly(activeDockId),
    dockProgress: readonly(dockProgress),
    // Helper reativo: dado um dockId, retorna seu progress (0 se não ativo)
    progressFor: (id: string) =>
      computed(() => (activeDockId.value === id ? dockProgress.value : 0)),
  }
}
