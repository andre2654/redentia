/**
 * Contrato C (Clientes do escritório): a leitura que o front faz das respostas
 * do Laravel. Os corpos abaixo são os que o backend REAL devolveu no e2e local
 * de 07/10/2026 (be-clientes + mcp-service + este front), com ids trocados.
 * Foi esse e2e que achou os descasamentos que estas funções corrigem:
 *
 *  - C6 com convite já usado volta 410 {error: 'invite_invalid', reason}; a
 *    página mandava "tente de novo" para um link morto;
 *  - o painel do dono recebe `last_read_by: {id, label}` e, no registro,
 *    `key: {id, label}`; o front lia `last_read_key_label`/`key_label` e a
 *    chave sumia da tela;
 *  - o teto de clientes conta só pendentes e ativos (`remaining_clients`), e
 *    o painel contava a lista inteira;
 *  - o registro grava `invite_canceled`, e o rótulo era de `invite_cancelled`.
 *
 * Roda com `npm test` (node --test, Node com type stripping: 22.18+).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  chaveDaUltimaLeitura,
  chaveDoRegistro,
  clientActionLabel,
  clientesOcupados,
  motivoDaRecusaDoConsentimento,
} from '../app/utils/clientes.ts'

test('C6: convite já usado (410 invite_invalid) vira o estado "usado", não "tente de novo"', () => {
  assert.equal(motivoDaRecusaDoConsentimento(410, { error: 'invite_invalid', reason: 'used' }), 'used')
  assert.equal(motivoDaRecusaDoConsentimento(410, { error: 'invite_invalid', reason: 'expired' }), 'expired')
  assert.equal(motivoDaRecusaDoConsentimento(410, { error: 'invite_invalid', reason: 'revoked' }), 'revoked')
  assert.equal(motivoDaRecusaDoConsentimento(409, { error: 'mode_unavailable' }), 'mode_unavailable')
  assert.equal(motivoDaRecusaDoConsentimento(404, { error: 'not_found' }), 'used')
  // termo mudou e limite não são recusa de convite: a página mostra a mensagem
  assert.equal(motivoDaRecusaDoConsentimento(409, { error: 'terms_outdated' }), null)
  assert.equal(motivoDaRecusaDoConsentimento(429, { error: 'rate_limited' }), null)
})

// Sem `source` e `demo`, que saíram do contrato do painel; `institution` entrou.
const linhaDoPainel = {
  id: '01m4bfbh1hhfv78wav0mvs3wkg',
  name: 'Joana Front',
  status: 'revoked',
  institution: 'Nubank',
  assigned_key: { id: 2, label: 'Mesa B', revoked: false },
  shared_with_office: false,
  connected_at: '2026-10-07T12:23:13-03:00',
  consent_expires_at: '2027-10-07T12:23:13-03:00',
  last_read_at: '2026-10-07T12:24:10-03:00',
  last_read_by: { id: 1, label: 'Mesa A' },
  pending_invite: null,
}

test('painel: a chave da última leitura sai de last_read_by', () => {
  assert.equal(chaveDaUltimaLeitura(linhaDoPainel), 'Mesa A')
  assert.equal(chaveDaUltimaLeitura({ last_read_by: null }), null)
})

test('painel: a chave de cada linha do registro sai de key.label', () => {
  const lidaPelaChave = { action: 'portfolio_read', actor: 'key', key: { id: 1, label: 'Mesa A' }, meta: { tool: 'get_client_portfolio', detail: 'resumo' }, at: '2026-10-07T12:24:10-03:00' }
  const doCliente = { action: 'consent_granted', actor: 'client', key: null, meta: {}, at: '2026-10-07T12:23:13-03:00' }
  assert.equal(chaveDoRegistro(lidaPelaChave), 'Mesa A')
  assert.equal(chaveDoRegistro(doCliente), null)
})

test('painel: vagas em uso vêm de max_clients − remaining_clients', () => {
  // dois clientes revogados: o servidor diz 50 livres de 50
  assert.equal(clientesOcupados({ max_clients: 50, remaining_clients: 50, clients: [linhaDoPainel, { ...linhaDoPainel, id: 'x' }] }), 0)
  assert.equal(clientesOcupados({ max_clients: 50, remaining_clients: 48, clients: [] }), 2)
  // servidor antigo sem remaining_clients: conta só pendente e ativo
  assert.equal(clientesOcupados({ clients: [linhaDoPainel, { ...linhaDoPainel, status: 'active' }, { ...linhaDoPainel, status: 'pending' }] }), 2)
})

test('registro: invite_canceled (grafia do servidor) tem rótulo', () => {
  assert.equal(clientActionLabel('invite_canceled'), 'Convite cancelado')
  assert.equal(clientActionLabel('unshared'), 'Deixou de ser compartilhado')
})

test('registro: um rótulo só por ação, o mesmo no painel e na página do cliente', () => {
  // A variante "de demonstração" dos rótulos saiu (decisão do dono, 07/10/2026):
  // a função não recebe mais modo, e a carteira não leva adjetivo.
  assert.equal(clientActionLabel.length, 1)
  assert.equal(clientActionLabel('connection_added'), 'Conexão criada')
  assert.equal(clientActionLabel('portfolio_read'), 'Carteira consultada')
  assert.equal(clientActionLabel('simulation_run'), 'Simulação de cenário sobre a carteira')
  // slug desconhecido passa como veio, em vez de sumir
  assert.equal(clientActionLabel('acao_nova'), 'acao_nova')
})
