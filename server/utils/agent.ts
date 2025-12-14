import OpenAI from 'openai'
import type { H3Event } from 'h3'
import { getMarketData } from './market'
import { formatMarketData } from './formatter'
import {
  calculateCompoundInterest,
  calculatePlanning,
  calculateStockReturn,
} from './calculators'

// Helper to reduce token usage by summarizing large datasets
function sanitizeContext(type: string, rawData: any) {
  if (!rawData) return null

  // Helper to safely get data
  const unwrap = (d: any) => (d && d.data ? d.data : d)

  if (type === 'report') {
    const fund = unwrap(rawData.fundamentals)
    const price = unwrap(rawData.price)
    const chart = unwrap(rawData.chart)
    const divs = unwrap(rawData.dividends)

    // Extract key fundamentals if available (handling different API shapes)
    // We try to grab as many useful metrics as possible without dumping the whole JSON
    const keyStats = fund?.key_statistics || {}
    const financialData = fund?.financial_data || {}

    const fundamentalsSummary = {
      pe: keyStats.forward_pe || fund?.pl || fund?.pe,
      dy: keyStats.dividend_yield || fund?.dy || fund?.dividendYield,
      roe: financialData.return_on_equity || fund?.roe,
      profit_margin: financialData.profit_margins || fund?.margem_liquida,
      market_cap: keyStats.market_cap || fund?.market_cap || price?.market_cap,
      sector: fund?.sector || price?.sector,
      price_to_book: keyStats.price_to_book || fund?.pvp,
    }

    // Summarize chart (don't send 365 points)
    const chartPoints = Array.isArray(chart) ? chart : chart?.data || []
    let chartSummary = 'No chart data'
    if (Array.isArray(chartPoints) && chartPoints.length > 0) {
      const start = chartPoints[0]
      const end = chartPoints[chartPoints.length - 1]
      // Find min/max
      const values = chartPoints.map(
        (p: any) => p.value ?? p.close ?? p.price ?? 0
      )
      const min = Math.min(...values)
      const max = Math.max(...values)
      chartSummary = `Start: ${JSON.stringify(start)}, End: ${JSON.stringify(end)}, Min: ${min}, Max: ${max}, Points: ${chartPoints.length}`
    }

    return {
      price: price,
      fundamentals: fundamentalsSummary,
      chart_summary: chartSummary,
      dividends: Array.isArray(divs) ? divs.slice(0, 10) : [],
    }
  }

  // For chart type, just send summary
  if (type === 'chart') {
    const points = Array.isArray(rawData) ? rawData : rawData.data || []
    if (Array.isArray(points) && points.length > 50) {
      // Sample every Nth point to keep shape but reduce size
      const step = Math.ceil(points.length / 50)
      return points.filter((_, i) => i % step === 0)
    }
    return points
  }

  // For other types, just return rawData but truncated if it's a large array
  if (Array.isArray(rawData) && rawData.length > 50) {
    return rawData.slice(0, 50)
  }

  return rawData
}

// Helper to reduce token usage for large tool results
function sanitizeToolResult(toolName: string, toolResult: any) {
  if (!toolResult) return null

  // Generic helpers
  const sampleChart = (chartData: any, maxPoints = 20) => {
    if (!Array.isArray(chartData)) return []
    if (chartData.length <= maxPoints) return chartData
    const step = Math.ceil(chartData.length / maxPoints)
    return chartData.filter((_: any, i: number) => i % step === 0)
  }

  const safeSlice = (arr: any, n: number) =>
    Array.isArray(arr) ? arr.slice(0, n) : []

  if (toolName === 'calculate_stock_return') {
    return {
      ticker: toolResult.ticker,
      periodYears: toolResult.periodYears,
      totalInvested: toolResult.totalInvested,
      finalValue: toolResult.finalValue,
      returnPercentage: toolResult.returnPercentage,
      totalDividends: toolResult.totalDividends,
      totalShares: toolResult.totalShares,
      averagePrice: toolResult.averagePrice,
      chartDataSample: sampleChart(toolResult.chartData, 20),
      dividendsSample: safeSlice(toolResult.dividendsHistory, 12),
    }
  }

  if (toolName === 'calculate_compound_interest') {
    return {
      totalInvested: toolResult.totalInvested,
      totalInterest: toolResult.totalInterest,
      finalValue: toolResult.finalValue,
      periodMonths: toolResult.periodMonths,
      chartDataSample: sampleChart(toolResult.chartData, 20),
    }
  }

  if (toolName === 'calculate_planning') {
    return {
      strategy: toolResult.strategy,
      goalValue: toolResult.goalValue,
      monthlyContribution: toolResult.monthlyContribution,
      monthsToGoal: toolResult.monthsToGoal,
      targetDateLabel: toolResult.targetDateLabel,
      monthlyReturnRate: toolResult.monthlyReturnRate,
      estimatedFinalValue: toolResult.estimatedFinalValue,
      estimatedProfit: toolResult.estimatedProfit,
      recommendedAssets: safeSlice(toolResult.recommendedAssets, 8),
      chartDataSample: sampleChart(toolResult.chartData, 20),
    }
  }

  // Default: return as-is for unknown tools (already server-generated)
  return toolResult
}

