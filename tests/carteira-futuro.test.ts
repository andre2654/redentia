/**
 * A /carteira redesenhada (31/10/2026): o leque de 5 anos (utils/futuro.ts),
 * a frase do topo calmo (utils/carteira-agora.ts) e o relógio do pregão
 * (utils/pregao.ts). Todo número da tela sai da API: aqui se confere que o
 * texto diz o que o dado diz, e que sem dado nada é afirmado.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  afastarRotulos,
  anoDoFim,
  brlDoLeque,
  caminhoDoSino,
  caminhosDoMes,
  caminhoMaisPerto,
  caminhosDoLeque,
  colunaDoMes,
  curvaDoLeque,
  desenharLeque,
  fimDoCaminho,
  futuroDesenhavel,
  inicioDoLeque,
  janelaDosCaminhos,
  lequeDeExemplo,
  listaDeFora,
  marcasDoEixo,
  mesDoLeque,
  montarFuturo,
  motivoDeFora,
  quantilOrdenado,
  rgbDaCor,
  sinoDosFins,
  sinoDosQuantis,
  tomDoCaminho,
} from '../app/utils/futuro.ts'
import { comparacaoAoVivo, fatoDoPregao, fraseDaCarteira, nomeParaFrase, rotuloDaPilula } from '../app/utils/carteira-agora.ts'
import { estadoDoPregao, horaDoFechamento, quandoFoi, semPregao } from '../app/utils/pregao.ts'

// O contrato final (31/10/2026): série MENSAL (61 pontos), UM caminho real, e
// a série parte de covered_value. Números do motor de produção para uma
// carteira diversificada de R$ 66,3 mil: p10 63,5k · p50 97,8k · p90 147,2k.
function serieMensal(inicio: number, fim: { p10: number; p50: number; p90: number }) {
  const z = { p10: -1.2816, p25: -0.6745, p50: 0, p75: 0.6745, p90: 1.2816 }
  const a = Math.log(fim.p50 / inicio) / 5
  const sCima = Math.log(fim.p90 / fim.p50) / (1.2816 * Math.sqrt(5))
  const sBaixo = Math.log(fim.p50 / fim.p10) / (1.2816 * Math.sqrt(5))
  return Array.from({ length: 61 }, (_, m) => {
    const t = m / 12
    const q = (k: keyof typeof z) => Math.round(inicio * Math.exp(a * t + z[k] * (z[k] < 0 ? sBaixo : sCima) * Math.sqrt(t)))
    return { month: m, year: Math.round(t * 1e6) / 1e6, p10: q('p10'), p25: q('p25'), p50: q('p50'), p75: q('p75'), p90: q('p90') }
  })
}
const FIM = { p10: 63500, p50: 97800, p90: 147200 }
const SERIE = serieMensal(66300, FIM)
const FUTURO = {
  horizon_years: 5, paths: 2000, engine_version: '3.2.2', as_of: '2026-10-30', today_value: 66300,
  end: { p10: SERIE[60]!.p10, p50: SERIE[60]!.p50, p90: SERIE[60]!.p90 },
  series: SERIE,
  sample_paths: [SERIE.map((s, i) => Math.round(s.p50 * (1 + 0.02 * Math.sin(i / 3))))],
  covered_value: 66300,
  excluded: [],
  disclaimer: 'Projeção estatística com 2.000 caminhos, não previsão nem recomendação.',
  unit: 'BRL_real', step: 'monthly', aggregated: true,
}

test('valores curtos como no Agora', () => {
  assert.equal(brlDoLeque(61500), 'R$ 61,5 mil')
  assert.equal(brlDoLeque(150700), 'R$ 150,7 mil')
  assert.equal(brlDoLeque(66200), 'R$ 66,2 mil')
  assert.equal(brlDoLeque(950), 'R$ 950')
  assert.equal(brlDoLeque(1_250_000), 'R$ 1,3 milhão')
  assert.equal(brlDoLeque(3_400_000), 'R$ 3,4 milhões')
})

test('o leque do motor vira as frases do Agora', () => {
  const vm = montarFuturo(FUTURO)!
  assert.equal(vm.frase, 'Entre R$ 63,5 mil e R$ 147,2 mil.')
  assert.equal(vm.cenarios, 'Analisamos 2.000 cenários possíveis.')
  assert.equal(vm.hoje, 'R$ 66,3 mil')
  assert.equal(vm.anoFinal, '2031')
  assert.deepEqual(vm.anosDoMeio, ['2027', '2028', '2029', '2030'])
  assert.deepEqual(vm.fins, { otimista: 'R$ 147,2 mil', meio: 'R$ 97,8 mil', pessimista: 'R$ 63,5 mil' })
  assert.equal(vm.disclaimer, 'Projeção estatística com 2.000 caminhos, não previsão nem recomendação.')
  assert.equal(vm.cobertura, null)
})

test('a série parte do covered_value, e o que ficou de fora é dito', () => {
  const parcial = { ...FUTURO, today_value: 68618.58, covered_value: 66170.58, excluded: [{ ticker: 'BTC', reason: 'cripto' }] }
  const vm = montarFuturo(parcial)!
  assert.equal(vm.hoje, 'R$ 66,2 mil')
  assert.equal(vm.cobertura, 'A conta simula R$ 66,2 mil dos R$ 68,6 mil da carteira. Fica de fora: BTC (cripto).')
  assert.equal(inicioDoLeque(parcial), 66170.58)
  assert.equal(inicioDoLeque({ ...FUTURO, covered_value: null }), SERIE[0]!.p50)
})

test('motivos de fora, em palavras', () => {
  assert.equal(motivoDeFora('crypto'), 'cripto')
  assert.equal(motivoDeFora('coe'), 'COE')
  assert.equal(motivoDeFora('fundo_sem_registro'), 'fundo sem registro na CVM')
  assert.equal(motivoDeFora('renda_fixa_sem_indexador'), 'renda fixa sem indexador')
  assert.equal(motivoDeFora('fixed_income_without_rate'), 'renda fixa sem indexador')
  assert.equal(motivoDeFora('outro_motivo'), 'outro motivo')
  assert.equal(listaDeFora([{ ticker: 'BTC', reason: 'crypto' }, { ticker: 'COE-XP', reason: 'coe' }]), 'BTC (cripto) e COE-XP (COE)')
  assert.equal(listaDeFora([]), null)
  assert.match(listaDeFora(Array.from({ length: 6 }, (_, i) => ({ ticker: `T${i}`, reason: 'crypto' })))!, / e mais 2$/)
})

test('resposta incoerente não desenha (nada inventado)', () => {
  assert.equal(montarFuturo(null), null)
  assert.equal(montarFuturo({ ...FUTURO, end: { p10: 150700, p50: 97600, p90: 61500 } }), null)
  assert.equal(montarFuturo({ ...FUTURO, today_value: 0 }), null)
  assert.equal(montarFuturo({ ...FUTURO, series: [SERIE[0]!] }), null)
  assert.equal(futuroDesenhavel({ ...FUTURO, series: [{ ...SERIE[0]!, p50: Number.NaN }, SERIE[1]!] }), false)
  assert.equal(anoDoFim('', 5), '5 anos')
})

test('geometria: série mensal no x decimal, o otimista em cima e o caminho real aceso', () => {
  const caixa = { w: 900, h: 400, xFim: 690, sino: 58, pad: 18 }
  const d = desenharLeque(FUTURO, caixa)
  assert.ok(d.y.otimista < d.y.meio && d.y.meio < d.y.pessimista)
  for (const k of ['hoje', 'otimista', 'meio', 'pessimista'] as const) assert.ok(d.y[k] >= caixa.pad && d.y[k] <= caixa.h - caixa.pad, k)
  assert.equal(d.meioReal, true)
  assert.equal(d.xAnos.length, 4)
  assert.ok(Math.abs(d.xAnos[0]! - (10 + (690 - 10) / 5)) < 0.01)
  assert.match(d.faixa80, /^M10,.*Z$/)
  assert.match(d.meio, /^M10,/)
  assert.match(d.sino, /^M692(\.0)?,/)
  // o sino desce de cima para baixo, sem voltar (o antigo começava no alto,
  // pulava para baixo e subia de novo: a "agulha dupla")
  const ysDoSino = [...d.sino.matchAll(/[ML][\d.]+,([\d.]+)/g)].map((m) => Number(m[1]))
  for (let i = 1; i < ysDoSino.length; i++) assert.ok(ysDoSino[i]! >= ysDoSino[i - 1]! - 1e-9, `sino volta no ponto ${i}`)
  // sem o caminho, a linha do meio é o p50
  assert.equal(desenharLeque({ ...FUTURO, sample_paths: null }, caixa).meioReal, false)
})

test('o leque de exemplo é liso, coerente e sempre o mesmo', () => {
  const a = lequeDeExemplo()
  assert.deepEqual(a, lequeDeExemplo())
  assert.equal(a.series.length, 61)
  assert.ok(a.end.p10 < a.end.p50 && a.end.p50 < a.end.p90)
  assert.equal(montarFuturo(a)!.anoFinal, '5 anos')
})

test('curva: suave com poucos pontos, reta com muitos', () => {
  assert.match(curvaDoLeque([[0, 0], [10, 5], [20, 0]]), /C/)
  assert.doesNotMatch(curvaDoLeque(Array.from({ length: 61 }, (_, i) => [i, i % 3] as [number, number])), /C/)
  assert.equal(curvaDoLeque([]), '')
})

/* ————— a frase do topo ————— */

