/**
 * Onde a assinatura de O mercado da semana aparece além dos formulários das
 * páginas: a faixa do rodapé (21/10/2026; o bloco antes dele saiu em
 * 03/11/2026). A preço teto fica sem a faixa: o dono vetou mexer nela (15/10/2026) e ela traz três
 * quartos dos cliques da busca, que o NuMcpPromo cobria quando abria por cima
 * da calculadora.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatoConviteValido, rodapeSemAssinatura } from '../app/utils/newsletter-lugares.ts'

const PRECO_TETO = ['/calculadora/preco-teto', '/calculadora/preco-teto/', '/calculadora/preco-teto/graham', '/calculadora/preco-teto/PETR4', '/Calculadora/Preco-Teto']

test('o rodapé fica sem a faixa só onde a página já tem o formulário dela', () => {
  for (const p of PRECO_TETO) assert.equal(rodapeSemAssinatura(p), true, p)
  // o /guias perdeu a faixa azul dele (03/11/2026): a assinatura é a do rodapé
  for (const p of ['/guias', '/guias/', '/', '/rankings', '/tesouro', '/calculadora/acoes', '/guias/data-com-e-data-ex', '/asset/PETR4', '/login', '/calculadora/preco-tetox']) {
    assert.equal(rodapeSemAssinatura(p), false, p)
  }
})

test('o formato do evento só aceita os dois blocos', () => {
  assert.equal(formatoConviteValido('bloco_mobile'), 'bloco_mobile')
  assert.equal(formatoConviteValido('bloco_desktop'), 'bloco_desktop')
  assert.equal(formatoConviteValido('modal'), null)
  assert.equal(formatoConviteValido(null), null)
})
