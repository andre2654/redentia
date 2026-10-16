/**
 * IR sobre venda de ações na B3, pessoa física: a matemática da
 * /calculadora/imposto-renda. Sem import do Nuxt: roda no `node --test`
 * (tests/ir-acoes.test.ts).
 *
 * Regras conferidas na fonte oficial em 15/10/2026:
 *  - Isenção do swing trade: vendas do mês "igual ou inferior a R$ 20.000,00"
 *    (Lei 11.033/2004, art. 3º, I). A página usava `< 20000`, e o cenário
 *    "Isenção exata R$ 20 mil" mostrava R$ 300 de IR.
 *  - DARF: código 6015, "IRPF - Ganhos líquidos em operações em bolsa", para
 *    swing E day trade. O 8523 que a página dava para day trade é "Ganhos de
 *    Capital na Alienação de Bens e Direitos Localizados no Exterior" (Agenda
 *    Tributária da Receita, dias 30/05/2025 e 30/12/2025).
 *  - Vencimento: "último dia útil do mês seguinte" (gov.br/receitafederal,
 *    Renda variável > Cálculo e pagamento do imposto). Quando o fim do mês não
 *    é dia útil, o prazo ANTECIPA, nunca adia: abr/2025 venceu em 30/05/2025
 *    (31/05 era sábado), nov/2025 em 30/12/2025 (31/12 sem expediente
 *    bancário) e jan/2022 em 25/02/2022 (28/02 era Carnaval).
 */

export type TipoOperacao = 'swing' | 'day'

export const ISENCAO_VENDAS_MES = 20000
export const CODIGO_DARF = '6015'

export interface IrAcoesEntrada {
  tipo: TipoOperacao
  vendas: number
  lucro: number
  /** Prejuízo acumulado de meses anteriores. Só compensa no swing trade. */
  prejuizoAcumulado: number
}

export interface IrAcoesResultado {
  taxDue: number
  taxRate: number
  message: string
  darfCode: string
  exempt: boolean
  compensatedLoss: number
  newAccumulatedLoss: number
}

export function calcularIrAcoes(e: IrAcoesEntrada): IrAcoesResultado {
  const accLoss = e.tipo === 'swing' ? e.prejuizoAcumulado : 0

  let taxDue = 0
  let taxRate = 0
  let message = ''
  let exempt = false
  let compensatedLoss = 0
  let newAccumulatedLoss = accLoss

  if (e.tipo === 'swing') {
    taxRate = 15

    // Isenção: vendas de até R$ 20 mil no mês, inclusive.
    if (e.vendas <= ISENCAO_VENDAS_MES) {
      exempt = true
      message = 'Isento de IR: vendas de até R$ 20.000 no mês'
    } else if (e.lucro <= 0) {
      // Prejuízo - acumula para compensação futura
      newAccumulatedLoss += Math.abs(e.lucro)
      message = 'Prejuízo no mês - não há IR a pagar. Prejuízo pode ser compensado nos próximos meses.'
    } else {
      // Lucro - calcula IR com compensação de prejuízos
      let taxableProfit = e.lucro

      if (accLoss > 0) {
        const toCompensate = Math.min(accLoss, e.lucro)
        compensatedLoss = toCompensate
        taxableProfit -= toCompensate
        newAccumulatedLoss = accLoss - toCompensate
      }

      taxDue = taxableProfit * 0.15
      message = taxDue > 0
        ? 'IR devido sobre o lucro do mês'
        : 'Lucro totalmente compensado por prejuízos acumulados'
    }
  } else {
    // Day Trade
    taxRate = 20

    if (e.lucro <= 0) {
      message = 'Prejuízo no mês - não há IR a pagar'
    } else {
      taxDue = e.lucro * 0.20
      message = 'IR devido sobre o lucro de day trade'
    }
  }

  return { taxDue, taxRate, message, darfCode: CODIGO_DARF, exempt, compensatedLoss, newAccumulatedLoss }
}

// ====================================================================
// Dia útil bancário. Não é o calendário de pregão da B3 (SEM_PREGAO_B3 em
// useSeguirGancho.ts): em 24/12 não há pregão, mas há banco aberto e o DARF
// vence normalmente. Os feriados nacionais são calculados para qualquer ano,
// porque o campo de mês da calculadora aceita qualquer período.
// ====================================================================
const DIA_MS = 86_400_000

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher), em ms UTC. */
function pascoaUtc(ano: number): number {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return Date.UTC(ano, mes - 1, dia)
}

function isoUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/**
 * Dias sem expediente bancário num ano, fora fim de semana: feriados
 * nacionais, Consciência Negra (nacional desde 2024, Lei 14.759/2023),
 * segunda e terça de Carnaval, Sexta-feira Santa, Corpus Christi e 31/12.
 */
export function diasSemExpedienteBancario(ano: number): Set<string> {
  const fixos = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '12-25', '12-31']
  if (ano >= 2024) fixos.push('11-20')
  const p = pascoaUtc(ano)
  return new Set([
    ...fixos.map((md) => `${ano}-${md}`),
    isoUtc(p - 48 * DIA_MS), // segunda de Carnaval
    isoUtc(p - 47 * DIA_MS), // terça de Carnaval
    isoUtc(p - 2 * DIA_MS), // Sexta-feira Santa
    isoUtc(p + 60 * DIA_MS), // Corpus Christi
  ])
}

/** `ms` é a meia-noite UTC do dia. */
function diaUtilBancario(ms: number): boolean {
  const semana = new Date(ms).getUTCDay()
  if (semana === 0 || semana === 6) return false
  return !diasSemExpedienteBancario(new Date(ms).getUTCFullYear()).has(isoUtc(ms))
}

/**
 * Vencimento do DARF 6015 das operações de `periodo` ('AAAA-MM'): último dia
 * útil do mês seguinte, em 'AAAA-MM-DD'. Período inválido → null.
 */
export function vencimentoDarf(periodo: string): string | null {
  const m = /^(\d{4})-(\d{2})$/.exec(periodo)
  if (!m) return null
  const ano = Number(m[1])
  const mes = Number(m[2])
  if (mes < 1 || mes > 12) return null
  // Date.UTC(ano, mes + 1, 0) = último dia do mês seguinte (mes é 1-based).
  let ms = Date.UTC(ano, mes + 1, 0)
  while (!diaUtilBancario(ms)) ms -= DIA_MS
  return isoUtc(ms)
}
