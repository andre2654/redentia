/**
 * O painel das teses (/teses, 02/11/2026): o que a lista de /theses não traz e
 * as direções novas da página desenham. Tudo sai de endpoints que já existem:
 *
 *  - a convicção dia a dia (/theses/{slug}/conviction-history), de onde vem a
 *    última mudança ("subiu de 90 em 21/10") e o desenho em degraus;
 *  - a cesta desde o início do backtest (/theses/{slug}/performance: base 100,
 *    24 pontos SEM datas, só o rótulo do início, ex. "jan 2025");
 *  - o dia de cada tese: a média simples da variação dos papéis da lista
 *    (/tickers/{t}), contra o Ibovespa do mesmo pregão. É a conta do app
 *    (RedentiaApp, AppModel.ThesisDay) e o dado da "linha d'água".
 *
 * Funções puras (sem Nuxt): o servidor monta, a página só lê, e os testes
 * (tests/teses-painel.test.ts) travam as contas.
 */

export interface PontoDeConviccao { d: string; v: number }

export interface PainelTese {
  /** a convicção dia a dia, do mais antigo ao mais recente (até 120 dias) */
  conviccao: PontoDeConviccao[] | null
  /** a cesta em base 100 desde `desde` (sem datas por ponto) */
  cesta: { serie: number[]; deltaPct: number | null; desde: string | null } | null
  /** o último pregão da tese: média da variação dos papéis com cotação daquele pregão */
  dia: { pct: number; papeis: number; total: number } | null
}

export interface PainelDasTeses {
  /** o Ibovespa do mesmo pregão (a superfície da linha d'água) */
  ibov: { pct: number; data: string } | null
  teses: Record<string, PainelTese>
}

/** Cotação do jeito que /tickers/{t} devolve (só o que a conta usa). */
export interface CotacaoDoPapel { ticker: string; pct: number | null; data: string | null }

/**
 * A variação do dia da cesta: a média simples dos papéis cotados NO pregão de
 * referência (o do Ibovespa). Papel com cotação de outro dia (BDR parado,
 * papel sem negócio) fica de fora, e com menos da metade dos papéis a tese não
 * tem dia: uma média de um papel só não é a tese.
 */
export function diaDaCesta(tickers: string[], cotacoes: Record<string, CotacaoDoPapel | null | undefined>, pregao: string | null): PainelTese['dia'] {
  if (!tickers.length || !pregao) return null
  const validas = tickers
    .map((t) => cotacoes[t])
    .filter((c): c is CotacaoDoPapel => c != null && c.pct != null && Number.isFinite(c.pct) && c.data === pregao)
  if (validas.length < Math.ceil(tickers.length / 2)) return null
  const pct = validas.reduce((s, c) => s + (c.pct as number), 0) / validas.length
  return { pct: Math.round(pct * 100) / 100, papeis: validas.length, total: tickers.length }
}

/**
 * A última vez que a convicção mudou: a data do primeiro dia no valor atual e
 * o valor de antes. Sem mudança na série → null (a convicção é a de sempre).
 */
export function ultimaMudanca(serie: PontoDeConviccao[] | null | undefined): { data: string; de: number; para: number } | null {
  const s = [...(serie ?? [])].sort((a, b) => a.d.localeCompare(b.d))
  if (s.length < 2) return null
  const atual = s[s.length - 1]!.v
  for (let i = s.length - 2; i >= 0; i--) {
    if (s[i]!.v !== atual) return { data: s[i + 1]!.d, de: s[i]!.v, para: atual }
  }
  return null
}

/** Quantas vezes a convicção mudou na série (degraus do desenho). */
export function mudancasDaConviccao(serie: PontoDeConviccao[] | null | undefined): number {
  const s = serie ?? []
  let n = 0
  for (let i = 1; i < s.length; i++) if (s[i]!.v !== s[i - 1]!.v) n++
  return n
}

/** Compacta a série crua da API: ordena, descarta ponto inválido, guarda os últimos `dias`. */
export function serieCompacta(serie: { date: string; conviction: number }[] | null | undefined, dias = 120): PontoDeConviccao[] | null {
  const s = (serie ?? [])
    .filter((p) => p && typeof p.date === 'string' && Number.isFinite(p.conviction))
    .map((p) => ({ d: p.date.slice(0, 10), v: p.conviction }))
    .sort((a, b) => a.d.localeCompare(b.d))
    .slice(-dias)
  return s.length > 1 ? s : null
}

/* ————— as palavras ————— */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** '2026-10-21' → '21 out' (e '1º nov' no dia primeiro, como se escreve). */
export function diaDaTese(iso: string): string {
  const d = Number(iso.slice(8, 10))
  return `${d === 1 ? '1º' : d} ${MESES[Number(iso.slice(5, 7)) - 1] ?? ''}`.trim()
}

/** '+1,24%' / '−0,75%' com o sinal de menos tipográfico. */
export function pctDoDia(n: number): string {
  if (Math.abs(n) < 0.005) return '0,00%'
  return `${n > 0 ? '+' : '−'}${nf2.format(Math.abs(n))}%`
}

/** A distância até o índice em pontos percentuais: '+1,24 p.p.'. */
export function distancia(n: number): string {
  if (Math.abs(n) < 0.005) return 'na linha'
  return `${n > 0 ? '+' : '−'}${nf2.format(Math.abs(n))} p.p.`
}

/** 'subiu de 90 em 21 out' / 'caiu de 92 em 14 out' (a frase da mudança, sem ponto). */
export function fraseDaMudanca(m: { data: string; de: number; para: number } | null): string | null {
  if (!m) return null
  return `${m.para > m.de ? 'subiu' : 'caiu'} de ${m.de} em ${diaDaTese(m.data)}`
}

/**
 * Cada tese na água: a distância do dia até o índice, da que mais boiou à que
 * mais afundou. Sem índice ou sem dia, a tese não entra (não há onde pôr).
 */
export function naAgua<T extends { slug: string }>(teses: T[], painel: PainelDasTeses | null): (T & { pct: number; gap: number })[] {
  const ibov = painel?.ibov?.pct
  if (ibov == null || !painel) return []
  return teses
    .map((t) => {
      const dia = painel.teses[t.slug]?.dia
      if (!dia) return null
      return { ...t, pct: dia.pct, gap: Math.round((dia.pct - ibov) * 100) / 100 }
    })
    .filter((t): t is T & { pct: number; gap: number } => t != null)
    .sort((a, b) => b.gap - a.gap)
}
