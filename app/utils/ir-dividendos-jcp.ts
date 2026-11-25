/**
 * IR retido na fonte sobre dividendos e JCP, pessoa física residente no Brasil.
 * A conta de /calculadora/ir-dividendos-jcp. Sem import do Nuxt: roda no
 * `node --test` (tests/ir-dividendos-jcp.test.ts).
 *
 * Dividendos: a mesma regra já publicada em /quanto-rende e no guia
 * imposto-sobre-dividendos. O art. 6º-A da Lei 9.250/1995, incluído pelo
 * art. 2º da Lei 15.270/2025, sujeita à retenção de 10% sobre o total do
 * valor pago o montante superior a R$ 50.000 que uma mesma pessoa jurídica
 * paga a uma mesma pessoa física num mesmo mês. Igual ou abaixo, sem
 * retenção. A alíquota não incide só sobre o excedente (efeito degrau).
 * Efeitos a partir de 1º de janeiro de 2026 (art. 8º da Lei 15.270/2025).
 *
 * JCP: § 2º do art. 9º da Lei 9.249/1995, redação do art. 8º da LC 224/2025,
 * efeitos em 1º/01/2026 (art. 14, III). 17,5% sobre o valor pago, sem a
 * faixa mensal do dividendo. O texto citado na página é TEXTO_ALIQUOTA_JCP.
 */
import { rotuloDoAviso } from './agendaDividendos.ts'
import { isCapitalLabel } from './proventos.ts'

export const LIMITE_MENSAL_DIVIDENDOS = 50_000
export const ALIQUOTA_DIVIDENDOS = 0.1
export const ALIQUOTA_JCP = 0.175

export type ClasseProvento = 'dividendo' | 'jcp' | 'misto' | 'rendimento' | 'capital' | 'outro'

export interface AvisoParaConta {
  /** 'YYYY-MM-DD' do pagamento. Vazio = a definir, fora da soma do mês. */
  pagamento: string
  /** 'YYYY-MM-DD' da data com, para mostrar e para achar o "a definir". */
  dataCom: string
  label: string
  /** valor por ação ou cota, como o aviso */
  rate: number
}

export interface LinhaAviso {
  pagamento: string
  dataCom: string
  rotulo: string
  classe: ClasseProvento
  rate: number
  /** rate × quantidade, em reais, só quando a linha entra na conta */
  valor: number | null
  entraNaConta: boolean
}

export interface ContaDoMes {
  dividendos: number
  jcp: number
  linhas: LinhaAviso[]
}

export interface FaixaIr {
  bruto: number
  retencao: number
  liquido: number
}

export interface IrDividendos extends FaixaIr {
  acimaDoLimite: boolean
}

export interface IrProventos {
  dividendos: IrDividendos
  jcp: FaixaIr
  retencao: number
  liquido: number
}

/** Reais com centavos. O que não é número finito, ou é negativo, vira zero. */
export function centavos(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round(n * 100) / 100
}

/**
 * Retenção de dividendos de uma mesma empresa, num mesmo mês.
 * Superior a R$ 50.000: 10% sobre o total. Até R$ 50.000, inclusive: zero.
 */
export function irSobreDividendos(bruto: number): IrDividendos {
  const b = centavos(bruto)
  const acimaDoLimite = b > LIMITE_MENSAL_DIVIDENDOS
  const retencao = acimaDoLimite ? centavos(b * ALIQUOTA_DIVIDENDOS) : 0
  return { bruto: b, retencao, liquido: centavos(b - retencao), acimaDoLimite }
}

/** JCP: 17,5% sobre o valor pago, sem faixa mensal. */
export function irSobreJcp(bruto: number): FaixaIr {
  const b = centavos(bruto)
  const retencao = centavos(b * ALIQUOTA_JCP)
  return { bruto: b, retencao, liquido: centavos(b - retencao) }
}

export function calcularIrProventos(dividendos: number, jcp: number): IrProventos {
  const d = irSobreDividendos(dividendos)
  const j = irSobreJcp(jcp)
  return {
    dividendos: d,
    jcp: j,
    retencao: centavos(d.retencao + j.retencao),
    liquido: centavos(d.liquido + j.liquido),
  }
}

/**
 * Classe do aviso com o mesmo rótulo de /dividendos. Misto (dividendo e JCP
 * no mesmo valor) não é repartido: o aviso não separa as duas partes.
 * Rendimento de FII e amortização ficam de fora da conta de dividendo.
 */
export function classeDoAviso(label: string): ClasseProvento {
  if (isCapitalLabel(label)) return 'capital'
  const rotulo = rotuloDoAviso(label)
  if (rotulo === 'Dividendo + JCP' || rotulo === 'JCP + Dividendo') return 'misto'
  if (rotulo === 'JCP') return 'jcp'
  if (rotulo === 'Dividendo') return 'dividendo'
  if (rotulo === 'Rendimento' || rotulo === 'Rendimento tributado' || rotulo === 'Rendimento + Amortização') return 'rendimento'
  const n = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (n.includes('jcp') || n.includes('juros sobre capital')) return 'jcp'
  return 'outro'
}

function iso(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

/**
 * Soma os avisos pagos no mês (YYYY-MM), vezes a quantidade.
 * Pagamento a definir não entra na soma. Misto, rendimento, capital e
 * rótulo desconhecido aparecem na lista e não entram na soma.
 */
export function contasDoMes(avisos: readonly AvisoParaConta[], mes: string, quantidade: number): ContaDoMes {
  const qtd = Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 0
  let dividendos = 0
  let jcp = 0
  const linhas: LinhaAviso[] = []
  for (const a of avisos) {
    const classe = classeDoAviso(a.label)
    const pagoNoMes = iso(a.pagamento) && a.pagamento.startsWith(`${mes}-`)
    const aDefinirNoMes = !a.pagamento && iso(a.dataCom) && a.dataCom.startsWith(`${mes}-`)
    if (!pagoNoMes && !aDefinirNoMes) continue
    const entra = pagoNoMes && qtd > 0 && (classe === 'dividendo' || classe === 'jcp') && Number.isFinite(a.rate) && a.rate > 0
    const valor = entra ? centavos(a.rate * qtd) : null
    if (entra && valor != null && classe === 'dividendo') dividendos = centavos(dividendos + valor)
    if (entra && valor != null && classe === 'jcp') jcp = centavos(jcp + valor)
    linhas.push({
      pagamento: a.pagamento,
      dataCom: a.dataCom,
      rotulo: rotuloDoAviso(a.label),
      classe,
      rate: a.rate,
      valor,
      entraNaConta: entra,
    })
  }
  linhas.sort((x, y) => (x.pagamento || x.dataCom).localeCompare(y.pagamento || y.dataCom) || x.rotulo.localeCompare(y.rotulo))
  return { dividendos, jcp, linhas }
}
