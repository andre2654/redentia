/**
 * Dados do /mercado (padrão swap real+fallback do useMarketTicker, herdado do
 * Atlas): cada bloco nasce com o SEED exato do design (a página nunca renderiza
 * vazia — inclusive no SSR), hidrata com o backend real no onMounted e QUALQUER
 * erro degrada de volta pro seed. Fetchers tipados em services/market.ts;
 * shapes em types/market.ts. Contrato de UX: designs/Redentia Mercado Nu.dc.html.
 */
import type {
  NuBriefing,
  NuDir,
  NuFaqItem,
  NuGuideCardItem,
  NuIndexStat,
  NuMoverRow,
  NuMoverTab,
  NuMoversClass,
  NuNewsFeaturedItem,
  NuNewsRowItem,
  NuStatPill,
  NuTesouroGroup,
  NuTesouroHighlight,
  NuThesis,
  ThesisCardApi,
  TickerApi,
} from '~/types/market'

/* ————— helpers de formatação ————— */

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function pctFmt(n: number): string {
  return `${n > 0 ? '+' : ''}${nf2.format(n)}%`
}
function dirOf(n: number): NuDir {
  return n < 0 ? 'down' : 'up'
}
/* localISODate/relTime/sourcePretty: compartilhados em app/utils/format.ts (PR3);
   escapeHtml/briefingHtml idem (extraídos no PR7 — a Home renderiza o mesmo briefing) */
/** '2026-08-15' → 'Venc. 08/26' (formato dos cards de Tesouro do design). */
function vencFmt(dateStr: string | null): string {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-')
  if (!y || !m) return ''
  return `Venc. ${m}/${y.slice(2)}`
}

/* ═════ Teses (carrossel) ═════ */

const TILE_CYCLE = ['var(--nu-amber)', 'var(--nu-green-soft)', 'var(--nu-blue-soft)'] as const

const THESES_SEED: NuThesis[] = [
  {
    slug: 'a-fabrica-volta-para-casa',
    cat: 'Reindustrialização',
    image: '/teses/reindustrializacao-eua.png',
    perf: '+34%',
    perfLabel: 'Tese em destaque',
    titlePre: 'A fábrica ',
    titleHi: 'volta',
    titlePost: ' para casa',
    desc: 'Mais de US$ 1,4 tri em fábricas anunciadas: quem vende energia, automação e máquina pesada fatura primeiro.',
    tickers: [
      { letter: 'C', name: 'CATP34', tile: 'var(--nu-amber)' },
      { letter: 'G', name: 'GGBR4', tile: 'var(--nu-green-soft)' },
    ],
    more: '+5',
    fontes: '246 fontes',
    href: '/login',
    leftTitle: 'A fábrica volta para casa.',
    leftDesc: 'Os EUA decidiram fabricar de novo, e quem vende as picaretas ganha primeiro. Convicção 88/100, revalidada hoje com a entrada da TUPY3.',
    cta: 'Ver a tese completa',
    ctaHref: '/login',
  },
  {
    slug: 'energia-para-ia',
    cat: 'Energia',
    image: '/teses/a-conta-de-luz-da-ia.png',
    perf: '+96%',
    perfLabel: 'Melhor tese',
    titlePre: '',
    titleHi: 'Energia',
    titlePost: ' para IA',
    desc: 'Data centers e reatores reativados pressionam uma oferta que não cresce há mais de uma década.',
    tickers: [
      { letter: 'E', name: 'EGIE3', tile: 'var(--nu-green-soft)' },
      { letter: 'N', name: 'NEOE3', tile: 'var(--nu-blue-soft)' },
    ],
    more: '+4',
    fontes: '230 fontes',
    href: '/login',
    leftTitle: 'Energia para IA.',
    leftDesc: 'Os data centers vão dobrar o consumo de energia do mundo, e alguém precisa gerar. A melhor tese da Redentia até aqui: +96% desde o lançamento.',
    cta: 'Criar conta para desbloquear',
    ctaHref: '/login',
  },
  {
    slug: 'a-nova-geografia-do-frete',
    cat: 'Logística',
    image: '/teses/a-nova-geografia-do-frete.png',
    perf: '+18%',
    perfLabel: 'Tese recente',
    titlePre: 'A nova geografia do ',
    titleHi: 'frete',
    titlePost: '',
    desc: 'O nearshoring redesenha as rotas globais, e o Brasil herda a comida, o minério e o frete.',
    tickers: [
      { letter: 'R', name: 'RAIL3', tile: 'var(--nu-amber)' },
      { letter: 'S', name: 'STBP3', tile: 'var(--nu-blue-soft)' },
    ],
    more: '+3',
    fontes: '118 fontes',
    href: '/login',
    leftTitle: 'A nova geografia do frete.',
    leftDesc: 'Quando a fábrica muda de continente, a carga muda de rota. A perna brasileira do reshoring: portos, ferrovias e grãos.',
    cta: 'Criar conta para desbloquear',
    ctaHref: '/login',
  },
  {
    slug: 'o-imovel-mais-disputado-do-mundo',
    cat: 'Data centers',
    image: '/teses/imovel-mais-disputado-data-center.png',
    perf: '+44%',
    perfLabel: 'Popular',
    titlePre: 'O imóvel mais ',
    titleHi: 'disputado',
    titlePost: ' do mundo',
    desc: 'A fila por um data center vago nunca foi tão longa: quem aluga o rack ganha primeiro.',
    tickers: [
      { letter: 'E', name: 'EQIX34', tile: 'var(--nu-blue-soft)' },
      { letter: 'A', name: 'ALOS3', tile: 'var(--nu-amber)' },
    ],
    more: '+4',
    fontes: '187 fontes',
    href: '/login',
    leftTitle: 'O imóvel mais disputado do mundo.',
    leftDesc: 'A IA precisa de endereço: galpões, refrigeração e megawatts. Quem já tem o terreno e a energia cobra o aluguel do século.',
    cta: 'Criar conta para desbloquear',
    ctaHref: '/login',
  },
]