export const streamAgentResponse = async (
  event: H3Event,
  ticker: string,
  type: string,
  rawData: any,
  userMessage: string,
  toolResult: any = null,
  toolName: string = '',
  requestId: string = ''
) => {
  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    event.node.res.write(
      JSON.stringify({ type: 'error', content: 'API Key missing' })
    )
    return
  }

  const OPENAI_STREAM_TIMEOUT_MS = 120_000

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
    timeout: OPENAI_STREAM_TIMEOUT_MS,
  })
  const chatModel = (config as any).openaiChatModel || 'gpt-4o'

  const systemPrompt = `
    Você é o agente financeiro da Redentia.
    
    Contexto:
    - Ticker identificado: ${ticker || 'Nenhum (Pergunta Geral)'}
    - Tipo de solicitação: ${type}
    
    Seus objetivos:
    1. PRIORIDADE MÁXIMA: Se uma ferramenta de cálculo foi usada (veja Contexto), sua resposta DEVE ser focada em explicar os resultados dessa simulação. Use os números retornados pela ferramenta.
    2. Se um ticker foi identificado e NENHUMA ferramenta foi usada, analise os dados fornecidos (${type}).
    3. Se NÃO houver ticker e NENHUMA ferramenta, responda como um especialista de mercado financeiro.
    4. Responder a pergunta do usuário de forma direta e explicativa.
    5. Se houver dados suficientes do ativo, forneça uma recomendação de investimento (Compra, Manter ou Venda) no início.
    6. Se o tipo for "report" ou "analysis" E houver um ativo, cite os números principais.
    7. Use os dados brutos fornecidos para embasar sua análise. Não invente números.
    8. IMPORTANTE: Mesmo que faltem dados fundamentais, faça a melhor análise possível com o preço e histórico disponíveis.
    9. IMPORTANTE: Se o usuário perguntar sobre "melhores ações", "oportunidades" ou "recomendações" de forma genérica, CITE EXEMPLOS CONCRETOS de ativos.

    Formato de saída OBRIGATÓRIO:
    - Primeira linha: "REC: [BUY|HOLD|SELL|NULL]" (apenas se fizer sentido dar recomendação para um ativo específico e NENHUMA ferramenta de cálculo foi usada)
    - Linhas seguintes: O texto da sua resposta/análise. Use Markdown para formatar (negrito, listas).

    NÃO retorne JSON. Retorne texto puro streamado.
    Responda em Português do Brasil.
  `

  // Sanitize context to avoid Token Limit errors
  const contextData = sanitizeContext(type, rawData)
  const sanitizedToolResult = sanitizeToolResult(toolName, toolResult)

  // Keep user prompt compact to reduce tokens and improve comprehension.
  // Avoid duplicating large payloads (e.g. toolResult) in both system and user messages.
  const userPrompt = [
    `Pergunta do usuário: ${userMessage}`,
    '',
    'Contexto (sistema):',
    `- ticker: ${ticker || 'null'}`,
    `- type: ${type}`,
    sanitizedToolResult
      ? `- toolResult (${toolName || 'tool'}): ${JSON.stringify(sanitizedToolResult)}`
      : '',
    contextData ? `- data: ${JSON.stringify(contextData)}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const startedAt = Date.now()
    if (toolResult) {
      event.node.res.write(
        JSON.stringify({
          type: 'tool-used',
          content: { name: toolName, result: toolResult },
        }) + '\n'
      )
    }

    let fullContent = ''
    let usage: any = null
    // Abort OpenAI stream on client disconnect or timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(
      () => abortController.abort(),
      OPENAI_STREAM_TIMEOUT_MS
    )
    const onClose = () => abortController.abort()
    event.node.req.on('close', onClose)
    event.node.res.on('close', onClose)

    try {
      const stream = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: chatModel,
        stream: true,
        stream_options: { include_usage: true },
      }, { signal: abortController.signal } as any)

      for await (const chunk of stream) {
        if (event.node.res.writableEnded) break
        if ((chunk as any)?.usage) usage = (chunk as any).usage
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullContent += content
          event.node.res.write(
            JSON.stringify({ type: 'content', content }) + '\n'
          )
        }
      }
    } finally {
      clearTimeout(timeoutId)
      event.node.req.off('close', onClose)
      event.node.res.off('close', onClose)
    }

    const durationMs = Date.now() - startedAt
    if (requestId) {
      const usageStr =
        usage && usage.total_tokens
          ? ` prompt=${usage.prompt_tokens} completion=${usage.completion_tokens} total=${usage.total_tokens}`
          : ''
      console.log(
        `[chat:${requestId}] agent_stream_done model=${chatModel} durationMs=${durationMs}${usageStr}`
      )
    }

    // Extract recommendation from the streamed content (REC: BUY|HOLD|SELL|NULL)
    // and send it as structured meta for the UI.
    const recMatch = fullContent
      .trimStart()
      .match(/^REC:\s*(BUY|HOLD|SELL|NULL)\b/i)

    if (recMatch) {
      const recValue = recMatch[1].toUpperCase()
      const recommendation =
        recValue === 'BUY'
          ? 'buy'
          : recValue === 'HOLD'
            ? 'hold'
            : recValue === 'SELL'
              ? 'sell'
              : null

      event.node.res.write(
        JSON.stringify({
          type: 'meta',
          content: { recommendation },
        }) + '\n'
      )
    }

    // Extract tickers from fullContent
    const MAX_RELATED_TICKERS = 5
    const tickerRegex = /\b[A-Z]{4}[0-9]{1,2}\b/g
    const matches = fullContent.match(tickerRegex)

    if (matches) {
      // Filter unique tickers and exclude the main ticker if present
      const isValidTicker = (t: string) => /^[A-Z]{4}[0-9]{1,2}$/.test(t)
      const uniqueTickers = [...new Set(matches)]
        .map((t) => t.toUpperCase())
        .filter((t) => isValidTicker(t) && t !== ticker)
        .slice(0, MAX_RELATED_TICKERS)

      if (uniqueTickers.length > 0) {
        if (event.node.res.writableEnded) return
        // Fetch data for these tickers
        const relatedTickers = await Promise.all(
          uniqueTickers.map(async (t) => {
            try {
              const data = (await getMarketData(t, 'price')) as any
              if (!data) return null
              return {
                ticker: t,
                name: data.name || t,
                logo: data.logo || '',
                change: data.change
                  ? `${Number(data.change).toFixed(2)}%`
                  : '0.00%',
              }
            } catch {
              return null
            }
          })
        )

        const validTickers = relatedTickers.filter((t) => t !== null)

        if (validTickers.length > 0) {
          event.node.res.write(
            JSON.stringify({ type: 'related-tickers', content: validTickers }) +
            '\n'
          )
        }
      }
    }
  } catch (error) {
    const isConnectionClosed =
      event.node.res.writableEnded ||
      (event.node.res as any).destroyed ||
      (event.node.req as any).aborted

    if (isConnectionClosed) return

    const isAbort =
      (error as any)?.name === 'AbortError' ||
      (error as any)?.code === 'ABORT_ERR'

    if (isAbort) {
      event.node.res.write(
        JSON.stringify({ type: 'error', content: 'Tempo limite na IA' }) + '\n'
      )
      return
    }

    console.error('OpenAI Stream Error:', error)
    event.node.res.write(
      JSON.stringify({ type: 'error', content: 'Erro na IA' }) + '\n'
    )
  }
}

export const generateMarketAlertMessage = async (
  ticker: string,
  data: any
) => {
  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    console.error('OpenAI API Key missing')
    return `O ativo ${ticker} teve uma movimentação relevante hoje.`
  }

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
    timeout: 15_000,
  })
  const alertModel =
    (config as any).openaiAlertModel || (config as any).openaiChatModel || 'gpt-4o'

  const systemPrompt = `
    Você é um analista financeiro sênior da Redentia.
    Seu objetivo é criar uma notificação curta e impactante (máximo 150 caracteres) sobre um movimento relevante de mercado.
    
    Dados do ativo (${ticker}):
    ${JSON.stringify(sanitizeContext('report', data))}

    A mensagem deve seguir este formato:
    "A [TICKER] [caiu/subiu] [X]% hoje. [Comentário curto sobre dividendo ou oportunidade]."

    Exemplo: "A PETR4 caiu 20% hoje, nesses preços o dividendo estimado é de 15% ao ano."
    
    Seja direto. Não use emojis.
    Responda apenas com o texto da notificação.
  `

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Gere uma notificação para ${ticker}.` },
      ],
      model: alertModel,
    })

    return response.choices[0]?.message?.content || `Movimentação relevante em ${ticker}`
  } catch (error) {
    console.error('OpenAI Error:', error)
    return `Movimentação relevante em ${ticker}`
  }
}

