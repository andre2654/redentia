/**
 * useChatStream — composable that talks to the new chat microservice.
 *
 * Manages a single chat session: opens an SSE stream to /api/chat/stream,
 * parses typed events and exposes them as reactive state for the UI.
 *
 * Usage:
 *   const { messages, sources, isStreaming, send, stop, citations,
 *           assetCards, artifacts, followups, error } = useChatStream({
 *     tenantSlug: 'redentia',
 *     focusMode: ref('fundamentalista'),
 *     deepMode: ref(false),
 *     routeContext: computed(...),
 *   })
 */
import { computed, reactive, ref, watch } from 'vue'
import type { Ref } from 'vue'

// ---- Types ------------------------------------------------------
export type ChatRole = 'user' | 'assistant'

export interface ChatCitationSource {
  url?: string
  title?: string
  publishedAt?: string
  publisher?: string
  type?: string
}

export interface ChatCitation {
  id: number
  source: ChatCitationSource
  range?: [number, number]
}

export interface ChatAssetCard {
  ticker: string
  assetClass: 'STOCK' | 'FII' | 'ETF' | 'BDR' | 'CRYPTO' | 'TESOURO'
  snapshot: Record<string, unknown>
}

export interface ChatToolCall {
  callId: string
  name: string
  args: Record<string, unknown>
  status: 'running' | 'success' | 'error'
  result?: unknown
  error?: string
  durationMs?: number
}

export interface ChatArtifact {
  id: string
  type: 'spreadsheet' | 'report' | 'comparison' | 'portfolio'
  title: string
  filename?: string
  downloadUrl?: string
  content?: string
}

/**
 * File the user dropped/picked into the composer. Sent verbatim to the
 * chat-service, which decodes the base64, parses by MIME, and feeds the
 * extracted text (or vision blob, for images) into the LLM context for
 * the current turn.
 *
 * `kind` is a coarse classification chosen by the browser:
 *   - `'text'`  → already-decoded UTF-8 in `content` (txt, md, csv).
 *   - `'binary'`→ base64-encoded bytes in `content` (pdf, xlsx, numbers).
 *   - `'image'` → base64-encoded image bytes in `content` (jpeg/png/webp/gif).
 *
 * `content` is capped client-side. The backend caps too (defence in depth).
 */
export type ChatAttachmentKind = 'text' | 'binary' | 'image'

export interface ChatAttachment {
  id: string
  name: string
  mime: string
  size: number
  kind: ChatAttachmentKind
  content: string
}

// ---- Inline form (rendered after the assistant message) ----------
export type ChatFormFieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'radio'
  | 'select'
  | 'checkbox'

export interface ChatFormOption {
  value: string
  label: string
  hint?: string
}

export interface ChatFormQuestion {
  id: string
  label: string
  kind: ChatFormFieldKind
  options?: Array<string | ChatFormOption>
  placeholder?: string
  hint?: string
  required?: boolean
  min?: number
  max?: number
  maxLength?: number
}

export interface ChatForm {
  formId: string
  title?: string
  intro?: string
  questions: ChatFormQuestion[]
  submitLabel: string
  submitted?: boolean
}

export interface ChatMessageMeta {
  /**
   * 'form_response' marks a user message that came from an InlineForm
   * submission. The UI renders it as a compact field/value card
   * instead of a big heading-style question. The text body still
   * contains the markdown serialisation that gets sent to the LLM.
   */
  kind?: 'form_response' | 'free_text'
  formId?: string
  fields?: Array<{ id: string; label: string; value: string }>
  formTitle?: string
  /**
   * Attachment metadata that survives across reloads. The actual
   * content (PDF bytes, spreadsheet payloads, base64 images, even
   * extracted text) is **never** persisted — only the bare shape
   * needed to render the chips: filename, MIME, size, kind. The
   * server keeps the same contract (see `attachmentMetaForPersistence`
   * in chat-service/src/lib/attachments.ts).
   */
  attachments?: Array<{
    id?: string
    name: string
    mime: string
    size: number
    kind: ChatAttachmentKind | 'error'
    /** When parsing failed, the human-readable reason. */
    error?: string
  }>
}

