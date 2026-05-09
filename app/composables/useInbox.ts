/**
 * useInbox — fonte unificada de notificacoes pro user. Mescla:
 *
 *   1. Chat alerts (watchlist + agent + system) via useAlerts
 *      → vem do microservico chat-service em /api/chat/alerts
 *      → severity info/warning/critical, ticker, sessionId
 *
 *   2. Admin notifications via /api/communications/active?placement=inbox
 *      → comunicacoes criadas pelo admin com type='notification'
 *      → suporta target_audience='specific' (lista de user_ids)
 *
 * Ambos sao normalizados pra `InboxItem` com `kind: 'alert' | 'notice'`,
 * o que permite render unificado num unico drawer (bell badge agrega
 * unread de ambas fontes; drawer mostra com seccoes ou sorted by date).
 *
 * Cache no escopo do modulo (igual useAlerts) pra que o badge do sino
 * em /help e o badge do sidebar mostrem o mesmo numero. Polling de 60s
 * pras notificacoes admin (nao tem SSE pra elas hoje).
 */
import { computed, ref, type Ref } from 'vue'
import { useAlerts, type ChatAlert, type AlertSeverity } from '~/composables/useAlerts'

export type InboxKind = 'alert' | 'notice'

export interface InboxItem {
  id: string                       // ex: "alert:abc123" ou "notice:42"
  kind: InboxKind
  title: string
  body: string
  icon: string | null              // override do icone (so notices)
  ticker: string | null            // so alerts
  severity: AlertSeverity | null   // so alerts
  sessionId: string | null         // so alerts
  linkUrl: string | null           // so notices
  linkLabel: string | null         // so notices
  createdAt: string
  readAt: string | null
  raw: ChatAlert | NoticePayload   // pra acesso direto na surface
}

interface NoticePayload {
  id: number
  title: string
  body: string | null
  icon: string | null
  link_url: string | null
  link_label: string | null
  starts_at: string | null
  created_at: string
}

const _notices = ref<NoticePayload[]>([])
const _noticesSeen = ref<Set<number>>(new Set())
const _noticesLoading = ref(false)
const _noticesError = ref<string | null>(null)
let _noticesPollTimer: ReturnType<typeof setInterval> | null = null

// Estado do drawer compartilhado entre todas as superficies (sino do
// chat em /help e sino do platform sidebar). Quem chama `openDrawer()`
// faz o drawer (renderizado em InboxBell) aparecer; quem fecha controla
// o close. Mantido fora do useInbox() pra que multiplos consumidores
// referenciem o mesmo open state sem prop drilling.
const _drawerOpen = ref(false)

