/**
 * Admin: platform user record. Mirrors the columns the Laravel
 * `Api/Admin/UserController` returns (with `password` and
 * `remember_token` already filtered out by the User model's
 * `$hidden` array).
 *
 * Keep `UserRole` in sync with the migration that adds the
 * `role` column (defaults to 'investor', extends to 'admin' /
 * 'advisor'). If a future migration adds a fourth role, both
 * the union here and the badge color map in the listing page
 * need an entry.
 */
export type UserRole = 'admin' | 'advisor' | 'investor'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface IAdminUser {
  id: number
  name: string
  login: string | null
  email: string
  celular: string | null
  role: UserRole
  advisor_code: string | null
  advisor_id: number | null
  /** Eager-loaded by the controller (advisor relation). */
  advisor: {
    id: number
    name: string
    advisor_code: string | null
  } | null
  approval_status: ApprovalStatus | null
  /** ID do tenant ao qual o user pertence. Adicionado pela migration
   *  2026_05_09_140000. Antes disso era impossivel saber. */
  tenant_id: number | null
  /** Eager-loaded pelo controller. Mostra slug+name no UI da tabela. */
  tenant: {
    id: number
    slug: string
    name: string
  } | null
  /** Superadmin pode manipular tenants e ver dados cross-tenant. */
  is_super_admin?: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
  /** Surfaced by `UserController@index` via EXISTS subqueries —
   *  true if the user has at least one row in portfolio_positions. */
  has_portfolio?: boolean
  /** True if the user has an entry in portfolio_analyses (raio-x). */
  has_xray?: boolean
  /** Soma do valor de mercado de todas as posições do usuário,
   *  em BRL. Vem como number (cast no controller). 0 quando o
   *  usuário não tem posições ou nenhuma tem preço atual. */
  portfolio_value?: number
}

export interface IUserStats {
  total: number
  last_7d: number
  pendingApproval: number
  /** role -> count map. Roles with zero users are absent. */
  byRole: Partial<Record<UserRole, number>>
  /** AUM (Assets Under Management) — soma de TODOS os portfolios
   *  da plataforma em BRL. Já cast como number no backend. */
  aum?: number
  /** Quantidade de users com pelo menos uma posição valendo > 0.
   *  Diferente do total: filtra quem tem ações zeradas/sem preço. */
  usersWithValue?: number
}
