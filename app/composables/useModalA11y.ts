import type { Ref } from 'vue'

/**
 * Acessibilidade compartilhada dos overlays Nu (1 implementação por
 * responsabilidade — antes cada modal reinventava foco/Escape à mão, e
 * NENHUM prendia o Tab nem devolvia o foco). Este composable adiciona as duas
 * peças que faltavam a TODOS eles:
 *
 *  - TRAP de Tab: Tab/Shift+Tab circulam só entre os focáveis do card; o foco
 *    não vaza pra página por trás do scrim (antes, Tab depois do "Fechar" ia
 *    pros links da página escondida — foco invisível).
 *  - RESTAURAÇÃO: guarda o elemento que estava focado ao abrir (o gatilho) e
 *    devolve o foco pra ele ao fechar (antes o foco caía no <body>, perdendo
 *    o lugar do usuário de teclado).
 *
 * Foco inicial: foca o card (tabindex=-1) se nada dentro dele já estiver
 * focado — cada modal pode focar um alvo mais específico antes. Escape e
 * scroll-lock ficam com o componente (variam entre os overlays). SSR-safe.
 */
export function useModalA11y(cardRef: Ref<HTMLElement | null>, isOpen: Ref<boolean>) {
  let restoreTarget: HTMLElement | null = null

  const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

  function focusables(): HTMLElement[] {
    const root = cardRef.value
    if (!root) return []
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    )
  }

  function onTrapKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return
    const root = cardRef.value
    if (!root) return
    const items = focusables()
    if (!items.length) {
      // sem focáveis: prende o foco no próprio card
      e.preventDefault()
      root.focus()
      return
    }
    const first = items[0]!
    const last = items[items.length - 1]!
    const active = document.activeElement
    if (e.shiftKey && (active === first || !root.contains(active))) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (active === last || !root.contains(active))) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(isOpen, (open) => {
    if (import.meta.server) return
    if (open) {
      restoreTarget = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', onTrapKey, true)
      nextTick(() => {
        const root = cardRef.value
        if (root && !root.contains(document.activeElement)) root.focus()
      })
    } else {
      document.removeEventListener('keydown', onTrapKey, true)
      // devolve o foco pro gatilho (se ainda está no DOM e visível)
      if (restoreTarget && document.contains(restoreTarget) && restoreTarget.offsetParent !== null) {
        restoreTarget.focus()
      }
      restoreTarget = null
    }
  })

  onBeforeUnmount(() => {
    if (import.meta.server) return
    document.removeEventListener('keydown', onTrapKey, true)
  })
}
