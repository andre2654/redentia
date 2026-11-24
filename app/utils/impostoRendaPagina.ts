/**
 * Texto de /imposto-de-renda/{TICKER}.
 *
 * As regras vêm das páginas que já citam a lei (calculadora de IR,
 * /quanto-rende, /dividendos). O tipo de Bens e Direitos vem do manual da
 * Receita (gov.br), que nomeia o tipo e não imprime número de grupo. Sem
 * número na página oficial, a ficha sai sem código.
 *
 * Proventos: só linha com data de pagamento no ano, até hoje, vinda da base.
 * Histórico ausente não vira tabela.
 */
import { MONTHS_PT } from './format.ts'
import { TETO_DESCRICAO, TETO_TITULO_PAGINA } from './serp.ts'

export type ClasseIr = 'acao' | 'fii' | 'bdr' | 'etf'

export interface TrechoIr {
  texto: string
  /** absoluto (lei, gov.br) ou caminho interno */
  href?: string
}

export interface SecaoIr {
  id: 'bens' | 'rendimentos' | 'jcp' | 'ganho'
  titulo: string
  paragrafos: TrechoIr[][]
}

export interface ProventosIrAno {
  titulo: string
  colunas: string[]
  linhas: string[][]
  nota: string
  vazio: string | null
}

export interface FaqIr {
  q: string
  a: string
}

export interface PaginaImpostoRenda {
  classe: ClasseIr
  classeRotulo: string
  seo: { title: string; description: string }
  aviso: string
  secoes: SecaoIr[]
  proventos: ProventosIrAno
  faq: FaqIr[]
}

export interface LinhaProventoIr {
  /** pagamento 'YYYY-MM-DD'. Vazio = a definir, fica fora da lista de pagos. */
  payDate: string
  rate: number
  label: string
}

export interface EntradaImpostoRenda {
  ticker: string
  nome: string
  classe: ClasseIr
  cnpj: string | null
  /** null = o GET /dividends falhou. [] = a base respondeu sem linha. */
  rows: readonly LinhaProventoIr[] | null
  hoje: string
}

export const URL_BENS_RECEITA = 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/preenchimento/manual-mir/patrimonio/bens-financeiros'
export const URL_RENDA_VARIAVEL_RECEITA = 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/pagamento/renda-variavel'
export const URL_LEI_15270 = 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm'
export const URL_LEI_11033 = 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033compilado.htm'
export const URL_LC_224 = 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp224.htm'
export const URL_LEI_8668 = 'https://www.planalto.gov.br/ccivil_03/leis/l8668.htm'
export const URL_LEI_14754 = 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14754.htm'
export const URL_LEI_14130 = 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14130.htm'

const AVISO = 'Conteúdo educativo. Não é consultoria tributária e não é recomendação de compra ou venda.'

const ROTULO: Record<ClasseIr, string> = {
  acao: 'Ação',
  fii: 'FII',
  bdr: 'BDR',
  etf: 'ETF',
}

function t(texto: string, href?: string): TrechoIr {
  return href ? { texto, href } : { texto }
}

/**
 * Classe da ficha. O overview manda, como em useAcao. AURA33 chega como
 * STOCK, e a coluna de classe da B3 é DR3: nomeB3.ts já trata DRN, DR1, DR2
 * e DR3 como a classe do BDR.
 */
export function classeDeImpostoRenda(e: {
  assetType?: string | null
  profileType?: string | null
  nomeB3?: string | null
}): ClasseIr {
  const asset = (e.assetType ?? '').toLowerCase()
  const profile = (e.profileType ?? '').toUpperCase()
  if (asset === 'fii' || profile === 'REIT') return 'fii'
  if (asset === 'etf' || profile === 'ETF' || profile === 'US_ETF') return 'etf'
  if (asset === 'bdr' || profile === 'BDR') return 'bdr'
  if (/\s{2,}DR[N123]\b/.test(e.nomeB3 ?? '')) return 'bdr'
  return 'acao'
}

