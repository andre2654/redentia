/**
 * "Seguir" ativos — estado único da lista do usuário (watchlist do Laravel).
 *
 * POR QUE EXISTE (29/09/2026): dos 102 cadastros do mês, 0% seguia ativo. A API
 * existia desde o Atlas; o front não tinha botão. Este composable é a fonte
 * reativa que o botão do hero (/asset e /dividendos), o gancho do primeiro uso
 * e a faixa "Seus ativos" da home leem juntos: seguir num lugar acende a
 * estrela nos outros sem refetch.
 *
 * Regras que o resto do arquivo segue:
 *  - CLIENT-ONLY. /asset e /dividendos são SSR públicos com cache de borda (e
 *    CDN não varia por cookie): o HTML sai igual pra todo mundo, com a estrela
 *    apagada, e o estado real hidrata depois do mount. Nada aqui roda no SSR.
 *  - A lista pertence a um TOKEN. Trocou a sessão (login, logout, 401), a lista
 *    anterior deixa de valer na hora — nunca mostra a lista de outra conta.
 *  - Otimista com rollback: o clique acende a estrela antes da resposta; erro
 *    desfaz SÓ aquele ticker (dois toques seguidos nos chips do gancho não se
 *    desfazem um ao outro).
 *  - Mensagem de erro: limite do plano e 422 saem COMO A API MANDOU; o resto
 *    vira frase em português com a saída (DESIGN-SYSTEM §7.3).
 */
import type { SeguirResult, WatchlistEntry, WatchlistErrorApi, WatchlistItemApi } from '~/types/watchlist'
import type { TickerProfileApi } from '~/types/acao'

const CLIENT_BASE = '/api/backend'

interface WatchlistState {
  /** token dono da lista carregada */
  token: string | null
  /** null = ainda não carregada (ou a carga falhou) */
  items: WatchlistEntry[] | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  /** tickers com POST/DELETE em voo (trava o clique duplo) */
  pending: string[]
}

// Promessa de carga e cache de perfis: SÓ no client (no servidor o módulo é
// compartilhado entre requests). Dedupe entre o botão, o gancho e a faixa.
// O cache é por TICKER (dado público do /tickers/{t}), não por usuário: trocar
// de conta na mesma aba reaproveita a cotação já buscada.
let inflight: { token: string; promise: Promise<void> } | null = null
const profileCache = new Map<string, Partial<WatchlistEntry> | null>()

const SMALL_WORDS = new Set(['de', 'do', 'da', 'dos', 'das', 'e'])
/**
 * Nome curto do card. O `name` do /tickers vem no formato FIXO da B3: campo de
 * 12 caracteres + código de classe colado ('PETROBRAS   PN      N2',
 * 'ITAUUNIBANCOPN  EJ  N1', 'FII MAXI RENCI  ER'). Campo com folga no fim é o
 * nome inteiro ('Petrobras'); campo cheio é nome CORTADO ('ITAUUNIBANCO',
 * 'FII MAXI REN') e aí o card mostra só o ticker, em vez de um nome errado.
 * Nome que não está no formato ('EMBRAER', 'Axia Energia') passa inteiro.
 */
