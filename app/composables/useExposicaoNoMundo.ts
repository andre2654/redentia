/**
 * A busca da seção "No mundo" da /carteira (05/11/2026). A conta é pura e
 * mora em utils/exposicaoNoMundo.ts; aqui só se pergunta à API o que ela não
 * sabe sozinha:
 *  - ação e FII: GET /revenue-geography?tickers= (a receita por país ou região
 *    do item 1.7 do Formulário de Referência da CVM), de 30 em 30 papéis;
 *    `null` no papel = ainda sem dado. Enquanto o endpoint não existe, o 404
 *    cai no "sem dado" (o papel vai para "Brasil (sede)"), menos no dev;
 *  - BDR (e ação americana): GET /tickers/{t}, só o `country`;
 *  - ETF: GET /etfs/{t}/xray, só o `profile` (geografia e classe).
 * Tesouro e renda fixa são Brasil sem chamada nenhuma.
 *
 * No cliente, depois do mount, em paralelo: a receita (1 chamada a cada 30
 * papéis) + no máximo 10 de BDR/ETF (os 10 maiores; o resto fica "Sem dado"),
 * com cache por ticker de 5 minutos, como a janelinha de espiar
 * (useEspiarAtivo). 404 fica
 * guardado (o dado não existe); erro de rede não fica, para a próxima visita
 * tentar de novo.
 *
 * SÓ NO DEV (05/11/2026): enquanto o /revenue-geography não está em produção,
 * a chamada falha (404) e tudo iria para "Brasil (sede)". Para o dono ver o
 * globo com dado de verdade no preview, a falha cai na resposta real do
 * piloto do backend (rodado localmente, 49 papéis, FRE 2026 item 1.7), em
 * app/dev/receita-piloto.json. O import é dinâmico e fica atrás de
 * `if (import.meta.dev)`: no build de produção o `import.meta.dev` vira
 * `false`, o bloco morre e o JSON não entra em pacote nenhum (conferido no
 * .output em 05/11/2026). Em produção nada muda. Sai quando o endpoint subir.
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
/** o teto do GET /revenue-geography?tickers= */
const POR_CHAMADA = 30
const cache = new Map<string, { em: number; p: Promise<FonteMundo> }>()

function statusDe(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

type LoteReceita = { ok: true; data: Record<string, ReceitaGeografiaApi | null> } | { ok: false; guardar: boolean; data: Record<string, ReceitaGeografiaApi | null> }

/** Só no dev: a resposta real do piloto do backend (ver o cabeçalho). */
async function receitaDoPiloto(): Promise<Record<string, ReceitaGeografiaApi | null> | null> {
  if (import.meta.dev) {
    try {
      const m = await import('~/dev/receita-piloto.json')
      return ((m.default ?? m) as { data?: Record<string, ReceitaGeografiaApi | null> }).data ?? null
    } catch {
      return null
    }
  }
  return null
}

async function buscarReceita(tickers: string[]): Promise<LoteReceita> {
  try {
    const r = await $fetch<{ data: Record<string, ReceitaGeografiaApi | null> }>(
      `/api/backend/revenue-geography?tickers=${tickers.map(encodeURIComponent).join(',')}`,
      { headers: { Accept: 'application/json' } },
    )
    return { ok: true, data: r?.data ?? {} }
  } catch (e) {
    const piloto = await receitaDoPiloto()
    if (piloto) return { ok: true, data: Object.fromEntries(tickers.map((t) => [t, piloto[t] ?? null])) }
    return { ok: false, guardar: statusDe(e) === 404, data: {} }
  }
}

/** O que a API disse de um papel → a fonte da conta (null = sem dado). */
function fonteDaReceita(d: ReceitaGeografiaApi | null | undefined): FonteMundo {
  if (!d) return null
  const fatias = Array.isArray(d.fatias) ? d.fatias : []
  // 100% Brasil pela receita conta mesmo sem fatia nenhuma
  if (!fatias.length && d.status !== 'nao_aplicavel_100_brasil') return null
  return { tipo: 'receita', fatias, cobertura: d.cobertura_pct ?? null, status: d.status ?? null }
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

/** A receita de vários papéis, de 30 em 30 por chamada; o que já está no cache não vai. */
function receitaDoCache(tickers: string[]): Promise<FonteMundo[]> {
  const agora = Date.now()
  const faltam = tickers.filter((t) => { const c = cache.get(`receita:${t}`); return !(c && agora - c.em < VALIDADE_MS) })
  if (faltam.length) {
    // o endpoint aceita no máximo 30 papéis por chamada
    const lotes = new Map<string, Promise<LoteReceita>>()
    for (let i = 0; i < faltam.length; i += POR_CHAMADA) {
      const pedaco = faltam.slice(i, i + POR_CHAMADA)
      const p = buscarReceita(pedaco)
      for (const t of pedaco) lotes.set(t, p)
    }
    for (const t of faltam) {
      const lote = lotes.get(t)!
      const chave = `receita:${t}`
      const entrada = { em: agora, p: Promise.resolve<FonteMundo>(null) }
      entrada.p = lote.then((r) => {
        if (!r.ok && !r.guardar && cache.get(chave) === entrada) cache.delete(chave)
        return fonteDaReceita(r.data[t])
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
