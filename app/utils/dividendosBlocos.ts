/**
 * Blocos de /dividendos/{TICKER} para as perguntas que a página já sabe
 * responder com o GET /dividends e o DY do overview (os mesmos números do
 * resto da página). Cada bloco é um H2. Sem data ou sem valor, o bloco some
 * ou diz que a base não tem o campo. Não há data, valor ou yield inventado.
 *
 * 2026 e 2027 são os anos da demanda (19/11): JCP no ano corrente e o que
 * já foi anunciado para o ano seguinte. O recorte usa a data de pagamento
 * quando o aviso traz; sem ela, a data com.
 */
import type { NuFaqItem } from '../types/market.ts'
import { NOTA_CVM, dataCurtaAgenda, rotuloDoAviso } from './agendaDividendos.ts'
import { isoMinusDays, proventos12m, proventosFrequency, type ProventoRow } from './proventos.ts'

export const ANO_JCP = '2026'
export const ANO_SEGUINTE = '2027'

/**
 * Alíquota do JCP citada só com a regra já conferida em /quanto-rende:
 * § 2º do art. 9º da Lei 9.249/1995, redação do art. 8º da LC 224/2025,
 * efeitos em 1º/01/2026 (art. 14, III, da mesma lei). Não é número de aviso.
 */
export const TEXTO_ALIQUOTA_JCP =
  'JCP tem 17,5% de IR retido na fonte desde 1º de janeiro de 2026, pelo art. 8º da Lei Complementar 224/2025.'

export interface LinhaBloco {
  rotulo: string
  valor: string
}

export interface BlocoDividendos {
  id: 'data-com' | 'pagamento' | 'valor' | 'ultimo' | 'jcp-2026' | 'ano-2027' | 'dy'
  h2: string
  paragrafos: string[]
  linhas: LinhaBloco[]
  fonte: string
}

export interface BlocosDividendos {
  blocos: BlocoDividendos[]
  faq: NuFaqItem[]
  notaCvm: string
}

export interface EntradaBlocosDividendos {
  ticker: string
  isFii: boolean
  isBdr: boolean
  /** null = o GET /dividends falhou. [] = a API respondeu sem linhas. */
  rows: readonly ProventoRow[] | null
  dy: number | null
  dyBasis: 'oficial' | 'sem-renda' | null
  dyMatchesSum: boolean
  price: number | null
  priceDate: string | null
  hoje: string
}

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf24 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

function dinheiroEvento(n: number): string {
  return `R$ ${nf24.format(n)}`
}

function dinheiroSoma(n: number): string {
  return `R$ ${nf2.format(n)}`
}

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function ehJcp(label: string): boolean {
  const rotulo = rotuloDoAviso(label)
  if (rotulo === 'JCP' || rotulo === 'Dividendo + JCP' || rotulo === 'JCP + Dividendo') return true
  const n = semAcento(label)
  return n.includes('jcp') || n.includes('juros sobre capital')
}

function ehDividendo(label: string): boolean {
  const rotulo = rotuloDoAviso(label)
  return rotulo === 'Dividendo' || rotulo === 'Dividendo + JCP' || rotulo === 'JCP + Dividendo'
}

function fonteAvisos(hoje: string): string {
  return `Fonte: avisos de proventos da B3, consultados até ${dataCurtaAgenda(hoje)}.`
}

function noAno(r: ProventoRow, ano: string): boolean {
  if (r.payDate) return r.payDate.startsWith(ano)
  return r.date.startsWith(ano)
}

function ordenar(rows: readonly ProventoRow[]): ProventoRow[] {
  return [...rows].sort((a, b) => (a.payDate || a.date).localeCompare(b.payDate || b.date) || a.date.localeCompare(b.date))
}

function pagosNoDia(rows: readonly ProventoRow[], hoje: string, pred: (r: ProventoRow) => boolean): ProventoRow[] {
  const pagos = rows.filter((r) => r.income && !!r.payDate && r.payDate <= hoje && pred(r))
  if (!pagos.length) return []
  const dia = pagos.map((r) => r.payDate).sort().at(-1)!
  return pagos.filter((r) => r.payDate === dia)
}

