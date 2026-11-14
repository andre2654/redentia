/**
 * A carteira na régua do topo (12/11/2026): para quem tem carteira e assina, um
 * ponto cobalto em cima das ações do Ibovespa que a pessoa tem e, à direita da
 * barra, "Sua carteira +0,11% · tudo normal" no lugar da fatia do índice.
 *
 * A FONTE: a mais leve que já existia. As posições com o dia de cada uma vêm do
 * GET /portfolio/today (~11 KB, cache de 1 h no backend), o mesmo que o resumo
 * da home (useCarteiraResumo) e a /carteira leem; o resumo inteiro são sete
 * pedidos, e a régua está em toda página. O dia sai do MESMO montarResumoDoDia e
 * do MESMO frasesDoDia da home, com o total marcado a mercado do próprio /today
 * (a precedência do portfolioTotalValue), e o selo, do seloDoDia com o aviso do
 * motor (useAvisoDaCarteira, a consulta que a home também faz, uma vez só).
 *
 * PRIVACIDADE: nada disso entra no HTML do servidor (a borda cacheia a página).
 * Tudo roda no cliente, depois de montar; até chegar, a régua é a do visitante.
 * O estado fica em useState só com o que a régua precisa (os tickers e o dia), e
 * nunca com o token. A sessão que troca ou sai leva junto o que era dela.
 */
import type { PortfolioTodayApi } from '~/types/home'
import { montarResumoDoDia, type ResumoDoDia } from '~/utils/diaDaCarteira'
import { portfolioTotalValue } from '~/utils/portfolio'

export type EstadoDaCarteiraNoTopo = 'parado' | 'carregando' | 'pronto' | 'sem'

interface CarteiraNoTopo {
  /** os tickers que a pessoa tem, em maiúscula */
  tickers: string[]
  /** o dia da carteira (o mesmo resumo da home); null sem posição */
  dia: ResumoDoDia | null
}

let emVoo: Promise<void> | null = null

export function useCarteiraNoTopo() {
  const { token, isAuthenticated } = useAuthState()
  const assinatura = useAssinatura()
  const aviso = useAvisoDaCarteira()
  const carteira = useState<CarteiraNoTopo | null>('topo:carteira', () => null)
  const estado = useState<EstadoDaCarteiraNoTopo>('topo:carteira-estado', () => 'parado')

  async function buscar() {
    await assinatura.carregar()
    const t = token.value
    if (!t || !assinatura.assinante.value) { estado.value = 'sem'; return }
    try {
      const hoje = await $fetch<PortfolioTodayApi>('/api/backend/portfolio/today', {
        headers: { Accept: 'application/json', Authorization: `Bearer ${t}` },
      })
      if (token.value !== t) return
      const posicoes = hoje?.positions ?? []
      if (!posicoes.length) { carteira.value = null; estado.value = 'sem'; return }
      carteira.value = {
        tickers: [...new Set(posicoes.map((p) => String(p.ticker ?? '').toUpperCase()).filter(Boolean))],
        dia: montarResumoDoDia({ today: hoje, posicoes: [], total: portfolioTotalValue(null, hoje), ibov: null, income: null }),
      }
      estado.value = 'pronto'
    } catch {
      // 402 (não assina), 401 (sessão vencida) ou rede: a régua fica a do visitante
      if (token.value === t) { carteira.value = null; estado.value = 'sem' }
    }
  }

  /** Uma vez por sessão: só no cliente e só com login. */
  function carregar(): Promise<void> {
    if (!import.meta.client || !isAuthenticated.value) return Promise.resolve()
    if (estado.value !== 'parado') return emVoo ?? Promise.resolve()
    estado.value = 'carregando'
    emVoo = buscar().finally(() => { emVoo = null })
    return emVoo
  }

  /** a sessão trocou (ou saiu, `saiu`: o aviso guardado na aba vai junto) */
  function esquecer(saiu = false) {
    carteira.value = null
    estado.value = 'parado'
    aviso.esquecer({ saiu })
  }

  return { carteira, estado, carregar, esquecer, aviso }
}
