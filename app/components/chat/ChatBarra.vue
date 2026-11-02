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
// O fim da página nunca fica embaixo dela: o layout soma a altura da barra ao
// pé do rodapé (html.nu-chat-barra, estilo global abaixo).
//
// No foco, a marca dá lugar a dois botões (dono, 02/11/2026): expandir abre o
// painel como está; conversa abre o painel já nas conversas anteriores (só
// para quem entrou). A troca é uma mola: a marca gira e some, os botões
// crescem um depois do outro.
import { barraVisivel, sugestoesDaRota } from '~/utils/chat-painel'

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
  if (e.key === 'ArrowUp') { e.preventDefault(); ativa.value = ativa.value <= 0 ? n - 1 : ativa.value - 1 }
  else if (e.key === 'ArrowDown') { e.preventDefault(); ativa.value = ativa.value >= n - 1 ? 0 : ativa.value + 1 }
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
    <div v-if="visivel" ref="raiz" class="cba" @focusout="onFocusOut">
      <Transition name="cba-sug">
        <ul v-if="mostrarSugestoes" :id="listaId" class="cba__sugs" role="listbox" aria-label="Sugestões de pergunta">
          <li v-for="(s, k) in sugestoes" :key="s" role="presentation">
            <button
              :id="`${listaId}-${k}`" type="button" role="option" class="cba__sug" :class="{ 'cba__sug--ativa': k === ativa }"
              :aria-selected="k === ativa" tabindex="-1"
              @mousedown.prevent @click="perguntar(s)" @mouseenter="ativa = k"
            >
              <span>{{ s }}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
            </button>
          </li>
        </ul>
      </Transition>

      <form class="cba__form" role="search" aria-label="Pergunte à Redentia" @submit.prevent="perguntar()">
        <ChatPilula :aceso="focado || !!texto">
          <div class="cba__linha" @click="campo?.focus()">
            <span class="cba__lado" :class="{ 'cba__lado--aberto': focado, 'cba__lado--dois': focado && isAuthenticated }">
              <img src="/logo-azul.svg" alt="" width="20" height="20" class="cba__marca">
              <button
                type="button" class="cba__acao" style="--i: 0" aria-label="Abrir o chat" title="Abrir o chat"
                :tabindex="focado ? 0 : -1" @mousedown.prevent @click.stop="expandir"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" /></svg>
              </button>
              <button
                v-if="isAuthenticated" type="button" class="cba__acao" style="--i: 1" aria-label="Suas conversas" title="Suas conversas"
                :tabindex="focado ? 0 : -1" @mousedown.prevent @click.stop="abrirConversas"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z" /><path d="M9 11h6M9 14.5h3.5" /></svg>
              </button>
            </span>
            <input
              ref="campo" v-model="texto" class="cba__campo" type="text" enterkeyhint="send" autocomplete="off"
              placeholder="Pergunte à Redentia" aria-label="Pergunte à Redentia"
              role="combobox" :aria-expanded="mostrarSugestoes" :aria-controls="listaId" aria-autocomplete="list"
              :aria-activedescendant="mostrarSugestoes && ativa >= 0 ? `${listaId}-${ativa}` : undefined"
              @focus="focado = true" @keydown="onKey"
            >
            <button type="submit" class="cba__enviar" :class="{ 'cba__enviar--pronto': !!texto.trim() }" aria-label="Perguntar">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
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
.cba__form { --cpi-raio: 28px; }
.cba__linha { display: flex; align-items: center; gap: 12px; height: 52px; padding: 0 6px 0 18px; cursor: text; }
.cba__marca { flex-shrink: 0; display: block; }

