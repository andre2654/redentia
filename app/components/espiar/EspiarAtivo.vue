<script setup lang="ts">
// A janelinha de espiar ativo (03/11/2026, pedido do dono: "quando clico nos
// ativos em qualquer lugar do app, ao invés de abrir direto a tela do ativo,
// acho que seria legal aparecer uma janelinha no canto inferior direito, só
// com detalhes, e podendo maximizar para aí sim ver a tela dos ativos").
//
// Montada uma vez no layout padrão. Quem abre é o plugin espiar-ativo.client
// (o clique em <a href="/asset/X">); o estado e a carga moram no
// useEspiarAtivo; a regra e as contas, em utils/espiarAtivo.ts.
//
// Diálogo NÃO modal: a página atrás continua viva (rolar, clicar em outro
// ativo troca o conteúdo). Esc fecha e o foco volta ao link de origem.
//
// Com o painel do chat: a janelinha anda para a esquerda dele e os dois ficam
// lado a lado no canto (o "Perguntar sobre X" abre o painel com o ativo
// anexado, e a pessoa lê os números enquanto escreve). Sem espaço para os
// dois (abaixo de ~860px), a janelinha dá lugar ao painel: o ativo já foi
// junto como anexo. No computador, a barra do chat vem para baixo do cartão,
// na largura dele, e pergunta sobre o ativo (dono, 12/11/2026: "deixar o input
// ali de ladinho"): o cartão e a pergunta ficam juntos no canto e a página
// fica livre. Por isso o "Perguntar sobre X" do cartão sai nessa hora: a
// barra é a pergunta. Onde a barra não vem (entre 641 e 760px ela é a
// cápsula), o cartão nunca a cobre: quando as duas se cruzam, ele sobe.
//
// No celular (até 640px) vira uma folha que sobe do pé: arrastar para baixo
// fecha, para cima maximiza. Enquanto ela está aberta, a barra do chat sai
// (a folha tem o próprio "Perguntar", e uma cápsula boiando sob a folha seria
// ruído). Abrir a janela não escreve no histórico: o Voltar segue sendo o da
// página (e, como toda navegação, fecha a janela). Um passo falso no
// histórico brigaria com o popstate do vue-router e deixaria um Voltar que
// "não faz nada" depois de fechar pelo X.
//
// Maximizar: o cartão cresce até a tela inteira e escurece até o céu do
// herói da página de ativo, segura o ticker e o preço enquanto a página
// carrega, e se desfaz sobre ela. Sem movimento: navega direto.
// Robustez (11/11/2026): o topo do /asset é creme desde a Aportou, então a capa
// do maximizar é o creme da página, com o nome e o preço no lugar e no tamanho
// do topo (a capa some sobre a página sem salto, e sem o clarão escuro de
// antes); o código é o NuSelo carvão e a variação, o selo pequeno; o cartão
// flutua com a sombra de flutuar; uma ação cheia só (Perguntar) e o resto é o
// link da base (NuLinkSeta; no erro, "Tentar de novo" sem seta); os tempos e
// as curvas são os dos tokens; o clique do maximizar vem na captura, antes do
// RouterLink (uma navegação só, a do fim do crescimento).
// Carregando (12/11/2026, o dono: "demora muito para abrir gráficos e etc.,
// temos que mostrar um loading"): a capa é o EspiarCapa, o topo do /asset no
// lugar dele, com a linha de 12 meses se desenhando no cartão do gráfico, o
// brilho que corre por ela enquanto a página não chega e a linha de progresso
// no alto. Ela cobre do fim do topo fixo para baixo (o header, o aviso de
// cookies, a régua e a faixa do recado ficam) e põe o conteúdo onde a página
// nova vai começar, no alto dela. A barra do Nuxt (app.vue) se esconde enquanto
// isso (html.nu-maximizando): uma barra só. A capa só sai com a página pronta
// (page:finish, depois da rolagem para o topo assentar), com um erro, com a
// navegação que não aconteceu ou no teto de 8 s; no teto, a barra do Nuxt
// volta e segue até a página chegar.
import { barraVisivel } from '~/utils/chat-painel'
import { ALTURA_BARRA_AO_LADO, barraAoLado, direitaDoCartao, LINHA_ALTURA, LINHA_LARGURA, VAO_BARRA_CARTAO } from '~/utils/espiarAtivo'
import type { ContextoDoChat } from '~/composables/useChatPainel'
import EspiarCapa, { type DadosDaCapa } from './EspiarCapa.vue'

