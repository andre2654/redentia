/**
 * Para onde o seu dinheiro está exposto no mundo (05/11/2026, pedido do dono:
 * "trazer a exposição do cara no mundo, onde ele está sendo exposto, de
 * maneira simples, num mapa-múndi").
 *
 * MUDANÇA DE RUMO (05/11/2026, o dono vendo a primeira versão): "o
 * faturamento das empresas não é todo no Brasil (elas vivem no Brasil mas
 * recebem de outros lugares)". A exposição de ação e FII é pela RECEITA, não
 * pela sede. As regras, por classe da posição:
 *  - ação e FII da B3: o valor se divide pelas fatias de receita por país ou
 *    região do item 1.7 do Formulário de Referência da CVM (GET
 *    /revenue-geography?tickers=). Sem dado, o valor vai para "Brasil (sede)",
 *    um grupo à parte, NUNCA somado ao Brasil da receita. O que a empresa não
 *    detalhou (cobertura < 100%) vira "Receita não detalhada";
 *  - BDR (e ação americana): o país da empresa (`country` do GET /tickers/{t});
 *  - ETF: a região do índice (`profile.geography` do GET /etfs/{t}/xray; o
 *    `country` do /tickers diz onde o ETF é LISTADO). Região é região:
 *    WRLD11 é "Mundo desenvolvido", nunca "70% EUA";
 *  - Tesouro, renda fixa, poupança e conta: Brasil, sem chamada (na lista,
 *    pelo nome que a carteira dá ao título, nunca pelo código ISIN);
 *  - cripto: sem país, à parte, fora do mapa;
 *  - o resto sem dado (ETF sem perfil, a API fora, classe desconhecida):
 *    "Sem dado". Nunca chute.
 *
 * O DADO REAL (05/11/2026, a resposta do piloto do backend para 49 papéis):
 *  - as fatias de uma empresa podem somar mais de 100 (a Gerdau soma 101,7
 *    por eliminações entre regiões): a soma manda e vira 100;
 *  - abaixo de 100 (o BB soma 96), o resto é "Receita não detalhada";
 *  - a chave `outros` ("outros países", "Demais países", "Fora do Brasil")
 *    é dinheiro de verdade fora do Brasil, só sem lugar: vira "Outros
 *    países", fora do mapa e sem arco, e não se mistura com "Sem dado";
 *  - `status: 'nao_aplicavel_100_brasil'` (o item 1.7 não se aplica porque a
 *    receita é toda daqui) é 100% Brasil pela receita: conta como sabido.
 *
 * Sem Vue nem Nuxt, para o `node --test`. A busca está em
 * composables/useExposicaoNoMundo.ts e o desenho em CarteiraMundo.vue.
 */
import { alfa2De, numericoDe, numericosDaRegiao } from './regioesDoMundo.ts'

/** Uma posição da carteira, com o valor cru em R$. */
export interface PosicaoMundo {
  ticker: string
  /** asset_class do /portfolio (STOCK, REIT, ETF, BDR, CRYPTO, TREASURY…) */
  classe: string | null
  valor: number
  /** o nome da posição na carteira ('Tesouro IPCA+ 2035'); a lista usa no Tesouro e na renda fixa */
  nome?: string | null
}

/** Uma fatia do GET /revenue-geography (contrato de 05/11/2026). */
export interface FatiaReceitaApi {
  /** ISO-2 quando é país ('US'); senão uma região fixa ('america_do_norte'…) */
  chave: string
  tipo: 'pais' | 'regiao' | string
  nome: string
  /** % da receita líquida */
  pct: number
}

/** GET /revenue-geography?tickers= → data[ticker] (null = ainda sem dado). */
export interface ReceitaGeografiaApi {
  ano: number | null
  fonte_url: string | null
  /** 'lido' | 'nao_aplicavel_100_brasil' | … */
  status?: string | null
  fatias: FatiaReceitaApi[]
  cobertura_pct: number | null
}

/**
 * O que a API disse de um ticker que precisa de busca. `null` = não disse
 * (404, erro, papel sem dado, ou fora do teto de chamadas).
 */
export type FonteMundo =
  | { tipo: 'pais'; pais: string | null }
  | { tipo: 'etf'; geografia: string | null; classe: string | null }
  | { tipo: 'receita'; fatias: FatiaReceitaApi[]; cobertura: number | null; status?: string | null }
  | null

