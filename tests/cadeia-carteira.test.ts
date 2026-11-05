/**
 * A cadeia de fornecimento dentro da carteira (05/11/2026). O caso real são
 * as respostas de GET /assets/{t}/supply-chain das 11 ações da carteira do
 * dono em 05/11/2026 (tests/fixtures/cadeia-carteira-2026-11-05.json).
 */
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cadeiaDaCarteira,
  contextoDaCadeiaDaCarteira,
  detalheDaLigacao,
  fraseDaCarteira,
  raizDaEmpresa,
  tickersDaCadeia,
  valorDaCadeia,
  valorEmLinha,
  type PosicaoDaCadeia,
} from '../app/utils/cadeiaDaCarteira.ts'
import type { SupplyChainApi, SupplyLinkApi } from '../app/types/acao.ts'

const REAL = JSON.parse(readFileSync(new URL('./fixtures/cadeia-carteira-2026-11-05.json', import.meta.url), 'utf8')) as Record<string, SupplyChainApi>

const pos = (ticker: string, valor: number, nome?: string, classe = 'STOCK'): PosicaoDaCadeia => ({ ticker, valor, nome, classe })
const DONO: PosicaoDaCadeia[] = [
  pos('VALE3', 9000, 'Vale'), pos('PETR4', 8000, 'Petrobras'), pos('ITSA4', 6000, 'Itaúsa'), pos('WEGE3', 5000, 'WEG'),
  pos('TAEE11', 4000, 'Taesa'), pos('PRIO3', 4000, 'PRIO'), pos('BBSE3', 3500, 'BB Seguridade'), pos('RANI3', 3000, 'Irani'),
  pos('CXSE3', 3000, 'Caixa Seguridade'), pos('CPLE3', 3000, 'Copel'), pos('FLRY3', 2500, 'Fleury'),
  pos('HGLG11', 6000, 'HGLG11', 'REIT'), pos('GOLD11', 3000, 'GOLD11', 'ETF'), pos('BRSTNCNTB476', 15000, 'Tesouro IPCA+ 2035', 'TREASURY'),
]

function link(ticker: string, extra: Partial<SupplyLinkApi> = {}): SupplyLinkApi {
  return {
    ticker, tickers: [ticker], nome: `${ticker} S.A.`, nome_b3: null, o_que: null, anual: null, contratado: null,
    participacao_receita: null, tipos_fonte: [], fontes: [], ...extra,
  }
}
const resp = (ticker: string, compra: SupplyLinkApi[], vende: SupplyLinkApi[]): SupplyChainApi => ({ ticker, compra_de: compra, vende_para: vende, totais: null, restante: null })

test('raiz: as classes da mesma empresa são uma só', () => {
  assert.equal(raizDaEmpresa('PETR4'), 'PETR')
  assert.equal(raizDaEmpresa('petr3'), 'PETR')
  assert.equal(raizDaEmpresa('TAEE11'), 'TAEE')
  assert.equal(raizDaEmpresa('MRSA3B'), 'MRSA')
  assert.equal(raizDaEmpresa('GE'), 'GE')
})

test('a busca: só ação, uma por empresa, as maiores primeiro, com teto', () => {
  assert.deepEqual(tickersDaCadeia(DONO).slice(0, 3), ['VALE3', 'PETR4', 'ITSA4'])
  assert.equal(tickersDaCadeia(DONO).length, 11)
  assert.ok(!tickersDaCadeia(DONO).includes('HGLG11'))
  // PETR3 e PETR4: uma chamada só, pela classe de maior valor
  assert.deepEqual(tickersDaCadeia([pos('PETR3', 1000), pos('PETR4', 3000), pos('VALE3', 3500)]), ['PETR4', 'VALE3'])
  assert.equal(tickersDaCadeia(DONO, 4).length, 4)
})