test('dia verde ao vivo: "Estamos analisando tudo para você."', () => {
  const f = fraseDaCarteira({ pregao: 'aberta', quando: 'hoje', carteiraPct: 0.62, bolsaPct: 0.41, alerta: null })
  assert.deepEqual(f, { titulo: 'Tudo normal.', linha: 'Estamos analisando tudo para você.', tom: 'normal', analisando: true })
})

test('dia vermelho ao vivo: a comparação com a bolsa, sem número', () => {
  assert.equal(fraseDaCarteira({ pregao: 'aberta', quando: 'hoje', carteiraPct: -0.77, bolsaPct: -0.51, alerta: null }).linha, 'Sua carteira cai mais que a bolsa hoje.')
  assert.equal(comparacaoAoVivo(-0.4, -1.06), 'Sua carteira cai menos que a bolsa hoje.')
  assert.equal(comparacaoAoVivo(-0.4, 0.3), 'Sua carteira cai enquanto a bolsa sobe.')
  assert.equal(comparacaoAoVivo(0.4, -0.3), 'Sua carteira sobe enquanto a bolsa cai.')
  assert.equal(comparacaoAoVivo(-0.5, -0.55), 'Sua carteira anda junto com a bolsa hoje.')
})

test('bolsa fechada: o fato do pregão, com o número', () => {
  assert.equal(
    fraseDaCarteira({ pregao: 'fechada', quando: 'hoje', carteiraPct: -0.77, bolsaPct: -1.06, alerta: null }).linha,
    'Sua carteira caiu 0,77% hoje; a bolsa, 1,06%.',
  )
  assert.equal(fatoDoPregao('na sexta', 0.62, 0.41), 'Na sexta, sua carteira subiu 0,62%; a bolsa, 0,41%.')
  assert.equal(fatoDoPregao('ontem', 0.3, -0.2), 'Ontem, sua carteira subiu 0,30%; a bolsa caiu 0,20%.')
  assert.equal(fatoDoPregao('hoje', 0.001, null), 'Sua carteira ficou estável hoje.')
})