const espiar = useEspiarAtivo()
const painel = useChatPainel()
const route = useRoute()
const nuxtApp = useNuxtApp()
const { isAuthenticated } = useAuthState()
const folha = useCadastroFolha()

const t = espiar.ticker
const vm = espiar.vm
const estado = espiar.estado
const aberto = computed(() => estado.value !== 'fechado' && !!t.value)
const idTitulo = useId()

const cartao = ref<HTMLElement | null>(null)
const celular = ref(false)
const direita = ref(16)
const pe = ref(20)
const desloc = ref(0)
const arrastando = ref(false)

const contexto = computed<ContextoDoChat | null>(() => (vm.value && t.value ? espiar.contextoParaChat(route.path) : null))

const pagina = computed(() => `/asset/${t.value ?? ''}`)
const triangulo = computed(() => (vm.value?.dir === 'down' ? 'esp__tri--baixo' : ''))
const tomDaVariacao = computed(() => (vm.value?.dir === 'down' ? 'vermelho' : vm.value?.dir === 'up' ? 'verde' : 'neutro'))
const pontoHoje = computed(() => (vm.value?.linha
  ? { top: `${(vm.value.linha.y / LINHA_ALTURA) * 100}%` }
  : {}))

/* ——— onde pousa ——— */
const MARGEM = 16
const PE_BARRA = 20
function calmo() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches }

function posicionar() {
  if (!import.meta.client || !aberto.value) return
  celular.value = window.matchMedia('(max-width: 640px)').matches
  if (celular.value) {
    // no celular a barra sai enquanto a folha está aberta (nunca vem ao lado)
    espiar.aoLado.value = false
    espiar.geometria.value = null
    // o painel no celular é a tela inteira: a folha dá lugar a ele
    if (painel.aberto.value) espiar.fechar(false)
    return
  }
  const css = getComputedStyle(document.documentElement)
  const w = parseFloat(css.getPropertyValue('--chat-painel-w')) || 440
  const m = parseFloat(css.getPropertyValue('--chat-painel-margem')) || 12
  const vw = document.documentElement.clientWidth
  const largura = cartao.value?.offsetWidth || 384
  // até 759px o painel é a tela inteira (ChatPainel)
  const painelOcupa = vw < 760 ? vw : w + 2 * m
  const d = direitaDoCartao({ vw, painelAberto: painel.aberto.value, painelOcupa, largura, margem: MARGEM })
  if (d == null) { espiar.fechar(false); return }
  direita.value = d
  // no computador a barra do chat vem para baixo do cartão (a ChatBarra segue o aoLado)
  const visivel = barraVisivel(route.path, painel.aberto.value)
  espiar.aoLado.value = barraAoLado({ vw, celular: false, barraVisivel: visivel })
  espiar.geometria.value = espiar.aoLado.value ? { direita: d, largura } : null
  if (espiar.aoLado.value) { pe.value = PE_BARRA + ALTURA_BARRA_AO_LADO + VAO_BARRA_CARTAO; return }
  // sem ela ao lado: se a barra cruza com o cartão na horizontal, o cartão sobe acima dela
  let bottom = PE_BARRA
  const barra = visivel ? document.querySelector<HTMLElement>('.cba') : null
  if (barra) {
    const b = barra.getBoundingClientRect()
    const x0 = vw - d - largura, x1 = vw - d
    if (b.width > 0 && b.right > x0 - 8 && b.left < x1 + 8) bottom = Math.max(PE_BARRA, window.innerHeight - b.top + 12)
  }
  pe.value = bottom
}

