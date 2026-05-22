/**
 * useInstallPrompt — wrapper sobre `beforeinstallprompt` (Chromium-only).
 *
 * Cobertura real (2026-05):
 *   ✓ Chrome desktop (Win/Mac/Linux), Edge, Opera, Brave, Arc
 *   ✓ Chrome Android (PWA manifest válido + SW ativo + critérios PWA OK)
 *   ✗ Safari (iOS+macOS) — usa fluxo manual "Share → Adicionar à Tela"
 *   ✗ Firefox desktop — não suporta install via prompt programático
 *
 * Por que o listener vive no `plugins/install-prompt.client.ts`:
 *
 *   O evento `beforeinstallprompt` dispara UMA vez por sessão, logo
 *   após o SW registrar + manifest passar critérios. Se a página
 *   /download monta DEPOIS do disparo (caso típico — user navega da
 *   home, evento já passou), o `addEventListener` do componente
 *   chega tarde demais e perde a referência. Por isso o plugin
 *   ataca o listener no `app:created` e stasha o evento em um
 *   module-level ref compartilhado.
 *
 * Integração esperada:
 *   - `/download` lê `canInstall` pra renderizar botão "real" vs scroll
 *   - Banner global em `app.vue` pode escutar pra mostrar prompt discreto
 *   - `appinstalled` listener marca `installed=true` (esconde CTAs)
 */
import { ref, computed } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

// Module-level state — compartilhado entre todos os callers do
// composable, sem precisar de useState (não é serializável p/ SSR
// porque carrega referência ao Event nativo do browser).
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const installed = ref(false)
let listenersAttached = false

/**
 * Chamado uma vez pelo plugin client-only no app boot.
 * Idempotente — se chamado 2x (HMR ou page nav), no-op.
 */
export function setupInstallPromptListeners(): void {
  if (listenersAttached || typeof window === 'undefined') return
  listenersAttached = true

  window.addEventListener('beforeinstallprompt', (e) => {
    // preventDefault impede o browser de mostrar o mini-infobar
    // automático do Chrome (que UX é horrível). Nós controlamos
    // quando chamar `.prompt()` via botão na /download.
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
  })

  window.addEventListener('appinstalled', () => {
    installed.value = true
    deferredPrompt.value = null
    try {
      localStorage.setItem('redentia:pwa:installed', '1')
    } catch { /* private mode */ }
  })

  // Standalone display-mode = app já está rodando instalado.
  // Cobre iOS Safari "Adicionar à Tela" (não dispara appinstalled lá).
  if (window.matchMedia?.('(display-mode: standalone)').matches) {
    installed.value = true
  }
  // Apple-specific (iOS Safari pre-PWA spec)
  if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
    installed.value = true
  }
  // Persisted flag (caso o user instalou em sessão anterior mas o
  // browser não detecta standalone agora — ex: aberto via link http
  // mesmo tendo o app instalado).
  try {
    if (localStorage.getItem('redentia:pwa:installed') === '1') {
      installed.value = true
    }
  } catch { /* private mode */ }
}

export function useInstallPrompt() {
  // `canInstall` é true SÓ se o browser ofereceu o evento E o app
  // não está marcado como instalado. Browsers que não suportam
  // (Safari, Firefox) nunca disparam o evento → canInstall fica false
  // → callers caem pro fluxo manual.
  const canInstall = computed(() => !!deferredPrompt.value && !installed.value)

  async function install(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredPrompt.value) return 'unavailable'
    try {
      await deferredPrompt.value.prompt()
      const choice = await deferredPrompt.value.userChoice
      // Spec: evento é one-shot. Apaga a referência, mesmo se
      // dismissed (browser dispara um NOVO beforeinstallprompt
      // depois de algum tempo, se o user voltar).
      deferredPrompt.value = null
      if (choice.outcome === 'accepted') {
        installed.value = true
      }
      return choice.outcome
    } catch {
      // prompt() rejeita se chamado fora de gesture handler. Devolve
      // dismissed pra UI tratar como "user fechou".
      deferredPrompt.value = null
      return 'dismissed'
    }
  }

  return {
    canInstall,
    installed,
    install,
  }
}