function fraseEvento(r: ProventoRow, unit: string): string {
  const tipo = rotuloDoAviso(r.label)
  const com = r.hasExDate ? `data com em ${dataCurtaAgenda(r.date)}` : 'data com não informada no aviso'
  const pag = r.payDate ? `pagamento em ${dataCurtaAgenda(r.payDate)}` : 'pagamento a definir'
  return `${tipo} de ${dinheiroEvento(r.rate)} por ${unit}, ${com}, ${pag}.`
}

function linhasDeEventos(rows: readonly ProventoRow[]): LinhaBloco[] {
  return rows.slice(0, 8).map((r) => {
    const quando = r.payDate ? dataCurtaAgenda(r.payDate) : 'pagamento a definir'
    const com = r.hasExDate ? ` · com ${dataCurtaAgenda(r.date)}` : ''
    return {
      rotulo: `${rotuloDoAviso(r.label)} · ${quando}${com}`,
      valor: dinheiroEvento(r.rate),
    }
  })
}

function pagamentoTexto(rows: readonly ProventoRow[]): string {
  const datas = [...new Set(rows.map((r) => r.payDate).filter((d): d is string => !!d))]
  if (!datas.length) return 'A definir'
  return datas.map(dataCurtaAgenda).join(', ')
}

function definicaoDataCom(unit: string): string {
  return `A data com é o último pregão em que a ${unit} precisa estar na carteira para o investidor ter direito ao provento daquele anúncio. A data ex é o pregão seguinte e não vem como dia separado nesta base.`
}

function faqQuandoPaga(
  e: EntradaBlocosDividendos,
  unit: string,
  proximos: ProventoRow[],
  pendentes: ProventoRow[],
  fonte: string,
): NuFaqItem {
  const q = e.isFii ? `Rendimentos de ${e.ticker}: quando paga?` : `Dividendos ${e.ticker} quando paga?`
  if (proximos.length) {
    const assunto = e.isFii ? 'rendimentos' : 'dividendos'
    return {
      q,
      a: `O próximo pagamento anunciado de ${assunto} de ${e.ticker} é ${pagamentoTexto(proximos)}. ${proximos.map((r) => fraseEvento(r, unit)).join(' ')} Anúncio pode ser atualizado. Não é promessa de pagamento futuro. ${fonte}`,
    }
  }
  if (pendentes.length) {
    return {
      q,
      a: `Há provento anunciado de ${e.ticker} com pagamento ainda a definir. ${pendentes.slice(0, 4).map((r) => fraseEvento(r, unit)).join(' ')} ${fonte}`,
    }
  }
  return {
    q,
    a: `Não há pagamento futuro de ${e.ticker} anunciado nesta base. ${fonte}`,
  }
}

function faqOQueEDataCom(
  e: EntradaBlocosDividendos,
  unit: string,
  grupo: ProventoRow[],
  fonte: string,
): NuFaqItem {
  const q = e.isFii
    ? `O que é a data com de dividendos de um FII como ${e.ticker}?`
    : `O que é a data com de dividendos de ${e.ticker}?`
  if (!grupo.length) {
    return {
      q,
      a: `${definicaoDataCom(unit)} Nenhum aviso de ${e.ticker} nesta base traz data com. ${fonte}`,
    }
  }
  const data = dataCurtaAgenda(grupo[0]!.date)
  return {
    q,
    a: `${definicaoDataCom(unit)} Nesta página, a data com deste recorte de ${e.ticker} é ${data}. ${grupo.map((r) => fraseEvento(r, unit)).join(' ')} Quem tem ${e.ticker} nessa data tem direito ao que foi anunciado. ${fonte}`,
  }
}

function faqDataComNoAno(
  e: EntradaBlocosDividendos,
  unit: string,
  rows: readonly ProventoRow[],
  fonte: string,
): NuFaqItem {
  const eventos = ordenar(rows.filter((r) => r.hasExDate && r.date.startsWith(ANO_JCP) && (e.isFii ? r.income : ehDividendo(r.label))))
  const q = `Qual a data com de dividendos de ${e.ticker} em ${ANO_JCP}?`
  const tipo = e.isFii ? 'rendimento' : 'dividendo'
  if (!eventos.length) {
    return {
      q,
      a: `Não há data com de ${tipo} de ${e.ticker} em ${ANO_JCP} nesta base de avisos da B3. ${fonte}`,
    }
  }
  return {
    q,
    a: `As datas com de ${tipo} de ${e.ticker} em ${ANO_JCP} nesta base são: ${eventos.map((r) => fraseEvento(r, unit)).join(' ')} Isso é o que está anunciado, não uma previsão. ${fonte}`,
  }
}

