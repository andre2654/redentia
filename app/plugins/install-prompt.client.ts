/**
 * install-prompt.client.ts — ataca os listeners `beforeinstallprompt`
 * e `appinstalled` ANTES de qualquer página montar.
 *
 * Crítico: o evento dispara uma vez por sessão, logo após o SW
 * registrar + critérios PWA passarem. Se /download (ou qualquer
 * CTA de instalar) só atacar o listener no `onMounted`, perde o
 * evento e o botão fica permanentemente no-op.
 *
 * O composable `useInstallPrompt()` lê o estado capturado aqui.
 */
import { setupInstallPromptListeners } from '../composables/useInstallPrompt'

export default defineNuxtPlugin(() => {
  setupInstallPromptListeners()
})
