/**
 * As palavras dos três tipos novos dos achados (05/11/2026; o dono, sobre a
 * barra: "ainda não, tente pensar em mais 3 tipos"). A conta continua toda em
 * achadosDaCarteira.ts (gravidade, ISIN, CVM, números, idade, dedupe); aqui só
 * se diz em palavras o que ela já decidiu, no jeito de cada tipo:
 *
 *  1. a leitura (o texto do AtivoProsa, o veredito da HomeAgora): um parágrafo
 *     na voz do agente, com os números em destaque, cada um uma pergunta;
 *  2. o diagnóstico em números (a grade do AtivoIndicadores, a faixa de três
 *     números da HomeAgora): cada dimensão com o número e um veredito curto;
 *  3. a conversa (o AtivoPerguntaChips e a barra do chat): cada achado vira a
 *     pergunta que o agente oferece.
 *
 * Nada de ordem: o que a Redentia diz é fato para olhar, e a pergunta que vai
 * para o chat é a do próprio achado (a `pergunta` dele). Sem Vue: o teste
 * (tests/achados-na-tela.test.ts) importa direto.
 */
import type { Achado, AchadosVM } from './achadosDaCarteira.ts'
import type { RaioXMetricVM } from '~/types/carteira'

type Mascara = (t: string) => string
const igual: Mascara = (t) => t

/** Um pedaço do texto: corrido, ou o número/termo em destaque, que abre o chat. */
export interface Trecho {
  t: string
  /** com pergunta, é botão: o clique abre o painel com ela */
  pergunta?: string
  tom?: 'atencao' | 'ok' | 'antigo'
}

/* ————— as palavras de cada dimensão ————— */

/** 'a renda' → 'A renda' */
const maiuscula = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s)

const ARTIGO: Record<string, string> = { 'Diversificação': 'a diversificação', Risco: 'o risco', Renda: 'a renda', Qualidade: 'a qualidade' }
const EXTENSO = ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis']

export function comArtigo(label: string): string {
  return ARTIGO[label] ?? label.toLowerCase()
}

/** 'Diversificação elevada' → 'diversificação elevada'; 'AUPO11 negocia pouco' fica. */
export function minuscula(s: string): string {
  if (!s) return s
  if (/^[A-ZÀ-Ý]{2}/.test(s)) return s
  return s[0]!.toLowerCase() + s.slice(1)
}

/** 'Dois pontos pedem atenção' | 'Um ponto pede atenção' */
export function pontosPorExtenso(n: number): string {
  const q = EXTENSO[n] ?? String(n)
  return n === 1 ? `${q} ponto pede atenção` : `${q} pontos pedem atenção`
}

/** O número da métrica dentro de uma frase: 'DY 1,6%' → '1,6% ao ano em proventos'; 'Beta 0,18' → 'beta 0,18'. */
export function numeroNaFrase(m: Pick<RaioXMetricVM, 'label' | 'value'>): string {
  const dy = m.value.match(/^DY\s+(.+)$/i)
  if (dy) return `${dy[1]} ao ano em proventos`
  const beta = m.value.match(/^Beta\s+(.+)$/i)
  if (beta) return `beta ${beta[1]}`
  return m.value
}

/** O número grande da grade: o miolo e o que vem antes ou depois dele, menor. */
export function numeroGrande(m: Pick<RaioXMetricVM, 'value'>): { antes: string | null; n: string; depois: string | null } {
  const v = m.value.trim()
  let x = v.match(/^(\d+)(\/100)$/)
  if (x) return { antes: null, n: x[1]!, depois: x[2]! }
  x = v.match(/^DY\s+(.+)$/i)
  if (x) return { antes: null, n: x[1]!, depois: 'ao ano' }
  x = v.match(/^Beta\s+(.+)$/i)
  if (x) return { antes: 'beta', n: x[1]!, depois: null }
  return { antes: null, n: v, depois: null }
}

/**
 * O que a nota da métrica acrescenta numa frase, quando acrescenta: quem puxa
 * a qualidade, para que lado a carteira oscila, onde ela se concentra. Lê a
 * nota que o buildRaioX escreve; sem casar, nada (a frase fica só no número).
 */
