/**
 * O dia da carteira no topo da home de quem assina (31/10/2026, segunda
 * versão). O dono achou a primeira feia ("o Ibovespa ali em cima, um botão de
 * Detalhes que não faz sentido, já poderia mostrar as informações"); a tela
 * nova saiu de uma conversa entre uma investidora do público, uma especialista
 * de produto da Apple e uma de UX:
 *  - a sobrelinha diz de quando é o número, sempre com a data ("Fechamento de
 *    sexta, 30/10", "Ao vivo · 14h32"), nunca "Bolsa fechada" genérico;
 *  - o título é "Tudo normal." só quando é verdade: papel que caiu 5% ou mais
 *    vira o título ("Itaú caiu."), e a carteira que andou 3% ou mais também
 *    ("Sua carteira caiu 3,10%.");
 *  - o veredito diz o sentido, como o relógio ("Caiu menos que a bolsa.");
 *  - o apoio diz no máximo UMA causa e fecha com o que dá para conferir
 *    ("Nenhum papel seu caiu 5% ou mais na sexta."). A frase nunca elogia: com
 *    muita renda fixa a carteira "cai menos que a bolsa" quase todo dia por
 *    composição, e aí ela diz isso e compara só as ações com a bolsa.
 * No site, ao lado do texto, o losango da marca (HomeLosango, 04/11/2026, no
 * lugar dos anéis do relógio, que o dono achou parecidos demais com os do
 * Apple Fitness): você contra a bolsa e o provento do dia; 3% é a escala.
 *
 * Funções puras, sem Nuxt: o teste trava o texto (tests/dia-da-carteira.test.ts).
 * Regra de sempre: dado que falta some, nunca vira zero nem frase inventada.
 */
import { agoraEmSP, quandoFoi, semPregao, type EstadoDoPregao } from './pregao.ts'
import { nomeParaFrase, QUEDA_QUE_PEDE_ATENCAO } from './carteira-agora.ts'

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** A linha de aviso dos apps: a escala do losango num dia comum e o dia que tira o "Tudo normal." */
export const LINHA_DO_DIA = 3
/** Abaixo disso o dia é "estável" (em %). */
const ESTAVEL = 0.05
/** Diferença de módulos abaixo da qual a carteira anda "junto" com a bolsa. */
const JUNTO = 0.1
/** A renda fixa a partir da qual ela explica a carteira cair menos que a bolsa. */
const RENDA_FIXA_QUE_EXPLICA = 20
/** Papel abaixo disso da carteira não vira o título do dia (o pequeno vai no fecho). */
const PESO_DO_ALERTA = 0.01

const CLASSES_RENDA_FIXA = new Set(['TREASURY', 'FIXED_INCOME'])
const CLASSES_ACOES = new Set(['STOCK', 'BDR', 'ETF'])
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const

/* ————— a entrada: o que o /portfolio/today, o /portfolio e o /income já trazem ————— */

export interface HojeDaApi {
  as_of?: string | null
  price_dates?: { today: string | null } | null
  totals?: { value_d1: number; day_change_amount: number; day_change_pct: number } | null
  positions?: {
    ticker: string
    name: string | null
    asset_class: string
    value_now: number | null
    day_change_amount: number | null
    day_change_pct: number | null
  }[]
}

export interface ResumoDoDia {
  /** o dia do preço ('2026-10-30'), de price_dates.today */
  priceDate: string | null
  /** a hora do dado (as_of do /portfolio/today) */
  asOf: string | null
  carteiraPct: number | null
  /** o resultado do dia em R$, com sinal */
  diaValor: number | null
  /** o Ibovespa no MESMO dia de preço */
  bolsaPct: number | null
  /** o pior papel com pelo menos 1% da carteira que caiu 5% ou mais; fracao = parte da queda do dia */
  alerta: { ticker: string; nome: string; pct: number; fracao: number | null } | null
  /** os outros papéis que caíram 5% ou mais (fora o alerta); pequeno = menos de 1% da carteira */
  outrasQuedas: { nome: string; pct: number; pequeno: boolean }[]
  /** quem mais pesou no R$ do dia, no sentido do dia (fracao 0,43 = 43%) */
  maiorPeso: { nome: string; fracao: number } | null
  /** % da carteira em renda fixa (Tesouro, CDB, LCI...) */
  rendaFixa: number | null
  /** o dia só das ações (ações, BDRs e ETFs), em % */
  acoesPct: number | null
  /** caiu provento na carteira no dia do preço */
  provento: boolean
  /** o que caiu: o total em R$ e os papéis, do maior para o menor (null sem provento) */
  proventoDoDia?: { valor: number; tickers: string[] } | null
}

