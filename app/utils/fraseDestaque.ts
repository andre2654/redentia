/**
 * O destaque da linha "A frase" da /carteira (10/11/2026): cada seção responde
 * numa frase, e o número que importa vai em azul. A frase já vem pronta (do
 * backend ou das utils de cada seção); aqui só se acha o trecho que leva o
 * destaque, sem mexer no texto:
 *  - o primeiro valor em R$ ('R$ 1.060', 'R$ 20 mil', ou a máscara 'R$ ••••');
 *  - ou o primeiro percentual, com o que ele mede quando vem colado
 *    ('54% em renda fixa', '124% do CDI', '34% da sua vida');
 *  - ou 'um terço' / 'sem imposto', as respostas que não têm número.
 * Vale o que aparecer primeiro na frase. Sem nada disso, a frase sai inteira.
 */
const ALVO = /R\$\s?(?:\d+(?:\.\d{3})*(?:,\d+)?(?:\s?mil)?|•+)|\d+(?:,\d+)?%(?: do CDI| da sua vida| em [^,.:;]+?(?=,| e \d|[.:;]|$))?|um terço|sem imposto/

/** [antes, destaque, depois]; sem destaque, ['a frase inteira', '', ''] */
export function partesDaFrase(frase: string, alvo: RegExp = ALVO): [string, string, string] {
  const m = alvo.exec(frase)
  if (!m || !m[0]) return [frase, '', '']
  return [frase.slice(0, m.index), m[0], frase.slice(m.index + m[0].length)]
}

/** Uma palavra da frase partida para o destaque: o pedaço antes, o que leva o cobalto e o depois. */
export interface PalavraComDestaque { antes: string; destaque: string; depois: string }

/**
 * A frase palavra a palavra (como `frase.split(' ')`), cada uma com o pedaço
 * que leva o destaque (11/11/2026, robustez): para quem faz a frase surgir
 * palavra por palavra (No mundo, Na cadeia) e não usa o FraseDestaque. O texto
 * não muda; o trecho é o mesmo de `partesDaFrase` (a vírgula colada fica fora).
 */
export function palavrasComDestaque(frase: string, alvo: RegExp = ALVO): PalavraComDestaque[] {
  const [antes, d] = partesDaFrase(frase, alvo)
  const ini = antes.length
  const fim = ini + d.length
  const out: PalavraComDestaque[] = []
  let cursor = 0
  for (const p of frase.split(' ').filter(Boolean)) {
    const at = frase.indexOf(p, cursor)
    cursor = at + p.length
    if (!d || at + p.length <= ini || at >= fim) { out.push({ antes: p, destaque: '', depois: '' }); continue }
    const a = Math.max(0, ini - at)
    const b = Math.min(p.length, fim - at)
    out.push({ antes: p.slice(0, a), destaque: p.slice(a, b), depois: p.slice(b) })
  }
  return out
}
