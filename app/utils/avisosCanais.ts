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

export type TopicoCarteira =
  | 'carteira_semana'
  | 'carteira_proventos_mes'
  | 'carteira_provento_pago'
  | 'carteira_relatorio'
  | 'carteira_imposto'
  | 'carteira_ideias'

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
  { id: 'carteira_imposto', nome: 'Imposto do mês', quando: 'Quando o mês pede', exemplo: 'Você já vendeu R$ 18,7 mil em ações em novembro. Mais R$ 1.300 e paga imposto.' },
  { id: 'carteira_ideias', nome: 'Ideias para a carteira', quando: 'Quando o motor acha uma', exemplo: 'Numa simulação, trocar parte das ações por um FII que você já tem leva o seu DY de 4,8% para 5,6%.' },
]

const PAGO = new Set(['proventos.pago', 'proventos.caiu', 'proventos.recebido'])

/**
 * O tópico de cada detector:
 *  - imposto.* → carteira_imposto
 *  - proventos.pago (o "caiu na conta") → carteira_provento_pago; os outros proventos.* → carteira_proventos_mes
 *  - semana.* e quedas.* → carteira_semana
 *  - movimento.* e ideias.* (a recomendação, avisos 13–21) → carteira_ideias
 *  - relatorio.* → carteira_relatorio
 *  - o resto (conexão, renda, fatores) só aparece na tela: null
 */
export function topicoDoDetector(detector: string): TopicoCarteira | null {
  const raiz = detector.split('.')[0] ?? ''
  if (raiz === 'imposto') return 'carteira_imposto'
  if (raiz === 'proventos') return PAGO.has(detector) ? 'carteira_provento_pago' : 'carteira_proventos_mes'
  if (raiz === 'semana' || raiz === 'quedas') return 'carteira_semana'
  if (raiz === 'movimento' || raiz === 'movimentos' || raiz === 'ideia' || raiz === 'ideias') return 'carteira_ideias'
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
