/**
 * Faixa "EMBR3 agora negocia como EMBJ3." no destino do 301 de código trocado.
 *
 * O 301 do /asset e do /dividendos manda `?de=<código antigo>` (ver
 * renamedTargetOf em app/utils/delisted.ts). A faixa só aparece se o backend
 * CONFIRMAR o par: `GET /tickers/{de}` tem que resolver o alias para ESTA
 * página. Sem a confirmação, `/asset/PETR4?de=VALE3` publicaria "VALE3 agora
 * negocia como PETR4" no nosso domínio pra quem montasse o link.
 *
 * SSR (a faixa sai no HTML, sem pular layout depois) e só quando o parâmetro
 * existe: página sem `?de=` não paga fetch nenhum. A URL com `?de=` tem
 * canonical para a URL limpa (usePageSeo usa o path, nunca a query), então
 * não nasce página duplicada indexável.
 */
export async function useRenamedFrom(ticker: string): Promise<ComputedRef<string | null>> {
  const route = useRoute()
  const de = typeof route.query.de === 'string' ? route.query.de.trim().toUpperCase() : ''
  if (!de || de === ticker || symbolShape(de) === 'invalid') return computed(() => null)

  const config = useRuntimeConfig()
  const base = import.meta.server
    ? ((config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api')
    : '/api/backend'

  const { data } = await useAsyncData<string | null>(`renamed:${de}>${ticker}`, async () => {
    const res = await acaoFetchProfile(base, de).catch(() => null)
    return renamedTargetOf(res, de) === ticker ? de : null
  })
  return computed(() => data.value ?? null)
}