test('um papel que caiu 5% ou mais pede atenção', () => {
  const vivo = fraseDaCarteira({ pregao: 'aberta', quando: 'hoje', carteiraPct: -1.2, bolsaPct: -0.5, alerta: { nome: 'Itaú', pct: -13.66 } })
  assert.deepEqual(vivo, { titulo: 'Itaú caindo.', linha: 'Caiu 13,66% hoje.', tom: 'atencao', analisando: false })
  const passado = fraseDaCarteira({ pregao: 'sem-pregao', quando: 'na sexta', carteiraPct: -1.2, bolsaPct: null, alerta: { nome: 'Itaú', pct: -6.1 } })
  assert.equal(passado.titulo, 'Itaú caiu.')
  assert.equal(passado.linha, 'Caiu 6,10% na sexta.')
  // -4,9% não chega a pedir atenção
  assert.equal(fraseDaCarteira({ pregao: 'fechada', quando: 'hoje', carteiraPct: -1, bolsaPct: null, alerta: { nome: 'Itaú', pct: -4.9 } }).tom, 'normal')
})

test('sem o resultado do dia, a frase não afirma nada', () => {
  const f = fraseDaCarteira({ pregao: 'fechada', quando: null, carteiraPct: null, bolsaPct: -1, alerta: null })
  assert.equal(f.titulo, 'Tudo normal.')
  assert.equal(f.linha, 'Estamos analisando tudo para você.')
})

