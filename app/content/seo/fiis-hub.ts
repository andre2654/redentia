/**
 * /fiis é o hub educativo de fundos imobiliários.
 * /rankings?classe=fiis continua o filtro do hub de rankings, com canonical
 * /rankings: as duas páginas não mostram a mesma coisa.
 */
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../../utils/serp.ts'
import type { NuFaqItem } from '../../types/market.ts'

export const FIIS_PATH = '/fiis'
export const FIIS_TITLE = 'Fundos imobiliários (FIIs): tipos e rendimentos'
export const FIIS_H1 = 'Fundos imobiliários.'
export const FIIS_DESCRIPTION =
  'O que são fundos imobiliários (FIIs): tijolo, papel, híbrido e fundo de fundos. Rendimentos, isenção de IR e números com data. Não é recomendação.'
export const FIIS_SUBTITLE =
  'O que é um FII, os quatro tipos, como o rendimento chega na conta e quando a pessoa física tem isenção de IR. Não é recomendação de compra.'

export const FIIS_TIPOS = [
  {
    id: 'tijolo',
    titulo: 'Tijolo',
    texto: 'O fundo é dono de imóveis físicos, como galpões, lajes e shoppings. A renda vem do aluguel. A cota, negociada na bolsa, sobe e desce à parte desse aluguel.',
  },
  {
    id: 'papel',
    titulo: 'Papel',
    texto: 'O fundo não compra o prédio: investe em títulos do setor, como CRIs. A renda vem dos juros desses papéis. O risco principal é o de crédito, o de o devedor não pagar.',
  },
  {
    id: 'hibrido',
    titulo: 'Híbrido',
    texto: 'A carteira mistura imóveis e títulos. O resultado junta aluguel e juros, e o peso de cada parte está no regulamento do fundo, não no apelido da cota.',
  },
  {
    id: 'fof',
    titulo: 'Fundo de fundos',
    texto: 'Compra cotas de outros FIIs. O dinheiro se espalha entre vários fundos e entra uma camada a mais de taxa, porque há o gestor do fundo de fundos e os gestores dos fundos de dentro.',
  },
] as const

export const FIIS_FAQ: NuFaqItem[] = [
  {
    q: 'O que é um fundo imobiliário?',
    a: 'Um fundo de investimento imobiliário, o FII, reúne investidores para aplicar em imóveis ou em títulos do setor. A cota é negociada na bolsa. Quem tem cota recebe, na proporção dela, a renda que o fundo distribui. A cota também muda de preço. Não é renda fixa. O verbete está no glossário de fundos imobiliários.',
    link: { texto: 'glossário de fundos imobiliários', to: '/glossario/fii' },
  },
  {
    q: 'Quais são os tipos de FII?',
    a: 'Quatro famílias aparecem no mercado: tijolo, que vive de aluguel de imóvel físico; papel, que vive de juros de títulos do setor; híbrido, que mistura os dois; e fundo de fundos, que compra cotas de outros FIIs. O tipo descreve a carteira. Não diz qual cota comprar.',
  },
  {
    q: 'FII paga rendimento todo mês?',
    a: 'A Lei 8.668/1993 exige a distribuição de no mínimo 95% dos lucros auferidos, apurados pelo regime de caixa, com base em balanço ou balancete semestral de 30 de junho e de 31 de dezembro. O pagamento mensal é convenção da maioria dos fundos, não obrigação de todo mês, e o valor pode variar ou parar. O calendário está no guia de data com e data ex.',
    link: { texto: 'guia de data com e data ex', to: '/guias/data-com-e-data-ex' },
  },
  {
    q: 'O rendimento do FII é isento de Imposto de Renda?',
    a: 'Para a pessoa física, o art. 3º, III, da Lei 11.033/2004 isenta o rendimento distribuído por fundo com cotas admitidas à negociação exclusivamente em bolsa ou mercado de balcão organizado. O § 1º, I, exige no mínimo 100 cotistas, e o § 1º, II, não dá o benefício a quem tem 10% ou mais das cotas ou dos rendimentos. O ganho na venda da cota paga 20%, pelo art. 18 da Lei 8.668/1993. A isenção não é automática para todo mundo. A conta do ganho em ações está na calculadora de imposto de renda.',
    link: { texto: 'calculadora de imposto de renda', to: '/calculadora/imposto-renda' },
  },
  {
    q: 'Esta página indica algum FII para comprar?',
    a: 'Não. Ela explica o veículo e, quando o ranking já publicou cotação e data de pregão, mostra esse dividend yield com a fonte. Ordenar pelo indicador não é indicação de compra ou venda, nem promessa de retorno. O ranking de dividend yield é outra página.',
    link: { texto: 'ranking de dividend yield', to: '/ranking/maiores-dividend-yield?type=fiis' },
  },
]

export function canonicalDeRankings(path: string, _classe: string | null): string {
  return path === FIIS_PATH ? FIIS_PATH : '/rankings'
}

export function fiisCabeNoSerp(): boolean {
  const titulo = FIIS_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO
  const descricao = FIIS_DESCRIPTION.length >= 120 && FIIS_DESCRIPTION.length <= TETO_DESCRICAO
  return titulo && descricao
}
