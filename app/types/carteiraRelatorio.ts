/**
 * O contrato de `GET /me/carteira/relatorio` (07/11/2026; run-state, Interface
 * contracts, e Backend `App\Services\Carteira\Relatorio\RelatorioDaCarteira`).
 * O front lê quando a seção "Ver o relatório completo" abre, à parte do
 * /visao, para o motor não depender do relatório.
 *
 * Regras que o backend garante:
 *  - valores em % saem em pontos percentuais com 2 casas (12,34 = 12,34%);
 *    razões, com 2 casas;
 *  - cada indicador vira nota de 0 a 100 por faixas fixas; o pilar é a
 *    mediana das notas dele e a nota da carteira é a mediana dos pilares;
 *  - com menos de 12 meses (`historicoCurto`), os anualizados ficam sem nota;
 *  - sem histórico, o mesmo formato vem com os números nulos.
 */

export type PilarRelatorio = 'retorno' | 'risco' | 'eficiencia' | 'diversificacao'
export type UnidadeRelatorio = '%' | 'x' | 'R$' | ''

export interface IndicadorRelatorio {
  /** twr, mwr, cagr, retorno_real, volatilidade, …, correlacao_media */
  chave: string
  nome: string
  valor: number | null
  unidade: UnidadeRelatorio
  pilar: PilarRelatorio
  /** 0–100; null sem valor ou anualizado com histórico curto */
  nota: number | null
  /** o mesmo indicador no benchmark composto; null quando não se aplica */
  bench: number | null
  descricao: string
  comoCalculei: string
}

export interface PilarNota {
  chave: PilarRelatorio
  nome: string
  nota: number | null
}

export interface PontoRelatorio {
  t: string
  /** índice base 100 no primeiro pregão */
  v: number
}

export interface CarteiraRelatorio {
  periodo: {
    inicio: string | null
    fim: string | null
    dias: number
    pregoes?: number
    historicoCurto: boolean
  }
  benchmark: {
    nome: string
    /** o peso médio de cada índice no período, em % */
    composicao: { indice: string; peso: number }[]
    notas: string[]
  }
  retorno: { twr: number | null; mwr: number | null; cagr: number | null; real: number | null }
  indicadores: IndicadorRelatorio[]
  pilares: PilarNota[]
  nota: number | null
  series: { carteira: PontoRelatorio[]; benchmark: PontoRelatorio[]; cdi: PontoRelatorio[]; ibov: PontoRelatorio[] }
  geradoEm: string
}
