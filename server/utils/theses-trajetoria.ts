/**
 * A trajetória de uma tese, CACHEADA no Nitro (21/10/2026): a convicção dia a
 * dia (/theses/{slug}/conviction-history) e o desempenho desde o lançamento
 * (/theses/{slug}/performance). É o que a faixa de teses da home desenha
 * ("Toda tese, revisada todo dia.", NuTeseStrip).
 *
 * Por que no servidor: são duas chamadas por tese e quatro teses na home. No
 * navegador seriam até oito requisições por visita; aqui, uma por tese a cada
 * 30 minutos, e a página faz uma só (server/api/theses-trajetoria.get.ts),
 * cacheada na borda. As teses são revalidadas uma vez por dia, então 30
 * minutos é folgado. Uma das duas falhar não derruba a outra (o backend dá
 * 502 de vez em quando): a parte que falhou vem null.
 */
import type { TeseTrajetoria } from '../../app/types/market'

function backendBase(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}

interface ConviccaoApi {
  current: number | null
  firstConviction: number | null
  series: { date: string; conviction: number }[]
}
interface DesempenhoApi {
  series: number[]
  deltaPct: number | null
  startLabel: string | null
}

export const fetchTrajetoriaCached = defineCachedFunction(
  async (slug: string): Promise<TeseTrajetoria | null> => {
    const pede = <T>(caminho: string) => $fetch<{ data?: T }>(`/theses/${slug}/${caminho}`, {
      baseURL: backendBase(),
      headers: { Accept: 'application/json' },
      timeout: 8_000,
    }).then((r) => r?.data ?? null).catch(() => null)
    const [c, d] = await Promise.all([pede<ConviccaoApi>('conviction-history'), pede<DesempenhoApi>('performance')])
    const serieC = Array.isArray(c?.series) ? c!.series.map((p) => p.conviction).filter((v) => Number.isFinite(v)) : []
    const serieD = Array.isArray(d?.series) ? d!.series.filter((v) => Number.isFinite(v)) : []
    const conviccao = c && c.current != null && serieC.length > 1
      ? { atual: c.current, inicio: c.firstConviction ?? serieC[0]!, desde: c.series[0]?.date ?? null, serie: serieC }
      : null
    const desempenho = d && serieD.length > 1 ? { serie: serieD, deltaPct: d.deltaPct, desde: d.startLabel } : null
    return conviccao || desempenho ? { conviccao, desempenho } : null
  },
  {
    name: 'theses-trajetoria',
    maxAge: 1800,
    swr: true,
    getKey: (slug: string) => slug,
    // sem dado nenhum não entra no cache: a próxima chamada tenta de novo
    validate: (entry) => entry.value != null,
  },
)
