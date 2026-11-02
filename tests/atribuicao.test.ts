/**
 * Atribuição de primeira página (sessionStorage, sem cookie) e o header
 * X-Redentia-Attribution nos pedidos que criam conta. O evento de GA4 sai
 * só pelo gtag que já existe depois do aceite.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  CHAVE_ATRIBUICAO_ENTRADA,
  HEADER_ATRIBUICAO,
  MAX_BYTES_ATRIBUICAO,
  atribuicaoValida,
  cabecalhosAtribuicaoDaSessao,
  cabecalhosDeAtribuicao,
  caminhoCriaConta,
  capturarAtribuicaoDeSessao,
  dispararEventoAuth,
  hostDoReferrerExterno,
  jsonDaAtribuicao,
  jsonLimitado,
  montarAtribuicaoDeEntrada,
  nomeEventoAuth,
  validarCaminhoDeEntrada,
  validarHostDeReferrer,
  validarUtm,
  type ArmazemAtribuicao,
  type LocalDeEntrada,
} from '../app/utils/atribuicao.ts'

function memoria(): ArmazemAtribuicao & { bruto(): string | null } {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => { m.set(k, v) },
    bruto: () => m.get(CHAVE_ATRIBUICAO_ENTRADA) ?? null,
  }
}

function local(sobre: Partial<LocalDeEntrada> = {}): LocalDeEntrada {
  return {
    pathname: '/preco-teto',
    search: '',
    hostname: 'www.redentia.com.br',
    ...sobre,
  }
}

function ler(caminho: string): string {
  return readFileSync(new URL(caminho, import.meta.url), 'utf8')
}

function arquivosDoApp(dir: string): string[] {
  const out: string[] = []
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome)
    if (statSync(p).isDirectory()) out.push(...arquivosDoApp(p))
    else if (/\.(vue|ts)$/.test(nome)) out.push(p)
  }
  return out
}

test('o caminho de entrada aceita segmentos seguros e recusa o resto', () => {
  assert.equal(validarCaminhoDeEntrada('/'), '/')
  assert.equal(validarCaminhoDeEntrada('/asset/PETR4'), '/asset/PETR4')
  assert.equal(validarCaminhoDeEntrada('/setor/bancos'), '/setor/bancos')
  assert.equal(validarCaminhoDeEntrada('/a%C3%A7%C3%A3o'), '/a%C3%A7%C3%A3o')
  assert.equal(validarCaminhoDeEntrada('/foo%2Fbar'), '/foo%2Fbar')
  assert.equal(validarCaminhoDeEntrada(`/${'a'.repeat(254)}`), `/${'a'.repeat(254)}`)

  assert.equal(validarCaminhoDeEntrada(''), null)
  assert.equal(validarCaminhoDeEntrada('asset/PETR4'), null)
  assert.equal(validarCaminhoDeEntrada('//asset/PETR4'), null)
  assert.equal(validarCaminhoDeEntrada('/asset//PETR4'), null)
  assert.equal(validarCaminhoDeEntrada('/asset/PETR4/'), null)
  assert.equal(validarCaminhoDeEntrada('/asset/PETR4?utm_source=google'), null)
  assert.equal(validarCaminhoDeEntrada('/asset/PETR4#topo'), null)
  assert.equal(validarCaminhoDeEntrada('/ação'), null)
  assert.equal(validarCaminhoDeEntrada('/foo bar'), null)
  assert.equal(validarCaminhoDeEntrada('/a%2'), null)
  assert.equal(validarCaminhoDeEntrada('/a%zz'), null)
  assert.equal(validarCaminhoDeEntrada(`/${'a'.repeat(255)}`), null)
})

test('utm começa em alfanumérico, cabe em 100 e não leva e-mail', () => {
  assert.equal(validarUtm('g'), 'g')
  assert.equal(validarUtm('Google Ads'), 'Google Ads')
  assert.equal(validarUtm('a b_c+d~e-f.g'), 'a b_c+d~e-f.g')
  assert.equal(validarUtm('a'.repeat(100)), 'a'.repeat(100))

  assert.equal(validarUtm(''), null)
  assert.equal(validarUtm(' google'), null)
  assert.equal(validarUtm('_pago'), null)
  assert.equal(validarUtm('+pago'), null)
  assert.equal(validarUtm('.pago'), null)
  assert.equal(validarUtm('-pago'), null)
  assert.equal(validarUtm('ana@mesa.com'), null)
  assert.equal(validarUtm('promoção'), null)
  assert.equal(validarUtm('a\nb'), null)
  assert.equal(validarUtm('a'.repeat(101)), null)
})

test('o host do referrer é minúsculo, DNS e de no máximo 253', () => {
  assert.equal(validarHostDeReferrer('News.Google.com'), 'news.google.com')
  assert.equal(validarHostDeReferrer('localhost'), 'localhost')
  assert.equal(validarHostDeReferrer(`${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`), `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`)

  assert.equal(validarHostDeReferrer(''), null)
  assert.equal(validarHostDeReferrer('-bad.com'), null)
  assert.equal(validarHostDeReferrer('bad-.com'), null)
  assert.equal(validarHostDeReferrer('bad_host.com'), null)
  assert.equal(validarHostDeReferrer('um..dois.com'), null)
  assert.equal(validarHostDeReferrer('.exemplo.com'), null)
  assert.equal(validarHostDeReferrer('exemplo.com.'), null)
  assert.equal(validarHostDeReferrer(`${'a'.repeat(64)}.com`), null)
  assert.equal(validarHostDeReferrer(`${'a'.repeat(250)}.com`), null)
})

test('referrer externo vira só o hostname; o mesmo site e o segredo ficam de fora', () => {
  assert.equal(hostDoReferrerExterno('', 'www.redentia.com.br'), null)
  assert.equal(hostDoReferrerExterno('https://WWW.Redentia.com.br/asset/PETR4?x=1', 'www.redentia.com.br'), null)
  assert.equal(hostDoReferrerExterno('https://www.redentia.com.br:443/login', 'www.redentia.com.br'), null)
  assert.equal(hostDoReferrerExterno('https://blog.redentia.com.br/post', 'www.redentia.com.br'), 'blog.redentia.com.br')
  assert.equal(hostDoReferrerExterno('javascript:alert(1)', 'www.redentia.com.br'), null)
  assert.equal(hostDoReferrerExterno('http://[::1]/', 'www.redentia.com.br'), null)

  const token = 'b'.repeat(48)
  const host = hostDoReferrerExterno(`https://User:Secret@News.Example.com:8443/privada/${token}?email=a@b.com`, 'www.redentia.com.br')
  assert.equal(host, 'news.example.com')
})

test('a primeira página grava e a seguinte não cobre', () => {
  const store = memoria()
  const token = 'c'.repeat(48)
  capturarAtribuicaoDeSessao(
    store,
    local({
      pathname: `/cliente/convite/${token}`,
      search: '?utm_source=linkedin&utm_medium=paid%20social&utm_campaign=mesa&utm_content=a&utm_term=preco&email=ana@mesa.com',
    }),
    `https://www.linkedin.com/feed/${token}`,
  )
  capturarAtribuicaoDeSessao(
    store,
    local({ pathname: '/login', search: '?utm_source=google&utm_medium=cpc' }),
    'https://www.google.com/search?q=redentia',
  )

  const cru = JSON.parse(store.bruto()!)
  assert.equal(cru.entry_path, undefined)
  assert.equal(cru.utm_source, 'linkedin')
  assert.equal(cru.utm_medium, 'paid social')
  assert.equal(cru.utm_campaign, 'mesa')
  assert.equal(cru.utm_content, 'a')
  assert.equal(cru.utm_term, 'preco')
  assert.equal(cru.referrer_host, 'www.linkedin.com')
  assert.equal(cru.email, undefined)
  assert.doesNotMatch(store.bruto()!, new RegExp(token))
  assert.doesNotMatch(store.bruto()!, /ana@mesa/)
})

test('página sem origem válida grava vazio e não é coberta depois', () => {
  const store = memoria()
  capturarAtribuicaoDeSessao(store, local({ pathname: '/', search: '?utm_source=a@b.com' }), 'https://www.redentia.com.br/login')
  capturarAtribuicaoDeSessao(store, local({ pathname: '/login', search: '?utm_source=google' }), 'https://news.example.com/a')
  assert.equal(store.bruto(), '{"entry_path":"/"}')
  assert.deepEqual(cabecalhosDeAtribuicao(store), {
    [HEADER_ATRIBUICAO]: '{"entry_path":"/"}',
  })
})

test('o header omite campo inválido, não leva dado pessoal e cabe em 2048 bytes', () => {
  const store = memoria()
  store.setItem(CHAVE_ATRIBUICAO_ENTRADA, JSON.stringify({
    entry_path: '/preco-teto',
    utm_source: 'google',
    utm_medium: 'ana@mesa.com',
    email: 'ana@mesa.com',
    gclid: 'click-secreto',
    referrer_host: 'HTTPS://News.Example.com/nao-e-host',
    referrer: 'https://news.example.com/user/segredo',
  }))
  const headers = cabecalhosDeAtribuicao(store)
  const json = headers[HEADER_ATRIBUICAO]
  assert.ok(json)
  assert.equal(new TextEncoder().encode(json).length <= MAX_BYTES_ATRIBUICAO, true)
  assert.doesNotMatch(json, /\n/)
  assert.deepEqual(JSON.parse(json), { entry_path: '/preco-teto', utm_source: 'google' })
  assert.equal(jsonDaAtribuicao({}), null)
  assert.deepEqual(cabecalhosDeAtribuicao(memoria()), {})
})

test('storage adulterado com token de convite não entra no header', () => {
  const store = memoria()
  const token = 'd'.repeat(48)
  store.setItem(CHAVE_ATRIBUICAO_ENTRADA, JSON.stringify({
    entry_path: `/cliente/acesso/${token}`,
    utm_source: 'google',
  }))
  const json = cabecalhosDeAtribuicao(store)[HEADER_ATRIBUICAO]
  assert.ok(json)
  assert.doesNotMatch(json, new RegExp(token))
  assert.equal(JSON.parse(json).utm_source, 'google')
})

test('o JSON corta pelo fim quando passa do limite e nunca emite objeto vazio', () => {
  const cortado = jsonLimitado({
    entry_path: '/preco',
    utm_source: 'google',
    referrer_host: 'news.example.com',
  }, 55)
  assert.ok(cortado)
  assert.ok(new TextEncoder().encode(cortado).length <= 55)
  const obj = JSON.parse(cortado)
  assert.equal(obj.entry_path, '/preco')
  assert.equal(obj.referrer_host, undefined)
  assert.equal(jsonLimitado({ entry_path: 'a'.repeat(3000) }, 2048), null)
  assert.equal(jsonLimitado({}), null)
  assert.equal(jsonLimitado({ utm_source: 'linha\nquebra' }), null)

  const cheio = jsonDaAtribuicao(montarAtribuicaoDeEntrada(local({
    pathname: `/${'a'.repeat(254)}`,
    search: `?utm_source=${'s'.repeat(100)}&utm_medium=${'m'.repeat(100)}&utm_campaign=${'c'.repeat(100)}&utm_content=${'o'.repeat(100)}&utm_term=${'t'.repeat(100)}`,
  }), 'https://news.example.com/caminho'))
  assert.ok(cheio)
  assert.ok(new TextEncoder().encode(cheio).length <= MAX_BYTES_ATRIBUICAO)
  assert.ok(new TextEncoder().encode(cheio).length > 500)
})

test('storage cheio ou fechado não quebra a captura', () => {
  const cheio: ArmazemAtribuicao = {
    getItem: () => null,
    setItem: () => { throw new Error('quota') },
  }
  const a = capturarAtribuicaoDeSessao(cheio, local({ search: '?utm_source=google' }), 'https://news.example.com/')
  assert.equal(a.utm_source, 'google')
  assert.equal(a.referrer_host, 'news.example.com')
  assert.deepEqual(cabecalhosDeAtribuicao(cheio), {})

  const fechado: ArmazemAtribuicao = {
    getItem: () => { throw new Error('off') },
    setItem: () => { throw new Error('off') },
  }
  assert.doesNotThrow(() => capturarAtribuicaoDeSessao(fechado, local(), ''))
  assert.deepEqual(atribuicaoValida({ entry_path: 1, utm_source: null }), {})
})

test('só o verify, o Google e o cadastro por senha criam conta', () => {
  for (const p of ['/auth/magic-pin/verify', '/auth/magic-link/verify', '/auth/google', '/auth/register', '/auth/register?x=1', '/auth/register#x']) {
    assert.equal(caminhoCriaConta(p), true, p)
  }
  for (const p of [
    '/auth/magic-pin/request',
    '/auth/magic-pin/resend',
    '/auth/magic-link/request',
    '/auth/magic-link/resend',
    '/auth/google/callback',
    '/auth/password',
    '/auth/me',
    '/auth/channels/status',
    '/business/leads',
  ]) assert.equal(caminhoCriaConta(p), false, p)
})

test('conta nova é sign_up e conta que já existe é login', () => {
  assert.equal(nomeEventoAuth(true), 'sign_up')
  assert.equal(nomeEventoAuth(false), 'login')
})

test('o evento usa o gtag que já existe e não carrega outro', () => {
  const g = globalThis as { window?: { gtag?: (...args: unknown[]) => void, sessionStorage?: ArmazemAtribuicao } }
  const anterior = g.window
  const chamadas: unknown[][] = []
  const store = memoria()
  capturarAtribuicaoDeSessao(store, local({ search: '?utm_source=google' }), '')
  try {
    g.window = {}
    assert.doesNotThrow(() => dispararEventoAuth('password', true))
    assert.equal(g.window.gtag, undefined)
    assert.deepEqual(cabecalhosAtribuicaoDaSessao(), {})

    g.window = {
      gtag: (...args: unknown[]) => { chamadas.push(args) },
      sessionStorage: store,
    }
    dispararEventoAuth('google', true)
    dispararEventoAuth('magic_pin', false)
    dispararEventoAuth('magic_link', true)
    dispararEventoAuth('password', false)
    assert.deepEqual(chamadas, [
      ['event', 'sign_up', { method: 'google' }],
      ['event', 'login', { method: 'magic_pin' }],
      ['event', 'sign_up', { method: 'magic_link' }],
      ['event', 'login', { method: 'password' }],
    ])
    assert.deepEqual(cabecalhosAtribuicaoDaSessao(), {
      [HEADER_ATRIBUICAO]: '{"entry_path":"/preco-teto","utm_source":"google"}',
    })

    g.window.gtag = () => { throw new Error('ga') }
    assert.doesNotThrow(() => dispararEventoAuth('google', true))
  }
  finally {
    if (anterior === undefined) delete g.window
    else g.window = anterior
  }

  const util = ler('../app/utils/atribuicao.ts')
  assert.match(util, /\.gtag\?\.\('event', nomeEventoAuth\(contaNova\), \{ method: metodo \}\)/)
  assert.doesNotMatch(util, /googletagmanager|dataLayer|document\.cookie|localStorage|createElement\(/)
  assert.match(util, /sessionStorage/)

  const plugin = ler('../app/plugins/atribuicao.client.ts')
  assert.match(plugin, /capturarAtribuicaoDeSessao\(window\.sessionStorage, window\.location, document\.referrer\)/)
  assert.doesNotMatch(plugin, /localStorage|document\.cookie|useCookie|googletagmanager|dataLayer/)
})

test('cada verify que cria conta manda o header e o evento certo', () => {
  const login = ler('../app/pages/login.vue')
  assert.equal(login.match(/cabecalhosAtribuicaoDaSessao\(\)/g)?.length, 3)
  assert.match(login, /\/auth\/magic-pin\/verify[\s\S]*?headers: cabecalhosAtribuicaoDaSessao\(\)/)
  assert.match(login, /dispararEventoAuth\('magic_pin', r\.is_new_user === true\)/)
  assert.match(login, /\/auth\/magic-link\/verify[\s\S]*?headers: cabecalhosAtribuicaoDaSessao\(\)/)
  assert.match(login, /dispararEventoAuth\('magic_link', r\.is_new_user === true\)/)
  assert.match(login, /publicFetch<GoogleAuthResponse>\('\/auth\/google', \{[\s\S]*?headers: cabecalhosAtribuicaoDaSessao\(\)/)
  assert.match(login, /dispararEventoAuth\('google', r\.is_new_user === true\)/)
  assert.doesNotMatch(login, /gtag/)
  const resend = login.slice(login.indexOf('async function resendPin'), login.indexOf('function backToIdentifier'))
  assert.doesNotMatch(resend, /cabecalhosAtribuicaoDaSessao|dispararEventoAuth/)
  const pin = login.indexOf("'/auth/magic-pin/verify'")
  const eventoPin = login.indexOf("dispararEventoAuth('magic_pin'")
  const catchPin = login.indexOf('} catch (e)', pin)
  assert.ok(pin < eventoPin && eventoPin < catchPin)

  const inline = ler('../app/composables/useCadastroInline.ts')
  assert.equal(inline.match(/cabecalhosAtribuicaoDaSessao\(\)/g)?.length, 2)
  assert.match(inline, /\/auth\/magic-pin\/verify[\s\S]*?headers: cabecalhosAtribuicaoDaSessao\(\)/)
  assert.match(inline, /dispararEventoAuth\('magic_pin', r\.is_new_user === true\)/)
  assert.match(inline, /\/auth\/magic-link\/verify[\s\S]*?headers: cabecalhosAtribuicaoDaSessao\(\)/)
  assert.match(inline, /dispararEventoAuth\('magic_link', r\.is_new_user === true\)/)
  assert.doesNotMatch(inline, /gtag/)
  const pedir = inline.slice(inline.indexOf('async function pedirCodigo'), inline.indexOf('async function reenviar'))
  assert.doesNotMatch(pedir, /cabecalhosAtribuicaoDaSessao|dispararEventoAuth/)

  const news = ler('../app/composables/useNewsletter.ts')
  assert.match(news, /\/auth\/magic-link\/verify[\s\S]*?headers: cabecalhosAtribuicaoDaSessao\(\)/)
  assert.match(news, /dispararEventoAuth\('magic_link', r\.is_new_user === true\)/)
  assert.match(news, /gtag\?\.\('event', 'newsletter_assinatura', paramsEventoNewsletter\(fonte, fim\.value, formatoEvento\)\)/)
  const gate = news.slice(news.indexOf("'/auth/me/email/verify-pin'"))
  assert.doesNotMatch(gate, /cabecalhosAtribuicaoDaSessao|dispararEventoAuth/)

  const api = ler('../app/composables/useApi.ts')
  assert.match(api, /caminhoCriaConta\(path\) \? cabecalhosAtribuicaoDaSessao\(\)/)
  assert.equal(api.match(/cabecalhosAtribuicaoDaSessao\(\)/g)?.length, 1)
})

test('a folha de cadastro mantém os eventos cadastro_folha', () => {
  const folha = ler('../app/components/cadastro/CadastroFolha.vue')
  const comp = ler('../app/composables/useCadastroFolha.ts')
  assert.match(folha, /eventoCadastro\('cadastro_folha_conta', \{ gesto: gesto\.value, canal: f\.canal, nova: f\.novaConta \}\)/)
  assert.match(comp, /eventoCadastro\('cadastro_folha_aberta', \{ gesto: contexto\.gesto \}\)/)
  assert.match(comp, /gtag\?\.\('event', nome, params\)/)
})

test('não há tela de cadastro por senha; o caminho já leva o header', () => {
  assert.equal(caminhoCriaConta('/auth/register'), true)
  const raiz = new URL('../app/', import.meta.url)
  for (const arquivo of arquivosDoApp(raiz.pathname)) {
    if (arquivo.endsWith(`${join('utils', 'atribuicao.ts')}`)) continue
    const src = readFileSync(arquivo, 'utf8')
    assert.doesNotMatch(src, /['"`]\/auth\/register['"`]/, arquivo)
  }
  const botao = ler('../app/components/login/LoginGoogleButton.vue')
  const hook = ler('../app/composables/useGoogleAuth.ts')
  assert.doesNotMatch(botao, /publicFetch\(|\$fetch\(/)
  assert.doesNotMatch(hook, /publicFetch\(|\$fetch\(/)
})
