/**
 * Faixa "Mercado agora" (presente em todas as telas dos designs).
 * Padrão swap real+fallback (herdado do Atlas): começa com o seed do design
 * (nunca vazio), hidrata com dados reais no client, e QUALQUER erro degrada
 * de volta pro seed — a faixa nunca quebra uma página.
 *
 * Fontes: GET /market/snapshot (IBOV/IFIX/macro) · GET /api/chat/tickers/snapshot
 * (batch PETR4) · GET /crypto/btc (Bitcoin).
 */
export interface TickerItem {
  n: string          // nome curto (IBOV, Dólar…)
  v: string          // valor formatado pt-BR
  pct: string | null // variação formatada ('+0,45%') — null = sem variação (CDI)
  dir: 'up' | 'down' | 'flat'
}

const SEED: TickerItem[] = [
  { n: 'IBOV', v: '131.480', pct: '+0,45%', dir: 'up' },
  { n: 'IFIX', v: '3.412', pct: '+0,12%', dir: 'up' },
  { n: 'Dólar', v: 'R$ 5,42', pct: '-0,31%', dir: 'down' },
  { n: 'PETR4', v: 'R$ 38,25', pct: '+0,76%', dir: 'up' },
  { n: 'Bitcoin', v: 'R$ 512.340', pct: '+1,24%', dir: 'up' },
  { n: 'CDI', v: '10,75% a.a.', pct: null, dir: 'flat' },
]

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function pctFmt(x: unknown): { pct: string | null; dir: TickerItem['dir'] } {
  const n = Number(x)
  if (!Number.isFinite(n)) return { pct: null, dir: 'flat' }
  const sign = n > 0 ? '+' : ''
  return { pct: `${sign}${nf2.format(n)}%`, dir: n > 0 ? 'up' : n < 0 ? 'down' : 'flat' }
}

export function useMarketTicker() {
  const items = useState<TickerItem[]>('nu:ticker', () => SEED)
  const loaded = useState<boolean>('nu:ticker-loaded', () => false)
  const { publicFetch } = useApi()

  async function hydrate() {
    if (loaded.value) return
    try {
      const [snap, quotes, btc] = await Promise.all([
        publicFetch<any>('/market/snapshot?scope=ibov').catch(() => null),
        $fetch<any>('/api/chat/tickers/snapshot?symbols=PETR4').catch(() => null),
        publicFetch<any>('/crypto/btc').catch(() => null),
      ])

      const next: TickerItem[] = []
      const ibov = snap?.indices_br?.IBOV
      const ifix = snap?.indices_br?.IFIX
      if (ibov?.value != null) next.push({ n: 'IBOV', v: nf0.format(ibov.value), ...pctFmt(ibov.change_pct) })
      if (ifix?.value != null) next.push({ n: 'IFIX', v: nf0.format(ifix.value), ...pctFmt(ifix.change_pct) })
      const usd = snap?.macro?.usd_brl
      if (usd?.value != null) next.push({ n: 'Dólar', v: `R$ ${nf2.format(usd.value)}`, ...pctFmt(usd.change_pct) })
      const petr = quotes?.snapshots?.PETR4
      if (petr?.price != null) next.push({ n: 'PETR4', v: `R$ ${nf2.format(petr.price)}`, ...pctFmt(petr.changePct1d) })
      const btcData = btc?.data ?? btc
      if (btcData?.price_brl != null) next.push({ n: 'Bitcoin', v: `R$ ${nf0.format(btcData.price_brl)}`, ...pctFmt(btcData.change_24h) })
      const cdi = snap?.macro?.cdi
      if (cdi?.value != null) next.push({ n: 'CDI', v: `${nf2.format(cdi.value)}% a.a.`, pct: null, dir: 'flat' })

      // Só troca o seed se veio conteúdo suficiente pra faixa não ficar rala.
      if (next.length >= 3) {
        items.value = next
        loaded.value = true
      }
    } catch {
      /* mantém o seed — a faixa nunca quebra a página */
    }
  }

  onMounted(hydrate)

  return { items, loaded }
}
