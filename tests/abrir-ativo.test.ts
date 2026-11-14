/**
 * A abertura de um ativo pela janelinha (12/11/2026, o dono: "a animação de
 * quando abro um ativo é sensacional, mas demora muito para abrir gráficos e
 * etc., temos que mostrar um loading, algo assim").
 *
 *  1. O vigia da régua não disputa com a página: o GET /me/carteira/visao
 *     (~124 KB) sai adiado (depois do page:finish, ocioso, com um atraso e
 *     nunca com a janelinha aberta) e fica 5 minutos no sessionStorage, numa
 *     chave com um hash do token (nunca o token). A home pergunta na hora.
 *  2. A capa do maximizar já é o topo do /asset carregando: a linha de 12
 *     meses se desenhando no cartão, o brilho que corre por ela e a linha de
 *     progresso; as medidas são as do TopoBolsa, e a troca não salta.
 *  3. Toda navegação tem a barra do Nuxt em cobalto, escondida no maximizar.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { VALIDADE_DO_AVISO_MS, chaveDoAviso, esquecerAvisosGuardados, guardarAviso, impressaoDoToken, lerAvisoGuardado, type GuardaDoAviso } from '../app/utils/avisoGuardado.ts'
import { acompanharPaginas, esperarOcioso, paginaComecou, paginaTerminou, relogioDoNavegador, type RelogioOcioso } from '../app/utils/quandoOcioso.ts'
import { linhaDoAtivo } from '../app/utils/espiarAtivo.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const estilo = (sfc: string) => sfc.slice(sfc.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')

/** um sessionStorage de mentira (e um que lança, como a aba anônima com o storage bloqueado) */
class Guarda implements GuardaDoAviso {
  m = new Map<string, string>()
  get length() { return this.m.size }
  key(i: number) { return [...this.m.keys()][i] ?? null }
  getItem(k: string) { return this.m.get(k) ?? null }
  setItem(k: string, v: string) { this.m.set(k, String(v)) }
  removeItem(k: string) { this.m.delete(k) }
}
class GuardaQueLanca extends Guarda {
  override getItem(): string | null { throw new Error('SecurityError') }
  override setItem(): void { throw new Error('QuotaExceededError') }
}

const TOKEN_A = '812|Q2sV7yF3hJ9kL1mN4pR6tW8xZ0bC5dE7gH2jK4mP'
const TOKEN_B = '813|aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB'

/* ——— 1. o vigia: a chave, o guardado e a espera ——— */

test('a chave do aviso muda com a conta e não leva o token', () => {
  assert.equal(impressaoDoToken(TOKEN_A), impressaoDoToken(TOKEN_A), 'a mesma conta, a mesma chave')
  assert.notEqual(impressaoDoToken(TOKEN_A), impressaoDoToken(TOKEN_B), 'outra conta, outra chave')
  const k = chaveDoAviso(TOKEN_A)
  assert.match(k, /^nu:aviso-carteira:[0-9a-z]{1,7}$/)
  for (const pedaco of TOKEN_A.split('|')) assert.ok(!k.includes(pedaco), 'nada do token na chave')
})

test('o aviso guardado vale 5 minutos; o vencido, o do futuro e o torto não valem', () => {
  const g = new Guarda()
  const agora = 1_800_000_000_000
  guardarAviso(g, TOKEN_A, true, agora)
  assert.deepEqual(lerAvisoGuardado(g, TOKEN_A, agora + 1000), { urgente: true, em: agora })
  assert.equal(lerAvisoGuardado(g, TOKEN_A, agora + VALIDADE_DO_AVISO_MS), null, 'vencido')
  assert.equal(lerAvisoGuardado(g, TOKEN_A, agora - 1), null, 'do futuro (o relógio voltou)')
  assert.equal(lerAvisoGuardado(g, TOKEN_B, agora + 1000), null, 'de outra conta')
  assert.equal(lerAvisoGuardado(g, '', agora), null)
  assert.equal(lerAvisoGuardado(null, TOKEN_A, agora), null, 'sem storage')
  for (const torto of ['{', 'null', '{"urgente":"sim","em":1}', '{"urgente":true}', '{"urgente":true,"em":"ontem"}']) {
    g.setItem(chaveDoAviso(TOKEN_A), torto)
    assert.equal(lerAvisoGuardado(g, TOKEN_A, agora), null, torto)
  }
  // o valor é só o booleano e a hora: nada do token, nada da carteira
  guardarAviso(g, TOKEN_A, false, agora)
  assert.equal(g.getItem(chaveDoAviso(TOKEN_A)), JSON.stringify({ urgente: false, em: agora }))
})