// ----------------------------
// Unified Chat Agent (tools + streaming)
// ----------------------------

type ToolCallInfo = {
  id: string
  name: string
  arguments: string
}

function extractToolCallsFromDelta(
  toolCallMap: Map<number, ToolCallInfo>,
  deltaToolCalls: any[]
) {
  for (const tc of deltaToolCalls) {
    const idx = typeof tc.index === 'number' ? tc.index : 0
    const existing = toolCallMap.get(idx) || { id: '', name: '', arguments: '' }
    if (tc.id) existing.id = tc.id
    if (tc.function?.name) existing.name = tc.function.name
    if (tc.function?.arguments) existing.arguments += tc.function.arguments
    toolCallMap.set(idx, existing)
  }
}

function buildDefaultSuggestions(ticker: string | null, toolName: string) {
  const suggestions: string[] = []
  if (ticker) {
    suggestions.push(`Ver dividendos de ${ticker}`)
    suggestions.push(`Análise técnica de ${ticker}`)
    suggestions.push(`Comparar ${ticker} com concorrentes`)
  }

  if (toolName === 'calculate_planning') {
    suggestions.push('Refazer com estratégia de segurança')
    suggestions.push('Aumentar aporte mensal')
  } else if (toolName === 'calculate_stock_return') {
    suggestions.push('Ver gráfico de dividendos')
    suggestions.push('Simular com reinvestimento')
  }

  if (!ticker) {
    suggestions.push('Simular rentabilidade de ações')
    suggestions.push('Planejamento de aposentadoria')
    suggestions.push('Cotação do Dólar')
  }

  return suggestions.slice(0, 3)
}

