/**
 * A faixa das notas no aviso (08/11/2026): o antes → depois das 4 notas do
 * relatório que uma ideia traz (`Aviso.notas`), em células prontas para a tela
 * e para o leitor de tela (CarteiraAvisos). Pura e sem `~`, porque o node:test
 * não resolve o alias; teste em tests/notasDoAviso.test.ts.
 *
 * As notas do relatório são inteiras, de 0 a 100. Arredondo para a faixa nunca
 * mostrar 40,4, e o delta sai dos números mostrados. Nota não é R$: não passa
 * pela máscara do olho. Se uma nota cair (o veto `notas` do backend barra a
 * ideia que baixa alguma), a célula mostra a queda como ela é.
 *
 * Embaixo da faixa, os indicadores que mudam (`Aviso.indicadores`, 08/11): o
 * "só 1 número?" do dono, quando uma nota sobe e as outras ficam iguais.
 */
import type { IndicadorDoAviso, NotaDoAviso, PilarDaNota } from '../types/carteiraVisao'

export interface CelulaDaNota {
  pilar: PilarDaNota
  nome: string
  antes: number | null
  depois: number | null
  /** depois − antes; null quando falta um dos dois */
  delta: number | null
  sobe: boolean
  igual: boolean
  /** '+3' · '−2' (com o sinal de menos de verdade); null quando fica igual ou falta um dos dois */
  deltaTxt: string | null
  /** o que o leitor de tela lê: 'Retorno: de 40 para 43' · 'Diversificação: fica em 94' */
  aria: string
  /** a barra, de 0 a 100: o trecho cheio vai até `base` (a menor das duas) e a faixa que muda, de `base` até `topo` */
  base: number
  topo: number
}

/** o nome de cada pilar, para a célula nunca sair sem nome */
const NOME: Record<PilarDaNota, string> = { retorno: 'Retorno', risco: 'Risco', eficiencia: 'Eficiência', diversificacao: 'Diversificação' }

const inteira = (v: number | null | undefined): number | null => (v == null || !Number.isFinite(v) ? null : Math.round(v))
const naBarra = (v: number) => Math.max(0, Math.min(100, v))

function aria(nome: string, antes: number | null, depois: number | null): string {
  if (antes != null && depois != null) return antes === depois ? `${nome}: fica em ${depois}` : `${nome}: de ${antes} para ${depois}`
  return antes != null ? `${nome}: ${antes} antes, sem nota depois` : `${nome}: sem nota antes, ${depois} depois`
}

/** as células da faixa, na ordem em que o backend manda (a dos pilares); sem nenhum dos dois números, a nota sai */
export function celulasDasNotas(notas: NotaDoAviso[] | null | undefined): CelulaDaNota[] {
  if (!notas?.length) return []
  const out: CelulaDaNota[] = []
  for (const n of notas) {
    const antes = inteira(n.antes)
    const depois = inteira(n.depois)
    if (antes == null && depois == null) continue
    const nome = n.nome || NOME[n.pilar] || n.pilar
    const delta = antes != null && depois != null ? depois - antes : null
    const conhecidas = [antes, depois].filter((v): v is number => v != null)
    out.push({
      pilar: n.pilar,
      nome,
      antes,
      depois,
      delta,
      sobe: delta != null && delta > 0,
      igual: delta === 0,
      deltaTxt: !delta ? null : delta > 0 ? `+${delta}` : `−${-delta}`,
      aria: aria(nome, antes, depois),
      base: naBarra(Math.min(...conhecidas)),
      topo: naBarra(Math.max(...conhecidas)),
    })
  }
  return out
}

/* ————— os indicadores que mudam ————— */

export interface IndicadorQueMuda {
  chave: string
  /** o nome curto ('Sharpe', 'Maior queda'); sem um curto, o do relatório */
  nome: string
  /** como o relatório escreve: '−0,05' · '10,6%' · '22' */
  antes: string
  depois: string
  /** pelo `melhor` do backend: subir é bom ('maior') ou cair é bom ('menor') */
  melhora: boolean
  /** o que o leitor de tela lê: 'Sharpe: de −0,05 para −0,01, melhora' */
  aria: string
}

/** o nome curto de cada indicador do catálogo do relatório; o relatório mostra o nome inteiro */
const NOME_CURTO: Record<string, string> = {
  twr: 'TWR', mwr: 'MWR', cagr: 'CAGR', retorno_real: 'Acima da inflação',
  volatilidade: 'Volatilidade', downside_deviation: 'Volatilidade das quedas', max_drawdown: 'Maior queda', beta: 'Beta', r2: 'R²',
  sharpe: 'Sharpe', sortino: 'Sortino', treynor: 'Treynor', alpha_jensen: 'Alpha', m2: 'M²',
  information_ratio: 'Information ratio', tracking_error: 'Tracking error', appraisal_ratio: 'Appraisal',
  maior_posicao: 'Maior posição', maior_classe: 'Maior classe',
}

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
/**
 * O valor na unidade dele, com as regras do `valorDoIndicador` do relatório
 * (utils/relatorioCarteira.ts): % com 1 casa, razão com 2 (inteira, sem casa)
 * e o sinal de menos de verdade. Copiadas porque o node:test não resolve o
 * import sem extensão; um teste confere que os dois escrevem igual.
 */
