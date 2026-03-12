import type { Brand } from '~/config/brand'

export interface ITenant {
  id: number
  slug: string
  name: string
  domain: string | null
  config: Brand
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ITenantListItem {
  id: number
  slug: string
  name: string
  domain: string | null
  is_active: boolean
  created_at: string
}

export interface ITenantPayload {
  slug: string
  name: string
  domain?: string | null
  config: Partial<Brand>
  is_active?: boolean
}
