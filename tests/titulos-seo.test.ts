/**
 * Titles de /asset/{ticker} e /dividendos/{ticker}: cabem em 60 com
 * " · Aportou", e o nome da empresa não é cortado no meio da palavra
 * nem termina em preposição solta.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { montarResumoAtivo, type ResumoAtivoInput } from '../app/utils/assetResumo.ts'
import { SUFIXO_MARCA, TETO_TITULO, TETO_TITULO_PAGINA, encurtaNome, tituloDividendos } from '../app/utils/serp.ts'

const PREP = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])
const CVM = /\b(compre|comprar|compra|venda|vender|recomend\w*|garantid\w*|rentabilidade)\b/i

function base(over: Partial<ResumoAtivoInput>): ResumoAtivoInput {
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
    fonteDy: null,
    min52: null,
    max52: null,
    serie: null,
    setorMedia: null,
    proventos: {
      unidade: 'ação',
      renda12: 1,
      eventos12: 1,
      capital12: 0,
      frequencia: null,
      proximo: null,
      anos: [],
      tipo: 'renda',
    },
    etf: null,
    cripto: null,
    links: [],
    ...over,
  }
}

function cabe(titulo: string): void {
  assert.ok(titulo.length <= TETO_TITULO_PAGINA, `${titulo} (${titulo.length})`)
  assert.ok(titulo.length + SUFIXO_MARCA.length <= TETO_TITULO, `${titulo}${SUFIXO_MARCA} (${titulo.length + SUFIXO_MARCA.length})`)
}

/** O trecho do nome no title é um prefixo de palavras inteiras do nome original. */
function nomeInteiro(titulo: string, nome: string): string | null {
  const m = titulo.match(/cotação hoje: (.+?)(?: e dividendos|, FII|, BDR|, ETF| na B3)$/)
  const trecho = m?.[1]
  if (!trecho) return null
  const origem = nome.split(/\s+/)
  const usado = trecho.split(/\s+/)
  assert.deepEqual(usado, origem.slice(0, usado.length), titulo)
  if (usado.length < origem.length) {
    assert.equal(PREP.has(usado[usado.length - 1]!.toLowerCase()), false, titulo)
  }
  for (const palavra of origem) {
    if (usado.includes(palavra)) continue
    const corte = palavra.slice(0, palavra.length - 1)
    if (corte.length >= 2) assert.equal(trecho.includes(corte), false, `corta "${palavra}" em ${titulo}`)
  }
  return trecho
}

test('encurtaNome não corta palavra nem deixa preposição no fim', () => {
  assert.equal(encurtaNome('Livetech da Bahia Industria e Comercio', 17), 'Livetech da Bahia')
  assert.equal(encurtaNome('Livetech da Bahia', 17), 'Livetech da Bahia')
  assert.equal(encurtaNome('Mercantil do Brasil', 12), 'Mercantil')
  assert.equal(encurtaNome('Banco Mercantil de Investimentos', 20), 'Banco Mercantil')
  assert.equal(encurtaNome('Cia Participações Alianca da Bahia', 24), 'Cia Participações')
  assert.equal(encurtaNome('Cruzeiro do Sul Educacional', 17), 'Cruzeiro do Sul')
  assert.equal(encurtaNome('Banco da Amazônia', 17), 'Banco da Amazônia')
  assert.equal(encurtaNome('Companhia Brasileira de Distribuição', 24), 'Companhia Brasileira')
  assert.equal(encurtaNome('Rbr Prime Offices - Fundo de Investimento Imobiliário', 22), 'Rbr Prime Offices')
  assert.equal(encurtaNome('Supercalifragilistic', 17), '')
  assert.equal(encurtaNome('Petrobras', 50), 'Petrobras')
})

