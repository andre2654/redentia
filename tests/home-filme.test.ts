/**
 * O filme de lançamento no herói do visitante (13/11/2026; o dono: "vamos
 * trocar a hero para quando não tem usuário logado para mostrar o nosso vídeo
 * em full"). O que este teste segura é o contrato da peça: o filme aparece
 * inteiro, só toca sozinho quando pode, não baixa vídeo de quem pediu economia
 * ou menos movimento, o som é escolha de quem vê, e sempre dá para parar.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const raiz = new URL('../', import.meta.url)
const ler = (p: string) => readFileSync(new URL(p, raiz), 'utf8')
const filme = ler('app/components/home/HomeFilme.vue')
const molde = filme.slice(filme.indexOf('<template>'), filme.lastIndexOf('</template>'))
const estilo = filme.slice(filme.indexOf('<style scoped>'))

test('o vídeo nasce parado, sem som e sem pedir nada: quem decide tocar é a página, depois de montar', () => {
  const tag = molde.match(/<video\b[\s\S]*?>/)![0]
  // sem `autoplay` no HTML: o navegador tocaria antes de a página saber se a pessoa pediu menos movimento
  assert.doesNotMatch(tag, /\bautoplay\b/)
  assert.match(tag, /\bmuted\b/)
  assert.match(tag, /\bplaysinline\b/)
  assert.match(tag, /preload="none"/)
  // repete só enquanto está sem som: com som ele toca uma vez e para no cartão final
  assert.match(tag, /:loop="!comSom"/)
  // o teclado para nos botões, não no vídeo
  assert.match(tag, /tabindex="-1"/)
  assert.match(tag, /aria-label="Filme de lançamento da Aportou, com 52 segundos"/)
})

test('só toca sozinho quando pode: sem movimento reduzido e sem economia de dados', () => {
  assert.match(filme, /if \(window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) return false/)
  assert.match(filme, /return !rede\?\.saveData/)
  // quem não pode fica com a capa e o botão; nenhum vídeo é pedido (preload="none" e nenhum play)
  assert.match(filme, /if \(!podeSozinho\(\)\) \{ espera\.value = true; return \}/)
  // o navegador recusou tocar: a capa com o botão
  assert.match(filme, /catch \{ if \(!noAr\.value\) espera\.value = true \}/)
  assert.match(molde, /<button v-if="espera" type="button" class="hfi__assistir" @click="assistir">/)
  assert.match(molde, /Assistir ao filme <span class="hfi__assistir-tempo">52 s<\/span>/)
})

test('a capa é o quadro em que o filme começa: imagem primeiro, e a primeira volta parte dela', () => {
  assert.match(filme, /const COMECA_EM = 1\.5\n/)
  // a capa é uma imagem de verdade (é o maior elemento da dobra), com a versão em pé para o celular
  assert.match(molde, /<source :media="EM_PE" :srcset="`\$\{BASE\}-9x16\.webp`" width="864" height="1536">/)
  assert.match(molde, /<img ref="capa" class="hfi__capa" :src="`\$\{BASE\}-16x9\.webp`" width="1920" height="1080" alt="" fetchpriority="high" decoding="async" @load="medir">/)
  assert.match(filme, /const EM_PE = '\(max-width: 640px\) and \(orientation: portrait\)'/)
  // a primeira volta começa no quadro da capa, e o vídeo só toma o lugar dela quando chega lá
  assert.match(filme, /daCapa = true\n  v\.muted = true\n  v\.currentTime = COMECA_EM\n  void tocar\(\)/)
  assert.match(filme, /if \(daCapa && !v\.paused && v\.currentTime >= COMECA_EM - 0\.05\) \{ daCapa = false; noAr\.value = true; ligarLaterais\(\) \}/)
  // o Safari ignora o tempo marcado antes dos metadados
  assert.match(filme, /if \(v && daCapa && v\.currentTime < COMECA_EM - 0\.05\) v\.currentTime = COMECA_EM/)
  assert.match(estilo, /\.hfi__video \{ opacity: 0;/)
  assert.match(estilo, /\.hfi--no-ar \.hfi__video \{ opacity: 1; \}/)
  // e a capa sai quando a troca acaba: por baixo, ela aparecia através da beira esfumada do vídeo (uma faixa escura
  // de alto a baixo na emenda, nas cenas claras)
  assert.match(estilo, /\.hfi__capa \{ transition: visibility var\(--nu-dur-media\); \}\n\.hfi--no-ar \.hfi__capa \{ visibility: hidden; \}/)
})

test('os arquivos: HEVC primeiro, H.264 de reserva, o 9:16 para o celular em pé', () => {
  const fontes = [...molde.matchAll(/<source (?::media="EM_PE" )?:src="`\$\{BASE\}-([^`]+)`" type="([^"]+)">/g)].map((m) => [m[1], m[2]])
  assert.deepEqual(fontes, [
    ['9x16.hevc.mp4', 'video/mp4; codecs=&quot;hvc1.1.6.L120.90, mp4a.40.2&quot;'],
    ['9x16.mp4', 'video/mp4; codecs=&quot;avc1.640028, mp4a.40.2&quot;'],
    ['16x9.hevc.mp4', 'video/mp4; codecs=&quot;hvc1.1.6.L120.90, mp4a.40.2&quot;'],
    ['16x9.mp4', 'video/mp4; codecs=&quot;avc1.640029, mp4a.40.2&quot;'],
  ])
  // as duas primeiras são as do celular em pé
  assert.equal((molde.match(/<source :media="EM_PE" :src=/g) ?? []).length, 2)
  assert.match(filme, /const BASE = '\/video\/aportou-lancamento'/)
  // as capas estão no repositório (os vídeos podem morar fora dele; as capas seguram a dobra)
  for (const capa of ['16x9', '9x16']) assert.ok(existsSync(new URL(`public/video/aportou-lancamento-${capa}.webp`, raiz)), capa)
})

test('o som é escolha de quem vê, e o filme sempre pode ser parado', () => {
  // ligar o som recomeça do início, com som
  assert.match(filme, /comSom\.value = true\n  v\.muted = false\n  terminou\.value = false\n  daCapa = false\n  v\.currentTime = 0\n  querTocar = true\n  void tocar\(\)/)
  // desligar volta ao repetir (o loop segue o som)
  assert.match(filme, /if \(comSom\.value\) \{ comSom\.value = false; v\.muted = true; return \}/)
  // os botões dizem o que fazem e o estado do som
  assert.match(molde, /:aria-label="terminou \? 'Ver o filme de novo' : tocando \? 'Pausar o filme' : 'Tocar o filme'"/)
  assert.match(molde, /:aria-pressed="comSom" :aria-label="comSom \? 'Desligar o som do filme' : 'Ativar o som do filme'"/)
  // para sozinho fora da tela e com a aba escondida, e volta se a pessoa não tiver pausado
  assert.match(filme, /aVistaNaTela = !!e && e\.intersectionRatio > 0\.2; aVista = aVistaNaTela && !document\.hidden; acertar\(\)/)
  assert.match(filme, /document\.addEventListener\('visibilitychange', aoMudarDeAba\)/)
  assert.match(filme, /if \(querTocar && aVista && !terminou\.value\) \{ if \(v\.paused\) void tocar\(\) \}\n  else if \(!v\.paused\) v\.pause\(\)/)
})

test('o filme cabe inteiro e na primeira dobra, acima da barra do chat', () => {
  // inteiro (contain), na largura toda, até o teto da dobra
  assert.match(estilo, /grid-area: 1 \/ 1; display: block; width: 100%; height: auto; aspect-ratio: 16 \/ 9; max-height: var\(--hfi-teto\); object-fit: contain;/)
  assert.match(estilo, /@media \(max-width: 640px\) and \(orientation: portrait\) \{\n  \.hfi__capa, \.hfi__video \{ aspect-ratio: 9 \/ 16; \}/)
  // o teto desconta o que há em cima: medido ao montar; antes disso, a navegação, a régua e o aviso de cookies
  assert.match(estilo, /--hfi-em-cima: var\(--hfi-topo, calc\(var\(--nuh-h-normal, 72px\) \+ var\(--nut-h, 44px\) \+ var\(--hfi-aviso, 0px\)\)\);/)
  assert.match(estilo, /html\[data-ck='open'\] \.hfi \{ --hfi-aviso: 53px; \}/)
  // e desconta a barra do chat, que flutua no pé: o filme acaba acima dela (ela cobria as letras miúdas do 16:9)
  assert.match(estilo, /--hfi-chat: 88px;\n  --hfi-teto: max\(calc\(100vh - var\(--hfi-em-cima\) - var\(--hfi-chat\)\), 35vw\);/)
  assert.match(estilo, /\.hfi \{ --hfi-teto: max\(calc\(100svh - var\(--hfi-em-cima\) - var\(--hfi-chat\)\), 35vw\); \}/)
  // a medida vale para a página no alto: rolada, o header está encolhido, e a diferença volta para a conta (sem isso
  // um redimensionar com a página rolada deixava o filme 12px mais alto, por baixo da barra do chat)
  assert.match(filme, /topo\.value = Math\.round\(el\.getBoundingClientRect\(\)\.top \+ window\.scrollY \+ Math\.max\(0, normal - atual\)\)/)
  assert.match(filme, /const normal = parseFloat\(css\.getPropertyValue\('--nuh-h-normal'\)\) \|\| 0\n  const atual = parseFloat\(css\.getPropertyValue\('--nuh-h'\)\) \|\| normal/)
  // e acompanha o aviso de cookies: ao fechar, o palco sobe e o filme cresce junto (ficava um vão preto até a barra)
  assert.match(filme, /const \{ aberto: avisoAberto \} = useConsent\(\)/)
  assert.match(filme, /watch\(avisoAberto, \(\) => \{ if \(import\.meta\.client\) seguirOTopo\(\) \}\)/)
  assert.match(filme, /const passo = \(\) => \{ medir\(\); seguindo = performance\.now\(\) < ate \? requestAnimationFrame\(passo\) : 0 \}/)
  assert.match(filme, /cancelAnimationFrame\(seguindo\)\n  window\.removeEventListener\('resize', medir\)/)
})

test('as laterais continuam a beira do filme até a beira da janela', () => {
  // a tela de trás: duas colunas para a beira esquerda, duas para a direita, 17 linhas
  assert.match(molde, /<canvas ref="laterais" class="hfi__laterais" width="4" height="17" aria-hidden="true" \/>/)
  // cada lateral é a tira de fora do quadro de agora (3% da largura), esticada
  assert.match(filme, /const BEIRA = 0\.03\n/)
  assert.match(filme, /primeiro\.pincel\.drawImage\(fonte, 0, 0, tira, a, 0, 0, meio, primeiro\.tela\.height\)\n    primeiro\.pincel\.drawImage\(fonte, l - tira, 0, tira, a, meio, 0, meio, primeiro\.tela\.height\)/)
  // encolhida pela metade a cada degrau (a média certa em qualquer navegador: o grão do filme não faz a faixa tremer)
  assert.match(filme, /for \(let l = 64, a = 544; l >= 4; l \/= 2, a \/= 2\) \{/)
  // sem desfoque nem brilho por cima: a cor é a do filme, senão a emenda aparece
  const regra = estilo.match(/\.hfi__laterais \{[^}]*\}/)![0]
  assert.doesNotMatch(regra, /filter|opacity|transform/)
  // só é pintada quando há faixa para mostrar, e algumas vezes por segundo
  assert.match(filme, /if \(!tela \|\| !fonte \|\| !temFaixa\) return/)
  assert.match(filme, /relogio = setInterval\(\(\) => pintarLaterais\(video\.value\), 160\)/)
  // a beira do filme se desfaz na lateral
  assert.match(estilo, /\.hfi--faixa \.hfi__capa, \.hfi--faixa \.hfi__video \{\n  -webkit-mask-image: linear-gradient\(90deg, transparent var\(--hfi-faixa\),/)
})

test('o filme só usa token: sem cor em hex, sem peso em número, sem curva nem tempo à mão; e respeita movimento reduzido', () => {
  const css = estilo.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'cor em hex')
  assert.doesNotMatch(css, /font-weight:\s*\d/, 'peso em número')
  assert.doesNotMatch(css, /font-size:\s*\d/, 'tamanho de letra fora da escala')
  assert.doesNotMatch(css, /cubic-bezier|\b\d+(\.\d+)?m?s\s+(ease|linear)/, 'curva ou tempo à mão')
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{/)
})
