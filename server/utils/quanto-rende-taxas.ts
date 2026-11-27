/**
 * Selic, CDI e poupança para /quanto-rende/{valor}. Só o SGS do Banco Central.
 * Sem ponto crível, a função devolve null e a página responde 503. Não há
 * taxa de reserva.
 */
import { spISODate } from '../../app/utils/format.ts'
import { montarTaxasQuantoRende, type TaxasQuantoRendeValor } from '../../app/utils/quanto-rende-valor.ts'

const BCB = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'
const FALHA_MS = 10 * 60 * 1000

interface Guardado {
  dia: string
  taxas: TaxasQuantoRendeValor | null
  expira: number
}

let cache: Guardado | null = null
let voo: Promise<TaxasQuantoRendeValor | null> | null = null

async function serie(codigo: number, n: number): Promise<unknown> {
  return await $fetch(`${BCB}.${codigo}/dados/ultimos/${n}?formato=json`, {
    timeout: 8_000,
    headers: { accept: 'application/json' },
  })
}

async function buscar(): Promise<TaxasQuantoRendeValor | null> {
  const hoje = spISODate()
  const [s4389, s12, s1178, s11, s432, s195] = await Promise.all([
    serie(4389, 5).catch(() => null),
    serie(12, 5).catch(() => null),
    serie(1178, 5).catch(() => null),
    serie(11, 5).catch(() => null),
    serie(432, 20).catch(() => null),
    serie(195, 8).catch(() => null),
  ])
  return montarTaxasQuantoRende({
    serie4389: s4389,
    serie12: s12,
    serie1178: s1178,
    serie11: s11,
    serie432: s432,
    serie195: s195,
    hoje,
  })
}

export async function carregarTaxasQuantoRende(): Promise<TaxasQuantoRendeValor | null> {
  const dia = spISODate()
  if (cache && cache.dia === dia && (cache.taxas || cache.expira > Date.now())) return cache.taxas
  if (!voo) {
    voo = buscar().then(
      (taxas) => {
        cache = { dia, taxas, expira: taxas ? Number.POSITIVE_INFINITY : Date.now() + FALHA_MS }
        return taxas
      },
      () => {
        cache = { dia, taxas: null, expira: Date.now() + FALHA_MS }
        return null
      },
    ).finally(() => {
      voo = null
    })
  }
  return voo
}
