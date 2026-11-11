/**
 * O plano único (31/10/2026): o estado que o /me/entitlements descreve, quem
 * passa pelo gate, os erros de "assinatura necessária" e o controle do
 * useAssinatura (carregar, começar o teste, portal, esperar o webhook e o gate
 * da conversa). O controle é testado com caixas simples no lugar do useState e
 * fetchers falsos no lugar do $fetch.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TEXTO_ACEITE_WHATSAPP, ehEmailRelayDaApple, emailValido, oQueFaltaNoTitular, cpfValido, formatarCelular, formatarCpf, normalizarCelular } from '../app/utils/assinatura.ts'
import {
  CORPO_CHECKOUT,
  DESTINO_DEPOIS_DO_LOGIN,
  ERRO_CHECKOUT,
  ERRO_PLANO,
  ERRO_PORTAL,
  cancelouNoCheckout,
  cobrancaDesligada,
  criarControleAssinatura,
  dataDaPrimeiraCobranca,
  dataPorExtenso,
  ehAssinaturaNecessaria,
  erroDeAssinatura,
  estadoDaAssinatura,
  jaAssinouAntes,
  resumoDaAssinatura,
  temAcesso,
  urlSegura,
  voltouDoCheckout,
  type DepsDoControle,
} from '../app/utils/assinatura.ts'

type Ent = Parameters<typeof estadoDaAssinatura>[0]

const sub = (status: string, extra: Record<string, unknown> = {}) => ({
  status, billing_cycle: 'monthly', trial_ends_at: '2026-11-03T13:00:00Z', current_period_end: '2026-12-03T13:00:00Z', ...extra,
})
const ent = (has: boolean, status: string | null, extra: Record<string, unknown> = {}): NonNullable<Ent> => ({
  tenant: { slug: 'redentia', billing_enabled: true },
  plan: has ? { slug: 'redentia', name: 'Redentia' } : null,
  subscription: status ? sub(status, extra) : null,
  has_active_subscription: has,
})

test('estado: teste, ativa, carência, pendente, sem e desconhecido', () => {
  assert.equal(estadoDaAssinatura(ent(true, 'trialing')), 'teste')
  assert.equal(estadoDaAssinatura(ent(true, 'active')), 'ativa')
  assert.equal(estadoDaAssinatura(ent(true, 'past_due')), 'atrasada')
  assert.equal(estadoDaAssinatura(ent(false, 'past_due')), 'pendente')
  assert.equal(estadoDaAssinatura(ent(false, 'unpaid')), 'pendente')
  assert.equal(estadoDaAssinatura(ent(false, 'canceled')), 'sem')
  assert.equal(estadoDaAssinatura(ent(false, null)), 'sem')
  assert.equal(estadoDaAssinatura(null), 'desconhecido')
  // tenant sem cobrança: o snapshot dá unlimited e libera tudo
  assert.equal(estadoDaAssinatura({ plan: { slug: 'unlimited', name: 'Acesso completo' }, subscription: null, has_active_subscription: true }), 'ativa')
})

test('gate: só "sem" e "pendente" ficam de fora; snapshot fora do ar entra (fail-open)', () => {
  assert.equal(temAcesso('sem'), false)
  assert.equal(temAcesso('pendente'), false)
  for (const e of ['teste', 'ativa', 'atrasada', 'desconhecido'] as const) assert.equal(temAcesso(e), true, e)
})

test('402 é sempre assinatura; 403 só com o código; 401 nunca', () => {
  assert.equal(ehAssinaturaNecessaria(402, null), true)
  // o gate do servidor: 402 { code, feature, plan_slug }
  assert.equal(ehAssinaturaNecessaria(402, { code: 'assinatura_necessaria', feature: 'carteira', plan_slug: 'redentia' }), true)
  assert.equal(ehAssinaturaNecessaria(403, { code: 'assinatura_necessaria' }), true)
  assert.equal(ehAssinaturaNecessaria(403, { message: 'Forbidden' }), false)
  assert.equal(ehAssinaturaNecessaria(401, { code: 'assinatura_necessaria' }), false)
  assert.equal(ehAssinaturaNecessaria(500, { code: 'assinatura_necessaria' }), false)
  // o FetchError do $fetch traz statusCode + data
  assert.equal(erroDeAssinatura({ statusCode: 403, data: { code: 'assinatura_necessaria' } }), true)
  assert.equal(erroDeAssinatura({ response: { status: 402, _data: null } }), true)
  assert.equal(erroDeAssinatura({ statusCode: 403, data: {} }), false)
})

test('o corpo do checkout é o plano único, mensal, com o teste', () => {
  assert.deepEqual({ ...CORPO_CHECKOUT }, { plan_slug: 'redentia', cycle: 'monthly', with_trial: true })
})

test('datas por extenso no fuso de São Paulo, e a 1ª cobrança é hoje + 3 dias', () => {
  assert.equal(dataPorExtenso('2026-11-03T13:00:00Z'), '3 de novembro')
  // 01h UTC do dia 4 ainda é dia 3 em São Paulo
  assert.equal(dataPorExtenso('2026-11-04T01:00:00Z'), '3 de novembro')
  assert.equal(dataPorExtenso('não é data'), null)
  assert.equal(dataPorExtenso(null), null)
  assert.equal(dataDaPrimeiraCobranca(new Date('2026-10-31T15:00:00Z')), '3 de novembro')
  assert.equal(dataDaPrimeiraCobranca(new Date('2026-12-30T15:00:00Z')), '2 de janeiro')
})

test('resumo da /conta diz a data que importa em cada estado', () => {
  assert.match(resumoDaAssinatura(ent(true, 'trialing')).linha, /Grátis até 3 de novembro\. A primeira cobrança, de R\$ 19,99, é nesse dia\./)
  assert.match(resumoDaAssinatura(ent(true, 'active')).linha, /Próxima cobrança em 3 de dezembro/)
  assert.match(resumoDaAssinatura(ent(true, 'active', { cancel_at_period_end: true })).linha, /acesso vai até 3 de dezembro/)
  assert.match(resumoDaAssinatura(ent(true, 'trialing', { cancel_at_period_end: true })).linha, /Nada será cobrado/)
  assert.equal(resumoDaAssinatura(ent(false, 'past_due')).tom, 'ambar')
  assert.equal(resumoDaAssinatura(ent(false, null)).gerenciavel, false)
  assert.equal(resumoDaAssinatura(ent(true, 'active')).gerenciavel, true)
  const livre = { tenant: { slug: 'redentia', billing_enabled: false }, plan: { slug: 'unlimited', name: 'x' }, subscription: null, has_active_subscription: true }
  assert.equal(cobrancaDesligada(livre), true)
  assert.equal(resumoDaAssinatura(livre).gerenciavel, false)
})

test('volta do Checkout: aceita o session_id colado pela Stripe; cancelado=1', () => {
  assert.equal(voltouDoCheckout({ assinatura: 'ok' }), true)
  assert.equal(voltouDoCheckout({ assinatura: 'ok?session_id=cs_test_123' }), true)
  assert.equal(voltouDoCheckout({ assinatura: ['ok'] }), true)
  assert.equal(voltouDoCheckout({ assinatura: 'okay' }), false)
  assert.equal(voltouDoCheckout({}), false)
  assert.equal(cancelouNoCheckout({ cancelado: '1' }), true)
  assert.equal(cancelouNoCheckout({ cancelado: '0' }), false)
})

test('o teste de 3 dias é só da primeira assinatura: quem já assinou não lê a promessa', () => {
  assert.equal(jaAssinouAntes(ent(false, 'canceled')), true)
  assert.equal(jaAssinouAntes(ent(false, 'incomplete_expired')), true)
  assert.equal(jaAssinouAntes(ent(false, null)), false)
  assert.equal(jaAssinouAntes(null), false, 'deslogado: vale a promessa gentil')
  assert.equal(jaAssinouAntes(ent(false, 'past_due')), false)
  assert.equal(jaAssinouAntes(ent(true, 'active')), false)
  assert.doesNotMatch(resumoDaAssinatura(ent(false, 'canceled')).linha, /grátis/)
  assert.match(resumoDaAssinatura(ent(false, null)).linha, /3 dias grátis na primeira assinatura/)
})

test('só segue para URL https', () => {
  assert.equal(urlSegura('https://checkout.stripe.com/c/pay/cs_test_1'), 'https://checkout.stripe.com/c/pay/cs_test_1')
  assert.equal(urlSegura('javascript:alert(1)'), null)
  assert.equal(urlSegura('http://checkout.stripe.com'), null)
  assert.equal(urlSegura('/carteira'), null)
  assert.equal(urlSegura(undefined), null)
})

/* ————— o controle ————— */