export function montarBlocosDividendos(e: EntradaBlocosDividendos): BlocosDividendos {
  const unit = e.isFii ? 'cota' : e.isBdr ? 'BDR' : 'ação'
  const kind = e.isFii ? 'rendimentos' : 'dividendos'
  const fonte = fonteAvisos(e.hoje)
  const blocos: BlocoDividendos[] = []
  const faq: NuFaqItem[] = []
  const rows = e.rows

  if (rows != null) {
    const w = proventos12m(rows, e.hoje)
    const freq = proventosFrequency(w.events12)
    const grupoCom = escolherDataCom(rows, e.hoje)
    const proximos = proximoPagamento(rows, e.hoje)
    const cutoff = isoMinusDays(e.hoje, 365)
    const pendentes = rows.filter((r) => !r.payDate && r.date >= cutoff)
    const ultimoRenda = pagosNoDia(rows, e.hoje, () => true)
    const ultimoDiv = pagosNoDia(rows, e.hoje, (r) => ehDividendo(r.label))
    const jcpAno = ordenar(rows.filter((r) => r.income && ehJcp(r.label) && noAno(r, ANO_JCP)))
    const anoSeguinte = ordenar(rows.filter((r) => noAno(r, ANO_SEGUINTE)))

    blocos.push(blocoDataCom(e.ticker, unit, grupoCom, e.hoje, fonte))
    if (grupoCom.length) {
      const data = dataCurtaAgenda(grupoCom[0]!.date)
      faq.push({
        q: `Qual a data com de ${e.ticker}?`,
        a: `A data com de ${e.ticker} neste recorte é ${data}. ${grupoCom.map((r) => fraseEvento(r, unit)).join(' ')} Quem tem ${e.ticker} nessa data tem direito ao que foi anunciado. A data ex é o pregão seguinte e não vem como dia separado nesta base. ${fonte}`,
      })
    }
    // Busca real (autocomplete Google, 24 nov 2026, 10:03 UTC): "dividendos
    // {ticker} quando paga", "data com dividendos", "data com dividendos
    // {ticker}" e "data com dividendos ... 2026". Valor só se o aviso já
    // está nesta página, e a fonte traz a data da consulta.
    faq.push(faqQuandoPaga(e, unit, proximos, pendentes, fonte))
    faq.push(faqOQueEDataCom(e, unit, grupoCom, fonte))
    faq.push(faqDataComNoAno(e, unit, rows, fonte))

    const futuros = ordenar(rows.filter((r) => r.payDate && r.payDate > e.hoje))
    blocos.push(blocoPagamento(e, kind, unit, proximos, futuros, pendentes, ultimoRenda, freq, w.events12, fonte))

    blocos.push(blocoValor(e.ticker, unit, kind, w.income12, w.capital12, ultimoRenda, proximos, fonte))

    const ultimo = blocoUltimo(e, unit, ultimoRenda, ultimoDiv, fonte)
    blocos.push(ultimo.bloco)
    if (ultimo.faq) faq.push(ultimo.faq)

    if (!e.isFii && !e.isBdr) {
      blocos.push(blocoJcp(e.ticker, unit, jcpAno, fonte))
      faq.push({
        q: `Qual o JCP de ${e.ticker} em ${ANO_JCP}?`,
        a: jcpAno.length
          ? `Os avisos de JCP de ${e.ticker} com data em ${ANO_JCP} são: ${jcpAno.map((r) => fraseEvento(r, unit)).join(' ')} ${TEXTO_ALIQUOTA_JCP} ${fonte}`
          : `Não há JCP de ${e.ticker} com data em ${ANO_JCP} nesta base de avisos da B3. ${TEXTO_ALIQUOTA_JCP} ${fonte}`,
      })
    }

    if (anoSeguinte.length) {
      const soRenda = anoSeguinte.some((r) => r.income)
      const h2 = e.isFii
        ? (soRenda ? `Rendimentos ${e.ticker} ${ANO_SEGUINTE}` : `Amortização ${e.ticker} ${ANO_SEGUINTE}`)
        : (soRenda ? `Dividendos ${e.ticker} ${ANO_SEGUINTE}` : `Amortização ${e.ticker} ${ANO_SEGUINTE}`)
      blocos.push({
        id: 'ano-2027',
        h2,
        linhas: linhasDeEventos(anoSeguinte),
        paragrafos: [
          `Avisos de ${e.ticker} com data em ${ANO_SEGUINTE}. O tipo é o do aviso. Amortização devolve capital e não é ${e.isFii ? 'rendimento' : 'dividendo'}. Anúncio pode ser atualizado pela companhia ou pelo fundo.`,
          ...(anoSeguinte.length > 8
            ? [`A tabela de pagamentos desta página traz os outros ${anoSeguinte.length - 8} avisos.`]
            : []),
        ],
        fonte,
      })
      faq.push({
        q: soRenda
          ? (e.isFii ? `Quais os rendimentos de ${e.ticker} em ${ANO_SEGUINTE}?` : `Quais os dividendos de ${e.ticker} em ${ANO_SEGUINTE}?`)
          : `Quais os proventos de ${e.ticker} em ${ANO_SEGUINTE}?`,
        a: `Os avisos de ${e.ticker} com data em ${ANO_SEGUINTE} são: ${anoSeguinte.map((r) => fraseEvento(r, unit)).join(' ')} Isso é o que está anunciado nesta base, não uma previsão. ${fonte}`,
      })
    }
  }

  const dy = blocoDy(e, unit, kind, fonte)
  if (dy) {
    blocos.push(dy.bloco)
    if (dy.faq) faq.push(dy.faq)
  }

  return { blocos, faq, notaCvm: NOTA_CVM }
}

