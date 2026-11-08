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
 */
import type { NotaDoAviso, PilarDaNota } from '../types/carteiraVisao'

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
