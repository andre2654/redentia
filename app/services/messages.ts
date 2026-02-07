export interface ApiMessage {
  id: number
  sender_id: number
  receiver_id: number
  body: string
  read_at: string | null
  created_at: string
  sender?: { id: number; name: string }
  receiver?: { id: number; name: string }
}

export const useMessagesService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  async function getThread(withUserId: number): Promise<{ messages: ApiMessage[] }> {
    return authFetch(`${baseURL}/messages?with_user=${withUserId}`, { method: 'GET' }) as Promise<{ messages: ApiMessage[] }>
  }

  async function send(receiverId: number, body: string): Promise<{ message: ApiMessage }> {
    return authFetch(`${baseURL}/messages`, {
      method: 'POST',
      body: { receiver_id: receiverId, body },
    }) as Promise<{ message: ApiMessage }>
  }

  return { getThread, send }
}
