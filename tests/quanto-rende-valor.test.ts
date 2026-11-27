/**
 * Simulação de /quanto-rende/{valor}: bruto, IR regressivo, líquido,
 * isenção da poupança, custódia do Tesouro Selic, slug sem colisão e sitemap.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { B3_TICKER_RE } from '../app/utils/tickerClass.ts'
import { TETO_DESCRICAO, TETO_TITULO, SUFIXO_MARCA } from '../app/utils/serp.ts'
import {
  CUSTODIA_B3_AA,
  ISENCAO_CUSTODIA_SELIC,
  VALORES_QUANTO_RENDE,
  aliquotaCurta,
  celulaDe,
  celulaTesouroSelic,
  montarTaxasQuantoRende,
  paginasQuantoRendeValor,
  seoQuantoRendeValor,
  simularQuantoRendeValor,
  slugValorColide,
  taxaAnualPercentualCdi,
  valorPorSlug,
  vizinhosQuantoRende,
  type TaxasQuantoRendeValor,
} from '../app/utils/quanto-rende-valor.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

/** Pontos reais do SGS em 27/11/2026, gravados para a conta não depender da rede. */
const HOJE = '2026-11-27'
const SERIE_4389 = [{ data: '25/11/2026', valor: '13.65' }]
const SERIE_12 = [{ data: '25/11/2026', valor: '0.050788' }]
const SERIE_1178 = [{ data: '26/11/2026', valor: '13.65' }]
const SERIE_11 = [{ data: '26/11/2026', valor: '0.050788' }]
const SERIE_432 = [
  { data: '27/11/2026', valor: '13.75' },
  { data: '09/12/2026', valor: '99.00' },
]
const SERIE_195 = [{ data: '25/11/2026', dataFim: '25/12/2026', valor: '0.6721' }]

function taxasDeFixture(): TaxasQuantoRendeValor {
  const taxas = montarTaxasQuantoRende({
    serie4389: SERIE_4389,
    serie12: SERIE_12,
    serie1178: SERIE_1178,
    serie11: SERIE_11,
    serie432: SERIE_432,
    serie195: SERIE_195,
    hoje: HOJE,
  })
  assert.ok(taxas)
  return taxas
}

test('100% do CDI anualiza a série 12 nas 2 casas da 4389', () => {
  assert.equal(taxaAnualPercentualCdi(0.050788, 1), 13.65)
  assert.equal(taxaAnualPercentualCdi(0.050788, 1.1), 15.11)
  assert.equal(taxaAnualPercentualCdi(0.050788, 1.15), 15.85)
  assert.equal(taxaAnualPercentualCdi(0), null)
})

test('a leitura ignora ponto futuro da meta e exige poupança, CDI e Selic', () => {
  const taxas = taxasDeFixture()
  assert.equal(taxas.cdiAnual, 13.65)
  assert.equal(taxas.cdiSerie, 4389)
  assert.equal(taxas.cdiData, '2026-11-25')
  assert.equal(taxas.cdiPeloDiario, true)
  assert.equal(taxas.selicAnual, 13.65)
  assert.equal(taxas.selicSerie, 1178)
  assert.equal(taxas.selicMeta, 13.75)
  assert.equal(taxas.selicMetaData, '2026-11-27')
  assert.equal(taxas.poupancaMensal, 0.6721)
  assert.equal(taxas.poupancaFim, '2026-12-25')
  assert.equal(montarTaxasQuantoRende({
    serie4389: null,
    serie12: null,
    serie1178: SERIE_1178,
    serie11: null,
    serie432: SERIE_432,
    serie195: SERIE_195,
    hoje: HOJE,
  }), null)
})

test('bruto, IR regressivo e líquido de 100% do CDI', () => {
  const sim = simularQuantoRendeValor(100_000, taxasDeFixture())
  assert.ok(sim)
  const mes = celulaDe(sim, 'cdi-100', '1m')
  const semestre = celulaDe(sim, 'cdi-100', '6m')
  const ano = celulaDe(sim, 'cdi-100', '1a')
  const dois = celulaDe(sim, 'cdi-100', '2a')
  const cinco = celulaDe(sim, 'cdi-100', '5a')
  assert.ok(mes && semestre && ano && dois && cinco)
  assert.equal(mes.aliquota, 0.225)
  assert.equal(semestre.aliquota, 0.225)
  assert.equal(ano.aliquota, 0.175)
  assert.equal(dois.aliquota, 0.15)
  assert.equal(cinco.aliquota, 0.15)
  assert.equal(mes.custodia, 0)
  const brutoAno = 100_000 * 1.1365
  assert.ok(Math.abs(ano.montante - brutoAno) < 1e-6)
  assert.ok(Math.abs(ano.ganho - (brutoAno - 100_000)) < 1e-6)
  assert.ok(Math.abs(ano.imposto - ano.ganho * 0.175) < 1e-6)
  assert.ok(Math.abs(ano.liquido - (ano.montante - ano.imposto)) < 1e-6)
  assert.ok(ano.liquido < ano.montante)
  assert.equal(aliquotaCurta(0.175), '17,5%')
})

