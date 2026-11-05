/**
 * Para onde o seu dinheiro está exposto no mundo (05/11/2026): a conta das
 * fatias por país e região (ação e FII pela receita do item 1.7 do FRE, BDR
 * pelo país, ETF pela região do índice), a frase de cima, quais tickers a
 * seção busca e as regiões que o mapa acende. Os casos de "o dado real"
 * usam a resposta do piloto do backend (05/11/2026, app/dev/receita-piloto.json).
 */
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  exposicaoNoMundo,
  exposto,
  tickersParaBuscar,
  viaDaPosicao,
  type FonteMundo,
  type PosicaoMundo,
  type ReceitaGeografiaApi,
} from '../app/utils/exposicaoNoMundo.ts'
import { alfa2De, numericoDe, numericosDaRegiao, paisesDaRegiao, REGIOES_FIXAS } from '../app/utils/regioesDoMundo.ts'
import { PAISES_ID, pontosDaTerra } from '../app/utils/mundoPontos.ts'

const pos = (ticker: string, classe: string | null, valor: number, nome?: string): PosicaoMundo => ({ ticker, classe, valor, nome })

/** a resposta real do piloto, como o composable a transforma (fonteDaReceita) */
const PILOTO = (JSON.parse(readFileSync(new URL('../app/dev/receita-piloto.json', import.meta.url), 'utf8')) as { data: Record<string, ReceitaGeografiaApi | null> }).data
const doPiloto = (t: string): FonteMundo => {
  const d = PILOTO[t]
  return d ? { tipo: 'receita', fatias: d.fatias, cobertura: d.cobertura_pct, status: d.status } : null
}

/** a Embraer no FRE 2026, item 1.7 (o exemplo do contrato) */
const EMBRAER: FonteMundo = {
  tipo: 'receita',
  cobertura: 100,
  fatias: [
    { chave: 'BR', tipo: 'pais', nome: 'Brasil', pct: 8.4 },
    { chave: 'america_do_norte', tipo: 'regiao', nome: 'América do Norte', pct: 58.6 },
    { chave: 'europa', tipo: 'regiao', nome: 'Europa', pct: 24.4 },
    { chave: 'asia', tipo: 'regiao', nome: 'Ásia Pacífico', pct: 5.4 },
    { chave: 'america_latina', tipo: 'regiao', nome: 'América Latina exceto Brasil', pct: 1.9 },
    { chave: 'outros', tipo: 'regiao', nome: 'Outras regiões', pct: 1.4 },
  ],
}

test('só Brasil: Tesouro e renda fixa viram Brasil sem chamada', () => {
  const carteira = [pos('Tesouro Selic 2029', 'TREASURY', 1500), pos('CDB Banco X', 'FIXED_INCOME', 500)]
  assert.deepEqual(tickersParaBuscar(carteira), { receita: [], avulsos: [] })
  const m = exposicaoNoMundo(carteira)
  assert.equal(m.pendente, false)
  assert.deepEqual(m.noMapa.map((f) => [f.chave, f.nome, f.pctInt]), [['BR', 'Brasil', 100]])
  assert.deepEqual(m.noMapa[0]!.paises, ['076'])
  assert.deepEqual(m.fora, [])
  assert.equal(m.frase, 'Todo o seu dinheiro está no Brasil.')
})

test('ação com receita: o valor se divide pelas fatias do FRE', () => {
  const m = exposicaoNoMundo([pos('EMBR3', 'STOCK', 1000)], { EMBR3: EMBRAER })
  const por = Object.fromEntries(m.noMapa.map((f) => [f.chave, f]))
  // as fatias da Embraer somam 100,1%: reescaladas para 100
  assert.equal(Math.round(por['reg:america_do_norte']!.valor), 585)
  assert.equal(Math.round(por.BR!.valor), 84)
  assert.ok(!m.fora.some((f) => f.chave === 'rec-resto'), 'cobertura de 100%: nada fica sem detalhe')
  assert.equal(por['reg:europa']!.nome, 'Europa')
  assert.ok(por['reg:europa']!.paises.includes('276'), 'a Europa acende a Alemanha')
  assert.ok(por['reg:america_do_norte']!.ancora)
  assert.equal(por['reg:outros'], undefined, '"outras regiões" não vai para o mapa')
  assert.deepEqual(m.cobertura, { comDado: 1, total: 1, quem: 'empresas' })
  assert.equal(m.frase, '59% do seu dinheiro está na América do Norte, 24% na Europa e 8% no Brasil.')
})