export type ViaMundo = 'ticker' | 'etf' | 'receita'

export type TipoFatia = 'pais' | 'regiao' | 'outros' | 'cripto' | 'ouro' | 'sede' | 'sem-dado'

export interface FatiaMundo {
  /** 'BR', 'US', 'reg:america_do_norte', 'etf:GLOBAL_DEVELOPED', 'outros', 'cripto', 'sede-br'… */
  chave: string
  tipo: TipoFatia
  /** 'Brasil', 'Estados Unidos', 'América do Norte', 'Brasil (sede)' */
  nome: string
  /** o lugar com a preposição de "exposto a": 'ao Brasil', 'à Europa' */
  a: string
  /** o lugar com a preposição de "está em": 'no Brasil', 'na Europa' (a frase de cima) */
  em: string
  valor: number
  /** participação crua, 0–100 */
  pct: number
  /** participação arredondada para a tela (as fatias somam 100) */
  pctInt: number
  /** '92%' | 'menos de 1%' */
  pctTxt: string
  tickers: string[]
  /** países a acender no mapa (ISO 3166-1 numérico); região = os membros */
  paises: string[]
  /** a região é o mundo todo (acende o halo, não os pontos) */
  todos: boolean
  /** [lon, lat] do ponto de chegada do arco; null = sem ponto */
  ancora: [lon: number, lat: number] | null
}

export interface CoberturaReceita {
  /** ações e FIIs com receita por geografia */
  comDado: number
  /** ações e FIIs na carteira */
  total: number
  /** 'empresas' | 'fundos imobiliários' | 'empresas e fundos' */
  quem: string
}

export interface ExposicaoNoMundo {
  /** soma dos valores das posições, R$ */
  total: number
  /** países e regiões, do maior para o menor */
  noMapa: FatiaMundo[]
  /** "Outros países", "Brasil (sede)", cripto, ouro e o que não tem dado: fora do mapa */
  fora: FatiaMundo[]
  /** '71% do seu dinheiro está no Brasil, 9% na China e 4% na Ásia.' */
  frase: string
  /** 'Sabemos de onde vem a receita de 3 das suas 8 empresas; 12% do seu dinheiro segue sem dado.' — null = sabemos de todas */
  coberturaTxt: string | null
  cobertura: CoberturaReceita
  /** ainda falta a resposta de algum papel (a tela mostra o esqueleto) */
  pendente: boolean
}

/* ————— países ————— */

interface Pais {
  id: string
  nome: string
  em: string
  ancora: [number, number]
}

const p = (id: string, nome: string, em: string, lon: number, lat: number): Pais => ({ id, nome, em, ancora: [lon, lat] })

/**
 * O `country` do /tickers vem em inglês (o nome do Yahoo). A âncora é o
 * centro do território principal (EUA sem o Alasca, França sem a Guiana).
 */
