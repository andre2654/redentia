/**
 * Registro das edições publicadas do Benchmark de IA, da mais antiga para a
 * mais recente. Cada edição é um arquivo GERADO por chat-service/bench/report.ts
 * (--front), só com agregados. Lista vazia = página mostra só a metodologia.
 */
import type { BenchEdition } from '~/types/benchmark'
import { EDICAO_01 } from './edicao-01'

export const EDICOES: BenchEdition[] = [EDICAO_01]
