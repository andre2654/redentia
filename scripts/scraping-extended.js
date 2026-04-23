/**
 * Extended StatusInvest scraper — adds historical prices, dividends,
 * balance sheet and income statement on top of the fundamental fields
 * already captured by scraping.js.
 *
 * Run standalone to probe a ticker and dump the full result:
 *   node scripts/scraping-extended.js PETR4 VALE3
 *
 * The output is appended to scripts/extended-result.json keyed by ticker.
 */
import axios from 'axios'
import * as cheerio from 'cheerio'
import { promises as fs } from 'fs'
import path from 'path'

const BASE_URL = 'https://statusinvest.com.br'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 20_000,
  headers: {
    'User-Agent': UA,
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  },
  validateStatus: () => true,
})

// TradingView public scanner (no auth). Used only for analyst consensus /
// price target since StatusInvest gates those behind their Forecast plan.
const tv = axios.create({
  baseURL: 'https://scanner.tradingview.com',
  timeout: 15_000,
  headers: { 'User-Agent': UA },
  validateStatus: () => true,
})

// ---------------------------------------------------------------------------
// 1) Historical prices (OHLC-style, close only per StatusInvest payload)
//
// StatusInvest's own chart uses /acao/tickerprice with a `type` parameter
// that maps to lookback periods. We default to type=4 (5 years daily).
//
//   type=1 → ~1 month   type=4 → ~5 years (most useful for charts)
//   type=2 → ~6 months  type=5 → intraday (today)
//   type=3 → ~1 year    type=6 → ~2 years
// ---------------------------------------------------------------------------
async function getHistoricalPrices(ticker, type = 4) {
  const { data, status } = await http.get('/acao/tickerprice', {
    params: { ticker: ticker.toUpperCase(), type },
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
  if (status !== 200 || !Array.isArray(data) || !data[0]?.prices) return null

  const { currency, symbol, prices } = data[0]
  return {
    currency,
    symbol,
    count: prices.length,
    window: { type, firstDate: prices[0]?.date, lastDate: prices.at(-1)?.date },
    prices: prices.map((p) => ({
      date: toISODate(p.date),
      close: Number(p.price),
    })),
  }
}

// ---------------------------------------------------------------------------
// 2) Dividends — not exposed as JSON; embedded in the /acoes/{ticker} HTML
// as a hidden <input name="results" value="[...JSON-encoded entities...]">.
// Fields use short codes (y/m/d/ed/pd/et/v…) inherited from their internal
// model. We flatten to a predictable shape.
// ---------------------------------------------------------------------------
async function getDividends(ticker) {
  const { data: html, status } = await http.get(`/acoes/${ticker.toLowerCase()}`)
  if (status !== 200) return null

  const $ = cheerio.load(html)

  // Multiple <input name="results"> exist on the page (dividends, shareholders, etc).
  // The dividends blob is the largest one and each entry has `ed`+`pd`+`et`+`v`.
  let found = null
  $('input[name="results"]').each((_, el) => {
    const raw = $(el).attr('value')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed[0].ed !== undefined &&
        parsed[0].et !== undefined
      ) {
        found = parsed
      }
    } catch {}
  })

  if (!found) return { count: 0, items: [] }

  const items = found.map((d) => ({
    exDate: toISODate(d.ed),
    paymentDate: d.pd ? toISODate(d.pd) : null,
    announceDate: d.ad ? toISODate(d.ad) : null,
    type: d.et,             // e.g. "Dividendo", "JCP", "Rend. Tributado"
    typeFull: d.etd,
    value: Number(d.v),
    adjusted: Boolean(d.adj),
    rawValue: d.sv,
  }))

  // Aggregate per year so we can quickly read "yield contribution by year".
  const perYear = {}
  for (const it of items) {
    const y = it.exDate?.slice(0, 4)
    if (!y) continue
    perYear[y] = (perYear[y] || 0) + it.value
  }

  return {
    count: items.length,
    totalByYear: perYear,
    items,
  }
}

