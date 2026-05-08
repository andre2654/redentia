/**
 * Singleton de estado pro <MoleculesUpgradeModal> montado em app.vue.
 *
 * Usar:
 *   const { open, close, isOpen, payload } = useUpgradeModal()
 *   open({ reason: 'limit-reached', suggestedPlan: 'max', key: 'max_chat_daily' })
 *
 * Se billing.enabled=false no tenant, open() e no-op silencioso.
 */
export interface UpgradeModalPayload {
  reason: 'limit-reached' | 'feature-locked' | 'subscription-needed' | 'trial-ended' | string
  suggestedPlan?: 'pro' | 'max'
  key?: string
  feature?: string
  customTitle?: string
  customMessage?: string
}

export function useUpgradeModal() {
  const isOpen = useState<boolean>('upgrade-modal:open', () => false)
  const payload = useState<UpgradeModalPayload | null>('upgrade-modal:payload', () => null)

  function open(p: UpgradeModalPayload) {
    const ent = useEntitlements()
    if (!ent.isBillingEnabled()) return
    payload.value = p
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    payload.value = null
  }

  return { isOpen, payload, open, close }
}
