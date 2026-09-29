/**
 * Gancho do primeiro uso: "Siga 3 ativos e receba um resumo deles no fim de
 * cada pregão, por e-mail." Card NÃO-modal no /asset e na home (29/09/2026).
 *
 * Quem vê: logado, conta criada há até 7 dias (`created_at` do GET /auth/me),
 * seguindo menos de 3 ativos, que não tocou em "Agora não" nem já concluiu.
 * Na dúvida (sem /auth/me, sem data válida, lista que não carregou) o card
 * NÃO aparece: não se pune o usuário com um pedido que talvez não valha.
 *
 * Uma coisa só: o card não pede nome, e-mail nem nada além do toque no chip.
 *
 * A PROMESSA DE E-MAIL só aparece quando o Backend vai cumpri-la. O resumo
 * (watchlist:send-digest) só sai pra e-mail VERIFICADO e com o tópico
 * `watchlist` de e-mail ligado — que o 1º follow liga sozinho, a não ser que
 * a pessoa já tenha recusado e-mail (descadastro, tópico desligado em /conta).
 * Então: `email_verified === true` no /auth/me (campo ausente = não
 * verificado) E, depois de um follow, `watchlist.email === true` no
 * GET /me/notification-preferences. Fora disso a copy troca pela que o
 * produto cumpre (a lista na página inicial). Quem ainda não segue nada vê
 * essa copy até o 1º follow confirmar o tópico.
 *
 * Chips: o ativo da página (no /asset), os últimos /asset visitados
 * (localStorage, gravado pelo AcaoHero) e, na falta, os populares. Cada toque
 * segue ou desfaz. 3/3 → "Pronto: você recebe o resumo …" e o card some.
 *
 * Nunca empilha com o modal do MCP: o NuMcpPromo trata a classe `.sgg` como
 * "via ocupada" e espera o card sair da tela.
 */

const META = 3
const MAX_CHIPS = 6
const POPULARES = ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'WEGE3', 'HGLG11', 'MXRF11', 'BOVA11']
const VISTOS_KEY = 'nu:ativos-vistos'
const VISTOS_MAX = 8
const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000

type Marca = 'dispensado' | 'concluido'

function lerVistos(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(VISTOS_KEY) ?? '[]')
    return Array.isArray(raw)
      ? raw.filter((x): x is string => typeof x === 'string' && /^[A-Z0-9-]{2,12}$/.test(x))
      : []
  } catch {
    return []
  }
}

/** Grava o /asset visitado (mais recente primeiro). Storage bloqueado: segue sem histórico. */
export function registrarAtivoVisto(ticker: string) {
  if (import.meta.server) return
  const t = ticker.trim().toUpperCase()
  if (!/^[A-Z0-9-]{2,12}$/.test(t)) return
  try {
    const next = [t, ...lerVistos().filter((x) => x !== t)].slice(0, VISTOS_MAX)
    localStorage.setItem(VISTOS_KEY, JSON.stringify(next))
  } catch { /* sem histórico: o gancho usa os populares */ }
}

function marcaKey(userId: number) {
  return `nu:gancho-seguir:${userId}`
}
function lerMarca(userId: number): Marca | null {
  try {
    const v = localStorage.getItem(marcaKey(userId))
    return v === 'dispensado' || v === 'concluido' ? v : null
  } catch {
    return null
  }
}
function gravarMarca(userId: number, v: Marca) {
  try { localStorage.setItem(marcaKey(userId), v) } catch { /* só não persiste */ }
}

/** Conta criada há até 7 dias. Sem data válida → false. */
function contaRecente(createdAt: unknown, now = Date.now()): boolean {
  const ms = typeof createdAt === 'string' ? Date.parse(createdAt) : Number.NaN
  if (!Number.isFinite(ms)) return false
  const idade = now - ms
  return idade > -60 * 60 * 1000 && idade <= SETE_DIAS_MS
}

/**
 * Quando sai o próximo resumo: dias úteis às 19h, no fuso de São Paulo (o
 * contrato do Backend). Feriado da B3 fica de fora — o front não tem o
 * calendário de pregão, e o caso comum é o dia útil.
 */
export function proximoResumo(now = new Date()): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', hourCycle: 'h23' })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  ) as Record<string, string>
  const dia = p.weekday ?? ''
  const hora = Number(p.hour)
  const util = dia !== 'Sat' && dia !== 'Sun'
  if (util && hora < 19) return 'hoje às 19h'
  if (dia === 'Fri' || dia === 'Sat') return 'na segunda às 19h'
  return 'amanhã às 19h'
}

