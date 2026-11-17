/**
 * /fiis é 200 e indexável. /rankings?classe=fiis continua o filtro, com
 * canonical /fiis. A barra não volta para o filtro: isso fecharia um loop.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  FIIS_DESCRIPTION,
  FIIS_H1,
  FIIS_PATH,
  FIIS_TITLE,
  canonicalDeRankings,
  fiisCabeNoSerp,
} from '../app/content/seo/fiis-hub.ts'
import { destinoSemBarra } from '../server/utils/sem-barra.ts'
import { SUFIXO_MARCA, TETO_TITULO } from '../app/utils/serp.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('o canonical de FIIs é /fiis e o title cabe no SERP', () => {
  assert.equal(canonicalDeRankings('/fiis', null), '/fiis')
  assert.equal(canonicalDeRankings('/rankings', 'fiis'), '/fiis')
  assert.equal(canonicalDeRankings('/rankings', 'acoes'), '/rankings')
  assert.equal(canonicalDeRankings('/rankings', null), '/rankings')
  assert.equal(FIIS_H1, FIIS_TITLE)
  assert.equal(FIIS_TITLE, 'FIIs 2026: rankings de dividend yield e P/VP')
  assert.equal(fiisCabeNoSerp(), true)
  assert.ok(FIIS_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO)
  assert.match(FIIS_DESCRIPTION, /dividend yield/)
  assert.match(FIIS_DESCRIPTION, /P\/VP/)
  assert.match(FIIS_DESCRIPTION, /Não é recomendação/)
})

test('a barra de /fiis termina na própria página e o routeRules não redireciona', () => {
  assert.equal(destinoSemBarra('/fiis/'), FIIS_PATH)
  assert.equal(destinoSemBarra('/fiis'), null)
  assert.equal(destinoSemBarra('/rankings/fiis/'), '/rankings?classe=fiis')
  const config = ler('nuxt.config.ts')
  assert.doesNotMatch(config, /'\/fiis': \{ redirect:/)
  assert.match(config, /'\/rankings\/fiis': \{ redirect: \{ to: '\/rankings\?classe=fiis'/)
  const mapa = ler('server/utils/sem-barra.ts')
  assert.doesNotMatch(mapa, /'\/fiis': '\/rankings\?classe=fiis'/)
  assert.match(mapa, /'\/rankings\/fiis': '\/rankings\?classe=fiis'/)
})

test('a página usa o filtro de FIIs, o canonical /fiis, sitemap, llms e cache', () => {
  const vue = ler('app/pages/rankings/index.vue')
  assert.match(vue, /alias: \['\/fiis'\]/)
  assert.match(vue, /canonicalDeRankings/)
  assert.match(vue, /FIIS_H1/)
  assert.match(vue, /v-if="scoreTop.length && !paginaFiis"/)
  assert.doesNotMatch(vue, /noindex/)
  assert.match(ler('server/utils/site-pages.ts'), /FIIS_PATH/)
  assert.match(ler('server/routes/llms.txt.ts'), /\$\{o\}\/fiis/)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/fiis': QUINZE_MIN/)
})
