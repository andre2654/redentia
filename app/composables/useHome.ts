/**
 * Dados da Home logada (PR7 `/`). Contrato de UX: designs/Redentia Home Nu.dc.html.
 *
 * SSR-FIRST (padrão acao/tese): o fetch roda no servidor via useAsyncData com
 * o Bearer do cookie `nu:token` — a 1ª resposta já sai com a saudação real.
 *
 * DIRETRIZ Nº1 (dono): tela DINÂMICA por card. Política de degradação POR
 * SEÇÃO, documentada em cada builder:
 *  - hero        cheio (patrimônio+dia) | parcial (sem /today → sem badge;
 *                sem /auth/me → saudação sem nome) | vazio (sem carteira →
 *                convite de conexão, MESMA tipografia gigante)
 *  - chart       cheio | parcial (<10 pontos → "coletando histórico") |
 *                vazio (sem curva → seção some)
 *  - posições    cheio | parcial (sem /today → cards sem var% do dia) |
 *                vazio (card de conexão — a seção nunca quebra)
 *  - teses       favoritos reais | descoberta (2 teses do /theses marcadas
 *                'Explorar') | some (só se /theses também falhar)
 *  - ações (IA)  0-3 cards DETERMINÍSTICOS de dado real; 0 cards → seção some
 *  - briefing    real do /briefing/today | byline honesta se for de outro dia
 *                | some (data:null / falha)
 *  - notícias    personalizada (/portfolio/news-today) | geral (useNuNews,
 *                h2 'No noticiário.') — nunca vazio morto
 *
 * 401/403 no /auth/me (token expirado): NÃO redireciona pro /login — devolve
 * `unauthenticated: true` e o index.vue limpa a sessão e renderiza a variante
 * anônima (o conteúdo do /mercado É a resposta certa pra `/` sem sessão;
 * navigateTo dentro de useAsyncData no SSR é frágil — decisão documentada).
 */
import type {
  CompositionApi,
  HomeActionCardVM,
  HomeAllocationVM,
  HomeBriefingVM,
  HomeChartVM,
  HomeHeroVM,
  HomeNewsVM,
  HomePayload,
  HomePositionRowVM,
  HomePositionsVM,
  HomeThesesVM,
  HomeThesisCardVM,
  IncomeApi,
  NewsTodayApi,
  PortfolioPositionApi,
  PortfolioTodayApi,
} from '~/types/home'
import type { BriefingApi, MarketSnapshotApi, MarketTodayApi, NuDir, NuStatPill, ThesisCardApi } from '~/types/market'
import type { ConsensusApi, SeriesPoint, TickerProfileApi } from '~/types/acao'
import type { ConvictionHistoryApi, ThesisFullApi } from '~/types/tese'

/* ————— helpers ————— */

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nfQty = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 })

// pctFmt/dirOf/spISODate vivem em utils/format.ts (extraídos no PR8).

/**
 * Relógio de São Paulo nos DOIS lados (produto BR-only): SSR e client
 * calculam saudação/dateLine no MESMO fuso — sem mismatch de hidratação
 * (o design computa do relógio local; a adaptação está documentada).
 */
function spClock() {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', hour12: false,
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return {
    weekday: get('weekday'),
    day: get('day'),
    month: get('month'),
    hour: Number(get('hour')) || 0,
  }
}

// positionValue/portfolioTotalValue/CLASS_*/TILE_*/buildEquityChartVM vivem em
// utils/portfolio.ts (extraídos no PR8 — /carteira usa os MESMOS builders).

const ok = <X>(r: PromiseSettledResult<X>): X | null => (r.status === 'fulfilled' ? r.value : null)

/* ————— hero ————— */

/**
 * Estados: 'patrimonio' (tem carteira) | 'connect' (convite de conexão vira o
 * hero — mesma tipografia gigante do design). Parciais: /today falhou → badge
 * do dia some (hojeTxt null); /auth/me falhou não-401 → saudação sem nome.
 * "mercado aberto": aproximação client-safe — dia útil das 10h às 18h de SP
 * (a B3 não expõe flag; documentado).
 */
