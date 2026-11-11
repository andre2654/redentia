<script setup lang="ts">
// A barra de pergunta flutuante (02/11/2026, pedido do dono: "um input parecido
// com o que tinha na home, no canto inferior, que dá sugestões; pressionado,
// vai para uma tela na direita"). Fica no pé de toda página do layout padrão,
// no centro, e some no login, no quiz da assinatura, na /busca e enquanto o
// painel está aberto (o painel tem o próprio campo): utils/chat-painel.ts.
//
// No foco, as sugestões sobem acima da barra, conforme a página (no /asset/X,
// perguntas sobre X). Enter ou a seta: abre o painel com a pergunta (quem não
// entrou vai ao login e volta com a pergunta, ChatPainel).
//
// A cara é o input mágico da Aportou (11/11/2026): o anel cobalto, céu, sálvia
// e areia (ChatPilula), o corte azul do "t" como ícone, o envio no círculo
// cobalto. No foco a barra cresce de 58 para 62px, o anel corre mais rápido
// (7s → 4s) e as sugestões viram chips brancos com sombra, soltos acima dela.
//
// O fim da página nunca fica embaixo dela: o layout soma a altura da barra ao
// pé do rodapé (html.nu-chat-barra, estilo global abaixo).
//
// No foco, a marca dá lugar a dois botões (dono, 02/11/2026): expandir abre o
// painel como está; conversa abre o painel já nas conversas anteriores (só
// para quem entrou). A troca é uma mola: a marca gira e some, os botões
// crescem um depois do outro.
//
// No celular (dono, 02/11/2026: "fica encapsulado e mostra uma animação só pra
// mostrar que é um input; quando clicar já foca"), a barra em repouso é uma
// cápsula estreita no centro, com a pergunta se escrevendo sozinha no
// placeholder. O toque cai no próprio campo (o foco é nativo, o teclado abre
// no mesmo gesto) e a cápsula se abre em mola até a largura toda.
import { barraVisivel, sugestoesDaRota, tickerDaRota } from '~/utils/chat-painel'

const route = useRoute()
const painel = useChatPainel()
const { isAuthenticated } = useAuthState()

const visivel = computed(() => barraVisivel(route.path, painel.aberto.value))
const sugestoes = computed(() => sugestoesDaRota(route.path).slice(0, 4))

const texto = ref('')
const focado = ref(false)
const ativa = ref(-1)
const campo = ref<HTMLInputElement | null>(null)
const raiz = ref<HTMLElement | null>(null)
const listaId = useId()

const mostrarSugestoes = computed(() => focado.value && !texto.value.trim() && sugestoes.value.length > 0)

/* ——— a cápsula do celular ——— */
const movel = ref(false)
const recolhida = computed(() => movel.value && !focado.value && !texto.value)
const PADRAO = 'Pergunte à Aportou'
const dica = ref(PADRAO)
let relogio: ReturnType<typeof setTimeout> | null = null
let mq: MediaQueryList | null = null
let semMovimento = false

function pararDica() {
  if (relogio) clearTimeout(relogio)
  relogio = null
  dica.value = PADRAO
}
// escreve e apaga, uma frase por vez: o padrão, depois as sugestões da página
function rodarDica() {
  pararDica()
  if (!recolhida.value || semMovimento) return
  // só frase que cabe inteira na cápsula (medida na fonte do campo): cortada
  // no meio, a frase não convida
  const t = tickerDaRota(route.path)
  const candidatas = [...(t ? [`E a ${t}, hoje?`, `Fale da ${t}`] : []), ...sugestoes.value, 'Como foi a bolsa?', 'Pergunte de um ativo']
  const frases = [PADRAO, ...[...new Set(candidatas.filter(cabeNoCampo))].slice(0, 2)]
  let f = 0
  let n = PADRAO.length
  let apagando = false
  const passo = () => {
    if (!recolhida.value) { pararDica(); return }
    const alvo = frases[f]!
    if (!apagando) {
      n++
      dica.value = alvo.slice(0, n)
      if (n >= alvo.length) { apagando = true; relogio = setTimeout(passo, 2400); return }
      relogio = setTimeout(passo, 55)
    }
    else {
      n--
      dica.value = alvo.slice(0, Math.max(n, 0))
      if (n <= 0) { apagando = false; f = (f + 1) % frases.length; relogio = setTimeout(passo, 380); return }
      relogio = setTimeout(passo, 26)
    }
  }
  dica.value = PADRAO
  relogio = setTimeout(() => { apagando = true; passo() }, 2600)
}
let regua: CanvasRenderingContext2D | null = null
function cabeNoCampo(s: string): boolean {
  const el = campo.value
  if (!el) return false
  regua ??= document.createElement('canvas').getContext('2d')
  if (!regua) return s.length <= 18
  const cs = getComputedStyle(el)
  // o placeholder da cápsula é 600 (mais largo que o campo, 500)
  regua.font = `600 ${cs.fontSize} ${cs.fontFamily}`
  return regua.measureText(s).width <= el.clientWidth - 6
}
function lerTela() { movel.value = !!mq?.matches }
onMounted(() => {
  mq = window.matchMedia('(max-width: 760px)')
  semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  lerTela()
  mq.addEventListener('change', lerTela)
})
onBeforeUnmount(() => { mq?.removeEventListener('change', lerTela); pararDica() })
watch([recolhida, () => route.path], ([r]) => { if (r) rodarDica(); else pararDica() })