/** GET /me/notification-preferences — só o tópico que o gancho promete. */
interface PrefsNotificacao {
  watchlist?: { email?: boolean }
}

export function useSeguirGancho(atual?: MaybeRefOrGetter<string | null | undefined>) {
  const wl = useWatchlist()
  const { isAuthenticated, token } = useAuthState()
  const { authFetch } = useApi()
  const me = useMeCliente()

  const fase = ref<'oculto' | 'ativo' | 'pronto'>('oculto')
  const emailVerificado = ref(false)
  /** `watchlist.email` lido DEPOIS de um follow; null = ainda não conferido */
  const topicoEmail = ref<boolean | null>(null)
  const comEmail = computed(() => emailVerificado.value && topicoEmail.value === true)
  const chips = ref<string[]>([])
  const erro = ref('')
  const quando = ref('')
  let userId: number | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  // 1 avaliação por sessão: a virada da sessão adiada (HIT da borda) chega
  // antes do onMounted e o watcher de isAuthenticated rodaria de novo.
  let avaliadoPara: string | null = null
  // 1 leitura do tópico por página: depois do 1º follow ele não muda sozinho
  // (o auto opt-in do Backend só age sem linha do tópico).
  let topicoPedido: Promise<void> | null = null

  const progresso = computed(() => Math.min(wl.count.value, META))

  function montarChips() {
    const cur = toValue(atual)?.trim().toUpperCase()
    const ordem = [...(cur ? [cur] : []), ...lerVistos(), ...POPULARES]
    chips.value = [...new Set(ordem)].slice(0, MAX_CHIPS)
  }

  /** Lê `watchlist.email` (1x). Erro ou tópico ausente → sem promessa. */
  function conferirTopico(): Promise<void> {
    if (!emailVerificado.value) return Promise.resolve()
    topicoPedido ??= authFetch<PrefsNotificacao>('/me/notification-preferences', {}, { redirectOnAuthError: false })
      .then((r) => { topicoEmail.value = r?.watchlist?.email === true })
      .catch(() => { topicoEmail.value = false })
    return topicoPedido
  }

  async function avaliar() {
    const tk = token.value
    if (!isAuthenticated.value || !tk || avaliadoPara === tk) return
    avaliadoPara = tk
    fase.value = 'oculto'
    const u = (await me.load())?.user
    if (!u?.id) return
    userId = u.id
    emailVerificado.value = u.email_verified === true
    if (lerMarca(u.id) || !contaRecente(u.created_at)) return
    await wl.load()
    if (!wl.ready.value || wl.count.value >= META) return
    // já segue algum: o 1º follow já passou, o tópico já diz se o e-mail vai
    if (wl.settledCount.value > 0) await conferirTopico()
    montarChips()
    fase.value = 'ativo'
  }

  onMounted(avaliar)
  onBeforeUnmount(() => clearTimeout(timer))

  // chegou a 3 CONFIRMADOS (pelos chips OU pelo botão do hero): confirma e
  // sai de cena. O progresso na tela é otimista; a conclusão, não — um follow
  // barrado (limite do plano, rede) volta a barra pra 2/3 e o card fica.
  // O 1º follow confirmado dispara a leitura do tópico (é ele que liga o
  // resumo); o "Pronto" espera essa leitura pra escolher a copy certa.
  watch(() => wl.settledCount.value, async (n) => {
    if (fase.value !== 'ativo') return
    if (n > 0) void conferirTopico()
    if (n < META) return
    await conferirTopico()
    if (fase.value !== 'ativo' || wl.settledCount.value < META) return
    quando.value = proximoResumo()
    fase.value = 'pronto'
    if (userId) gravarMarca(userId, 'concluido')
    timer = setTimeout(() => { fase.value = 'oculto' }, 6000)
  })
  // sessão que entra depois do mount ou que se encerra
  watch(isAuthenticated, (v) => {
    if (v) void avaliar()
    else {
      fase.value = 'oculto'
      avaliadoPara = null
    }
  })

  function dispensar() {
    if (userId) gravarMarca(userId, 'dispensado')
    fase.value = 'oculto'
  }

  async function alternar(t: string) {
    if (wl.isPending(t)) return
    erro.value = ''
    const res = wl.isFollowing(t) ? await wl.unfollow(t) : await wl.follow(t)
    if (!res.ok && !res.auth) erro.value = res.message
  }

  return {
    fase,
    chips,
    progresso,
    meta: META,
    comEmail,
    erro,
    quando,
    dispensar,
    alternar,
    isFollowing: wl.isFollowing,
    isPending: wl.isPending,
  }
}
