/**
 * A cadeia de fornecimento DENTRO da carteira (05/11/2026, o dono: "coloque
 * nessa tela também a relação entre as minhas ações, no sentido de
 * dependência de outra empresa"). Junta as respostas de
 * GET /assets/{t}/supply-chain de cada ação da carteira e responde:
 *  1. as ligações ENTRE papéis da carteira (a Vale compra diesel da
 *     Petrobras, e as duas estão nela);
 *  2. as empresas de fora que mais de uma das suas compartilha; sem nenhuma
 *     em comum, as de fora mais fortes, uma por empresa sua, com moderação.
 *
 * Regras (as mesmas do backend, SupplyChainService):
 *  - a mesma ligação aparece nas duas pontas (a PETR4 "vende para" a VALE3 e
 *    a VALE3 "compra de" a PETR4): vira UMA, com o valor visto por quem
 *    vendeu; a do comprador só vale quando a do vendedor não veio;
 *  - classes da mesma empresa (PETR3/PETR4, TAEE11/TAEE4) são uma empresa só:
 *    a raiz de 4 letras da B3 e a lista `tickers` da própria ligação;
 *  - o valor é um só por ligação, na ordem de força (um ano de vendas, a soma
 *    dos contratos, a fatia da receita), na moeda em que veio. Nada se soma:
 *    nem moedas diferentes, nem tipos diferentes;
 *  - quem informou é dito sempre ("informado pela Braskem").
 * Só descreve: nenhuma palavra de risco ou de recomendação (CVM).
 *
 * Sem Vue e sem import de valor fora de utils, para o `node --test`.
 */
import type { AcaoCadeiaDetalheVM, SupplyChainApi, SupplyLinkApi } from '../types/acao'
import { nomeDaEmpresa } from './nomeB3.ts'
import { fmtCompactMoney } from './rankings.ts'

/** Uma posição de ação da carteira (o valor cru em R$, para o peso). */
export interface PosicaoDaCadeia {
  ticker: string
  /** asset_class do /portfolio: só STOCK tem cadeia */
  classe?: string | null
  valor: number
  nome?: string | null
}

export interface ValorDaCadeia {
  tipo: 'anual' | 'contratado' | 'receita'
  valor: number
  moeda: string | null
  /** 'R$ 16,2 bi' · 'US$ 459,0 mi' · '12%' */
  texto: string
  /** 'em 2025' · 'em 1 contrato' · 'da receita' */
  quando: string
  /** quem informou o número: o ticker principal de uma das pontas */
  por: string | null
}

/** Uma empresa da carteira (as classes juntas). */
export interface EmpresaDaCarteiraCadeia {
  raiz: string
  /** o papel que a pessoa tem (a classe de maior valor) */
  ticker: string
  /** todas as classes que a pessoa tem da empresa */
  tickers: string[]
  nome: string
  valor: number
  /** fatia do valor entre as ações da carteira, 0..1 (o tamanho do nó) */
  peso: number
  /** ligações com a outra ponta dentro da carteira */
  internas: number
  /** ligações com empresas de fora (todas, não só as mostradas) */
  externas: number
}

/** Uma ligação vendedor → comprador. */
export interface LigacaoDaCadeia {
  /** chave estável `VEND>COMP` (raízes) */
  id: string
  /** raiz de quem vende e de quem compra */
  vende: string
  compra: string
  oQue: string | null
  valor: ValorDaCadeia | null
  /** a ligação crua escolhida (a do vendedor quando há) */
  link: SupplyLinkApi
  /** em que respostas ela apareceu */
  vistaPor: ('vendedor' | 'comprador')[]
}

/** Uma empresa de fora da carteira, com as ligações dela com as suas. */
export interface ExternaDaCadeia {
  raiz: string
  ticker: string
  nome: string
  /** raízes das suas empresas ligadas a ela, na ordem do peso */
  empresas: string[]
  /** mais de uma das suas empresas compra dela ou vende para ela */
  compartilhada: boolean
  ligacoes: LigacaoDaCadeia[]
}

