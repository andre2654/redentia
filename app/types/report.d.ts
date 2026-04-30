/**
 * User-submitted report. Mirrors the `reports` table on the
 * Laravel side. Two enums are mirrored verbatim; if the migration
 * extends them later (e.g. a new status), update both ends.
 */
export type ReportType = 'bug' | 'suggestion' | 'question' | 'other'
export type ReportStatus = 'open' | 'in_progress' | 'resolved' | 'wontfix'
export type ReportPriority = 'low' | 'medium' | 'high'

export interface IReport {
  id: number
  user_id: number | null
  guest_email: string | null
  tenant_slug: string | null
  type: ReportType
  title: string
  description: string
  page_url: string | null
  user_agent: string | null
  viewport: string | null
  status: ReportStatus
  priority: ReportPriority | null
  admin_note: string | null
  metadata: Record<string, unknown> | null
  user: { id: number; name: string; email: string } | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface IReportStats {
  total: number
  open: number
  last_7d: number
  byStatus: Partial<Record<ReportStatus, number>>
  byType: Partial<Record<ReportType, number>>
}

/**
 * Payload accepted by `POST /api/reports`. The frontend modal
 * captures `page_url`, `user_agent`, `viewport` and `tenant_slug`
 * automatically; the user only fills `type`, `title`, `description`,
 * and (when not authenticated) `guest_email`.
 */
export interface IReportPayload {
  type: ReportType
  title: string
  description: string
  page_url?: string
  user_agent?: string
  viewport?: string
  tenant_slug?: string
  guest_email?: string
  metadata?: Record<string, unknown>
}
