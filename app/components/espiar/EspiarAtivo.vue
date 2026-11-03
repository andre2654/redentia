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
// junto como anexo. Nunca cobre a barra do chat: quando as duas se cruzam na
// horizontal, a janelinha sobe acima dela.
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
import { barraVisivel } from '~/utils/chat-painel'
import { direitaDoCartao, LINHA_ALTURA, LINHA_LARGURA } from '~/utils/espiarAtivo'
import type { ContextoDoChat } from '~/composables/useChatPainel'

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

const contexto = computed<ContextoDoChat | null>(() => (vm.value && t.value
  ? { id: `ativo:${t.value}`, tipo: 'ativo', rotulo: t.value, texto: vm.value.contexto, rota: route.path }
  : null))

const pagina = computed(() => `/asset/${t.value ?? ''}`)
const triangulo = computed(() => (vm.value?.dir === 'down' ? 'esp__tri--baixo' : ''))
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
  // a barra do chat: se cruza com o cartão na horizontal, o cartão sobe acima dela
  let bottom = PE_BARRA
  const barra = barraVisivel(route.path, painel.aberto.value) ? document.querySelector<HTMLElement>('.cba') : null
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
  if (!agora) { desloc.value = 0; return }
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
const capa = ref<{ ticker: string; nome: string; preco: string | null } | null>(null)
const capaEl = ref<HTMLElement | null>(null)

async function maximizar(e?: Event) {
  e?.preventDefault()
  if (!t.value || crescendo) return
  const alvo = pagina.value
  const el = cartao.value
  if (!el || calmo()) { espiar.fechar(false); await navigateTo(alvo); return }
  crescendo = true
  const r = el.getBoundingClientRect()
  capa.value = { ticker: t.value, nome: vm.value?.nome ?? '', preco: vm.value?.precoFmt ?? null }
  await nextTick()
  const c = capaEl.value
  if (!c) { crescendo = false; capa.value = null; espiar.fechar(false); await navigateTo(alvo); return }
  // cresce até o corpo da página: o header e a faixa do mercado ficam (eles não mudam de uma página para a outra)
  const topo = topoLivre()
  const raio = celular.value ? '26px 26px 0 0' : '24px'
  const de = `inset(${r.top}px ${window.innerWidth - r.right}px ${Math.max(0, window.innerHeight - r.bottom)}px ${r.left}px round ${raio})`
  const curva = 'cubic-bezier(.2, .8, .2, 1)'
  const cresce = c.animate(
    [{ clipPath: de }, { clipPath: `inset(${topo}px 0px 0px 0px round 0px)` }],
    { duration: 560, easing: curva, fill: 'forwards' },
  )
  // o branco do cartão se apaga no céu do herói da página
  c.querySelector('.esp-capa__branco')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 480, easing: 'ease', fill: 'forwards' })
  c.querySelector('.esp-capa__miolo')?.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 220, easing: curva, fill: 'backwards' })
  espiar.fechar(false)
  // a página nova pronta (o useAsyncData dela resolvido), com um teto para nunca prender a tela
  const pronta = new Promise<void>((ok) => {
    const teto = setTimeout(ok, 8000)
    nuxtApp.hooks.hookOnce('page:finish', () => { clearTimeout(teto); ok() })
  })
  const nav = navigateTo(alvo)
  await Promise.all([cresce.finished.catch(() => null), pronta, Promise.resolve(nav).catch(() => null)])
  await nextTick()
  await c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease', fill: 'forwards' }).finished.catch(() => null)
  capa.value = null
  crescendo = false
}

/** Onde acabam o header e a faixa sticky (o mesmo corte do ChatSeletor). */
function topoLivre(): number {
  let y = 0
  for (const el of Array.from(document.querySelectorAll('.nuh-wrap, .nut-wrap, .nsr-wrap'))) {
    const q = el.getBoundingClientRect()
    if (q.top <= y + 1 && q.bottom > y) y = q.bottom
  }
  return Math.round(y)
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
  document.documentElement.classList.remove('nu-espiar-aberto')
})
</script>