export interface CadeiaDaCarteira {
  /** todas as ações da carteira com resposta, na ordem do peso */
  empresas: EmpresaDaCarteiraCadeia[]
  internas: LigacaoDaCadeia[]
  /** as de fora que a seção mostra (já com a moderação) */
  externas: ExternaDaCadeia[]
  /** quantas de fora existem no total (mostradas ou não) */
  externasTotal: number
  /** alguma de fora é compartilhada por 2+ das suas */
  temCompartilhada: boolean
  /** a frase de cima, que responde a pergunta da seção */
  frase: string
  /** nome por raiz (as suas e as de fora), para as frases */
  nomes: Record<string, string>
  /** nenhuma ligação: a seção some */
  vazia: boolean
}

/** No máximo tantas ações por visita (uma chamada cada). */
export const TETO_DA_CADEIA = 12
/** Quantas empresas de fora a seção mostra no máximo. */
const TETO_DE_FORA = 5
/** Sem nenhuma compartilhada, a moderação: no máximo tantas de fora. */
const TETO_DE_FORA_SOZINHAS = 4

const RAIZ_B3 = /^([A-Z]{4})\d{1,2}[A-Z]?$/
const nf1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

/** PETR4 → PETR; TAEE11 → TAEE; MRSA3B → MRSA; 'GE' (EUA) → 'GE'. */
export function raizDaEmpresa(ticker: string): string {
  const t = ticker.trim().toUpperCase()
  return RAIZ_B3.exec(t)?.[1] ?? t
}

/**
 * As ações da carteira que a seção pergunta à API: só STOCK, uma por empresa
 * (a classe de maior valor), as maiores primeiro, no máximo `teto`.
 */
export function tickersDaCadeia(posicoes: PosicaoDaCadeia[], teto = TETO_DA_CADEIA): string[] {
  const porRaiz = new Map<string, { ticker: string; valor: number; total: number }>()
  for (const p of posicoes) {
    if ((p.classe ?? 'STOCK').toUpperCase() !== 'STOCK') continue
    const t = p.ticker.trim().toUpperCase()
    if (!t) continue
    const r = raizDaEmpresa(t)
    const v = Number.isFinite(p.valor) ? p.valor : 0
    const e = porRaiz.get(r)
    if (!e) porRaiz.set(r, { ticker: t, valor: v, total: v })
    else {
      e.total += v
      if (v > e.valor) { e.ticker = t; e.valor = v }
    }
  }
  return [...porRaiz.values()].sort((a, b) => b.total - a.total).slice(0, teto).map((e) => e.ticker)
}

/** O valor de uma ligação, um só, na ordem de força; null sem número na fonte. */
export function valorDaCadeia(l: SupplyLinkApi): ValorDaCadeia | null {
  if (l.anual && Number.isFinite(l.anual.valor)) {
    return { tipo: 'anual', valor: l.anual.valor, moeda: l.anual.moeda, texto: fmtCompactMoney(l.anual.valor, l.anual.moeda), quando: l.anual.ano ? `em ${l.anual.ano}` : 'por ano', por: l.anual.informado_por }
  }
  if (l.contratado?.valor) {
    const n = l.contratado.contratos
    return { tipo: 'contratado', valor: l.contratado.valor, moeda: l.contratado.moeda, texto: fmtCompactMoney(l.contratado.valor, l.contratado.moeda), quando: n > 0 ? `em ${n} contrato${n === 1 ? '' : 's'}` : 'em contratos', por: l.contratado.informado_por }
  }
  if (l.participacao_receita != null) {
    return { tipo: 'receita', valor: l.participacao_receita, moeda: null, texto: `${nf1.format(l.participacao_receita * 100)}%`, quando: 'da receita', por: null }
  }
  return null
}

/** O nome curto de uma ponta ('Braskem', 'GE Aerospace'). */
function nomeDoLink(l: SupplyLinkApi): string {
  return l.nome_b3 ? nomeDaEmpresa(l.nome_b3) : l.nome.replace(/,?\s+(S\.?A\.?|Inc\.?|Corp\.?|Corporation)$/i, '')
}

