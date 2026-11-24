/**
 * /rankings/small-caps — lista de ações abaixo de um corte de valor de mercado.
 * O corte é desta página. Não é a carteira do índice Small Cap da B3.
 */
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../../utils/serp.ts'
import { SMALL_CAPS_CORTE_TEXTO, SMALL_CAPS_LIMITE } from '../../utils/rankingsRecorte.ts'
import type { NuFaqItem } from '../../types/market.ts'

export const SMALL_CAPS_PATH = '/rankings/small-caps'
export const SMALL_CAPS_TITLE = 'Small caps: ações abaixo de R$ 2 bilhões'
export const SMALL_CAPS_H1 = 'Small caps por valor de mercado.'
export const SMALL_CAPS_DESCRIPTION =
  'Ações com valor de mercado abaixo de R$ 2 bilhões no pregão informado. Corte declarado desta página, com data e fonte em cada número. Não é recomendação.'
export const SMALL_CAPS_SUBTITLE =
  'Lista de ações com valor de mercado abaixo de um corte declarado, com a data do pregão. Não é recomendação de compra.'

export const SMALL_CAPS_CRITERIO =
  `Critério: ação da B3 com valor de mercado informado maior que zero e abaixo de ${SMALL_CAPS_CORTE_TEXTO}. A ordem é pelo valor de mercado, do menor para o maior. Quando passam mais de ${SMALL_CAPS_LIMITE}, a tabela mostra ${SMALL_CAPS_LIMITE}. ON e PN da mesma empresa podem aparecer juntas. Não é o índice Small Cap da B3.`

export const SMALL_CAPS_FAQ: NuFaqItem[] = [
  {
    q: 'Qual é o corte desta lista?',
    a: `Valor de mercado maior que zero e abaixo de ${SMALL_CAPS_CORTE_TEXTO}, no pregão da data de cada linha. Não há corte oficial único no Brasil. Este é o corte declarado desta página, verificável na base de tickers. O verbete do glossário conta o que o mercado chama de small cap.`,
    link: { texto: 'glossário', to: '/glossario/small-caps' },
  },
  {
    q: 'Esta lista indica ação para comprar?',
    a: 'Não. Ela aplica o corte e ordena pelo valor de mercado. Estar na lista não é indicação de compra ou venda, nem promessa de retorno. O guia explica como ler essas ações.',
    link: { texto: 'guia', to: '/guias/small-caps-guia-completo' },
  },
  {
    q: 'Por que duas classes da mesma empresa podem aparecer?',
    a: 'A base devolve o valor de mercado em cada ticker. Quando ON e PN carregam o mesmo número e as duas ficam abaixo do corte, as duas entram, cada uma com a própria cotação e os próprios links.',
  },
]

export function smallCapsCabeNoSerp(): boolean {
  return SMALL_CAPS_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO
    && SMALL_CAPS_TITLE.length <= 60
    && SMALL_CAPS_DESCRIPTION.length >= 120
    && SMALL_CAPS_DESCRIPTION.length <= TETO_DESCRICAO
}