/* ——— abrir, trocar, fechar ——— */
watch(t, async (agora, antes) => {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('nu-espiar-aberto', !!agora)
  if (!agora) { desloc.value = 0; espiar.aoLado.value = false; espiar.geometria.value = null; return }
  await nextTick()
  posicionar()
  // abrir (ou trocar de ativo) leva o foco ao cartão; ele é não modal, o Tab segue pela página
  if (agora !== antes) cartao.value?.focus({ preventScroll: true })
})
watch(() => painel.aberto.value, () => { setTimeout(posicionar, 0) })
// o cartão muda de altura entre o esqueleto e o dado: a conta do pé não muda, mas a do painel sim
watch(estado, () => nextTick(posicionar))
// navegar fecha (o Voltar, um link do menu); o maximizar fecha por conta própria
watch(() => route.path, () => { if (aberto.value && !crescendo) espiar.fechar(false) })

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !aberto.value) return
  // um modal por cima (a folha de cadastro) fecha primeiro
  if (document.querySelector('[aria-modal="true"]')) return
  const dentro = !!cartao.value?.contains(document.activeElement)
  // com o painel aberto e o foco nele, o Esc é do painel
  if (painel.aberto.value && !dentro) return
  e.stopPropagation()
  espiar.fechar()
}

/* ——— as ações ——— */
function perguntar() {
  if (contexto.value) painel.abrir(undefined, [contexto.value])
}
function carteira() {
  if (isAuthenticated.value) { void navigateTo('/carteira'); return }
  // sem conta: a folha de cadastro, que no fim segue para a carteira
  folha.abrir({ gesto: 'carteira' }, () => true, '/carteira', () => navigateTo('/carteira'))
}

/* ——— maximizar: o cartão vira a página ——— */
let crescendo = false
const capa = ref<{ dados: DadosDaCapa; topo: number; conteudo: number } | null>(null)
const capaEl = ref<InstanceType<typeof EspiarCapa> | null>(null)
const indicador = useLoadingIndicator()
const TETO_MS = 8000

/** Liga e desliga a capa: a página do ativo sabe que chega por baixo dela, e a barra do Nuxt se esconde. */
function marcarCapa(na: boolean) {
  capaDoMaximizar(na)
  if (na) document.documentElement.classList.add('nu-maximizando')
}
/** A barra do Nuxt volta quando a dela já terminou de sumir (senão ela piscaria cheia no fim). */
function devolverBarra(agora = false) {
  const tira = () => document.documentElement.classList.remove('nu-maximizando')
  if (agora || !indicador.isLoading.value) { tira(); return }
  const teto = setTimeout(() => { pare(); tira() }, 1500)
  const pare = watch(indicador.isLoading, (v) => { if (!v) { clearTimeout(teto); pare(); tira() } })
}

type Chegada = 'pronta' | 'erro' | 'falhou' | 'teto'
/** A página nova pronta (o useAsyncData dela resolvido), um erro, a navegação que não aconteceu ou o teto. */
function esperarPagina() {
  let feito = false
  let avisar: (r: Chegada) => void = () => {}
  const p = new Promise<Chegada>((ok) => { avisar = ok })
  const teto = setTimeout(() => sair('teto'), TETO_MS)
  const tiraF = nuxtApp.hooks.hookOnce('page:finish', () => sair('pronta'))
  const tiraE = nuxtApp.hooks.hookOnce('app:error', () => sair('erro'))
  function sair(r: Chegada) {
    if (feito) return
    feito = true
    clearTimeout(teto)
    tiraF()
    tiraE()
    avisar(r)
  }
  return { p, desistir: () => sair('falhou') }
}
const quadro = () => new Promise<void>((ok) => { requestAnimationFrame(() => ok()) })

