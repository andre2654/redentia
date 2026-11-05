/**
 * Qual variação da /business nova está na tela (05/11/2026, o print do dono).
 *
 * SÓ NO DEV: `?biz=1|2|3` liga a variação na página, no topo (nav e CTA do
 * print, tom escuro) e na faixa do estudo do layout. Em produção
 * import.meta.dev é false, isto é sempre null e tudo segue como hoje, até o
 * dono escolher uma. Só vale na /business (o painel logado não muda).
 */
export type BizVariacao = '1' | '2' | '3'

export function useBizVariacao() {
  const route = useRoute()
  return computed<BizVariacao | null>(() => {
    if (!import.meta.dev || route.path !== '/business') return null
    const v = String(route.query.biz ?? '')
    return v === '1' || v === '2' || v === '3' ? v : null
  })
}
