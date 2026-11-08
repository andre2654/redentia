/**
 * As notas da ideia no aviso (08/11/2026): as células do antes → depois das 4
 * notas do relatório (utils/notasDoAviso.ts) e o relatório que abre com a troca
 * do hash (VisaoRelatorio.vue). Os .vue são lidos como texto: não dependem do
 * Nuxt.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { celulasDasNotas } from '../app/utils/notasDoAviso.ts'
import type { NotaDoAviso } from '../app/types/carteiraVisao.ts'

const nota = (pilar: NotaDoAviso['pilar'], nome: string, antes: number | null, depois: number | null): NotaDoAviso => ({ pilar, nome, antes, depois })
const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('a nota que sobe: os números, o +N e a barra do antes até o depois', () => {
  assert.deepEqual(celulasDasNotas([nota('retorno', 'Retorno', 40, 43)]), [{
    pilar: 'retorno', nome: 'Retorno', antes: 40, depois: 43, delta: 3, sobe: true, igual: false,
    deltaTxt: '+3', aria: 'Retorno: de 40 para 43', base: 40, topo: 43,
  }])
})

test('a nota que fica igual: só o número, sem delta e sem faixa', () => {
  const [c] = celulasDasNotas([nota('diversificacao', 'Diversificação', 94, 94)])
  assert.equal(c!.igual, true)
  assert.equal(c!.sobe, false)
  assert.equal(c!.delta, 0)
  assert.equal(c!.deltaTxt, null)
  assert.equal(c!.aria, 'Diversificação: fica em 94')
  assert.deepEqual([c!.base, c!.topo], [94, 94])
})

test('a nota que cai aparece como é: −N, e a faixa vai do depois até o antes', () => {
  const [c] = celulasDasNotas([nota('risco', 'Risco', 74, 72)])
  assert.equal(c!.sobe, false)
  assert.equal(c!.igual, false)
  assert.equal(c!.delta, -2)
  assert.equal(c!.deltaTxt, '−2')
  assert.equal(c!.aria, 'Risco: de 74 para 72')
  assert.deepEqual([c!.base, c!.topo], [72, 74])
})

test('sem os dois números a nota sai; com um só, a célula diz qual falta', () => {
  const cs = celulasDasNotas([
    nota('retorno', 'Retorno', null, null),
    nota('risco', 'Risco', null, 74),
    nota('eficiencia', 'Eficiência', 37, null),
  ])
  assert.deepEqual(cs.map((c) => c.pilar), ['risco', 'eficiencia'])
  assert.equal(cs[0]!.aria, 'Risco: sem nota antes, 74 depois')
  assert.equal(cs[1]!.aria, 'Eficiência: 37 antes, sem nota depois')
  for (const c of cs) {
    assert.equal(c.delta, null)
    assert.equal(c.deltaTxt, null)
    assert.equal(c.sobe, false)
    assert.equal(c.igual, false)
    assert.equal(c.base, c.topo, `${c.pilar}: faixa sem os dois números`)
  }
})

test('as quatro notas do pedido do dono, na ordem dos pilares', () => {
  const cs = celulasDasNotas([
    nota('retorno', 'Retorno', 40, 43), nota('risco', 'Risco', 73, 74),
    nota('eficiencia', 'Eficiência', 37, 41), nota('diversificacao', 'Diversificação', 94, 94),
  ])
  assert.deepEqual(cs.map((c) => c.aria), ['Retorno: de 40 para 43', 'Risco: de 73 para 74', 'Eficiência: de 37 para 41', 'Diversificação: fica em 94'])
  assert.deepEqual(cs.map((c) => c.deltaTxt), ['+3', '+1', '+4', null])
})

test('sem notas, nenhuma célula (o backend antigo e o aviso sem movimento)', () => {
  assert.deepEqual(celulasDasNotas(undefined), [])
  assert.deepEqual(celulasDasNotas(null), [])
  assert.deepEqual(celulasDasNotas([]), [])
})

test('a nota é inteira, a barra fica entre 0 e 100 e o nome vazio vira o do pilar', () => {
  const [c] = celulasDasNotas([nota('eficiencia', '', 40.4, 41.6)])
  assert.equal(c!.nome, 'Eficiência')
  assert.deepEqual([c!.antes, c!.depois, c!.delta, c!.deltaTxt, c!.aria], [40, 42, 2, '+2', 'Eficiência: de 40 para 42'])
  const [fora] = celulasDasNotas([nota('risco', 'Risco', -3, 104)])
  assert.deepEqual([fora!.base, fora!.topo], [0, 100])
})

test('o relatório abre com a troca do hash, como abre ao chegar com ele, e o aviso troca o hash sem perder a query', () => {
  const script = ler('app/components/carteira/visao/VisaoRelatorio.vue').split('</script>')[0]!
  assert.match(script, /const ANCORAS = \['relatorio', 'desempenho', 'movimentacoes', 'pnl'\]/)
  assert.match(script, /onMounted\(\(\) => abrirNaAncora\(route\.hash\)\)/)
  assert.match(script, /watch\(\(\) => route\.hash, abrirNaAncora\)/)
  const abrir = script.slice(script.indexOf('function abrirNaAncora'), script.indexOf('onMounted('))
  assert.match(abrir, /if \(!ANCORAS\.includes\(id\)\) return/)
  assert.match(abrir, /aberta\.value = true/)
  assert.match(abrir, /void carregar\(\)/)
  assert.match(abrir, /getElementById\(id\)\?\.scrollIntoView\(\{ block: 'start' \}\)/)
  // o "Ver o relatório" (#relatorio) e o "Ver as vendas" (#movimentacoes) mantêm a query da página (o ?cenario= do dev)
  const avisos = ler('app/components/carteira/visao/CarteiraAvisos.vue').split('</script>')[0]!
  assert.match(avisos, /navigateTo\(\{ query: route\.query, hash: acao\.alvo \}\)/)
})