async function maximizar(e?: Event) {
  e?.preventDefault()
  if (!t.value || crescendo) return
  const alvo = pagina.value
  const el = cartao.value
  if (!el || calmo()) { espiar.fechar(false); await navigateTo(alvo); return }
  crescendo = true
  const r = el.getBoundingClientRect()
  const g = geometriaDaCapa()
  const v = vm.value
  capa.value = {
    dados: {
      ticker: t.value, nome: v?.nome ?? '', bolsa: v?.bolsa ?? 'B3', preco: v?.precoFmt ?? null,
      linha: v?.linha ? { serie: v.linha.serie, variacao: v.linha.variacao, dir: v.linha.dir } : null,
    },
    topo: g.topo,
    conteudo: g.conteudo,
  }
  marcarCapa(true)
  await nextTick()
  const c = capaEl.value
  if (!c) { capa.value = null; marcarCapa(false); devolverBarra(true); crescendo = false; espiar.fechar(false); await navigateTo(alvo); return }
  const cresce = c.crescer(r, celular.value ? '26px 26px 0 0' : '24px')
  espiar.fechar(false)
  const chegada = esperarPagina()
  // a navegação que não aconteceu (a mesma rota, um guarda que barrou) não espera o teto
  Promise.resolve(navigateTo(alvo)).then((x) => { if (x === false || x instanceof Error) chegada.desistir() }, () => chegada.desistir())
  const [, como] = await Promise.all([cresce, chegada.p])
  if (como === 'pronta') {
    await nextTick()
    // a página nova abre no topo: a rolagem vem um quadro depois do page:finish, e o header que
    // estava encolhido volta à altura dele no tempo do topo; a capa assenta no lugar final
    if (g.rolada) { await quadro(); await quadro() }
    if (g.encolhido) await new Promise((ok) => setTimeout(ok, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nu-dur-topo')) || 320))
    await c.sumir(true)
    capa.value = null
    capaDoMaximizar(false)
    devolverBarra()
  } else {
    // o teto, um erro ou a navegação que não aconteceu: a capa sai e a barra do Nuxt segue com o que falta
    devolverBarra(true)
    await c.sumir(false)
    capa.value = null
    capaDoMaximizar(false)
  }
  crescendo = false
}

/**
 * Onde a capa começa e onde o conteúdo da página nova vai estar. `topo`: o fim
 * do que fica no alto agora, de cima para baixo e sem vão (o header, o aviso
 * de cookies, a régua ou a faixa de seções, a faixa do recado): o corte do
 * ChatSeletor mais o aviso e o recado. `conteudo`: o começo do <main> com a
 * página no alto e o header na altura normal (--nuh-h-normal), que é como a
 * página nova abre.
 */
function geometriaDaCapa() {
  let y = 0
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('.nuh-wrap, .ck, .nut-wrap, .nsr-wrap, .rfx'))) {
    const q = el.getBoundingClientRect()
    if (q.height > 0 && q.top <= y + 1 && q.bottom > y) y = q.bottom
  }
  const css = getComputedStyle(document.documentElement)
  const normal = parseFloat(css.getPropertyValue('--nuh-h-normal')) || 0
  const atual = parseFloat(css.getPropertyValue('--nuh-h')) || normal
  const encolhido = normal - atual > 0.5
  const main = document.querySelector('main')
  const topo = Math.round(y)
  const conteudo = main ? main.getBoundingClientRect().top + window.scrollY + Math.max(0, normal - atual) : topo
  return { topo, conteudo, rolada: window.scrollY > 0, encolhido }
}

/* ——— celular: arrastar a folha ——— */
let arrasto: { id: number; y0: number; t0: number } | null = null
function onDown(e: PointerEvent) {
  if (!celular.value || e.button !== 0) return
  if ((e.target as Element | null)?.closest('a, button')) return
  arrasto = { id: e.pointerId, y0: e.clientY, t0: performance.now() }
  arrastando.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!arrasto || e.pointerId !== arrasto.id) return
  const dy = e.clientY - arrasto.y0
  // para baixo acompanha o dedo; para cima resiste (é o gesto de maximizar)
  desloc.value = dy > 0 ? dy : dy * 0.35
}
function onUp(e: PointerEvent) {
  if (!arrasto || e.pointerId !== arrasto.id) return
  const dy = e.clientY - arrasto.y0
  const v = dy / Math.max(1, performance.now() - arrasto.t0)
  arrasto = null
  arrastando.value = false
  if (dy > 110 || (dy > 30 && v > 0.6)) { espiar.fechar(); return }
  if (dy < -70) { desloc.value = 0; void maximizar(); return }
  desloc.value = 0
}

