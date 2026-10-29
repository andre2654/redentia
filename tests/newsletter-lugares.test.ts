/**
 * Onde a assinatura de O mercado da semana aparece além dos formulários das
 * páginas: a faixa do rodapé e o convite do canto (21/10/2026). A preço teto
 * fica fora dos dois: o dono vetou mexer nela (15/10/2026) e ela traz três
 * quartos dos cliques da busca, que o NuMcpPromo cobria quando abria por cima
 * da calculadora.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CONVITE_FOLGA_PX,
  CONVITE_LARGURA_PX,
  CONVITE_MARGEM_PX,
  CONVITE_MOBILE_MAX_PX,
  CONVITE_PAUSA_DIAS,
  cardSeparadoDoConteudo,
  conviteElegivel,
  conviteForaDaPagina,
  convitePausado,
  formatoConvitePorLargura,
  fracaoLida,
  reservaDoConviteDesktop,
  rodapeSemAssinatura,
} from '../app/utils/newsletter-lugares.ts'

const PRECO_TETO = ['/calculadora/preco-teto', '/calculadora/preco-teto/', '/calculadora/preco-teto/graham', '/calculadora/preco-teto/PETR4', '/Calculadora/Preco-Teto']

test('o rodapé fica sem a faixa só onde a página já tem o formulário dela', () => {
  for (const p of [...PRECO_TETO, '/guias', '/guias/']) assert.equal(rodapeSemAssinatura(p), true, p)
  for (const p of ['/', '/rankings', '/tesouro', '/calculadora/acoes', '/guias/data-com-e-data-ex', '/asset/PETR4', '/login', '/calculadora/preco-tetox']) {
    assert.equal(rodapeSemAssinatura(p), false, p)
  }
})

test('o convite fica fora do /guias e das páginas de conta', () => {
  for (const p of [
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
    ...PRECO_TETO,
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

test('até 760px o convite é o bloco; acima, o cartão', () => {
  assert.equal(CONVITE_MOBILE_MAX_PX, 760)
  assert.equal(formatoConvitePorLargura(390), 'bloco_mobile')
  assert.equal(formatoConvitePorLargura(760), 'bloco_mobile')
  assert.equal(formatoConvitePorLargura(761), 'card_desktop')
  assert.equal(formatoConvitePorLargura(1440), 'card_desktop')
})

test('o cartão reserva a própria largura e não invade o texto', () => {
  assert.equal(CONVITE_LARGURA_PX, 392)
  assert.equal(CONVITE_MARGEM_PX, 24)
  assert.equal(CONVITE_FOLGA_PX, 16)
  assert.equal(reservaDoConviteDesktop(), 392 + 24 + 16)
  assert.equal(cardSeparadoDoConteudo(1440), true)
  assert.equal(cardSeparadoDoConteudo(761), true)
})

test('quem já assinou não vê o convite, no bloco e no cartão', () => {
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
  assert.equal(conviteElegivel({ ...base, caminho: '/calculadora/preco-teto/PETR4' }), true)
  assert.equal(conviteElegivel({ ...base, assinou: true }), false)
  assert.equal(conviteElegivel({ ...base, autenticado: true }), false)
  assert.equal(conviteElegivel({ ...base, caminho: '/guias' }), false)
  assert.equal(conviteElegivel({ ...base, ligada: false }), false)
})

test('a fração lida do <main>: 0 no topo, 1 no fim', () => {
  // main de 3000 px começando no topo da tela de 800 px
  assert.equal(fracaoLida(0, 3000, 800), 800 / 3000)
  // rolou 1000 px
  assert.equal(fracaoLida(-1000, 3000, 800), 0.6)
  // o fim do main passou da base da tela
  assert.ok(fracaoLida(-2500, 3000, 800) > 1)
  assert.equal(fracaoLida(0, 0, 800), 0)
})