function mapThesis(c: ThesisCardApi, i: number, authed: boolean): NuThesis {
  // Espelha o gating do design: 1ª tese (em destaque) abre a página da tese,
  // as demais convidam pro login — mas o convite é só pra ANÔNIMO; logado vai
  // direto pra tese (o /login não faz sentido pra quem já tem sessão).
  const unlocked = i === 0 || authed
  const href = unlocked ? `/tese/${c.id}` : '/login'
  const title = (c.title ?? '').trim()
  const leftTitle = /[.!?…]$/.test(title) ? title : `${title}.`
  return {
    slug: c.id,
    cat: c.sector,
    image: c.image,
    perf: c.returnLabel || null,
    perfLabel: c.rankLabel || 'Tese Redentia',
    // A API não marca trecho de destaque no título — hidratado renderiza plano.
    titlePre: title,
    titleHi: '',
    titlePost: '',
    desc: c.description,
    tickers: (c.tickers ?? []).slice(0, 2).map((t, j) => ({
      letter: t.charAt(0) || '?',
      name: t,
      tile: TILE_CYCLE[(i + j) % TILE_CYCLE.length]!,
    })),
    more: c.extraTickers > 0 ? `+${c.extraTickers}` : null,
    fontes: `${c.sourcesCount} fontes`,
    href,
    leftTitle,
    leftDesc: c.conviction != null ? `${c.description} Convicção ${c.conviction}/100.` : c.description,
    cta: unlocked ? 'Ver a tese completa' : 'Criar conta para desbloquear',
    ctaHref: href,
  }
}

export function useNuTheses() {
  // Estado = cards CRUS da API; os VMs saem de um computed porque o href das
  // teses travadas depende de isAuthenticated (reage a login/logout sem
  // re-fetch). SSR-safe: apiCards só é preenchido no onMounted, então o SSR
  // sempre renderiza o SEED — zero hydration mismatch.
  const apiCards = useState<ThesisCardApi[]>('nu:mercado:theses-api', () => [])
  const started = useState('nu:mercado:theses-started', () => false)
  const loading = useState('nu:mercado:theses-loading', () => true)
  const { isAuthenticated } = useAuthState()

  const theses = computed<NuThesis[]>(() => {
    if (apiCards.value.length < 2) return THESES_SEED
    return apiCards.value.map((c, i) => mapThesis(c, i, isAuthenticated.value))
  })

  async function hydrate() {
    if (started.value) return
    started.value = true
    try {
      const res = await marketFetchTheses()
      const cards = (res?.data ?? []).slice(0, 4)
      if (cards.length < 2) return // carrossel precisa de conteúdo — mantém o seed
      apiCards.value = cards
    }
    catch { /* mantém o seed */ }
    finally { loading.value = false }
  }

  onMounted(hydrate)
  return { theses, loading }
}

/* ═════ Movers ("O mercado hoje") ═════ */

type SeedRow = [ticker: string, name: string, price: string, pct: number]

function seedRows(rows: SeedRow[]): NuMoverRow[] {
  return rows.map((r, i) => ({ rank: i + 1, ticker: r[0], name: r[1], price: r[2], pct: pctFmt(r[3]), dir: dirOf(r[3]) }))
}