let desliga: (() => void) | null = null
onMounted(() => {
  desliga = espiar.registrar()
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', posicionar, { passive: true })
})
onBeforeUnmount(() => {
  desliga?.()
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', posicionar)
  document.documentElement.classList.remove('nu-espiar-aberto', 'nu-maximizando')
  capaDoMaximizar(false)
  espiar.aoLado.value = false
  espiar.geometria.value = null
})
</script>

<template>
  <Transition name="esp">
    <section
      v-if="aberto"
      ref="cartao"
      v-contexto-chat="contexto"
      class="esp"
      :class="{ 'esp--arrastando': arrastando, 'esp--com-barra': espiar.aoLado.value && !celular }"
      :style="celular ? { transform: desloc ? `translateY(${desloc}px)` : undefined } : { right: `${direita}px`, bottom: `${pe}px` }"
      role="dialog"
      aria-modal="false"
      :aria-labelledby="idTitulo"
      :aria-busy="estado === 'carregando'"
      tabindex="-1"
    >
      <header class="esp__topo" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
        <span class="esp__alca" aria-hidden="true" />
        <NuAssetLogo
          :ticker="t!" :letter="t!.charAt(0)"
          tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)"
          :size="40" :radius="12"
        />
        <div class="esp__id">
          <NuSelo :id="idTitulo" como="h2" tom="carvao" class="esp__ticker">{{ t }}</NuSelo>
          <p v-if="vm" class="esp__nome">{{ vm.nome }} · {{ vm.classeRotulo }}<template v-if="vm.bolsa !== 'B3'"> · {{ vm.bolsa }}</template></p>
          <NuSkeleton v-else-if="estado === 'carregando'" variant="line" width="132px" height="12px" radius="pill" class="esp__sk-nome" />
        </div>
        <span class="esp__acoes">
          <NuxtLink
            :to="pagina" data-sem-espiar class="esp__icone" :aria-label="`Abrir a página de ${t}`" title="Abrir a página"
            @click.capture="maximizar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></svg>
          </NuxtLink>
          <button type="button" class="esp__icone" :aria-label="`Fechar ${t}`" title="Fechar (Esc)" @click="espiar.fechar()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </span>
      </header>

      <Transition name="esp-troca" mode="out-in">
        <!-- o esqueleto no formato final: preço, linha, os quatro números, a frase e os botões -->
        <div v-if="estado === 'carregando'" key="sk" class="esp__corpo" aria-hidden="true">
          <div class="esp__preco-linha">
            <NuSkeleton variant="line" width="128px" height="26px" radius="chip" />
            <NuSkeleton variant="line" width="72px" height="14px" radius="pill" />
          </div>
          <NuSkeleton variant="block" height="64px" radius="chip" class="esp__sk-linha" />
          <div class="esp__nums">
            <div v-for="i in 4" :key="i" class="esp__num">
              <NuSkeleton variant="line" width="64%" height="10px" radius="pill" />
              <NuSkeleton variant="line" width="80%" height="16px" radius="pill" />
            </div>
          </div>
          <NuSkeleton variant="text" :lines="2" last-width="62%" class="esp__sk-texto" />
          <div class="esp__botoes">
            <NuSkeleton variant="pill" width="104px" height="40px" />
            <NuSkeleton variant="line" width="148px" height="14px" radius="pill" />
          </div>
          <NuSkeleton v-if="!espiar.aoLado.value || celular" variant="pill" width="100%" height="48px" class="esp__sk-perguntar" />
        </div>

        <div v-else-if="estado === 'erro'" key="erro" class="esp__corpo">
          <p class="esp__aviso" role="alert">Não conseguimos carregar {{ t }} agora. Tente de novo em instantes, ou abra a página do ativo.</p>
          <div class="esp__botoes">
            <NuLinkSeta seta="nenhuma" @click="espiar.recarregar()">Tentar de novo</NuLinkSeta>
            <NuLinkSeta :to="pagina" data-sem-espiar tom="tinta" @click.capture="maximizar">Abrir a página</NuLinkSeta>
          </div>
        </div>

        <div v-else-if="estado === 'saiu'" key="saiu" class="esp__corpo">
          <p class="esp__aviso">{{ espiar.mensagem.value }}</p>
          <div class="esp__botoes">
            <NuLinkSeta :to="pagina" data-sem-espiar tom="tinta" @click.capture="maximizar">Ver o histórico de {{ t }}</NuLinkSeta>
          </div>
        </div>

        <div v-else-if="vm" :key="`vm:${vm.ticker}`" class="esp__corpo">
          <p v-if="vm.precoFmt" class="esp__preco-linha">
            <span class="esp__preco">{{ vm.precoFmt }}</span>
            <NuSelo v-if="vm.variacaoFmt" :tom="tomDaVariacao" tamanho="p" class="esp__var">
              <svg width="9" height="9" viewBox="0 0 10 10" :class="triangulo" aria-hidden="true"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>{{ vm.variacaoFmt }}
            </NuSelo>
            <span v-if="vm.quando" class="esp__quando">{{ vm.quando }}</span>
          </p>

          <figure v-if="vm.linha" class="esp__linha">
            <div class="esp__linha-palco">
              <svg :viewBox.attr="`0 0 ${LINHA_LARGURA} ${LINHA_ALTURA}`" preserveAspectRatio="none" class="esp__linha-svg" aria-hidden="true">
                <path :d="vm.linha.d" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
              </svg>
              <span class="esp__hoje" :style="pontoHoje" aria-hidden="true" />
            </div>
            <figcaption class="esp__linha-leg">
              12 meses
              <b v-if="vm.linha.variacao" :class="`esp__leg--${vm.linha.dir}`">{{ vm.linha.variacao }}</b>
            </figcaption>
          </figure>

          <dl v-if="vm.indicadores.length" class="esp__nums">
            <div v-for="i in vm.indicadores" :key="i.rotulo" class="esp__num">
              <dt>{{ i.rotulo }}</dt>
              <dd>{{ i.valor }}</dd>
            </div>
          </dl>

          <div v-if="vm.porQue" class="esp__porque">
            <p class="esp__rotulo">{{ vm.porQue.titulo }}</p>
            <p class="esp__porque-texto">{{ vm.porQue.texto }}</p>
            <p class="esp__fonte"><MarcaCorte :largura="14" />Leitura da Aportou<template v-if="vm.porQue.fonte"> · {{ vm.porQue.fonte }}</template></p>
          </div>

          <div class="esp__botoes">
            <SeguirAtivo :ticker="vm.ticker" :path="`/asset/${vm.ticker}`" />
            <NuLinkSeta tom="tinta" @click="carteira">Adicionar à carteira</NuLinkSeta>
          </div>
          <!-- com a barra do chat embaixo do cartão, ela é a pergunta: o botão sai -->
          <NuBotaoSeta v-if="!espiar.aoLado.value || celular" class="esp__perguntar" variante="carvao" tamanho="m" largo @click="perguntar">Perguntar sobre {{ vm.ticker }}</NuBotaoSeta>
        </div>
      </Transition>
    </section>
  </Transition>

  <!-- o maximizar: o cartão crescendo até virar a página (o topo do /asset carregando) -->
  <EspiarCapa v-if="capa" ref="capaEl" :dados="capa.dados" :topo="capa.topo" :conteudo="capa.conteudo" />
