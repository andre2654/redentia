/**
 * A leitura da cadeia de fornecimento do /asset (CadeiaRazao, 03/11/2026): as
 * empresas uma vez cada (utils/cadeiaLeitura), a fração conhecida em frase, o
 * painel das provas (AcaoCadeiaDetalhe) e a empresa sob o mouse, que acende a
 * linha dela.
 */
import type { AcaoCadeiaDetalheVM, AcaoCadeiaVM } from '~/types/acao'

export interface CadeiaProps { cadeia: AcaoCadeiaVM; nome: string; ticker: string; tom?: 'branco' | 'creme' }

export function useCadeiaLeitura(props: () => CadeiaProps) {
  const p = computed(props)
  const empresas = computed(() => empresasDaCadeia(p.value.cadeia))
  const cobertura = computed(() => frasesDaCobertura(p.value.cadeia.cobertura, p.value.nome))
  const resto = computed(() => restoDaCadeia(p.value.cadeia))
  const aberto = ref<AcaoCadeiaDetalheVM | null>(null)
  const ativo = ref<string | null>(null)
  const titulo = computed(() => `De quem a ${p.value.nome} compra e para quem vende.`)
  const contexto = computed(() => ({
    id: `cadeia:${p.value.ticker}`, tipo: 'grafico', rotulo: `Cadeia de ${p.value.ticker}`,
    texto: contextoDaCadeia(p.value.cadeia, p.value.nome),
  }))
  const fontes = computed(() => (p.value.cadeia.fontes
    ? `Fontes: ${p.value.cadeia.fontes}. Valores como a empresa informou; contratos somam a vigência inteira.`
    : ''))
  return { empresas, cobertura, resto, aberto, ativo, titulo, contexto, fontes }
}
