/**
 * /acoes-que-pagam-dividendos e /acoes-que-pagam-dividendos-mensais.
 * Texto descritivo. O número mora na lista, que só entra com dado da API.
 */
import type { NuFaqItem } from '../../types/market.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../../utils/serp.ts'
import {
  ACOES_DIV_MENSAIS_PATH,
  ACOES_DIV_PATH,
  AVISOS_MINIMOS,
  JANELA_DIVIDENDOS_DIAS,
  MESES_ALTA,
  MESES_MENSAL,
  RANKING_LIMITE,
} from '../../utils/acoesDividendos.ts'

export { ACOES_DIV_MENSAIS_PATH, ACOES_DIV_PATH }

export const ACOES_DIV_TITLE = 'Ações que pagam dividendos na B3'
export const ACOES_DIV_H1 = 'Ações que pagam dividendos'
export const ACOES_DIV_DESCRIPTION =
  'Ações da B3 com dividend yield de 12 meses, último pagamento e meses com provento. Com data e fonte. Dividendos passados não garantem os futuros.'
export const ACOES_DIV_SUBTITLE =
  'Lista de ações com dividend yield de 12 meses, último pagamento e quantos meses tiveram provento na janela. Não é recomendação de compra ou venda.'

export const ACOES_DIV_MENSAIS_TITLE = 'Ações que pagam dividendos mensais'
export const ACOES_DIV_MENSAIS_H1 = 'Ações que pagam dividendos mensais'
export const ACOES_DIV_MENSAIS_DESCRIPTION =
  'Ações da B3 com pagamento de renda em 10 meses ou mais nos últimos 12 meses, no histórico. De 6 a 9 meses fica em outra seção. Não é recomendação.'
export const ACOES_DIV_MENSAIS_SUBTITLE =
  'O corte é a contagem de meses com pagamento no histórico. A página não chama uma ação de mensal se os meses não aparecerem.'

export const ACOES_DIV_CRITERIO =
  `Critério: ação da B3 no ranking de dividend yield de 12 meses, com DY acima de zero e de no máximo 50%, cotação, data de pregão e ao menos um provento de renda na janela de ${JANELA_DIVIDENDOS_DIAS} dias. A ordem é o DY, do maior para o menor. A tabela mostra ${RANKING_LIMITE} quando há mais. ON e PN da mesma empresa podem aparecer juntas. Não é a lista de todas as pagadoras da B3.`

export const ACOES_DIV_METODO =
  'O dividend yield de 12 meses é o do ranking: proventos de renda, dividendos e JCP, sem amortização, com data-com nos últimos 365 dias, ajustados por desdobramento, divididos pela cotação do pregão. DY = (proventos de renda de 12 meses ÷ cotação) × 100. DY acima de 50% fica de fora. Os meses desta página são outra conta: meses-calendário com data de pagamento de renda dentro da janela, lidos no histórico de cada papel. Vários avisos no mesmo mês contam uma vez. Pagamento futuro não entra. Dividendos passados não garantem pagamentos futuros.'

export const ACOES_DIV_MENSAIS_CRITERIO =
  `Critério: ação da B3 com pagamento de renda (dividendo ou JCP, sem amortização) em ${MESES_MENSAL} ou mais meses-calendário distintos. A janela vai de hoje menos ${JANELA_DIVIDENDOS_DIAS} dias até hoje, pela data de pagamento. A lista de pagadores só indica quem tem ${AVISOS_MINIMOS} ou mais avisos em 12 meses; o mês só entra depois do histórico. A janela pode cruzar 13 meses-calendário. Não é promessa de pagamento no mês seguinte.`

export const ACOES_DIV_ALTA_CRITERIO =
  `Critério: a mesma janela e a mesma leitura, com ${MESES_ALTA} a ${MESES_MENSAL - 1} meses distintos. É outra seção. Não é a lista de ${MESES_MENSAL} meses ou mais.`

