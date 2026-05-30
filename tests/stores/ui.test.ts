import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { createPinia, defineStore, setActivePinia } from 'pinia'

// The store uses Nuxt auto-imports (defineStore/ref/computed) as bare globals.
// Stub them, THEN dynamic-import the store (static imports hoist above top-level
// code, so the dynamic import inside beforeAll is what reliably sees the stubs).
let useUiStore: typeof import('../../app/stores/ui').useUiStore

beforeAll(async () => {
  vi.stubGlobal('defineStore', defineStore)
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
  ;({ useUiStore } = await import('../../app/stores/ui'))
})

afterAll(() => vi.unstubAllGlobals())
beforeEach(() => setActivePinia(createPinia()))

describe('useUiStore — modals', () => {
  it('opens, queries, replaces, and closes the single global modal', () => {
    const ui = useUiStore()
    expect(ui.isAnyModalOpen).toBe(false)

    ui.openModal('pluggy', { reason: 'x' })
    expect(ui.isAnyModalOpen).toBe(true)
    expect(ui.currentModal).toEqual({ name: 'pluggy', payload: { reason: 'x' } })
    expect(ui.isModalOpen('pluggy')).toBe(true)
    expect(ui.isModalOpen('upgrade')).toBe(false)

    ui.openModal('upgrade') // replaces (one modal at a time)
    expect(ui.currentModal!.name).toBe('upgrade')

    ui.closeModal()
    expect(ui.currentModal).toBeNull()
  })

  it('closeModalIf only closes the matching modal', () => {
    const ui = useUiStore()
    ui.openModal('leadCapture')
    ui.closeModalIf('pluggy') // no-op
    expect(ui.currentModal!.name).toBe('leadCapture')
    ui.closeModalIf('leadCapture') // closes
    expect(ui.currentModal).toBeNull()
  })
})

describe('useUiStore — sidebar + command palette', () => {
  it('toggles/opens/closes the sidebar', () => {
    const ui = useUiStore()
    expect(ui.sidebarOpen).toBe(false)
    ui.toggleSidebar()
    expect(ui.sidebarOpen).toBe(true)
    ui.closeSidebar()
    expect(ui.sidebarOpen).toBe(false)
    ui.openSidebar()
    expect(ui.sidebarOpen).toBe(true)
  })

  it('toggles the command palette', () => {
    const ui = useUiStore()
    ui.openCommandPalette()
    expect(ui.commandPaletteOpen).toBe(true)
    ui.toggleCommandPalette()
    expect(ui.commandPaletteOpen).toBe(false)
  })
})

describe('useUiStore — toasts', () => {
  it('pushes a toast (returns an id), reflects hasToasts, and dismisses by id', () => {
    const ui = useUiStore()
    expect(ui.hasToasts).toBe(false)
    const id = ui.pushToast({ kind: 'info', title: 'Oi', duration: null })
    expect(typeof id).toBe('string')
    expect(ui.toasts).toHaveLength(1)
    expect(ui.hasToasts).toBe(true)
    expect(ui.toasts[0]!.title).toBe('Oi')
    ui.dismissToast(id)
    expect(ui.toasts).toHaveLength(0)
  })

  it('clearAllToasts empties the queue', () => {
    const ui = useUiStore()
    ui.pushToast({ kind: 'info', title: 'a', duration: null })
    ui.pushToast({ kind: 'error', title: 'b', duration: null })
    expect(ui.toasts).toHaveLength(2)
    ui.clearAllToasts()
    expect(ui.toasts).toHaveLength(0)
  })
})

describe('useUiStore — reset', () => {
  it('clears modal, sidebar, toasts and command palette', () => {
    const ui = useUiStore()
    ui.openModal('pluggy')
    ui.openSidebar()
    ui.openCommandPalette()
    ui.pushToast({ kind: 'info', title: 'x', duration: null })

    ui.reset()
    expect(ui.currentModal).toBeNull()
    expect(ui.sidebarOpen).toBe(false)
    expect(ui.commandPaletteOpen).toBe(false)
    expect(ui.toasts).toHaveLength(0)
  })
})
