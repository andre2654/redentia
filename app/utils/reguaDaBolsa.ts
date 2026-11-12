/**
 * A régua do mercado, "a bolsa inteira numa linha" (12/11/2026). O dono olhou a
 * régua de cotações ("● Abre às 10h | IBOV … | Dólar … | IFIX … | B3 · atraso
 * de 15 min") e pediu "algo mais útil", e depois "mais criativo ainda". Saiu a
 * opção 1 do esboço: no meio da régua, UMA barra com as ações do Ibovespa lado
 * a lado, da que mais caiu à que mais subiu; a largura de cada pedaço é o peso
 * dela no índice e a cor é quanto ela andou. À direita, o número que a barra
 * mostra: a fatia do índice que subiu ("71% do índice subiu na sexta").
 *
 * O AVISO DE ATRASO (12/11/2026, o dono): o "B3 · 15 min" saiu da linha, e a
 * barra ganhou a largura. As regras de uso dos dados da B3 pedem que cotação
 * atrasada diga que é atrasada, e o aviso segue em dois lugares: no pé da dica
 * de cada pedaço e no fim do que o leitor de tela ouve (momentoDoDado, em
 * utils/topo.ts). Com a bolsa
 * aberta e o dado de hoje, "Cotações da B3 com 15 min de atraso."; com o dado de
 * um fechamento, a data dele ("Fechamento de sexta, 06/11."), sem atraso.
 *
 * O PALCO (12/11/2026, o dono: "vá trocando para algumas barras, tipo 1 minuto
 * cada"): a régua troca de cena a cada ~60 s, uma por vez, e a barra é a cena
 * principal. Antes das 10h de um dia de pregão: a contagem para a abertura e a
 * barra do último pregão. Aberta: só a barra, ao vivo. Depois do fechamento: a
 * frase do fechamento e a barra de hoje. Fim de semana e feriado: a barra do
 * último pregão e a contagem para a próxima abertura (cenasDaRegua,
 * contagemDaRegua, fechamentoDaRegua; a janela até a abertura sai do calendário
 * da B3, utils/pregao.ts: janelaDaAbertura).
 *
 * Tudo puro (sem Nuxt), para o teste travar com dado real
 * (tests/regua-da-bolsa.test.ts):
 *  - pedacosDaRegua: os pedaços ordenados, com onde começam, a largura, o lado,
 *    a força da cor, o fundo (em token: color-mix dos --nu-mapa-*), a tinta do
 *    ticker e a dica de cada um;
 *  - fatiaQueSubiu e legendaDaRegua: o número da direita, nos três tamanhos, e
 *    o resumo que o leitor de tela ouve no lugar da barra;
 *  - legendaDaCarteira: o "Sua carteira +0,11% · tudo normal" de quem assina.
 *
 * A cor: a paleta divergente mora em app/assets/css/tokens.css (--nu-mapa-*),
 * validada com o validador do skill de dataviz (cada braço como rampa de um tom
 * só, sobre o creme da página). Aqui só a conta: a força é a raiz de |pct|/5
 * (o teto é 5%: dali para cima a cor é a mais forte), a raiz para o dia comum
 * (quase tudo anda menos de 2%) não sair todo pálido; abaixo de 0,05% (o
 * "0,0%" da dica) o pedaço é a areia do zero. O fundo é a mistura em oklab do
 * forte com o claro do braço, na proporção da força.
 * Regra de sempre: dado que falta some, nunca vira zero nem frase inventada.
 */
/** O estado do pregão (o mesmo de utils/pregao.ts; aqui sem import, para o util não depender do relógio). */
type EstadoDoPregao = 'aberta' | 'fechada' | 'antes' | 'sem-pregao'

/** De quando é o dado: utils/topo.ts (momentoDoDado) monta, com o relógio da B3. */
export interface MomentoDoDado {
  /** a bolsa aberta e o dado de hoje */
  aoVivo: boolean
  /** 'hoje', 'ontem', 'na sexta', 'em 28/10'; null sem data */
  quando: string | null
  /** o aviso de atraso da B3 ou a data do fechamento, para o pé da dica e o fim do resumo */
  nota: string
}

