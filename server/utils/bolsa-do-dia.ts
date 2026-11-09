/**
 * A bolsa do dia da home do visitante (31/10/2026): os fatos do fechamento,
 * montados no servidor a partir da API pública (utils/bolsaDoDia.ts). É a
 * fonte única do número do dia: o snapshot do Ibovespa, com a série diária,
 * o /market/today (pesos do índice), o fechamento da IA, as teses e o pregão
 * minuto a minuto: Ibovespa, IFIX e mini dólar na B3, Bitcoin na Binance.
 * Fetch direto no Laravel e cache de 2 minutos; a série inteira (desde 2001)
 * e a história da convicção mudam devagar e ficam 1 hora.
 * A chave do cache leva a base da API: dois servidores locais apontando para
 * APIs diferentes não se misturam (31/10/2026, o "Ibovespa de mentira" do
 * servidor de teste apareceu no de dados reais).
 */
import { convicaoAntes, montarBolsaDoDia, type BolsaDoDia, type EntradaDaBolsa, type SerieDaB3 } from '../../app/utils/bolsaDoDia'
import { agoraEmSP } from '../../app/utils/pregao'

function base(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}
const chaveDaBase = () => base().replace(/[^a-z0-9]+/gi, '-')

// Resposta que não é objeto (a API às vezes devolve 200 sem JSON) conta como
// falha: o dia sai vazio, não vai para o cache e a busca seguinte tenta de novo.
async function pegar<T>(caminho: string): Promise<T | null> {
  const r: unknown = await $fetch(caminho, { baseURL: base(), headers: { Accept: 'application/json' }, timeout: 8_000 }).catch(() => null)
  return r != null && typeof r === 'object' ? (r as T) : null
}

const serieDoIbov = defineCachedFunction(
  async () => (await pegar<{ data?: EntradaDaBolsa['serie'] }>('/indices/IBOV/prices?mode=full'))?.data ?? null,
  { name: 'bolsa-serie-ibov', maxAge: 3600, swr: true, getKey: () => `v1-${chaveDaBase()}`, validate: (e) => Array.isArray(e.value) && e.value.length > 0 },
)

const historicoDaTese = defineCachedFunction(
  async (slug: string) => (await pegar<{ data?: { series?: { date: string; conviction: number }[] } }>(`/theses/${encodeURIComponent(slug)}/conviction-history`))?.data?.series ?? null,
  { name: 'bolsa-historico-tese', maxAge: 3600, swr: true, getKey: (slug: string) => `v1-${chaveDaBase()}-${slug}` },
)

// O pregão minuto a minuto da própria B3 (público, sem chave; pede um
// User-Agent de navegador): Ibovespa, IFIX e o mini dólar futuro. Falhou, a
// linha daquele mercado some.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const daB3 = defineCachedFunction(
  async (ativo: string) => {
    const r: unknown = await $fetch(`https://cotacao.b3.com.br/mds/api/v1/DailyFluctuationHistory/${ativo}`, {
      headers: { Accept: 'application/json', 'User-Agent': UA }, timeout: 8_000,
    }).catch(() => null)
    return r != null && typeof r === 'object' ? (r as SerieDaB3) : null
  },
  { name: 'bolsa-b3', maxAge: 120, swr: true, getKey: (ativo: string) => `v1-${ativo}`, validate: (e) => Boolean((e.value as SerieDaB3 | null)?.TradgFlr?.date) },
)

// O dólar do dia pelo mini dólar futuro (WDO): entre o contrato do mês que vem
// e o do seguinte, o que mais negociou (o que vence primeiro esvazia perto do vencimento).
const MESES_DO_FUTURO = 'FGHJKMNQUVXZ'
async function dolarDoDia(hojeSP: string): Promise<SerieDaB3 | null> {
  const ano = Number(hojeSP.slice(0, 4))
  const mes = Number(hojeSP.slice(5, 7))
  const codigos = [1, 2].map((k) => {
    const m = ((mes - 1 + k) % 12) + 1
    const a = ano + Math.floor((mes - 1 + k) / 12)
    return `WDO${MESES_DO_FUTURO[m - 1]}${String(a).slice(2)}`
  })
  const series = await Promise.all(codigos.map((c) => daB3(c)))
  const tamanho = (x: SerieDaB3 | null) => x?.TradgFlr?.scty?.lstQtn?.length ?? 0
  return series.reduce<SerieDaB3 | null>((a, b) => (tamanho(b) > tamanho(a) ? b : a), null)
}

// O Bitcoin em reais de 5 em 5 minutos, pelo espelho público de dados da Binance
// (o api.binance.com bloqueia servidores nos EUA; o data-api.binance.vision não).
const btcDoDia = defineCachedFunction(
  async (data: string) => {
    const inicio = Date.parse(`${data}T10:00:00-03:00`)
    const fim = Date.parse(`${data}T18:30:00-03:00`)
    const r: unknown = await $fetch(`https://data-api.binance.vision/api/v3/klines?symbol=BTCBRL&interval=5m&startTime=${inicio}&endTime=${fim}`, { timeout: 8_000 }).catch(() => null)
    return Array.isArray(r) ? (r as (string | number)[][]) : null
  },
  { name: 'bolsa-btc', maxAge: 120, swr: true, getKey: (data: string) => `v1-${data}`, validate: (e) => Array.isArray(e.value) && (e.value as unknown[]).length > 0 },
)

export const fetchBolsaDoDia = defineCachedFunction(
  async (): Promise<BolsaDoDia> => {
    const [snapshot, today, serie, briefing, teses, intradia, ifixIntradia, dolarIntradia] = await Promise.all([
      pegar<EntradaDaBolsa['snapshot']>('/market/snapshot?scope=ibov'),
      pegar<EntradaDaBolsa['today']>('/market/today'),
      serieDoIbov(),
      pegar<{ data?: EntradaDaBolsa['briefing'] }>('/briefing/today'),
      pegar<{ data?: EntradaDaBolsa['teses'] }>('/theses'),
      daB3('IBOV'),
      daB3('IFIX'),
      dolarDoDia(agoraEmSP().iso),
    ])
    const dataDoPregao = intradia?.TradgFlr?.date?.slice(0, 10) ?? null
    const btcKlines = dataDoPregao ? await btcDoDia(dataDoPregao) : null
    const dia = montarBolsaDoDia({ snapshot, today, serie, briefing: briefing?.data ?? null, teses: teses?.data ?? null, intradia, ifixIntradia, dolarIntradia, btcKlines })
    if (dia.tese) dia.tese.antes = convicaoAntes(await historicoDaTese(dia.tese.slug), dia.tese.convicao)
    return dia
  },
  {
    name: 'bolsa-do-dia',
    maxAge: 120,
    swr: true,
    getKey: () => `v1-${chaveDaBase()}`,
    validate: (e) => Boolean((e.value as BolsaDoDia | undefined)?.ibov),
  },
)
