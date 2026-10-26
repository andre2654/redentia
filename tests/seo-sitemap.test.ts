/**
 * Régua do sitemap de ativos e o orçamento de title/description.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SETORES } from '../app/content/setores.ts'
import {
  SUFIXO_MARCA,
  TETO_DESCRICAO,
  TETO_TITULO,
  descricaoQueCabe,
  juntaAte,
  tituloQueCabe,
  tituloSetor,
} from '../app/utils/serp.ts'
import { tickerDePaginaAtivo } from '../app/utils/tickerSitemap.ts'
import { tipoDoSitemap } from '../server/utils/sitemap-xml.ts'

test('ticker de página 200 entra; alias, símbolo inválido e tipo de fora ficam de fora', () => {
  assert.equal(tickerDePaginaAtivo({ ticker: 'bbdc3', type: 'STOCK' }), 'BBDC3')
  assert.equal(tickerDePaginaAtivo({ ticker: 'SANB4', type: 'STOCK' }), 'SANB4')
  assert.equal(tickerDePaginaAtivo({ ticker: 'ALUP11', type: 'STOCK' }), 'ALUP11')
  assert.equal(tickerDePaginaAtivo({ ticker: 'HGLG11', type: 'REIT' }), 'HGLG11')
  assert.equal(tickerDePaginaAtivo({ ticker: 'AAPL34', type: 'BDR' }), 'AAPL34')
  assert.equal(tickerDePaginaAtivo({ ticker: 'BOVA11', type: 'ETF' }), 'BOVA11')
  assert.equal(tickerDePaginaAtivo({ ticker: 'MRSA3B', type: 'STOCK' }), null)
  assert.equal(tickerDePaginaAtivo({ ticker: 'AAPL', type: 'US_STOCK' }), null)
  assert.equal(tickerDePaginaAtivo({ ticker: 'EMBR3', type: 'STOCK', alias_of: 'EMBJ3' }), null)
  assert.equal(tickerDePaginaAtivo({ ticker: 'XYZ', type: 'UNKNOWN' }), null)
})

test('tipo de sitemap aceita o sufixo .xml e rejeita o resto', () => {
  assert.equal(tipoDoSitemap('ativos.xml'), 'ativos')
  assert.equal(tipoDoSitemap('dividendos'), 'dividendos')
  assert.equal(tipoDoSitemap('busca.xml'), null)
  assert.equal(tipoDoSitemap(undefined), null)
})

test('título de setor cabe em 60 com a marca, e a description em 155', () => {
  for (const setor of SETORES) {
    const full = tituloSetor(setor.ptSlug, setor.name) + SUFIXO_MARCA
    assert.ok(full.length <= TETO_TITULO, `${setor.ptSlug} title ${full.length}: ${full}`)
    assert.equal(full.includes('Setor Serviços'), false)
    const desc = descricaoQueCabe(setor.blurb)
    assert.ok(desc.length <= TETO_DESCRICAO, `${setor.ptSlug} desc ${desc.length}`)
  }
  assert.equal(tituloSetor('financeiro', 'Serviços financeiros'), 'Financeiro na B3: bancos e cotações')
})

test('title e description cortam no espaço e respeitam o teto', () => {
  const longo = 'Tesouro Renda+ Aposentadoria Extra 2065: taxa IPCA + 6,71% hoje e mais texto'
  const title = tituloQueCabe(longo)
  assert.ok(title.length <= TETO_TITULO - SUFIXO_MARCA.length)
  assert.equal(title.endsWith(' '), false)
  const desc = juntaAte([
    'Cotação de um nome muito comprido que sozinho já não cabe na meta description do Google porque passa de cento e cinquenta e cinco caracteres com folga de propósito para o corte.',
    'Esta frase não entra.',
  ])
  assert.ok(desc.length <= TETO_DESCRICAO, String(desc.length))
})

test('metas reescritas para CTR cabem no SERP', () => {
  const metas: Array<[string, string]> = [
    ['Quanto investir por mês para sua meta', 'Calcule o aporte mensal para juntar R$ 100 mil, R$ 500 mil ou R$ 1 milhão. Com taxa, prazo e patrimônio. Grátis.'],
    ['Calculadora de dividendos de ações da B3', 'Simule quanto PETR4, ITUB4, VALE3 e outras ações teriam rendido com dividendos reinvestidos. Histórico real da B3, grátis.'],
    ['IR sobre ações: calcule o DARF 2026', 'Swing trade a 15%, day trade a 20% e isenção de R$ 20 mil. Calcule o DARF 6015 do mês. Grátis.'],
    ['Quem lucrou mais na B3 em 2026', 'Ranking das empresas com maior lucro líquido na B3: Petrobras, Itaú, Vale e os bancos. Atualizado com o último balanço.'],
    ['Ações que mais caíram no mês na B3', 'As 50 ações e FIIs que mais caíram em 30 dias na B3, com a variação e o valor de mercado. Atualizado após o pregão.'],
  ]
  const guia = 'Como investir em ações do zero: abrir conta, escolher a ação por fundamento e enviar a primeira ordem. Guia da Redentia.'
  assert.ok(guia.length <= TETO_DESCRICAO, String(guia.length))
  for (const [title, description] of metas) {
    assert.ok(title.length + SUFIXO_MARCA.length <= TETO_TITULO, `${title} (${title.length + SUFIXO_MARCA.length})`)
    assert.ok(description.length <= TETO_DESCRICAO, `${description.length}`)
  }
})