function montar(o: Partial<Omit<DepsDoControle, 'estado'>> & { ent?: Ent; carregado?: boolean; logado?: boolean } = {}) {
  const caixa = <T>(value: T) => ({ value })
  const estado = {
    ent: caixa<Ent>(o.ent ?? null),
    carregado: caixa(o.carregado ?? false),
    gate: caixa<'chat' | 'carteira' | null>(null),
    abrindo: caixa(false),
    erro: caixa<string | null>(null),
    abrindoPortal: caixa(false),
    erroPortal: caixa<string | null>(null),
  }
  const chamadas = { ent: 0, checkout: 0, portal: 0, idas: [] as string[], navegacoes: [] as string[], esperas: [] as number[], eventos: [] as { evento: string; params: Record<string, unknown> }[] }
  const controle = criarControleAssinatura({
    estado,
    logado: () => o.logado ?? true,
    buscarEntitlements: o.buscarEntitlements ?? (async () => { chamadas.ent++; return ent(false, null) }),
    postCheckout: o.postCheckout ?? (async () => { chamadas.checkout++; return { checkout_url: 'https://checkout.stripe.com/c/pay/cs_test_1' } }),
    postPortal: o.postPortal ?? (async () => { chamadas.portal++; return { portal_url: 'https://billing.stripe.com/p/session/test_1' } }),
    irPara: (url) => { chamadas.idas.push(url) },
    medir: (evento, params) => { chamadas.eventos.push({ evento, params }) },
    navegar: (c) => { chamadas.navegacoes.push(c) },
    esperar: async (ms) => { chamadas.esperas.push(ms) },
  })
  return { estado, chamadas, controle }
}