function escolherDataCom(rows: readonly ProventoRow[], hoje: string): ProventoRow[] {
  const com = rows.filter((r) => r.hasExDate)
  if (!com.length) return []
  const futuras = [...new Set(com.filter((r) => r.date >= hoje).map((r) => r.date))].sort()
  if (futuras.length) return com.filter((r) => r.date === futuras[0])
  const aPagar = com
    .filter((r) => r.payDate && r.payDate > hoje)
    .sort((a, b) => a.payDate.localeCompare(b.payDate) || a.date.localeCompare(b.date))
  if (aPagar.length) return com.filter((r) => r.date === aPagar[0]!.date)
  const ultima = [...new Set(com.map((r) => r.date))].sort().at(-1)!
  return com.filter((r) => r.date === ultima)
}

function proximoPagamento(rows: readonly ProventoRow[], hoje: string): ProventoRow[] {
  const futuros = rows.filter((r) => r.payDate && r.payDate > hoje)
  if (!futuros.length) return []
  const dia = futuros.map((r) => r.payDate).sort()[0]!
  return futuros.filter((r) => r.payDate === dia)
}

function blocoDataCom(ticker: string, unit: string, grupo: ProventoRow[], hoje: string, fonte: string): BlocoDividendos {
  if (!grupo.length) {
    return {
      id: 'data-com',
      h2: `Data com ${ticker}`,
      paragrafos: [`Nenhum aviso de ${ticker} nesta base traz data com.`],
      linhas: [],
      fonte,
    }
  }
  const data = dataCurtaAgenda(grupo[0]!.date)
  const futura = grupo[0]!.date >= hoje
  const pagamentoFuturo = grupo.some((r) => r.payDate > hoje)
  const abertura = futura
    ? `A próxima data com de ${ticker} nesta base é ${data}. Quem tem ${ticker} nessa data tem direito ao que foi anunciado.`
    : pagamentoFuturo
      ? `A data com do pagamento ainda não efetuado de ${ticker} é ${data}. Essa data já passou: quem compra depois dela não recebe esse anúncio.`
      : `Não há data com futura de ${ticker} nesta base. A mais recente é ${data}.`
  return {
    id: 'data-com',
    h2: `Data com ${ticker}`,
    linhas: [
      { rotulo: 'Data com', valor: data },
      { rotulo: 'Data ex', valor: 'Pregão seguinte à data com' },
      { rotulo: 'Pagamento', valor: pagamentoTexto(grupo) },
      ...grupo.map((r) => ({ rotulo: `${rotuloDoAviso(r.label)} por ${unit}`, valor: dinheiroEvento(r.rate) })),
    ],
    paragrafos: [
      abertura,
      'A data ex é o pregão seguinte à data com e não vem como dia separado nesta base.',
      ...grupo.map((r) => fraseEvento(r, unit)),
    ],
    fonte,
  }
}

