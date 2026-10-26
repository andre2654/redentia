/**
 * Guia /guias/como-calcular-preco-teto: orçamento de SERP, registro no
 * sitemap (via GUIDE_DOCS) e links de entrada. O módulo do guia usa o alias
 * ~/ , então o teste lê o fonte.
 */
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'

const root = new URL('..', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

const guia = read('app/content/guias/como-calcular-preco-teto.ts')
const title = guia.match(/title: '([^']+)'/)?.[1] ?? ''
const description = guia.match(/description:\s*\n\s*'([^']+)'/)?.[1] ?? ''

test('title e description do guia cabem no SERP e miram a consulta', () => {
  assert.match(title, /como calcular preço teto/i)
  assert.ok(title.length + SUFIXO_MARCA.length <= TETO_TITULO, `${title} (${title.length + SUFIXO_MARCA.length})`)
  assert.match(description, /como calcular preço teto/i)
  assert.match(description, /não é recomendação/i)
  assert.ok(description.length <= TETO_DESCRICAO, `${description.length}: ${description}`)
  assert.ok(description.length >= 140, `${description.length}`)
})

test('o exemplo ilustrativo fecha nas cinco fórmulas', () => {
  assert.match(guia, /2,70 ÷ 0,06 = <strong>R\$ 45,00<\/strong>/)
  assert.match(guia, /√2\.025 = <strong>R\$ 45,00<\/strong>/)
  assert.match(guia, /6 × 8 = <strong>R\$ 48,00<\/strong>/)
  assert.match(guia, /15 × 1,5 = <strong>R\$ 22,50<\/strong>/)
  assert.match(guia, /2,97 ÷ 0,06 = <strong>R\$ 49,50<\/strong>/)
  assert.match(guia, /Não é recomendação/)
})

test('o guia entra no registry, e o sitemap deriva de GUIDE_DOCS', () => {
  const index = read('app/content/guias/index.ts')
  assert.match(index, /COMO_CALCULAR_PRECO_TETO_GUIDE/)
  assert.match(index, /slug: 'como-calcular-preco-teto'/)
  const pages = read('server/utils/site-pages.ts')
  assert.match(pages, /function guideDocPages\(\)/)
  assert.match(pages, /Object\.values\(GUIDE_DOCS\)/)
  assert.match(pages, /\.\.\.guideDocPages\(\)/)
})

test('calculadora, métodos, glossário e llms apontam para o guia', () => {
  const href = '/guias/como-calcular-preco-teto'
  assert.match(read('app/pages/calculadora/preco-teto/index.vue'), new RegExp(href))
  assert.match(read('app/components/calc/CalcPrecoTetoMetodo.vue'), new RegExp(href))
  assert.match(read('app/content/glossario/grupo-1.ts'), new RegExp(href))
  assert.match(read('app/content/glossario/grupo-4.ts'), new RegExp(href))
  assert.match(read('server/routes/llms.txt.ts'), new RegExp(href.replace(/\//g, '\\/')))
  for (const ticker of ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'TAEE11', 'HGLG11']) {
    assert.match(guia, new RegExp(`/calculadora/preco-teto/${ticker}`))
  }
  for (const metodo of ['bazin', 'graham', 'pl-setorial', 'valor-patrimonial', 'projetivo']) {
    assert.match(guia, new RegExp(`/calculadora/preco-teto/${metodo}`))
  }
})
