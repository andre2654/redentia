// Phase 1: brand.ts foi morto. Tipos do tenant viram any nas partes
// que dependem do BrandConfig — refatoracao do admin de tenants vai
// trazer tipos novos baseados nas colunas tipadas do banco.
//
// Por enquanto: shape genérico que aceita qualquer JSON como `config`.
// Admin Tenant Editor vai ser refeito na Fase 3 com schema próprio.

export interface ITenant {
  id: number
  slug: string
  name: string
  short_name?: string | null
  domain: string | null
  // Campos tipados do backend (Phase 1)
  primary_color?: string | null
  text_color?: string | null
  background_color?: string | null
  font_family?: string | null
  logo_full_url?: string | null
  logo_icon_url?: string | null
  logo_email_url?: string | null
  favicon_url?: string | null
  og_image_url?: string | null
  support_email?: string | null
  support_whatsapp?: string | null
  legal_name?: string | null
  cnpj?: string | null
  address?: string | null
  billing_enabled?: boolean
  billing_currency?: string
  is_master?: boolean
  // JSONB extras (features, variants, copy especifica)
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ITenantListItem {
  id: number
  slug: string
  name: string
  domain: string | null
  primary_color?: string | null
  is_active: boolean
  is_master?: boolean
  created_at: string
}

export interface ITenantPayload {
  slug?: string
  name?: string
  short_name?: string | null
  domain?: string | null
  primary_color?: string
  text_color?: string | null
  background_color?: string | null
  font_family?: string | null
  logo_full_url?: string | null
  logo_icon_url?: string | null
  logo_email_url?: string | null
  favicon_url?: string | null
  og_image_url?: string | null
  support_email?: string | null
  support_whatsapp?: string | null
  legal_name?: string | null
  cnpj?: string | null
  address?: string | null
  billing_enabled?: boolean
  billing_currency?: string
  config?: Record<string, any>
  is_active?: boolean
}
