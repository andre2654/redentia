/**
 * Dados do /dividendos/[ticker] — landing SEO de proventos (long-tail
 * "dividendos petr4", top orgânico da Redentia antiga).
 *
 * SSR-FIRST como o /asset: o fetch roda no servidor via useAsyncData pra o
 * HTML da 1ª resposta já sair indexável com números reais. Fontes:
 *  - GET /tickers/{t}            → nome + cotação (404 = ticker não existe)
 *  - GET /fundamentals/{t}/overview → DY 12M + asset_type (fii vs ação)
 *  - GET /dividends/{t}          → histórico completo de proventos
 *
 * Gotchas herdados do PR2 (types/acao.ts): o payload de /dividends vem com a
 * chave literal `"label "` (espaço no fim) e `rate` como string — tratados
 * aqui igual ao useAcao.
 *
 * Regras de existência (thin content é pior que nada):
 *  - profile 404                         → 404
 *  - histórico VAZIO (fetch ok) + sem DY → 404 (nada pra dizer)
 *  - histórico indisponível (fetch falhou) + sem DY → 503 (transitório;
 *    404 transitório envenenaria o índice do Google)
 *  - histórico vazio/indisponível mas DY existe → renderiza com aviso honesto
 *  - backend INTEIRO fora: PETR4 degrada pro seed (números do design, mesmo
 *    padrão do useAcao); qualquer outro ticker → 503.
 */
import type { AcaoDividendBar, AcaoStatRow, TickerProfileApi } from '~/types/acao'
import type { NuFaqItem } from '~/types/market'

/* ————— tipos do payload ————— */

export interface DivEduSection {
  title: string
  paragraphs: string[]
}

export interface DividendosPayload {
  ticker: string
  name: string
  isFii: boolean
  hero: {
    companyLine: string
    sub: string
    stats: AcaoStatRow[]
  }
  /** seção "o que pagou em 12 meses" (stats + barras anuais) — null sem dados */
  resumo: {
    heading: [string, string]
    subtitle: string
    rows: AcaoStatRow[]
    bars: AcaoDividendBar[]
  } | null
  /** tabela do histórico real — null quando não há linhas pra mostrar */
  history: {
    columns: string[]
    rows: string[][]
    note: string
  } | null
  /** aviso honesto quando a tabela não existe (vazio vs indisponível) */
  historyNotice: string | null
  edu: DivEduSection[]
  faq: NuFaqItem[]
  seo: { title: string; description: string }
}

/* ————— helpers ————— */

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
// proventos unitários pequenos (JCP de R$ 0,0213) precisam de mais casas
const nf24 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

function num(x: unknown): number | null {
  if (x == null) return null
  const n = Number(x)
  return Number.isFinite(n) ? n : null
}

/** '2026-08-20' → '20 ago 2026' (mesmo formato do /asset). */
function dateShortPt(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}

