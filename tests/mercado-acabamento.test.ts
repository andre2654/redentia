/**
 * Acabamento das páginas de mercado (Aportou, 2ª rodada, 11/11/2026): o que a
 * lapidação combinou e não pode se desfazer numa edição futura.
 *  - um filtro só (o NuTrilho da base, desde a robustez de 11/11/2026; antes o
 *    MercadoTrilho) e um fecho só (MercadoFecho, com o corte pela
 *    classe global .nu-corte-fundo: regra do dono, o corte sai do canto de cima
 *    à esquerda e ninguém o reposiciona);
 *  - as tabelas põem a métrica do ranking logo depois do ativo;
 *  - o cartão da /teses fala a língua da tela de tese (o NuSelo, que era o TeseSelo) e não inventa selo.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('o fecho das páginas de mercado é o painel azul com o corte pela classe global', () => {
  const fecho = ler('app/components/ranking/MercadoFecho.vue')
  assert.match(fecho, /class="mfe__corte nu-corte-fundo"/)
  assert.match(fecho, /var\(--nu-grad-cobalto\)/)
  // o componente não reposiciona o corte: quem manda é .nu-corte-fundo
  assert.doesNotMatch(fecho, /\.mfe__corte \{[^}]*(right|bottom|left|top|transform)\s*:/)
  for (const p of ['app/pages/rankings/index.vue', 'app/pages/ranking/[slug].vue', 'app/pages/setor/index.vue', 'app/pages/setor/[slug].vue', 'app/pages/tesouro/index.vue', 'app/pages/tesouro/[slug].vue']) {
    const src = ler(p)
    assert.match(src, /<MercadoFecho\b/, p)
    assert.doesNotMatch(src, /<NuCtaPhoto\b/, p)
  }
})

test('os filtros das páginas de mercado usam o mesmo trilho', () => {
  const trilho = ler('app/components/nu/NuTrilho.vue')
  assert.match(trilho, /--ntr-h: 44px/) // alvo de toque do contrato (no tamanho p o toque também chega a 44px)
  assert.match(trilho, /--ntr-pilula: var\(--nu-ink\)/) // a escolhida em pílula carvão
  // a cópia local saiu: uma peça só para a mesma função
  assert.equal(existsSync(new URL('../app/components/ranking/MercadoTrilho.vue', import.meta.url)), false)
  for (const p of ['app/pages/rankings/index.vue', 'app/pages/tesouro/index.vue', 'app/pages/noticias.vue', 'app/components/busca/BuscaCampo.vue', 'app/components/ranking/RankTypeTabs.vue', 'app/components/teses/TesesGrade.vue']) {
    const src = ler(p)
    assert.match(src, /<NuTrilho\b/, p)
    assert.doesNotMatch(src, /<NuFilterPills\b/, p)
  }
})

test('a tabela do ranking põe a métrica principal logo depois do ativo, sem perder coluna', () => {
  const tabela = ler('app/components/ranking/RankTable.vue')
  assert.match(tabela, /primary\?: RankingColumnKey/)
  const cab = tabela.slice(tabela.indexOf('<thead>'), tabela.indexOf('</thead>'))
  assert.ok(cab.indexOf('rkt__th--asset') < cab.indexOf('rkt__th--main'), 'ativo antes da principal')
  assert.ok(cab.indexOf('rkt__th--main') < cab.indexOf('>Cotação<'), 'principal antes da cotação')
  assert.match(tabela, /demais = computed\(\(\) => defs\.value\.filter\(\(c\) => c\.key !== principal\.value\?\.key\)\)/)
  assert.match(ler('app/pages/ranking/[slug].vue'), /:primary="meta\.primaryMetric"/)
})

test('o cartão da /teses usa os selos da tela de tese e só mostra o que a lista traz', () => {
  const grade = ler('app/components/teses/TesesGrade.vue')
  assert.match(grade, /<NuSelo v-if="t\.conviccao != null" tom="azul">Convicção \{\{ t\.conviccao \}\} de 100<\/NuSelo>/)
  assert.match(grade, /<NuSelo v-if="extras\[t\.slug\]\?\.retorno"/)
  assert.match(grade, /<NuSelo v-if="extras\[t\.slug\]\?\.ativos" tom="carvao">/)
  // a capa só entra quando a tese tem imagem
  assert.match(grade, /<span v-if="t\.capa && !falhouImagem\[t\.slug\]" class="tgr__capa">/)
  assert.match(grade, /Abrir tese</)
})
