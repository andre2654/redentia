/**
 * URLs de "Acompanhe o André": X e Threads, com os UTMs exatos de cada lugar.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LUGARES_ACOMPANHE, urlAcompanhe, type LugarAcompanhe, type RedeAcompanhe } from '../app/utils/acompanhe-andre.ts'

const BASE: Record<RedeAcompanhe, string> = {
  x: 'https://x.com/andrevisaraiva',
  threads: 'https://www.threads.com/@andrevsaraiva',
}

function esperada(rede: RedeAcompanhe, lugar: LugarAcompanhe): string {
  return `${BASE[rede]}?utm_source=site&utm_medium=${lugar}&utm_campaign=acompanhe_andre`
}

test('X e Threads levam utm_source, utm_medium e utm_campaign exatos', () => {
  for (const lugar of LUGARES_ACOMPANHE) {
    for (const rede of ['x', 'threads'] as const) {
      const url = urlAcompanhe(rede, lugar)
      assert.equal(url, esperada(rede, lugar))
      const q = new URL(url).searchParams
      assert.equal(q.get('utm_source'), 'site')
      assert.equal(q.get('utm_medium'), lugar)
      assert.equal(q.get('utm_campaign'), 'acompanhe_andre')
      assert.equal([...q.keys()].join(','), 'utm_source,utm_medium,utm_campaign')
    }
  }
})

test('o @ do Threads permanece na URL, sem encoding', () => {
  assert.equal(
    urlAcompanhe('threads', 'rodape'),
    'https://www.threads.com/@andrevsaraiva?utm_source=site&utm_medium=rodape&utm_campaign=acompanhe_andre',
  )
})

test('a linha usa o helper, sem heading, sem nofollow e sem sair do fluxo', () => {
  const src = readFileSync(new URL('../app/components/nu/NuAcompanheAndre.vue', import.meta.url), 'utf8')
  assert.match(src, /urlAcompanhe\('x', props\.lugar\)/)
  assert.match(src, /urlAcompanhe\('threads', props\.lugar\)/)
  assert.match(src, /aria-label="André Saraiva no X"/)
  assert.match(src, /aria-label="André Saraiva no Threads"/)
  assert.match(src, /rel="noopener me"/)
  assert.match(src, /target="_blank"/)
  assert.doesNotMatch(src, /<h[1-6]\b/)
  assert.doesNotMatch(src, /nofollow/)
  assert.doesNotMatch(src, /position:\s*(fixed|sticky|absolute)/)
})

test('calculadora, ativo e rodapé passam o lugar certo', () => {
  const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
  assert.match(ler('app/pages/calculadora/preco-teto/index.vue'), /<NuAcompanheAndre lugar="calculadora" \/>/)
  assert.match(ler('app/pages/asset/[ticker].vue'), /<NuAcompanheAndre lugar="asset" \/>/)
  assert.match(ler('app/components/nu/NuFooter.vue'), /<NuAcompanheAndre lugar="rodape" tom="escuro" \/>/)
})
