/**
 * Preferências do "resumo diário" por canal (e-mail / WhatsApp).
 *
 * PR-N1: agora com BACKEND real (`/api/me/notification-preferences`) quando
 * logado — o localStorage vira só cache (evita flash e cobre o anônimo). O modal
 * da home (NuBriefingModal) e a central (/conta) compartilham este estado via
 * useState. A API pública (hydrate/save/enabled/channelsLabel/prefs) não mudou,
 * então os componentes que já usavam continuam iguais.
 *
 * Anônimo: só cache local (o modal mostra o CTA de login, não os toggles). Ao
 * logar, o próximo hydrate() sincroniza do backend (guardado por `synced`).
 */
export interface BriefingPrefs {
  whatsapp: boolean
  email: boolean
}

const KEY = 'nu:briefing-prefs'

interface PrefsResponse {
  daily_briefing?: { email?: boolean, whatsapp?: boolean }
}

export function useBriefingPrefs() {
  const { isAuthenticated } = useAuthState()
  const { authFetch } = useApi()
  const prefs = useState<BriefingPrefs>('nu:briefing-prefs', () => ({ whatsapp: false, email: false }))
  const synced = useState<boolean>('nu:briefing-prefs:synced', () => false)

  function readCache() {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) {
        const p = JSON.parse(raw) as Partial<BriefingPrefs>
        prefs.value = { whatsapp: !!p.whatsapp, email: !!p.email }
      }
    }
    catch { /* localStorage indisponível/corrompido → mantém o que tem */ }
  }
  function writeCache() {
    if (typeof window === 'undefined') return
    try { window.localStorage.setItem(KEY, JSON.stringify(prefs.value)) }
    catch { /* quota/privado */ }
  }

  async function hydrate() {
    readCache() // cache primeiro (barato, sem flash)
    if (!isAuthenticated.value || synced.value) return
    synced.value = true
    try {
      const r = await authFetch<PrefsResponse>('/me/notification-preferences', {}, { redirectOnAuthError: false })
      const db = r.daily_briefing ?? {}
      prefs.value = { whatsapp: !!db.whatsapp, email: !!db.email }
      writeCache()
    }
    catch { synced.value = false /* offline/erro → tenta de novo no próximo hydrate */ }
  }

  async function save(next: BriefingPrefs) {
    prefs.value = { whatsapp: !!next.whatsapp, email: !!next.email }
    writeCache()
    if (!isAuthenticated.value) return
    try {
      await authFetch('/me/notification-preferences', {
        method: 'PUT',
        body: { topic: 'daily_briefing', email: prefs.value.email, whatsapp: prefs.value.whatsapp },
      }, { redirectOnAuthError: false })
    }
    catch { /* melhor esforço; o cache já refletiu a mudança */ }
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
