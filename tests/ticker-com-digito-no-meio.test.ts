/**
 * Ticker da B3 com dígito no meio (B3SA3, e BDRs como M1TA34) é ticker como os
 * outros. Em 13/11/2026 cinco lugares do front tinham uma cópia da regra que
 * pede quatro LETRAS antes do número e deixavam esses papéis de fora: o logo do
 * ativo, o herói do cadastro, o convite do preço teto e as calculadoras de
 * preço teto e de dividend yield. A forma do ticker mora em utils/tickerClass.ts.
 *
 * Este teste segura as duas calculadoras e barra cópia nova: a expressão de
 * quatro letras só fica onde é outra decisão, na lista abaixo, com o motivo.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { symbolShape } from '../app/utils/tickerClass.ts'

const raiz = new URL('../', import.meta.url).pathname
const ler = (p: string) => readFileSync(join(raiz, p), 'utf8')

/** `[A-Z]{4}` seguido de um ou dois dígitos, com ou sem grupo: a regra que deixa a B3SA3 de fora */
const QUATRO_LETRAS = /\[A-Z\]\{4\}\)?(?:\\d|\[0-9\])\{1,2\}/

// Onde a regra de quatro letras fica de propósito. Arquivo novo aqui só com o motivo.
const CONHECIDOS: Record<string, string> = {
  // o GET /news/ticker/{symbol} do backend valida assim e recusa ticker com dígito no meio
  'app/composables/useAcao.ts': 'endpoint de notícias',
  'app/composables/useCadastroDados.ts': 'endpoint de notícias',
  'app/services/acao.ts': 'comentário que documenta o endpoint de notícias',
  // texto de manchete: a forma larga casaria "COP30" como se fosse outro papel
  'app/utils/cadastro.ts': 'código de papel dentro de manchete',
  // a raiz da empresa são as quatro letras (PETR de PETR4); a B3SA3 volta inteira e é classe única
  'app/utils/cadeiaDaCarteira.ts': 'raiz da empresa',
}

function arquivos(dir: string): string[] {
  return readdirSync(join(raiz, dir)).flatMap((n) => {
    const p = join(dir, n)
    return statSync(join(raiz, p)).isDirectory() ? arquivos(p) : /\.(ts|vue)$/.test(p) ? [p] : []
  })
}

test('a regra única aceita dígito no meio e segue barrando quem não é da B3', () => {
  for (const t of ['B3SA3', 'M1TA34', 'A1MD34', 'PETR4', 'TAEE11']) assert.equal(symbolShape(t), 'b3', t)
  for (const t of ['BTC', 'AAPL', 'CDB', 'TESOURO SELIC 2029', '']) assert.notEqual(symbolShape(t), 'b3', t)
})

test('as calculadoras de preço teto e de dividend yield buscam o dado real de qualquer ticker da B3', () => {
  for (const p of ['app/pages/calculadora/preco-teto/index.vue', 'app/components/calculadoras/dividend-yield/CalcDividendYieldSection.vue']) {
    const fonte = ler(p)
    // a primeira linha do seedFromBackend é o portão: com a cópia de quatro letras, a B3SA3 parava aqui
    assert.match(fonte, /async function seedFromBackend\(t: string\) \{\n  if \(symbolShape\(t\) !== 'b3'\) return\n/, p)
  }
})

test('nenhuma cópia nova da regra de quatro letras (ela deixa a B3SA3 de fora)', () => {
  const comACopia = [...arquivos('app'), ...arquivos('shared'), ...arquivos('server')].filter((p) => QUATRO_LETRAS.test(ler(p))).sort()
  // Apareceu um arquivo novo? Use symbolShape (utils/tickerClass.ts). Se a decisão for outra, ponha-o em CONHECIDOS com o motivo.
  assert.deepEqual(comACopia, Object.keys(CONHECIDOS).sort())
})
