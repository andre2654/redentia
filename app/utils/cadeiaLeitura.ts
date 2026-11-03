/**
 * A cadeia de fornecimento do /asset lida por EMPRESA, não por linha
 * (03/11/2026, o dono: "consegue reimaginar essa seção aqui?"). O payload
 * (useAcao → AcaoCadeiaVM) traz duas listas, compra e venda, e a mesma empresa
 * pode estar nas duas (a Vibra compra da Petrobras e vende para ela): aqui ela
 * vira UMA entrada, marcada como fornecedora e cliente. Os nós de "resto"
 * ("Restante do custo", "Outros clientes") não são empresa: saem das listas e
 * a fração que conhecemos vem de `cobertura`.
 * Nenhum número novo: só se agrupa e se escreve a frase.
 */
import type { AcaoCadeiaCoberturaVM, AcaoCadeiaDetalheVM, AcaoCadeiaItemVM, AcaoCadeiaVM } from '../types/acao'

export type PapelNaCadeia = 'fornecedora' | 'cliente' | 'ambas'

export interface EmpresaDaCadeia {
  ticker: string
  nome: string
  papel: PapelNaCadeia
  /** o que a empresa da página COMPRA dela (ela é fornecedora) */
  compra: AcaoCadeiaItemVM | null
  /** o que a empresa da página VENDE para ela (ela é cliente) */
  venda: AcaoCadeiaItemVM | null
}

export interface RestoDaCadeia {
  custo: AcaoCadeiaDetalheVM | null
  clientes: AcaoCadeiaDetalheVM | null
}

/** As empresas, uma vez cada: as das duas pontas primeiro, depois fornecedoras e clientes na ordem do payload. */
export function empresasDaCadeia(c: AcaoCadeiaVM): EmpresaDaCadeia[] {
  const porTicker = new Map<string, EmpresaDaCadeia>()
  const ordem: string[] = []
  const pegar = (i: AcaoCadeiaItemVM) => {
    let e = porTicker.get(i.ticker)
    if (!e) {
      e = { ticker: i.ticker, nome: i.nome, papel: 'fornecedora', compra: null, venda: null }
      porTicker.set(i.ticker, e)
      ordem.push(i.ticker)
    }
    return e
  }
  for (const i of c.compraDe) if (!i.resto) pegar(i).compra = i
  for (const i of c.vendePara) if (!i.resto) pegar(i).venda = i
  const lista = ordem.map((t) => porTicker.get(t)!)
  for (const e of lista) e.papel = e.compra && e.venda ? 'ambas' : e.compra ? 'fornecedora' : 'cliente'
  const peso = { ambas: 0, fornecedora: 1, cliente: 2 } as const
  return lista.map((e, i) => ({ e, i })).sort((a, b) => peso[a.e.papel] - peso[b.e.papel] || a.i - b.i).map((x) => x.e)
}

/** O detalhe dos nós de resto (a conta: total da DFP − listadas = resto), para quem quer ver de onde vem a fração. */
export function restoDaCadeia(c: AcaoCadeiaVM): RestoDaCadeia {
  return {
    custo: c.compraDe.find((i) => i.resto)?.detalhe ?? null,
    clientes: c.vendePara.find((i) => i.resto)?.detalhe ?? null,
  }
}

/** O valor de uma ligação em uma linha: "R$ 16,2 bi em 2025"; sem valor na fonte, null (nunca "Indisponível"). */
export function valorDaLigacao(i: AcaoCadeiaItemVM | null): string | null {
  if (!i?.valor) return null
  return i.valorQuando ? `${i.valor} ${i.valorQuando}` : i.valor
}

/** De onde vem a ligação: o primeiro documento e o ano dele ("Relatório anual na SEC (20-F), 2026"). */
export function fonteDaLigacao(i: AcaoCadeiaItemVM | null): string | null {
  const p = i?.detalhe.provas[0]
  if (!p) return null
  const ano = p.data?.slice(-4)
  return ano ? `${p.fonte}, ${ano}` : p.fonte
}

/** A relação dita por inteiro, para o hover e o chat: "Petrobras vende para Vibra: derivados de petróleo · R$ 218,0 mi em contratos". */
export function relacaoDaLigacao(i: AcaoCadeiaItemVM): string {
  const v = valorDaLigacao(i)
  return [`${i.detalhe.titulo}${i.oQue ? `: ${i.oQue}` : ''}`, v].filter(Boolean).join(' · ')
}

/**
 * A fração que conhecemos, em frase: o que as ligações com valor explicam da
 * receita e do custo do ano. É o "restante" dito sem desenhar uma faixa do
 * tamanho do que NÃO sabemos.
 */
export function frasesDaCobertura(cob: AcaoCadeiaCoberturaVM | null | undefined, nome: string): string[] {
  if (!cob) return []
  const out: string[] = []
  const semValor = (n: number) => (n > 0 ? ` ${n === 1 ? 'Uma ligação não tem' : `${n} ligações não têm`} valor anual comparável e ${n === 1 ? 'fica' : 'ficam'} de fora da conta.` : '')
  // nenhum valor comparável: dizer isso, em vez de "R$ 0,00 têm cliente listado"
  const nada = (n: number, quem: string) => `Nenhuma ligação com ${quem} listado tem valor anual em reais de ${cob.ano}: ${n === 1 ? 'a que existe fica' : `as ${n} que existem ficam`} de fora da conta.`
  if (cob.receita) {
    out.push(cob.receita.pctN > 0
      ? `Das vendas da ${nome} em ${cob.ano} (${cob.receita.total}), ${cob.receita.conhecido} têm cliente listado com valor: ${cob.receita.pct}. O resto vai para empresas fora da bolsa, pessoas e o exterior.${semValor(cob.receita.semValor)}`
      : `As vendas da ${nome} em ${cob.ano} somaram ${cob.receita.total}. ${nada(cob.receita.semValor, 'cliente')}`)
  }
  if (cob.custo) {
    out.push(cob.custo.pctN > 0
      ? `Do custo dos produtos vendidos em ${cob.ano} (${cob.custo.total}), ${cob.custo.conhecido} têm fornecedor listado com valor: ${cob.custo.pct}. O resto são compras fora da bolsa e custos próprios.${semValor(cob.custo.semValor)}`
      : `O custo dos produtos vendidos em ${cob.ano} foi ${cob.custo.total}. ${nada(cob.custo.semValor, 'fornecedor')}`)
  }
  return out
}

/** O texto que o cursor do chat anexa: cada empresa com o papel e o valor. */
export function contextoDaCadeia(c: AcaoCadeiaVM, nome: string): string {
  const linhas = empresasDaCadeia(c).map((e) => {
    const partes = [e.compra ? `fornece ${e.compra.oQue ?? ''}${valorDaLigacao(e.compra) ? ` (${valorDaLigacao(e.compra)})` : ''}` : '', e.venda ? `compra ${e.venda.oQue ?? ''}${valorDaLigacao(e.venda) ? ` (${valorDaLigacao(e.venda)})` : ''}` : '']
    return `${e.ticker} (${e.nome}): ${partes.filter(Boolean).join('; ').replace(/\s+/g, ' ')}`
  })
  return [`Cadeia de fornecimento da ${nome} (empresas listadas).`, ...linhas, ...frasesDaCobertura(c.cobertura, nome)].join('\n')
}