const MOVERS_SEED: Record<NuMoverTab, NuMoversClass> = {
  'Ações': {
    gainers: seedRows([['VALE3', 'Vale', 'R$ 61,20', 3.10], ['NVDC34', 'Nvidia BDR', 'R$ 48,12', 2.45], ['BBAS3', 'Banco do Brasil', 'R$ 27,45', 1.89], ['WEGE3', 'WEG', 'R$ 52,10', 1.72], ['PETR4', 'Petrobras', 'R$ 38,25', 0.76]]),
    losers: seedRows([['MGLU3', 'Magazine Luiza', 'R$ 11,32', -2.92], ['CVCB3', 'CVC', 'R$ 2,84', -2.10], ['ITUB4', 'Itaú Unibanco', 'R$ 34,80', -0.63], ['AZUL4', 'Azul', 'R$ 4,92', -0.58], ['LREN3', 'Lojas Renner', 'R$ 14,05', -0.44]]),
  },
  'FIIs': {
    gainers: seedRows([['MXRF11', 'Maxi Renda', 'R$ 10,52', 1.24], ['HGLG11', 'CSHG Logística', 'R$ 162,10', 0.98], ['KNRI11', 'Kinea Renda', 'R$ 144,80', 0.84], ['XPML11', 'XP Malls', 'R$ 118,42', 0.71], ['VISC11', 'Vinci Shopping', 'R$ 112,30', 0.52]]),
    losers: seedRows([['XPLG11', 'XP Log', 'R$ 98,45', -0.92], ['BTLG11', 'BTG Logística', 'R$ 102,60', -0.64], ['HGRU11', 'CSHG Renda Urbana', 'R$ 124,15', -0.41], ['RECT11', 'REC Renda', 'R$ 48,20', -0.38], ['MALL11', 'Malls Brasil', 'R$ 96,74', -0.22]]),
  },
  'Cripto': {
    gainers: seedRows([['SOL', 'Solana', 'R$ 890', 3.42], ['BTC', 'Bitcoin', 'R$ 612 mil', 1.84], ['ADA', 'Cardano', 'R$ 4,12', 1.12], ['XRP', 'XRP', 'R$ 12,40', 0.88], ['DOT', 'Polkadot', 'R$ 38,20', 0.54]]),
    losers: seedRows([['DOGE', 'Dogecoin', 'R$ 0,92', -1.84], ['LINK', 'Chainlink', 'R$ 98,40', -1.10], ['AVAX', 'Avalanche', 'R$ 142,10', -0.92], ['MATIC', 'Polygon', 'R$ 3,84', -0.64], ['ETH', 'Ethereum', 'R$ 18,4 mil', -0.52]]),
  },
  'BDRs': {
    gainers: seedRows([['NVDC34', 'Nvidia', 'R$ 48,12', 2.45], ['AAPL34', 'Apple', 'R$ 62,40', 1.32], ['MSFT34', 'Microsoft', 'R$ 94,15', 1.10], ['AMZO34', 'Amazon', 'R$ 58,72', 0.94], ['GOGL34', 'Alphabet', 'R$ 52,18', 0.71]]),
    losers: seedRows([['TSLA34', 'Tesla', 'R$ 41,20', -1.42], ['META34', 'Meta', 'R$ 88,64', -0.88], ['NFLX34', 'Netflix', 'R$ 112,45', -0.52], ['DISB34', 'Disney', 'R$ 34,10', -0.41], ['BABA34', 'Alibaba', 'R$ 28,92', -0.30]]),
  },
}

const INDICES_SEED: NuIndexStat[] = [
  { label: 'IBOV', value: '197.412', pct: '+0,91%', dir: 'up' },
  { label: 'IFIX', value: '3.412', pct: '+0,24%', dir: 'up' },
]

function mapTickerRow(t: TickerApi, i: number): NuMoverRow | null {
  if (t.market_price == null || t.change_percent == null) return null
  return {
    rank: i + 1,
    ticker: t.ticker,
    name: t.name,
    price: `R$ ${nf2.format(t.market_price)}`,
    pct: pctFmt(t.change_percent),
    dir: dirOf(t.change_percent),
  }
}

/** 612000 → 'R$ 612 mil' · 18400 → 'R$ 18,4 mil' · 98.4 → 'R$ 98,40'. */
function cryptoPrice(v: number): string {
  if (v >= 10_000) {
    const mil = v / 1000
    return `R$ ${(mil >= 100 ? nf0 : nf1).format(mil)} mil`
  }
  return `R$ ${nf2.format(v)}`
}

