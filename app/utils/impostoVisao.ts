/**
 * As contas pequenas do "Imposto do mês" da /carteira nova (07/11/2026): o
 * nome do mês, a frase grande, a linha de cada grupo, a ordem dos meses do
 * histórico e o selo das vendas na lista de movimentações. Puras, com teste
 * (tests/carteira-imposto.test.ts).
 *
 * O imposto é calculado no backend (`App\Services\Carteira\Imposto`, regras de
 * ir-regras-conferidas-out-2026); aqui só se escolhe a frase. `fmt` formata o
 * R$ da pessoa: a tela passa a versão com a máscara do olho (useHiddenValues),
 * e o teto da isenção, que é regra e não dado dela, nunca se esconde.
 */
import type { GrupoImposto, GrupoImpostoVisao, MesHistorico, MesImposto, OperacaoImposto, SeloImposto } from '~/types/carteiraVisao'

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const brl0 = (v: number) => `R$ ${nf0.format(Math.round(v))}`
/** o teto da regra: 'R$ 20 mil' */
const teto = (v: number) => (v >= 1000 && v % 1000 === 0 ? `R$ ${nf0.format(v / 1000)} mil` : brl0(v))
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** '2026-11' → 'novembro' */
export function nomeDoMes(mes: string): string {
  return MESES[Number(mes.slice(5, 7)) - 1] ?? mes
}
/** '2026-11' → 'nov' */
export function mesCurto(mes: string): string {
  return nomeDoMes(mes).slice(0, 3)
}
/** '2026-11' → 'novembro de 2026' */
export function mesEAno(mes: string): string {
  return `${nomeDoMes(mes)} de ${mes.slice(0, 4)}`
}
/** '2026-12-30' → '30/12' */
export function diaMes(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
}

export const NOME_DO_GRUPO: Record<GrupoImposto, string> = { acoes: 'Ações', fii: 'FII', etf: 'ETF', rf: 'Renda fixa', cripto: 'Cripto' }
const ORDEM: GrupoImposto[] = ['acoes', 'fii', 'etf', 'rf', 'cripto']
/** sempre ações, FII, ETF, renda fixa e cripto, venha como vier */
export function gruposEmOrdem(grupos: GrupoImpostoVisao[]): GrupoImpostoVisao[] {
  return [...grupos].sort((a, b) => ORDEM.indexOf(a.grupo) - ORDEM.indexOf(b.grupo))
}

/**
 * Vendeu e o custo que falta impede a conta. Sem o custo, o backend só deixa o
 * imposto null quando precisa dele (`Imposto::grupoDoMes`, o `incompleto`): nas
 * ações dentro dos R$ 20 mil o mês é isento de qualquer jeito, e o imposto vem 0.
 * Cripto fica de fora: a regra ainda vai ser conferida e o imposto não é estimado.
 */
const vendeuSemCusto = (g: GrupoImpostoVisao) => g.vendido > 0 && !g.custoConhecido && g.impostoEstimado == null && g.grupo !== 'cripto'

/**
 * A frase grande do mês:
 *  - 'Novembro sem imposto até agora.' (sem venda, ou venda sem imposto)
 *  - 'Em novembro você ainda pode vender R$ 1.300 em ações sem imposto.'
 *  - 'Em novembro, as vendas de ações passaram dos R$ 20 mil isentos.'
 *  - 'Em novembro, o imposto estimado é de R$ 82.' (FII ou ETF com lucro)
 */
export function fraseDoMes(m: MesImposto, fmt: (v: number) => string = brl0): string {
  const nome = nomeDoMes(m.mes)
  if (!m.grupos.some((g) => g.vendido > 0)) return `${cap(nome)} sem imposto até agora.`
  const acoes = m.grupos.find((g) => g.grupo === 'acoes')
  if (acoes?.isencao != null && acoes.vendido > 0) {
    if (acoes.vendido > acoes.isencao) return `Em ${nome}, as vendas de ações passaram dos ${teto(acoes.isencao)} isentos.`
    if ((acoes.cabeAinda ?? 0) <= 0) return `Em ${nome}, as vendas de ações chegaram aos ${teto(acoes.isencao)} isentos.`
    return `Em ${nome} você ainda pode vender ${fmt(acoes.cabeAinda!)} em ações sem imposto.`
  }
  if ((m.darf.valor ?? 0) > 0) return `Em ${nome}, o imposto estimado é de ${fmt(m.darf.valor!)}.`
  if (m.grupos.some(vendeuSemCusto)) return `Em ${nome}, falta o custo de uma venda para eu fechar a conta.`
  return `${cap(nome)} sem imposto até agora.`
}