test('o dado real da carteira do dono: a Vale compra diesel da Petrobras', () => {
  const c = cadeiaDaCarteira(DONO, REAL)
  assert.equal(c.vazia, false)
  assert.equal(c.internas.length, 1)
  const l = c.internas[0]!
  assert.equal(l.vende, 'PETR')
  assert.equal(l.compra, 'VALE')
  assert.equal(l.oQue, 'diesel, diesel renovável')
  // vista pelas duas pontas, uma ligação só
  assert.deepEqual([...l.vistaPor].sort(), ['comprador', 'vendedor'])
  assert.equal(l.valor, null)
  assert.equal(c.frase, 'A Vale compra da Petrobras, e as duas estão na sua carteira.')
  assert.match(valorEmLinha(l, c.nomes), /sem valor informado · ligação informada pela Petrobras/)
  // nenhuma de fora é compartilhada: uma por empresa, a mais forte, com moderação
  assert.equal(c.temCompartilhada, false)
  assert.deepEqual(c.externas.map((x) => x.ticker), ['BRKM5', 'MRSA3B', 'AXIA3', 'BBDC4'])
  assert.ok(c.externas.length <= 4)
  assert.equal(c.externasTotal, 8)
  // a Braskem: as duas direções com a Petrobras, a venda de R$ 16,2 bi primeiro
  const brk = c.externas[0]!
  assert.deepEqual(brk.ligacoes.map((x) => x.id), ['PETR>BRKM', 'BRKM>PETR'])
  assert.equal(valorEmLinha(brk.ligacoes[0]!, c.nomes), 'R$ 16,2 bi em 2025 · informado pela Braskem')
  // a MRS em dólar, como a Vale informou (nunca convertido)
  const mrs = c.externas.find((x) => x.raiz === 'MRSA')!
  assert.equal(mrs.ligacoes[0]!.valor?.moeda, 'USD')
  assert.equal(valorEmLinha(mrs.ligacoes[0]!, c.nomes), 'US$ 459,0 mi em 2025 · informado pela Vale')
  // o contrato da WEG com a Axia
  assert.equal(valorEmLinha(c.externas.find((x) => x.raiz === 'AXIA')!.ligacoes[0]!, c.nomes), 'R$ 2,1 bi em 1 contrato · informado pela WEG')
  // as empresas sem ligação seguem na lista, sem nada
  const semLigacao = c.empresas.filter((e) => !e.internas && !e.externas).map((e) => e.ticker)
  assert.deepEqual(semLigacao, ['ITSA4', 'TAEE11', 'PRIO3', 'BBSE3', 'RANI3', 'CXSE3', 'CPLE3'])
  // FII, ETF e Tesouro não entram
  assert.ok(!c.empresas.some((e) => ['HGLG11', 'GOLD11', 'BRSTNCNTB476'].includes(e.ticker)))
  // o nome da sua empresa vem da outra ponta (o nome da B3)
  assert.equal(c.nomes.VALE, 'Vale')
  assert.equal(c.nomes.PETR, 'Petrobras')
})

test('a mesma ligação nas duas pontas: o valor de quem vendeu', () => {
  const r = {
    PETR4: resp('PETR4', [], [link('VALE3', { o_que: 'diesel', anual: { valor: 2e9, moeda: 'BRL', ano: 2025, informado_por: 'PETR4' } })]),
    VALE3: resp('VALE3', [link('PETR4', { tickers: ['PETR3', 'PETR4'], o_que: 'combustível', anual: { valor: 1.8e9, moeda: 'BRL', ano: 2025, informado_por: 'VALE3' } })], []),
  }
  const c = cadeiaDaCarteira([pos('VALE3', 10), pos('PETR4', 10)], r)
  assert.equal(c.internas.length, 1)
  assert.equal(c.internas[0]!.valor?.valor, 2e9)
  assert.equal(c.internas[0]!.oQue, 'diesel')
  // a ordem das respostas não muda nada
  const c2 = cadeiaDaCarteira([pos('VALE3', 10), pos('PETR4', 10)], { VALE3: r.VALE3, PETR4: r.PETR4 })
  assert.equal(c2.internas[0]!.valor?.valor, 2e9)
  // só a visão do comprador: vale a dele
  const c3 = cadeiaDaCarteira([pos('VALE3', 10), pos('PETR4', 10)], { VALE3: r.VALE3, PETR4: null })
  assert.equal(c3.internas[0]!.valor?.valor, 1.8e9)
  assert.deepEqual(c3.internas[0]!.vistaPor, ['comprador'])
})

test('classes juntas: a pessoa tem PETR3, a ligação vem como PETR4', () => {
  const r = {
    VALE3: resp('VALE3', [link('PETR4', { tickers: ['PETR3', 'PETR4'], o_que: 'diesel' })], []),
    PETR3: resp('PETR3', [], [link('VALE3', { o_que: 'diesel' })]),
  }
  const c = cadeiaDaCarteira([pos('VALE3', 10), pos('PETR3', 5), pos('PETR4', 6)], r)
  assert.equal(c.internas.length, 1)
  assert.equal(c.internas[0]!.vende, 'PETR')
  const petr = c.empresas.find((e) => e.raiz === 'PETR')!
  assert.deepEqual(petr.tickers.sort(), ['PETR3', 'PETR4'])
  assert.equal(petr.ticker, 'PETR4')
  assert.equal(petr.valor, 11)
  assert.equal(c.empresas.length, 2)
})

