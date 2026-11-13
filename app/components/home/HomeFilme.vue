<script setup lang="ts">
// O filme de lançamento, no herói do visitante (13/11/2026; o dono, com o
// filme na mão: "vamos trocar a hero para quando não tem usuário logado para
// mostrar o nosso vídeo em full").
//
// O filme ocupa a largura inteira da tela, inteiro (sem cortar: as letras
// miúdas dele, "Simulação com carteira de exemplo. Não é promessa de retorno.",
// ficam à vista), até o limite da primeira dobra. No celular em pé entra a
// versão 9:16; nos demais, a 16:9. Ele tem 52 segundos e texto próprio do
// começo ao fim, então nada da página escreve por cima dele.
//
// COMO ELE COMEÇA
//  - A capa é uma imagem (o quadro "Sua carteira é boa?", a 1,5 s do filme),
//    que chega antes de qualquer vídeo e é o maior elemento da dobra. O vídeo
//    só é pedido depois que a página monta.
//  - Sem som e sozinho, como o navegador permite, e começando do mesmo quadro
//    da capa: a imagem parada vira filme sem voltar atrás. Depois ele repete
//    do começo.
//  - Com "movimento reduzido", com economia de dados ou quando o navegador
//    recusa, ele não toca sozinho e nenhum vídeo é baixado: fica a capa com o
//    botão "Assistir ao filme", que toca com som.
//
// O SOM é escolha de quem vê: "Ativar som" recomeça o filme do início, com
// som, e aí ele toca uma vez só e para no cartão final (com som, repetir
// cansa). Desligar o som volta ao repetir.
//
// ELE PARA SOZINHO quando sai da tela ou a aba fica escondida, e volta de onde
// parou (se a pessoa não tiver pausado). O botão de pausa está sempre à vista:
// o que se mexe sozinho por mais de 5 segundos precisa de um jeito de parar
// (WCAG 2.2.2). Os dois botões ficam no canto de cima à direita: embaixo estão
// as letras miúdas do filme e a barra do chat, que no celular cobria o botão
// do som.
//
// AS LATERAIS. O filme cabe inteiro, então numa janela mais larga que 16:9
// sobram faixas dos lados. Elas continuam o filme: cada linha da faixa tem a
// cor em que o filme acaba naquela altura (a média dos 3% de fora), então o
// fundo dele segue até a beira da janela e a emenda some. Para isso há uma
// tela minúscula (4 por 17) atrás do filme, esticada no palco: as duas colunas
// da esquerda são a beira esquerda do quadro de agora e as duas da direita, a
// beira direita. Ela é refeita algumas vezes por segundo, só quando há faixa.
// (A primeira versão ampliava o quadro inteiro com desfoque, como uma luz na
// parede. Como o filme é mais escuro nas beiras do que no meio, as faixas
// ficavam mais claras que a borda dele e o filme parecia uma caixa.)
//
// O TETO é a primeira dobra inteira: a altura da janela menos o que há em cima
// do palco. Antes de a página montar, é a navegação, a régua e, se o aviso de
// cookies estiver aberto, uma estimativa dele; depois de montar, a peça mede
// onde o palco começa de fato. Numa janela baixa demais o filme não encolhe
// além de 35% da largura da tela.
// A medida vale para a página no alto: com a página rolada o header está
// encolhido e o palco fica uns 12px mais acima, e essa diferença é devolvida
// (--nuh-h-normal menos --nuh-h, como no EspiarAtivo). E ela acompanha o aviso
// de cookies: quando a pessoa escolhe, o aviso recolhe, o palco sobe e o filme
// cresce junto, quadro a quadro, até encostar de novo na barra do chat (sem
// isso ficava um vão preto de 58px entre os dois; 82px no celular).
//
// A BARRA DO CHAT SAI DA FRENTE (dono, 13/11/2026). Flutuando no pé da janela,
// ela cobria as letras miúdas do 16:9 ("Simulação com carteira de exemplo. Não
// é promessa de retorno."); encaixada embaixo do filme, roubava a dobra (o
// filme ficava com 1.070 de 1.512 px de largura num Mac de 14"). Enquanto a
// barra ficaria em cima do filme, a peça marca o <html>
// (data-chat-barra="fora") e a barra desce e some (ChatBarra); quando a página
// rola e o filme sobe acima dela, ela volta.
//
// A SETA DE ROLAR fica no lugar dela, no centro de baixo (o dono: "e mostrar
// um símbolo no canto inferior que a pessoa pode rolar para baixo"; e, vendo a
// primeira, no canto esquerdo: "queria que fosse centralizado esse ícone e mais
// bonito"). É uma cápsula de vidro, como os controles, com duas divisas; ela
// desce e volta três vezes e para (nada de animação sem fim). O toque leva ao
// título; ela some junto com a barra que volta. O centro de baixo é onde o
// filme às vezes escreve (a letra miúda do 16:9 na cena do número e no cartão
// final, e as telas do app no 9:16): nesses trechos, medidos quadro a quadro,
// a seta sai de cena e volta depois (TEXTO_NO_PE).
//
// OS ARQUIVOS ficam em public/video: HEVC primeiro (iPhone, Mac e Chrome
// tocam, e pesa a metade) e H.264 de reserva. Os dois têm um quadro-chave em
// 1,5 s, para o começo na capa ser imediato.