test('ação e FII sem receita vão para "Brasil (sede)", à parte, nunca somados ao Brasil', () => {
  const carteira = [pos('EMBR3', 'STOCK', 1000), pos('PETR4', 'STOCK', 3000), pos('MXRF11', 'REIT', 1000), pos('Tesouro IPCA+ 2035', 'TREASURY', 1000)]
  assert.deepEqual(tickersParaBuscar(carteira).receita, ['EMBR3', 'MXRF11', 'PETR4'])
  const m = exposicaoNoMundo(carteira, { EMBR3: EMBRAER, PETR4: null, MXRF11: null })
  const sede = m.fora.find((f) => f.tipo === 'sede')!
  assert.equal(sede.nome, 'Brasil (sede)')
  assert.equal(sede.valor, 4000)
  assert.deepEqual(sede.tickers, ['PETR4', 'MXRF11'])
  assert.deepEqual(sede.paises, [])
  // o Brasil do mapa é só o Tesouro + a receita brasileira da Embraer
  const br = m.noMapa.find((f) => f.chave === 'BR')!
  assert.equal(Math.round(br.valor), 1084)
  assert.deepEqual(m.cobertura, { comDado: 1, total: 3, quem: 'empresas e fundos' })
  // a sede já abre a frase de cima: a linha de baixo não a repete
  assert.equal(m.coberturaTxt, 'Sabemos de onde vem a receita de 1 das suas 3 empresas e fundos.')
  // o maior pedaço é a sede: a frase abre com ele, dito como é
  assert.equal(m.frase, '67% do seu dinheiro está em empresas com sede no Brasil, ainda sem dado de receita. Outros 18% estão no Brasil, 10% na América do Norte e 4% na Europa.')
})

test('cobertura abaixo de 100: o que a empresa não detalhou fica "Receita não detalhada"', () => {
  const m = exposicaoNoMundo([pos('XPTO3', 'STOCK', 1000)], {
    XPTO3: { tipo: 'receita', cobertura: 70, fatias: [{ chave: 'BR', tipo: 'pais', nome: 'Brasil', pct: 50 }, { chave: 'US', tipo: 'pais', nome: 'Estados Unidos', pct: 20 }] },
  })
  assert.deepEqual(m.noMapa.map((f) => [f.chave, f.pctInt]), [['BR', 50], ['US', 20]])
  const resto = m.fora.find((f) => f.chave === 'rec-resto')!
  assert.equal(resto.nome, 'Receita não detalhada')
  assert.equal(resto.pctInt, 30)
})

test('sem nenhuma receita, a frase não afirma o que não sabe', () => {
  const m = exposicaoNoMundo([pos('PETR4', 'STOCK', 500), pos('VALE3', 'STOCK', 500)], { PETR4: null, VALE3: null })
  assert.deepEqual(m.noMapa, [])
  assert.equal(m.frase, 'Todo o seu dinheiro está em empresas com sede no Brasil, ainda sem dado de receita.')
  assert.equal(m.coberturaTxt, 'Ainda não sabemos de onde vem a receita das suas 2 empresas.')
  const um = exposicaoNoMundo([pos('ITUB4', 'STOCK', 500)], { ITUB4: null })
  assert.equal(um.coberturaTxt, 'Ainda não sabemos de onde vem a receita da sua empresa.')
  const fiis = exposicaoNoMundo([pos('MXRF11', 'REIT', 500), pos('HGLG11', 'REIT', 500)], { MXRF11: null, HGLG11: null })
  assert.equal(fiis.coberturaTxt, 'Ainda não sabemos de onde vem a receita dos seus 2 fundos imobiliários.')
  // com receita de todas, não há linha de cobertura
  assert.equal(exposicaoNoMundo([pos('EMBR3', 'STOCK', 1)], { EMBR3: EMBRAER }).coberturaTxt, null)
})

