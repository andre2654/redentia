<script setup lang="ts">
// O chat da Redentia como painel à direita (02/11/2026, pedido do dono: "o chat
// agora não será uma janela e sim um componente que pode ser aberto em qualquer
// página"). Montado no layout padrão; abre pela barra flutuante (ChatBarra),
// por useChatPainel().abrir(pergunta) de qualquer tela e pelos deep-links
// `?pergunta=` (abre e envia) e `?chat=1` (só abre).
//
// No computador ele encosta à direita e a página encolhe ao lado (a página
// continua usável, e é dela que a pessoa tira o contexto com o cursor mágico,
// ChatSeletor). Entre 760 e 1180px ele passa por cima da página; no celular é
// uma folha de tela cheia. Esc fecha (o histórico antes, se aberto). Não prende
// o Tab: é um painel ao lado, não um modal.
//
// A conversa é a do useNuChat (stream, sessões, gate da assinatura). Quem não
// entrou vai ao login e volta para a mesma página com a pergunta em
// ?pergunta= (utils/chat-painel.ts): ela é enviada sozinha na volta.
import { loginComPergunta, MAX_CONTEXTOS, pedidoDaQuery, querySemPedido, sugestoesDaRota } from '~/utils/chat-painel'
import type { ContextoDoChat } from '~/composables/useChatPainel'

const CHAVE_POS_LOGIN = 'nu:chat:pergunta-pos-login'

const route = useRoute()
const router = useRouter()
const painel = useChatPainel()
const chat = useNuChat()
const { isAuthenticated } = useAuthState()
const assinatura = useAssinatura()

const { aberto, contextos } = painel
const { messages, streaming, thinking, sessionId, sessions, sessionsLoading, loadingSessionId } = chat

const texto = ref('')
const historico = ref(false)
const novoId = ref<string | null>(null)
const corpo = ref<HTMLElement | null>(null)
const composer = ref<{ focar: () => void } | null>(null)
const apontador = ref(false)
let focoAntes: HTMLElement | null = null

const sugestoes = computed(() => sugestoesDaRota(route.path).slice(0, 3))
const vazio = computed(() => messages.value.length === 0 && !streaming.value && !loadingSessionId.value)
const visiveis = computed(() => messages.value.filter((m) => m.role === 'user' || m.content !== '' || m.error))
const ultimaIaId = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) if (messages.value[i]!.role === 'assistant') return messages.value[i]!.id
  return null
})
const ultima = computed(() => messages.value[messages.value.length - 1])
/** pensando sem texto ainda: o esqueleto do parágrafo que vem */
const pensandoVazio = computed(() => thinking.value && !!ultima.value && ultima.value.role === 'assistant' && ultima.value.content === '')
/** uma ferramenta rodando no meio da resposta: uma linha de esqueleto embaixo */
const pensandoMeio = computed(() => thinking.value && !pensandoVazio.value)
const loginHref = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)
const dica = computed(() => (contextos.value.length >= MAX_CONTEXTOS
  ? `Até ${MAX_CONTEXTOS} pedaços da página por pergunta.`
  : 'Clique em algo da página para mostrar à Redentia.'))

/* ——— enviar ——— */
function irAoLogin(pergunta: string) {
  const { url, naUrl } = loginComPergunta(route.path, route.query as Record<string, unknown>, pergunta)
  if (!naUrl) {
    try { sessionStorage.setItem(CHAVE_POS_LOGIN, pergunta) } catch { /* sem storage: volta sem a pergunta */ }
  }
  void navigateTo(url)
}

async function enviar(pergunta: string, junto: ContextoDoChat[]) {
  const q = pergunta.trim()
  if (!q || streaming.value) return
  if (!isAuthenticated.value) { irAoLogin(q); return }
  historico.value = false
  const ok = await chat.send(q, { contextos: junto, rota: route.path })
  // não saiu (gate da assinatura): a pergunta e os chips voltam ao campo
  if (!ok) {
    if (!texto.value) texto.value = q
    for (const c of junto) painel.anexar(c)
  }
}