/** onde o filme começa na primeira vez: o quadro da capa */
const COMECA_EM = 1.5
const BASE = '/video/aportou-lancamento'
/** o celular em pé recebe o 9:16 */
const EM_PE = '(max-width: 640px) and (orientation: portrait)'

const emit = defineEmits<{ /** a seta de rolar: o herói leva a página ao título */ descer: [] }>()

const palco = ref<HTMLElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const capa = ref<HTMLImageElement | null>(null)
const laterais = ref<HTMLCanvasElement | null>(null)
/** onde o palco começa na página, em px (medido ao montar: o aviso de cookies aberto empurra o palco para baixo) */
const topo = ref<number | null>(null)
/** a largura de cada faixa lateral, em px (0 quando o filme vai de beira a beira) */
const faixa = ref(0)
/** o vídeo já pintou e está no ar (antes disso, quem aparece é a capa) */
const noAr = ref(false)
const tocando = ref(false)
const comSom = ref(false)
/** chegou ao cartão final (só acontece com som: sem som ele repete) */
const terminou = ref(false)
/** não tocou sozinho (movimento reduzido, economia de dados, navegador recusou): a capa com o botão */
const espera = ref(false)
/** quanto do filme já passou, de 0 a 1 */
const andamento = ref(0)

/** o que a pessoa quer: tocando (o padrão) ou pausado por ela */
let querTocar = true
/** a primeira volta, sozinha, começa no quadro da capa: até o filme chegar lá, quem aparece é a capa */
let daCapa = false
/** o palco está na tela e a aba à vista */
let aVista = true
let olho: IntersectionObserver | null = null
/** o aviso de cookies fica em cima do palco: aberto ou fechado, muda onde o palco começa */
const { aberto: avisoAberto } = useConsent()

/** os trechos do filme (em segundos) em que há texto no centro de baixo, onde a seta fica: medidos quadro a quadro, quatro
 *  por segundo, na área dela (13/11/2026). Filme novo: medir de novo (docs/aportou/decisoes.md, "O filme no herói") */
const TEXTO_NO_PE: Record<'deitado' | 'emPe', Array<[number, number]>> = {
  // o celular com o chat (86%), a letra miúda da cena do número, a notificação do BB, a barra do app, o cartão final
  deitado: [[11.5, 13.6], [19, 23.4], [26, 27.8], [41.9, 42.6], [48.9, 60]],
  // no 9:16 as telas do app descem até o pé: a barra de abas, o 86%, o gráfico, o BB, o "Aportou", os R$ 102 mil, o "só lê"
  emPe: [[5, 9.3], [11.5, 13.6], [19, 23.4], [26, 27.8], [30.5, 31.6], [35.5, 37.3], [40, 41.8]],
}
/** o tempo chega a cada quarto de segundo: a seta sai um pouco antes do texto entrar */
const ANTES_DO_TEXTO = 0.35
/** o filme está escrevendo onde a seta fica? */
const textoNoPe = ref(false)