function perguntar(q?: string) {
  const t = (q ?? texto.value).trim()
  texto.value = ''
  ativa.value = -1
  focado.value = false
  campo.value?.blur()
  // sem texto, a seta abre o painel vazio (com as sugestões dele); sem conta,
  // a pergunta abre a folha de cadastro (useChatPainel.perguntar)
  painel.perguntar(t)
}

function sairDaBarra() {
  texto.value = ''
  ativa.value = -1
  focado.value = false
  campo.value?.blur()
}
function expandir() {
  sairDaBarra()
  painel.abrir()
}
function abrirConversas() {
  sairDaBarra()
  painel.abrirConversas()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { campo.value?.blur(); return }
  if (!mostrarSugestoes.value) return
  const n = sugestoes.value.length
  // as sugestões são chips em linha: as setas dos dois eixos andam por elas
  // (o campo está vazio enquanto elas aparecem, não há cursor para mover)
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); ativa.value = ativa.value <= 0 ? n - 1 : ativa.value - 1 }
  else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); ativa.value = ativa.value >= n - 1 ? 0 : ativa.value + 1 }
  else if (e.key === 'Enter' && ativa.value >= 0) { e.preventDefault(); perguntar(sugestoes.value[ativa.value]) }
}

// o foco sai da barra inteira (não só do campo) para fechar as sugestões:
// clicar numa sugestão não pode fechá-las antes do clique valer
function onFocusOut(e: FocusEvent) {
  const para = e.relatedTarget as Node | null
  if (para && raiz.value?.contains(para)) return
  focado.value = false
  ativa.value = -1
}

// a folga no fim da página acompanha a barra (o layout lê a classe no <html>)
useHead(() => ({ htmlAttrs: { class: visivel.value ? 'nu-chat-barra' : '' } }))
</script>

<template>
  <Transition name="cba">
    <div v-if="visivel" ref="raiz" class="cba" :class="{ 'cba--capsula': recolhida, 'cba--foco': focado }" @focusout="onFocusOut">
      <Transition name="cba-sug">
        <ul v-if="mostrarSugestoes" :id="listaId" class="cba__sugs" role="listbox" aria-label="Sugestões de pergunta">
          <li v-for="(s, k) in sugestoes" :key="s" role="presentation" :style="{ '--k': k }">
            <button
              :id="`${listaId}-${k}`" type="button" role="option" class="cba__sug" :class="{ 'cba__sug--ativa': k === ativa }"
              :aria-selected="k === ativa" tabindex="-1"
              @mousedown.prevent @click="perguntar(s)" @mouseenter="ativa = k" @mouseleave="ativa = -1"
            >{{ s }}</button>
          </li>
        </ul>
      </Transition>

      <form class="cba__form" role="search" aria-label="Pergunte à Aportou" @submit.prevent="perguntar()">
        <ChatPilula :aceso="focado || !!texto">
          <div class="cba__linha" @click="campo?.focus()">
            <span class="cba__lado" :class="{ 'cba__lado--aberto': focado, 'cba__lado--dois': focado && isAuthenticated }">
              <MarcaCorte :largura="26" class="cba__marca" />
              <button
                type="button" class="cba__acao" style="--i: 0" aria-label="Abrir o chat" title="Abrir o chat"
                :tabindex="focado ? 0 : -1" @mousedown.prevent @click.stop="expandir"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" /></svg>
              </button>
              <button
                v-if="isAuthenticated" type="button" class="cba__acao" style="--i: 1" aria-label="Suas conversas" title="Suas conversas"
                :tabindex="focado ? 0 : -1" @mousedown.prevent @click.stop="abrirConversas"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z" /><path d="M9 11h6M9 14.5h3.5" /></svg>
              </button>
            </span>
            <input
              ref="campo" v-model="texto" class="cba__campo" type="text" enterkeyhint="send" autocomplete="off"
              :placeholder="movel ? dica : PADRAO" aria-label="Pergunte à Aportou"
              role="combobox" :aria-expanded="mostrarSugestoes" :aria-controls="listaId" aria-autocomplete="list"
              :aria-activedescendant="mostrarSugestoes && ativa >= 0 ? `${listaId}-${ativa}` : undefined"
              @focus="focado = true" @keydown="onKey"
            >
            <button type="submit" class="cba__enviar" aria-label="Perguntar">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></svg>
            </button>
          </div>
        </ChatPilula>
      </form>
    </div>
  </Transition>
