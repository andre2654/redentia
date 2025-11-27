import { getMarketData } from '../utils/market'
import { streamAgentResponse } from '../utils/agent'
import { routeRequest } from '../utils/router'
import { formatMarketData } from '../utils/formatter'
import {
  calculateCompoundInterest,
  calculatePlanning,
  calculateStockReturn,
} from '../utils/calculators'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { message, route, ticker: contextTicker } = body

  // 1. Route Request (Router Agent)
  // The router decides if this is a tool execution, a data view, or a simple chat
  const action = await routeRequest(message, contextTicker)

  let type = 'text'
  let ticker = contextTicker || null
  let toolResult = null
  let toolName = ''

  // Handle Router Action
  if (action.type === 'tool') {
    toolName = action.name
    console.log(`[Router] Executing tool: ${toolName}`)
    
    try {
      if (toolName === 'calculate_compound_interest') {
        const {
          initialValue,
          monthlyValue,
          interestRate,
          period,
          periodType,
          interestPeriod,
        } = action.args
        toolResult = calculateCompoundInterest(
          initialValue,
          monthlyValue,
          interestRate,
          period,
          periodType,
          interestPeriod
        )
      } else if (toolName === 'calculate_planning') {
        const { goalValue, monthlyContribution, strategy } = action.args
        toolResult = await calculatePlanning(
          goalValue,
          monthlyContribution,
          strategy
        )
      } else if (toolName === 'calculate_stock_return') {
        const {
          tickers,
          ticker: singleTicker,
          initialInvestment,
          monthlyInvestment,
          periodYears,
          reinvestDividends,
        } = action.args
        
        // Handle both single 'ticker' (legacy/fallback) and 'tickers' array
        const targetTickers = tickers || (singleTicker ? [singleTicker] : [])
        
        // Update context ticker if provided (use first one)
        if (targetTickers.length > 0) ticker = targetTickers[0]

        toolResult = await calculateStockReturn(
          targetTickers,
          initialInvestment,
          monthlyInvestment,
          periodYears || 1, // Default to 1 year if not specified
          reinvestDividends
        )
      }
    } catch (e) {
      console.error('Tool execution failed', e)
    }

  } else if (action.type === 'data') {
    console.log(`[Router] View Data: ${action.view} for ${action.ticker}`)
    type = action.view
    ticker = action.ticker
  } else if (action.type === 'chat') {
    console.log(`[Router] Chat mode`)
    type = 'text'
    if (action.ticker) ticker = action.ticker
  }

  // Safety check: If we have an asset-specific type but NO ticker, revert to text
  if (
    ['price', 'chart', 'dividends', 'analysis', 'report'].includes(type) &&
    !ticker
  ) {
    type = 'text'
  }

  // 2. Fetch Data (if needed)
  let rawData = null
  if (ticker && type !== 'text') {
    try {
      rawData = await getMarketData(ticker, type)
    } catch (e) {
      console.error('Error fetching market data', e)
    }
  }

  // 3. Prepare Structured Data (Deterministic)
  const structuredData = {
    ticker,
    type,
    data: formatMarketData(type, rawData),
    meta: {
      summary: '', // Will be filled by stream
      recommendation: null,
    },
  }

  // 4. Start Stream
  event.node.res.setHeader('Content-Type', 'application/x-ndjson')
  event.node.res.setHeader('Cache-Control', 'no-cache')
  event.node.res.setHeader('Connection', 'keep-alive')

  // Send initial data event
  event.node.res.write(
    JSON.stringify({ type: 'data', content: structuredData }) + '\n'
  )

  // Stream AI response
  await streamAgentResponse(
    event,
    ticker,
    type,
    rawData,
    message,
    toolResult,
    toolName
  )

  event.node.res.end()
})
