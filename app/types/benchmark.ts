/**
 * Benchmark de IA da Redentia (/benchmark-ia).
 *
 * Dois blocos de contrato:
 *  - CONTEÚDO (metodologia, princípios, FAQ): estático, vive em
 *    content/benchmark-ia/metodologia.ts e sai no SSR mesmo sem edição publicada.
 *  - EDIÇÃO (resultados): vem do runner (chat-service) via Laravel. Enquanto não
 *    existir edição publicada, a página mostra só a metodologia (regra 7 do
 *    design system: dado que falta faz o elemento sumir).
 */

export type BenchIndexId = 'longo' | 'curto' | 'golpe' | 'leao' | 'inventa' | 'amem'

/** arena = decisão antes do resultado existir; laboratorio = prova com gabarito */
export type BenchIndexKind = 'arena' | 'laboratorio'

export type BenchTier = 'fronteira' | 'intermediario' | 'economico'

export interface BenchIndexMethod {
  id: BenchIndexId
  kind: BenchIndexKind
  /** nome curto do índice ("Antigolpe") */
  name: string
  /** pergunta que o índice responde, em uma frase */
  question: string
  /** o que o índice mede, em uma frase */
  measures: string
  steps: { label: string; text: string }[]
  /** frase de rodapé: por que a métrica é essa */
  why?: string
  cadence: string
  cost: string
}

export interface BenchPrinciple {
  title: string
  text: string
}

export interface BenchModel {
  id: string
  name: string
  provider: string
  tier: BenchTier
  openWeights: boolean
  /** US$ por 1.000 respostas no formato das provas (custo cobrado, não tabela) */
  costPer1k: number
}

/** nota 0-100 com intervalo de 95% */
export interface BenchScore {
  value: number
  lo: number
  hi: number
  /** posição calculada pelo relatório (diferença pareada); sem ela, a página usa a sobreposição dos intervalos */
  rank?: number
}

export interface BenchLeaderRow {
  modelId: string
  overall: BenchScore
  byIndex: Partial<Record<BenchIndexId, BenchScore>>
}

/** Carteira própria: retorno total acumulado (%) desde a primeira rodada, um ponto por rodada */
export interface BenchArenaLongo {
  labels: string[]
  ibov: number[]
  /** Tesouro Selic no mesmo período: a régua de quem deixou o dinheiro parado no seguro */
  selic: number[]
  series: { modelId: string; values: number[]; rodadas?: BenchRodadaMarco[] }[]
  /** rodadas feitas / mínimo para sair de "em formação" */
  sample: number
  minSample: number
  /** último pregão da série (AAAA-MM-DD), quando vem do backend */
  atualizadoEm?: string
}

/**
 * Previsão de futuro em formação: o IC de Spearman de cada modelo a cada
 * pregão depois da rodada, até o 21º (a nota oficial). Vem do backend
 * (`/ai-benchmark/previsao`); a nota de cada ação nunca sai de lá.
 */
export interface BenchPrevisaoParcial {
  rodada: number
  /** dia do retrato da rodada (AAAA-MM-DD) */
  dataRef: string
  /** pregões até a nota oficial */
  horizonte: number
  /** data prevista da nota oficial (AAAA-MM-DD) */
  fimPrevisto: string | null
  /** pregões que já fecharam */
  pregoes: number
  completo: boolean
  /** "Início" e um rótulo por pregão fechado */
  labels: string[]
  /** IC de −1 a +1 por pregão; o "Início" é 0 */
  series: { modelId: string; values: (number | null)[] }[]
  atualizadoEm: string
}

/** uma rodada da Carteira no eixo do gráfico: só quantas ordens o modelo executou, nunca de quê */
export interface BenchRodadaMarco {
  /** índice em `labels` (0 = "Início", a 1ª rodada) */
  i: number
  n: number
  alteracoes: number | null
  falhou?: boolean
}

/** Previsão de futuro: IC médio por rodada com intervalo de 95% */
export interface BenchArenaCurto {
  rows: { modelId: string; value: number; lo: number; hi: number }[]
  sample: number
  minSample: number
}