test('começar deslogado vai ao login e volta ao /assinar com ?continuar=1', async () => {
  const { controle, chamadas } = montar({ logado: false })
  await controle.comecar()
  assert.deepEqual(chamadas.navegacoes, [`/login?redirect=${encodeURIComponent(DESTINO_DEPOIS_DO_LOGIN)}`])
  assert.equal(chamadas.checkout, 0)
})

test('começar logado sem assinatura abre o Checkout e trava o botão', async () => {
  const { controle, chamadas, estado } = montar({ ent: ent(false, null), carregado: true })
  await controle.comecar()
  assert.deepEqual(chamadas.idas, ['https://checkout.stripe.com/c/pay/cs_test_1'])
  assert.equal(estado.abrindo.value, true) // fica "abrindo" até a página sair
  await controle.comecar() // clique duplo não abre outro
  assert.equal(chamadas.checkout, 1)
})

test('quem já assina vai para a carteira; quem tem cobrança pendente vai ao portal', async () => {
  const a = montar({ ent: ent(true, 'trialing'), carregado: true })
  await a.controle.comecar()
  assert.deepEqual(a.chamadas.navegacoes, ['/carteira'])
  assert.equal(a.chamadas.checkout, 0)

  const p = montar({ ent: ent(false, 'past_due'), carregado: true })
  await p.controle.comecar()
  assert.equal(p.chamadas.checkout, 0, 'não abre uma 2ª assinatura')
  assert.deepEqual(p.chamadas.idas, ['https://billing.stripe.com/p/session/test_1'])
})

test('checkout que falha: erro inline e o botão volta; 401 manda ao login', async () => {
  const f = montar({ postCheckout: async () => { throw Object.assign(new Error('x'), { statusCode: 500 }) } })
  await f.controle.comecar()
  assert.equal(f.estado.erro.value, ERRO_CHECKOUT)
  assert.equal(f.estado.abrindo.value, false)

  const sem = montar({ postCheckout: async () => ({ checkout_url: 'javascript:alert(1)' }) })
  await sem.controle.comecar()
  assert.equal(sem.estado.erro.value, ERRO_CHECKOUT)
  assert.deepEqual(sem.chamadas.idas, [])

  const morto = montar({ postCheckout: async () => { throw Object.assign(new Error('x'), { statusCode: 401 }) } })
  await morto.controle.comecar()
  assert.equal(morto.estado.erro.value, null)
  assert.match(morto.chamadas.navegacoes[0]!, /^\/login\?redirect=/)
})

