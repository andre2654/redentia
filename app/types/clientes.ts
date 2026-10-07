/**
 * Clientes do escritório — contratos da API (SPEC "Cenários e projeções +
 * Clientes do escritório", Contrato C, 07/10/2026).
 *
 * Duas famílias de rota:
 *  - PÚBLICAS, do cliente final (sem login, por token na URL):
 *      C5 GET  /business/client-invites/{token}
 *      C6 POST /business/client-invites/{token}/consent
 *      C7 GET  /business/client-access/{manage_token}
 *      C8 POST /business/client-access/{manage_token}/revoke
 *  - DO DONO da conta de escritório (auth:sanctum), em /me/business/clients*.
 *
 * Regra de identidade: o id que sai é o `public_id` (ULID) do servidor; nenhum
 * id interno de cliente. Regra de negócio responde 409/422, nunca 401/403
 * (o authFetch desloga em 401/403).
 *
 * Os campos marcados "tolerado" não estão no contrato escrito e são lidos só
 * se vierem: o backend é construído em paralelo, e a tela não pode quebrar
 * se o nome do campo do painel do dono divergir. Faltando, o elemento some.
 */

/** Modo do recurso na conta (só muda por console no servidor). */
export type ClientsMode = 'off' | 'demo' | 'pluggy'

export type ClientStatus = 'pending' | 'active' | 'revoked' | 'expired'

/** Escopo do consentimento. v1: só posições de investimento. */
export type ClientScope = 'posicoes_investimento' | string

/** C5 — o convite como o cliente final o vê. */
export interface ClientInviteInfo {
  valid: boolean
  reason?: string | null
  office: { name: string } | null
  advisor_label: string | null
  client_name: string | null
  mode: ClientsMode
  expires_at: string | null
  terms_version: string
  terms_text: string
  /** sha256 do termo mostrado: volta no C6 para provar que o aceito é o lido */
  terms_sha256?: string
  scope: ClientScope[]
}

/** C6 — resposta do consentimento (modo demo). */
export interface ClientConsentResult {
  status: 'connected' | string
  demo: boolean
  manage_url: string
}

export interface ClientLogEntry {
  action: string
  actor: string
  at: string
  /** tolerado: rótulo da chave que agiu, quando o servidor mandar */
  key_label?: string | null
  /** painel do dono: a chave que agiu, como o servidor manda (null quando não foi chave) */
  key?: { id: number, label: string } | null
}

/** C7 — a página de gestão do cliente final. */
export interface ClientAccessInfo {
  status: ClientStatus | string
  /** o contrato escreve só `office`; aceita string ou {name} */
  office: { name: string } | string | null
  advisor_label: string | null
  scope: ClientScope[]
  since: string | null
  until: string | null
  /** quando o acesso foi revogado (null enquanto ativo) */
  revoked_at?: string | null
  demo: boolean
  log: ClientLogEntry[]
}

/** Painel do dono — uma linha da lista de clientes. */
export interface BusinessClientRow {
  id: string
  name: string
  status: ClientStatus | string
  source: 'demonstracao' | 'open_finance' | null
  connected_at: string | null
  consent_expires_at: string | null
  shared_with_office?: boolean
  /** chave responsável: objeto ou par id/rótulo (tolerado) */
  assigned_key?: { id: number, label: string } | null
  assigned_key_id?: number | null
  assigned_key_label?: string | null
  /** tolerado: última leitura (carteira ou simulação) e por qual chave */
  last_read_at?: string | null
  last_read_key_label?: string | null
  /** quando foi revogado (pelo cliente, pelo escritório ou pela operação) */
  revoked_at?: string | null
  /** como o servidor manda a chave da última leitura */
  last_read_by?: { id: number, label: string } | null
  /** tolerado: convite pendente (sem o token, que só existiu na criação) */
  pending_invite?: { id: number | string, expires_at: string | null } | null
  created_at?: string | null
}

export interface BusinessClientsList {
  mode?: ClientsMode
  max_clients?: number
  /** vagas livres no teto (pendentes + ativos ocupam; revogado e vencido liberam) */
  remaining_clients?: number
  clients: BusinessClientRow[]
}

/** POST /me/business/clients e POST /me/business/clients/{id}/invites. */
export interface BusinessClientInviteCreated {
  client?: { id: string, name: string, status: string }
  invite?: { url: string, expires_at: string | null }
  /** tolerado: lista inteira de volta, como as rotas de chave fazem */
  clients?: BusinessClientRow[]
}
