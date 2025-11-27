import OpenAI from 'openai'
import type { H3Event } from 'h3'

// Helper to reduce token usage by summarizing large datasets
function sanitizeContext(type: string, rawData: any) {
    if (!rawData) return null

    // Helper to safely get data
    const unwrap = (d: any) => (d && d.data) ? d.data : d

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
            price_to_book: keyStats.price_to_book || fund?.pvp
        }

        // Summarize chart (don't send 365 points)
        const chartPoints = Array.isArray(chart) ? chart : (chart?.data || [])
        let chartSummary = 'No chart data'
        if (Array.isArray(chartPoints) && chartPoints.length > 0) {
            const start = chartPoints[0]
            const end = chartPoints[chartPoints.length - 1]
            // Find min/max
            const values = chartPoints.map((p: any) => p.value ?? p.close ?? p.price ?? 0)
            const min = Math.min(...values)
            const max = Math.max(...values)
            chartSummary = `Start: ${JSON.stringify(start)}, End: ${JSON.stringify(end)}, Min: ${min}, Max: ${max}, Points: ${chartPoints.length}`
        }

        return {
            price: price,
            fundamentals: fundamentalsSummary,
            chart_summary: chartSummary,
            dividends: Array.isArray(divs) ? divs.slice(0, 10) : []
        }
    }

    // For chart type, just send summary
    if (type === 'chart') {
        const points = Array.isArray(rawData) ? rawData : (rawData.data || [])
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

export const identifyTicker = async (userMessage: string): Promise<string | null> => {
    const config = useRuntimeConfig()
    if (!config.openaiApiKey) return null

    const openai = new OpenAI({ apiKey: config.openaiApiKey })

    try {
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Identifique o código do ativo (ticker) na mensagem do usuário.
                    - Retorne APENAS o ticker (ex: PETR4, VALE3, AAPL).
                    - Se o usuário falar o nome da empresa, converta para o ticker mais comum na B3 (Brasil).
                    - Se não houver menção a empresa ou ativo, retorne "NULL".
                    - Não explique nada, apenas o código.`
                },
                { role: 'user', content: userMessage }
            ],
            model: 'gpt-4o-mini', // Use a cheaper/faster model for this simple task
            temperature: 0
        })

        const content = response.choices[0]?.message?.content?.trim()
        if (!content || content === 'NULL') return null

        // Basic validation to ensure it looks like a ticker
        if (content.length < 3 || content.length > 10) return null

        return content.toUpperCase()
    } catch (error) {
        console.error('Error identifying ticker:', error)
        return null
    }
}

export const identifyIntent = async (userMessage: string): Promise<string> => {
    const config = useRuntimeConfig()
    if (!config.openaiApiKey) return 'text'

    const openai = new OpenAI({ apiKey: config.openaiApiKey })

    try {
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Classifique a intenção do usuário em relação a dados financeiros.
                    Categorias:
                    - 'price': Preço atual, cotação, quanto custa.
                    - 'chart': Gráfico de PREÇO, histórico de cotação, evolução do valor, tendência (subindo/caindo), performance.
                    - 'dividends': Dividendos, proventos, rendimentos, gráfico de dividendos, data com.
                    - 'analysis': Análise fundamentalista, P/L, indicadores, vale a pena, recomendação, qualidade da empresa.
                    - 'report': Relatório completo, resumo geral, tudo sobre o ativo, análise completa, "fale sobre X", "me fale do banco do brasil".
                    - 'text': Conversa geral, sem pedido específico de dados visuais.

                    Retorne APENAS o nome da categoria.
                    Se houver erros de digitação (ex: "realtorio"), tente inferir a intenção correta.`
                },
                { role: 'user', content: userMessage }
            ],
            model: 'gpt-4o-mini',
            temperature: 0
        })

        const content = response.choices[0]?.message?.content?.trim().toLowerCase()
        const validTypes = ['price', 'chart', 'dividends', 'analysis', 'report', 'text']

        if (content && validTypes.includes(content)) {
            return content
        }
        return 'text'
    } catch (error) {
        console.error('Error identifying intent:', error)
        return 'text'
    }
}

export const streamAgentResponse = async (
    event: H3Event,
    ticker: string,
    type: string,
    rawData: any,
    userMessage: string
) => {
    const config = useRuntimeConfig()

    if (!config.openaiApiKey) {
        event.node.res.write(JSON.stringify({ type: 'error', content: 'API Key missing' }))
        return
    }

    const openai = new OpenAI({
        apiKey: config.openaiApiKey
    })

    const systemPrompt = `
    Você é o agente financeiro da Redentia.
    
    Contexto:
    - Ticker identificado: ${ticker || 'Nenhum (Pergunta Geral)'}
    - Tipo de solicitação: ${type}
    
    Seus objetivos:
    1. Se um ticker foi identificado, analise os dados fornecidos (${type}).
    2. Se NÃO houver ticker, responda como um especialista de mercado financeiro sobre o tema perguntado (tendências, conceitos, economia), usando seu conhecimento geral. NÃO diga "não há informações sobre o ativo" se a pergunta for genérica.
    3. Responder a pergunta do usuário de forma direta e explicativa.
    4. Se houver dados suficientes do ativo, forneça uma recomendação de investimento (Compra, Manter ou Venda) no início.
    5. Se o tipo for "report" ou "analysis" E houver um ativo, cite os números principais (Preço atual, P/L, Dividend Yield, Setor, Valor de Mercado) QUE ESTIVEREM DISPONÍVEIS.
    6. Use os dados brutos fornecidos para embasar sua análise. Não invente números.
    7. IMPORTANTE: Mesmo que faltem dados fundamentais, faça a melhor análise possível com o preço e histórico disponíveis.

    Formato de saída OBRIGATÓRIO:
    - Primeira linha: "REC: [BUY|HOLD|SELL|NULL]" (apenas se fizer sentido dar recomendação para um ativo específico)
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
            data: contextData
        }
    })

    try {
        const stream = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'gpt-4o',
            stream: true,
        })

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
                event.node.res.write(JSON.stringify({ type: 'content', content }) + '\n')
            }
        }

    } catch (error) {
        console.error('OpenAI Stream Error:', error)
        event.node.res.write(JSON.stringify({ type: 'error', content: 'Erro na IA' }) + '\n')
    }
}