test('guardar tira o aviso de outra conta; o logout tira todos; o storage que lança não quebra', () => {
  const g = new Guarda()
  g.setItem('outra:coisa', 'fica')
  guardarAviso(g, TOKEN_A, true, 1)
  guardarAviso(g, TOKEN_B, false, 2)
  assert.deepEqual([...g.m.keys()].sort(), ['outra:coisa', chaveDoAviso(TOKEN_B)].sort(), 'só uma conta fica na aba')
  esquecerAvisosGuardados(g)
  assert.deepEqual([...g.m.keys()], ['outra:coisa'], 'o resto da aba não é nosso')
  const ruim = new GuardaQueLanca()
  assert.doesNotThrow(() => guardarAviso(ruim, TOKEN_A, true))
  assert.equal(lerAvisoGuardado(ruim, TOKEN_A), null)
})

/** um relógio que conta as voltas e deixa o teste mexer nas páginas entre o atraso e o ocioso */
function relogio(noAtraso: () => void = () => {}): RelogioOcioso & { atrasos: number } {
  const r = {
    atrasos: 0,
    dormir: async () => { r.atrasos++; noAtraso() },
    ocioso: async () => {},
  }
  return r
}
const microtarefas = () => new Promise<void>((ok) => setImmediate(ok))

test('esperar ocioso: a hidratação conta como carregando; só segue depois do page:finish', async () => {
  const ganchos: Record<string, () => void> = {}
  acompanharPaginas({ isHydrating: true, hook: (nome, fn) => { ganchos[nome] = fn } })
  let seguiu: boolean | null = null
  void esperarOcioso({ atraso: 2000 }, relogio()).then((v) => { seguiu = v })
  await microtarefas()
  assert.equal(seguiu, null, 'a página ainda está carregando')
  ganchos['page:finish']!()
  await microtarefas()
  assert.equal(seguiu, true)
})

test('esperar ocioso: outra navegação no meio recomeça a espera; ocupado espera mais; cancelado desiste', async () => {
  paginaTerminou()
  // uma navegação começa durante o atraso: a espera volta a esperar o page:finish dela
  let primeira = true
  const r = relogio(() => { if (primeira) { primeira = false; paginaComecou() } })
  let seguiu: boolean | null = null
  void esperarOcioso({ atraso: 2000 }, r).then((v) => { seguiu = v })
  await microtarefas()
  assert.equal(seguiu, null, 'a navegação do meio ainda carrega')
  paginaTerminou()
  await microtarefas()
  assert.equal(seguiu, true)
  assert.equal(r.atrasos, 2, 'um atraso a mais depois do page:finish novo')
  // ocupado (a janelinha aberta): mais um atraso a cada volta, até liberar
  let voltas = 0
  const r2 = relogio()
  assert.equal(await esperarOcioso({ atraso: 2000, ocupado: () => ++voltas < 3 }, r2), true)
  assert.equal(r2.atrasos, 3)
  // a sessão trocou enquanto esperava
  assert.equal(await esperarOcioso({ atraso: 2000, cancelado: () => true }, relogio()), false)
})