/** Em 5% (para cima ou para baixo) a cor satura: é o teto da escala. */
export const TETO_DA_COR = 5
/** Abaixo disso o pedaço é a areia do zero: a dica escreve "0,0%". */
export const ZERO_DA_COR = 0.05
/** O pedaço que leva o ticker dentro: uns 62px (o CSS confere a largura real). */
export const LARGURA_DO_ROTULO = 62
/** A barra mais larga que a régua desenha: a coluna toda (1240), depois que os textos dos lados somem. */
export const BARRA_MAIS_LARGA = 1240
/**
 * A partir desta força o ticker em branco lê melhor que o carvão. Sai da paleta
 * do tokens.css (o contraste WCAG das duas tintas sobre a mistura); o teste
 * refaz a conta com os hex do arquivo e falha se a paleta mudar sem o limiar.
 */
export const TINTA_CLARA_DESDE = { alta: 0.75, queda: 0.63 } as const

export interface AcaoDoIndice { ticker: string; empresa: string; pct: number; peso: number; pontos: number }

export type LadoDoPedaco = 'queda' | 'zero' | 'alta'

export interface DicaDaRegua {
  /** 'Vale · VALE3' */
  titulo: string
  /** '+2,2%' */
  pct: string
  tom: 'up' | 'down' | 'flat'
  /** '9,9% do Ibovespa · somou 360 pontos' */
  linha: string
  /** a mesma dica para o leitor de tela (aria-live) */
  falada: string
}

export interface PedacoDaRegua extends AcaoDoIndice {
  /** onde começa e quanto ocupa, em % da barra */
  inicio: number
  largura: number
  lado: LadoDoPedaco
  /** 0 a 1: quanto da cor forte do braço (0 no zero) */
  forca: number
  /** o fundo, em token: 'var(--nu-mapa-zero)' ou o color-mix do braço */
  fundo: string
  tinta: 'escura' | 'clara'
  /** cabe o ticker dentro na barra mais larga (o CSS esconde se a real for menor) */
  rotulo: boolean
  dica: DicaDaRegua
}

const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** '+2,2%' / '−1,3%' / '0,0%' (uma casa, o "−" de verdade). */
export function pct1(v: number): string {
  if (Math.abs(v) < ZERO_DA_COR) return '0,0%'
  return `${v > 0 ? '+' : '−'}${nf1.format(Math.abs(v))}%`
}

/** '9,9%' do índice; o papel pequeno não vira '0,0%'. */
function pesoNoIndice(peso: number): string {
  return peso < 0.05 ? 'menos de 0,1%' : `${nf1.format(peso)}%`
}

/**
 * O que o papel fez com o índice, em pontos truncados (como a home escreve a
 * causa: "quem mais somou: Vale, +360"). Ao vivo, no presente.
 */
export function pontosDoPapel(pontos: number, aoVivo: boolean): string {
  const n = Math.trunc(pontos)
  const somou = aoVivo ? 'soma' : 'somou'
  const tirou = aoVivo ? 'tira' : 'tirou'
  if (n === 0) {
    if (pontos === 0) return aoVivo ? 'não mexe no índice' : 'não mexeu no índice'
    return `${pontos > 0 ? somou : tirou} menos de 1 ponto`
  }
  const abs = Math.abs(n)
  return `${n > 0 ? somou : tirou} ${nf0.format(abs)} ${abs === 1 ? 'ponto' : 'pontos'}`
}

/** A força da cor: a raiz de |pct|/5, com o teto em 5%; 0 no zero. */
export function forcaDaCor(pct: number): number {
  const a = Math.abs(pct)
  if (!Number.isFinite(a) || a < ZERO_DA_COR) return 0
  return Math.sqrt(Math.min(a, TETO_DA_COR) / TETO_DA_COR)
}

export function ladoDe(pct: number): LadoDoPedaco {
  if (!Number.isFinite(pct) || Math.abs(pct) < ZERO_DA_COR) return 'zero'
  return pct > 0 ? 'alta' : 'queda'
}

/** O fundo do pedaço em token: a areia no zero; no braço, o forte misturado ao claro na proporção da força. */
export function fundoDoPedaco(lado: LadoDoPedaco, forca: number): string {
  if (lado === 'zero') return 'var(--nu-mapa-zero)'
  const p = Math.round(forca * 1000) / 10
  return `color-mix(in oklab, var(--nu-mapa-${lado}) ${p}%, var(--nu-mapa-${lado}-claro))`
}