/* ————— a barra do chat sai da frente do filme ————— */
/** a barra do chat ficaria em cima do filme? Na chegada, sim (o filme enche a dobra); a página confere ao montar */
const cobre = ref(true)
/** onde a barra começa, contando do pé da janela, com 5 px de folga: 20 + 63 no computador, 12 + 53 no celular (ChatBarra) */
const BARRA_NO_PE = { computador: 88, celular: 74 }
function verSeCobre() {
  const el = palco.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const barra = window.innerHeight - (window.matchMedia('(max-width: 760px)').matches ? BARRA_NO_PE.celular : BARRA_NO_PE.computador)
  cobre.value = r.bottom > barra && r.top < barra
}
useNuScrollFrame(verSeCobre)
// a barra lê a marca no <html> (já no HTML do servidor: ela nem aparece na chegada)
useHead(() => ({ htmlAttrs: { 'data-chat-barra': cobre.value ? 'fora' : undefined } }))

function podeSozinho(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const rede = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return !rede?.saveData
}
async function tocar() {
  const v = video.value
  if (!v) return
  try { await v.play() }
  catch { if (!noAr.value) espera.value = true }
}
/** segue o que a pessoa quer e o que está à vista */
function acertar() {
  const v = video.value
  if (!v || espera.value) return
  if (querTocar && aVista && !terminou.value) { if (v.paused) void tocar() }
  else if (!v.paused) v.pause()
}

function alternarTocar() {
  const v = video.value
  if (!v) return
  if (espera.value) { assistir(); return }
  if (terminou.value) { terminou.value = false; daCapa = false; v.currentTime = 0; querTocar = true; void tocar(); return }
  querTocar = v.paused
  acertar()
}
function alternarSom() {
  const v = video.value
  if (!v) return
  if (comSom.value) { comSom.value = false; v.muted = true; return }
  // com som, do começo: quem liga o som quer ver o filme
  comSom.value = true
  v.muted = false
  terminou.value = false
  daCapa = false
  v.currentTime = 0
  querTocar = true
  void tocar()
}
/** o botão da capa, para quem o filme não tocou sozinho: toca com som, do começo */
function assistir() {
  const v = video.value
  if (!v) return
  espera.value = false
  comSom.value = true
  v.muted = false
  daCapa = false
  v.currentTime = 0
  querTocar = true
  void tocar()
}

/* ————— as laterais: a beira do filme continua até a beira da janela ————— */
/** a tira de fora do filme que dá a cor de cada lateral: 3% da largura dele */
const BEIRA = 0.03
type Degrau = { tela: HTMLCanvasElement, pincel: CanvasRenderingContext2D }
/** as telas de trabalho: a tira esquerda e a direita lado a lado, encolhidas pela metade a cada degrau */
let degraus: Degrau[] | null = null
let pincel: CanvasRenderingContext2D | null = null
let relogio: ReturnType<typeof setInterval> | null = null
/** há faixa dos lados para mostrar? Sem faixa, nada é pintado */
let temFaixa = false
/** 64×544, 32×272, 16×136, 8×68 e 4×34; o degrau seguinte é a tela à vista, de 4×17 (17 linhas: o que cruza a beira
 *  do filme, um raio do leque ou a quina de um aparelho, vira uma mancha suave, não um risco esticado). Encolher pela
 *  metade de cada vez dá a média certa em qualquer navegador (de uma vez só, o navegador pula pontos, e o grão do
 *  filme faria a faixa tremer) */