test('BDR: o país vem do /tickers; país sem âncora aparece com o nome que veio', () => {
  const carteira = [pos('Tesouro Selic', 'TREASURY', 9200), pos('AAPL34', 'BDR', 500), pos('TSMC34', 'BDR', 300)]
  assert.deepEqual(tickersParaBuscar(carteira).avulsos, [{ ticker: 'AAPL34', via: 'ticker' }, { ticker: 'TSMC34', via: 'ticker' }])
  const m = exposicaoNoMundo(carteira, {
    AAPL34: { tipo: 'pais', pais: 'United States' },
    TSMC34: { tipo: 'pais', pais: 'Taiwan' },
  })
  assert.deepEqual(m.noMapa.map((f) => [f.chave, f.nome, f.pctInt]), [['BR', 'Brasil', 92], ['US', 'Estados Unidos', 5], ['TW', 'Taiwan', 3]])
  assert.deepEqual(m.noMapa[1]!.paises, ['840'])
  assert.equal(m.frase, '92% do seu dinheiro está no Brasil, 5% nos Estados Unidos e 3% em Taiwan.')

  const estranho = exposicaoNoMundo([pos('XYZW34', 'BDR', 100)], { XYZW34: { tipo: 'pais', pais: 'Atlantis' } })
  assert.equal(estranho.noMapa[0]!.nome, 'Atlantis')
  assert.equal(estranho.noMapa[0]!.ancora, null)
})

test('ETF: a região do índice; região é região, sem dividir por país', () => {
  const carteira = [pos('BOVA11', 'ETF', 4000), pos('IVVB11', 'ETF', 3000), pos('WRLD11', 'ETF', 2000), pos('ACWI11', 'ETF', 1000)]
  assert.deepEqual(tickersParaBuscar(carteira).avulsos.map((t) => t.via), ['etf', 'etf', 'etf', 'etf'])
  const fontes: Record<string, FonteMundo> = {
    BOVA11: { tipo: 'etf', geografia: 'BR', classe: 'equity' },
    IVVB11: { tipo: 'etf', geografia: 'USA', classe: 'equity' },
    WRLD11: { tipo: 'etf', geografia: 'GLOBAL_DEVELOPED', classe: 'equity' },
    ACWI11: { tipo: 'etf', geografia: 'GLOBAL', classe: 'equity' },
  }
  const m = exposicaoNoMundo(carteira, fontes)
  assert.deepEqual(m.noMapa.map((f) => [f.chave, f.tipo, f.pctInt]), [
    ['BR', 'pais', 40], ['US', 'pais', 30], ['etf:GLOBAL_DEVELOPED', 'regiao', 20], ['etf:GLOBAL', 'regiao', 10],
  ])
  const dev = m.noMapa[2]!
  assert.equal(dev.nome, 'Mundo desenvolvido')
  assert.equal(dev.ancora, null)
  assert.ok(dev.paises.includes('840') && dev.paises.includes('392'))
  assert.equal(m.noMapa[3]!.todos, true)
  assert.equal(m.frase, '40% do seu dinheiro está no Brasil, 30% nos Estados Unidos e 20% no mundo desenvolvido.')
})

test('ETF sem perfil, 404 ou geografia desconhecida: "Sem dado", nunca chute', () => {
  const carteira = [pos('Tesouro', 'TREASURY', 800), pos('NOVO11', 'ETF', 100), pos('SUMI11', 'ETF', 60), pos('ESTR11', 'ETF', 40)]
  const m = exposicaoNoMundo(carteira, {
    NOVO11: { tipo: 'etf', geografia: null, classe: null },
    SUMI11: null,
    ESTR11: { tipo: 'etf', geografia: 'MARTE', classe: 'equity' },
  })
  assert.equal(m.pendente, false)
  assert.deepEqual(m.noMapa.map((f) => f.nome), ['Brasil'])
  assert.deepEqual(m.fora.map((f) => [f.tipo, f.pctInt, f.tickers]), [['sem-dado', 20, ['NOVO11', 'SUMI11', 'ESTR11']]])
  assert.equal(m.frase, '80% do seu dinheiro está no Brasil.')
})

test('cripto fica à parte, fora do mapa (inclusive o ETF de cripto)', () => {
  const carteira = [pos('Tesouro', 'TREASURY', 900), pos('BTC', 'CRYPTO', 70), pos('HASH11', 'ETF', 30)]
  const m = exposicaoNoMundo(carteira, { HASH11: { tipo: 'etf', geografia: 'GLOBAL', classe: 'crypto' } })
  assert.deepEqual(m.noMapa.map((f) => f.nome), ['Brasil'])
  assert.deepEqual(m.fora.map((f) => [f.nome, f.pctInt, f.tickers]), [['Cripto', 10, ['BTC', 'HASH11']]])
  assert.equal(m.frase, '90% do seu dinheiro está no Brasil e 10% em cripto.')
  assert.equal(exposicaoNoMundo([pos('BTC', 'CRYPTO', 1)]).frase, 'Todo o seu dinheiro está em cripto, que não tem país.')
})