function blocoPagamento(
  e: EntradaBlocosDividendos,
  kind: string,
  unit: string,
  proximos: ProventoRow[],
  futuros: ProventoRow[],
  pendentes: ProventoRow[],
  ultimoRenda: ProventoRow[],
  freq: string | null,
  events12: number,
  fonte: string,
): BlocoDividendos {
  const linhas: LinhaBloco[] = []
  const paragrafos: string[] = []
  if (proximos.length) {
    linhas.push({ rotulo: 'Próximo pagamento', valor: pagamentoTexto(proximos) })
    const mostrar = futuros.slice(0, 6)
    for (const r of mostrar) {
      linhas.push({
        rotulo: `${rotuloDoAviso(r.label)} · ${dataCurtaAgenda(r.payDate)}`,
        valor: dinheiroEvento(r.rate),
      })
    }
    paragrafos.push(`O próximo pagamento anunciado de ${e.ticker} é ${pagamentoTexto(proximos)}. ${proximos.map((r) => fraseEvento(r, unit)).join(' ')}`)
    const outras = [...new Set(futuros.map((r) => r.payDate))].filter((d) => d !== proximos[0]!.payDate)
    if (outras.length) {
      paragrafos.push(`Também há pagamento anunciado em ${outras.slice(0, 6).map(dataCurtaAgenda).join(', ')}.`)
    }
    if (futuros.length > mostrar.length) {
      paragrafos.push(`A tabela de pagamentos desta página traz os outros ${futuros.length - mostrar.length} avisos com data futura.`)
    }
  } else if (pendentes.length) {
    linhas.push({ rotulo: 'Próximo pagamento', valor: 'A definir' })
    paragrafos.push(`Há provento anunciado de ${e.ticker} com pagamento ainda a definir. ${pendentes.slice(0, 4).map((r) => fraseEvento(r, unit)).join(' ')}`)
  } else {
    paragrafos.push(`Não há pagamento futuro de ${e.ticker} anunciado nesta base.`)
  }
  if (ultimoRenda.length) {
    linhas.push({ rotulo: 'Último pagamento', valor: dataCurtaAgenda(ultimoRenda[0]!.payDate) })
    paragrafos.push(`O último pagamento de renda já efetuado foi em ${dataCurtaAgenda(ultimoRenda[0]!.payDate)}.`)
  }
  if (freq && events12 > 0) {
    linhas.push({ rotulo: 'Cadência em 12 meses', valor: freq })
    const palavra = e.isFii
      ? (events12 === 1 ? 'rendimento' : 'rendimentos')
      : (events12 === 1 ? 'provento de renda' : 'proventos de renda')
    paragrafos.push(`Nos últimos 12 meses houve ${events12} ${palavra} com data com, uma cadência ${freq.toLowerCase()}. Isso descreve o período. Não diz quando será o próximo anúncio.`)
  }
  return {
    id: 'pagamento',
    h2: `Quando ${e.ticker} paga ${kind}`,
    linhas,
    paragrafos,
    fonte,
  }
}

