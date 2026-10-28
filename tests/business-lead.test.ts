import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  EMAIL_RELACIONAMENTO,
  CONSENT_TEXT,
  CONSENT_VERSION,
  businessLeadDemoLigadoNoBuild,
  capturarAtribuicao,
  demoDeLeadDisponivel,
  destinoComAtribuicao,
  emailPessoal,
  envioAceito,
  eventoBusinessLead,
  falhaDoEnvio,
  mailtoDoPedido,
  montarPayload,
  temErro,
  validarLead,
  type ArmazemSessao,
  type LeadFormulario,
} from '../app/utils/business-lead.ts'

function memoria(): ArmazemSessao & { bruto(): string | null } {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => { m.set(k, v) },
    bruto: () => m.get('nu:business-atribuicao') ?? null,
  }
}

function valido(sobre: Partial<LeadFormulario> = {}): LeadFormulario {
  return {
    name: 'Ana Lima',
    email: 'ana@mesa.com.br',
    phone: '',
    company: 'Mesa Lima',
    firmType: 'multi_family_office',
    teamSize: '6_15',
    message: '',
    consent: true,
    website: '',
    ...sobre,
  }
}

test('first-touch não é coberto por um anúncio seguinte', () => {
  const store = memoria()
  capturarAtribuicao(store, { pathname: '/business', search: '?utm_source=linkedin&utm_medium=paid&li_fat_id=abc' }, 'https://www.linkedin.com/')
  capturarAtribuicao(store, { pathname: '/business/cadastro', search: '?utm_source=google&gclid=xyz' }, 'https://www.google.com/')
  const cru = JSON.parse(store.bruto()!)
  assert.equal(cru.utm_source, 'linkedin')
  assert.equal(cru.utm_medium, 'paid')
  assert.equal(cru.li_fat_id, 'abc')
  assert.equal(cru.gclid, null)
  assert.equal(cru.landing_page, '/business?utm_source=linkedin&utm_medium=paid&li_fat_id=abc')
  assert.equal(cru.referrer, 'https://www.linkedin.com/')
})

test('demo sai da landing e não vira campanha', () => {
  const store = memoria()
  capturarAtribuicao(store, { pathname: '/business', search: '?utm_source=linkedin&demo=1' }, '')
  const cru = JSON.parse(store.bruto()!)
  assert.equal(cru.landing_page, '/business?utm_source=linkedin')
  assert.equal(cru.utm_source, 'linkedin')
  assert.doesNotMatch(cru.landing_page, /demo/)
})

test('a landing não guarda demo nem token de convite', () => {
  const store = memoria()
  const token = 'a'.repeat(48)
  capturarAtribuicao(
    store,
    { pathname: `/business/convite/${token}`, search: `?utm_source=linkedin&demo=1` },
    `https://www.redentia.com.br/cliente/acesso/${token}`,
  )
  const cru = JSON.parse(store.bruto()!)
  assert.equal(cru.landing_page, '/business/convite/:token')
  assert.equal(cru.utm_source, 'linkedin')
  assert.equal(cru.referrer, null)
  assert.doesNotMatch(store.bruto()!, new RegExp(token))
})

test('Entrar leva só os identificadores de clique', () => {
  const store = memoria()
  const a = capturarAtribuicao(store, { pathname: '/business', search: '?utm_source=linkedin&utm_campaign=mfo&gclid=g1' }, 'https://www.linkedin.com/')
  const href = destinoComAtribuicao('/business/cadastro', a)
  assert.equal(href, '/business/cadastro?utm_source=linkedin&utm_campaign=mfo&gclid=g1')
  assert.equal(destinoComAtribuicao('/business/cadastro', null), '/business/cadastro')
})

test('e-mail pessoal avisa e não bloqueia; e-mail inválido bloqueia', () => {
  assert.equal(emailPessoal('Ana@Gmail.com'), true)
  assert.equal(emailPessoal('ana@hotmail.com.br'), true)
  assert.equal(emailPessoal('ana@mesa.com.br'), false)
  assert.equal(emailPessoal('ana@'), false)
  const pessoal = validarLead(valido({ email: 'ana@gmail.com' }))
  assert.equal(pessoal.email, undefined)
  assert.equal(temErro(pessoal), false)
  const ruim = validarLead(valido({ email: 'ana' }))
  assert.equal(ruim.email, 'Este e-mail não parece válido.')
})

test('consentimento desmarcado e telefone curto são erro; telefone vazio não é', () => {
  const sem = validarLead(valido({ consent: false, phone: '123' }))
  assert.ok(sem.consent)
  assert.ok(sem.phone)
  const ok = validarLead(valido({ phone: '(11) 98888-0000' }))
  assert.equal(temErro(ok), false)
})