test('recusas do checkout: 409 vai à carteira; 422 de plano vira frase própria', async () => {
  const ativa = montar({ postCheckout: async () => { throw Object.assign(new Error('x'), { statusCode: 409, data: { code: 'assinatura_ativa' } }) } })
  await ativa.controle.comecar()
  assert.deepEqual(ativa.chamadas.navegacoes, ['/carteira'])
  assert.equal(ativa.estado.erro.value, null)

  for (const code of ['plano_inativo', 'ciclo_indisponivel']) {
    const f = montar({ postCheckout: async () => { throw Object.assign(new Error('x'), { statusCode: 422, data: { code } }) } })
    await f.controle.comecar()
    assert.equal(f.estado.erro.value, ERRO_PLANO, code)
    assert.equal(f.estado.abrindo.value, false)
  }
})

test('portal: abre a URL da Stripe; falha vira frase', async () => {
  const ok = montar()
  await ok.controle.gerenciar()
  assert.deepEqual(ok.chamadas.idas, ['https://billing.stripe.com/p/session/test_1'])
  const ruim = montar({ postPortal: async () => { throw new Error('x') } })
  await ruim.controle.gerenciar()
  assert.equal(ruim.estado.erroPortal.value, ERRO_PORTAL)
  assert.equal(ruim.estado.abrindoPortal.value, false)
})

test('carregar: uma chamada só por vez e por página; falha vira "desconhecido"', async () => {
  const { controle, chamadas, estado } = montar()
  await Promise.all([controle.carregar(), controle.carregar()])
  await controle.carregar()
  assert.equal(chamadas.ent, 1)
  assert.equal(estado.carregado.value, true)

  const ruim = montar({ buscarEntitlements: async () => { throw new Error('rede') } })
  assert.equal(await ruim.controle.carregar(), null)
  assert.equal(estadoDaAssinatura(ruim.estado.ent.value), 'desconhecido')
})

test('volta do Checkout: relê até o webhook liberar', async () => {
  let n = 0
  const { controle, chamadas } = montar({
    buscarEntitlements: async () => (++n < 3 ? ent(false, null) : ent(true, 'trialing')),
  })
  assert.equal(await controle.aguardarConfirmacao(10, 2000), true)
  assert.equal(n, 3)
  assert.deepEqual(chamadas.esperas, [2000, 2000])
})

test('volta do Checkout: desiste depois das tentativas sem apagar o que já sabia', async () => {
  const { controle, chamadas } = montar({ buscarEntitlements: async () => ent(false, null) })
  assert.equal(await controle.aguardarConfirmacao(4, 500), false)
  assert.equal(chamadas.esperas.length, 3)
})

test('gate da conversa: quem não assina vê a folha; assinante e deslogado seguem', async () => {
  const sem = montar({ buscarEntitlements: async () => ent(false, null) })
  assert.equal(await sem.controle.garantirAcesso('chat'), false)
  assert.equal(sem.estado.gate.value, 'chat')

  const assina = montar({ buscarEntitlements: async () => ent(true, 'active') })
  assert.equal(await assina.controle.garantirAcesso('chat'), true)
  assert.equal(assina.estado.gate.value, null)

  const fora = montar({ logado: false })
  assert.equal(await fora.controle.garantirAcesso('chat'), true)

  const caiu = montar({ buscarEntitlements: async () => { throw new Error('rede') } })
  assert.equal(await caiu.controle.garantirAcesso('chat'), true, 'snapshot fora do ar não tranca quem paga')
})

test('recusa do servidor marca "sem" e abre a folha só com origem', () => {
  const a = montar({ ent: ent(true, 'active'), carregado: true })
  a.controle.recusado(null)
  assert.equal(estadoDaAssinatura(a.estado.ent.value), 'sem')
  assert.equal(a.estado.gate.value, null)
  a.controle.recusado('chat')
  assert.equal(a.estado.gate.value, 'chat')

  const p = montar({ ent: ent(false, 'past_due'), carregado: true })
  p.controle.recusado(null)
  assert.equal(estadoDaAssinatura(p.estado.ent.value), 'pendente', 'cobrança pendente continua pendente')
})

/* ————— as pontas que ligam o gate ————— */

const ler = (f: string) => readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8')