/** CNPJ mascarado. Qualquer outro texto do cadastro não vira CNPJ. */
export function cnpjDoCadastro(bruto: unknown): string | null {
  if (typeof bruto !== 'string') return null
  const limpo = bruto.trim()
  if (!/^[\d./-]+$/.test(limpo)) return null
  const digitos = limpo.replace(/\D/g, '')
  if (digitos.length !== 14) return null
  return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`
}

export function tituloImpostoRenda(ticker: string): string {
  const titulo = `Como declarar ${ticker.trim().toUpperCase()} no Imposto de Renda`
  if (titulo.length > TETO_TITULO_PAGINA) {
    return `Como declarar ${ticker.trim().toUpperCase()} no IR`
  }
  return titulo
}

export function descricaoImpostoRenda(ticker: string, classe: ClasseIr): string {
  const papel = ticker.trim().toUpperCase()
  const corpo: Record<ClasseIr, string> = {
    acao: `Como declarar ${papel} no IR: ação em Bens e Direitos, dividendos, JCP e ganho de capital com DARF. Conteúdo educativo, não é consultoria tributária.`,
    fii: `Como declarar ${papel} no IR: FII em Bens e Direitos, rendimento isento nas condições da lei e o ganho. Conteúdo educativo, não é consultoria tributária.`,
    bdr: `Como declarar ${papel} no IR: BDR em Bens e Direitos, dividendo do exterior e ganho na venda do recibo. Conteúdo educativo, não é consultoria tributária.`,
    etf: `Como declarar ${papel} no IR: ETF em Bens e Direitos e ganho na venda, sem a isenção mensal das ações. Conteúdo educativo, não é consultoria tributária.`,
  }
  const texto = corpo[classe]
  if (texto.length < 120 || texto.length > TETO_DESCRICAO) {
    throw new Error(`description ${classe} ${papel} fora de 120–155: ${texto.length}`)
  }
  return texto
}

function dataCurta(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}

const nf24 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

function dinheiro(n: number): string {
  return `R$ ${nf24.format(n)}`
}

function unidade(classe: ClasseIr): string {
  if (classe === 'fii') return 'cota'
  if (classe === 'bdr') return 'BDR'
  if (classe === 'etf') return 'cota'
  return 'ação'
}

function secaoBens(e: EntradaImpostoRenda): SecaoIr {
  const papel = e.ticker
  const nome = e.nome || papel
  const manual = t('manual de bens financeiros da Receita Federal', URL_BENS_RECEITA)
  const cnpj = e.cnpj
    ? [t(`O cadastro deste ativo traz o CNPJ ${e.cnpj}.`)]
    : [t('O cadastro consultado não traz o CNPJ do emissor. O informe de rendimentos da corretora é a fonte do CNPJ do pagador.')]
  const abertura = [t(`${nome} (${papel}) entra na ficha Bens e Direitos pelo tipo que o `), manual, t(' dá à classe. A página oficial lista o nome do tipo e não imprime número de grupo. Sem esse número na fonte, esta página não publica código.')]

  if (e.classe === 'fii') {
    return {
      id: 'bens',
      titulo: `Onde ${papel} entra em Bens e Direitos`,
      paragrafos: [
        abertura,
        [t('Em Fundos, o manual lista Fundos de Investimento Imobiliário (FII). A descrição pede a quantidade de cotas. O valor é o de aquisição, não a cotação do dia.')],
        cnpj,
      ],
    }
  }
  if (e.classe === 'etf') {
    return {
      id: 'bens',
      titulo: `Onde ${papel} entra em Bens e Direitos`,
      paragrafos: [
        abertura,
        [t('Em Fundos, o manual lista mais de um tipo que pode ser ETF, entre eles ETF - Entidade de investimento e Fundos de Índice de Renda Fixa. O subtipo depende do fundo. A página não escolhe um código que o manual não fixa para todo ETF.')],
        cnpj,
      ],
    }
  }
  if (e.classe === 'bdr') {
    return {
      id: 'bens',
      titulo: `Onde ${papel} entra em Bens e Direitos`,
      paragrafos: [
        abertura,
        [
          t('A '),
          t('página de renda variável da Receita', URL_RENDA_VARIAVEL_RECEITA),
          t(' lista o Brazilian Depositary Receipt (BDR) entre os investimentos de renda variável, ao lado de ações e de cotas de fundo. No manual de bens, Aplicações e Investimentos traz o tipo Ativos Negociados em Bolsa no Brasil, Exceto Ações e Fundos. O manual não imprime o número desse tipo, então o código fica de fora.'),
        ],
        cnpj,
      ],
    }
  }
  return {
    id: 'bens',
    titulo: `Onde ${papel} entra em Bens e Direitos`,
    paragrafos: [
      abertura,
      [t('Em Participações Societárias, o manual lista Ações (inclusive as listadas em Bolsa). A descrição pede quantidade e tipo. O valor é o custo de aquisição.')],
      cnpj,
      [t('Na declaração de 2026, ano-base 2025, a calculadora de IR da Aportou registra os dividendos em Rendimentos Isentos e Não Tributáveis, linha 9, e o JCP em Rendimentos Sujeitos à Tributação Exclusiva, linha 6. O programa do exercício seguinte pode renumerar a linha.')],
    ],
  }
}

function secaoRendimentos(e: EntradaImpostoRenda): SecaoIr {
  const papel = e.ticker
  if (e.classe === 'fii') {
    return {
      id: 'rendimentos',
      titulo: `Rendimentos de ${papel} e a isenção`,
      paragrafos: [
        [
          t('Pelo '),
          t('art. 3º, III, da Lei 11.033/2004', URL_LEI_11033),
          t(', o rendimento distribuído por fundo de investimento imobiliário com cotas admitidas à negociação exclusivamente em bolsa ou mercado de balcão organizado é isento de IR na fonte e na declaração da pessoa física.'),
        ],
        [
          t('O § 1º, I, exige no mínimo 100 cotistas, na redação da '),
          t('Lei 14.754/2023', URL_LEI_14754),
          t(', e o § 1º, II, na redação da '),
          t('Lei 14.130/2021', URL_LEI_14130),
          t(', não dá o benefício a quem tem 10% ou mais das cotas ou dos rendimentos do fundo.'),
        ],
        [t('A isenção, quando cabe, não dispensa informar o rendimento na declaração. JCP é figura de companhia. Fundo imobiliário não distribui JCP.')],
      ],
    }
  }
  if (e.classe === 'bdr') {
    return {
      id: 'rendimentos',
      titulo: `Dividendo de ${papel} e o imposto`,
      paragrafos: [
        [t(`O dividendo de BDR não tem a isenção do dividendo de ação brasileira. É rendimento vindo do exterior, com regra própria de tributação e de declaração no Brasil, depois do imposto já retido no país de origem. ${papel} não paga JCP, que é figura da lei brasileira.`)],
        [t('Como a regra muda por lei e pelo país da empresa, confirme a vigente antes de calcular.')],
      ],
    }
  }
  if (e.classe === 'etf') {
    return {
      id: 'rendimentos',
      titulo: `Rendimento de ${papel}`,
      paragrafos: [
        [t('A isenção mensal de vendas de ações não vale para ETF. A calculadora de IR da Aportou registra isso ao lado da isenção de R$ 20 mil, que fica restrita às ações no swing trade.')],
        [t('ETF não distribui JCP. Se a base registrar provento pago no ano, a tabela abaixo lista data, tipo e valor. Sem linha, a página não completa o ano com outro número.')],
      ],
    }
  }
  return {
    id: 'rendimentos',
    titulo: `Dividendos de ${papel}`,
    paragrafos: [
      [
        t('Pelo '),
        t('art. 10 da Lei 9.249/1995, na redação da Lei 15.270/2025', URL_LEI_15270),
        t(', o lucro ou dividendo pago por pessoa jurídica tributada pelo lucro real, presumido ou arbitrado não fica sujeito a IR na fonte nem entra na base do beneficiário domiciliado no País, ressalvados os arts. 6º-A e 16-A da Lei 9.250/1995.'),
      ],
      [
        t('O '),
        t('art. 6º-A da Lei 9.250/1995, incluído pelo art. 2º da Lei 15.270/2025', URL_LEI_15270),
        t(', sujeita à retenção na fonte de 10% sobre o total do valor pago o montante superior a R$ 50.000 que uma mesma pessoa jurídica paga a uma mesma pessoa física residente no Brasil em um mesmo mês. O caput fixa esse marco a partir do mês de janeiro do ano-calendário de 2026. O art. 8º da Lei 15.270/2025 diz que a lei produzirá efeitos a partir de 1º de janeiro de 2026.'),
      ],
    ],
  }
}

function secaoJcp(e: EntradaImpostoRenda): SecaoIr | null {
  if (e.classe !== 'acao') return null
  return {
    id: 'jcp',
    titulo: `JCP de ${e.ticker}, tributação exclusiva`,
    paragrafos: [
      [
        t('JCP tem IR na fonte de 17,5% na data do pagamento ou do crédito, pelo § 2º do art. 9º da Lei 9.249/1995, com a redação do '),
        t('art. 8º da Lei Complementar 224/2025', URL_LC_224),
        t('. O art. 14, III, produzirá efeitos a partir de 1º de janeiro de 2026 em relação aos demais dispositivos, e o art. 8º está nesse grupo.'),
      ],
      [t('A retenção é na fonte, sem a faixa de R$ 50 mil dos dividendos. O valor por ação na tabela abaixo, quando a base tiver JCP pago no ano, é o valor informado, antes de qualquer conta de líquido por investidor.')],
    ],
  }
}

function secaoGanho(e: EntradaImpostoRenda): SecaoIr {
  const papel = e.ticker
  const calc = t('calculadora de imposto de renda', '/calculadora/imposto-renda')
  if (e.classe === 'fii') {
    return {
      id: 'ganho',
      titulo: `Ganho na venda de ${papel} e o DARF`,
      paragrafos: [
        [
          t('O ganho na alienação ou no resgate da cota paga IR de 20%, pelo '),
          t('art. 18 da Lei 8.668/1993', URL_LEI_8668),
          t(', com a redação da Lei 9.779/1999. A isenção de vendas de até R$ 20 mil no mês é de ações no swing trade e não vale para FII.'),
        ],
        [
          t('A '),
          calc,
          t(' usa o código DARF 6015 para o ganho de FII, o mesmo das operações em bolsa de pessoa física, com vencimento no último dia útil do mês seguinte. Prejuízo de FII compensa lucro de FII.'),
        ],
      ],
    }
  }
  if (e.classe === 'bdr') {
    return {
      id: 'ganho',
      titulo: `Ganho na venda de ${papel} e o DARF`,
      paragrafos: [
        [t('A venda do BDR com lucro paga IR, sem a isenção de vendas de até R$ 20 mil por mês que vale para as ações no swing trade.')],
        [
          t('A apuração do mês e o código do DARF das operações em bolsa estão na '),
          calc,
          t('. O código usado ali para pessoa física em bolsa é 6015, e o vencimento é o último dia útil do mês seguinte.'),
        ],
      ],
    }
  }
  if (e.classe === 'etf') {
    return {
      id: 'ganho',
      titulo: `Ganho na venda de ${papel} e o DARF`,
      paragrafos: [
        [t('ETF não tem a isenção de R$ 20 mil em vendas no mês. O lucro das vendas paga 15%. Day trade de ações, na calculadora, é outra conta: 20%, sem essa isenção.')],
        [
          t('A '),
          calc,
          t(' apura o DARF das operações em bolsa com o código 6015 e o vencimento no último dia útil do mês seguinte (Lei 11.033/2004 e IN RFB 1.585/2015).'),
        ],
      ],
    }
  }
  return {
    id: 'ganho',
    titulo: `Ganho de capital de ${papel} e o DARF`,
    paragrafos: [
      [
        t('No swing trade, a alíquota é 15% sobre o lucro. Há isenção quando as vendas de ações no mês são iguais ou inferiores a R$ 20.000, pelo '),
        t('art. 3º, I, da Lei 11.033/2004', URL_LEI_11033),
        t('. A isenção é sobre o total vendido no mês, não sobre o lucro. Day trade não tem essa isenção: a alíquota é 20% sobre o lucro.'),
      ],
      [
        t('Os dois usam o DARF 6015, IRPF sobre ganhos líquidos em operações em bolsa. O vencimento é o último dia útil do mês seguinte. Se o fim do mês não é dia útil, o prazo antecipa. A '),
        calc,
        t(' faz essa conta. A base legal citada nela é a Lei 11.033/2004 e a IN RFB 1.585/2015.'),
      ],
      [t('Venda isenta também entra na declaração anual. Pagar o DARF do mês não substitui a ficha de Bens e Direitos nem a de renda variável.')],
    ],
  }
}

function proventosDoAno(e: EntradaImpostoRenda): ProventosIrAno {
  const ano = e.hoje.slice(0, 4)
  const titulo = `Proventos de ${e.ticker} pagos em ${ano}`
  const u = unidade(e.classe)
  if (e.rows === null) {
    return {
      titulo,
      colunas: ['Pagamento', 'Tipo', `Valor por ${u}`],
      linhas: [],
      nota: '',
      vazio: `O histórico de proventos de ${e.ticker} não está disponível agora. Esta página não completa ${ano} com data ou valor de outra fonte.`,
    }
  }
  const pagos = e.rows
    .filter((r) => r.payDate.startsWith(`${ano}-`) && r.payDate <= e.hoje && r.rate > 0)
    .slice()
    .sort((a, b) => b.payDate.localeCompare(a.payDate) || a.label.localeCompare(b.label))
  const nota = `Proventos com data de pagamento em ${ano}, até ${dataCurta(e.hoje)}, na base de proventos da Aportou. Evento sem data de pagamento não entra. O valor é o informado por ${u}.`
  if (!pagos.length) {
    return {
      titulo,
      colunas: ['Pagamento', 'Tipo', `Valor por ${u}`],
      linhas: [],
      nota,
      vazio: `A base não registra provento de ${e.ticker} com data de pagamento em ${ano} até ${dataCurta(e.hoje)}.`,
    }
  }
  return {
    titulo,
    colunas: ['Pagamento', 'Tipo', `Valor por ${u}`],
    linhas: pagos.map((r) => [dataCurta(r.payDate), r.label.trim() || 'Provento', dinheiro(r.rate)]),
    nota,
    vazio: null,
  }
}

function faqDe(e: EntradaImpostoRenda, proventos: ProventosIrAno): FaqIr[] {
  const papel = e.ticker
  const ano = e.hoje.slice(0, 4)
  const onde = e.classe === 'fii'
    ? `A cota de ${papel} entra em Bens e Direitos, no tipo Fundos de Investimento Imobiliário (FII), pelo manual de bens financeiros da Receita Federal. A página oficial não imprime número de grupo, e esta também não.`
    : e.classe === 'etf'
      ? `A cota de ${papel} entra em Bens e Direitos, em Fundos. O manual lista ETF - Entidade de investimento e Fundos de Índice de Renda Fixa, entre outros. Sem um código único para todo ETF na página oficial, a ficha não traz número.`
      : e.classe === 'bdr'
        ? `${papel} é BDR. A Receita lista o BDR na página de renda variável. Em Bens e Direitos, o manual tem o tipo Ativos Negociados em Bolsa no Brasil, Exceto Ações e Fundos, sem número de grupo publicado nessa página.`
        : `${papel} entra em Bens e Direitos, em Participações Societárias, no tipo Ações (inclusive as listadas em Bolsa). O manual da Receita nomeia o tipo e não imprime o número do grupo nessa página.`
  const rendimento = e.classe === 'fii'
    ? `O art. 3º, III, da Lei 11.033/2004 isenta o rendimento do FII para a pessoa física quando as cotas negociam só em bolsa ou balcão organizado, o fundo tem no mínimo 100 cotistas e o cotista não tem 10% ou mais das cotas ou dos rendimentos.`
    : e.classe === 'bdr'
      ? `Não tem a isenção do dividendo de ação brasileira. O valor chega depois do imposto retido no país de origem e segue regra própria de declaração.`
      : e.classe === 'etf'
        ? `A isenção de vendas de até R$ 20 mil no mês não vale para ETF. ETF não distribui JCP.`
        : `Pela Lei 15.270/2025, em vigor desde 1º de janeiro de 2026, o dividendo segue sem retenção até R$ 50 mil pagos pela mesma empresa no mês. Acima disso, a empresa retém 10% sobre o total do mês.`
  const ganho = e.classe === 'fii'
    ? `O ganho na venda da cota paga 20%, pelo art. 18 da Lei 8.668/1993. Não há a isenção de R$ 20 mil das ações. O DARF da calculadora é o 6015.`
    : e.classe === 'bdr'
      ? `A venda com lucro não usa a isenção de R$ 20 mil das ações. A calculadora de IR apura operações em bolsa no DARF 6015.`
      : e.classe === 'etf'
        ? `Não há isenção de R$ 20 mil. O lucro das vendas paga 15%. O DARF das operações em bolsa na calculadora é o 6015.`
        : `Swing trade: 15% sobre o lucro, com isenção se as vendas de ações no mês ficam até R$ 20 mil (Lei 11.033/2004, art. 3º, I). Day trade: 20%, sem essa isenção. Os dois usam o DARF 6015, no último dia útil do mês seguinte.`
  const lista = proventos.vazio
    ?? `A tabela lista ${proventos.linhas.length} ${proventos.linhas.length === 1 ? 'pagamento' : 'pagamentos'} de ${papel} em ${ano}, com a data de pagamento que a base registra.`
  return [
    { q: `Onde declarar ${papel} em Bens e Direitos?`, a: onde },
    { q: e.classe === 'acao' ? `Os dividendos de ${papel} são isentos?` : `Os rendimentos de ${papel} são isentos?`, a: rendimento },
    { q: `Como é o ganho na venda de ${papel}?`, a: ganho },
    { q: `Quais proventos de ${papel} a página lista em ${ano}?`, a: lista },
  ]
}

export function montarPaginaImpostoRenda(e: EntradaImpostoRenda): PaginaImpostoRenda {
  const classe = e.classe
  const proventos = proventosDoAno(e)
  const jcp = secaoJcp(e)
  const secoes = [secaoBens(e), secaoRendimentos(e), ...(jcp ? [jcp] : []), secaoGanho(e)]
  return {
    classe,
    classeRotulo: ROTULO[classe],
    seo: {
      title: tituloImpostoRenda(e.ticker),
      description: descricaoImpostoRenda(e.ticker, classe),
    },
    aviso: AVISO,
    secoes,
    proventos,
    faq: faqDe(e, proventos),
  }
}