test('pílula e nome curto', () => {
  assert.equal(rotuloDaPilula('na sexta'), 'sexta')
  assert.equal(rotuloDaPilula('em 28/10'), '28/10')
  assert.equal(rotuloDaPilula(null), 'hoje')
  assert.equal(nomeParaFrase('Itaú', 'ITUB4'), 'Itaú')
  assert.equal(nomeParaFrase('ITAUUNIBANCOPN', 'ITUB4'), 'ITUB4')
  assert.equal(nomeParaFrase('Itaú Unibanco Holding', 'itub4'), 'ITUB4')
  assert.equal(nomeParaFrase(null, 'vale3'), 'VALE3')
})

/* ————— o relógio do pregão ————— */

const sp = (iso: string) => new Date(`${iso}-03:00`) // horário de São Paulo

test('estado do pregão em São Paulo', () => {
  assert.equal(estadoDoPregao(sp('2026-10-30T09:30:00')).rotulo, 'A bolsa abre às 10h')
  assert.equal(estadoDoPregao(sp('2026-10-30T14:00:00')).estado, 'aberta')
  // até 31/10 os EUA estão no horário de verão: a B3 fecha às 17h
  assert.equal(estadoDoPregao(sp('2026-10-30T17:30:00')).rotulo, 'Bolsa fechada')
  // de 02/11 em diante fecha às 18h (e 02/11 é feriado de Finados)
  assert.equal(estadoDoPregao(sp('2026-11-03T17:30:00')).estado, 'aberta')
  assert.equal(estadoDoPregao(sp('2026-11-02T14:00:00')).rotulo, 'Bolsa fechada · feriado')
  assert.equal(estadoDoPregao(sp('2026-10-31T14:00:00')).rotulo, 'Bolsa fechada · sábado')
  assert.equal(horaDoFechamento('2026-03-09'), 17)
  assert.equal(horaDoFechamento('2026-03-06'), 18)
  assert.equal(semPregao('2026-12-25'), true)
})

test('quando foi o pregão, falado a partir de hoje', () => {
  const agora = sp('2026-10-31T11:00:00') // sábado
  assert.equal(quandoFoi('2026-10-31', agora), 'hoje')
  assert.equal(quandoFoi('2026-10-30', agora), 'ontem')
  assert.equal(quandoFoi('2026-10-29', agora), 'na quinta')
  assert.equal(quandoFoi('2026-10-30', sp('2026-11-02T09:00:00')), 'na sexta')
  assert.equal(quandoFoi('2026-10-10', agora), 'em 10/10')
  assert.equal(quandoFoi(null, agora), null)
})

/* ————— os 2.000 caminhos ————— */

// Um motor de mentira, só para o teste: caminhos de um passeio aleatório com
// semente fixa, a faixa CONTADA neles mês a mês (como no motor) e o fio
// "permil-delta" do Backend.
function motorDeTeste(n = 400, meses = 60, coberto = 66170.58) {
  let semente = 7
  const rnd = () => { semente = (semente * 1103515245 + 12345) % 2147483648; return semente / 2147483648 }
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-9))) * Math.cos(2 * Math.PI * rnd())
  const permil: number[][] = []
  for (let c = 0; c < n; c++) {
    let v = 1
    const l = [1000]
    for (let m = 1; m <= meses; m++) { v *= Math.exp(0.006 + 0.045 * normal()); l.push(Math.round(v * 1000)) }
    permil.push(l)
  }
  permil.sort((a, b) => a[meses]! - b[meses]!)
  const series = Array.from({ length: meses + 1 }, (_, m) => {
    const col = permil.map((l) => (coberto * l[m]!) / 1000).sort((a, b) => a - b)
    const q = (x: number) => quantilOrdenado(col, x)
    return { month: m, year: m / 12, p10: q(0.1), p25: q(0.25), p50: q(0.5), p75: q(0.75), p90: q(0.9) }
  })
  const delta = permil.map((l) => l.map((v, i) => (i ? v - l[i - 1]! : v)))
  const f = series[meses]!
  return {
    permil,
    dados: {
      ...FUTURO, today_value: coberto, covered_value: coberto, series, sample_paths: null,
      end: { p10: f.p10, p50: f.p50, p90: f.p90 },
      paths: n, paths_encoding: 'permil-delta', paths_data: delta,
    },
  }
}

