/**
 * O "Pronto" da newsletter só aparece quando o PUT /me/notification-preferences
 * responde 200. Enquanto a resposta não chega, o estado é de envio. Erro não
 * grava NEWSLETTER_ASSINOU nem dispara o evento do GA4.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  aposPutNewsletter,
  inscricaoConcluida,
  statusDaResposta,
} from '../app/utils/newsletter-inscricao.ts'

function adiar<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test('só o HTTP 200 conclui a inscrição', () => {
  assert.equal(inscricaoConcluida(200), true)
  for (const status of [0, 201, 204, 400, 401, 422, 429, 500]) {
    assert.equal(inscricaoConcluida(status), false, String(status))
  }
})

test('o status sai do erro do fetch, e rede sem status vira 0', () => {
  assert.equal(statusDaResposta({ statusCode: 422 }), 422)
  assert.equal(statusDaResposta({ response: { status: 500 } }), 500)
  assert.equal(statusDaResposta({ status: 403 }), 403)
  assert.equal(statusDaResposta(new Error('rede')), 0)
  assert.equal(statusDaResposta(null), 0)
})

test('enquanto o PUT não volta, só o estado de envio: sem sucesso', async () => {
  const put = adiar<number>()
  let enviando = false
  let sucessos = 0
  let erros = 0
  const pendente = aposPutNewsletter(() => put.promise, {
    enviando(v) { enviando = v },
    sucesso() { sucessos++ },
    erro() { erros++ },
  })
  assert.equal(enviando, true)
  assert.equal(sucessos, 0)
  assert.equal(erros, 0)
  put.resolve(200)
  assert.equal(await pendente, true)
  assert.equal(sucessos, 1)
  assert.equal(erros, 0)
  assert.equal(enviando, false)
})

test('status que não é 200 é erro: não chama sucesso', async () => {
  for (const status of [201, 204, 422, 500]) {
    let sucessos = 0
    let erros = 0
    const ok = await aposPutNewsletter(async () => status, {
      enviando() {},
      sucesso() { sucessos++ },
      erro() { erros++ },
    })
    assert.equal(ok, false, String(status))
    assert.equal(sucessos, 0, String(status))
    assert.equal(erros, 1, String(status))
  }
})

test('falha de rede é erro e não conclui', async () => {
  let sucessos = 0
  let erros = 0
  let enviandoNoErro = true
  const ok = await aposPutNewsletter(async () => {
    throw new Error('falha de rede')
  }, {
    enviando(v) { enviandoNoErro = v },
    sucesso() { sucessos++ },
    erro() {
      erros++
      assert.equal(enviandoNoErro, true)
    },
  })
  assert.equal(ok, false)
  assert.equal(sucessos, 0)
  assert.equal(erros, 1)
  assert.equal(enviandoNoErro, false)
})

test('NEWSLETTER_ASSINOU e o evento do GA4 só correm dentro de concluir, chamado no sucesso do PUT', () => {
  const src = readFileSync(new URL('../app/composables/useNewsletter.ts', import.meta.url), 'utf8')
  const concluir = src.slice(src.indexOf('function concluir('), src.indexOf('async function assinarComConta'))
  assert.match(concluir, /localStorage\.setItem\(NEWSLETTER_ASSINOU/)
  assert.match(concluir, /gtag\?\.\('event', 'newsletter_assinatura'/)
  const semDeclaracao = src.replace('function concluir()', '')
  assert.equal(semDeclaracao.match(/concluir\(\)/g)?.length, 1)
  const sucesso = src.slice(src.indexOf('sucesso()'), src.indexOf('sucesso()') + 80)
  assert.match(sucesso, /concluir\(\)/)
  assert.match(src, /aposPutNewsletter\(/)
  assert.match(src, /return res\.status/)
  // o "Pronto" da interface é a etapa ok, e ela só é ligada em concluir
  assert.equal(src.match(/etapa\.value = 'ok'/g)?.length, 1)
  assert.match(concluir, /etapa\.value = 'ok'/)
})