const PAISES: Record<string, Pais> = {
  brazil: p('076', 'Brasil', 'no Brasil', -51, -12),
  'united states': p('840', 'Estados Unidos', 'nos Estados Unidos', -98.5, 39.5),
  taiwan: p('158', 'Taiwan', 'em Taiwan', 121, 23.7),
  china: p('156', 'China', 'na China', 104, 34),
  'hong kong': p('344', 'Hong Kong', 'em Hong Kong', 114.2, 22.3),
  netherlands: p('528', 'Países Baixos', 'nos Países Baixos', 5.3, 52.2),
  'united kingdom': p('826', 'Reino Unido', 'no Reino Unido', -2, 53),
  switzerland: p('756', 'Suíça', 'na Suíça', 8.2, 46.8),
  ireland: p('372', 'Irlanda', 'na Irlanda', -8, 53.2),
  canada: p('124', 'Canadá', 'no Canadá', -100, 56),
  germany: p('276', 'Alemanha', 'na Alemanha', 10.4, 51.1),
  france: p('250', 'França', 'na França', 2.4, 46.6),
  japan: p('392', 'Japão', 'no Japão', 138.5, 36.5),
  'south korea': p('410', 'Coreia do Sul', 'na Coreia do Sul', 127.8, 36.4),
  luxembourg: p('442', 'Luxemburgo', 'em Luxemburgo', 6.1, 49.8),
  bermuda: p('060', 'Bermudas', 'nas Bermudas', -64.8, 32.3),
  'cayman islands': p('136', 'Ilhas Cayman', 'nas Ilhas Cayman', -81.2, 19.3),
  israel: p('376', 'Israel', 'em Israel', 35, 31.4),
  uruguay: p('858', 'Uruguai', 'no Uruguai', -56, -32.8),
  argentina: p('032', 'Argentina', 'na Argentina', -64, -34),
  chile: p('152', 'Chile', 'no Chile', -71, -33.5),
  mexico: p('484', 'México', 'no México', -102, 23.6),
  colombia: p('170', 'Colômbia', 'na Colômbia', -74, 4.6),
  peru: p('604', 'Peru', 'no Peru', -75, -9.2),
  panama: p('591', 'Panamá', 'no Panamá', -80, 8.5),
  'puerto rico': p('630', 'Porto Rico', 'em Porto Rico', -66.5, 18.2),
  india: p('356', 'Índia', 'na Índia', 79, 22),
  australia: p('036', 'Austrália', 'na Austrália', 134, -25),
  'new zealand': p('554', 'Nova Zelândia', 'na Nova Zelândia', 172.5, -41.5),
  spain: p('724', 'Espanha', 'na Espanha', -3.7, 40.2),
  portugal: p('620', 'Portugal', 'em Portugal', -8.2, 39.6),
  italy: p('380', 'Itália', 'na Itália', 12.6, 42.8),
  belgium: p('056', 'Bélgica', 'na Bélgica', 4.5, 50.6),
  denmark: p('208', 'Dinamarca', 'na Dinamarca', 9.5, 56),
  sweden: p('752', 'Suécia', 'na Suécia', 16, 62),
  norway: p('578', 'Noruega', 'na Noruega', 9, 61),
  finland: p('246', 'Finlândia', 'na Finlândia', 26, 63),
  austria: p('040', 'Áustria', 'na Áustria', 14.5, 47.5),
  singapore: p('702', 'Singapura', 'em Singapura', 103.8, 1.35),
  jersey: p('832', 'Jersey', 'em Jersey', -2.1, 49.2),
  'south africa': p('710', 'África do Sul', 'na África do Sul', 25, -29),
  greece: p('300', 'Grécia', 'na Grécia', 22, 39),
  russia: p('643', 'Rússia', 'na Rússia', 60, 58),
  indonesia: p('360', 'Indonésia', 'na Indonésia', 113, -2),
  'saudi arabia': p('682', 'Arábia Saudita', 'na Arábia Saudita', 45, 24),
  'united arab emirates': p('784', 'Emirados Árabes', 'nos Emirados Árabes', 54, 24),
  turkey: p('792', 'Turquia', 'na Turquia', 35, 39),
  poland: p('616', 'Polônia', 'na Polônia', 19.4, 52),
  thailand: p('764', 'Tailândia', 'na Tailândia', 101, 15),
  philippines: p('608', 'Filipinas', 'nas Filipinas', 122, 12),
  malaysia: p('458', 'Malásia', 'na Malásia', 102, 4),
  kazakhstan: p('398', 'Cazaquistão', 'no Cazaquistão', 67, 48),
  // os que apareceram na receita do piloto (05/11/2026): Irani (RANI3), Klabin
  paraguay: p('600', 'Paraguai', 'no Paraguai', -58, -23.3),
  bolivia: p('068', 'Bolívia', 'na Bolívia', -64.6, -16.5),
  ecuador: p('218', 'Equador', 'no Equador', -78.4, -1.5),
  vietnam: p('704', 'Vietnã', 'no Vietnã', 106, 16),
  kuwait: p('414', 'Kuwait', 'no Kuwait', 47.7, 29.3),
  pakistan: p('586', 'Paquistão', 'no Paquistão', 69.3, 30),
}

const ALIAS: Record<string, string> = {
  usa: 'united states', 'united states of america': 'united states', us: 'united states',
  brasil: 'brazil', 'korea, republic of': 'south korea', korea: 'south korea',
  'the netherlands': 'netherlands', holland: 'netherlands', uk: 'united kingdom',
  'great britain': 'united kingdom', 'cayman is.': 'cayman islands', 'hong kong sar': 'hong kong',
  'russian federation': 'russia', türkiye: 'turkey', turkiye: 'turkey', uae: 'united arab emirates',
  'viet nam': 'vietnam',
}

