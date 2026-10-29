/**
 * Onde a assinatura de O mercado da semana aparece além dos formulários das
 * páginas: a faixa do rodapé e o bloco antes dele (21/10/2026). A preço teto
 * fica fora dos dois: o dono vetou mexer nela (15/10/2026) e ela traz três
 * quartos dos cliques da busca, que o NuMcpPromo cobria quando abria por cima
 * da calculadora.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CONVITE_MOBILE_MAX_PX,
  CONVITE_PAUSA_DIAS,
  conviteElegivel,
  conviteForaDaPagina,
  convitePausado,
  formatoConvitePorLargura,
  rodapeSemAssinatura,
} from '../app/utils/newsletter-lugares.ts'

const PRECO_TETO = ['/calculadora/preco-teto', '/calculadora/preco-teto/', '/calculadora/preco-teto/graham', '/calculadora/preco-teto/PETR4', '/Calculadora/Preco-Teto']

test('o rodapé fica sem a faixa só onde a página já tem o formulário dela', () => {
  for (const p of [...PRECO_TETO, '/guias', '/guias/']) assert.equal(rodapeSemAssinatura(p), true, p)
  for (const p of ['/', '/rankings', '/tesouro', '/calculadora/acoes', '/guias/data-com-e-data-ex', '/asset/PETR4', '/login', '/calculadora/preco-tetox']) {
    assert.equal(rodapeSemAssinatura(p), false, p)
  }
})

test('o convite fica fora da preço teto, do /guias e das páginas de conta', () => {
  for (const p of [
    ...PRECO_TETO,
    '/guias',
    '/guias/',
    '/login',
    '/conta',
    '/carteira',
    '/busca',
    '/simulacao',
    '/cliente',
    '/cliente/acesso/abc',
    '/institucional/privacy',
    '/business',
    '/business/clientes',
  ]) assert.equal(conviteForaDaPagina(p), true, p)
})

test('o convite abre no resto do site, inclusive dentro de cada guia', () => {
  for (const p of [
    '/',
    '/rankings',
    '/ranking/maiores-dividendos',
    '/calculadora/acoes',
    '/calculadora/juros-compostos',
    '/calculadoras',
    '/tesouro',
    '/dividendos/PETR4',
    '/asset/PETR4',
    '/guias/data-com-e-data-ex',
    '/glossario/dividend-yield',
    '/noticias',
    '/teses',
    '/mcp',
    // não confunde prefixo parecido
    '/calculadora/preco-tetox',
    '/buscador',
    '/contato',
  ]) assert.equal(conviteForaDaPagina(p), false, p)
})

test('fechou o convite: some por 30 dias e volta depois', () => {
  const agora = Date.UTC(2026, 9, 21, 12)
  const dia = 86_400_000
  assert.equal(CONVITE_PAUSA_DIAS, 30)
  assert.equal(convitePausado(null, agora), false)
  assert.equal(convitePausado(agora - dia, agora), true)
  assert.equal(convitePausado(agora - 29 * dia, agora), true)
  assert.equal(convitePausado(agora - 30 * dia, agora), false)
})

test('até 760px o formato é bloco_mobile; acima, bloco_desktop', () => {
  assert.equal(CONVITE_MOBILE_MAX_PX, 760)
  assert.equal(formatoConvitePorLargura(390), 'bloco_mobile')
  assert.equal(formatoConvitePorLargura(760), 'bloco_mobile')
  for (const w of [761, 1024, 1280, 1440, 1920]) {
    assert.equal(formatoConvitePorLargura(w), 'bloco_desktop', String(w))
  }
})

test('quem já assinou não vê o convite', () => {
  const base = {
    ligada: true,
    autenticado: false,
    folhaAberta: false,
    contaConviteVisto: false,
    caminho: '/',
    assinou: false,
    fechouEm: null,
    agora: Date.UTC(2026, 9, 29),
  }
  assert.equal(conviteElegivel(base), true)
  assert.equal(conviteElegivel({ ...base, caminho: '/asset/PETR4' }), true)
  assert.equal(conviteElegivel({ ...base, caminho: '/calculadora/preco-teto/PETR4' }), false)
  assert.equal(conviteElegivel({ ...base, assinou: true }), false)
  assert.equal(conviteElegivel({ ...base, autenticado: true }), false)
  assert.equal(conviteElegivel({ ...base, caminho: '/guias' }), false)
  assert.equal(conviteElegivel({ ...base, ligada: false }), false)
})
