/**
 * A bolsa do dia na home do visitante (31/10/2026, "O fechamento"). O dono
 * pediu para repensar a seção com o mesmo cuidado do topo de quem assina; a
 * forma saiu de uma conversa entre um investidor do público, uma especialista
 * de produto da Apple e uma de UX, e o dono aprovou: uma história por dia, só
 * tipografia. A sobrelinha diz de quando é o número; o número do Ibovespa é o
 * herói; o título diz o que o dia teve de específico ("Quinta queda
 * seguida."); o apoio dá o mês; a causa diz quem mexeu no índice, em pontos
 * (peso × variação, só blue chip por construção); a leitura da IA vem
 * assinada; e a ponte para o produto é a linha "Bolsa −0,75% · Você —".
 *
 * Duas metades, as duas puras (sem Nuxt), para o teste travar:
 *  - montarBolsaDoDia: do que a API pública devolve (/market/snapshot,
 *    /market/today, a série diária do Ibovespa, o /briefing/today e as teses)
 *    para os fatos do dia. Roda no servidor (server/utils/bolsa-do-dia.ts),
 *    com cache: o número do dia sai de UMA fonte, o snapshot.
 *  - textosDaBolsa: dos fatos e do relógio da B3 para as frases.
 * Regra de sempre: dado que falta some, nunca vira zero nem frase inventada.
 */
import { agoraEmSP, FERIADOS_B3, horaDoFechamento, proximoPregao, quandoFoi, semPregao, type EstadoDoPregao } from './pregao.ts'
import { nomeDaEmpresa } from './nomeB3.ts'

/**
 * Um pregão que andou mais que isso vira suspeito: a semana, o mês e a raridade
 * que dependem dele somem até alguém confirmar o dado (31/10/2026: a série
 * marca −13,88% em 26/10, o dia seguinte ao segundo turno; só 2008 e 2020
 * tiveram dias assim). Confirmado, o dia entra em SALTOS_CONFIRMADOS.
 */
