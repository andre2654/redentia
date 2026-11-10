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
