/**
 * O comportamento do header (02/11/2026, a direção "editorial calmo"):
 * encolher ao rolar, publicar a altura em --nuh-h, os painéis da nav, o menu
 * de conta e o menu do celular. O NuHeader só desenha.
 *
 * Encolher tem HISTERESE, como o NuHeader: encolhe passando de 72px e volta
 * só abaixo de 16px. Com um limiar só, a altura que some faz o scroll
 * re-cruzar a fronteira e o header pulsa.
 *
 * Os painéis são position: fixed e vão para o <body> (Teleport): o header
 * tem container-type (as larguras contam pelo contêiner), que vira bloco de
 * contenção de fixed: preso dentro dele, um painel abriria no lugar errado. Fecham ao rolar (a
 * âncora se move), com Escape e com clique fora.
 */
import type { NavChild, NavItem } from '~/utils/topo'
import { grupoAtivo, mercadoDoTopo, navDoTopo, ordenarCotacoes, rotaAtiva } from '~/utils/topo'

export type PainelDoTopo = { tipo: 'nav'; item: string } | { tipo: 'conta' }

export function useTopo(alturas: { normal: number; encolhido: number; celular?: { normal: number; encolhido: number } }) {
  const { isAuthenticated, initial, clearSession } = useAuthState()
  const route = useRoute()
  const nav = computed(() => navDoTopo(isAuthenticated.value))
  const ativo = (to: string) => rotaAtiva(route.path, to)
  const paiAtivo = (item: NavItem) => grupoAtivo(route.path, item)

  /* ——— encolher ——— */
  const shrunk = ref(false)
  let ultimoY = 0
  useNuScrollFrame(() => {
    const y = window.scrollY
    if (!shrunk.value && y > 72) shrunk.value = true
    else if (shrunk.value && y < 16) shrunk.value = false
    if (painel.value && Math.abs(y - ultimoY) > 4) fecharPainel()
    ultimoY = y
  })
  // no celular (até 640px, o mesmo corte do container query) a barra é outra
  let celular: MediaQueryList | null = null
  function publicarAltura() {
    const a = celular?.matches && alturas.celular ? alturas.celular : alturas
    document.documentElement.style.setProperty('--nuh-h', `${shrunk.value ? a.encolhido : a.normal}px`)
  }
  watch(shrunk, publicarAltura)
  onMounted(() => {
    celular = window.matchMedia('(max-width: 640px)')
    celular.addEventListener('change', publicarAltura)
    publicarAltura()
  })
  onBeforeUnmount(() => {
    celular?.removeEventListener('change', publicarAltura)
    document.documentElement.style.removeProperty('--nuh-h')
  })

  /* ——— painéis (nav, conta, mercado) ——— */
  const painel = ref<PainelDoTopo | null>(null)
  const pos = ref({ left: 0, top: 0, right: 0 })
  const filhoQuente = ref<NavChild | null>(null)
  let tAbre: ReturnType<typeof setTimeout> | null = null
  let tFecha: ReturnType<typeof setTimeout> | null = null
  let gatilho: HTMLElement | null = null

  const MEGA_W = 700
  const itemAberto = computed(() => {
    const p = painel.value
    return p?.tipo === 'nav' ? nav.value.find((i) => i.label === p.item) ?? null : null
  })
  function filhosDe(item: NavItem): NavChild[] {
    if (item.children) return item.children
    return [{ label: item.label, to: item.to!, desc: item.panel!.desc, vig: item.panel!.vig }]
  }
  function limparTimers() {
    if (tAbre) { clearTimeout(tAbre); tAbre = null }
    if (tFecha) { clearTimeout(tFecha); tFecha = null }
  }
  function ancorar(el: HTMLElement, largura: number, alinhar: 'esq' | 'dir' = 'esq') {
    const r = el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const left = alinhar === 'esq' ? r.left - 12 : r.right - largura
    pos.value = { left: Math.max(8, Math.min(left, vw - largura - 8)), top: r.bottom + 10, right: Math.max(8, vw - r.right) }
  }
  function abrirNav(item: NavItem, el: HTMLElement) {
    ancorar(el, MEGA_W)
    gatilho = el
    painel.value = { tipo: 'nav', item: item.label }
    filhoQuente.value = filhosDe(item)[0] ?? null
  }
  function navEntra(item: NavItem, ev: MouseEvent) {
    const el = ev.currentTarget as HTMLElement
    limparTimers()
    if (painel.value?.tipo === 'nav') { abrirNav(item, el); return }
    tAbre = setTimeout(() => abrirNav(item, el), 90)
  }
  function navSai() {
    limparTimers()
    tFecha = setTimeout(() => { if (painel.value?.tipo === 'nav') painel.value = null }, 170)
  }
  function painelEntra() { limparTimers() }
  function navClique(item: NavItem, ev: MouseEvent) {
    limparTimers()
    const p = painel.value
    if (p?.tipo === 'nav' && p.item === item.label) { painel.value = null; return }
    abrirNav(item, ev.currentTarget as HTMLElement)
    if (ev.detail === 0) focarPainel() // Enter/Espaço: o foco entra no painel
  }
  /* ——— teclado nos painéis ———
     O painel mora no <body>, longe do gatilho na ordem do Tab. Aberto pelo
     teclado, o foco entra nele; setas andam entre os itens; Tab no último (ou
     Shift+Tab no primeiro) fecha e segue a ordem da página a partir do gatilho. */
  function itensDoPainel(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('[data-topo-painel] [role="menuitem"], [data-topo-painel] [data-topo-foco]'))
  }
  function focarPainel() {
    void nextTick(() => itensDoPainel()[0]?.focus())
  }
  function teclaNoPainel(e: KeyboardEvent) {
    const itens = itensDoPainel()
    const i = itens.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prox = e.key === 'ArrowDown' ? (i + 1) % itens.length : (i - 1 + itens.length) % itens.length
      itens[prox]?.focus()
      return
    }
    if (e.key !== 'Tab') return
    const saiFrente = !e.shiftKey && i === itens.length - 1
    const saiTras = e.shiftKey && i <= 0
    if (!saiFrente && !saiTras) return
    e.preventDefault()
    const g = gatilho
    fecharPainel()
    if (!g || !document.contains(g)) return
    if (saiTras) { g.focus(); return }
    const focaveis = Array.from(document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter((el) => el.offsetParent !== null && !el.closest('[data-topo-painel]'))
    focaveis[focaveis.indexOf(g) + 1]?.focus()
  }
  function alternar(tipo: 'conta', ev: MouseEvent, largura: number) {
    limparTimers()
    if (painel.value?.tipo === tipo) { fecharPainel(); return }
    const el = ev.currentTarget as HTMLElement
    ancorar(el, largura, 'dir')
    gatilho = el
    painel.value = { tipo }
    if (ev.detail === 0) focarPainel()
  }
  function fecharPainel(devolverFoco = false) {
    painel.value = null
    if (devolverFoco && gatilho && document.contains(gatilho)) gatilho.focus()
  }
  function noClique(e: MouseEvent) {
    const t = e.target as Element | null
    if (!t) return
    if (t.closest('[data-topo-painel]') || (gatilho && gatilho.contains(t))) return
    fecharPainel()
  }
  function naTecla(e: KeyboardEvent) {
    if (e.key === 'Escape' && painel.value) fecharPainel(true)
  }
  watch(painel, (p) => {
    if (!import.meta.client) return
    if (p) {
      document.addEventListener('click', noClique, true)
      document.addEventListener('keydown', naTecla)
    } else {
      document.removeEventListener('click', noClique, true)
      document.removeEventListener('keydown', naTecla)
    }
  })

  /* ——— menu do celular ——— */
  const menuAberto = ref(false)
  function abrirMenu(aberto: boolean) {
    menuAberto.value = aberto
    if (aberto) fecharPainel()
    if (import.meta.client) document.documentElement.style.overflow = aberto ? 'hidden' : ''
  }

  async function sair() {
    fecharPainel()
    abrirMenu(false)
    clearSession()
    await navigateTo('/')
  }

  watch(() => route.fullPath, () => { abrirMenu(false); fecharPainel() })

  onBeforeUnmount(() => {
    limparTimers()
    if (!import.meta.client) return
    document.removeEventListener('click', noClique, true)
    document.removeEventListener('keydown', naTecla)
    if (menuAberto.value) document.documentElement.style.overflow = ''
  })

  return {
    isAuthenticated, initial, nav, ativo, paiAtivo, shrunk,
    painel, pos, itemAberto, filhoQuente, filhosDe,
    navEntra, navSai, painelEntra, navClique, alternar, fecharPainel, teclaNoPainel,
    menuAberto, abrirMenu, sair,
  }
}

/**
 * O mercado do topo (a régua do NuMarketTicker e o menu do celular): as cotações reais do useMarketTicker, na ordem de
 * leitura, e o estado da bolsa. O relógio só anda no client (o SSR renderiza o
 * esqueleto; estado no servidor daria hydration mismatch na virada do minuto).
 */
export function useMercadoDoTopo() {
  const { items, loading, asOf } = useMarketTicker()
  const agora = ref<Date | null>(null)
  let t: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    agora.value = new Date()
    t = setInterval(() => { agora.value = new Date() }, 60_000)
  })
  onBeforeUnmount(() => { if (t) clearInterval(t) })
  const itens = computed(() => ordenarCotacoes(items.value))
  const mercado = computed(() => (agora.value ? mercadoDoTopo(agora.value, asOf.value) : null))
  return { itens, loading, mercado }
}