export const streamChatWithTools = async (
  event: H3Event,
  userMessage: string,
  route: string | undefined,
  contextTicker: string | null,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  requestId: string = ''
) => {
  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    event.node.res.write(
      JSON.stringify({ type: 'error', content: 'API Key missing' }) + '\n'
    )
    return
  }

  const OPENAI_STREAM_TIMEOUT_MS = 120_000
  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
    timeout: OPENAI_STREAM_TIMEOUT_MS,
  })

  const chatModel = (config as any).openaiChatModel || 'gpt-4o'

  const normalizeTicker = (t: any) =>
    typeof t === 'string' ? t.trim().toUpperCase() : ''
  const isValidTicker = (t: string) => /^[A-Z]{4}[0-9]{1,2}$/.test(t)

  const safeHistory = Array.isArray(history)
    ? history
        .slice(-6)
        .map((h) => ({
          role: h?.role === 'assistant' ? 'assistant' : 'user',
          content:
            typeof h?.content === 'string' ? h.content.slice(0, 800) : '',
        }))
        .filter((h) => h.content.trim().length > 0)
    : []

  const systemPrompt = `
Você é o agente financeiro da Redentia.

Você tem acesso a ferramentas (calculadoras e consulta de dados de mercado).

Regras de uso de ferramentas:
1) Se o usuário pedir simulação/cálculo (ex.: "quanto rende", "simular", "planejar", valores + tempo), você DEVE usar uma ferramenta de cálculo apropriada.
2) Se o usuário pedir dados de um ativo (preço, gráfico, dividendos, análise, relatório), você DEVE usar view_market_data.
3) Faça no máximo 1 ferramenta por mensagem (para controlar custo).
4) Se existir ticker de contexto e o usuário não especificar outro, use o ticker de contexto.
5) Não invente números.
6) IMPORTANTE (follow-up): se a mensagem atual for curta e parecer um ajuste de parâmetros (ex.: "por 100 anos", "por 12 meses", "a 12% ao ano", "com aporte de 200/mês"), trate como continuação da última simulação/pergunta no histórico e reutilize os valores anteriores, alterando apenas o parâmetro mencionado.

Regras de resposta:
- Se uma ferramenta foi usada nesta conversa, sua resposta deve explicar os resultados retornados pela ferramenta, citando os números.
- Se NÃO houver ferramenta e houver dados suficientes de um ativo, você pode dar uma recomendação.
- Se o usuário pedir "melhores ações"/"oportunidades" genericamente, cite exemplos concretos de ativos.

Formato de saída:
- Primeira linha: "REC: [BUY|HOLD|SELL|NULL]" APENAS se fizer sentido recomendar um ativo específico e NENHUMA ferramenta foi usada.
- Depois: texto em Markdown.
- NÃO retorne JSON.
- Responda em pt-BR.
  `.trim()

  const userPrompt = [
    route ? `Contexto de tela: ${route}` : '',
    contextTicker ? `Ticker de contexto: ${contextTicker}` : '',
    '',
    `Mensagem do usuário: ${userMessage}`,
  ]
    .filter(Boolean)
    .join('\n')

  const baseMessages: any[] = [
    { role: 'system', content: systemPrompt },
    ...safeHistory,
    { role: 'user', content: userPrompt },
  ]

  const tools = [
    {
      type: 'function',
      function: {
        name: 'calculate_compound_interest',
        description:
          'Simulação de Juros Compostos. Use quando o usuário quer simular rendimento sem depender do histórico de um ticker específico.',
        parameters: {
          type: 'object',
          properties: {
            initialValue: { type: 'number' },
            monthlyValue: { type: 'number' },
            interestRate: { type: 'number', description: 'Percentual (ex.: 10 = 10%)' },
            period: { type: 'number' },
            periodType: { type: 'string', enum: ['months', 'years'], default: 'years' },
            interestPeriod: { type: 'string', enum: ['month', 'year'], default: 'year' },
          },
          required: ['initialValue', 'monthlyValue', 'interestRate', 'period'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'calculate_planning',
        description:
          'Planejamento Financeiro. Use quando o usuário tem uma meta (valor alvo) e um aporte mensal.',
        parameters: {
          type: 'object',
          properties: {
            goalValue: { type: 'number' },
            monthlyContribution: { type: 'number' },
            strategy: {
              type: 'string',
              enum: ['rentabilidade', 'seguranca'],
              description: 'Se não informado, use "seguranca".',
            },
          },
          required: ['goalValue', 'monthlyContribution'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'calculate_stock_return',
        description:
          'Simulação histórica de rentabilidade de ativos (B3) com ou sem reinvestimento de dividendos.',
        parameters: {
          type: 'object',
          properties: {
            tickers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Ex.: ["PETR4", "VALE3"]',
            },
            ticker: {
              type: 'string',
              description: 'Ticker único (fallback).',
            },
            initialInvestment: { type: 'number' },
            monthlyInvestment: { type: 'number' },
            periodYears: { type: 'number', default: 1 },
            reinvestDividends: { type: 'boolean', default: true },
          },
          required: ['tickers'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'view_market_data',
        description:
          'Consulta dados de mercado para um ativo (preço, gráfico, dividendos, análise, relatório).',
        parameters: {
          type: 'object',
          properties: {
            ticker: { type: 'string' },
            view: {
              type: 'string',
              enum: ['report', 'chart', 'dividends', 'analysis', 'price'],
            },
          },
          required: ['ticker', 'view'],
        },
      },
    },
  ]

  // 1) First call: stream directly; if tool_calls happen, we execute tool and do a second call for the final answer.
  const toolCallMap = new Map<number, ToolCallInfo>()
  let firstFinishReason: string | null = null
  let firstUsage: any = null
  let firstFullContent = ''
  let sawToolCalls = false

  const abortController = new AbortController()
  const timeoutId = setTimeout(() => abortController.abort(), OPENAI_STREAM_TIMEOUT_MS)
  const onClose = () => abortController.abort()
  event.node.req.on('close', onClose)
  event.node.res.on('close', onClose)

  try {
    const stream = await openai.chat.completions.create(
      {
        model: chatModel,
        messages: baseMessages,
        tools: tools as any,
        tool_choice: 'auto',
        stream: true,
        stream_options: { include_usage: true },
      },
      { signal: abortController.signal } as any
    )

    for await (const chunk of stream) {
      if (event.node.res.writableEnded) break
      const choice = chunk.choices?.[0]
      if (!choice) continue
      if (choice.finish_reason) firstFinishReason = choice.finish_reason
      if ((chunk as any)?.usage) firstUsage = (chunk as any).usage

      const delta: any = choice.delta || {}
      if (Array.isArray(delta.tool_calls) && delta.tool_calls.length > 0) {
        sawToolCalls = true
        extractToolCallsFromDelta(toolCallMap, delta.tool_calls)
      }

      const content = delta.content || ''
      if (content) {
        firstFullContent += content
        // Only stream to the client if we're not in tool-call mode.
        if (!sawToolCalls) {
          event.node.res.write(
            JSON.stringify({ type: 'content', content }) + '\n'
          )
        }
      }
    }
  } catch (error) {
    const isConnectionClosed =
      event.node.res.writableEnded ||
      (event.node.res as any).destroyed ||
      (event.node.req as any).aborted
    if (isConnectionClosed) return

    const isAbort =
      (error as any)?.name === 'AbortError' || (error as any)?.code === 'ABORT_ERR'
    event.node.res.write(
      JSON.stringify({
        type: 'error',
        content: isAbort ? 'Tempo limite na IA' : 'Erro na IA',
      }) + '\n'
    )
    return
  } finally {
    clearTimeout(timeoutId)
    event.node.req.off('close', onClose)
    event.node.res.off('close', onClose)
  }

  if (requestId) {
    const usageStr =
      firstUsage && firstUsage.total_tokens
        ? ` prompt=${firstUsage.prompt_tokens} completion=${firstUsage.completion_tokens} total=${firstUsage.total_tokens}`
        : ''
    console.log(
      `[chat:${requestId}] unified_first_done model=${chatModel} finish=${firstFinishReason || '-'}${usageStr}`
    )
  }

  // If no tool calls, this was the final answer (already streamed).
  if (!sawToolCalls && toolCallMap.size === 0 && firstFinishReason !== 'tool_calls') {
    // Emit meta + related tickers based on the full content (best-effort)
    const recMatch = firstFullContent
      .trimStart()
      .match(/^REC:\s*(BUY|HOLD|SELL|NULL)\b/i)
    if (recMatch) {
      const recValue = recMatch[1].toUpperCase()
      const recommendation =
        recValue === 'BUY'
          ? 'buy'
          : recValue === 'HOLD'
            ? 'hold'
            : recValue === 'SELL'
              ? 'sell'
              : null
      event.node.res.write(
        JSON.stringify({ type: 'meta', content: { recommendation } }) + '\n'
      )
    }

    // Suggestions (simple heuristic)
    const suggestions = buildDefaultSuggestions(contextTicker, '')
    if (suggestions.length > 0) {
      event.node.res.write(
        JSON.stringify({ type: 'suggestions', content: suggestions }) + '\n'
      )
    }

    // Related tickers
    const MAX_RELATED_TICKERS = 5
    const tickerRegex = /\b[A-Z]{4}[0-9]{1,2}\b/g
    const matches = firstFullContent.match(tickerRegex)
    if (matches) {
      const uniqueTickers = [...new Set(matches)]
        .map((t) => t.toUpperCase())
        .filter((t) => isValidTicker(t) && t !== contextTicker)
        .slice(0, MAX_RELATED_TICKERS)

      if (uniqueTickers.length > 0 && !event.node.res.writableEnded) {
        const relatedTickers = await Promise.all(
          uniqueTickers.map(async (t) => {
            try {
              const data = (await getMarketData(t, 'price')) as any
              if (!data) return null
              return {
                ticker: t,
                name: data.name || t,
                logo: data.logo || '',
                change: data.change
                  ? `${Number(data.change).toFixed(2)}%`
                  : '0.00%',
              }
            } catch {
              return null
            }
          })
        )

        const validTickers = relatedTickers.filter((t) => t !== null)
        if (validTickers.length > 0) {
          event.node.res.write(
            JSON.stringify({ type: 'related-tickers', content: validTickers }) +
              '\n'
          )
        }
      }
    }

    return
  }

  // 2) Tool call path: execute tool and do a second model call to generate the final answer.
  const toolCalls = Array.from(toolCallMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v)
    .slice(0, 1) // keep 1 tool call to mirror previous behavior

  if (toolCalls.length === 0) {
    event.node.res.write(
      JSON.stringify({
        type: 'error',
        content: 'Não consegui identificar a ação necessária.',
      }) + '\n'
    )
    return
  }

  const tc = toolCalls[0]
  const toolName = tc.name
  let toolResult: any = null
  let toolResultForModel: any = null
  let ticker: string | null = contextTicker
  let viewType: string = 'text'
  let rawData: any = null

  const safeJsonParse = (s: string) => {
    try {
      return JSON.parse(s)
    } catch {
      return {}
    }
  }

  const args = safeJsonParse(tc.arguments || '{}')

  if (toolName === 'view_market_data') {
    const t = normalizeTicker(args.ticker || contextTicker)
    const view = typeof args.view === 'string' ? args.view : 'report'
    if (!t || !isValidTicker(t) || !['report', 'chart', 'dividends', 'analysis', 'price'].includes(view)) {
      toolResult = { error: 'Ticker/view inválidos' }
      toolResultForModel = toolResult
    } else {
      ticker = t
      viewType = view
      event.node.res.write(
        JSON.stringify({ type: 'status', content: `📊 Buscando dados de ${t}...` }) + '\n'
      )
      rawData = await getMarketData(t, view)
      const structuredData = {
        ticker: t,
        type: view,
        data: rawData ? formatMarketData(view, rawData) : null,
        meta: { summary: '', recommendation: null },
      }
      event.node.res.write(
        JSON.stringify({ type: 'data', content: structuredData }) + '\n'
      )
      toolResult = structuredData
      toolResultForModel = sanitizeContext(view, rawData)
    }
  } else if (toolName === 'calculate_compound_interest') {
    event.node.res.write(
      JSON.stringify({ type: 'status', content: '🧮 Executando: Calculadora...' }) + '\n'
    )
    const iv = Number(args.initialValue)
    const mv = Number(args.monthlyValue)
    const ir = Number(args.interestRate)
    const p = Number(args.period)
    const periodType = args.periodType === 'months' || args.periodType === 'years' ? args.periodType : 'years'
    const interestPeriod = args.interestPeriod === 'month' || args.interestPeriod === 'year' ? args.interestPeriod : 'year'
    if (!Number.isFinite(iv) || !Number.isFinite(mv) || !Number.isFinite(ir) || !Number.isFinite(p) || p <= 0) {
      toolResult = { error: 'Parâmetros inválidos' }
    } else {
      toolResult = calculateCompoundInterest(iv, mv, ir, p, periodType, interestPeriod)
    }
    toolResultForModel = sanitizeToolResult(toolName, toolResult)
    event.node.res.write(
      JSON.stringify({ type: 'tool-used', content: { name: toolName, result: toolResult } }) + '\n'
    )
  } else if (toolName === 'calculate_planning') {
    event.node.res.write(
      JSON.stringify({ type: 'status', content: '🧮 Executando: Planejamento Financeiro...' }) + '\n'
    )
    const gv = Number(args.goalValue)
    const mc = Number(args.monthlyContribution)
    const strategy = args.strategy === 'rentabilidade' || args.strategy === 'seguranca' ? args.strategy : 'seguranca'
    if (!Number.isFinite(gv) || !Number.isFinite(mc) || gv <= 0 || mc <= 0) {
      toolResult = { error: 'Parâmetros inválidos' }
    } else {
      toolResult = await calculatePlanning(gv, mc, strategy)
    }
    toolResultForModel = sanitizeToolResult(toolName, toolResult)
    event.node.res.write(
      JSON.stringify({ type: 'tool-used', content: { name: toolName, result: toolResult } }) + '\n'
    )
  } else if (toolName === 'calculate_stock_return') {
    event.node.res.write(
      JSON.stringify({ type: 'status', content: '🧮 Executando: Simulação de Rentabilidade...' }) + '\n'
    )
    const rawTickers = Array.isArray(args.tickers)
      ? args.tickers
      : args.ticker
        ? [args.ticker]
        : []
    const tickers = rawTickers
      .map((t: any) => normalizeTicker(t))
      .filter((t: string) => isValidTicker(t))
    const ii = Number(args.initialInvestment)
    const mi = Number(args.monthlyInvestment)
    const py = Number(args.periodYears || 1)
    const reinvestDividends =
      typeof args.reinvestDividends === 'boolean' ? args.reinvestDividends : true

    if (!tickers.length || !Number.isFinite(py) || py <= 0) {
      toolResult = { error: 'Parâmetros inválidos' }
    } else {
      ticker = tickers[0] || ticker
      toolResult = await calculateStockReturn(
        tickers,
        Number.isFinite(ii) ? ii : 0,
        Number.isFinite(mi) ? mi : 0,
        py,
        reinvestDividends
      )
    }
    toolResultForModel = sanitizeToolResult(toolName, toolResult)
    event.node.res.write(
      JSON.stringify({ type: 'tool-used', content: { name: toolName, result: toolResult } }) + '\n'
    )
  } else {
    toolResult = { error: 'Ferramenta não suportada' }
    toolResultForModel = toolResult
  }

  // Suggestions after tool execution
  const suggestions = buildDefaultSuggestions(ticker, toolName)
  if (suggestions.length > 0) {
    event.node.res.write(
      JSON.stringify({ type: 'suggestions', content: suggestions }) + '\n'
    )
  }

  // 3) Second call: final answer (no more tools)
  event.node.res.write(
    JSON.stringify({ type: 'status', content: '✅ Gerando resposta...' }) + '\n'
  )

  const assistantToolCallMessage: any = {
    role: 'assistant',
    tool_calls: [
      {
        id: tc.id,
        type: 'function',
        function: { name: tc.name, arguments: tc.arguments },
      },
    ],
  }

  const toolResponseMessage: any = {
    role: 'tool',
    tool_call_id: tc.id,
    content: JSON.stringify({
      tool: toolName,
      result: toolResultForModel,
      context: {
        ticker,
        viewType,
        data: sanitizeContext(viewType, rawData),
      },
    }),
  }

  const finalAbortController = new AbortController()
  const finalTimeoutId = setTimeout(
    () => finalAbortController.abort(),
    OPENAI_STREAM_TIMEOUT_MS
  )
  const finalOnClose = () => finalAbortController.abort()
  event.node.req.on('close', finalOnClose)
  event.node.res.on('close', finalOnClose)

  let finalFullContent = ''
  let finalUsage: any = null
  let finalError: any = null

  try {
    const stream = await openai.chat.completions.create(
      {
        model: chatModel,
        messages: [
          ...baseMessages,
          assistantToolCallMessage,
          toolResponseMessage,
        ],
        tools: tools as any,
        tool_choice: 'none',
        stream: true,
        stream_options: { include_usage: true },
      } as any,
      { signal: finalAbortController.signal } as any
    )

    for await (const chunk of stream) {
      if (event.node.res.writableEnded) break
      if ((chunk as any)?.usage) finalUsage = (chunk as any).usage
      const content = chunk.choices?.[0]?.delta?.content || ''
      if (content) {
        finalFullContent += content
        event.node.res.write(
          JSON.stringify({ type: 'content', content }) + '\n'
        )
      }
    }
  } catch (error) {
    finalError = error
    const isConnectionClosed =
      event.node.res.writableEnded ||
      (event.node.res as any).destroyed ||
      (event.node.req as any).aborted
    if (isConnectionClosed) return

    const isAbort =
      (error as any)?.name === 'AbortError' || (error as any)?.code === 'ABORT_ERR'
    event.node.res.write(
      JSON.stringify({
        type: 'error',
        content: isAbort ? 'Tempo limite na IA' : 'Erro na IA',
      }) + '\n'
    )
  } finally {
    clearTimeout(finalTimeoutId)
    event.node.req.off('close', finalOnClose)
    event.node.res.off('close', finalOnClose)
  }

  if (finalError) return

  if (requestId) {
    const usageStr =
      finalUsage && finalUsage.total_tokens
        ? ` prompt=${finalUsage.prompt_tokens} completion=${finalUsage.completion_tokens} total=${finalUsage.total_tokens}`
        : ''
    console.log(
      `[chat:${requestId}] unified_final_done model=${chatModel}${usageStr}`
    )
  }

  // Emit meta + related tickers based on final content
  const recMatch = finalFullContent
    .trimStart()
    .match(/^REC:\s*(BUY|HOLD|SELL|NULL)\b/i)
  if (recMatch) {
    const recValue = recMatch[1].toUpperCase()
    const recommendation =
      recValue === 'BUY'
        ? 'buy'
        : recValue === 'HOLD'
          ? 'hold'
          : recValue === 'SELL'
            ? 'sell'
            : null
    event.node.res.write(
      JSON.stringify({ type: 'meta', content: { recommendation } }) + '\n'
    )
  }

  const MAX_RELATED_TICKERS = 5
  const tickerRegex = /\b[A-Z]{4}[0-9]{1,2}\b/g
  const matches = finalFullContent.match(tickerRegex)
  if (matches) {
    const uniqueTickers = [...new Set(matches)]
      .map((t) => t.toUpperCase())
      .filter((t) => isValidTicker(t) && t !== ticker)
      .slice(0, MAX_RELATED_TICKERS)

    if (uniqueTickers.length > 0 && !event.node.res.writableEnded) {
      const relatedTickers = await Promise.all(
        uniqueTickers.map(async (t) => {
          try {
            const data = (await getMarketData(t, 'price')) as any
            if (!data) return null
            return {
              ticker: t,
              name: data.name || t,
              logo: data.logo || '',
              change: data.change
                ? `${Number(data.change).toFixed(2)}%`
                : '0.00%',
            }
          } catch {
            return null
          }
        })
      )

      const validTickers = relatedTickers.filter((t) => t !== null)
      if (validTickers.length > 0) {
        event.node.res.write(
          JSON.stringify({ type: 'related-tickers', content: validTickers }) +
            '\n'
        )
      }
    }
  }
}