function enviarDoCampo() {
  const q = texto.value.trim()
  if (!q) return
  const junto = [...contextos.value]
  texto.value = ''
  contextos.value = []
  void enviar(q, junto)
}

function onFollowup(t: string) {
  if (streaming.value) return
  const junto = [...contextos.value]
  contextos.value = []
  void enviar(t, junto)
}

// a pergunta que chegou pela barra (ou por abrir(q) de qualquer tela)
watch([aberto, () => painel.pendente.value], ([a, p]) => {
  if (!import.meta.client || !a || !p) return
  const pend = painel.consumirPendente()
  if (pend) void enviar(pend.texto, pend.contextos)
}, { immediate: true })

/* ——— histórico ——— */
function alternarHistorico() {
  historico.value = !historico.value
  if (historico.value && isAuthenticated.value) void chat.loadSessions()
}
async function abrirSessao(id: string) {
  historico.value = false
  await chat.openSession(id)
  rolarAoFim(false)
}
function novaConversa() {
  chat.newConversation()
  historico.value = false
  texto.value = ''
  nextTick(() => composer.value?.focar())
}

/* ——— rolagem: segue a resposta enquanto a pessoa está no fim ——— */
function rolarAoFim(suave = true) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const el = corpo.value
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: suave ? 'smooth' : 'auto' })
  }))
}
function pertoDoFim(): boolean {
  const el = corpo.value
  return !el || el.scrollTop + el.clientHeight >= el.scrollHeight - 160
}
watch(() => messages.value.length, () => rolarAoFim(true))
watch(() => ultima.value?.content.length ?? 0, () => { if (pertoDoFim()) rolarAoFim(false) })

/* ——— o chip que acabou de entrar ganha o "pop" ——— */
watch(() => contextos.value.length, (n, antes) => {
  if (n > (antes ?? 0)) {
    novoId.value = contextos.value[n - 1]?.id ?? null
    setTimeout(() => { novoId.value = null }, 600)
  }
})

/* ——— abrir / fechar ——— */
function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !aberto.value) return
  // outro modal por cima (a folha da assinatura, o cadastro) fecha primeiro
  if (assinatura.gate.value || document.querySelector('[aria-modal="true"]:not(.cpn)')) return
  if (historico.value) { historico.value = false; return }
  painel.fechar()
}

function celular() { return window.matchMedia('(max-width: 759px)').matches }

watch(aberto, async (a) => {
  if (!import.meta.client) return
  const html = document.documentElement
  html.classList.toggle('nu-chat-aberto', a)
  if (a) {
    focoAntes = document.activeElement as HTMLElement | null
    if (celular()) html.style.overflow = 'hidden'
    if (isAuthenticated.value && !sessions.value.length) void chat.loadSessions()
    await nextTick()
    composer.value?.focar()
    if (messages.value.length) rolarAoFim(false)
  } else {
    html.style.removeProperty('overflow')
    historico.value = false
    // o foco volta para onde estava (a barra some com o painel aberto, então
    // quase sempre é o corpo da página)
    if (focoAntes && document.contains(focoAntes)) focoAntes.focus({ preventScroll: true })
    focoAntes = null
  }
})

/* ——— deep-links ?pergunta= e ?chat=1 ——— */
function lerPedido() {
  const pedido = pedidoDaQuery(route.path, route.query as Record<string, unknown>)
  if (!pedido.abrir) return
  if (pedido.pergunta) {
    // logado: abre e envia. Visitante: abre com a pergunta no campo; enviar
    // leva ao login (sem mandar ninguém ao login só por abrir um link)
    if (isAuthenticated.value) painel.abrir(pedido.pergunta)
    else { texto.value = pedido.pergunta; painel.abrir() }
  } else painel.abrir()
  void router.replace({ query: querySemPedido(route.query as Record<string, unknown>) as Record<string, string> })
}
watch(() => route.query, lerPedido)

