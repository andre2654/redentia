/**
 * Chat Redentia AI (PR9 /busca) — consumidor SSE do chat-service + sessões.
 *
 * Contratos (extraídos do código real do chat-service, validados por curl
 * 2026-07-12: POST /stream anônimo → 401 {error:'auth_required'}; GET
 * /sessions com X-Client-Id novo → {sessions:[]}):
 *  - POST /stream: body { message, sessionId (OMITIDO no 1º envio — nunca
 *    null), tenantSlug:'redentia', tier:'basic' }; Bearer sanctum (logado) +
 *    X-Client-Id; SSE com eventos tipados; heartbeats ':' ignorados; frame
 *    ruim NUNCA derruba o stream.
 *  - Sessões server-side: banco é a fonte de verdade (decisão 2026-06-26) —
 *    NADA de thread em localStorage. Título é gerado pelo servidor no fim do
 *    turno → re-listamos depois do message.end.
 *  - Resolução de URL (padrão Atlas): browser usa chatDirectUrl quando setado
 *    (evita o proxy Vercel bufferizar SSE); senão o proxy same-origin /api/chat.
 *  - Label é SEMPRE "Redentia AI" — modelo/tier nunca vazam pra UI.
 *
 * Estado em useState (compartilhado entre page/hero/chat-view — um único
 * contexto de chat no app).
 */

export interface NuChatCitation {
  id?: number
  title: string
  publisher: string
  url?: string
  type?: string
}

export interface NuChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations: NuChatCitation[]
  followups: string[]
  /** erro recuperável exibido no corpo da mensagem (nunca spinner eterno) */
  error?: string | null
  /** sessão sanctum morreu no meio — a UI mostra CTA de login */
  authExpired?: boolean
  done?: boolean
}

/** Uma conversa passada, como vem do GET /sessions (mais recente primeiro). */
export interface NuChatSession {
  id: string
  title: string | null
  tier: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

function hostOf(url?: string): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Id estável por device (anônimo e logado) — SSR-safe. */
function chatClientId(): string {
  if (import.meta.server) return ''
  const KEY = 'redentia_chat_client_id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    localStorage.setItem(KEY, id)
  }
  return id
}

// Um único contexto de chat no app → um único stream ativo (module-level é
// seguro: só é escrito em código client-side).
let abortCtl: AbortController | null = null
let idc = 0
const uid = () => `m${Date.now().toString(36)}${idc++}`