export function tintaDoPedaco(lado: LadoDoPedaco, forca: number): 'escura' | 'clara' {
  if (lado === 'zero') return 'escura'
  return forca >= TINTA_CLARA_DESDE[lado] ? 'clara' : 'escura'
}

export function dicaDoPedaco(a: AcaoDoIndice, aoVivo: boolean): DicaDaRegua {
  const pct = pct1(a.pct)
  const tom = Math.abs(a.pct) < ZERO_DA_COR ? 'flat' : a.pct > 0 ? 'up' : 'down'
  const linha = `${pesoNoIndice(a.peso)} do Ibovespa · ${pontosDoPapel(a.pontos, aoVivo)}`
  const titulo = a.empresa && a.empresa !== a.ticker ? `${a.empresa} · ${a.ticker}` : a.ticker
  const falado = pct.replace('+', 'mais ').replace('−', 'menos ')
  return { titulo, pct, tom, linha, falada: `${titulo.replace(' · ', ', ')}, ${falado}. ${linha.replace(' · ', '; ')}.` }
}

/**
 * Os pedaços da barra, da que mais caiu à que mais subiu (empate: o de mais
 * peso antes, depois o ticker, para a ordem não tremer). A largura é o peso
 * sobre a soma dos pesos (que o dado já fecha em 100); papel sem peso ou sem
 * variação fica de fora. Sem ação, lista vazia.
 */
export function pedacosDaRegua(acoes: AcaoDoIndice[] | null | undefined, opts: { aoVivo?: boolean; larguraMaxima?: number } = {}): PedacoDaRegua[] {
  const vistos = new Set<string>()
  const validas = (acoes ?? []).filter((a) => {
    if (!a || !a.ticker || !Number.isFinite(a.pct) || !Number.isFinite(a.peso) || a.peso <= 0 || vistos.has(a.ticker)) return false
    vistos.add(a.ticker)
    return true
  })
  const soma = validas.reduce((s, a) => s + a.peso, 0)
  if (!validas.length || soma <= 0) return []
  const ordem = [...validas].sort((a, b) => a.pct - b.pct || b.peso - a.peso || a.ticker.localeCompare(b.ticker))
  const larguraMaxima = opts.larguraMaxima ?? BARRA_MAIS_LARGA
  let inicio = 0
  return ordem.map((a) => {
    const largura = (a.peso / soma) * 100
    const lado = ladoDe(a.pct)
    const forca = forcaDaCor(a.pct)
    const p: PedacoDaRegua = {
      ticker: a.ticker,
      empresa: a.empresa,
      pct: a.pct,
      peso: a.peso,
      pontos: Number.isFinite(a.pontos) ? a.pontos : 0,
      inicio,
      largura,
      lado,
      forca,
      fundo: fundoDoPedaco(lado, forca),
      tinta: tintaDoPedaco(lado, forca),
      rotulo: (largura / 100) * larguraMaxima >= LARGURA_DO_ROTULO,
      dica: dicaDoPedaco(a, !!opts.aoVivo),
    }
    inicio += largura
    return p
  })
}

/** O pedaço sob uma posição da barra (0 a 100, da esquerda): o ponteiro e o toque. */
export function pedacoNaPosicao(pedacos: PedacoDaRegua[], x: number): number {
  if (!pedacos.length) return -1
  let lo = 0
  let hi = pedacos.length - 1
  while (lo < hi) {
    const meio = (lo + hi + 1) >> 1
    if (pedacos[meio]!.inicio <= x) lo = meio
    else hi = meio - 1
  }
  return lo
}

/** A fatia do índice que subiu, em % do peso: o verde da barra (a areia do zero não conta). */
export function fatiaQueSubiu(pedacos: Pick<PedacoDaRegua, 'lado' | 'largura'>[]): number {
  return pedacos.reduce((s, p) => s + (p.lado === 'alta' ? p.largura : 0), 0)
}

/** 71,3 → 71; entre 0 e 1 vira 1 e entre 99 e 100 vira 99 (a parte que não subiu não some no arredondamento). */
export function fatiaArredondada(f: number): number {
  const r = Math.round(f)
  if (f > 0 && r === 0) return 1
  if (f < 100 && r === 100) return 99
  return Math.max(0, Math.min(100, r))
}

