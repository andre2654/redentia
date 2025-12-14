function unwrap(data: any) {
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data
  }
  return data
}

export const formatMarketData = (type: string, rawData: any) => {
  const data = unwrap(rawData)
  if (!data) return null

  if (type === 'price') {
    // Handle IAsset structure or simple object
    const price = data.market_price ?? data.close ?? data.price ?? 0
    const change = data.change_percent ?? data.change ?? data.changePercent ?? 0
    const lastUpdate =
      data.updated_at ?? data.updatedAt ?? new Date().toISOString()

    return {
      price: Number(price).toFixed(2),
      change: Number(change).toFixed(2),
      lastUpdate,
    }
  }

  if (type === 'chart') {
    // Handle { data: [...] } or [...]
    const points = Array.isArray(data) ? data : data.data || []

    if (!Array.isArray(points)) return []

    return points
      .map((p: any) => ({
        x: p.date || p.time || p.x || p.created_at,
        y: p.value ?? p.close ?? p.price ?? p.y ?? 0,
      }))
      .filter((p: any) => p.x && p.y !== undefined)
      .slice(-90)
  }

  if (type === 'dividends') {
    const divs = Array.isArray(data) ? data : data.data || []
    if (!Array.isArray(divs)) return []

    return divs.slice(0, 50).map((d: any) => ({
      date:
        d.paymentDate ||
        d.date ||
        d.approved_date ||
        d.payment_date ||
        d.last_date_prior,
      dividend: d.value || d.amount || d.rate || d.value_cash || d.dividend,
    }))
  }

  if (type === 'analysis') {
    // Handle FundamentusApiResponse or simplified object
    let pe = data.pl ?? data.pe
    let dy = data.dy ?? data.dividendYield
    let sector = data.sector
    let marketCap = data.marketCap ?? data.market_cap

    // Try to extract from FundamentusApiResponse structure or other common places
    if (data.key_statistics) {
      if (!pe)
        pe = data.key_statistics.forward_pe || data.key_statistics.trailing_eps
      if (!dy) dy = data.key_statistics.dividend_yield
      if (!marketCap) marketCap = data.key_statistics.market_cap
    }

    if (data.summary_detail) {
      if (!marketCap) marketCap = data.summary_detail.market_cap
      if (!dy) dy = data.summary_detail.dividend_yield
    }

    if (data.price) {
      if (!marketCap) marketCap = data.price.market_cap
    }

    if (data.summary_profile) {
      if (!sector) sector = data.summary_profile.sector
    }

    // Format values
    const formatVal = (v: any) => {
      if (v === undefined || v === null || v === '-') return '-'
      const n = parseFloat(v)
      if (isNaN(n)) return v
      return n.toFixed(2)
    }

    const formatCap = (v: any) => {
      if (!v) return '-'
      const n = parseFloat(v)
      if (isNaN(n)) return v
      if (n > 1000000000) return (n / 1000000000).toFixed(1) + 'B'
      if (n > 1000000) return (n / 1000000).toFixed(1) + 'M'
      return n.toFixed(0)
    }

    const formatted = {
      pe: formatVal(pe),
      dy: formatVal(dy),
      sector: sector || '-',
      marketCap: formatCap(marketCap),
    }

    return formatted
  }

  if (type === 'report') {
    // rawData here is the object constructed in market.ts { price, chart, dividends, fundamentals }
    // We don't unwrap rawData itself because it's our custom object, but we unwrap its properties inside the recursive calls

    // Merge fundamentals and price for analysis context
    const fundamentalsData = unwrap(rawData.fundamentals)
    const priceData = unwrap(rawData.price)
    const analysisData = { ...fundamentalsData, ...priceData }

    return {
      price: formatMarketData('price', rawData.price),
      chart: formatMarketData('chart', rawData.chart),
      dividends: formatMarketData('dividends', rawData.dividends),
      analysis: formatMarketData('analysis', analysisData),
    }
  }

  return data
}
