import OpenAI from 'openai'

export type RouterAction =
    | { type: 'tool'; name: string; args: any }
    | { type: 'data'; view: 'report' | 'chart' | 'dividends' | 'analysis' | 'price'; ticker: string }
    | { type: 'chat'; ticker?: string | null }

export const routeRequest = async (userMessage: string, contextTicker?: string | null): Promise<RouterAction> => {
    const config = useRuntimeConfig()
    if (!config.openaiApiKey) return { type: 'chat', ticker: contextTicker }

    const openai = new OpenAI({ apiKey: config.openaiApiKey, timeout: 15_000 })
    const routerModel = (config as any).openaiRouterModel || 'gpt-4o'

    const tools = [
        // Calculators
        {
            type: 'function',
            function: {
                name: 'calculate_compound_interest',
                description: 'Calculate compound interest simulation (Simulação de Juros Compostos). Use when user asks about generic investment returns without a specific stock history, or explicitly asks for compound interest.',
                parameters: {
                    type: 'object',
                    properties: {
                        initialValue: { type: 'number', description: 'Initial investment amount' },
                        monthlyValue: { type: 'number', description: 'Monthly contribution amount' },
                        interestRate: { type: 'number', description: 'Interest rate (percentage)' },
                        period: { type: 'number', description: 'Duration of investment' },
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
                description: 'Calculate financial planning to reach a goal (Planejamento Financeiro). Use when user has a target amount (goal) and wants to know how long it takes or how much to invest.',
                parameters: {
                    type: 'object',
                    properties: {
                        goalValue: { type: 'number', description: 'Target financial goal amount' },
                        monthlyContribution: { type: 'number', description: 'Monthly contribution amount' },
                        strategy: { type: 'string', enum: ['rentabilidade', 'seguranca'], description: 'Investment strategy. DEFAULT to "seguranca" if not specified by the user.' },
                    },
                    required: ['goalValue', 'monthlyContribution', 'strategy'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'calculate_stock_return',
                description: 'Calculate historical return of specific stocks/assets (Simulação de Rentabilidade Real). Use when user asks "Quanto rende R$ X em [TICKER]?", "Simular [TICKER]...", "Se eu tivesse investido em [TICKER]...". Can handle multiple tickers.',
                parameters: {
                    type: 'object',
                    properties: {
                        tickers: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of stock ticker symbols (e.g. ["PETR4", "VALE3"])'
                        },
                        initialInvestment: { type: 'number', description: 'Initial investment amount (default 1000 if not specified)' },
                        monthlyInvestment: { type: 'number', description: 'Monthly investment amount' },
                        periodYears: { type: 'number', description: 'Period in years. Extract from text (e.g. "10 anos" -> 10, "60 meses" -> 5). Default to 1 if not mentioned.' },
                        reinvestDividends: { type: 'boolean', default: true },
                    },
                    required: ['tickers'],
                },
            },
        },
        // Market Data Views
        {
            type: 'function',
            function: {
                name: 'view_market_data',
                description: 'View market data for a specific asset. Use for general questions about an asset like "How is PETR4?", "Show me the chart", "Dividends of VALE3".',
                parameters: {
                    type: 'object',
                    properties: {
                        ticker: { type: 'string', description: 'The asset ticker' },
                        view: {
                            type: 'string',
                            enum: ['report', 'chart', 'dividends', 'analysis', 'price'],
                            description: 'The type of data to view. "report" is for general/full info. "chart" for graphs. "dividends" for earnings. "analysis" for fundamental indicators.'
                        }
                    },
                    required: ['ticker', 'view']
                }
            }
        }
    ]

    try {
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are the Router Agent for a financial platform. Your job is to decide the best action for the user's request.
          
          Current Context Ticker: ${contextTicker || 'None'}

          Rules:
          1. If the user asks a question that implies a CALCULATION or SIMULATION (e.g., "How much yields...", "If I invest...", "Planning for...", "Quanto rende...", "Simular..."), YOU MUST USE A CALCULATOR TOOL ('calculate_*').
          2. Specifically for "Quanto rende R$ X em [TICKER]...", use 'calculate_stock_return'.
          3. If the user mentions a GOAL amount (e.g. "Quero chegar a 1 milhão", "Juntar 100k") and a contribution (e.g. "Tenho X por mes"), YOU MUST USE 'calculate_planning'.
          4. If the user asks for information about an asset (price, chart, dividends, general info), use 'view_market_data'.
          5. If the user just wants to chat or asks general questions without a specific intent or asset, do NOT call any tool.
          6. If the user mentions a company name, convert it to the most likely B3 ticker (e.g. Petrobras -> PETR4, Vale -> VALE3).
          7. IMPORTANT: If the user provides numbers (money, time) and a ticker, it is almost certainly a simulation request.
          
          Return the tool call if applicable. If not, the system will default to a general chat response.`
                },
                { role: 'user', content: userMessage },
            ],
            model: routerModel,
            tools: tools as any,
            tool_choice: 'auto',
            temperature: 0
        })

        const toolCall = response.choices[0]?.message?.tool_calls?.[0]

        if (toolCall) {
            const args = JSON.parse(toolCall.function.arguments)
            const name = toolCall.function.name

            if (name === 'view_market_data') {
                return {
                    type: 'data',
                    view: args.view,
                    ticker: args.ticker.toUpperCase()
                }
            }

            return {
                type: 'tool',
                name: name,
                args: args
            }
        }

        // If no tool called, check if we can just extract a ticker for chat context
        // But for now, let's return chat.
        // We can try to extract ticker if it's a general question about a stock but the model didn't trigger view_market_data (unlikely with gpt-4o)

        return { type: 'chat', ticker: contextTicker }

    } catch (error) {
        console.error('Router error:', error)
        return { type: 'chat', ticker: contextTicker }
    }
}
