import Anthropic from '@anthropic-ai/sdk'
import type { H3Event } from 'h3'
import { getMarketData } from './market'
import { formatMarketData } from './formatter'
import {
  calculateCompoundInterest,
  calculatePlanning,
  calculateStockReturn,
} from './calculators'

// ============================================================
// Token optimization helpers
// ============================================================

function sanitizeContext(type: string, rawData: any) {
  if (!rawData) return null

  const unwrap = (d: any) => (d && d.data ? d.data : d)

  if (type === 'report') {
    const fund = unwrap(rawData.fundamentals)
    const price = unwrap(rawData.price)
    const chart = unwrap(rawData.chart)
    const divs = unwrap(rawData.dividends)

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

    const chartPoints = Array.isArray(chart) ? chart : chart?.data || []
    let chartSummary = 'No chart data'
    if (Array.isArray(chartPoints) && chartPoints.length > 0) {
      const start = chartPoints[0]
      const end = chartPoints[chartPoints.length - 1]
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

  if (type === 'chart') {
    const points = Array.isArray(rawData) ? rawData : rawData.data || []
    if (Array.isArray(points) && points.length > 50) {
      const step = Math.ceil(points.length / 50)
      return points.filter((_, i) => i % step === 0)
    }
    return points
  }

  if (Array.isArray(rawData) && rawData.length > 50) {
    return rawData.slice(0, 50)
  }

  return rawData
}

function sanitizeToolResult(toolName: string, toolResult: any) {
  if (!toolResult) return null

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

  return toolResult
}

// ============================================================
// Helpers shared by both agent functions
// ============================================================

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

async function emitRelatedTickers(
  event: H3Event,
  content: string,
  currentTicker: string | null
) {
  const MAX_RELATED_TICKERS = 5
  const tickerRegex = /\b[A-Z]{4}[0-9]{1,2}\b/g
  const matches = content.match(tickerRegex)
  if (!matches) return

  const isValidTicker = (t: string) => /^[A-Z]{4}[0-9]{1,2}$/.test(t)
  const uniqueTickers = [...new Set(matches)]
    .map((t) => t.toUpperCase())
    .filter((t) => isValidTicker(t) && t !== currentTicker)
    .slice(0, MAX_RELATED_TICKERS)

  if (uniqueTickers.length === 0 || event.node.res.writableEnded) return

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
      JSON.stringify({ type: 'related-tickers', content: validTickers }) + '\n'
    )
  }
}

