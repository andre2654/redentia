/**
 * A bolsa do dia da home do visitante (31/10/2026): os fatos do fechamento,
 * montados no servidor a partir da API pública (utils/bolsaDoDia.ts). É a
 * fonte única do número do dia: o snapshot do Ibovespa, com a série diária,
 * o /market/today (pesos do índice), o fechamento da IA e as teses.
 * Fetch direto no Laravel e cache de 2 minutos; a série inteira (desde 2001)
 * e a história da convicção mudam devagar e ficam 1 hora.
 * A chave do cache leva a base da API: dois servidores locais apontando para
 * APIs diferentes não se misturam (31/10/2026, o "Ibovespa de mentira" do
 * servidor de teste apareceu no de dados reais).
 */
import { convicaoAntes, montarBolsaDoDia, type BolsaDoDia, type EntradaDaBolsa } from '../../app/utils/bolsaDoDia'

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

export const fetchBolsaDoDia = defineCachedFunction(
  async (): Promise<BolsaDoDia> => {
    const [snapshot, today, serie, briefing, teses] = await Promise.all([
      pegar<EntradaDaBolsa['snapshot']>('/market/snapshot?scope=ibov'),
      pegar<EntradaDaBolsa['today']>('/market/today'),
      serieDoIbov(),
      pegar<{ data?: EntradaDaBolsa['briefing'] }>('/briefing/today'),
      pegar<{ data?: EntradaDaBolsa['teses'] }>('/theses'),
    ])
    const dia = montarBolsaDoDia({ snapshot, today, serie, briefing: briefing?.data ?? null, teses: teses?.data ?? null })
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
