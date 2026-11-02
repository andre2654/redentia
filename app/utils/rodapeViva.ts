/**
 * O rodapé "Viva" (protótipo de 02/11/2026, direção 3 da banda de assinatura):
 * a página fecha com o pregão numa frase só, grande. "Na sexta, o Ibovespa
 * fechou em 167.921 pontos, −0,75%." O dado é o mesmo da home (a bolsa do
 * dia, server/api/bolsa-do-dia); aqui só viram as palavras.
 *
 * Pura (sem Nuxt), para o teste travar cada momento do relógio da B3: ao vivo,
 * antes de abrir, fechada, fim de semana e feriado. Sem o Ibovespa → null, e a
 * frase some (o título da Redentia fica).
 */
import { agoraEmSP, FERIADOS_B3, horaDoFechamento, proximoPregao, quandoFoi, type EstadoDoPregao } from './pregao.ts'
import type { BolsaDoDia } from './bolsaDoDia.ts'

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const
const ORDINAIS = ['', 'primeira', 'segunda', 'terceira', 'quarta', 'quinta', 'sexta', 'sétima', 'oitava', 'nona', 'décima']

const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const diaDaSemana = (iso: string) => DIAS[new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay()]!
/** '3/11', sem o zero */
const dm = (iso: string) => `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`

export interface FraseDoPregao {
  /** de quando é o número: "Finados, sem pregão · abre terça, 3/11, às 10h" */
  sobrelinha: string
  /** o pregão está andando agora (o ponto pulsa e a frase se atualiza) */
  aoVivo: boolean
  /** "Na sexta, o Ibovespa fechou em" */
  abertura: string
  /** "167.921 pontos" (truncados, como a IA escreve) */
  pontos: string
  /** "−0,75%" */
  variacao: string
  sentido: 'alta' | 'queda' | 'lado'
  /** o que o dia teve de específico: "Quinta queda seguida." (ou null) */
  enredo: string | null
  /** a pergunta que a barra da Redentia recebe: "Por que o Ibovespa caiu na sexta?" */
  pergunta: string
}

function pctComSinal(v: number): string {
  if (Math.abs(v) < 0.005) return '0,00%'
  return `${v > 0 ? '+' : '−'}${nf2.format(Math.abs(v))}%`
}

function horaSP(iso: string | null): string | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  const { hora, minuto } = agoraEmSP(new Date(t))
  return `${hora}h${String(minuto).padStart(2, '0')}`
}

export function fraseDoPregao(d: BolsaDoDia | null | undefined, estado: EstadoDoPregao, agora = new Date()): FraseDoPregao | null {
  const ib = d?.ibov
  if (!ib || !Number.isFinite(ib.pontos) || !Number.isFinite(ib.pct)) return null
  const sp = agoraEmSP(agora)
  const doDia = ib.data === sp.iso
  const aoVivo = estado === 'aberta' && doDia
  const quando = quandoFoi(ib.data, agora) ?? `em ${dm(ib.data)}`
  const sentido: FraseDoPregao['sentido'] = Math.abs(ib.pct) < 0.005 ? 'lado' : ib.pct > 0 ? 'alta' : 'queda'
  const proximo = estado === 'sem-pregao' ? proximoPregao(sp.iso) : null
  const abre = proximo ? `abre ${diaDaSemana(proximo)}, ${dm(proximo)}, às 10h` : 'abre no próximo pregão, às 10h'

  let sobrelinha: string
  if (aoVivo) {
    const hora = horaSP(ib.asOf)
    sobrelinha = hora ? `Bolsa aberta · ${hora}` : 'Bolsa aberta'
  } else if (estado === 'aberta') sobrelinha = 'Bolsa aberta · o último fechamento'
  else if (estado === 'antes') sobrelinha = 'A bolsa abre hoje às 10h'
  else if (estado === 'fechada' && doDia) sobrelinha = `Bolsa fechada · fechou às ${horaDoFechamento(ib.data)}h`
  else if (estado === 'sem-pregao') {
    const fimDeSemana = sp.semana === 0 || sp.semana === 6
    sobrelinha = fimDeSemana ? `Bolsa fechada · ${abre}` : `${FERIADOS_B3[sp.iso] ?? 'Feriado'}, sem pregão · ${abre}`
  } else sobrelinha = 'Bolsa fechada'

  const abertura = aoVivo
    ? 'Agora, o Ibovespa está em'
    : `${maiuscula(quando)}, o Ibovespa fechou em`

  let enredo: string | null = null
  const s = d!.seguidas
  if (!aoVivo && s && s.n >= 3 && s.ate === ib.data) enredo = `${maiuscula(ORDINAIS[s.n] ?? `${s.n}ª`)} ${s.sentido} seguida.`
  else if (Math.abs(ib.pct) < 0.3) enredo = aoVivo ? 'Um dia de lado, até agora.' : 'Um dia de lado.'

  const verbo = aoVivo ? (sentido === 'queda' ? 'cai' : 'sobe') : (sentido === 'queda' ? 'caiu' : 'subiu')
  const pergunta = sentido === 'lado'
    ? `O que mexeu no Ibovespa ${aoVivo ? 'hoje' : quando}?`
    : `Por que o Ibovespa ${verbo} ${aoVivo ? 'hoje' : quando}?`

  return {
    sobrelinha,
    aoVivo,
    abertura,
    pontos: `${nf0.format(Math.trunc(ib.pontos))} pontos`,
    variacao: pctComSinal(ib.pct),
    sentido,
    enredo,
    pergunta,
  }
}