function paisPorNome(nome: string | null): Pais | null {
  if (!nome) return null
  const k = nome.trim().toLowerCase()
  return PAISES[ALIAS[k] ?? k] ?? null
}

let porAlfa2: Map<string, Pais> | null = null
function paisPorAlfa2(iso2: string): Pais | null {
  if (!porAlfa2) {
    porAlfa2 = new Map()
    for (const ps of Object.values(PAISES)) { const a = alfa2De(ps.id); if (a) porAlfa2.set(a, ps) }
  }
  return porAlfa2.get(iso2.trim().toUpperCase()) ?? null
}

const BRASIL = PAISES.brazil!

/** 'no Brasil' → 'ao Brasil', 'na Europa' → 'à Europa', 'em Taiwan' → 'a Taiwan' */
export function exposto(em: string): string {
  const m = em.match(/^(no|na|nos|nas|em|pelo|pela)\s+(.*)$/)
  if (!m) return em
  const pre = { no: 'ao', na: 'à', nos: 'aos', nas: 'às', em: 'a', pelo: 'ao', pela: 'à' }[m[1] as 'no']
  return `${pre} ${m[2]}`
}

/* ————— regiões ————— */

interface Regiao { nome: string; em: string; paises: string[]; todos: boolean; ancora: [number, number] | null }

/** as regiões fixas da receita (item 1.7 do FRE); os membros vêm de utils/regioesDoMundo.ts */
const REGIOES_RECEITA: Record<string, Omit<Regiao, 'paises' | 'todos'>> = {
  america_do_norte: { nome: 'América do Norte', em: 'na América do Norte', ancora: [-100, 44] },
  america_latina: { nome: 'América Latina', em: 'na América Latina', ancora: [-72, 0] },
  europa: { nome: 'Europa', em: 'na Europa', ancora: [12, 50] },
  asia: { nome: 'Ásia', em: 'na Ásia', ancora: [105, 32] },
  oriente_medio: { nome: 'Oriente Médio', em: 'no Oriente Médio', ancora: [46, 27] },
  africa: { nome: 'África', em: 'na África', ancora: [20, 4] },
  oceania: { nome: 'Oceania', em: 'na Oceania', ancora: [134, -25] },
}

/**
 * As regiões do `profile.geography` dos ETFs (seed etf-seeds.ts do scraper).
 * Os membros são a composição de referência dos índices MSCI World e MSCI
 * Emerging Markets: só acendem o mapa, sem dividir o dinheiro entre eles.
 */
const DESENVOLVIDOS = ['840', '124', '826', '250', '276', '756', '528', '752', '208', '578', '246', '724', '380', '056', '372', '620', '040', '036', '554', '392', '344', '702', '376']
const EMERGENTES = ['156', '356', '158', '410', '076', '682', '710', '484', '360', '764', '458', '784', '634', '414', '616', '792', '608', '152', '300', '604', '348', '203', '170', '818']
const REGIOES_ETF: Record<string, Regiao> = {
  GLOBAL_DEVELOPED: { nome: 'Mundo desenvolvido', em: 'no mundo desenvolvido', paises: DESENVOLVIDOS, todos: false, ancora: null },
  EMERGING: { nome: 'Mercados emergentes', em: 'em mercados emergentes', paises: EMERGENTES, todos: false, ancora: null },
  GLOBAL: { nome: 'Mundo todo', em: 'pelo mundo todo', paises: [], todos: true, ancora: null },
}
/** geografia de ETF que é um país só */
const GEO_PAIS: Record<string, string> = { BR: 'brazil', USA: 'united states', US: 'united states', CHINA: 'china' }

/* ————— classes ————— */

/** Brasil sem perguntar: Tesouro e bancos brasileiros (Open Finance) */
const CLASSES_BRASIL = new Set([
  'TREASURY', 'FIXED_INCOME', 'SAVINGS', 'POUPANCA', 'CASH', 'ACCOUNT', 'CHECKING',
  'DEBENTURE', 'CDB', 'LCI', 'LCA', 'CRI', 'CRA',
])
/** pela receita das empresas (e dos fundos imobiliários) */
const CLASSES_RECEITA = new Set(['STOCK', 'REIT'])