export type ChatTier = 'basic' | 'max'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  citations: ChatCitation[]
  assetCards: ChatAssetCard[]
  toolCalls: ChatToolCall[]
  artifacts: ChatArtifact[]
  forms: ChatForm[]
  status: 'streaming' | 'complete' | 'error'
  followups?: string[]
  /** Public tier label — "Redentia Basic" or "Redentia MAX". Replaces
   *  the old `model` field that leaked the actual provider name. */
  tier?: ChatTier
  tierLabel?: string
  createdAt: string
  error?: string
  meta?: ChatMessageMeta
}

export interface UseChatStreamOptions {
  tenantSlug: string
  tier?: Ref<ChatTier>
  routeContext?: Ref<{ type: 'asset' | 'crypto' | 'tesouro' | 'home' | null; ticker?: string } | null>
  initialSessionId?: string
}

export function useChatStream(opts: UseChatStreamOptions) {
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  const sessionId = ref<string | null>(opts.initialSessionId ?? null)
  let abortController: AbortController | null = null

  // ---- Helpers --------------------------------------------------
  function pushUser(content: string, meta?: ChatMessageMeta) {
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'user',
      content,
      citations: [],
      assetCards: [],
      toolCalls: [],
      artifacts: [],
      forms: [],
      status: 'complete',
      createdAt: new Date().toISOString(),
      meta,
    })
  }

  function startAssistant(): ChatMessage {
    const m: ChatMessage = reactive({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      citations: [],
      assetCards: [],
      toolCalls: [],
      artifacts: [],
      forms: [],
      status: 'streaming',
      createdAt: new Date().toISOString(),
    }) as ChatMessage
    messages.value.push(m)
    return m
  }

  // ---- Stop -----------------------------------------------------
  function stop() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    isStreaming.value = false
  }

  // ---- Reset ----------------------------------------------------
  function reset() {
    stop()
    messages.value = []
    error.value = null
    sessionId.value = null
  }

  /**
   * Returns `Authorization: Bearer ${token}` when the user is logged in.
   * The chat-service validates the token via Laravel /api/auth/me;
   * without it, the request hits the hard-auth gate and 401s.
   */
  function authHeaders(): Record<string, string> {
    const authStore = useAuthStore()
    return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
  }

  // ---- Load history --------------------------------------------
  async function loadSession(id: string) {
    try {
      const r = await $fetch<{
        session: { id: string; tier?: string }
        messages: Array<{
          id: string
          role: string
          content: string | null
          citations: ChatCitation[]
          artifacts: ChatArtifact[]
          createdAt: string
          tool_name?: string | null
          meta?: ChatMessageMeta | null
        }>
      }>(`/api/chat/sessions/${id}`, {
        headers: { ...authHeaders(), ...chatClientIdHeaders() },
      })
      // Restore the tier into the picker — sessions are sticky per
      // tier. If the session was created in MAX, the whole chat
      // visual stays MAX.
      const restored = r.session.tier === 'max' ? 'max' : 'basic'
      if (opts.tier) opts.tier.value = restored as ChatTier
      sessionId.value = r.session.id
      // Group consecutive same-role messages and collapse assistant
      // blocks to a single message. Two cases this fixes:
      //   1. Legacy: N assistant rows with identical content (one per
      //      parallel tool call).
      //   2. Multi-iter: the LLM frequently repeats its intro across
      //      tool-call iterations — iter0="Perfeito.", iter1=
      //      "Perfeito. + full portfolio". We keep ONLY the longest
      //      text in the block (it almost always supersedes the
      //      shorter ones). Tool messages are filtered out earlier.
      const visible = r.messages.filter((m) => m.role === 'user' || m.role === 'assistant')
      const collapsed: typeof visible = []
      let i = 0
      while (i < visible.length) {
        const role = visible[i]!.role
        let j = i
        while (j < visible.length && visible[j]!.role === role) j++
        const block = visible.slice(i, j)
        if (role === 'user') {
          collapsed.push(...block)
        } else {
          // assistant block — keep only the longest non-empty content
          const withContent = block.filter((m) => (m.content ?? '').trim().length > 0)
          if (withContent.length > 0) {
            const longest = withContent.reduce((a, b) =>
              (b.content ?? '').length > (a.content ?? '').length ? b : a,
            )
            collapsed.push(longest)
          }
        }
        i = j
      }
      messages.value = collapsed.map((m) => {
        // Prefer the persisted `meta` from the server (form-response
        // marker, attachment chips, etc). Fall back to legacy
        // markdown-bullet sniffing for old rows that predate the
        // `meta` column.
        let meta: ChatMessageMeta | undefined
        if (m.role === 'user') {
          const persisted = m.meta as ChatMessageMeta | null | undefined
          if (
            persisted &&
            (persisted.kind || persisted.fields || persisted.attachments?.length)
          ) {
            meta = persisted
          } else {
            meta = detectLegacyFormResponse(m.content ?? '')
          }
        }
        return {
          id: m.id,
          role: m.role as ChatRole,
          content: m.content ?? '',
          citations: m.citations ?? [],
          assetCards: [],
          toolCalls: [],
          artifacts: m.artifacts ?? [],
          forms: [],
          status: 'complete' as const,
          createdAt: m.createdAt,
          meta,
        }
      })
    } catch (err) {
      error.value = String(err)
    }
  }

  // ---- Send -----------------------------------------------------
  /**
   * Send a message to the chat-service. Accepts either a plain string
   * (regular user typing) or a structured payload (form submission,
   * file attachments, etc) that carries metadata used by the renderer
   * to lay out the user message differently.
   *
   * When `attachments` is provided, each entry is forwarded verbatim
   * to the backend which decodes it, runs the MIME-appropriate parser
   * (pdf-parse, ExcelJS, plain decode), and injects the extracted
   * content into the LLM input for this turn only. Image attachments
   * are forwarded as data URLs and the agent constructs an OpenAI
   * multimodal message.
   */
  async function send(
    payload:
      | string
      | {
          text: string
          formId?: string
          fields?: Array<{ id: string; label: string; value: string }>
          formTitle?: string
          attachments?: ChatAttachment[]
          /** Internal: marks this call as the silent retry after a
           *  401-then-refreshed handshake. Prevents the retry from
           *  itself triggering yet another refresh on a real
           *  401-token-expired (which would loop). */
          _isRetry?: boolean
        },
  ) {
    if (isStreaming.value) return
    const message = typeof payload === 'string' ? payload : payload.text
    const attachments = typeof payload === 'string' ? [] : (payload.attachments ?? [])
    const payloadHasBeenRetried =
      typeof payload === 'string' ? false : payload._isRetry === true
    // Helper to re-issue the same payload after a successful silent
    // refresh — flips the `_isRetry` flag so this retry doesn't loop
    // if the chat-service rejects again.
    const retrySend = async () => {
      const retried = typeof payload === 'string'
        ? { text: payload, _isRetry: true }
        : { ...payload, _isRetry: true }
      return send(retried)
    }
    // Allow empty `message` if the user only attached files (the LLM
    // will be instructed to summarise/inspect the attachment).
    if (!message.trim() && attachments.length === 0) return
    const meta: ChatMessageMeta | undefined =
      typeof payload === 'string'
        ? undefined
        : {
            kind: payload.formId ? 'form_response' : 'free_text',
            formId: payload.formId,
            fields: payload.fields,
            formTitle: payload.formTitle,
            attachments:
              attachments.length > 0
                ? attachments.map((a) => ({
                    id: a.id,
                    name: a.name,
                    mime: a.mime,
                    size: a.size,
                    kind: a.kind,
                  }))
                : undefined,
          }

    error.value = null
    pushUser(message, meta)
    const assistant = startAssistant()
    isStreaming.value = true

    abortController = new AbortController()

    try {
      // Forward the user's Sanctum token so the chat-service can
      // validate identity via Laravel /api/auth/me. Without this the
      // Bun server treats the request as anonymous and the new
      // hard-auth gate returns 401.
      const authStore = useAuthStore()
      const authHeader = authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}

      // Endpoint resolution. Production browsers can hit the chat-service
      // directly — chat-service CORS already allow-lists *.vercel.app,
      // *.redentia.com.br, *.saraivada.com. Going direct avoids the
      // Vercel serverless function buffering / timing out long SSE
      // streams. Toggle via `NUXT_PUBLIC_CHAT_DIRECT_URL` (set in Vercel
      // env to e.g. https://redentia-api.saraivada.com/chat to force
      // direct mode in production).
      const cfg = useRuntimeConfig()
      const directUrl = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
      const url =
        import.meta.client && directUrl ? `${directUrl}/stream` : '/api/chat/stream'

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...authHeader,
          ...chatClientIdHeaders(),
        },
        credentials: 'include',
        signal: abortController.signal,
        body: JSON.stringify({
          // omit sessionId entirely on first send — backend Zod schema
          // accepts `string | undefined`, NOT null
          sessionId: sessionId.value ?? undefined,
          message,
          tenantSlug: opts.tenantSlug,
          tier: opts.tier?.value ?? 'basic',
          routeContext: opts.routeContext?.value ?? undefined,
          attachments:
            attachments.length > 0
              ? attachments.map((a) => ({
                  name: a.name,
                  mime: a.mime,
                  size: a.size,
                  kind: a.kind,
                  content: a.content,
                }))
              : undefined,
        }),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        let backendMessage: string | undefined
        try {
          const parsed = JSON.parse(text) as { error?: string; message?: string }
          backendMessage = parsed.message ?? parsed.error
        } catch {
          backendMessage = text.slice(0, 300) || undefined
        }

        // 401 auto-recovery — when the chat-service rejects the token
        // (Sanctum expired, Laravel reissued tokens, etc.), give the
        // user one transparent retry: refresh the local token by
        // calling Laravel's /api/auth/me ourselves. If that succeeds,
        // the auth store re-stores the (still-valid) token and we
        // re-send the message. If /me also rejects, only THEN do we
        // surface "sessão expirou".
        if (response.status === 401 && authStore.token && !payloadHasBeenRetried) {
          // eslint-disable-next-line no-console
          console.warn('[useChatStream] got 401 — attempting silent token refresh')
          try {
            const meResponse = await $fetch<{ user?: { id?: number; name?: string } } | { data?: { user?: unknown } }>(
              '/api/auth/me',
              {
                method: 'GET',
                headers: { Authorization: `Bearer ${authStore.token}` },
                baseURL: useRuntimeConfig().public.apiBaseUrl as string,
              },
            ).catch(() => null)
            if (meResponse) {
              // Token still valid at Laravel — chat-service was just
              // out of sync. Retry once.
              isStreaming.value = false
              // Drop the placeholder assistant message we created up
              // front so the retry doesn't leave a ghost row.
              const idx = messages.value.findIndex((m) => m.id === assistant.id)
              if (idx >= 0) messages.value.splice(idx, 1)
              return await retrySend()
            }
            // /me also said 401 → token actually expired. Clear and
            // bounce to login.
            // eslint-disable-next-line no-console
            console.warn('[useChatStream] /me also rejected — token expired, clearing')
            authStore.clearAuthData()
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[useChatStream] /me refresh attempt errored', e)
          }
        }

        const friendly = humanizeChatError(response.status, backendMessage, !!authStore.token)
        // Surface the full diagnostic in the console for the dev/preview
        // pane — easier to debug than a generic toast.
        // eslint-disable-next-line no-console
        console.error('[useChatStream] request failed', {
          url,
          status: response.status,
          backendMessage,
          hadToken: !!authStore.token,
        })
        assistant.status = 'error'
        assistant.error = friendly
        error.value = friendly
        isStreaming.value = false
        return
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No body reader')
      const decoder = new TextDecoder()
      let buffer = ''

      // Stream-stall detection on the client side. The agent sends
      // `: keepalive` SSE comments every 25s; if more than ~40s pass
      // without ANY bytes arriving, the connection is silently
      // broken (Cloudflare cut, server crash, ISP middlebox). We
      // abort and mark the message as errored instead of leaving
      // the spinner running forever.
      let lastByteAt = Date.now()
      const stallTimer = setInterval(() => {
        if (Date.now() - lastByteAt > 40_000 && abortController) {
          // eslint-disable-next-line no-console
          console.warn('[useChatStream] no bytes for 40s — assuming stalled, aborting')
          abortController.abort()
        }
      }, 5_000)

      // Track whether the server emitted message.end before the
      // reader closed. If we hit `done` without it, the connection
      // was cut mid-flight (server crash, proxy drop, etc.) — flag
      // as recoverable error rather than silently marking complete.
      let sawMessageEnd = false
      const handleFrame = (raw: string) => {
        // peek for a message.end event so we can flip the flag
        if (raw.includes('event: message.end')) sawMessageEnd = true
        handleSSEFrame(assistant, raw)
      }

      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          lastByteAt = Date.now()
          buffer += decoder.decode(value, { stream: true })

          // SSE framing: events are separated by blank lines (\n\n).
          let idx
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const raw = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 2)
            handleFrame(raw)
          }
        }
      } finally {
        clearInterval(stallTimer)
      }

      if (!sawMessageEnd && !error.value) {
        // The reader closed cleanly but we never saw the terminating
        // `message.end` — likely an upstream stall or proxy drop.
        // Surface as a recoverable error so the user knows to retry.
        const friendly =
          'A resposta foi interrompida antes de terminar. Tente reenviar a pergunta.'
        assistant.status = 'error'
        assistant.error = friendly
        error.value = friendly
      } else {
        assistant.status = 'complete'
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        assistant.status = 'complete'
      } else {
        // Diagnostic console output — `fetch()` throws on CORS, DNS,
        // connection-reset and other pre-response failures. The
        // browser strips the cause to a single useless string ("Failed
        // to fetch"), so we have to enrich here.
        const e = err as Error
        const isFailedToFetch =
          e.name === 'TypeError' && /Failed to fetch|Load failed|NetworkError/i.test(e.message)
        const totalAttachmentBytes = attachments.reduce(
          (s, a) => s + (a.content?.length ?? 0),
          0,
        )
        // eslint-disable-next-line no-console
        console.error('[useChatStream] fetch threw', {
          name: e.name,
          message: e.message,
          attachmentCount: attachments.length,
          attachmentBytesApprox: totalAttachmentBytes,
          hadToken: !!useAuthStore().token,
        })
        const friendly = isFailedToFetch
          ? totalAttachmentBytes > 5_000_000
            ? 'Os arquivos são pesados demais para a rede. Tente reduzir ou remover algum.'
            : 'Não consegui falar com o servidor. Verifique sua conexão e tente de novo.'
          : `Erro: ${e.message}`
        assistant.status = 'error'
        assistant.error = friendly
        error.value = friendly
      }
    } finally {
      isStreaming.value = false
      abortController = null
    }
  }

  /**
   * Translate an HTTP failure into a user-friendly message. We
   * intentionally show the *real* status when we don't recognise
   * it — a generic "http_error" string makes debugging miserable.
   */
  function humanizeChatError(
    status: number,
    backendMessage: string | undefined,
    hadToken: boolean,
  ): string {
    if (status === 401 || status === 419) {
      return hadToken
        ? 'Sua sessão expirou. Faça login novamente.'
        : 'Faça login para conversar com a IA.'
    }
    if (status === 403) return 'Você não tem permissão para acessar esta conversa.'
    if (status === 404) return 'Conversa não encontrada.'
    if (status === 429) return backendMessage ?? 'Limite de mensagens atingido. Tente em alguns minutos.'
    if (status >= 500) return 'O serviço de IA está temporariamente indisponível. Tente novamente.'
    if (backendMessage) return `Erro ${status}: ${backendMessage}`
    return `Erro ${status} ao falar com a IA.`
  }

  /**
   * Sniff a markdown-bullet user message ("**Title**\n- **a**: x ...")
   * and turn it into form_response metadata so old sessions render
   * with the compact pill instead of as a giant heading.
   */
  function detectLegacyFormResponse(content: string): ChatMessageMeta | undefined {
    if (!content) return undefined
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length < 3) return undefined
    const titleMatch = lines[0]?.match(/^\*\*(.+?)\*\*$/)
    if (!titleMatch) return undefined
    const fields: Array<{ id: string; label: string; value: string }> = []
    for (let i = 1; i < lines.length; i++) {
      const m = lines[i]?.match(/^-\s*\*\*(.+?)\*\*:\s*(.+)$/)
      if (!m) continue
      fields.push({
        id: m[1]!.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40),
        label: m[1]!,
        value: m[2]!,
      })
    }
    if (fields.length < 3) return undefined
    return {
      kind: 'form_response',
      formTitle: titleMatch[1],
      fields,
    }
  }

  function handleSSEFrame(assistant: ChatMessage, raw: string) {
    let eventName = 'message'
    const dataLines: string[] = []
    for (const line of raw.split('\n')) {
      if (line.startsWith(':')) continue // comment/heartbeat
      if (line.startsWith('event:')) eventName = line.slice(6).trim()
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
    }
    if (dataLines.length === 0) return
    const dataStr = dataLines.join('\n')
    let data: any
    try {
      data = JSON.parse(dataStr)
    } catch {
      return
    }
    handleEvent(assistant, eventName, data)
  }

  function handleEvent(assistant: ChatMessage, name: string, data: any) {
    switch (name) {
      case 'session.start':
        if (!sessionId.value) sessionId.value = data.sessionId
        assistant.id = data.messageId ?? assistant.id
        // Preserve only the public tier identity. Don't store the
        // raw `data.model` — we never want to display the provider
        // name in the UI.
        if (data.tier === 'basic' || data.tier === 'max') {
          assistant.tier = data.tier
        }
        if (typeof data.tierLabel === 'string') {
          assistant.tierLabel = data.tierLabel
        }
        break
      case 'text.delta':
        assistant.content += data.content ?? ''
        break
      case 'tool.start': {
        assistant.toolCalls.push({
          callId: data.callId,
          name: data.name,
          args: data.args ?? {},
          status: 'running',
        })
        break
      }
      case 'tool.result': {
        const tc = assistant.toolCalls.find((t) => t.callId === data.callId)
        if (tc) {
          tc.status = data.error ? 'error' : 'success'
          tc.result = data.result
          tc.error = data.error
          tc.durationMs = data.durationMs
        }
        break
      }
      case 'citation.add':
        assistant.citations.push(data)
        break
      case 'asset.card':
        assistant.assetCards.push(data)
        break
      case 'artifact.start':
        assistant.artifacts.push({
          id: data.id,
          type: data.type,
          title: data.title,
          filename: data.filename,
          downloadUrl: data.downloadUrl,
        })
        break
      case 'artifact.delta': {
        const art = assistant.artifacts.find((a) => a.id === data.id)
        if (art) art.content = (art.content ?? '') + (data.content ?? '')
        break
      }
      case 'artifact.end':
        // no-op for now
        break
      case 'form.show': {
        // Backend rendered a structured questionnaire — the UI shows
        // real inputs (radio/select/text) instead of markdown bullets.
        const form: ChatForm = {
          formId: data.formId,
          title: data.title,
          intro: data.intro,
          questions: Array.isArray(data.questions) ? data.questions : [],
          submitLabel: data.submitLabel ?? 'Enviar respostas',
          submitted: false,
        }
        assistant.forms.push(form)
        break
      }
      case 'followups':
        assistant.followups = data.suggestions
        break
      case 'message.end':
        assistant.status = 'complete'
        break
      case 'error':
        assistant.status = 'error'
        assistant.error = data.message
        error.value = data.message
        break
    }
  }

  // ---- Computed conveniences -----------------------------------
  const lastAssistant = computed(() => {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      const m = messages.value[i]
      if (m && m.role === 'assistant') return m
    }
    return null
  })

  const sources = computed(() => lastAssistant.value?.citations ?? [])

  return {
    messages,
    isStreaming,
    sessionId,
    error,
    sources,
    lastAssistant,
    send,
    stop,
    reset,
    loadSession,
  }
}
