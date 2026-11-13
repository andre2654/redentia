/**
 * O horizonte da carteira (13/11/2026): o gráfico da rentabilidade do topo da
 * /carteira ligado ao leque do motor, com o zoom que afasta o fim da janela
 * quando o ponteiro (ou o dedo) vai para a direita. Os casos travam a conta
 * (um eixo de tempo só, a mesma escala para o passado e o futuro, o domínio do
 * que está à vista, a leitura do mês sob o ponteiro) e o que as peças prometem:
 * o gráfico de antes sem o futuro, um pedido só do motor por página, o R$
 * escondido com o olho fechado, o teclado e o movimento reduzido.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  LEQUE_CABE_EM, MES_EM_MS, PASSADO_EM_REPOUSO, caixaNoDominio, daquiAQuanto, dominioDoHorizonte, extremosDoLeque, futuroAVista, mesSobOPonteiro,
  mesesDoPassado, ondeFicaHoje, ondeFicaOMes, quantisNoMes, zoomDoPonteiro,
} from '../app/utils/horizonteDaCarteira.ts'
import { lequeDeExemplo } from '../app/utils/futuro.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const perto = (a: number, b: number, folga = 1e-9) => assert.ok(Math.abs(a - b) <= folga, `${a} ≈ ${b}`)
const HORIZONTE = 60
const leque = lequeDeExemplo(5) // parte de 100 e vai a 60 meses

test('o passado: os meses entre o primeiro e o último ponto da linha', () => {
  perto(mesesDoPassado([{ t: '2025-11-06' }, { t: '2026-05-06' }, { t: '2026-11-06' }]), 365 / 30.4375, 1e-6)
  assert.equal(MES_EM_MS, 30.4375 * 86_400_000)
  assert.equal(mesesDoPassado([{ t: '2026-11-06' }]), 0)
  assert.equal(mesesDoPassado([]), 0)
  assert.equal(mesesDoPassado([{ t: 'x' }, { t: 'y' }]), 0)
})

test('em repouso o passado ocupa 70% e o futuro aparece na mesma escala; no fim do arrasto, a janela vai ao horizonte', () => {
  assert.equal(PASSADO_EM_REPOUSO, 0.7)
  for (const p of [1, 6, 12, 18.2]) {
    // repouso: hoje a 70% da largura, e o futuro à vista é o que cabe nos 30% na escala do passado
    perto(ondeFicaHoje(0, p, HORIZONTE), 0.7)
    perto(futuroAVista(0, p, HORIZONTE), (p * 0.3) / 0.7)
    // fim do arrasto: o horizonte inteiro, e o passado no tamanho que ele tem nessa escala
    perto(futuroAVista(1, p, HORIZONTE), HORIZONTE)
    perto(ondeFicaHoje(1, p, HORIZONTE), p / (p + HORIZONTE))
    // no meio, progressão geométrica: cada meio arrasto multiplica o futuro pelo mesmo tanto
    const [f0, fm, f1] = [0, 0.5, 1].map((z) => futuroAVista(z, p, HORIZONTE))
    perto(fm! / f0!, f1! / fm!, 1e-9)
    // e o zoom nunca volta: mais arrasto, mais futuro e hoje mais à esquerda
    let antes = -1
    for (let z = 0; z <= 1.0001; z += 0.05) { const f = futuroAVista(z, p, HORIZONTE); assert.ok(f > antes); antes = f }
  }
  // um passado tão comprido que o repouso já mostraria mais que o horizonte: o futuro à vista para no horizonte
  perto(futuroAVista(0, 200, HORIZONTE), HORIZONTE)
  // sem passado ou sem horizonte não há o que abrir
  assert.equal(futuroAVista(0.5, 0, HORIZONTE), 0)
  assert.equal(futuroAVista(0.5, 12, 0), 0)
  assert.equal(ondeFicaHoje(0.5, 0, HORIZONTE), 1)
  // o zoom fora de 0 a 1 é cortado
  perto(futuroAVista(-1, 12, HORIZONTE), futuroAVista(0, 12, HORIZONTE))
  perto(futuroAVista(3, 12, HORIZONTE), HORIZONTE)
})

test('o ponteiro: sobre o passado nada muda; do hoje de repouso à beira, o zoom vai de 0 a 1 e o mês só cresce', () => {
  assert.deepEqual([0, 0.35, 0.7].map((u) => zoomDoPonteiro(u)), [0, 0, 0])
  perto(zoomDoPonteiro(0.85), 0.5)
  assert.deepEqual([1, 1.4].map((u) => zoomDoPonteiro(u)), [1, 1])
  // sobre o passado não há mês do futuro
  assert.equal(mesSobOPonteiro(0.4, 0, 12, HORIZONTE), null)
  assert.equal(mesSobOPonteiro(0.7, 0, 12, HORIZONTE), null)
  // do hoje à beira direita: o mês cresce sempre e chega ao horizonte na beira
  let antes = 0
  for (let i = 1; i <= 60; i++) {
    const u = 0.7 + (0.3 * i) / 60
    const m = mesSobOPonteiro(u, zoomDoPonteiro(u), 12, HORIZONTE)!
    assert.ok(m > antes, `u ${u}: ${m} > ${antes}`)
    assert.ok(m <= HORIZONTE + 1e-9)
    antes = m
  }
  perto(mesSobOPonteiro(1, 1, 12, HORIZONTE)!, HORIZONTE)
  // a leitura fica onde o ponteiro está: o mês lido cai de volta no mesmo lugar da largura
  for (const [u, z] of [[0.75, 0.1], [0.9, 0.66], [0.5, 0.8], [0.99, 1]] as const) {
    const m = mesSobOPonteiro(u, z, 12, HORIZONTE)!
    perto(ondeFicaOMes(m, z, 12, HORIZONTE), u, 1e-9)
  }
  // o fim do horizonte fica fora da janela em repouso e na beira com o horizonte aberto
  assert.ok(ondeFicaOMes(HORIZONTE, 0, 12, HORIZONTE) > 1)
  perto(ondeFicaOMes(HORIZONTE, 1, 12, HORIZONTE), 1)
  perto(ondeFicaOMes(0, 0.4, 12, HORIZONTE), ondeFicaHoje(0.4, 12, HORIZONTE))
})

test('os quantis do motor num mês fracionário e os extremos do leque até ele', () => {
  const s = leque.series
  assert.deepEqual(quantisNoMes(s, 0), { p10: 100, p25: 100, p50: 100, p75: 100, p90: 100 })
  const meio = quantisNoMes(s, 17.5)!
  for (const q of ['p10', 'p25', 'p50', 'p75', 'p90'] as const) perto(meio[q], (s[17]![q] + s[18]![q]) / 2, 1e-9)
  // fora da série, a ponta
  assert.deepEqual(quantisNoMes(s, 999), quantisNoMes(s, 60))
  assert.deepEqual(quantisNoMes(s, -3), quantisNoMes(s, 0))
  assert.equal(quantisNoMes([], 3), null)
  // os extremos até o mês 24: o maior p90, o maior p50 e o menor p10 do caminho todo até ali (o p10 afunda antes de subir)
  const ex = extremosDoLeque(s, 24)!
  assert.equal(ex.p90, Math.max(...s.slice(0, 25).map((p) => p.p90)))
  assert.equal(ex.p50, Math.max(...s.slice(0, 25).map((p) => p.p50)))
  assert.equal(ex.p10, Math.min(...s.slice(0, 25).map((p) => p.p10)))
  assert.ok(ex.p10 < 100 && ex.p90 > ex.p50 && ex.p50 > 100)
})

test('o domínio à vista: em repouso é o do passado (com o mais provável cabendo); no arrasto, o leque inteiro do trecho', () => {
  const passado = { lo: 98, hi: 120 }
  const hoje = 117
  const base = leque.series[0]!.p50
  const emIndice = (v: number) => (hoje * v) / base
  // repouso (12 meses de passado, uns 5 de futuro): o chão é o do passado; o teto sobe só o bastante para o mais provável
  const f0 = futuroAVista(0, 12, HORIZONTE)
  const repouso = dominioDoHorizonte(passado, leque.series, hoje, base, f0, 0)
  assert.equal(repouso.lo, 98)
  assert.ok(repouso.hi >= emIndice(quantisNoMes(leque.series, f0)!.p50))
  assert.ok(repouso.hi < emIndice(quantisNoMes(leque.series, f0)!.p90), 'em repouso a faixa de cima ainda passa do teto: é o convite')
  // um passado alto o bastante não muda nada em repouso
  assert.deepEqual(dominioDoHorizonte({ lo: 98, hi: 200 }, leque.series, hoje, base, f0, 0), { lo: 98, hi: 200 })
  // do começo do arrasto em diante o leque do trecho à vista cabe inteiro, com folga
  for (const z of [LEQUE_CABE_EM, 0.5, 1]) {
    const f = futuroAVista(z, 12, HORIZONTE)
    const d = dominioDoHorizonte(passado, leque.series, hoje, base, f, z)
    const ex = extremosDoLeque(leque.series, f)!
    assert.ok(d.hi > emIndice(ex.p90) && d.lo < emIndice(ex.p10) && d.lo <= passado.lo, `z ${z}`)
  }
  // e o domínio só abre: mais zoom, teto mais alto
  let teto = 0
  for (let z = 0; z <= 1.0001; z += 0.02) {
    const d = dominioDoHorizonte(passado, leque.series, hoje, base, futuroAVista(z, 12, HORIZONTE), z)
    assert.ok(d.hi >= teto - 1e-9, `z ${z}`)
    teto = d.hi
  }
  // sem leque, ou com a base ou o índice de hoje sem sentido, fica o do passado
  assert.equal(dominioDoHorizonte(passado, [], hoje, base, 5, 0.5), passado)
  assert.equal(dominioDoHorizonte(passado, leque.series, hoje, 0, 5, 0.5), passado)
  assert.equal(dominioDoHorizonte(passado, leque.series, 0, base, 5, 0.5), passado)
})

test('a caixa de cada desenho dentro do domínio à vista, e o tempo em palavras', () => {
  assert.deepEqual(caixaNoDominio({ lo: 98, hi: 120 }, { lo: 98, hi: 120 }), { topo: 0, altura: 1 })
  // o passado no pé do desenho quando o leque abre: metade da altura, a metade de baixo
  assert.deepEqual(caixaNoDominio({ lo: 100, hi: 120 }, { lo: 100, hi: 140 }), { topo: 0.5, altura: 0.5 })
  // o leque maior que a janela: a caixa passa dos limites (a janela corta)
  const c = caixaNoDominio({ lo: 90, hi: 260 }, { lo: 100, hi: 140 })
  assert.ok(c.topo < 0 && c.altura > 1)
  assert.deepEqual(caixaNoDominio({ lo: 1, hi: 2 }, { lo: 5, hi: 5 }), { topo: 0, altura: 1 })
  assert.deepEqual([0.2, 5.1, 12, 18, 23.6, 45, 60].map(daquiAQuanto), ['em 1 mês', 'em 5 meses', 'em 1 ano', 'em 1 ano e 6 meses', 'em 2 anos', 'em 3 anos e 9 meses', 'em 5 anos'])
})

test('as peças: o gráfico de antes por dentro, um pedido só do motor, o olho, o teclado e o movimento reduzido', () => {
  const peca = ler('app/components/carteira/visao/CarteiraHorizonte.vue')
  // o passado é o AtivoGrafico de sempre, com as mesmas props do topo
  assert.match(peca, /<AtivoGrafico :ativo="linha" :ibov="comparada" ticker="Você" rotulo-hoje="Você no período" :atual="atual" unidade="%" comparacao="CDI" tom="luz" :rotulo="rotulo" \/>/)
  // sem o futuro, hoje fica na beira (o gráfico na largura toda) e o ponteiro não mexe em nada
  assert.match(peca, /const presenca = computed\(\(\) => \(temFuturo\.value \? 1 : 0\)\)/)
  assert.match(peca, /const hoje = computed\(\(\) => 1 \+ \(ondeFicaHoje\(z\.value, passado\.value, horizonte\.value\) - 1\) \* presenca\.value\)/)
  assert.match(peca, /if \(!temFuturo\.value \|\| chegando\.value \|\| medindo\) return/)
  // a medida do gráfico (o botão do mouse apertado sobre o passado) não abre o horizonte
  assert.match(peca, /medindo = !!\(e\.target as HTMLElement \| null\)\?\.closest\('\.cho__passado'\) && z\.value < 0\.002/)
  // o olho fechado: o R$ some da leitura e do convite; o % fica
  assert.match(peca, /const dinheiro = \(v: number\) => \(props\.mascarado \? 'R\$ ••••' : brlDoLeque\(v\)\)/)
  assert.match(peca, /valor: props\.mascarado \? pctAtivo\(p\) : brlDoLeque\(q\.p50\),/)
  // o botão abre e fecha; com o horizonte aberto as setas andam mês a mês e Esc volta
  assert.match(peca, /<button type="button" class="cho__botao" :aria-pressed="aberto" @click="alternar">/)
  for (const k of ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Escape']) assert.match(peca, new RegExp(`'${k}'`), k)
  assert.match(peca, /<span class="nu-sr" aria-live="polite">\{\{ leitura\?\.falada \?\? '' \}\}<\/span>/)
  assert.match(peca, /em dinheiro de hoje\./)
  // o aviso do motor fica à vista junto do número do futuro
  assert.match(peca, /<span class="cho__eixo-nota">\{\{ futuro\?\.disclaimer \}\}<\/span>/)
  // a rolagem vertical é da página; a página que toma o gesto recolhe o horizonte
  assert.match(peca, /touch-action: pan-y/)
  assert.match(peca, /@pointercancel="aoCancelar"/)
  // o zoom persegue o alvo pelo relógio (igual a 60 e a 120 quadros por segundo)
  assert.match(peca, /z\.value \+ dz \* \(1 - Math\.exp\(-dt \/ 72\)\)/)
  // a chegada do futuro muda o estado na hora; a transição é de CSS e dura o tempo da entrada
  assert.match(peca, /\.cho--chegando \.cho__passado \{ transition: width var\(--nu-dur-entrada\) var\(--nu-ease-saida\)/)
  // movimento reduzido: sem perseguir o alvo e sem a entrada
  assert.match(peca, /if \(calmo\(\)\) \{ z\.value = alvoDoZoom; return \}/)
  assert.match(peca, /if \(calmo\(\)\) \{ chegando\.value = false; return \}/)
  const css = peca.slice(peca.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'cor em hex')
  assert.doesNotMatch(css, /font-weight:\s*\d/, 'peso em número')
  assert.doesNotMatch(css, /font-size:\s*\d/, 'tamanho de letra fora da escala')
  assert.doesNotMatch(css, /cubic-bezier|\b\d+(\.\d+)?m?s\s+(ease|linear)/, 'curva ou tempo à mão')
  assert.match(css, /prefers-reduced-motion: reduce/)

  // o topo entrega a linha, o CDI e o futuro que a página proveu
  const topo = ler('app/components/carteira/visao/CarteiraHeroi.vue')
  assert.match(topo, /const futuroDaPagina = useCarteiraFuturoDaPagina\(\)/)
  assert.match(topo, /<CarteiraHorizonte :linha="linha" :comparada="linhaCdi" [^>]*:futuro="futuro" :caminhos="caminhosDoFuturo" :mascarado="!revelado" \/>/)
  assert.doesNotMatch(topo, /<AtivoGrafico /)
  // um pedido por página: a /carteira nova provê o futuro, e a seção dos 5 anos lê o mesmo
  const dado = ler('app/composables/useCarteiraFuturo.ts')
  assert.match(dado, /export function proverCarteiraFuturo\(\): FuturoDaCarteira \{\n  const f = criarCarteiraFuturo\(\)\n  provide\(CHAVE_DO_FUTURO, f\)/)
  assert.match(dado, /export function useCarteiraFuturo\(\): FuturoDaCarteira \{\n  return inject\(CHAVE_DO_FUTURO, null\) \?\? criarCarteiraFuturo\(\)/)
  assert.equal((dado.match(/onMounted\(carregar\)/g) ?? []).length, 1)
  const pagina = ler('app/components/carteira/visao/CarteiraVisao.vue')
  assert.match(pagina, /if \(!mock\.value\) proverCarteiraFuturo\(\)/)
  assert.match(ler('app/components/carteira/CarteiraFuturo.vue'), /= useCarteiraFuturo\(\)/)
})