const SMALL_WORDS = new Set(['de', 'do', 'da', 'dos', 'das', 'e'])
/** 'PETROBRAS   PN   N2' → 'Petrobras' (mesma regra do useAcao). */
function prettyName(raw: string, fiiTradingName?: string | null): string {
  if (fiiTradingName) return fiiTradingName
  const head = (raw.split(/\s{2,}/)[0] ?? raw)
    .replace(/\s+(ON|PN[AB]?|UNT|UNS|N1|N2|NM|MA|MB|EJ|ED|ER|ES)$/i, '')
    .trim()
  if (!head) return raw
  return head
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/* ————— núcleo de dados (real e seed convergem aqui) ————— */

interface DivRow {
  date: string // payment_date ISO
  rate: number
  label: string
}

interface Core {
  ticker: string
  name: string
  isFii: boolean
  price: number | null
  /** DY 12M em % (overview quando existe; senão sum12/price) */
  dy: number | null
  sum12: number
  count12: number
  /** último pagamento efetivado / próximo anunciado (ISO) */
  last: string | null
  next: string | null
  freq: string | null
  bars: AcaoDividendBar[]
  strongest: { year: string; valFmt: string } | null
  /** linhas da tabela — null = fetch do histórico falhou (indisponível) */
  historyRows: string[][] | null
}

/** Barras por ano, mesma régua do /asset: ano corrente = últimos 12 meses. */
function buildBars(paid: DivRow[], sum12: number): AcaoDividendBar[] {
  const cy = new Date().getFullYear()
  const byYear = new Map<string, number>()
  for (const d of paid) {
    const y = d.date.slice(0, 4)
    byYear.set(y, (byYear.get(y) ?? 0) + d.rate)
  }
  const bars: { year: string; val: number }[] = []
  for (let y = cy - 5; y <= cy; y++) {
    const val = y === cy ? sum12 : byYear.get(String(y)) ?? 0
    if (val > 0) bars.push({ year: String(y), val })
  }
  const max = Math.max(...bars.map((b) => b.val), 0)
  if (!bars.length || max <= 0) return []
  return bars.map((b) => ({
    year: b.year,
    valFmt: `R$ ${nf2.format(b.val)}`,
    hPct: Math.round((b.val / max) * 1000) / 10,
    current: b.year === String(cy),
  }))
}

function coreFromApi(
  ticker: string,
  profile: TickerProfileApi,
  overview: Record<string, any> | null,
  dividends: Record<string, unknown>[] | null,
): Core {
  const se = overview?.scrape_extras ?? null
  const isFii = se?.asset_type === 'fii' || profile.type === 'REIT'
  const name = prettyName(profile.name, se?.fii?.trading_name ?? null)
  const price = profile.market_price

  // GOTCHA runtime: chave literal `"label "` (espaço) e rate string.
  const rows: DivRow[] = (dividends ?? [])
    .map((d) => ({
      date: String(d.payment_date ?? ''),
      rate: num(d.rate) ?? 0,
      label: String((d.label ?? (d as Record<string, unknown>)['label ']) ?? '').trim(),
    }))
    .filter((d) => !!d.date && d.rate > 0)
    .sort((a, b) => b.date.localeCompare(a.date))

  const today = localISODate()
  const cutoff12 = localISODate(new Date(Date.now() - 365 * 86_400_000))
  const paid = rows.filter((d) => d.date <= today)
  const future = rows.filter((d) => d.date > today)
  const last12 = paid.filter((d) => d.date > cutoff12)
  const sum12 = last12.reduce((a, d) => a + d.rate, 0)

  // DY 12M: overview primeiro (número oficial); fallback sum12/price.
  const dyOverview = se?.valuation?.dividend_yield
    ?? se?.fii?.dividend_yield_12m
    ?? num(overview?.key_statistics?.dividend_yield)
  const dy = dyOverview ?? (price != null && price > 0 && sum12 > 0 ? (sum12 / price) * 100 : null)

  // Cadência observada (heurística do /asset): ≥10 Mensal · ≥4 Trimestral · ≥2 Semestral · 1 Anual.
  const freq = last12.length
    ? last12.length >= 10 ? 'Mensal' : last12.length >= 4 ? 'Trimestral' : last12.length >= 2 ? 'Semestral' : 'Anual'
    : null

  const bars = buildBars(paid, sum12)
  // ano mais forte do recorte anual (a mesma régua das barras)
  let strongest: Core['strongest'] = null
  for (const b of bars) {
    const v = Number(b.valFmt.replace(/[^\d,]/g, '').replace(',', '.'))
    if (!strongest || v > Number(strongest.valFmt.replace(/[^\d,]/g, '').replace(',', '.'))) {
      strongest = { year: b.year, valFmt: b.valFmt }
    }
  }

  // Tabela: futuros anunciados primeiro (rows já vem desc), até 16 linhas.
  const fallbackLabel = isFii ? 'Rendimento' : 'Provento'
  const historyRows: string[][] | null = dividends === null
    ? null
    : rows.slice(0, 16).map((d) => [
        dateShortPt(d.date),
        `${d.label || fallbackLabel}${d.date > today ? ' (anunciado)' : ''}`,
        `R$ ${nf24.format(d.rate)}`,
      ])

  return {
    ticker,
    name,
    isFii,
    price,
    dy,
    sum12,
    count12: last12.length,
    last: paid[0]?.date ?? null,
    next: future.length ? future[future.length - 1]!.date : null,
    freq,
    bars,
    strongest,
    historyRows,
  }
}

/* ————— builders de copy (regras honestas; sem travessão em copy pública) ————— */

function buildPayload(c: Core): DividendosPayload {
  const unit = c.isFii ? 'cota' : 'ação'
  const kind = c.isFii ? 'rendimentos' : 'dividendos'
  const priceFmt = c.price != null ? `R$ ${nf2.format(c.price)}` : null
  const dyFmt = c.dy != null ? `${nf2.format(c.dy)}%` : null
  const sum12Fmt = c.sum12 > 0 ? `R$ ${nf2.format(c.sum12)}` : null
  const lastFmt = c.last ? dateShortPt(c.last) : null
  const nextFmt = c.next ? dateShortPt(c.next) : null

  /* hero */
  const stats: AcaoStatRow[] = []
  if (dyFmt) stats.push({ l: 'Dividend yield (12M)', v: dyFmt })
  if (sum12Fmt) stats.push({ l: c.isFii ? 'Rendimentos (12M)' : 'Proventos (12M)', v: `${sum12Fmt} / ${unit}` })
  if (priceFmt) stats.push({ l: 'Cotação', v: priceFmt })
  if (nextFmt) stats.push({ l: 'Próximo pagamento', v: nextFmt, accent: 'green' })
  else if (lastFmt) stats.push({ l: 'Último pagamento', v: lastFmt })

  const heroSub = c.sum12 > 0
    ? `${c.name} pagou ${sum12Fmt} por ${unit} em ${kind} nos últimos 12 meses. Veja o histórico completo, as datas e o que esperar dos próximos pagamentos.`
    : `${c.name} não registrou pagamentos nos últimos 12 meses. Veja o histórico completo e o dividend yield do papel na B3.`

  /* resumo 12M */
  let resumo: DividendosPayload['resumo'] = null
  if (c.bars.length) {
    const rows: AcaoStatRow[] = []
    if (dyFmt) rows.push({ l: 'Dividend yield (12M)', v: dyFmt })
    if (sum12Fmt) rows.push({ l: `Total por ${unit} (12M)`, v: sum12Fmt })
    if (c.isFii && c.sum12 > 0) rows.push({ l: 'Média mensal (12M)', v: `R$ ${nf2.format(c.sum12 / 12)}` })
    if (c.freq) rows.push({ l: 'Frequência', v: c.freq })
    if (c.count12 > 0) rows.push({ l: 'Pagamentos em 12 meses', v: String(c.count12) })
    if (nextFmt) rows.push({ l: 'Próximo pagamento', v: nextFmt, accent: 'green' })
    else if (lastFmt) rows.push({ l: 'Último pagamento', v: lastFmt })
    resumo = {
      heading: c.isFii && c.freq === 'Mensal' ? ['Renda que cai', 'todo mês.'] : ['O que pagou', 'em 12 meses.'],
      subtitle: c.sum12 > 0
        ? `${sum12Fmt} por ${unit} nos últimos 12 meses${c.count12 ? `, em ${c.count12} ${c.count12 === 1 ? 'pagamento' : 'pagamentos'}` : ''}`
        : 'Sem pagamentos nos últimos 12 meses',
      rows,
      bars: c.bars,
    }
  }

  /* tabela do histórico + avisos honestos */
  let history: DividendosPayload['history'] = null
  let historyNotice: string | null = null
  if (c.historyRows && c.historyRows.length) {
    history = {
      columns: ['Pagamento', 'Tipo', `Valor por ${unit}`],
      rows: c.historyRows,
      note: c.isFii
        ? 'Valores brutos por cota informados pelo fundo à B3. Rendimentos de FIIs são isentos de IR pra pessoa física dentro das regras do segmento.'
        : 'Valores brutos por ação informados à B3. JCP tem 15% de IR retido na fonte; dividendos são isentos pra pessoa física.',
    }
  } else if (c.historyRows) {
    historyNotice = `Ainda não temos os pagamentos de ${c.ticker} na nossa base de proventos. ${dyFmt ? `O dividend yield de ${dyFmt} acima vem dos dados consolidados de mercado.` : 'Assim que houver anúncio novo, ele aparece aqui.'}`
  } else {
    historyNotice = `O histórico detalhado de ${c.ticker} está temporariamente indisponível. ${dyFmt ? `O dividend yield de ${dyFmt} vem dos dados consolidados de mercado.` : ''} Tente de novo em alguns minutos.`.trim()
  }

  /* seções educacionais (2-3 h2, adaptadas por tipo) */
  const edu: DivEduSection[] = []
  const freqLower = c.freq ? c.freq.toLowerCase() : null
  if (c.isFii) {
    edu.push({
      title: `Como funcionam os rendimentos de ${c.ticker}`,
      paragraphs: [
        `Por lei (Lei 8.668/93), todo fundo imobiliário distribui no mínimo 95% do lucro apurado no semestre. Na prática, a maioria dos FIIs anuncia um rendimento por cota todos os meses: o fundo divulga o valor, define a data-com (quem tem a cota nesse dia recebe) e paga dias depois, direto na conta da corretora.`,
        c.count12 > 0
          ? `Nos últimos 12 meses, ${c.ticker} fez ${c.count12} ${c.count12 === 1 ? 'pagamento' : 'pagamentos'}${freqLower ? `, uma cadência ${freqLower}` : ''}. Quem compra a cota depois da data-com não recebe o rendimento daquele anúncio, entra no ciclo seguinte.`
          : `${c.ticker} não registrou pagamentos nos últimos 12 meses. Vale conferir os relatórios gerenciais e os fatos relevantes do fundo antes de investir esperando renda mensal.`,
      ],
    })
  } else {
    edu.push({
      title: `Como funciona o pagamento de dividendos de ${c.ticker}`,
      paragraphs: [
        `A ${c.name} distribui parte do lucro aos acionistas de duas formas: dividendos, isentos de imposto de renda pra pessoa física, e JCP (juros sobre capital próprio), com 15% retidos na fonte. O conselho aprova os pagamentos depois da divulgação dos resultados, define a data-com (quem tem a ação nesse dia recebe) e o valor por ação.`,
        c.count12 > 0
          ? `Nos últimos 12 meses, ${c.ticker} fez ${c.count12} ${c.count12 === 1 ? 'pagamento' : 'pagamentos'}${freqLower ? `, uma cadência ${freqLower}` : ''}. Quem compra a ação depois da data-com não recebe o provento daquele anúncio, entra no ciclo seguinte.`
          : `${c.ticker} não registrou pagamentos nos últimos 12 meses. Isso pode refletir um ciclo de lucro fraco, prioridade de caixa pra reduzir dívida ou mudança na política de distribuição, vale acompanhar os fatos relevantes da empresa.`,
      ],
    })
  }
  if (c.sum12 > 0) {
    const p1Bits: string[] = [`Nos últimos 12 meses, ${c.ticker} pagou ${sum12Fmt} por ${unit}`]
    if (dyFmt) p1Bits.push(`, um dividend yield de ${dyFmt} sobre a cotação atual`)
    if (c.isFii) p1Bits.push(`, o equivalente a R$ ${nf2.format(c.sum12 / 12)} por cota ao mês na média`)
    p1Bits.push('.')
    if (c.strongest) p1Bits.push(` No recorte anual recente, o ano mais forte foi ${c.strongest.year}, com ${c.strongest.valFmt} por ${unit}.`)
    edu.push({
      title: `O histórico de ${c.ticker} em números`,
      paragraphs: [
        p1Bits.join(''),
        `Histórico é retrato, não promessa: proventos dependem de lucro, caixa e decisão ${c.isFii ? 'do gestor' : 'do conselho'} a cada ciclo. Use o número de 12 meses como régua, compare com o gráfico ano a ano acima e desconfie de yield muito acima dos pares.`,
      ],
    })
  }
  edu.push(
    c.isFii
      ? {
          title: 'Rendimentos isentos de imposto de renda',
          paragraphs: [
            `Rendimentos mensais de FIIs são isentos de IR pra pessoa física desde que o fundo seja negociado em bolsa, tenha pelo menos 50 cotistas e o investidor detenha menos de 10% das cotas, condições que os grandes fundos listados na B3 cumprem com folga.`,
            `A isenção vale pro rendimento mensal. Ganho de capital na venda das cotas paga 20% sobre o lucro, sem faixa de isenção. O PL 1.087/2025, que discute taxar dividendos de ações, mantém os FIIs isentos no texto atual.`,
          ],
        }
      : {
          title: 'Dividendos, JCP e imposto de renda',
          paragraphs: [
            `Dividendos de ações são isentos de IR pra pessoa física pela legislação atual, sem limite de valor. JCP tem 15% retidos na fonte, mas no agregado costuma compensar, porque a empresa abate o pagamento como despesa e paga menos imposto corporativo.`,
            `O PL 1.087/2025 propõe taxar dividendos acima de R$ 50 mil por mês em 10% na fonte. O texto foi aprovado na Câmara e segue em discussão no Senado, com vigência provável a partir de 2027 se aprovado. Pra maioria dos investidores, nada muda por enquanto.`,
          ],
        },
  )

  /* FAQ (respostas com os dados reais quando existem) */
  const whenA = c.count12 > 0
    ? `Nos últimos 12 meses, ${c.ticker} fez ${c.count12} ${c.count12 === 1 ? 'pagamento' : 'pagamentos'}${freqLower ? `, uma cadência ${freqLower}` : ''}.${lastFmt ? ` O último pagamento foi em ${lastFmt}.` : ''}${nextFmt ? ` O próximo já anunciado tem pagamento em ${nextFmt}.` : ' Novos anúncios saem como fato relevante e aparecem no histórico desta página.'}`
    : `${c.ticker} não registrou pagamentos nos últimos 12 meses. Novos anúncios saem como fato relevante no site de RI e aparecem no histórico desta página.`
  const dyA = c.dy != null
    ? `O dividend yield de 12 meses de ${c.ticker} é ${dyFmt}${sum12Fmt && priceFmt ? `, considerando os ${sum12Fmt} pagos por ${unit} e a cotação atual de ${priceFmt}` : ''}. O número muda todos os dias com o preço, então use como referência, não como garantia.`
    : `Sem pagamentos recentes, o dividend yield de 12 meses de ${c.ticker} fica zerado ou indisponível. Acompanhe a página do ativo pra ver quando a distribuição voltar.`
  const howMuchA = c.sum12 > 0
    ? `${c.ticker} pagou ${sum12Fmt} por ${unit} nos últimos 12 meses${c.count12 ? `, somando ${c.count12} ${c.count12 === 1 ? 'pagamento' : 'pagamentos'}` : ''}.${c.isFii ? ` Na média, R$ ${nf2.format(c.sum12 / 12)} por cota ao mês.` : ''} A tabela desta página lista cada pagamento com data, tipo e valor.`
    : `${c.ticker} não pagou proventos nos últimos 12 meses. O histórico completo da página mostra os anos anteriores quando existem.`

  const faq: NuFaqItem[] = [
    { q: `Quando o ${c.ticker} paga ${kind}?`, a: whenA },
    { q: `Qual o dividend yield de ${c.ticker}?`, a: dyA },
    { q: `Quanto o ${c.ticker} pagou nos últimos 12 meses?`, a: howMuchA },
    c.isFii
      ? {
          q: `Os rendimentos de ${c.ticker} são isentos de IR?`,
          a: `Sim. Rendimentos de FIIs são isentos de imposto de renda pra pessoa física desde que o fundo seja listado em bolsa, tenha 50 ou mais cotistas e o investidor detenha menos de 10% das cotas. A isenção vale pro rendimento mensal; ganho de capital na venda das cotas paga 20%, sem faixa de isenção.`,
        }
      : {
          q: `Os dividendos de ${c.ticker} pagam imposto de renda?`,
          a: `Dividendos são isentos de IR pra pessoa física pela legislação atual. JCP tem 15% retidos na fonte. O PL 1.087/2025 propõe taxar dividendos acima de R$ 50 mil por mês em 10%, mas ainda está em discussão no Senado e não vigora.`,
        },
    {
      q: `Onde acompanhar os próximos pagamentos de ${c.ticker}?`,
      a: `Os anúncios oficiais saem como fato relevante no site de RI e no sistema da CVM. Esta página consolida o histórico com dados da B3, e a página do ativo na Redentia traz cotação, fundamentos, notícias e a leitura da Redentia AI sobre ${c.ticker}.`,
    },
  ]

  /* SEO */
  const year = new Date().getFullYear()
  const descBits: string[] = []
  if (c.sum12 > 0) descBits.push(`${c.ticker} pagou ${sum12Fmt} por ${unit} em ${kind} nos últimos 12 meses${dyFmt ? `, dividend yield de ${dyFmt}` : ''}.`)
  else if (dyFmt) descBits.push(`Dividend yield de ${c.ticker}: ${dyFmt}.`)
  else descBits.push(`Proventos de ${c.name} (${c.ticker}) na B3.`)
  descBits.push(`Veja o histórico completo, datas e próximos pagamentos de ${c.name}.`)

  return {
    ticker: c.ticker,
    name: c.name,
    isFii: c.isFii,
    hero: { companyLine: `${c.name} · ${c.ticker}`, sub: heroSub, stats },
    resumo,
    history,
    historyNotice,
    edu,
    faq,
    seo: {
      title: `Dividendos ${c.ticker} ${year}: histórico, DY e próximos pagamentos`,
      description: descBits.join(' '),
    },
  }
}

/* ————— seed do design (PETR4) — só pra backend 100% offline ————— */

function petr4Seed(): DividendosPayload {
  return buildPayload({
    ticker: 'PETR4',
    name: 'Petrobras',
    isFii: false,
    price: 38.25,
    dy: 6.95,
    sum12: 2.66,
    count12: 4,
    last: null,
    next: '2026-08-21',
    freq: 'Trimestral',
    bars: [
      { year: '2021', valFmt: 'R$ 2,10', hPct: 30.7, current: false },
      { year: '2022', valFmt: 'R$ 6,84', hPct: 100, current: false },
      { year: '2023', valFmt: 'R$ 4,25', hPct: 62.1, current: false },
      { year: '2024', valFmt: 'R$ 2,91', hPct: 42.5, current: false },
      { year: '2025', valFmt: 'R$ 2,52', hPct: 36.8, current: false },
      { year: '2026', valFmt: 'R$ 2,66', hPct: 38.9, current: true },
    ],
    strongest: { year: '2022', valFmt: 'R$ 6,84' },
    historyRows: null, // sem histórico inventado: aviso honesto no lugar da tabela
  })
}

/* ————— carga SSR ————— */

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

async function loadDividendos(base: string, ticker: string): Promise<DividendosPayload> {
  let profile: TickerProfileApi
  try {
    profile = (await acaoFetchProfile(base, ticker)).data
  } catch (e) {
    if (statusOf(e) === 404) {
      throw createError({ statusCode: 404, statusMessage: `Ativo ${ticker} não encontrado` })
    }
    if (ticker === 'PETR4') return petr4Seed()
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }

  const [overviewR, dividendsR] = await Promise.allSettled([
    acaoFetchOverview(base, ticker),
    acaoFetchDividends(base, ticker),
  ])
  const overview = overviewR.status === 'fulfilled' ? overviewR.value?.data ?? null : null
  const dividends = dividendsR.status === 'fulfilled'
    ? ((dividendsR.value?.data ?? []) as unknown as Record<string, unknown>[])
    : null

  const core = coreFromApi(ticker, profile, overview, dividends)

  // Regras de existência: ticker existe mas nunca pagou E não tem DY → 404
  // (thin content); histórico só INDISPONÍVEL (fetch falhou) sem DY → 503.
  const hasAnyDividend = (core.historyRows?.length ?? 0) > 0 || core.bars.length > 0
  if (!hasAnyDividend && core.dy == null) {
    if (dividends === null) {
      throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
    }
    throw createError({ statusCode: 404, statusMessage: `${ticker} não tem histórico de proventos` })
  }

  return buildPayload(core)
}

/* ————— composable ————— */

export async function useDividendos(ticker: string) {
  const config = useRuntimeConfig()
  // Server: URL direta do Laravel (sem loopback no próprio Nitro).
  // Client: proxy same-origin /api/backend (zero CORS).
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'

  const { data, error } = await useAsyncData<DividendosPayload>(
    `dividendos:${ticker}`,
    () => loadDividendos(import.meta.server ? serverBase : clientBase, ticker),
  )

  return { data, error }
}
