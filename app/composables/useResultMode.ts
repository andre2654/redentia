/**
 * useResultMode — escolha de skin da pagina /wallet/resultado.
 *
 * Dois modos com vocabulario visual distinto:
 *   - 'carteira'  → calmo, editorial, foco em janela mensal/anual.
 *                   Default. Holder/swing trader convive bem aqui.
 *   - 'day-trade' → denso, terminal-like, foco em janela intraday.
 *                   Ativacao manual (toggle no header da pagina).
 *
 * Persistencia: localStorage por user (chave inclui id pra nao vazar
 * preferencia entre contas no mesmo browser, mesmo padrao usado pelo
 * pluggyDismissKey em pages/wallet/index.vue). Query param `?mode=`
 * permite link compartilhavel/bookmark direto pro modo escolhido.
 *
 * Inicializacao: query param > localStorage > 'carteira'. O usuario
 * escolheu manual no requirements (sem smart-default por enquanto),
 * entao se faltar query+storage, sempre cai em 'carteira'.
 */
import { useAuthStore } from '~/stores/auth'

export type ResultMode = 'carteira' | 'day-trade'

const VALID_MODES: ResultMode[] = ['carteira', 'day-trade']

function isValidMode(v: unknown): v is ResultMode {
  return typeof v === 'string' && VALID_MODES.includes(v as ResultMode)
}

function storageKey(uid: number | string | null | undefined): string | null {
  if (uid == null || uid === '') return null
  return `redentia:resultado:mode:${uid}`
}

export function useResultMode() {
  const authStore = useAuthStore()
  const route = useRoute()
  const router = useRouter()

  // useState pra compartilhar instancia entre componentes da mesma page
  // (page + ModeToggle + sub-components). Inicializacao:
  //   - SSR + client: le query param ?mode= (deterministica, mesma em ambos)
  //   - localStorage: client-only via hydrate() onMounted (depende do
  //     user.id que so existe pos-store-setup)
  // Default 'carteira' quando nada esta presente.
  const mode = useState<ResultMode>('result-mode', () => {
    const q = route.query.mode
    if (q === 'day' || q === 'day-trade') return 'day-trade'
    if (q === 'carteira') return 'carteira'
    return 'carteira'
  })

  // Hidrata do localStorage/query no client. SSR mantem default
  // 'carteira' pra evitar hydration mismatch (localStorage e query
  // dependem do client e do user.id que so existe pos-hydrate).
  function hydrate() {
    if (typeof window === 'undefined') return

    // 1. Query param tem precedencia (link compartilhavel). Aceita
    //    forma curta 'day' (gerada por setMode) e forma longa 'day-trade'.
    const queryMode = route.query.mode
    if (queryMode === 'day' || queryMode === 'day-trade') {
      mode.value = 'day-trade'
      return
    }
    if (queryMode === 'carteira') {
      mode.value = 'carteira'
      return
    }

    // 2. localStorage por user
    const key = storageKey(authStore.me?.id)
    if (!key) return
    try {
      const stored = localStorage.getItem(key)
      if (isValidMode(stored)) mode.value = stored
    } catch {
      // localStorage indisponivel (modo privado, quota, etc) — segue
      // com o default. Nao loga porque acontece com frequencia em
      // browsers com privacidade alta e poluiria o console.
    }
  }

  /**
   * Troca de modo. Persiste em localStorage e sincroniza query param
   * via replace (sem empilhar entrada nova no history).
   */
  function setMode(next: ResultMode) {
    if (!isValidMode(next) || mode.value === next) return
    mode.value = next

    if (typeof window === 'undefined') return

    // Persiste local
    const key = storageKey(authStore.me?.id)
    if (key) {
      try {
        localStorage.setItem(key, next)
      } catch {
        // ignora — o estado em memoria continua valido pra sessao.
      }
    }

    // Sincroniza ?mode= sem trigger de navegacao (router.replace
    // mantem scroll position e nao re-monta a page).
    const queryShort = next === 'day-trade' ? 'day' : 'carteira'
    if (route.query.mode !== queryShort) {
      router.replace({
        path: route.path,
        query: { ...route.query, mode: queryShort },
        hash: route.hash,
      })
    }
  }

  function toggleMode() {
    setMode(mode.value === 'carteira' ? 'day-trade' : 'carteira')
  }

  return {
    mode: readonly(mode),
    setMode,
    toggleMode,
    hydrate,
  }
}
