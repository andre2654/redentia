/**
 * O painel das teses (/teses, 02/11/2026): o que a lista de /theses não traz e
 * os cartões da grade (TesesGrade) desenham — a convicção dia a dia de cada
 * tese (/theses/{slug}/conviction-history), de onde vem o desenho em degraus e
 * a última mudança ("subiu de 90 em 21 out").
 *
 * Funções puras (sem Nuxt): o servidor monta (server/utils/teses-painel.ts),
 * a página só lê, e os testes (tests/teses-painel.test.ts) travam as contas.
 */

export interface PontoDeConviccao { d: string; v: number }

export interface PainelTese {
  /** a convicção dia a dia, do mais antigo ao mais recente (até 120 dias) */
  conviccao: PontoDeConviccao[] | null
}

export interface PainelDasTeses {
  teses: Record<string, PainelTese>
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

/**
 * "Mudou em 30 dias": a última mudança cai nos 30 dias antes do último ponto
 * da série (o dia da revalidação mais recente, não o relógio de quem abre).
 */
export function mudouEmTrintaDias(serie: PontoDeConviccao[] | null | undefined): boolean {
  const m = ultimaMudanca(serie)
  if (!m || !serie?.length) return false
  const fim = serie.reduce((a, p) => (p.d > a ? p.d : a), serie[0]!.d)
  return Date.parse(`${fim}T12:00:00Z`) - Date.parse(`${m.data}T12:00:00Z`) <= 30 * 86_400_000
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

/** '2026-10-21' → '21 out' (e '1º nov' no dia primeiro, como se escreve). */
export function diaDaTese(iso: string): string {
  const d = Number(iso.slice(8, 10))
  return `${d === 1 ? '1º' : d} ${MESES[Number(iso.slice(5, 7)) - 1] ?? ''}`.trim()
}

/** 'Subiu de 90 em 21 out' / 'Caiu de 92 em 14 out' (a frase da mudança, sem ponto). */
export function fraseDaMudanca(m: { data: string; de: number; para: number } | null): string | null {
  if (!m) return null
  return `${m.para > m.de ? 'Subiu' : 'Caiu'} de ${m.de} em ${diaDaTese(m.data)}`
}
