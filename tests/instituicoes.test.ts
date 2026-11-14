/**
 * A lista de instituições (app/content/instituicoes.ts) que a carteira vazia e
 * a assinatura mostram, com o logo de cada uma (ClienteInstLogo). Os casos
 * vieram do teste do widget do cliente do escritório (clientes-conexao), que
 * saiu com o B2B em 12/11/2026; estes são os que o site de investidor usa.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { INSTITUICOES, iniciaisDe } from '../app/content/instituicoes.ts'

const PUBLIC = fileURLToPath(new URL('../public/instituicoes/', import.meta.url))

test('instituições: lista íntegra, slug único, logo existe no disco quando prometido', () => {
  const slugs = INSTITUICOES.map(i => i.slug)
  assert.deepEqual(slugs, [...new Set(slugs)], 'slug repetido')
  assert.ok(INSTITUICOES.length >= 30)
  for (const i of INSTITUICOES) {
    assert.match(i.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, i.slug)
    assert.ok(i.name.trim().length > 0, i.slug)
    assert.ok(['banco', 'corretora'].includes(i.tipo), i.slug)
    assert.equal(existsSync(`${PUBLIC}${i.slug}.svg`), i.logo, `${i.slug}: logo prometido ≠ arquivo em public/instituicoes`)
  }
  // e todo SVG que existe está na lista com logo: true
  for (const f of readdirSync(PUBLIC).filter(f => f.endsWith('.svg'))) {
    const slug = f.replace(/\.svg$/, '')
    assert.ok(INSTITUICOES.find(i => i.slug === slug)?.logo, `${slug}.svg existe mas não está na lista com logo`)
  }
})

test('instituições: iniciais do avatar sem logo', () => {
  assert.equal(iniciaisDe('Banco do Brasil'), 'BR')
  assert.equal(iniciaisDe('C6 Bank'), 'C6')
  assert.equal(iniciaisDe('Mercado Pago'), 'MP')
  assert.equal(iniciaisDe('Caixa'), 'CA')
  assert.equal(iniciaisDe('BS2'), 'BS')
  assert.equal(iniciaisDe('Banco Pan'), 'PA')
  assert.equal(iniciaisDe('Órama'), 'ÓR')
})
