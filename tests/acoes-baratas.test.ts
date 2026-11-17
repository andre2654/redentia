/**
 * Hub /ranking/acoes-baratas: indexável, no sitemap de rankings e no llms.txt,
 * ligado ao menu e ao hub. A palavra "barata" é a cotação abaixo da fórmula.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  ACOES_BARATAS_DESCRIPTION,
  ACOES_BARATAS_FAQ,
  ACOES_BARATAS_H1,
  ACOES_BARATAS_INTRO,
  ACOES_BARATAS_LINKS,
  ACOES_BARATAS_NOTA,
  ACOES_BARATAS_PATH,
  ACOES_BARATAS_TITLE,
  acoesBaratasCabeNoSerp,
} from '../app/content/seo/acoes-baratas.ts'
import { SUFIXO_MARCA, TETO_TITULO } from '../app/utils/serp.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const TICKER = /\b[A-Z]{4}\d{1,2}\b/
const ORDEM = /\b(compre|venda|vai subir|garantia de)\b/i

test('o título cabe no SERP e o H1 é o da página', () => {
  assert.equal(ACOES_BARATAS_H1, 'Ações baratas pelas fórmulas')
  assert.equal(ACOES_BARATAS_TITLE, 'Ações Baratas 2026: Graham, Bazin e P/VP')
  assert.equal(acoesBaratasCabeNoSerp(), true)
  assert.ok(ACOES_BARATAS_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO)
  assert.match(ACOES_BARATAS_INTRO, /subvalorizadas/)
  assert.match(ACOES_BARATAS_INTRO, /P\/VP/)
  assert.equal(ACOES_BARATAS_NOTA, 'Estimativa educacional pela fórmula, não é recomendação de investimento.')
})

test('os links são as listas que existem, e o FAQ não recomenda ticker', () => {
  assert.deepEqual(ACOES_BARATAS_LINKS.map((l) => l.to), [
    '/ranking/mais-baratas-graham',
    '/ranking/mais-baratas-bazin',
    '/ranking/menores-pl',
    '/calculadora/preco-teto',
  ])
  assert.match(ACOES_BARATAS_LINKS.map((l) => l.sub).join(' '), /Não há uma lista só de P\/VP/)
  assert.ok(ACOES_BARATAS_FAQ.length >= 3 && ACOES_BARATAS_FAQ.length <= 5)
  const texto = [ACOES_BARATAS_INTRO, ACOES_BARATAS_DESCRIPTION, ...ACOES_BARATAS_FAQ.flatMap((f) => [f.q, f.a])].join('\n')
  assert.doesNotMatch(texto, TICKER)
  assert.doesNotMatch(texto, ORDEM)
  assert.match(texto, /subvalorizad/)
})

test('a página é indexável, tem FAQ e BreadcrumbList, e entra no sitemap e no menu', () => {
  const vue = ler('app/pages/ranking/acoes-baratas.vue')
  assert.match(vue, /usePageSeo\(/)
  assert.match(vue, /ACOES_BARATAS_PATH/)
  assert.match(vue, /breadcrumbs:/)
  assert.match(vue, /NuFaqAccordion/)
  assert.match(vue, /useRanking\(grahamMeta\)/)
  assert.match(vue, /useRanking\(bazinMeta\)/)
  assert.match(vue, /v-if="topoGraham.length"/)
  assert.doesNotMatch(vue, /noindex/)
  assert.match(ler('server/utils/site-pages.ts'), /ACOES_BARATAS_PATH/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/ranking\/acoes-baratas/)
  assert.match(ler('app/utils/topo.ts'), /label: 'Ações baratas', to: '\/ranking\/acoes-baratas'/)
  assert.match(ler('app/pages/rankings/index.vue'), /to="\/ranking\/acoes-baratas"/)
})