test('o payload tem o contrato do POST, com consentimento e atribuição', () => {
  const a = capturarAtribuicao(memoria(), { pathname: '/business', search: '?utm_source=linkedin' }, '')
  const p = montarPayload(valido({ email: 'Ana@Mesa.com.br', phone: '  ', message: '  ' }), a)
  assert.equal(p.email, 'ana@mesa.com.br')
  assert.equal(p.phone, null)
  assert.equal(p.message, null)
  assert.equal(p.consent, true)
  assert.equal(p.consent_text, CONSENT_TEXT)
  assert.equal(p.consent_version, CONSENT_VERSION)
  assert.equal(p.firm_type, 'multi_family_office')
  assert.equal(p.team_size, '6_15')
  assert.equal(p.website, '')
  assert.equal(p.attribution.utm_source, 'linkedin')
  assert.equal(p.attribution.landing_page, '/business?utm_source=linkedin')
})

test('mailto de alternativa usa relacionamento@ e não contato@', () => {
  const href = mailtoDoPedido(valido({ firmType: 'family_office', teamSize: 'ate_5' }))
  assert.ok(href.startsWith(`mailto:${EMAIL_RELACIONAMENTO}?`))
  assert.equal(EMAIL_RELACIONAMENTO, 'relacionamento@redentia.com.br')
  assert.doesNotMatch(href, /contato@redentia\.com/)
  assert.match(decodeURIComponent(href), /Family office/)
  assert.match(decodeURIComponent(href), /Até 5/)
})

test('falha nunca é sucesso, e 2xx é a única aceitação', () => {
  assert.equal(envioAceito(200), true)
  assert.equal(envioAceito(201), true)
  assert.equal(envioAceito(199), false)
  assert.equal(envioAceito(302), false)
  assert.equal(envioAceito(422), false)
  assert.equal(envioAceito(500), false)
  assert.match(falhaDoEnvio(500).antes, /Nada foi enviado/)
  assert.match(falhaDoEnvio(429).antes, /Muitas tentativas/)
  assert.doesNotMatch(falhaDoEnvio(500).antes + falhaDoEnvio(500).depois, /enviado com sucesso|Pedido recebido/i)
})

test('o evento GA4 leva tipo de casa e utm_source', () => {
  assert.deepEqual(eventoBusinessLead('gestora', 'linkedin'), { tipo_casa: 'gestora', utm_source: 'linkedin' })
  assert.equal(eventoBusinessLead('outro', null).utm_source, '(none)')
  assert.equal(eventoBusinessLead('outro', '  ').utm_source, '(none)')
})

test('produção não liga a prévia, mesmo com a env pública', () => {
  assert.equal(businessLeadDemoLigadoNoBuild({ VERCEL_ENV: 'production', NODE_ENV: 'production', NUXT_PUBLIC_BUSINESS_LEAD_DEMO: 'true' }), false)
  assert.equal(businessLeadDemoLigadoNoBuild({ VERCEL_ENV: 'preview', NODE_ENV: 'production' }), true)
  assert.equal(businessLeadDemoLigadoNoBuild({ NODE_ENV: 'development' }), true)
  assert.equal(businessLeadDemoLigadoNoBuild({ NODE_ENV: 'production' }), false)
  assert.equal(businessLeadDemoLigadoNoBuild({ NODE_ENV: 'production', NUXT_PUBLIC_BUSINESS_LEAD_DEMO: 'true' }), true)
  assert.equal(demoDeLeadDisponivel(), false)
  const src = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  assert.match(src, /businessLeadDemoLigadoNoBuild/)
  assert.match(src, /__REDENTIA_BUSINESS_LEAD_DEMO__/)
})

test('o formulário posta no endpoint novo e o sucesso não mora no catch', () => {
  const vue = readFileSync(new URL('../app/components/business/RbContato.vue', import.meta.url), 'utf8')
  assert.match(vue, /publicFetch\('\/business\/leads'/)
  assert.match(vue, /relacionamento@redentia.com.br/)
  assert.doesNotMatch(vue, /contato@redentia\.com/)
  assert.match(vue, /business_lead/)
  assert.match(vue, /CONSENT_BEFORE/)
  assert.match(vue, /CONSENT_LINK_LABEL/)
  assert.match(vue, /institucional\/privacy/)
  const catchIdx = vue.indexOf('catch (e)')
  assert.ok(catchIdx > 0)
  assert.doesNotMatch(vue.slice(catchIdx), /estado\.value = 'ok'/)
})