function montarDegraus(): Degrau[] {
  const lista: Degrau[] = []
  for (let l = 64, a = 544; l >= 4; l /= 2, a /= 2) {
    const tela = document.createElement('canvas')
    tela.width = l
    tela.height = a
    const p = tela.getContext('2d')
    if (p) lista.push({ tela, pincel: p })
  }
  return lista
}
function pintarLaterais(fonte: HTMLVideoElement | HTMLImageElement | null) {
  const tela = laterais.value
  if (!tela || !fonte || !temFaixa) return
  const [l, a] = fonte instanceof HTMLVideoElement ? [fonte.videoWidth, fonte.videoHeight] : [fonte.naturalWidth, fonte.naturalHeight]
  if (!l || !a) return
  degraus ??= montarDegraus()
  pincel ??= tela.getContext('2d')
  const primeiro = degraus[0]
  if (!pincel || !primeiro) return
  const tira = Math.max(2, Math.round(l * BEIRA))
  const meio = primeiro.tela.width / 2
  try {
    // a tira da esquerda na metade esquerda, a da direita na metade direita
    primeiro.pincel.drawImage(fonte, 0, 0, tira, a, 0, 0, meio, primeiro.tela.height)
    primeiro.pincel.drawImage(fonte, l - tira, 0, tira, a, meio, 0, meio, primeiro.tela.height)
    let antes = primeiro
    for (const d of degraus.slice(1)) { d.pincel.drawImage(antes.tela, 0, 0, d.tela.width, d.tela.height); antes = d }
    pincel.drawImage(antes.tela, 0, 0, tela.width, tela.height)
  }
  catch { /* a imagem ainda não chegou */ }
}
function ligarLaterais() {
  if (relogio || !temFaixa) return
  relogio = setInterval(() => pintarLaterais(video.value), 160)
}
function desligarLaterais() { if (relogio) { clearInterval(relogio); relogio = null } }
/** mede onde o palco começa (para o teto da dobra) e se sobra faixa em volta da imagem */
function medir() {
  const el = palco.value
  const img = capa.value
  if (!el || !img) return
  // onde o palco começa com a página no alto: rolada, o header está encolhido, e a diferença volta para a conta
  const css = getComputedStyle(document.documentElement)
  const normal = parseFloat(css.getPropertyValue('--nuh-h-normal')) || 0
  const atual = parseFloat(css.getPropertyValue('--nuh-h')) || normal
  topo.value = Math.round(el.getBoundingClientRect().top + window.scrollY + Math.max(0, normal - atual))
  // a caixa da imagem é a do palco; a imagem em si guarda a proporção (16:9 ou 9:16)
  const caixa = img.getBoundingClientRect()
  const proporcao = (img.naturalWidth || 16) / (img.naturalHeight || 9)
  faixa.value = Math.max(0, Math.round((caixa.width - caixa.height * proporcao) / 2))
  // qualquer faixa, até a de 3 px do 9:16 no celular (sem pintar, ela fica um fio escuro ao lado das cenas azuis)
  temFaixa = faixa.value > 0
  if (temFaixa) { pintarLaterais(noAr.value ? video.value : img); if (tocando.value) ligarLaterais() }
  else desligarLaterais()
  verSeCobre()
}

/** o que há em cima do palco está mudando de altura (o aviso de cookies recolhe ao fechar): mede a cada quadro até assentar */
let seguindo = 0
function seguirOTopo() {
  cancelAnimationFrame(seguindo)
  const ate = performance.now() + 600
  const passo = () => { medir(); seguindo = performance.now() < ate ? requestAnimationFrame(passo) : 0 }
  seguindo = requestAnimationFrame(passo)
}
watch(avisoAberto, () => { if (import.meta.client) seguirOTopo() })

/** os metadados chegaram: o Safari ignora o tempo marcado antes disso, então a primeira volta é posta no quadro da capa de novo */
function aoConhecer() {
  const v = video.value
  if (v && daCapa && v.currentTime < COMECA_EM - 0.05) v.currentTime = COMECA_EM
}
function aoTocar() {
  tocando.value = true
  terminou.value = false
  // na primeira volta o vídeo só toma o lugar da capa quando chega ao quadro dela (aoAndar)
  if (!daCapa) { noAr.value = true; ligarLaterais() }
}
function aoPausar() { tocando.value = false; desligarLaterais(); pintarLaterais(video.value) }
function aoTerminar() { terminou.value = true; tocando.value = false; desligarLaterais(); pintarLaterais(video.value) }
function aoAndar() {
  const v = video.value
  if (!v) return
  if (v.duration > 0) andamento.value = Math.min(1, v.currentTime / v.duration)
  const trechos = TEXTO_NO_PE[v.currentSrc.includes('9x16') ? 'emPe' : 'deitado']
  const t = v.currentTime
  textoNoPe.value = trechos.some(([de, ate]) => t >= de - ANTES_DO_TEXTO && t <= ate)
  if (daCapa && !v.paused && v.currentTime >= COMECA_EM - 0.05) { daCapa = false; noAr.value = true; ligarLaterais() }
}
function aoMudarDeAba() { aVista = !document.hidden && aVistaNaTela; acertar() }
let aVistaNaTela = true

