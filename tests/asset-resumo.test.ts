/**
 * Resumo factual de /asset/{TICKER}: frase vazia não sai, e o texto não
 * recomenda compra nem venda. Os números entram prontos — a função não
 * busca a API.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AVISO_RESUMO, fundirFaq, montarResumoAtivo, type ResumoAtivoInput } from '../app/utils/assetResumo.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO, TETO_TITULO_PAGINA } from '../app/utils/serp.ts'

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
    fonteIndicadores: 'StatusInvest, base em DFP/ITR',
    min52: 29.53,
    max52: 59.68,
    serie: { de: '2025-10-29', ate: '2026-10-28', variacao: 82.07, ibov: 15.99 },
    setorMedia: { variacao: -1.57, papeis: 26, variacaoAtivo: -0.4, data: '2026-10-28' },
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
  assert.equal(r.title, 'PETR4 cotação hoje: Petrobras e dividendos')
  assert.ok(r.title.length <= TETO_TITULO_PAGINA)
  assert.ok(r.description.length <= TETO_DESCRICAO)
  assert.match(r.description, /Cotação PETR4 \(Petrobras\) hoje: R\$ 52,51 no fechamento de 28\/10\/2026 \(Brapi\)/)
  assert.match(r.description, /Dividend yield 6,96%, P\/L 5,07 \(StatusInvest\)/)
  assert.match(r.description, /Não é recomendação\.$/)
  const corpo = r.paragrafos.join('\n')
  assert.match(corpo, /cotação mais recente é R\$ 52,51/)
  assert.match(corpo, /atualizada em 28\/10\/2026/)
  assert.match(corpo, /Fonte: Brapi \(B3\), atualização de 10 a 30 min/)
  assert.doesNotMatch(corpo, /No pregão de|atraso de 15 min|mesma leitura/)
  assert.match(corpo, /mínima de 52 semanas foi R\$ 29,53/)
  assert.match(corpo, /máxima foi R\$ 59,68/)
  assert.match(corpo, /Fonte: StatusInvest \(dados diários\), em 28\/10\/2026/)
  const doze = r.paragrafos.find((p) => p.includes('Indicadores dos últimos 12 meses'))
  assert.ok(doze)
  const frase12 = doze.split('. ')[0] ?? ''
  assert.match(frase12, /dividend yield de 6,96%/)
  assert.match(frase12, /P\/L de 5,07/)
  assert.match(frase12, /ROE de 30,3%/)
  assert.doesNotMatch(frase12, /P\/VP|valor de mercado/)
  assert.match(corpo, /O P\/VP é 1,41 e o valor de mercado é R\$ 718,21B/)
  assert.match(corpo, /Fonte: StatusInvest, base em DFP\/ITR/)
  assert.match(corpo, /De 29\/10\/2025 a 28\/10\/2026, PETR4 variou \+82,07%/)
  assert.match(corpo, /No mesmo período, o Ibovespa variou \+15,99%/)
  assert.doesNotMatch(corpo, /cerca de 12 meses|média dos/)
  assert.match(corpo, /proventos de renda de PETR4 com data-com/)
  assert.match(corpo, /R\$ 3,45 por ação/)
  assert.match(corpo, /2025, R\$ 2,52/)
  assert.match(corpo, /2026 até agora, R\$ 3,45/)
  assert.match(corpo, /O próximo pagamento previsto é 21 dez 2026/)
  assert.doesNotMatch(corpo, /\(últimos 12 meses\)|pagamento informado/)
  assert.match(corpo, /Fonte: avisos de proventos da B3/)
  assert.doesNotMatch(textoDe(r), /série pedida|série do mesmo pedido|nessa lista|setor informado|rank global informado|supply|pagou|pagos/i)
  assert.equal(r.links.some((l) => l.href.includes('preco-teto')), false)
  assert.ok(r.links.some((l) => l.href === '/dividendos/PETR4'))
  const faqPreco = r.faq.find((f) => /cotação/i.test(f.q))
  assert.ok(faqPreco)
  assert.match(faqPreco.a, /cotação mais recente/)
  assert.match(faqPreco.a, /Brapi \(B3\), atualização de 10 a 30 min/)
  assert.doesNotMatch(faqPreco.a, /pregão de/)
  const faqSerie = r.faq.find((f) => /12 meses/i.test(f.q) && /variou/i.test(f.a))
  assert.ok(faqSerie)
  assert.match(faqSerie.a, /Ibovespa/)
  assert.match(faqSerie.a, /StatusInvest \(dados diários\), em 28\/10\/2026/)
  assert.doesNotMatch(r.faq.map((f) => f.q).join('\n'), /pagou/)
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
    fonteIndicadores: 'StatusInvest',
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
  assert.equal(r.title, 'HGLG11 cotação hoje: Pátria Log, FII')
  const corpo = r.paragrafos.join('\n')
  assert.doesNotMatch(corpo, /P\/L/)
  assert.doesNotMatch(corpo, /m[eé]dia do setor|m[eé]dia dos \d/)
  assert.doesNotMatch(corpo, /O setor informado é imobiliário/)
  assert.match(corpo, /fundo imobiliário/)
  assert.match(corpo, /O P\/VP é 0,89/)
  assert.match(corpo, /o valor patrimonial por cota é R\$ 165,48/)
  assert.match(corpo, /a participação no IFIX é 4,18%/)
  assert.match(corpo, /613\.837 cotistas/)
  assert.match(corpo, /por cota/)
  assert.match(corpo, /Fonte: StatusInvest\./)
  assert.match(r.description, /Cotação HGLG11 \(Pátria Log\) hoje: R\$ 147,58 no fechamento de 28\/10\/2026 \(Brapi\)/)
  assert.match(r.description, /Dividend yield 9,09%, P\/VP 0,89 \(StatusInvest\)/)
  assert.match(r.description, /Não é recomendação\.$/)
  assert.ok(r.description.length <= TETO_DESCRICAO)
  assert.doesNotMatch(semAviso(textoDe(r)), VERBOS)
})

test('cripto não leva número de mercado no resumo, na FAQ nem na description', () => {
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
  assert.equal(r.paragrafos.join('\n'), 'Bitcoin (BTC) é um criptoativo. A cotação em reais está no topo desta página, e o gráfico fica abaixo do título.')
  assert.equal(r.description, 'BTC (Bitcoin) é um criptoativo. A cotação em reais está nesta página. Não é recomendação.')
  assert.doesNotMatch(r.description, /\d/)
  assert.doesNotMatch(r.paragrafos.join('\n'), /\d/)
  assert.equal(r.faq.length, 0)
  assert.equal(r.faqTitulo, null)
  assert.equal(r.links.length, 0)
  assert.doesNotMatch(textoDe(r), /R\$|%|Fonte:|B3|pregão|provento|dividend|supply|rank/i)
  assert.doesNotMatch(semAviso(textoDe(r)), VERBOS)
})

test('a média do setor não entra: o ranking não traz data da leitura', () => {
  const r = montarResumoAtivo(base({
    setor: 'Energia',
    variacaoDia: -0.53,
    data: '2026-10-28',
    preco: 10,
    setorMedia: { variacao: -1.57, papeis: 26, variacaoAtivo: -0.4, data: '2026-10-28' },
  }))
  assert.ok(r)
  assert.doesNotMatch(r.paragrafos.join('\n'), /média|mesma leitura/)
  assert.match(r.paragrafos.join('\n'), /variação de -0,53% no dia/)
})

test('FAQ nova entra na editorial, sem repetir a pergunta', () => {
  const editorial = [{ q: 'O que a Petrobras faz?', a: 'Explora e produz petróleo.' }]
  const novas = [
    { q: 'Qual a cotação de Petrobras (PETR4)?', a: 'A cotação mais recente é R$ 52,51.' },
    { q: 'O que a Petrobras faz?', a: 'Não deve duplicar.' },
  ]
  const junta = fundirFaq(editorial, novas)
  assert.equal(junta.length, 2)
  assert.equal(junta[0]?.q, 'O que a Petrobras faz?')
  assert.match(junta[1]?.q ?? '', /cotação/)
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
  assert.match(r.title, /^PCAR3 cotação hoje:/)
  assert.equal(r.title.includes('Companhia Brasileira de Distribuição e Logística Integrada Nacional'), false)
  assert.match(r.h1, /Companhia Brasileira de Distribuição/)
  assert.ok(r.description.length <= TETO_DESCRICAO)
  assert.match(r.description, /PCAR3/)
  assert.match(r.description, /R\$ 10,00/)
  assert.match(r.description, /28\/10\/2026/)
})

test('sem nome não há resumo', () => {
  assert.equal(montarResumoAtivo(base({ nome: '   ', ticker: 'PETR4' })), null)
})

const CVM20 = /\b(barato|oportunidade|compre|vale a pena)\b/i

const PROVENTOS: NonNullable<ResumoAtivoInput['proventos']> = {
  unidade: 'ação',
  renda12: 1,
  eventos12: 1,
  capital12: 0,
  frequencia: null,
  proximo: null,
  anos: [],
  tipo: 'renda',
}

function numerosDe(dy: number | null, pl: number | null): ResumoAtivoInput['numeros'] {
  return {
    dy, pl, pvp: null, roe: null, margem: null, valorMercado: null,
    vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null,
  }
}

test('título e description de /asset usam o dado, cabem no SERP e não recomendam', () => {
  const casos: Array<{ ticker: string; nome: string; preco: number; dy: number | null; pl: number | null; title: string; description: string }> = [
    {
      ticker: 'BBAS3', nome: 'Banco do Brasil', preco: 16.47, dy: 4.19, pl: 7.66,
      title: 'BBAS3 cotação hoje: Banco do Brasil e dividendos',
      description: 'Cotação BBAS3 (Banco do Brasil) hoje: R$ 16,47 no fechamento de 30/10/2026 (Brapi). Dividend yield 4,19%, P/L 7,66 (StatusInvest). Não é recomendação.',
    },
    {
      ticker: 'ITUB4', nome: 'Itaú Unibanco', preco: 38.69, dy: 7.97, pl: 9.56,
      title: 'ITUB4 cotação hoje: Itaú Unibanco e dividendos',
      description: 'Cotação ITUB4 (Itaú Unibanco) hoje: R$ 38,69 no fechamento de 30/10/2026 (Brapi). Dividend yield 7,97%, P/L 9,56 (StatusInvest). Não é recomendação.',
    },
    {
      ticker: 'POMO4', nome: 'Marcopolo', preco: 3.7, dy: 24.98, pl: 4.14,
      title: 'POMO4 cotação hoje: Marcopolo e dividendos',
      description: 'Cotação POMO4 (Marcopolo) hoje: R$ 3,70 no fechamento de 30/10/2026 (Brapi). Dividend yield 24,98%, P/L 4,14 (StatusInvest). Não é recomendação.',
    },
    {
      ticker: 'SAPR4', nome: 'Sanepar', preco: 6.03, dy: 1.87, pl: 20.01,
      title: 'SAPR4 cotação hoje: Sanepar e dividendos',
      description: 'Cotação SAPR4 (Sanepar) hoje: R$ 6,03 no fechamento de 30/10/2026 (Brapi). Dividend yield 1,87%, P/L 20,01 (StatusInvest). Não é recomendação.',
    },
    {
      ticker: 'UNIP6', nome: 'Unipar', preco: 51, dy: 12.7, pl: 21.36,
      title: 'UNIP6 cotação hoje: Unipar e dividendos',
      description: 'Cotação UNIP6 (Unipar) hoje: R$ 51,00 no fechamento de 30/10/2026 (Brapi). Dividend yield 12,70%, P/L 21,36 (StatusInvest). Não é recomendação.',
    },
    {
      ticker: 'CXSE3', nome: 'Caixa Seguridade', preco: 21.38, dy: null, pl: null,
      title: 'CXSE3 cotação hoje: Caixa Seguridade e dividendos',
      description: 'Cotação CXSE3 (Caixa Seguridade) hoje: R$ 21,38 no fechamento de 30/10/2026 (Brapi). Não é recomendação.',
    },
  ]

  for (const c of casos) {
    const r = montarResumoAtivo(base({
      ticker: c.ticker,
      nome: c.nome,
      kind: 'stock',
      preco: c.preco,
      data: '2026-10-30',
      numeros: numerosDe(c.dy, c.pl),
      proventos: PROVENTOS,
    }))
    assert.ok(r, c.ticker)
    assert.equal(r.title, c.title, c.ticker)
    assert.ok(r.title.length + SUFIXO_MARCA.length <= TETO_TITULO, `${c.ticker} ${r.title.length + SUFIXO_MARCA.length}`)
    assert.equal(r.description, c.description, c.ticker)
    assert.ok(r.description.length <= TETO_DESCRICAO, `${c.ticker} ${r.description.length}`)
    assert.doesNotMatch(`${r.title}\n${r.description}`, CVM20, c.ticker)
  }

  const bdr = montarResumoAtivo(base({ ticker: 'AAPL34', nome: 'Apple', kind: 'bdr', preco: 50, data: '2026-10-30' }))
  const etf = montarResumoAtivo(base({ ticker: 'BOVA11', nome: 'Ibovespa', kind: 'etf', preco: 140, data: '2026-10-30' }))
  const semProvento = montarResumoAtivo(base({ ticker: 'XYZW3', nome: 'Empresa', preco: 10, data: '2026-10-30' }))
  assert.equal(bdr?.title, 'AAPL34 cotação hoje: Apple, BDR')
  assert.equal(etf?.title, 'BOVA11 cotação hoje: Ibovespa, ETF')
  assert.equal(semProvento?.title, 'XYZW3 cotação hoje: Empresa na B3')

  const outraData = montarResumoAtivo(base({
    ticker: 'BBAS3', nome: 'Banco do Brasil', preco: 10, data: '2026-01-05',
    numeros: numerosDe(4.19, 7.66), proventos: PROVENTOS,
  }))
  assert.match(outraData?.description ?? '', /no fechamento de 05\/01\/2026/)
  assert.match(outraData?.description ?? '', /R\$ 10,00/)
  assert.doesNotMatch(outraData?.description ?? '', /30\/10\/2026|16,47/)
})

test('cotação sem número não inventa preço nem data', () => {
  const r = montarResumoAtivo(base({ ticker: 'BBAS3', nome: 'Banco do Brasil' }))
  assert.ok(r)
  assert.match(r.description, /Cotação BBAS3 \(Banco do Brasil\) hoje sem número de fechamento/)
  assert.match(r.description, /Não é recomendação\.$/)
  assert.doesNotMatch(r.description, /R\$|US\$|\d{2}\/\d{2}|%/)
  assert.doesNotMatch(r.description, /Dividend yield|P\/L/)
  assert.ok(r.description.length <= TETO_DESCRICAO)
  assert.doesNotMatch(`${r.title}\n${r.description}`, CVM20)

  const semData = montarResumoAtivo(base({
    ticker: 'ITUB4', nome: 'Itaú Unibanco', preco: 38.69, proventos: PROVENTOS,
  }))
  assert.match(semData?.description ?? '', /R\$ 38,69/)
  assert.match(semData?.description ?? '', /sem data de fechamento/)
  assert.doesNotMatch(semData?.description ?? '', /\d{2}\/\d{2}\/\d{4}/)
  assert.doesNotMatch(semData?.description ?? '', CVM20)
})

test('o resumo para ler (fatos): os mesmos números, fontes e datas, sem "Fonte:" no meio e com a data uma vez', () => {
  const r = montarResumoAtivo(base({
    ticker: 'PETR4', nome: 'Petrobras', setor: 'Energia', preco: 50.71, variacaoDia: -3.79, data: '2026-11-03',
    numeros: { dy: 7.21, pl: 4.9, pvp: 1.36, roe: 30.3, margem: 24.3, valorMercado: 726.56e9, vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null },
    fonteIndicadores: 'StatusInvest, base em DFP/ITR', min52: 29.53, max52: 59.79,
    serie: { de: '2025-11-03', ate: '2026-11-03', variacao: 75.16, ibov: 10.02 },
    proventos: { unidade: 'ação', renda12: 3.66, eventos12: 4, capital12: 0, frequencia: 'Trimestral', proximo: '23 nov 2026', anos: [{ ano: '2025', valor: 2.92, corrente: false }, { ano: '2026', valor: 2.71, corrente: true }], tipo: 'renda' },
  }))!
  const f = r.fatos
  const frase = (x: { t: string }[]) => x.map((p) => p.t).join('')
  const texto = [f.titulo, ...f.frases.map(frase), ...f.indicadores.map((x) => `${x.rotulo} ${x.valor}`), f.indicadoresNota, ...(f.proventos?.frases.map(frase) ?? []), ...(f.proventos?.anos.map((x) => `${x.rotulo} ${x.valor}`) ?? []), f.proventos?.legenda, f.fontes].join('\n')
  // os números do parágrafo antigo, todos, pelo menos uma vez
  for (const n of ['R$ 50,71', '-3,79%', 'R$ 29,53', 'R$ 59,79', '+75,16%', '+10,02%', '7,21%', '4,90', '30,3%', '24,3%', '1,36', 'R$ 3,66', 'R$ 2,92', 'R$ 2,71', '23 nov 2026', '03/11/2025']) {
    assert.ok(texto.includes(n), n)
  }
  // o valor de mercado no tamanho de leitura, não "726,56B"
  assert.ok(texto.includes('R$ 726,6 bi'))
  assert.doesNotMatch(texto, /\d+,\d+B\b/)
  // as fontes juntas, no fim, cada uma uma vez; a data de atualização uma vez
  for (const fonte of ['Brapi (B3), atualização de 10 a 30 min', 'StatusInvest (dados diários)', 'StatusInvest, base em DFP/ITR', 'avisos de proventos da B3']) {
    assert.equal(texto.split(fonte).length - 1, 1, fonte)
  }
  assert.doesNotMatch(f.frases.map(frase).join(' '), /Fonte:/)
  assert.equal((f.fontes ?? '').match(/Atualizado em 03\/11\/2026\./g)?.length, 1)
  // o ano corrente diz que é parcial; os 12 meses ficam na frase
  assert.deepEqual(f.proventos?.anos.map((x) => x.rotulo), ['2025', '2026 até agora'])
  assert.match(frase(f.proventos!.frases[0]!), /Nos últimos 12 meses.*R\$ 3,66 por ação/)
  assert.doesNotMatch(semAviso(texto), VERBOS)
})

test('o resumo para ler de cripto não leva número', () => {
  const r = montarResumoAtivo(base({ ticker: 'BTC', nome: 'Bitcoin', kind: 'crypto', preco: 600000, data: '2026-11-03' }))!
  assert.doesNotMatch(r.fatos.frases.flat().map((p) => p.t).join(''), /\d/)
  assert.equal(r.fatos.fontes, null)
})