export function complementoDaNota(m: Pick<RaioXMetricVM, 'label' | 'note'>): string | null {
  const n = m.note ?? ''
  if (m.label === 'Qualidade') {
    const x = n.match(/:\s*(.+?)\s+puxam?\s+para\s+(baixo|cima)/)
    if (x) return `puxada para ${x[2]} por ${x[1]}`
    return null
  }
  if (m.label === 'Risco') {
    if (/oscila menos/.test(n)) return 'oscilando menos que o Ibovespa'
    if (/oscila mais/.test(n)) return 'oscilando mais que o Ibovespa'
    return null
  }
  if (m.label === 'Diversificação') {
    const x = n.match(/^([\d.,]+% em [^.]+)\./)
    return x ? `com ${x[1]}` : null
  }
  return null
}

/** O veredito curto da grade, na voz do agente. Sem dado que o sustente, o rótulo do Raio-X. */
export function vereditoDaMetrica(m: Pick<RaioXMetricVM, 'label' | 'tag' | 'note' | 'fillPct'>): string {
  const atencao = m.tag === 'Atenção'
  const excelente = m.tag === 'Excelente'
  switch (m.label) {
    case 'Diversificação':
      return atencao ? 'Concentrada.' : excelente ? 'Bem espalhada.' : 'Espalhada o bastante.'
    case 'Risco':
      if (/oscila menos/.test(m.note)) return 'Oscila menos que a bolsa.'
      if (/oscila mais/.test(m.note)) return 'Oscila mais que a bolsa.'
      return atencao ? 'Oscila muito.' : 'Oscila pouco.'
    case 'Renda':
      return atencao ? 'Paga pouco em proventos.' : excelente ? 'Paga bem em proventos.' : 'Paga na média.'
    // a Qualidade é o percentil no ranking do Redentia Score (buildRaioX): 50 é a mediana da bolsa
    case 'Qualidade':
      return m.fillPct < 45 ? 'Abaixo da média da bolsa.' : m.fillPct < 70 ? 'Na média da bolsa.' : m.fillPct < 85 ? 'Acima da média da bolsa.' : 'Entre as mais bem pontuadas.'
    default:
      return atencao ? 'Pede atenção.' : 'Vai bem.'
  }
}

/** O estado em palavras, ao lado do pontinho (a cor nunca vai sozinha). */
export function estadoDaMetrica(tag: string): string {
  return tag === 'Atenção' ? 'pede atenção' : tag === 'Excelente' ? 'vai bem' : 'sob controle'
}

/** A pergunta da métrica que não virou achado (a 'Controlado'): ela também abre o chat. */
export function perguntaDaMetrica(m: Pick<RaioXMetricVM, 'label' | 'value' | 'note'>): string {
  return `Como está ${comArtigo(m.label)} da minha carteira (${m.value})? ${m.note ?? ''} O que isso quer dizer para mim?`.replace(/\s+/g, ' ').trim()
}

/* ————— o veredito de uma linha ————— */

/** 'Dois pontos pedem atenção.' | '… e uma ideia para avaliar.' | 'Nada pede atenção hoje.' */
export function vereditoDosAchados(vm: Pick<AchadosVM, 'pontos' | 'ideias' | 'antigos' | 'vazio'>): string {
  if (vm.vazio) return 'Nada pede atenção.'
  const ideias = vm.ideias ? `${vm.ideias === 1 ? 'uma ideia' : `${(EXTENSO[vm.ideias] ?? String(vm.ideias)).toLowerCase()} ideias`} para avaliar` : ''
  if (!vm.pontos) return ideias ? `Nada pede atenção hoje, e há ${ideias}.` : 'Nada pede atenção hoje.'
  return `${pontosPorExtenso(vm.pontos)}${ideias ? ` e há ${ideias}` : ''}.`
}

/** 'Olhei os seus 18 ativos hoje às 12:17.' */
export function oQueOlhei(vm: Pick<AchadosVM, 'ativos' | 'olhouEm'>): string {
  const quando = vm.olhouEm ? ` ${vm.olhouEm}` : ''
  if (!vm.ativos) return `Olhei a sua carteira${quando}.`
  return vm.ativos === 1 ? `Olhei o seu ativo${quando}.` : `Olhei os seus ${vm.ativos} ativos${quando}.`
}

/* ————— 1. a leitura ————— */

/**
 * 'a, b e c'. Com um aposto no meio ('a renda, 1,6% ao ano em proventos'),
 * o 'e' leva vírgula antes, senão o aposto não fecha.
 */