test('caminhos: "permil-delta" volta aos reais de hoje, na grade da série', () => {
  const { permil, dados } = motorDeTeste()
  const c = caminhosDoLeque(dados)!
  assert.equal(c.n, 400)
  assert.equal(c.pontos, 61)
  assert.equal(c.valores[0], 66170.58)
  // soma acumulada × coberto / 1000, exata
  assert.ok(Math.abs(c.valores[5 * 61 + 37]! - (66170.58 * permil[5]![37]!) / 1000) < 1e-6)
  // ordenados pelo valor final: o índice é o percentil de onde terminam
  for (let i = 1; i < c.n; i++) assert.ok(fimDoCaminho(c, i - 1) <= fimDoCaminho(c, i))
})

test('caminhos: o p10/p50/p90 de cada mês, contado nos caminhos, é a faixa', () => {
  const { dados } = motorDeTeste()
  const c = caminhosDoLeque(dados)!
  for (let t = 0; t < c.pontos; t++) {
    const col = colunaDoMes(c, t)
    for (const [k, q] of [['p10', 0.1], ['p50', 0.5], ['p90', 0.9]] as const) {
      assert.ok(Math.abs(quantilOrdenado(col, q) - dados.series[t]![k]) < 0.01, `${k} do mês ${t}`)
    }
  }
})

test('caminhos: "permil" absoluto e ordem que chega trocada', () => {
  const { permil, dados } = motorDeTeste(60)
  const trocado = [...permil].reverse()
  const c = caminhosDoLeque({ ...dados, paths_encoding: 'permil', paths_data: trocado })!
  assert.equal(c.n, 60)
  for (let i = 1; i < c.n; i++) assert.ok(fimDoCaminho(c, i - 1) <= fimDoCaminho(c, i))
  assert.ok(Math.abs(fimDoCaminho(c, 59) - (66170.58 * permil[59]![60]!) / 1000) < 1e-6)
})

test('caminhos fora do contrato caem nas faixas (null), nunca em caminho inventado', () => {
  const { dados } = motorDeTeste(80)
  assert.equal(caminhosDoLeque(null), null)
  assert.equal(caminhosDoLeque(FUTURO), null)
  assert.equal(caminhosDoLeque({ ...dados, paths_encoding: 'float' }), null)
  assert.equal(caminhosDoLeque({ ...dados, paths_encoding: null }), null)
  assert.equal(caminhosDoLeque({ ...dados, paths_data: dados.paths_data.slice(0, 20) }), null)
  assert.equal(caminhosDoLeque({ ...dados, covered_value: null }), null)
  const curto = dados.paths_data.map((l, i) => (i === 3 ? l.slice(0, 40) : l))
  assert.equal(caminhosDoLeque({ ...dados, paths_data: curto }), null)
  const furado = dados.paths_data.map((l, i) => (i === 3 ? l.map((v, t) => (t === 9 ? Number.NaN : v)) : l))
  assert.equal(caminhosDoLeque({ ...dados, paths_data: furado }), null)
})

test('a janela vertical cobre a faixa e quase todos os caminhos', () => {
  const { dados } = motorDeTeste()
  const c = caminhosDoLeque(dados)!
  const { lo, hi } = janelaDosCaminhos(c, dados.series, 66170.58)
  for (const s of dados.series) assert.ok(s.p10 >= lo && s.p90 <= hi)
  let fora = 0
  for (let i = 0; i < c.n; i++) if (fimDoCaminho(c, i) > hi || fimDoCaminho(c, i) < lo) fora++
  assert.ok(fora <= c.n * 0.02, `${fora} caminhos fora`)
  assert.ok(lo >= 0)
})

test('o caminho mais perto do cursor', () => {
  const { dados } = motorDeTeste()
  const c = caminhosDoLeque(dados)!
  const alvo = c.valores[123 * 61 + 30]!
  assert.equal(c.valores[caminhoMaisPerto(c, 30, alvo) * 61 + 30], alvo)
  // no mês 0 todos valem o mesmo: vale o mês 1
  const m1 = c.valores[200 * 61 + 1]!
  assert.equal(c.valores[caminhoMaisPerto(c, 0, m1) * 61 + 1], m1)
  // o mais alto e o mais baixo
  assert.equal(caminhoMaisPerto(c, 60, 1e12), c.n - 1)
  assert.equal(caminhoMaisPerto(c, 60, 0), 0)
})

