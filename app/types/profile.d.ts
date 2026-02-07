export interface IProfile {
  id: string
  name: string
  email: string
  role?: 'investor' | 'advisor'
  approval_status?: 'pending' | 'approved' | 'rejected' | null
  advisor_code?: string | null
  advisor_id?: number | null
  advisor?: { id: number; name: string } | null
}
