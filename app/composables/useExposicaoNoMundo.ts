/**
 * A busca da seção "No mundo" da /carteira (05/11/2026). A conta é pura e
 * mora em utils/exposicaoNoMundo.ts; aqui só se pergunta à API o que ela não
 * sabe sozinha:
 *  - ação e FII: GET /revenue-geography?tickers= (a receita por país ou região
 *    do item 1.7 do Formulário de Referência da CVM), UMA chamada para todos;
 *    `null` no papel = ainda sem dado. Enquanto o endpoint não existe, o 404
 *    cai no "sem dado" (o papel vai para "Brasil (sede)");
 *  - BDR (e ação americana): GET /tickers/{t}, só o `country`;
 *  - ETF: GET /etfs/{t}/xray, só o `profile` (geografia e classe).
 * Tesouro e renda fixa são Brasil sem chamada nenhuma.
 *
 * No cliente, depois do mount, em paralelo: 1 chamada de receita + no máximo
 * 10 de BDR/ETF (os 10 maiores; o resto fica "Sem dado"), com cache por
 * ticker de 5 minutos, como a janelinha de espiar (useEspiarAtivo). 404 fica
 * guardado (o dado não existe); erro de rede não fica, para a próxima visita
 * tentar de novo.
 */
import type { ReceitaGeografiaApi } from '~/utils/exposicaoNoMundo'
import {
  exposicaoNoMundo,
  tickersParaBuscar,
  viaDaPosicao,
  type FonteMundo,
  type PosicaoMundo,
  type ViaMundo,
} from '~/utils/exposicaoNoMundo'

const VALIDADE_MS = 5 * 60 * 1000
const TETO_DE_CHAMADAS = 10
const cache = new Map<string, { em: number; p: Promise<FonteMundo> }>()

function statusDe(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

async function perguntar(ticker: string, via: Exclude<ViaMundo, 'receita'>): Promise<FonteMundo> {
  const base = '/api/backend'
  if (via === 'ticker') {
    const r = await acaoFetchProfile(base, ticker)
    const pais = (r?.data as { country?: string | null } | undefined)?.country ?? null
    return { tipo: 'pais', pais }
  }
  const x = await acaoFetchEtfXray(base, ticker)
  return { tipo: 'etf', geografia: x?.profile?.geography ?? null, classe: x?.profile?.asset_class ?? null }
}

function doCache(ticker: string, via: Exclude<ViaMundo, 'receita'>): Promise<FonteMundo> {
  const chave = `${via}:${ticker}`
  const c = cache.get(chave)
  if (c && Date.now() - c.em < VALIDADE_MS) return c.p
  const entrada = { em: Date.now(), p: Promise.resolve<FonteMundo>(null) }
  entrada.p = perguntar(ticker, via).catch((e) => {
    // 404: o ativo não tem o dado, e isso vale os 5 minutos; o resto não fica
    if (statusDe(e) !== 404 && cache.get(chave) === entrada) cache.delete(chave)
    return null
  })
  cache.set(chave, entrada)
  return entrada.p
}

/** A receita de vários papéis numa chamada só; o que já está no cache não vai. */
function receitaDoCache(tickers: string[]): Promise<FonteMundo[]> {
  const agora = Date.now()
  const faltam = tickers.filter((t) => { const c = cache.get(`receita:${t}`); return !(c && agora - c.em < VALIDADE_MS) })
  if (faltam.length) {
    const lote = $fetch<{ data: Record<string, ReceitaGeografiaApi | null> }>(
      `/api/backend/revenue-geography?tickers=${faltam.map(encodeURIComponent).join(',')}`,
      { headers: { Accept: 'application/json' } },
    ).then(
      (r) => ({ ok: true as const, data: r?.data ?? {} }),
      (e) => ({ ok: false as const, guardar: statusDe(e) === 404, data: {} as Record<string, ReceitaGeografiaApi | null> }),
    )
    for (const t of faltam) {
      const chave = `receita:${t}`
      const entrada = { em: agora, p: Promise.resolve<FonteMundo>(null) }
      entrada.p = lote.then((r) => {
        if (!r.ok && !r.guardar && cache.get(chave) === entrada) cache.delete(chave)
        const d = r.data[t] ?? null
        return d && Array.isArray(d.fatias) ? { tipo: 'receita' as const, fatias: d.fatias, cobertura: d.cobertura_pct ?? null } : null
      })
      cache.set(chave, entrada)
    }
  }
  return Promise.all(tickers.map((t) => cache.get(`receita:${t}`)!.p))
}

export function useExposicaoNoMundo(posicoes: MaybeRefOrGetter<PosicaoMundo[]>) {
  const fontes = shallowRef<Record<string, FonteMundo>>({})
  let seq = 0

  async function carregar() {
    const lista = toValue(posicoes) ?? []
    const { receita, avulsos } = tickersParaBuscar(lista, TETO_DE_CHAMADAS)
    const novo: Record<string, FonteMundo> = {}
    // BDR/ETF que passou do teto fica "Sem dado" (nunca chute)
    for (const ps of lista) {
      const t = ps.ticker.trim().toUpperCase()
      const via = viaDaPosicao(ps.classe)
      if (via && via !== 'receita' && !avulsos.some((b) => b.ticker === t)) novo[t] = null
    }
    if (!receita.length && !avulsos.length) { fontes.value = novo; return }
    const meu = ++seq
    const [rec, resp] = await Promise.all([
      receita.length ? receitaDoCache(receita) : Promise.resolve([] as FonteMundo[]),
      Promise.all(avulsos.map((b) => doCache(b.ticker, b.via as Exclude<ViaMundo, 'receita'>))),
    ])
    if (meu !== seq) return
    receita.forEach((t, i) => { novo[t] = rec[i] ?? null })
    avulsos.forEach((b, i) => { novo[b.ticker] = resp[i] ?? null })
    fontes.value = novo
  }

  const vm = computed(() => exposicaoNoMundo(toValue(posicoes) ?? [], fontes.value))

  onMounted(() => {
    void carregar()
    watch(() => (toValue(posicoes) ?? []).map((p) => `${p.ticker}:${p.classe}`).join('|'), () => void carregar())
  })

  return { vm, carregar }
}