test('o hover acende os três caminhos reais que, no mês, estão no p90, no p50 e no p10', () => {
  const { dados } = motorDeTeste(2000)
  const c = caminhosDoLeque(dados)!
  for (const t of [1, 12, 30, 59, 60]) {
    const trio = caminhosDoMes(c, dados.series, t)
    const s = dados.series[t]!
    const passo = (s.p90 - s.p10) / 200
    assert.ok(Math.abs(c.valores[trio.otimista * 61 + t]! - s.p90) <= passo, `otimista no mês ${t}`)
    assert.ok(Math.abs(c.valores[trio.meio * 61 + t]! - s.p50) <= passo, `meio no mês ${t}`)
    assert.ok(Math.abs(c.valores[trio.pessimista * 61 + t]! - s.p10) <= passo, `pessimista no mês ${t}`)
  }
  // no mês 60, é o caminho que termina no p90/p50/p10 (com empates do
  // milésimo, um vizinho de mesmo final)
  const fim = caminhosDoMes(c, dados.series, 60)
  assert.ok(Math.abs(fim.otimista - 0.9 * (c.n - 1)) <= c.n / 100)
  assert.ok(Math.abs(fim.meio - 0.5 * (c.n - 1)) <= c.n / 100)
  // em hoje todos valem o mesmo: vale o mês 1, e são três caminhos diferentes
  const hoje = caminhosDoMes(c, dados.series, 0)
  assert.equal(new Set([hoje.otimista, hoje.meio, hoje.pessimista]).size, 3)
})

test('rótulos empilhados não encostam e voltam na ordem recebida', () => {
  assert.deepEqual(afastarRotulos([100, 105, 300], 26, 0, 400), [100, 126, 300])
  // ordem trocada: a saída segue a entrada
  assert.deepEqual(afastarRotulos([300, 100, 105], 26, 0, 400), [300, 100, 126])
  // passou da base: o bloco sobe
  assert.deepEqual(afastarRotulos([380, 390, 395], 20, 0, 400), [360, 380, 400])
  // e não fura o topo
  assert.deepEqual(afastarRotulos([-10, 0], 20, 10, 400), [10, 30])
})

test('o tom de cada caminho: creme no miolo, verde no alto, vermelho embaixo', () => {
  assert.equal(tomDoCaminho(0.5, 2000).mistura, 0)
  assert.equal(tomDoCaminho(1, 2000).mistura, 1)
  assert.equal(tomDoCaminho(0, 2000).mistura, -1)
  assert.ok(tomDoCaminho(0.55, 2000).mistura === 0, 'o miolo é creme puro')
  assert.ok(tomDoCaminho(0.95, 2000).mistura > 0.9)
  // as pontas são raras: mais opacas que o miolo, que soma centenas de fios
  assert.ok(tomDoCaminho(0.99, 2000).alfa > tomDoCaminho(0.5, 2000).alfa * 4)
  assert.ok(tomDoCaminho(0.5, 2000).alfa < 0.06)
  for (let r = 0.5; r < 1; r += 0.05) assert.ok(tomDoCaminho(r + 0.05, 2000).alfa >= tomDoCaminho(r, 2000).alfa)
  // simétrico, e com menos caminhos cada fio pesa mais
  assert.equal(tomDoCaminho(0.2, 2000).alfa, tomDoCaminho(0.8, 2000).alfa)
  assert.ok(tomDoCaminho(0.5, 300).alfa > tomDoCaminho(0.5, 2000).alfa)
})

test('o mês da leitura, em palavras', () => {
  assert.equal(mesDoLeque('2026-10-30', 0), 'hoje')
  assert.equal(mesDoLeque('2026-10-30', 17), 'mar/2028')
  assert.equal(mesDoLeque('2026-10-30', 2), 'dez/2026')
  assert.equal(mesDoLeque('2026-10-30', 3), 'jan/2027')
  assert.equal(mesDoLeque('2026-10-30', 60), 'out/2031')
  assert.equal(mesDoLeque('', 17), 'mês 17')
})

