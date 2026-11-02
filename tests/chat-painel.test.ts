/**
 * O chat em painel (02/11/2026): sugestões por página, onde a barra aparece,
 * o contexto que vai junto da pergunta, os deep-links e a resposta surgindo
 * palavra por palavra.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  anexosDoTurno,
  barraVisivel,
  contextoDoLinkDeAtivo,
  loginComPergunta,
  MAX_CONTEXTOS,
  pedidoDaQuery,
  querySemPedido,
  rotuloComSobre,
  rotuloCurto,
  routeContextDaRota,
  sugestoesDaRota,
  textoCompacto,
  textoDeLinhas,
  textoDoGrafico,
  tickerDaRota,
} from '../app/utils/chat-painel.ts'
import {
  agendarPalavras,
  contarPalavras,
  cortarPalavraIncompleta,
  envolverPalavras,
} from '../app/utils/revelar-palavras.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('o contrato do useChatPainel segue o que a busca chama', () => {
  const src = ler('app/composables/useChatPainel.ts')
  for (const nome of ['abrir', 'fechar', 'anexar', 'remover', 'consumirPendente', 'aberto', 'contextos', 'pendente']) {
    assert.match(src, new RegExp(`return \\{[^}]*\\b${nome}\\b`), nome)
  }
  assert.match(src, /function abrir\(pergunta\?: string, extras: ContextoDoChat\[\] = \[\]\)/)
})

test('sugestões conforme a página, sem "compre" nem "venda"', () => {
  assert.deepEqual(sugestoesDaRota('/asset/PETR4').slice(0, 2), ['Por que a PETR4 mexeu hoje?', 'Quanto a PETR4 paga de proventos?'])
  assert.equal(sugestoesDaRota('/asset/petr4')[0], 'Por que a PETR4 mexeu hoje?')
  assert.match(sugestoesDaRota('/carteira')[0]!, /minha carteira/)
  assert.ok(sugestoesDaRota('/').length >= 3)
  for (const p of ['/', '/asset/VALE3', '/carteira', '/noticias', '/tesouro', '/teses', '/dividendos/TAEE11']) {
    for (const s of sugestoesDaRota(p)) assert.doesNotMatch(s, /\b(compr|vend)\w*/i, `${p}: ${s}`)
  }
})

test('o ticker da rota só vale para símbolo de verdade', () => {
  assert.equal(tickerDaRota('/asset/PETR4'), 'PETR4')
  assert.equal(tickerDaRota('/dividendos/taee11'), 'TAEE11')
  assert.equal(tickerDaRota('/asset/<script>'), null)
  assert.equal(tickerDaRota('/carteira'), null)
})

test('a barra some no login, no quiz, na busca, no B2B e com o painel aberto', () => {
  assert.equal(barraVisivel('/', false), true)
  assert.equal(barraVisivel('/asset/PETR4', false), true)
  assert.equal(barraVisivel('/asset/PETR4', true), false)
  for (const p of ['/login', '/assinar', '/assinar/', '/busca', '/business', '/business/painel', '/cliente/x']) {
    assert.equal(barraVisivel(p, false), false, p)
  }
})

test('routeContext: o ativo da página vira o foco do turno', () => {
  assert.deepEqual(routeContextDaRota('/asset/PETR4'), { type: 'asset', ticker: 'PETR4' })
  assert.deepEqual(routeContextDaRota('/'), { type: 'home' })
  assert.deepEqual(routeContextDaRota('/tesouro/selic-2029'), { type: 'tesouro' })
  assert.equal(routeContextDaRota('/carteira'), null)
})

test('os contextos viram attachments de texto que o chat-service aceita', () => {
  const ctx = [
    { id: 'ativo:PETR4', tipo: 'ativo', rotulo: 'PETR4', texto: 'Petrobras · PETR4\nPreço: R$ 52,71', rota: '/asset/PETR4' },
    { id: 'grafico:PETR4:12mo', tipo: 'grafico', rotulo: 'Gráfico PETR4 · 12 meses', texto: '  muito   espaço  ' },
  ]
  const a = anexosDoTurno(ctx)
  assert.equal(a.length, 2)
  assert.equal(a[0]!.name, 'PETR4') // o nome volta em meta.attachments e redesenha o chip
  assert.equal(a[0]!.mime, 'text/plain')
  assert.equal(a[0]!.kind, 'text')
  assert.match(a[0]!.content, /^Ativo que a pessoa mostrou na página \/asset\/PETR4:\nPetrobras/)
  assert.equal(a[0]!.size, new TextEncoder().encode(a[0]!.content).length)
  assert.match(a[1]!.content, /Gráfico que a pessoa mostrou na página:\nmuito espaço$/)
  // o servidor recusa mais de 5 (AttachmentSchema.max(5))
  const muitos = Array.from({ length: 8 }, (_, i) => ({ id: `x${i}`, tipo: 'tese', rotulo: `T${i}`, texto: 't' }))
  assert.equal(anexosDoTurno(muitos).length, MAX_CONTEXTOS)
})