function valorNaUnidade(v: number, unidade: IndicadorDoAviso['unidade']): string {
  const sinal = v < 0 ? '−' : ''
  const a = Math.abs(v)
  if (unidade === '%') return `${sinal}${nf1.format(a)}%`
  return `${sinal}${Number.isInteger(v) ? nf0.format(a) : nf2.format(a)}`
}

/**
 * A ordem da linha (08/11/2026): primeiro um de cada pilar, o mais conhecido
 * (TWR, Maior queda, Sharpe, Maior classe), depois o resto. Na ordem do
 * catálogo, as quatro medidas de retorno (TWR, MWR, CAGR e acima da inflação),
 * que dizem quase a mesma coisa, tomavam a linha, e o Sharpe e a maior queda
 * iam para o "e mais N".
 */
const ORDEM = [
  'twr', 'max_drawdown', 'sharpe', 'maior_classe',
  'volatilidade', 'sortino', 'alpha_jensen', 'beta', 'maior_posicao', 'm2',
  'retorno_real', 'mwr', 'cagr', 'downside_deviation', 'treynor', 'information_ratio', 'tracking_error', 'appraisal_ratio', 'r2',
  'numero_de_ativos', 'correlacao_media',
]
const posicao = (chave: string) => {
  const i = ORDEM.indexOf(chave)
  return i === -1 ? ORDEM.length : i
}

/**
 * Os indicadores da linha, na ORDEM de cima (o que não está nela vai para o
 * fim, na ordem em que o backend manda). Sai o que, escrito como o relatório
 * escreve, fica igual ('10,6%' → '10,6%'), o que não tem os dois valores e o
 * que vem numa unidade fora do contrato (um R$ apareceria com o olho fechado:
 * a linha não passa pela máscara).
 */
export function indicadoresQueMudam(indicadores: IndicadorDoAviso[] | null | undefined): IndicadorQueMuda[] {
  if (!indicadores?.length) return []
  const out: IndicadorQueMuda[] = []
  for (const i of indicadores) {
    if (i.unidade !== '%' && i.unidade !== 'x' && i.unidade !== '') continue
    if (i.antes == null || i.depois == null || !Number.isFinite(i.antes) || !Number.isFinite(i.depois)) continue
    const antes = valorNaUnidade(i.antes, i.unidade)
    const depois = valorNaUnidade(i.depois, i.unidade)
    if (antes === depois) continue
    const melhora = i.melhor === 'menor' ? i.depois < i.antes : i.depois > i.antes
    const nome = NOME_CURTO[i.chave] ?? (i.nome || i.chave)
    out.push({ chave: i.chave, nome, antes, depois, melhora, aria: `${nome}: de ${antes} para ${depois}, ${melhora ? 'melhora' : 'piora'}` })
  }
  return out
    .map((x, k) => ({ x, k }))
    .sort((a, b) => posicao(a.x.chave) - posicao(b.x.chave) || a.k - b.k)
    .map(({ x }) => x)
}

/**
 * Quantos indicadores a linha do cartão mostra: até 8, e só o que cabe em 2
 * linhas no desktop; o resto vai para o "Como calculei", atrás do "e mais N".
 * No cartão de 720 px a linha tem 622 px, uns 86 caracteres no corpo denso (a
 * Plus Jakarta Sans a 13 px dá ~7 px por caractere, medido em 08/11 com os
 * nomes curtos e os números do relatório). O separador " · " custa 3 e o
 * "e mais N", 7 mais os dígitos. Com nomes curtos cabem os 8; com os longos
 * ("Volatilidade das quedas", "Information ratio"), uns 4. No celular, a mesma
 * lista quebra em mais linhas.
 */
export function quantosNaLinha(itens: Pick<IndicadorQueMuda, 'nome' | 'antes' | 'depois'>[], porLinha = 86, linhas = 2, max = 8): number {
  const texto = (i: Pick<IndicadorQueMuda, 'nome' | 'antes' | 'depois'>) => `${i.nome} ${i.antes} → ${i.depois}`.length
  // os k primeiros (e o "e mais N", se sobrar algum) cabem nas linhas?
  const cabem = (k: number) => {
    let linha = 1
    let usado = 0
    const poe = (custo: number) => {
      if (usado > 0 && usado + custo > porLinha) {
        linha++
        usado = 0
      }
      usado += custo
    }
    for (let j = 0; j < k; j++) poe(texto(itens[j]!) + (j < k - 1 || k < itens.length ? 3 : 0))
    if (k < itens.length) poe(7 + String(itens.length - k).length)
    return linha <= linhas
  }
  for (let k = Math.min(max, itens.length); k > 1; k--) if (cabem(k)) return k
  return Math.min(1, itens.length)
}
