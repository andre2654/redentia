export const useInterfaceStore = defineStore('interface', {
  state: (): {
    revealAmount: boolean
    hideInstallBanner: boolean
  } => {
    return {
      revealAmount: false,
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
