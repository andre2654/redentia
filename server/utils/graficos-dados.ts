/**
 * Lê as três séries de /graficos. O CDI vem da API pública do SGS. Proventos
 * e FIIs vêm dos mesmos endpoints que a carteira e o ranking já usam.
 * Sucesso fica na memória até a virada do dia em São Paulo. Falha espera
 * dez minutos e tenta de novo: um 503 de manhã não pode congelar o gráfico.
 */
import { spISODate } from '../../app/utils/format.ts'
import {
  graficoCdi,
  graficoFiis,
  graficoProventos,
  leituraCdi,
  dataModificada,
  type AgendaDia,
  type Grafico,
  type LinhaFii,
} from '../../app/utils/graficos.ts'

const BCB = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'
const FALHA_MS = 10 * 60 * 1000

interface Guardado {
  dia: string
  grafico: Grafico | null
  expira: number
}

const cache = new Map<string, Guardado>()
const voo = new Map<string, Promise<Grafico | null>>()

function base(): string {
  return String(useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api').replace(/\/+$/, '')
}

async function getJson(url: string): Promise<unknown> {
  return await $fetch(url, {
    timeout: 8_000,
    headers: { accept: 'application/json', 'x-requested-with': 'XMLHttpRequest' },
  })
}

async function buscarCdi(): Promise<Grafico | null> {
  const [a, d] = await Promise.all([
    getJson(`${BCB}.4389/dados/ultimos/1?formato=json`).catch(() => null),
    getJson(`${BCB}.12/dados/ultimos/1?formato=json`).catch(() => null),
  ])
  return graficoCdi(leituraCdi(a, d))
}

async function buscarProventos(): Promise<Grafico | null> {
  const hoje = spISODate()
  const res = await getJson(`${base()}/dividends/upcoming?days=10&limit=500`)
  const body = (res ?? {}) as { data?: AgendaDia[] }
  if (!Array.isArray(body.data)) return null
  return graficoProventos({ dias: body.data, hoje })
}

async function buscarFiis(): Promise<Grafico | null> {
  const res = await getJson(`${base()}/rankings/top-dividend-yield?type=REIT&min_cap=0&limit=100`)
  const body = (res ?? {}) as { data?: LinhaFii[] }
  if (!Array.isArray(body.data)) return null
  return graficoFiis(body.data)
}

const BUSCA: Record<Grafico['id'], () => Promise<Grafico | null>> = {
  cdi: buscarCdi,
  proventos: buscarProventos,
  fiis: buscarFiis,
}

async function comCache(id: Grafico['id']): Promise<Grafico | null> {
  const dia = spISODate()
  const hit = cache.get(id)
  if (hit && hit.dia === dia && (hit.grafico || hit.expira > Date.now())) return hit.grafico
  const chave = `${dia}:${id}`
  let p = voo.get(chave)
  if (!p) {
    p = BUSCA[id]().then(
      (grafico) => {
        cache.set(id, { dia, grafico, expira: grafico ? Number.POSITIVE_INFINITY : Date.now() + FALHA_MS })
        return grafico
      },
      () => {
        cache.set(id, { dia, grafico: null, expira: Date.now() + FALHA_MS })
        return null
      },
    ).finally(() => {
      voo.delete(chave)
    })
    voo.set(chave, p)
  }
  return p
}

export async function carregarGrafico(id: Grafico['id']): Promise<Grafico | null> {
  return comCache(id)
}

export async function carregarGraficos(): Promise<{ graficos: Grafico[], dateModified: string | null }> {
  const lista = await Promise.all([comCache('cdi'), comCache('proventos'), comCache('fiis')])
  const graficos = lista.filter((g): g is Grafico => !!g)
  return { graficos, dateModified: dataModificada(graficos) }
}