test('enquanto a resposta não chega, fica pendente (a tela mostra esqueleto)', () => {
  assert.equal(exposicaoNoMundo([pos('PETR4', 'STOCK', 50)], {}).pendente, true)
  assert.equal(exposicaoNoMundo([pos('Tesouro', 'TREASURY', 50), pos('AAPL34', 'BDR', 50)], {}).pendente, true)
})

test('classe desconhecida não vira Brasil por padrão', () => {
  assert.equal(viaDaPosicao('FUND'), null)
  const m = exposicaoNoMundo([pos('FUNDO GLOBAL', 'FUND', 100)])
  assert.equal(m.fora[0]!.tipo, 'sem-dado')
  assert.equal(m.frase, 'Ainda não temos o país dos seus investimentos.')
})

test('as fatias somam 100, ninguém mostra 100% junto de outra, e fatia pequena vira "menos de 1%"', () => {
  const m = exposicaoNoMundo([pos('Tesouro', 'TREASURY', 996), pos('AAPL34', 'BDR', 4)], { AAPL34: { tipo: 'pais', pais: 'United States' } })
  assert.equal(m.noMapa[0]!.pctTxt, '99%')
  assert.equal(m.noMapa[1]!.pctTxt, 'menos de 1%')
  assert.equal(m.frase, '99% do seu dinheiro está no Brasil e menos de 1% nos Estados Unidos.')
})

test('o dado real: acima de 100 (a Gerdau soma 101,7 por eliminações), a soma vira 100', () => {
  const m = exposicaoNoMundo([pos('GGBR4', 'STOCK', 1017)], { GGBR4: doPiloto('GGBR4') })
  const por = Object.fromEntries(m.noMapa.map((f) => [f.chave, f]))
  assert.equal(Math.round(por['reg:america_do_norte']!.valor), 512)
  assert.equal(Math.round(por.BR!.valor), 425)
  assert.equal(Math.round(por['reg:america_latina']!.valor), 80)
  assert.equal(Math.round(m.noMapa.reduce((s, f) => s + f.valor, 0)), 1017, 'nada some, nada sobra')
  assert.deepEqual(m.fora, [], 'acima de 100 não há "Receita não detalhada"')
  assert.equal(m.noMapa.reduce((s, f) => s + f.pctInt, 0), 100)
})

test('o dado real: abaixo de 100 (o BB soma 96), o resto vira "Receita não detalhada"; pct ≤ 0 não entra', () => {
  const m = exposicaoNoMundo([pos('BBAS3', 'STOCK', 1000)], { BBAS3: doPiloto('BBAS3') })
  assert.deepEqual(m.noMapa.map((f) => [f.chave, Math.round(f.valor)]), [['BR', 960]])
  assert.deepEqual(m.fora.map((f) => [f.nome, Math.round(f.valor)]), [['Receita não detalhada', 40]])
  const z = exposicaoNoMundo([pos('XPTO3', 'STOCK', 100)], {
    XPTO3: { tipo: 'receita', cobertura: 100, fatias: [{ chave: 'BR', tipo: 'pais', nome: 'Brasil', pct: 100 }, { chave: 'US', tipo: 'pais', nome: 'EUA', pct: 0 }, { chave: 'CN', tipo: 'pais', nome: 'China', pct: -3 }] },
  })
  assert.deepEqual(z.noMapa.map((f) => f.chave), ['BR'])
  assert.deepEqual(z.fora, [])
})

