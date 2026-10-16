/**
 * "Leitura da Redentia": a opinião da casa sobre o número de cada seção do
 * /benchmark-ia (pedido do dono, 16/10: "3,5% é pouco, né? Bem... a cada 29
 * respostas, uma vai ser falsa, e se nessa falsa você perder tudo?").
 *
 * Tudo sai da edição: nenhum número escrito à mão, para a frase não mentir na
 * edição seguinte. Quando o dado muda de sentido (ninguém inventou, um só no
 * topo), a frase muda junto. `**...**` marca o trecho em negrito.
 *
 * A seção de golpes fica sem leitura: o dono pediu essa seção sem frase de
 * destaque (16/10).
 */

export interface LeituraInput {
  /** % de respostas inventadas por modelo (Inventa número?) */
  inventa?: { nome: string; inventou: number }[]
  /** % que concordou com o plano ruim e % que ficou no muro (Concorda com tudo?) */
  amem?: { nome: string; concordou: number; muro: number }[]
  /** nota de 0 a 100 no tributário */
  leao?: { nome: string; nota: number }[]
  /** quantos dividem o 1º lugar do placar geral */
  lideres?: number
  /** custo por mil respostas e posição no placar geral */
  custo?: { nome: string; custo: number; rank: number }[]
  /** rodadas mínimas da Carteira, quando ela ainda está em formação */
  carteiraEmFormacao?: number | null
}

export type LeituraId = 'geral' | 'inventa' | 'amem' | 'leao' | 'longo' | 'custo'

const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (v: number) => `${nf1.format(v)}%`
const nomes = (l: string[]) => (l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} e ${l.at(-1)}`)
const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/** "uma a cada N": N respostas para uma inventada */
export const umaACada = (p: number) => Math.max(1, Math.round(100 / p))

export function leituras(i: LeituraInput): Partial<Record<LeituraId, string>> {
  const out: Partial<Record<LeituraId, string>> = {}

  if (i.inventa?.length) {
    const m = media(i.inventa.map((r) => r.inventou))
    const pior = [...i.inventa].sort((a, b) => b.inventou - a.inventou)[0]!
    if (m > 0) {
      out.inventa = `**${pct(m)}** é pouco, né? Bem... a cada **${umaACada(m)}** respostas, uma vai ser falsa. E se nessa falsa você perder tudo?`
      if (pior.inventou >= m * 1.5) out.inventa += ` E a média ainda alivia: o ${pior.nome} inventou em **${pct(pior.inventou)}** das respostas, uma a cada **${umaACada(pior.inventou)}**.`
    } else {
      out.inventa = 'Nenhuma IA inventou número nesta edição. É o mínimo que se espera de quem vai falar do seu dinheiro.'
    }
  }

  if (i.amem?.length) {
    const m = media(i.amem.map((r) => r.concordou))
    const muro = [...i.amem].sort((a, b) => b.muro - a.muro)[0]!
    const pior = [...i.amem].sort((a, b) => b.concordou - a.concordou)[0]!
    out.amem = m > 0
      ? `Em média, **${pct(m)}** dos planos ruins ganharam um sim, e o ${pior.nome} chegou a **${pct(pior.concordou)}**. IA que concorda com tudo é vendedora, não conselheira.`
      : 'Zero amém: nenhuma IA aprovou o plano ruim. É a régua certa, porque IA que não sabe dizer não para o seu dinheiro é vendedora, não conselheira.'
    if (m === 0 && muro.muro > 0) out.amem += ` O mais perto de escorregar foi o ${muro.nome}, que ficou em cima do muro em **${pct(muro.muro)}** dos casos.`
  }

  if (i.leao?.length) {
    const top = i.leao.filter((r) => r.nota >= 99.95).map((r) => r.nome)
    const pior = [...i.leao].sort((a, b) => a.nota - b.nota)[0]!
    const melhor = Math.max(...i.leao.map((r) => r.nota))
    const quem = top.length
      ? `${nomes(top)} ${top.length > 1 ? 'gabaritaram' : 'gabaritou'}`
      : `a melhor nota foi **${nf1.format(melhor)}**`
    out.leao = melhor - pior.nota >= 20
      ? `No imposto a distância é grande: ${quem}, e o ${pior.nome} ficou em **${nf1.format(pior.nota)} de 100**. Regra errada aqui vira DARF esquecido ou imposto pago à toa.`
      : `No imposto, todas ficaram perto: ${quem}, e a pior nota foi **${nf1.format(pior.nota)}**. Ainda assim, confira a regra antes de pagar ou deixar de pagar um DARF.`
  }

  if (i.lideres != null && i.lideres > 0) {
    out.geral = i.lideres > 1
      ? `**${i.lideres}** IAs empatadas no topo não é falta de opinião, é margem de erro. Quem vende "a melhor IA para investir" sem margem de erro está vendendo empate como vitória.`
      : 'Uma IA sozinha no topo, fora da margem de erro das outras. Mesmo assim, olhe o índice que importa para você: a nota geral é uma média.'
  }

  if (i.custo && i.custo.length > 1) {
    const caro = [...i.custo].sort((a, b) => b.custo - a.custo)[0]!
    const barato = [...i.custo].filter((r) => r.rank <= 3).sort((a, b) => a.custo - b.custo)[0]
    if (barato && barato.nome !== caro.nome && caro.custo >= barato.custo * 2) {
      out.custo = `Nota alta não precisa custar caro: o ${barato.nome} ficou em **${barato.rank}º** no placar geral custando **US$ ${nf2.format(barato.custo)}** por mil respostas. O ${caro.nome} custa **US$ ${nf2.format(caro.custo)}**.`
    }
  }

  if (i.carteiraEmFormacao) {
    out.longo = `Aqui não tem gabarito: é a carteira contra o mercado, todo pregão. Até a **${i.carteiraEmFormacao}ª** rodada, quem está na frente pode estar só com sorte. Volte para ver quem sustenta.`
  }

  return out
}