onMounted(() => {
  const v = video.value
  if (!v) return
  medir()
  // o teto muda com a medida: a segunda mede a faixa já no tamanho certo
  void nextTick(medir)
  window.addEventListener('resize', medir)
  if (typeof IntersectionObserver !== 'undefined' && palco.value) {
    olho = new IntersectionObserver(([e]) => { aVistaNaTela = !!e && e.intersectionRatio > 0.2; aVista = aVistaNaTela && !document.hidden; acertar() }, { threshold: [0, 0.2, 0.6] })
    olho.observe(palco.value)
  }
  document.addEventListener('visibilitychange', aoMudarDeAba)
  if (!podeSozinho()) { espera.value = true; return }
  // sem som e do quadro da capa; sem metadados ainda, isto marca de onde o filme vai começar
  daCapa = true
  v.muted = true
  v.currentTime = COMECA_EM
  void tocar()
})
onBeforeUnmount(() => {
  olho?.disconnect()
  desligarLaterais()
  cancelAnimationFrame(seguindo)
  window.removeEventListener('resize', medir)
  document.removeEventListener('visibilitychange', aoMudarDeAba)
})
</script>

<template>
  <div
    ref="palco" class="hfi" :class="{ 'hfi--no-ar': noAr, 'hfi--espera': espera, 'hfi--fim': terminou, 'hfi--faixa': faixa > 12 }"
    :style="topo != null ? { '--hfi-topo': `${topo}px`, '--hfi-faixa': `${faixa}px` } : undefined"
  >
    <!-- as laterais, atrás do filme: a beira dele continuada até a beira da janela, quando a janela é mais larga que o filme -->
    <canvas ref="laterais" class="hfi__laterais" width="4" height="17" aria-hidden="true" />
    <!-- a capa: o quadro em que o filme começa. É ela que a página pinta primeiro -->
    <picture>
      <source :media="EM_PE" :srcset="`${BASE}-9x16.webp`" width="864" height="1536">
      <img ref="capa" class="hfi__capa" :src="`${BASE}-16x9.webp`" width="1920" height="1080" alt="" fetchpriority="high" decoding="async" @load="medir">
    </picture>
    <video
      ref="video" class="hfi__video" muted playsinline preload="none" :loop="!comSom" tabindex="-1"
      aria-label="Filme de lançamento da Aportou, com 52 segundos"
      @click="alternarTocar" @loadedmetadata="aoConhecer" @playing="aoTocar" @pause="aoPausar" @ended="aoTerminar" @timeupdate="aoAndar"
    >
      <source :media="EM_PE" :src="`${BASE}-9x16.hevc.mp4`" type="video/mp4; codecs=&quot;hvc1.1.6.L120.90, mp4a.40.2&quot;">
      <source :media="EM_PE" :src="`${BASE}-9x16.mp4`" type="video/mp4; codecs=&quot;avc1.640028, mp4a.40.2&quot;">
      <source :src="`${BASE}-16x9.hevc.mp4`" type="video/mp4; codecs=&quot;hvc1.1.6.L120.90, mp4a.40.2&quot;">
      <source :src="`${BASE}-16x9.mp4`" type="video/mp4; codecs=&quot;avc1.640029, mp4a.40.2&quot;">
    </video>

    <!-- quanto do filme já passou -->
    <span class="hfi__andamento" aria-hidden="true"><span :style="{ transform: `scaleX(${andamento.toFixed(4)})` }" /></span>

    <!-- para quem o filme não tocou sozinho: a capa com o botão, que toca com som -->
    <button v-if="espera" type="button" class="hfi__assistir" @click="assistir">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
      Assistir ao filme <span class="hfi__assistir-tempo">52 s</span>
    </button>

    <div v-else class="hfi__controles">
      <button type="button" class="hfi__botao" :aria-label="terminou ? 'Ver o filme de novo' : tocando ? 'Pausar o filme' : 'Tocar o filme'" @click="alternarTocar">
        <svg v-if="terminou" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9" /><path d="M4 4v4.5h4.5" /></svg>
        <svg v-else-if="tocando" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
      </button>
      <button type="button" class="hfi__botao hfi__botao--som" :aria-pressed="comSom" :aria-label="comSom ? 'Desligar o som do filme' : 'Ativar o som do filme'" @click="alternarSom">
        <svg v-if="comSom" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z" fill="currentColor" /><path d="M15.5 9a4.2 4.2 0 0 1 0 6" /><path d="M18 6.5a8 8 0 0 1 0 11" /></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z" fill="currentColor" /><path d="m16 9.5 5 5m0-5-5 5" /></svg>
        <span v-if="!comSom" class="hfi__som-rotulo" aria-hidden="true">Ativar som</span>
      </button>
    </div>

    <!-- a seta de rolar: no centro de baixo, enquanto o filme enche a dobra (e sai de cena quando o filme escreve ali) -->
    <button
      type="button" class="hfi__descer" :class="{ 'hfi__descer--fora': !cobre, 'hfi__descer--texto': textoNoPe }"
      :tabindex="cobre ? 0 : -1" :aria-hidden="cobre ? undefined : 'true'" aria-label="Descer para o resto da página" @click="emit('descer')"
    >
      <svg width="20" height="28" viewBox="0 0 20 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path class="hfi__divisa" d="m4 6 6 6 6-6" />
        <path d="m4 15 6 6 6-6" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* o palco: a largura inteira da tela. O filme cabe inteiro (contain) e enche a primeira dobra: o teto é a altura da
   janela menos o que há em cima do palco (a barra do chat sai da frente: ChatBarra, html[data-chat-barra]).
   Em cima: depois de montar, a peça mede (--hfi-topo); antes, vale a navegação e a régua (que publicam a altura delas
   no <html>) e, com o aviso de cookies aberto, uma estimativa dele. O piso de 35vw é para a janela baixa demais */
