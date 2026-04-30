/**
 * Lead capture record. Mirrors `Backend/database/migrations/...create_leads_table.php`.
 *
 * The `source` enum is open-ended at the SQL level (extended via a
 * separate migration to include `ebook`); keep this string union in
 * sync with the constraint, otherwise the type lies and TypeScript
 * stops protecting against typos.
 */
export type LeadSource = 'whitelabel' | 'api' | 'creative' | 'ebook' | 'other'

export interface ILead {
  id: number
  name: string
  email: string
  company: string | null
  phone: string | null
  source: LeadSource
  plan: string | null
  message: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ILeadStats {
  total: number
  last_7d: number
  /** source -> count map. Sources with zero leads are absent. */
  bySource: Partial<Record<LeadSource, number>>
}

export interface IPaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
