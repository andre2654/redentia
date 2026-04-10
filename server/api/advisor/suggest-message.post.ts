import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const investorId = body?.investorId ?? body?.investor_id
  if (!investorId) {
    throw createError({ statusCode: 400, message: 'investorId é obrigatório.' })
  }

  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Não autorizado.' })
  }

  const config = useRuntimeConfig()
  const apiBase = (config.public?.apiBaseUrl as string) || ''
  if (!apiBase) {
    throw createError({ statusCode: 500, message: 'API não configurada.' })
  }

  const contextResp = await $fetch<{
    investor_name: string
    profile: { risk_tolerance?: string; objectives?: string; life_events?: string[] } | null
    portfolio_summary: string
  }>(`${apiBase}/advisor/investors/${investorId}/suggest-context`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null)

  if (!contextResp) {
    throw createError({ statusCode: 404, message: 'Contexto do investidor não encontrado.' })
  }

  const anthropicKey = (config as any).anthropicApiKey
  if (!anthropicKey) {
    return {
      suggested_message: `Bom dia ${contextResp.investor_name}, tudo bem? Aqui está um resumo da sua carteira: ${contextResp.portfolio_summary}. Quando quiser, podemos conversar sobre próximos passos.`,
    }
  }

  const client = new Anthropic({ apiKey: anthropicKey, timeout: 15_000 })
  const model =
    (config as any).anthropicAlertModel ||
    (config as any).anthropicChatModel ||
    'claude-haiku-4-5'

  const profileText = contextResp.profile
    ? [
        contextResp.profile.risk_tolerance && `Tolerância a risco: ${contextResp.profile.risk_tolerance}`,
        contextResp.profile.objectives && `Objetivos: ${contextResp.profile.objectives}`,
        contextResp.profile.life_events?.length ? `Eventos de vida: ${contextResp.profile.life_events.join(', ')}` : '',
      ].filter(Boolean).join('\n')
    : 'Sem perfil preenchido.'

  const systemPrompt = `Você é um assessor de investimentos da Redentia. Gere uma mensagem curta e pessoal (1 a 3 parágrafos) para enviar ao investidor. Use o nome dele, mencione algo do perfil se relevante, inclua o resumo da carteira e sugira um próximo passo (ex: aproveitar momento para X ou aumentar caixa). Seja cordial e objetivo. Responda apenas com o texto da mensagem, sem prefixos.`

  const userContent = `Investidor: ${contextResp.investor_name}
Perfil: ${profileText}
Resumo da carteira: ${contextResp.portfolio_summary}

Gere a mensagem sugerida.`

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    })
    const textBlock = response.content.find((b) => b.type === 'text')
    const text =
      textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    return {
      suggested_message:
        text ||
        `Bom dia ${contextResp.investor_name}, tudo bem? ${contextResp.portfolio_summary}.`,
    }
  } catch (e) {
    console.error('Suggest message Claude error:', e)
    return {
      suggested_message: `Bom dia ${contextResp.investor_name}, tudo bem? Aqui está o resumo da sua carteira: ${contextResp.portfolio_summary}. Quando quiser, podemos conversar.`,
    }
  }
})
