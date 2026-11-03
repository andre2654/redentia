/**
 * As contas das três direções do /asset/{TICKER} (protótipo de 03/11/2026, no
 * dev por ?ativo=1|2|3). Tudo sai do payload que o useAcao já montou: aqui só
 * se escolhe, se ordena e se desenha. Nenhum número novo é inventado; o único
 * corte é o do lucro que não fecha (ver `lucroNaoFecha`).
 */
import type { AcaoFundCard, AcaoStatRow, SeriesPoint } from '../types/acao'

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** "+74,78%" a partir do primeiro e do último ponto (null sem dois pontos). */
export function variacaoDoPeriodo(pontos: SeriesPoint[] | undefined | null): number | null {
  if (!pontos || pontos.length < 2) return null
  const a = pontos[0]!.v
  const z = pontos[pontos.length - 1]!.v
  if (!a) return null
  return ((z - a) / a) * 100
}

export function pctAtivo(n: number): string {
  return `${n > 0 ? '+' : ''}${nf2.format(n)}%`
}

export interface LegendaItem { rotulo: string; pct: string; dir: 'up' | 'down' | null }

/** A legenda do gráfico: o ativo e o IBOV no mesmo período (mesma conta do AcaoChartSection). */
export function legendaDoGrafico(ticker: string, ativo: SeriesPoint[] | undefined, ibov: SeriesPoint[] | undefined): LegendaItem[] {
  const out: LegendaItem[] = []
  const a = variacaoDoPeriodo(ativo)
  if (a != null) out.push({ rotulo: ticker, pct: pctAtivo(a), dir: a < 0 ? 'down' : 'up' })
  const i = variacaoDoPeriodo(ibov)
  if (i != null) out.push({ rotulo: 'IBOV', pct: pctAtivo(i), dir: null })
  return out
}

/** A mínima e a máxima dos pontos que o gráfico desenha, com a data de cada uma. */
export function extremosDaSerie(pontos: SeriesPoint[]): { min: SeriesPoint; max: SeriesPoint } | null {
  if (!pontos.length) return null
  let min = pontos[0]!
  let max = pontos[0]!
  for (const p of pontos) {
    if (p.v < min.v) min = p
    if (p.v > max.v) max = p
  }
  return { min, max }
}

/** '2026-03-12' → '12/03/26' */
export function dataDoPonto(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}` : iso
}

/**
 * Os caminhos SVG de uma série numa caixa w×h. O IBOV vai rebaseado no
 * primeiro ponto do ativo (as duas linhas saem do mesmo lugar e o que se lê é
 * a distância entre elas), e entra no domínio, para não vazar da caixa.
 */
export function caminhosDoGrafico(
  ativo: SeriesPoint[],
  ibov: SeriesPoint[],
  w: number,
  h: number,
  folga = { cima: 0.12, baixo: 0.1 },
): { linha: string; area: string; ibov: string | null; fim: { x: number; y: number } | null; y: (v: number) => number; lo: number; hi: number } {
  const vazio = { linha: '', area: '', ibov: null, fim: null, y: () => h / 2, lo: 0, hi: 0 }
  if (ativo.length < 2) return vazio
  const base = ativo[0]!.v
  const ib0 = ibov[0]?.v
  const ibovReb = ib0 ? ibov.map((p) => ({ t: p.t, v: (p.v / ib0) * base })) : []
  const vals = [...ativo.map((p) => p.v), ...ibovReb.map((p) => p.v)]
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || Math.abs(max) * 0.1 || 1
  const lo = min - span * folga.baixo
  const hi = max + span * folga.cima
  const y = (v: number) => h - ((v - lo) / (hi - lo)) * h
  const t0 = Date.parse(ativo[0]!.t)
  const t1 = Date.parse(ativo[ativo.length - 1]!.t)
  const x = (t: string, i: number, n: number) => {
    const ms = Date.parse(t)
    if (Number.isFinite(ms) && t1 > t0) return ((ms - t0) / (t1 - t0)) * w
    return (i / Math.max(1, n - 1)) * w
  }
  const pts = ativo.map((p, i) => [x(p.t, i, ativo.length), y(p.v)] as const)
  const linha = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('')
  const area = `${linha}L${w},${h}L0,${h}Z`
  const ibPts = ibovReb.filter((p) => {
    const ms = Date.parse(p.t)
    return !Number.isFinite(ms) || (ms >= t0 && ms <= t1)
  })
  const ibovD = ibPts.length > 1
    ? ibPts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t, i, ibPts.length).toFixed(1)},${y(p.v).toFixed(1)}`).join('')
    : null
  const ult = pts[pts.length - 1]!
  return { linha, area, ibov: ibovD, fim: { x: ult[0], y: ult[1] }, y, lo, hi }
}

