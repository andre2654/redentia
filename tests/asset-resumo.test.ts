/**
 * Resumo factual de /asset/{TICKER}: frase vazia não sai, e o texto não
 * recomenda compra nem venda. Os números entram prontos — a função não
 * busca a API.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AVISO_RESUMO, montarResumoAtivo, type ResumoAtivoInput } from '../app/utils/assetResumo.ts'
import { TETO_DESCRICAO, TETO_TITULO_PAGINA } from '../app/utils/serp.ts'

const VERBOS = /\b(compre|comprar|compra|vend(?:a|e|er)|recomend\w*|oportunidade|vale a pena|barat[oa]s?|car[oa]s?|atrativ[oa]s?|imperd[ií]vel|garantid[oa]s?)\b/i

function base(over: Partial<ResumoAtivoInput> = {}): ResumoAtivoInput {
  return {
    ticker: 'ZZZZ3',
    nome: 'Empresa',
    kind: 'stock',
    setor: null,
    moeda: 'BRL',
    preco: null,
    variacaoDia: null,
    data: null,
    numeros: {
      dy: null, pl: null, pvp: null, roe: null, margem: null, valorMercado: null,
      vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null,
    },
    fonteIndicadores: null,
    min52: null,
    max52: null,
    serie: null,
    setorMedia: null,
    proventos: null,
    etf: null,
    cripto: null,
    links: [],
    ...over,
  }
}

function textoDe(r: NonNullable<ReturnType<typeof montarResumoAtivo>>): string {
  return [r.h1, r.title, r.description, ...r.paragrafos, r.faqTitulo ?? '', ...r.faq.flatMap((f) => [f.q, f.a]), ...r.links.map((l) => l.label)].join('\n')
}

function semAviso(s: string): string {
  return s.replaceAll(AVISO_RESUMO, '').replaceAll('Não é recomendação.', '')
}

test('dado faltando não vira frase vazia nem trecho genérico', () => {
  const r = montarResumoAtivo(base())
  assert.ok(r)
  const texto = textoDe(r)
  assert.doesNotMatch(texto, /R\$\s*(?!\d)/)
  assert.doesNotMatch(texto, /US\$\s*(?!\d)/)
  assert.doesNotMatch(texto, /dividend yield/i)
  assert.doesNotMatch(texto, /P\/L/)
  assert.doesNotMatch(texto, /P\/VP/)
  assert.doesNotMatch(texto, /\bsetor\b/i)
  assert.doesNotMatch(texto, /m[eé]dia/i)
  assert.doesNotMatch(texto, /provento/i)
  assert.doesNotMatch(texto, /Fonte:\s*\./)
  assert.doesNotMatch(texto, /\(\s*\)/)
  assert.doesNotMatch(texto, /de\s*%/)
  assert.equal(r.faq.length, 0)
  assert.equal(r.faqTitulo, null)
  assert.match(r.paragrafos[0]!, /Empresa \(ZZZZ3\) é uma ação negociada na B3\./)
  assert.equal(r.h1, 'Empresa (ZZZZ3) na B3')
  assert.equal(r.aviso, AVISO_RESUMO)
  assert.match(r.description, /Não é recomendação\.$/)
})

test('zero é dado, não ausência: DY 0 entra e não vira "de %"', () => {
  const r = montarResumoAtivo(base({
    numeros: {
      dy: 0, pl: null, pvp: null, roe: null, margem: null, valorMercado: null,
      vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null,
    },
    fonteIndicadores: 'dados da B3 e balanços',
  }))
  assert.ok(r)
  const bloco = r.paragrafos.join(' ')
  assert.match(bloco, /dividend yield de 0,00%/)
  assert.match(bloco, /Fonte: dados da B3 e balanços/)
  assert.doesNotMatch(bloco, /de\s*%/)
})

test('NaN e link inválido somem', () => {
  const r = montarResumoAtivo(base({
    preco: Number.NaN,
    numeros: {
      dy: Number.NaN, pl: null, pvp: null, roe: null, margem: null, valorMercado: null,
      vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null,
    },
    links: [
      { href: '', label: 'vazio' },
      { href: 'https://exemplo.com', label: 'fora' },
      { href: '/asset/VALE3', label: 'Vale (VALE3)' },
      { href: '/asset/VALE3', label: 'duplicado' },
    ],
  }))
  assert.ok(r)
  assert.doesNotMatch(textoDe(r), /NaN|R\$/)
  assert.deepEqual(r.links, [{ href: '/asset/VALE3', label: 'Vale (VALE3)' }])
})

test('ação com números: title, H1, fontes e FAQ visível, sem verbo de recomendação', () => {
  const r = montarResumoAtivo(base({
    ticker: 'petr4',
    nome: 'Petrobras',
    kind: 'stock',
    setor: 'Energia',
    preco: 52.51,
    variacaoDia: -0.53,
    data: '2026-10-28',
    numeros: {
      dy: 6.96139, pl: 5.074, pvp: 1.407, roe: 30.306, margem: 24.316, valorMercado: 718.209e9,
      vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null,
    },
    fonteIndicadores: 'dados da B3 e balanços',
    min52: 29.53,
    max52: 59.68,
    serie: { de: '2025-10-29', ate: '2026-10-28', variacao: 82.07, ibov: 15.99 },
    setorMedia: { variacao: -1.57, papeis: 26 },
    proventos: {
      unidade: 'ação',
      renda12: 3.45,
      eventos12: 4,
      capital12: 0,
      frequencia: 'Trimestral',
      proximo: '21 dez 2026',
      anos: [
        { ano: '2024', valor: 2.91, corrente: false },
        { ano: '2025', valor: 2.52, corrente: false },
        { ano: '2026', valor: 3.45, corrente: true },
      ],
      tipo: 'renda',
    },
    links: [
      { href: '/calculadora/preco-teto/PETR4', label: 'Preço teto de PETR4' },
      { href: '/dividendos/PETR4', label: 'Dividendos de PETR4' },
      { href: '/setor/energia', label: 'Setor energia' },
      { href: '/asset/PRIO3', label: 'PetroRio (PRIO3)' },
    ],
  }))
  assert.ok(r)
  assert.equal(r.h1, 'Petrobras (PETR4), setor energia')
  assert.equal(r.title, 'Petrobras (PETR4): cotação e dividendos')
  assert.ok(r.title.length <= TETO_TITULO_PAGINA)
  assert.ok(r.description.length <= TETO_DESCRICAO)
  assert.match(r.description, /PETR4/)
  assert.match(r.description, /R\$ 52,51/)
  assert.match(r.description, /28\/10\/2026/)
  assert.match(r.description, /Não é recomendação\.$/)
  const corpo = r.paragrafos.join('\n')
  assert.match(corpo, /pregão de 28\/10\/2026/)
  assert.match(corpo, /Fonte: B3/)
  assert.match(corpo, /dividend yield de 6,96%/)
  assert.match(corpo, /P\/L de 5,07/)
  assert.match(corpo, /ROE de 30,3%/)
  assert.match(corpo, /Fonte: dados da B3 e balanços/)
  assert.match(corpo, /Ibovespa/)
  assert.match(corpo, /26 papéis do setor energia/)
  assert.match(corpo, /-1,57%/)
  assert.match(corpo, /R\$ 3,45 por ação/)
  assert.match(corpo, /2026, R\$ 3,45 \(últimos 12 meses\)/)
  assert.match(corpo, /Fonte: avisos de proventos da B3/)
  assert.equal(r.faqTitulo, 'Perguntas frequentes sobre PETR4')
  assert.ok(r.faq.length >= 4 && r.faq.length <= 5)
  assert.ok(r.faq.every((f) => f.q.includes('PETR4') || f.q.includes('Petrobras')))
  assert.ok(r.faq.every((f) => f.a.length > 40))
  assert.doesNotMatch(semAviso(textoDe(r)), VERBOS)
})

test('FII sem média de setor e sem P/L não inventa os dois', () => {
  const r = montarResumoAtivo(base({
    ticker: 'HGLG11',
    nome: 'Pátria Log',
    kind: 'fii',
    setor: 'Imobiliário',
    preco: 147.58,
    variacaoDia: -1.43,
    data: '2026-10-28',
    numeros: {
      dy: 9.086, pl: null, pvp: 0.8918, roe: null, margem: null, valorMercado: null,
      vpCota: 165.476, rendaMedia24m: 1.1, ifix: 4.183, cotistas: 613837,
    },
    fonteIndicadores: 'dados da B3 e informes do fundo',
    proventos: {
      unidade: 'cota',
      renda12: 12.4,
      eventos12: 12,
      capital12: 0,
      frequencia: 'Mensal',
      proximo: null,
      anos: [{ ano: '2026', valor: 12.4, corrente: true }],
      tipo: 'renda',
    },
  }))
  assert.ok(r)
  assert.equal(r.h1, 'Pátria Log (HGLG11), fundo imobiliário')
  assert.equal(r.title, 'Pátria Log (HGLG11): cotação do FII')
  const corpo = r.paragrafos.join('\n')
  assert.doesNotMatch(corpo, /P\/L/)
  assert.doesNotMatch(corpo, /m[eé]dia do setor|m[eé]dia dos \d/)
  assert.doesNotMatch(corpo, /O setor informado é imobiliário/)
  assert.match(corpo, /fundo imobiliário/)
  assert.match(corpo, /P\/VP de 0,89/)
  assert.match(corpo, /R\$ 165,48/)
  assert.match(corpo, /participação no IFIX de 4,18%/)
  assert.match(corpo, /613\.837 cotistas/)
  assert.match(corpo, /por cota/)
  assert.match(corpo, /Fonte: dados da B3 e informes do fundo/)
  assert.doesNotMatch(semAviso(textoDe(r)), VERBOS)
})

test('cripto não cita B3, pregão nem provento, e o preço grande sai sem centavos', () => {
  const r = montarResumoAtivo(base({
    ticker: 'BTC',
    nome: 'Bitcoin',
    kind: 'crypto',
    preco: 427525,
    variacaoDia: -0.757,
    data: '2026-10-29',
    serie: { de: '2025-10-29', ate: '2026-10-29', variacao: -27.82, ibov: null },
    cripto: {
      valorMercado: 8.595e12,
      volume24h: 144.26e9,
      dominancia: 59.532,
      rank: 1,
      var7d: -2.294,
      var30d: -4.665,
      min52: 305838,
      max52: 592325,
      supplyCirc: 20105168,
      supplyMax: 21000000,
    },
  }))
  assert.ok(r)
  assert.equal(r.h1, 'Bitcoin (BTC), preço em reais')
  assert.equal(r.title, 'Bitcoin (BTC): preço em reais')
  const corpo = r.paragrafos.join('\n')
  assert.match(corpo, /R\$ 427\.525/)
  assert.match(corpo, /em 24 horas/)
  assert.match(corpo, /R\$ 8,60T/)
  assert.match(corpo, /rank global informado é 1/)
  assert.match(corpo, /20,11M BTC/)
  assert.match(corpo, /21,00M BTC/)
  assert.doesNotMatch(corpo, /B3|pregão|provento|dividend/i)
  assert.equal(r.links.length, 0)
  assert.ok(r.faq.some((f) => /preço/i.test(f.q) && /427\.525/.test(f.a)))
  assert.doesNotMatch(semAviso(textoDe(r)), VERBOS)
})

test('trocar só o ticker não deixa PETR4 e TAEE11 com o mesmo texto', () => {
  const petr = montarResumoAtivo(base({
    ticker: 'PETR4', nome: 'Petrobras', setor: 'Energia', preco: 52.51, data: '2026-10-28',
    numeros: { dy: 6.96, pl: 5.07, pvp: null, roe: 30.3, margem: null, valorMercado: null, vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null },
  }))
  const taee = montarResumoAtivo(base({
    ticker: 'TAEE11', nome: 'Taesa', setor: 'Utilidades públicas', preco: 39.71, data: '2026-10-28',
    numeros: { dy: 7.57, pl: 8.2, pvp: null, roe: 20.7, margem: null, valorMercado: null, vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null },
  }))
  assert.ok(petr && taee)
  const norm = (s: string, ticker: string, nome: string) => s.replaceAll(ticker, 'T').replaceAll(nome, 'N')
  assert.notEqual(norm(textoDe(petr), 'PETR4', 'Petrobras'), norm(textoDe(taee), 'TAEE11', 'Taesa'))
})

test('nome longo não estoura o title e o ticker permanece', () => {
  const r = montarResumoAtivo(base({
    ticker: 'PCAR3',
    nome: 'Companhia Brasileira de Distribuição e Logística Integrada Nacional',
    preco: 10,
    data: '2026-10-28',
  }))
  assert.ok(r)
  assert.ok(r.title.length <= TETO_TITULO_PAGINA, r.title)
  assert.match(r.title, /PCAR3/)
  assert.match(r.h1, /Companhia Brasileira de Distribuição/)
  assert.ok(r.description.length <= TETO_DESCRICAO)
})

test('sem nome não há resumo', () => {
  assert.equal(montarResumoAtivo(base({ nome: '   ', ticker: 'PETR4' })), null)
})
