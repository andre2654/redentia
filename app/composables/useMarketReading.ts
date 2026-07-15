/**
 * Fonte de dado da animação "Redentia lendo o mercado" (NuMarketReading).
 *
 * Padrão seed→real→degrade (herdado do useMercado): o feed nasce com o SEED
 * determinístico passado pelo componente (SSR e 1º paint nunca ficam vazios),
 * hidrata com os MAIORES MOVERS REAIS do dia no onMounted (a MESMA fonte do
 * /mercado: marketFetchMovers('stocks', 'top'|'worst')) e QUALQUER erro degrada
 * de volta pro seed. Zero hydration mismatch: o estado real só é preenchido no
 * client, então o servidor sempre renderiza o seed.
 *
 * As frases de leitura ("{Nome} {avança/cede} {+X,XX%}") são montadas a partir
 * dos movers, com a LOGO real do ativo (icons.brapi.dev, mesma do NuAssetLogo)
 * no tile de ticker e degrade pra letra colorida quando não houver logo.
 */
import { marketFetchMovers } from '~/services/market'
import type { TickerApi } from '~/types/market'

export interface ReadingToken {
  k: 'co' | 'w' | 'up' | 'dn' | 'doc'
  t?: string      // texto (palavra / valor da pill)
  tx?: string     // letra do tile de ticker (fallback / brand)
  ticker?: string // símbolo B3 p/ buscar a logo real (só nos tokens 'co')
  bg?: string     // cor do tile quando não há logo (var(--nu-*) no real; hex de marca no seed)
  fg?: string
}

// Mesma regra de elegibilidade/URL do NuAssetLogo (fonte icons.brapi.dev, a
// mesma da tabela `tickers` do backend). Extraída aqui pro NuMarketReading
// reusar sem depender do componente de posição.
const LOGO_RE = /^[A-Z]{4}\d{1,2}$/
export function readingLogoEligible(ticker: string | undefined): boolean {
  return !!ticker && LOGO_RE.test(ticker.toUpperCase())
}
export function readingLogoSrc(ticker: string): string {
  return `https://icons.brapi.dev/icons/${encodeURIComponent(ticker.toUpperCase())}.svg`
}

/* ————— formatação (tabular, pt-BR, sem travessão) ————— */
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
function pctFmt(n: number): string {
  return `${n > 0 ? '+' : ''}${nf2.format(n)}%`
}

interface Mover {
  ticker: string
  name: string
  pct: string
  dir: 'up' | 'dn'
}

// Verbos determinísticos por posição (nada de random → SSR/animação estáveis).
const UP_VERBS = ['avança', 'sobe', 'ganha', 'renova máxima'] as const
const DN_VERBS = ['cede', 'recua', 'perde', 'devolve'] as const
// Cores do tile de FALLBACK (quando a logo não carrega) — sempre var(--nu-*).
const FALLBACK_TILES: ReadingToken[] = [
  { bg: 'var(--nu-blue)', fg: 'var(--nu-white)' },
  { bg: 'var(--nu-amber)', fg: 'var(--nu-ink)' },
  { bg: 'var(--nu-green-soft)', fg: 'var(--nu-ink)' },
]

// Nomes do backend vêm no formato fixo da B3 ("WESTWING    ON      NM",
// "TIME FOR FUNON") — campo de 12 chars + código de classe grudado. Corta o
// campo, colapsa espaços e passa pra Title Case pra virar frase editorial
// ("Westwing"), com degrade pro ticker se sobrar vazio.
function cleanName(raw: string | null | undefined, ticker: string): string {
  const base = (raw ?? '').slice(0, 12).replace(/\s+/g, ' ').trim()
  if (!base) return ticker
  return base
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase())
}

function toMover(t: TickerApi, dir: 'up' | 'dn'): Mover | null {
  if (t.change_percent == null || !t.ticker) return null
  return {
    ticker: t.ticker.toUpperCase(),
    name: cleanName(t.name, t.ticker.toUpperCase()),
    pct: pctFmt(t.change_percent),
    dir,
  }
}

/**
 * Monta o feed de tokens intercalando ALTAS e BAIXAS reais (g0, l0, g1, l1…),
 * até `count` frases, com um ícone de "documento analisado" a cada 2 frases.
 */
function buildFeed(gainers: Mover[], losers: Mover[], count: number): ReadingToken[] {
  const seq: Mover[] = []
  const max = Math.max(gainers.length, losers.length)
  for (let i = 0; i < max && seq.length < count; i++) {
    if (gainers[i]) seq.push(gainers[i]!)
    if (losers[i] && seq.length < count) seq.push(losers[i]!)
  }
  const tokens: ReadingToken[] = []
  seq.forEach((m, i) => {
    const tile = FALLBACK_TILES[i % FALLBACK_TILES.length]!
    const verb = m.dir === 'up' ? UP_VERBS[i % UP_VERBS.length]! : DN_VERBS[i % DN_VERBS.length]!
    tokens.push({ k: 'co', ticker: m.ticker, tx: m.name.charAt(0).toUpperCase(), bg: tile.bg, fg: tile.fg })
    tokens.push({ k: 'w', t: m.name })
    tokens.push({ k: 'w', t: verb })
    tokens.push({ k: m.dir, t: m.pct })
    // fecha a frase com um ponto na última palavra e intercala o doc
    if (i % 2 === 1) tokens.push({ k: 'doc' })
  })
  return tokens
}

/**
 * @param seed feed determinístico do tema (SSR-safe; é o que aparece até hidratar)
 * @param count nº de frases no feed real (navy = feed longo, light = curto)
 */
export function useMarketReading(seed: ReadingToken[], count = 6) {
  // movers crus compartilhados (useState → SSR-safe, uma hidratação por página)
  const movers = useState<{ gainers: Mover[]; losers: Mover[] } | null>('nu:reading:movers', () => null)
  const started = useState('nu:reading:started', () => false)
  // `loading` verdadeiro até o feed ASSENTAR (movers reais OU degrade pro seed).
  // Enquanto isso o componente mostra skeleton e NÃO anima — evita ler frases
  // com percentuais falsos do seed antes de trocar pelos reais. SSR = skeleton.
  const loading = useState('nu:reading:loading', () => true)

  const feed = computed<ReadingToken[]>(() => {
    const m = movers.value
    if (!m) return seed
    const built = buildFeed(m.gainers, m.losers, count)
    return built.length >= 8 ? built : seed // < 2 frases completas → mantém o seed
  })

  async function hydrate() {
    if (started.value) { loading.value = false; return }
    started.value = true
    try {
      const [top, worst] = await Promise.allSettled([
        marketFetchMovers('stocks', 'top'),
        marketFetchMovers('stocks', 'worst'),
      ])
      const gainers = top.status === 'fulfilled'
        ? (top.value?.data ?? []).map((t) => toMover(t, 'up')).filter((x): x is Mover => x !== null).slice(0, 3)
        : []
      const losers = worst.status === 'fulfilled'
        ? (worst.value?.data ?? []).map((t) => toMover(t, 'dn')).filter((x): x is Mover => x !== null).slice(0, 3)
        : []
      // precisa de pelo menos 2 frases reais pra valer a troca; senão fica o seed
      if (gainers.length + losers.length < 2) return
      movers.value = { gainers, losers }
    } catch { /* mantém o seed */ }
    finally { loading.value = false }
  }

  onMounted(hydrate)
  return { feed, loading }
}
