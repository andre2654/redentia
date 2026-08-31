/**
 * useMacroNow — os valores macro de HOJE, do BCB, pro passo 2 de /simulacao.
 *
 * O protótipo trazia `MACRO_NOW = { dolar: 5.15, selic: 13.9 }` fixo no
 * simMock. Isso envelhece em silêncio: o dial diz "hoje" e mostra um número
 * de semanas atrás, o que numa tela que se vende como "premissas explícitas"
 * é o pior tipo de erro — pequeno, invisível e sempre presente.
 *
 * Fonte: GET /api/backend/macro/snapshot (MacroSnapshotService → BCB SGS,
 * já em produção, cacheado no Laravel).
 *
 * Falha vira null e quem chama fica com o default do mock. A tela nunca deixa
 * de abrir por causa disso, mas também nunca inventa cotação.
 */
interface MacroValue {
  value: number
  label: string
  as_of_date: string | null
}

interface MacroSnapshotApi {
  as_of?: string
  source?: string
  selic_meta?: MacroValue
  cdi?: MacroValue
  ipca_12m?: MacroValue
  usd_brl?: MacroValue
}

export interface MacroNow {
  dolar: number | null
  selic: number | null
  ipca: number | null
  asOf: string | null
  source: string | null
}

export function useMacroNow() {
  const { publicFetch } = useApi()
  const macro = ref<MacroNow | null>(null)
  const loading = ref(false)

  async function load(): Promise<MacroNow | null> {
    if (macro.value || loading.value) return macro.value
    loading.value = true
    try {
      const r = await publicFetch<MacroSnapshotApi>('/macro/snapshot')
      macro.value = {
        dolar: typeof r?.usd_brl?.value === 'number' ? r.usd_brl.value : null,
        selic: typeof r?.selic_meta?.value === 'number' ? r.selic_meta.value : null,
        ipca: typeof r?.ipca_12m?.value === 'number' ? r.ipca_12m.value : null,
        // a data do dado, não a do fetch: é ela que vai no painel de premissas
        asOf: r?.usd_brl?.as_of_date ?? r?.as_of ?? null,
        source: r?.source ?? null,
      }
    }
    catch {
      macro.value = null
    }
    finally {
      loading.value = false
    }
    return macro.value
  }

  return { macro, loading, load }
}