test('duas direções entre as mesmas empresas são duas ligações', () => {
  const r = {
    AAAA3: resp('AAAA3', [link('BBBB3')], [link('BBBB3')]),
    BBBB3: resp('BBBB3', [link('AAAA3')], [link('AAAA3')]),
  }
  const c = cadeiaDaCarteira([pos('AAAA3', 10), pos('BBBB3', 10)], r)
  assert.deepEqual(c.internas.map((l) => l.id).sort(), ['AAAA>BBBB', 'BBBB>AAAA'])
  assert.equal(c.frase, '2 das suas empresas fazem negócio entre si, em 2 ligações.')
})

test('a compartilhada de fora: 3 das suas empresas compram da mesma', () => {
  const petro = (valor: number | null) => link('PETR4', { tickers: ['PETR3', 'PETR4'], nome_b3: 'PETROBRAS   PN      N2', o_que: 'diesel', anual: valor ? { valor, moeda: 'BRL', ano: 2025, informado_por: 'PETR4' } : null })
  const r = {
    VALE3: resp('VALE3', [petro(3e9), link('MRSA3B', { anual: { valor: 459e6, moeda: 'USD', ano: 2025, informado_por: 'VALE3' } })], []),
    SUZB3: resp('SUZB3', [petro(null)], []),
    GGBR4: resp('GGBR4', [petro(1e8)], []),
    WEGE3: resp('WEGE3', [], [link('AXIA3')]),
  }
  const c = cadeiaDaCarteira([pos('VALE3', 10), pos('SUZB3', 8), pos('GGBR4', 6), pos('WEGE3', 4)], r)
  assert.equal(c.internas.length, 0)
  assert.equal(c.temCompartilhada, true)
  assert.equal(c.externas[0]!.raiz, 'PETR')
  assert.deepEqual(c.externas[0]!.empresas, ['VALE', 'SUZB', 'GGBR'])
  assert.equal(c.frase, '3 das suas empresas compram da Petrobras.')
  // com só uma compartilhada, completa com a mais forte das que sobraram (a WEG)
  assert.ok(c.externas.some((x) => x.raiz === 'AXIA'))
})

test('nunca soma: tipos e moedas ficam como vieram', () => {
  assert.deepEqual(valorDaCadeia(link('X', { anual: { valor: 459e6, moeda: 'USD', ano: 2025, informado_por: 'VALE3' }, contratado: { valor: 1e9, moeda: 'BRL', contratos: 2, informado_por: null } })), {
    tipo: 'anual', valor: 459e6, moeda: 'USD', texto: 'US$ 459,0 mi', quando: 'em 2025', por: 'VALE3',
  })
  assert.equal(valorDaCadeia(link('X', { contratado: { valor: 2.1e9, moeda: 'BRL', contratos: 1, informado_por: 'WEGE3' } }))?.quando, 'em 1 contrato')
  assert.equal(valorDaCadeia(link('X', { participacao_receita: 0.12 }))?.texto, '12%')
  assert.equal(valorDaCadeia(link('X')), null)
})

test('sem ligação nenhuma: vazia (a seção some)', () => {
  const c = cadeiaDaCarteira([pos('ITSA4', 10), pos('BBSE3', 5)], { ITSA4: REAL.ITSA4!, BBSE3: REAL.BBSE3! })
  assert.equal(c.vazia, true)
  assert.equal(c.frase, '')
  assert.equal(cadeiaDaCarteira([], {}).vazia, true)
})

test('o painel das provas e o contexto do chat', () => {
  const c = cadeiaDaCarteira(DONO, REAL)
  const d = detalheDaLigacao(c.internas[0]!, c.nomes)
  assert.equal(d.titulo, 'Petrobras vende para Vale')
  assert.equal(d.provas.length, 2)
  assert.equal(d.provas[0]!.por, 'Petrobras')
  assert.equal(d.provas[0]!.data, '05/01/2026')
  assert.ok(d.provas[0]!.url.startsWith('https://'))
  const txt = contextoDaCadeiaDaCarteira(c)
  assert.match(txt, /A Petrobras vende diesel, diesel renovável para a Vale/)
  assert.match(txt, /Sem ligação com listadas: ITSA4/)
  // descreve, não recomenda
  assert.doesNotMatch(txt, /risco|compre|venda (a|o) |recomend/i)
})

test('a frase pelo lado da carteira e o que ficou de fora', () => {
  const c = cadeiaDaCarteira(DONO, REAL)
  const minhas = c.empresas.map((e) => e.raiz)
  assert.equal(fraseDaCarteira(c.internas[0]!, c.nomes, minhas), 'A Vale compra diesel, diesel renovável da Petrobras.')
  const axia = c.externas.find((x) => x.raiz === 'AXIA')!
  assert.equal(fraseDaCarteira(axia.ligacoes[0]!, c.nomes, minhas), 'A WEG vende aerogeradores e manutenção para a Axia Energia.')
})