test('poupança compõe a série mensal e não cobra IR', () => {
  const sim = simularQuantoRendeValor(100_000, taxasDeFixture())
  assert.ok(sim)
  const ano = celulaDe(sim, 'poupanca', '1a')
  const mes = celulaDe(sim, 'poupanca', '1m')
  assert.ok(ano && mes)
  const esperado = 100_000 * (1 + 0.6721 / 100) ** 12
  assert.ok(Math.abs(ano.montante - esperado) < 1e-6)
  assert.equal(ano.aliquota, 0)
  assert.equal(ano.imposto, 0)
  assert.equal(ano.custodia, 0)
  assert.equal(ano.liquido, ano.montante)
  assert.ok(Math.abs(mes.montante - 100_000 * 1.006721) < 1e-6)
  const cdi = celulaDe(sim, 'cdi-100', '1a')
  assert.ok(cdi)
  assert.ok(ano.liquido < cdi.liquido)
})

test('Tesouro Selic: custódia zero até R$ 10 mil e 0,20% ao ano no excedente', () => {
  const h = { id: '1a' as const, rotulo: '1 ano', dias: 365, meses: 12 }
  const cheio = celulaTesouroSelic(100_000, 13.65, h)
  const isento = celulaTesouroSelic(ISENCAO_CUSTODIA_SELIC, 13.65, h)
  assert.ok(cheio && isento)
  assert.equal(isento.custodia, 0)
  assert.ok(Math.abs(isento.liquido - (isento.montante - isento.imposto)) < 1e-6)
  const excesso = 100_000 - ISENCAO_CUSTODIA_SELIC
  assert.ok(Math.abs(cheio.custodia - excesso * (CUSTODIA_B3_AA / 100)) < 1e-6)
  assert.ok(Math.abs(cheio.liquido - (cheio.montante - cheio.imposto - cheio.custodia)) < 1e-6)
  assert.equal(cheio.aliquota, 0.175)
  const sim = simularQuantoRendeValor(50_000, taxasDeFixture())
  assert.ok(sim)
  const selic = celulaDe(sim, 'tesouro-selic', '1a')
  assert.ok(selic && selic.custodia > 0)
})

test('slugs de valor não colidem com ticker nem com tesouro', () => {
  assert.equal(VALORES_QUANTO_RENDE.length, 12)
  for (const v of VALORES_QUANTO_RENDE) {
    assert.equal(slugValorColide(v.slug), false, v.slug)
    assert.equal(B3_TICKER_RE.test(v.slug.toUpperCase()), false)
    assert.equal(valorPorSlug(v.slug)?.reais, v.reais)
    assert.ok(vizinhosQuantoRende(v.slug).length >= 3, v.slug)
  }
  assert.equal(valorPorSlug('PETR4'), null)
  assert.equal(valorPorSlug('petr4'), null)
  assert.equal(valorPorSlug('tesouro-selic-2029'), null)
  assert.equal(valorPorSlug('tesouro'), null)
  assert.equal(valorPorSlug('100-MIL'), null)
  assert.equal(slugValorColide('PETR4'), true)
  assert.equal(slugValorColide('tesouro-selic-2029'), true)
  const cem = vizinhosQuantoRende('100-mil').map((v) => v.slug)
  assert.deepEqual(cem, ['50-mil', '200-mil', '500-mil', '1-milhao'])
})

test('o middleware da página deixa o slug passar e o ticker continua 404', () => {
  const pagina = ler('app/pages/quanto-rende/[ticker].vue')
  const m = pagina.match(/const slugValor = (\/.+\/i)/)
  assert.ok(m)
  const re = new RegExp(m[1].slice(1, -2), 'i')
  for (const v of VALORES_QUANTO_RENDE) assert.equal(re.test(v.slug), true, v.slug)
  assert.equal(re.test('PETR4'), false)
  assert.equal(re.test('tesouro-selic-2029'), false)
  assert.match(pagina, /QuantoRendeValor/)
  const componente = ler('app/components/quanto-rende/QuantoRendeValor.vue')
  assert.match(componente, /usePageSeo\(/)
  assert.match(componente, /NuFaqAccordion/)
  assert.doesNotMatch(componente, /noindex/)
  assert.doesNotMatch(componente, /melhor investimento/i)
  assert.match(componente, /Não é garantia de retorno futuro/)
  assert.match(componente, /não é recomendação de compra ou venda/i)
  assert.match(componente, /l8981\.htm/)
  assert.match(componente, /l11033compilado\.htm/)
})

test('title e description cabem no SERP', () => {
  for (const v of VALORES_QUANTO_RENDE) {
    const seo = seoQuantoRendeValor(v)
    assert.ok(seo.title.length + SUFIXO_MARCA.length <= TETO_TITULO, seo.title)
    assert.ok(seo.description.length <= TETO_DESCRICAO, `${seo.description.length} ${seo.description}`)
    assert.match(seo.description, /Não é garantia nem recomendação/)
    assert.match(seo.title, /CDI/)
  }
})

test('as doze URLs entram no sitemap de quanto-rende e no llms.txt', () => {
  const paginas = paginasQuantoRendeValor()
  assert.equal(paginas.length, 12)
  const site = ler('server/utils/site-pages.ts')
  assert.match(site, /paginasQuantoRendeValor\(\)/)
  const semente = ler('server/data/sitemap-semente.ts')
  const llms = ler('server/routes/llms.txt.ts')
  for (const p of paginas) {
    assert.equal(p.path.startsWith('/quanto-rende/'), true)
    assert.match(semente, new RegExp(p.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(llms, new RegExp(p.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  assert.match(llms, /Quanto rende PETR4/)
  assert.match(llms, /Quanto rende MXRF11/)
  assert.match(llms, /tesouro-prefixado-2029/)
})