export function useNuChat() {
  const cfg = useRuntimeConfig()
  const { token, isAuthenticated, clearSession } = useAuthState()

  const messages = useState<NuChatMsg[]>('nu:chat:messages', () => [])
  const streaming = useState<boolean>('nu:chat:streaming', () => false)
  const sessionId = useState<string | null>('nu:chat:session-id', () => null)
  const sessions = useState<NuChatSession[]>('nu:chat:sessions', () => [])
  const sessionsLoading = useState<boolean>('nu:chat:sessions-loading', () => false)
  const loadingSessionId = useState<string | null>('nu:chat:loading-session', () => null)

  /** tools em execução no turno atual (tool.start/tool.result). */
  const toolsActive = useState<number>('nu:chat:tools-active', () => 0)

  /** indicador "pensando": stream vivo e (resposta ainda sem texto OU tool
   *  rodando no meio do turno — o contrato manda manter a atividade viva). */
  const thinking = computed(() => {
    if (!streaming.value) return false
    if (toolsActive.value > 0) return true
    const last = messages.value[messages.value.length - 1]
    return !!last && last.role === 'assistant' && last.content === '' && !last.error
  })

  /** só exibe URL http(s) — citation vem de LLM/tool, nunca confiar no esquema. */
  function safeUrl(u?: string): string | undefined {
    return u && /^https?:\/\//i.test(u) ? u : undefined
  }

  function apiUrl(path: string): string {
    const direct = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
    return import.meta.client && direct ? `${direct}${path}` : `/api/chat${path}`
  }

  function buildHeaders(json = false): Record<string, string> {
    const h: Record<string, string> = {}
    if (json) h['Content-Type'] = 'application/json'
    if (token.value) h.Authorization = `Bearer ${token.value}`
    const cid = chatClientId()
    if (cid) h['X-Client-Id'] = cid
    return h
  }

  function onEvent(a: NuChatMsg, name: string, data: any) {
    switch (name) {
      case 'session.start':
        // Fixa a sessão do 1º turno; tier/tierLabel/model NUNCA vão pra UI.
        if (!sessionId.value) sessionId.value = data.sessionId ?? null
        break
      case 'text.delta':
        a.content += data.content ?? ''
        break
      case 'reasoning.delta':
        // mantém o "pensando" vivo (conteúdo do raciocínio não renderiza)
        break
      case 'citation.add': {
        const src = data.source ?? data
        const key: string = src?.url || `${src?.title ?? ''}|${src?.publisher ?? ''}`
        if (!key || a.citations.some((c) => (c.url || `${c.title}|${c.publisher}`) === key)) break
        a.citations.push({
          id: typeof data.id === 'number' ? data.id : undefined,
          title: src?.title || hostOf(src?.url) || 'Fonte',
          publisher: src?.publisher || hostOf(src?.url) || '',
          url: safeUrl(src?.url),
          type: src?.type,
        })
        break
      }
      case 'followups':
        a.followups = Array.isArray(data.suggestions)
          ? data.suggestions.filter((s: unknown): s is string => typeof s === 'string')
          : []
        break
      case 'tool.start':
        toolsActive.value++
        break
      case 'tool.result':
        toolsActive.value = Math.max(0, toolsActive.value - 1)
        break
      case 'message.end':
        a.done = true
        break
      case 'error':
        a.error = data.message || 'Erro ao processar a mensagem. Tente de novo.'
        break
      case 'max.blocked':
        a.error = data.message || 'Você atingiu o limite de uso por agora. Tente novamente mais tarde.'
        break
      // form.show / action.propose / asset.card / artifact.* / goal.* /
      // decision.* / research.* / scenario.* / preexec.* / alert.* /
      // portfolio.* / context.probe: ignorados em silêncio (contrato PR9).
    }
  }

  function handleFrame(a: NuChatMsg, raw: string) {
    let name = 'message'
    const dataLines: string[] = []
    for (const line of raw.split('\n')) {
      if (line.startsWith(':')) continue // heartbeat
      if (line.startsWith('event:')) name = line.slice(6).trim()
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
    }
    if (!dataLines.length) return
    let data: any
    try {
      data = JSON.parse(dataLines.join('\n'))
    } catch {
      return // frame malformado não derruba o stream
    }
    try {
      onEvent(a, name, data)
    } catch (err) {
      console.error('[nu-chat] onEvent falhou em', name, err)
    }
  }

  async function send(text: string) {
    const msg = text.trim()
    if (!msg || streaming.value) return

    messages.value.push({ id: uid(), role: 'user', content: msg, citations: [], followups: [] })
    const a: NuChatMsg = { id: uid(), role: 'assistant', content: '', citations: [], followups: [], error: null }
    messages.value.push(a)
    // referência REATIVA (o push envolve o objeto em proxy — mutar `a` cru não renderiza)
    const live = messages.value[messages.value.length - 1]!

    streaming.value = true
    abortCtl = new AbortController()
    toolsActive.value = 0

    try {
      const res = await fetch(apiUrl('/stream'), {
        method: 'POST',
        headers: { ...buildHeaders(true), Accept: 'text/event-stream' },
        credentials: 'include',
        signal: abortCtl.signal,
        body: JSON.stringify({
          message: msg,
          // NUNCA mandar sessionId null — omitido no 1º envio
          ...(sessionId.value ? { sessionId: sessionId.value } : {}),
          tenantSlug: 'redentia',
          tier: 'basic',
        }),
      })

      if (!res.ok) {
        let payload: any = null
        try { payload = await res.json() } catch { /* corpo não-JSON */ }
        if (res.status === 401) {
          // Token sanctum morreu no meio da sessão — o gate da página já
          // barrou o anônimo antes de qualquer gasto de IA.
          clearSession()
          live.error = 'Sua sessão expirou. Entre de novo para continuar a conversa.'
          live.authExpired = true
        } else if (res.status === 429) {
          live.error = payload?.message || 'Muitas mensagens em pouco tempo. Aguarde um instante e tente de novo.'
        } else {
          live.error = payload?.message || payload?.error || 'Não consegui falar com o servidor. Tente de novo.'
        }
        return
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('sem corpo de stream')
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let idx
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          handleFrame(live, buffer.slice(0, idx))
          buffer = buffer.slice(idx + 2)
        }
      }
      buffer += decoder.decode() // flush de multibyte partido no último chunk
      if (buffer.trim()) handleFrame(live, buffer)

      // Reader fechou SEM message.end → fim truncado (nunca spinner eterno).
      if (!live.done && !live.error) {
        live.error = 'A resposta foi interrompida antes de terminar. Tente reenviar.'
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        // abort = conclusão silenciosa; resposta vazia não vira linha morta
        if (!live.content && !live.error) {
          const i = messages.value.indexOf(live)
          if (i !== -1) messages.value.splice(i, 1)
        }
      } else if (!live.error) {
        live.error = 'Não consegui falar com o servidor. Verifique sua conexão e tente de novo.'
      }
    } finally {
      streaming.value = false
      toolsActive.value = 0
      abortCtl = null
      // Título da sessão é gerado no servidor no fim do turno — re-lista.
      if (live.done && isAuthenticated.value) void loadSessions()
    }
  }

  function stop() {
    abortCtl?.abort()
    abortCtl = null
  }

  function newConversation() {
    stop()
    messages.value = []
    sessionId.value = null
  }

  // Logado = cross-device; anônimo (X-Client-Id) = sessões do device.
  // O endpoint nunca 401a aqui.
  async function loadSessions() {
    sessionsLoading.value = true
    try {
      const r = await $fetch<{ sessions: NuChatSession[] }>(apiUrl('/sessions'), {
        headers: buildHeaders(),
        credentials: 'include',
      })
      sessions.value = Array.isArray(r?.sessions) ? r.sessions : []
    } catch {
      sessions.value = []
    } finally {
      sessionsLoading.value = false
    }
  }

  /**
   * Reabre uma conversa: colapsa runs consecutivos do mesmo role e, em blocos
   * assistant, mantém só o de MAIOR content (iterações de tool repetem intros
   * — padrão dos 2 apps).
   */
  async function openSession(id: string): Promise<boolean> {
    stop()
    loadingSessionId.value = id
    try {
      const r = await $fetch<{
        session: { id: string }
        messages: Array<{ id: string; role: string; content: string | null; citations?: any[]; createdAt?: string }>
      }>(apiUrl(`/sessions/${id}`), { headers: buildHeaders(), credentials: 'include' })

      const visible = (r.messages || []).filter((m) => m.role === 'user' || m.role === 'assistant')
      const out: NuChatMsg[] = []
      let i = 0
      while (i < visible.length) {
        const role = visible[i]!.role
        let j = i
        while (j < visible.length && visible[j]!.role === role) j++
        const block = visible.slice(i, j)
        if (role === 'user') {
          for (const m of block) {
            const t = (m.content ?? '').trim()
            if (t) out.push({ id: m.id || uid(), role: 'user', content: t, citations: [], followups: [] })
          }
        } else {
          const withText = block.filter((m) => (m.content ?? '').trim().length > 0)
          if (withText.length) {
            const chosen = withText.reduce((p, q) => ((q.content ?? '').length > (p.content ?? '').length ? q : p))
            const citations: NuChatCitation[] = Array.isArray(chosen.citations)
              ? chosen.citations.map((c: any) => {
                  const s = c?.source ?? c
                  return {
                    id: typeof c?.id === 'number' ? c.id : undefined,
                    title: s?.title || hostOf(s?.url) || 'Fonte',
                    publisher: s?.publisher || hostOf(s?.url) || '',
                    url: safeUrl(s?.url),
                    type: s?.type,
                  }
                })
              : []
            out.push({ id: chosen.id || uid(), role: 'assistant', content: chosen.content ?? '', citations, followups: [], done: true })
          }
        }
        i = j
      }

      messages.value = out
      sessionId.value = r.session?.id ?? id
      return true
    } catch {
      // falha nunca é silenciosa: a thread mostra o erro no lugar do vazio
      messages.value = [{
        id: uid(), role: 'assistant', content: '', citations: [], followups: [],
        error: 'Não consegui carregar esta conversa. Tente de novo.',
      }]
      sessionId.value = null
      return false
    } finally {
      loadingSessionId.value = null
    }
  }

  /** Exclusão otimista; se era a conversa ativa, aborta o stream e zera a
   *  thread (design). Rollback COMPLETO no erro — nada se perde em silêncio. */
  async function deleteSession(id: string) {
    const prev = sessions.value
    const wasActive = sessionId.value === id
    const prevMessages = wasActive ? messages.value : null
    const prevSessionId = sessionId.value
    sessions.value = prev.filter((s) => s.id !== id)
    if (wasActive) {
      stop() // não deixa o stream escrever numa thread órfã
      messages.value = []
      sessionId.value = null
    }
    try {
      await $fetch(apiUrl(`/sessions/${id}`), { method: 'DELETE', headers: buildHeaders(), credentials: 'include' })
    } catch {
      sessions.value = prev // rollback — deletar nunca perde histórico em silêncio
      if (wasActive && prevMessages) {
        messages.value = prevMessages
        sessionId.value = prevSessionId
      }
    }
  }

  return {
    messages, streaming, thinking, sessionId,
    sessions, sessionsLoading, loadingSessionId,
    send, stop, newConversation, loadSessions, openSession, deleteSession,
  }
}