const SALTO_SUSPEITO = 10
export const SALTOS_CONFIRMADOS = new Set<string>([])
/** A causa em pontos só sai se a soma bater com a variação real em 10%. */
const TOLERANCIA_DOS_PONTOS = 0.1
/** Mês nos 10% mais extremos da série: vira a frase da raridade. */
const RARO = 0.1
/** O papel que fez ao menos 1/5 do movimento do índice vira o título ("Itaú Unibanco pesou mais"). */
const PESO_QUE_TITULA = 0.2

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const
const ORDINAIS = ['', 'primeira', 'segunda', 'terceira', 'quarta', 'quinta', 'sexta', 'sétima', 'oitava', 'nona', 'décima']
const CARDINAIS = ['nenhuma', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete']

/* ————— a entrada: o que a API pública devolve ————— */

export interface EntradaDaBolsa {
  snapshot: { as_of?: string | null; indices_br?: { IBOV?: { value: number | null; change_pct: number | null; as_of_date?: string | null } | null } | null } | null
  today: {
    price_dates?: { today: string | null } | null
    totals?: { positive_count?: number | null; negative_count?: number | null; total_constituents?: number | null } | null
    constituents?: { ticker: string; name: string | null; change_pct: number | null; index_weight: number | null }[] | null
  } | null
  /** a série diária do Ibovespa (/indices/IBOV/prices?mode=full) */
  serie: { price_at: string; market_price: number | null }[] | null
  briefing: {
    date?: string | null
    published_at?: string | null
    sections?: { placar?: { stat?: string | null } | null; leitura?: { blurb?: string | null } | null } | null
  } | null
  teses: { id: string; title: string; tickers: string[]; conviction: number | null }[] | null
  /** o pregão minuto a minuto da B3 (cotacao.b3.com.br DailyFluctuationHistory/IBOV) */
  intradia?: SerieDaB3 | null
  /** o mesmo para o IFIX e para o mini dólar futuro (WDO), que anda como o dólar */
  ifixIntradia?: SerieDaB3 | null
  dolarIntradia?: SerieDaB3 | null
  /** o Bitcoin em reais de 5 em 5 minutos (data-api.binance.vision, klines BTCBRL): [abertura em ms, open, high, low, close, ...] */
  btcKlines?: (string | number)[][] | null
}

export type SerieDaB3 = { TradgFlr?: { date?: string | null; scty?: { lstQtn?: { closPric: number | null; dtTm: string; prcFlcn?: number | null }[] | null } | null } | null }

/** Um mercado no gráfico do dia: [minutos desde as 10h, % desde as 10h]. */
export interface MercadoDoDia { id: 'ibov' | 'ifix' | 'dolar' | 'btc'; nome: string; pontos: [number, number][]; final: number }

/** pct: a variação do dia do papel principal da empresa (o de maior peso) */
export interface EmpresaDoDia { nome: string; ticker: string; tickers: string[]; pontos: number; pct: number | null }

export interface BolsaDoDia {
  ibov: { pontos: number; pct: number; data: string; asOf: string | null } | null
  seguidas: { n: number; sentido: 'queda' | 'alta'; ate: string } | null
  mes: {
    mes: string
    pct: number
    ultimoPregao: boolean
    piorDesde: string | null
    melhorDesde: string | null
    raros: { n: number; total: number; desde: number } | null
    confiavel: boolean
  } | null
  semana: { inicio: string; fim: string; de: number; ate: number; pct: number; altas: number; quedas: number; confiavel: boolean } | null
  contagem: { altas: number; quedas: number; total: number } | null
  /** quem mexeu no índice: os cinco que mais tiraram e os cinco que mais somaram */
  pesos: { variacao: number; soma: number; confere: boolean; negativas: EmpresaDoDia[]; positivas: EmpresaDoDia[] } | null
  leitura: { texto: string; data: string; publicadoEm: string | null; bate: boolean } | null
  tese: { slug: string; titulo: string; convicao: number; nomes: string[]; antes: { valor: number; ate: string } | null } | null
  /** o pregão do último dia, um ponto por minuto: [minutos desde as 10h, pontos] */
  intradia: { data: string; anterior: number; pontos: [number, number][] } | null
  /** os últimos fechamentos (a linha de reserva quando o pregão minuto a minuto não vem) */
  diarias: { d: string; v: number }[]
  /** Ibovespa, IFIX, dólar e Bitcoin no mesmo dia, em % desde as 10h, para o gráfico "O mercado" */
  mercados: MercadoDoDia[]
  /** as ações do índice, uma a uma: o mercado inteiro de uma vez (empresa agrupa as classes) */
  acoes: { ticker: string; empresa: string; pct: number; peso: number; pontos: number }[]
}

const suspeito = (data: string, variacao: number) => Math.abs(variacao) > SALTO_SUSPEITO && !SALTOS_CONFIRMADOS.has(data)

/** "−0,75%" do briefing ("-0,75%") → número; formato estranho → null. */
function pctDoTexto(t: string | null | undefined): number | null {
  const m = (t ?? '').trim().match(/^([+−-]?)(\d+(?:,\d+)?)%$/)
  if (!m) return null
  const v = Number(m[2]!.replace(',', '.'))
  return m[1] === '-' || m[1] === '−' ? -v : v
}

export function montarBolsaDoDia(e: EntradaDaBolsa): BolsaDoDia {
  const vazio: BolsaDoDia = { ibov: null, seguidas: null, mes: null, semana: null, contagem: null, pesos: null, leitura: null, tese: null, intradia: null, diarias: [], mercados: [], acoes: [] }
  const ib = e.snapshot?.indices_br?.IBOV
  if (ib?.value == null || ib.change_pct == null || !ib.as_of_date) return vazio
  const ibov = { pontos: ib.value, pct: ib.change_pct, data: ib.as_of_date.slice(0, 10), asOf: e.snapshot?.as_of ?? null }

  // a série, com o snapshot no fim quando ela ainda não tem o dia (fonte única)
  const serie = (e.serie ?? [])
    .filter((p) => p.market_price != null && p.market_price > 0)
    .map((p) => ({ d: p.price_at.slice(0, 10), v: p.market_price as number }))
    .filter((p) => p.d <= ibov.data)
  if (serie.length && serie[serie.length - 1]!.d < ibov.data) serie.push({ d: ibov.data, v: ibov.pontos })
  else if (serie.length) serie[serie.length - 1] = { d: ibov.data, v: ibov.pontos }
  const diarias = serie.slice(1).map((p, i) => ({ d: p.d, chg: (p.v / serie[i]!.v - 1) * 100 }))

  // quedas (ou altas) seguidas até o último pregão
  let seguidas: BolsaDoDia['seguidas'] = null
  if (diarias.length) {
    const ultima = diarias[diarias.length - 1]!
    const sinal = Math.sign(ultima.chg)
    if (sinal !== 0) {
      let n = 0
      for (let i = diarias.length - 1; i >= 0 && Math.sign(diarias[i]!.chg) === sinal; i--) n++
      seguidas = { n, sentido: sinal < 0 ? 'queda' : 'alta', ate: ultima.d }
    }
  }

  // o mês: fechamento de cada mês contra o do anterior
  let mes: BolsaDoDia['mes'] = null
  const fechamentos = new Map<string, number>()
  for (const p of serie) fechamentos.set(p.d.slice(0, 7), p.v)
  const chaves = [...fechamentos.keys()]
  if (chaves.length >= 2) {
    const meses = chaves.slice(1).map((k, i) => ({ k, chg: (fechamentos.get(k)! / fechamentos.get(chaves[i]!)! - 1) * 100 }))
    const atual = meses[meses.length - 1]!
    const anteriores = meses.slice(0, -1)
    const rotulo = (k: string) => `${MESES[Number(k.slice(5, 7)) - 1]} de ${k.slice(0, 4)}`
    const mesesEntre = (a: string, b: string) => (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(b.slice(5, 7)) - Number(a.slice(5, 7))
    const ultimoAntes = (cond: (c: number) => boolean) => [...anteriores].reverse().find((m) => cond(m.chg)) ?? null
    const pior = atual.chg < 0 ? ultimoAntes((c) => c <= atual.chg) : null
    const melhor = atual.chg > 0 ? ultimoAntes((c) => c >= atual.chg) : null
    const desde = (m: { k: string } | null) => (m && mesesEntre(m.k, atual.k) > 12 ? rotulo(m.k) : null)
    const mesmoLado = meses.filter((m) => (atual.chg < 0 ? m.chg <= atual.chg : m.chg >= atual.chg)).length
    const proximo = proximoPregao(ibov.data)
    mes = {
      mes: atual.k,
      pct: atual.chg,
      ultimoPregao: proximo != null && proximo.slice(0, 7) !== atual.k,
      piorDesde: desde(pior),
      melhorDesde: desde(melhor),
      raros: atual.chg !== 0 && mesmoLado / meses.length <= RARO ? { n: mesmoLado, total: meses.length, desde: Number(serie[0]!.d.slice(0, 4)) } : null,
      confiavel: !diarias.some((x) => x.d.slice(0, 7) === atual.k && suspeito(x.d, x.chg)),
    }
  }

  // a semana do último pregão (segunda a sexta), contra o fechamento da anterior
  let semana: BolsaDoDia['semana'] = null
  if (serie.length >= 2) {
    const fim = ibov.data
    const dia = new Date(`${fim}T12:00:00Z`)
    dia.setUTCDate(dia.getUTCDate() - ((dia.getUTCDay() + 6) % 7))
    const segunda = dia.toISOString().slice(0, 10)
    const antes = [...serie].reverse().find((p) => p.d < segunda)
    const daSemana = diarias.filter((x) => x.d >= segunda)
    if (antes && daSemana.length) {
      semana = {
        inicio: daSemana[0]!.d,
        fim,
        de: antes.v,
        ate: ibov.pontos,
        pct: (ibov.pontos / antes.v - 1) * 100,
        altas: daSemana.filter((x) => x.chg > 0).length,
        quedas: daSemana.filter((x) => x.chg < 0).length,
        confiavel: !daSemana.some((x) => suspeito(x.d, x.chg)),
      }
    }
  }

  // o /market/today só vale se for do mesmo dia do snapshot
  const doMesmoDia = e.today?.price_dates?.today?.slice(0, 10) === ibov.data
  const t = e.today?.totals
  const contagem = doMesmoDia && t?.positive_count != null && t.negative_count != null && t.total_constituents
    ? { altas: t.positive_count, quedas: t.negative_count, total: t.total_constituents }
    : null

  let pesos: BolsaDoDia['pesos'] = null
  const acoes: BolsaDoDia['acoes'] = []
  const cons = doMesmoDia ? (e.today?.constituents ?? []) : []
  if (cons.length) {
    const anterior = ibov.pontos / (1 + ibov.pct / 100)
    const variacao = ibov.pontos - anterior
    const porEmpresa = new Map<string, { nome: string; ticker: string; peso: number; tickers: string[]; pontos: number; pct: number | null }>()
    let soma = 0
    for (const c of cons) {
      if (c.index_weight == null || c.change_pct == null) continue
      const pontos = anterior * (c.index_weight / 100) * (c.change_pct / 100)
      soma += pontos
      const nome = nomeDaEmpresa(c.name ?? c.ticker)
      acoes.push({ ticker: c.ticker, empresa: nome, pct: c.change_pct, peso: c.index_weight, pontos })
      const g = porEmpresa.get(nome)
      if (!g) porEmpresa.set(nome, { nome, ticker: c.ticker, peso: c.index_weight, tickers: [c.ticker], pontos, pct: c.change_pct })
      else {
        g.pontos += pontos
        g.tickers.push(c.ticker)
        if (c.index_weight > g.peso) { g.peso = c.index_weight; g.ticker = c.ticker; g.pct = c.change_pct }
      }
    }
    const empresas = [...porEmpresa.values()].map(({ nome, ticker, tickers, pontos, pct }) => ({ nome, ticker, tickers, pontos, pct }))
    pesos = {
      variacao,
      soma,
      confere: Math.abs(variacao) > 0 && Math.abs(soma - variacao) <= TOLERANCIA_DOS_PONTOS * Math.abs(variacao),
      negativas: empresas.filter((x) => x.pontos < 0).sort((a, b) => a.pontos - b.pontos).slice(0, 5),
      positivas: empresas.filter((x) => x.pontos > 0).sort((a, b) => b.pontos - a.pontos).slice(0, 5),
    }
  }

  // a leitura da IA: só a do último pregão, e só se o número dela for o do snapshot
  let leitura: BolsaDoDia['leitura'] = null
  const texto = e.briefing?.sections?.leitura?.blurb?.trim()
  if (texto && e.briefing?.date) {
    const doBriefing = pctDoTexto(e.briefing.sections?.placar?.stat)
    leitura = {
      texto,
      data: e.briefing.date.slice(0, 10),
      publicadoEm: e.briefing.published_at ?? null,
      bate: e.briefing.date.slice(0, 10) === ibov.data && doBriefing != null && Math.abs(doBriefing - ibov.pct) <= 0.01,
    }
  }

  // a tese em que estão os que mais mexeram (a história já vem do servidor depois)
  let tese: BolsaDoDia['tese'] = null
  if (pesos?.confere && e.teses?.length) {
    const queda = pesos.variacao < 0
    const mexeram = [...(queda ? pesos.negativas : pesos.positivas).slice(0, 3), ...(queda ? pesos.positivas : pesos.negativas).slice(0, 2)]
    let melhor: { t: NonNullable<EntradaDaBolsa['teses']>[number]; nomes: string[] } | null = null
    for (const t of e.teses) {
      if (t.conviction == null) continue
      const nomes = mexeram.filter((m) => m.tickers.some((x) => t.tickers.includes(x))).map((m) => m.nome)
      if (nomes.length && (!melhor || nomes.length > melhor.nomes.length)) melhor = { t, nomes }
    }
    if (melhor) tese = { slug: melhor.t.id, titulo: melhor.t.title, convicao: melhor.t.conviction!, nomes: melhor.nomes, antes: null }
  }

  // o pregão minuto a minuto: só o do mesmo dia do snapshot, um ponto por minuto
  let intradia: BolsaDoDia['intradia'] = null
  const b3 = e.intradia?.TradgFlr
  if (b3?.date?.slice(0, 10) === ibov.data) {
    const porMinuto = new Map<number, number>()
    for (const q of b3.scty?.lstQtn ?? []) {
      const m = q.dtTm.match(/^(\d{2}):(\d{2})/)
      if (!m || q.closPric == null || q.closPric <= 0) continue
      const minuto = (Number(m[1]) - 10) * 60 + Number(m[2])
      if (minuto >= 0) porMinuto.set(minuto, q.closPric)
    }
    const pontos = [...porMinuto.entries()].sort((a, b) => a[0] - b[0]) as [number, number][]
    if (pontos.length >= 10) intradia = { data: ibov.data, anterior: ibov.pontos / (1 + ibov.pct / 100), pontos }
  }

  // os quatro mercados do dia, todos em % desde as 10h e cortados no fechamento do índice
  const fimDoDia = intradia?.pontos[intradia.pontos.length - 1]?.[0] ?? null
  const mercados: MercadoDoDia[] = []
  const emPct = (id: MercadoDoDia['id'], nome: string, porMinuto: [number, number][]) => {
    const pts = porMinuto.filter(([m]) => m >= 0 && (fimDoDia == null || m <= fimDoDia)).sort((a, b) => a[0] - b[0])
    if (pts.length < 10) return
    const base = pts[0]![1]
    const pontos = pts.map(([m, v]) => [m, (v / base - 1) * 100] as [number, number])
    mercados.push({ id, nome, pontos, final: pontos[pontos.length - 1]![1] })
  }
  if (intradia) emPct('ibov', 'Ibovespa', intradia.pontos)
  if (intradia) {
    const ifix = minutoAMinuto(e.ifixIntradia, ibov.data)
    if (ifix) emPct('ifix', 'IFIX', ifix)
    const dolar = minutoAMinuto(e.dolarIntradia, ibov.data)
    if (dolar) emPct('dolar', 'Dólar', dolar)
    const btc = (e.btcKlines ?? [])
      .map((k) => {
        const t = Number(k[0])
        const close = Number(k[4])
        const { iso, hora, minuto } = agoraEmSP(new Date(t))
        return iso === ibov.data && close > 0 ? [(hora - 10) * 60 + minuto, close] as [number, number] : null
      })
      .filter((x): x is [number, number] => !!x)
    emPct('btc', 'Bitcoin', btc)
  }

  return { ibov, seguidas, mes, semana, contagem, pesos, leitura, tese, intradia, diarias: serie.slice(-23), mercados, acoes: pesos?.confere ? acoes : [] }
}

/** A série da B3 de um dia, um preço por minuto desde as 10h (o último de cada minuto). */
function minutoAMinuto(b3: SerieDaB3 | null | undefined, data: string): [number, number][] | null {
  const t = b3?.TradgFlr
  if (t?.date?.slice(0, 10) !== data) return null
  const porMinuto = new Map<number, number>()
  for (const q of t.scty?.lstQtn ?? []) {
    const m = q.dtTm.match(/^(\d{2}):(\d{2})/)
    if (!m || q.closPric == null || q.closPric <= 0) continue
    porMinuto.set((Number(m[1]) - 10) * 60 + Number(m[2]), q.closPric)
  }
  return [...porMinuto.entries()]
}

/**
 * A convicção de antes, quando mudou nos últimos 30 dias: { valor: 90, ate:
 * '2026-10-27' } para a série que era 90 até 27/10 e é 88 desde 28/10.
 */
export function convicaoAntes(serie: { date: string; conviction: number }[] | null | undefined, atual: number): { valor: number; ate: string } | null {
  const s = [...(serie ?? [])].sort((a, b) => a.date.localeCompare(b.date))
  if (!s.length) return null
  const ultimo = s[s.length - 1]!.date
  const limite = new Date(`${ultimo.slice(0, 10)}T12:00:00Z`)
  limite.setUTCDate(limite.getUTCDate() - 30)
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i]!.date.slice(0, 10) < limite.toISOString().slice(0, 10)) return null
    if (s[i]!.conviction !== atual) return { valor: s[i]!.conviction, ate: s[i]!.date.slice(0, 10) }
  }
  return null
}