export function useInbox() {
  const alertsApi = useAlerts()

  function authHeaders(): Record<string, string> {
    const authStore = useAuthStore()
    return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
  }

  async function fetchNotices(): Promise<void> {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      _notices.value = []
      return
    }
    _noticesLoading.value = true
    _noticesError.value = null
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl as string
      const resp = await $fetch<{ data: any[] }>(`${baseURL}/communications/active`, {
        query: { placement: 'inbox' },
        headers: authHeaders(),
      })
      _notices.value = (resp?.data || []).map((c: any) => ({
        id: Number(c.id),
        title: c.title || '',
        body: c.body || null,
        icon: c.icon || null,
        link_url: c.link_url || null,
        link_label: c.link_label || null,
        starts_at: c.starts_at || null,
        created_at: c.created_at || c.starts_at || new Date().toISOString(),
      }))
    } catch (err) {
      _noticesError.value = String(err)
    } finally {
      _noticesLoading.value = false
    }
  }

  async function markNoticeSeen(id: number): Promise<void> {
    if (_noticesSeen.value.has(id)) return
    _noticesSeen.value.add(id)
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl as string
      await $fetch(`${baseURL}/communications/${id}/seen`, {
        method: 'POST',
        headers: authHeaders(),
      }).catch(() => null)
    } catch { /* silent */ }
  }

  async function dismissNotice(id: number): Promise<void> {
    // Remove localmente — o backend trackeria via /dismiss endpoint, e
    // o filtro `whereDoesntHave seen WHERE dismissed_at IS NOT NULL`
    // ja exclui pra proxima carga.
    _notices.value = _notices.value.filter(n => n.id !== id)
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl as string
      await $fetch(`${baseURL}/communications/${id}/dismiss`, {
        method: 'POST',
        headers: authHeaders(),
      }).catch(() => null)
    } catch { /* silent */ }
  }

  async function clickNotice(id: number): Promise<void> {
    try {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl as string
      await $fetch(`${baseURL}/communications/${id}/click`, {
        method: 'POST',
        headers: authHeaders(),
      }).catch(() => null)
    } catch { /* silent */ }
  }

  function startNoticePolling(): void {
    if (_noticesPollTimer) return
    fetchNotices()
    _noticesPollTimer = setInterval(fetchNotices, 60000)
  }

  function stopNoticePolling(): void {
    if (_noticesPollTimer) {
      clearInterval(_noticesPollTimer)
      _noticesPollTimer = null
    }
  }

  /**
   * Items unificados — alerts (chat) + notices (admin), ordenados por
   * data desc. Cada item carrega `kind` pra que a surface decida como
   * renderizar (alerts mostram ticker chip + severity dot; notices
   * mostram icon + CTA).
   */
  const items = computed<InboxItem[]>(() => {
    const fromAlerts: InboxItem[] = alertsApi.alerts.value.map((a: ChatAlert) => ({
      id: `alert:${a.id}`,
      kind: 'alert' as const,
      title: a.title,
      body: a.body,
      icon: null,
      ticker: a.ticker,
      severity: a.severity,
      sessionId: a.sessionId,
      linkUrl: null,
      linkLabel: null,
      createdAt: a.createdAt,
      readAt: a.readAt,
      raw: a,
    }))
    const fromNotices: InboxItem[] = _notices.value.map((n) => ({
      id: `notice:${n.id}`,
      kind: 'notice' as const,
      title: n.title,
      body: n.body || '',
      icon: n.icon,
      ticker: null,
      severity: null,
      sessionId: null,
      linkUrl: n.link_url,
      linkLabel: n.link_label,
      createdAt: n.starts_at || n.created_at,
      readAt: _noticesSeen.value.has(n.id) ? new Date().toISOString() : null,
      raw: n,
    }))
    return [...fromAlerts, ...fromNotices].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const unreadCount = computed(() => items.value.filter(i => i.readAt == null).length)

  async function refresh(): Promise<void> {
    await Promise.all([alertsApi.refresh(), fetchNotices()])
  }

  async function markRead(item: InboxItem): Promise<void> {
    if (item.readAt) return
    if (item.kind === 'alert') {
      await alertsApi.markRead((item.raw as ChatAlert).id)
    } else {
      await markNoticeSeen((item.raw as NoticePayload).id)
    }
  }

  async function dismissItem(item: InboxItem): Promise<void> {
    if (item.kind === 'alert') {
      await alertsApi.dismiss((item.raw as ChatAlert).id)
    } else {
      await dismissNotice((item.raw as NoticePayload).id)
    }
  }

  async function dismissAll(): Promise<void> {
    await alertsApi.dismissAll()
    // Notices: dismiss todas as que estao na lista
    const noticeIds = _notices.value.map(n => n.id)
    _notices.value = []
    await Promise.all(noticeIds.map(id => {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl as string
      return $fetch(`${baseURL}/communications/${id}/dismiss`, {
        method: 'POST',
        headers: authHeaders(),
      }).catch(() => null)
    }))
  }

  function openDrawer(): void {
    _drawerOpen.value = true
  }
  function closeDrawer(): void {
    _drawerOpen.value = false
  }
  function toggleDrawer(): void {
    _drawerOpen.value = !_drawerOpen.value
  }

  return {
    items,
    unreadCount,
    loading: computed(() => alertsApi.loading.value || _noticesLoading.value),
    refresh,
    markRead,
    dismissItem,
    dismissAll,
    startNoticePolling,
    stopNoticePolling,
    // Drawer state — compartilhado globalmente
    drawerOpen: _drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    // Pass-through pro uso direto quando precisar
    alertsApi,
  }
}
