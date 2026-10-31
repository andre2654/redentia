/**
 * O relógio da B3 que a home usa (31/10/2026).
 *
 * O relógio da bolsa da home: momentoDaBolsa() diz, como o app, se a bolsa está
 * aberta ("Bolsa aberta", "A bolsa abre às 10h", "Bolsa fechada").
 *
 * A lista de dias sem pregão (SEM_PREGAO_B3, ANOS_COM_CALENDARIO) mora em
 * utils/pregao.ts, a mesma que a /carteira e o useSeguirGancho leem: o ano
 * novo da B3 entra num lugar só.
 */
import { ANOS_COM_CALENDARIO, SEM_PREGAO_B3, horaDoFechamento } from './pregao.ts'

export { SEM_PREGAO_B3 }
export const ANOS_COM_CALENDARIO_B3 = ANOS_COM_CALENDARIO

/**
 * Pregão regular da B3, em minutos do dia no fuso de São Paulo: abre às 10h e
 * fecha às 17h ou às 18h, conforme o horário de verão dos EUA
 * (horaDoFechamento). Até 31/10/2026 o fechamento estava fixo em 17h, e de
 * 03/11 em diante a home diria "fechada" das 17h às 18h com a bolsa aberta.
 */
const ABRE = 10 * 60

export type EstadoDaBolsa = 'aberta' | 'antes' | 'fechada'

export interface MomentoDaBolsa {
  estado: EstadoDaBolsa
  /** a frase curta do app: "Bolsa aberta", "A bolsa abre às 10h", "Bolsa fechada" */
  rotulo: string
  /** o número do dia já é de hoje (pregão hoje e passou das 10h) */
  numerosDeHoje: boolean
}

/** Ano, mês, dia, hora e minuto no relógio de São Paulo. */
function relogioSP(now: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: 'numeric', minute: '2-digit', hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  ) as Record<string, string>
  return {
    ano: Number(p.year),
    iso: `${p.year}-${p.month}-${p.day}`,
    semana: new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day))).getUTCDay(),
    minutos: (Number(p.hour) % 24) * 60 + Number(p.minute),
  }
}

/** Tem pregão neste dia? Fim de semana nunca; feriado da B3 só onde há calendário. */
export function temPregao(iso: string, semana: number): boolean {
  if (semana === 0 || semana === 6) return false
  return !SEM_PREGAO_B3.has(iso)
}

/**
 * Em que pé está a bolsa agora. Antes das 10h de um dia de pregão o número que
 * existe é o do fechamento anterior (numerosDeHoje = false); depois das 17h, o
 * de hoje, já fechado.
 */
export function momentoDaBolsa(now = new Date()): MomentoDaBolsa {
  const r = relogioSP(now)
  if (!temPregao(r.iso, r.semana)) return { estado: 'fechada', rotulo: 'Bolsa fechada', numerosDeHoje: false }
  if (r.minutos < ABRE) return { estado: 'antes', rotulo: 'A bolsa abre às 10h', numerosDeHoje: false }
  if (r.minutos < horaDoFechamento(r.iso) * 60) return { estado: 'aberta', rotulo: 'Bolsa aberta', numerosDeHoje: true }
  return { estado: 'fechada', rotulo: 'Bolsa fechada', numerosDeHoje: true }
}