/** O nome que a posição traz (o do Open Finance): o bruto da B3 vira nome; 'S.A.' sai; vazio, o ticker. */
function nomeDaPosicao(nome: string | null | undefined, ticker: string): string {
  const n = (nome ?? '').trim()
  if (!n) return ticker
  if (/\s{2,}/.test(n)) return nomeDaEmpresa(n)
  return n.replace(/,?\s+(S\.?A\.?|Inc\.?|Corp\.?)$/i, '')
}

/** Força de uma ligação, só para ordenar (nunca para somar): fatia grande > ano > contrato > sem valor. */
function forca(l: LigacaoDaCadeia): number {
  const v = l.valor
  if (!v) return 0
  if (v.tipo === 'receita') return v.valor >= 0.05 ? 4 : 1
  if (v.tipo === 'anual') return 3
  return 2
}

/** Dentro da mesma força e da mesma moeda, o maior número vem antes. */
function compararLigacoes(a: LigacaoDaCadeia, b: LigacaoDaCadeia): number {
  const f = forca(b) - forca(a)
  if (f) return f
  if (a.valor && b.valor && a.valor.tipo === b.valor.tipo && a.valor.moeda === b.valor.moeda) return b.valor.valor - a.valor.valor
  return (b.link.fontes?.length ?? 0) - (a.link.fontes?.length ?? 0)
}

/**
 * Monta a cadeia da carteira a partir das respostas por ticker (as chaves são
 * os tickers perguntados; null/undefined = sem resposta) e das posições.
 */
