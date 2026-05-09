export interface IProfile {
  id: string
  name: string
  email: string
  /**
   * Celular E.164 (`+5511999999999`). Opcional porque o usuario pode
   * cadastrar depois (em /settings ou via PhoneGateModal). null quando
   * o backend retorna sem o campo (compat) ou quando o user nao
   * cadastrou ainda.
   */
  celular?: string | null
  role?: 'investor' | 'advisor' | 'admin'
  approval_status?: 'pending' | 'approved' | 'rejected' | null
  advisor_code?: string | null
  advisor_id?: number | null
  advisor?: { id: number; name: string } | null
  /**
   * Tenant ao qual o user pertence (id da tabela tenants). Populado
   * pelo backend desde a migration 2026_05_09_140000. Null em casos
   * legados ou superadmin "cross-tenant".
   */
  tenant_id?: number | null
  /**
   * Slug do tenant pra exibicao na UI ("primo-rico", "redentia", etc).
   * Backend popula via tenant relationship eager-loaded. Util pra
   * mostrar badge "ADMIN PRIMO RICO" no admin layout.
   */
  tenant_slug?: string | null
  tenant_name?: string | null
  /**
   * Superadmin: cross-tenant access. Pode criar/deletar tenants,
   * ver dados de qualquer tenant, etc. Apenas o user andre.victor29
   * tem true por padrao (set via migration).
   */
  is_super_admin?: boolean
}
