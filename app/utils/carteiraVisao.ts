/**
 * As contas pequenas da /carteira nova (06/11/2026): o número brasileiro, a
 * data de quando cada fonte atualizou, a cobertura da vida. Puras, com teste.
 */
import type { AvisosVisao, CarteiraVisao, GravidadeAviso, PosicaoVisao, RendaVisao } from '~/types/carteiraVisao'

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const brl0 = (v: number) => `R$ ${nf0.format(Math.round(v))}`
export const brl2 = (v: number) => `R$ ${nf2.format(v)}`
/** 'R$ 204 mil' para valores grandes; 'R$ 9.800' abaixo de 10 mil */
export function brlCurto(v: number): string {
  if (Math.abs(v) >= 10_000) return `R$ ${nf0.format(Math.round(v / 1000))} mil`
  return brl0(v)
}
/** 37,3 → '37%'; abaixo de 10, uma casa ('6,0%' vira '6%') */
export function pctTxt(p: number): string {
  if (p > 0 && p < 1) return 'menos de 1%'
  if (p < 10) {
    const s = nf1.format(p)
    return `${s.endsWith(',0') ? s.slice(0, -2) : s}%`
  }
  return `${nf0.format(Math.round(p))}%`
}

/** 'hoje, 9h12' · 'ontem, 18h40' · '16/07' */
export function quandoAtualizou(iso: string, agora = new Date()): string {
  const d = new Date(iso)
  const dia = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dias = Math.round((dia(agora) - dia(d)) / 86_400_000)
  const hora = `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`
  if (dias === 0) return `hoje, ${hora}`
  if (dias === 1) return `ontem, ${hora}`
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** quanto da vida a renda que caiu na conta paga (0-100), ou null sem gasto (ou sem a renda) */
export function cobertura(r: RendaVisao | null): number | null {
  if (!r?.gastoMedio) return null
  return (r.caiu / r.gastoMedio) * 100
}

const PESO: Record<GravidadeAviso, number> = { alta: 0, media: 1, info: 2, bom: 3 }
/** os avisos em grupos: pede atenção (alta, média) e bom saber (info, bom) */
export function gruposDeAvisos(a: AvisosVisao, resolvidos: Set<string>) {
  const vivos = a.itens.filter((x) => !resolvidos.has(x.id)).sort((x, y) => PESO[x.gravidade] - PESO[y.gravidade])
  return {
    atencao: vivos.filter((x) => x.gravidade === 'alta' || x.gravidade === 'media'),
    saber: vivos.filter((x) => x.gravidade === 'info' || x.gravidade === 'bom'),
    resolvidos: a.itens.filter((x) => resolvidos.has(x.id)),
  }
}

/** o título do modal: '2 pedem atenção e 3 são bom saber' · 'Tudo normal. Sigo de olho.' */
export function tituloDosAvisos(atencao: number, saber: number): string {
  if (!atencao && !saber) return 'Tudo normal. Sigo de olho.'
  if (!atencao) return saber === 1 ? 'Tudo normal. Uma coisa boa de saber.' : `Tudo normal. ${saber} coisas boas de saber.`
  return atencao === 1 ? 'Uma coisa pede a sua atenção.' : `${atencao} coisas pedem a sua atenção.`
}

/**
 * O nome sem o complemento que o backend põe depois do ' · ' ('Tesouro IPCA+
 * 2050 · IPCA + 6,97%' → 'Tesouro IPCA+ 2050'): para frase e lista curta. A
 * lista de Ativos mostra o nome inteiro, com a taxa.
 */
export function nomeCurto(nome: string): string {
  return nome.split(' · ')[0]!.trim() || nome
}

/** como a posição entra numa frase: o título do Tesouro pelo nome curto, o resto pelo ticker */
export function rotuloDaPosicao(p: Pick<PosicaoVisao, 'ticker' | 'nome' | 'classe'>): string {
  return p.classe === 'TREASURY' && p.nome ? nomeCurto(p.nome) : p.ticker
}

/**
 * Renda fixa pelo que o ativo É, não pelo invólucro (07/11, revisão do dono):
 * o AUPO11 é um ETF, mas rende o CDI, e para quem investe é caixa. Tesouro, CDB
 * e o ETF que mora no fator Selic ou juros (LFT, IPCA+) contam como renda fixa,
 * o mesmo critério do imposto (o backend põe esses ETFs no grupo `rf`) e do
 * "No mundo". O FII com fator juros continua FII.
 */
const FATOR_DE_RENDA_FIXA = new Set(['selic', 'juros'])
export function ehRendaFixa(p: Pick<PosicaoVisao, 'classe' | 'fator'>): boolean {
  if (p.classe === 'TREASURY' || p.classe === 'FIXED_INCOME') return true
  return p.classe === 'ETF' && FATOR_DE_RENDA_FIXA.has(p.fator)
}

/** o grupo da lente Ativos: 'RF' para a renda fixa (inclusive o ETF de CDI), senão a classe */
export function grupoDaPosicao(p: Pick<PosicaoVisao, 'classe' | 'fator'>): string {
  return ehRendaFixa(p) ? 'RF' : p.classe
}

/** os grupos da lente Ativos: o nome no título e o nome dentro da frase */
export const GRUPOS_DA_CARTEIRA: Record<string, { nome: string; naFrase: string; cor: string }> = {
  RF: { nome: 'Renda fixa', naFrase: 'renda fixa', cor: 'var(--nu-alloc-fixed)' },
  STOCK: { nome: 'Ações', naFrase: 'ações', cor: 'var(--nu-alloc-stock)' },
  REIT: { nome: 'FIIs', naFrase: 'FIIs', cor: 'var(--nu-alloc-fii)' },
  ETF: { nome: 'ETFs', naFrase: 'ETFs', cor: 'var(--nu-class-etf)' },
  BDR: { nome: 'BDRs', naFrase: 'BDRs', cor: 'var(--nu-class-etf)' },
  CRYPTO: { nome: 'Cripto', naFrase: 'cripto', cor: 'var(--nu-gray)' },
}

/** 'a', 'a e b', 'a, b e c' */
function juntar(partes: string[]): string {
  return partes.length <= 1 ? (partes[0] ?? '') : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`
}

/**
 * A frase grande da lente Ativos. Peso demais num ativo só é o que a pessoa
 * precisa ver primeiro, mas só na renda variável: um terço num fundo de CDI é
 * caixa, não risco (a revisão do dono achou "um terço num só: o AUPO11"
 * estranho, e o relatório dizia "maior posição: 4,6%" ao mesmo tempo). Sem
 * concentração, a frase diz como o dinheiro se divide, pelas maiores classes.
 */
export function fraseDosAtivos(posicoes: Pick<PosicaoVisao, 'ticker' | 'nome' | 'classe' | 'fator' | 'valor'>[], patrimonio: number): string {
  const n = posicoes.length
  if (!n || patrimonio <= 0) return ''
  const maiorRv = [...posicoes].filter((p) => !ehRendaFixa(p)).sort((a, b) => b.valor - a.valor)[0]
  const pm = maiorRv ? (maiorRv.valor / patrimonio) * 100 : 0
  if (maiorRv && pm >= 25) return `${n} ativos, e ${pm >= 30 && pm < 37 ? 'um terço' : pctTxt(pm)} num só: o ${rotuloDaPosicao(maiorRv)}.`
  const porGrupo = new Map<string, number>()
  for (const p of posicoes) porGrupo.set(grupoDaPosicao(p), (porGrupo.get(grupoDaPosicao(p)) ?? 0) + p.valor)
  const partes = [...porGrupo.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => (v / patrimonio) * 100 >= 5)
    .slice(0, 3)
    .map(([g, v]) => `${pctTxt((v / patrimonio) * 100)} em ${GRUPOS_DA_CARTEIRA[g]?.naFrase ?? g.toLowerCase()}`)
  return partes.length ? `${n} ativos: ${juntar(partes)}.` : `${n} ativos.`
}

/** 'caiu R$ 6.645' sem quebrar a linha entre o R$ e o número (o texto do backend vem com espaço comum) */
export function semQuebraNoReal(t: string): string {
  return t.replace(/R\$ (?=[\d•])/g, 'R$\u00a0')
}

/** a soma das posições bate com o patrimônio (a regra que o backend garante) */
export function confereComOTopo(v: CarteiraVisao): boolean {
  const soma = v.posicoes.reduce((s, p) => s + p.valor, 0)
  return Math.abs(soma - v.patrimonio) < 0.5
}

/** a flag do servidor (`carteira.visao_usuarios`) deixou a pessoa de fora: 404 `{ error: 'visao_desligada' }` */
export function visaoDesligada(status: number | undefined, corpo: unknown): boolean {
  return status === 404 && (corpo as { error?: unknown } | null | undefined)?.error === 'visao_desligada'
}
