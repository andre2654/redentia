/**
 * Copy de compliance de /business, /cliente e do promo, conferida contra o
 * que o código faz (revisão de 07/10/2026). Cada caso trava uma frase que
 * afirmava algo falso e a troca que a deixou verdadeira. Lê os arquivos como
 * texto: não depende do Nuxt.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const ler = (f: string) => readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8')
// Junta quebras de linha do template para a frase não escapar do grep.
const plano = (f: string) => ler(f).replace(/\s+/g, ' ')

test('CV-01: banco separado não é afirmado no presente e "nenhum dado real" não volta', () => {
  const seg = plano('components/business/RbSeguranca.vue')
  assert.doesNotMatch(seg, /Os dados do seu escritório entram em banco separado/)
  assert.match(seg, /só entra depois de um banco separado/)
  assert.match(seg, /prova do aceite \(data, versão do termo, IP e navegador\)/)
  for (const f of ['components/business/RbSeguranca.vue', 'content/business/faq.ts', 'pages/business/clientes.vue'])
    assert.doesNotMatch(plano(f), /nenhum dado real/i, f)
})
