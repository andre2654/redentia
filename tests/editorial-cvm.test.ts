/**
 * Editorial de /asset/{ticker}. O texto antigo recomendava carteira, citava
 * número sem fonte e carimbava uma data de geração como se fosse revisão.
 * A cópia local e o componente da seção não podem voltar a fazer isso.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { editorialExibido, textoEditorialVedado, type AssetEditorialCopy } from '../app/utils/assetEditorial.ts'
import { fundirFaq } from '../app/utils/assetResumo.ts'

const DIR = fileURLToPath(new URL('../app/content/asset-editorials/', import.meta.url))
const VUE = fileURLToPath(new URL('../app/components/acao/AcaoEditorial.vue', import.meta.url))

function copias(): { ticker: string; copy: AssetEditorialCopy }[] {
  return readdirSync(DIR)
    .filter((nome) => nome.endsWith('.json'))
    .sort()
    .map((nome) => ({
      ticker: nome.replace(/\.json$/, ''),
      copy: JSON.parse(readFileSync(`${DIR}${nome}`, 'utf8')) as AssetEditorialCopy,
    }))
}

function textoDaCopia(copy: AssetEditorialCopy): string {
  return [
    copy.description,
    copy.thesis,
    copy.risks,
    copy.peers,
    copy.history,
    ...copy.faq.flatMap((item) => [item.q, item.a]),
  ].join('\n')
}

test('há editorial factual para os tickers com texto próprio', () => {
  const lista = copias()
  assert.ok(lista.length >= 3)
  for (const ticker of ['PETR4', 'TAEE11', 'HGLG11']) {
    assert.ok(lista.some((item) => item.ticker === ticker), ticker)
  }
})

test('o texto editorial não traz recomendação, juízo de adequação nem data de revisão', () => {
  const vue = readFileSync(VUE, 'utf8')
  assert.equal(textoEditorialVedado(vue), false, 'componente')
  for (const { ticker, copy } of copias()) {
    assert.equal(textoEditorialVedado(textoDaCopia(copy)), false, ticker)
    assert.ok(copy.description.trim().length > 0, `${ticker} descrição`)
    assert.ok(copy.thesis.trim().length > 0, `${ticker} tese`)
    assert.ok(copy.risks.trim().length > 0, `${ticker} riscos`)
    assert.ok(copy.peers.trim().length > 0, `${ticker} pares`)
    assert.ok(copy.history.trim().length > 0, `${ticker} história`)
    assert.equal(copy.faq.length, 6, `${ticker} faq`)
    for (const item of copy.faq) {
      assert.equal(item.q.includes('?'), true, `${ticker}: ${item.q}`)
      assert.ok(item.a.trim().length > 40, `${ticker}: ${item.q}`)
    }
  }
})

test('a página usa a cópia local e não devolve o carimbo de geração', () => {
  const locais: Record<string, AssetEditorialCopy> = {
    PETR4: {
      description: 'A Petrobras produz petróleo e gás.',
      thesis: 'A receita acompanha o petróleo e o refino.',
      risks: 'O controlador é a União Federal.',
      peers: 'A Vale atua em minério de ferro.',
      history: 'A companhia foi criada no governo de Getúlio Vargas.',
      faq: [{ q: 'Como a PETR4 distribui proventos?', a: 'Por deliberação da companhia, com data-com e data-ex.' }],
    },
  }
  const api = {
    ticker: 'petr4',
    description: 'PETR4 é boa para uma carteira de longo prazo e costuma compor o book.',
    thesis_pros: 'Tem perfil defensivo e é a escolha padrão.',
    thesis_cons: 'Uma vantagem estrutural.',
    peers_comparison: 'Texto de par.',
    history_summary: 'História.',
    faq_extended: [
      { question: 'PETR4 é boa para uma carteira de longo prazo?', answer: 'Costuma compor entre 5% e 15% do book.' },
    ],
    generated_at: '2026-05-04T16:41:55-03:00',
  }
  const out = editorialExibido('PETR4', api, locais)
  assert.equal(out?.generated_at, null)
  assert.equal(out?.description, locais.PETR4.description)
  assert.equal(out?.faq_extended?.[0]?.question, 'Como a PETR4 distribui proventos?')
  assert.equal(textoEditorialVedado(JSON.stringify(out)), false)
})

test('os termos vedados ignoram maiúscula e acento', () => {
  for (const texto of [
    'Vale à pena entrar',
    'COMPRE agora',
    'Aposentadoria',
    'Renda passíva',
    'Longo prazo',
    'BOA PARA',
    'Escolha Padrão',
    'Vantagem',
    'Defensivo',
    'o book de ações',
    'Atualizada em maio',
  ]) {
    assert.equal(textoEditorialVedado(texto), true, texto)
  }
  assert.equal(textoEditorialVedado('A compreensão do contrato e a compra da cota.'), false)
})

test('a FAQ visível junta as 6 da cópia com as 4 de fonte', () => {
  const editorial = Array.from({ length: 6 }, (_, i) => ({
    q: `Pergunta factual ${i + 1}?`,
    a: 'Resposta sobre o que a companhia faz e como o provento é anunciado.',
  }))
  const fontes = [
    { q: 'Qual a cotação?', a: 'Fonte: Brapi (B3), atualização de 10 a 30 min.' },
    { q: 'Qual o dividend yield?', a: 'Fonte: StatusInvest, base em DFP/ITR.' },
    { q: 'Quanto teve em proventos?', a: 'Fonte: avisos de proventos da B3.' },
    { q: 'Como variou nos últimos 12 meses?', a: 'Fonte: StatusInvest (dados diários).' },
  ]
  const junto = fundirFaq(editorial, fontes)
  assert.equal(junto.length, 10)
  assert.deepEqual(junto.slice(0, 6).map((item) => item.q), editorial.map((item) => item.q))
  assert.deepEqual(junto.slice(6).map((item) => item.q), fontes.map((item) => item.q))
})

test('sem cópia local, a página omite trecho vedado e não mostra data', () => {
  const out = editorialExibido('ZZZZ3', {
    ticker: 'zzzz3',
    description: 'A empresa opera no setor.\n\nÉ boa para uma carteira.',
    thesis_pros: 'Tem uma vantagem clara.',
    thesis_cons: 'O resultado depende do regulador.',
    peers_comparison: null,
    history_summary: null,
    faq_extended: [
      { question: 'Como funciona?', answer: 'Por deliberação da assembleia, com data-com e data-ex publicadas.' },
      { question: 'É boa para longo prazo?', answer: 'É a escolha padrão de quem busca renda.' },
    ],
    generated_at: '2026-05-04T00:00:00-03:00',
  }, {})
  assert.equal(out?.generated_at, null)
  assert.equal(out?.description, 'A empresa opera no setor.')
  assert.equal(out?.thesis_pros, null)
  assert.equal(out?.thesis_cons, 'O resultado depende do regulador.')
  assert.equal(out?.faq_extended?.length, 1)
  assert.equal(out?.faq_extended?.[0]?.question, 'Como funciona?')
})
