/**
 * Dados da página /teses (padrão seed→real→degrade do useMercado): cada
 * carrossel nasce com o SEED exato do design (a página nunca renderiza vazia,
 * inclusive no SSR), hidrata com o backend real no onMounted e QUALQUER erro
 * degrada de volta pro seed.
 *
 * As 3 prateleiras saem TODAS do mesmo GET /theses, agrupadas pelo campo
 * `shelf` (contrato: string nullable em investment_theses, na resposta toCard;
 * a skill mensal que gera a tese decide onde ela cabe melhor):
 *
 *  - "Grandes ideias."           → shelf === 'grandes-ideias' (ou null/ausente,
 *    fallback — é o grosso: tese temática/estrutural).
 *  - "Estratégias de investidores." → shelf === 'estrategias' (tese com pegada
 *    de estratégia de investidor: renda/dividendos, buy&hold, valor, perfil).
 *    DERIVADA do real; se nenhuma tese cai aqui a seção SOME (estado honesto,
 *    sem cards falsos).
 *  - "Melhores pesquisas."       → DERIVADA: as teses de maior returnPct (não é
 *    um valor de shelf — é ranking sobre todas).
 *
 * "Seguindo": favoritos reais de /thesis-favorites (auth:sanctum), hidratados
 * UMA vez aqui e aplicados aos cards — N cards ≠ N fetches (o useThesisFollow
 * por-slug faria um GET por card). Anônimo → badge nunca aparece (honesto).
 *
 * Contrato de UX: docs/redentia-nu/designs-v2/Redentia Teses Nu.dc.html.
 */
import type { TesesCardVM } from '~/types/teses'
import type { ThesisCardApi } from '~/types/market'

type Shelf = 'grandes-ideias' | 'estrategias'

/** shelf efetivo: null/ausente/desconhecido → 'grandes-ideias' (o grosso). */
function shelfOf(c: ThesisCardApi): Shelf {
  return c.shelf === 'estrategias' ? 'estrategias' : 'grandes-ideias'
}

/* ═════ Seeds (dados de exemplo verbatim do design; capas reais em public/teses) ═════ */

// Card 1 do design abre a tese exemplar — mesmo slug do seed do useTese
// ('reindustrializacao-eua'), que nunca 404a com o backend fora. As capas
// apontam pros PNGs reais que já existem em public/teses (sem capa → gradiente).
const IDEIAS_SEED: TesesCardVM[] = [
  { slug: 'a-fabrica-volta-para-casa', cat: 'Reindustrialização', title: 'A fábrica volta para casa', foll: true, pill: 'Convicção 88', ret: '+12,4%', since: 'desde que você segue', tickers: ['WEGE3', 'TUPY3', 'ROMI3', 'KEPL3', 'EALT4'], image: '/teses/reindustrializacao-eua.png', href: '/tese/reindustrializacao-eua' },
  { slug: 'energia-para-ia', cat: 'Energia', title: 'Energia para IA', foll: true, pill: 'Convicção 82', ret: '+21,8%', since: 'desde que você segue', tickers: ['EGIE3', 'CMIG4', 'ELET3', 'ENGI11', 'TAEE11'], image: '/teses/a-conta-de-luz-da-ia.png', href: '/login' },
  { slug: 'a-nova-geografia-do-frete', cat: 'Logística', title: 'A nova geografia do frete', foll: false, pill: 'Convicção 82', ret: '+9,3%', since: 'retorno em 12 meses', tickers: ['RAIL3', 'STBP3', 'HBSA3'], image: '/teses/a-nova-geografia-do-frete.png', href: '/login' },
  { slug: 'o-imovel-mais-disputado-do-mundo', cat: 'Data centers', title: 'O imóvel mais disputado do mundo', foll: false, pill: 'Convicção 92', ret: '+15,2%', since: 'retorno em 12 meses', tickers: ['EQIX34', 'ALOS3', 'LOGG3'], image: '/teses/imovel-mais-disputado-data-center.png', href: '/login' },
  { slug: 'saneamento-concessoes', cat: 'Infraestrutura', title: 'Saneamento & concessões', foll: false, pill: 'Convicção 76', ret: '+15,2%', since: 'retorno em 12 meses', tickers: ['SBSP3', 'SAPR11', 'CSMG3'], image: null, href: '/login' },
]