export function useNuMovers() {
  const tabs: NuMoverTab[] = ['Ações', 'FIIs', 'Cripto', 'BDRs']
  const movers = useState<Record<NuMoverTab, NuMoversClass>>('nu:mercado:movers', () => MOVERS_SEED)
  const indices = useState<NuIndexStat[]>('nu:mercado:indices', () => INDICES_SEED)
  const started = useState('nu:mercado:movers-started', () => false)
  const loading = useState('nu:mercado:movers-loading', () => true)

  async function hydrate() {
    if (started.value) return
    started.value = true
    try {
      const [st, sw, rt, rw, bt, bw, cr, snap] = await Promise.allSettled([
        marketFetchMovers('stocks', 'top'),
        marketFetchMovers('stocks', 'worst'),
        marketFetchMovers('reits', 'top'),
        marketFetchMovers('reits', 'worst'),
        marketFetchMovers('bdrs', 'top'),
        marketFetchMovers('bdrs', 'worst'),
        marketFetchCrypto(200),
        marketFetchSnapshot(),
      ])

      const side = (r: typeof st): NuMoverRow[] | null => {
        if (r.status !== 'fulfilled') return null
        const rows = (r.value?.data ?? [])
          .filter((t) => t.market_price != null && t.change_percent != null)
          .slice(0, 5)
          .map(mapTickerRow)
          .filter((x): x is NuMoverRow => x !== null)
        return rows.length >= 3 ? rows : null
      }

      const next: Record<NuMoverTab, NuMoversClass> = { ...movers.value }
      const pairs: [NuMoverTab, typeof st, typeof st][] = [
        ['Ações', st, sw],
        ['FIIs', rt, rw],
        ['BDRs', bt, bw],
      ]
      for (const [tab, a, b] of pairs) {
        const gainers = side(a)
        const losers = side(b)
        if (gainers && losers) next[tab] = { gainers, losers }
      }

      // Cripto: backend não tem endpoint de movers — deriva de /crypto (change_24h).
      if (cr.status === 'fulfilled') {
        const coins = (cr.value?.data ?? []).filter((c) => c.price_brl != null && c.change_24h != null)
        const sorted = [...coins].sort((a, b) => (b.change_24h ?? 0) - (a.change_24h ?? 0))
        const toRow = (c: (typeof coins)[number], i: number): NuMoverRow => ({
          rank: i + 1,
          ticker: c.symbol.toUpperCase(),
          name: c.name,
          price: cryptoPrice(c.price_brl as number),
          pct: pctFmt(c.change_24h as number),
          dir: dirOf(c.change_24h as number),
        })
        const gainers = sorted.slice(0, 5).map(toRow)
        const losers = sorted.slice(-5).reverse().map(toRow)
        if (gainers.length >= 3 && losers.length >= 3) next['Cripto'] = { gainers, losers }
      }

      movers.value = next

      if (snap.status === 'fulfilled') {
        const out: NuIndexStat[] = []
        for (const label of ['IBOV', 'IFIX'] as const) {
          const idx = snap.value?.indices_br?.[label]
          if (idx?.value != null && idx.change_pct != null) {
            out.push({ label, value: nf0.format(idx.value), pct: pctFmt(idx.change_pct), dir: dirOf(idx.change_pct) })
          }
        }
        if (out.length) indices.value = out
      }
    }
    catch { /* mantém o seed */ }
    finally { loading.value = false }
  }

  onMounted(hydrate)
  return { tabs, movers, indices, loading }
}

/* ═════ Briefing ("A leitura do dia") ═════ */

