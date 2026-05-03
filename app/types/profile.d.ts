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
}
