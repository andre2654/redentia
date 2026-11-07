/**
 * As contas pequenas da /carteira nova (06/11/2026): o número brasileiro, a
 * data de quando cada fonte atualizou, a cobertura da vida. Puras, com teste.
 */
import type { AvisosVisao, CarteiraVisao, GravidadeAviso } from '~/types/carteiraVisao'

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

/** quanto da vida a renda que caiu na conta paga (0-100), ou null sem gasto */
export function cobertura(r: CarteiraVisao['renda']): number | null {
  if (!r.gastoMedio) return null
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

/** a soma das posições bate com o patrimônio (a regra que o backend garante) */
export function confereComOTopo(v: CarteiraVisao): boolean {
  const soma = v.posicoes.reduce((s, p) => s + p.valor, 0)
  return Math.abs(soma - v.patrimonio) < 0.5
}

/** a flag do servidor (`carteira.visao_usuarios`) deixou a pessoa de fora: 404 `{ error: 'visao_desligada' }` */
export function visaoDesligada(status: number | undefined, corpo: unknown): boolean {
  return status === 404 && (corpo as { error?: unknown } | null | undefined)?.error === 'visao_desligada'
}