test('o schema do /stream do chat-service tem attachments e routeContext', () => {
  // leitura do contrato: o campo existe no servidor (src/routes/chat.stream.ts)
  const fe = ler('app/composables/useNuChat.ts')
  assert.match(fe, /\.\.\.\(attachments \? \{ attachments \} : \{\}\)/)
  assert.match(fe, /\.\.\.\(routeContext \? \{ routeContext \} : \{\}\)/)
})

test('texto compacto: sem espaço sobrando e com teto', () => {
  assert.equal(textoCompacto('  a   b \n\n\n  c  '), 'a b\nc')
  const longo = textoCompacto('x'.repeat(5000), 100)
  assert.equal(longo.length, 100)
  assert.ok(longo.endsWith('…'))
})

test('link solto para /asset/X vira o contexto do ativo', () => {
  assert.deepEqual(contextoDoLinkDeAtivo('/asset/vale3', 'Vale  +1,2%', '/'), { id: 'ativo:VALE3', tipo: 'ativo', rotulo: 'VALE3', texto: 'VALE3: Vale +1,2%', rota: '/' })
  assert.equal(contextoDoLinkDeAtivo('https://redentia.com.br/asset/ITUB4?x=1', '', '/')?.rotulo, 'ITUB4')
  assert.equal(contextoDoLinkDeAtivo('/teses', 'x'), null)
})

test('o gráfico em palavras usa só os pontos desenhados', () => {
  const t = textoDoGrafico('PETR4', '12 meses', [
    { t: '2025-11-03', v: 40 }, { t: '2026-03-10', v: 36 }, { t: '2026-08-01', v: 55 }, { t: '2026-10-30', v: 50 },
  ], [{ t: '2025-11-03', v: 100 }, { t: '2026-10-30', v: 110 }])
  assert.match(t, /de R\$\s40,00 \(03\/11\/2025\) a R\$\s50,00 \(30\/10\/2026\), \+25,00%/)
  assert.match(t, /Mínima R\$\s36,00 \(10\/03\/2026\); máxima R\$\s55,00 \(01\/08\/2026\)/)
  assert.match(t, /IBOV no mesmo período: \+10,00%/)
  assert.match(textoDoGrafico('X', '1 mês', []), /sem pontos/)
  assert.equal(textoDeLinhas([{ l: 'DY', v: '8%' }, { l: '', v: 'x' }]), 'DY: 8%')
  assert.equal(rotuloCurto('Uma manchete bem comprida sobre a bolsa de hoje', 20), 'Uma manchete bem co…')
})

test('deep-links: ?pergunta= abre e envia; ?chat=1 só abre (fora da /busca)', () => {
  assert.deepEqual(pedidoDaQuery('/asset/PETR4', { pergunta: ' Por que? ' }), { abrir: true, pergunta: 'Por que?' })
  assert.deepEqual(pedidoDaQuery('/', { chat: '1' }), { abrir: true, pergunta: null })
  assert.deepEqual(pedidoDaQuery('/busca', { chat: '1', q: 'x' }), { abrir: false, pergunta: null })
  assert.deepEqual(pedidoDaQuery('/', {}), { abrir: false, pergunta: null })
  assert.deepEqual(querySemPedido({ pergunta: 'a', chat: '1', tipo: 'acoes' }), { tipo: 'acoes' })
})

test('o login volta para a mesma página com a pergunta, dentro do teto do redirect', () => {
  const { url, naUrl } = loginComPergunta('/asset/PETR4', { range: '6mo' }, 'Por que a PETR4 mexeu hoje?')
  assert.equal(naUrl, true)
  const volta = decodeURIComponent(url.replace('/login?redirect=', ''))
  assert.ok(volta.startsWith('/asset/PETR4?range=6mo&pergunta='))
  assert.equal(new URLSearchParams(volta.split('?')[1]).get('pergunta'), 'Por que a PETR4 mexeu hoje?')
  // longa demais para os 256 do sanitizeRedirect: volta sem ela (vai pelo sessionStorage)
  const longa = loginComPergunta('/carteira', {}, 'a '.repeat(200))
  assert.equal(longa.naUrl, false)
  assert.equal(longa.url, `/login?redirect=${encodeURIComponent('/carteira')}`)
})

