/**
 * As notas da ideia no aviso (08/11/2026): as células do antes → depois das 4
 * notas do relatório (utils/notasDoAviso.ts), o relatório que abre com a troca
 * do hash (VisaoRelatorio.vue), o mock que mostra as notas na
 * /dev/carteira-nova e a faixa no cartão do aviso (CarteiraAvisos.vue). Depois,
 * os indicadores que mudam, na linha embaixo da faixa. Os .vue são lidos como
 * texto: não dependem do Nuxt.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { celulasDasNotas, indicadoresQueMudam, quantosNaLinha } from '../app/utils/notasDoAviso.ts'
import { valorDoIndicador } from '../app/utils/relatorioCarteira.ts'
import { relatorioMock, visaoMock } from '../app/dev/carteiraVisaoMock.ts'
import type { IndicadorDoAviso, NotaDoAviso } from '../app/types/carteiraVisao.ts'

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

/* ————— os indicadores que mudam ————— */

const ind = (chave: string, unidade: IndicadorDoAviso['unidade'], antes: number | null, depois: number | null, melhor: IndicadorDoAviso['melhor'] = 'maior', nome = chave): IndicadorDoAviso =>
  ({ chave, nome, unidade, antes, depois, melhor })
/** os nomes curtos pedidos (08/11), pela chave do catálogo do relatório */
const CURTOS: Record<string, string> = {
  twr: 'TWR', mwr: 'MWR', cagr: 'CAGR', retorno_real: 'Acima da inflação', volatilidade: 'Volatilidade',
  downside_deviation: 'Volatilidade das quedas', max_drawdown: 'Maior queda', beta: 'Beta', r2: 'R²', sharpe: 'Sharpe',
  sortino: 'Sortino', treynor: 'Treynor', alpha_jensen: 'Alpha', m2: 'M²', information_ratio: 'Information ratio',
  tracking_error: 'Tracking error', appraisal_ratio: 'Appraisal', maior_posicao: 'Maior posição', maior_classe: 'Maior classe',
}

test('os indicadores escrevem o valor como o relatório (valorDoIndicador), em cada unidade', () => {
  const casos: [number, IndicadorDoAviso['unidade']][] = [
    [21.42, '%'], [-9.46, '%'], [0.04, '%'], [53.28, '%'], [10.57, '%'],
    [0.78, 'x'], [1, 'x'], [-0.08, ''], [22, ''], [0, ''], [-0.12, ''], [0.41, ''],
  ]
  for (const [v, unidade] of casos) {
    const [i] = indicadoresQueMudam([ind('x', unidade, v, v + 10)])
    assert.equal(i!.antes, valorDoIndicador(v, unidade), `${v} ${unidade}`)
    assert.equal(i!.depois, valorDoIndicador(v + 10, unidade), `${v + 10} ${unidade}`)
  }
})

test('os indicadores: sai o que o relatório escreveria igual, o que não tem os dois valores e a unidade fora do contrato', () => {
  const linha = indicadoresQueMudam([
    ind('volatilidade', '%', 10.57, 10.62, 'menor'), // 10,6% → 10,6%: muda só na 2ª casa
    ind('sharpe', '', -0.05, -0.01),
    ind('beta', 'x', null, 0.8, 'menor'),
    ind('r2', '', 0.81, null),
    ind('patrimonio', 'R$' as unknown as '%', 1000, 2000), // um R$ apareceria com o olho fechado
  ])
  assert.deepEqual(linha.map((i) => i.chave), ['sharpe'])
  assert.deepEqual(indicadoresQueMudam(undefined), [])
  assert.deepEqual(indicadoresQueMudam(null), [])
  assert.deepEqual(indicadoresQueMudam([]), [])
})

test('os indicadores: melhora pelo lado bom de cada um, com o nome curto e a frase do leitor de tela', () => {
  const linha = indicadoresQueMudam([
    ind('sharpe', '', -0.05, -0.01, 'maior', 'Índice de Sharpe'),
    ind('volatilidade', '%', 10.57, 10.52, 'menor'),
    ind('beta', 'x', 0.78, 0.81, 'menor'),
    ind('max_drawdown', '%', -9.46, -11.2, 'maior', 'Maior queda'),
    ind('alpha_jensen', '%', 1.32, 1.68, 'maior', 'Alpha de Jensen'),
    ind('numero_de_ativos', '', 22, 23, 'maior', 'Número de ativos'),
  ])
  // na ordem da linha: um de cada pilar primeiro (maior queda, Sharpe), depois o resto
  assert.deepEqual(linha.map((i) => [i.nome, i.antes, i.depois, i.melhora]), [
    ['Maior queda', '−9,5%', '−11,2%', false],
    ['Sharpe', '−0,05', '−0,01', true],
    ['Volatilidade', '10,6%', '10,5%', true],
    ['Alpha', '1,3%', '1,7%', true],
    ['Beta', '0,78', '0,81', false],
    ['Número de ativos', '22', '23', true],
  ])
  const aria = (chave: string) => linha.find((i) => i.chave === chave)!.aria
  assert.equal(aria('sharpe'), 'Sharpe: de −0,05 para −0,01, melhora')
  assert.equal(aria('beta'), 'Beta: de 0,78 para 0,81, piora')
})

