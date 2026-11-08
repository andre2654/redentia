/**
 * As notas da ideia no aviso (08/11/2026): as células do antes → depois das 4
 * notas do relatório (utils/notasDoAviso.ts), o relatório que abre com a troca
 * do hash (VisaoRelatorio.vue), o mock que mostra as notas na
 * /dev/carteira-nova e a faixa no cartão do aviso (CarteiraAvisos.vue). Os .vue
 * são lidos como texto: não dependem do Nuxt.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { celulasDasNotas } from '../app/utils/notasDoAviso.ts'
import { relatorioMock, visaoMock } from '../app/dev/carteiraVisaoMock.ts'
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

test('o mock: a ideia dos ajustes parte das notas do relatório do mock e não baixa nenhuma', () => {
  const a = visaoMock('normal').avisos.itens.find((x) => x.detector === 'ideia.ajustes')
  assert.ok(a?.notas?.length, 'o mock sem a ideia das notas')
  // o antes é a nota do relatório: aviso e relatório na mesma tela não se contradizem
  assert.deepEqual(a!.notas!.map((n) => [n.pilar, n.nome, n.antes]), relatorioMock().pilares.map((p) => [p.chave, p.nome, p.nota]))
  const cs = celulasDasNotas(a!.notas)
  assert.ok(cs.every((c) => c.sobe || c.igual), 'uma nota cai')
  assert.match(a!.titulo, new RegExp(`${cs.filter((c) => c.sobe).length} das 4 notas`))
  assert.ok(a!.acoes.some((x) => x.tipo === 'ver' && x.alvo === '#relatorio'), 'sem o "Ver o relatório"')
})

test('o cartão do aviso desenha a faixa a partir de a.notas, pelo util, entre o texto e a ressalva', () => {
  const src = ler('app/components/carteira/visao/CarteiraAvisos.vue')
  const script = src.slice(0, src.indexOf('</script>'))
  const tpl = src.slice(src.indexOf('<template>'), src.lastIndexOf('</template>'))
  assert.match(script, /import \{ celulasDasNotas\b[^}]*\} from '~\/utils\/notasDoAviso'/)
  assert.match(script, /celulasDasNotas\(a\.notas\)/)

  const texto = tpl.indexOf('class="cav__x"')
  const faixa = tpl.indexOf('<div v-if="notasDe(a).length"')
  const ressalva = tpl.indexOf('class="cav__ressalva"')
  assert.ok(texto > 0 && texto < faixa && faixa < ressalva, 'a faixa fica entre o texto e a ressalva')
  const bloco = tpl.slice(faixa, ressalva)
  assert.match(bloco, /class="cav__notas" role="group"/)
  assert.match(bloco, /v-for="n in notasDe\(a\)"[^>]*role="img" :aria-label="n\.aria"/)
  assert.match(bloco, /class="cav__nota-igual">igual</)
  assert.match(bloco, /\{\{ n\.deltaTxt \}\}/)
  // nota não é R$: nada da faixa passa pela máscara do olho
  assert.doesNotMatch(bloco, /semValor|naTela/)

  // 4 colunas, 2 × 2 no celular estreito; o +N no verde do texto, a queda no vermelho
  assert.match(src, /\.cav__notas \{ display: grid; grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/)
  assert.match(src, /@media \(max-width: 520px\) \{\s*\.cav__notas \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/)
  assert.match(src, /\.cav__nota-d \{ color: var\(--nu-green-text\)/)
  assert.match(src, /\.cav__nota-d--cai \{ color: var\(--nu-red-text\)/)

  // o chat recebe as notas como a faixa as mostra
  assert.match(script, /Notas do relatório, antes e depois: \$\{notas\}/)
})
