/**
 * Instituições com o logo de cada uma: a carteira vazia e a assinatura mostram
 * os bancos que a pessoa conecta (ClienteInstLogo). `logo: true` = existe
 * `public/instituicoes/{slug}.svg` (tests/instituicoes.test.ts confere no
 * disco); sem logo o avatar mostra as iniciais (iniciaisDe).
 *
 * Nasceu para a conexão do cliente final do escritório, espelho da lista de
 * instituições do Backend; a tela e a busca dela saíram com o B2B em
 * 12/11/2026, e a lista ficou para o site de investidor.
 *
 * A ordem é a de exibição: as mais usadas primeiro, como no seletor do
 * Pluggy Connect (fonte: scratchpad pluggy-ref/NOTAS.md).
 */
export type InstituicaoTipo = 'banco' | 'corretora'

export interface Instituicao {
  slug: string
  name: string
  logo: boolean
  tipo: InstituicaoTipo
  /** outros nomes pelos quais a pessoa procura (minúsculas, sem acento) */
  alias?: string[]
}

export const INSTITUICOES: readonly Instituicao[] = [
  { slug: 'nubank', name: 'Nubank', logo: true, tipo: 'banco', alias: ['nu', 'nuinvest', 'roxinho'] },
  { slug: 'itau', name: 'Itaú', logo: true, tipo: 'banco', alias: ['itau unibanco'] },
  { slug: 'bradesco', name: 'Bradesco', logo: true, tipo: 'banco' },
  { slug: 'bb', name: 'Banco do Brasil', logo: true, tipo: 'banco', alias: ['bb'] },
  { slug: 'santander', name: 'Santander', logo: true, tipo: 'banco' },
  { slug: 'caixa', name: 'Caixa', logo: false, tipo: 'banco', alias: ['caixa economica federal', 'cef'] },
  { slug: 'xp', name: 'XP Investimentos', logo: true, tipo: 'corretora', alias: ['xp'] },
  { slug: 'btg', name: 'BTG Pactual', logo: true, tipo: 'corretora' },
  { slug: 'rico', name: 'Rico', logo: true, tipo: 'corretora' },
  { slug: 'clear', name: 'Clear', logo: true, tipo: 'corretora' },
  { slug: 'inter', name: 'Inter', logo: true, tipo: 'banco', alias: ['banco inter'] },
  { slug: 'c6', name: 'C6 Bank', logo: true, tipo: 'banco' },
  { slug: 'toro', name: 'Toro', logo: true, tipo: 'corretora' },
  { slug: 'agora', name: 'Ágora', logo: true, tipo: 'corretora', alias: ['agora investimentos'] },
  { slug: 'avenue', name: 'Avenue', logo: true, tipo: 'corretora' },
  { slug: 'ion', name: 'Íon Itaú', logo: true, tipo: 'corretora', alias: ['ion'] },
  { slug: 'mercado-bitcoin', name: 'Mercado Bitcoin', logo: true, tipo: 'corretora', alias: ['mb'] },
  { slug: 'safra', name: 'Safra', logo: false, tipo: 'banco' },
  { slug: 'sicoob', name: 'Sicoob', logo: false, tipo: 'banco' },
  { slug: 'sicredi', name: 'Sicredi', logo: false, tipo: 'banco' },
  { slug: 'banrisul', name: 'Banrisul', logo: false, tipo: 'banco' },
  { slug: 'modal', name: 'Modal', logo: false, tipo: 'corretora', alias: ['modalmais'] },
  { slug: 'orama', name: 'Órama', logo: false, tipo: 'corretora' },
  { slug: 'genial', name: 'Genial', logo: false, tipo: 'corretora' },
  { slug: 'warren', name: 'Warren', logo: false, tipo: 'corretora' },
  { slug: 'picpay', name: 'PicPay', logo: false, tipo: 'banco' },
  { slug: 'mercado-pago', name: 'Mercado Pago', logo: false, tipo: 'banco' },
  { slug: 'neon', name: 'Neon', logo: false, tipo: 'banco' },
  { slug: 'daycoval', name: 'Daycoval', logo: false, tipo: 'banco' },
  { slug: 'bs2', name: 'BS2', logo: false, tipo: 'banco' },
  { slug: 'pan', name: 'Banco Pan', logo: false, tipo: 'banco' },
  { slug: 'bmg', name: 'BMG', logo: false, tipo: 'banco' },
  { slug: 'original', name: 'Original', logo: false, tipo: 'banco' },
  { slug: 'sofisa', name: 'Sofisa', logo: false, tipo: 'banco' },
]

/** Avatar de quem não tem logo: "Banco do Brasil" → "BR", "C6 Bank" → "C6", "Mercado Pago" → "MP". */
export function iniciaisDe(nome: string): string {
  const partes = nome.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(Boolean)
  const genericas = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'banco', 'bank'])
  const uteis = partes.filter(p => !genericas.has(p.toLowerCase()))
  const base = uteis.length ? uteis : partes
  if (!base.length) return '?'
  if (base.length >= 2) return `${base[0]![0]!}${base[1]![0]!}`.toUpperCase()
  return base[0]!.slice(0, 2).toUpperCase()
}