/** Que chamada descobre o lugar desta posição; null = não precisa (ou não há). */
export function viaDaPosicao(classe: string | null): ViaMundo | null {
  const c = (classe ?? 'STOCK').toUpperCase()
  if (CLASSES_RECEITA.has(c)) return 'receita'
  if (c === 'BDR' || c === 'US_STOCK') return 'ticker'
  if (c === 'ETF' || c === 'US_ETF') return 'etf'
  return null
}

/**
 * Quais tickers buscar. A receita vai numa chamada só (todas as ações e FIIs);
 * BDR e ETF são uma chamada cada, do maior para o menor, no máximo `teto` (a
 * API não é martelada). O que passar do teto fica "Sem dado".
 */
export function tickersParaBuscar(posicoes: PosicaoMundo[], teto = 10): { receita: string[]; avulsos: { ticker: string; via: ViaMundo }[] } {
  const receita = new Set<string>()
  const porTicker = new Map<string, { ticker: string; via: ViaMundo; valor: number }>()
  for (const ps of posicoes) {
    const via = viaDaPosicao(ps.classe)
    if (!via || !(ps.valor > 0)) continue
    const t = ps.ticker.trim().toUpperCase()
    if (via === 'receita') { receita.add(t); continue }
    const e = porTicker.get(t)
    if (e) e.valor += ps.valor
    else porTicker.set(t, { ticker: t, via, valor: ps.valor })
  }
  return {
    receita: [...receita].sort(),
    avulsos: [...porTicker.values()]
      .sort((a, b) => b.valor - a.valor)
      .slice(0, Math.max(0, teto))
      .map(({ ticker, via }) => ({ ticker, via })),
  }
}

/* ————— o destino de cada posição ————— */

type Base = Omit<FatiaMundo, 'pct' | 'pctInt' | 'pctTxt' | 'valor' | 'tickers'>

const fatiaPais = (ps: Pais): Base => {
  const iso = alfa2De(ps.id) ?? ps.id
  return { chave: iso, tipo: 'pais', nome: ps.nome, a: exposto(ps.em), em: ps.em, paises: [ps.id], todos: false, ancora: ps.ancora }
}
const sem = { paises: [] as string[], todos: false, ancora: null }
const FORA: Record<'outros' | 'cripto' | 'ouro' | 'sede' | 'sem-dado' | 'rec-resto', Base> = {
  // a chave `outros` da receita: dinheiro fora do Brasil que a empresa não diz de onde
  outros: { chave: 'outros', tipo: 'outros', nome: 'Outros países', a: 'a outros países', em: 'em outros países', ...sem },
  cripto: { chave: 'cripto', tipo: 'cripto', nome: 'Cripto', a: 'a cripto', em: 'em cripto', ...sem },
  ouro: { chave: 'ouro', tipo: 'ouro', nome: 'Ouro', a: 'a ouro', em: 'em ouro', ...sem },
  sede: { chave: 'sede-br', tipo: 'sede', nome: 'Brasil (sede)', a: 'a empresas com sede no Brasil', em: 'em empresas com sede no Brasil', ...sem },
  'sem-dado': { chave: 'sem-dado', tipo: 'sem-dado', nome: 'Sem dado', a: 'a lugar desconhecido', em: 'em lugar desconhecido', ...sem },
  'rec-resto': { chave: 'rec-resto', tipo: 'sem-dado', nome: 'Receita não detalhada', a: 'a receita não detalhada', em: 'em receita não detalhada', ...sem },
}

