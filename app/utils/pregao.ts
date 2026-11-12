/**
 * O calendário e o relógio do pregão da B3, numa fonte só.
 *
 * O calendário saiu do useSeguirGancho (31/10/2026) quando a /carteira passou a
 * dizer "Bolsa aberta", "Bolsa fechada" e "A bolsa abre às 10h" no topo, como o
 * Agora dos apps. Quem conta o próximo resumo (useSeguirGancho) e quem diz o
 * estado do pregão (a carteira) leem o mesmo conjunto de datas.
 *
 * Sem import de valor de propósito: os testes (node --test) importam direto.
 */

/**
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
 * 2026 saiu em 04/12/2025). Quando sair, some o ano em ANOS_COM_CALENDARIO e
 * as datas aqui. Até lá, qualquer conta que atravesse um ano sem calendário
 * responde "no próximo pregão, às 19h" em vez de chutar o dia.
 */
export const FERIADOS_B3: Readonly<Record<string, string>> = {
  '2026-01-01': 'Confraternização Universal',
  '2026-02-16': 'Carnaval',
  '2026-02-17': 'Carnaval',
  '2026-04-03': 'Sexta-feira Santa',
  '2026-04-21': 'Tiradentes',
  '2026-05-01': 'Dia do Trabalho',
  '2026-06-04': 'Corpus Christi',
  '2026-09-07': 'Independência',
  '2026-10-12': 'Nossa Senhora Aparecida',
  '2026-11-02': 'Finados',
  '2026-11-20': 'Consciência Negra',
  '2026-12-24': 'Véspera de Natal',
  '2026-12-25': 'Natal',
  '2026-12-31': 'Último dia do ano',
}
export const SEM_PREGAO_B3 = new Set(Object.keys(FERIADOS_B3))
export const ANOS_COM_CALENDARIO = new Set([2026])

const DIA_DA_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const

/** Data e hora de São Paulo, em partes ('2026-10-31', 14, 5, dia da semana 0-6). */
export function agoraEmSP(now = new Date()): { iso: string; hora: number; minuto: number; semana: number } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: 'numeric', minute: '2-digit', hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  ) as Record<string, string>
  const iso = `${p.year}-${p.month}-${p.day}`
  return {
    iso,
    hora: Number(p.hour) % 24,
    minuto: Number(p.minute),
    semana: new Date(`${iso}T12:00:00Z`).getUTCDay(),
  }
}

/** Dia sem pregão: fim de semana ou feriado da B3. */
export function semPregao(iso: string): boolean {
  const semana = new Date(`${iso}T12:00:00Z`).getUTCDay()
  return semana === 0 || semana === 6 || SEM_PREGAO_B3.has(iso)
}

/**
 * O pregão seguinte a um dia ('2026-10-30' → '2026-11-03', porque 02/11 é
 * Finados). null quando o caminho atravessa um ano sem o calendário da B3:
 * aí quem chama diz "no próximo pregão" em vez de chutar o dia.
 */
export function proximoPregao(iso: string): string | null {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`)
  for (let i = 0; i < 15; i++) {
    d.setUTCDate(d.getUTCDate() + 1)
    const dia = d.toISOString().slice(0, 10)
    if (!ANOS_COM_CALENDARIO.has(Number(dia.slice(0, 4)))) return null
    if (!semPregao(dia)) return dia
  }
  return null
}

/**
 * O pregão anterior a um dia ('2026-11-03' → '2026-10-30', porque 02/11 é
 * Finados). null quando o caminho atravessa um ano sem o calendário da B3.
 */
export function pregaoAnterior(iso: string): string | null {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`)
  for (let i = 0; i < 15; i++) {
    d.setUTCDate(d.getUTCDate() - 1)
    const dia = d.toISOString().slice(0, 10)
    if (!ANOS_COM_CALENDARIO.has(Number(dia.slice(0, 4)))) return null
    if (!semPregao(dia)) return dia
  }
  return null
}

/**
 * Hora do fechamento. A B3 fecha às 17h enquanto os EUA estão no horário de
 * verão (do 2º domingo de março ao 1º domingo de novembro) e às 18h no resto
 * do ano, porque acompanha a abertura de Nova York.
 */
export function horaDoFechamento(iso: string): number {
  const ano = Number(iso.slice(0, 4))
  const domingo = (mes: number, n: number) => {
    const primeiro = new Date(Date.UTC(ano, mes, 1)).getUTCDay()
    return 1 + ((7 - primeiro) % 7) + (n - 1) * 7
  }
  const inicio = `${ano}-03-${String(domingo(2, 2)).padStart(2, '0')}`
  const fim = `${ano}-11-${String(domingo(10, 1)).padStart(2, '0')}`
  return iso >= inicio && iso < fim ? 17 : 18
}

export type EstadoDoPregao = 'aberta' | 'fechada' | 'antes' | 'sem-pregao'