export interface LegendaDaRegua {
  /** '71%' (vai em negrito) */
  numero: string
  /** 'do índice subiu na sexta' / 'do índice sobe agora' */
  longo: string
  /** 'subiu na sexta' / 'sobe agora' */
  medio: string
  /** 'subiu' / 'sobe' */
  curto: string
  aoVivo: boolean
  /** o que o leitor de tela ouve no lugar da barra (sem a nota, que vem no fim: rotuloDaBarra) */
  resumo: string
  /** de quando é o dado: o aviso de atraso da B3 ou a data do fechamento (momentoDoDado) */
  nota: string
}

/** 'Cosan +10,8%, C&A Modas +9,0% e CSN +8,9%' */
function lista(itens: PedacoDaRegua[]): string {
  const t = itens.map((p) => `${p.empresa || p.ticker} ${pct1(p.pct)}`)
  return t.length <= 1 ? (t[0] ?? '') : `${t.slice(0, -1).join(', ')} e ${t[t.length - 1]}`
}

/**
 * O número da direita, nos três tamanhos, e o resumo da barra. O momento
 * (ao vivo? de quando? a nota) vem do momentoDoDado de utils/topo.ts, com o dia
 * do pregão do dado (ibov.data) e o relógio da B3. Sem pedaço, null.
 */
export function legendaDaRegua(pedacos: PedacoDaRegua[], momento: MomentoDoDado): LegendaDaRegua | null {
  if (!pedacos.length) return null
  const { aoVivo, quando } = momento
  const fatia = fatiaArredondada(fatiaQueSubiu(pedacos))
  const numero = `${fatia}%`
  const verbo = aoVivo ? 'sobe' : 'subiu'
  const tempo = aoVivo ? 'agora' : quando
  const medio = tempo ? `${verbo} ${tempo}` : verbo
  const subiram = pedacos.filter((p) => p.lado === 'alta').slice(-3).reverse()
  const cairam = pedacos.filter((p) => p.lado === 'queda').slice(0, 3)
  const partes = [`${numero} do Ibovespa ${medio}.`]
  const mais: string[] = []
  if (subiram.length) mais.push(`Mais ${aoVivo ? 'sobem' : 'subiram'}: ${lista(subiram)}`)
  if (cairam.length) mais.push(`${mais.length ? 'mais' : 'Mais'} ${aoVivo ? 'caem' : 'caíram'}: ${lista(cairam)}`)
  if (mais.length) partes.push(`${mais.join('; ')}.`)
  return { numero, longo: `do índice ${medio}`, medio, curto: verbo, aoVivo, resumo: partes.join(' '), nota: momento.nota }
}

/**
 * O aria-label da barra: o resumo, quantas a pessoa tem (só no cliente, para
 * quem assina) e, no fim, a nota do dado (o aviso de atraso da B3).
 */
export function rotuloDaBarra(l: Pick<LegendaDaRegua, 'resumo' | 'nota'>, daCarteira = 0): string {
  const suas = daCarteira > 0 ? `Você tem ${daCarteira === 1 ? 'uma delas' : `${daCarteira} delas`}.` : ''
  return [l.resumo, suas, l.nota].filter(Boolean).join(' ')
}

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export interface LegendaDaCarteira {
  /** '+0,11%' */
  numero: string
  /** 'tudo normal' / 'pede atenção' / null no dia de movimento forte (como o selo da home) */
  estado: string | null
  atencao: boolean
  /** o resumo para o leitor de tela */
  falada: string
}

/**
 * "Sua carteira +0,11% · tudo normal": o dia da carteira e o selo da home
 * (seloDoDia, utils/diaDaCarteira.ts), na mesma regra. Sem o número, null.
 */
export function legendaDaCarteira(pct: number | null | undefined, selo: { texto: string; tom: 'verde' | 'ambar' } | null): LegendaDaCarteira | null {
  if (pct == null || !Number.isFinite(pct)) return null
  const numero = Math.abs(pct) < 0.005 ? '0,00%' : `${pct > 0 ? '+' : '−'}${nf2.format(Math.abs(pct))}%`
  const estado = selo ? selo.texto.charAt(0).toLowerCase() + selo.texto.slice(1) : null
  const falado = numero.replace('+', 'mais ').replace('−', 'menos ')
  return { numero, estado, atencao: selo?.tom === 'ambar', falada: `Sua carteira, ${falado}${estado ? `, ${estado}` : ''}.` }
}