function buildHero(userName: string | null, totalValue: number, today: PortfolioTodayApi | null): HomeHeroVM {
  const { weekday, day, month, hour } = spClock()
  const base = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const first = userName?.trim().split(/\s+/)[0] ?? ''
  const greeting = first ? `${base}, ${first}.` : `${base}.`
  const isWeekend = /(sábado|domingo)/i.test(weekday)
  const open = !isWeekend && hour >= 10 && hour < 18
  const dateLine = `${weekday}, ${day} de ${month} · mercado ${open ? 'aberto' : 'fechado'}`

  if (totalValue <= 0) {
    return { greeting, dateLine, state: 'connect', patrimonio: null, hojeTxt: null, hojeDir: 'up' }
  }

  let hojeTxt: string | null = null
  let hojeDir: NuDir = 'up'
  if (today?.totals && today.totals.value_d1 > 0) {
    const amt = today.totals.day_change_amount
    const pct = today.totals.day_change_pct
    hojeDir = dirOf(amt)
    hojeTxt = `${amt >= 0 ? '+' : '−'}R$ ${nf2.format(Math.abs(amt))} (${nf2.format(Math.abs(pct))}%) hoje`
  }

  return {
    greeting,
    dateLine,
    state: 'patrimonio',
    patrimonio: `R$ ${nf2.format(totalValue)}`,
    hojeTxt,
    hojeDir,
  }
}

/* ————— posições ————— */

/**
 * Estados: 'full' (resumo + alocação por CLASSE derivada das posições — o
 * design agrega por classe, não por setor — + top 6 cards por valor) |
 * 'empty' (card de conexão na linguagem do design). Parcial: sem /portfolio/
 * today os cards saem SEM var% do dia (pct null) — nunca número inventado.
 * Var% por ativo vem do snapshot /portfolio/today já buscado (zero fan-out
 * /tickers/{t} por posição — decisão de custo documentada).
 */
function buildPositions(
  portfolio: PortfolioPositionApi[] | null,
  today: PortfolioTodayApi | null,
): HomePositionsVM {
  interface Row { ticker: string; name: string | null; asset_class: string; qty: number; value: number; dayPct: number | null }

  let rows: Row[] = []
  if (today?.positions?.length) {
    rows = today.positions.map((p) => ({
      ticker: p.ticker,
      name: p.name,
      asset_class: p.asset_class,
      qty: p.quantity,
      value: p.value_now ?? 0,
      dayPct: p.flags?.some((f) => f.startsWith('pending_')) ? null : p.day_change_pct,
    }))
  } else if (portfolio?.length) {
    rows = portfolio.map((p) => ({
      ticker: p.ticker,
      name: p.name,
      asset_class: p.asset_class ?? 'STOCK',
      qty: p.quantity,
      value: positionValue(p),
      dayPct: null, // parcial: snapshot do dia indisponível — sem var% inventada
    }))
  }
  rows = rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value)

  if (!rows.length) {
    return { state: 'empty', summary: null, allocation: [], rows: [] }
  }

  const total = rows.reduce((s, r) => s + r.value, 0)

  /* alocação por classe (derivada das posições — dataNeeds do spec) */
  const byClass = new Map<string, number>()
  for (const r of rows) {
    const label = CLASS_LABEL[r.asset_class] ?? 'Outros'
    byClass.set(label, (byClass.get(label) ?? 0) + r.value)
  }
  const allocation: HomeAllocationVM[] = [...byClass.entries()]
    .sort((a, b) => CLASS_ORDER.indexOf(a[0]) - CLASS_ORDER.indexOf(b[0]))
    .map(([name, val]) => ({
      name,
      pctNum: (val / total) * 100,
      pct: `${nf0.format((val / total) * 100)}%`,
      val: `R$ ${nf0.format(val)}`,
      color: CLASS_COLOR[name] ?? 'var(--nu-alloc-cash)',
    }))

  const biggest = rows[0]!
  const summary = `${rows.length} ${rows.length === 1 ? 'ativo' : 'ativos'} · maior posição ${biggest.ticker} (${nf1.format((biggest.value / total) * 100)}%)`

  const isEquity = (c: string) => ['STOCK', 'REIT', 'ETF', 'BDR'].includes(c)
  const cards: HomePositionRowVM[] = rows.slice(0, 6).map((r, i) => {
    const tile = TILE_MAP[r.ticker] ?? TILE_CYCLE[i % TILE_CYCLE.length]!
    const unit = isEquity(r.asset_class) ? (r.qty === 1 ? 'cota' : 'cotas') : 'un.'
    return {
      ticker: r.ticker,
      sub: `${r.name || r.ticker} · ${nfQty.format(r.qty)} ${unit}`,
      letter: r.ticker.charAt(0).toUpperCase(),
      tileBg: tile[0],
      tileFg: tile[1],
      peso: `${nf1.format((r.value / total) * 100)}%`,
      valor: `R$ ${nf0.format(r.value)}`,
      valorRaw: r.value,
      pct: r.dayPct != null ? pctFmt(r.dayPct) : null,
      dir: dirOf(r.dayPct ?? 0),
      // cripto/tesouro não têm página de ativo — caem na carteira (documentado)
      href: isEquity(r.asset_class) ? `/acao/${r.ticker}` : '/carteira',
    }
  })

  return { state: 'full', summary, allocation, rows: cards }
}