</template>

<style scoped>
.esp {
  --mola: var(--nu-ease-saida);
  --entra: var(--nu-ease-saida);
  position: fixed; z-index: 48; right: 16px; bottom: 20px;
  width: min(384px, calc(100vw - 32px)); max-height: calc(100dvh - 32px);
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--nu-white); color: var(--nu-ink); border-radius: var(--nu-r-card);
  box-shadow: var(--nu-shadow-float);
  /* com o painel do chat abrindo, a janelinha muda de lugar: a curva de troca */
  transition: right var(--nu-dur-lenta) var(--nu-ease-troca), bottom var(--nu-dur-lenta) var(--nu-ease-troca);
  outline: none;
}
.esp:focus-visible { box-shadow: var(--nu-shadow-float), 0 0 0 3px var(--nu-blue-30); }

/* chegar: sobe 16px com fade (o que chega); sair: o inverso, rápido */
.esp-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-lenta) var(--entra); }
.esp-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.esp-enter-from { opacity: 0; transform: translateY(16px) scale(.98); }
.esp-leave-to { opacity: 0; transform: translateY(8px); }

/* a troca entre esqueleto, erro e dado: um fade curto, sem pulo */
.esp-troca-enter-active, .esp-troca-leave-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.esp-troca-leave-active { transition-duration: var(--nu-dur-rapida); }
.esp-troca-enter-from, .esp-troca-leave-to { opacity: 0; }