/** A etiqueta curta do estado no celular: "10h", "Aberta", "Fechada", "Feriado". */
export function estadoCurto(estado: EstadoDoPregao, feriado: boolean): string {
  if (estado === 'antes') return '10h'
  if (estado === 'aberta') return 'Aberta'
  if (estado === 'sem-pregao' && feriado) return 'Feriado'
  return 'Fechada'
}

/* ————— o palco: as cenas, a contagem e o fechamento ————— */

export type CenaDaRegua = 'contagem' | 'fechamento' | 'barra'
/** cada cena fica ~1 minuto; na barra, os textos dos lados ficam 15 s e somem para ela tomar a largura */
export const DURACAO_DA_CENA = 60_000
export const TEXTOS_DA_BARRA = 15_000

/**
 * As cenas de cada momento, na ordem em que entram. A contagem só existe com a
 * próxima abertura conhecida (o calendário da B3); o fechamento, só com o dado
 * de hoje (a frase não fala de outro dia como se fosse o de hoje).
 */
export function cenasDaRegua(estado: EstadoDoPregao, tem: { contagem: boolean; fechamento: boolean }): CenaDaRegua[] {
  if (estado === 'aberta') return ['barra']
  if (estado === 'antes') return tem.contagem ? ['contagem', 'barra'] : ['barra']
  if (estado === 'fechada') return tem.fechamento ? ['fechamento', 'barra'] : ['barra']
  return tem.contagem ? ['barra', 'contagem'] : ['barra']
}

export interface ContagemDaRegua {
  /** 'A bolsa abre em 1h12min' / 'A bolsa abre em 4min32s' / 'A bolsa abre na segunda, às 10h' */
  longo: string
  /** o celular: 'Abre em 1h12' / 'Abre em 4m32s' / 'Abre segunda, 10h' */
  curto: string
  /** nos últimos 10 minutos o texto anda de segundo em segundo */
  segundos: boolean
  /** 0 a 1: do último fechamento até a abertura (a linha que enche); null sem o fechamento */
  progresso: number | null
  /** a hora da abertura, à direita da linha */
  hora: string
}

const DIAS_DA_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const
const dois = (n: number) => String(n).padStart(2, '0')
const diasEntre = (de: string, ate: string) => Math.round((Date.parse(`${ate.slice(0, 10)}T12:00:00Z`) - Date.parse(`${de.slice(0, 10)}T12:00:00Z`)) / 86_400_000)

/**
 * Quanto falta para abrir. No dia: de minuto em minuto ("em 1h12min", arredondado
 * para cima: às 8h48 faltam 72 minutos) e, nos últimos 10 minutos, de segundo em
 * segundo ("em 4min32s"). Noutro dia: o dia ("amanhã", "na segunda", "em 05/01").
 * `hoje` é o dia em São Paulo; os instantes, em ms (janelaDaAbertura).
 */
export function contagemDaRegua(j: { dia: string; abreEm: number; fechouEm: number | null }, agoraMs: number, hoje: string): ContagemDaRegua {
  const hora = '10h00'
  const total = j.fechouEm != null ? j.abreEm - j.fechouEm : 0
  const progresso = total > 0 ? Math.max(0, Math.min(1, (agoraMs - j.fechouEm!) / total)) : null
  const falta = j.abreEm - agoraMs
  if (j.dia.slice(0, 10) === hoje.slice(0, 10)) {
    if (falta <= 0) return { longo: 'A bolsa abre agora', curto: 'Abre agora', segundos: false, progresso: progresso == null ? null : 1, hora }
    if (falta < 10 * 60_000) {
      const s = Math.floor(falta / 1000)
      const m = Math.floor(s / 60)
      const longo = m ? `${m}min${dois(s % 60)}s` : `${s % 60}s`
      const curto = m ? `${m}m${dois(s % 60)}s` : `${s % 60}s`
      return { longo: `A bolsa abre em ${longo}`, curto: `Abre em ${curto}`, segundos: true, progresso, hora }
    }
    const min = Math.ceil(falta / 60_000)
    const h = Math.floor(min / 60)
    const mm = min % 60
    return {
      longo: `A bolsa abre em ${h ? `${h}h${dois(mm)}min` : `${mm}min`}`,
      curto: `Abre em ${h ? `${h}h${dois(mm)}` : `${mm}min`}`,
      segundos: false, progresso, hora,
    }
  }
  const dias = diasEntre(hoje, j.dia)
  const semana = new Date(`${j.dia.slice(0, 10)}T12:00:00Z`).getUTCDay()
  const nome = DIAS_DA_SEMANA[semana]!
  const data = `${j.dia.slice(8, 10)}/${j.dia.slice(5, 7)}`
  const quando = dias === 1 ? 'amanhã' : dias < 7 ? `${semana === 0 || semana === 6 ? 'no' : 'na'} ${nome}` : `em ${data}`
  const quandoCurto = dias === 1 ? 'amanhã' : dias < 7 ? nome : `em ${data}`
  return { longo: `A bolsa abre ${quando}, às 10h`, curto: `Abre ${quandoCurto}, 10h`, segundos: false, progresso, hora }
}