/* ————— as palavras ————— */

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Pontos sempre truncados, como a IA escreve: 167.921,8 → '167.921'. */
export const pontosTruncados = (v: number) => nf0.format(Math.trunc(v))
/** '−324' / '+519' para a contribuição de um papel. */
export function pontosComSinal(v: number): string {
  const n = Math.trunc(v)
  if (n === 0) return '0'
  return `${n > 0 ? '+' : '−'}${nf0.format(Math.abs(n))}`
}
function pctComSinal(v: number): string {
  if (Math.abs(v) < 0.005) return '0,00%'
  return `${v > 0 ? '+' : '−'}${nf2.format(Math.abs(v))}%`
}
const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
/** '3/11' sem o zero, para o "abre terça, 3/11". */
const dm = (iso: string) => `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`
const diaDaSemana = (iso: string) => DIAS[new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay()]!
const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
function horaSP(iso: string | null): string | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  const { hora, minuto } = agoraEmSP(new Date(t))
  return `${hora}h${String(minuto).padStart(2, '0')}`
}

export interface CausaDaBolsa {
  /** "Quem mais tirou:", "Na sexta, quem mais tirou:", "Até agora, quem mais tira:" */
  prefixo: string
  /** os que fizeram o movimento, com '−324' */
  fizeram: { nome: string; ticker: string; pontos: string }[]
  /** os que andaram contra, com '(+519)' */
  contra: { nome: string; ticker: string; pontos: string }[]
  /** "seguraram a queda." / "segurou a alta." */
  fechoContra: string
}