test('sem requestIdleCallback, o ocioso vira um setTimeout curto', async () => {
  const t0 = Date.now()
  await relogioDoNavegador.ocioso(5000)
  assert.ok(Date.now() - t0 < 1000)
})

test('a régua pede adiado; "pede atenção" sai na hora e "tudo normal" só depois que o vigia olhou; a home pergunta na hora', () => {
  const regua = ler('app/components/nu/topo/NuReguaBolsa.vue')
  assert.match(regua, /cart\.aviso\.consultar\(\{ adiado: true \}\)/)
  assert.doesNotMatch(regua, /seloFinal/, 'o selo do dia não espera o motor')
  assert.match(regua, /const motorPendente = computed\(\(\) => liberados\.value && !cart\.aviso\.consultado\.value\)/)
  assert.match(regua, /selo\?\.tom === 'verde' && motorPendente\.value \? null : selo/)
  // o estado que chega (ou o "pede atenção" do motor) entra num fade
  assert.match(regua, /<Transition name="nrb-troca" mode="out-in"><span v-if="legCarteira\.estado" :key="legCarteira\.estado"/)
  assert.match(regua, /cart\.esquecer\(!novo\)/, 'o logout tira o aviso da aba')
  const home = ler('app/components/home/HomeAgoraFrase.vue')
  assert.match(home, /void aviso\.consultar\(\) \}/, 'na home o aviso é o assunto: na hora')
  const aviso = ler('app/composables/useAvisoDaCarteira.ts')
  assert.match(aviso, /esperarOcioso\(\{ atraso: ATRASO_ADIADO_MS, ocupado: abrindoUmAtivo, cancelado: \(\) => token\.value !== t \}\)/)
  assert.match(aviso, /h\.contains\('nu-espiar-aberto'\) \|\| h\.contains\('nu-maximizando'\)/)
  assert.match(aviso, /guardarAviso\(guardaDaAba\(\), t, urgente\.value, respondidoEm\)/)
  assert.match(aviso, /if \(vale\(t\) \|\| daAba\(t\)\) return Promise\.resolve\(\)/)
  assert.match(ler('app/plugins/pagina-pronta.client.ts'), /acompanharPaginas\(nuxtApp\)/)
})

/* ——— 2. a capa do maximizar ——— */

test('a linha da janelinha guarda a série (em ordem, sem preço vazio) para a capa desenhar', () => {
  const l = linhaDoAtivo([
    { market_price: 12, price_at: '2026-03-02' },
    { market_price: 10, price_at: '2026-03-01' },
    { market_price: null, price_at: '2026-03-03' },
    { market_price: 0, price_at: '2026-03-04' },
    { market_price: 13, price_at: '2026-03-05' },
  ])!
  assert.deepEqual(l.serie, [{ t: '2026-03-01', v: 10 }, { t: '2026-03-02', v: 12 }, { t: '2026-03-05', v: 13 }])
  assert.equal(l.variacao, '+30,00%')
})

