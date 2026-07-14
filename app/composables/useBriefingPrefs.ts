/**
 * Preferências do "resumo diário" por canal (e-mail / WhatsApp). PR4: MOCK no
 * front (decisão do dono 2026-07-14) — persistido em localStorage, sem backend
 * ainda (a entrega real por canal é uma iniciativa futura). Compartilhado entre
 * o botão da home (NuDaySection → NuBriefingModal) e a central em /conta
 * (ContaNotificacoes): mesmo useState → alternar num lugar reflete no outro.
 *
 * SSR: o estado inicial é "nada ativo" (o botão renderiza "Ativar"); no cliente
 * o hydrate() lê o localStorage e pode acender "Resumo ativo" (flash mínimo,
 * aceitável pro mock).
 */
export interface BriefingPrefs {
  whatsapp: boolean
  email: boolean
}

const KEY = 'nu:briefing-prefs'

export function useBriefingPrefs() {
  const prefs = useState<BriefingPrefs>('nu:briefing-prefs', () => ({ whatsapp: false, email: false }))
  const hydrated = useState<boolean>('nu:briefing-prefs:hydrated', () => false)

  function hydrate() {
    if (hydrated.value || typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<BriefingPrefs>
        prefs.value = { whatsapp: !!parsed.whatsapp, email: !!parsed.email }
      }
    }
    catch { /* localStorage indisponível/corrompido → mantém default */ }
    hydrated.value = true
  }

  function save(next: BriefingPrefs) {
    prefs.value = { whatsapp: !!next.whatsapp, email: !!next.email }
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(KEY, JSON.stringify(prefs.value)) }
      catch { /* ignora quota/privado */ }
    }
  }

  const enabled = computed(() => prefs.value.whatsapp || prefs.value.email)
  const channelsLabel = computed(() => {
    const c: string[] = []
    if (prefs.value.whatsapp) c.push('WhatsApp')
    if (prefs.value.email) c.push('E-mail')
    return c.join(' + ')
  })

  return { prefs, enabled, channelsLabel, hydrate, save }
}