export interface TextosDaBolsa {
  sobrelinha: string
  aoVivo: boolean
  numero: string
  legenda: string
  titulo: string
  apoio: string | null
  causa: CausaDaBolsa | null
  contagem: string | null
  tese: { texto: string; slug: string } | null
  leitura: { texto: string; assinatura: string } | null
  /** "O fechamento da IA sai por volta das 20h." (fechou e a IA ainda não escreveu) */
  aviso: string | null
  /** "Ler o fechamento inteiro" / "Ler o fechamento de quinta" — null sem briefing */
  linkFechamento: string | null
  ponte: { rotulo: string; valor: string; frase: string }
}

/** A causa em texto corrido, para o teste e para o leitor de tela. */
export function causaEmTexto(c: CausaDaBolsa): string {
  const fizeram = c.fizeram.map((x) => `${x.nome}, ${x.pontos}`).join('; ')
  const contra = c.contra.map((x) => `${x.nome} (${x.pontos})`).join(' e ')
  return `${c.prefixo} ${fizeram}.${contra ? ` ${contra} ${c.fechoContra}` : ''}`
}

/**
 * As frases da seção, dos fatos do dia e do relógio da B3. Sem o Ibovespa →
 * null (a seção mostra o esqueleto e tenta de novo).
 */
export function textosDaBolsa(d: BolsaDoDia, estado: EstadoDoPregao, agora = new Date()): TextosDaBolsa | null {
  if (!d.ibov) return null
  const ib = d.ibov
  const sp = agoraEmSP(agora)
  const doDia = ib.data === sp.iso
  const aoVivo = estado === 'aberta' && doDia
  const quando = quandoFoi(ib.data, agora) ?? `em ${ddmm(ib.data)}`
  const fimDeSemana = estado === 'sem-pregao' && (sp.semana === 0 || sp.semana === 6)
  const feriado = estado === 'sem-pregao' && !fimDeSemana
  const usarSemana = fimDeSemana && !!d.semana && d.semana.confiavel && d.semana.fim === ib.data
  const proximo = estado === 'sem-pregao' ? proximoPregao(sp.iso) : null
  const abre = proximo ? `abre ${diaDaSemana(proximo)}, ${dm(proximo)}, às 10h` : 'abre no próximo pregão, às 10h'
  const fechamento = `${diaDaSemana(ib.data)}, ${ddmm(ib.data)}`

  // a sobrelinha: de quando é o número
  let sobrelinha: string
  let vivo = false
  if (aoVivo) {
    const hora = horaSP(ib.asOf)
    const minutos = ib.asOf ? (agora.getTime() - Date.parse(ib.asOf)) / 60_000 : Number.NaN
    if (hora && minutos > 20) sobrelinha = `Atualizado às ${hora}`
    else { sobrelinha = hora ? `Ao vivo · ${hora}` : 'Ao vivo'; vivo = true }
  } else if (estado === 'aberta') sobrelinha = `Bolsa aberta · fechamento de ${fechamento}`
  else if (estado === 'antes') sobrelinha = `${maiuscula(fechamento)} · abre hoje às 10h`
  else if (doDia) sobrelinha = `Hoje, ${ddmm(ib.data)} · fechou às ${horaDoFechamento(ib.data)}h`
  else if (fimDeSemana) sobrelinha = `${usarSemana ? `Semana de ${d.semana!.inicio.slice(8, 10)} a ${ddmm(ib.data)}` : maiuscula(fechamento)} · ${abre}`
  else if (feriado) sobrelinha = `${FERIADOS_B3[sp.iso] ?? 'Feriado'}, sem pregão · ${abre}`
  else sobrelinha = `Fechamento de ${fechamento}`

  const pct = usarSemana ? d.semana!.pct : ib.pct
  const numero = pctComSinal(pct)
  const legenda = aoVivo ? 'Ibovespa até agora' : usarSemana ? 'Ibovespa na semana' : doDia ? 'Ibovespa hoje' : `Ibovespa ${quando}`

  // quem mexeu no índice
  const pesos = d.pesos?.confere ? d.pesos : null
  const queda = pesos ? pesos.variacao < 0 : ib.pct < 0
  const fizeram = pesos ? (queda ? pesos.negativas : pesos.positivas).slice(0, 3) : []
  const contra = pesos ? (queda ? pesos.positivas : pesos.negativas).slice(0, 2) : []

  // o título: o que o dia teve de específico
  let titulo: string
  if (usarSemana) {
    const s = d.semana!
    const n = s.altas + s.quedas
    if (s.quedas === n) titulo = `${maiuscula(CARDINAIS[n] ?? String(n))} ${n === 1 ? 'queda' : 'quedas'} em ${CARDINAIS[n] ?? n} ${n === 1 ? 'pregão' : 'pregões'}.`
    else if (s.altas === n) titulo = `${maiuscula(CARDINAIS[n] ?? String(n))} ${n === 1 ? 'alta' : 'altas'} em ${CARDINAIS[n] ?? n} ${n === 1 ? 'pregão' : 'pregões'}.`
    else titulo = `${maiuscula(CARDINAIS[s.quedas] ?? String(s.quedas))} ${s.quedas === 1 ? 'queda' : 'quedas'} e ${CARDINAIS[s.altas] ?? s.altas} ${s.altas === 1 ? 'alta' : 'altas'}.`
  } else if (!aoVivo && d.seguidas && d.seguidas.n >= 3 && d.seguidas.ate === ib.data) {
    const ord = ORDINAIS[d.seguidas.n] ?? `${d.seguidas.n}ª`
    titulo = `${maiuscula(ord)} ${d.seguidas.sentido} seguida.`
  } else if (fizeram[0] && pesos && Math.abs(fizeram[0].pontos) >= PESO_QUE_TITULA * Math.abs(pesos.variacao)) {
    titulo = `${fizeram[0].nome} ${aoVivo ? 'pesa' : 'pesou'} mais: ${pontosComSinal(fizeram[0].pontos)} pontos.`
  } else if (Math.abs(ib.pct) < 0.3) titulo = 'Dia de lado.'
  else titulo = ib.pct < 0 ? (aoVivo ? 'A bolsa cai.' : 'A bolsa caiu.') : (aoVivo ? 'A bolsa sobe.' : 'A bolsa subiu.')

  // o apoio: os pontos e o mês
  const partes: string[] = []
  partes.push(usarSemana ? `De ${pontosTruncados(d.semana!.de)} para ${pontosTruncados(d.semana!.ate)} pontos.` : `Ibovespa a ${pontosTruncados(ib.pontos)} pontos.`)
  if (d.mes?.confiavel) {
    const m = d.mes
    const nomeDoMes = maiuscula(MESES[Number(m.mes.slice(5, 7)) - 1]!)
    if (m.ultimoPregao && !aoVivo) {
      const extremo = m.piorDesde ? `, o pior mês desde ${m.piorDesde}` : m.melhorDesde ? `, o melhor mês desde ${m.melhorDesde}` : ''
      partes.push(`${nomeDoMes} fechou em ${pctComSinal(m.pct)}${extremo}.`)
    } else partes.push(`No mês, ${pctComSinal(m.pct)}.`)
  }
  if (aoVivo) partes.push('O fechamento da IA sai por volta das 20h.')
  if (estado === 'sem-pregao' && proximo) {
    // o feriado de dia de semana entre hoje e o próximo pregão
    const dia = new Date(`${sp.iso}T12:00:00Z`)
    while (true) {
      dia.setUTCDate(dia.getUTCDate() + 1)
      const iso = dia.toISOString().slice(0, 10)
      if (iso >= proximo) break
      const s = dia.getUTCDay()
      if (s !== 0 && s !== 6 && FERIADOS_B3[iso] && semPregao(iso)) {
        partes.push(`${maiuscula(DIAS[s]!)} é ${FERIADOS_B3[iso]}, sem pregão.`)
        break
      }
    }
  }
  const apoio = partes.join(' ')

  // a causa
  let causa: CausaDaBolsa | null = null
  if (pesos && fizeram.length) {
    const verbo = queda ? (aoVivo ? 'tira' : 'tirou') : (aoVivo ? 'soma' : 'somou')
    const prefixo = aoVivo ? `Até agora, quem mais ${verbo}:` : doDia ? `Quem mais ${verbo}:` : `${maiuscula(quando)}, quem mais ${verbo}:`
    const segurar = contra.length === 1 ? (aoVivo ? 'segura' : 'segurou') : (aoVivo ? 'seguram' : 'seguraram')
    causa = {
      prefixo,
      fizeram: fizeram.map((x) => ({ nome: x.nome, ticker: x.ticker, pontos: pontosComSinal(x.pontos) })),
      contra: contra.map((x) => ({ nome: x.nome, ticker: x.ticker, pontos: pontosComSinal(x.pontos) })),
      fechoContra: `${segurar} a ${queda ? 'queda' : 'alta'}.`,
    }
  }

  const c = d.contagem
  const contagem = c && doDia
    ? aoVivo
      ? `Até agora, ${c.altas} das ${c.total} ações do Ibovespa sobem; ${c.quedas} caem.`
      : `${c.altas} das ${c.total} ações do Ibovespa subiram; ${c.quedas} caíram.`
    : null

  const tese = d.tese
    ? {
        slug: d.tese.slug,
        texto: `${d.tese.nomes.join(' e ')} ${d.tese.nomes.length > 1 ? 'estão' : 'está'} na tese ${d.tese.titulo}: convicção ${d.tese.convicao} de 100${d.tese.antes ? `, era ${d.tese.antes.valor} até ${ddmm(d.tese.antes.ate)}` : ''}.`,
      }
    : null

  // a leitura da IA, assinada; sem ela, o aviso de quando sai
  let leitura: TextosDaBolsa['leitura'] = null
  let aviso: string | null = null
  let linkFechamento: string | null = null
  if (d.leitura?.bate && d.leitura.data === ib.data) {
    const hora = horaSP(d.leitura.publicadoEm)
    leitura = { texto: d.leitura.texto, assinatura: `IA da Redentia · ${ddmm(d.leitura.data)}${hora ? `, ${hora}` : ''}` }
    linkFechamento = 'Ler o fechamento inteiro'
  } else {
    if (d.leitura) linkFechamento = `Ler o fechamento de ${diaDaSemana(d.leitura.data)}`
    if (estado === 'fechada' && doDia && (sp.hora < 21 || (sp.hora === 21 && sp.minuto < 30))) aviso = 'O fechamento da IA sai por volta das 20h.'
  }

  // a ponte: a mesma linha que a Redentia escreve para quem conectou a carteira
  const rotulo = usarSemana ? 'Bolsa na semana' : aoVivo ? 'Bolsa até agora' : doDia ? 'Bolsa hoje' : `Bolsa ${quando}`
  const m = d.mes
  const frase = m?.confiavel && m.ultimoPregao && m.raros && !aoVivo
    ? `Desde ${m.raros.desde}, o Ibovespa ${m.pct < 0 ? 'caiu' : 'subiu'} ${nf2.format(Math.abs(m.pct))}% ou mais em ${m.raros.n} meses, este incluído. Os 2.000 cenários testam a sua carteira com trechos reais como este.`
    : 'Todo pregão, a Redentia escreve esta linha para a sua carteira.'

  return { sobrelinha, aoVivo: vivo, numero, legenda, titulo, apoio, causa, contagem, tese, leitura, aviso, linkFechamento, ponte: { rotulo, valor: numero, frase } }
}