function juntar(partes: Trecho[][]): Trecho[] {
  const out: Trecho[] = []
  const comAposto = partes.some((p) => p.length > 1)
  partes.forEach((p, i) => {
    if (i > 0) out.push({ t: i === partes.length - 1 ? (partes.length > 2 || comAposto ? ', e ' : ' e ') : ', ' })
    out.push(...p)
  })
  return out
}

function metricaDe(a: Achado, metricas: RaioXMetricVM[]): RaioXMetricVM | undefined {
  return a.origem === 'raiox' ? metricas.find((m) => m.label === a.dimensao) : undefined
}

/** A oração de um ponto de atenção: 'a renda, [1,6% ao ano em proventos]' ou o título da análise, em destaque. */
function oracao(a: Achado, metricas: RaioXMetricVM[], m: Mascara): Trecho[] {
  const met = metricaDe(a, metricas)
  if (met) {
    const c = complementoDaNota(met)
    return [{ t: `${comArtigo(met.label)}, ` }, { t: m(numeroNaFrase(met)), pergunta: a.pergunta, tom: 'atencao' }, ...(c ? [{ t: `, ${c}` }] : [])]
  }
  return [{ t: minuscula(a.titulo), pergunta: a.pergunta, tom: 'atencao' }]
}

export interface LeituraDosAchados {
  /** o parágrafo de hoje */
  hoje: Trecho[]
  /** a frase da análise antiga, quando ela tem itens próprios */
  antiga: Trecho[] | null
}

/**
 * O parágrafo do agente: o que olhou, o que vai bem, o que pede atenção (cada
 * número em destaque, com a pergunta dele) e as ideias de hoje. A análise
 * antiga vira uma frase à parte, com a data e os dias.
 */
export function leituraDosAchados(vm: AchadosVM, metricas: RaioXMetricVM[], mascarar: Mascara = igual): LeituraDosAchados {
  const m = mascarar
  const hoje: Trecho[] = [{ t: oQueOlhei(vm) }]
  const deHoje = vm.itens.filter((a) => !a.antigo)

  for (const f of deHoje.filter((a) => a.tipo === 'forca')) {
    const met = metricaDe(f, metricas)
    if (met) {
      const conf = f.confirmadoEm ? `, como a análise de ${f.confirmadoEm} já via` : ''
      hoje.push({ t: ` ${maiuscula(comArtigo(met.label))} está ${met.tag === 'Excelente' ? 'excelente' : 'bem'}, ` }, { t: m(numeroNaFrase(met)), pergunta: f.pergunta, tom: 'ok' }, { t: `${conf}.` })
    } else {
      hoje.push({ t: ' Um ponto forte: ' }, { t: minuscula(f.titulo), pergunta: f.pergunta, tom: 'ok' }, { t: '.' })
    }
  }

  const pontos = deHoje.filter((a) => a.tipo === 'atencao' || a.tipo === 'risco')
  if (pontos.length) {
    hoje.push({ t: ` ${pontosPorExtenso(pontos.length)}: ` }, ...juntar(pontos.map((a) => oracao(a, metricas, m))), { t: '.' })
  } else {
    hoje.push({ t: vm.vazio ? ' Nada pede atenção agora.' : ' Hoje, nada pede atenção.' })
  }

  const ideias = deHoje.filter((a) => a.tipo === 'ideia')
  if (ideias.length) {
    hoje.push({ t: ideias.length === 1 ? ' E uma ideia para avaliar: ' : ` E ${(EXTENSO[ideias.length] ?? String(ideias.length)).toLowerCase()} ideias para avaliar: ` })
    hoje.push(...juntar(ideias.map((a) => [{ t: minuscula(a.titulo), pergunta: a.pergunta, tom: 'ok' as const }])), { t: '.' })
  }

  const velhos = vm.itens.filter((a) => a.antigo)
  let antiga: Trecho[] | null = null
  if (velhos.length && vm.analise) {
    antiga = [
      { t: `Na análise de ${vm.analise.data}, há ${vm.analise.dias} dias, eu via também ` },
      ...juntar(velhos.map((a) => [{ t: minuscula(a.titulo), pergunta: a.pergunta, tom: 'antigo' as const }])),
      { t: '. Pode já não valer.' },
    ]
  }
  return { hoje, antiga }
}

