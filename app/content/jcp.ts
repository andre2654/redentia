/**
 * /jcp — juros sobre capital próprio.
 *
 * A alíquota e o texto legal são os de /quanto-rende/{ticker} (a redação do
 * art. 8º da LC 224/2025). Não há outra alíquota nesta página. Datas de
 * empresa só entram pelos avisos já lidos em app/utils/jcpPagadores.ts.
 */
import type { NuFaqItem } from '~/types/market'
import { TEXTO_ALIQUOTA_JCP } from '../utils/dividendosBlocos.ts'

export const JCP_PATH = '/jcp'
export const JCP_TITLE = 'JCP: o que é juros sobre capital próprio'
export const JCP_DESCRIPTION = 'O que é JCP, a diferença para o dividendo e a retenção de 17,5% desde 1º de janeiro de 2026. Data com, data ex e informe de rendimentos.'
export const JCP_H1 = 'Juros sobre capital próprio.'
export const JCP_LEAD = 'Juros sobre capital próprio, ou JCP, é um provento em dinheiro. A regra fiscal não é a do dividendo. Não é recomendação de compra ou venda.'
export const JCP_PUBLICADO = '2026-11-24'

/**
 * Trecho único de /quanto-rende/{ticker}, da regra do dividendo até o art. 8º
 * da LC 224/2025. Espaços colapsados; as palavras e os links são os mesmos.
 */
export const REGRA_QUANTO_RENDE =
  'Pelo <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm" target="_blank" rel="noopener noreferrer">art. 10 da Lei 9.249/1995, na redação da Lei 15.270/2025</a>, o lucro ou dividendo pago por pessoa jurídica tributada pelo lucro real, presumido ou arbitrado não fica sujeito a IR na fonte nem entra na base do beneficiário domiciliado no País, ressalvados os arts. 6º-A e 16-A da Lei 9.250/1995. O <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm" target="_blank" rel="noopener noreferrer">art. 6º-A da Lei 9.250/1995, incluído pelo art. 2º da Lei 15.270/2025</a>, sujeita à retenção na fonte de 10% sobre o total do valor pago o montante superior a R$ 50.000 que uma mesma pessoa jurídica paga a uma mesma pessoa física residente no Brasil em um mesmo mês. O caput fixa esse marco a partir do mês de janeiro do ano-calendário de 2026. O art. 8º da Lei 15.270/2025 diz que a lei produzirá efeitos a partir de 1º de janeiro de 2026. JCP tem IR na fonte de 17,5% na data do pagamento ou do crédito, pelo § 2º do art. 9º da Lei 9.249/1995, com a redação do <a href="https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp224.htm" target="_blank" rel="noopener noreferrer">art. 8º da Lei Complementar 224/2025</a>. O art. 14, III, produzirá efeitos a partir de 1º de janeiro de 2026 em relação aos demais dispositivos, e o art. 8º está nesse grupo. O inciso I, alínea b, reserva o primeiro dia do quarto mês subsequente ao de sua publicação aos arts. 7º e 9º.'

const CORTE_JCP = 'JCP tem IR na fonte de 17,5%'

export const REGRA_DIVIDENDO = REGRA_QUANTO_RENDE.slice(0, REGRA_QUANTO_RENDE.indexOf(CORTE_JCP)).trim()
export const REGRA_JCP = REGRA_QUANTO_RENDE.slice(REGRA_QUANTO_RENDE.indexOf(CORTE_JCP)).trim()

export { TEXTO_ALIQUOTA_JCP }

export const JCP_FAQ: NuFaqItem[] = [
  {
    q: 'O que é juros sobre capital próprio?',
    a: 'Juros sobre capital próprio, ou JCP, é uma forma de a empresa remunerar o acionista em dinheiro, ao lado do dividendo. A diferença está na regra fiscal, não no fato de o valor cair na conta.',
  },
  {
    q: 'Qual a diferença entre JCP e dividendo?',
    a: 'Pela Lei 15.270/2025, o dividendo não fica sujeito a IR na fonte, ressalvado o caso em que a mesma pessoa jurídica paga a mesma pessoa física mais de R$ 50.000 no mesmo mês: aí há retenção de 10% sobre o total, a partir de janeiro de 2026. O JCP tem 17,5% de IR retido na fonte desde 1º de janeiro de 2026, pelo art. 8º da Lei Complementar 224/2025.',
  },
  {
    q: 'Qual a alíquota do JCP a partir de 2026?',
    a: 'JCP tem 17,5% de IR retido na fonte desde 1º de janeiro de 2026, pelo art. 8º da Lei Complementar 224/2025. A retenção ocorre na data do pagamento ou do crédito, pelo § 2º do art. 9º da Lei 9.249/1995, com essa redação. O art. 14, III, da Lei Complementar 224/2025 produz efeitos a partir de 1º de janeiro de 2026 para esse dispositivo.',
  },
  {
    q: 'O que são data com e data ex no JCP?',
    a: 'A data com é o último pregão em que quem está posicionado no fechamento tem direito ao JCP anunciado. A data ex é o pregão seguinte: a partir dele o papel negocia sem esse direito. A data de pagamento não muda quem tem direito. O guia de data com e data ex descreve a mesma sequência para qualquer provento.',
    link: { texto: 'guia de data com e data ex', to: '/guias/data-com-e-data-ex' },
  },
  {
    q: 'Como o JCP aparece no informe de rendimentos?',
    a: 'O imposto do JCP já sai retido na fonte. O informe de rendimentos da corretora ou do banco lista posições, proventos e impostos retidos. Na declaração anual, o valor entra na ficha de rendimentos sujeitos à tributação exclusiva. O passo a passo da declaração está no guia de como declarar investimentos no IR.',
    link: { texto: 'guia de como declarar investimentos no IR', to: '/guias/como-declarar-investimentos-no-ir' },
  },
  {
    q: 'A lista de empresas desta página é uma recomendação?',
    a: 'Não. São avisos de JCP que já constam na base da B3 usada pelo site, cada um com a data do aviso. Não é recomendação de compra ou venda e não é promessa de retorno. A calculadora de imposto de renda descreve a mesma retenção, sem projetar resultado.',
    link: { texto: 'calculadora de imposto de renda', to: '/calculadora/imposto-renda' },
  },
]

export const JCP_LINKS = [
  {
    to: '/calculadora/imposto-renda',
    titulo: 'Calculadora de imposto de renda',
    texto: 'A mesma retenção de 17,5% do JCP, ao lado da regra do dividendo.',
  },
  {
    to: '/guias/data-com-e-data-ex',
    titulo: 'Data com e data ex',
    texto: 'A sequência de datas de qualquer provento, inclusive o JCP.',
  },
  {
    to: '/glossario/jscp',
    titulo: 'JCP no glossário',
    texto: 'O verbete curto, com a ficha de tributação exclusiva na fonte.',
  },
  {
    to: '/dividendos/agenda',
    titulo: 'Agenda de dividendos',
    texto: 'Pagamentos do mês na B3. O JCP entra quando o aviso traz a data.',
  },
] as const