const BRIEFING_SEED: NuBriefing = {
  metaLine: 'Todo pregão, a IA da Redentia escreve o fechamento. Este é o de hoje, às 18:12',
  headline: 'Ibovespa sobe 1,22% rumo aos 173 mil com a curva de juros em queda.',
  dek: 'O fluxo gira para bancos e duration, e só o petróleo fica para trás.',
  pills: [
    { label: 'Ibovespa', value: '172.742', delta: '+1,22%', dir: 'up' },
    { label: 'Amplitude', value: '65 altas · 7 quedas', delta: null, dir: null },
    { label: 'Dólar', value: 'R$ 5,13', delta: '−0,43%', dir: 'down' },
    { label: 'IFIX', value: null, delta: '+0,27%', dir: 'up' },
    { label: 'PETR4', value: null, delta: '−1,08%', dir: 'down' },
  ],
  paragraphs: [
    'O Ibovespa avançou 1,22% e fechou aos 172.742 pontos, colado nos 173 mil, num pregão de alta rara pela amplitude: 65 das 82 ações do índice subiram, contra apenas 7 quedas. Não foi rali de uma ponta só. O gatilho veio de fora: o alívio entre EUA e Irã derrubou o prêmio de risco e puxou os Treasuries para baixo, arrastando a curva de juros brasileira em todos os vértices. Com o dólar recuando 0,43% para R$ 5,13, o pano de fundo virou favorável ao ativo de risco.',
    'A queda do juro longo reprecifica o mercado inteiro. Custo de capital menor favorece quem tem duration, e a bolsa girou exatamente nessa direção: bancos e financeiras lideraram, com B3 e BTG subindo perto de 4% e o Banco do Brasil 2,4%, enquanto imobiliárias como Cyrela e Cury e nomes sensíveis a juro no varejo e na saúde (caso de Raia Drogasil e Rede D\'Or) figuraram entre as maiores altas. O IFIX acompanhou de leve, com avanço de 0,27%. É a rotação clássica para o risco quando o prêmio de juro cede.',
  ],
  extraParagraphs: [
    'A contrapartida ficou na energia. O alívio geopolítico que animou a bolsa é o mesmo que tira prêmio do petróleo, e a Petrobras andou na direção oposta ao índice: PETR4 caiu 1,08% e PETR3 recuou 1,40%, puxando PRIO e PetroRecôncavo junto. É a tese "O petróleo que paga dividendo" operando ao contrário no curto prazo: quando o risco global desinflaciona, o mercado troca o dividendo defensivo do óleo pelo beta dos juros.',
  ],
  takeaway: {
    kicker: 'O que segurar do dia',
    html: 'Foi um rali de alívio, não de fundamento. A peça que ainda falta é o estrangeiro, e a tese "O fluxo que ainda não chegou" segue no aguardo. Dólar mais fraco e curva em queda montam o cenário para o fluxo virar, mas enquanto o Tesouro IPCA+ paga cerca de 8% de juro real, a renda fixa continua sendo o maior concorrente da bolsa. A alta de hoje é o convite; a confirmação depende de o capital de fora finalmente aceitar.',
  },
  sections: null,
}

/**
 * '18h12' a partir do published_at do briefing (PR-B) — ou null quando o campo
 * ainda não existe (briefings antigos) ou não parseia. Timestamp COM timezone
 * (ISO do resource Laravel) → converte pra America/Sao_Paulo; sem timezone
 * ('YYYY-MM-DD HH:MM:SS' cru do banco) → assume que já é hora de SP e extrai.
 */
function publishedTimeLabel(raw: string | null | undefined): string | null {
  const s = raw?.trim()
  if (!s) return null
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(s)) {
    const dt = new Date(s)
    if (Number.isNaN(dt.getTime())) return null
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
      .format(dt)
      .replace(':', 'h')
  }
  const m = s.match(/[T ](\d{2}):(\d{2})/)
  return m ? `${m[1]}h${m[2]}` : null
}

export function useNuBriefing() {
  const briefing = useState<NuBriefing>('nu:mercado:briefing', () => BRIEFING_SEED)
  const started = useState('nu:mercado:briefing-started', () => false)
  const loading = useState('nu:mercado:briefing-loading', () => true)

  async function hydrate() {
    if (started.value) return
    started.value = true
    try {
      const [b, snap, today, petr] = await Promise.allSettled([
        marketFetchBriefingToday(),
        marketFetchSnapshot(),
        marketFetchToday(),
        marketFetchQuote('PETR4'),
      ])
      if (b.status !== 'fulfilled' || !b.value?.data?.headline) return
      const d = b.value.data
      const paras = String(d.body ?? '').split(/\n+/).map((s) => s.trim()).filter(Boolean)
      if (!paras.length) return

      // Stat pills honestas: só as que têm dado real agora (as demais somem).
      const pills: NuStatPill[] = []
      if (snap.status === 'fulfilled') {
        const ibov = snap.value?.indices_br?.IBOV
        if (ibov?.value != null && ibov.change_pct != null) {
          pills.push({ label: 'Ibovespa', value: nf0.format(ibov.value), delta: pctFmt(ibov.change_pct), dir: dirOf(ibov.change_pct) })
        }
      }
      if (today.status === 'fulfilled') {
        const cons = today.value?.constituents ?? []
        if (cons.length) {
          const ups = cons.filter((c) => (c.change_pct ?? 0) > 0).length
          const downs = cons.filter((c) => (c.change_pct ?? 0) < 0).length
          pills.push({ label: 'Amplitude', value: `${ups} altas · ${downs} quedas`, delta: null, dir: null })
        }
      }
      if (snap.status === 'fulfilled') {
        const usd = snap.value?.macro?.usd_brl
        if (usd?.value != null) {
          const chg = usd.change_pct
          pills.push({ label: 'Dólar', value: `R$ ${nf2.format(usd.value)}`, delta: chg != null ? pctFmt(chg) : null, dir: chg != null ? dirOf(chg) : null })
        }
        const ifix = snap.value?.indices_br?.IFIX
        if (ifix?.change_pct != null) {
          pills.push({ label: 'IFIX', value: null, delta: pctFmt(ifix.change_pct), dir: dirOf(ifix.change_pct) })
        }
      }
      if (petr.status === 'fulfilled') {
        const q = petr.value?.data
        if (q?.change_percent != null) {
          pills.push({ label: 'PETR4', value: null, delta: pctFmt(q.change_percent), dir: dirOf(q.change_percent) })
        }
      }

      const isToday = d.date === localISODate()
      const dateLabel = isToday || !d.date ? 'hoje' : `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`
      const timeLabel = publishedTimeLabel(d.published_at)
      briefing.value = {
        metaLine: `Todo pregão, a IA da Redentia escreve o fechamento. Este é o de ${dateLabel}${timeLabel ? `, às ${timeLabel}` : ''}`,
        headline: d.headline,
        dek: null, // o resource real não tem dek separado do corpo
        pills,
        paragraphs: paras.slice(0, 2).map(briefingHtml),
        extraParagraphs: paras.slice(2).map(briefingHtml),
        takeaway: null, // idem: sem bloco "o que segurar" no resource atual
        sections: d.sections ?? null, // blocos estruturados (PR-B) — buildDayTopics consome cru
      }
    }
    catch { /* mantém o seed */ }
    finally { loading.value = false }
  }

  onMounted(hydrate)
  return { briefing, loading }
}

