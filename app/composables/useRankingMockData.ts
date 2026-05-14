// Dados mockados pra previews de ranking (V1-V5).
// Top 10 ações por Dividend Yield (cenário comum pros rankings da Redentia).
// Usado pelas 5 preview pages em /ranking-preview/.

export type RankingAsset = {
  rank: number
  ticker: string
  name: string
  sector: string
  dy: number
  price: number
  change30d: number
  change12m: number
  logo?: string
  sparkline: number[]
}

export function useRankingMockData() {
  const assets: RankingAsset[] = [
    { rank: 1, ticker: 'TAEE11', name: 'Taesa', sector: 'Energia', dy: 12.4, price: 33.21, change30d: 2.1, change12m: 18.5, sparkline: [30, 31, 30.5, 32, 31.8, 32.5, 33.21] },
    { rank: 2, ticker: 'ITUB4', name: 'Itaú Unibanco', sector: 'Bancos', dy: 8.7, price: 28.45, change30d: 1.5, change12m: 12.3, sparkline: [25.5, 26, 26.8, 27.2, 27.5, 28, 28.45] },
    { rank: 3, ticker: 'BBAS3', name: 'Banco do Brasil', sector: 'Bancos', dy: 8.2, price: 45.10, change30d: -0.5, change12m: 18.1, sparkline: [38, 40, 42, 41, 43, 44.5, 45.10] },
    { rank: 4, ticker: 'KLBN11', name: 'Klabin', sector: 'Papel & Celulose', dy: 7.8, price: 28.00, change30d: -1.2, change12m: -3.4, sparkline: [29, 28.5, 28.8, 27.5, 28.2, 28, 28.00] },
    { rank: 5, ticker: 'CMIN3', name: 'CSN Mineração', sector: 'Mineração', dy: 7.5, price: 5.80, change30d: 3.4, change12m: -8.2, sparkline: [6.3, 6.1, 5.9, 5.6, 5.7, 5.75, 5.80] },
    { rank: 6, ticker: 'PETR4', name: 'Petrobras', sector: 'Petróleo', dy: 7.2, price: 32.15, change30d: 4.2, change12m: 14.7, sparkline: [28, 29.5, 30.8, 30.2, 31, 31.8, 32.15] },
    { rank: 7, ticker: 'CPLE6', name: 'Copel', sector: 'Energia', dy: 6.9, price: 11.50, change30d: 1.8, change12m: 22.4, sparkline: [9.4, 9.8, 10.3, 10.7, 11, 11.3, 11.50] },
    { rank: 8, ticker: 'CMIG4', name: 'Cemig', sector: 'Energia', dy: 6.7, price: 9.80, change30d: 0.5, change12m: 8.9, sparkline: [9, 9.2, 9.5, 9.4, 9.6, 9.7, 9.80] },
    { rank: 9, ticker: 'SAPR11', name: 'Sanepar', sector: 'Saneamento', dy: 6.5, price: 24.90, change30d: -2.1, change12m: 5.2, sparkline: [23.6, 24.2, 25.1, 25.5, 24.8, 25, 24.90] },
    { rank: 10, ticker: 'EGIE3', name: 'Engie Brasil', sector: 'Energia', dy: 6.3, price: 48.75, change30d: 1.1, change12m: 9.8, sparkline: [44.4, 45.5, 46.8, 47.2, 47.8, 48.4, 48.75] },
  ]

  function formatBRL(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return { assets, formatBRL }
}