function emitRecommendation(event: H3Event, fullContent: string) {
  const recMatch = fullContent
    .trimStart()
    .match(/^REC:\s*(BUY|HOLD|SELL|NULL)\b/i)
  if (!recMatch) return

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

// ============================================================
// Tool definitions (Claude format)
// ============================================================

const chatTools: Anthropic.Messages.Tool[] = [
  {
    name: 'calculate_compound_interest',
    description:
      'Simulação de Juros Compostos. Use quando o usuário quer simular rendimento sem depender do histórico de um ticker específico.',
    input_schema: {
      type: 'object',
      properties: {
        initialValue: { type: 'number' },
        monthlyValue: { type: 'number' },
        interestRate: { type: 'number', description: 'Percentual (ex.: 10 = 10%)' },
        period: { type: 'number' },
        periodType: { type: 'string', enum: ['months', 'years'] },
        interestPeriod: { type: 'string', enum: ['month', 'year'] },
      },
      required: ['initialValue', 'monthlyValue', 'interestRate', 'period'],
    },
  },
  {
    name: 'calculate_planning',
    description:
      'Planejamento Financeiro. Use quando o usuário tem uma meta (valor alvo) e um aporte mensal.',
    input_schema: {
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
  {
    name: 'calculate_stock_return',
    description:
      'Simulação histórica de rentabilidade de ativos (B3) com ou sem reinvestimento de dividendos.',
    input_schema: {
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
        periodYears: { type: 'number' },
        reinvestDividends: { type: 'boolean' },
      },
      required: ['tickers'],
    },
  },
  {
    name: 'view_market_data',
    description:
      'Consulta dados de mercado para um ativo (preço, gráfico, dividendos, análise, relatório).',
    input_schema: {
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
]

// ============================================================
// streamAgentResponse — legacy simple streaming without tools
// ============================================================

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

  if (!config.anthropicApiKey) {
    event.node.res.write(
      JSON.stringify({ type: 'error', content: 'API Key missing' }) + '\n'
    )
    return
  }

  const CLAUDE_STREAM_TIMEOUT_MS = 120_000

  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
    timeout: CLAUDE_STREAM_TIMEOUT_MS,
  })
  const chatModel = (config as any).anthropicChatModel || 'claude-sonnet-4-5'

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
  `.trim()

  const contextData = sanitizeContext(type, rawData)
  const sanitizedToolResult = sanitizeToolResult(toolName, toolResult)

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
    let inputTokens = 0
    let outputTokens = 0
    const abortController = new AbortController()
    const timeoutId = setTimeout(
      () => abortController.abort(),
      CLAUDE_STREAM_TIMEOUT_MS
    )
    const onClose = () => abortController.abort()
    event.node.req.on('close', onClose)
    event.node.res.on('close', onClose)

    try {
      const stream = client.messages.stream(
        {
          model: chatModel,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        },
        { signal: abortController.signal }
      )

      for await (const streamEvent of stream) {
        if (event.node.res.writableEnded) break

        if (
          streamEvent.type === 'content_block_delta' &&
          streamEvent.delta.type === 'text_delta'
        ) {
          const textChunk = streamEvent.delta.text
          fullContent += textChunk
          event.node.res.write(
            JSON.stringify({ type: 'content', content: textChunk }) + '\n'
          )
        }

        if (streamEvent.type === 'message_delta' && streamEvent.usage) {
          outputTokens = streamEvent.usage.output_tokens || outputTokens
        }

        if (streamEvent.type === 'message_start' && streamEvent.message.usage) {
          inputTokens = streamEvent.message.usage.input_tokens || 0
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
        inputTokens || outputTokens
          ? ` input=${inputTokens} output=${outputTokens}`
          : ''
      console.log(
        `[chat:${requestId}] agent_stream_done model=${chatModel} durationMs=${durationMs}${usageStr}`
      )
    }

    emitRecommendation(event, fullContent)
    await emitRelatedTickers(event, fullContent, ticker || null)
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

    console.error('Claude Stream Error:', error)
    event.node.res.write(
      JSON.stringify({ type: 'error', content: 'Erro na IA' }) + '\n'
    )
  }
}

// ============================================================
// generateMarketAlertMessage — short alert notification
// ============================================================

export const generateMarketAlertMessage = async (
  ticker: string,
  data: any
) => {
  const config = useRuntimeConfig()

  if (!config.anthropicApiKey) {
    console.error('Anthropic API Key missing')
    return `O ativo ${ticker} teve uma movimentação relevante hoje.`
  }

  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
    timeout: 15_000,
  })
  const alertModel =
    (config as any).anthropicAlertModel ||
    (config as any).anthropicChatModel ||
    'claude-haiku-4-5'

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
  `.trim()

  try {
    const response = await client.messages.create({
      model: alertModel,
      max_tokens: 256,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Gere uma notificação para ${ticker}.` },
      ],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    return (
      (textBlock && textBlock.type === 'text' ? textBlock.text : '') ||
      `Movimentação relevante em ${ticker}`
    )
  } catch (error) {
    console.error('Claude Error:', error)
    return `Movimentação relevante em ${ticker}`
  }
}

// ============================================================
// streamChatWithTools — Main chat engine with tools
// ============================================================

export const streamChatWithTools = async (
  event: H3Event,
  userMessage: string,
  route: string | undefined,
  contextTicker: string | null,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  requestId: string = ''
) => {
  const config = useRuntimeConfig()

  if (!config.anthropicApiKey) {
    event.node.res.write(
      JSON.stringify({ type: 'error', content: 'API Key missing' }) + '\n'
    )
    return
  }

  const CLAUDE_STREAM_TIMEOUT_MS = 120_000
  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
    timeout: CLAUDE_STREAM_TIMEOUT_MS,
  })

  const chatModel = (config as any).anthropicChatModel || 'claude-sonnet-4-5'

  const normalizeTicker = (t: any) =>
    typeof t === 'string' ? t.trim().toUpperCase() : ''
  const isValidTicker = (t: string) => /^[A-Z]{4}[0-9]{1,2}$/.test(t)

  const safeHistory: Array<{ role: 'user' | 'assistant'; content: string }> =
    Array.isArray(history)
      ? history
          .slice(-6)
          .map((h) => ({
            role: (h?.role === 'assistant' ? 'assistant' : 'user') as
              | 'user'
              | 'assistant',
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

  const baseMessages: Anthropic.Messages.MessageParam[] = [
    ...safeHistory.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: userPrompt },
  ]

  // ----------------------------
  // Step 1: First call (non-stream) to detect tool_use
  // Claude's tool use is cleaner when we don't stream the first pass.
  // If no tool is used, we do a streaming pass as final answer.
  // ----------------------------

  const abortController = new AbortController()
  const timeoutId = setTimeout(
    () => abortController.abort(),
    CLAUDE_STREAM_TIMEOUT_MS
  )
  const onClose = () => abortController.abort()
  event.node.req.on('close', onClose)
  event.node.res.on('close', onClose)

  let firstResponse: Anthropic.Messages.Message | null = null

  try {
    firstResponse = await client.messages.create(
      {
        model: chatModel,
        max_tokens: 4096,
        system: systemPrompt,
        tools: chatTools,
        messages: baseMessages,
      },
      { signal: abortController.signal }
    )
  } catch (error) {
    clearTimeout(timeoutId)
    event.node.req.off('close', onClose)
    event.node.res.off('close', onClose)

    const isConnectionClosed =
      event.node.res.writableEnded ||
      (event.node.res as any).destroyed ||
      (event.node.req as any).aborted
    if (isConnectionClosed) return

    const isAbort =
      (error as any)?.name === 'AbortError' ||
      (error as any)?.code === 'ABORT_ERR'
    console.error('Claude First Call Error:', error)
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

  if (requestId && firstResponse) {
    console.log(
      `[chat:${requestId}] unified_first_done model=${chatModel} stop=${firstResponse.stop_reason || '-'} input=${firstResponse.usage.input_tokens} output=${firstResponse.usage.output_tokens}`
    )
  }

  // Check if Claude used a tool
  const toolUseBlock = firstResponse.content.find(
    (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use'
  )

  // ----------------------------
  // Path A: No tool call → stream final answer
  // ----------------------------
  if (!toolUseBlock || firstResponse.stop_reason !== 'tool_use') {
    // Extract text from the first response and stream it as chunks
    // (since we didn't stream the first call, we emit the full text now)
    const textBlock = firstResponse.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text'
    )
    const fullText = textBlock?.text || ''

    if (fullText) {
      // Emit as a single content chunk (client reassembles)
      event.node.res.write(
        JSON.stringify({ type: 'content', content: fullText }) + '\n'
      )
    }

    emitRecommendation(event, fullText)

    const suggestions = buildDefaultSuggestions(contextTicker, '')
    if (suggestions.length > 0) {
      event.node.res.write(
        JSON.stringify({ type: 'suggestions', content: suggestions }) + '\n'
      )
    }

    await emitRelatedTickers(event, fullText, contextTicker)
    return
  }

  // ----------------------------
  // Path B: Tool call → execute tool, then stream final answer
  // ----------------------------
  const toolName = toolUseBlock.name
  const args = (toolUseBlock.input || {}) as Record<string, any>

  let toolResult: any = null
  let toolResultForModel: any = null
  let ticker: string | null = contextTicker
  let viewType: string = 'text'
  let rawData: any = null

  if (toolName === 'view_market_data') {
    const t = normalizeTicker(args.ticker || contextTicker)
    const view = typeof args.view === 'string' ? args.view : 'report'
    if (
      !t ||
      !isValidTicker(t) ||
      !['report', 'chart', 'dividends', 'analysis', 'price'].includes(view)
    ) {
      toolResult = { error: 'Ticker/view inválidos' }
      toolResultForModel = toolResult
    } else {
      ticker = t
      viewType = view
      event.node.res.write(
        JSON.stringify({
          type: 'status',
          content: `📊 Buscando dados de ${t}...`,
        }) + '\n'
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
      JSON.stringify({
        type: 'status',
        content: '🧮 Executando: Calculadora...',
      }) + '\n'
    )
    const iv = Number(args.initialValue)
    const mv = Number(args.monthlyValue)
    const ir = Number(args.interestRate)
    const p = Number(args.period)
    const periodType =
      args.periodType === 'months' || args.periodType === 'years'
        ? args.periodType
        : 'years'
    const interestPeriod =
      args.interestPeriod === 'month' || args.interestPeriod === 'year'
        ? args.interestPeriod
        : 'year'
    if (
      !Number.isFinite(iv) ||
      !Number.isFinite(mv) ||
      !Number.isFinite(ir) ||
      !Number.isFinite(p) ||
      p <= 0
    ) {
      toolResult = { error: 'Parâmetros inválidos' }
    } else {
      toolResult = calculateCompoundInterest(iv, mv, ir, p, periodType, interestPeriod)
    }
    toolResultForModel = sanitizeToolResult(toolName, toolResult)
    event.node.res.write(
      JSON.stringify({
        type: 'tool-used',
        content: { name: toolName, result: toolResult },
      }) + '\n'
    )
  } else if (toolName === 'calculate_planning') {
    event.node.res.write(
      JSON.stringify({
        type: 'status',
        content: '🧮 Executando: Planejamento Financeiro...',
      }) + '\n'
    )
    const gv = Number(args.goalValue)
    const mc = Number(args.monthlyContribution)
    const strategy =
      args.strategy === 'rentabilidade' || args.strategy === 'seguranca'
        ? args.strategy
        : 'seguranca'
    if (!Number.isFinite(gv) || !Number.isFinite(mc) || gv <= 0 || mc <= 0) {
      toolResult = { error: 'Parâmetros inválidos' }
    } else {
      toolResult = await calculatePlanning(gv, mc, strategy)
    }
    toolResultForModel = sanitizeToolResult(toolName, toolResult)
    event.node.res.write(
      JSON.stringify({
        type: 'tool-used',
        content: { name: toolName, result: toolResult },
      }) + '\n'
    )
  } else if (toolName === 'calculate_stock_return') {
    event.node.res.write(
      JSON.stringify({
        type: 'status',
        content: '🧮 Executando: Simulação de Rentabilidade...',
      }) + '\n'
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
      typeof args.reinvestDividends === 'boolean'
        ? args.reinvestDividends
        : true

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
      JSON.stringify({
        type: 'tool-used',
        content: { name: toolName, result: toolResult },
      }) + '\n'
    )
  } else {
    toolResult = { error: 'Ferramenta não suportada' }
    toolResultForModel = toolResult
  }

  // Emit suggestions after tool execution
  const suggestions = buildDefaultSuggestions(ticker, toolName)
  if (suggestions.length > 0) {
    event.node.res.write(
      JSON.stringify({ type: 'suggestions', content: suggestions }) + '\n'
    )
  }

  // ----------------------------
  // Step 2: Second call (streaming) with tool result
  // ----------------------------
  event.node.res.write(
    JSON.stringify({ type: 'status', content: '✅ Gerando resposta...' }) + '\n'
  )

  const toolResultPayload = JSON.stringify({
    tool: toolName,
    result: toolResultForModel,
    context: {
      ticker,
      viewType,
      data: sanitizeContext(viewType, rawData),
    },
  })

  // Claude messages for second call:
  // 1. original user message
  // 2. assistant with tool_use (from first response)
  // 3. user with tool_result
  const finalMessages: Anthropic.Messages.MessageParam[] = [
    ...baseMessages,
    { role: 'assistant', content: firstResponse.content },
    {
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content: toolResultPayload,
        },
      ],
    },
  ]

  const finalAbortController = new AbortController()
  const finalTimeoutId = setTimeout(
    () => finalAbortController.abort(),
    CLAUDE_STREAM_TIMEOUT_MS
  )
  const finalOnClose = () => finalAbortController.abort()
  event.node.req.on('close', finalOnClose)
  event.node.res.on('close', finalOnClose)

  let finalFullContent = ''
  let finalError: any = null
  let finalInputTokens = 0
  let finalOutputTokens = 0

  try {
    const stream = client.messages.stream(
      {
        model: chatModel,
        max_tokens: 4096,
        system: systemPrompt,
        tools: chatTools,
        messages: finalMessages,
      },
      { signal: finalAbortController.signal }
    )

    for await (const streamEvent of stream) {
      if (event.node.res.writableEnded) break

      if (
        streamEvent.type === 'content_block_delta' &&
        streamEvent.delta.type === 'text_delta'
      ) {
        const textChunk = streamEvent.delta.text
        finalFullContent += textChunk
        event.node.res.write(
          JSON.stringify({ type: 'content', content: textChunk }) + '\n'
        )
      }

      if (streamEvent.type === 'message_start' && streamEvent.message.usage) {
        finalInputTokens = streamEvent.message.usage.input_tokens || 0
      }
      if (streamEvent.type === 'message_delta' && streamEvent.usage) {
        finalOutputTokens =
          streamEvent.usage.output_tokens || finalOutputTokens
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
      (error as any)?.name === 'AbortError' ||
      (error as any)?.code === 'ABORT_ERR'
    console.error('Claude Second Call Error:', error)
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
    console.log(
      `[chat:${requestId}] unified_final_done model=${chatModel} input=${finalInputTokens} output=${finalOutputTokens}`
    )
  }

  emitRecommendation(event, finalFullContent)
  await emitRelatedTickers(event, finalFullContent, ticker)
}