/* ═════ Tesouro Direto ═════ */

const TESOURO_HIGHLIGHT_SEED: NuTesouroHighlight = {
  name: 'IPCA+ 2026',
  venc: 'Venc. 08/26',
  rate: 'IPCA+ 11,48%',
  updated: 'Atualizado hoje · 12:47',
}

const TESOURO_GROUPS_SEED: NuTesouroGroup[] = [
  {
    name: 'IPCA+',
    count: '5 títulos',
    rows: [
      { name: 'IPCA+ 2026', venc: 'Venc. 08/26', rate: 'IPCA+ 11,48%' },
      { name: 'IPCA+ JS 2026', venc: 'Venc. 08/26', rate: 'IPCA+ 11,48%' },
      { name: 'IPCA+ JS 2028', venc: 'Venc. 08/28', rate: 'IPCA+ —' },
      { name: 'IPCA+ 2029', venc: 'Venc. 05/29', rate: 'IPCA+ 8,43%' },
      { name: 'IPCA+ JS 2030', venc: 'Venc. 08/30', rate: 'IPCA+ 8,43%' },
    ],
  },
  {
    name: 'SELIC',
    count: '5 títulos',
    rows: [
      { name: 'Selic 2027', venc: 'Venc. 02/27', rate: 'SELIC +0,01%' },
      { name: 'Selic 2028', venc: 'Venc. 02/28', rate: 'SELIC +0,02%' },
      { name: 'Selic 2029', venc: 'Venc. 02/29', rate: 'SELIC +0,04%' },
      { name: 'Selic 2031', venc: 'Venc. 02/31', rate: 'SELIC +0,07%' },
      { name: 'Reserva 2036', venc: 'Venc. 05/36', rate: 'SELIC —' },
    ],
  },
  {
    name: 'Prefixado',
    count: '5 títulos',
    rows: [
      { name: 'Prefixado 2027', venc: 'Venc. 12/26', rate: '13,81%' },
      { name: 'Prefixado JS 2027', venc: 'Venc. 12/26', rate: '13,84%' },
      { name: 'Prefixado 2028', venc: 'Venc. 12/27', rate: '14,10%' },
      { name: 'Prefixado 2029', venc: 'Venc. 12/28', rate: '14,32%' },
      { name: 'Prefixado JS 2029', venc: 'Venc. 12/28', rate: '14,24%' },
    ],
  },
]