/**
 * Junta o dia da carteira. `ibov` é a série diária do Ibovespa ({ t, v });
 * `posicoes` são as linhas do /portfolio (classe e valor, para a renda fixa,
 * que o /today não precifica).
 */
export function montarResumoDoDia(e: {
  today: HojeDaApi | null
  posicoes: { assetClass: string; value: number }[]
  total: number
  ibov: { t: string; v: number }[] | null
  income: { months: { entries: { ticker?: string; trade_date: string; amount: number }[] }[] } | null
}): ResumoDoDia {
  const priceDate = e.today?.price_dates?.today ?? null
  const totals = e.today?.totals
  const temDia = !!totals && totals.value_d1 > 0
  const carteiraPct = temDia ? totals!.day_change_pct : null
  const diaValor = temDia ? totals!.day_change_amount : null

  let bolsaPct: number | null = null
  if (priceDate && e.ibov?.length) {
    const i = e.ibov.findIndex((p) => p.t.slice(0, 10) === priceDate)
    const prev = i > 0 ? e.ibov[i - 1]! : null
    if (prev && prev.v > 0) bolsaPct = (e.ibov[i]!.v / prev.v - 1) * 100
  }

  const posicoes = e.today?.positions ?? []
  const quedas = posicoes
    .filter((p) => p.day_change_pct != null && p.day_change_pct <= QUEDA_QUE_PEDE_ATENCAO)
    .sort((a, b) => a.day_change_pct! - b.day_change_pct!)
  const pesaNoAlerta = (p: (typeof posicoes)[number]) => p.value_now != null && e.total > 0 && p.value_now >= e.total * PESO_DO_ALERTA
  const pior = quedas.find(pesaNoAlerta) ?? null
  const alerta = pior
    ? {
        ticker: pior.ticker,
        nome: nomeParaFrase(pior.name, pior.ticker),
        pct: pior.day_change_pct!,
        fracao: diaValor != null && diaValor < 0 && pior.day_change_amount != null ? pior.day_change_amount / diaValor : null,
      }
    : null
  const outrasQuedas = quedas
    .filter((p) => p !== pior)
    .map((p) => ({ nome: nomeParaFrase(p.name, p.ticker), pct: p.day_change_pct!, pequeno: !pesaNoAlerta(p) }))

  let maiorPeso: ResumoDoDia['maiorPeso'] = null
  if (diaValor != null && carteiraPct != null && Math.abs(carteiraPct) >= ESTAVEL && diaValor !== 0) {
    for (const p of posicoes) {
      if (p.day_change_amount == null || Math.sign(p.day_change_amount) !== Math.sign(diaValor)) continue
      const fracao = p.day_change_amount / diaValor
      if (!maiorPeso || fracao > maiorPeso.fracao) maiorPeso = { nome: nomeParaFrase(p.name, p.ticker), fracao }
    }
  }

  const rf = e.posicoes.filter((p) => CLASSES_RENDA_FIXA.has(p.assetClass)).reduce((s, p) => s + p.value, 0)
  const rendaFixa = e.total > 0 ? (rf / e.total) * 100 : null

  let acoesPct: number | null = null
  const acoes = posicoes.filter((p) => CLASSES_ACOES.has(p.asset_class) && p.value_now != null && p.day_change_amount != null)
  if (acoes.length) {
    const amt = acoes.reduce((s, p) => s + p.day_change_amount!, 0)
    const ontem = acoes.reduce((s, p) => s + p.value_now! - p.day_change_amount!, 0)
    if (ontem > 0) acoesPct = (amt / ontem) * 100
  }

  const { provento, proventoDoDia } = proventoDoDiaDe(priceDate, e.income)

  return { priceDate, asOf: e.today?.as_of ?? null, carteiraPct, diaValor, bolsaPct, alerta, outrasQuedas, maiorPeso, rendaFixa, acoesPct, provento, proventoDoDia }
}