test('o authFetch não derruba a sessão num 402/403 de assinatura', () => {
  const src = ler('composables/useApi.ts')
  const i = src.indexOf('ehAssinaturaNecessaria(response.status, response._data)')
  assert.ok(i > 0)
  assert.ok(i < src.indexOf('clearSession()'), 'o teste de assinatura vem antes de limpar a sessão')
})

test('a conversa pergunta antes de gastar IA e trata a recusa do servidor', () => {
  const src = ler('composables/useNuChat.ts')
  const send = src.slice(src.indexOf('async function send('))
  assert.ok(send.indexOf("garantirAcesso('chat')") < send.indexOf('messages.value.push'))
  assert.match(send, /ehAssinaturaNecessaria\(res\.status, payload\)/)
  // o gate da conversa abre o quiz, montado uma vez no layout (02/11/2026)
  assert.match(ler('layouts/default.vue'), /<AssinaturaQuiz \/>/)
  assert.doesNotMatch(ler('components/assinatura/AssinaturaVitrine.vue'), /<AssinaturaQuiz/)
  assert.match(ler('components/chat/ChatPainel.vue'), /if \(g !== 'chat'\) return\n\s+assinatura\.fecharGate\(\)\n\s+quiz\.abrir\('chat'\)/)
})

test('a /carteira não busca a carteira de quem não assina', () => {
  const src = ler('pages/carteira.vue')
  assert.match(src, /useCarteira\(\{ immediate: assinatura\.assinante\.value \}\)/)
  assert.ok(src.indexOf('useAssinaturaDaPagina()') < src.indexOf('useCarteira('))
  assert.match(ler('composables/useCarteira.ts'), /erroDeAssinatura\(portfolioR\.reason\)\) return \{ \.\.\.emptyPayload\(false\), semAssinatura: true \}/)
})

test('conexão nova de Open Finance na /conta pede assinatura antes do widget', () => {
  const src = ler('components/conta/ContaOpenFinance.vue')
  const fluxo = src.slice(src.indexOf('async function openConnectFlow()'))
  assert.ok(fluxo.indexOf("navigateTo('/assinar')") < fluxo.indexOf('openWidget('))
})

/* ————— os dados do titular (01/11/2026) ————— */

test('CPF: dígitos verificadores, máscara e os repetidos', () => {
  assert.equal(cpfValido('529.982.247-25'), true)
  assert.equal(cpfValido('52998224725'), true)
  assert.equal(cpfValido('529.982.247-24'), false)
  assert.equal(cpfValido('111.111.111-11'), false)
  assert.equal(cpfValido('123'), false)
  assert.equal(formatarCpf('52998224725'), '529.982.247-25')
  assert.equal(formatarCpf('5299'), '529.9')
})

test('celular: só brasileiro com 9, com ou sem o 55', () => {
  assert.equal(normalizarCelular('(11) 98765-4321'), '5511987654321')
  assert.equal(normalizarCelular('+55 11 98765-4321'), '5511987654321')
  assert.equal(normalizarCelular('(11) 3765-4321'), null)
  assert.equal(normalizarCelular('987654321'), null)
  assert.equal(formatarCelular('11987654321'), '(11) 98765-4321')
  assert.equal(formatarCelular('5511987654321'), '(11) 98765-4321')
})

test('o checkout leva os dados e devolve "dados" quando falta o CPF', async () => {
  let corpo: unknown = null
  const f = montar({ postCheckout: async (d?: unknown) => { corpo = d; throw Object.assign(new Error('x'), { statusCode: 422, data: { code: 'cpf_necessario' } }) } })
  const r = await f.controle.comecar({ cpf: '52998224725', celular: '5511987654321', whatsapp_opt_in: true })
  assert.equal(r, 'dados')
  assert.deepEqual(corpo, { cpf: '52998224725', celular: '5511987654321', whatsapp_opt_in: true })
  assert.equal(f.estado.erro.value, null)
})

test('celular inválido ou de outra conta volta aos dados com o aviso', async () => {
  for (const code of ['celular_invalido', 'celular_em_uso']) {
    const f = montar({ postCheckout: async () => { throw Object.assign(new Error('x'), { statusCode: 422, data: { code } }) } })
    assert.equal(await f.controle.comecar({ cpf: '52998224725', celular: '5511987654321' }), 'dados')
    assert.match(f.estado.erro.value ?? '', /celular/i)
  }
})

