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