/* ——— topo ——— */
.esp__topo { position: relative; display: flex; align-items: center; gap: 12px; padding: 20px 16px 0 20px; }
.esp__alca { display: none; }
.esp__id { flex: 1; min-width: 0; }
/* o ticker é o NuSelo carvão (como H2 do diálogo) */
.esp__ticker { margin: 0; height: 26px; font-size: 14px; }
.esp__nome {
  margin: 6px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.esp__sk-nome { margin-top: 8px; }
.esp__acoes { display: flex; gap: 4px; align-self: flex-start; }
.esp__icone {
  position: relative; width: 36px; height: 36px; border: 0; border-radius: 50%; padding: 0; display: grid; place-items: center;
  background: transparent; color: var(--nu-gray-3); cursor: pointer;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--mola);
}
/* o alvo de toque tem 44px; o círculo, 36 */
.esp__icone::after { content: ''; position: absolute; inset: -4px; }
.esp__icone:hover { background: var(--nu-cream-2); color: var(--nu-ink); }
.esp__icone:active { transform: scale(.92); }
.esp__icone:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 1px; }

/* ——— corpo ——— */
.esp__corpo { padding: 16px 20px 20px; overflow-y: auto; overscroll-behavior: contain; }
.esp__preco-linha { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 10px; margin: 0; }
.esp__preco { font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); font-variant-numeric: tabular-nums; white-space: nowrap; }
.esp__tri--baixo { transform: rotate(180deg); }
.esp__quando { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); }

.esp__linha { margin: 16px 0 0; }
.esp__linha-palco { position: relative; height: 64px; color: var(--nu-blue); }
.esp__linha-svg { display: block; width: 100%; height: 100%; overflow: visible; }
.esp__hoje {
  position: absolute; right: 0; width: 8px; height: 8px; margin: -4px -4px 0 0; border-radius: 50%;
  background: var(--nu-blue); box-shadow: 0 0 0 4px var(--nu-blue-tint), 0 0 0 1.5px var(--nu-white) inset;
}
/* a legenda da linha: texto pequeno em caixa normal (caixa alta é só do eyebrow e do cabeçalho de tabela) */
.esp__linha-leg {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-top: 8px;
  color: var(--nu-gray); font-size: 12.5px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
}
.esp__linha-leg b { font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.esp__leg--up { color: var(--nu-green-text); }
.esp__leg--down { color: var(--nu-red-text); }
.esp__sk-linha { margin-top: 16px; }

.esp__nums {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px;
  margin: 16px 0 0; padding: 16px 0 0; border-top: 1px solid var(--nu-line-2);
}
.esp__num { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.esp__num dt { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); line-height: 1.3; }
.esp__num dd { margin: 0; font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-texto); font-variant-numeric: tabular-nums; white-space: nowrap; }