/** Três a quatro marcas de preço "redondas" dentro do domínio do gráfico. */
export function marcasDePreco(lo: number, hi: number, n = 3): number[] {
  if (!(hi > lo)) return []
  const bruto = (hi - lo) / (n + 1)
  const pot = 10 ** Math.floor(Math.log10(bruto))
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * pot).find((p) => p >= bruto) ?? bruto
  const out: number[] = []
  for (let v = Math.ceil(lo / passo) * passo; v < hi; v += passo) out.push(Number(v.toFixed(6)))
  return out.filter((v) => v > lo + (hi - lo) * 0.06 && v < hi - (hi - lo) * 0.06)
}

/** "R$ 450,24B" → 450,24e9; "R$ 274,94M" → 274,94e6; "9,56" → 9,56. */
export function numeroDoRotulo(v: string | null | undefined): number | null {
  if (!v) return null
  const m = String(v).replace(/\s/g, '').match(/(-?[\d.]+(?:,\d+)?)([KMBT])?/i)
  if (!m) return null
  const n = Number(m[1]!.replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(n)) return null
  const mult = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[(m[2] ?? '').toUpperCase() as 'K' | 'M' | 'B' | 'T'] ?? 1
  return n * mult
}

/**
 * O "Lucro Líquido (12M)" do useAcao é receita × margem líquida. Em banco essa
 * conta dá cerca do dobro do lucro (a receita da fonte é a bruta financeira:
 * ITUB4, 03/11/2026, R$ 87,49B contra 450,24B ÷ 9,56 = R$ 47,1B). Regra da
 * casa: absoluto derivado só sai se bate, a 1,5x, com valor de mercado ÷ P/L.
 * true = a linha não fecha e as direções não a mostram.
 */
export function lucroNaoFecha(linhas: AcaoStatRow[]): boolean {
  const de = (rotulo: RegExp) => numeroDoRotulo(linhas.find((r) => rotulo.test(r.l))?.v)
  const lucro = de(/^Lucro Líquido/)
  const vm = de(/^Valor de Mercado/i)
  const pl = de(/^P\/L/)
  if (lucro == null || vm == null || pl == null || pl <= 0) return false
  const r = lucro / (vm / pl)
  return r > 1.5 || r < 1 / 1.5
}

/** As linhas do gráfico sem o lucro que não fecha. */
export function linhasCoerentes(linhas: AcaoStatRow[]): AcaoStatRow[] {
  return lucroNaoFecha(linhas) ? linhas.filter((r) => !/^Lucro Líquido/.test(r.l)) : linhas
}

/** Os cartões de fundamentos sem o lucro que não fecha (o teste é o das linhas do gráfico). */
export function cartoesCoerentes(cartoes: AcaoFundCard[], linhas: AcaoStatRow[]): AcaoFundCard[] {
  return lucroNaoFecha(linhas) ? cartoes.filter((c) => c.kind !== 'metric' || !/^Lucro Líquido/.test(c.label)) : cartoes
}

/** A prosa do editorial em parágrafos (o gerador separa por linha em branco). */
export function paragrafosDoAtivo(corpo: string): string[] {
  return corpo.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

/** A primeira frase de um texto (para "o que é"), sem cortar em "1,2" nem em "S.A.". */
export function fraseDeAbertura(texto: string | null | undefined, max = 300): string | null {
  const t = String(texto ?? '').replace(/\s+/g, ' ').trim()
  if (!t) return null
  const m = t.match(/^.{20,}?[.!?](?=\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]|$)/)
  const s = (m ? m[0] : t).trim()
  if (s.length <= max) return s
  // corta na última palavra inteira, nunca no meio dela ("biocombus…")
  const corte = s.slice(0, max - 1)
  return `${corte.slice(0, Math.max(corte.lastIndexOf(' '), 20)).replace(/[,;:]$/, '')}…`
}

/**
 * As perguntas prontas que abrem o painel do chat com o ativo anexado. São
 * perguntas, nunca conselho: "por que caiu", "o que explica", "como se
 * compara". Só entra a que tem o dado para ser feita.
 */