/**
 * O provento do dia de preço, do /portfolio/income: o total e os papéis que
 * pagaram, do maior para o menor. É a aba de baixo do losango, na home
 * (montarResumoDoDia) e na /carteira (buildAgora do useCarteira): a mesma
 * conta nas duas telas. Sem o dia de preço ou sem o /income → sem provento
 * (a aba não acende; nunca inventa).
 */
export function proventoDoDiaDe(
  priceDate: string | null,
  income: { months: { entries: { ticker?: string; trade_date: string; amount: number }[] }[] } | null,
): Pick<ResumoDoDia, 'provento' | 'proventoDoDia'> {
  const doDia = priceDate
    ? (income?.months ?? []).flatMap((m) => m.entries).filter((x) => x.trade_date?.slice(0, 10) === priceDate && x.amount > 0)
    : []
  if (!doDia.length) return { provento: false, proventoDoDia: null }
  const porPapel = new Map<string, number>()
  for (const x of doDia) if (x.ticker) porPapel.set(x.ticker, (porPapel.get(x.ticker) ?? 0) + x.amount)
  return {
    provento: true,
    proventoDoDia: { valor: Math.round(doDia.reduce((t, x) => t + x.amount, 0) * 100) / 100, tickers: [...porPapel].sort((a, b) => b[1] - a[1]).map(([t]) => t) },
  }
}

/* ————— as palavras ————— */

/** '0,62%' sem sinal (o verbo dá o sentido). */
const pctAbs = (n: number) => `${nf2.format(Math.abs(n))}%`
/** '−0,62%' / '+0,24%' / '0,00%' para os rótulos do losango (com o "−" de verdade). */
export function pctComSinal(n: number): string {
  if (Math.abs(n) < 0.005) return '0,00%'
  return `${n > 0 ? '+' : '−'}${nf2.format(Math.abs(n))}%`
}

/** 'sexta, 30/10' a partir de '2026-10-30'. */
function diaEData(iso: string): string {
  const semana = new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay()
  return `${DIAS[semana]}, ${iso.slice(8, 10)}/${iso.slice(5, 7)}`
}
const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "13h02" a partir de um ISO, no relógio de São Paulo. */
function horaSP(iso: string): string | null {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  const { hora, minuto } = agoraEmSP(new Date(t))
  return `${hora}h${String(minuto).padStart(2, '0')}`
}

/**
 * A carteira contra a bolsa, em palavras, sem número (as palavras do
 * AneisR2.veredito dos apps, mais o "junto"). Devolve o predicado em
 * minúscula e sem ponto: "caiu menos que a bolsa" / ao vivo "cai menos que a bolsa".
 */
export function contraABolsa(c: number, b: number, aoVivo: boolean): string {
  const caiu = aoVivo ? 'cai' : 'caiu'
  const subiu = aoVivo ? 'sobe' : 'subiu'
  const estavel = aoVivo ? 'fica estável' : 'ficou estável'
  const cz = Math.abs(c) < ESTAVEL
  const bz = Math.abs(b) < ESTAVEL
  if (cz && bz) return `${estavel}, como a bolsa`
  if (cz) return `${estavel} com a bolsa em ${b < 0 ? 'queda' : 'alta'}`
  if (bz) return `${c < 0 ? caiu : subiu} com a bolsa estável`
  if (c < 0 && b > 0) return `${caiu} com a bolsa em alta`
  if (c > 0 && b < 0) return `${subiu} com a bolsa em queda`
  if (Math.abs(Math.abs(c) - Math.abs(b)) < JUNTO) return `${c < 0 ? caiu : subiu} junto com a bolsa`
  if (c < 0) return `${caiu} ${c > b ? 'menos' : 'mais'} que a bolsa`
  return `${subiu} ${c > b ? 'mais' : 'menos'} que a bolsa`
}

/** "metade da", "quase toda a"… para a parte de um papel no R$ do dia. */
function parteDa(fracao: number): string | null {
  if (fracao >= 1) return 'toda a'
  if (fracao >= 0.85) return 'quase toda a'
  if (fracao >= 0.55) return 'mais da metade da'
  if (fracao >= 0.45) return 'metade da'
  if (fracao >= 0.38) return 'quase metade da'
  if (fracao >= 0.3) return 'um terço da'
  return null
}