function blocoValor(
  ticker: string,
  unit: string,
  kind: string,
  income12: number,
  capital12: number,
  ultimoRenda: ProventoRow[],
  proximos: ProventoRow[],
  fonte: string,
): BlocoDividendos {
  const linhas: LinhaBloco[] = []
  const paragrafos: string[] = []
  if (income12 > 0) {
    linhas.push({ rotulo: `Renda em 12 meses por ${unit}`, valor: dinheiroSoma(income12) })
    paragrafos.push(`Nos últimos 12 meses, a soma dos ${kind} com data com foi ${dinheiroSoma(income12)} por ${unit}. A conta usa os valores como foram pagos.`)
  } else {
    paragrafos.push(kind === 'rendimentos'
      ? `${ticker} não tem rendimento com data com nos últimos 12 meses nesta base.`
      : `${ticker} não tem dividendo com data com nos últimos 12 meses nesta base.`)
  }
  if (capital12 > 0) {
    linhas.push({ rotulo: `Amortização em 12 meses por ${unit}`, valor: dinheiroSoma(capital12) })
    paragrafos.push(`No mesmo período houve ${dinheiroSoma(capital12)} por ${unit} em amortização. Amortização devolve capital e fica fora do dividend yield.`)
  }
  if (income12 <= 0 && ultimoRenda.length === 1) {
    linhas.push({ rotulo: `Último pago por ${unit}`, valor: dinheiroEvento(ultimoRenda[0]!.rate) })
  }
  if (proximos.length === 1) {
    linhas.push({ rotulo: `Próximo anunciado por ${unit}`, valor: dinheiroEvento(proximos[0]!.rate) })
    if (income12 <= 0) paragrafos.push(`O próximo anunciado é ${dinheiroEvento(proximos[0]!.rate)} por ${unit}.`)
  }
  if (!linhas.length) {
    paragrafos.push(`Não há valor por ${unit} de ${ticker} para mostrar.`)
  }
  return {
    id: 'valor',
    h2: `Quanto ${ticker} paga por ${unit}`,
    linhas,
    paragrafos,
    fonte,
  }
}

function blocoUltimo(
  e: EntradaBlocosDividendos,
  unit: string,
  ultimoRenda: ProventoRow[],
  ultimoDiv: ProventoRow[],
  fonte: string,
): { bloco: BlocoDividendos, faq: NuFaqItem | null } {
  const tituloVazio = e.isFii ? `Último rendimento de ${e.ticker}` : `Último dividendo de ${e.ticker}`
  if (!ultimoRenda.length) {
    return {
      bloco: {
        id: 'ultimo',
        h2: tituloVazio,
        paragrafos: [`Não há provento de renda com pagamento já efetuado de ${e.ticker} nesta base.`],
        linhas: [],
        fonte,
      },
      faq: null,
    }
  }
  const base = e.isFii ? ultimoRenda : (ultimoDiv.length ? ultimoDiv : ultimoRenda)
  const h2 = e.isFii
    ? `Último rendimento de ${e.ticker}`
    : ultimoDiv.length
      ? `Último dividendo de ${e.ticker}`
      : `Último provento de ${e.ticker}`
  const paragrafos = [base.map((r) => fraseEvento(r, unit)).join(' ')]
  if (!e.isFii && ultimoDiv.length && ultimoRenda[0]!.payDate > ultimoDiv[0]!.payDate) {
    paragrafos.push(`O provento de renda pago mais recentemente foi em ${dataCurtaAgenda(ultimoRenda[0]!.payDate)}: ${ultimoRenda.map((r) => fraseEvento(r, unit)).join(' ')}`)
  } else if (!e.isFii && ultimoDiv.length && ultimoRenda[0]!.payDate === ultimoDiv[0]!.payDate) {
    const outros = ultimoRenda.filter((r) => !ehDividendo(r.label))
    if (outros.length) paragrafos.push(`No mesmo pagamento: ${outros.map((r) => fraseEvento(r, unit)).join(' ')}`)
  }
  if (!e.isFii && !ultimoDiv.length) {
    paragrafos.unshift(`O último provento de renda pago de ${e.ticker} nesta base não veio com rótulo de dividendo.`)
  }
  const resposta = `${h2}: ${paragrafos.join(' ')} ${fonte}`
  return {
    bloco: {
      id: 'ultimo',
      h2,
      linhas: [
        { rotulo: 'Pagamento', valor: dataCurtaAgenda(base[0]!.payDate) },
        ...(base[0]!.hasExDate ? [{ rotulo: 'Data com', valor: dataCurtaAgenda(base[0]!.date) }] : []),
        ...base.map((r) => ({ rotulo: `${rotuloDoAviso(r.label)} por ${unit}`, valor: dinheiroEvento(r.rate) })),
      ],
      paragrafos,
      fonte,
    },
    faq: {
      q: e.isFii ? `Qual o último rendimento de ${e.ticker}?` : `Qual o último dividendo de ${e.ticker}?`,
      a: resposta,
    },
  }
}