/** a nota cinza abaixo da frase: o mês anterior, o único outro de que o aviso fala */
export function linhaDoMesAnterior(m: MesImposto, fmt: (v: number) => string = brl0): string {
  const nome = nomeDoMes(m.mes)
  if ((m.darf.valor ?? 0) > 0 && m.darf.vence) return `O DARF de ${nome}, de ${fmt(m.darf.valor!)}, vence em ${diaMes(m.darf.vence)}.`
  const vendido = m.grupos.reduce((s, g) => s + g.vendido, 0)
  if (vendido <= 0) return `${cap(nome)} sem venda.`
  if (m.grupos.some(vendeuSemCusto)) return `Em ${nome}, faltou o custo de uma venda para fechar a conta.`
  return `${cap(nome)} ficou isento, com ${fmt(vendido)} em vendas.`
}

export type BarraDoGrupo =
  | { tipo: 'isencao'; pct: number; passou: boolean }
  | { tipo: 'lucro'; impostoPct: number }
  | null

export interface LinhaDoGrupo {
  nome: string
  /** à direita do nome: 'R$ 18.700 de R$ 20 mil', 'R$ 82 de imposto', 'Sem vendas' */
  direita: string
  /** a linha cinza, antes da regra do grupo */
  texto: string
  barra: BarraDoGrupo
  /** vendeu sem o custo: o selo âmbar */
  semCusto: boolean
}

/**
 * Uma linha por grupo:
 *  - com isenção (ações): a barra das vendas contra o teto;
 *  - FII e ETF: a barra do lucro, com a fatia do imposto;
 *  - renda fixa: sem barra, o imposto sai retido na fonte.
 */
export function linhaDoGrupo(g: GrupoImpostoVisao, mes: string, fmt: (v: number) => string = brl0): LinhaDoGrupo {
  const nome = NOME_DO_GRUPO[g.grupo] ?? g.grupo
  const semCusto = vendeuSemCusto(g)
  if (g.isencao != null && g.isencao > 0) {
    const passou = g.vendido > g.isencao
    let texto: string
    if (passou) texto = g.impostoEstimado != null ? `Passou da isenção: o imposto estimado é de ${fmt(g.impostoEstimado)}.` : 'Passou da isenção. Sem o custo, eu não sei o lucro.'
    else if (g.vendido > 0) texto = (g.cabeAinda ?? 0) > 0 ? `Ainda cabem ${fmt(g.cabeAinda!)} em vendas sem imposto.` : 'Chegou ao limite da isenção.'
    else texto = `Cabem ${teto(g.isencao)} em vendas sem imposto.`
    return { nome, direita: `${fmt(g.vendido)} de ${teto(g.isencao)}`, texto, barra: { tipo: 'isencao', pct: Math.min(100, (g.vendido / g.isencao) * 100), passou }, semCusto }
  }
  if (g.grupo === 'rf') {
    const texto = g.vendido > 0
      ? `${fmt(g.vendido)} em resgates${g.impostoEstimado ? `, com ${fmt(g.impostoEstimado)} retidos` : ''}.`
      : `Sem resgate em ${nomeDoMes(mes)}.`
    return { nome, direita: 'Retido na fonte', texto, barra: null, semCusto: false }
  }
  if (g.vendido <= 0) return { nome, direita: 'Sem vendas', texto: '', barra: null, semCusto: false }
  if (semCusto || g.lucro == null) return { nome, direita: 'Lucro a conferir', texto: `Vendeu ${fmt(g.vendido)}. Sem o custo, eu não sei o lucro.`, barra: null, semCusto: true }
  if (g.lucro <= 0) return { nome, direita: 'Sem imposto', texto: `Vendeu ${fmt(g.vendido)}, sem lucro.`, barra: null, semCusto: false }
  return {
    nome,
    direita: `${fmt(g.impostoEstimado ?? g.lucro * g.aliquota)} de imposto`,
    texto: `Vendeu ${fmt(g.vendido)}, com ${fmt(g.lucro)} de lucro.`,
    barra: { tipo: 'lucro', impostoPct: Math.min(100, g.aliquota * 100) },
    semCusto: false,
  }
}

/**
 * Esconde os R$ da pessoa num texto do backend (a nota do grupo), com o olho
 * fechado. O teto da regra (R$ 20 mil) e o DARF mínimo (R$ 10) não são dado
 * dela: ficam.
 */
export function mascararNota(t: string): string {
  return t.replace(/R\$\s?\d[\d.]*(?:,\d+)?(?:\s?mil)?/g, (m: string, off: number, todo: string) =>
    /^R\$\s?20 mil$/.test(m) || todo.startsWith(' do DARF', off + m.length) ? m : 'R$ ••••')
}