/* ————— teses ————— */

/** '2026-07-08' → '8 jul' (box das teses). */
function shortDate(iso: string): string {
  const [, m, d] = iso.split('-')
  if (!m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m}`
}

/**
 * Estados: favoritos reais (GET /thesis-favorites × /theses, convicção via
 * conviction-history) | descoberta (sem favorito → 2 teses reais marcadas
 * 'Explorar' — nunca vazio morto) | null (só quando /theses falhou E não há
 * favoritos renderizáveis).
 * HONESTIDADE: o retorno exibido é o do backtest ("desde o lançamento") —
 * a API de favoritos NÃO expõe added_at, então "+X% desde que você segue"
 * do mock é incalculável hoje (lacuna documentada no relatório).
 */
async function buildTheses(
  base: string,
  favorites: string[] | null,
  theses: ThesisCardApi[] | null,
): Promise<HomeThesesVM | null> {
  if (!theses?.length) return null
  const bySlug = new Map(theses.map((t) => [t.id, t]))
  const today = spISODate()

  const favCards = (favorites ?? []).filter((s) => bySlug.has(s)).slice(0, 3)

  if (!favCards.length) {
    const picks = theses.slice(0, 2) // /theses já vem ordenado por retorno real
    if (!picks.length) return null
    return {
      mode: 'discover',
      sub: 'Você ainda não acompanha teses — duas pra conhecer o research vivo da Redentia',
      cards: picks.map((c) => ({
        slug: c.id,
        title: c.title,
        cat: c.sector,
        tickers: (c.tickers ?? []).slice(0, 6),
        following: false,
        image: c.image,
        badge: 'Explorar',
        badgeTone: 'blue',
        perf: c.returnLabel,
        perfLabel: 'desde o lançamento',
        ativos: `${c.companiesCount} ativos`,
        boxStrong: 'A tese:',
        boxText: c.description,
        boxDot: 'sand',
      })),
    }
  }

  // 2 fetches por favorito (máx 3 → 6): conviction-history + detail (box "Hoje:")
  const extras = await Promise.all(favCards.map(async (slug) => {
    const [convR, detR] = await Promise.allSettled([
      homeFetchConviction(base, slug),
      homeFetchThesisDetail(base, slug),
    ])
    return {
      conv: (ok(convR)?.data ?? null) as ConvictionHistoryApi | null,
      detail: (ok(detR)?.data ?? null) as ThesisFullApi | null,
    }
  }))

  let revalidatedToday = 0
  const cards: HomeThesisCardVM[] = favCards.map((slug, i) => {
    const card = bySlug.get(slug)!
    const conv = extras[i]?.conv ?? null
    const detail = extras[i]?.detail ?? null

    /* badge de convicção: delta de HOJE via série; sem série → sem delta */
    const current = conv?.current ?? card.conviction
    let badge = 'Acompanhando'
    let badgeTone: HomeThesisCardVM['badgeTone'] = 'neutral'
    if (current != null) {
      const s = conv?.series ?? []
      const lastPt = s[s.length - 1]
      const prevPt = s[s.length - 2]
      const deltaToday = lastPt?.date === today && prevPt ? lastPt.conviction - prevPt.conviction : 0
      if (deltaToday !== 0) {
        badge = `Convicção ${current} · ${deltaToday > 0 ? '+' : ''}${deltaToday} hoje`
        badgeTone = deltaToday > 0 ? 'green' : 'neutral'
      } else {
        badge = `Convicção ${current} · estável`
      }
    }

    /* box "Hoje:" do rodapé — estudo mais recente da revalidação diária */
    const study = detail?.studies?.[0] ?? null
    let boxStrong = 'A tese:'
    let boxText = card.description
    let boxDot: HomeThesisCardVM['boxDot'] = 'sand'
    if (study) {
      const text = study.summary && study.summary.length <= 240 ? study.summary : study.title
      if (study.date === today) {
        boxStrong = 'Hoje:'
        boxText = text
        boxDot = 'blue'
        revalidatedToday++
      } else {
        boxStrong = 'Hoje:'
        boxText = `sem novidades — última revisão (${shortDate(study.date)}): ${text}`
      }
    }

    return {
      slug,
      title: card.title,
      cat: card.sector,
      tickers: (card.tickers ?? []).slice(0, 6),
      following: true,
      image: card.image,
      badge,
      badgeTone,
      perf: card.returnLabel,
      perfLabel: 'desde o lançamento',
      ativos: `${card.companiesCount} ativos`,
      boxStrong,
      boxText,
      boxDot,
    }
  })

  const n = favCards.length
  const sub = `Você acompanha ${n} ${n === 1 ? 'tese' : 'teses'} · ${
    revalidatedToday === n ? 'revalidadas hoje pelo Atlas' : 'revalidação diária do Atlas'}`

  return { mode: 'favorites', sub, cards }
}

/* ————— "O que fazer agora" (regras determinísticas) ————— */

/**
 * REGRAS (todas de dado real; card só entra quando a regra dispara — 0 cards
 * ⇒ a seção some, inclusive pra logado sem conexão: o convite de conexão já é
 * o protagonista do hero, repetir outro CTA azul dobraria a mensagem):
 *
 * 1. REINVESTIR (prioridade): proventos do mês corrente (ou, se zero, do mês
 *    anterior) em /portfolio/income somam ≥ R$ 1. Copy cita o maior DY real
 *    da carteira (campo dividend_yield do /portfolio) quando existir.
 *    Não detectamos recompra (exigiria varrer /portfolio/trades) — a copy diz
 *    "recebidos", não "parados em conta" (honestidade > mock).
 * 2. REBALANCEAR (risco de concentração): setor top da /portfolio/composition
 *    com actualPercent ≥ 40%. Mini-barra = top 2 setores + Outros.
 * 3. OPORTUNIDADE: consenso REAL (GET /consensus/{t}, 204 tolerado) das TOP 3
 *    posições por valor (cap de 3 fetches — sem fan-out por posição);
 *    dispara com upside_percent ≥ 15% e alvo médio presente.
 */
function buildActions(
  income: IncomeApi | null,
  composition: CompositionApi | null,
  portfolio: PortfolioPositionApi[] | null,
  consensus: (ConsensusApi | null)[],
  positionsVM: HomePositionsVM,
): HomeActionCardVM[] {
  const cards: HomeActionCardVM[] = []

  /* 1. Reinvestir */
  const months = income?.months ?? []
  const nowKey = spISODate().slice(0, 7)
  const cur = months.find((m) => m.month === nowKey)
  const prevDate = new Date(`${nowKey}-15T12:00:00Z`)
  prevDate.setUTCMonth(prevDate.getUTCMonth() - 1)
  const prev = months.find((m) => m.month === prevDate.toISOString().slice(0, 7))
  const bucket = cur && cur.total >= 1 ? cur : prev && prev.total >= 1 ? prev : null
  if (bucket) {
    const monthName = MONTH_LONG_PT[Number(bucket.month.slice(5)) - 1] ?? bucket.label.toLowerCase()
    const topDy = (portfolio ?? [])
      .map((p) => ({ ticker: p.ticker, dy: Number(p.dividend_yield) }))
      .filter((p) => Number.isFinite(p.dy) && p.dy > 0)
      .sort((a, b) => b.dy - a.dy)[0]
    cards.push({
      kind: 'reinvest',
      kicker: 'Reinvestir',
      badge: 'PRIORIDADE',
      badgeTone: 'priority',
      hero: `R$ ${nf2.format(bucket.total)}`,
      heroTone: 'cream',
      sublabel: `em proventos recebidos em ${monthName}`,
      body: topDy
        ? `Seus proventos de ${monthName} já caíram. ${topDy.ticker} paga DY de ${nf1.format(topDy.dy)}% na sua carteira — reinvestir mantém os juros compostos girando.`
        : `Seus proventos de ${monthName} já caíram. Reinvestir hoje mantém os juros compostos girando.`,
      bars: null,
      pair: null,
      cta: 'Reinvestir agora',
      ctaHref: '/carteira',
      ctaVariant: 'filled',
    })
  }

  /* 2. Rebalancear */
  const sectors = composition?.sectors ?? []
  const top = sectors[0]
  if (top && top.actualPercent >= 40 && sectors.length > 1) {
    const second = sectors[1]
    const shown = [top, ...(second ? [second] : [])]
    const rest = Math.max(0, 100 - shown.reduce((s, x) => s + x.actualPercent, 0))
    const bars = [
      ...shown.map((s) => ({ pct: s.actualPercent, label: s.label, value: `${nf0.format(s.actualPercent)}%` })),
      ...(rest >= 1 ? [{ pct: rest, label: 'Outros', value: `${nf0.format(rest)}%` }] : []),
    ]
    cards.push({
      kind: 'rebalance',
      kicker: 'Rebalancear',
      badge: 'Risco de concentração',
      badgeTone: 'warning',
      hero: `${nf0.format(top.actualPercent)}%`,
      heroTone: 'cream',
      sublabel: `da carteira em ${top.label}`,
      body: `${top.label} responde por ${nf0.format(top.actualPercent)}% do seu patrimônio — um setor só concentra quase toda a volatilidade. Diversificar reduziria o risco sem sacrificar renda.`,
      bars,
      pair: null,
      cta: 'Simular rebalanceamento',
      ctaHref: '/carteira',
      ctaVariant: 'outline',
    })
  }

  /* 3. Oportunidade */
  const best = consensus
    .filter((c): c is ConsensusApi => !!c && c.coverage !== 'none')
    .filter((c) => c.upside_percent != null && c.upside_percent >= 15 && c.price?.target_average != null)
    .sort((a, b) => (b.upside_percent ?? 0) - (a.upside_percent ?? 0))[0]
  if (best) {
    const posRow = positionsVM.rows.find((r) => r.ticker === best.ticker)
    const current = best.price.close
    const target = best.price.target_average!
    const analysts = best.breakdown?.analyst_count ?? null
    if (current != null) {
      cards.push({
        kind: 'opportunity',
        kicker: 'Oportunidade',
        badge: 'Na sua carteira',
        badgeTone: 'positive',
        hero: `+${nf1.format(best.upside_percent!)}%`,
        heroTone: 'green',
        sublabel: `de upside em ${best.ticker}`,
        body: `O consenso dos analistas vê ${best.ticker} em R$ ${nf2.format(target)} — ${nf1.format(best.upside_percent!)}% acima do preço atual. O papel já está na sua carteira${posRow?.peso ? ` (${posRow.peso})` : ''}.`,
        bars: null,
        pair: {
          current: `R$ ${nf2.format(current)}`,
          target: `R$ ${nf2.format(target)}`,
          targetSub: analysts ? `alvo médio · ${analysts} analistas` : 'alvo médio',
        },
        cta: `Analisar ${best.ticker}`,
        ctaHref: `/acao/${best.ticker}`,
        ctaVariant: 'outline',
      })
    }
  }

  return cards
}

/* ————— briefing ————— */

/**
 * Canônico Laravel GET /briefing/today (mesma fonte da Home Atlas). Estados:
 * null = seção some (endpoint sem briefing/falha). Briefing de outro dia
 * (fim de semana): byline honesta 'O fechamento de DD/MM…' — o resource não
 * tem hora de publicação, então a byline sai sem '· HH:MM' (documentado).
 * Stat-pills seguem o padrão do useNuBriefing: só as que têm dado real agora.
 */
function buildBriefing(
  b: BriefingApi | null,
  snap: MarketSnapshotApi | null,
  mktToday: MarketTodayApi | null,
  petr: TickerProfileApi | null,
): HomeBriefingVM | null {
  if (!b?.headline) return null
  const paras = String(b.body ?? '').split(/\n+/).map((s) => s.trim()).filter(Boolean)
  if (!paras.length) return null

  const pills: NuStatPill[] = []
  const ibov = snap?.indices_br?.IBOV
  if (ibov?.value != null && ibov.change_pct != null) {
    pills.push({ label: 'Ibovespa', value: nf0.format(ibov.value), delta: pctFmt(ibov.change_pct), dir: dirOf(ibov.change_pct) })
  }
  const cons = mktToday?.constituents ?? []
  if (cons.length) {
    const ups = cons.filter((c) => (c.change_pct ?? 0) > 0).length
    const downs = cons.filter((c) => (c.change_pct ?? 0) < 0).length
    pills.push({ label: 'Amplitude', value: `${ups} altas · ${downs} quedas`, delta: null, dir: null })
  }
  const usd = snap?.macro?.usd_brl
  if (usd?.value != null) {
    const chg = usd.change_pct
    pills.push({ label: 'Dólar', value: `R$ ${nf2.format(usd.value)}`, delta: chg != null ? pctFmt(chg) : null, dir: chg != null ? dirOf(chg) : null })
  }
  const ifix = snap?.indices_br?.IFIX
  if (ifix?.change_pct != null) {
    pills.push({ label: 'IFIX', value: null, delta: pctFmt(ifix.change_pct), dir: dirOf(ifix.change_pct) })
  }
  if (petr?.change_percent != null) {
    pills.push({ label: 'PETR4', value: null, delta: pctFmt(petr.change_percent), dir: dirOf(petr.change_percent) })
  }

  const isToday = b.date === spISODate()
  const byline = isToday || !b.date
    ? 'O fechamento de hoje, escrito pelo Atlas'
    : `O fechamento de ${b.date.slice(8, 10)}/${b.date.slice(5, 7)}, escrito pelo Atlas`

  return {
    byline,
    headline: b.headline,
    pills,
    paragraphs: paras.slice(0, 2).map(briefingHtml),
    extraParagraphs: paras.slice(2).map(briefingHtml),
  }
}

/* ————— notícias ————— */

/**
 * Personalizada quando /portfolio/news-today devolve itens (dek com impacto
 * pessoal 'X% da carteira' que o Resource já calcula; badge = 1º ticker
 * afetado com a var% do dia vinda do /portfolio/today já buscado). Sem
 * conexão/sem itens → mode 'general': o componente renderiza as notícias
 * gerais do useNuNews com h2 'No noticiário.' — a seção nunca morre.
 */
function buildNews(news: NewsTodayApi | null, today: PortfolioTodayApi | null): HomeNewsVM {
  const items = news?.items ?? []
  if (!items.length) return { mode: 'general', featured: null, rows: [] }

  const dayPct = new Map<string, number>()
  for (const p of today?.positions ?? []) {
    if (p.day_change_pct != null && !p.flags?.some((f) => f.startsWith('pending_'))) {
      dayPct.set(p.ticker, p.day_change_pct)
    }
  }
  const badgeFor = (tickers: string[]) => {
    const t = tickers[0]
    if (!t) return null
    const chg = dayPct.get(t)
    if (chg == null) return null
    return { text: `${t} ${pctFmt(chg)}`, dir: dirOf(chg) }
  }
  const sourceLine = (it: NewsTodayApi['items'][number]) => {
    const when = relTime(it.published_at)
    return when ? `${it.source} · ${when}` : it.source
  }
  const dekFor = (it: NewsTodayApi['items'][number]) => {
    const impact = it.pctOfPortfolio > 0 && it.affectedAssets[0]
      ? `afeta a sua posição em ${it.affectedAssets[0]}, ${nf1.format(it.pctOfPortfolio)}% da carteira.`
      : ''
    const summary = (it.summary ?? '').trim().replace(/\.$/, '')
    if (summary && impact) return `${summary} — ${impact}`
    if (summary) return `${summary}.`
    return impact ? impact.charAt(0).toUpperCase() + impact.slice(1) : ''
  }

  const first = items[0]!
  return {
    mode: 'personal',
    featured: {
      badge: badgeFor(first.affectedAssets),
      source: sourceLine(first),
      title: first.headline,
      dek: dekFor(first),
    },
    rows: items.slice(1, 5).map((it) => ({
      title: it.headline,
      source: sourceLine(it),
      ticker: badgeFor(it.affectedAssets),
    })),
  }
}

/* ————— loader ————— */

function emptyPayload(unauthenticated: boolean): HomePayload {
  return {
    unauthenticated,
    hero: buildHero(null, 0, null),
    chart: null,
    positions: { state: 'empty', summary: null, allocation: [], rows: [] },
    theses: null,
    actions: [],
    briefing: null,
    news: { mode: 'general', featured: null, rows: [] },
  }
}

async function loadHome(base: string, token: string): Promise<HomePayload> {
  const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` }

  /* 1. sessão primeiro: 401/403 = token morto → variante anônima (index.vue) */
  let userName: string | null = null
  try {
    const me = await homeFetchMe(base, headers)
    userName = me?.user?.name ?? null
  } catch (e: unknown) {
    const status = (e as { statusCode?: number; response?: { status?: number } })?.statusCode
      ?? (e as { response?: { status?: number } })?.response?.status
    if (status === 401 || status === 403) return emptyPayload(true)
    // falha não-auth (500/rede): segue com saudação sem nome (parcial documentado)
  }

  /* 2. fan-out por seção — allSettled: uma seção nunca derruba a página */
  const [
    portfolioR, todayR, curveR, compR, incomeR, newsR, favR,
    thesesR, briefR, snapR, mktTodayR, petrR, macroR, ibovR,
  ] = await Promise.allSettled([
    homeFetchPortfolio(base, headers),
    homeFetchToday(base, headers),
    homeFetchEquityCurve(base, headers),
    homeFetchComposition(base, headers),
    homeFetchIncome(base, headers),
    homeFetchNewsToday(base, headers),
    homeFetchThesisFavorites(base, headers),
    acaoFetchTheses(base),
    homeFetchBriefing(base),
    homeFetchSnapshot(base),
    homeFetchMarketToday(base),
    acaoFetchProfile(base, 'PETR4'),
    homeFetchMacro(base),
    acaoFetchIbovPrices(base, '12mo'),
  ])

  const portfolio = ok(portfolioR)?.positions ?? null
  const today = ok(todayR)
  const curve = ok(curveR)?.data ?? null
  const composition = ok(compR)
  const income = ok(incomeR)
  const newsToday = ok(newsR)
  const favorites = ok(favR)?.favorites ?? null
  const theses = ok(thesesR)?.data ?? null
  const brief = ok(briefR)?.data ?? null
  const snap = ok(snapR)
  const mktToday = ok(mktTodayR)
  const petr = ok(petrR)?.data ?? null
  // GOTCHA verificado em prod: o CDI do snapshot é % AO DIA — normaliza pra % a.a.
  const cdiRate = cdiAnnualPct(ok(macroR)?.cdi)
  const ibov12m: SeriesPoint[] | null = (ok(ibovR)?.data ?? [])
    .filter((p) => p.market_price != null)
    .map((p) => ({ t: p.price_at, v: p.market_price as number }))
  const positionsVM = buildPositions(portfolio, today)

  const totalValue = portfolioTotalValue(portfolio, today)

  /* 3. dependentes (bounded): teses seguidas + consenso das top 3 posições */
  const topEquities = positionsVM.rows
    .filter((r) => r.href.startsWith('/acao/'))
    .slice(0, 3)
    .map((r) => r.ticker)
  const [thesesVM, consensusRaw] = await Promise.all([
    buildTheses(base, favorites, theses),
    Promise.all(topEquities.map((t) => homeFetchConsensus(base, t).catch(() => null))),
  ])
  // 204 do /consensus chega como body vazio ('') — normaliza pra null
  const consensus = consensusRaw.map((c) => (c && typeof c === 'object' ? (c as ConsensusApi) : null))

  return {
    hero: buildHero(userName, totalValue, today),
    chart: buildEquityChartVM(curve, ibov12m.length ? ibov12m : null, cdiRate, totalValue),
    positions: positionsVM,
    theses: thesesVM,
    actions: buildActions(income, composition, portfolio, consensus, positionsVM),
    briefing: buildBriefing(brief, snap, mktToday, petr),
    news: buildNews(newsToday, today),
  }
}

/* ————— composable ————— */

export async function useHome() {
  const config = useRuntimeConfig()
  const { token } = useAuthState()
  // Server: URL direta do Laravel (sem loopback no próprio Nitro).
  // Client: proxy same-origin /api/backend (zero CORS).
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'

  const { data, pending, refresh } = await useAsyncData<HomePayload>(
    'home',
    () => {
      const t = token.value
      if (!t) return Promise.resolve(emptyPayload(true))
      return loadHome(import.meta.server ? serverBase : clientBase, t)
    },
  )

  return { data, pending, refresh }
}