export interface FrasesDoDia {
  sobrelinha: string
  sobrelinhaTom: 'sub' | 'verde' | 'ambar'
  titulo: string
  veredito: string
  apoio: string | null
  /** o rótulo do número do dia na faixa: 'Hoje' ou 'Sexta, 30/10' */
  diaRotulo: string
  /** 'hoje', 'ontem', 'na sexta': o fio do provento e o fecho */
  quando: string
  aoVivo: boolean
  /** antes da abertura: o losango do pregão anterior esmaecido */
  esmaecido: boolean
}

/**
 * As frases do topo, do resumo do dia e do relógio da B3. Sem o resultado do
 * dia da carteira → null (o componente diz "O resultado de hoje ainda não chegou.").
 */
export function frasesDoDia(r: ResumoDoDia, estado: EstadoDoPregao, agora = new Date()): FrasesDoDia | null {
  if (r.carteiraPct == null || !r.priceDate) return null
  const sp = agoraEmSP(agora)
  const doDia = r.priceDate.slice(0, 10) === sp.iso
  const aoVivo = estado === 'aberta' && doDia
  const quando = quandoFoi(r.priceDate, agora) ?? 'hoje'
  const fechamento = `fechamento de ${diaEData(r.priceDate)}`

  // a sobrelinha: de quando é o número, sempre com a data
  let sobrelinha: string
  let sobrelinhaTom: FrasesDoDia['sobrelinhaTom'] = 'sub'
  if (aoVivo) {
    const hora = r.asOf ? horaSP(r.asOf) : null
    const minutos = r.asOf ? (agora.getTime() - Date.parse(r.asOf)) / 60_000 : Number.NaN
    if (hora && minutos > 20) sobrelinha = `Atualizado às ${hora}`
    else {
      sobrelinha = hora ? `Ao vivo · ${hora}` : 'Ao vivo'
      sobrelinhaTom = 'verde'
    }
  } else if (doDia) sobrelinha = `Hoje, ${r.priceDate.slice(8, 10)}/${r.priceDate.slice(5, 7)} · pregão encerrado`
  else if (estado === 'antes') sobrelinha = `Antes da abertura · ${fechamento}`
  else if (estado === 'aberta') sobrelinha = `Bolsa aberta · ${fechamento}`
  else if (semPregao(sp.iso)) sobrelinha = `${sp.semana === 0 || sp.semana === 6 ? 'Fim de semana' : 'Sem pregão hoje'} · ${fechamento}`
  else sobrelinha = maiuscula(fechamento)

  const c = r.carteiraPct
  const b = r.bolsaPct
  const caiu = aoVivo ? 'cai' : 'caiu'
  const subiu = aoVivo ? 'sobe' : 'subiu'
  const comABolsa = b != null ? contraABolsa(c, b, aoVivo) : null
  const diaRotulo = doDia ? 'Hoje' : maiuscula(diaEData(r.priceDate))
  const base = { diaRotulo, quando, aoVivo, esmaecido: estado === 'antes' && !doDia }

  // dia de alerta: o papel é o título, e a carteira inteira vai no apoio
  if (r.alerta) {
    const a = r.alerta
    const parte = a.fracao != null ? parteDa(a.fracao) : null
    const veredito = `${maiuscula(caiu)} ${pctAbs(a.pct)} ${aoVivo ? 'hoje' : quando}${parte ? ` e fez ${parte} queda da carteira` : ''}.`
    const inteira = comABolsa
      ? `${aoVivo ? 'Até agora, a' : 'A'} carteira inteira ${comABolsa}.`
      : `${aoVivo ? 'Até agora, a' : 'A'} carteira inteira ${Math.abs(c) < ESTAVEL ? (aoVivo ? 'fica estável' : 'ficou estável') : `${c < 0 ? caiu : subiu} ${pctAbs(c)}`}.`
    const n = r.outrasQuedas.length
    const fecho = n === 0
      ? `Nenhum outro papel seu caiu 5% ou mais ${quando}.`
      : `Mais ${n} ${n === 1 ? 'papel seu caiu' : 'papéis seus caíram'} 5% ou mais ${quando}.`
    return {
      ...base,
      sobrelinha,
      sobrelinhaTom: 'ambar',
      titulo: `${a.nome} ${aoVivo ? 'caindo' : 'caiu'}.`,
      veredito,
      apoio: `${inteira} ${fecho}`,
    }
  }

  const titulo = Math.abs(c) >= LINHA_DO_DIA
    ? `Sua carteira ${c < 0 ? caiu : subiu} ${pctAbs(c)}.`
    : 'Tudo normal.'

  let veredito: string
  if (comABolsa) veredito = aoVivo ? `Até agora, ${comABolsa}.` : `${maiuscula(comABolsa)}.`
  else if (Math.abs(c) < ESTAVEL) veredito = aoVivo ? 'Até agora, fica estável.' : 'Ficou estável.'
  else veredito = aoVivo ? `Até agora, ${c < 0 ? caiu : subiu} ${pctAbs(c)}.` : `${maiuscula(c < 0 ? caiu : subiu)} ${pctAbs(c)}.`

  // a causa: no máximo uma
  let causa: string | null = null
  if (Math.abs(c) >= ESTAVEL) {
    const sentido = c < 0 ? 'queda' : 'alta'
    const peso = r.maiorPeso
    if (peso && peso.fracao >= 0.45) causa = `${peso.nome} fez ${parteDa(peso.fracao)} ${sentido}.`
    else if (
      b != null && Math.abs(b) >= ESTAVEL && Math.sign(c) === Math.sign(b)
      && Math.abs(c) <= Math.abs(b) - JUNTO
      && r.rendaFixa != null && r.rendaFixa >= RENDA_FIXA_QUE_EXPLICA && r.acoesPct != null
    ) {
      const ap = r.acoesPct
      const verbo = ap < 0 ? (aoVivo ? 'caem' : 'caíram') : (aoVivo ? 'sobem' : 'subiram')
      let relacao: string
      if (Math.sign(ap) !== Math.sign(b)) relacao = ` mesmo com a bolsa em ${b < 0 ? 'queda' : 'alta'}`
      else if (Math.abs(Math.abs(ap) - Math.abs(b)) < JUNTO) relacao = ', junto com ela'
      else relacao = Math.abs(ap) > Math.abs(b) ? ', mais que ela' : ', também menos que ela'
      causa = `${Math.round(r.rendaFixa)}% da carteira está em renda fixa, que não anda com a bolsa; suas ações ${verbo} ${pctAbs(ap)}${relacao}.`
    } else if (peso && parteDa(peso.fracao)) causa = `${peso.nome} fez ${parteDa(peso.fracao)} ${sentido}.`
  }

  // o fecho: o que dá para conferir
  const pequenos = r.outrasQuedas.filter((q) => q.pequeno)
  const fecho = pequenos.length
    ? `${pequenos[0]!.nome} caiu ${pctAbs(pequenos[0]!.pct)}, mas pesa menos de 1% da carteira.`
    : `Nenhum papel seu caiu 5% ou mais ${quando}.`

  return { ...base, sobrelinha, sobrelinhaTom, titulo, veredito, apoio: causa ? `${causa} ${fecho}` : fecho }
}

