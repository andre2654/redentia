/**
 * Hub /ranking/acoes-baratas.
 *
 * "Barata" aqui é a cotação abaixo do valor da fórmula (Graham, Bazin) ou um
 * P/VP baixo. Não há ranking só de P/VP no registry: a página explica o
 * critério e aponta as listas que existem. Nenhum número é inventado: a
 * lista compacta sai do mesmo useRanking das páginas de Graham e Bazin.
 */
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../../utils/serp.ts'

export const ACOES_BARATAS_PATH = '/ranking/acoes-baratas'

/** 40 caracteres. Com " · Aportou" fica em 50, abaixo de 60. */
export const ACOES_BARATAS_TITLE = 'Ações Baratas 2026: Graham, Bazin e P/VP'

export const ACOES_BARATAS_H1 = 'Ações baratas pelas fórmulas'

export const ACOES_BARATAS_DESCRIPTION =
  'Ações com cotação abaixo de Graham ou de Bazin, ou com P/VP baixo. Listas e a calculadora de preço teto. Estimativa educacional, não é recomendação.'

export const ACOES_BARATAS_NOTA =
  'Estimativa educacional pela fórmula, não é recomendação de investimento.'

export const ACOES_BARATAS_INTRO =
  'Aqui, barata quer dizer que a cotação está abaixo do valor calculado pela fórmula, ou que o P/VP está baixo. Graham usa a raiz de 22,5 × LPA × VPA. Bazin divide o dividendo dos últimos 12 meses por 6%. No vocabulário do mercado, papéis nessa situação também são chamados de subvalorizadas. A distância descreve a conta. Não diz o que comprar nem para onde a cotação vai.'

export const ACOES_BARATAS_LINKS = [
  {
    to: '/ranking/mais-baratas-graham',
    title: 'Mais baratas por Graham',
    sub: 'Maior distância entre a cotação e o valor da fórmula de Graham.',
  },
  {
    to: '/ranking/mais-baratas-bazin',
    title: 'Mais baratas por Bazin',
    sub: 'Maior distância entre a cotação e o dividendo de 12 meses dividido por 6%.',
  },
  {
    to: '/ranking/menores-pl',
    title: 'Menores P/L',
    sub: 'Não há uma lista só de P/VP. O P/L baixo é outra régua de múltiplo, na lista de menores P/L.',
  },
  {
    to: '/calculadora/preco-teto',
    title: 'Calculadora de preço teto',
    sub: 'Graham, Bazin, P/L setorial e valor patrimonial, com a fórmula aberta.',
  },
] as const

export const ACOES_BARATAS_FAQ = [
  {
    q: 'O que esta página chama de ação barata?',
    a: 'Cotação abaixo do valor calculado por uma fórmula, ou P/VP baixo. Graham compara a cotação com a raiz de 22,5 × LPA × VPA. Bazin compara com o dividendo de 12 meses dividido por 6%. É a leitura da fórmula, não uma ordem de compra.',
  },
  {
    q: 'O que quer dizer ação subvalorizada neste texto?',
    a: 'É o mesmo critério: o preço de tela está abaixo do número da fórmula, ou o P/VP está baixo em relação ao patrimônio por ação. Subvalorizada descreve essa distância. Não promete que a cotação vá até o número da fórmula.',
  },
  {
    q: 'Qual a diferença entre a lista de Graham e a de Bazin?',
    a: 'Graham usa lucro por ação e valor patrimonial. Bazin usa o dividendo dos últimos 12 meses e a régua de 6% ao ano. Uma ação pode aparecer numa lista e não na outra, porque as contas olham números diferentes.',
  },
  {
    q: 'Existe um ranking só de P/VP?',
    a: 'Não. O P/VP de cada papel está na página do ativo. A lista de menores P/L ordena outro múltiplo, o preço sobre o lucro. P/VP baixo e P/L baixo não são a mesma conta.',
  },
  {
    q: 'Cotação abaixo do preço teto é recomendação?',
    a: 'Não. O preço teto é o número da fórmula com os dados dos últimos 12 meses. A cotação pode estar abaixo porque o mercado já colocou um problema no preço. Estimativa educacional pela fórmula, não é recomendação de investimento.',
  },
] as const

export function acoesBaratasCabeNoSerp(): boolean {
  return ACOES_BARATAS_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO
    && ACOES_BARATAS_DESCRIPTION.length <= TETO_DESCRICAO
}