export const ACOES_DIV_FAQ: NuFaqItem[] = [
  {
    q: 'Como o dividend yield de 12 meses é calculado?',
    a: 'DY = (proventos de renda de 12 meses ÷ cotação) × 100. Entram dividendos e JCP com data-com nos últimos 365 dias, ajustados por desdobramento. Amortização fica de fora. O número é o do ranking de dividend yield, o mesmo de /ranking/maiores-dividend-yield. DY acima de 50% não entra. Dividendos passados não garantem pagamentos futuros.',
    link: { texto: '/ranking/maiores-dividend-yield', to: '/ranking/maiores-dividend-yield' },
  },
  {
    q: 'Esta lista indica ação para comprar?',
    a: 'Não. Ela ordena o dividend yield de 12 meses e mostra o último pagamento e os meses com provento na janela. Estar na lista não é indicação de compra ou venda, nem promessa de renda. O pagamento passado não se repete por estar aqui.',
  },
  {
    q: 'Qual a diferença para o ranking de maiores dividend yields?',
    a: 'O ranking mistura ações, FIIs e BDRs e ordena pelo DY. Esta página fica só nas ações, acrescenta o último pagamento e os meses com pagamento, e aponta a lista de muitos meses. O DY é o mesmo número.',
    link: { texto: 'lista de muitos meses', to: ACOES_DIV_MENSAIS_PATH },
  },
  {
    q: 'O que conta como mês com pagamento?',
    a: `Um mês-calendário em que houve ao menos um pagamento de dividendo ou JCP, com data de pagamento na janela de ${JANELA_DIVIDENDOS_DIAS} dias. Dois avisos no mesmo mês contam uma vez. Amortização e pagamento ainda não ocorrido ficam de fora. A contagem de avisos (count_12m) não vira mês.`,
  },
  {
    q: 'Dividendos passados garantem os próximos?',
    a: 'Não. A lista descreve o que a base registrou na janela. A empresa pode reduzir, suspender ou mudar a data. O registro não promete o pagamento seguinte.',
  },
]

export const ACOES_DIV_MENSAIS_FAQ: NuFaqItem[] = [
  {
    q: 'Quando uma ação entra na lista de pagamentos em muitos meses?',
    a: `Quando o histórico registra pagamento de renda em ${MESES_MENSAL} ou mais meses-calendário distintos, na janela de ${JANELA_DIVIDENDOS_DIAS} dias até hoje. A página não afirma que a ação paga todo mês, nem que o mês que vem terá pagamento.`,
  },
  {
    q: 'Por que a lista de 10 meses pode ser curta?',
    a: 'Na B3, poucas ações têm pagamento de renda em tantos meses. Banco que paga JCP e dividendo em meses diferentes pode chegar. Quem concentra o pagamento em menos meses fica de fora, mesmo com DY alto. O número é o do histórico, não uma meta.',
  },
  {
    q: 'O que é a seção de alta frequência?',
    a: `Ações com ${MESES_ALTA} a ${MESES_MENSAL - 1} meses distintos na mesma janela. Está separada para não parecer a lista de ${MESES_MENSAL} meses ou mais. Também não é recomendação.`,
  },
  {
    q: 'Como ver os pagamentos mês a mês?',
    a: 'A agenda lista o que está anunciado em cada mês, com data e valor. O guia de dividendos todo mês descreve a leitura de uma escada de recebimentos. Nenhum dos dois indica o que comprar.',
    link: { texto: 'agenda', to: '/dividendos/agenda' },
  },
  {
    q: 'Esta página promete dividendos todo mês?',
    a: 'Não. Ela conta meses em que já houve pagamento. Dividendos passados não garantem pagamentos futuros. Não é recomendação de compra ou venda.',
  },
]

function cabe(titulo: string, descricao: string): boolean {
  return titulo.length + SUFIXO_MARCA.length <= TETO_TITULO
    && titulo.length <= 60
    && descricao.length >= 120
    && descricao.length <= TETO_DESCRICAO
}

export function acoesDividendosCabeNoSerp(): boolean {
  return cabe(ACOES_DIV_TITLE, ACOES_DIV_DESCRIPTION)
    && cabe(ACOES_DIV_MENSAIS_TITLE, ACOES_DIV_MENSAIS_DESCRIPTION)
}
