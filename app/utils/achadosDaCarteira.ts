/**
 * O que a Redentia AI encontrou na carteira (05/11/2026; o dono: "precisamos
 * encontrar algum lugar para apresentar isso, talvez logo abaixo do hero,
 * passando a ideia de que foi o agente da Redentia que encontrou esses
 * pontos"). O botão "Ideias" do topo (CarteiraIdeias) abre o modal que
 * mostra; a conta mora aqui.
 *
 * A fonte é o score determinístico (useCarteira, buildRaioX): as métricas são
 * recalculadas a cada carga, então o ponto de atenção delas é DE HOJE. A
 * análise escrita pela IA (o Raio-X da carteira, GET /portfolio/analysis) e o
 * "Pedir uma análise nova" saíram da tela em 07/11/2026; o relatório da
 * carteira entra no lugar (docs/specs/carteira-motor-de-avisos.md, 4.4).
 *
 * Regras de conteúdo:
 *  - O texto é o da métrica (a nota do buildRaioX): descreve, sem ordem de
 *    compra e venda nem alocação prescrita (CVM).
 *  - Sem dado real, o item não existe. Sem ponto de atenção, `vazio` e a seção
 *    vira uma linha calma.
 *
 * Sem Vue nem Nuxt: o teste (tests/achados-da-carteira.test.ts) importa direto.
 */
import type { CarteiraPosicaoMundo, CarteiraScoreVM, ScoreMetricVM } from '~/types/carteira'

export type Gravidade = 'alta' | 'media'
export type TipoDoAchado = 'atencao' | 'forca'

export interface Achado {
  id: string
  tipo: TipoDoAchado
  /** só a atenção tem gravidade */
  gravidade: Gravidade | null
  /** o selo do cartão ('Pede atenção', 'Vai bem') */
  selo: string
  titulo: string
  texto: string | null
  /** a métrica do score a que o achado pertence */
  dimensao: string
  /** o número da métrica ('62/100', 'Beta 1,21') */
  valor: string
  /** a pergunta pronta para o chat */
  pergunta: string
}

export interface AchadosVM {
  /** a atenção por gravidade, depois o que vai bem */
  itens: Achado[]
  /** quantos pedem atenção hoje */
  pontos: number
  /** quantos ativos a Redentia olhou */
  ativos: number
  /** em quantas dimensões (as métricas do score) */
  dimensoes: number
  /** 'hoje às 08:01' (no fuso de São Paulo) */
  olhouEm: string | null
  /** nada que peça atenção: a seção vira a linha calma */
  vazio: boolean
}

export interface EntradaDosAchados {
  raiox: CarteiraScoreVM | null
  posicoes: CarteiraPosicaoMundo[]
  /** quando a carteira foi carregada (ISO), a hora em que a Redentia "olhou" */
  olhadaEm: string | null
  agora?: Date
}

const FUSO = 'America/Sao_Paulo'
const DIA_MS = 86_400_000

/* ————— datas, no fuso de São Paulo (o servidor e o navegador concordam) ————— */

function partesSP(d: Date): { iso: string; dia: string; mes: string; ano: string; hora: string } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  ) as Record<string, string>
  const hh = p.hour === '24' ? '00' : p.hour
  return { iso: `${p.year}-${p.month}-${p.day}`, dia: p.day!, mes: p.month!, ano: p.year!, hora: `${hh}:${p.minute}` }
}

