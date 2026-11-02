/**
 * Dados da página /teses ("A grade", 02/11/2026). SSR-FIRST desde 21/08/2026:
 * a lista pública de teses é buscada no SERVIDOR via useAsyncData (mesma
 * convenção de useAcao e useDividendos), então o HTML da 1ª resposta já sai
 * com as teses reais e com os links pra /tese/{slug}. Antes o fetch só rodava
 * no onMounted e o servidor entregava skeletons — as 10 teses ficavam órfãs e
 * invisíveis pra crawler de IA, que não executa JS.
 *
 * Sem seed: até 02/11/2026 a página tinha cartões de exemplo do design como
 * degrade de outage. Com a grade, backend fora no SSR → o cliente tenta de
 * novo no mount (esqueleto enquanto isso) e, se falhar, a grade diz que as
 * teses não carregaram (regra 7: nunca dado de mentira como real).
 *
 * Só os FAVORITOS seguem client-only: dependem de auth e a rota é cacheada na
 * CDN (ver a advertência abaixo). "Seguindo": favoritos reais de
 * /thesis-favorites (auth:sanctum), hidratados UMA vez aqui — N cards ≠ N
 * fetches. Anônimo → o selo nunca aparece (honesto).
 *
 * A convicção dia a dia de cada tese (o desenho e a última mudança dos
 * cartões) vem à parte, depois do mount: useTesesVitrine → /api/teses-painel.
 */
import type { ThesisCardApi } from '~/types/market'

export async function useTesesPage() {
  const apiCards = useState<ThesisCardApi[]>('nu:teses:api-cards', () => [])
  const favSlugs = useState<string[]>('nu:teses:favs', () => [])
  const started = useState('nu:teses:started', () => false)
  // loading = a lista ainda não chegou (SSR falhou e o cliente está tentando de
  // novo). Com o SSR bem-sucedido já nasce false.
  const loading = useState('nu:teses:loading', () => true)
  const { isAuthenticated } = useAuthState()
  const { authFetch } = useApi()

  // ⚠️ NADA DEPENDENTE DE AUTH PODE ENTRAR NO RENDER DO SSR AQUI.
  // /teses é servida com `public, s-maxage=300` (nuxt.config), então o HTML do
  // servidor é reaproveitado pela CDN entre visitantes diferentes — e o cookie
  // `nu:token` É visível no SSR. Renderizar a variante logada gravaria o estado
  // de UM usuário no cache de TODOS. Hoje isso está garantido por construção: o
  // href é igual pra todo mundo e `favSlugs` só é preenchido no onMounted.

  // useAsyncData resolve no servidor E serializa no payload, então o 1º render
  // do cliente usa o MESMO dado — sem mismatch e sem refetch.
  const { data: ssrCards } = await useAsyncData('teses:cards', () => marketFetchTheses(), {
    transform: (res) => (res?.data ?? []) as ThesisCardApi[],
    default: () => [] as ThesisCardApi[],
  })
  if (ssrCards.value?.length && !apiCards.value.length) {
    apiCards.value = ssrCards.value
    loading.value = false
  }

  // redirectOnAuthError:false — /teses é pública; token expirado limpa a
  // sessão mas NUNCA expulsa o visitante pro /login. Falha = nenhum "Seguindo".
  const favoritosDaConta = () => isAuthenticated.value
    ? authFetch<{ favorites: string[] }>('/thesis-favorites', {}, { redirectOnAuthError: false })
        .then((r) => r?.favorites ?? [])
        .catch(() => [] as string[])
    : Promise.resolve([] as string[])

  async function hydrate() {
    if (started.value) return
    started.value = true
    const favs = favoritosDaConta()
    if (!apiCards.value.length) {
      try {
        const res = await marketFetchTheses()
        apiCards.value = res?.data ?? []
      }
      catch { /* a grade mostra o aviso de que as teses não carregaram */ }
    }
    loading.value = false
    favSlugs.value = await favs
  }

  onMounted(hydrate)

  /**
   * Estudo mais recente entre as teses ('YYYY-MM-DD') — dateModified do hub.
   * Era o "último pregão" do calendário ("convicção revalidada a cada
   * pregão"), que seguia dizendo "hoje" nos dias em que a rotina não rodou.
   */
  const dataDate = computed<string | null>(() => {
    let latest: string | null = null
    for (const c of apiCards.value) {
      const d = typeof c.lastStudyDate === 'string' ? c.lastStudyDate.slice(0, 10) : null
      if (d && (latest === null || d > latest)) latest = d
    }
    return latest
  })

  return { cards: apiCards, favoritos: favSlugs, loading, dataDate }
}

/* ═════ FAQ (copy do design; travessões viram vírgula — regra de copy pública) ═════ */

export const TESES_FAQS = [
  {
    q: 'O que é uma tese de investimento?',
    a: 'É uma leitura de mundo transformada em carteira: a Redentia parte de uma tendência estrutural, reindustrialização, energia, longevidade, e reúne as ações mais expostas a ela, com o raciocínio por trás de cada escolha.',
  },
  {
    q: 'Como a Redentia monta cada tese?',
    a: 'Cada tese nasce da leitura de centenas de fontes: balanços, relatórios setoriais, notícias e dados macro. A IA cruza esse material, identifica as empresas mais beneficiadas pelo tema e monta uma carteira com peso e justificativa para cada ativo.',
  },
  {
    q: 'Seguir uma tese é o mesmo que investir nela?',
    a: 'Não. Seguir serve para acompanhar a evolução e receber avisos quando algo muda. Para investir de fato, você cria a conta e replica a carteira da tese com um toque, a corretora executa as ordens por você.',
  },
  {
    q: 'As teses garantem retorno?',
    a: 'Não. Os retornos exibidos são históricos e não se repetem no futuro. Toda tese envolve risco, e o valor investido pode oscilar. A Redentia entrega a análise e o raciocínio, a decisão de investir é sempre sua.',
  },
  {
    q: 'Com que frequência as teses são revisadas?',
    a: 'Continuamente. A cada novo balanço, notícia relevante ou mudança de cenário, a IA revalida a tese e ajusta a convicção. Se os fatos mudam a ponto de invalidar a ideia, você é avisado, e a tese pode ser encerrada.',
  },
]
