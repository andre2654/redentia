/**
 * Os pares de uma ação no próprio setor: as maiores empresas do setor por
 * valor de mercado, uma classe por empresa. Alimenta o bloco "Outras empresas
 * do setor" no fim do /asset (app/components/acao/AcaoPares.vue).
 *
 * POR QUE EXISTE (20/10/2026). A página de ação não linkava para nenhum outro
 * ativo nem para o /setor/{slug}. Os 660 ativos do sitemap só se ligavam pela
 * busca e pelas listas, e o /setor era a única porta de entrada dos pares.
 *
 * SÓ AÇÃO. Em FII o setor não tem valor de mercado (não há como ordenar) e o
 * nome vem cru ('FII HGLG PAXCI'); em BDR o nome da B3 vem cortado em 12
 * caracteres ('Taiwansmfac'). O bloco continua restrito a INDEXABLE_ASSETS:
 * é uma seleção de pares, não o universo do sitemap. O link para o setor
 * inteiro sai em AcaoRelacionados.
 *
 * Sem import de valor de propósito: os testes (node --test) importam direto.
 */

export interface LinhaDoSetor {
  ticker: string
  /** nome bruto da B3 ('PETROBRAS   PN      N2') */
  nome: string
  /** 'STOCK' | 'REIT' | 'BDR' | 'ETF' | 'UNKNOWN' */
  tipo: string
  valorDeMercado: number | null
}

/** 'Financial Services' (o `sector` do perfil) → 'financial-services' (o slug do GET /sectors). */
export function apiSlugDoSetor(sector: string | null | undefined): string | null {
  const slug = (sector ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || null
}

/** Mesma empresa, outra classe: PETR4 e PETR3, BPAC11 e BPAC3. */
function raiz(ticker: string): string {
  return ticker.slice(0, 4)
}

// Entre classes da mesma empresa sem preferida: unit, depois PN, depois ON.
const ORDEM_DA_CLASSE = ['11', '4', '3', '5', '6']

function pesoDaClasse(ticker: string): number {
  const i = ORDEM_DA_CLASSE.indexOf(ticker.slice(4))
  return i === -1 ? ORDEM_DA_CLASSE.length : i
}

/**
 * Até `max` pares de `ticker`, do maior valor de mercado para o menor. Fica de
 * fora a própria empresa (em qualquer classe), o que não é ação, o que não
 * está em `indexaveis` e a empresa sem valor de mercado em nenhuma classe.
 *
 * O valor de mercado é da EMPRESA (o maior entre as classes): a unit BPAC11
 * vem sem ele, a BPAC3 com R$ 304,6 bi. De cada empresa sai uma classe só: a
 * de `preferidas` (FEATURED_TICKERS: USIM5, não USIM3), senão a da
 * ORDEM_DA_CLASSE.
 */
export function paresDoSetor(
  linhas: readonly LinhaDoSetor[],
  ticker: string,
  indexaveis: ReadonlySet<string>,
  preferidas: ReadonlySet<string>,
  max = 6,
): LinhaDoSetor[] {
  const minha = raiz(ticker.toUpperCase())
  const acoes = linhas
    .map((l) => ({ ...l, ticker: l.ticker.toUpperCase() }))
    .filter((l) => l.tipo === 'STOCK' && raiz(l.ticker) !== minha)
  // o valor da empresa sai de TODAS as classes, inclusive as fora do sitemap
  const valorDaEmpresa = new Map<string, number>()
  for (const l of acoes) {
    const v = l.valorDeMercado != null && l.valorDeMercado > 0 ? l.valorDeMercado : 0
    valorDaEmpresa.set(raiz(l.ticker), Math.max(valorDaEmpresa.get(raiz(l.ticker)) ?? 0, v))
  }
  // a classe linkada, só entre as do sitemap
  const classe = new Map<string, LinhaDoSetor>()
  for (const l of acoes) {
    if (!indexaveis.has(l.ticker)) continue
    const a = classe.get(raiz(l.ticker))?.ticker
    const melhor = !a
      || (preferidas.has(l.ticker) && !preferidas.has(a))
      || (preferidas.has(l.ticker) === preferidas.has(a) && pesoDaClasse(l.ticker) < pesoDaClasse(a))
    if (melhor) classe.set(raiz(l.ticker), l)
  }
  return [...classe.entries()]
    .map(([r, l]) => ({ ...l, valorDeMercado: valorDaEmpresa.get(r) ?? 0 }))
    .filter((l) => l.valorDeMercado > 0)
    .sort((a, b) => b.valorDeMercado - a.valorDeMercado || a.ticker.localeCompare(b.ticker))
    .slice(0, max)
}