function dataValida(s: string | null | undefined): Date | null {
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

/** 'hoje às 08:01' | 'ontem às 21:40' | 'em 03/11 às 09:12' */
export function quandoOlhou(olhadaEm: string | null, agora = new Date()): string | null {
  const d = dataValida(olhadaEm)
  if (!d) return null
  const a = partesSP(d)
  const h = partesSP(agora)
  if (a.iso === h.iso) return `hoje às ${a.hora}`
  if (partesSP(new Date(agora.getTime() - DIA_MS)).iso === a.iso) return `ontem às ${a.hora}`
  return `em ${a.dia}/${a.mes} às ${a.hora}`
}

/* ————— os itens ————— */

/** Minúsculas e sem acento, para casar sem depender de caixa nem de til. */
function plano(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

const ORDEM_GRAVIDADE: Record<Gravidade, number> = { alta: 0, media: 1 }
const ORDEM_TIPO: Record<TipoDoAchado, number> = { atencao: 0, forca: 1 }

/** o título da métrica em Atenção, no gênero da palavra */
const TITULO_DA_METRICA: Record<string, string> = {
  'Diversificação': 'A diversificação pede atenção',
  Risco: 'O risco pede atenção',
  Renda: 'A renda pede atenção',
  Qualidade: 'A qualidade pede atenção',
}

function seloDe(tipo: TipoDoAchado): string {
  return tipo === 'forca' ? 'Vai bem' : 'Pede atenção'
}

/** ponto de atenção da métrica: abaixo de 45 é grave (a régua da banda crítica) */
function gravidadeDaMetrica(m: ScoreMetricVM): Gravidade {
  return m.fillPct < 45 ? 'alta' : 'media'
}

function chave(s: string): string {
  return plano(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

/** Monta a lista de achados. Função pura: o componente só desenha. */
export function montarAchados(e: EntradaDosAchados): AchadosVM {
  const agora = e.agora ?? new Date()
  const posicoes = e.posicoes ?? []
  const metricas = e.raiox?.metrics ?? []

  const itens: Achado[] = []

  /* 1. os pontos de atenção do score: de hoje */
  for (const m of metricas) {
    if (m.tag !== 'Atenção') continue
    const g = gravidadeDaMetrica(m)
    itens.push({
      id: `raiox:${chave(m.label)}`,
      tipo: 'atencao',
      gravidade: g,
      selo: seloDe('atencao'),
      titulo: TITULO_DA_METRICA[m.label] ?? `${m.label}: pede atenção`,
      texto: m.note || null,
      dimensao: m.label,
      valor: m.value,
      pergunta: `A Aportou apontou ${m.label.toLowerCase()} como ponto de atenção na minha carteira (${m.value}). ${m.note} O que isso quer dizer para mim?`.replace(/\s+/g, ' ').trim(),
    })
  }
  const pontos = itens.length

  /* 2. um contrapeso: o que vai bem (a métrica Excelente de hoje) */
  const exc = metricas.find((m) => m.tag === 'Excelente')
  if (exc) {
    itens.push({
      id: `forca:${chave(exc.label)}`,
      tipo: 'forca', gravidade: null, selo: seloDe('forca'),
      titulo: `${exc.label} em nível excelente`, texto: exc.note || null,
      dimensao: exc.label, valor: exc.value,
      pergunta: `A Aportou viu ${exc.label.toLowerCase()} como ponto forte da minha carteira (${exc.value}). O que sustenta isso?`,
    })
  }

  // a ordem: a atenção pela gravidade, depois o que vai bem
  const pos = new Map(itens.map((a, i) => [a.id, i]))
  itens.sort((a, b) =>
    ORDEM_TIPO[a.tipo] - ORDEM_TIPO[b.tipo]
    || (a.gravidade && b.gravidade ? ORDEM_GRAVIDADE[a.gravidade] - ORDEM_GRAVIDADE[b.gravidade] : 0)
    || pos.get(a.id)! - pos.get(b.id)!,
  )

  return {
    itens,
    pontos,
    ativos: posicoes.length,
    dimensoes: metricas.length,
    olhouEm: quandoOlhou(e.olhadaEm, agora),
    vazio: pontos === 0,
  }
}

/** '2 pontos de atenção' | 'nada que peça atenção' */
export function resumoDosAchados(vm: Pick<AchadosVM, 'pontos'>): string {
  return vm.pontos ? `${vm.pontos} ${vm.pontos === 1 ? 'ponto de atenção' : 'pontos de atenção'}` : 'nada que peça atenção'
}

/** A assinatura do modal: 'olhou 18 ativos hoje às 12:17' | 'olhou a sua carteira hoje às 12:17'. */
export function assinaturaDosAchados(vm: Pick<AchadosVM, 'ativos' | 'olhouEm'>): string {
  const o = vm.ativos ? `olhou ${vm.ativos} ${vm.ativos === 1 ? 'ativo' : 'ativos'}` : 'olhou a sua carteira'
  return vm.olhouEm ? `${o} ${vm.olhouEm}` : o
}

/** 'olhou 18 ativos em 4 dimensões' (sem o que não tem número) */
export function oQueOlhou(vm: Pick<AchadosVM, 'ativos' | 'dimensoes'>): string | null {
  if (!vm.ativos) return null
  const a = `${vm.ativos} ${vm.ativos === 1 ? 'ativo' : 'ativos'}`
  return vm.dimensoes ? `${a} em ${vm.dimensoes} ${vm.dimensoes === 1 ? 'dimensão' : 'dimensões'}` : a
}

/* ————— o modal das ideias (05/11/2026; antes, a barra "a Redentia encontrou") ————— */

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]!)

/** Um pedaço do título: texto, ou o número em destaque (com o tom dele). */
export interface PedacoDoTitulo {
  texto: string
  numero?: 'atencao'
}

/**
 * O título dos achados: 'A Aportou olhou a sua carteira: 2 pontos de atenção'
 * (o modal mostra os pedaços sem a abertura, que já vai na assinatura). Sem
 * achado, a linha calma. `pedacos` é o mesmo título com o número separado,
 * para o destaque.
 */
export function tituloDosAchados(vm: Pick<AchadosVM, 'pontos' | 'vazio'>): { titulo: string; pedacos: PedacoDoTitulo[] } {
  const abre = 'A Aportou olhou a sua carteira: '
  const pedacos: PedacoDoTitulo[] = [{ texto: abre }]
  if (vm.vazio || !vm.pontos) pedacos.push({ texto: 'nada pede atenção' })
  else pedacos.push({ texto: String(vm.pontos), numero: 'atencao' }, { texto: ` ${vm.pontos === 1 ? 'ponto de atenção' : 'pontos de atenção'}` })
  return { titulo: pedacos.map((p) => p.texto).join(''), pedacos }
}

/** Os grupos: "Pede atenção" numa coluna e "Vai bem" na outra. */
const COLUNAS: { rotulo: string; tipos: TipoDoAchado[] }[][] = [
  [{ rotulo: 'Pede atenção', tipos: ['atencao'] }],
  [{ rotulo: 'Vai bem', tipos: ['forca'] }],
]

export interface OpcoesDoHtml {
  /** a frase do que olhou no começo ('A Aportou olhou 18 ativos…'); o modal a
   *  leva na assinatura e passa false */
  olhou?: boolean
  /** troca o R$ pela máscara quando o olho está fechado */
  mascarar?: (t: string) => string
}

/** O rótulo da pergunta de cada linha (aparece no hover e no foco). */
export const PERGUNTAR_DO_ITEM = 'Perguntar à IA'

/**
 * Uma linha: o título e, à direita, o número de hoje (alinhado e tabular, como
 * os indicadores do /asset); embaixo o texto e, no pé da linha, o "Perguntar à
 * Redentia" da linha, que o componente liga pelo data-achado.
 */
function linhaHtml(a: Achado, m: (t: string) => string): string {
  const tom = a.tipo === 'forca' ? 'forca' : (a.gravidade ?? 'media')
  return `<li class="cah__item cah__item--${tom}">`
    + `<p class="cah__linha"><b class="cah__t">${esc(a.titulo)}</b>${a.valor ? `<span class="cah__v">${esc(m(a.valor))}</span>` : ''}</p>`
    + (a.texto ? `<p class="cah__x">${esc(m(a.texto))}</p>` : '')
    + '<div class="cah__pe">'
    + `<button type="button" class="cah__perg" data-achado="${esc(a.id)}" aria-label="${esc(`${PERGUNTAR_DO_ITEM}: ${a.titulo}`)}">${PERGUNTAR_DO_ITEM}</button>`
    + '</div></li>'
}

function grupoHtml(rotulo: string, itens: Achado[], m: (t: string) => string): string {
  return `<p class="cah__grupo">${esc(rotulo)}</p><ul class="cah__lista">${itens.map((a) => linhaHtml(a, m)).join('')}</ul>`
}

/**
 * O miolo do modal das ideias, já escapado: a frase do que olhou (sem ela com
 * `olhou: false`) e o que é de hoje ("Pede atenção" e "Vai bem"). A cor do
 * marcador acompanha a gravidade, mas nunca sozinha. Sem achado, a linha calma.
 */
export function achadosHtml(vm: AchadosVM, o: OpcoesDoHtml = {}): string {
  const m = o.mascarar ?? ((t: string) => t)
  const out: string[] = []
  const olhou = oQueOlhou(vm)
  if (o.olhou !== false && (olhou || vm.olhouEm)) {
    out.push(`<p class="cah__frase">A Aportou olhou${olhou ? ` <b>${esc(olhou)}</b>` : ' a sua carteira'}${vm.olhouEm ? `, ${esc(vm.olhouEm)}` : ''}.</p>`)
  }
  if (vm.vazio) {
    out.push('<p class="cah__frase">Nada pede atenção agora.</p>')
    return out.join('')
  }
  const colunas = COLUNAS
    .map((col) => col.map((g) => ({ g, itens: vm.itens.filter((a) => g.tipos.includes(a.tipo)) })).filter((x) => x.itens.length))
    .filter((col) => col.length)
    .map((col) => `<div class="cah__col">${col.map((x) => grupoHtml(x.g.rotulo, x.itens, m)).join('')}</div>`)
  out.push(`<div class="cah__cols cah__cols--${colunas.length}">${colunas.join('')}</div>`)
  return out.join('')
}