export function cadeiaDaCarteira(posicoes: PosicaoDaCadeia[], respostas: Record<string, SupplyChainApi | null | undefined>): CadeiaDaCarteira {
  // os apelidos: cada classe que alguma ligação lista vai para a raiz do papel principal
  const apelido = new Map<string, string>()
  for (const r of Object.values(respostas)) {
    if (!r) continue
    for (const l of [...(r.compra_de ?? []), ...(r.vende_para ?? [])]) {
      const raiz = raizDaEmpresa(l.ticker)
      for (const t of [l.ticker, ...(l.tickers ?? [])]) apelido.set(t.toUpperCase(), raiz)
    }
  }
  const raizDe = (t: string) => apelido.get(t.trim().toUpperCase()) ?? raizDaEmpresa(t)

  // as suas empresas: as classes juntas, o peso entre as ações
  const minhas = new Map<string, EmpresaDaCarteiraCadeia & { maior: number }>()
  for (const p of posicoes) {
    if ((p.classe ?? 'STOCK').toUpperCase() !== 'STOCK') continue
    const t = p.ticker.trim().toUpperCase()
    if (!t) continue
    const r = raizDe(t)
    const v = Number.isFinite(p.valor) ? p.valor : 0
    const e = minhas.get(r)
    if (!e) minhas.set(r, { raiz: r, ticker: t, tickers: [t], nome: nomeDaPosicao(p.nome, t), valor: v, peso: 0, internas: 0, externas: 0, maior: v })
    else {
      e.valor += v
      if (!e.tickers.includes(t)) e.tickers.push(t)
      if (v > e.maior) { e.maior = v; e.ticker = t; if (p.nome?.trim()) e.nome = nomeDaPosicao(p.nome, t) }
    }
  }
  const total = [...minhas.values()].reduce((s, e) => s + Math.max(0, e.valor), 0)
  for (const e of minhas.values()) e.peso = total > 0 ? Math.max(0, e.valor) / total : 0

  // de quem é cada resposta (a raiz da empresa perguntada)
  const respondidas = new Set<string>()
  const nomes: Record<string, string> = {}
  const tickerDeFora = new Map<string, string>()

  // as ligações, uma por par vendedor → comprador
  const porPar = new Map<string, LigacaoDaCadeia>()
  const anotar = (vende: string, compra: string, l: SupplyLinkApi, vista: 'vendedor' | 'comprador') => {
    if (vende === compra) return
    const id = `${vende}>${compra}`
    const ja = porPar.get(id)
    if (!ja) {
      porPar.set(id, { id, vende, compra, oQue: l.o_que, valor: valorDaCadeia(l), link: l, vistaPor: [vista] })
      return
    }
    if (!ja.vistaPor.includes(vista)) ja.vistaPor.push(vista)
    // a visão de quem vendeu manda (como o backend); a do comprador só completa
    if (vista === 'vendedor') {
      ja.link = l
      ja.valor = valorDaCadeia(l) ?? ja.valor
      ja.oQue = l.o_que ?? ja.oQue
    } else {
      ja.valor = ja.valor ?? valorDaCadeia(l)
      ja.oQue = ja.oQue ?? l.o_que
    }
  }

  for (const [perguntado, r] of Object.entries(respostas)) {
    if (!r) continue
    const eu = raizDe(perguntado)
    if (!minhas.has(eu)) continue
    respondidas.add(eu)
    for (const l of r.compra_de ?? []) {
      const outra = raizDaEmpresa(l.ticker)
      nomes[outra] ??= nomeDoLink(l)
      if (!minhas.has(outra)) tickerDeFora.set(outra, l.ticker)
      anotar(outra, eu, l, 'comprador')
    }
    for (const l of r.vende_para ?? []) {
      const outra = raizDaEmpresa(l.ticker)
      nomes[outra] ??= nomeDoLink(l)
      if (!minhas.has(outra)) tickerDeFora.set(outra, l.ticker)
      anotar(eu, outra, l, 'vendedor')
    }
  }
  // o nome da sua empresa: o que a outra ponta usa (o nome da B3); sem isso, o da posição
  for (const e of minhas.values()) {
    if (nomes[e.raiz]) e.nome = nomes[e.raiz]!
    else nomes[e.raiz] = e.nome
  }

  // entra quem respondeu e quem aparece numa ligação de outra (a resposta dela
  // pode ter falhado ou ter ficado além do teto: a ligação existe do mesmo jeito)
  const citadas = new Set([...porPar.values()].flatMap((l) => [l.vende, l.compra]))
  const empresas = [...minhas.values()]
    .filter((e) => respondidas.has(e.raiz) || citadas.has(e.raiz))
    .sort((a, b) => b.valor - a.valor)
    .map(({ maior: _m, ...e }) => e)
  const ordem = new Map(empresas.map((e, i) => [e.raiz, i]))
  const daCarteira = (r: string) => ordem.has(r)

  const todas = [...porPar.values()]
  const internas = todas
    .filter((l) => daCarteira(l.vende) && daCarteira(l.compra))
    .sort((a, b) => compararLigacoes(a, b) || ordem.get(a.compra)! - ordem.get(b.compra)!)

  // as de fora, agrupadas por empresa
  const fora = new Map<string, ExternaDaCadeia>()
  for (const l of todas) {
    const dentroV = daCarteira(l.vende)
    const dentroC = daCarteira(l.compra)
    if (dentroV === dentroC) continue
    const ext = dentroV ? l.compra : l.vende
    const minha = dentroV ? l.vende : l.compra
    let e = fora.get(ext)
    if (!e) {
      e = { raiz: ext, ticker: tickerDeFora.get(ext) ?? ext, nome: nomes[ext] ?? ext, empresas: [], compartilhada: false, ligacoes: [] }
      fora.set(ext, e)
    }
    if (!e.empresas.includes(minha)) e.empresas.push(minha)
    e.ligacoes.push(l)
  }
  for (const e of fora.values()) {
    e.empresas.sort((a, b) => ordem.get(a)! - ordem.get(b)!)
    e.compartilhada = e.empresas.length > 1
    e.ligacoes.sort((a, b) => compararLigacoes(a, b))
  }

  for (const e of empresas) {
    e.internas = internas.filter((l) => l.vende === e.raiz || l.compra === e.raiz).length
    e.externas = [...fora.values()].reduce((s, x) => s + x.ligacoes.filter((l) => l.vende === e.raiz || l.compra === e.raiz).length, 0)
  }

  const melhorDe = (x: ExternaDaCadeia) => x.ligacoes[0]!
  const compararExternas = (a: ExternaDaCadeia, b: ExternaDaCadeia) =>
    b.empresas.length - a.empresas.length || compararLigacoes(melhorDe(a), melhorDe(b)) || ordem.get(a.empresas[0]!)! - ordem.get(b.empresas[0]!)!
  const listaFora = [...fora.values()].sort(compararExternas)
  const compartilhadas = listaFora.filter((x) => x.compartilhada).slice(0, TETO_DE_FORA)

  // a moderação: as compartilhadas e, completando, a de fora mais forte de cada
  // empresa sua (a maior primeiro), sem passar do teto
  const escolhidas = [...compartilhadas]
  const teto = compartilhadas.length ? TETO_DE_FORA : TETO_DE_FORA_SOZINHAS
  if (compartilhadas.length < 3) {
    for (const minha of empresas) {
      if (escolhidas.length >= teto) break
      if (escolhidas.some((x) => x.empresas.includes(minha.raiz))) continue
      const melhor = listaFora.find((x) => !escolhidas.includes(x) && x.empresas.includes(minha.raiz))
      if (melhor) escolhidas.push(melhor)
    }
  }
  const externas = escolhidas.sort(compararExternas)

  const vazia = internas.length === 0 && externas.length === 0
  return {
    empresas,
    internas,
    externas,
    externasTotal: fora.size,
    temCompartilhada: compartilhadas.length > 0,
    frase: vazia ? '' : fraseDaCadeia(internas, externas, nomes),
    nomes,
    vazia,
  }
}