const PESQUISAS_SEED: TesesCardVM[] = [
  { slug: 'o-brasil-que-decola', cat: 'Defesa & Aeroespacial', title: 'O Brasil que decola', foll: true, pill: 'Nº 1', ret: '+140%', since: 'retorno acumulado', tickers: ['EMBR3', 'TASA4'], image: null, href: '/login' },
  { slug: 'energia-para-ia-rank', cat: 'Energia', title: 'Energia para IA', foll: true, pill: 'Nº 2', ret: '+96%', since: 'retorno acumulado', tickers: ['EGIE3', 'NEOE3', 'CMIG4'], image: '/teses/a-conta-de-luz-da-ia.png', href: '/login' },
  { slug: 'a-agua-virou-ativo', cat: 'Saneamento', title: 'A água virou ativo', foll: false, pill: 'Nº 3', ret: '+52%', since: 'retorno acumulado', tickers: ['SBSP3', 'CSMG3', 'SAPR11'], image: null, href: '/login' },
  { slug: 'o-imovel-mais-disputado-do-mundo', cat: 'Data centers', title: 'O imóvel mais disputado do mundo', foll: false, pill: 'Nº 4', ret: '+44%', since: 'retorno acumulado', tickers: ['EQIX34', 'ALOS3', 'LOGG3'], image: '/teses/imovel-mais-disputado-data-center.png', href: '/login' },
  { slug: 'a-fabrica-volta-para-casa-rank', cat: 'Reindustrialização', title: 'A fábrica volta para casa', foll: true, pill: 'Nº 5', ret: '+34%', since: 'retorno acumulado', tickers: ['CATP34', 'GGBR4', 'WEGE3'], image: '/teses/reindustrializacao-eua.png', href: '/tese/reindustrializacao-eua' },
]

/** "Estratégias de investidores." — SEED do design (shelf 'estrategias'). Some
 *  no client se nenhuma tese real cai nessa prateleira. Sem capa real ainda →
 *  os cards degradam pro gradiente navy. */
export const TESES_ESTRATEGIAS: TesesCardVM[] = [
  { slug: 'viver-de-dividendos', cat: 'Renda passiva', title: 'Viver de dividendos', foll: true, pill: 'Risco baixo', ret: '+14,2%', since: 'retorno em 12 meses', tickers: ['TAEE11', 'BBSE3', 'ITSA4', 'EGIE3', 'CPLE6'], image: null, href: '/login' },
  { slug: 'comprar-e-nao-vender', cat: 'Buy & hold', title: 'Comprar e não vender', foll: false, pill: 'Risco médio', ret: '+22,6%', since: 'retorno em 12 meses', tickers: ['WEGE3', 'ITUB4', 'RENT3', 'FLRY3'], image: null, href: '/login' },
  { slug: 'pequenas-que-crescem', cat: 'Small caps', title: 'Pequenas que crescem', foll: false, pill: 'Risco alto', ret: '+31,4%', since: 'retorno em 12 meses', tickers: ['TUPY3', 'LEVE3', 'POMO4'], image: null, href: '/login' },
  { slug: 'renda-de-aluguel', cat: 'Fundos imobiliários', title: 'Renda de aluguel', foll: true, pill: 'Risco baixo', ret: '+11,8%', since: 'retorno em 12 meses', tickers: ['HGLG11', 'KNRI11', 'MXRF11', 'VISC11'], image: null, href: '/login' },
  { slug: 'dolar-e-big-techs', cat: 'Carteira global', title: 'Dólar e big techs', foll: false, pill: 'Risco médio', ret: '+18,9%', since: 'retorno em 12 meses', tickers: ['IVVB11', 'NASD11', 'GOLD11'], image: null, href: '/login' },
]

/* ═════ Mapping API → VM ═════ */

/** 'Tese · Reindustrialização' → 'Reindustrialização' (categoria após o prefixo). */
function stripCat(sector: string): string {
  return sector.replace(/^Tese\s*·\s*/u, '').trim() || sector
}

function mapCard(c: ThesisCardApi, unlockedSlug: string | null, favs: Set<string>, authed: boolean): TesesCardVM {
  return {
    slug: c.id,
    cat: stripCat(c.sector ?? ''),
    title: c.title,
    foll: favs.has(c.id),
    pill: c.conviction != null ? `Convicção ${c.conviction}` : null,
    ret: c.returnLabel,
    // Dado real: o returnLabel do backend é o retorno acumulado do backtest
    // desde a publicação — a legenda diz exatamente isso (vocabulário do
    // próprio design, seção "Melhores pesquisas").
    since: 'retorno acumulado',
    tickers: (c.tickers ?? []).slice(0, 5),
    // Capa real da tese; null (ex.: tese sem cover) → o card degrada pro
    // gradiente navy no componente (fallback padrão do projeto).
    image: c.image ?? null,
    // Gating espelhado do /mercado (useNuTheses): a 1ª tese da lista abre a
    // página; as demais convidam pro login — só pra ANÔNIMO. Logado vai
    // direto pra tese.
    href: authed || c.id === unlockedSlug ? `/tese/${c.id}` : '/login',
  }
}

