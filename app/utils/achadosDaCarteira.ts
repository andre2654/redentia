/**
 * O que a Redentia AI encontrou na carteira (05/11/2026; o dono: "precisamos
 * encontrar algum lugar para apresentar isso, talvez logo abaixo do hero,
 * passando a ideia de que foi o agente da Redentia que encontrou esses
 * pontos"). A seção CarteiraAchados mostra; a conta mora aqui.
 *
 * Duas fontes, cada uma com a sua data:
 *  - o Raio-X (useCarteira, buildRaioX): as métricas são recalculadas a cada
 *    carga, então o ponto de atenção delas é DE HOJE;
 *  - a análise escrita pela IA (GET /portfolio/analysis): um retrato gravado
 *    quando a carteira foi importada no chat (chat-service, import_portfolio).
 *    Pode ter meses. Cada item dela leva a data; passando de 30 dias, ou
 *    sendo anterior à última sincronização do Open Finance, ela é dita
 *    desatualizada com todas as letras. Não existe endpoint que gere uma
 *    análise nova (o POST /portfolio/analysis só grava o que o chat-service
 *    calculou): quem refaz é o chat, quando a mensagem pede "reanalisar"
 *    (chat-service, llm/turn/auto-actions.ts, roda import_portfolio no modo
 *    reanalyze). O botão "Pedir uma análise nova" só preenche essa frase no
 *    painel do chat; o envio fica com a pessoa.
 *
 * Regras de conteúdo:
 *  - CVM: nada de ordem (compre, venda, recomendamos). A frase da IA que traz
 *    ordem sai; a recomendação vira "ideia para avaliar".
 *  - O código ISIN do Tesouro (BRSTN…) vira o nome da posição; sem a posição,
 *    "um título do Tesouro".
 *  - O risco da IA que fala do mesmo assunto de uma métrica em Atenção não
 *    aparece duas vezes: fica a métrica (o dado de hoje), com a nota de que a
 *    análise já tinha apontado o mesmo.
 *  - Sem dado real, o item não existe. Sem nenhum, `vazio` e a seção vira uma
 *    linha calma.
 *
 * Sem Vue nem Nuxt: o teste (tests/achados-da-carteira.test.ts) importa direto.
 */
import type { CarteiraAnaliseIA, CarteiraPosicaoMundo, CarteiraRaioXVM, RaioXMetricVM } from '~/types/carteira'

export type Gravidade = 'alta' | 'media' | 'baixa'
export type TipoDoAchado = 'atencao' | 'risco' | 'ideia' | 'forca'

export interface Achado {
  id: string
  tipo: TipoDoAchado
  /** só atenção e risco têm gravidade */
  gravidade: Gravidade | null
  /** o selo do cartão ('Pede atenção', 'Vale olhar', 'Ideia para avaliar', 'Vai bem') */
  selo: string
  titulo: string
  texto: string | null
  /** 'raiox' = calculado agora; 'analise' = o texto da IA, com a data dela */
  origem: 'raiox' | 'analise'
  /** de quando é o achado: 'hoje' ou 'análise de 22/05' */
  quando: string
  /** a dimensão do Raio-X a que o achado pertence (a linha do tempo agrupa por ela) */
  dimensao: string | null
  /** o número da métrica ('62/100', 'Beta 1,21'), quando vem do Raio-X */
  valor: string | null
  /** o risco da análise que dizia o mesmo ('22/05'), quando a métrica o absorveu */
  confirmadoEm: string | null
  /** a pergunta pronta para o chat */
  pergunta: string
}

export interface PassoDoAgente {
  /** a dimensão conferida ('Diversificação') */
  dimensao: string
  valor: string
  tag: string
  atencao: boolean
}

export interface IdadeDaAnalise {
  data: string
  dias: number
  antiga: boolean
}

export interface AnaliseNaSecao {
  /** '22/05' (com o ano quando não é o ano corrente: '22/05/2025') */
  data: string
  dias: number
  /** passou de 30 dias */
  antiga: boolean
  /** antiga, ou anterior à última sincronização do Open Finance: vale pedir outra */
  desatualizada: boolean
}

export interface AchadosVM {
  /** atenção e risco por gravidade, depois as ideias, depois o que vai bem */
  itens: Achado[]
  /** quantos pedem atenção (atenção + risco) */
  pontos: number
  ideias: number
  /** quantos ativos a Redentia olhou */
  ativos: number
  /** em quantas dimensões (as métricas do Raio-X) */
  dimensoes: number
  passos: PassoDoAgente[]
  /** 'hoje às 08:01' (no fuso de São Paulo) */
  olhouEm: string | null
  analise: AnaliseNaSecao | null
  /** nada que peça atenção nem ideia: a seção vira a linha calma */
  vazio: boolean
}