</template>

<style scoped>
.cba {
  position: fixed; z-index: 45; left: 50%; bottom: calc(20px + env(safe-area-inset-bottom));
  width: min(560px, calc(100% - 32px)); transform: translateX(-50%);
}
.cba__form { --cpi-raio: 999px; }
/* 58px em repouso; no foco cresce para 62 (o input mágico do quadro) */
.cba__linha {
  display: flex; align-items: center; gap: 12px; height: 58px; padding: 0 9px 0 20px; cursor: text;
  transition: height .25s var(--nu-ease-saida), padding .25s var(--nu-ease-saida);
}
.cba--foco .cba__linha { height: 62px; padding-right: 10px; }
.cba__marca { flex-shrink: 0; display: block; }

/* o lado esquerdo: o corte em repouso; no foco, os dois botões (mola) */
.cba__lado {
  --mola: var(--nu-ease-saida);
  position: relative; flex-shrink: 0;
  width: 26px; height: 38px; margin-left: 0;
  transition: width .42s var(--mola), margin-left .42s var(--mola);
}
.cba__lado--aberto { width: 38px; margin-left: -8px; }
.cba__lado--dois { width: 80px; }
.cba__lado .cba__marca {
  position: absolute; left: 0; top: 8px;
  transition: transform .38s var(--mola), opacity .22s ease;
}
.cba__lado--aberto .cba__marca { transform: rotate(-90deg) scale(.2); opacity: 0; }
.cba__acao {
  position: absolute; top: 0; left: calc(var(--i) * 42px);
  width: 38px; height: 38px; border: 0; border-radius: 50%; padding: 0; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-cream-2); color: var(--nu-ink);
  opacity: 0; transform: scale(.4) rotate(-20deg); pointer-events: none;
  transition: transform .42s var(--mola), opacity .2s ease, background .2s ease, color .2s ease;
  transition-delay: 0s;
}
.cba__lado--aberto .cba__acao {
  opacity: 1; transform: none; pointer-events: auto;
  transition-delay: calc(60ms + var(--i) * 70ms), calc(60ms + var(--i) * 70ms), 0s, 0s;
}
.cba__acao:hover { background: var(--nu-ink); color: var(--nu-white); }
.cba__acao:active { transform: scale(.92); }
@media (prefers-reduced-motion: reduce) {
  .cba__lado, .cba__lado .cba__marca, .cba__acao, .cba__linha { transition-duration: .01ms !important; transition-delay: 0s !important; }
}
.cba__campo {
  flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; font: inherit;
  color: var(--nu-ink); font-size: 17px; font-weight: 600; caret-color: var(--nu-blue);
}
/* o anel é o foco do campo: o contorno global não entra por cima dele */
.cba__campo:focus-visible { outline: 0; }
.cba__campo::placeholder { color: var(--nu-gray); font-weight: 600; opacity: 1; }
/* o envio: o círculo cobalto com a seta para cima, sempre */
.cba__enviar {
  flex-shrink: 0; width: 40px; height: 40px; border: 0; border-radius: 50%; padding: 0; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-blue); color: var(--nu-white);
  transition: transform .2s ease, background .2s ease, width .25s var(--nu-ease-saida), height .25s var(--nu-ease-saida);
}
.cba--foco .cba__enviar { width: 42px; height: 42px; }
.cba__enviar:hover { background: var(--nu-blue-hover); }
.cba__enviar:hover svg { animation: cba-seta .45s var(--nu-ease-saida); }
.cba__enviar:active { transform: scale(.94); }

