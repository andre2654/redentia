/**
 * O B2B saiu do front (12/11/2026): os endereços antigos levam para
 * redentia.com.br, o site do produto de escritório. O mapa é
 * server/utils/destino-b2b.ts; o middleware b2b-para-redentia.ts só o aplica.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { destinoB2B, pareceB2B } from '../server/utils/destino-b2b.ts'

const APORTOU = 'aportou.com.br'
const ir = (caminho: string, host = APORTOU) => destinoB2B(caminho, host)

test('a /business e o que não tem par no app novo vão para a raiz (301)', () => {
  for (const p of ['/business', '/business/', '/business/cadastro', '/business/qualquer-coisa', '/business/clientes/123', '/business/convite', '/business/convite/', '/business/convite/a/b', '/Business'])
    assert.deepEqual(ir(p), { para: 'https://redentia.com.br', status: 301 }, p)
})

test('o painel antigo vai para a tela equivalente do app novo (301)', () => {
  assert.deepEqual(ir('/business/clientes'), { para: 'https://redentia.com.br/app/clientes', status: 301 })
  assert.deepEqual(ir('/business/clientes/'), { para: 'https://redentia.com.br/app/clientes', status: 301 })
  assert.deepEqual(ir('/business/chaves'), { para: 'https://redentia.com.br/app/escritorio', status: 301 })
  assert.deepEqual(ir('/business/comecar'), { para: 'https://redentia.com.br/app/escritorio', status: 301 })
  assert.deepEqual(ir('/business/skills'), { para: 'https://redentia.com.br/app', status: 301 })
})

test('/whitelabel e /pricing vão direto para a raiz, sem passar pela /business (301)', () => {
  assert.deepEqual(ir('/whitelabel'), { para: 'https://redentia.com.br', status: 301 })
  assert.deepEqual(ir('/pricing'), { para: 'https://redentia.com.br', status: 301 })
  assert.deepEqual(ir('/pricing/'), { para: 'https://redentia.com.br', status: 301 })
  const cfg = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(cfg, /'\/(whitelabel|pricing)'\s*:/, 'o routeRules antigo levaria à /business e faria dois saltos')
  assert.doesNotMatch(cfg, /'\/(business|cliente|jantar)[^']*'\s*:/, 'nenhuma regra de rota do B2B fica no nuxt.config')
})

test('link pessoal e campanha vão para o mesmo caminho em redentia.com.br (302)', () => {
  const token = 'a'.repeat(48)
  assert.deepEqual(ir(`/business/convite/${token}`), { para: `https://redentia.com.br/business/convite/${token}`, status: 302 })
  assert.deepEqual(ir('/business/convite/AbC9/'), { para: 'https://redentia.com.br/business/convite/AbC9', status: 302 })
  assert.deepEqual(ir(`/cliente/convite/${token}`), { para: `https://redentia.com.br/cliente/convite/${token}`, status: 302 })
  assert.deepEqual(ir(`/cliente/acesso/${token}`), { para: `https://redentia.com.br/cliente/acesso/${token}`, status: 302 })
  assert.deepEqual(ir('/cliente'), { para: 'https://redentia.com.br/cliente', status: 302 })
  assert.deepEqual(ir('/jantar'), { para: 'https://redentia.com.br/jantar', status: 302 })
  assert.deepEqual(ir('/jantar/'), { para: 'https://redentia.com.br/jantar', status: 302 })
})

test('a query vai junto, como veio', () => {
  assert.deepEqual(ir('/business?utm_source=x'), { para: 'https://redentia.com.br/?utm_source=x', status: 301 })
  assert.deepEqual(ir('/business/clientes?utm_source=x&utm_medium=email'), { para: 'https://redentia.com.br/app/clientes?utm_source=x&utm_medium=email', status: 301 })
  assert.deepEqual(ir('/whitelabel?ref=antigo'), { para: 'https://redentia.com.br/?ref=antigo', status: 301 })
  assert.deepEqual(ir('/cliente/convite/abc?utm_source=whatsapp'), { para: 'https://redentia.com.br/cliente/convite/abc?utm_source=whatsapp', status: 302 })
  assert.deepEqual(ir('/jantar?utm_campaign=dezembro'), { para: 'https://redentia.com.br/jantar?utm_campaign=dezembro', status: 302 })
  // a interrogação sozinha não vira query
  assert.deepEqual(ir('/business?'), { para: 'https://redentia.com.br', status: 301 })
})

test('caminho parecido que não é do B2B segue para a página dele', () => {
  for (const p of ['/', '/businessx', '/business-algo', '/clientes-algo', '/clientes', '/jantarx', '/jantar/menu', '/pricingx', '/whitelabel/x', '/calculadora/preco-teto', '/calculadora/preco-teto/PETR4', '/asset/PETR4', '/conta', '/mcp'])
    assert.equal(ir(p), null, p)
  // a saída cedo do middleware: só os cinco prefixos passam
  for (const p of ['/', '/calculadora/preco-teto', '/asset/PETR4', '/mcp', '/conta']) assert.equal(pareceB2B(p), false, p)
  for (const p of ['/business', '/businessx', '/cliente/convite/x', '/clientes-algo', '/jantar', '/whitelabel', '/pricing']) assert.equal(pareceB2B(p), true, p)
})

test('trava contra laço: o destino que é o próprio pedido vira 404, não 30x', () => {
  for (const host of ['www.redentia.com.br', 'redentia.com.br', 'WWW.Redentia.com.br', 'redentia.com.br:443', 'www.redentia.com.br, proxy.interno']) {
    assert.equal(ir('/cliente/convite/abc', host), null, host)
    assert.equal(ir('/cliente/acesso/abc?utm_source=x', host), null, host)
    assert.equal(ir('/business/convite/abc', host), null, host)
    assert.equal(ir('/jantar', host), null, host)
    // o que muda de caminho redireciona mesmo no host do B2B: não há laço
    assert.deepEqual(ir('/business', host), { para: 'https://redentia.com.br', status: 301 }, host)
    assert.deepEqual(ir('/business/chaves', host), { para: 'https://redentia.com.br/app/escritorio', status: 301 }, host)
    assert.deepEqual(ir('/whitelabel', host), { para: 'https://redentia.com.br', status: 301 }, host)
  }
  // em qualquer outro host (aportou.com.br, a prévia da Vercel, o dev) o link pessoal redireciona
  for (const host of ['aportou.com.br', 'www.aportou.com.br', 'localhost:3471', 'frontend-git-x.vercel.app', 'redentia.com.br.evil.com', ''])
    assert.deepEqual(ir('/cliente/convite/abc', host), { para: 'https://redentia.com.br/cliente/convite/abc', status: 302 }, host)
  // e o caminho que só difere pela barra no fim chega lá no segundo salto
  const primeiro = ir('/jantar/', 'www.redentia.com.br')
  assert.deepEqual(primeiro, { para: 'https://redentia.com.br/jantar', status: 302 })
  assert.equal(ir(new URL(primeiro!.para).pathname, 'www.redentia.com.br'), null)
})

test('o destino é sempre redentia.com.br e o Location sai só com ASCII', () => {
  assert.deepEqual(ir('/cliente/convite/ação'), { para: 'https://redentia.com.br/cliente/convite/a%C3%A7%C3%A3o', status: 302 })
  assert.equal(new URL(ir('/cliente//evil.com/x')!.para).host, 'redentia.com.br')
  assert.equal(new URL(ir('/cliente/convite/abc?next=https://evil.com')!.para).host, 'redentia.com.br')
})

test('o middleware só aplica o mapa: host do visitante, o destino e o status', () => {
  const src = readFileSync(new URL('../server/middleware/b2b-para-redentia.ts', import.meta.url), 'utf8')
  assert.match(src, /if \(!pareceB2B\(caminho\)\) return/)
  assert.match(src, /getRequestHost\(event, \{ xForwardedHost: true \}\)/)
  assert.match(src, /sendRedirect\(event, destino\.para, destino\.status\)/)
})

test('a casca do site não leva ao B2B daqui; a porta "Para escritórios" vai direto para redentia.com.br', () => {
  const ler = (f: string) => readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8')
  for (const f of ['components/nu/NuHeader.vue', 'components/nu/topo/NuTopoMenu.vue', 'components/nu/topo/NuTopoMarca.vue', 'components/nu/NuFooter.vue', 'components/nu/NuFooterAportou.vue', 'utils/topo.ts', 'layouts/default.vue'])
    assert.doesNotMatch(ler(f), /["'`]\/(business|cliente|jantar)\b/, f)
  // link externo comum: na mesma aba e sem rel (o NuxtLink externo acrescentaria noreferrer)
  const rodape = ler('components/nu/NuFooterAportou.vue')
  assert.equal(rodape.match(/<a\b[^>]*class="nfa__b2b"[^>]*>/)?.[0], '<a href="https://redentia.com.br" class="nfa__b2b">')
  assert.match(rodape, /class="nfa__b2b">Para escritórios: \{\{ MARCA\.b2b \}\}/)
})

test('link pessoal: convite da chave e as páginas do cliente final; o resto não', async () => {
  const { ehLinkPessoal, PAGINA_LINK_INDISPONIVEL } = await import('../server/utils/destino-b2b.ts')
  for (const c of ['/cliente', '/cliente/', '/cliente/convite/abc', '/Cliente/Acesso/XYZ?x=1', '/business/convite/tok123']) assert.equal(ehLinkPessoal(c), true, c)
  for (const c of ['/business', '/business/clientes', '/clientes-algo', '/jantar', '/calculadora/preco-teto']) assert.equal(ehLinkPessoal(c), false, c)
  // a página da trava não carrega nada: sem script, sem link externo
  assert.doesNotMatch(PAGINA_LINK_INDISPONIVEL, /<script|<link|https?:\/\//i)
  assert.match(PAGINA_LINK_INDISPONIVEL, /noindex/)
})