export interface EntradaDosAchados {
  raiox: CarteiraRaioXVM | null
  analise: CarteiraAnaliseIA | null
  posicoes: CarteiraPosicaoMundo[]
  /** quando a carteira foi carregada (ISO), a hora em que a Redentia "olhou" */
  olhadaEm: string | null
  /** a sincronização mais recente do Open Finance (last_synced_at, ISO) */
  ultimoSync?: string | null
  agora?: Date
}

/** A partir de quantos dias a análise escrita é dita antiga. */
export const DIAS_ANALISE_ANTIGA = 30

/**
 * A frase que pede ao chat uma análise nova. Tem de casar com a regex do
 * chat-service (reanalyzeKeywordRE em llm/turn/auto-actions.ts: "reanalisar").
 */
export const PEDIDO_DE_ANALISE_NOVA = 'Reanalisar minha carteira'

/** A análise é desatualizada: antiga, ou anterior ao último sync do Open Finance. */
export function analiseDesatualizada(generatedAt: string | null | undefined, ultimoSync: string | null | undefined, agora = new Date()): boolean {
  const idade = idadeDaAnalise(generatedAt, agora)
  if (!idade) return false
  if (idade.antiga) return true
  const g = dataValida(generatedAt)
  const s = dataValida(ultimoSync)
  return !!(g && s && s.getTime() > g.getTime())
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

/** A data e a idade da análise escrita; null sem data válida. */
export function idadeDaAnalise(generatedAt: string | null | undefined, agora = new Date()): IdadeDaAnalise | null {
  const d = dataValida(generatedAt)
  if (!d) return null
  const g = partesSP(d)
  const h = partesSP(agora)
  // dias de calendário em São Paulo, não horas corridas
  const dias = Math.max(0, Math.round((Date.parse(`${h.iso}T12:00:00Z`) - Date.parse(`${g.iso}T12:00:00Z`)) / DIA_MS))
  const data = g.ano === h.ano ? `${g.dia}/${g.mes}` : `${g.dia}/${g.mes}/${g.ano}`
  return { data, dias, antiga: dias > DIAS_ANALISE_ANTIGA }
}

/* ————— o texto da IA ————— */

/** Minúsculas e sem acento, para casar sem depender de caixa nem de til. */
function plano(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/** ISIN de título brasileiro (BRSTNCNTB7T1): BR + 9 + o dígito verificador. */
const ISIN = /\bBR[A-Z0-9]{9}\d\b/g

/** Troca o código do Tesouro pelo nome que a carteira dá ao título. */
export function trocarIsin(texto: string, posicoes: CarteiraPosicaoMundo[]): string {
  const nomes = new Map(posicoes.filter((p) => p.nome && p.nome !== p.ticker).map((p) => [p.ticker.toUpperCase(), p.nome!]))
  return texto.replace(ISIN, (cod) => nomes.get(cod.toUpperCase()) ?? 'um título do Tesouro')
}

/**
 * Linguagem de ordem que a CVM veda num texto que não é recomendação
 * individual: comprar, vender, "recomendamos", "você deve"… A frase que traz
 * isso sai inteira. "venda" pega também o substantivo: melhor perder a frase
 * do que deixar passar uma ordem.
 */
const ORDEM = /\b(compre|comprem|comprar|compra de|venda|vendam|vender|recomend\w*|sugerimos|sugere-se|aconselh\w*|voce deve|voce deveria|deve-se|zere|zerar)\b/

export function temOrdem(texto: string): boolean {
  return ORDEM.test(plano(texto))
}

/** As frases do texto, sem as que trazem ordem. */
function semOrdem(texto: string | null | undefined): string | null {
  if (!texto) return null
  // a frase acaba no ponto seguido de espaço e maiúscula: "26.1%" não corta
  const frases = texto.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý"“(])/)
  const fica = frases.map((f) => f.trim()).filter((f) => f && !temOrdem(f))
  return fica.length ? fica.join(' ') : null
}

function limpar(texto: string | null | undefined, posicoes: CarteiraPosicaoMundo[]): string | null {
  const t = semOrdem(texto)
  return t ? trocarIsin(t, posicoes) : null
}

/* ————— o assunto: a mesma conversa entre a métrica e o risco ————— */

/** Que dimensão do Raio-X um texto da IA está discutindo (a primeira que casar). */
const ASSUNTOS: { dimensao: string; re: RegExp }[] = [
  { dimensao: 'Diversificação', re: /concentra|diversifica|principais ativos|maiores posic|peso (elevado|alto|excessivo)|setor/ },
  { dimensao: 'Risco', re: /volatil|\bbeta\b|oscila|drawdown|risco de mercado|sensibilidade ao (ibov|mercado)/ },
  // "renda fixa" é classe de ativo, não a renda da carteira
  { dimensao: 'Renda', re: /\brenda (passiva|mensal|da carteira)\b|dividend|provento|yield|\bdy\b/ },
  { dimensao: 'Qualidade', re: /qualidade|fundament|redentia score/ },
]

export function assuntoDe(texto: string): string | null {
  const t = plano(texto)
  return ASSUNTOS.find((a) => a.re.test(t))?.dimensao ?? null
}

/* ————— os itens ————— */

const ORDEM_GRAVIDADE: Record<Gravidade, number> = { alta: 0, media: 1, baixa: 2 }
const ORDEM_TIPO: Record<TipoDoAchado, number> = { atencao: 0, risco: 0, ideia: 1, forca: 2 }
const GRAVIDADE_DA_IA: Record<string, Gravidade> = { high: 'alta', medium: 'media', low: 'baixa' }

/** o título da métrica em Atenção, no gênero da palavra */
const TITULO_DA_METRICA: Record<string, string> = {
  'Diversificação': 'A diversificação pede atenção',
  Risco: 'O risco pede atenção',
  Renda: 'A renda pede atenção',
  Qualidade: 'A qualidade pede atenção',
}

function seloDe(tipo: TipoDoAchado, g: Gravidade | null): string {
  if (tipo === 'ideia') return 'Ideia para avaliar'
  if (tipo === 'forca') return 'Vai bem'
  return g === 'baixa' ? 'Vale olhar' : 'Pede atenção'
}

/** ponto de atenção da métrica: abaixo de 45 é grave (a régua da banda crítica) */
function gravidadeDaMetrica(m: RaioXMetricVM): Gravidade {
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
  const analise = e.analise
  const idade = idadeDaAnalise(analise?.generated_at ?? null, agora)
  const quandoAnalise = idade ? (idade.dias === 0 ? 'hoje' : `análise de ${idade.data}`) : 'análise da Redentia'

  const itens: Achado[] = []

  /* 1. os pontos de atenção do Raio-X: de hoje */
  const atencoes = new Map<string, Achado>()
  for (const m of metricas) {
    if (m.tag !== 'Atenção') continue
    const g = gravidadeDaMetrica(m)
    const a: Achado = {
      id: `raiox:${chave(m.label)}`,
      tipo: 'atencao',
      gravidade: g,
      selo: seloDe('atencao', g),
      titulo: TITULO_DA_METRICA[m.label] ?? `${m.label}: pede atenção`,
      texto: m.note || null,
      origem: 'raiox',
      quando: 'hoje',
      dimensao: m.label,
      valor: m.value,
      confirmadoEm: null,
      pergunta: `A Redentia apontou ${m.label.toLowerCase()} como ponto de atenção na minha carteira (${m.value}). ${m.note} O que isso quer dizer para mim?`.replace(/\s+/g, ' ').trim(),
    }
    atencoes.set(m.label, a)
    itens.push(a)
  }

  /* 2. os riscos da análise escrita, com a data dela */
  for (const [i, r] of (analise?.risks ?? []).entries()) {
    if (!r?.title || temOrdem(r.title)) continue
    const titulo = trocarIsin(r.title.trim(), posicoes)
    const texto = limpar(r.body, posicoes)
    const assunto = assuntoDe(`${r.title} ${r.body ?? ''}`)
    const mesma = assunto ? atencoes.get(assunto) : undefined
    if (mesma) {
      // a métrica de hoje já diz isso: fica ela, com a nota de que a análise concordava
      mesma.confirmadoEm = idade?.data ?? null
      continue
    }
    const g = GRAVIDADE_DA_IA[r.severity] ?? 'baixa'
    itens.push({
      id: `risco:${i}:${chave(r.title)}`,
      tipo: 'risco',
      gravidade: g,
      selo: seloDe('risco', g),
      titulo,
      texto,
      origem: 'analise',
      quando: quandoAnalise,
      dimensao: assunto,
      valor: null,
      confirmadoEm: null,
      pergunta: `A análise da Redentia${idade && idade.dias > 0 ? ` de ${idade.data}` : ''} apontou na minha carteira: "${titulo}". Isso ainda vale hoje?`,
    })
  }

  /* 3. as recomendações viram ideias para avaliar */
  for (const [i, r] of (analise?.recommendations ?? []).entries()) {
    if (!r?.title || temOrdem(r.title)) continue
    const titulo = trocarIsin(r.title.trim(), posicoes)
    itens.push({
      id: `ideia:${i}:${chave(r.title)}`,
      tipo: 'ideia',
      gravidade: null,
      selo: seloDe('ideia', null),
      titulo,
      texto: limpar(r.body, posicoes),
      origem: 'analise',
      quando: quandoAnalise,
      dimensao: assuntoDe(`${r.title} ${r.body ?? ''}`),
      valor: null,
      confirmadoEm: null,
      pergunta: `A Redentia levantou uma ideia para avaliar na minha carteira: "${titulo}". O que eu deveria considerar antes?`,
    })
  }

  const pontos = itens.filter((a) => a.tipo === 'atencao' || a.tipo === 'risco').length
  const ideias = itens.filter((a) => a.tipo === 'ideia').length

  /* 4. um contrapeso: o que vai bem (da IA; sem ela, a métrica Excelente de hoje) */
  const forte = (analise?.strengths ?? []).find((s) => s?.title && !temOrdem(s.title))
  if (forte) {
    const titulo = trocarIsin(forte.title.trim(), posicoes)
    itens.push({
      id: `forca:${chave(forte.title)}`,
      tipo: 'forca', gravidade: null, selo: seloDe('forca', null),
      titulo, texto: limpar(forte.body, posicoes),
      origem: 'analise', quando: quandoAnalise,
      dimensao: assuntoDe(`${forte.title} ${forte.body ?? ''}`), valor: null, confirmadoEm: null,
      pergunta: `A Redentia viu um ponto forte na minha carteira: "${titulo}". O que sustenta isso?`,
    })
  } else {
    const exc = metricas.find((m) => m.tag === 'Excelente')
    if (exc) {
      itens.push({
        id: `forca:${chave(exc.label)}`,
        tipo: 'forca', gravidade: null, selo: seloDe('forca', null),
        titulo: `${exc.label} em nível excelente`, texto: exc.note || null,
        origem: 'raiox', quando: 'hoje', dimensao: exc.label, valor: exc.value, confirmadoEm: null,
        pergunta: `A Redentia viu ${exc.label.toLowerCase()} como ponto forte da minha carteira (${exc.value}). O que sustenta isso?`,
      })
    }
  }

  // a ordem: gravidade, e no empate o dado de hoje antes do texto antigo
  const pos = new Map(itens.map((a, i) => [a.id, i]))
  itens.sort((a, b) =>
    ORDEM_TIPO[a.tipo] - ORDEM_TIPO[b.tipo]
    || (a.gravidade && b.gravidade ? ORDEM_GRAVIDADE[a.gravidade] - ORDEM_GRAVIDADE[b.gravidade] : 0)
    || (a.origem === b.origem ? 0 : a.origem === 'raiox' ? -1 : 1)
    || pos.get(a.id)! - pos.get(b.id)!,
  )

  return {
    itens,
    pontos,
    ideias,
    ativos: posicoes.length,
    dimensoes: metricas.length,
    passos: metricas.map((m) => ({ dimensao: m.label, valor: m.value, tag: m.tag, atencao: m.tag === 'Atenção' })),
    olhouEm: quandoOlhou(e.olhadaEm, agora),
    analise: analise && idade ? { ...idade, desatualizada: analiseDesatualizada(analise.generated_at, e.ultimoSync, agora) } : null,
    vazio: pontos + ideias === 0,
  }
}

/** '2 pontos de atenção e 1 ideia para avaliar' | 'nada que peça atenção' */
export function resumoDosAchados(vm: Pick<AchadosVM, 'pontos' | 'ideias'>): string {
  const p = vm.pontos ? `${vm.pontos} ${vm.pontos === 1 ? 'ponto de atenção' : 'pontos de atenção'}` : ''
  const i = vm.ideias ? `${vm.ideias} ${vm.ideias === 1 ? 'ideia para avaliar' : 'ideias para avaliar'}` : ''
  if (p && i) return `${p} e ${i}`
  return p || i || 'nada que peça atenção'
}

/** 'olhou 18 ativos em 4 dimensões' (sem o que não tem número) */
export function oQueOlhou(vm: Pick<AchadosVM, 'ativos' | 'dimensoes'>): string | null {
  if (!vm.ativos) return null
  const a = `${vm.ativos} ${vm.ativos === 1 ? 'ativo' : 'ativos'}`
  return vm.dimensoes ? `${a} em ${vm.dimensoes} ${vm.dimensoes === 1 ? 'dimensão' : 'dimensões'}` : a
}

/* ————— a barra "a Redentia encontrou" (05/11/2026) ————— */

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]!)
/** o título vira frase: ponto no fim, se não tiver pontuação */
const comPonto = (s: string) => (/[.!?…:]$/.test(s) ? s : `${s}.`)

