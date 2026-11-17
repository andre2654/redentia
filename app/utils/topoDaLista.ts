/**
 * As cinco primeiras linhas de um ranking, só quando linhas e colunas são
 * arrays de verdade.
 *
 * A página /ranking/acoes-baratas chama useRanking duas vezes. O retorno é
 * um objeto comum com refs dentro. No template, ref aninhada NÃO desempacota:
 * `:columns="graham.columns"` entregava o ComputedRef ao RankTable, e
 * `props.columns.map` estourava o SSR (HTTP 500, "O pregão travou"). Quem
 * chama desempacota com `.value` aqui. Ref, null ou lista vazia (API fora)
 * devolve null e a página segue sem a tabela.
 */
export function topoDaLista<T, C>(rows: unknown, columns: unknown, limite = 5): { rows: T[]; columns: C[] } | null {
  if (!Array.isArray(rows) || rows.length === 0) return null
  if (!Array.isArray(columns) || columns.length === 0) return null
  const n = Number.isFinite(limite) && limite > 0 ? Math.floor(limite) : 5
  return {
    rows: rows.slice(0, n) as T[],
    columns: columns.slice() as C[],
  }
}
