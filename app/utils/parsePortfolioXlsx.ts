/**
 * Parse XLSX in the same format as "Posicao Feb 7 2026.xlsx":
 * Headers: Produto, Instituição, Conta, Código de Negociação, ..., Quantidade, ..., Preço de Fechamento, Valor Atualizado
 * Returns array of { ticker, quantity, average_price } (average_price = Preço de Fechamento).
 */
export interface ParsedPosition {
  ticker: string
  quantity: number
  average_price: number
}

export async function parsePortfolioXlsx(file: File): Promise<ParsedPosition[]> {
  const XLSX = await import('xlsx')
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return []
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' }) as string[][]
  if (data.length < 2) return []
  const header = data[0].map((h) => String(h ?? '').trim())
  const idxTicker = header.findIndex((h) => /c[oó]digo\s+de\s+negocia[cç][aã]o/i.test(h))
  const idxQty = header.findIndex((h) => String(h).trim().toLowerCase() === 'quantidade')
  const idxQtyFallback = header.findIndex((h) => /quantidade/i.test(String(h)) && !/dispon|indispon/i.test(String(h)))
  const quantityCol = idxQty >= 0 ? idxQty : idxQtyFallback
  const idxPrice = header.findIndex((h) => /pre[cç]o\s+de\s+fechamento/i.test(h))
  if (idxTicker < 0 || quantityCol < 0 || idxPrice < 0) {
    throw new Error('Planilha não contém as colunas esperadas: Código de Negociação, Quantidade, Preço de Fechamento.')
  }
  const positions: ParsedPosition[] = []
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    const ticker = String(row[idxTicker] ?? '').trim().toUpperCase()
    if (!ticker) continue
    const qty = Number(row[quantityCol])
    const price = Number(String(row[idxPrice] ?? '0').replace(',', '.'))
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) continue
    positions.push({ ticker, quantity: qty, average_price: price })
  }
  return positions
}