export function useNuTesouro() {
  const highlight = useState<NuTesouroHighlight>('nu:mercado:tesouro-hi', () => TESOURO_HIGHLIGHT_SEED)
  const groups = useState<NuTesouroGroup[]>('nu:mercado:tesouro-groups', () => TESOURO_GROUPS_SEED)
  const started = useState('nu:mercado:tesouro-started', () => false)
  const loading = useState('nu:mercado:tesouro-loading', () => true)

  async function hydrate() {
    if (started.value) return
    started.value = true
    try {
      const defs = [
        { indexer: 'IPCA', name: 'IPCA+' },
        { indexer: 'SELIC', name: 'SELIC' },
        { indexer: 'PREFIXADO', name: 'Prefixado' },
      ] as const
      const results = await Promise.allSettled(defs.map((d) => marketFetchTesouro(d.indexer)))

      const shortName = (n: string) => n.replace(/^Tesouro\s+/i, '')
      const next: NuTesouroGroup[] = []
      for (let i = 0; i < defs.length; i++) {
        const r = results[i]
        if (r?.status !== 'fulfilled' || !(r.value?.data ?? []).length) continue
        const data = r.value.data
        next.push({
          name: defs[i]!.name,
          count: `${r.value.meta?.count ?? data.length} títulos`,
          rows: data.slice(0, 5).map((t) => ({ name: shortName(t.name), venc: vencFmt(t.maturity_date), rate: t.rate })),
        })
      }
      // O grid do design é 1 destaque + 3 grupos: só troca com os 3 completos.
      if (next.length === defs.length) groups.value = next

      const ipca = results[0]?.status === 'fulfilled' ? (results[0].value?.data ?? []) : []
      const best = ipca
        .filter((t) => t.rate_numeric != null)
        .sort((a, b) => (b.rate_numeric ?? 0) - (a.rate_numeric ?? 0))[0]
      if (best) {
        let updated = ''
        if (best.refreshed_at) {
          const dt = new Date(best.refreshed_at)
          if (!Number.isNaN(dt.getTime())) {
            const hm = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
            const day = localISODate(dt) === localISODate() ? 'hoje' : `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`
            updated = `Atualizado ${day} · ${hm}`
          }
        }
        highlight.value = {
          name: shortName(best.name),
          venc: vencFmt(best.maturity_date),
          rate: best.rate,
          updated: updated || highlight.value.updated,
        }
      }
    }
    catch { /* mantém o seed */ }
    finally { loading.value = false }
  }

  onMounted(hydrate)
  return { highlight, groups, loading }
}

/* ═════ Notícias ═════ */

const NEWS_FEATURED_SEED: NuNewsFeaturedItem = {
  href: '/noticias',
  badge: { text: 'IBOV +0,91%', dir: 'up' },
  source: 'Exame · hoje, 08:30',
  title: 'Ibovespa renova recorde histórico aos 197 mil pontos.',
  dek: 'Fluxo estrangeiro e balanços acima do esperado sustentam a 12ª máxima do ano na B3.',
}

const NEWS_ROWS_SEED: NuNewsRowItem[] = [
  { href: '/noticias', title: 'Banco do Brasil anuncia dividendos extraordinários', source: 'Money Times · hoje, 09:12', ticker: { text: 'BBAS3 +2,10%', dir: 'up' } },
  { href: '/noticias', title: 'Petroleiras perdem apelo com Brent caminhando para US$ 60', source: 'Valor Investe · hoje, 09:40', ticker: { text: 'PETR4 -1,20%', dir: 'down' } },
  { href: '/noticias', title: 'Vale amplia guidance de produção de minério para 2027', source: 'InfoMoney · ontem', ticker: { text: 'VALE3 +3,10%', dir: 'up' } },
  { href: '/noticias', title: 'WEG anuncia nova fábrica de motores no México', source: 'Bloomberg Línea · ontem', ticker: { text: 'WEGE3 +1,72%', dir: 'up' } },
]

interface RawNews {
  source: string
  title: string
  dek: string
  ticker: string | null
  publishedAt: string | null
}