// ---------------------------------------------------------------------------
// 3) Balance sheet (5 years, annual). Returns per-year totals of assets,
// liabilities, current vs non-current, and net equity.
// ---------------------------------------------------------------------------
async function getBalanceSheet(ticker) {
  const { data, status } = await http.get('/acao/getbsactivepassivechart', {
    params: { code: ticker.toUpperCase(), type: 0, chartType: 2, range: 10 },
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
  if (status !== 200 || !Array.isArray(data)) return null

  return data.map((row) => ({
    year: row.year,
    totalAssets: row.ativoTotal,
    totalLiabilities: row.passivoTotal,
    currentAssets: row.ativoCirculante,
    nonCurrentAssets: row.ativoNaoCirculante,
    currentLiabilities: row.passivoCirculante,
    nonCurrentLiabilities: row.passivoNaoCirculante,
    netEquity: row.patrimonioLiquido,
  }))
}

// ---------------------------------------------------------------------------
// 4) Income statement (DRE) / Cash flow (DFC) / Detailed balance sheet.
//
// All three StatusInvest endpoints return the same payload shape — a "grid"
// where row[0] is a header row mapping each DATA column to a period label,
// followed by data rows (one per metric). parseFinancialGrid handles that
// format generically so we don't repeat parsing logic.
// ---------------------------------------------------------------------------
async function getIncomeStatement(ticker) {
  const { data, status } = await http.post(
    '/acao/getdre',
    new URLSearchParams({
      code: ticker.toUpperCase(),
      type: '0',
      range: '10',
    }).toString(),
    {
      headers: {
        'User-Agent': UA,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )

  if (status !== 200 || !data?.success || !data.data?.grid) return null
  return parseFinancialGrid(data.data.grid)
}

// ---------------------------------------------------------------------------
// 4b) Cash flow (DFC) — same grid shape as DRE. 13 metrics including
// "Caixa Líquido Atividades Operacionais" and "Fluxo de Caixa Livre".
// ---------------------------------------------------------------------------
async function getCashFlow(ticker) {
  const { data, status } = await http.post(
    '/acao/getfluxocaixa',
    new URLSearchParams({
      code: ticker.toUpperCase(),
      type: '0',
      range: '10',
    }).toString(),
    {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )
  if (status !== 200 || !data?.success || !data.data?.grid) return null
  return parseFinancialGrid(data.data.grid)
}

// ---------------------------------------------------------------------------
// 4c) Detailed balance sheet (getativos) — 19 line items. Strictly richer
// than getbsactivepassivechart; we keep both because the simple endpoint
// is faster for dashboards and this one is for drill-downs.
// ---------------------------------------------------------------------------
async function getDetailedBalanceSheet(ticker) {
  const { data, status } = await http.get('/acao/getativos', {
    params: { code: ticker.toUpperCase(), type: 0, range: 10 },
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
  if (status !== 200 || !data?.success || !data.data?.grid) return null
  return parseFinancialGrid(data.data.grid)
}

// Shared parser for the three financial grid endpoints (DRE / DFC / Ativos).
// Reads the header row to discover which DATA columns belong to which
// period (LTM or a specific year), descending, not a fixed stride — so we
// stay resilient to the number of periods StatusInvest decides to ship.
function parseFinancialGrid(grid) {
  const headerRow = grid.find((r) => r.isHeader)
  const periodMap = []
  if (headerRow?.columns) {
    headerRow.columns.forEach((col, idx) => {
      if (idx === 0 || col.name !== 'DATA') return
      const label = stripHtml(col.value || '').toLowerCase()
      if (label.includes('últ') || label.includes('ltm') || label.includes('12m')) {
        periodMap.push({ colIdx: idx, period: 'ltm' })
      } else {
        const yearMatch = label.match(/\b(19|20)\d{2}\b/)
        if (yearMatch) periodMap.push({ colIdx: idx, period: yearMatch[0] })
      }
    })
  }

  const metrics = []
  for (const row of grid) {
    if (row.isHeader) continue
    const cols = row.columns || []
    const name = stripHtml(cols[0]?.value || row.name || '')

    const values = {}
    const yoy = {}
    for (const { colIdx, period } of periodMap) {
      const dataCol = cols[colIdx]
      const ahCol = cols[colIdx + 1]
      if (dataCol) values[period] = parseScaledNumber(dataCol.value)
      if (ahCol?.name === 'AH') yoy[period] = parseNumber(ahCol.value)
    }

    if (name) metrics.push({ metric: name, values, yoy })
  }

  return { periods: periodMap.map((p) => p.period), count: metrics.length, metrics }
}

// ---------------------------------------------------------------------------
// 5) Analyst consensus + price target via TradingView public scanner.
//
// StatusInvest hides this behind their paid Forecast plan (the /futuredata
// endpoints 302 without session cookies), so we fall back to TradingView,
// which exposes the same underlying data feed publicly for anonymous calls.
//
// Caveat: TradingView returns price targets in USD regardless of the
// listing currency. We pass in a `usdBrl` rate (fetched once per batch)
// and convert so consumers always see BRL.
//
// recommendation_mark scale (TradingView convention):
//   -2 strong sell · -1 sell · 0 neutral · +1 buy · +2 strong buy
// ---------------------------------------------------------------------------
async function getAnalystConsensus(ticker, usdBrl = 1) {
  const fields = [
    'close',
    'price_target_average',
    'price_target_high',
    'price_target_low',
    'price_target_median',
    'recommendation_mark',
  ].join(',')

  const { data, status } = await tv.get('/symbol', {
    params: { symbol: `BMFBOVESPA:${ticker.toUpperCase()}`, fields },
  })
  if (status !== 200 || !data) return null

  const hasTargets =
    data.price_target_average !== null && data.price_target_average !== undefined
  if (!hasTargets && data.recommendation_mark === null) {
    return { coverage: 'none' }
  }

  const convert = (v) => (v === null || v === undefined ? null : v * usdBrl)

  return {
    coverage: hasTargets ? 'full' : 'partial',
    priceClose: data.close,              // BRL (listing currency)
    priceTarget: {
      average: convert(data.price_target_average),
      median: convert(data.price_target_median),
      high: convert(data.price_target_high),
      low: convert(data.price_target_low),
      currency: 'BRL',
      usdBrl,
    },
    recommendationMark: data.recommendation_mark,
    recommendation: recommendationLabel(data.recommendation_mark),
    upside:
      hasTargets && data.close
        ? ((convert(data.price_target_average) - data.close) / data.close) * 100
        : null,
    source: 'tradingview',
  }
}

function recommendationLabel(mark) {
  if (mark === null || mark === undefined) return null
  if (mark >= 1.5) return 'strong_buy'
  if (mark >= 0.5) return 'buy'
  if (mark > -0.5) return 'neutral'
  if (mark > -1.5) return 'sell'
  return 'strong_sell'
}

// Single USD/BRL fetch per batch — cheap and lets us avoid hard-coding.
async function getUsdBrlRate() {
  try {
    const { data } = await tv.get('/symbol', {
      params: { symbol: 'FX_IDC:USDBRL', fields: 'close' },
    })
    if (data?.close && Number.isFinite(data.close)) return data.close
  } catch {}
  return 5.0  // sane fallback if FX fetch fails; consumer can re-convert
}

// ---------------------------------------------------------------------------
// 6) Shareholders — also embedded in the /acoes/{ticker} HTML as another
// <input name="results">. Tells us who owns the company.
// ---------------------------------------------------------------------------
async function getShareholders(ticker) {
  const { data: html, status } = await http.get(`/acoes/${ticker.toLowerCase()}`)
  if (status !== 200) return null

  const $ = cheerio.load(html)
  let found = null
  $('input[name="results"]').each((_, el) => {
    const raw = $(el).attr('value')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed[0].Acionista !== undefined
      ) {
        found = parsed
      }
    } catch {}
  })

  if (!found) return []
  return found.map((s) => ({
    rank: s.Rank,
    name: s.Acionista,
    document: s.CpfCnpj,
    individual: Boolean(s.PessoaFisica),
    nationality: s.Nacionalidade,
    lastChange: s.DataUltimaAlteracao,
    percentOrdinary: parsePercent(s.PercentualOrdinarias),
    percentPreferential: parsePercent(s.PercentualPreferencial),
    percentTotal: parsePercent(s.PercentualTotal),
  }))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function toISODate(input) {
  if (!input) return null
  const s = String(input)
  // Formats observed: "DD/MM/YY" or "DD/MM/YYYY" or "DD/MM/YY HH:MM"
  const datePart = s.split(' ')[0]
  const parts = datePart.split('/')
  if (parts.length !== 3) return null
  let [d, m, y] = parts
  if (y.length === 2) y = `20${y}`
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function stripHtml(s) {
  return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function parseNumber(raw) {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim()
  if (!s || s === '-') return null
  // pt-BR: "1.234,56" → JS "1234.56". Also strips % and unit labels.
  const sanitized = s.replace(/[^\d,.\-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(sanitized)
  return Number.isFinite(n) ? n : null
}

// StatusInvest renders financials in compact notation like "497.549,00 M"
// (millions) or "1,35 B" (billions). Scale into absolute integers so
// numbers are comparable across periods regardless of the original unit.
function parseScaledNumber(raw) {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim()
  if (!s || s === '-') return null
  const n = parseNumber(s)
  if (n === null) return null
  const suffix = s.match(/\s*([KMB])\s*$/i)?.[1]?.toUpperCase()
  const mul = suffix === 'K' ? 1e3 : suffix === 'M' ? 1e6 : suffix === 'B' ? 1e9 : 1
  return n * mul
}

function parsePercent(raw) {
  if (raw === null || raw === undefined) return null
  return parseNumber(raw)
}

// ---------------------------------------------------------------------------
// Runner — fetch all five in parallel for each ticker.
// ---------------------------------------------------------------------------
async function probeTicker(ticker, usdBrl) {
  const started = Date.now()
  const [
    prices,
    dividends,
    balanceSheet,
    detailedBalanceSheet,
    incomeStatement,
    cashFlow,
    consensus,
    shareholders,
  ] = await Promise.allSettled([
    getHistoricalPrices(ticker, 4),
    getDividends(ticker),
    getBalanceSheet(ticker),
    getDetailedBalanceSheet(ticker),
    getIncomeStatement(ticker),
    getCashFlow(ticker),
    getAnalystConsensus(ticker, usdBrl),
    getShareholders(ticker),
  ])

  const unwrap = (r) => (r.status === 'fulfilled' ? r.value : { error: String(r.reason) })

  return {
    ticker,
    fetchedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    historicalPrices: unwrap(prices),
    dividends: unwrap(dividends),
    balanceSheet: unwrap(balanceSheet),
    detailedBalanceSheet: unwrap(detailedBalanceSheet),
    incomeStatement: unwrap(incomeStatement),
    cashFlow: unwrap(cashFlow),
    consensus: unwrap(consensus),
    shareholders: unwrap(shareholders),
  }
}

function summarize(ticker, r) {
  const lines = [`\n━━━ ${ticker} ━━━`]
  const hp = r.historicalPrices
  if (hp?.prices) {
    lines.push(`  prices:      ${hp.count} pts · ${hp.window.firstDate} → ${hp.window.lastDate}`)
  } else {
    lines.push(`  prices:      ✗`)
  }

  const d = r.dividends
  if (d?.items) {
    const years = Object.keys(d.totalByYear || {}).sort()
    const firstYear = years[0]
    const lastYear = years.at(-1)
    lines.push(`  dividends:   ${d.count} pagamentos · ${firstYear}-${lastYear}`)
    if (d.items[0]) {
      const sample = d.items[0]
      lines.push(
        `               último: ${sample.exDate} ${sample.type} R$ ${sample.rawValue}`,
      )
    }
  } else {
    lines.push(`  dividends:   ✗`)
  }

  const bs = r.balanceSheet
  if (Array.isArray(bs)) {
    const recent = bs[0]
    lines.push(
      `  balance:     ${bs.length} anos · último PL ${recent?.year}: R$ ${(recent?.netEquity / 1e9).toFixed(1)}bi`,
    )
  } else {
    lines.push(`  balance:     ✗`)
  }

  const dre = r.incomeStatement
  if (dre?.metrics) {
    lines.push(`  dre:         ${dre.count} métricas · ${dre.periods.join(', ')}`)
  } else {
    lines.push(`  dre:         ✗`)
  }

  const dfc = r.cashFlow
  if (dfc?.metrics) {
    lines.push(`  cashflow:    ${dfc.count} métricas · ${dfc.periods.join(', ')}`)
  } else {
    lines.push(`  cashflow:    ✗`)
  }

  const dbs = r.detailedBalanceSheet
  if (dbs?.metrics) {
    lines.push(`  bs-detail:   ${dbs.count} linhas · ${dbs.periods.join(', ')}`)
  } else {
    lines.push(`  bs-detail:   ✗`)
  }

  const cons = r.consensus
  if (cons?.priceTarget) {
    const pt = cons.priceTarget
    lines.push(
      `  consensus:   ${cons.recommendation} · alvo R$ ${pt.average?.toFixed(2)} ` +
        `(low ${pt.low?.toFixed(2)} · high ${pt.high?.toFixed(2)}) ` +
        `upside ${cons.upside?.toFixed(1)}%`,
    )
  } else {
    lines.push(`  consensus:   ${cons?.coverage || '✗'}`)
  }

  const sh = r.shareholders
  if (Array.isArray(sh) && sh.length) {
    const top = sh[0]
    lines.push(`  shareholders: ${sh.length} entries · top: ${top.name} (${top.percentTotal ?? '—'}%)`)
  } else {
    lines.push(`  shareholders: ✗`)
  }

  lines.push(`  total:       ${r.durationMs}ms`)
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
async function main() {
  const tickers = process.argv.slice(2)
  if (tickers.length === 0) {
    console.error('Usage: node scraping-extended.js TICKER [TICKER...]')
    process.exit(1)
  }

  const outPath = path.resolve(process.cwd(), 'scripts', 'extended-result.json')
  let existing = {}
  try {
    existing = JSON.parse(await fs.readFile(outPath, 'utf-8'))
  } catch {}

  // Fetch FX once per batch so the per-ticker consensus call stays cheap.
  const usdBrl = await getUsdBrlRate()
  console.log(`USD/BRL ref = ${usdBrl.toFixed(4)}`)

  for (const ticker of tickers) {
    process.stdout.write(`Probing ${ticker}...`)
    const result = await probeTicker(ticker, usdBrl)
    existing[ticker.toUpperCase()] = result
    await fs.writeFile(outPath, JSON.stringify(existing, null, 2), 'utf-8')
    process.stdout.write(' ✓\n')
    console.log(summarize(ticker, result))
  }

  console.log(`\n→ Saved full payload to ${path.relative(process.cwd(), outPath)}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