<template>
  <Transition name="esp">
    <section
      v-if="aberto"
      ref="cartao"
      v-contexto-chat="contexto"
      class="esp"
      :class="{ 'esp--arrastando': arrastando }"
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
          <h2 :id="idTitulo" class="esp__ticker">{{ t }}</h2>
          <p v-if="vm" class="esp__nome">{{ vm.nome }} · {{ vm.classeRotulo }}<template v-if="vm.bolsa !== 'B3'"> · {{ vm.bolsa }}</template></p>
          <NuSkeleton v-else-if="estado === 'carregando'" variant="line" width="132px" height="12px" radius="pill" class="esp__sk-nome" />
        </div>
        <span class="esp__acoes">
          <NuxtLink
            :to="pagina" data-sem-espiar class="esp__icone" :aria-label="`Abrir a página de ${t}`" title="Abrir a página"
            @click="maximizar"
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
            <NuSkeleton variant="pill" width="164px" height="40px" />
          </div>
          <NuSkeleton variant="pill" width="100%" height="44px" class="esp__sk-perguntar" />
        </div>

        <div v-else-if="estado === 'erro'" key="erro" class="esp__corpo">
          <p class="esp__aviso" role="alert">Não conseguimos carregar {{ t }} agora. Tente de novo em instantes, ou abra a página do ativo.</p>
          <div class="esp__botoes">
            <button type="button" class="esp__secundario" @click="espiar.recarregar()">Tentar de novo</button>
            <NuxtLink :to="pagina" data-sem-espiar class="esp__secundario" @click="maximizar">Abrir a página</NuxtLink>
          </div>
        </div>

        <div v-else-if="estado === 'saiu'" key="saiu" class="esp__corpo">
          <p class="esp__aviso">{{ espiar.mensagem.value }}</p>
          <div class="esp__botoes">
            <NuxtLink :to="pagina" data-sem-espiar class="esp__secundario" @click="maximizar">Ver o histórico de {{ t }}</NuxtLink>
          </div>
        </div>

        <div v-else-if="vm" :key="`vm:${vm.ticker}`" class="esp__corpo">
          <p v-if="vm.precoFmt" class="esp__preco-linha">
            <span class="esp__preco">{{ vm.precoFmt }}</span>
            <span v-if="vm.variacaoFmt" class="esp__var" :class="`esp__var--${vm.dir}`">
              <svg width="9" height="9" viewBox="0 0 10 10" :class="triangulo" aria-hidden="true"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>{{ vm.variacaoFmt }}
            </span>
            <span v-if="vm.quando" class="esp__quando">{{ vm.quando }}</span>
          </p>

          <figure v-if="vm.linha" class="esp__linha">
            <div class="esp__linha-palco">
              <svg :viewBox="`0 0 ${LINHA_LARGURA} ${LINHA_ALTURA}`" preserveAspectRatio="none" class="esp__linha-svg" aria-hidden="true">
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
            <p class="esp__fonte">Leitura da Redentia<template v-if="vm.porQue.fonte"> · {{ vm.porQue.fonte }}</template></p>
          </div>

          <div class="esp__botoes">
            <SeguirAtivo :ticker="vm.ticker" :path="`/asset/${vm.ticker}`" />
            <button type="button" class="esp__secundario" @click="carteira">Adicionar à carteira</button>
          </div>
          <button type="button" class="esp__perguntar" @click="perguntar">
            Perguntar sobre {{ vm.ticker }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </Transition>
    </section>
  </Transition>

  <!-- o maximizar: o cartão crescendo até virar a página -->
  <div v-if="capa" ref="capaEl" class="esp-capa" aria-hidden="true">
    <div class="esp-capa__luz" />
    <div class="esp-capa__branco" />
    <div class="esp-capa__miolo">
      <p class="esp-capa__empresa">{{ capa.nome ? `${capa.nome} · ` : '' }}{{ capa.ticker }}</p>
      <p v-if="capa.preco" class="esp-capa__preco">{{ capa.preco }}</p>
    </div>
  </div>
</template>

<style scoped>
.esp {
  --mola: cubic-bezier(.34, 1.56, .64, 1);
  --entra: cubic-bezier(.2, .8, .2, 1);
  position: fixed; z-index: 48; right: 16px; bottom: 20px;
  width: min(384px, calc(100vw - 32px)); max-height: calc(100dvh - 32px);
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--nu-white); color: var(--nu-ink); border-radius: var(--nu-r-card);
  box-shadow: var(--nu-chat-sombra-painel);
  transition: right .38s var(--entra), bottom .38s var(--entra);
  outline: none;
}
.esp:focus-visible { box-shadow: var(--nu-chat-sombra-painel), 0 0 0 3px var(--nu-blue-30); }