export function useTesesPage() {
  // Estado = cards CRUS da API + favoritos; os VMs saem de computeds porque o
  // href das teses travadas depende de isAuthenticated (reage a login/logout
  // sem re-fetch). SSR-safe: apiCards só é preenchido no onMounted, então o
  // SSR sempre renderiza os SEEDS — zero hydration mismatch.
  const apiCards = useState<ThesisCardApi[]>('nu:teses:api-cards', () => [])
  const favSlugs = useState<string[]>('nu:teses:favs', () => [])
  const started = useState('nu:teses:started', () => false)
  const { isAuthenticated } = useAuthState()
  const { authFetch } = useApi()

  // Gating global: a 1ª tese da prateleira-herói 'Grandes ideias.' abre pra
  // anônimo; o resto convida pro login. Vale pras 3 prateleiras (o desbloqueio
  // é por tese, não por seção). Fixamos a tese aberta na prateleira-herói (e
  // não no apiCards[0]) porque /theses ordena por sort_order asc e o 1º card
  // pode ser de 'estrategias' (ex.: 'bancos-brasileiros', sort_order 1) — se
  // desbloqueássemos o cru [0], a única tese grátis sairia do hero e a
  // 'Grandes ideias.' ficaria 100% travada pro anônimo, divergindo do seed/SSR.
  // Fallback pro cru [0] só no estado degenerado sem nenhuma tese em 'grandes-ideias'.
  const unlockedSlug = computed(() => {
    const cards = apiCards.value
    return (cards.find((c) => shelfOf(c) === 'grandes-ideias') ?? cards[0])?.id ?? null
  })

  const ideias = computed<TesesCardVM[]>(() => {
    const cards = apiCards.value
    if (cards.length < 2) return IDEIAS_SEED
    const favs = new Set(favSlugs.value)
    const mine = cards.filter((c) => shelfOf(c) === 'grandes-ideias')
    if (!mine.length) return IDEIAS_SEED // shelf vazia num estado estranho → seed
    return mine.map((c) => mapCard(c, unlockedSlug.value, favs, isAuthenticated.value))
  })

  // Prateleira derivada do shelf 'estrategias'. Sem seed no estado hidratado:
  // se o backend não marcou nenhuma tese como estratégia, retorna [] e a seção
  // SOME (v-if na page) — estado honesto, sem card falso. O seed do design só
  // aparece enquanto a página ainda não hidratou (SSR + antes do fetch).
  const estrategias = computed<TesesCardVM[]>(() => {
    const cards = apiCards.value
    if (cards.length < 2) return TESES_ESTRATEGIAS
    const favs = new Set(favSlugs.value)
    return cards
      .filter((c) => shelfOf(c) === 'estrategias')
      .map((c) => mapCard(c, unlockedSlug.value, favs, isAuthenticated.value))
  })

  const pesquisas = computed<TesesCardVM[]>(() => {
    const cards = apiCards.value
    if (cards.length < 2) return PESQUISAS_SEED
    const ranked = cards
      .filter((c) => c.returnPct != null)
      .sort((a, b) => (b.returnPct as number) - (a.returnPct as number))
      .slice(0, 5)
    if (ranked.length < 2) return PESQUISAS_SEED
    const favs = new Set(favSlugs.value)
    return ranked.map((c, i) => ({
      ...mapCard(c, unlockedSlug.value, favs, isAuthenticated.value),
      pill: `Nº ${i + 1}`,
    }))
  })

  async function hydrate() {
    if (started.value) return
    started.value = true

    // Favoritos em paralelo (só logado); falha silenciosa = nenhum "Seguindo"
    // falso-positivo. Client-only por construção (roda no onMounted).
    // redirectOnAuthError:false — /teses é pública; token expirado limpa a
    // sessão mas NUNCA expulsa o visitante pro /login.
    const favsPromise: Promise<string[]> = isAuthenticated.value
      ? authFetch<{ favorites: string[] }>('/thesis-favorites', {}, { redirectOnAuthError: false })
          .then((r) => r?.favorites ?? [])
          .catch(() => [])
      : Promise.resolve([])

    try {
      const res = await marketFetchTheses()
      const cards = res?.data ?? []
      if (cards.length < 2) return // carrossel precisa de conteúdo — mantém o seed
      favSlugs.value = await favsPromise
      apiCards.value = cards
    } catch { /* mantém o seed */ }
  }

  onMounted(hydrate)
  return { ideias, pesquisas, estrategias }
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
