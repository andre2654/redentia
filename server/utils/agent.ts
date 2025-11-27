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

export const streamAgentResponse = async (
  event: H3Event,
  ticker: string,
  type: string,
  rawData: any,
  userMessage: string,
  toolResult: any = null,
  toolName: string = ''
) => {
  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    event.node.res.write(
      JSON.stringify({ type: 'error', content: 'API Key missing' })
    )
    return
  }

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  })

  const systemPrompt = `
    Você é o agente financeiro da Redentia.
    
    Contexto:
    - Ticker identificado: ${ticker || 'Nenhum (Pergunta Geral)'}
    - Tipo de solicitação: ${type}
    ${
      toolResult
        ? `- Resultado da Ferramenta (${toolName}): ${JSON.stringify(toolResult)}`
        : ''
    }
    
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

  const userPrompt = JSON.stringify({
    userMessage,
    context: {
      ticker,
      type,
      data: contextData,
      toolResult,
    },
  })

  try {
    if (toolResult) {
      event.node.res.write(
        JSON.stringify({
          type: 'tool-used',
          content: { name: toolName, result: toolResult },
        }) + '\n'
      )
    }

    const stream = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'gpt-4o',
      stream: true,
    })

    let fullContent = ''

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        fullContent += content
        event.node.res.write(
          JSON.stringify({ type: 'content', content }) + '\n'
        )
      }
    }

    // Extract tickers from fullContent
    const tickerRegex = /[A-Z]{4}[0-9]{1,2}/g
    const matches = fullContent.match(tickerRegex)

    if (matches) {
      // Filter unique tickers and exclude the main ticker if present
      const uniqueTickers = [...new Set(matches)].filter((t) => t !== ticker)

      if (uniqueTickers.length > 0) {
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
    console.error('OpenAI Stream Error:', error)
    event.node.res.write(
      JSON.stringify({ type: 'error', content: 'Erro na IA' }) + '\n'
    )
  }
}