onMounted(() => {
  apontador.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  window.addEventListener('keydown', onKey)
  lerPedido()
  // pergunta longa demais para o redirect do login volta pelo sessionStorage
  if (isAuthenticated.value) {
    let guardada: string | null = null
    try { guardada = sessionStorage.getItem(CHAVE_POS_LOGIN); sessionStorage.removeItem(CHAVE_POS_LOGIN) } catch { /* sem storage */ }
    if (guardada) painel.abrir(guardada)
  }
  if (aberto.value) document.documentElement.classList.add('nu-chat-aberto')
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.documentElement.classList.remove('nu-chat-aberto')
  document.documentElement.style.removeProperty('overflow')
})
</script>

<template>
  <Transition name="cpn">
    <aside
      v-if="aberto" class="cpn" :class="{ 'cpn--atras': !!assinatura.gate.value }"
      aria-label="Conversa com a Redentia"
    >
      <header class="cpn__topo">
        <span class="cpn__id">
          <img src="/logo-azul.svg" alt="" width="20" height="20">
          <span class="cpn__nome">Redentia</span>
        </span>
        <span class="cpn__acoes">
          <button
            v-if="isAuthenticated" type="button" class="cpn__icone" :class="{ 'cpn__icone--on': historico }"
            :aria-pressed="historico" aria-label="Conversas anteriores" title="Conversas anteriores" @click="alternarHistorico"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" /><path d="M3.5 4.5V9H8" /><path d="M12 7.5V12l3 2" /></svg>
          </button>
          <button
            v-if="messages.length" type="button" class="cpn__icone" aria-label="Nova conversa" title="Nova conversa" @click="novaConversa"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h8" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" /></svg>
          </button>
          <button type="button" class="cpn__icone" aria-label="Fechar a conversa" title="Fechar (Esc)" @click="painel.fechar()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </span>
      </header>

      <div ref="corpo" class="cpn__corpo">
        <ChatHistorico
          v-if="historico"
          :sessions="sessions" :carregando="sessionsLoading" :ativa-id="sessionId"
          @abrir="abrirSessao" @apagar="chat.deleteSession"
        />

        <template v-else>
          <div v-if="vazio" class="cpn__vazio">
            <h2 class="cpn__vazio-titulo">Pergunte qualquer coisa.</h2>
            <p class="cpn__vazio-sub">Sobre um ativo, a sua carteira ou o mercado de hoje.</p>
            <div class="cpn__sugs">
              <button v-for="s in sugestoes" :key="s" type="button" class="cpn__sug" @click="onFollowup(s)">{{ s }}</button>
            </div>
          </div>

          <!-- role=log + aria-live: o leitor de tela lê a resposta enquanto chega -->
          <div v-else class="cpn__conversa" role="log" aria-live="polite" aria-relevant="additions text">
            <div v-if="loadingSessionId && !messages.length" class="cpn__sk" aria-hidden="true">
              <NuSkeleton variant="line" height="38px" width="62%" radius="18px" class="cpn__sk-eu" />
              <NuSkeleton variant="text" :lines="4" last-width="48%" />
            </div>
            <ChatMensagem
              v-for="m in visiveis" :key="m.id" :msg="m"
              :ao-vivo="streaming && m.id === ultimaIaId"
              :mostrar-followups="m.id === ultimaIaId && !streaming"
              :login-href="loginHref"
              @followup="onFollowup"
            />
            <div v-if="pensandoVazio" class="cpn__pensando" role="status" aria-label="A Redentia está pensando">
              <NuSkeleton variant="text" :lines="3" last-width="58%" />
            </div>
            <div v-else-if="pensandoMeio" class="cpn__pensando cpn__pensando--meio" role="status" aria-label="A Redentia está buscando os dados">
              <NuSkeleton variant="line" height="12px" width="44%" radius="pill" />
            </div>
          </div>
        </template>
      </div>

      <footer class="cpn__pe">
        <p v-if="apontador" class="cpn__dica">
          <span class="cpn__dica-ponto" aria-hidden="true" />{{ dica }}
        </p>
        <ChatComposer
          ref="composer" v-model="texto" :contextos="contextos" :streaming="streaming" :novo-id="novoId"
          @enviar="enviarDoCampo" @parar="chat.stop()" @remover="painel.remover"
        />
        <p class="cpn__aviso">Respostas geradas por IA. Não são recomendação de investimento.</p>
      </footer>
    </aside>
  </Transition>
