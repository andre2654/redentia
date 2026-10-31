/**
 * O calendário e o relógio da B3, num lugar só (31/10/2026).
 *
 * O calendário de dias sem pregão nasceu no useSeguirGancho (o resumo das 19h)
 * e mudou para cá quando a home passou a dizer, como o app, se a bolsa está
 * aberta ("Bolsa aberta", "A bolsa abre às 10h", "Bolsa fechada").
 *
 * Dias úteis SEM pregão na B3 em 2026 — Quadro A do Ofício Circular
 * 003/2026-VNC, de 08/01/2026 (errata que revogou o 054/2025-VNC), o
 * calendário OFICIAL:
 * https://www.b3.com.br/data/files/FC/55/3B/12/7FE9B9109B5E99B9AC094EA8/OC%20003-2026-VNC%20ERRATA_CALENDARIO%20DE%20FERIADOS%20EM%202026%20E%20FUNCIONAMENTO%20DA%20B3%20EM%2018022026%20QUARTAFEIRA%20DE%20CINZAS_PT.pdf
 * (o mesmo quadro está em https://www.b3.com.br/pt_br/solucoes/plataformas/puma-trading-system/para-participantes-e-traders/calendario-de-negociacao/feriados/).
 * Entram 24/12 e 31/12, que são "sem sessão de negociação". Ficam de fora os
 * feriados só de São Paulo (Quadro B: a B3 funciona normalmente) e a
 * Quarta-feira de Cinzas, que tem pregão à tarde.
 *
 * 2027: a B3 ainda NÃO publicou o calendário (conferido em 29/09/2026; o de
 * 2026 saiu em 04/12/2025). Quando sair, some o ano em ANOS_COM_CALENDARIO_B3
 * e as datas aqui. Fora do calendário publicado, quem pergunta "tem pregão
 * hoje?" recebe só a regra do fim de semana (dia útil conta como pregão).
 */
export const SEM_PREGAO_B3 = new Set([
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21', '2026-05-01', '2026-06-04',
  '2026-09-07', '2026-10-12', '2026-11-02', '2026-11-20', '2026-12-24', '2026-12-25', '2026-12-31',
])
export const ANOS_COM_CALENDARIO_B3 = new Set([2026])

/** Pregão regular da B3, em minutos do dia no fuso de São Paulo (10h às 17h). */
const ABRE = 10 * 60
const FECHA = 17 * 60

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
  if (r.minutos < FECHA) return { estado: 'aberta', rotulo: 'Bolsa aberta', numerosDeHoje: true }
  return { estado: 'fechada', rotulo: 'Bolsa fechada', numerosDeHoje: true }
}
