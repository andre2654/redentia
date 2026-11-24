/**
 * Agenda de dividendos (/dividendos/agenda e /dividendos/agenda/{mês-ano}).
 *
 * A lista de um mês é o conjunto de proventos cuja DATA DE PAGAMENTO cai
 * naquele mês. É o recorte de "agenda do mês": o dinheiro anunciado para
 * cair na conta, não a data com (que pode ser do mês anterior). Concorrentes
 * filtram pelo pagamento. A data com segue na linha, porque é ela que decide
 * o direito.
 *
 * Fontes, as mesmas da carteira e do gráfico de proventos:
 *  - GET /dividends/recent   pagamentos já ocorridos, agrupados por payment_date
 *  - GET /dividends/upcoming pagamentos anunciados, agrupados por payment_date
 *    (o backend capa a janela em 180 dias)
 *
 * Nada aqui inventa ticker, valor ou data. Linha sem ticker, sem data de
 * pagamento ou sem valor positivo sai. A data ex não é campo do aviso: quando
 * o calendário de negociação da B3 daquele ano está no site, o dia exibido é
 * o pregão seguinte à data com (proximoPregao). Sem calendário, a célula diz
 * só "Pregão seguinte à data com".
 */
import { MONTH_LONG_PT, MONTHS_PT } from './format.ts'
import { nomeDaEmpresa } from './nomeB3.ts'
import { proximoPregao } from './pregao.ts'
import { symbolShape } from './tickerClass.ts'

export const PATH_HUB = '/dividendos/agenda'
export const TITULO_HUB = 'Agenda de dividendos'
export const DESC_HUB = 'Agenda de dividendos da B3 por mês: ações, FIIs e BDRs, com valor, data com e pagamento. Avisos da B3. Não é recomendação.'
export const NOTA_CVM = 'Não é recomendação de compra ou venda. Os números saem dos avisos de proventos da B3 e podem ser atualizados pela companhia ou pelo fundo.'

/** Meses com página pedida mesmo quando a geração ao vivo falha. */
export const SLUGS_FIXOS = ['novembro-2026', 'dezembro-2026'] as const

const ANO_MIN = 2024
const ANO_MAX = 2032
export const LIMITE_CALENDARIO = 500
export const JANELA_DIAS = 180

const MESES: { mes: number, slug: string, nome: string, titulo: string }[] = [
  { mes: 1, slug: 'janeiro', nome: 'janeiro', titulo: 'Janeiro' },
  { mes: 2, slug: 'fevereiro', nome: 'fevereiro', titulo: 'Fevereiro' },
  { mes: 3, slug: 'marco', nome: 'março', titulo: 'Março' },
  { mes: 4, slug: 'abril', nome: 'abril', titulo: 'Abril' },
  { mes: 5, slug: 'maio', nome: 'maio', titulo: 'Maio' },
  { mes: 6, slug: 'junho', nome: 'junho', titulo: 'Junho' },
  { mes: 7, slug: 'julho', nome: 'julho', titulo: 'Julho' },
  { mes: 8, slug: 'agosto', nome: 'agosto', titulo: 'Agosto' },
  { mes: 9, slug: 'setembro', nome: 'setembro', titulo: 'Setembro' },
  { mes: 10, slug: 'outubro', nome: 'outubro', titulo: 'Outubro' },
  { mes: 11, slug: 'novembro', nome: 'novembro', titulo: 'Novembro' },
  { mes: 12, slug: 'dezembro', nome: 'dezembro', titulo: 'Dezembro' },
]

const ROTULOS: Record<string, string> = {
  'dividendo': 'Dividendo',
  'dividendos': 'Dividendo',
  'jcp': 'JCP',
  'juros sobre capital proprio': 'JCP',
  'jrs cap proprio': 'JCP',
  'rendimento': 'Rendimento',
  'rendimentos': 'Rendimento',
  'rend. tributado': 'Rendimento tributado',
  'rend tributado': 'Rendimento tributado',
  'amortizacao': 'Amortização',
  'amortizacao rf': 'Amortização',
  'dividendo + jcp': 'Dividendo + JCP',
  'jcp + dividendo': 'JCP + Dividendo',
  'rendimento + amortizacao': 'Rendimento + Amortização',
  'rendimento + amortizacao rf': 'Rendimento + Amortização',
}

const nfValor = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