test('a chave `outros` vira "Outros países": dinheiro real fora do mapa, sem arco e longe do "Sem dado"', () => {
  // o Itaú: 85% Brasil, 15% "Fora do Brasil"; a Vale tem `outros` duas vezes ("Demais países" e "Outros")
  const m = exposicaoNoMundo([pos('ITUB4', 'STOCK', 1000), pos('VALE3', 'STOCK', 1000)], { ITUB4: doPiloto('ITUB4'), VALE3: doPiloto('VALE3') })
  const outros = m.fora.filter((f) => f.tipo === 'outros')
  assert.equal(outros.length, 1, 'uma linha só, somando todas as empresas')
  assert.equal(outros[0]!.nome, 'Outros países')
  assert.equal(Math.round(outros[0]!.valor), 150 + 71)
  assert.deepEqual(outros[0]!.tickers, ['ITUB4', 'VALE3'])
  assert.deepEqual(outros[0]!.paises, [], 'não acende nada no globo')
  assert.equal(outros[0]!.ancora, null, 'sem arco')
  assert.ok(!m.noMapa.some((f) => f.tipo === 'outros'))
  assert.equal(m.fora[0]!.tipo, 'outros', 'antes do "Receita não detalhada" e do "Sem dado"')
  assert.ok(!m.fora.some((f) => f.chave === 'sem-dado'))
  assert.ok(!m.frase.includes('outros'), 'não entra na frase')
})

test('`nao_aplicavel_100_brasil` é 100% Brasil pela receita e conta como sabido', () => {
  const carteira = [pos('ITSA4', 'STOCK', 600), pos('CXSE3', 'STOCK', 400), pos('WEGE3', 'STOCK', 1000)]
  const m = exposicaoNoMundo(carteira, { ITSA4: doPiloto('ITSA4'), CXSE3: doPiloto('CXSE3'), WEGE3: doPiloto('WEGE3') })
  assert.deepEqual(m.noMapa.map((f) => [f.chave, f.valor]), [['BR', 1000]])
  assert.deepEqual(m.fora.map((f) => [f.tipo, f.tickers]), [['sede', ['WEGE3']]])
  assert.deepEqual(m.cobertura, { comDado: 2, total: 3, quem: 'empresas' })
  // o status manda mesmo sem fatia nenhuma
  const vazio = exposicaoNoMundo([pos('ELET3', 'STOCK', 100)], { ELET3: { tipo: 'receita', fatias: [], cobertura: null, status: 'nao_aplicavel_100_brasil' } })
  assert.deepEqual(vazio.noMapa.map((f) => f.chave), ['BR'])
  assert.equal(vazio.coberturaTxt, null)
})

test('Tesouro e renda fixa aparecem pelo nome da carteira, não pelo código ISIN', () => {
  const m = exposicaoNoMundo([
    pos('BRSTNCNTB476', 'TREASURY', 700, 'Tesouro IPCA+ 2035'),
    pos('BRSTNCLF1RU6', 'TREASURY', 200, '  '),
    pos('PETR4', 'STOCK', 100, 'Petrobras'),
  ], { PETR4: null })
  assert.deepEqual(m.noMapa[0]!.tickers, ['Tesouro IPCA+ 2035', 'BRSTNCLF1RU6'], 'sem nome, fica o código')
  assert.deepEqual(m.fora[0]!.tickers, ['PETR4'], 'ação continua pelo ticker')
})

test('a carteira parecida com a do dono, com o dado do piloto: a frase e a linha de cobertura', () => {
  const acoes: [string, number][] = [['VALE3', 9000], ['PETR4', 8000], ['ITSA4', 6000], ['WEGE3', 5000], ['TAEE11', 4000], ['PRIO3', 4000], ['BBSE3', 3500], ['RANI3', 3000], ['CXSE3', 3000], ['CPLE3', 3000], ['FLRY3', 2500]]
  const carteira = [
    ...acoes.map(([t, v]) => pos(t, 'STOCK', v)),
    pos('HGLG11', 'REIT', 6000), pos('KNRI11', 'REIT', 5000), pos('MXRF11', 'REIT', 3000),
    pos('BRSTNCNTB476', 'TREASURY', 15000, 'Tesouro IPCA+ 2035'), pos('BRSTNCLF1RU6', 'TREASURY', 8000, 'Tesouro Selic 2029'),
    pos('GOLD11', 'ETF', 3000), pos('AUPO11', 'ETF', 6000),
  ]
  const fontes: Record<string, FonteMundo> = { GOLD11: { tipo: 'etf', geografia: 'GLOBAL', classe: 'commodity' }, AUPO11: null }
  for (const [t] of acoes) fontes[t] = doPiloto(t)
  for (const t of ['HGLG11', 'KNRI11', 'MXRF11']) fontes[t] = doPiloto(t)
  const m = exposicaoNoMundo(carteira, fontes)
  assert.equal(m.frase, '56% do seu dinheiro está no Brasil, 6% na China e 3% em ouro.')
  assert.equal(m.coberturaTxt, 'Sabemos de onde vem a receita de 9 das suas 14 empresas e fundos; 24% do seu dinheiro segue sem dado.')
  assert.ok(m.noMapa[0]!.tickers.includes('Tesouro IPCA+ 2035'))
  assert.ok(!m.noMapa.some((f) => f.tickers.some((t) => t.startsWith('BRSTN'))))
  // "Estados Unidos" (país) e "América do Norte" (região) nunca se juntam
  const g = exposicaoNoMundo([pos('GGBR4', 'STOCK', 500), pos('JBSS3', 'STOCK', 500)], { GGBR4: doPiloto('GGBR4'), JBSS3: doPiloto('JBSS3') })
  assert.ok(g.noMapa.some((f) => f.chave === 'US') && g.noMapa.some((f) => f.chave === 'reg:america_do_norte'))
})