/* ————— 2. o diagnóstico em números ————— */

export interface NumeroDoDiagnostico {
  label: string
  antes: string | null
  n: string
  depois: string | null
  tom: 'atencao' | 'ok'
  estado: string
  veredito: string
  nota: string
  pergunta: string
}

/** Uma casa por dimensão do Raio-X, na ordem dele; a pergunta é a do achado, quando ele existe. */
export function numerosDoDiagnostico(vm: AchadosVM, metricas: RaioXMetricVM[], mascarar: Mascara = igual): NumeroDoDiagnostico[] {
  return metricas.map((met) => {
    const achado = vm.itens.find((a) => a.origem === 'raiox' && a.dimensao === met.label)
    return {
      label: met.label,
      ...numeroGrande(met),
      tom: met.tag === 'Atenção' ? 'atencao' : 'ok',
      estado: estadoDaMetrica(met.tag),
      veredito: vereditoDaMetrica(met),
      nota: mascarar(met.note ?? ''),
      pergunta: mascarar(achado?.pergunta ?? perguntaDaMetrica(met)),
    }
  })
}

/* ————— 3. a conversa ————— */

export interface PerguntaDoAgente {
  id: string
  /** o que o agente oferece, na voz dele */
  oferta: string
  /** o que vai para o chat, na voz da pessoa (a pergunta do achado) */
  pergunta: string
  tom: 'atencao' | 'ok' | 'antigo'
}

function ofertaDaMetrica(a: Achado, met: RaioXMetricVM, m: Mascara): string {
  const num = m(numeroNaFrase(met))
  const c = complementoDaNota(met)
  if (a.tipo === 'forca') return `${maiuscula(comArtigo(met.label))} está ${met.tag === 'Excelente' ? 'excelente' : 'bem'}, ${num}. Quer ver o que sustenta isso?`
  switch (met.label) {
    case 'Renda': return `A sua renda está em ${num}. Quer ver de onde ela vem?`
    case 'Qualidade': return `A qualidade está em ${num}${c ? `, ${c}` : ''}. Quer entender por quê?`
    case 'Diversificação': return `A diversificação está em ${num}${c ? `, ${c}` : ''}. Quer ver onde a carteira se concentra?`
    case 'Risco': return `A carteira está com ${num}${c ? `, ${c}` : ''}. Quer ver quem puxa isso?`
    default: return `${met.label} pede atenção, ${num}. Quer entender?`
  }
}

/**
 * As perguntas que o agente oferece, na ordem dos achados (a primeira é a que
 * vai na barra). A análise antiga vira uma pergunta só, com a data e os dias.
 */
export function perguntasDoAgente(vm: AchadosVM, metricas: RaioXMetricVM[], mascarar: Mascara = igual): PerguntaDoAgente[] {
  const m = mascarar
  const out: PerguntaDoAgente[] = []
  for (const a of vm.itens.filter((x) => !x.antigo)) {
    const met = metricaDe(a, metricas)
    const tom = a.tipo === 'atencao' || a.tipo === 'risco' ? 'atencao' : 'ok'
    let oferta: string
    if (met) oferta = ofertaDaMetrica(a, met, m)
    else if (a.tipo === 'ideia') oferta = `Tenho uma ideia para avaliar: ${minuscula(a.titulo)}. Quer olhar comigo?`
    else if (a.tipo === 'forca') oferta = `Um ponto forte: ${minuscula(a.titulo)}. Quer ver o que sustenta isso?`
    else oferta = `Eu vi ${minuscula(a.titulo)}. Quer conferir quanto isso pesa?`
    out.push({ id: a.id, oferta, pergunta: m(a.pergunta), tom })
  }
  const velhos = vm.itens.filter((a) => a.antigo)
  if (velhos.length && vm.analise) {
    const n = velhos.length
    out.push({
      id: 'antiga',
      oferta: `Na análise de ${vm.analise.data}, há ${vm.analise.dias} dias, eu via mais ${n === 1 ? 'um ponto' : `${n} pontos`}. Quer conferir se ${n === 1 ? 'ainda vale' : 'ainda valem'}?`,
      pergunta: `A análise da Redentia de ${vm.analise.data} apontou na minha carteira: ${velhos.map((a) => `"${a.titulo}"`).join(', ')}. Isso ainda vale hoje?`,
      tom: 'antigo',
    })
  }
  return out
}