/**
 * O título da barra recolhida, no idioma do "PETR4 em resumo" do /asset:
 * 'A Redentia olhou a sua carteira: 5 pontos de atenção e 2 ideias para
 * avaliar', e a idade da análise ao lado, em cinza ('análise de 22/05,
 * desatualizada'), quando ela está desatualizada. Sem achado, a linha calma.
 */
export function tituloDosAchados(vm: Pick<AchadosVM, 'pontos' | 'ideias' | 'vazio' | 'analise'>): { titulo: string; idade: string | null } {
  const idade = vm.analise?.desatualizada ? `análise de ${vm.analise.data}, desatualizada` : null
  return { titulo: `A Redentia olhou a sua carteira: ${vm.vazio ? 'nada pede atenção' : resumoDosAchados(vm)}`, idade }
}

const GRUPOS: { rotulo: string; tipos: TipoDoAchado[] }[] = [
  { rotulo: 'Pede atenção', tipos: ['atencao', 'risco'] },
  { rotulo: 'Ideias para avaliar', tipos: ['ideia'] },
  { rotulo: 'Vai bem', tipos: ['forca'] },
]

export interface OpcoesDoHtml {
  /** o aviso da análise antiga ('Os números são de hoje. A análise escrita é de 22/05…') */
  aviso?: string | null
  /** troca o R$ pela máscara quando o olho está fechado */
  mascarar?: (t: string) => string
}