function nomeLimpo(raw: string | null | undefined): string | null {
  const s = String(raw ?? '').replace(/\s+$/, '')
  if (!s) return null
  const b3 = /^(.{12})(ON|PN[ABC]?|UNT|UNS|CI|DR[N123]|ER|ES)\b/.exec(s)
  if (b3 && !/\s$/.test(b3[1]!)) return null
  // 'FII KINEA' → 'Kinea': o prefixo é classe, não nome
  const head = (b3 ? b3[1]! : s).replace(/\s+/g, ' ').trim().replace(/^FII /i, '')
  if (!head) return null
  return head
    .toLowerCase()
    .split(' ')
    .map((w) => (SMALL_WORDS.has(w) ? w : /[./]/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

function numOrNull(x: unknown): number | null {
  if (x == null || x === '') return null
  const n = Number(x)
  return Number.isFinite(n) ? n : null
}

function strOrNull(x: unknown): string | null {
  return typeof x === 'string' && x.trim() ? x.trim() : null
}

function toEntry(api: WatchlistItemApi): WatchlistEntry {
  return {
    ticker: String(api.ticker ?? '').trim().toUpperCase(),
    addedAt: strOrNull(api.added_at),
    name: nomeLimpo(api.name),
    logo: strOrNull(api.logo),
    type: strOrNull(api.type),
    price: numOrNull(api.market_price),
    changePct: numOrNull(api.change_percent),
    priceAt: strOrNull(api.price_at),
  }
}

function blankEntry(ticker: string): WatchlistEntry {
  return { ticker, addedAt: new Date().toISOString(), name: null, logo: null, type: null, price: null, changePct: null, priceAt: null }
}

/** Campo novo só entra quando vem preenchido: item "magro" do POST não apaga cotação já conhecida. */
function mergeEntry(a: WatchlistEntry, b: Partial<WatchlistEntry>): WatchlistEntry {
  const out = { ...a }
  for (const [k, v] of Object.entries(b) as [keyof WatchlistEntry, WatchlistEntry[keyof WatchlistEntry]][]) {
    if (v != null && v !== '') (out as Record<string, unknown>)[k] = v
  }
  return out
}

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

export function useWatchlist() {
  const { token, clearSession } = useAuthState()
  const state = useState<WatchlistState>('nu:watchlist', () => ({ token: null, items: null, status: 'idle', pending: [] }))

  /** A lista só existe pro token atual (null = desconhecida). */
  const items = computed<WatchlistEntry[] | null>(() =>
    state.value.token && state.value.token === token.value ? state.value.items : null)
  const ready = computed(() => items.value !== null)
  const count = computed(() => items.value?.length ?? 0)
  /**
   * Seguidos CONFIRMADOS pelo backend: fora o que está com request em voo. O
   * `count` é otimista (a estrela acende antes da resposta); quem decide algo
   * irreversível — o "Pronto" do gancho grava a conclusão — espera este aqui,
   * senão um 3º follow barrado pelo limite do plano concluía o gancho.
   */
  const settledCount = computed(() => (items.value ?? []).filter((i) => !state.value.pending.includes(i.ticker)).length)
  const followed = computed(() => new Set((items.value ?? []).map((i) => i.ticker)))

  function isFollowing(ticker: string): boolean {
    return followed.value.has(ticker.toUpperCase())
  }
  function isPending(ticker: string): boolean {
    return state.value.pending.includes(ticker.toUpperCase())
  }
  function setPending(ticker: string, on: boolean) {
    const rest = state.value.pending.filter((t) => t !== ticker)
    state.value.pending = on ? [...rest, ticker] : rest
  }

  function headers(tk: string) {
    return { Accept: 'application/json', Authorization: `Bearer ${tk}` }
  }

  /** Lista em memória SE for do token `tk` (null = desconhecida ou de outra sessão). */
  function listOf(tk: string): WatchlistEntry[] | null {
    return state.value.token === tk ? state.value.items : null
  }
  function setList(tk: string, next: WatchlistEntry[]) {
    if (state.value.token === tk) state.value.items = next
  }

  /**
   * Erro de POST/DELETE → o que a tela mostra. Ordem importa: o limite do plano
   * é checado ANTES do 403, senão um "plano estourado" servido como 403 viraria
   * logout.
   */
  function failure(e: unknown, fallback: string): SeguirResult {
    const status = statusOf(e)
    const body = ((e as { data?: WatchlistErrorApi } | null)?.data ?? null) as WatchlistErrorApi | null
    const apiMsg = typeof body?.message === 'string' ? body.message.trim() : ''
    if (apiMsg && (body?.plan_required || body?.limit_key)) return { ok: false, status, message: apiMsg, auth: false }
    if (status === 401 || status === 403) {
      clearSession()
      return { ok: false, status, message: '', auth: true }
    }
    if (status === 422 && apiMsg) return { ok: false, status, message: apiMsg, auth: false }
    return { ok: false, status, message: fallback, auth: false }
  }

  /** GET /watchlist (1 por token; `force` recarrega mantendo a lista na tela). */
  function load(force = false): Promise<void> {
    if (import.meta.server) return Promise.resolve()
    const tk = token.value
    if (!tk) return Promise.resolve()
    if (!force && state.value.token === tk && state.value.status === 'ready') return Promise.resolve()
    if (inflight?.token === tk) return inflight.promise
    if (state.value.token !== tk) state.value = { token: tk, items: null, status: 'loading', pending: [] }
    else state.value.status = 'loading'
    const promise: Promise<void> = watchlistFetchAll(CLIENT_BASE, headers(tk))
      .then((res) => {
        if (token.value !== tk) return
        state.value.items = (res?.items ?? []).map(toEntry).filter((i) => i.ticker)
        state.value.status = 'ready'
      })
      .catch((e: unknown) => {
        if (token.value !== tk) return
        const s = statusOf(e)
        if (s === 401 || s === 403) clearSession()
        state.value.status = 'error'
      })
      .finally(() => {
        if (inflight?.promise === promise) inflight = null
      })
    inflight = { token: tk, promise }
    return promise
  }

  async function follow(raw: string): Promise<SeguirResult> {
    const t = raw.trim().toUpperCase()
    const tk = token.value
    if (!tk) return { ok: false, status: 401, message: '', auth: true }
    const had = isFollowing(t)
    const known = listOf(tk)
    if (!had && known) setList(tk, [blankEntry(t), ...known])
    setPending(t, true)
    try {
      const res = await watchlistAdd(CLIENT_BASE, headers(tk), t)
      const now = listOf(tk)
      if (now && res?.item) {
        const fresh = toEntry(res.item)
        setList(tk, now.map((i) => (i.ticker === t ? mergeEntry(i, { ...fresh, ticker: t }) : i)))
      }
      // lista desconhecida (a carga tinha falhado): sincroniza em vez de chutar a contagem
      if (!known) void load(true)
      return { ok: true, following: true }
    } catch (e) {
      const now = listOf(tk)
      if (!had && now) setList(tk, now.filter((i) => i.ticker !== t))
      return failure(e, `Não conseguimos seguir ${t} agora. Tente de novo em instantes.`)
    } finally {
      setPending(t, false)
    }
  }

  async function unfollow(raw: string): Promise<SeguirResult> {
    const t = raw.trim().toUpperCase()
    const tk = token.value
    if (!tk) return { ok: false, status: 401, message: '', auth: true }
    const list = listOf(tk)
    const idx = list ? list.findIndex((i) => i.ticker === t) : -1
    const removed = list && idx >= 0 ? list[idx]! : null
    if (list && removed) setList(tk, list.filter((i) => i.ticker !== t))
    setPending(t, true)
    try {
      await watchlistRemove(CLIENT_BASE, headers(tk), t)
      return { ok: true, following: false }
    } catch (e) {
      // 404 = já não estava na lista: o estado final é o pedido
      if (statusOf(e) === 404) return { ok: true, following: false }
      const now = listOf(tk)
      if (removed && now && !now.some((i) => i.ticker === t)) {
        const next = [...now]
        next.splice(Math.min(idx, next.length), 0, removed)
        setList(tk, next)
      }
      return failure(e, `Não conseguimos deixar de seguir ${t} agora. Tente de novo em instantes.`)
    } finally {
      setPending(t, false)
    }
  }

  /**
   * Degradação até o Backend enriquecer o GET /watchlist: item sem cotação
   * busca o perfil público (GET /tickers/{t}, o mesmo do /asset), 3 por
   * vez e uma vez por ticker na sessão. Falhou → o card fica só com o ticker
   * (dado que falta some; nunca zero).
   */
  async function enrich(): Promise<void> {
    if (import.meta.server) return
    const apply = (t: string, patch: Partial<WatchlistEntry>) => {
      if (state.value.items) state.value.items = state.value.items.map((i) => (i.ticker === t ? mergeEntry(i, patch) : i))
    }
    // só falta de COTAÇÃO dispara busca: nome é secundário (e nome cortado da B3 some de propósito)
    const missing = (items.value ?? []).filter((i) => i.price == null).map((i) => i.ticker)
    const queue: string[] = []
    for (const t of missing) {
      if (!profileCache.has(t)) queue.push(t)
      else if (profileCache.get(t)) apply(t, profileCache.get(t)!)
    }
    if (!queue.length) return
    queue.forEach((t) => profileCache.set(t, null)) // em voo: ninguém busca de novo
    async function worker() {
      while (queue.length) {
        const t = queue.shift()!
        try {
          const p = (await acaoFetchProfile(CLIENT_BASE, t))?.data as TickerProfileApi | undefined
          if (!p) continue
          const patch: Partial<WatchlistEntry> = {
            name: nomeLimpo(p.name),
            logo: strOrNull(p.logo),
            type: strOrNull(p.type),
            price: numOrNull(p.market_price),
            changePct: numOrNull(p.change_percent),
            priceAt: strOrNull(p.price_at),
          }
          profileCache.set(t, patch)
          apply(t, patch)
        } catch { /* sem perfil (cripto, código morto): o card fica só com o ticker */ }
      }
    }
    await Promise.all([worker(), worker(), worker()])
  }

  return { items, ready, count, settledCount, status: computed(() => state.value.status), isFollowing, isPending, load, follow, unfollow, enrich }
}

/**
 * Botão "Seguir" de UM ativo (hero do /asset e do /dividendos).
 *  - anônimo: vai pro /login levando a intenção (`?redirect=<página>?seguir=1`);
 *  - volta logado com `?seguir=1`: segue UMA vez, limpa o parâmetro com
 *    router.replace ANTES de qualquer await (recarregar não repete) e confirma
 *    "Você está seguindo {T}";
 *  - sessão morta no meio (401/403): mesmo caminho do anônimo, com a intenção.
 * Retorno curto inline ao lado do botão (o app não tem toast: DESIGN-SYSTEM
 * §7.3). Confirmação de clique some em 3,5 s; a da intenção fica, porque o
 * onboarding obrigatório de conta nova costuma abrir por cima nessa hora.
 */
export function useSeguirAtivo(ticker: MaybeRefOrGetter<string>, path: MaybeRefOrGetter<string>) {
  const wl = useWatchlist()
  const { isAuthenticated } = useAuthState()
  const route = useRoute()
  const router = useRouter()

  const t = computed(() => toValue(ticker).trim().toUpperCase())
  const following = computed(() => wl.isFollowing(t.value))
  const pending = computed(() => wl.isPending(t.value))
  const feedback = ref<{ text: string; kind: 'ok' | 'error' } | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined

  function show(text: string, kind: 'ok' | 'error', ms = 0) {
    clearTimeout(timer)
    feedback.value = text ? { text, kind } : null
    if (text && ms > 0) timer = setTimeout(() => { feedback.value = null }, ms)
  }

  function toLogin() {
    return navigateTo(`/login?redirect=${encodeURIComponent(`${toValue(path)}?seguir=1`)}`)
  }

  async function act(want: boolean, sticky: boolean) {
    const res = want ? await wl.follow(t.value) : await wl.unfollow(t.value)
    if (res.ok) show(want ? `Você está seguindo ${t.value}` : `Você deixou de seguir ${t.value}`, 'ok', sticky ? 0 : 3500)
    else if (res.auth) await toLogin()
    else show(res.message, 'error')
  }

  async function toggle() {
    if (!isAuthenticated.value) {
      await toLogin()
      return
    }
    if (pending.value) return
    await act(!following.value, false)
  }

  // Intenção do ?seguir=1 fica guardada até existir sessão. No HIT da borda
  // (HTML anônimo em cache servido a quem tem cookie) a sessão é assumida no
  // fim da hidratação (app.vue → assumirSessaoAdiada), antes deste onMounted,
  // e o watcher ainda roda depois dele: as duas chamadas dividem o mesmo
  // GET /watchlist (dedupe do load) e só a primeira consome a intenção
  // (`intencao = false` é síncrono logo depois do await) → 1 GET e 1 POST.
  // Sem guarda por token aqui de propósito: ela perderia a intenção se o
  // watcher rodasse antes do onMounted marcá-la.
  let intencao = false
  async function comSessao() {
    await wl.load()
    if (!intencao) return
    intencao = false
    if (wl.isFollowing(t.value)) show(`Você está seguindo ${t.value}`, 'ok')
    else await act(true, true)
  }

  onMounted(async () => {
    intencao = route.query.seguir === '1'
    if (intencao) {
      const rest = { ...route.query }
      delete rest.seguir
      await router.replace({ path: route.path, query: rest, hash: route.hash })
    }
    if (isAuthenticated.value) await comSessao()
  })
  watch(isAuthenticated, (v) => {
    if (v) void comSessao()
  })
  onBeforeUnmount(() => clearTimeout(timer))

  return { following, pending, toggle, feedback }
}