test('o begin_checkout sai antes da Stripe, só com o plano', async () => {
  const { controle, chamadas } = montar({ carregado: true, ent: ent(false, null) })
  await controle.comecar({ cpf: '52998224725', celular: '5511987654321', whatsapp_opt_in: true })
  assert.equal(chamadas.idas.length, 1)
  assert.equal(chamadas.eventos.length, 1)
  const [{ evento, params }] = chamadas.eventos
  assert.equal(evento, 'begin_checkout')
  assert.equal(params.currency, 'BRL')
  assert.equal(params.value, 19.99)
  // nada do titular no evento
  assert.doesNotMatch(JSON.stringify(params), /52998224725|987654321/)
})

test('checkout que falha não mede begin_checkout', async () => {
  const { controle, chamadas } = montar({ carregado: true, ent: ent(false, null), postCheckout: async () => { throw Object.assign(new Error('x'), { statusCode: 500 }) } })
  await controle.comecar()
  assert.equal(chamadas.eventos.length, 0)
})

test('o aceite do WhatsApp é o texto registrado no Backend, numa caixa desmarcada', () => {
  // mesmo texto de App\\Services\\WhatsAppConsent::TEXTO (versão whatsapp-2026-11-01)
  assert.equal(TEXTO_ACEITE_WHATSAPP, 'Quero receber a Aportou no WhatsApp. Para parar, é só responder SAIR.')
  const quiz = readFileSync(new URL('../app/components/assinatura/AssinaturaQuiz.vue', import.meta.url), 'utf8')
  assert.match(quiz, /const aceiteWhatsapp = ref\(false\)/)
  assert.match(quiz, /whatsapp_opt_in: aceiteWhatsapp\.value/)
  assert.doesNotMatch(quiz, /whatsapp_opt_in: true/)
})

// os precisa_* ficam na raiz do /me/entitlements (o ent() põe o extra na assinatura)
test('o que falta no titular: e-mail real, celular e CPF (regra do dono, 02/11/2026)', () => {
  // o Backend manda os três
  assert.deepEqual(oQueFaltaNoTitular(({ ...ent(false, null), ...{ precisa_cpf: true, precisa_email: false, precisa_celular: true } }), 'ana@exemplo.com'), { cpf: true, email: false, celular: true, relay: false })
  // cadastro só por celular: pede e-mail e CPF
  assert.deepEqual(oQueFaltaNoTitular(({ ...ent(false, null), ...{ precisa_cpf: true, precisa_email: true, precisa_celular: false } }), null), { cpf: true, email: true, celular: false, relay: false })
  // Backend antigo, sem precisa_email/precisa_celular: o relay da Apple e a conta sem e-mail pedem e-mail; o celular é pedido
  const velho = ({ ...ent(false, null), ...{ precisa_cpf: true } })
  assert.deepEqual(oQueFaltaNoTitular(velho, 'x1y2@privaterelay.appleid.com'), { cpf: true, email: true, celular: true, relay: true })
  assert.equal(oQueFaltaNoTitular(velho, '').email, true)
  assert.equal(oQueFaltaNoTitular(velho, 'ana@exemplo.com').email, false)
  // tudo na conta: nada a pedir
  const tudo = oQueFaltaNoTitular(({ ...ent(false, null), ...{ precisa_cpf: false, precisa_email: false, precisa_celular: false } }), 'ana@exemplo.com')
  assert.equal(tudo.cpf || tudo.email || tudo.celular, false)
  assert.equal(ehEmailRelayDaApple('ABC@PrivateRelay.AppleID.com'), true)
  assert.equal(emailValido('ana@exemplo.com'), true)
  assert.equal(emailValido('ana@exemplo'), false)
})

for (const [code, volta] of [['email_necessario', 'dados'], ['email_invalido', 'dados'], ['email_em_uso', 'dados'], ['celular_necessario', 'dados']] as const) {
  test(`checkout ${code} volta aos dados com o aviso`, async () => {
    const { controle, estado } = montar({ carregado: true, ent: ent(false, null), postCheckout: async () => { throw Object.assign(new Error('x'), { statusCode: 422, data: { code } }) } })
    assert.equal(await controle.comecar({ cpf: '52998224725' }), volta)
    assert.ok(estado.erro.value && estado.erro.value.length > 10)
  })
}
