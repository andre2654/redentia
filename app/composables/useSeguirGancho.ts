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
 * Quem entrou por celular não tem e-mail, e o resumo do Backend sai por
 * e-mail: pra essa pessoa a promessa troca pela que o produto cumpre (a lista
 * na página inicial), em vez de prometer um e-mail que nunca chega.
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

export function useSeguirGancho(atual?: MaybeRefOrGetter<string | null | undefined>) {
  const wl = useWatchlist()
  const { isAuthenticated } = useAuthState()
  const me = useMeCliente()

  const fase = ref<'oculto' | 'ativo' | 'pronto'>('oculto')
  const comEmail = ref(false)
  const chips = ref<string[]>([])
  const erro = ref('')
  const quando = ref('')
  let userId: number | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  const progresso = computed(() => Math.min(wl.count.value, META))

  function montarChips() {
    const cur = toValue(atual)?.trim().toUpperCase()
    const ordem = [...(cur ? [cur] : []), ...lerVistos(), ...POPULARES]
    chips.value = [...new Set(ordem)].slice(0, MAX_CHIPS)
  }

  async function avaliar() {
    fase.value = 'oculto'
    if (!isAuthenticated.value) return
    const u = (await me.load())?.user
    if (!u?.id) return
    userId = u.id
    comEmail.value = typeof u.email === 'string' && u.email.includes('@')
    if (lerMarca(u.id) || !contaRecente(u.created_at)) return
    await wl.load()
    if (!wl.ready.value || wl.count.value >= META) return
    montarChips()
    fase.value = 'ativo'
  }

  onMounted(avaliar)
  onBeforeUnmount(() => clearTimeout(timer))

  // chegou a 3 CONFIRMADOS (pelos chips OU pelo botão do hero): confirma e
  // sai de cena. O progresso na tela é otimista; a conclusão, não — um follow
  // barrado (limite do plano, rede) volta a barra pra 2/3 e o card fica.
  watch(() => wl.settledCount.value, (n) => {
    if (fase.value !== 'ativo' || n < META) return
    quando.value = proximoResumo()
    fase.value = 'pronto'
    if (userId) gravarMarca(userId, 'concluido')
    timer = setTimeout(() => { fase.value = 'oculto' }, 6000)
  })
  // sessão assumida depois da hidratação (HIT da borda) ou encerrada: reavalia
  watch(isAuthenticated, (v) => {
    if (v) void avaliar()
    else fase.value = 'oculto'
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