export function perguntasDoAtivo(p: {
  ticker: string
  dir: 'up' | 'down' | 'flat'
  variacaoDia: string | null
  variacao12m: string | null
  temProventos: boolean
  temPares: boolean
  kind: string
}): string[] {
  const out: string[] = []
  if (p.variacaoDia) out.push(`Por que ${p.ticker} ${p.dir === 'down' ? 'caiu' : 'subiu'} ${p.variacaoDia} hoje?`)
  if (p.variacao12m) out.push(`O que explica ${p.variacao12m} de ${p.ticker} em 12 meses?`)
  if (p.temProventos) out.push(`De onde vêm os proventos de ${p.ticker}?`)
  if (p.temPares) out.push(`Como ${p.ticker} se compara às outras do setor?`)
  else if (p.kind === 'etf') out.push(`O que há dentro do ${p.ticker}?`)
  return out.slice(0, 3)
}

/** "−R$ 2,11 (4,00%) hoje" → "4,00%" (o número da pergunta). */
export function pctDaLinhaDoDia(linha: string | null | undefined): string | null {
  const m = String(linha ?? '').match(/\(([\d.,]+%)\)/)
  return m ? m[1]! : null
}

/** As seções que a página tem, na ordem, para o índice e a barra que gruda. */
export interface SecaoDoAtivo { id: string; rotulo: string }
export function secoesDoAtivo(tem: {
  cotacao: boolean; teses: boolean; numeros: boolean; fundo: boolean; etf: boolean; proventos: boolean
  leitura: boolean; editorial: boolean; perguntas: boolean; noticias: boolean; cadeia: boolean; setor: boolean
}, kind: string): SecaoDoAtivo[] {
  const s: SecaoDoAtivo[] = []
  if (tem.cotacao) s.push({ id: 'cotacao', rotulo: 'Cotação' })
  if (tem.numeros) s.push({ id: 'indicadores', rotulo: kind === 'fii' ? 'Números do fundo' : 'Indicadores' })
  if (tem.etf || tem.fundo) s.push({ id: 'carteira', rotulo: 'Por dentro' })
  if (tem.proventos) s.push({ id: 'dividendos', rotulo: 'Proventos' })
  if (tem.leitura) s.push({ id: 'analise', rotulo: 'Análise' })
  if (tem.editorial) s.push({ id: 'sobre', rotulo: 'Sobre' })
  if (tem.teses) s.push({ id: 'teses', rotulo: 'Teses' })
  if (tem.noticias) s.push({ id: 'noticias', rotulo: 'Notícias' })
  if (tem.cadeia) s.push({ id: 'cadeia', rotulo: 'Cadeia' })
  if (tem.setor) s.push({ id: 'setor', rotulo: 'Setor' })
  if (tem.perguntas) s.push({ id: 'perguntas', rotulo: 'Perguntas' })
  return s
}

/**
 * Links "Veja também" do resumo e do fim da página numa lista só. Só some o
 * link repetido com o MESMO texto: "Setor energia" e "Ranking do setor
 * energia" vão para o mesmo /setor/energia, mas a âncora é o sinal que a
 * página manda ao Google, e as duas ficam.
 */
export function vejaTambem(...listas: Array<Array<{ href: string; label: string }>>): Array<{ href: string; label: string }> {
  const vistos = new Set<string>()
  const out: Array<{ href: string; label: string }> = []
  for (const l of listas) for (const x of l) {
    const k = `${x.href} ${x.label}`
    if (vistos.has(k)) continue
    vistos.add(k)
    out.push(x)
  }
  return out
}

/**
 * O termo do glossário (/glossario/{slug}) de cada indicador que a página
 * mostra: o hover do indicador lê a definição curta (`short`) de lá, sem
 * escrever outra. Indicador sem termo no glossário não ganha definição.
 */
const GLOSSARIO_DO_INDICADOR: Record<string, string> = {
  'roe': 'roe',
  'roa': 'roa',
  'dividend yield': 'dividend-yield',
  'dividend yield (12m)': 'dividend-yield',
  'p/l': 'p-l',
  'p/l (ttm)': 'p-l',
  'p/vp': 'p-vp',
  'ev/ebitda': 'ev-ebitda',
  'margem líquida': 'margem-liquida',
  'lucro líquido (12m)': 'lucro-liquido',
  'dív. líq./ebitda': 'divida-liquida-ebitda',
  'participação no ifix': 'ifix',
  'valor de mercado': 'valor-mercado',
}
export function slugDoIndicador(rotulo: string): string | null {
  return GLOSSARIO_DO_INDICADOR[rotulo.trim().toLowerCase()] ?? null
}
