import OpenAI from 'openai'
import type { H3Event } from 'h3'
import { getMarketData } from './market'

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

