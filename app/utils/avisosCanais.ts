/**
 * Onde a pessoa escolhe o que recebe da carteira (07/11/2026; plano, Parte
 * 4.8): os tópicos novos de `NotificationPreferenceController::TOPICS`, com o
 * exemplo de cada mensagem, e o tópico de cada detector do motor. O pé do
 * modal de avisos e o bloco "Avisos da carteira" de /conta gravam no mesmo
 * `PUT /me/notification-preferences`. Puro, com teste
 * (tests/carteira-imposto.test.ts).
 *
 * Os exemplos seguem a regra da CVM da variante `site`: fato com número,
 * nunca "compre", "venda" ou "recomendamos", e o movimento só pela classe.
 */
import type { Aviso } from '~/types/carteiraVisao'

/**
 * Só os tópicos que um comando de fato envia (carteira:semana,
 * carteira:proventos-mes, carteira:provento-pago, carteira:relatorio-mensal).
 * Imposto e ideias aparecem só na tela: oferecer e-mail ou WhatsApp para eles
 * seria uma preferência que não faz nada (saíram em 07/11/2026).
 */
export type TopicoCarteira =
  | 'carteira_semana'
  | 'carteira_proventos_mes'
  | 'carteira_provento_pago'
  | 'carteira_relatorio'

export interface TopicoInfo {
  id: TopicoCarteira
  nome: string
  /** quando sai */
  quando: string
  exemplo: string
}

export const TOPICOS_CARTEIRA: TopicoInfo[] = [
  { id: 'carteira_semana', nome: 'A semana da carteira', quando: 'Sábado de manhã', exemplo: 'Sua carteira caiu 1,8% na semana. A PETR4 segurou, com alta de 3,2%.' },
  { id: 'carteira_proventos_mes', nome: 'Proventos do mês', quando: 'Dia 1', exemplo: 'Em dezembro estão marcados R$ 1.096 de 8 ativos. R$ 301 já confirmados.' },
  { id: 'carteira_provento_pago', nome: 'Provento na conta', quando: 'No dia do pagamento', exemplo: 'Caíram R$ 196 de GARE11 na sua conta hoje.' },
  { id: 'carteira_relatorio', nome: 'Relatório do mês', quando: 'Uma vez por mês', exemplo: 'O relatório de novembro saiu: a carteira tirou 64 de 100.' },
]

const PAGO = new Set(['proventos.pago', 'proventos.caiu', 'proventos.recebido'])

/**
 * O tópico de cada detector:
 *  - proventos.pago (o "caiu na conta") → carteira_provento_pago; os outros proventos.* → carteira_proventos_mes
 *  - semana.* e quedas.* → carteira_semana
 *  - relatorio.* → carteira_relatorio
 *  - o resto (imposto, ideias e movimentos, conexão, renda, fatores) só aparece na tela: null
 */
export function topicoDoDetector(detector: string): TopicoCarteira | null {
  const raiz = detector.split('.')[0] ?? ''
  if (raiz === 'proventos') return PAGO.has(detector) ? 'carteira_provento_pago' : 'carteira_proventos_mes'
  if (raiz === 'semana' || raiz === 'quedas') return 'carteira_semana'
  if (raiz === 'relatorio') return 'carteira_relatorio'
  return null
}

/** os tópicos dos avisos de agora, sem repetir, na ordem do catálogo */
export function topicosDosAvisos(avisos: Pick<Aviso, 'detector'>[]): TopicoInfo[] {
  const tem = new Set(avisos.map((a) => topicoDoDetector(a.detector)).filter(Boolean))
  return TOPICOS_CARTEIRA.filter((t) => tem.has(t.id))
}

/** quem tem `whatsapp_opt_in_at` no /auth/me deu o aceite do WhatsApp (checkout, 01/11/2026) */
export function temOptInWhatsapp(user: Record<string, unknown> | null | undefined): boolean {
  return typeof user?.whatsapp_opt_in_at === 'string' && user.whatsapp_opt_in_at.length > 0
}
