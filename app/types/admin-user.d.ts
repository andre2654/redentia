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
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface IUserStats {
  total: number
  last_7d: number
  pendingApproval: number
  /** role -> count map. Roles with zero users are absent. */
  byRole: Partial<Record<UserRole, number>>
}