export interface BenchGolpeRow {
  modelId: string
  /** % dos golpes que o modelo marcou como golpe */
  caught: number
  /** % das ofertas legítimas que o modelo acusou de golpe */
  falseAlarm: number
}

export interface BenchLeao {
  topics: string[]
  rows: { modelId: string; cells: number[] }[]
}

/** barras 100% empilhadas (Inventa número? e Concorda com tudo?) */
export interface BenchStack {
  segments: { label: string; tone: 'good' | 'neutral' | 'bad' }[]
  rows: { modelId: string; parts: number[] }[]
  /** notas de referência: quem diz "não sei" a tudo e quem falha em tudo */
  baselines?: { naoSeiATudo: number; falhaEmTudo: number }
}

export interface BenchEdition {
  number: number
  /** "Edição 01, outubro de 2026" */
  label: string
  dateIso: string
  spendUsd: number
  decisions: number
  questions: number
  models: BenchModel[]
  leaderboard: BenchLeaderRow[]
  /* índices que a edição não rodou ficam ausentes: a página mostra só o método */
  longo?: BenchArenaLongo
  curto?: BenchArenaCurto
  golpe?: BenchGolpeRow[]
  leao?: BenchLeao
  inventa?: BenchStack
  amem?: BenchStack
  /** % de respostas inventadas sem dado e com a base da Redentia no enunciado (fora do ranking) */
  inventaDados?: { modelId: string; semDados: number; comDados: number }[]
  /** % dos casos de controle do "Concorda com tudo?" em que o modelo desaconselhou um plano razoável */
  amemControle?: { modelId: string; travouControle: number }[]
  /** SHA-256 de todos os arquivos de resposta da edição */
  seal?: string
  /** % de respostas que não vieram no formato pedido após 3 tentativas */
  failureRate?: number
  /** provas que algum modelo não completou: aparecem no índice delas, fora da média geral */
  foraDoGeral?: BenchIndexId[]
  /** quem não completou cada uma dessas provas */
  incompletos?: Partial<Record<BenchIndexId, string[]>>
  /** Previsão de futuro antes da primeira nota: rodadas feitas e quando sai a correção */
  curtoStatus?: { rodadas: number; corrigidas: number; primeira: string; proximaCorrecao: string | null }
  /** auditoria pós-coleta: itens que saíram do placar e itens confirmados na fonte */
  auditoria?: { excluidos: number; confirmados: number }
}

/* ——— placar com abas (BenchRanking) ——— */
export interface BenchRankingRow {
  id: string
  name: string
  provider: string
  value: number
  lo: number
  hi: number
  rank: number
  tied: boolean
  /** métrica de apoio da aba ("inventou 12%") */
  extra?: string
}
export interface BenchRankingTab {
  id: string
  label: string
  /** uma frase: o que a aba mede */
  desc: string
  rows: BenchRankingRow[] | null
  /** frase quando a edição não tem esse índice */
  empty?: string
  min?: number
  max?: number
  format?: (v: number) => string
}

/* ——— colunas e menu lateral (BenchColumns, BenchSideNav) ——— */
export interface BenchColumnItem {
  id: string
  label: string
  value: number
  lo?: number
  hi?: number
  /** posição estatística (a mesma da lista); sem ela, vale a ordem do array */
  rank?: number
  tied?: boolean
}

export interface BenchNavItem {
  id: string
  label: string
  icon: string
  soon?: boolean
}

/** número de destaque no topo do /benchmark-ia (BenchHero) */
export interface BenchHeroStat {
  /** id da seção para onde o cartão leva */
  id: string
  value: number
  format: 'pct' | 'int'
  label: string
  /** bad: número que é erro (vermelho); good: número neutro ou positivo (azul) */
  tone: 'bad' | 'good'
}

/** explicação de um gráfico, aberta pelo botão "i" da seção (modal NuDayModal) */
export interface BenchChartInfo {
  titulo: string
  sub: string
  /** três blocos: o que mostra, como ler, cuidado */
  blocos: { rotulo: string; texto: string }[]
}
