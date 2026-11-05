/**
 * Para onde o seu dinheiro está exposto no mundo (05/11/2026): a conta das
 * fatias por país e região (ação e FII pela receita do item 1.7 do FRE, BDR
 * pelo país, ETF pela região do índice), a frase de cima, quais tickers a
 * seção busca e as regiões que o mapa acende.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  exposicaoNoMundo,
  exposto,
  tickersParaBuscar,
  viaDaPosicao,
  type FonteMundo,
  type PosicaoMundo,
} from '../app/utils/exposicaoNoMundo.ts'
import { alfa2De, numericoDe, numericosDaRegiao, paisesDaRegiao, REGIOES_FIXAS } from '../app/utils/regioesDoMundo.ts'
import { PAISES_ID, pontosDaTerra, projetarPlano } from '../app/utils/mundoPontos.ts'

const pos = (ticker: string, classe: string | null, valor: number): PosicaoMundo => ({ ticker, classe, valor })

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
  assert.equal(m.frase, 'Todo o seu dinheiro está exposto ao Brasil.')
})

test('ação com receita: o valor se divide pelas fatias do FRE', () => {
  const m = exposicaoNoMundo([pos('EMBR3', 'STOCK', 1000)], { EMBR3: EMBRAER })
  const por = Object.fromEntries(m.noMapa.map((f) => [f.chave, f]))
  // as fatias da Embraer somam 100,1%: reescaladas para 100
  assert.equal(Math.round(por['reg:america_do_norte']!.valor), 585)
  assert.equal(Math.round(por.BR!.valor), 84)
  assert.equal(m.fora.length, 0, 'cobertura de 100%: nada fica sem detalhe')
  assert.equal(por['reg:europa']!.nome, 'Europa')
  assert.ok(por['reg:europa']!.paises.includes('276'), 'a Europa acende a Alemanha')
  assert.ok(por['reg:america_do_norte']!.ancora)
  assert.deepEqual(por['reg:outros']!.paises, [], '"outras regiões" não pinta nada')
  assert.deepEqual(m.cobertura, { comDado: 1, total: 1, quem: 'empresas' })
  assert.equal(m.frase, '59% do seu dinheiro está exposto à América do Norte. 24% à Europa, 8% ao Brasil e 9% ao resto.')
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
  assert.equal(m.coberturaTxt, 'Sabemos de onde vem a receita de 1 das suas 3 empresas e fundos.')
  // o maior pedaço é a sede: a frase abre com ele, dito como é
  assert.equal(m.frase, '67% do seu dinheiro está em empresas com sede no Brasil, ainda sem dado de receita. 18% está exposto ao Brasil, 10% à América do Norte e 5% ao resto.')
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
  assert.equal(m.frase, '92% do seu dinheiro está exposto ao Brasil. 5% aos Estados Unidos e 3% a Taiwan.')

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
  assert.equal(m.frase, '40% do seu dinheiro está exposto ao Brasil. 30% aos Estados Unidos, 20% ao mundo desenvolvido e 10% ao resto.')
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
  assert.equal(m.frase, '80% do seu dinheiro está exposto ao Brasil.')
})

test('cripto fica à parte, fora do mapa (inclusive o ETF de cripto)', () => {
  const carteira = [pos('Tesouro', 'TREASURY', 900), pos('BTC', 'CRYPTO', 70), pos('HASH11', 'ETF', 30)]
  const m = exposicaoNoMundo(carteira, { HASH11: { tipo: 'etf', geografia: 'GLOBAL', classe: 'crypto' } })
  assert.deepEqual(m.noMapa.map((f) => f.nome), ['Brasil'])
  assert.deepEqual(m.fora.map((f) => [f.nome, f.pctInt, f.tickers]), [['Cripto', 10, ['BTC', 'HASH11']]])
  assert.equal(m.frase, '90% do seu dinheiro está exposto ao Brasil. 10% a cripto.')
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
  assert.equal(m.frase, '99% do seu dinheiro está exposto ao Brasil. Menos de 1% aos Estados Unidos.')
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

test('o dado do mundo: pontos com país e a projeção do mapa plano', () => {
  const t = pontosDaTerra()
  assert.ok(t.n > 4000 && t.n < 6000)
  const br = PAISES_ID.indexOf('076')
  let noBrasil = 0
  for (let i = 0; i < t.n; i++) if (t.pais[i] === br) noBrasil++
  assert.ok(noBrasil > 200)
  // São Paulo cai no lugar certo do mapa 1000×436 (d3.geoNaturalEarth1)
  const [x, y] = projetarPlano(-46.6, -23.5)
  assert.ok(Math.abs(x - 372.38) < 0.05 && Math.abs(y - 331.69) < 0.05)
})