/**
 * O estado do pregão agora, como o topo do Agora diz: "Bolsa aberta" entre as
 * 10h e o fechamento, "A bolsa abre às 10h" antes, "Bolsa fechada" depois e
 * "Bolsa fechada · sábado" em dia sem pregão.
 */
export function estadoDoPregao(now = new Date()): { estado: EstadoDoPregao; rotulo: string } {
  const { iso, hora, semana } = agoraEmSP(now)
  if (semPregao(iso)) {
    const dia = semana === 0 || semana === 6 ? DIA_DA_SEMANA[semana] : 'feriado'
    return { estado: 'sem-pregao', rotulo: `Bolsa fechada · ${dia}` }
  }
  if (hora < 10) return { estado: 'antes', rotulo: 'A bolsa abre às 10h' }
  if (hora < horaDoFechamento(iso)) return { estado: 'aberta', rotulo: 'Bolsa aberta' }
  return { estado: 'fechada', rotulo: 'Bolsa fechada' }
}

/**
 * Quando foi o pregão de uma data, falado a partir de hoje em São Paulo:
 * 'hoje', 'ontem', 'na sexta' (até 6 dias) ou 'em 28/10'. Data inválida → null.
 */
export function quandoFoi(dataIso: string | null | undefined, now = new Date()): string | null {
  if (!dataIso || !/^\d{4}-\d{2}-\d{2}/.test(dataIso)) return null
  const d = dataIso.slice(0, 10)
  const hoje = agoraEmSP(now).iso
  const dias = Math.round((Date.parse(`${hoje}T12:00:00Z`) - Date.parse(`${d}T12:00:00Z`)) / 86_400_000)
  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias < 7) {
    const semana = new Date(`${d}T12:00:00Z`).getUTCDay()
    return semana === 6 || semana === 0 ? `no ${DIA_DA_SEMANA[semana]}` : `na ${DIA_DA_SEMANA[semana]}`
  }
  return `em ${d.slice(8, 10)}/${d.slice(5, 7)}`
}

/** Um instante do relógio de São Paulo (UTC−3: o Brasil não tem horário de verão desde 2019), em ms. */
function emSP(iso: string, hora: number): number {
  return Date.parse(`${iso.slice(0, 10)}T${String(hora).padStart(2, '0')}:00:00-03:00`)
}

/**
 * Até a próxima abertura (a contagem da régua do topo, 12/11/2026): o dia da
 * próxima abertura, a hora dela (10h de São Paulo) e o fechamento de antes,
 * em ms. Antes das 10h de um dia de pregão é a de hoje; depois do fechamento,
 * no fim de semana e no feriado, a do próximo pregão (Finados na segunda: a de
 * terça). null com a bolsa aberta e quando o próximo pregão cai num ano que a
 * B3 ainda não publicou: aí não há o que contar.
 */
export function janelaDaAbertura(now = new Date()): { dia: string; abreEm: number; fechouEm: number | null } | null {
  const { estado } = estadoDoPregao(now)
  if (estado === 'aberta') return null
  const hoje = agoraEmSP(now).iso
  const dia = estado === 'antes' ? hoje : proximoPregao(hoje)
  if (!dia) return null
  const antes = estado === 'fechada' ? hoje : pregaoAnterior(dia)
  return { dia, abreEm: emSP(dia, 10), fechouEm: antes ? emSP(antes, horaDoFechamento(antes)) : null }
}

/** Os momentos da bolsa que o dev força na régua. */
export type MomentoDoDev = 'pre' | 'aberta' | 'fechada' | 'feriado'

/**
 * Só para o dev (o ?regua-estado= da régua e a vitrine /dev/regua): o relógio
 * de um momento da bolsa. 9h, 14h ou 19h do pregão de hoje (no fim de semana e
 * no feriado, do próximo pregão), ou o meio-dia do próximo feriado da B3 num
 * dia útil. `dataDeHoje`: o dado da régua passa a ser desse dia ("sobe agora",
 * "subiu hoje"); antes da abertura e no feriado, o dado segue o do último pregão.
 * null quando o momento não existe (um feriado fora do calendário).
 */
export function relogioDoDev(modo: string, hoje = agoraEmSP().iso): { agora: Date; dataDeHoje: boolean } | null {
  const dia = semPregao(hoje) ? (proximoPregao(hoje) ?? hoje) : hoje
  const hora = ({ pre: '09:00', aberta: '14:00', fechada: '19:00' } as Record<string, string>)[modo]
  if (hora) return { agora: new Date(`${dia}T${hora}:00-03:00`), dataDeHoje: modo !== 'pre' }
  if (modo === 'feriado') {
    const f = Object.keys(FERIADOS_B3).find((d) => d >= hoje && new Date(`${d}T12:00:00Z`).getUTCDay() % 6 !== 0)
    return f ? { agora: new Date(`${f}T12:00:00-03:00`), dataDeHoje: false } : null
  }
  return null
}
