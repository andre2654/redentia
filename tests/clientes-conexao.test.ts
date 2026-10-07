/**
 * O widget de conexão do cliente final (/cliente/convite): as funções puras
 * que ele usa.
 *
 *  - CPF: máscara progressiva e validação dos dígitos verificadores (o CPF
 *    nunca sai do navegador; aqui só se prova que a tela aceita o certo e
 *    recusa o errado);
 *  - instituições: a lista é íntegra, tem os 16 logos que existem em
 *    public/instituicoes, a busca ignora acento e acha por apelido, e as
 *    iniciais do avatar sem logo fazem sentido.
 *
 * Roda com `npm test` (node --test, Node com type stripping: 22.18+).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { cpfDigitos, cpfValido, mascararCpf } from '../app/utils/cpf.ts'
import {
  INSTITUICOES,
  filtrarInstituicoes,
  iniciaisDe,
  instituicaoPorNome,
  instituicaoPorSlug,
  normalizarBusca,
} from '../app/content/instituicoes.ts'

const PUBLIC = fileURLToPath(new URL('../public/instituicoes/', import.meta.url))

test('CPF: a máscara cresce com a digitação e descarta o que não é dígito', () => {
  assert.equal(mascararCpf('1'), '1')
  assert.equal(mascararCpf('123'), '123')
  assert.equal(mascararCpf('1234'), '123.4')
  assert.equal(mascararCpf('1234567'), '123.456.7')
  assert.equal(mascararCpf('1234567890'), '123.456.789-0')
  assert.equal(mascararCpf('12345678909'), '123.456.789-09')
  assert.equal(mascararCpf('123.456.789-09x'), '123.456.789-09')
  assert.equal(mascararCpf('123456789091234'), '123.456.789-09')
  assert.equal(cpfDigitos('123.456.789-09'), '12345678909')
})

test('CPF: validação dos dígitos verificadores', () => {
  // números de teste com os DVs calculados pelo algoritmo oficial (não são de pessoas)
  assert.equal(cpfValido('123.456.789-09'), true)
  assert.equal(cpfValido('529.982.247-25'), true)
  assert.equal(cpfValido('123.456.789-00'), false)
  assert.equal(cpfValido('111.111.111-11'), false)
  assert.equal(cpfValido('000.000.000-00'), false)
  assert.equal(cpfValido('123.456.789'), false)
  assert.equal(cpfValido(''), false)
  assert.equal(cpfValido('abc'), false)
})

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
    assert.ok(instituicaoPorSlug(slug)?.logo, `${slug}.svg existe mas não está na lista com logo`)
  }
})

test('instituições: a busca ignora acento, acha por sigla/apelido e respeita a aba', () => {
  assert.equal(normalizarBusca('  Itaú '), 'itau')
  assert.deepEqual(filtrarInstituicoes('itau').map(i => i.slug), ['itau', 'ion'])
  assert.deepEqual(filtrarInstituicoes('Itaú').map(i => i.slug), ['itau', 'ion'])
  assert.deepEqual(filtrarInstituicoes('bb').map(i => i.slug), ['bb'])
  assert.deepEqual(filtrarInstituicoes('xp').map(i => i.slug), ['xp'])
  assert.deepEqual(filtrarInstituicoes('cef').map(i => i.slug), ['caixa'])
  assert.deepEqual(filtrarInstituicoes('roxinho').map(i => i.slug), ['nubank'])
  assert.deepEqual(filtrarInstituicoes('nao existe'), [])
  assert.equal(filtrarInstituicoes('').length, INSTITUICOES.length)
  assert.ok(filtrarInstituicoes('', 'corretora').every(i => i.tipo === 'corretora'))
  assert.ok(filtrarInstituicoes('', 'banco').every(i => i.tipo === 'banco'))
  assert.deepEqual(filtrarInstituicoes('nubank', 'corretora'), [])
  assert.equal(instituicaoPorNome('Nubank')?.slug, 'nubank')
  assert.equal(instituicaoPorNome('Instituição de demonstração'), null)
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
