/**
 * A /carteira redesenhada (31/10/2026): o leque de 5 anos (utils/futuro.ts),
 * a frase do topo calmo (utils/carteira-agora.ts) e o relógio do pregão
 * (utils/pregao.ts). Todo número da tela sai da API: aqui se confere que o
 * texto diz o que o dado diz, e que sem dado nada é afirmado.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  anoDoFim,
  brlDoLeque,
  curvaDoLeque,
  desenharLeque,
  futuroDesenhavel,
  inicioDoLeque,
  lequeDeExemplo,
  listaDeFora,
  montarFuturo,
  motivoDeFora,
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
  assert.match(d.sino, /^M692,/)
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