/* as sugestões: chips brancos com sombra, soltos acima da barra */
.cba__sugs {
  position: absolute; left: 50%; bottom: calc(100% + 14px); transform: translateX(-50%);
  width: max-content; max-width: min(760px, calc(100vw - 24px));
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;
}
.cba__sugs li { animation: nu-fade .32s var(--nu-ease-saida) both; animation-delay: calc(var(--k) * 50ms); }
.cba__sug {
  display: inline-flex; align-items: center; min-height: 44px; max-width: 100%; padding: 8px 16px;
  border: 0; border-radius: 22px; background: var(--nu-white); cursor: pointer; text-align: left;
  color: var(--nu-ink); font: inherit; font-size: 14.5px; font-weight: 600; line-height: 1.3;
  /* pedido para a base: a sombra do chip branco do quadro (0 2px 8px a 8% do carvão) */
  box-shadow: 0 2px 8px color-mix(in srgb, var(--nu-ink) 10%, transparent), 0 0 0 1px var(--nu-navy-07);
  transition: background .2s ease, color .2s ease, transform .2s var(--nu-ease-saida);
}
/* a escolhida vira cobalto: os chips flutuam sobre qualquer fundo, e o carvão sumiria nas seções escuras */
.cba__sug--ativa { background: var(--nu-blue); color: var(--nu-white); transform: translateY(-2px); }
.cba__sug:active { transform: scale(.98); }

@keyframes cba-seta {
  0% { transform: translateY(0); }
  50% { transform: translateY(-120%); opacity: 0; }
  51% { transform: translateY(120%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.cba-enter-active, .cba-leave-active { transition: opacity .25s ease, transform .3s var(--nu-ease-saida); }
.cba-enter-from, .cba-leave-to { opacity: 0; transform: translate(-50%, 16px); }
.cba-sug-enter-active, .cba-sug-leave-active { transition: opacity .18s ease, transform .22s var(--nu-ease-saida); }
.cba-sug-enter-from, .cba-sug-leave-to { opacity: 0; transform: translate(-50%, 8px); }

@media (max-width: 760px) {
  .cba {
    bottom: calc(12px + env(safe-area-inset-bottom)); width: calc(100% - 24px);
    transition: width .5s cubic-bezier(.34, 1.4, .64, 1);
  }
  .cba__linha { height: 52px; padding-left: 16px; gap: 10px; }
  .cba--foco .cba__linha { height: 56px; }
  /* 16px no campo: abaixo disso o iOS dá zoom no foco */
  .cba__campo { font-size: 16px; text-overflow: ellipsis; }
  .cba__enviar { transition: transform .35s var(--nu-ease-saida), opacity .2s ease, width .35s ease, background .2s ease; }
  .cba__sugs { justify-content: flex-start; width: 100%; max-width: 100%; }

  /* em repouso: a cápsula, estreita, com a pergunta se escrevendo */
  .cba--capsula { width: min(280px, calc(100% - 24px)); }
  .cba--capsula .cba__linha { height: 48px; padding-right: 16px; }
  .cba--capsula .cba__campo::placeholder { color: var(--nu-ink); }
  .cba--capsula .cba__enviar { width: 0; opacity: 0; transform: scale(.3); pointer-events: none; }
}
@media (max-width: 760px) and (prefers-reduced-motion: reduce) {
  .cba, .cba__enviar { transition: none; }
}
</style>

<style>
/* A folga no fim da página: o rodapé (carvão) cresce a altura da barra, e
   páginas sem rodapé ganham a folga no próprio shell. Assim o fim do conteúdo
   nunca fica escondido atrás da barra. */
html.nu-chat-barra .nu-shell > footer { padding-bottom: calc(98px + env(safe-area-inset-bottom)); }
html.nu-chat-barra .nu-shell:not(:has(> footer)) { padding-bottom: calc(98px + env(safe-area-inset-bottom)); }
</style>
