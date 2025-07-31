
export const useInterfaceStore = defineStore('interface', {
  state: (): {
    revealAmount: boolean,
  } => {
    return {
      revealAmount: false,
    }
  },
  actions: {
    toggleRevealAmount() {
      this.revealAmount = !this.revealAmount
    },
  },
  persist: [
    {
      paths: ['revealAmount'],
      storage: persistedState.localStorage
    },
  ],
})
