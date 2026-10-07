/**
 * Clientes do escritório — rótulos em português para o que o servidor manda
 * em slug (status, escopo, ação e autor do registro de acesso). Usado pelo
 * painel do dono (/business/clientes) e pelas páginas do cliente final
 * (/cliente/convite e /cliente/acesso), para os três lugares dizerem a mesma
 * coisa sobre o mesmo evento.
 *
 * Slug desconhecido NÃO some e NÃO vira texto inventado: passa como veio,
 * legível o bastante para alguém perguntar o que é.
 */
import type { ClientScope } from '~/types/clientes'

export const CLIENT_STATUS_LABEL: Record<string, string> = {
  pending: 'Aguardando consentimento',
  active: 'Ativo',
  revoked: 'Revogado',
  expired: 'Vencido',
}

export function clientStatusLabel(s: string | null | undefined): string {
  if (!s) return ''
  return CLIENT_STATUS_LABEL[s] ?? s
}

/** O que o cliente autoriza, em linguagem de gente. */
export const CLIENT_SCOPE_LABEL: Record<string, string> = {
  posicoes_investimento: 'Posições de investimento: quais ativos, a quantidade, o preço médio e o valor. Sem saldo de conta, cartão ou movimentação.',
}

export function clientScopeLabel(s: ClientScope): string {
  return CLIENT_SCOPE_LABEL[s] ?? s
}

const ACTION_LABEL: Record<string, string> = {
  invite_created: 'Convite criado',
  invite_opened: 'Convite aberto',
  invite_cancelled: 'Convite cancelado',
  consent_granted: 'Consentimento dado',
  connection_added: 'Conexão criada',
  portfolio_read: 'Carteira consultada',
  simulation_run: 'Simulação rodada sobre a carteira',
  reassigned: 'Responsável trocado',
  shared: 'Compartilhado com o escritório',
  unshared: 'Deixou de ser compartilhado',
  revoked: 'Acesso revogado',
  purged: 'Dados apagados',
  expired: 'Consentimento venceu',
}

/** Na demonstração, "conexão" é a carteira fictícia: o rótulo diz isso. */
const ACTION_LABEL_DEMO: Record<string, string> = {
  connection_added: 'Carteira de demonstração gerada',
  portfolio_read: 'Carteira de demonstração consultada',
  simulation_run: 'Simulação rodada sobre a carteira de demonstração',
}

export function clientActionLabel(action: string, demo = false): string {
  if (demo && ACTION_LABEL_DEMO[action]) return ACTION_LABEL_DEMO[action]
  return ACTION_LABEL[action] ?? action
}

const ACTOR_LABEL: Record<string, string> = {
  key: 'pelo assistente de IA do escritório',
  owner: 'pelo escritório, no painel',
  client: 'pelo cliente',
  ops: 'pela Redentia',
  system: 'automaticamente',
}

/**
 * Autor do evento. Na página do PRÓPRIO cliente, `client` vira "por você".
 */
export function clientActorLabel(actor: string, paraOCliente = false): string {
  if (actor === 'client' && paraOCliente) return 'por você'
  return ACTOR_LABEL[actor] ?? actor
}

/** '07/10/2026' — data curta, fuso de São Paulo; vazio se não houver data. */
export function dataCurta(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** '07/10/2026, 14:32' — para o registro de acesso. */
export function dataHora(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/** Token de convite e de gestão: 48 hex. Conferido antes de ir ao servidor. */
export const CLIENT_TOKEN_RE = /^[a-f0-9]{48}$/