/* ——— a resposta surgindo palavra por palavra ——— */

test('contar e envolver palavras sem tocar nas tags', () => {
  const html = '<p>A <strong>PETR4</strong> subiu<br>hoje.</p><ul><li>R$ 52,71</li></ul>'
  assert.equal(contarPalavras(html), 6)
  const agenda = [0, 0, 0, 1000, 1000, 1000]
  const out = envolverPalavras(html, agenda, 1200, { duracao: 520 })
  // as três primeiras já terminaram (sem animação), as outras ainda não
  assert.equal((out.match(/rp--ja/g) ?? []).length, 3)
  assert.match(out, /<p><span class="rp rp--ja">A<\/span> <strong><span class="rp rp--ja">PETR4<\/span><\/strong>/)
  assert.match(out, /<br><span class="rp" style="animation-delay:-200ms">hoje\.<\/span>/)
  // o texto continua o mesmo sem as marcas
  assert.equal(out.replace(/<span class="rp[^"]*"(?: style="[^"]*")?>|<\/span>/g, ''), html)
})

test('palavra já revelada nunca anima de novo', () => {
  let agenda = agendarPalavras([], 3, 1000)
  const primeira = agenda.slice()
  agenda = agendarPalavras(agenda, 6, 3000)
  assert.deepEqual(agenda.slice(0, 3), primeira) // a agenda antiga não muda
  const html = '<p>um dois tres quatro cinco seis</p>'
  const out = envolverPalavras(html, agenda, 3000)
  assert.equal((out.match(/rp--ja/g) ?? []).length, 3)
  // as novas começam agora ou depois, nunca no passado
  for (const t of agenda.slice(3)) assert.ok(t >= 3000)
})

test('rajada grande cabe no atraso máximo', () => {
  const agenda = agendarPalavras([], 200, 0, { passo: 38, atrasoMax: 900 })
  assert.equal(agenda.length, 200)
  assert.ok(agenda[199]! <= 900)
  for (let i = 1; i < agenda.length; i++) assert.ok(agenda[i]! >= agenda[i - 1]!)
  // poucas palavras andam no passo normal
  assert.deepEqual(agendarPalavras([], 3, 0, { passo: 40 }), [0, 40, 80])
})

test('a palavra pela metade espera o espaço enquanto a resposta chega', () => {
  assert.equal(cortarPalavraIncompleta('A Petro', false), 'A ')
  assert.equal(cortarPalavraIncompleta('A Petro', true), 'A Petro')
  assert.equal(cortarPalavraIncompleta('Petro', false), '')
  assert.equal(cortarPalavraIncompleta('linha\nnova', false), 'linha\n')
})

test('movimento reduzido: a mensagem não envolve palavras', () => {
  const src = ler('app/components/chat/ChatMensagem.vue')
  assert.match(src, /prefers-reduced-motion: reduce/)
  assert.match(src, /if \(!animar \|\| import\.meta\.server\) return base/)
})

/* ——— a pergunta que esbarrou na assinatura ——— */

function armazemFalso() {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => { m.set(k, v) },
    removeItem: (k: string) => { m.delete(k) },
    m,
  }
}

test('a pergunta do gate é guardada, lida e esquecida', async () => {
  const { guardarPerguntaDoGate, lerPerguntaDoGate, esquecerPerguntaDoGate } = await import('../app/utils/chat-painel.ts')
  const a = armazemFalso()
  const ctx = { id: 'ativo:PETR4', tipo: 'ativo', rotulo: 'PETR4', texto: 'PETR4 R$ 52,71' }
  guardarPerguntaDoGate(a, '  Por que a PETR4 mexeu hoje?  ', [ctx], 1_000)
  assert.deepEqual(lerPerguntaDoGate(a, 2_000), { texto: 'Por que a PETR4 mexeu hoje?', contextos: [ctx], em: 1_000 })
  esquecerPerguntaDoGate(a)
  assert.equal(lerPerguntaDoGate(a, 2_000), null)
  // vazio não é guardado
  guardarPerguntaDoGate(a, '   ', [], 1_000)
  assert.equal(a.m.size, 0)
})