test('/asset: WDCN3 e outros nomes longos cabem em 60 e não cortam palavra', () => {
  const casos: Array<{ ticker: string; nome: string; title: string }> = [
    { ticker: 'WDCN3', nome: 'Livetech da Bahia Industria e Comercio', title: 'WDCN3 cotação hoje: Livetech da Bahia e dividendos' },
    { ticker: 'MERC4', nome: 'Mercantil do Brasil', title: 'MERC4 cotação hoje: Mercantil e dividendos' },
    { ticker: 'CSED3', nome: 'Cruzeiro do Sul Educacional', title: 'CSED3 cotação hoje: Cruzeiro do Sul e dividendos' },
    { ticker: 'BAZA3', nome: 'Banco da Amazônia', title: 'BAZA3 cotação hoje: Banco da Amazônia e dividendos' },
    { ticker: 'PETR4', nome: 'Petrobras', title: 'PETR4 cotação hoje: Petrobras e dividendos' },
    { ticker: 'BBAS3', nome: 'Banco do Brasil', title: 'BBAS3 cotação hoje: Banco do Brasil e dividendos' },
    { ticker: 'ITUB4', nome: 'Itaú Unibanco', title: 'ITUB4 cotação hoje: Itaú Unibanco e dividendos' },
  ]
  for (const c of casos) {
    const r = montarResumoAtivo(base({ ticker: c.ticker, nome: c.nome }))
    assert.ok(r, c.ticker)
    assert.equal(r.title, c.title, c.ticker)
    cabe(r.title)
    const trecho = nomeInteiro(r.title, c.nome)
    if (r.title.includes(c.nome)) assert.equal(trecho, c.nome)
    assert.match(r.h1, new RegExp(c.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.doesNotMatch(r.title, CVM, c.ticker)
    assert.doesNotMatch(r.title, /R\$|\d+,\d+%/, c.ticker)
  }

  const semPalavra = montarResumoAtivo(base({ ticker: 'XXXX3', nome: 'Supercalifragilistic' }))
  assert.ok(semPalavra)
  assert.equal(semPalavra.title, 'XXXX3 cotação hoje e dividendos')
  assert.equal(semPalavra.title.includes('Supercali'), false)
  cabe(semPalavra.title)
  assert.match(semPalavra.h1, /Supercalifragilistic/)
})

test('/dividendos: ticker e dividendos no início, nome inteiro ou versão curta, até 60', () => {
  const casos: Array<{ ticker: string; nome: string; title: string }> = [
    { ticker: 'PETR4', nome: 'Petrobras', title: 'PETR4: dividendos Petrobras, histórico e data com' },
    { ticker: 'VALE3', nome: 'Vale', title: 'VALE3: dividendos Vale, histórico e data com' },
    { ticker: 'TAEE11', nome: 'Taesa', title: 'TAEE11: dividendos Taesa, histórico e data com' },
    { ticker: 'ITUB4', nome: 'Itaú Unibanco', title: 'ITUB4: dividendos, histórico e data com' },
    { ticker: 'BBAS3', nome: 'Banco do Brasil', title: 'BBAS3: dividendos, histórico e data com' },
    { ticker: 'WDCN3', nome: 'Livetech da Bahia Industria e Comercio', title: 'WDCN3: dividendos, histórico e data com' },
    { ticker: 'AAPL34', nome: 'Apple', title: 'AAPL34: dividendos Apple, histórico e data com' },
    {
      ticker: 'PCAR3',
      nome: 'Companhia Brasileira de Distribuição e Logística Integrada Nacional',
      title: 'PCAR3: dividendos, histórico e data com',
    },
  ]
  for (const c of casos) {
    const title = tituloDividendos(c.ticker, c.nome)
    assert.equal(title, c.title, c.ticker)
    cabe(title)
    assert.match(title, new RegExp(`^${c.ticker}: dividendos\\b`))
    if (title.includes(c.nome)) {
      assert.match(title, new RegExp(`dividendos ${c.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')},`))
    } else {
      for (const palavra of c.nome.split(/\s+/)) {
        if (palavra.length < 4) continue
        assert.equal(title.toLowerCase().includes(palavra.slice(0, palavra.length - 1).toLowerCase()), false, `${c.ticker} corta ${palavra}`)
      }
    }
    assert.doesNotMatch(title, CVM)
    assert.doesNotMatch(title, /R\$|%/)
  }

  const enorme = 'X'.repeat(20)
  assert.equal(tituloDividendos(enorme, 'Nome Comprido Demais Para Caber'), `${enorme}: dividendos`)
  cabe(`${enorme}: dividendos`)
})

test('a página de dividendos usa o gerador, sem o title numérico antigo', () => {
  const src = readFileSync(new URL('../app/composables/useDividendos.ts', import.meta.url), 'utf8')
  assert.match(src, /tituloDividendos\(c\.ticker, c\.name\)/)
  assert.doesNotMatch(src, /histórico, DY e próximos pagamentos/)
})
