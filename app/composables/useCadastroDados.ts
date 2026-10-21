import { acaoFetchNewsByTicker, acaoFetchPrices } from '~/services/acao'
import { marketFetchBriefingToday, marketFetchMovers, marketFetchQuote } from '~/services/market'

/**
 * O dado real dos heróis da folha de cadastro e do painel do login: a linha
 * do mês do ativo com o porquê do dia, a frase do resumo das 7h30 e a maior
 * alta da bolsa. Client-only e silencioso: o que falhar volta null e o herói
 * desenha sem aquela parte.
 */
export interface DadosAtivo {
  ticker: string
  logo: string | null
  preco: number | null
  variacao: number | null
  serie: number[]
  /** a manchete do dia que explica o movimento, já encurtada */
  motivo: string | null
}

export interface DadosResumo {
  frase: string | null
  minutos: number | null
}

export interface DadosMaiorAlta {
  ticker: string
  nome: string
  variacao: number
}

const BASE = '/api/backend'
const LOGO_RE = /^[A-Z]{4}\d{1,2}$/
const DIA_MS = 86_400_000

// "MAGAZ LUIZA ON NM" (nome da B3 em campo fixo) vira "Magaz Luiza"
function nomeLimpo(raw: string | null | undefined, ticker: string): string {
  const base = (raw ?? '').slice(0, 12).replace(/\s+/g, ' ').trim()
  return base ? base.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : ticker
}

export function useCadastroDados() {
  async function ativo(tickerBruto: string): Promise<DadosAtivo> {
    const ticker = tickerBruto.trim().toUpperCase()
    const [cot, precos, noticias] = await Promise.allSettled([
      marketFetchQuote(ticker),
      acaoFetchPrices(BASE, ticker, '1mo'),
      LOGO_RE.test(ticker) ? acaoFetchNewsByTicker(BASE, ticker) : Promise.resolve({ data: [] }),
    ])
    const q = cot.status === 'fulfilled' ? cot.value?.data : null
    const serie = precos.status === 'fulfilled'
      ? (precos.value?.data ?? []).map((p) => p.market_price).filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
      : []
    // O porquê é a manchete de até um dia e meio cujo TÍTULO fala do papel: o
    // /news/ticker devolve matéria marcada com dezenas de tickers, e o resumo
    // de um "Tesouro Direto: taxas andam de lado" citava a WEG (saiu como o
    // porquê dela no teste). Vale o código (WEGE3) ou o nome da empresa (o da
    // B3, antes do "ON"/"PN"). Manchete que cita o código de outro papel é
    // resumo do dia e fica de fora (utils/cadastro.ts → citaOutroPapel). Entre
    // as que sobram, a notícia só daquele papel ganha da que cita vários;
    // depois, a mais recente.
    const empresa = (q?.name ?? '').split(/\s{2,}|\s(?:ON|PN|PNA|PNB|UNT|CI)\b/)[0]?.trim().toUpperCase() ?? ''
    const nomeRe = empresa.length >= 3 ? new RegExp(`(^|[^A-ZÀ-Ú])${empresa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-ZÀ-Ú]|$)`) : null
    const falaDoPapel = (titulo: string) => {
      const t = titulo.toUpperCase()
      return t.includes(ticker) || (nomeRe?.test(t) ?? false)
    }
    const peso = (n: { tickers?: string[] }) => ((n.tickers?.length ?? 99) <= 2 ? 0 : 1)
    const quando = (n: { published_at: string | null }) => new Date(n.published_at!).getTime()
    const lista = noticias.status === 'fulfilled' ? (noticias.value?.data ?? []) : []
    const recente = lista
      .filter((n) => n.published_at && Date.now() - quando(n) < 1.5 * DIA_MS && falaDoPapel(n.title) && !citaOutroPapel(n.title, ticker))
      .sort((a, b) => peso(a) - peso(b) || quando(b) - quando(a))[0]
    return {
      ticker,
      logo: LOGO_RE.test(ticker) ? `https://icons.brapi.dev/icons/${ticker}.svg` : null,
      preco: typeof q?.market_price === 'number' ? q.market_price : (serie[serie.length - 1] ?? null),
      variacao: typeof q?.change_percent === 'number' ? q.change_percent : null,
      serie,
      motivo: motivoCurto(recente?.title, ticker),
    }
  }

  async function resumo(): Promise<DadosResumo> {
    try {
      const r = await marketFetchBriefingToday()
      return { frase: primeiraFrase(r?.data?.headline), minutos: r?.data?.minutes ?? null }
    }
    catch {
      return { frase: null, minutos: null }
    }
  }

  async function maiorAlta(): Promise<DadosMaiorAlta | null> {
    try {
      const r = await marketFetchMovers('stocks', 'top')
      const t = r?.data?.[0]
      if (!t?.ticker || t.change_percent == null || !(t.change_percent > 0)) return null
      const tk = t.ticker.toUpperCase()
      return { ticker: tk, nome: nomeLimpo(t.name, tk), variacao: t.change_percent }
    }
    catch {
      return null
    }
  }

  return { ativo, resumo, maiorAlta }
}