test('a linha começa por um indicador de cada pilar, e as quatro medidas de retorno não tomam a frente', () => {
  // o caso do dono (ideia.ajustes, 08/11): na ordem do catálogo, TWR, MWR, CAGR e
  // acima da inflação ocupavam a linha e o Sharpe e a maior queda iam para o "e mais 9"
  const catalogo: [string, IndicadorDoAviso['unidade'], number, number, 'maior' | 'menor'][] = [
    ['twr', '%', 20.48, 21.02, 'maior'], ['mwr', '%', 13.78, 14.14, 'maior'], ['cagr', '%', 13.34, 13.68, 'maior'],
    ['retorno_real', '%', 8.52, 8.85, 'maior'], ['volatilidade', '%', 10.59, 10.47, 'menor'], ['max_drawdown', '%', -8.4, -8.19, 'maior'],
    ['beta', 'x', 1.08, 1.06, 'menor'], ['sharpe', '', -0.05, -0.03, 'maior'], ['sortino', '', -0.07, -0.03, 'maior'],
    ['maior_classe', '%', 53.58, 52.9, 'menor'],
  ]
  const linha = indicadoresQueMudam(catalogo.map(([c, u, a, d, m]) => ind(c, u, a, d, m)))
  assert.deepEqual(linha.slice(0, 4).map((i) => i.chave), ['twr', 'max_drawdown', 'sharpe', 'maior_classe'])
  assert.deepEqual(linha.slice(-3).map((i) => i.chave), ['retorno_real', 'mwr', 'cagr'])
})

test('os nomes curtos cobrem o catálogo do relatório; só os que já são curtos ficam com o nome dele', () => {
  for (const [chave, curto] of Object.entries(CURTOS)) {
    assert.equal(indicadoresQueMudam([ind(chave, '', 1.5, 2.5, 'maior', 'o nome do relatório')])[0]!.nome, curto, chave)
  }
  const semCurto = relatorioMock().indicadores.map((i) => i.chave).filter((k) => !(k in CURTOS))
  assert.deepEqual(semCurto, ['numero_de_ativos', 'correlacao_media'])
})

test('o mock: os indicadores da ideia partem dos valores do relatório do mock, com o lado bom das faixas do backend', () => {
  const a = visaoMock('normal').avisos.itens.find((x) => x.detector === 'ideia.ajustes')
  assert.ok(a?.indicadores?.length, 'o mock sem os indicadores')
  const catalogo = relatorioMock().indicadores
  const doRelatorio = new Map(catalogo.map((i) => [i.chave, i]))
  // Nota::FAIXAS do backend: "menor é melhor"
  const MENOR = new Set(['volatilidade', 'downside_deviation', 'beta', 'tracking_error', 'maior_posicao', 'maior_classe', 'correlacao_media'])
  for (const i of a!.indicadores!) {
    const r = doRelatorio.get(i.chave)
    assert.ok(r, `${i.chave} fora do catálogo`)
    assert.deepEqual([i.antes, i.nome, i.unidade], [r!.valor, r!.nome, r!.unidade], `${i.chave}: o antes é o do relatório`)
    assert.equal(i.melhor, MENOR.has(i.chave) ? 'menor' : 'maior', i.chave)
    assert.notEqual(i.depois, i.antes, `${i.chave} não muda`)
  }
  const ordem = a!.indicadores!.map((i) => catalogo.findIndex((c) => c.chave === i.chave))
  assert.deepEqual(ordem, [...ordem].sort((x, y) => x - y), 'fora da ordem do catálogo')
  // a volatilidade das quedas muda só na 2ª casa e sai; 11 ficam, só o beta piora;
  // 6 cabem nas 2 linhas do desktop e 5 vão para o "Como calculei"
  const linha = indicadoresQueMudam(a!.indicadores)
  assert.equal(linha.length, 11)
  assert.ok(!linha.some((i) => i.chave === 'downside_deviation'))
  assert.deepEqual(linha.filter((i) => !i.melhora).map((i) => i.chave), ['beta'])
  assert.equal(quantosNaLinha(linha), 6)
})

