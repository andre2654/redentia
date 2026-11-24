import { volumesDeTickers } from '../utils/volumes-tickers'

/** Volume do pregão para os tickers do recorte de FIIs. Só cota de FII. */
export default defineEventHandler((event) => {
  const bruto = String(getQuery(event).tickers ?? '')
  const tickers = bruto.split(',').map((t) => t.trim().toUpperCase()).filter((t) => /^[A-Z][A-Z0-9]{3}11$/.test(t)).slice(0, 100)
  if (!tickers.length) return {}
  return volumesDeTickers(tickers)
})