/**
 * A frase de cima, em uma linha. Com ligação dentro da carteira, ela; sem,
 * a compartilhada mais forte; sem nada em comum, dizer isso.
 */
export function fraseDaCadeia(internas: LigacaoDaCadeia[], externas: ExternaDaCadeia[], nomes: Record<string, string>): string {
  const n = (r: string) => nomes[r] ?? r
  if (internas.length === 1) {
    const l = internas[0]!
    return `A ${n(l.compra)} compra da ${n(l.vende)}, e as duas estão na sua carteira.`
  }
  if (internas.length > 1) {
    const envolvidas = new Set(internas.flatMap((l) => [l.vende, l.compra])).size
    return `${envolvidas} das suas empresas fazem negócio entre si, em ${internas.length} ligações.`
  }
  const comp = externas.find((x) => x.compartilhada)
  if (comp) {
    // o verbo de quem é a maioria: "3 das suas empresas compram da Petrobras"
    const compram = comp.ligacoes.filter((l) => l.vende === comp.raiz).length
    const vendem = comp.ligacoes.filter((l) => l.compra === comp.raiz).length
    const k = comp.empresas.length
    return compram >= vendem
      ? `${k} das suas empresas compram da ${n(comp.raiz)}.`
      : `${k} das suas empresas vendem para a ${n(comp.raiz)}.`
  }
  return 'As suas empresas não fazem negócio entre si. Fora da carteira, elas se ligam a outras listadas.'
}

/** "A Petrobras vende diesel para a Vale" (vendedor → comprador, com o que circula). */
export function fraseDaLigacao(l: LigacaoDaCadeia, nomes: Record<string, string>): string {
  const n = (r: string) => nomes[r] ?? r
  return `A ${n(l.vende)} vende ${l.oQue ? `${l.oQue} ` : ''}para a ${n(l.compra)}.`
}

/**
 * A ligação contada pelo lado da carteira, com a sua empresa de sujeito:
 * "A Vale compra diesel da Petrobras." / "A WEG vende aerogeradores para a Axia."
 * Entre duas suas, quem compra é o sujeito.
 */
export function fraseDaCarteira(l: LigacaoDaCadeia, nomes: Record<string, string>, minhas: string[]): string {
  const n = (r: string) => nomes[r] ?? r
  const o = l.oQue ? `${l.oQue} ` : ''
  if (minhas.includes(l.compra)) return `A ${n(l.compra)} compra ${o}da ${n(l.vende)}.`
  return `A ${n(l.vende)} vende ${o}para a ${n(l.compra)}.`
}

/** O valor em uma linha: 'R$ 16,2 bi em 2025 · informado pela Braskem'; sem número, quem informou a ligação. */
export function valorEmLinha(l: LigacaoDaCadeia, nomes: Record<string, string>): string {
  const porTicker = (t: string | null) => (t ? nomes[raizDaEmpresa(t)] ?? t : null)
  const v = l.valor
  if (v) {
    const p = porTicker(v.por)
    return `${v.texto} ${v.quando}${p ? ` · informado pela ${p}` : ''}`
  }
  const quem = [...new Set((l.link.fontes ?? []).map((f) => porTicker(f.informado_por)).filter((x): x is string => !!x))]
  return `sem valor informado${quem.length ? ` · ligação informada pela ${quem.join(' e pela ')}` : ''}`
}

