/**
 * Dados da página /teses. SSR-FIRST desde 21/08/2026: a lista pública de teses
 * é buscada no SERVIDOR via useAsyncData (mesma convenção de useAcao e
 * useDividendos), então o HTML da 1ª resposta já sai com as teses reais e com
 * os links pra /tese/{slug}. Antes o fetch só rodava no onMounted e o servidor
 * entregava 164 skeletons — as 10 teses ficavam órfãs e invisíveis pra crawler
 * de IA, que não executa JS. O SEED do design continua como degrade de outage.
 *
 * Só os FAVORITOS seguem client-only: dependem de auth e a rota é cacheada na
 * CDN (ver a advertência dentro de useTesesPage).
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
  { slug: 'a-fabrica-volta-para-casa', cat: 'Reindustrialização', title: 'A fábrica volta para casa', foll: true, pill: 'Convicção 88', ret: '+12,4%', since: 'desde que você segue', tickers: ['WEGE3', 'TUPY3', 'ROMI3', 'KEPL3', 'EALT4'], image: '/teses/reindustrializacao-eua.webp', href: '/tese/reindustrializacao-eua' },
  { slug: 'energia-para-ia', cat: 'Energia', title: 'Energia para IA', foll: true, pill: 'Convicção 82', ret: '+21,8%', since: 'desde que você segue', tickers: ['EGIE3', 'CMIG4', 'ELET3', 'ENGI11', 'TAEE11'], image: '/teses/a-conta-de-luz-da-ia.webp', href: '/login' },
  { slug: 'a-nova-geografia-do-frete', cat: 'Logística', title: 'A nova geografia do frete', foll: false, pill: 'Convicção 82', ret: '+9,3%', since: 'retorno em 12 meses', tickers: ['RAIL3', 'STBP3', 'HBSA3'], image: '/teses/a-nova-geografia-do-frete.webp', href: '/login' },
  { slug: 'o-imovel-mais-disputado-do-mundo', cat: 'Data centers', title: 'O imóvel mais disputado do mundo', foll: false, pill: 'Convicção 92', ret: '+15,2%', since: 'retorno em 12 meses', tickers: ['EQIX34', 'ALOS3', 'LOGG3'], image: '/teses/imovel-mais-disputado-data-center.webp', href: '/login' },
  { slug: 'saneamento-concessoes', cat: 'Infraestrutura', title: 'Saneamento & concessões', foll: false, pill: 'Convicção 76', ret: '+15,2%', since: 'retorno em 12 meses', tickers: ['SBSP3', 'SAPR11', 'CSMG3'], image: null, href: '/login' },
]

const PESQUISAS_SEED: TesesCardVM[] = [
  { slug: 'o-brasil-que-decola', cat: 'Defesa & Aeroespacial', title: 'O Brasil que decola', foll: true, pill: 'Nº 1', ret: '+140%', since: 'retorno acumulado', tickers: ['EMBR3', 'TASA4'], image: null, href: '/login' },
  { slug: 'energia-para-ia-rank', cat: 'Energia', title: 'Energia para IA', foll: true, pill: 'Nº 2', ret: '+96%', since: 'retorno acumulado', tickers: ['EGIE3', 'NEOE3', 'CMIG4'], image: '/teses/a-conta-de-luz-da-ia.webp', href: '/login' },
  { slug: 'a-agua-virou-ativo', cat: 'Saneamento', title: 'A água virou ativo', foll: false, pill: 'Nº 3', ret: '+52%', since: 'retorno acumulado', tickers: ['SBSP3', 'CSMG3', 'SAPR11'], image: null, href: '/login' },
  { slug: 'o-imovel-mais-disputado-do-mundo', cat: 'Data centers', title: 'O imóvel mais disputado do mundo', foll: false, pill: 'Nº 4', ret: '+44%', since: 'retorno acumulado', tickers: ['EQIX34', 'ALOS3', 'LOGG3'], image: '/teses/imovel-mais-disputado-data-center.webp', href: '/login' },
  { slug: 'a-fabrica-volta-para-casa-rank', cat: 'Reindustrialização', title: 'A fábrica volta para casa', foll: true, pill: 'Nº 5', ret: '+34%', since: 'retorno acumulado', tickers: ['CATP34', 'GGBR4', 'WEGE3'], image: '/teses/reindustrializacao-eua.webp', href: '/tese/reindustrializacao-eua' },
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

function mapCard(c: ThesisCardApi, favs: Set<string>): TesesCardVM {
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
    image: teseCover(c.image),
    // LINK SEMPRE PRO DESTINO REAL (21/08/2026). Antes, o anônimo via 9 dos
    // 10 cards apontando pra /login — e como crawler é anônimo, as 9 teses
    // ficavam sem UM link interno no site inteiro. Medido: 10 no sitemap, 3
    // com impressão, ZERO clique.
    //
    // O gate não protegia nada: /tese/{slug} já responde 200 com ~1.600
    // palavras pra visitante deslogado (verificado nas 4 teses testadas), e o
    // sitemap já mandava indexar as 10. Era um gate que custava SEO sem
    // entregar exclusividade.
    //
    // A conversão não se perde: o CTA de criar conta vive DENTRO da página da
    // tese. Sai do caminho do link e vira um clique depois.
    href: `/tese/${c.id}`,
  }
}

export async function useTesesPage() {
  // Estado = cards CRUS da API + favoritos; os VMs saem de computeds porque o
  // href das teses travadas depende de isAuthenticated (reage a login/logout
  // sem re-fetch). SSR-safe: apiCards só é preenchido no onMounted, então o
  // SSR sempre renderiza os SEEDS — zero hydration mismatch.
  const apiCards = useState<ThesisCardApi[]>('nu:teses:api-cards', () => [])
  const favSlugs = useState<string[]>('nu:teses:favs', () => [])
  const started = useState('nu:teses:started', () => false)
  // loading = ainda não hidratou (SSR + antes do fetch client). A página mostra
  // skeleton em vez dos SEEDs; vira false no fim do hydrate (sucesso OU falha).
  // Persistido em useState → revisita na mesma sessão já entra com os reais.
  const loading = useState('nu:teses:loading', () => true)
  const { isAuthenticated } = useAuthState()
  const { authFetch } = useApi()

  // ⚠️ NADA DEPENDENTE DE AUTH PODE ENTRAR NO RENDER DO SSR AQUI.
  // /teses é servida com `public, s-maxage=300` (nuxt.config), então o HTML do
  // servidor é reaproveitado pela CDN entre visitantes diferentes — e o cookie
  // `nu:token` É visível no SSR. Renderizar a variante logada gravaria o estado
  // de UM usuário no cache de TODOS.
  //
  // Hoje isso está garantido por construção: o href é igual pra todo mundo e
  // `favSlugs` nasce vazio (useState), só sendo preenchido no onMounted. Se
  // algum dia voltar a existir variação por login neste render, ela precisa de
  // um gate `mounted && isAuthenticated` — nunca `isAuthenticated` cru.

  // ═══ SSR-FIRST das teses PÚBLICAS (21/08/2026) ═══
  //
  // Antes: apiCards só era preenchido no onMounted, então o HTML do servidor
  // saía com 164 skeletons e NENHUM link pra /tese/{slug}. As 10 teses viviam
  // só no sitemap — medido: 10 publicadas, 3 com impressão, ZERO clique. E
  // crawler de IA (GPTBot, ClaudeBot, PerplexityBot) não executa JS, então pra
  // eles o hub e as 10 teses simplesmente não existiam, apesar de cada tese ter
  // ~1.600 palavras de conteúdo próprio.
  //
  // useAsyncData resolve no servidor E serializa no payload, então o 1º render
  // do cliente usa o MESMO dado — sem mismatch e sem refetch.
  const { data: ssrCards } = await useAsyncData('teses:cards', () => marketFetchTheses(), {
    // Só a lista pública entra aqui. Favorito e desbloqueio dependem de auth e
    // continuam client-only (favSlugs só é preenchido no onMounted).
    transform: (res) => (res?.data ?? []) as ThesisCardApi[],
    default: () => [] as ThesisCardApi[],
  })
  if (ssrCards.value?.length && !apiCards.value.length) {
    apiCards.value = ssrCards.value
    loading.value = false
  }




  const ideias = computed<TesesCardVM[]>(() => {
    const cards = apiCards.value
    if (cards.length < 2) return IDEIAS_SEED
    const favs = new Set(favSlugs.value)
    const mine = cards.filter((c) => shelfOf(c) === 'grandes-ideias')
    if (!mine.length) return IDEIAS_SEED // shelf vazia num estado estranho → seed
    return mine.map((c) => mapCard(c, favs))
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
      .map((c) => mapCard(c, favs))
  })

  const pesquisas = computed<TesesCardVM[]>(() => {
    const cards = apiCards.value
    if (cards.length < 2) return PESQUISAS_SEED
    // Piso de mérito (curadoria 2026-07-16): só entra no ranking tese com
    // retorno real relevante (≥ +10% desde a publicação). Tese recém-nascida
    // (~0%) NÃO ocupa vaga em "Melhores pesquisas" por sorteio de ordenação;
    // ela entra quando provar. Com menos de 2 qualificadas o seed segura a
    // prateleira (mesmo degrade honesto de sempre).
    const ranked = cards
      .filter((c) => c.returnPct != null && (c.returnPct as number) >= 10)
      .sort((a, b) => (b.returnPct as number) - (a.returnPct as number))
      .slice(0, 5)
    if (ranked.length < 2) return PESQUISAS_SEED
    const favs = new Set(favSlugs.value)
    return ranked.map((c, i) => ({
      ...mapCard(c, favs),
      pill: `Nº ${i + 1}`,
    }))
  })

  async function hydrate() {
    if (started.value) return
    started.value = true

    // O SSR já trouxe a lista pública. Só faltam os favoritos (auth), então
    // pula o refetch de /theses e busca apenas o que o servidor não podia ver.
    if (apiCards.value.length >= 2) {
      loading.value = false
      if (isAuthenticated.value) {
        favSlugs.value = await authFetch<{ favorites: string[] }>('/thesis-favorites', {}, { redirectOnAuthError: false })
          .then((r) => r?.favorites ?? [])
          .catch(() => [])
      }
      return
    }

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
      if (cards.length >= 2) { // carrossel precisa de conteúdo; senão degrada pro seed
        favSlugs.value = await favsPromise
        apiCards.value = cards
      }
    }
    catch { /* mantém o seed (degrade de outage) */ }
    finally { loading.value = false }
  }

  onMounted(hydrate)
  return { ideias, pesquisas, estrategias, loading }
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
