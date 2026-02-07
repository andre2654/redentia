import type { IProfile } from '~/types/profile'

export interface AdvisorMeResponse {
  advisor: IProfile
  advisor_code: string
}

export interface InvestorsResponse {
  investors: (IProfile & { last_contact_at?: string | null })[]
}

export interface InvestorProfileResponse {
  profile: {
    id: number
    user_id: number
    advisor_id: number
    risk_tolerance: string | null
    objectives: string | null
    life_events: string[] | null
  }
}

export interface AdvisorNotesResponse {
  notes: { id: number; content: string; created_at: string }[]
}

export interface InvestorAdvisorResponse {
  approval_status: 'pending' | 'approved' | 'rejected' | null
  advisor: IProfile | null
}

export const useAdvisorService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  async function me(): Promise<AdvisorMeResponse> {
    return authFetch(`${baseURL}/advisor/me`, { method: 'GET' }) as Promise<AdvisorMeResponse>
  }

  async function getInvestors(status?: 'pending' | 'approved' | 'rejected'): Promise<InvestorsResponse> {
    const q = status ? `?status=${status}` : ''
    return authFetch(`${baseURL}/advisor/investors${q}`, { method: 'GET' }) as Promise<InvestorsResponse>
  }

  async function approveInvestor(id: number): Promise<{ message: string; investor: IProfile }> {
    return authFetch(`${baseURL}/advisor/investors/${id}/approve`, { method: 'POST' }) as Promise<{ message: string; investor: IProfile }>
  }

  async function rejectInvestor(id: number): Promise<{ message: string; investor: IProfile }> {
    return authFetch(`${baseURL}/advisor/investors/${id}/reject`, { method: 'POST' }) as Promise<{ message: string; investor: IProfile }>
  }

  async function getInvestorProfile(id: number): Promise<InvestorProfileResponse> {
    return authFetch(`${baseURL}/advisor/investors/${id}/profile`, { method: 'GET' }) as Promise<InvestorProfileResponse>
  }

  async function updateInvestorProfile(id: number, body: { risk_tolerance?: string; objectives?: string; life_events?: string[] }): Promise<InvestorProfileResponse> {
    return authFetch(`${baseURL}/advisor/investors/${id}/profile`, { method: 'PUT', body }) as Promise<InvestorProfileResponse>
  }

  async function getInvestorNotes(id: number): Promise<AdvisorNotesResponse> {
    return authFetch(`${baseURL}/advisor/investors/${id}/notes`, { method: 'GET' }) as Promise<AdvisorNotesResponse>
  }

  async function storeInvestorNote(id: number, content: string): Promise<{ note: { id: number; content: string; created_at: string } }> {
    return authFetch(`${baseURL}/advisor/investors/${id}/notes`, { method: 'POST', body: { content } }) as Promise<{ note: { id: number; content: string; created_at: string } }>
  }

  async function getInvestorPortfolio(id: number): Promise<{ positions: Array<{ ticker: string; quantity: number; average_price: number }> }> {
    return authFetch(`${baseURL}/advisor/investors/${id}/portfolio`, { method: 'GET' }) as Promise<{ positions: Array<{ ticker: string; quantity: number; average_price: number }> }>
  }

  async function suggestMessage(investorId: number): Promise<{ suggested_message: string }> {
    const authStore = useAuthStore()
    const token = authStore.token
    if (!token) throw new Error('Não autenticado')
    return $fetch<{ suggested_message: string }>('/api/advisor/suggest-message', {
      method: 'POST',
      body: { investorId },
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  return { me, getInvestors, approveInvestor, rejectInvestor, getInvestorProfile, updateInvestorProfile, getInvestorNotes, storeInvestorNote, getInvestorPortfolio, suggestMessage }
}

export interface AttachAdvisorResponse {
  message: string
  user: IProfile
}

export const useInvestorService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  async function getAdvisor(): Promise<InvestorAdvisorResponse> {
    return authFetch(`${baseURL}/investor/advisor`, { method: 'GET' }) as Promise<InvestorAdvisorResponse>
  }

  async function attachAdvisor(advisorCode: string): Promise<AttachAdvisorResponse> {
    return authFetch(`${baseURL}/investor/attach-advisor`, {
      method: 'POST',
      body: { advisor_code: advisorCode.trim() },
    }) as Promise<AttachAdvisorResponse>
  }

  return { getAdvisor, attachAdvisor }
}