function blocoJcp(ticker: string, unit: string, eventos: ProventoRow[], fonte: string): BlocoDividendos {
  if (!eventos.length) {
    return {
      id: 'jcp-2026',
      h2: `JCP ${ticker} ${ANO_JCP}`,
      paragrafos: [
        `Não há JCP de ${ticker} com data em ${ANO_JCP} nesta base de avisos da B3.`,
        TEXTO_ALIQUOTA_JCP,
      ],
      linhas: [],
      fonte,
    }
  }
  return {
    id: 'jcp-2026',
    h2: `JCP ${ticker} ${ANO_JCP}`,
    linhas: linhasDeEventos(eventos),
    paragrafos: [
      `Avisos de JCP de ${ticker} com pagamento em ${ANO_JCP}, ou com data com em ${ANO_JCP} quando o pagamento ainda não tem dia. O valor é o do aviso, por ${unit}. A retenção não está descontada aqui.`,
      TEXTO_ALIQUOTA_JCP,
      ...(eventos.length > 8 ? [`A tabela de pagamentos desta página traz os outros ${eventos.length - 8} avisos.`] : []),
    ],
    fonte,
  }
}

function blocoDy(
  e: EntradaBlocosDividendos,
  unit: string,
  kind: string,
  fonteAvisosTxt: string,
): { bloco: BlocoDividendos, faq: NuFaqItem | null } | null {
  const janela = e.rows == null ? null : proventos12m(e.rows, e.hoje)
  const income12 = janela?.income12 ?? null
  const capital12 = janela?.capital12 ?? 0
  if (e.dy == null && e.rows == null) return null
  const h2 = `Dividend yield de ${e.ticker}`
  if (e.dy == null) {
    return {
      bloco: {
        id: 'dy',
        h2,
        paragrafos: [`O dividend yield de 12 meses de ${e.ticker} está indisponível nesta página.`],
        linhas: [],
        fonte: 'Fonte: o overview do ativo não trouxe dividend yield de 12 meses para esta página.',
      },
      faq: null,
    }
  }
  const dyFmt = `${nf2.format(e.dy)}%`
  const linhas: LinhaBloco[] = [{ rotulo: 'Dividend yield (12M)', valor: dyFmt }]
  const fontes = [e.dy === 0 || e.dyBasis === 'sem-renda'
    ? fonteAvisosTxt
    : 'Fonte: dividend yield de 12 meses do overview do ativo, o mesmo número da página do ativo.']
  let corpo: string
  if (e.dy === 0) {
    corpo = capital12 > 0
      ? `O dividend yield de 12 meses de ${e.ticker} é zero. Houve ${dinheiroSoma(capital12)} por ${unit} em amortização no período, e amortização não entra no yield. Não é promessa de pagamento futuro.`
      : `O dividend yield de 12 meses de ${e.ticker} é zero: não houve ${kind} de renda com data com nos últimos 12 meses. Não é promessa de pagamento futuro.`
  } else if (income12 != null && income12 > 0 && e.dyMatchesSum) {
    linhas.push({ rotulo: `Renda em 12 meses por ${unit}`, valor: dinheiroSoma(income12) })
    fontes.push(fonteAvisosTxt)
    if (e.price != null && e.priceDate) fontes.push(`Cotação: Brapi (B3), pregão de ${dataCurtaAgenda(e.priceDate)}.`)
    corpo = `O dividend yield de 12 meses de ${e.ticker} é ${dyFmt}: os ${dinheiroSoma(income12)} por ${unit} em ${kind} com data com nos últimos 12 meses, divididos pela cotação. O número muda com o preço. Não é promessa de pagamento futuro.`
  } else if (income12 != null && income12 > 0) {
    corpo = `O dividend yield de 12 meses de ${e.ticker} é ${dyFmt}. A soma dos pagamentos, como foram pagos, não fecha com esse percentual. O número muda com o preço. Não é promessa de pagamento futuro.`
  } else {
    corpo = `O dividend yield de 12 meses de ${e.ticker} é ${dyFmt}. O número muda com o preço. Não é promessa de pagamento futuro.`
  }
  return {
    bloco: {
      id: 'dy',
      h2,
      linhas,
      paragrafos: [corpo],
      fonte: fontes.join(' '),
    },
    faq: null,
  }
}