/** A fatia do mapa de uma fatia de receita (país ISO-2 ou região fixa). */
function baseDaReceita(f: FatiaReceitaApi): Base | null {
  const chave = String(f.chave ?? '').trim()
  if (!chave) return null
  // "outros países", "Demais países", "Fora do Brasil": tudo vira uma linha só
  if (chave.toLowerCase() === 'outros') return FORA.outros
  const regiao = REGIOES_RECEITA[chave.toLowerCase()]
  if (regiao) {
    const k = chave.toLowerCase()
    return { chave: `reg:${k}`, tipo: 'regiao', nome: regiao.nome, a: exposto(regiao.em), em: regiao.em, paises: numericosDaRegiao(k), todos: false, ancora: regiao.ancora }
  }
  if (/^[A-Za-z]{2}$/.test(chave)) {
    const ps = paisPorAlfa2(chave)
    if (ps) return fatiaPais(ps)
    const num = numericoDe(chave)
    const nome = (f.nome ?? '').trim() || chave.toUpperCase()
    return { chave: chave.toUpperCase(), tipo: 'pais', nome, a: `a ${nome}`, em: `em ${nome}`, paises: num ? [num] : [], todos: false, ancora: null }
  }
  // região que o contrato não conhece: aparece com o nome que veio, sem pintar
  const nome = (f.nome ?? '').trim() || chave
  return { chave: `reg:${chave.toLowerCase()}`, tipo: 'regiao', nome, a: `a ${nome}`, em: `em ${nome}`, paises: [], todos: false, ancora: null }
}

/** Para onde vai o valor da posição: [fatia, fração 0–1][]; null = pendente. */
function destinosDe(ps: PosicaoMundo, fontes: Readonly<Record<string, FonteMundo | undefined>>): [Base, number][] | null {
  const c = (ps.classe ?? 'STOCK').toUpperCase()
  if (c === 'CRYPTO') return [[FORA.cripto, 1]]
  if (CLASSES_BRASIL.has(c)) return [[fatiaPais(BRASIL), 1]]
  const via = viaDaPosicao(c)
  if (!via) return [[FORA['sem-dado'], 1]]
  const t = ps.ticker.trim().toUpperCase()
  const f = fontes[t]
  if (f === undefined) return null

  if (via === 'receita') {
    if (!f || f.tipo !== 'receita') return [[FORA.sede, 1]]
    // o item 1.7 não se aplica porque a receita é toda daqui: 100% Brasil, sabido
    if (f.status === 'nao_aplicavel_100_brasil') return [[fatiaPais(BRASIL), 1]]
    // pct ≤ 0 (ou lixo) não entra
    const validas = (f.fatias ?? []).filter((x) => Number.isFinite(x.pct) && x.pct > 0)
    const soma = validas.reduce((s, x) => s + x.pct, 0)
    if (!(soma > 0)) return [[FORA.sede, 1]]
    // a soma das fatias manda: acima de 100 (eliminações, como os 101,7 da
    // Gerdau, ou arredondamento) vira 100; abaixo, o resto fica não detalhado
    const escala = soma > 100 ? 100 / soma : 1
    const out: [Base, number][] = []
    for (const x of validas) {
      const b = baseDaReceita(x)
      if (b) out.push([b, (x.pct * escala) / 100])
    }
    const resto = 1 - out.reduce((s, [, k]) => s + k, 0)
    if (resto > 0.0005) out.push([FORA['rec-resto'], resto])
    return out
  }

  if (!f) return [[FORA['sem-dado'], 1]]
  if (f.tipo === 'pais') {
    if (!f.pais || !f.pais.trim()) return [[FORA['sem-dado'], 1]]
    const pais = paisPorNome(f.pais)
    if (pais) return [[fatiaPais(pais), 1]]
    const nome = f.pais.trim()
    return [[{ chave: `x:${nome.toLowerCase()}`, tipo: 'pais', nome, a: `a ${nome}`, em: `em ${nome}`, paises: [], todos: false, ancora: null }, 1]]
  }
  if (f.tipo === 'etf') {
    // a classe do perfil manda antes da geografia (HASH11 é cripto "GLOBAL")
    const ce = (f.classe ?? '').toLowerCase()
    if (ce === 'crypto') return [[FORA.cripto, 1]]
    if (ce === 'commodity') return [[FORA.ouro, 1]]
    const g = (f.geografia ?? '').trim().toUpperCase()
    const gp = GEO_PAIS[g]
    if (gp) return [[fatiaPais(PAISES[gp]!), 1]]
    const r = REGIOES_ETF[g]
    if (r) return [[{ chave: `etf:${g}`, tipo: 'regiao', nome: r.nome, a: exposto(r.em), em: r.em, paises: r.paises, todos: r.todos, ancora: null }, 1]]
  }
  return [[FORA['sem-dado'], 1]]
}

/* ————— a conta ————— */

