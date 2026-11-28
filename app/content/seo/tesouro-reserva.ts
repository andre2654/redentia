/**
 * /tesouro/tesouro-reserva — guia do Tesouro Reserva.
 * Fatos conferidos em 28/11/2026 nas fontes listadas abaixo.
 * Não recomenda título nem instituição e não promete rendimento.
 */
import type { NuFaqItem } from '~/types/market'

export const TESOURO_RESERVA_PATH = '/tesouro/tesouro-reserva'
export const TESOURO_RESERVA_TITULO_PATH = '/tesouro/tesouro-reserva-2036'
/** Title da página, sem o sufixo " · Aportou" (40 caracteres). */
export const TESOURO_RESERVA_TITLE = 'Tesouro Reserva: como funciona e imposto'
export const TESOURO_RESERVA_H1 = 'Tesouro Reserva: como funciona, rendimento e imposto.'
export const TESOURO_RESERVA_DESCRIPTION = 'Como funciona o Tesouro Reserva: 100% da Selic, resgate quase 24h, IR regressivo e custódia da B3. Simulação com a Selic de hoje. Não é recomendação.'
export const TESOURO_RESERVA_VENCIMENTO = '01/01/2036'
export const ROTULO_SIMULACAO = 'simulação com a Selic de hoje, não é promessa de rendimento'

export const FONTE_TESOURO_DIRETO = 'https://www.tesourodireto.com.br/tesouro-reserva'
export const FONTE_B3 = 'https://edu.b3.com.br/w/tesouro-reserva'
export const FONTE_TESOURO_NACIONAL = 'https://www.gov.br/tesouronacional/pt-br/noticias/tesouro-nacional-b3-e-bb-lancam-tesouro-reserva-com-operacao-24h-nos-7-dias-da-semana'
export const FONTE_IR = 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033compilado.htm'
export const FONTE_IOF = 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm'
export const FONTE_POUPANCA = 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12703.htm'
export const FONTE_POUPANCA_BASE = 'https://www.planalto.gov.br/ccivil_03/leis/l8177.htm'
export const FONTE_POUPANCA_IR = 'https://www.planalto.gov.br/ccivil_03/leis/l8981.htm'
export const FONTE_BCB = 'https://www.bcb.gov.br'

export const TESOURO_RESERVA_FAQ: NuFaqItem[] = [
  {
    q: 'O Tesouro Reserva tem imposto de renda?',
    a: 'Sim. O imposto de renda incide sobre o rendimento, pela tabela regressiva da Lei 11.033/2004: 22,5% até 180 dias, 20% de 181 a 360 dias, 17,5% de 361 a 720 dias e 15% acima de 720 dias. A B3 Educação resume a mesma faixa, de 22,5% até 180 dias a 15% acima de 720 dias. O IOF só entra se o resgate ocorrer nos primeiros 30 dias, pela tabela do Decreto 6.306/2007. A taxa de custódia da B3 é de 0,20% ao ano, isenta para valores de até R$ 10.000,00 segundo o Tesouro Direto.',
  },
  {
    q: 'Posso resgatar o Tesouro Reserva no fim de semana?',
    a: 'Sim. Segundo o Tesouro Direto, aplicação e resgate funcionam praticamente 24 horas por dia, 7 dias por semana, inclusive à noite, em fins de semana e feriados. As operações ficam indisponíveis diariamente entre 0h e 1h. O resgate é imediato. A B3 Educação descreve o crédito via Pix.',
  },
  {
    q: 'Qual o valor mínimo do Tesouro Reserva?',
    a: 'R$ 1,00 para aplicar e R$ 1,00 para resgatar, segundo o Tesouro Direto. Os dois movimentos têm o mesmo piso.',
  },
  {
    q: 'O Tesouro Reserva tem taxa de custódia?',
    a: 'Sim. A taxa de custódia da B3 é de 0,20% ao ano, com isenção para valores de até R$ 10.000,00, segundo o Tesouro Direto. A B3 Educação detalha: até R$ 10 mil por CPF não há cobrança; acima disso, a taxa incide só sobre a parcela excedente.',
  },
  {
    q: 'Onde aplicar no Tesouro Reserva?',
    a: 'A simulação pode ser feita no site do Tesouro Direto. Para investir, o site direciona à plataforma da instituição parceira — segundo o Tesouro Direto, inicialmente disponível pelo Banco do Brasil. O mesmo site informa que outras instituições ainda não ofertam o título. Esta página não indica instituição.',
  },
  {
    q: 'Quando vence o Tesouro Reserva?',
    a: 'O título listado vence em 01/01/2036. A data e a taxa do dia estão na página do título, com os dados do Tesouro Nacional já usados por este site.',
    link: { texto: 'página do título', to: TESOURO_RESERVA_TITULO_PATH },
  },
]
