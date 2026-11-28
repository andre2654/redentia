/**
 * /tesouro/tesouro-reserva: guia informacional, sem noindex, no sitemap de
 * tesouro e no llms.txt. A página de taxa continua em tesouro-reserva-2036.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  FONTE_B3,
  FONTE_TESOURO_DIRETO,
  FONTE_TESOURO_NACIONAL,
  ROTULO_SIMULACAO,
  TESOURO_RESERVA_DESCRIPTION,
  TESOURO_RESERVA_FAQ,
  TESOURO_RESERVA_H1,
  TESOURO_RESERVA_PATH,
  TESOURO_RESERVA_TITLE,
  TESOURO_RESERVA_TITULO_PATH,
} from '../app/content/seo/tesouro-reserva.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import { linhasTesouroReserva } from '../app/utils/tesouro-reserva.ts'
import type { TaxasQuantoRendeValor } from '../app/utils/quanto-rende-valor.ts'
import { SEMENTES_SITEMAP } from '../server/data/sitemap-semente.ts'
import { paginasDoGrupo } from '../server/utils/sitemap-xml.ts'

function ler(caminho: string): string {
  return readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8')
}

const TAXAS: TaxasQuantoRendeValor = {
  cdiAnual: 10,
  cdiDiario: null,
  cdiPeloDiario: false,
  cdiData: '2026-11-27',
  cdiSerie: 4389,
  selicAnual: 10,
  selicData: '2026-11-27',
  selicSerie: 1178,
  selicMeta: 10.5,
  selicMetaData: '2026-11-01',
  poupancaMensal: 0.6,
  poupancaInicio: '2026-11-01',
  poupancaFim: '2026-11-30',
}

test('title, description e canonical cabem no SERP e não levam noindex', () => {
  assert.equal(TESOURO_RESERVA_PATH, '/tesouro/tesouro-reserva')
  assert.equal(TESOURO_RESERVA_TITLE.includes(SUFIXO_MARCA), false)
  assert.ok(TESOURO_RESERVA_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO, String(TESOURO_RESERVA_TITLE.length + SUFIXO_MARCA.length))
  assert.ok(TESOURO_RESERVA_TITLE.startsWith('Tesouro Reserva'))
  assert.ok(TESOURO_RESERVA_DESCRIPTION.length >= 120 && TESOURO_RESERVA_DESCRIPTION.length <= TETO_DESCRICAO, String(TESOURO_RESERVA_DESCRIPTION.length))
  assert.match(TESOURO_RESERVA_H1, /como funciona, rendimento e imposto/)
  const pagina = ler('app/pages/tesouro/tesouro-reserva.vue')
  assert.match(pagina, /path: TESOURO_RESERVA_PATH/)
  assert.match(pagina, /title: TESOURO_RESERVA_TITLE/)
  assert.match(pagina, /breadcrumbs: trilha/)
  assert.match(pagina, /NuFaqAccordion/)
  assert.match(pagina, /NuTrilha/)
  assert.doesNotMatch(pagina, /noindex/)
  assert.equal(ROTULO_SIMULACAO, 'simulação com a Selic de hoje, não é promessa de rendimento')
  assert.match(pagina, /\{\{ ROTULO_SIMULACAO \}\}/)
})

test('FAQ visível cobre IR, fim de semana, mínimo, custódia, onde aplicar e vencimento', () => {
  const perguntas = TESOURO_RESERVA_FAQ.map((f) => f.q).join(' ')
  assert.match(perguntas, /imposto de renda/i)
  assert.match(perguntas, /fim de semana/i)
  assert.match(perguntas, /mínimo/i)
  assert.match(perguntas, /custódia/i)
  assert.match(perguntas, /Onde aplicar/i)
  assert.match(perguntas, /vence/i)
  assert.equal(TESOURO_RESERVA_FAQ.length, 6)
  const vencimento = TESOURO_RESERVA_FAQ.find((f) => /vence/i.test(f.q))!
  assert.equal(vencimento.link?.to, TESOURO_RESERVA_TITULO_PATH)
  assert.ok(vencimento.a.includes(vencimento.link!.texto))
  assert.match(vencimento.a, /01\/01\/2036/)
  const onde = TESOURO_RESERVA_FAQ.find((f) => /Onde aplicar/i.test(f.q))!
  assert.match(onde.a, /segundo o Tesouro Direto, inicialmente disponível pelo Banco do Brasil/)
  const texto = TESOURO_RESERVA_FAQ.map((f) => f.a).join(' ')
  assert.match(texto, /22,5%/)
  assert.match(texto, /15%/)
  assert.match(texto, /0h e 1h/)
  assert.match(texto, /R\$ 1,00/)
  assert.match(texto, /0,20%/)
  assert.match(texto, /R\$ 10\.000,00/)
})

test('a página cita as fontes e aponta para o título e para quanto rende', () => {
  const pagina = ler('app/pages/tesouro/tesouro-reserva.vue') + ler('app/content/seo/tesouro-reserva.ts')
  assert.match(pagina, new RegExp(FONTE_TESOURO_DIRETO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(pagina, new RegExp(FONTE_B3.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(pagina, new RegExp(FONTE_TESOURO_NACIONAL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(pagina, /l11033compilado\.htm/)
  assert.match(pagina, /l12703\.htm/)
  assert.match(pagina, /TESOURO_RESERVA_TITULO_PATH/)
  assert.match(pagina, /\/quanto-rende\/1-mil/)
  assert.match(pagina, /\/quanto-rende\/10-mil/)
  assert.match(pagina, /\/quanto-rende\/100-mil/)
  assert.match(pagina, /to="\/assinar\?quiz=1&de=tesouro-reserva"/)
  assert.match(pagina, /segundo o Tesouro Direto, inicialmente disponível pelo Banco do Brasil/)
})

test('a 2036 ganha o link de volta e o hub aponta para o guia, sem trocar o title de taxa', () => {
  const slug = ler('app/pages/tesouro/[slug].vue')
  assert.match(slug, /to="\/tesouro\/tesouro-reserva">Como funciona o Tesouro Reserva<\/NuxtLink>/)
  assert.match(slug, /title: titulo\.value\.seo\.title/)
  assert.doesNotMatch(slug, /tesouro-reserva\.vue/)
  const hub = ler('app/pages/tesouro/index.vue')
  assert.match(hub, /to="\/tesouro\/tesouro-reserva"/)
  assert.match(hub, /Como funciona o Tesouro Reserva/)
})

test('sitemap de tesouro e llms.txt incluem a URL do guia', () => {
  const miolo = ler('server/utils/site-pages.ts')
  assert.match(miolo, /TESOURO_RESERVA_PATH/)
  assert.match(miolo, /lastmod: '2026-11-28'/)
  const pages = paginasDoGrupo([
    {
      id: 'tesouro',
      title: 'Tesouro',
      pages: [
        { path: TESOURO_RESERVA_PATH, title: TESOURO_RESERVA_TITLE },
        { path: TESOURO_RESERVA_TITULO_PATH, title: 'Tesouro Reserva 2036' },
      ],
    },
  ], 'tesouro')
  assert.deepEqual(pages.map((p) => p.path), [TESOURO_RESERVA_PATH, TESOURO_RESERVA_TITULO_PATH])
  const xml = SEMENTES_SITEMAP.tesouro?.xml ?? ''
  assert.match(xml, /\/tesouro\/tesouro-reserva</)
  assert.match(xml, /\/tesouro\/tesouro-reserva-2036</)
  assert.equal(SEMENTES_SITEMAP.tesouro?.urls, xml.split('<loc>').length - 1)
  assert.match(ler('server/routes/llms.txt.ts'), /\/tesouro\/tesouro-reserva\)/)
})

test('a simulação de 12 meses usa a Selic recebida, com IR de 365 dias e custódia só acima de R$ 10 mil', () => {
  const linhas = linhasTesouroReserva(TAXAS)
  assert.ok(linhas)
  assert.deepEqual(linhas.map((l) => l.entrada.reais), [1_000, 10_000, 100_000])
  for (const linha of linhas) {
    assert.equal(linha.reserva.aliquota, 0.175)
    assert.equal(linha.reserva.horizonte.dias, 365)
    assert.ok(linha.reserva.montante > linha.entrada.reais)
    assert.ok(linha.reserva.imposto > 0)
    assert.equal(linha.poupanca.imposto, 0)
    assert.equal(linha.cdi.aliquota, 0.175)
    assert.equal(linha.href, `/quanto-rende/${linha.entrada.slug}`)
    const liquidoIr = linha.reserva.montante - linha.reserva.imposto
    assert.ok(liquidoIr < linha.reserva.montante)
    assert.ok(Math.abs(linha.reserva.liquido - (liquidoIr - linha.reserva.custodia)) < 1e-6)
  }
  assert.equal(linhas[0]!.reserva.custodia, 0)
  assert.equal(linhas[1]!.reserva.custodia, 0)
  assert.ok(linhas[2]!.reserva.custodia > 0)
  assert.equal(linhasTesouroReserva({ ...TAXAS, selicAnual: Number.NaN }), null)
})

test('o guia não recomenda ativo, instituição nem rendimento', () => {
  const texto = ler('app/pages/tesouro/tesouro-reserva.vue') + ler('app/content/seo/tesouro-reserva.ts')
  const semAviso = texto
    .replace(/Não é recomendação/g, '')
    .replace(/não é recomendação/g, '')
    .replace(/não indica instituição/g, '')
    .replace(/Esta página não indica instituição/g, '')
  assert.doesNotMatch(semAviso, /\b(compre|comprar|venda|vender|garantid\w*|melhor investimento|oportunidade|imperd[ií]vel)\b/i)
  assert.match(texto, /Não é recomendação/)
  assert.doesNotMatch(texto, /font-family/)
  assert.doesNotMatch(ler('app/pages/tesouro/tesouro-reserva.vue'), /\b(10,75|13,75|15,00)\s*%/)
})
