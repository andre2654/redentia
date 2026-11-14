/**
 * Os termos do fechamento da IA que quem está começando talvez não conheça
 * (31/10/2026, pedido do dono: a bolsa do dia na home "melhor principalmente
 * para o entendimento de investidores iniciantes"). Cada termo vira um botão
 * com a explicação curta: a do glossário do site quando ele tem a página
 * (o `slug`), ou uma frase escrita aqui quando não tem.
 *
 * Função pura, sem Nuxt: o teste trava o recorte (tests/termos-do-dia.test.ts).
 */

export interface TermoDoDia {
  id: string
  /** a página do glossário (/glossario/<slug>); null = só a explicação daqui */
  slug: string | null
  re: RegExp
}

/** A ordem não importa: o recorte pega sempre o primeiro que aparece no texto. */
export const TERMOS_DO_DIA: TermoDoDia[] = [
  { id: 'ibovespa', slug: 'ibovespa', re: /\bIbovespa\b/ },
  { id: 'selic', slug: 'selic', re: /\bSelic\b/ },
  { id: 'copom', slug: 'copom', re: /\bCopom\b/ },
  { id: 'cdi', slug: 'cdi', re: /\bCDI\b/ },
  { id: 'on-pn', slug: 'acoes-on-pn', re: /\b(?:ON|PN)\b/ },
  { id: 'papeis', slug: null, re: /\bpap[ée]is\b/i },
  { id: 'brent', slug: null, re: /\bBrent\b/ },
  { id: 'rebaixamento', slug: null, re: /\brebaix(?:amento|ou|ado|ada|á-lo|a-lo)\b/i },
]

/** As explicações dos termos que o glossário ainda não tem. */
export const EXPLICACOES_DO_DIA: Record<string, string> = {
  papeis: 'Papel é outro jeito de dizer ação: a fatia de uma empresa que se compra e se vende na bolsa.',
  brent: 'O Brent é o petróleo de referência no mundo. O preço dele, em dólares por barril, mexe com empresas como a Petrobras.',
  rebaixamento: 'É quando os analistas de um banco pioram a avaliação que fazem de uma ação. É uma opinião, não uma ordem, mas costuma mexer no preço.',
}

export type PedacoDoTexto = { texto: string } | { texto: string; termo: string; slug: string | null }

/**
 * Corta o texto nos termos conhecidos, cada termo marcado uma vez só (a
 * primeira vez que aparece), para o texto não virar uma fila de botões.
 */
export function marcarTermos(texto: string, termos: TermoDoDia[] = TERMOS_DO_DIA): PedacoDoTexto[] {
  const out: PedacoDoTexto[] = []
  const usados = new Set<string>()
  let resto = texto
  while (resto) {
    let melhor: { t: TermoDoDia; i: number; s: string } | null = null
    for (const t of termos) {
      if (usados.has(t.id)) continue
      const m = t.re.exec(resto)
      if (m && (!melhor || m.index < melhor.i)) melhor = { t, i: m.index, s: m[0] }
    }
    if (!melhor) {
      out.push({ texto: resto })
      break
    }
    if (melhor.i > 0) out.push({ texto: resto.slice(0, melhor.i) })
    out.push({ texto: melhor.s, termo: melhor.t.id, slug: melhor.t.slug })
    usados.add(melhor.t.id)
    resto = resto.slice(melhor.i + melhor.s.length)
  }
  return out
}