/** Arredonda para inteiros que somam 100 (maior resto), sem tirar ninguém da lista. */
function inteirosQueSomam100(pcts: number[]): number[] {
  const base = pcts.map((x) => Math.floor(x))
  let falta = 100 - base.reduce((s, x) => s + x, 0)
  const ordem = pcts.map((x, i) => [x - Math.floor(x), i] as const).sort((a, b) => b[0] - a[0])
  for (const [, i] of ordem) {
    if (falta <= 0) break
    base[i]!++
    falta--
  }
  return base
}

function pctTexto(pctInt: number, pct: number): string {
  if (pctInt === 0 && pct > 0) return 'menos de 1%'
  return `${pctInt}%`
}

/** fora do mapa: primeiro o dinheiro que tem lugar só sem nome (outros países), por último o sem dado */
const ORDEM_FORA: Record<string, number> = { outros: 0, sede: 1, cripto: 2, ouro: 3, 'sem-dado': 4 }

/** Como a posição aparece na lista: o título do Tesouro pelo nome ('Tesouro IPCA+ 2035'), não pelo ISIN. */
function rotuloDe(ps: PosicaoMundo, classe: string): string {
  const nome = (ps.nome ?? '').trim()
  return CLASSES_BRASIL.has(classe) && nome ? nome : ps.ticker
}

export function exposicaoNoMundo(
  posicoes: PosicaoMundo[],
  fontes: Readonly<Record<string, FonteMundo | undefined>> = {},
): ExposicaoNoMundo {
  const fatias = new Map<string, Omit<FatiaMundo, 'pct' | 'pctInt' | 'pctTxt'>>()
  let pendente = false
  let total = 0
  const comReceita = new Set<string>()
  const acoes = new Set<string>()
  const fiis = new Set<string>()

  for (const ps of posicoes) {
    if (!(ps.valor > 0)) continue
    total += ps.valor
    const c = (ps.classe ?? 'STOCK').toUpperCase()
    const t = ps.ticker.trim().toUpperCase()
    if (c === 'STOCK') acoes.add(t)
    if (c === 'REIT') fiis.add(t)
    const destinos = destinosDe(ps, fontes)
    if (!destinos) { pendente = true; continue }
    if (CLASSES_RECEITA.has(c) && destinos.some(([b]) => b.tipo !== 'sede')) comReceita.add(t)
    const rotulo = rotuloDe(ps, c)
    for (const [b, k] of destinos) {
      const v = ps.valor * k
      const f = fatias.get(b.chave)
      if (f) {
        f.valor += v
        if (!f.tickers.includes(rotulo)) f.tickers.push(rotulo)
      } else {
        fatias.set(b.chave, { ...b, valor: v, tickers: [rotulo] })
      }
    }
  }

  const lista = [...fatias.values()].sort((a, b) => b.valor - a.valor)
  const pcts = lista.map((f) => (total > 0 ? (f.valor / total) * 100 : 0))
  // com mais de uma fatia, ninguém mostra 100% (99,6% vira 99%, e a outra "menos de 1%")
  const ints = (lista.length ? inteirosQueSomam100(pcts) : []).map((x) => (lista.length > 1 ? Math.min(x, 99) : x))
  const todas: FatiaMundo[] = lista.map((f, i) => ({ ...f, pct: pcts[i]!, pctInt: ints[i]!, pctTxt: pctTexto(ints[i]!, pcts[i]!) }))

  const noMapa = todas.filter(noMapaDe)
  const fora = todas
    .filter((f) => !noMapaDe(f))
    .sort((a, b) => ORDEM_FORA[a.tipo]! - ORDEM_FORA[b.tipo]! || b.valor - a.valor)

  const nTotal = acoes.size + fiis.size
  const cobertura: CoberturaReceita = {
    comDado: comReceita.size,
    total: nTotal,
    quem: !fiis.size ? 'empresas' : !acoes.size ? 'fundos imobiliários' : 'empresas e fundos',
  }

  return {
    total,
    noMapa,
    fora,
    frase: pendente ? '' : fraseDoMundo(todas),
    coberturaTxt: !pendente && cobertura.total > 0 && cobertura.comDado < cobertura.total
      // a sede que já abre a frase de cima não se repete aqui
      ? fraseDaCobertura(cobertura, todas[0]?.tipo === 'sede' ? null : todas.find((f) => f.tipo === 'sede') ?? null)
      : null,
    cobertura,
    pendente,
  }
}