export function useNuNews() {
  const featured = useState<NuNewsFeaturedItem>('nu:mercado:news-featured', () => NEWS_FEATURED_SEED)
  const rows = useState<NuNewsRowItem[]>('nu:mercado:news-rows', () => NEWS_ROWS_SEED)
  const loaded = useState('nu:mercado:news-loaded', () => false)
  const started = useState('nu:mercado:news-started', () => false)
  const loading = useState('nu:mercado:news-loading', () => true)

  async function hydrate() {
    if (started.value) return
    started.value = true
    try {
      // news_takes traz tickers como objeto {ticker,dir}; /news como string.
      const tickerOf = (t: unknown): string | null => {
        if (typeof t === 'string') return t
        if (t && typeof t === 'object' && 'ticker' in t) return String((t as { ticker: unknown }).ticker)
        return null
      }
      let items: RawNews[] = []
      const research = await marketFetchResearchNews(8).catch(() => null)
      if (research?.data?.length) {
        items = research.data.map((n) => ({
          source: n.source,
          title: n.title,
          dek: n.atlasReading ?? '',
          ticker: tickerOf(n.tickers?.[0]),
          publishedAt: n.publishedAt,
        }))
      } else {
        const latest = await marketFetchLatestNews(8).catch(() => null)
        items = (latest?.data ?? []).map((n) => ({
          source: n.source,
          title: n.title,
          dek: n.excerpt ?? '',
          ticker: tickerOf(n.tickers?.[0]),
          publishedAt: n.published_at,
        }))
      }
      if (items.length < 2) return // precisa de destaque + pelo menos 1 linha

      const picked = items.slice(0, 5)
      const symbols = [...new Set(picked.map((n) => n.ticker).filter((t): t is string => !!t))]
      // Cotações da MESMA rota Laravel das páginas (≤5 fetches, cache 300s no
      // servidor) — o batch do chat-service ficava stale vs o scraper.
      const quotes = new Map<string, number>()
      await Promise.all(symbols.map(async (s) => {
        const q = await marketFetchQuote(s).catch(() => null)
        if (q?.data?.change_percent != null) quotes.set(s.toUpperCase(), q.data.change_percent)
      }))

      const badgeFor = (t: string | null) => {
        if (!t) return null
        const chg = quotes.get(t.toUpperCase())
        if (chg == null) return null
        return { text: `${t.toUpperCase()} ${pctFmt(chg)}`, dir: dirOf(chg) }
      }
      const sourceLine = (n: RawNews) => {
        const label = sourcePretty(n.source)
        const when = relTime(n.publishedAt)
        return when ? `${label} · ${when}` : label
      }

      const first = picked[0]!
      featured.value = {
        href: '/noticias',
        badge: badgeFor(first.ticker),
        source: sourceLine(first),
        title: first.title,
        dek: first.dek,
      }
      rows.value = picked.slice(1).map((n) => ({
        href: '/noticias',
        title: n.title,
        source: sourceLine(n),
        ticker: badgeFor(n.ticker),
      }))
      loaded.value = true
    }
    catch { /* mantém o seed */ }
    finally { loading.value = false }
  }

  onMounted(hydrate)
  return { featured, rows, loaded, loading }
}

/* ═════ Conteúdo estático da página (copy exata do design) ═════ */

// (Card "Cripto" removido — não existe página de cripto pra apontar; a lista
//  é uma coluna flex, então 4 linhas não quebram o layout.)
export const MERCADO_EXPLORE = [
  { t: 'Ações', d: 'Análise fundamentalista de 400+ empresas da B3, com score e preço-alvo.', href: '/asset/PETR4' },
  { t: 'FIIs', d: 'Fundos imobiliários com dividend yield, vacância e histórico de proventos.', href: '/rankings?classe=fiis' },
  { t: 'Tesouro Direto', d: 'Títulos públicos comparados com CDB e poupança, sem juridiquês.', href: '/ranking/tesouro-direto' },
  { t: 'Calculadoras', d: 'Juros compostos, preço teto e renda passiva em segundos.', href: '/calculadoras' },
] as const

export const MERCADO_GUIDES: NuGuideCardItem[] = [
  { tag: 'Guia Redentia', title: 'Open Finance: carteira espalhada?', href: '/guias/open-finance', variant: 1 },
  { tag: 'Ações', title: 'Como investir em ações', href: '/guias', variant: 2 },
  { tag: 'FIIs', title: 'Melhores FIIs 2026', href: '/guias', variant: 3 },
  { tag: 'Análise', title: 'Análise PETR4', href: '/guias', variant: 1 },
  { tag: 'Ações', title: 'Small caps: guia completo', href: '/guias', variant: 2 },
  { tag: 'Dividendos', title: 'Calculadora de dividendos', href: '/guias', variant: 3 },
]

export const MERCADO_FAQS: NuFaqItem[] = [
  {
    q: 'A Redentia é gratuita?',
    a: 'Sim. Criar conta, acompanhar o mercado, ler os guias e usar as calculadoras é grátis. Recursos avançados da IA e alertas ilimitados fazem parte do plano Pro.',
  },
  {
    q: 'Como a IA analisa as ações?',
    a: 'Ela cruza os fundamentos publicados pelas empresas (balanços, dividendos, endividamento) com preço e consenso de analistas, e traduz tudo em um score de 0 a 100 explicado em português claro.',
  },
  {
    q: 'Preciso conectar minha corretora?',
    a: 'Não é obrigatório. Você pode cadastrar posições manualmente ou conectar via Open Finance, com consentimento regulado pelo Banco Central: somente leitura, sem acesso a movimentações.',
  },
  {
    q: 'A Redentia recomenda compra e venda?',
    a: 'A Redentia organiza dados e mostra o consenso do mercado. As sugestões da IA são educacionais e não substituem a recomendação de um assessor credenciado.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Sim. Usamos criptografia de ponta a ponta e seus dados nunca são vendidos. Você pode excluir a conta e todos os dados a qualquer momento.',
  },
]
