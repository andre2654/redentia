/**
 * Matemática de preço teto, extraída de app/pages/calculadora/preco-teto.vue
 * (que por sua vez é porte exato de calculateFairPrice do Frontend antigo,
 * components/calculator/FairPrice.vue).
 *
 * Está aqui, e não dentro da página, porque /calculadora/preco-teto/[metodo]
 * precisa da MESMA conta. Duplicar fórmula de valuation em dois arquivos é como
 * se cria divergência silenciosa entre duas páginas que prometem o mesmo número.
 *
 * Funções puras de propósito: sem Vue, sem fetch, sem formatação. Quem formata
 * é a página.
 */

export interface MethodResult {
  /** Preço teto pelo método. 0 quando faltam insumos. */
  fairPrice: number
  /** (teto - preço) / preço. Positivo = há margem de segurança. */
  margin: number
  /** preço / teto. Abaixo de 0,8 = barato; até 1,0 = justo; acima = caro. */
  ratio: number
}

export interface PrecoTetoInputs {
  price: number
  lpa: number
  vpa: number
  /** Dividendo por ação dos últimos 12 meses. */
  dividend: number
  sectorPL: number
  /**
   * Crescimento anual esperado do dividendo, em decimal (0,05 = 5% a.a.).
   * Só usado pelo método projetivo. Default 0 = projetivo vira Bazin.
   */
  dividendGrowth?: number
  /** Yield desejado do método Bazin/projetivo. Default 0,06 (a régua clássica). */
  targetYield?: number
}

export type MethodId = 'graham' | 'bazin' | 'pl-setorial' | 'valor-patrimonial' | 'projetivo'

/** Benjamin Graham: raiz de 22,5 × LPA × VPA (o 22,5 = P/L 15 × P/VP 1,5). */
export function grahamPrice(lpa: number, vpa: number): number {
  return lpa > 0 && vpa > 0 ? Math.sqrt(22.5 * lpa * vpa) : 0
}

/** Décio Bazin: dividendo dos 12 meses dividido pelo yield desejado (6%). */
export function bazinPrice(dividend: number, targetYield = 0.06): number {
  return dividend > 0 && targetYield > 0 ? dividend / targetYield : 0
}

/** P/L setorial: LPA × o P/L médio do setor do papel. */
export function plSectorPrice(lpa: number, sectorPL: number): number {
  return lpa > 0 && sectorPL > 0 ? lpa * sectorPL : 0
}

/** Valor patrimonial com prêmio: VPA × 1,5 (o mesmo 1,5 do P/VP de Graham). */
export function bookValuePrice(vpa: number, premium = 1.5): number {
  return vpa > 0 ? vpa * premium : 0
}

/**
 * Bazin projetivo: mesma régua do Bazin, mas sobre o dividendo do PRÓXIMO ciclo
 * em vez do último. Com crescimento zero é idêntico ao Bazin, e é assim de
 * propósito: sem estimativa de crescimento não existe projeção, existe chute.
 */
export function projectivePrice(dividend: number, growth = 0, targetYield = 0.06): number {
  if (dividend <= 0 || targetYield <= 0) return 0
  return (dividend * (1 + growth)) / targetYield
}

export function metrics(fairPrice: number, currentPrice: number): MethodResult {
  if (!(currentPrice > 0)) return { fairPrice, margin: 0, ratio: 0 }
  return {
    fairPrice,
    margin: fairPrice > 0 ? (fairPrice - currentPrice) / currentPrice : 0,
    ratio: fairPrice > 0 ? currentPrice / fairPrice : 0,
  }
}

/** Preço teto de UM método. Usado pelas páginas /preco-teto/[metodo]. */
export function priceByMethod(id: MethodId, i: PrecoTetoInputs): number {
  const targetYield = i.targetYield ?? 0.06
  switch (id) {
    case 'graham': return grahamPrice(i.lpa, i.vpa)
    case 'bazin': return bazinPrice(i.dividend, targetYield)
    case 'pl-setorial': return plSectorPrice(i.lpa, i.sectorPL)
    case 'valor-patrimonial': return bookValuePrice(i.vpa)
    case 'projetivo': return projectivePrice(i.dividend, i.dividendGrowth ?? 0, targetYield)
  }
}

export interface Consensus {
  averageFairPrice: number
  averageMargin: number
  recommendation: 'Comprar' | 'Neutro' | 'Caro'
  explanation: string
}

/**
 * Consenso dos 4 métodos clássicos (média dos válidos). O projetivo fica FORA
 * de propósito: ele é uma variação do Bazin sobre o mesmo dividendo, então
 * entrar na média seria contar Bazin duas vezes e puxar o consenso.
 */
export function consensusOf(prices: number[], currentPrice: number): Consensus {
  const valid = prices.filter((p) => p > 0)
  const averageFairPrice = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
  const averageMargin =
    averageFairPrice > 0 && currentPrice > 0 ? (averageFairPrice - currentPrice) / currentPrice : 0

  if (averageMargin > 0.2) {
    return {
      averageFairPrice,
      averageMargin,
      recommendation: 'Comprar',
      explanation:
        'A ação está negociando com boa margem de segurança abaixo do preço teto médio. Pode ser uma oportunidade interessante, mas valide também endividamento, ROE e perspectivas do setor.',
    }
  }
  if (averageMargin >= 0) {
    return {
      averageFairPrice,
      averageMargin,
      recommendation: 'Neutro',
      explanation:
        'A ação está próxima do preço teto médio. Avalie outros fundamentos antes de decidir e considere esperar uma janela com mais margem de segurança.',
    }
  }
  return {
    averageFairPrice,
    averageMargin,
    recommendation: 'Caro',
    explanation:
      'A ação está negociando acima do preço teto médio. Pode estar cara no momento, a menos que haja um catalisador claro de crescimento que justifique o prêmio.',
  }
}

/** Cálculo completo dos 4 métodos clássicos + consenso (contrato da página-mãe). */
export function computeAll(i: PrecoTetoInputs) {
  if (!(i.price > 0)) return null
  const graham = grahamPrice(i.lpa, i.vpa)
  const bazin = bazinPrice(i.dividend, i.targetYield ?? 0.06)
  const plSector = plSectorPrice(i.lpa, i.sectorPL)
  const book = bookValuePrice(i.vpa)

  return {
    graham: metrics(graham, i.price),
    bazin: metrics(bazin, i.price),
    plSector: metrics(plSector, i.price),
    bookValue: metrics(book, i.price),
    consensus: consensusOf([graham, bazin, plSector, book], i.price),
  }
}
