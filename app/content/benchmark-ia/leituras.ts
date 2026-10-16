/**
 * "Leitura da Redentia": a opinião da casa sobre o número de cada seção do
 * /benchmark-ia, no formato número grande + uma linha (dono, 16/10: "mentalidade
 * de Apple, tirar muito texto, tudo meio autoexplicativo"). A primeira ideia
 * dele foi "3,5% é pouco, né? Bem... a cada 29 respostas, uma vai ser falsa, e
 * se nessa falsa você perder tudo?", que virou "1 em 29".
 *
 * Tudo sai da edição: nenhum número escrito à mão, para a frase não mentir na
 * edição seguinte, e a frase muda quando o dado muda de sentido. Só entra
 * leitura onde ela diz algo que o gráfico não diz sozinho: o Placar geral e a
 * Carteira já têm a frase deles ("3 empatados na frente", "Em formação"), e
 * Golpes fica sem, como o dono pediu para aquela seção.
 */

export interface LeituraInput {
  /** % de respostas inventadas por modelo (Inventa número?) */
  inventa?: { nome: string; inventou: number }[]
  /** % que concordou com o plano ruim por modelo (Concorda com tudo?) */
  amem?: { nome: string; concordou: number }[]
  /** nota de 0 a 100 no tributário */
  leao?: { nome: string; nota: number }[]
  /** custo por mil respostas, nota e posição no placar geral */
  custo?: { nome: string; custo: number; nota: number; rank: number }[]
}

export interface Leitura {
  /** o número grande */
  numero: string
  /** a linha embaixo dele */
  frase: string
}

export type LeituraId = 'inventa' | 'amem' | 'leao' | 'custo'

const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/** "1 em N": N respostas para uma inventada */
export const umaACada = (p: number) => Math.max(1, Math.round(100 / p))

export function leituras(i: LeituraInput): Partial<Record<LeituraId, Leitura>> {
  const out: Partial<Record<LeituraId, Leitura>> = {}

  if (i.inventa?.length) {
    const m = media(i.inventa.map((r) => r.inventou))
    out.inventa = m > 0
      ? { numero: `1 em ${umaACada(m)}`, frase: 'respostas é falsa. E se for nela que você perde tudo?' }
      : { numero: '0', frase: 'respostas inventadas nesta edição.' }
  }

  if (i.amem?.length) {
    const sim = i.amem.filter((r) => r.concordou > 0).length
    out.amem = { numero: `${sim} de ${i.amem.length}`, frase: sim ? 'IAs aprovaram algum plano ruim.' : 'IAs aprovaram o plano ruim.' }
  }

  if (i.leao && i.leao.length > 1) {
    const notas = i.leao.map((r) => Math.round(r.nota))
    const melhor = Math.max(...notas)
    const pior = Math.min(...notas)
    if (melhor > pior) out.leao = { numero: `${melhor} a ${pior}`, frase: 'Da melhor à pior nota em imposto.' }
  }

  if (i.custo && i.custo.length > 1) {
    const caro = [...i.custo].sort((a, b) => b.custo - a.custo)[0]!
    const barato = [...i.custo].filter((r) => r.rank <= 3).sort((a, b) => a.custo - b.custo)[0]
    if (barato && barato.nome !== caro.nome && caro.custo >= barato.custo * 2) {
      const vezes = Math.round(caro.custo / barato.custo)
      const dif = caro.nota - barato.nota
      const nota = Math.abs(dif) < 5 ? 'com nota quase igual' : dif > 0 ? `por ${Math.round(dif)} pontos a mais` : `e com nota menor`
      out.custo = { numero: `${vezes}×`, frase: `mais caro: ${caro.nome} contra ${barato.nome}, ${nota}.` }
    }
  }

  return out
}