test('a busca: receita numa chamada só; BDR e ETF sem repetir, do maior para o menor, com teto', () => {
  const carteira = [
    ...Array.from({ length: 14 }, (_, i) => pos(`BDR${i}34`, 'BDR', 100 + i)),
    pos('BDR3434', 'BDR', 1), pos('BDR3434', 'BDR', 1),
    pos('PETR4', 'STOCK', 99999), pos('petr4', 'STOCK', 1), pos('HGLG11', 'REIT', 10),
  ]
  const b = tickersParaBuscar(carteira, 10)
  assert.deepEqual(b.receita, ['HGLG11', 'PETR4'])
  assert.equal(b.avulsos.length, 10)
  assert.equal(b.avulsos[0]!.ticker, 'BDR1334')
})

test('"exposto a": a preposição certa', () => {
  assert.equal(exposto('no Brasil'), 'ao Brasil')
  assert.equal(exposto('na Europa'), 'à Europa')
  assert.equal(exposto('nos Estados Unidos'), 'aos Estados Unidos')
  assert.equal(exposto('nas Bermudas'), 'às Bermudas')
  assert.equal(exposto('em Taiwan'), 'a Taiwan')
  assert.equal(exposto('pelo mundo todo'), 'ao mundo todo')
})

test('as regiões: cada país numa região só, e os membros que o mapa acende', () => {
  const visto = new Map<string, string>()
  for (const r of REGIOES_FIXAS) {
    for (const iso of paisesDaRegiao(r)) {
      assert.ok(!visto.has(iso), `${iso} em ${visto.get(iso)} e ${r}`)
      visto.set(iso, r)
    }
  }
  assert.deepEqual(paisesDaRegiao('outros'), [])
  const onde = (iso: string) => visto.get(iso)
  assert.equal(onde('US'), 'america_do_norte')
  assert.equal(onde('CA'), 'america_do_norte')
  assert.equal(onde('MX'), 'america_latina')
  assert.equal(onde('BR'), 'america_latina')
  assert.equal(onde('DE'), 'europa')
  assert.equal(onde('RU'), 'europa')
  assert.equal(onde('CN'), 'asia')
  assert.equal(onde('IN'), 'asia')
  assert.equal(onde('SA'), 'oriente_medio')
  assert.equal(onde('IR'), 'oriente_medio')
  assert.equal(onde('ZA'), 'africa')
  assert.equal(onde('EG'), 'africa')
  assert.equal(onde('AU'), 'oceania')
  assert.equal(onde('AQ'), undefined, 'Antártida fora')
  assert.equal(numericoDe('BR'), '076')
  assert.equal(alfa2De('840'), 'US')
  assert.ok(numericosDaRegiao('europa').includes('250'))
  // todo país com ponto no mapa está em alguma região
  const semRegiao = PAISES_ID.filter((id) => { const a = alfa2De(id); return !a || !visto.has(a) })
  assert.deepEqual(semRegiao, [])
})

test('o dado do mundo: pontos com país', () => {
  const t = pontosDaTerra()
  assert.ok(t.n > 4000 && t.n < 6000)
  const br = PAISES_ID.indexOf('076')
  let noBrasil = 0
  for (let i = 0; i < t.n; i++) if (t.pais[i] === br) noBrasil++
  assert.ok(noBrasil > 200)
})
