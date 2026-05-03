/**
 * useOnboardingChecklist — fonte unica do checklist de ativacao pos-cadastro.
 *
 * Estado derivado do backend (nao mais localStorage):
 *   - chat:    sessoes do user no chat-service > 0
 *   - wallet:  posicoes na carteira > 0
 *   - raio-x:  mesma fonte que wallet — o raio-x e auto-gerado quando
 *              o usuario adiciona a carteira; nao tem trigger separado.
 *
 * O motivo de mudar de localStorage pra DB: as flags eram por dispositivo,
 * entao quando outro user logava no mesmo browser, herdava o estado.
 * O usuario chablau29 entrou e ja viu 2/3 ticados sem ter feito nada —
 * eram flags do user anterior. Banco resolve: cada user ve o que ele
 * realmente fez, sem importar o browser.
 *
 * Estado e shared module-level: o primeiro fetch popula, todas as outras
 * instancias do composable leem do mesmo ref. Re-fetch acontece em login
 * /logout/troca de conta (watch no authStore.me?.id), e qualquer pagina
 * pode forcar refresh apos uma acao via `markStepDone()` ou `refresh()`.
 *
 * Uso:
 *   const { steps, done, total, percent, refresh } = useOnboardingChecklist()
 */
import { computed, ref, watch } from 'vue'

export interface OnboardingStep {
  id: 'chat' | 'wallet' | 'raio-x'
  label: string
  /** Subtitle/explanation. Usado em variants compactos podem omitir. */
  sub: string
  /** Lucide icon name for the un-done state. */
  icon: string
  /** Route to navigate when clicked. */
  to: string
  done: boolean
}

// Estado module-level. Compartilhado entre todas as instancias do
// composable (sidebar + home + help + wallet + raio-x), entao o fetch
// roda uma vez por user-id, nao N vezes por componente que monta.
const hasPositions = ref(false)
const hasChatSessions = ref(false)
const lastFetchedUserId = ref<string | number | null>(null)
let inflight: Promise<void> | null = null

export function useOnboardingChecklist() {
  const authStore = useAuthStore()

  /**
   * Re-le do backend e atualiza os refs compartilhados. Coalesce
   * chamadas concorrentes em uma unica request via `inflight`.
   */
  async function refresh(): Promise<void> {
    if (typeof window === 'undefined') return
    const id = authStore.me?.id ?? null
    if (!id) {
      hasPositions.value = false
      hasChatSessions.value = false
      lastFetchedUserId.value = null
      return
    }
    if (inflight) return inflight
    const portfolio = usePortfolioService()
    inflight = (async () => {
      const [posResp, chatResp] = await Promise.all([
        portfolio.getPositions().catch(() => null) as Promise<{ positions?: unknown[] } | null>,
        $fetch<{ sessions?: unknown[] }>('/api/chat/sessions', {
          headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
        }).catch(() => ({ sessions: [] })),
      ])
      hasPositions.value = (posResp?.positions?.length ?? 0) > 0
      hasChatSessions.value = (chatResp?.sessions?.length ?? 0) > 0
      lastFetchedUserId.value = id
    })()
    try {
      await inflight
    }
    finally {
      inflight = null
    }
  }

  // Re-fetch sempre que o user muda — login, logout, ou troca de
  // conta sem reload. immediate:true dispara o primeiro fetch ja
  // no setup do componente que monta o composable.
  if (import.meta.client) {
    watch(
      () => authStore.me?.id ?? null,
      (id) => {
        if (id !== lastFetchedUserId.value) refresh()
      },
      { immediate: true },
    )
  }

  // Labels orientados a acao — verbo + objeto especifico, sem palavras
  // genericas. O usuario olha e sabe exatamente o que vai acontecer
  // ao clicar.
  //
  // Nota: o passo "Cadastrar seu telefone" foi removido. O telefone
  // agora vira gate de /help via PhoneGateModal — abre na primeira
  // tentativa de acessar o chat sem celular cadastrado, em vez de
  // ficar como item separado na lista.
  //
  // Raio-X compartilha o sinal `hasPositions` com wallet: o raio-x e
  // gerado automaticamente quando o usuario adiciona a carteira, entao
  // os dois ticam juntos. Mantidos como steps separados pra didatica
  // (o usuario ve "voce vai gerar um raio-x quando adicionar").
  const steps = computed<OnboardingStep[]>(() => [
    {
      id: 'chat',
      label: 'Enviar mensagem no chat',
      sub: 'Pergunte sobre PETR4, dividendos, sua carteira.',
      icon: 'i-lucide-message-circle',
      to: '/help',
      done: hasChatSessions.value,
    },
    {
      id: 'wallet',
      label: 'Adicionar carteira',
      sub: 'Pra a Redent.IA conhecer seus ativos reais.',
      icon: 'i-lucide-briefcase',
      to: '/wallet',
      done: hasPositions.value,
    },
    {
      id: 'raio-x',
      label: 'Gerar Raio-X da sua carteira',
      sub: 'Auto-gerado quando voce adiciona a carteira.',
      icon: 'i-lucide-activity',
      to: '/wallet?from=onboarding-raio-x',
      done: hasPositions.value,
    },
  ])

  const total = computed(() => steps.value.length)
  const done = computed(() => steps.value.filter(s => s.done).length)
  const percent = computed(() =>
    total.value === 0 ? 0 : Math.round((done.value / total.value) * 100),
  )
  const allDone = computed(() => done.value === total.value)

  /**
   * Compat com call-sites antigos que marcavam passos manualmente.
   * Antes setava localStorage; agora vira atalho pra refresh — re-le
   * do backend e atualiza todos os steps de uma vez. O argumento e
   * ignorado (mantido pra nao quebrar chamadas existentes).
   */
  function markStepDone(_id: OnboardingStep['id']) {
    refresh()
  }

  return {
    steps,
    total,
    done,
    percent,
    allDone,
    refresh,
    markStepDone,
  }
}
