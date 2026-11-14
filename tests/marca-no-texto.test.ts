/** A marca nos textos que vêm da API (11/11/2026): utils/marcaNoTexto.ts */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { marcaNoTexto } from '../app/utils/marcaNoTexto.ts'

test('a palavra inteira "Redentia" vira "Aportou"', () => {
  // o monitoring.eyebrow real das teses
  assert.equal(marcaNoTexto('A Redentia vigia por você'), 'A Aportou vigia por você')
  assert.equal(marcaNoTexto('revalidado todo dia pela Redentia.'), 'revalidado todo dia pela Aportou.')
  assert.equal(marcaNoTexto('Redentia, Redentia e (Redentia)'), 'Aportou, Aportou e (Aportou)')
  assert.equal(marcaNoTexto('A REDENTIA VIGIA POR VOCÊ'), 'A APORTOU VIGIA POR VOCÊ')
  assert.equal(marcaNoTexto('Pergunte à Redentia AI sobre a tese'), 'Pergunte à IA da Aportou sobre a tese')
  assert.equal(marcaNoTexto('o Redentia Score do ativo'), 'o Aportou Score do ativo')
})

test('domínio, link e e-mail ficam como estão', () => {
  for (const t of [
    'Fale com relacionamento@redentia.com.br',
    'https://redentia.com.br/asset/TUPY3',
    'veja em redentia.com.br/teses',
    'Redentia.com.br é o endereço',
    'contato@Redentia.com.br',
    'instagram.com/redentia.app',
    'linkedin.com/company/redentia',
    'https://x.com/Redentia',
  ]) assert.equal(marcaNoTexto(t), t)
})

test('o produto de escritório e o endosso seguem Redentia', () => {
  assert.equal(marcaNoTexto('Conheça o Redentia For Business'), 'Conheça o Redentia For Business')
  assert.equal(marcaNoTexto('o painel do Redentia Business'), 'o painel do Redentia Business')
  assert.equal(marcaNoTexto('Aportou. Uma empresa Redentia'), 'Aportou. Uma empresa Redentia')
})

test('não toca em palavra que só contém o nome, nem em vazio', () => {
  assert.equal(marcaNoTexto('Redentiano e preRedentia'), 'Redentiano e preRedentia')
  assert.equal(marcaNoTexto('a redentia em minúsculas é identificador'), 'a redentia em minúsculas é identificador')
  assert.equal(marcaNoTexto(''), '')
  assert.equal(marcaNoTexto(null), null)
  assert.equal(marcaNoTexto(undefined), undefined)
})

test('o useTese aplica a marca só no que vai à tela: o SEO lê o detail como veio', () => {
  const fonte = readFileSync(new URL('../app/composables/useTese.ts', import.meta.url), 'utf8')
  assert.match(fonte, /const tela = safe\(\(\) => comMarca\(detail\), detail, 'marca'\)/)
  assert.match(fonte, /monitoring: safe\(\(\) => buildMonitoring\(tela\)/)
  assert.match(fonte, /seo: buildSeo\(detail\)/)
  // o título (H1) e as fontes não passam pela troca
  const comMarca = fonte.slice(fonte.indexOf('function comMarca('), fonte.indexOf('/* ————— SEO ————— */'))
  assert.doesNotMatch(comMarca, /\btitle: t\(d\.title\)/)
  assert.doesNotMatch(comMarca, /sources/)
})

test('o gancho ?tese-exemplo=1 só existe no dev', () => {
  const fonte = readFileSync(new URL('../app/composables/useTese.ts', import.meta.url), 'utf8')
  assert.match(fonte, /const exemplosDeTese = import\.meta\.dev\s*\?\s*import\.meta\.glob/)
  assert.match(fonte, /const exemplo = import\.meta\.dev && String\(useRoute\(\)\.query\['tese-exemplo'\]/)
})