test('a capa: o topo do /asset no lugar dele, a linha se desenhando, o brilho e o progresso', () => {
  const capa = ler('app/components/espiar/EspiarCapa.vue')
  // a mesma conta e o mesmo lugar do gráfico da página
  assert.match(capa, /caminhosDoGrafico\(serie, \[\], w, h\)/)
  assert.match(capa, /marcasDePreco\(c\.lo, c\.hi\)/)
  assert.match(capa, /<NuFaixaMarca :rotulo="`\$\{dados\.ticker\} em 12 meses`" :altura="56"/)
  assert.match(capa, /<TopoPreco :valor="partes\.numero" \/>/)
  // o desenho: stroke-dashoffset no tempo e na curva de entrada; o brilho só depois dele
  const css = estilo(capa)
  assert.match(css, /stroke-dasharray: 1 2; stroke-dashoffset: 0;/)
  assert.match(css, /animation: esc-desenha var\(--nu-dur-entrada\) var\(--nu-ease-saida\) var\(--nu-dur-rapida\) both;/)
  assert.match(css, /@keyframes esc-desenha \{ from \{ stroke-dashoffset: 1\.05; \} \}/)
  assert.match(css, /animation: esc-brilho calc\(var\(--nu-dur-respiro\) \* 2\) var\(--nu-ease-cor\) calc\(var\(--nu-dur-rapida\) \+ var\(--nu-dur-entrada\)\) infinite backwards;/)
  // o progresso da navegação, completo quando a página chega
  assert.match(capa, /const \{ progress \} = useLoadingIndicator\(\)/)
  assert.match(capa, /chegou\.value \? 100 : Math\.max\(4, progress\.value\)/)
  assert.match(css, /\.esc__progresso \{[^}]*top: var\(--capa-topo, 0px\);[^}]*height: 2px;/)
  assert.match(css, /background: var\(--nu-blue\); transform-origin: 0 50%;/)
  // só a página fala
  assert.match(capa, /aria-hidden="true" inert>/)
  // movimento reduzido: a linha pronta, sem brilho, a barra parada
  const calmo = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
  assert.match(calmo, /\.esc__linha, \.esc__halo, \.esc__fim, \.esc__hoje \{ animation: none; \}/)
  assert.match(calmo, /\.esc__brilho \{ display: none; \}/)
  assert.match(calmo, /\.esc__progresso i \{ transition: none; \}/)
  // só token: nada de cor em hex, peso em número, curva ou tempo à mão
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'cor em hex')
  assert.doesNotMatch(css, /font-weight:\s*\d/, 'peso em número')
  assert.doesNotMatch(css, /cubic-bezier|\b\d+(\.\d+)?m?s\s+(ease|linear)/, 'curva ou tempo à mão')
})

test('a capa usa as medidas do TopoBolsa (o nome, o preço e o cartão caem onde a página desenha)', () => {
  const capa = estilo(ler('app/components/espiar/EspiarCapa.vue'))
  const topo = estilo(ler('app/components/ativo/topo/TopoBolsa.vue'))
  const grafico = estilo(ler('app/components/ativo/AtivoGrafico.vue'))
  for (const m of [
    'clamp(28px, 3.4vw, 48px)', 'clamp(20px, 4vw, 56px)', 'max-width: 1240px', 'row-gap: clamp(20px, 2.4vw, 28px)',
    'grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); column-gap: clamp(36px, 4.4vw, 72px)',
    'font-size: clamp(24px, 2.6vw, 34px)', 'margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-md)',
    'font-size: clamp(64px, 17vw, 132px)', 'font-size: clamp(84px, 8.4vw, 132px)', 'font-size: clamp(44px, 11.5vw, 92px)', 'font-size: clamp(52px, 5.2vw, 84px)',
    'padding: .1em .05em; margin: -.1em -.05em;', 'margin-top: .16em; font-size: .36em;',
    'min-height: 36px; margin: 16px 0 0;', '--pad: clamp(18px, 2.2vw, 30px); padding-bottom: clamp(16px, 2vw, 24px);',
    'margin: clamp(18px, 2vw, 26px) var(--pad) 0', 'font-size: clamp(20px, 2vw, 26px)', 'font-size: clamp(38px, 4.4vw, 58px)',
    'height: clamp(220px, 23vw, 320px); margin-top: 14px', 'height: clamp(260px, 25vw, 372px)',
    'max(var(--pad), 44px)', 'padding: 6px 10px 0 0', 'margin: 16px var(--pad) 0', 'margin: 12px var(--pad) 0',
  ]) {
    const solto = (s: string) => s.replace(/\s+/g, ' ')
    const so = (s: string, x: string) => solto(s).includes(solto(x)) || solto(s).includes(solto(x).replace('color: var(--nu-gray); ', ''))
    assert.ok(so(topo, m), `o TopoBolsa mudou? ${m}`)
    assert.ok(so(capa, m), `a capa não tem: ${m}`)
  }
  // o traço de luz do AtivoGrafico (tom luz)
  for (const m of ['stroke-width: 9', 'opacity: .22; filter: blur(5px)', '0 0 0 6px var(--nu-blue-soft-18), 0 0 22px 4px var(--nu-blue-soft)', 'translateY(calc(-100% - 14px))']) {
    assert.ok(grafico.includes(m), `o AtivoGrafico mudou? ${m}`)
    assert.ok(capa.includes(m), `a capa não tem: ${m}`)
  }
})

