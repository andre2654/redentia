/**
 * Simulação de 12 meses do guia /tesouro/tesouro-reserva.
 * A taxa entra pronta, lida do SGS. A conta é a de /quanto-rende/{valor}:
 * Selic efetiva em dias corridos ÷ 365, IR da Lei 11.033/2004 e custódia
 * de 0,20 p.p. ao ano só na parcela acima de R$ 10.000. Sem taxa, não há número.
 */
import {
  HORIZONTES_QUANTO_RENDE,
  LIMIAR_POUPANCA_SELIC,
  celulaDe,
  celulaTesouroSelic,
  simularQuantoRendeValor,
  taxaFmt,
  valorPorSlug,
  type CelulaQuantoRende,
  type TaxasQuantoRendeValor,
  type ValorQuantoRende,
} from './quanto-rende-valor.ts'
import { diaCurto } from './quanto-rende.ts'

export const SLUGS_SIMULACAO_RESERVA = ['1-mil', '10-mil', '100-mil'] as const

export interface LinhaTesouroReserva {
  entrada: ValorQuantoRende
  href: string
  reserva: CelulaQuantoRende
  poupanca: CelulaQuantoRende
  selic: CelulaQuantoRende
  cdi: CelulaQuantoRende
}

export function linhasTesouroReserva(taxas: TaxasQuantoRendeValor): LinhaTesouroReserva[] | null {
  if (!Number.isFinite(taxas.selicAnual) || !Number.isFinite(taxas.cdiAnual) || !Number.isFinite(taxas.poupancaMensal)) return null
  const horizonte = HORIZONTES_QUANTO_RENDE.find((item) => item.id === '1a')
  if (!horizonte) return null
  const linhas: LinhaTesouroReserva[] = []
  for (const slug of SLUGS_SIMULACAO_RESERVA) {
    const entrada = valorPorSlug(slug)
    if (!entrada) return null
    const sim = simularQuantoRendeValor(entrada.reais, taxas)
    const reserva = celulaTesouroSelic(entrada.reais, taxas.selicAnual, horizonte)
    const poupanca = sim ? celulaDe(sim, 'poupanca', '1a') : null
    const selic = sim ? celulaDe(sim, 'tesouro-selic', '1a') : null
    const cdi = sim ? celulaDe(sim, 'cdi-100', '1a') : null
    if (!reserva || !poupanca || !selic || !cdi) return null
    linhas.push({
      entrada,
      href: `/quanto-rende/${entrada.slug}`,
      reserva,
      poupanca,
      selic,
      cdi,
    })
  }
  return linhas
}

/** Regra da poupança (Lei 12.703/2012) com a meta da série 432, quando ela veio. */
export function regraPoupancaTexto(taxas: TaxasQuantoRendeValor): string {
  const base = 'Com a meta da Selic acima de 8,5% ao ano, a remuneração adicional da poupança é 0,5% ao mês mais a TR. Igual ou abaixo de 8,5% ao ano, é 70% da meta mensalizada mais a TR.'
  if (taxas.selicMeta == null || !taxas.selicMetaData) return base
  const ramo = taxas.selicMeta > LIMIAR_POUPANCA_SELIC
    ? 'acima de 8,5% ao ano, a remuneração adicional é 0,5% ao mês mais a TR'
    : 'igual ou abaixo de 8,5% ao ano, a remuneração adicional é 70% da meta da Selic mensalizada mais a TR'
  return `A meta da Selic está em ${taxaFmt(taxas.selicMeta)} ao ano (série 432 do SGS, ${diaCurto(taxas.selicMetaData)}). ${ramo.charAt(0).toUpperCase()}${ramo.slice(1)}.`
}
