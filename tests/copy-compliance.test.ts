/**
 * Copy de compliance conferida contra o que o código faz (revisão de
 * 07/10/2026). Cada caso trava uma frase que afirmava algo falso e a troca que
 * a deixou verdadeira. Lê os arquivos como texto: não depende do Nuxt.
 *
 * Os casos do produto de escritório (CV-01, 06, 09, 14, 16, 18, 19 e 20)
 * saíram com o B2B em 12/11/2026: as telas que eles travavam não moram mais
 * neste front. Ficam os do site de investidor.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const ler = (f: string) => readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8')
// Junta quebras de linha do template para a frase não escapar do grep.
const plano = (f: string) => ler(f).replace(/\s+/g, ' ')

/*
 * CV-10 travava a copy do pop-up de anúncio (NuMcpPromo). O pop-up saiu de vez
 * em 15/10/2026, a pedido do dono, e a trava passou a ser a ausência dele.
 */
test('CV-10: o pop-up de anúncio não volta ao layout', () => {
  assert.equal(existsSync(new URL('../app/components/nu/NuMcpPromo.vue', import.meta.url)), false)
  for (const f of ['layouts/default.vue'])
    assert.doesNotMatch(semComentarios(ler(f)), /<NuMcpPromo/, f)
})

/**
 * Texto do arquivo sem os comentários (bloco, HTML e linha inteira de //):
 * comentário de código pode citar o modo interno; o que a pessoa lê, não.
 */
function semComentarios(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .split('\n').filter(l => !l.trim().startsWith('//')).join('\n')
}

test('CV-17: o guia de MCP restringe o "somente leitura" à chave pessoal', () => {
  const g = plano('content/guias/mcp-para-investimentos.ts')
  assert.doesNotMatch(g, /O (Redentia|Aportou) MCP é <strong>somente leitura<\/strong>\./)
  assert.match(g, /Na chave pessoal, o Aportou MCP é <strong>somente leitura<\/strong>/)
})
