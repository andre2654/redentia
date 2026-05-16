export const useInterfaceStore = defineStore('interface', {
  state: (): {
    revealAmount: boolean
    hideInstallBanner: boolean
  } => {
    // `revealAmount` controla se os valores monetarios aparecem em
    // claro ou mascarados (R$ ••••••). True = revelado (Privacy Off);
    // false = mascarado (Privacy On). Defaultamos true pra que novos
    // usuarios vejam o patrimonio sem precisar destravar — o toggle
    // fica visivel pra quem quiser ativar a privacidade. Se ja estava
    // false em localStorage (pinia-persistedstate), respeita a escolha.
    return {
      revealAmount: true,
      hideInstallBanner: false,
    }
  },
  actions: {
    toggleRevealAmount() {
      this.revealAmount = !this.revealAmount
    },
    closeInstallBanner() {
      this.hideInstallBanner = true
    },
  },
  persist: [
    {
      paths: ['revealAmount', 'hideInstallBanner'],
      storage: persistedState.localStorage,
    },
  ],
})