test('eixo: o ano que encostaria no "hoje · R$ X" ou no ano final sai', () => {
  const marcas = [{ x: 150, rotulo: '2027' }, { x: 290, rotulo: '2028' }, { x: 430, rotulo: '2029' }, { x: 570, rotulo: '2030' }]
  // "hoje · R$ 66,2 mil" com 160px: o 2027 (130–170) cairia em cima
  assert.deepEqual(marcasDoEixo(marcas, { hojeDireita: 160, fimEsquerda: 690, meiaLargura: 20 }).map((m) => m.rotulo), ['2028', '2029', '2030'])
  // com espaço, todos
  assert.equal(marcasDoEixo(marcas, { hojeDireita: 100, fimEsquerda: 690, meiaLargura: 20 }).length, 4)
  // o 2030 encostaria no 2031
  assert.deepEqual(marcasDoEixo(marcas, { hojeDireita: 100, fimEsquerda: 595, meiaLargura: 20 }).map((m) => m.rotulo), ['2027', '2028', '2029'])
  // apertados entre si: um sim, um não
  const juntos = [{ x: 200, rotulo: 'a' }, { x: 230, rotulo: 'b' }, { x: 260, rotulo: 'c' }]
  assert.deepEqual(marcasDoEixo(juntos, { hojeDireita: 0, fimEsquerda: 900, meiaLargura: 15, folga: 8 }).map((m) => m.rotulo), ['a', 'c'])
  assert.deepEqual(marcasDoEixo([{ x: 300, rotulo: null }], { hojeDireita: 0, fimEsquerda: 900, meiaLargura: 20 }), [])
})

test('o sino dos finais é uma densidade lisa, de um pico só, de cima para baixo', () => {
  const { dados } = motorDeTeste(2000)
  const c = caminhosDoLeque(dados)!
  const fins = Array.from({ length: c.n }, (_, i) => fimDoCaminho(c, i))
  const { lo, hi } = janelaDosCaminhos(c, dados.series, 66170.58)
  const s = sinoDosFins(fins, lo, hi)
  assert.equal(s.length, 161)
  assert.equal(s[0]![0], hi)
  assert.equal(s[s.length - 1]![0], lo)
  assert.equal(Math.max(...s.map((p) => p[1])), 1)
  // um pico só: sobe até ele e desce depois
  const pico = s.findIndex((p) => p[1] === 1)
  for (let i = 1; i <= pico; i++) assert.ok(s[i]![1] >= s[i - 1]![1] - 0.02, `sobe em ${i}`)
  for (let i = pico + 1; i < s.length; i++) assert.ok(s[i]![1] <= s[i - 1]![1] + 0.02, `desce em ${i}`)
  // o pico fica no miolo dos finais e as pontas quase zeram
  const v = s[pico]![0]
  assert.ok(v > quantilOrdenado(fins, 0.2) && v < quantilOrdenado(fins, 0.6), `pico em ${v}`)
  assert.ok(s[0]![1] < 0.05 && s[s.length - 1]![1] < 0.05)
})

test('sem caminhos, o sino sai dos quantis, liso e ordenado', () => {
  const s = sinoDosQuantis({ p10: 63500, p50: 97800, p90: 147200 }, 40000, 200000)
  assert.equal(s[0]![0], 200000)
  assert.equal(s[s.length - 1]![0], 40000)
  const pico = s.reduce((m, p, i) => (p[1] > s[m]![1] ? i : m), 0)
  // a moda de uma log-normal fica um pouco abaixo da mediana
  assert.ok(s[pico]![0] > 63500 && s[pico]![0] <= 97800, `pico em ${s[pico]![0]}`)
  const d = caminhoDoSino(s, 700, 60, (v) => 400 - v / 1000)
  assert.match(d, /^M700\.0,200\.0L/)
  assert.match(d, /L700\.0,360\.0Z$/)
})

test('cor de token lida do CSS', () => {
  assert.deepEqual(rgbDaCor('#8FF0B5'), [143, 240, 181])
  assert.deepEqual(rgbDaCor(' #fff '), [255, 255, 255])
  assert.deepEqual(rgbDaCor('rgb(12, 21, 36)'), [12, 21, 36])
  assert.deepEqual(rgbDaCor('rgba(245, 241, 234, 0.7)'), [245, 241, 234])
  assert.equal(rgbDaCor(''), null)
  assert.equal(rgbDaCor('var(--x)'), null)
})