.esp-enter-active { transition: opacity .3s ease, transform .42s var(--entra); }
.esp-leave-active { transition: opacity .18s ease, transform .22s ease; }
.esp-enter-from { opacity: 0; transform: translateY(16px) scale(.98); }
.esp-leave-to { opacity: 0; transform: translateY(8px); }

.esp-troca-enter-active, .esp-troca-leave-active { transition: opacity .16s ease; }
.esp-troca-enter-from, .esp-troca-leave-to { opacity: 0; }

/* ——— topo ——— */
.esp__topo { position: relative; display: flex; align-items: center; gap: 12px; padding: 18px 14px 0 18px; }
.esp__alca { display: none; }
.esp__id { flex: 1; min-width: 0; }
.esp__ticker { margin: 0; font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
.esp__nome {
  margin: 2px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.esp__sk-nome { margin-top: 6px; }
.esp__acoes { display: flex; gap: 2px; align-self: flex-start; }
.esp__icone {
  width: 34px; height: 34px; border: 0; border-radius: 50%; padding: 0; display: grid; place-items: center;
  background: transparent; color: var(--nu-gray-3); cursor: pointer;
  transition: background .2s ease, color .2s ease, transform .4s var(--mola);
}
.esp__icone:hover { background: var(--nu-cream); color: var(--nu-ink); }
.esp__icone:active { transform: scale(.92); }
.esp__icone:focus-visible { outline: 3px solid var(--nu-blue-30); outline-offset: 1px; }

/* ——— corpo ——— */
.esp__corpo { padding: 14px 18px 18px; overflow-y: auto; overscroll-behavior: contain; }
.esp__preco-linha { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; margin: 0; }
.esp__preco { font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.esp__var { display: inline-flex; align-items: center; gap: 5px; font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.esp__var--up { color: var(--nu-green-text); }
.esp__var--down { color: var(--nu-red-text); }
.esp__tri--baixo { transform: rotate(180deg); }
.esp__quando { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }

.esp__linha { margin: 14px 0 0; }
.esp__linha-palco { position: relative; height: 64px; color: var(--nu-blue); }
.esp__linha-svg { display: block; width: 100%; height: 100%; overflow: visible; }
.esp__hoje {
  position: absolute; right: 0; width: 8px; height: 8px; margin: -4px -4px 0 0; border-radius: 50%;
  background: var(--nu-blue); box-shadow: 0 0 0 4px var(--nu-blue-tint), 0 0 0 1.5px var(--nu-white) inset;
}
.esp__linha-leg {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-top: 8px;
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
}
.esp__linha-leg b { font-size: var(--nu-fs-dense); letter-spacing: 0; text-transform: none; font-variant-numeric: tabular-nums; }
.esp__leg--up { color: var(--nu-green-text); }
.esp__leg--down { color: var(--nu-red-text); }
.esp__sk-linha { margin-top: 14px; }

.esp__nums {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px;
  margin: 16px 0 0; padding: 14px 0 0; border-top: 1px solid var(--nu-cream-line);
}
.esp__num { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.esp__num dt { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; line-height: 1.3; }
.esp__num dd { margin: 0; font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; white-space: nowrap; }

.esp__porque { margin-top: 16px; padding: 12px 14px; border-radius: var(--nu-r-tile); background: var(--nu-cream); }
.esp__rotulo { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.esp__porque-texto { margin: 6px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }
.esp__fonte { margin: 6px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.esp__sk-texto { margin-top: 18px; }

.esp__aviso { margin: 4px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }

/* ——— botões: mola no toque ——— */
.esp__botoes { position: relative; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.esp__botoes :deep(.nfb) {
  height: 40px; padding: 0 16px; gap: 8px; font-size: var(--nu-fs-sm); font-weight: 700;
  background: var(--nu-cream); color: var(--nu-ink);
  transition: background .2s ease, transform .45s var(--mola);
}
.esp__botoes :deep(.nfb:hover) { background: var(--nu-cream-2); transform: translateY(-1px); }
.esp__botoes :deep(.nfb:active) { transform: scale(.96); }
.esp__botoes :deep(.nfb--on) { background: var(--nu-green-bg); color: var(--nu-green-text); }
.esp__botoes :deep(.sga__msg--on) { font-size: var(--nu-fs-dense); }
.esp__secundario {
  display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: transparent; box-shadow: inset 0 0 0 1px var(--nu-cream-line); color: var(--nu-ink);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; text-decoration: none;
  transition: background .2s ease, box-shadow .2s ease, transform .45s var(--mola);
}
.esp__secundario:hover { background: var(--nu-cream); box-shadow: inset 0 0 0 1px var(--nu-sand); transform: translateY(-1px); }
.esp__secundario:active { transform: scale(.96); }
.esp__perguntar {
  width: 100%; height: 44px; margin-top: 10px; border: 0; border-radius: var(--nu-r-pill);
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--nu-ink); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer;
  transition: background .2s ease, transform .45s var(--mola);
}
.esp__perguntar:hover { background: var(--nu-ink-hover); }
.esp__perguntar:active { transform: scale(.98); }
.esp__secundario:focus-visible, .esp__perguntar:focus-visible, .esp__botoes :deep(.nfb:focus-visible) { outline: 3px solid var(--nu-blue-30); outline-offset: 2px; }
.esp__sk-perguntar { margin-top: 10px; }

/* ——— celular: a folha que sobe do pé ——— */
@media (max-width: 640px) {
  .esp {
    left: 0; right: 0 !important; bottom: 0 !important; width: 100%; max-height: 84dvh;
    border-radius: var(--nu-r-card-lg) var(--nu-r-card-lg) 0 0; padding-bottom: env(safe-area-inset-bottom);
    transition: transform .42s var(--mola);
  }
  .esp--arrastando { transition: none; }
  .esp__topo { padding-top: 22px; touch-action: none; cursor: grab; }
  .esp__alca {
    display: block; position: absolute; top: 8px; left: 50%; width: 36px; height: 5px; margin-left: -18px;
    border-radius: var(--nu-r-pill); background: var(--nu-cream-line);
  }
  .esp-enter-from, .esp-leave-to { opacity: 1; transform: translateY(100%); }
  .esp-enter-active { transition: transform .42s var(--entra); }
  .esp-leave-active { transition: transform .26s ease; }
}

/* ——— a capa do maximizar ——— */
.esp-capa {
  position: fixed; inset: 0; z-index: 60; isolation: isolate; display: flex; justify-content: center; pointer-events: none;
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
/* o céu do herói da página de ativo (AtivoNoite .an__luz), para a capa se desfazer sobre ele sem salto */
.esp-capa__luz {
  position: absolute; inset: 0; z-index: -2;
  background:
    radial-gradient(60% 38% at 50% 0%, color-mix(in srgb, var(--nu-blue) 16%, transparent), transparent),
    linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-navy) 55%, var(--nu-agora-bg)) 46%, var(--nu-agora-bg) 80%);
}
.esp-capa__branco { position: absolute; inset: 0; z-index: -1; background: var(--nu-white); }
.esp-capa__miolo { padding-top: clamp(200px, 28vh, 260px); text-align: center; }
.esp-capa__empresa { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.esp-capa__preco { margin: 14px 0 0; font-size: clamp(44px, 6.4vw, 88px); font-weight: 500; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  .esp, .esp-enter-active, .esp-leave-active, .esp-troca-enter-active, .esp-troca-leave-active,
  .esp__icone, .esp__secundario, .esp__perguntar, .esp__botoes :deep(.nfb) { transition: none; }
  .esp-enter-from, .esp-leave-to { transform: none; }
}
</style>

<style>
/* No celular a folha ocupa o pé: a barra do chat sai enquanto ela está aberta
   (a folha tem o próprio "Perguntar"). visibility tira a barra do Tab também. */
@media (max-width: 640px) {
  html.nu-espiar-aberto .cba { visibility: hidden; opacity: 0; pointer-events: none; }
}
</style>
