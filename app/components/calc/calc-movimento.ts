/**
 * O movimento das calculadoras (robustez, 11/11/2026; docs/aportou/robustez.md):
 * o número do resultado que conta até o valor novo (CalcNumero) e a curva que
 * se redesenha da forma antiga para a nova (CalcCurva), sem salto.
 *
 * Curva e tempo são os tokens (--nu-ease-saida, --nu-dur-lenta), lidos do CSS
 * na hora: uma animação feita no script segue a mesma régua do CSS. Com
 * movimento reduzido, nada anima: o valor novo aparece de uma vez.
 *
 * Sem Vue: só contas e leitura do CSS (no servidor, os padrões).
 */

/** O valor de um token do :root (ou o padrão, no servidor e quando falta). */
export function lerToken(nome: string, padrao: string): string {
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') return padrao
  const v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim()
  return v || padrao
}

/** "520ms" ou ".52s" → 520. */
export function duracaoDoToken(nome: string, padrao: number): number {
  const m = /^([\d.]+)\s*(ms|s)$/.exec(lerToken(nome, ''))
  if (!m) return padrao
  const n = Number(m[1])
  return m[2] === 's' ? n * 1000 : n
}

/** cubic-bezier(x1, y1, x2, y2) como função do tempo (0 → 1) para o progresso (0 → 1). */
export function curvaBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const x = (t: number) => ((ax * t + bx) * t + cx) * t
  const y = (t: number) => ((ay * t + by) * t + cy) * t
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (tempo: number) => {
    if (tempo <= 0) return 0
    if (tempo >= 1) return 1
    // Newton a partir do próprio tempo; se a derivada some, bisseção
    let t = tempo
    for (let i = 0; i < 8; i++) {
      const erro = x(t) - tempo
      if (Math.abs(erro) < 1e-5) return y(t)
      const d = dx(t)
      if (Math.abs(d) < 1e-6) break
      t -= erro / d
    }
    let lo = 0, hi = 1
    t = tempo
    for (let i = 0; i < 24; i++) {
      const v = x(t)
      if (Math.abs(v - tempo) < 1e-5) break
      if (v < tempo) lo = t
      else hi = t
      t = (lo + hi) / 2
    }
    return y(t)
  }
}

/** A curva de um token ("cubic-bezier(.16, 1, .3, 1)"), ou a do padrão. */
export function curvaDoToken(nome: string, padrao: [number, number, number, number]): (t: number) => number {
  const m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(lerToken(nome, ''))
  const [a, b, c, d] = m ? [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])] : padrao
  return curvaBezier(a, b, c, d)
}

export function movimentoReduzido(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** O primeiro número de um texto em pt-BR ("R$ 412.335", "6,00%", "R$ 2,71 mi") e o que vem antes e depois. */
export interface NumeroNoTexto {
  antes: string
  depois: string
  valor: number
  casas: number
  /** o número sai com o ponto do milhar (todo valor do site sai assim; "2026" sem ponto fica sem) */
  milhar: boolean
}

const NUMERO = /-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+(?:,\d+)?/

export function lerNumeroDoTexto(texto: string): NumeroNoTexto | null {
  const m = NUMERO.exec(texto)
  if (!m) return null
  const bruto = m[0]
  const [inteiro = '', fracao = ''] = bruto.split(',')
  const digitos = inteiro.replace(/[-.]/g, '')
  const valor = Number(`${inteiro.replace(/\./g, '')}.${fracao || '0'}`)
  if (!Number.isFinite(valor)) return null
  return {
    antes: texto.slice(0, m.index),
    depois: texto.slice(m.index + bruto.length),
    valor,
    casas: fracao.length,
    milhar: inteiro.includes('.') || digitos.length <= 3,
  }
}

/** O mesmo texto com outro valor, no mesmo jeito (casas e milhar). */
export function escreverNoTexto(n: NumeroNoTexto, valor: number): string {
  const corpo = valor.toLocaleString('pt-BR', { minimumFractionDigits: n.casas, maximumFractionDigits: n.casas, useGrouping: n.milhar })
  return `${n.antes}${corpo}${n.depois}`
}

/** Dá para contar de um texto ao outro? Mesmo começo, mesmo fim e as mesmas casas ("R$ 980 mil" → "R$ 1,02 mi" não dá). */
export function contaveis(de: NumeroNoTexto | null, para: NumeroNoTexto | null): de is NumeroNoTexto {
  return !!de && !!para && de.antes === para.antes && de.depois === para.depois && de.casas === para.casas
}

/** Uma série reamostrada para `n` pontos (interpolação linear pela posição relativa). */
export function reamostrar(serie: readonly number[], n: number): number[] {
  if (n <= 0) return []
  if (!serie.length) return Array.from({ length: n }, () => 0)
  if (serie.length === 1 || n === 1) return Array.from({ length: n }, () => serie[serie.length - 1]!)
  return Array.from({ length: n }, (_, i) => {
    const pos = (i / (n - 1)) * (serie.length - 1)
    const a = Math.floor(pos)
    const b = Math.min(serie.length - 1, a + 1)
    const f = pos - a
    return serie[a]! + (serie[b]! - serie[a]!) * f
  })
}
