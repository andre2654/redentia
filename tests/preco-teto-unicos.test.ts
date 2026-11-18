/**
 * Título, description e intro (parágrafo) dos 237 indexáveis são strings únicas.
 * O fixture sai de scripts/gerar-preco-teto-textos.ts (API em 17/11/2026).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PRECO_TETO_INDEXAVEIS } from '../app/content/seo/preco-teto-indexaveis.ts'
import { montarPrecoTeto, type MontarPrecoTetoInput } from '../app/utils/preco-teto-pagina.ts'
import { TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import { tituloVisivel } from '../app/utils/preco-teto-pagina.ts'

const PROIBIDO = /\b(compre|comprar|venda|vender|vale a pena)\b|retorno garantido|previsão de alta|previsao de alta/i

const entradas = JSON.parse(readFileSync(new URL('./fixtures/preco-teto-indexaveis.json', import.meta.url), 'utf8')) as MontarPrecoTetoInput[]

function repetidos(valores: string[]): string[] {
  const vistos = new Set<string>()
  const dup: string[] = []
  for (const valor of valores) {
    if (vistos.has(valor)) dup.push(valor)
    vistos.add(valor)
  }
  return dup
}

test('título, description e intro dos 237 indexáveis são únicos', () => {
  assert.equal(entradas.length, 237)
  assert.deepEqual(entradas.map((e) => e.ticker).sort(), [...PRECO_TETO_INDEXAVEIS].sort())
  const views = entradas.map((entrada) => {
    const view = montarPrecoTeto(entrada)
    assert.ok(view, entrada.ticker)
    return view
  })
  const titulos = views.map((v) => v.title)
  const descricoes = views.map((v) => v.description)
  const paragrafos = views.map((v) => v.paragrafo)
  assert.deepEqual(repetidos(titulos), [])
  assert.deepEqual(repetidos(descricoes), [])
  assert.deepEqual(repetidos(paragrafos), [])
  for (const view of views) {
    assert.ok(tituloVisivel(view.title).length <= TETO_TITULO, view.ticker)
    assert.ok(view.description.length <= TETO_DESCRICAO, `${view.ticker} ${view.description.length}`)
    assert.match(view.title, new RegExp(view.ticker))
    assert.match(view.description, new RegExp(view.ticker))
    assert.match(view.paragrafo, new RegExp(view.ticker))
    assert.match(view.paragrafo, new RegExp(view.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.doesNotMatch(`${view.title}\n${view.description}\n${view.paragrafo}`, PROIBIDO, view.ticker)
    if (view.relacionados.length) {
      assert.ok(view.relacionados.length <= 6, view.ticker)
    }
  }
})