.hfi {
  --hfi-em-cima: var(--hfi-topo, calc(var(--nuh-h-normal, 72px) + var(--nut-h, 44px) + var(--hfi-aviso, 0px)));
  --hfi-teto: max(calc(100vh - var(--hfi-em-cima)), 35vw);
  position: relative; isolation: isolate; display: grid; place-items: center; width: 100%; overflow: clip; background: var(--nu-agora-bg);
}
@supports (height: 100svh) {
  .hfi { --hfi-teto: max(calc(100svh - var(--hfi-em-cima)), 35vw); }
}
html[data-ck='open'] .hfi { --hfi-aviso: 53px; }
.hfi picture { display: contents; }
/* as laterais: a tela de 4 por 17 esticada no palco (o navegador alisa de uma linha para a outra). Só aparece onde o
   filme não chega, e cada linha tem a cor em que o filme acaba naquela altura */
.hfi__laterais { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; pointer-events: none; }
.hfi__capa, .hfi__video {
  grid-area: 1 / 1; display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; max-height: var(--hfi-teto); object-fit: contain;
}
/* com faixa dos lados, a beira do filme se desfaz na lateral (sem isso a emenda marca uma linha de alto a baixo) */
.hfi--faixa .hfi__capa, .hfi--faixa .hfi__video {
  -webkit-mask-image: linear-gradient(90deg, transparent var(--hfi-faixa), var(--nu-ink) calc(var(--hfi-faixa) + 48px), var(--nu-ink) calc(100% - var(--hfi-faixa) - 48px), transparent calc(100% - var(--hfi-faixa)));
  mask-image: linear-gradient(90deg, transparent var(--hfi-faixa), var(--nu-ink) calc(var(--hfi-faixa) + 48px), var(--nu-ink) calc(100% - var(--hfi-faixa) - 48px), transparent calc(100% - var(--hfi-faixa)));
}
/* o vídeo fica por cima da capa e só aparece quando já está tocando: a troca não pisca */
.hfi__video { opacity: 0; cursor: pointer; transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.hfi--no-ar .hfi__video { opacity: 1; }
/* e a capa sai quando a troca acaba (a visibilidade só muda no fim da transição). Ficando por baixo, ela aparecia
   através da beira esfumada do vídeo: nas cenas claras, uma faixa escura de alto a baixo bem na emenda */
.hfi__capa { transition: visibility var(--nu-dur-media); }
.hfi--no-ar .hfi__capa { visibility: hidden; }

/* o andamento: um fio na beira de baixo */
.hfi__andamento { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--nu-white-14); pointer-events: none; opacity: 0; transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.hfi--no-ar .hfi__andamento { opacity: 1; }
.hfi__andamento span { display: block; height: 100%; background: var(--nu-white-78); transform-origin: left center; transition: transform var(--nu-dur-media) linear; }

/* os controles, no canto de cima à direita: embaixo ficam as letras miúdas do filme e a seta de rolar.
   Nenhum texto do filme passa por esse canto */
.hfi__controles { position: absolute; right: clamp(12px, 2vw, 28px); top: clamp(12px, 1.6vw, 22px); display: flex; flex-direction: row-reverse; gap: 8px; }
.hfi__botao {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-width: 44px; height: 44px; padding: 0 13px;
  border: 0; border-radius: var(--nu-r-pill); color: var(--nu-white); cursor: pointer;
  background: color-mix(in srgb, var(--nu-ink) 56%, transparent); box-shadow: inset 0 0 0 1px var(--nu-white-18);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.hfi__botao:hover { background: color-mix(in srgb, var(--nu-ink) 78%, transparent); }
.hfi__botao:active { transform: scale(.95); }
.hfi__botao:focus-visible, .hfi__assistir:focus-visible, .hfi__descer:focus-visible { outline: 3px solid var(--nu-blue-on-dark); outline-offset: 2px; }
.hfi__botao--som { padding-inline: 13px 16px; }

/* a seta de rolar: uma cápsula de vidro no centro de baixo (acima do fio do andamento), com duas divisas, a de cima mais
   apagada, apontando para baixo. Some quando a página rola (--fora) e enquanto o filme escreve bem ali (--texto) */
.hfi__descer {
  position: absolute; left: 50%; bottom: clamp(14px, 1.8vw, 24px);
  display: grid; place-items: center; width: 38px; height: 56px; padding: 0;
  border: 0; border-radius: var(--nu-r-pill); color: var(--nu-white); cursor: pointer;
  background: color-mix(in srgb, var(--nu-ink) 44%, transparent); box-shadow: inset 0 0 0 1px var(--nu-white-18);
  -webkit-backdrop-filter: blur(16px) saturate(1.4); backdrop-filter: blur(16px) saturate(1.4);
  transform: translateX(-50%);
  transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida), background-color var(--nu-dur-media) var(--nu-ease-cor);
}
/* o alvo de toque passa de 44 px */
.hfi__descer::before { content: ''; position: absolute; inset: -4px; }
.hfi__descer:hover { background: color-mix(in srgb, var(--nu-ink) 72%, transparent); }
.hfi__descer:active { transform: translateX(-50%) scale(.95); }
.hfi__descer svg { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.hfi__descer:hover svg { transform: translateY(2px); }
.hfi__divisa { opacity: .45; }
.hfi__descer--fora { opacity: 0; transform: translate(-50%, 8px); pointer-events: none; }
/* o filme escreve onde a seta fica: ela sai de cena (para quem chegou nela pelo teclado, fica) */
.hfi__descer--texto:not(:focus-visible) { opacity: 0; pointer-events: none; }
/* depois que a página assenta, as divisas descem e voltam três vezes, e param */
.hfi__descer svg { animation: hfi-desce calc(var(--nu-dur-entrada) * 2) var(--nu-ease-troca) calc(var(--nu-dur-entrada) * 2) 3 backwards; }
@keyframes hfi-desce { 0%, 60%, 100% { transform: none; } 30% { transform: translateY(4px); } }
.hfi__botao--som[aria-pressed='true'] { padding-inline: 13px; }

/* a capa com o botão, para quem o filme não tocou sozinho */
.hfi__assistir {
  grid-area: 1 / 1; z-index: 1; display: inline-flex; align-items: center; gap: 10px; min-height: 56px; padding: 0 26px 0 22px; margin-top: 22%;
  border: 0; border-radius: var(--nu-r-pill); background: var(--nu-creme); color: var(--nu-ink); cursor: pointer;
  font: inherit; font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  box-shadow: var(--nu-shadow-float);
  transition: transform var(--nu-dur-rapida) var(--nu-ease-saida), background-color var(--nu-dur-media) var(--nu-ease-cor);
}
.hfi__assistir:hover { background: var(--nu-white); }
.hfi__assistir:active { transform: scale(.97); }
.hfi__assistir-tempo { color: var(--nu-gray); font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }

/* o celular em pé recebe o filme 9:16 (e o aviso de cookies ocupa mais linhas). O botão do som fica só com o ícone:
   com o rótulo ele alcançaria o texto do filme, que no 9:16 é centrado */
@media (max-width: 640px) {
  html[data-ck='open'] .hfi { --hfi-aviso: 73px; }
  .hfi__som-rotulo { display: none; }
  .hfi__botao--som { padding-inline: 13px; }
}
@media (max-width: 640px) and (orientation: portrait) {
  .hfi__capa, .hfi__video { aspect-ratio: 9 / 16; }
  .hfi__assistir { margin-top: 60%; }
}
@media (prefers-reduced-motion: reduce) {
  .hfi__video, .hfi__capa, .hfi__andamento, .hfi__andamento span, .hfi__botao, .hfi__assistir, .hfi__descer, .hfi__descer svg { transition: none; }
  .hfi__descer svg { animation: none; }
}
</style>