export interface MesAlvo {
  slug: string
  nome: string
  nomeTitulo: string
  mes: number
  ano: number
  /** 'YYYY-MM-DD' inclusive */
  inicio: string
  fim: string
}

export interface ItemBruto {
  ticker: string
  name: string
  type: string
  label: string
  rate: number
  payment_date: string
  last_date_prior: string | null
}

export interface FeedAgenda {
  ok: boolean
  truncado: boolean
  /** inclusive. null quando o feed falhou ou veio cortado: aí o mês não se publica. */
  desde: string | null
  ate: string | null
  itens: ItemBruto[]
}

export interface FontesAgenda {
  hoje: string
  recentes: FeedAgenda
  futuros: FeedAgenda
}

export type ClasseAgenda = 'acao' | 'fii' | 'bdr' | 'outro'

export interface EventoAgenda {
  ticker: string
  nome: string
  tipo: string
  valor: string
  classe: ClasseAgenda
  pagamento: string
  pagamentoTexto: string
  dataCom: string | null
  dataComTexto: string
  dataEx: string | null
  dataExTexto: string
  href: string | null
}

export interface DiaAgenda {
  data: string
  titulo: string
  eventos: EventoAgenda[]
}

export interface FaqAgenda {
  q: string
  a: string
  link?: { texto: string, to: string }
}

export interface OutroMes {
  slug: string
  path: string
  rotulo: string
  total: number
}

export interface PaginaMes {
  slug: string
  path: string
  titulo: string
  description: string
  nome: string
  nomeTitulo: string
  ano: number
  lead: string
  dias: DiaAgenda[]
  total: number
  contagens: Record<ClasseAgenda, number>
  nota: string
  fonte: string
  faq: FaqAgenda[]
  outros: OutroMes[]
}

export interface CartaoMes {
  slug: string
  path: string
  rotulo: string
  total: number | null
  fiis: number | null
}

export interface HubAgenda {
  titulo: string
  description: string
  lead: string
  nota: string
  fonte: string
  indisponivel: boolean
  meses: CartaoMes[]
  faq: FaqAgenda[]
}

export interface EntradaAgenda {
  path: string
  title: string
  description: string
}

export type StatusMes = 'ok' | 'vazio' | 'indisponivel'

const VAZIO: FeedAgenda = { ok: false, truncado: false, desde: null, ate: null, itens: [] }

function isoDia(v: unknown): string {
  const s = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

export function isoMaisDias(iso: string, days: number): string {
  const t = Date.parse(`${iso}T12:00:00Z`) + days * 86_400_000
  return new Date(t).toISOString().slice(0, 10)
}

export function diasEntreIso(a: string, b: string): number {
  const ms = Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)
  return Math.round(ms / 86_400_000)
}

function ultimoDia(ano: number, mes: number): string {
  return new Date(Date.UTC(ano, mes, 0)).toISOString().slice(0, 10)
}

export function dataCurtaAgenda(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}