/**
 * A linha cinza de cada grupo, embaixo da barra. A nota do backend já é a
 * explicação do mês com os números (o que vendeu e o que ainda cabe, o day trade,
 * o prejuízo abatido, o custo que falta): ela vai como veio, e a frase da tela
 * só entra no que a nota não diz:
 *  - renda fixa: o quanto foi resgatado (a nota é a regra da retenção);
 *  - FII e ETF: o lucro do mês (a nota diz o vendido e a alíquota);
 *  - sem nota: a frase da tela inteira.
 * `fmt` formata o R$ da pessoa (com a máscara do olho); `mascarar`, o texto da nota.
 */
export function textoDoGrupo(
  g: GrupoImpostoVisao,
  linha: LinhaDoGrupo,
  fmt: (v: number) => string = brl0,
  mascarar: (t: string) => string = (t) => t,
): string {
  const nota = (g.nota ?? '').trim()
  if (!nota) return linha.texto
  const n = mascarar(nota)
  if (g.grupo === 'rf' && g.vendido > 0) return `${fmt(g.vendido)} em resgates${g.impostoEstimado ? `, com ${fmt(g.impostoEstimado)} retidos` : ''}. ${n}`
  if ((g.grupo === 'fii' || g.grupo === 'etf') && g.vendido > 0 && g.lucro != null && g.custoConhecido) {
    if (g.lucro > 0) return `${n} O lucro foi de ${fmt(g.lucro)}.`
    if (g.lucro < 0) return `${n} O mês deu ${fmt(-g.lucro)} de prejuízo.`
  }
  return n
}

const UNIDADES: Record<GrupoImposto, [string, string]> = {
  acoes: ['ação', 'ações'], fii: ['cota', 'cotas'], etf: ['cota', 'cotas'], rf: ['título', 'títulos'], cripto: ['unidade', 'unidades'],
}
const nfQtd = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 })
/**
 * A quantidade de uma operação do histórico ('39 cotas', '1 ação'), ou null
 * quando não diz nada à pessoa:
 *  - a corretora não mandou (direito de subscrição, provento lançado como negócio);
 *  - CDB e afins do Open Finance (`RF-…`): a "quantidade" é o valor de face em
 *    unidades de centavo (9.000,27 para R$ 90,05).
 * Na renda fixa, o ETF listado na B3 (o AUPO11, que o imposto põe em `rf`) é
 * em cotas; o resto (o Tesouro), em títulos.
 */
export function quantidadeDaOperacao(o: Pick<OperacaoImposto, 'ticker' | 'quantidade' | 'grupo'>): string | null {
  const q = o.quantidade
  if (q == null || !Number.isFinite(q) || q <= 0) return null
  if (o.grupo === 'rf' && /^RF-/i.test(o.ticker)) return null
  const [um, varios] = o.grupo === 'rf' && /^[A-Z]{4}1[1-9]$/.test(o.ticker) ? UNIDADES.fii : (UNIDADES[o.grupo] ?? UNIDADES.cripto)
  return `${nfQtd.format(q)} ${q === 1 ? um : varios}`
}

/** o histórico do mais velho ao mais novo (da esquerda para a direita), os últimos 12 */
export function mesesEmOrdem(h: MesHistorico[]): MesHistorico[] {
  return [...h].sort((a, b) => a.mes.localeCompare(b.mes)).slice(-12)
}

/** a coluna estreita do histórico: '154 mil' · '9,8 mil' · 'R$ 640' · '—' */
export function vendasCurtas(v: number): string {
  if (!v) return '—'
  if (Math.abs(v) < 1000) return brl0(v)
  const mil = v / 1000
  return `${mil < 10 ? nf1.format(Math.round(mil * 10) / 10) : nf0.format(Math.round(mil))} mil`
}

export const SELO: Record<SeloImposto, string> = {
  isento: 'Isento',
  pago: 'Imposto pago',
  a_conferir: 'Imposto a conferir',
  custo_desconhecido: 'Custo desconhecido',
  sem_venda: 'Sem vendas',
}

/** as vendas do histórico com o selo do mês delas, pela chave 'AAAA-MM|TICKER' (a lista de movimentações cruza por ela) */
export function selosDasVendas(h: MesHistorico[]): Record<string, SeloImposto> {
  const out: Record<string, SeloImposto> = {}
  for (const m of h) for (const op of m.operacoes) if (op.lado === 'venda') out[`${m.mes}|${op.ticker}`] = m.selo
  return out
}