/**
 * O miolo da barra aberta: o texto simples do resumo do /asset (frases e
 * listas), já escapado, para o AtivoResumo revelar palavra por palavra. Um
 * grupo por tipo (o que pede atenção, as ideias, o que vai bem), cada item
 * com o título em negrito, o texto e, em cinza, de quando é (e o 'Vale olhar'
 * do ponto leve, que diz mais que o grupo). A cor do marcador acompanha a
 * gravidade, mas nunca sozinha. Sem achado, a linha calma e o que olhou.
 */
export function achadosHtml(vm: AchadosVM, o: OpcoesDoHtml = {}): string {
  const m = o.mascarar ?? ((t: string) => t)
  const out: string[] = []
  const olhou = oQueOlhou(vm)
  if (olhou || vm.olhouEm) {
    out.push(`<p class="ars2__frase">A Redentia olhou${olhou ? ` <b>${esc(olhou)}</b>` : ' a sua carteira'}${vm.olhouEm ? `, ${esc(vm.olhouEm)}` : ''}.</p>`)
  }
  if (vm.vazio) {
    out.push('<p class="ars2__frase">Nada pede atenção agora.</p>')
  } else {
    for (const g of GRUPOS) {
      const itens = vm.itens.filter((a) => g.tipos.includes(a.tipo))
      if (!itens.length) continue
      out.push(`<p class="cah__grupo">${esc(g.rotulo)}</p><ul class="cah__lista">`)
      for (const a of itens) {
        const quando = [a.gravidade === 'baixa' ? a.selo : null, a.quando === 'hoje' ? 'visto hoje' : a.quando, a.valor, a.confirmadoEm ? `a análise de ${a.confirmadoEm} já apontava` : null]
          .filter(Boolean).join(' · ')
        const tom = a.tipo === 'ideia' ? 'ideia' : a.tipo === 'forca' ? 'forca' : (a.gravidade ?? 'media')
        out.push(`<li class="cah__item cah__item--${tom}"><b>${esc(comPonto(a.titulo))}</b>${a.texto ? ` ${esc(m(a.texto))}` : ''} <span class="cah__quando">${esc(quando)}</span></li>`)
      }
      out.push('</ul>')
    }
  }
  if (o.aviso) out.push(`<p class="ars2__nota">${esc(o.aviso)}</p>`)
  return out.join('')
}