/** um indicador já escrito, só para a conta do tamanho */
const escrito = (nome: string, antes: string, depois: string) => ({ nome, antes, depois })

test('a linha: até 8 e no máximo 2 linhas no desktop, contando o separador e o "e mais N"', () => {
  // o caso do dono (troca_dy): 5 curtos cabem inteiros, sem o "e mais"
  const dono = [escrito('Sharpe', '−0,05', '−0,01'), escrito('Sortino', '−0,07', '−0,02'), escrito('Volatilidade', '10,6%', '10,5%'), escrito('Treynor', '−0,4%', '−0,3%'), escrito('M²', '13,1%', '13,4%')]
  assert.equal(quantosNaLinha(dono), 5)
  // dez bem curtos: cabem mais de 8, mas a linha para nos 8
  assert.equal(quantosNaLinha(Array.from({ length: 10 }, () => escrito('R²', '0,81', '0,83'))), 8)
  // os nomes mais longos do catálogo: 4 e o "e mais 4"
  const longos = [
    escrito('Volatilidade das quedas', '5,1%', '5,0%'), escrito('Information ratio', '0,41', '0,46'), escrito('Tracking error', '3,8%', '3,7%'),
    escrito('Acima da inflação', '8,4%', '8,8%'), escrito('Maior posição', '14,5%', '14,0%'), escrito('Maior classe', '53,3%', '53,2%'),
    escrito('Appraisal', '0,27', '0,31'), escrito('Maior queda', '−19,5%', '−19,3%'),
  ]
  assert.equal(quantosNaLinha(longos), 4)
  // sempre pelo menos um; nada sem nada
  assert.equal(quantosNaLinha([escrito('Volatilidade das quedas', '15,1%', '15,0%')], 20), 1)
  assert.equal(quantosNaLinha([]), 0)
})

test('o cartão desenha a linha dos indicadores embaixo das notas: o que cabe, o resto no "Como calculei", e a cor só no texto', () => {
  const src = ler('app/components/carteira/visao/CarteiraAvisos.vue')
  const script = src.slice(0, src.indexOf('</script>'))
  const tpl = src.slice(src.indexOf('<template>'), src.lastIndexOf('</template>'))
  assert.match(script, /import \{[^}]*\bindicadoresQueMudam\b[^}]*\} from '~\/utils\/notasDoAviso'/)
  assert.match(script, /indicadoresQueMudam\(a\.indicadores\)/)
  assert.match(script, /naLinha: quantosNaLinha\(todos\)/)

  const notas = tpl.indexOf('class="cav__notas"')
  const linha = tpl.indexOf('class="cav__inds"')
  const ressalva = tpl.indexOf('class="cav__ressalva"')
  assert.ok(notas > 0 && notas < linha && linha < ressalva, 'a linha fica embaixo das notas e antes da ressalva')
  const bloco = tpl.slice(linha, ressalva)
  assert.match(bloco, /v-for="i in indicadoresDe\(a\)\.slice\(0, naLinha\(a\)\)"[^>]*role="img" :aria-label="i\.aria"/)
  assert.match(bloco, /i\.melhora \? 'cav__ind-d--melhora' : 'cav__ind-d--piora'/)
  assert.match(bloco, /v-if="indicadoresDe\(a\)\.length > naLinha\(a\)"/)
  assert.match(bloco, /e mais \{\{ indicadoresDe\(a\)\.length - naLinha\(a\) \}\}/)
  // número não é R$: nada da linha passa pela máscara do olho
  assert.doesNotMatch(bloco, /semValor|naTela/)

  // o resto vai para o "Como calculei", e o "e mais N" abre ele
  const prova = tpl.slice(tpl.indexOf('class="cav__prova"'), tpl.indexOf('class="cav__fonte"'))
  assert.match(prova, /v-for="i in indicadoresDe\(a\)\.slice\(naLinha\(a\)\)"/)
  assert.match(prova, /role="img" :aria-label="i\.aria"/)
  assert.match(bloco, /@click="abrirProva\(a\.id\)"/)

  // a cor é a do texto (verde quando melhora, vermelho quando piora), e a linha quebra entre os indicadores
  assert.match(src, /\.cav__ind-d--melhora \{ color: var\(--nu-green-text\); \}/)
  assert.match(src, /\.cav__ind-d--piora \{ color: var\(--nu-red-text\); \}/)
  assert.match(src, /\.cav__inds \{ display: flex; flex-wrap: wrap;/)
  assert.match(src, /\.cav__ind \{ white-space: nowrap; \}/)
  // o chat recebe os indicadores como a linha os mostra
  assert.match(script, /Indicadores do relatório que mudam: \$\{indicadores\}/)
})
