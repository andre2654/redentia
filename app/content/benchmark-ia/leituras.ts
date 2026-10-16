/**
 * "Leitura da Redentia": a opinião da casa sobre o número de cada seção do
 * /benchmark-ia, no formato número grande + uma linha (dono, 16/10: "mentalidade
 * de Apple, tirar muito texto, tudo meio autoexplicativo"). A primeira ideia
 * dele foi "3,5% é pouco, né? Bem... a cada 29 respostas, uma vai ser falsa, e
 * se nessa falsa você perder tudo?", que virou "1 em 29".
 *
 * Na página, a leitura fica atrás do botão "Leitura" (selo da marca) ao lado do
 * "i" de cada seção, num modal com o número, a frase e o detalhe (dono, 16/10).
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
  /** % que concordou com o plano ruim e % no muro, por modelo (Concorda com tudo?) */
  amem?: { nome: string; concordou: number; muro?: number }[]
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
  /** o dado por trás, para o modal do botão "Leitura" */
  detalhe?: string
}

export type LeituraId = 'inventa' | 'amem' | 'leao' | 'custo'

const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (v: number) => `${nf1.format(v)}%`
const nomes = (l: string[]) => (l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} e ${l.at(-1)}`)

/** "1 em N": N respostas para uma inventada */
export const umaACada = (p: number) => Math.max(1, Math.round(100 / p))

export function leituras(i: LeituraInput): Partial<Record<LeituraId, Leitura>> {
  const out: Partial<Record<LeituraId, Leitura>> = {}

  if (i.inventa?.length) {
    const m = media(i.inventa.map((r) => r.inventou))
    const pior = [...i.inventa].sort((a, b) => b.inventou - a.inventou)[0]!
    out.inventa = m > 0
      ? { numero: `1 em ${umaACada(m)}`, frase: 'respostas é falsa. E se for nela que você perde tudo?' }
      : { numero: '0', frase: 'respostas inventadas nesta edição.' }
    if (m > 0) {
      out.inventa.detalhe = `Na média das IAs, ${pct(m)} das respostas foram inventadas.`
      if (pior.inventou >= m * 1.5) out.inventa.detalhe += ` O pior caso foi o ${pior.nome}: ${pct(pior.inventou)}, 1 em ${umaACada(pior.inventou)}.`
    }
  }

  if (i.amem?.length) {
    const sim = i.amem.filter((r) => r.concordou > 0).length
    out.amem = { numero: `${sim} de ${i.amem.length}`, frase: sim ? 'IAs aprovaram algum plano ruim.' : 'IAs aprovaram o plano ruim.' }
    const pior = [...i.amem].sort((a, b) => b.concordou - a.concordou)[0]!
    const muro = [...i.amem].sort((a, b) => (b.muro ?? 0) - (a.muro ?? 0))[0]!
    if (sim) out.amem.detalhe = `O que mais concordou foi o ${pior.nome}: ${pct(pior.concordou)} dos planos ruins.`
    else if ((muro.muro ?? 0) > 0) out.amem.detalhe = `O mais perto de escorregar foi o ${muro.nome}, em cima do muro em ${pct(muro.muro!)} dos casos.`
  }

  if (i.leao && i.leao.length > 1) {
    const notas = i.leao.map((r) => Math.round(r.nota))
    const melhor = Math.max(...notas)
    const pior = Math.min(...notas)
    if (melhor > pior) {
      const top = i.leao.filter((r) => Math.round(r.nota) === melhor).map((r) => r.nome)
      const ult = i.leao.filter((r) => Math.round(r.nota) === pior).map((r) => r.nome)
      out.leao = { numero: `${melhor} a ${pior}`, frase: 'Da melhor à pior nota em imposto.', detalhe: `Nota ${melhor}: ${nomes(top)}. Nota ${pior}: ${nomes(ult)}.` }
    }
  }

  if (i.custo && i.custo.length > 1) {
    const caro = [...i.custo].sort((a, b) => b.custo - a.custo)[0]!
    const barato = [...i.custo].filter((r) => r.rank <= 3).sort((a, b) => a.custo - b.custo)[0]
    if (barato && barato.nome !== caro.nome && caro.custo >= barato.custo * 2) {
      const vezes = Math.round(caro.custo / barato.custo)
      const dif = caro.nota - barato.nota
      const nota = Math.abs(dif) < 5 ? 'com nota quase igual' : dif > 0 ? `por ${Math.round(dif)} pontos a mais` : `e com nota menor`
      out.custo = {
        numero: `${vezes}×`, frase: `mais caro: ${caro.nome} contra ${barato.nome}, ${nota}.`,
        detalhe: `${caro.nome}: US$ ${nf2.format(caro.custo)} por mil respostas, nota ${nf1.format(caro.nota)}. ${barato.nome}: US$ ${nf2.format(barato.custo)}, nota ${nf1.format(barato.nota)}.`,
      }
    }
  }

  return out
}
