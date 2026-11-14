/**
 * Repartir os textos longos da tese (11/11/2026, docs/aportou/tese.md).
 *
 * O backend guarda três textos de cada ativo da tese como chegam do estudo
 * diário, e a tela despejava os três inteiros:
 *  - `status`: "Núcleo Revalidação de 10 de novembro de 2026: Caiu 6,37%…";
 *  - `catalyst`: o gatilho original seguido de um registro que só cresce, com
 *    ~20 "Revalidação de <data>: …" coladas uma na outra;
 *  - `rationale`: um parágrafo de 1 a 3 mil caracteres.
 * Aqui eles viram partes (o selo, a data, a linha do tempo, os dois primeiros
 * períodos), SEM perder texto: a soma das partes é o texto original, a menos
 * dos prefixos "Revalidação de <data>:". Funções puras, sem Vue.
 */

const MESES: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

/** "10 de novembro de 2026" | "1º de outubro de 2026" → '2026-11-10'; fora do formato, null. */
export function dataDoExtenso(texto: string): string | null {
  const m = /^\s*(\d{1,2})\s*(?:º|°|o)?\s+de\s+([A-Za-zçÇ]+)\s+de\s+(\d{4})\s*$/.exec(semAcento(texto).replace(/ç/g, 'c'))
  if (!m) return null
  const mes = MESES[m[2]!.toLowerCase()]
  const dia = Number(m[1])
  if (!mes || dia < 1 || dia > 31) return null
  return `${m[3]}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/** '2026-11-10' → '10/11' */
export function dataCurta(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return m ? `${m[3]}/${m[2]}` : ''
}
/** '2026-11-10' → '10/11/2026' */
export function dataBr(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

// "Revalidação de <até 40 caracteres sem dois-pontos>:" com e sem acento
const REVALIDACAO = /Revalida(?:ç|c)(?:ã|a)o\s+de\s+([^:]{1,40}):\s*/gi

/* ————— status ————— */

export interface PartesDoStatus {
  /** o papel na tese: 'Núcleo', 'Acompanhar', 'Em risco' */
  selo?: string
  /** a data da revalidação, 'AAAA-MM-DD' */
  data?: string
  /** a frase, sem o prefixo */
  texto: string
}

// o que o backend usa como papel/decisão no começo do status
const SELOS = /^(N[úu]cleo|Acompanhar|Em risco|Em observa[çc][ãa]o|Mant[ée]m|Entra|Sai|Reduz)\b[\s:·,-]*/i

/**
 * "Núcleo Revalidação de 10 de novembro de 2026: Caiu 6,37%…" →
 * { selo: 'Núcleo', data: '2026-11-10', texto: 'Caiu 6,37%…' }.
 * Status curto ("Acompanhar") é só o selo. Sem nada reconhecível, o texto sai inteiro.
 */
export function partesDoStatus(status: string | null | undefined): PartesDoStatus {
  const cru = (status ?? '').trim()
  if (!cru) return { texto: '' }
  REVALIDACAO.lastIndex = 0
  const m = REVALIDACAO.exec(cru)
  if (m) {
    const antes = cru.slice(0, m.index).trim()
    const data = dataDoExtenso(m[1]!)
    const depois = cru.slice(m.index + m[0].length).trim()
    // o que vem antes do marcador é o selo quando é curto; se não for, é texto e fica
    const seloCurto = antes.length > 0 && antes.length <= 24
    const texto = [seloCurto ? '' : antes, data ? '' : cru.slice(m.index, m.index + m[0].length).trim(), depois].filter(Boolean).join(' ')
    return { ...(seloCurto ? { selo: antes } : {}), ...(data ? { data } : {}), texto }
  }
  if (cru.length <= 24) return { selo: cru, texto: '' }
  const s = SELOS.exec(cru)
  if (s) return { selo: s[1]!, texto: cru.slice(s[0].length).trim() }
  return { texto: cru }
}

/* ————— catalyst ————— */

export interface RevisaoDoCatalyst {
  /** 'AAAA-MM-DD'; null quando o prefixo não traz uma data legível (aí o prefixo fica no texto) */
  data: string | null
  texto: string
}
export interface PartesDoCatalyst {
  /** o que vem antes da primeira revalidação: o gatilho original */
  gatilho: string
  /** na ordem do texto (da mais velha para a mais nova, como o backend grava) */
  revisoes: RevisaoDoCatalyst[]
}

/** O catalyst repartido: o gatilho + uma revisão por "Revalidação de <data>:". */
export function partesDoCatalyst(catalyst: string | null | undefined): PartesDoCatalyst {
  const cru = (catalyst ?? '').trim()
  if (!cru) return { gatilho: '', revisoes: [] }
  const marcas: { ini: number; fim: number; data: string | null }[] = []
  REVALIDACAO.lastIndex = 0
  for (let m = REVALIDACAO.exec(cru); m; m = REVALIDACAO.exec(cru)) {
    marcas.push({ ini: m.index, fim: m.index + m[0].length, data: dataDoExtenso(m[1]!) })
  }
  if (!marcas.length) return { gatilho: cru, revisoes: [] }
  const revisoes = marcas.map((mk, i) => {
    const ate = marcas[i + 1]?.ini ?? cru.length
    // sem data legível o prefixo não some: fica no texto
    return { data: mk.data, texto: cru.slice(mk.data ? mk.fim : mk.ini, ate).trim() }
  })
  return { gatilho: cru.slice(0, marcas[0]!.ini).trim(), revisoes }
}

/** As revisões da mais nova para a mais velha (sem data vão para o fim, na ordem do texto). */
export function revisoesDaMaisNova(revisoes: RevisaoDoCatalyst[]): RevisaoDoCatalyst[] {
  return revisoes
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      if (a.r.data && b.r.data) return a.r.data === b.r.data ? b.i - a.i : (a.r.data < b.r.data ? 1 : -1)
      if (a.r.data) return -1
      if (b.r.data) return 1
      return a.i - b.i
    })
    .map((x) => x.r)
}

/* ————— marcadores em caixa alta ————— */

export type TomDoMarcador = 'verde' | 'ambar' | 'vermelho' | 'neutro'
export interface MarcadorDoTexto {
  inicio: number
  fim: number
  texto: string
  tom: TomDoMarcador
}

// uma sequência de palavras em caixa alta ("SELL-SIDE A FAVOR", "RECOMPOSIÇÃO DE
// MARGEM NO 3T26 CUMPRIDA"), que pode levar trimestre (3T26, 2S26) ou número no meio
const PALAVRA = '[A-ZÀ-Ý]+(?:-[A-ZÀ-Ý]+)*'
const SEQUENCIA = new RegExp(`(?<![\\p{L}\\p{N}-])(?:A\\s+)?[A-ZÀ-Ý]{2,}(?:-[A-ZÀ-Ý]+)*(?:\\s+(?:${PALAVRA}|\\d[TS]\\d{2}|\\d{1,4}))*(?![\\p{L}\\p{N}])`, 'gu')
// ligações e números não fecham um marcador ("CUMPRIDO EM", "BACKLOG CONFIRMADO EM 29")
const LIGACAO = /^(?:A|O|E|AS|OS|AO|DE|DO|DA|DOS|DAS|EM|NO|NA|NOS|NAS|POR|COM|SEM|PARA|\d[TS]\d{2}|\d{1,4})$/
// palavras que, sozinhas, já são um veredito
const VEREDITO = /^(?:CONFIRMAD[OA]S?|CUMPRID[OA]S?|PENDENTES?|FAVOR|CONTRA|INVERTID[OA]S?|PRESSAO|PRESSIONAD[OA]S?|FALHOU|REAGENDAD[OA]S?|ADIAD[OA]S?|ATRASAD[OA]S?|NEGATIV[OA]S?|POSITIV[OA]S?|REFUTAD[OA]S?|REAFIRMAD[OA]S?|RECORDE)$/
const UNIDADE = /^(?:GW|MW|KW|GWH|MWH|US|BI|MI|PP|BPS)$/
// siglas compridas que não são marcador ("EBITDA AJUSTADO" não aparece em caixa alta, mas a sigla sim)
const SIGLA = /^(?:EBITDA|EBIT|IEEPA|NASDAQ|IBOVESPA|CAPEX|OPEX|FOMC|COPOM)$/

function tomDoMarcador(palavras: string[]): TomDoMarcador {
  const tem = (re: RegExp) => palavras.some((p) => re.test(p))
  const junto = palavras.join(' ')
  if (/^NAO /.test(junto)) return 'ambar'
  if (tem(/^(?:CONTRA|INVERTID[OA]S?|FALHOU|NEGATIV[OA]S?)$/)) return 'vermelho'
  if (tem(/^(?:PENDENTES?|PRESSAO|PRESSIONAD[OA]S?|REAGENDAD[OA]S?|ADIAD[OA]S?|ATRASAD[OA]S?)$/) || /\bSEM FATO\b/.test(junto)) return 'ambar'
  if (tem(/^(?:CONFIRMAD[OA]S?|CUMPRID[OA]S?|FAVOR|POSITIV[OA]S?)$/)) return tem(/^RISCO$/) ? 'ambar' : 'verde'
  return 'neutro'
}

/**
 * Os marcadores em caixa alta de um texto de revalidação (`CONFIRMADA`,
 * `PENDENTE`, `FILTRO MACRO CONTRA`, `SELL-SIDE A FAVOR`, `SEM FATO NOVO`…),
 * com a posição e o tom do selo: verde para CONFIRMAD*, CUMPRID* e A FAVOR;
 * âmbar para PENDENTE, SOB PRESSÃO, SEM FATO NOVO, REAGENDAD* e o que vem com
 * NÃO; vermelho para CONTRA, INVERTIDO, FALHOU e NEGATIVO; neutro para o resto.
 * Sigla solta (AMD, EUA, EBITDA, 3T26) não é marcador.
 */
export function marcadoresDoTexto(texto: string | null | undefined): MarcadorDoTexto[] {
  const cru = texto ?? ''
  const achados: MarcadorDoTexto[] = []
  SEQUENCIA.lastIndex = 0
  for (let m = SEQUENCIA.exec(cru); m; m = SEQUENCIA.exec(cru)) {
    // apara ligações e números do fim (e o "A" do começo quando não é "A FAVOR")
    const fichas = [...m[0].matchAll(/\S+/g)].map((f) => ({ t: f[0], i: f.index! }))
    while (fichas.length && LIGACAO.test(fichas[fichas.length - 1]!.t)) fichas.pop()
    if (fichas.length > 1 && fichas[0]!.t === 'A' && fichas[1]!.t !== 'FAVOR') fichas.shift()
    // unidade colada no número de antes ("1 GW PENDENTE") não faz parte do marcador
    while (fichas.length > 1 && UNIDADE.test(fichas[0]!.t)) fichas.shift()
    if (!fichas.length) continue
    const palavras = fichas.map((f) => semAcento(f.t)).filter((p) => /^[A-Z-]+$/.test(p))
    const veredito = palavras.some((p) => VEREDITO.test(p)) || /\bSEM FATO\b/.test(palavras.join(' '))
    const frase = palavras.length >= 2 && palavras.some((p) => p.replace(/-/g, '').length >= 5 && !SIGLA.test(p))
    if (!veredito && !frase) continue
    const ini = m.index + fichas[0]!.i
    const ult = fichas[fichas.length - 1]!
    const fim = m.index + ult.i + ult.t.length
    achados.push({ inicio: ini, fim, texto: cru.slice(ini, fim), tom: tomDoMarcador(palavras) })
  }
  return achados
}

export interface TrechoDoTexto {
  texto: string
  /** presente quando o trecho é um marcador (vira selo) */
  tom?: TomDoMarcador
}

/** O texto em trechos, na ordem: prosa e marcadores. Juntar os trechos devolve o texto. */
export function trechosDoTexto(texto: string | null | undefined): TrechoDoTexto[] {
  const cru = texto ?? ''
  const out: TrechoDoTexto[] = []
  let pos = 0
  for (const mk of marcadoresDoTexto(cru)) {
    if (mk.inicio > pos) out.push({ texto: cru.slice(pos, mk.inicio) })
    out.push({ texto: mk.texto, tom: mk.tom })
    pos = mk.fim
  }
  if (pos < cru.length) out.push({ texto: cru.slice(pos) })
  return out
}

/* ————— os primeiros períodos (o "Ler tudo") ————— */

// fim de período: ponto, exclamação ou interrogação seguidos de espaço e de
// maiúscula (ou aspas/parêntese abrindo). "R$ 1,4", "a/a." no meio e "6,3%" não cortam.
const FIM_DE_PERIODO = /[.!?…]["”)]?\s+(?=["“(]?[A-ZÀ-Ý])/g

/**
 * Os `n` primeiros períodos à vista e o resto para o "Ler tudo". Texto curto
 * (até `n` períodos) sai inteiro em `inicio`, com `resto` vazio.
 */
export function primeirosPeriodos(texto: string | null | undefined, n = 2): { inicio: string; resto: string } {
  const cru = (texto ?? '').trim()
  if (!cru) return { inicio: '', resto: '' }
  FIM_DE_PERIODO.lastIndex = 0
  let corte = -1
  let vistos = 0
  for (let m = FIM_DE_PERIODO.exec(cru); m; m = FIM_DE_PERIODO.exec(cru)) {
    vistos++
    if (vistos === n) { corte = m.index + m[0].length; break }
  }
  if (corte < 0) return { inicio: cru, resto: '' }
  return { inicio: cru.slice(0, corte).trim(), resto: cru.slice(corte).trim() }
}