.esp__porque { margin-top: 16px; padding: 12px 16px; border-radius: var(--nu-r-tile); background: var(--nu-page); }
.esp__rotulo { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; }
.esp__porque-texto { margin: 8px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; font-variant-numeric: tabular-nums; }
.esp__fonte { display: flex; align-items: center; gap: 8px; margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); }
.esp__sk-texto { margin-top: 16px; }

.esp__aviso { margin: 4px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55; }

/* ——— botões: o Seguir (estado), o link com seta e a pílula cheia; mola só no toque ——— */
.esp__botoes { position: relative; display: flex; align-items: center; flex-wrap: wrap; gap: 8px 20px; margin-top: 16px; font-size: var(--nu-fs-sm); }
/* o Seguir é a mesma pílula de contorno da base (NuFollowButton), na altura deste cartão */
.esp__botoes :deep(.nfb) {
  height: 40px; min-height: 40px; padding: 0 16px; gap: 8px; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio);
  background: var(--nu-white); color: var(--nu-ink); box-shadow: inset 0 0 0 1.5px var(--nu-ink);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--mola);
}
.esp__botoes :deep(.nfb:hover) { background: var(--nu-row-hover); transform: translateY(-1px); }
.esp__botoes :deep(.nfb:active) { transform: scale(.96); transition-duration: var(--nu-dur-rapida); }
.esp__botoes :deep(.nfb--on), .esp__botoes :deep(.nfb--on:hover) { background: var(--nu-blue-bg); color: var(--nu-blue-text); box-shadow: none; }
.esp__botoes :deep(.sga__msg--on) { font-size: var(--nu-fs-dense); }
.esp__perguntar { margin-top: 12px; }
/* a barra do chat embaixo: o cartão cabe acima dela */
.esp--com-barra { max-height: calc(100dvh - 32px - 74px); }
.esp__botoes :deep(.nfb:focus-visible) { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
.esp__sk-perguntar { margin-top: 12px; }

/* ——— celular: a folha que sobe do pé ——— */
@media (max-width: 640px) {
  .esp {
    left: 0; right: 0 !important; bottom: 0 !important; width: 100%; max-height: 84dvh;
    border-radius: var(--nu-r-card-lg) var(--nu-r-card-lg) 0 0; padding-bottom: env(safe-area-inset-bottom);
    transition: transform var(--nu-dur-lenta) var(--mola);
  }
  .esp--arrastando { transition: none; }
  .esp__topo { padding-top: 22px; touch-action: none; cursor: grab; }
  .esp__alca {
    display: block; position: absolute; top: 8px; left: 50%; width: 36px; height: 5px; margin-left: -18px;
    border-radius: var(--nu-r-pill); background: var(--nu-line);
  }
  .esp-enter-from, .esp-leave-to { opacity: 1; transform: translateY(100%); }
  .esp-enter-active { transition: transform var(--nu-dur-lenta) var(--entra); }
  .esp-leave-active { transition: transform var(--nu-dur-media) var(--nu-ease-cor); }
}

@media (prefers-reduced-motion: reduce) {
  .esp, .esp-enter-active, .esp-leave-active, .esp-troca-enter-active, .esp-troca-leave-active,
  .esp__icone, .esp__botoes :deep(.nfb) { transition: none; }
  .esp-enter-from, .esp-leave-to { transform: none; }
}
</style>

<style>
/* No celular a folha ocupa o pé: a barra do chat sai enquanto ela está aberta
   (a folha tem o próprio "Perguntar"). visibility tira a barra do Tab também. */
@media (max-width: 640px) {
  html.nu-espiar-aberto .cba { visibility: hidden; opacity: 0; pointer-events: none; }
}
/* Durante o maximizar a capa tem a linha de progresso dela: a barra do Nuxt (app.vue) espera */
html.nu-maximizando .nuxt-loading-indicator { opacity: 0 !important; }
</style>