test('a pergunta do gate vence em 6 horas e ignora lixo', async () => {
  const { guardarPerguntaDoGate, lerPerguntaDoGate, VALIDADE_PERGUNTA_DO_GATE_MS, CHAVE_PERGUNTA_DO_GATE } = await import('../app/utils/chat-painel.ts')
  const a = armazemFalso()
  guardarPerguntaDoGate(a, 'vale a pena?', [], 0)
  assert.ok(lerPerguntaDoGate(a, VALIDADE_PERGUNTA_DO_GATE_MS))
  assert.equal(lerPerguntaDoGate(a, VALIDADE_PERGUNTA_DO_GATE_MS + 1), null)
  a.setItem(CHAVE_PERGUNTA_DO_GATE, '{não é json')
  assert.equal(lerPerguntaDoGate(a, 0), null)
  a.setItem(CHAVE_PERGUNTA_DO_GATE, JSON.stringify({ texto: 'oi', em: 0, contextos: [{ id: 1 }, { id: 'x', rotulo: 'X', texto: 't', tipo: 'ativo' }] }))
  assert.deepEqual(lerPerguntaDoGate(a, 0)?.contextos.map((c) => c.id), ['x'])
  // armazém que explode (modo privado) não derruba nada
  const quebrado = { getItem: () => { throw new Error('x') }, setItem: () => { throw new Error('x') }, removeItem: () => { throw new Error('x') } }
  guardarPerguntaDoGate(quebrado, 'oi', [], 0)
  assert.equal(lerPerguntaDoGate(quebrado, 0), null)
})

test('a pergunta guardada não abre o painel no meio do fluxo', async () => {
  const { podeRetomarPerguntaAqui } = await import('../app/utils/chat-painel.ts')
  for (const p of ['/login', '/assinar', '/assinar/obrigado', '/cliente/abc', '/business']) assert.equal(podeRetomarPerguntaAqui(p), false, p)
  for (const p of ['/carteira', '/', '/asset/PETR4', '/assinatura']) assert.equal(podeRetomarPerguntaAqui(p), true, p)
})

test('sem conta, a pergunta abre a folha de cadastro; sem assinatura, o quiz', () => {
  const painel = readFileSync(new URL('../app/composables/useChatPainel.ts', import.meta.url), 'utf8')
  assert.match(painel, /isAuthenticated\.value\) \{ abrir\(texto, extras\); return \}/)
  assert.match(painel, /useCadastroFolha\(\)\.abrir\(\{ gesto: 'pergunta', pergunta: texto \}, \(\) => true, volta, \(\) => abrir\(texto, junto\)\)/)
  for (const arq of ['../app/components/chat/ChatBarra.vue', '../app/pages/busca.vue']) {
    assert.match(readFileSync(new URL(arq, import.meta.url), 'utf8'), /painel\.perguntar\(/, arq)
  }
  const chat = readFileSync(new URL('../app/composables/useNuChat.ts', import.meta.url), 'utf8')
  assert.match(chat, /garantirAcesso\('chat'\)\)\) \{\n\s+\/\/[^\n]*\n\s+if \(import\.meta\.client\) guardarPerguntaDoGate/)
  const p = readFileSync(new URL('../app/components/chat/ChatPainel.vue', import.meta.url), 'utf8')
  assert.match(p, /assinatura\.assinante\.value/)
  assert.match(p, /esquecerPerguntaDoGate\(localStorage\)/)
})

test('o rótulo leva o sujeito da página, curto e sem repetir', () => {
  assert.equal(rotuloComSobre('P/L', 'PETR4'), 'P/L PETR4')
  assert.equal(rotuloComSobre('Proventos PETR4', 'PETR4'), 'Proventos PETR4')
  assert.equal(rotuloComSobre('Dividend Yield', ''), 'Dividend Yield')
  assert.ok(rotuloComSobre('Uma métrica de nome bem comprido demais', 'TAEE11').length <= 34)
})

test('o cursor mágico escolhe o pedaço mais de dentro e acha seções com título', () => {
  const src = ler('app/components/chat/ChatSeletor.vue')
  assert.match(src, /cands\.find\(\(c\) => cands\.every\(\(o\) => o === c \|\| !c\.contains\(o\)\)\)/)
  assert.match(src, /closest<HTMLElement>\('section, article'\)/)
  // os cartões do design system levam o sujeito da página
  for (const f of ['NuMetricCard', 'NuStatList', 'NuScoreCard', 'NuDividendBars']) {
    assert.match(ler(`app/components/nu/${f}.vue`), /useSobreDoContexto\(\)/, f)
  }
  assert.match(ler('app/pages/asset/[ticker].vue'), /proverSobreDoContexto\(ticker\)/)
})
