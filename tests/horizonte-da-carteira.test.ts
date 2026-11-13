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
  DESENHAR_EM_MS, LEQUE_CABE_EM, MES_EM_MS, NASCER_EM_MS, PASSADO_EM_REPOUSO, TETO_DE_SEGMENTOS, alfaDosCaminhos, caixaNoDominio, daquiAQuanto, desenhadoEm,
  dominioDoHorizonte, extremosDoLeque, futuroAVista, lequeDoConvite, mesSobOPonteiro, mesesDoPassado, nasceEm, nascidosEm, ondeFicaHoje, ondeFicaOMes,
  quantisNoMes, quantosCaminhosCabem, zoomDoPonteiro,
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

test('a abertura: os caminhos nascem um a um, devagar no começo e cada vez mais depressa, até os 2.000', () => {
  const N = 2000
  assert.equal(NASCER_EM_MS, 4200)
  // o primeiro nasce na hora; o segundo, 0,38 s depois; o décimo, a 1,3 s; o centésimo, a 2,5 s; o último, no fim
  assert.deepEqual([0, 1, 2, 9, 99, 999, 1999].map((k) => Math.round(nasceEm(k, N))), [0, 383, 607, 1272, 2545, 3817, 4200])
  // os intervalos só encolhem: cada caminho chega mais perto do anterior
  let intervalo = Infinity
  for (let k = 1; k < N; k++) {
    const d = nasceEm(k, N) - nasceEm(k - 1, N)
    assert.ok(d > 0 && d < intervalo, `caminho ${k}`)
    intervalo = d
  }
  // o total nascido: 1 no começo, o dobro a cada mesmo intervalo, todos no fim (e nunca mais que todos)
  assert.equal(nascidosEm(0, N), 1)
  assert.equal(nascidosEm(-50, N), 1)
  const passo = nasceEm(1, N)
  for (const k of [1, 2, 3, 6]) perto(nascidosEm(passo * k, N), 2 ** k, 1e-6)
  assert.equal(nascidosEm(NASCER_EM_MS, N), N)
  assert.equal(nascidosEm(NASCER_EM_MS * 3, N), N)
  assert.equal(nascidosEm(1000, 0), 0)
  assert.equal(nascidosEm(1000, 1), 1)
  // a conta bate com a agenda: no instante em que o caminho k nasce, k + 1 nasceram
  for (const k of [1, 7, 150, 1500]) perto(nascidosEm(nasceEm(k, N), N), k + 1, 1e-6)
  // os primeiros se desenham de hoje até a beira em 0,42 s; quando os nascimentos apertam, no intervalo até o seguinte
  assert.equal(DESENHAR_EM_MS, 420)
  assert.equal(desenhadoEm(0, 0, N), 0)
  perto(desenhadoEm(0, 210, N), 0.5)
  assert.equal(desenhadoEm(0, 420, N), 1)
  assert.equal(desenhadoEm(3, nasceEm(3, N) - 1, N), 0)
  assert.equal(desenhadoEm(500, nasceEm(500, N) + 16, N), 1) // no meio da enchente, um quadro basta
  // quantos caminhos o leque desenha: todos em repouso, uma amostra com o horizonte aberto (o teto de segmentos por quadro)
  assert.equal(TETO_DE_SEGMENTOS, 16_000)
  assert.deepEqual([5.1, 12, 30, 60].map((f) => quantosCaminhosCabem(N, f)), [2000, 1142, 500, 258])
  assert.equal(quantosCaminhosCabem(40, 60), 40)
  assert.equal(quantosCaminhosCabem(0, 60), 0)
  // e o peso de cada um: forte sozinho, leve entre 2.000; o produto (quantos × opacidade) só cresce, o leque nunca rareia
  assert.deepEqual([1, 10, 100, 2000].map((q) => Math.round(alfaDosCaminhos(q) * 1000) / 1000), [0.62, 0.62, 0.26, 0.058])
  let peso = 0
  for (let q = 1; q <= N; q += 7) { const w = q * alfaDosCaminhos(q); assert.ok(w >= peso); peso = w }
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
  assert.match(peca, /texto: props\.mascarado \? pctAtivo\(pctSobreHoje\(v\)\) : brlDoLeque\(v\)/)
  assert.match(peca, /valor: props\.mascarado \? pctAtivo\(p\) : brlDoLeque\(q\.p50\),/)
  // a leitura do futuro: os três caminhos REAIS do mês (p90, p50, p10), acesos na tela, com o valor de cada um ao lado da mira
  assert.match(peca, /Array\.from\(\{ length: c\.pontos \}, \(_, t\) => caminhosDoMes\(c, serie\.value, t\)\)/)
  for (const nome of ['se for bem', 'o mais provável', 'se for mal']) assert.ok(peca.includes(`nome: '${nome}'`), nome)
  assert.match(peca, /afastarRotulos\(tres\.map\(\(r\) => r\.y \* H\), 30, 46, H - 16\)/)
  assert.match(peca, /naDireita: esquerda < cabe && \(direita >= cabe \|\| direita > esquerda\),/)
  assert.match(peca, /<span class="cho__dica" :style="ancora\(leitura\.x\)">\{\{ leitura\.quando \}\}<\/span>/)
  // quem redesenha no meio da abertura desenha só o que já nasceu (o leque inteiro aparecia antes de recomeçar)
  assert.match(peca, /const t = tempo \?\? \(contados\.value != null \? \(comecouEm \? performance\.now\(\) - comecouEm : 0\) : undefined\)/)
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
  assert.match(peca, /chegando\.value = !calmo\(\)/)
  // o leque é uma tela redesenhada na janela de agora: todos os caminhos em repouso, os que cabem com o horizonte aberto
  assert.match(peca, /<canvas v-if="temFuturo" ref="tela" class="cho__tela" aria-hidden="true" \/>/)
  assert.match(peca, /const quantos = Math\.min\(nasceram, quantosCaminhosCabem\(c\.n, F\)\)/)
  assert.match(peca, /ctx\.strokeStyle = rgba\(corDosFios, alfaDosCaminhos\(quantos\) \* \(acesos \? 0\.5 : 1\)\)/)
  // a abertura: os caminhos nascem em ordem aleatória, com o contador no lugar do convite; o resultado só chega depois
  assert.match(peca, /if \(!ordem \|\| ordem\.length !== c\.n\) ordem = embaralhar\(c\.n\)/)
  assert.match(peca, /contados\.value = Math\.floor\(nascidosEm\(t, c\.n\)\)/)
  assert.match(peca, /<template v-if="contados != null"><span>futuros testados<\/span><b aria-hidden="true">\{\{ nfContador\.format\(contados\) \}\}<\/b>/)
  assert.match(peca, /if \(t >= NASCER_EM_MS\) \{ terminarAbertura\(true\); return \}/)
  // quem entra no futuro no meio da abertura não espera; sem quadros (a aba escondida), o relógio fecha a conta
  assert.match(peca, /if \(pede > 0 && contados\.value != null\) terminarAbertura\(\)/)
  assert.match(peca, /fimDaAbertura = setTimeout\(\(\) => terminarAbertura\(\), NASCER_EM_MS \+ 1500\)/)
  // movimento reduzido: o leque aparece pronto
  assert.match(peca, /if \(!c \|\| calmo\(\) \|\| typeof requestAnimationFrame === 'undefined'\) \{ terminarAbertura\(\); return \}/)
  // a peça avisa quem a hospeda até que ano a janela vai
  assert.match(peca, /const emit = defineEmits<\{ horizonte: \[ate: string \| null\] \}>\(\)/)
  assert.match(peca, /watch\(ateOAno, \(ano\) => emit\('horizonte', ano\)\)/)
  const css = peca.slice(peca.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'cor em hex')
  assert.doesNotMatch(css, /font-weight:\s*\d/, 'peso em número')
  assert.doesNotMatch(css, /font-size:\s*\d/, 'tamanho de letra fora da escala')
  assert.doesNotMatch(css, /cubic-bezier|\b\d+(\.\d+)?m?s\s+(ease|linear)/, 'curva ou tempo à mão')
  assert.match(css, /prefers-reduced-motion: reduce/)

  // o topo entrega a linha, o CDI e o futuro que a página proveu
  const topo = ler('app/components/carteira/visao/CarteiraHeroi.vue')
  assert.match(topo, /const futuroDaPagina = useCarteiraFuturoDaPagina\(\)/)
  assert.match(topo, /<CarteiraHorizonte :linha="linha" :comparada="linhaCdi" [^>]*:futuro="futuro" :caminhos="caminhosDoFuturo" :mascarado="!revelado" @horizonte="futuroAte = \$event" \/>/)
  // com o futuro à vista, o rótulo da faixa diz até onde o gráfico vai e a legenda do passado sai (o gráfico sobe a altura dela, medida)
  assert.match(topo, /futuroAte\.value \? `Você até \$\{futuroAte\.value\}` : /)
  assert.match(topo, /\.chv2__cartao--futuro \.chv2__legenda \{ opacity: 0; pointer-events: none; \}/)
  assert.match(topo, /\.chv2__cartao--futuro \.chv2__grafico \{ margin-top: calc\(-1 \* var\(--chv-legenda, 0px\)\); min-height: calc\(var\(--chv-grafico-min\) \+ var\(--chv-legenda, 0px\) \+ 14px\); \}/)
  assert.match(topo, /alturaDaLegenda\.value = legendaEl\.value\?\.offsetHeight \?\? 0/)
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

test('o convite da home: um leque esquemático depois de hoje, sem dado e sem direção, e o cartão leva à carteira', () => {
  // a linha parou no meio: o leque abre 30 para cada lado, simétrico, e o raio do meio segue reto
  const meio = lequeDoConvite(50)
  assert.deepEqual([meio.y, meio.abertura, meio.raios.length], [50, 30, 6])
  assert.equal(meio.meio, 'M0,50 L100,50')
  assert.equal(meio.raios[0], 'M0,50 Q46,41.6 100,20')
  assert.equal(meio.raios[5], 'M0,50 Q46,58.4 100,80')
  // simétrico: cada raio de cima tem o espelho embaixo (o desenho não diz que a carteira sobe)
  const fins = meio.raios.map((d) => Number(d.split(',').pop()))
  for (let i = 0; i < 3; i++) perto(fins[i]! - 50, -(fins[5 - i]! - 50), 1e-9)
  assert.match(meio.area, /^M0,50 Q46,41\.6 100,20 L100,80 Q46,58\.4 0,50 Z$/)
  // a linha parou perto do alto ou do pé: o leque abre o que cabe, nunca menos que 10, e não sai do quadro
  assert.equal(lequeDoConvite(20).abertura, 14)
  assert.equal(lequeDoConvite(90).abertura, 10)
  for (const y of [0, 4, 38.2, 96, 100]) {
    const l = lequeDoConvite(y)
    for (const d of [...l.raios, l.area]) for (const n of d.match(/-?\d+(\.\d+)?/g)!.map(Number)) assert.ok(n >= 0 && n <= 100, `${y}: ${d}`)
  }
  assert.equal(lequeDoConvite(Number.NaN).y, 50)
  // o cartão da home: a altura do ponto de hoje sai da conta do gráfico, o desenho é decorativo e o clique é o do cartão
  const home = ler('app/components/home/HomeAgoraFrase.vue')
  assert.match(home, /const fim = caminhosDoGrafico\(linha\.value, linhaCdi\.value, 1000, 300\)\.fim\n  return fim \? lequeDoConvite\(\(fim\.y \/ 300\) \* 100\) : null/)
  assert.match(home, /to="\/carteira" class="haf__graf haf__graf--vivo" aria-label="Ver a rentabilidade e o futuro da carteira"/)
  assert.match(home, /<span v-if="convite" class="haf__futuro" [^\n]*aria-hidden="true">/)
  assert.match(home, /<span class="haf__futuro-t">ver o futuro<\/span>/)
  assert.match(home, /a\.haf__graf \.haf__graf-area \{ --agr-dir: clamp\(104px, 25%, 270px\); \}/)
  // a home não chama o motor
  assert.doesNotMatch(home, /useCarteiraFuturo|carteira\/futuro'/)
})
