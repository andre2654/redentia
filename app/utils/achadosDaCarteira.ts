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
 *  - CVM: nada de ordem (compre, venda, recomendamos) nem de alocação
 *    prescrita ("considere reduzir a exposição", "avalie aumentar a
 *    alocação", "rebalancear"). A frase da IA que traz isso sai; o item cujo
 *    TÍTULO é uma ordem ("Rebalancear para…", "Avaliar redução de…") cai
 *    inteiro. A recomendação que sobra, descritiva, vira "ideia para avaliar".
 *  - Os números do texto da IA vêm no padrão americano (26.1%, 0.17): viram o
 *    brasileiro (26,1%, 0,17). O jargão sem explicação ("com um HHI de 0.17")
 *    sai.
 *  - A análise antiga (mais de 30 dias) não se mistura com o que é de hoje: os
 *    itens dela vão para um grupo próprio no fim ("Da análise de 22/05"), e a
 *    contagem do título conta só o que é de hoje.
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
  /** vem da análise antiga (mais de 30 dias): vai para o grupo do fim, com a data */
  antigo: boolean
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
  /** quantos pedem atenção HOJE (atenção + risco, fora os da análise antiga) */
  pontos: number
  /** as ideias de hoje (as da análise antiga não contam) */
  ideias: number
  /** riscos e ideias da análise antiga, no grupo do fim */
  antigos: number
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
const ORDEM = /\b(compre|comprem|comprar|compra de|venda|vendam|vender|recomend\w*|sugerimos|sugere-se|sugiro|aconselh\w*|voce deve|voce deveria|deve-se|zere|zerar)\b/

/**
 * A alocação prescrita, que também é recomendação (05/11/2026, na carteira do
 * dono passou "Considere reduzir a exposição…" e "Avalie aumentar a
 * alocação…"): o verbo que manda pensar (considere, avalie, vale…) seguido,
 * na mesma frase, do verbo que mexe na carteira (reduzir, aumentar, alocar…);
 * e as expressões que já são a ordem sozinhas ("reduzir a exposição",
 * "aumentar a alocação", "rebalancear", "diversificar ainda mais").
 */
const PENSE = /\b(considere|considerem|considerar|avalie|avaliem|pense em|vale a pena|valeria|seria (interessante|bom|prudente|recomendavel)|convem|e interessante)\b/
const MEXA = /\b(reduz\w*|aument\w*|aloc\w*|realoc\w*|rebalance\w*|diversific\w*|troc\w*|diminu\w*|elev\w*|concentr\w* (mais|menos)|migr\w*|substitu\w*|refor\w*)\b/
const ALOCACAO = /\b(reduzir|diminuir) (a |sua |essa )?(exposicao|posicao|participacao|fatia|peso)|\b(aumentar|elevar|ampliar) (a |sua )?(alocacao|exposicao|posicao|participacao|fatia|peso)|\brebalance\w*|\brealoc\w*|\bdiversificar ainda mais\b/

/**
 * O título que é uma ordem: começa no verbo de mexer na carteira, no
 * infinitivo ou no imperativo ("Rebalancear para…", "Avaliar redução de…",
 * "Reduza…"). "Olhar…" e "Comparar…" são olhar um fato, ficam.
 */
const TITULO_DE_ORDEM = /^(avaliar|avalie|considerar|considere|rebalancear|rebalanceie|reduzir|reduza|aumentar|aumente|alocar|aloque|realocar|realoque|diversificar|diversifique|trocar|troque|elevar|eleve|diminuir|diminua|migrar|migre|substituir|substitua|reforcar|reforce|vender|venda|comprar|compre|zerar|zere|manter|mantenha)\b/

export function temOrdem(texto: string): boolean {
  const t = plano(texto)
  if (ORDEM.test(t) || ALOCACAO.test(t)) return true
  // "pense" e "mexa" na mesma frase: "Considere reduzir…", "Avalie aumentar…"
  const p = PENSE.exec(t)
  return !!p && MEXA.test(t.slice(p.index))
}

/** O título que é ordem (ou traz ordem) derruba o item inteiro. */
export function tituloDeOrdem(titulo: string): boolean {
  return temOrdem(titulo) || TITULO_DE_ORDEM.test(plano(titulo).trim())
}

/**
 * Os números da IA no padrão brasileiro: 26.1% → 26,1%, 0.17 → 0,17. Ponto
 * com três casas é milhar ("R$ 9.118", "1.200") e fica, menos depois do zero
 * ("0.175" é decimal). Número com dois pontos ("1.234.567") não é tocado.
 */
export function numerosBr(texto: string): string {
  return texto.replace(/(?<![\d.,])(\d+)\.(\d+)(?!\d|[.,]\d)/g, (m, i: string, d: string) => (d.length === 3 && i !== '0' ? m : `${i},${d}`))
}

/** O jargão sem explicação sai: "…12 setores distintos, com um HHI de 0.17, indicando…" */
export function semJargao(texto: string): string {
  return texto
    .replace(/,\s*(?:com|e)\s+(?:um\s+)?(?:índice\s+|indice\s+)?HHI(?:\s*\([^)]*\))?\s+(?:de\s+)?\d+(?:[.,]\d+)?/gi, '')
    .replace(/\s*\((?:índice\s+|indice\s+)?(?:de\s+)?HHI[^)]*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
}

/** As frases do texto, sem as que trazem ordem. */
function semOrdem(texto: string | null | undefined): string | null {
  if (!texto) return null
  // a frase acaba no ponto seguido de espaço e maiúscula: "26.1%" não corta
  const frases = texto.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý"“(])/)
  const fica = frases.map((f) => f.trim()).filter((f) => f && !temOrdem(f))
  return fica.length ? fica.join(' ') : null
}

/** O texto da IA pronto para a tela: sem ordem, o nome no lugar do ISIN, sem jargão, número brasileiro. */
function limpar(texto: string | null | undefined, posicoes: CarteiraPosicaoMundo[]): string | null {
  const t = semOrdem(texto)
  return t ? numerosBr(semJargao(trocarIsin(t, posicoes))) : null
}

/** O título da IA pronto para a tela. */
function tituloLimpo(titulo: string, posicoes: CarteiraPosicaoMundo[]): string {
  return numerosBr(semJargao(trocarIsin(titulo.trim(), posicoes)))
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
  // a análise antiga não se mistura com o que é de hoje: os itens dela vão para o fim
  const antigo = !!idade?.antiga

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
      antigo: false,
      pergunta: `A Redentia apontou ${m.label.toLowerCase()} como ponto de atenção na minha carteira (${m.value}). ${m.note} O que isso quer dizer para mim?`.replace(/\s+/g, ' ').trim(),
    }
    atencoes.set(m.label, a)
    itens.push(a)
  }

  /* 2. os riscos da análise escrita, com a data dela */
  for (const [i, r] of (analise?.risks ?? []).entries()) {
    if (!r?.title || tituloDeOrdem(r.title)) continue
    const titulo = tituloLimpo(r.title, posicoes)
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
      antigo,
      pergunta: `A análise da Redentia${idade && idade.dias > 0 ? ` de ${idade.data}` : ''} apontou na minha carteira: "${titulo}". Isso ainda vale hoje?`,
    })
  }

  /* 3. as recomendações viram ideias para avaliar: só as descritivas, com texto */
  for (const [i, r] of (analise?.recommendations ?? []).entries()) {
    if (!r?.title || tituloDeOrdem(r.title)) continue
    const titulo = tituloLimpo(r.title, posicoes)
    const texto = limpar(r.body, posicoes)
    // sem o texto (todas as frases eram ordem), o título sozinho é a ordem disfarçada
    if (r.body && !texto) continue
    itens.push({
      id: `ideia:${i}:${chave(r.title)}`,
      tipo: 'ideia',
      gravidade: null,
      selo: seloDe('ideia', null),
      titulo,
      texto,
      origem: 'analise',
      quando: quandoAnalise,
      dimensao: assuntoDe(`${r.title} ${r.body ?? ''}`),
      valor: null,
      confirmadoEm: null,
      antigo,
      pergunta: `A Redentia levantou uma ideia para avaliar na minha carteira: "${titulo}". O que eu deveria considerar antes?`,
    })
  }

  const deHoje = (a: Achado) => !a.antigo
  const pontos = itens.filter((a) => deHoje(a) && (a.tipo === 'atencao' || a.tipo === 'risco')).length
  const ideias = itens.filter((a) => deHoje(a) && a.tipo === 'ideia').length
  const antigos = itens.filter((a) => a.antigo).length

  /* 4. um contrapeso: o que vai bem. Com a análise recente, o ponto forte dela;
     sem ela, ou com ela antiga, a métrica Excelente de hoje (e o ponto forte
     antigo vai para o fim, a não ser que fale do mesmo que a métrica) */
  const forte = (analise?.strengths ?? []).find((s) => s?.title && !tituloDeOrdem(s.title))
  const exc = metricas.find((m) => m.tag === 'Excelente')
  const forcaDaMetrica = (m: RaioXMetricVM): Achado => ({
    id: `forca:${chave(m.label)}`,
    tipo: 'forca', gravidade: null, selo: seloDe('forca', null),
    titulo: `${m.label} em nível excelente`, texto: m.note || null,
    origem: 'raiox', quando: 'hoje', dimensao: m.label, valor: m.value, confirmadoEm: null, antigo: false,
    pergunta: `A Redentia viu ${m.label.toLowerCase()} como ponto forte da minha carteira (${m.value}). O que sustenta isso?`,
  })
  const forcaDaAnalise = (s: NonNullable<typeof forte>): Achado => {
    const titulo = tituloLimpo(s.title, posicoes)
    return {
      id: `forca:${chave(s.title)}`,
      tipo: 'forca', gravidade: null, selo: seloDe('forca', null),
      titulo, texto: limpar(s.body, posicoes),
      origem: 'analise', quando: quandoAnalise,
      dimensao: assuntoDe(`${s.title} ${s.body ?? ''}`), valor: null, confirmadoEm: null, antigo,
      pergunta: `A Redentia viu um ponto forte na minha carteira: "${titulo}". O que sustenta isso?`,
    }
  }
  if (forte && !antigo) {
    itens.push(forcaDaAnalise(forte))
  } else {
    const hoje = exc ? forcaDaMetrica(exc) : null
    if (hoje) itens.push(hoje)
    if (forte) {
      const f = forcaDaAnalise(forte)
      if (hoje && f.dimensao === hoje.dimensao) hoje.confirmadoEm = idade?.data ?? null
      else itens.push(f)
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
    antigos,
    ativos: posicoes.length,
    dimensoes: metricas.length,
    passos: metricas.map((m) => ({ dimensao: m.label, valor: m.value, tag: m.tag, atencao: m.tag === 'Atenção' })),
    olhouEm: quandoOlhou(e.olhadaEm, agora),
    analise: analise && idade ? { ...idade, desatualizada: analiseDesatualizada(analise.generated_at, e.ultimoSync, agora) } : null,
    vazio: pontos + ideias + antigos === 0,
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

/** Um pedaço do título da barra: texto, ou o número em destaque (com o tom dele). */
export interface PedacoDoTitulo {
  texto: string
  numero?: 'atencao' | 'ideia'
}

/**
 * O título da barra recolhida, no idioma do "PETR4 em resumo" do /asset:
 * 'A Redentia olhou a sua carteira: 2 pontos de atenção e 1 ideia para
 * avaliar', e a idade da análise ao lado, em cinza ('análise de 22/05,
 * desatualizada'), quando ela está desatualizada. Sem achado, a linha calma.
 * A contagem é a do que é de hoje: a análise antiga fica no grupo do fim.
 * `pedacos` é o mesmo título com os números separados, para o destaque.
 */
export function tituloDosAchados(vm: Pick<AchadosVM, 'pontos' | 'ideias' | 'vazio' | 'analise'>): { titulo: string; idade: string | null; pedacos: PedacoDoTitulo[] } {
  const idade = vm.analise?.desatualizada ? `análise de ${vm.analise.data}, desatualizada` : null
  const abre = 'A Redentia olhou a sua carteira: '
  const pedacos: PedacoDoTitulo[] = [{ texto: abre }]
  if (vm.vazio) pedacos.push({ texto: 'nada pede atenção' })
  else if (!vm.pontos && !vm.ideias) pedacos.push({ texto: 'nada pede atenção hoje' })
  else {
    if (vm.pontos) pedacos.push({ texto: String(vm.pontos), numero: 'atencao' }, { texto: ` ${vm.pontos === 1 ? 'ponto de atenção' : 'pontos de atenção'}` })
    if (vm.pontos && vm.ideias) pedacos.push({ texto: ' e ' })
    if (vm.ideias) pedacos.push({ texto: String(vm.ideias), numero: 'ideia' }, { texto: ` ${vm.ideias === 1 ? 'ideia para avaliar' : 'ideias para avaliar'}` })
  }
  return { titulo: pedacos.map((p) => p.texto).join(''), idade, pedacos }
}

/**
 * Os grupos: em cima, o que é de hoje, em duas colunas no desktop ("Pede
 * atenção" | as ideias e o que vai bem); embaixo, a análise antiga, apagada.
 */
const COLUNAS: { rotulo: string; tipos: TipoDoAchado[] }[][] = [
  [{ rotulo: 'Pede atenção', tipos: ['atencao', 'risco'] }],
  [{ rotulo: 'Ideias para avaliar', tipos: ['ideia'] }, { rotulo: 'Vai bem', tipos: ['forca'] }],
]

export interface OpcoesDoHtml {
  /** o aviso da análise antiga ('O que está em cima é de hoje. A análise escrita é de 22/05…') */
  aviso?: string | null
  /** troca o R$ pela máscara quando o olho está fechado */
  mascarar?: (t: string) => string
}

/** O rótulo da pergunta de cada linha (aparece no hover e no foco). */
export const PERGUNTAR_DO_ITEM = 'Perguntar à Redentia'

/**
 * Uma linha: o título e, à direita, o número de hoje (alinhado e tabular, como
 * os indicadores do /asset); embaixo o texto e, no pé da linha, o que diz de
 * quando é (só quando não é de hoje, ou o 'Vale olhar' do ponto leve, que diz
 * mais que o grupo) e, à direita, o "Perguntar à Redentia" da linha, que o
 * componente liga pelo data-achado.
 */
function linhaHtml(a: Achado, m: (t: string) => string): string {
  const meta = [
    a.gravidade === 'baixa' ? a.selo : null,
    a.quando !== 'hoje' && !a.antigo ? a.quando : null,
    a.confirmadoEm ? `a análise de ${a.confirmadoEm} já apontava` : null,
  ].filter(Boolean).join(' · ')
  const tom = a.tipo === 'ideia' ? 'ideia' : a.tipo === 'forca' ? 'forca' : (a.gravidade ?? 'media')
  return `<li class="cah__item cah__item--${tom}">`
    + `<p class="cah__linha"><b class="cah__t">${esc(a.titulo)}</b>${a.valor ? `<span class="cah__v">${esc(m(a.valor))}</span>` : ''}</p>`
    + (a.texto ? `<p class="cah__x">${esc(m(a.texto))}</p>` : '')
    + '<div class="cah__pe">'
    + (meta ? `<span class="cah__meta">${esc(meta)}</span>` : '')
    + `<button type="button" class="cah__perg" data-achado="${esc(a.id)}" aria-label="${esc(`${PERGUNTAR_DO_ITEM}: ${a.titulo}`)}">${PERGUNTAR_DO_ITEM}</button>`
    + '</div></li>'
}

function grupoHtml(rotulo: string, itens: Achado[], m: (t: string) => string, extra = ''): string {
  return `<p class="cah__grupo">${esc(rotulo)}${extra}</p><ul class="cah__lista">${itens.map((a) => linhaHtml(a, m)).join('')}</ul>`
}

/**
 * O miolo da barra aberta, já escapado, para o AtivoResumo revelar palavra por
 * palavra. A frase do que olhou; o que é de hoje em duas colunas ("Pede
 * atenção" | ideias e "Vai bem"; uma no celular); a análise antiga num grupo
 * próprio no fim ("Da análise de 22/05"); e o aviso. A cor do marcador
 * acompanha a gravidade, mas nunca sozinha. Sem achado, a linha calma.
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
    const hoje = vm.itens.filter((a) => !a.antigo)
    const colunas = COLUNAS
      .map((col) => col.map((g) => ({ g, itens: hoje.filter((a) => g.tipos.includes(a.tipo)) })).filter((x) => x.itens.length))
      .filter((col) => col.length)
      .map((col) => `<div class="cah__col">${col.map((x) => grupoHtml(x.g.rotulo, x.itens, m)).join('')}</div>`)
    if (colunas.length) out.push(`<div class="cah__cols cah__cols--${colunas.length}">${colunas.join('')}</div>`)
    else out.push('<p class="ars2__frase">Hoje, nada pede atenção.</p>')
    const velhos = vm.itens.filter((a) => a.antigo)
    if (velhos.length && vm.analise) {
      const dias = `<span class="cah__grupo-d">há ${vm.analise.dias} dias</span>`
      out.push(`<div class="cah__antiga">${grupoHtml(`Da análise de ${vm.analise.data}`, velhos, m, ` ${dias}`)}</div>`)
    }
  }
  if (o.aviso) out.push(`<p class="ars2__nota">${esc(o.aviso)}</p>`)
  return out.join('')
}
