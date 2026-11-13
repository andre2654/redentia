/**
 * O pré-lançamento da Aportou (13/11/2026; docs/aportou/virada-de-dominio.md, seção 4.1): o site no ar em
 * aportou.com.br antes da troca, com o redentia.com.br como está. Ligado pela Vercel, ele tira o site do índice
 * e não oferece o aceite do WhatsApp (o backend de produção ainda carimba a versão antiga do texto).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { preLancamentoLigado, textoDoRobots } from '../server/utils/pre-lancamento.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('desligado por padrão; liga pela variável da Vercel', () => {
  assert.match(ler('nuxt.config.ts'), /\n      preLancamento: false,\n/)
  assert.equal(preLancamentoLigado(true), true)
  assert.equal(preLancamentoLigado('true'), true)
  assert.equal(preLancamentoLigado('1'), true)
  for (const v of [false, 'false', '', undefined, null, 0]) assert.equal(preLancamentoLigado(v), false, String(v))
})

test('o robots do pré-lançamento libera o rastreio (para o Google ler o noindex) e não anuncia sitemap', () => {
  const pre = textoDoRobots('https://aportou.com.br', true)
  assert.match(pre, /^User-agent: \*\nAllow: \/\n/)
  assert.doesNotMatch(pre, /Sitemap:|Disallow|llms/)
  const normal = textoDoRobots('https://aportou.com.br', false)
  assert.match(normal, /Sitemap: https:\/\/aportou\.com\.br\/sitemap\.xml/)
  assert.match(normal, /# https:\/\/aportou\.com\.br\/llms\.txt/)
  assert.match(ler('server/routes/robots.txt.ts'), /return textoDoRobots\(origin, preLancamentoLigado\(useRuntimeConfig\(event\)\.public\.preLancamento\)\)/)
})

test('toda resposta sai fora do índice, decidido por pedido (a variável liga e desliga sem rebuild)', () => {
  const mw = ler('server/middleware/pre-lancamento.ts')
  assert.match(mw, /if \(preLancamentoLigado\(useRuntimeConfig\(event\)\.public\.preLancamento\)\) setResponseHeader\(event, 'x-robots-tag', 'noindex, nofollow'\)/)
  // não no routeRules: o preset da Vercel congela o routeRules no build
  assert.doesNotMatch(ler('nuxt.config.ts'), /'x-robots-tag'/i)
})

test('o quiz da assinatura não oferece o aceite do WhatsApp no pré-lançamento, e nunca manda o "sim"', () => {
  const quiz = ler('app/components/assinatura/AssinaturaQuiz.vue')
  assert.match(quiz, /const semAceiteWhatsapp = preLancamento === true \|\| preLancamento === 'true'/)
  assert.match(quiz, /<label v-if="!semAceiteWhatsapp" class="aqz__aceite">/)
  assert.match(quiz, /whatsapp_opt_in: !semAceiteWhatsapp && aceiteWhatsapp\.value,/)
})