test('a troca: a página chega por baixo sem refazer a entrada, e o HTML do servidor é o mesmo', () => {
  const topo = ler('app/components/ativo/topo/TopoBolsa.vue')
  assert.match(topo, /const daCapa = import\.meta\.client && capaDoMaximizar\(\)/)
  assert.match(topo, /if \(daCapa \|\| !el \|\| document\.visibilityState/, 'sem refazer o desenho da linha')
  assert.match(topo, /\.tbo--da-capa \.tbo__id, \.tbo--da-capa \.tbo__preco-linha, \.tbo--da-capa \.tbo__acoes, \.tbo--da-capa \.tbo__palco \{ animation: none; \}/)
  assert.match(ler('app/composables/useEspiarAtivo.ts'), /export function capaDoMaximizar\(na\?: boolean\): boolean \{\n {2}if \(!import\.meta\.client\) return false/)
  const janela = ler('app/components/espiar/EspiarAtivo.vue')
  // a capa cobre do fim do que fica no alto (o aviso de cookies e o recado também) e põe o conteúdo onde a página nova começa
  assert.match(janela, /querySelectorAll<HTMLElement>\('\.nuh-wrap, \.ck, \.nut-wrap, \.nsr-wrap, \.rfx'\)/)
  assert.match(janela, /getPropertyValue\('--nuh-h-normal'\)/)
  assert.match(ler('app/composables/useTopo.ts'), /setProperty\('--nuh-h-normal', `\$\{a\.normal\}px`\)/)
  // a capa só sai com a página pronta, um erro, a navegação que não aconteceu ou o teto
  assert.match(janela, /hookOnce\('page:finish', \(\) => sair\('pronta'\)\)/)
  assert.match(janela, /hookOnce\('app:error', \(\) => sair\('erro'\)\)/)
  assert.match(janela, /const TETO_MS = 8000/)
  // movimento reduzido: navega direto, sem capa
  assert.match(janela, /if \(!el \|\| calmo\(\)\) \{ espiar\.fechar\(false\); await navigateTo\(alvo\); return \}/)
})

/* ——— 3. a barra do Nuxt ——— */

test('toda navegação tem a barra do Nuxt em cobalto, 2px, escondida durante o maximizar', () => {
  const app = ler('app/app.vue')
  assert.match(app, /<NuxtLoadingIndicator color="var\(--nu-blue\)" error-color="var\(--nu-red\)" :height="2" :estimated-progress="progressoEstimado" \/>/)
  assert.match(app, /if \(calmo\?\.matches\) return 50/, 'movimento reduzido: parada')
  // o AssumirSessao segue o primeiro filho (o onMounted dele é o primeiro da árvore)
  assert.match(app, /<div>\n {4}<AssumirSessao \/>/)
  const janela = ler('app/components/espiar/EspiarAtivo.vue')
  assert.match(janela, /html\.nu-maximizando \.nuxt-loading-indicator \{ opacity: 0 !important; \}/)
  assert.match(janela, /document\.documentElement\.classList\.add\('nu-maximizando'\)/)
  // a barra volta só quando a dela já sumiu (senão piscaria cheia no fim)
  assert.match(janela, /watch\(indicador\.isLoading, \(v\) => \{ if \(!v\)/)
})
