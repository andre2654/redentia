/**
 * A janelinha de espiar ativo (03/11/2026): o estado e a carga.
 *
 * Quem abre é o plugin plugins/espiar-ativo.client.ts (o clique em qualquer
 * <a href="/asset/X"> do site) e quem desenha é o EspiarAtivo, montado uma vez
 * no layout padrão. Uma janela só: clicar em outro ativo troca o conteúdo.
 *
 * Dado só no clique, com cache por ticker (5 min: a cotação anda). Cinco
 * GETs leves em paralelo, não o payload da página (que são doze): o perfil
 * com a cotação, a série de 12 meses, o overview, os proventos (só para o DY
 * ser o mesmo da página, resolveSiteDy) e as leituras do Atlas do ativo.
 * Só o perfil é obrigatório; o resto que falhar some do cartão.
 */
import { montarEspiar, type EspiarVM } from '~/utils/espiarAtivo'
import type { ContextoDoChat } from '~/composables/useChatPainel'

export type EspiarEstado = 'fechado' | 'carregando' | 'pronto' | 'erro' | 'saiu'

type Resultado =
  | { tipo: 'ok'; vm: EspiarVM }
  /** o perfil 404: cripto ou símbolo que só a página sabe resolver */
  | { tipo: 'pagina' }
  | { tipo: 'saiu'; mensagem: string }

const VALIDADE_MS = 5 * 60 * 1000
const cache = new Map<string, { em: number; p: Promise<Resultado>; valor?: Resultado }>()
/** o link que abriu a janela: o foco volta para ele ao fechar */
let origem: HTMLElement | null = null
let montadas = 0
let seq = 0

function statusDe(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

async function carregar(ticker: string): Promise<Resultado> {
  const base = '/api/backend'
  let res: Awaited<ReturnType<typeof acaoFetchProfile>>
  try {
    res = await acaoFetchProfile(base, ticker)
  } catch (e) {
    if (statusDe(e) === 404) return { tipo: 'pagina' }
    if (statusDe(e) === 410) return { tipo: 'saiu', mensagem: delistedMessage(ticker, delistedAtOfError(e)) }
    throw e
  }
  if (isDelistedEnvelope(res)) return { tipo: 'saiu', mensagem: delistedMessage(ticker, delistedAtOf(res)) }
  // código trocado (EMBR3 → EMBJ3): a janela mostra o papel novo, e o maximizar vai para ele
  const t = renamedTargetOf(res, ticker) ?? ticker
  const [precosR, overviewR, proventosR, leiturasR] = await Promise.allSettled([
    acaoFetchPrices(base, t, '12mo'),
    acaoFetchOverview(base, t),
    acaoFetchDividends(base, t),
    espiarFetchLeituras(t),
  ])
  const ok = <X>(r: PromiseSettledResult<X>): X | null => (r.status === 'fulfilled' ? r.value : null)
  const vm = montarEspiar({
    perfil: { ...res.data, ticker: t },
    precos: ok(precosR)?.data ?? null,
    overview: ok(overviewR)?.data ?? null,
    proventos: ok(proventosR)?.data ?? null,
    leituras: ok(leiturasR)?.data ?? null,
    hoje: spISODate(),
  })
  return { tipo: 'ok', vm }
}

function doCache(ticker: string): Promise<Resultado> {
  const c = cache.get(ticker)
  if (c && Date.now() - c.em < VALIDADE_MS) return c.p
  const p = carregar(ticker)
  const entrada: { em: number; p: Promise<Resultado>; valor?: Resultado } = { em: Date.now(), p }
  cache.set(ticker, entrada)
  // erro não fica guardado: o "Tentar de novo" pede de novo
  p.then((v) => { entrada.valor = v }, () => { if (cache.get(ticker) === entrada) cache.delete(ticker) })
  return p
}

export function useEspiarAtivo() {
  const ticker = useState<string | null>('nu:espiar:ticker', () => null)
  const estado = useState<EspiarEstado>('nu:espiar:estado', () => 'fechado')
  const vm = useState<EspiarVM | null>('nu:espiar:vm', () => null)
  const mensagem = useState<string>('nu:espiar:mensagem', () => '')
  /** a barra do chat está embaixo do cartão (quem decide é o EspiarAtivo; a ChatBarra segue) */
  const aoLado = useState<boolean>('nu:espiar:ao-lado', () => false)
  /** onde o cartão está: a distância da borda direita e a largura, em px */
  const geometria = useState<{ direita: number, largura: number } | null>('nu:espiar:geometria', () => null)

  /** O ativo como anexo da conversa (o "Perguntar sobre X" e a barra ao lado). */
  function contextoParaChat(rota: string): ContextoDoChat | null {
    const t = ticker.value
    return vm.value && t ? { id: `ativo:${t}`, tipo: 'ativo', rotulo: t, texto: vm.value.contexto, rota } : null
  }

  /** A janela só abre onde o EspiarAtivo está montado (o layout padrão). */
  function disponivel() {
    return import.meta.client && montadas > 0
  }

  async function abrir(t: string, de: HTMLElement | null = null) {
    if (!disponivel()) return false
    const alvo = t.trim().toUpperCase()
    if (de) origem = de
    ticker.value = alvo
    const meu = ++seq
    // do cache já resolvido, o cartão troca sem passar pelo esqueleto
    const c = cache.get(alvo)
    const pronto = c && Date.now() - c.em < VALIDADE_MS ? c.valor : undefined
    if (pronto?.tipo === 'ok') { vm.value = pronto.vm; estado.value = 'pronto'; return true }
    estado.value = 'carregando'
    vm.value = null
    try {
      const r = await doCache(alvo)
      if (meu !== seq) return true
      if (r.tipo === 'pagina') {
        // a página resolve o que a janela não sabe (cripto, símbolo americano novo)
        fechar(false)
        await navigateTo(`/asset/${alvo}`)
        return true
      }
      if (r.tipo === 'saiu') { mensagem.value = r.mensagem; estado.value = 'saiu'; return true }
      vm.value = r.vm
      estado.value = 'pronto'
    } catch {
      if (meu !== seq) return true
      estado.value = 'erro'
    }
    return true
  }

  function recarregar() {
    if (ticker.value) void abrir(ticker.value)
  }

  function fechar(devolverFoco = true) {
    seq++
    estado.value = 'fechado'
    ticker.value = null
    vm.value = null
    const o = origem
    origem = null
    if (devolverFoco && o && document.contains(o)) o.focus({ preventScroll: true })
  }

  /** O EspiarAtivo avisa que existe (e quando sai), para o plugin saber se intercepta. */
  function registrar() {
    montadas++
    return () => { montadas = Math.max(0, montadas - 1) }
  }

  return { ticker, estado, vm, mensagem, aoLado, geometria, contextoParaChat, disponivel, abrir, recarregar, fechar, registrar }
}
