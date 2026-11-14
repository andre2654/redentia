/**
 * A busca da seção "Na cadeia" da /carteira (05/11/2026). A conta é pura e
 * mora em utils/cadeiaDaCarteira.ts; aqui só se pergunta à API:
 * GET /assets/{t}/supply-chain, UMA chamada por empresa da carteira (só ação:
 * FII, ETF e Tesouro não têm cadeia; PETR3 e PETR4 são uma chamada), as
 * maiores primeiro, no máximo 12 (TETO_DA_CADEIA).
 *
 * No cliente, depois do mount, em paralelo, com cache por ticker de 5 minutos
 * (como useExposicaoNoMundo). 404 fica guardado (o papel não é de empresa);
 * erro de rede não fica, para a próxima visita tentar de novo.
 */
import type { SupplyChainApi } from '~/types/acao'
import { cadeiaDaCarteira, tickersDaCadeia, type PosicaoDaCadeia } from '~/utils/cadeiaDaCarteira'

const VALIDADE_MS = 5 * 60 * 1000
const cache = new Map<string, { em: number; p: Promise<SupplyChainApi | null> }>()

function statusDe(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

function doCache(ticker: string): Promise<SupplyChainApi | null> {
  const c = cache.get(ticker)
  if (c && Date.now() - c.em < VALIDADE_MS) return c.p
  const entrada = { em: Date.now(), p: Promise.resolve<SupplyChainApi | null>(null) }
  entrada.p = acaoFetchSupplyChain('/api/backend', ticker).catch((e) => {
    if (statusDe(e) !== 404 && cache.get(ticker) === entrada) cache.delete(ticker)
    return null
  })
  cache.set(ticker, entrada)
  return entrada.p
}

export function useCadeiaDaCarteira(posicoes: MaybeRefOrGetter<PosicaoDaCadeia[]>) {
  const respostas = shallowRef<Record<string, SupplyChainApi | null>>({})
  /** até a primeira resposta completa: o esqueleto */
  const pendente = ref(true)
  let seq = 0

  async function carregar() {
    const tickers = tickersDaCadeia(toValue(posicoes) ?? [])
    if (!tickers.length) { respostas.value = {}; pendente.value = false; return }
    const meu = ++seq
    const r = await Promise.all(tickers.map(doCache))
    if (meu !== seq) return
    respostas.value = Object.fromEntries(tickers.map((t, i) => [t, r[i] ?? null]))
    pendente.value = false
  }

  const vm = computed(() => cadeiaDaCarteira(toValue(posicoes) ?? [], respostas.value))

  onMounted(() => {
    void carregar()
    watch(() => tickersDaCadeia(toValue(posicoes) ?? []).join('|'), () => void carregar())
  })

  return { vm, pendente, carregar }
}
