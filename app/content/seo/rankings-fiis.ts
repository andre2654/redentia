/**
 * /rankings/fiis — rankings só de fundos imobiliários.
 * O filtro /rankings?classe=fiis continua no hub, com canonical /rankings.
 */
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../../utils/serp.ts'
import type { NuFaqItem } from '../../types/market.ts'

export const FIIS_RANK_PATH = '/rankings/fiis'
export const FIIS_RANK_TITLE = 'Rankings de FIIs: DY 12m e volume'
export const FIIS_RANK_H1 = 'Rankings de FIIs.'
export const FIIS_RANK_DESCRIPTION =
  'Rankings só de fundos imobiliários, por dividend yield de 12 meses e pelo volume do pregão. Cada número sai do dado, com data e fonte. Não é recomendação.'
export const FIIS_RANK_SUBTITLE =
  'Duas listas só de fundos imobiliários. Cada uma ordena um critério, com a data do pregão. O recorte é o ranking de dividend yield, não a B3 inteira. Não é recomendação de compra.'

export const FIIS_RANK_CRITERIOS = {
  dy: 'Critério: maior dividend yield de 12 meses, entre os FIIs desse ranking com cotação, data de pregão e DY acima de zero e até 50%. A ordem não é indicação de compra.',
  volume: 'Critério: maior volume financeiro do pregão, em reais, no cadastro do ticker, só onde esse volume e a data do pregão vieram preenchidos.',
} as const

export const FIIS_RANK_FAQ: NuFaqItem[] = [
  {
    q: 'De onde saem os números?',
    a: 'Do ranking de dividend yield de fundos imobiliários que o site já publica, com cotação e data de pregão. O volume é o volume financeiro do pregão no cadastro de cada ticker. Sem data, a linha não entra.',
  },
  {
    q: 'Esta página indica algum FII para comprar?',
    a: 'Não. Ela ordena um critério e mostra o número com a data. Ordenar não é indicação de compra ou venda, nem promessa de retorno. O que é um fundo imobiliário está no hub de FIIs.',
    link: { texto: 'hub de FIIs', to: '/fiis' },
  },
  {
    q: 'A lista cobre todos os FIIs da B3?',
    a: 'Não. O recorte é o que o ranking de dividend yield devolve, até 100 linhas, e ainda passa pelos filtros de cotação, data e do critério. O ranking completo de dividend yield é outra página.',
    link: { texto: 'ranking completo de dividend yield', to: '/ranking/maiores-dividend-yield?type=fiis' },
  },
]

export function fiisRankCabeNoSerp(): boolean {
  return FIIS_RANK_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO
    && FIIS_RANK_TITLE.length <= 60
    && FIIS_RANK_DESCRIPTION.length >= 120
    && FIIS_RANK_DESCRIPTION.length <= TETO_DESCRICAO
}