const PROVA: Record<string, string> = {
  cvm_partes_relacionadas: 'Formulário de Referência (CVM)',
  edgar_10k: 'Relatório anual na SEC (20-F)',
  nota_explicativa: 'Demonstrações financeiras',
  fre: 'Formulário de Referência (CVM)',
  ri: 'Documento de RI',
  release: 'Release de resultado',
  contrato: 'Comunicado da empresa',
  noticia: 'Notícia',
}

function dataBr(iso: string | null): string | null {
  return iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : null
}

/** O painel das provas (AcaoCadeiaDetalhe, o mesmo do /asset). */
export function detalheDaLigacao(l: LigacaoDaCadeia, nomes: Record<string, string>): AcaoCadeiaDetalheVM {
  const n = (r: string) => nomes[r] ?? r
  const quem = (t: string | null) => (t ? nomes[raizDaEmpresa(t)] ?? t : null)
  const por = (t: string | null) => { const q = quem(t); return q ? `informado pela ${q}` : null }
  const k = l.link
  const valores: AcaoCadeiaDetalheVM['valores'] = []
  if (k.anual) valores.push({ valor: fmtCompactMoney(k.anual.valor, k.anual.moeda), quando: k.anual.ano ? `em ${k.anual.ano}` : 'por ano', por: por(k.anual.informado_por) })
  if (k.contratado?.valor) {
    const c = k.contratado.contratos
    valores.push({ valor: fmtCompactMoney(k.contratado.valor, k.contratado.moeda), quando: `em ${c} contrato${c === 1 ? '' : 's'} (soma da vigência)`, por: por(k.contratado.informado_por) })
  }
  if (k.participacao_receita != null) valores.push({ valor: `${nf1.format(k.participacao_receita * 100)}%`, quando: 'da receita', por: null })
  return {
    titulo: `${n(l.vende)} vende para ${n(l.compra)}`,
    de: n(l.vende),
    para: n(l.compra),
    oQue: l.oQue,
    valores,
    conta: null,
    nota: null,
    fonteConta: null,
    provas: (k.fontes ?? []).map((f) => ({
      fonte: PROVA[f.tipo] ?? 'Documento',
      data: dataBr(f.data),
      por: quem(f.informado_por),
      valor: f.valor == null
        ? null
        : f.tipo_valor === 'pct_receita'
          ? `${nf1.format(f.valor)}% da receita`
          : `${fmtCompactMoney(f.valor, f.moeda)} ${f.tipo_valor === 'anual' ? (f.ano ? `em ${f.ano}` : 'por ano') : 'em contrato'}`,
      trecho: f.trecho,
      emIngles: f.tipo === 'edgar_10k',
      url: f.url,
    })),
  }
}

/** O texto que o cursor do chat anexa: as ligações, uma por linha, com valor e quem informou. */
export function contextoDaCadeiaDaCarteira(c: CadeiaDaCarteira): string {
  const linha = (l: LigacaoDaCadeia) => `${fraseDaLigacao(l, c.nomes).replace(/\.$/, '')} (${valorEmLinha(l, c.nomes)}).`
  const semLigacao = c.empresas.filter((e) => !e.internas && !e.externas).map((e) => e.ticker)
  return [
    'Cadeia de fornecimento entre as ações da carteira (empresas listadas, pelo que elas e as parceiras informam; valores como a empresa informou, sem somar moedas nem tipos).',
    c.frase,
    c.internas.length ? 'Dentro da carteira:' : 'Nenhuma ligação entre as empresas da carteira.',
    ...c.internas.map(linha),
    c.externas.length ? `Com empresas de fora${c.temCompartilhada ? ' (as compartilhadas primeiro)' : ''}:` : '',
    ...c.externas.flatMap((x) => x.ligacoes.map(linha)),
    semLigacao.length ? `Sem ligação com listadas: ${semLigacao.join(', ')}.` : '',
  ].filter(Boolean).join('\n')
}