const noMapaDe = (f: { tipo: TipoFatia }) => f.tipo === 'pais' || f.tipo === 'regiao'

/**
 * A frase de cima: uma frase só, curta, com os três maiores lugares
 * conhecidos ("71% do seu dinheiro está no Brasil, 9% na China e 4% na
 * Ásia."). Descreve, não recomenda (CVM). Ficam de fora:
 *  - "Brasil (sede)" e "Sem dado", que vão na linha de baixo
 *    (fraseDaCobertura), a menos que sejam o maior pedaço: aí a frase abre
 *    com eles, ditos como são (senão abriria com um Brasil pequeno e
 *    esconderia o maior pedaço);
 *  - "Outros países" e "Receita não detalhada": estão na lista, sem lugar
 *    para dizer.
 */
export function fraseDoMundo(todas: FatiaMundo[]): string {
  const ditas = todas.filter((f) => noMapaDe(f) || f.tipo === 'cripto' || f.tipo === 'ouro')
  const so = todas.length === 1 ? todas[0]! : null
  if (so && so.tipo === 'cripto') return 'Todo o seu dinheiro está em cripto, que não tem país.'
  if (so && so.tipo === 'sede') return 'Todo o seu dinheiro está em empresas com sede no Brasil, ainda sem dado de receita.'
  if (so && so.tipo !== 'sem-dado') return `Todo o seu dinheiro está ${so.em}.`
  if (so) return 'Ainda não temos o país dos seus investimentos.'

  const maior = todas[0]
  const abre = maior && maior.chave === 'sede-br'
    ? `${maiuscula(maior.pctTxt)} do seu dinheiro está em empresas com sede no Brasil, ainda sem dado de receita.`
    : maior && maior.chave === 'sem-dado'
      ? `${maiuscula(maior.pctTxt)} do seu dinheiro está em investimentos que ainda não sabemos onde estão.`
      : null

  const tres = ditas.slice(0, 3)
  if (!tres.length) return abre ?? (todas.length ? 'Ainda não temos o país dos seus investimentos.' : '')
  const itens = tres.map((f) => `${f.pctTxt} ${f.em}`)
  const juntos = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}` : xs[0]!)
  if (!abre) return `${juntos([`${maiuscula(tres[0]!.pctTxt)} do seu dinheiro está ${tres[0]!.em}`, ...itens.slice(1)])}.`
  // depois da sede: "Outros 18% estão no Brasil e 10% na América do Norte."
  const [p, ...resto] = tres
  const cabeca = p!.pctInt === 0 ? `Menos de 1% está ${p!.em}` : p!.pctInt === 1 ? `Outro 1% está ${p!.em}` : `Outros ${p!.pctTxt} estão ${p!.em}`
  return `${abre} ${juntos([cabeca, ...resto.map((f) => `${f.pctTxt} ${f.em}`)])}.`
}

/**
 * 'Sabemos de onde vem a receita de 9 das suas 15 empresas e fundos; 12% do
 * seu dinheiro segue sem dado.' O "sem dado" mora aqui, não na abertura.
 */
export function fraseDaCobertura(cob: CoberturaReceita, sede: Pick<FatiaMundo, 'pct' | 'pctInt'> | null = null): string {
  const { comDado: k, total: n, quem } = cob
  const fem = quem === 'empresas'
  const umaSo = quem === 'empresas' ? 'empresa' : quem === 'fundos imobiliários' ? 'fundo imobiliário' : 'empresa ou fundo'
  if (n === 1) return `Ainda não sabemos de onde vem a receita ${fem || quem === 'empresas e fundos' ? 'da sua' : 'do seu'} ${umaSo}.`
  const das = fem || quem === 'empresas e fundos' ? 'das suas' : 'dos seus'
  if (k === 0) return `Ainda não sabemos de onde vem a receita ${das} ${n} ${quem}.`
  const semDado = sede && sede.pct > 0 ? `; ${pctTexto(sede.pctInt, sede.pct)} do seu dinheiro segue sem dado` : ''
  return `Sabemos de onde vem a receita de ${k} ${das} ${n} ${quem}${semDado}.`
}

const maiuscula = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s)