export function dataLongaAgenda(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} de ${MONTH_LONG_PT[Number(m) - 1] ?? m} de ${y}`
}

/**
 * 'dezembro-2026' → mês. O slug canônico é sem acento (`marco-2026`);
 * `março-2026` aponta para o mesmo mês. Qualquer outra forma é null (404).
 */
export function parseMesAgenda(slug: string): MesAlvo | null {
  const normalizado = slug.trim().toLowerCase().normalize('NFC')
  const m = /^([a-zà-ÿ]+)-(\d{4})$/.exec(normalizado)
  if (!m) return null
  const found = MESES.find((x) => x.slug === m[1] || x.nome === m[1])
  const ano = Number(m[2])
  if (!found || !Number.isInteger(ano) || ano < ANO_MIN || ano > ANO_MAX) return null
  const mm = String(found.mes).padStart(2, '0')
  return {
    slug: `${found.slug}-${ano}`,
    nome: found.nome,
    nomeTitulo: found.titulo,
    mes: found.mes,
    ano,
    inicio: `${ano}-${mm}-01`,
    fim: ultimoDia(ano, found.mes),
  }
}

export function pathDoMes(slug: string): string {
  return `${PATH_HUB}/${slug}`
}

export function tituloDoMes(nome: string, ano: number): string {
  return `Agenda de dividendos ${nome} ${ano}`
}

export function descricaoDoMes(nome: string, ano: number): string {
  return `Agenda de dividendos de ${nome} de ${ano}: pagamentos de ações, FIIs e BDRs, com valor e data com. Avisos da B3. Não é recomendação.`
}

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Rótulo do aviso, com os tipos conhecidos da B3. Rótulo desconhecido fica como veio. */
export function rotuloDoAviso(label: string): string {
  const chave = semAcento(label)
  if (!chave) return 'Provento'
  return ROTULOS[chave] ?? label.replace(/\s+/g, ' ').trim()
}

function classeDe(type: string): ClasseAgenda {
  const t = type.toUpperCase()
  if (t === 'REIT') return 'fii'
  if (t === 'BDR') return 'bdr'
  if (t === 'STOCK') return 'acao'
  return 'outro'
}

export function lerItensDoCorpo(body: unknown, limite = LIMITE_CALENDARIO): { itens: ItemBruto[], truncado: boolean, diaIncompleto: boolean, limiteAtingido: boolean } {
  const bruto = (body ?? {}) as { data?: unknown, total?: unknown }
  const total = Number(bruto.total)
  const dias = Array.isArray(bruto.data) ? bruto.data : []
  const itens: ItemBruto[] = []
  let diaIncompleto = false
  let limiteAtingido = Number.isFinite(total) && total >= limite
  for (const dia of dias) {
    const d = (dia ?? {}) as { count?: unknown, items?: unknown }
    const items = Array.isArray(d.items) ? d.items : []
    const count = Number(d.count)
    if (Number.isFinite(count) && items.length < count) diaIncompleto = true
    for (const raw of items) {
      const i = (raw ?? {}) as Record<string, unknown>
      const ticker = String(i.ticker ?? '').trim().toUpperCase()
      const pagamento = isoDia(i.payment_date)
      const rate = Number(i.rate)
      const label = String(i.label ?? i['label '] ?? '').trim()
      if (!ticker || !pagamento || !Number.isFinite(rate) || rate <= 0) continue
      itens.push({
        ticker,
        name: String(i.name ?? '').trim(),
        type: String(i.type ?? '').trim(),
        label,
        rate,
        payment_date: pagamento,
        last_date_prior: isoDia(i.last_date_prior) || null,
      })
    }
  }
  if (itens.length >= limite) limiteAtingido = true
  return { itens, truncado: diaIncompleto || limiteAtingido, diaIncompleto, limiteAtingido }
}

/**
 * Dia com `count` maior que os itens é buraco: o feed não serve pra publicar.
 * Limite de 500 linhas corta a ponta (o passado, no recent; o futuro, no
 * upcoming). A ponta que sobrou continua valendo.
 */
function feedDe(ok: boolean, body: unknown, pedido: { desde: string, ate: string }, lado: 'recente' | 'futuro'): FeedAgenda {
  if (!ok) return { ...VAZIO }
  const lido = lerItensDoCorpo(body)
  if (lido.diaIncompleto) return { ok: true, truncado: true, desde: null, ate: null, itens: lido.itens }
  if (!lido.limiteAtingido) return { ok: true, truncado: false, desde: pedido.desde, ate: pedido.ate, itens: lido.itens }
  const datas = lido.itens.map((i) => i.payment_date).sort()
  const maisAntiga = datas[0]
  const maisNova = datas[datas.length - 1]
  if (!maisAntiga || !maisNova) return { ok: true, truncado: true, desde: null, ate: null, itens: [] }
  if (lado === 'recente') return { ok: true, truncado: false, desde: maisAntiga, ate: pedido.ate, itens: lido.itens }
  return { ok: true, truncado: false, desde: pedido.desde, ate: maisNova, itens: lido.itens }
}

function inicioDoMes(iso: string): string {
  return `${iso.slice(0, 8)}01`
}

function inicioDoMesAnterior(iso: string): string {
  const [ys, ms] = iso.split('-')
  let ano = Number(ys)
  let mes = Number(ms) - 1
  if (mes < 1) {
    mes = 12
    ano -= 1
  }
  return `${ano}-${String(mes).padStart(2, '0')}-01`
}

async function pedir(getJson: (path: string) => Promise<unknown>, path: string): Promise<{ ok: boolean, body: unknown }> {
  try {
    return { ok: true, body: await getJson(path) }
  } catch {
    return { ok: false, body: null }
  }
}

/**
 * Recentes: o mês corrente numa janela curta (para o teto de 500 não comer
 * o próprio mês) e, em seguida, o mês anterior se a resposta longa couber.
 * Futuros: os próximos 180 dias. Falha de um pedido não derruba o outro.
 */
export async function lerFontesAgenda(
  getJson: (path: string) => Promise<unknown>,
  hoje: string,
): Promise<FontesAgenda> {
  const inicioMes = inicioDoMes(hoje)
  const inicioPrev = inicioDoMesAnterior(hoje)
  const diasMes = Math.min(JANELA_DIAS, Math.max(1, diasEntreIso(inicioMes, hoje) + 1))
  const diasPrev = Math.min(JANELA_DIAS, Math.max(diasMes, diasEntreIso(inicioPrev, hoje) + 1))
  const ateFuturo = isoMaisDias(hoje, JANELA_DIAS)
  const [mesRes, prevRes, futRes] = await Promise.all([
    pedir(getJson, `/dividends/recent?days=${diasMes}&limit=${LIMITE_CALENDARIO}`),
    diasPrev > diasMes ? pedir(getJson, `/dividends/recent?days=${diasPrev}&limit=${LIMITE_CALENDARIO}`) : Promise.resolve(null),
    pedir(getJson, `/dividends/upcoming?days=${JANELA_DIAS}&limit=${LIMITE_CALENDARIO}`),
  ])
  const doMes = feedDe(mesRes.ok, mesRes.body, { desde: inicioMes, ate: hoje }, 'recente')
  const doPrev = prevRes ? feedDe(prevRes.ok, prevRes.body, { desde: inicioPrev, ate: hoje }, 'recente') : null
  const recentes = juntarRecentes(doMes, doPrev, inicioMes, inicioPrev)
  return {
    hoje,
    recentes,
    futuros: feedDe(futRes.ok, futRes.body, { desde: hoje, ate: ateFuturo }, 'futuro'),
  }
}

/** O mês corrente prevalece. O mês anterior só entra se a lista longa chegou ao dia 1 dele. */
function juntarRecentes(doMes: FeedAgenda, doPrev: FeedAgenda | null, inicioMes: string, inicioPrev: string): FeedAgenda {
  if (!doMes.ok || doMes.truncado) return doMes
  const itens = [...doMes.itens]
  const vistos = new Set(itens.map(chaveItem))
  let desde = doMes.desde
  if (doPrev?.ok && !doPrev.truncado && doPrev.desde && doPrev.desde <= inicioPrev) {
    desde = inicioPrev
    for (const item of doPrev.itens) {
      if (item.payment_date >= inicioMes) continue
      const chave = chaveItem(item)
      if (vistos.has(chave)) continue
      vistos.add(chave)
      itens.push(item)
    }
  }
  return { ok: true, truncado: false, desde, ate: doMes.ate, itens }
}

const cacheFontes = new Map<string, { expira: number, fontes: FontesAgenda }>()

/** Uma leitura por dia de pregão, por 10 minutos, no processo. */
export async function fontesDaAgenda(
  getJson: (path: string) => Promise<unknown>,
  hoje: string,
  agora = Date.now(),
): Promise<FontesAgenda> {
  const hit = cacheFontes.get(hoje)
  if (hit && hit.expira > agora) return hit.fontes
  const fontes = await lerFontesAgenda(getJson, hoje)
  if (fontes.recentes.ok || fontes.futuros.ok) {
    cacheFontes.set(hoje, { expira: agora + 10 * 60 * 1000, fontes })
  }
  return fontes
}

export function limparCacheAgenda(): void {
  cacheFontes.clear()
}

function feedCobre(feed: FeedAgenda, desde: string, ate: string): boolean {
  return feed.ok && !feed.truncado && !!feed.desde && !!feed.ate && feed.desde <= desde && feed.ate >= ate
}

/**
 * O mês só se publica quando cada ponta (passado e futuro) cabe num feed que
 * não veio cortado. Lista pela metade não entra como agenda do mês.
 */
export function mesCoberto(alvo: MesAlvo, fontes: FontesAgenda): boolean {
  if (alvo.inicio <= fontes.hoje) {
    const ate = alvo.fim < fontes.hoje ? alvo.fim : fontes.hoje
    if (!feedCobre(fontes.recentes, alvo.inicio, ate)) return false
  }
  if (alvo.fim >= fontes.hoje) {
    const desde = alvo.inicio > fontes.hoje ? alvo.inicio : fontes.hoje
    if (!feedCobre(fontes.futuros, desde, alvo.fim)) return false
  }
  return true
}

function chaveItem(i: ItemBruto): string {
  return [i.ticker, i.payment_date, i.label, String(i.rate), i.last_date_prior ?? ''].join('|')
}

export function itensDoMes(alvo: MesAlvo, fontes: FontesAgenda): ItemBruto[] {
  const vistos = new Set<string>()
  const out: ItemBruto[] = []
  for (const feed of [fontes.recentes, fontes.futuros]) {
    for (const item of feed.itens) {
      if (item.payment_date < alvo.inicio || item.payment_date > alvo.fim) continue
      const chave = chaveItem(item)
      if (vistos.has(chave)) continue
      vistos.add(chave)
      out.push(item)
    }
  }
  out.sort((a, b) => a.payment_date.localeCompare(b.payment_date) || a.ticker.localeCompare(b.ticker) || a.label.localeCompare(b.label))
  return out
}

function eventoDe(item: ItemBruto): EventoAgenda {
  const dataCom = item.last_date_prior
  const dataEx = dataCom ? proximoPregao(dataCom) : null
  const nome = item.name ? (nomeDaEmpresa(item.name) || item.ticker) : item.ticker
  return {
    ticker: item.ticker,
    nome,
    tipo: rotuloDoAviso(item.label),
    valor: `R$ ${nfValor.format(item.rate)}`,
    classe: classeDe(item.type),
    pagamento: item.payment_date,
    pagamentoTexto: dataCurtaAgenda(item.payment_date),
    dataCom,
    dataComTexto: dataCom ? dataCurtaAgenda(dataCom) : 'Não informada',
    dataEx,
    dataExTexto: dataEx ? dataCurtaAgenda(dataEx) : (dataCom ? 'Pregão seguinte à data com' : 'Não informada'),
    href: symbolShape(item.ticker) === 'b3' ? `/dividendos/${item.ticker}` : null,
  }
}

function agrupar(itens: ItemBruto[]): DiaAgenda[] {
  const dias: DiaAgenda[] = []
  for (const item of itens) {
    const evento = eventoDe(item)
    const ultimo = dias[dias.length - 1]
    if (!ultimo || ultimo.data !== item.payment_date) {
      dias.push({ data: item.payment_date, titulo: dataLongaAgenda(item.payment_date), eventos: [evento] })
    } else {
      ultimo.eventos.push(evento)
    }
  }
  return dias
}

function contagensDe(dias: DiaAgenda[]): Record<ClasseAgenda, number> {
  const c: Record<ClasseAgenda, number> = { acao: 0, fii: 0, bdr: 0, outro: 0 }
  for (const dia of dias) for (const e of dia.eventos) c[e.classe] += 1
  return c
}

function notaFonte(temDiaEx: boolean): string {
  const base = 'Fonte: avisos de proventos da B3. A lista reúne os proventos com data de pagamento neste mês. Um anúncio novo entra quando o aviso chega.'
  if (temDiaEx) {
    return `${base} A data ex, quando aparece como dia, é o pregão seguinte à data com no calendário de negociação da B3 (Ofício Circular 003/2026-VNC). O aviso informa a data com e não manda a data ex como campo.`
  }
  return `${base} A data ex é o pregão seguinte à data com. O aviso informa a data com e não manda a data ex como campo. Fora de 2026 o calendário de negociação ainda não foi publicado pela B3, então a célula não chuta o dia.`
}

function faqDoMes(alvo: MesAlvo): FaqAgenda[] {
  const quando = `${alvo.nome} de ${alvo.ano}`
  return [
    {
      q: 'O que é data com?',
      a: 'Data com é o último pregão em que ter o ativo dá direito ao provento anunciado. Data ex é o pregão seguinte, quando o ativo passa a ser negociado sem esse direito. O guia de data com e data ex explica as quatro datas. Nesta agenda, a data com é a que veio no aviso.',
      link: { texto: 'guia de data com e data ex', to: '/guias/data-com-e-data-ex' },
    },
    {
      q: `A agenda de dividendos de ${quando} filtra por qual data?`,
      a: `Pela data de pagamento. Entra o provento cujo aviso marca o pagamento em ${quando}, mesmo que a data com tenha sido no mês anterior. A data com continua na linha. A fonte são os avisos de proventos da B3.`,
    },
    {
      q: `Onde ver os FIIs na agenda de dividendos de ${quando}?`,
      a: `Nesta página, no filtro FIIs. O fundo entra com o tipo que o aviso usa, em geral Rendimento, quando a data de pagamento cai em ${quando}. O ranking de FIIs por dividend yield é outra página.`,
      link: { texto: 'ranking de FIIs', to: '/ranking/maiores-dividend-yield?type=fiis' },
    },
    {
      q: 'Esta agenda é recomendação de compra?',
      a: 'Não. Ela organiza datas e valores informados nos avisos de proventos da B3. Não é recomendação de compra ou venda, nem análise de adequação ao seu perfil.',
    },
  ]
}

function resumoDe(alvo: MesAlvo, dias: DiaAgenda[]): OutroMes {
  return {
    slug: alvo.slug,
    path: pathDoMes(alvo.slug),
    rotulo: `${alvo.nomeTitulo} ${alvo.ano}`,
    total: dias.reduce((n, d) => n + d.eventos.length, 0),
  }
}

/** Meses com lista inteira e ao menos um provento. Ordem cronológica. */
export function mesesPublicaveis(fontes: FontesAgenda): { alvo: MesAlvo, dias: DiaAgenda[] }[] {
  const chaves = new Set<string>()
  for (const feed of [fontes.recentes, fontes.futuros]) {
    for (const item of feed.itens) chaves.add(item.payment_date.slice(0, 7))
  }
  const out: { alvo: MesAlvo, dias: DiaAgenda[] }[] = []
  for (const chave of [...chaves].sort()) {
    const [ano, mes] = chave.split('-')
    const meta = MESES[Number(mes) - 1]
    const alvo = meta ? parseMesAgenda(`${meta.slug}-${ano}`) : null
    if (!alvo || !mesCoberto(alvo, fontes)) continue
    const dias = agrupar(itensDoMes(alvo, fontes))
    if (!dias.length) continue
    out.push({ alvo, dias })
  }
  return out
}

export function paginaDoMes(fontes: FontesAgenda, alvo: MesAlvo): PaginaMes | null {
  if (!mesCoberto(alvo, fontes)) return null
  const dias = agrupar(itensDoMes(alvo, fontes))
  if (!dias.length) return null
  const total = dias.reduce((n, d) => n + d.eventos.length, 0)
  const contagens = contagensDe(dias)
  const temDiaEx = dias.some((d) => d.eventos.some((e) => e.dataEx))
  const palavra = total === 1 ? 'provento' : 'proventos'
  const outros = mesesPublicaveis(fontes)
    .filter((m) => m.alvo.slug !== alvo.slug)
    .map((m) => resumoDe(m.alvo, m.dias))
  return {
    slug: alvo.slug,
    path: pathDoMes(alvo.slug),
    titulo: tituloDoMes(alvo.nome, alvo.ano),
    description: descricaoDoMes(alvo.nome, alvo.ano),
    nome: alvo.nome,
    nomeTitulo: alvo.nomeTitulo,
    ano: alvo.ano,
    lead: `Agenda de dividendos ${alvo.nome} ${alvo.ano}: ${total} ${palavra} com data de pagamento em ${alvo.nome} de ${alvo.ano}. Cada linha traz o ticker, o tipo do aviso, o valor por ação, cota ou BDR, a data com e a data de pagamento.`,
    dias,
    total,
    contagens,
    nota: NOTA_CVM,
    fonte: notaFonte(temDiaEx),
    faq: faqDoMes(alvo),
    outros,
  }
}

/** 200 com lista, 404 sem lista publicável, 503 quando o feed que o mês precisa falhou ou veio cortado. */
export function statusDoMes(alvo: MesAlvo, fontes: FontesAgenda): StatusMes {
  const precisaRecente = alvo.inicio <= fontes.hoje
  const precisaFuturo = alvo.fim >= fontes.hoje
  const recenteRuim = precisaRecente && (!fontes.recentes.ok || fontes.recentes.truncado)
  const futuroRuim = precisaFuturo && (!fontes.futuros.ok || fontes.futuros.truncado)
  if (recenteRuim || futuroRuim) return 'indisponivel'
  if (!mesCoberto(alvo, fontes) || itensDoMes(alvo, fontes).length === 0) return 'vazio'
  return 'ok'
}

export function httpDaAgenda(status: StatusMes | 'invalido'): number {
  if (status === 'ok') return 200
  if (status === 'indisponivel') return 503
  return 404
}

const FAQ_HUB: FaqAgenda[] = [
  {
    q: 'O que é a agenda de dividendos?',
    a: 'É a lista dos proventos com data de pagamento em cada mês: ações, FIIs e BDRs, com o tipo do aviso, o valor e a data com. A fonte são os avisos de proventos da B3.',
  },
  {
    q: 'O que é data com?',
    a: 'Data com é o último pregão em que ter o ativo dá direito ao provento anunciado. Data ex é o pregão seguinte. O guia de data com e data ex detalha as quatro datas do pagamento.',
    link: { texto: 'guia de data com e data ex', to: '/guias/data-com-e-data-ex' },
  },
  {
    q: 'Onde ver os FIIs na agenda?',
    a: 'Na página do mês, no filtro FIIs. O fundo aparece com o tipo do aviso, em geral Rendimento. O ranking de FIIs por dividend yield reúne o yield de 12 meses, que é outra conta.',
    link: { texto: 'ranking de FIIs', to: '/ranking/maiores-dividend-yield?type=fiis' },
  },
  {
    q: 'A agenda é recomendação de investimento?',
    a: 'Não. Ela organiza datas e valores dos avisos de proventos da B3. Não é recomendação de compra ou venda.',
  },
]

function cartaoFixo(slug: string): CartaoMes {
  const alvo = parseMesAgenda(slug)!
  return { slug: alvo.slug, path: pathDoMes(alvo.slug), rotulo: `${alvo.nomeTitulo} ${alvo.ano}`, total: null, fiis: null }
}

export function hubDeAgenda(fontes: FontesAgenda | null): HubAgenda {
  const indisponivel = !fontes || (!fontes.recentes.ok && !fontes.futuros.ok)
  const meses: CartaoMes[] = indisponivel || !fontes
    ? SLUGS_FIXOS.map((slug) => cartaoFixo(slug))
    : mesesPublicaveis(fontes).map(({ alvo, dias }) => ({
        slug: alvo.slug,
        path: pathDoMes(alvo.slug),
        rotulo: `${alvo.nomeTitulo} ${alvo.ano}`,
        total: dias.reduce((n, d) => n + d.eventos.length, 0),
        fiis: dias.reduce((n, d) => n + d.eventos.filter((e) => e.classe === 'fii').length, 0),
      }))
  return {
    titulo: TITULO_HUB,
    description: DESC_HUB,
    lead: 'A agenda de dividendos lista, mês a mês, os proventos com data de pagamento naquele mês: ações, FIIs e BDRs, com o valor do aviso, a data com e a data de pagamento.',
    nota: NOTA_CVM,
    fonte: 'Fonte: avisos de proventos da B3. Entra mês cuja lista cabe inteira na janela dos avisos e tem ao menos um pagamento. Mês sem dado não ganha página.',
    indisponivel,
    meses,
    faq: FAQ_HUB,
  }
}

function entradaDoSlug(slug: string): EntradaAgenda {
  const alvo = parseMesAgenda(slug)!
  return { path: pathDoMes(alvo.slug), title: tituloDoMes(alvo.nome, alvo.ano), description: descricaoDoMes(alvo.nome, alvo.ano) }
}

export function entradasAgenda(fontes: FontesAgenda | null): EntradaAgenda[] {
  const hub: EntradaAgenda = { path: PATH_HUB, title: TITULO_HUB, description: DESC_HUB }
  const fixas = [hub, ...SLUGS_FIXOS.map((slug) => entradaDoSlug(slug))]
  // Sem leitura, as três URLs ficam: a página do mês responde 503, não 404.
  if (!fontes || (!fontes.recentes.ok && !fontes.futuros.ok)) return fixas
  return [
    hub,
    ...mesesPublicaveis(fontes).map(({ alvo }) => ({
      path: pathDoMes(alvo.slug),
      title: tituloDoMes(alvo.nome, alvo.ano),
      description: descricaoDoMes(alvo.nome, alvo.ano),
    })),
  ]
}