/**
 * O texto do provento ao lado do losango ("provento · …"). O R$ só aparece com
 * os valores à vista (o olho da faixa, useValoresVisiveis); escondido, diz só
 * quem pagou. `quando` é o 'hoje' / 'ontem' / 'na sexta' das frases.
 *  - sem provento: 'nenhum hoje'
 *  - à vista: 'R$ 48,20 de ITSA4 hoje' / 'R$ 61,00 de ITSA4 e BBAS3 hoje' / 'R$ 90,10 de ITSA4 e mais 2 hoje'
 *  - escondido: 'ITSA4 pagou hoje' / 'ITSA4 e BBAS3 pagaram hoje'
 *  - sem o papel no dado: 'caiu hoje' (ou 'R$ 48,20 hoje' à vista)
 */
export function subDoProvento(r: Pick<ResumoDoDia, 'provento' | 'proventoDoDia'>, quando: string, visiveis: boolean): string {
  if (!r.provento) return `nenhum ${quando}`
  const t = r.proventoDoDia?.tickers ?? []
  const quem = t.length === 0 ? '' : t.length === 1 ? t[0]! : t.length === 2 ? `${t[0]} e ${t[1]}` : `${t[0]} e mais ${t.length - 1}`
  const valor = r.proventoDoDia && visiveis ? `R$ ${nf2.format(r.proventoDoDia.valor)}` : null
  if (valor) return quem ? `${valor} de ${quem} ${quando}` : `${valor} ${quando}`
  if (!quem) return `caiu ${quando}`
  return `${quem} ${t.length === 1 ? 'pagou' : 'pagaram'} ${quando}`
}