export interface FechamentoDaRegua {
  /** 'A bolsa fechou: Ibovespa' */
  antes: string
  /** '+1,39%' (vai na cor do sentido) */
  pct: string
  tom: 'up' | 'down' | 'flat'
  /** ' · 59 de 76 subiram' */
  conta: string
  /** ' · o melhor dia do mês' / ' · a 3ª alta seguida' (só quando há) */
  fato: string
  /** o celular: 'Fechou' */
  curto: string
}

/** O que a frase do fechamento lê da bolsa do dia (BolsaDoDia, utils/bolsaDoDia.ts). */
export interface DadoDoFechamento {
  ibov: { pct: number; data: string } | null
  contagem?: { altas: number; quedas: number; total: number } | null
  seguidas?: { n: number; sentido: 'queda' | 'alta'; ate: string } | null
  mes?: { confiavel: boolean } | null
  diarias?: { d: string; v: number }[] | null
  acoes?: { pct: number }[] | null
}

const nf2f = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * A frase do fechamento, só com fatos do dado e só com o fechamento de hoje:
 * "A bolsa fechou: Ibovespa +1,39% · 59 de 76 subiram", mais um fato quando
 * houver: a sequência (3 ou mais, como o título da home) ou o melhor/pior dia do
 * mês (pela série diária, com o mês confiável e ao menos 3 pregões nele).
 */
export function fechamentoDaRegua(b: DadoDoFechamento, hoje: string): FechamentoDaRegua | null {
  const ib = b.ibov
  if (!ib || !Number.isFinite(ib.pct) || ib.data?.slice(0, 10) !== hoje.slice(0, 10)) return null
  const dia = ib.data.slice(0, 10)
  const pct = Math.abs(ib.pct) < 0.005 ? '0,00%' : `${ib.pct > 0 ? '+' : '−'}${nf2f.format(Math.abs(ib.pct))}%`
  const tom = Math.abs(ib.pct) < 0.005 ? 'flat' : ib.pct > 0 ? 'up' : 'down'
  // quantas subiram: a contagem do /market/today; sem ela, as próprias ações do índice
  let conta = ''
  const c = b.contagem
  const altas = c?.total ? c.altas : (b.acoes?.length ? b.acoes.filter((a) => a.pct > 0).length : null)
  const total = c?.total ? c.total : (b.acoes?.length ?? 0)
  if (altas != null && total > 0) conta = ` · ${altas} de ${total} ${altas === 1 ? 'subiu' : 'subiram'}`
  // um fato a mais, quando há
  let fato = ''
  const seg = b.seguidas
  if (seg && seg.n >= 3 && seg.ate?.slice(0, 10) === dia) fato = ` · a ${seg.n}ª ${seg.sentido} seguida`
  else if (b.mes?.confiavel !== false && (b.diarias?.length ?? 0) >= 2) {
    const s = b.diarias!
    const doMes = s.slice(1).map((p, i) => ({ d: p.d.slice(0, 10), chg: (p.v / s[i]!.v - 1) * 100 })).filter((x) => x.d.slice(0, 7) === dia.slice(0, 7))
    const hojeNaSerie = doMes.find((x) => x.d === dia)
    if (hojeNaSerie && doMes.length >= 3) {
      const outros = doMes.filter((x) => x.d !== dia)
      if (hojeNaSerie.chg > 0 && outros.every((x) => hojeNaSerie.chg > x.chg)) fato = ' · o melhor dia do mês'
      else if (hojeNaSerie.chg < 0 && outros.every((x) => hojeNaSerie.chg < x.chg)) fato = ' · o pior dia do mês'
    }
  }
  return { antes: 'A bolsa fechou: Ibovespa', pct, tom, conta, fato, curto: 'Fechou' }
}