</template>

<style scoped>
.cpn {
  position: fixed; z-index: 51; top: 0; right: 0; bottom: 0; width: var(--chat-painel-w, 440px);
  display: flex; flex-direction: column; background: var(--nu-white);
  box-shadow: var(--nu-chat-sombra-painel);
}
.cpn--atras { z-index: 40; }

.cpn__topo {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px;
  height: 64px; padding: 0 12px 0 22px;
}
.cpn__id { display: inline-flex; align-items: center; gap: 9px; }
.cpn__id img { display: block; }
.cpn__nome { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em; }
.cpn__acoes { display: inline-flex; align-items: center; gap: 2px; }
.cpn__icone {
  width: 38px; height: 38px; border: 0; border-radius: 50%; display: grid; place-items: center; cursor: pointer;
  background: transparent; color: var(--nu-gray-2); transition: background .15s ease, color .15s ease;
}
.cpn__icone:hover { background: var(--nu-cream); color: var(--nu-ink); }
.cpn__icone--on { background: var(--nu-cream); color: var(--nu-ink); }
.cpn__icone:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }

.cpn__corpo { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 8px 22px 12px; }

.cpn__vazio { padding: clamp(24px, 9vh, 88px) 0 12px; animation: nu-fade .4s ease both; }
.cpn__vazio-titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; }
.cpn__vazio-sub { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.cpn__sugs { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 24px; }
.cpn__sug {
  max-width: 100%; text-align: left; padding: 10px 15px; border-radius: 16px;
  border: 1.5px solid var(--nu-cream-2); background: var(--nu-white); cursor: pointer;
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.4;
  transition: background .2s, border-color .2s;
}
.cpn__sug:hover { background: var(--nu-cream); border-color: var(--nu-cream); }
.cpn__sug:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.cpn__conversa { padding-top: 4px; }
.cpn__sk { display: flex; flex-direction: column; gap: 22px; padding-top: 18px; }
.cpn__sk-eu { align-self: flex-end; }
.cpn__pensando { margin: 6px 0 22px; animation: nu-fade .3s ease both; }
.cpn__pensando--meio { margin-top: -8px; }

.cpn__pe { flex-shrink: 0; padding: 8px 16px calc(12px + env(safe-area-inset-bottom)); }
.cpn__dica {
  display: flex; align-items: center; gap: 8px; margin: 0 6px 10px;
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; line-height: 1.4;
}
.cpn__dica-ponto {
  flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%;
  background: conic-gradient(var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2), var(--nu-blue));
}
.cpn__aviso { margin: 10px 6px 0; color: var(--nu-gray); font-size: 11px; font-weight: 500; line-height: 1.4; text-align: center; }

.cpn-enter-active, .cpn-leave-active { transition: transform .38s cubic-bezier(.2, .8, .2, 1), opacity .25s ease; }
.cpn-enter-from, .cpn-leave-to { transform: translateX(24px); opacity: 0; }

@media (max-width: 759px) {
  .cpn { width: 100%; box-shadow: none; }
  .cpn__topo { padding-top: env(safe-area-inset-top); height: calc(60px + env(safe-area-inset-top)); padding-left: 18px; }
  .cpn__corpo { padding: 4px 18px 12px; }
  .cpn__pe { padding-left: 12px; padding-right: 12px; }
  .cpn-enter-from, .cpn-leave-to { transform: translateY(32px); }
}
</style>

<style>
/* O painel encosta à direita e a página encolhe ao lado dele, no computador
   largo; entre 760 e 1180px ele passa por cima (a página ficaria estreita). */
:root { --chat-painel-w: 440px; }
@media (min-width: 1180px) {
  .nu-shell { transition: margin-right .38s cubic-bezier(.2, .8, .2, 1); }
  html.nu-chat-aberto .nu-shell { margin-right: var(--chat-painel-w); }
}
@media (min-width: 1500px) { :root { --chat-painel-w: 460px; } }
@media (prefers-reduced-motion: reduce) { .nu-shell { transition: none; } }
</style>