/* o lado esquerdo: a marca em repouso; no foco, os dois botões (mola) */
.cba__lado {
  --mola: cubic-bezier(.34, 1.56, .64, 1);
  position: relative; flex-shrink: 0;
  width: 20px; height: 34px; margin-left: 0;
  transition: width .42s var(--mola), margin-left .42s var(--mola);
}
.cba__lado--aberto { width: 34px; margin-left: -8px; }
.cba__lado--dois { width: 72px; }
.cba__lado .cba__marca {
  position: absolute; left: 0; top: 7px;
  transition: transform .38s var(--mola), opacity .22s ease;
}
.cba__lado--aberto .cba__marca { transform: rotate(-90deg) scale(.2); opacity: 0; }
.cba__acao {
  position: absolute; top: 0; left: calc(var(--i) * 38px);
  width: 34px; height: 34px; border: 0; border-radius: 50%; padding: 0; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-cream); color: var(--nu-ink);
  opacity: 0; transform: scale(.4) rotate(-20deg); pointer-events: none;
  transition: transform .42s var(--mola), opacity .2s ease, background .15s ease, color .15s ease;
  transition-delay: 0s;
}
.cba__lado--aberto .cba__acao {
  opacity: 1; transform: none; pointer-events: auto;
  transition-delay: calc(60ms + var(--i) * 70ms), calc(60ms + var(--i) * 70ms), 0s, 0s;
}
.cba__acao:hover { background: var(--nu-ink); color: var(--nu-white); }
.cba__acao:active { transform: scale(.92); }
.cba__acao:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .cba__lado, .cba__lado .cba__marca, .cba__acao { transition-duration: .01ms !important; transition-delay: 0s !important; }
}
.cba__campo {
  flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; font: inherit;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500;
}
.cba__campo::placeholder { color: var(--nu-gray); font-weight: 500; }
.cba__enviar {
  flex-shrink: 0; width: 40px; height: 40px; border: 0; border-radius: 50%; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-ink); color: var(--nu-white);
  transition: transform .2s ease, background .2s ease;
}
.cba__enviar:hover { transform: scale(1.05); }
.cba__enviar:active { transform: scale(.96); }
.cba__enviar--pronto { background: var(--nu-blue); }
.cba__enviar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* as sugestões: um cartão branco logo acima da barra */
.cba__sugs {
  list-style: none; margin: 0 0 12px; padding: 6px;
  background: var(--nu-white); border-radius: 20px;
  box-shadow: var(--nu-chat-sombra-sug);
}
.cba__sug {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; border: 0; border-radius: 14px; background: transparent; cursor: pointer; text-align: left;
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.35;
  transition: background .15s ease;
}
.cba__sug svg { flex-shrink: 0; color: var(--nu-gray); transition: color .15s ease, transform .15s ease; }
.cba__sug--ativa { background: var(--nu-cream); }
.cba__sug--ativa svg { color: var(--nu-blue); transform: translate(1px, -1px); }

.cba-enter-active, .cba-leave-active { transition: opacity .25s ease, transform .3s cubic-bezier(.2, .8, .2, 1); }
.cba-enter-from, .cba-leave-to { opacity: 0; transform: translate(-50%, 16px); }
.cba-sug-enter-active, .cba-sug-leave-active { transition: opacity .18s ease, transform .22s cubic-bezier(.2, .8, .2, 1); }
.cba-sug-enter-from, .cba-sug-leave-to { opacity: 0; transform: translateY(8px); }

@media (max-width: 760px) {
  .cba { bottom: calc(12px + env(safe-area-inset-bottom)); width: calc(100% - 24px); }
  .cba__linha { height: 50px; padding-left: 16px; gap: 10px; }
  /* 16px no campo: abaixo disso o iOS dá zoom no foco */
  .cba__campo { font-size: 16px; }
}
</style>

<style>
/* A folga no fim da página: o rodapé (navy) cresce a altura da barra, e
   páginas sem rodapé ganham a folga no próprio shell. Assim o fim do conteúdo
   nunca fica escondido atrás da barra. */
html.nu-chat-barra .nu-shell > footer { padding-bottom: calc(92px + env(safe-area-inset-bottom)); }
html.nu-chat-barra .nu-shell:not(:has(> footer)) { padding-bottom: calc(92px + env(safe-area-inset-bottom)); }
</style>
