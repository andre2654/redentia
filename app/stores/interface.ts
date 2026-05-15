export const useInterfaceStore = defineStore('interface', {
  state: (): {
    revealAmount: boolean
    hideInstallBanner: boolean
    aiCursorEnabled: boolean
  } => {
    // `revealAmount` controla se os valores monetarios aparecem em
    // claro ou mascarados (R$ ••••••). True = revelado (Privacy Off);
    // false = mascarado (Privacy On). Defaultamos true pra que novos
    // usuarios vejam o patrimonio sem precisar destravar — o toggle
    // fica visivel pra quem quiser ativar a privacidade. Se ja estava
    // false em localStorage (pinia-persistedstate), respeita a escolha.
    //
    // `aiCursorEnabled` liga/desliga a feature "ask anywhere" (orb que
    // aparece quando o mouse fica parado 1s sobre algo). True = ativa em
    // desktop; false = desligada. O `plugins/ai-cursor.client.ts` ja
    // descarta sozinho mobile/tablet portrait — esta flag e o controle
    // explicito do usuario por cima da capability check.
    return {
      revealAmount: true,
      hideInstallBanner: false,
      aiCursorEnabled: true,
    }
  },
  actions: {
    toggleRevealAmount() {
      this.revealAmount = !this.revealAmount
    },
    closeInstallBanner() {
      this.hideInstallBanner = true
    },
    toggleAiCursor(value?: boolean) {
      this.aiCursorEnabled = typeof value === 'boolean' ? value : !this.aiCursorEnabled
    },
  },
  persist: [
    {
      paths: ['revealAmount', 'hideInstallBanner', 'aiCursorEnabled'],
      storage: persistedState.localStorage,
    },
  ],
})
