<script setup lang="ts">
// O chat da Aportou como painel à direita (02/11/2026, pedido do dono: "o chat
// agora não será uma janela e sim um componente que pode ser aberto em qualquer
// página"). Montado no layout padrão; abre pela barra flutuante (ChatBarra),
// por useChatPainel().abrir(pergunta) de qualquer tela e pelos deep-links
// `?pergunta=` (abre com a pergunta) e `?chat=1` (só abre).
//
// No computador ele encosta à direita e a página encolhe ao lado (a página
// continua usável, e é dela que a pessoa tira o contexto com o cursor mágico,
// ChatSeletor). Entre 760 e 1180px ele passa por cima da página; no celular é
// uma folha de tela cheia. Esc fecha (o histórico antes, se aberto). Não prende
// o Tab: é um painel ao lado, não um modal.
//
// A conversa é a do useNuChat (stream, sessões, gate da assinatura). Quem não
// entrou vai ao login e volta para a mesma página com a pergunta em
// ?pergunta= (utils/chat-painel.ts): ela é enviada sozinha na volta, porque
// quem mandou ao login deixou o marcador na aba. Um ?pergunta= de fora só
// preenche o campo e espera a pessoa enviar (acaoDoPedido).
//
// A cara é a da Aportou (11/11/2026): o topo é a faixa da marca "IA DA APORTOU"
// (NuFaixaMarca) com as ações do painel; embaixo dela, "Falando sobre PETR4"
// quando a página é de um ativo (é o mesmo foco que vai no routeContext da
// pergunta). O painel segue lateral, de altura cheia: só a roupa mudou.
//
// Robustez (11/11/2026): o painel entra deslizando da borda na curva do que
// muda de lugar (--nu-ease-troca, --nu-dur-lenta), junto com a página que
// encolhe, e sai mais rápido; o vazio, as sugestões e as mensagens chegam com
// nu-fade nos tempos dos tokens, em cascata de 60ms; o "pensando" é sereno: a
// pílula carvão com o anel no ritmo de repouso e a luz baixa (quem acelera é o
// anel do campo).
import { acaoDoPedido, esquecerPerguntaDoGate, lerPerguntaDoGate, MAX_CONTEXTOS, pedidoDaQuery, podeRetomarPerguntaAqui, querySemPedido, sugestoesDaRota, tickerDaRota } from '~/utils/chat-painel'
import { CHAVE_POS_LOGIN, type ContextoDoChat } from '~/composables/useChatPainel'


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
  : 'Clique em algo da página para mostrar à IA.'))

/* ——— o ativo da página: "Falando sobre PETR4 Petrobras" ———
   O ticker é o da rota (o mesmo que vai no routeContext do envio). O nome sai
   do que a página do ativo já carregou (o payload `acao:TICKER` do useAcao):
   nenhuma chamada nova; sem ele, fica só o ticker. */
const nuxtApp = useNuxtApp()
const tickerDaPagina = computed(() => tickerDaRota(route.path))
const nomeDoAtivo = computed(() => {
  const t = tickerDaPagina.value
  if (!t) return ''
  const dado = (nuxtApp.payload.data as Record<string, unknown>)[`acao:${t}`] as { name?: unknown } | null | undefined
  const nome = typeof dado?.name === 'string' ? dado.name.trim() : ''
  return nome && nome.toUpperCase() !== t ? nome : ''
})
const convite = computed(() => {
  const t = tickerDaPagina.value
  if (!t) return 'Pergunte à Aportou'
  return messages.value.length ? `Pergunte mais sobre ${t}` : `Pergunte sobre ${t}`
})
/** o que a IA está fazendo, na pílula carvão dos três pontos */
const estado = computed(() => (pensandoVazio.value ? 'Pensando' : pensandoMeio.value ? 'Buscando os dados' : ''))
/** a folha de tela cheia do celular não tem canto: a aba da faixa também não */
const folha = ref(false)

/* ——— enviar ———
   Quem não entrou vê a folha de cadastro com a pergunta (o herói da pergunta
   guardada); com a conta aberta, o painel reabre e manda. Quem entrou e não
   assina vê o quiz da assinatura de cara (dono, 02/11/2026: "se estiver
   logado mas não for assinante, já mostra o quiz logo de cara"). */
const quiz = useQuizAssinatura()

// o gate da conversa (o envio barrado, ou o chat-service com
// assinatura_necessaria) abre o quiz no lugar da folha antiga
watch(() => assinatura.gate.value, (g) => {
  if (g !== 'chat') return
  assinatura.fecharGate()
  quiz.abrir('chat')
})

async function enviar(pergunta: string, junto: ContextoDoChat[]) {
  const q = pergunta.trim()
  if (!q || streaming.value) return
  if (!isAuthenticated.value) { painel.pedirConta(q, junto); return }
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

// o texto que alguém pediu para pôr no campo sem enviar (preencher): a
// pessoa lê e manda ela mesma
watch([aberto, () => painel.rascunho.value], ([a, r]) => {
  if (!import.meta.client || !a || !r) return
  painel.rascunho.value = null
  texto.value = r
  nextTick(() => composer.value?.focar())
}, { immediate: true })

// a pergunta que esbarrou na assinatura (o quiz abriu no lugar): quando a pessoa
// volta assinante, o painel abre e a manda sozinho. Fora do meio do fluxo
// (login, /assinar) e só com a assinatura confirmada: com o webhook atrasado,
// espera o snapshot virar e tenta de novo.
let retomando = false
function retomarPerguntaDoGate() {
  if (!import.meta.client || retomando || !isAuthenticated.value) return
  if (!podeRetomarPerguntaAqui(route.path)) return
  const p = lerPerguntaDoGate(localStorage, Date.now())
  if (!p) return
  if (!assinatura.carregado.value) { void assinatura.carregar(); return }
  if (!assinatura.assinante.value || assinatura.situacao.value === 'desconhecido') return
  retomando = true
  esquecerPerguntaDoGate(localStorage)
  painel.abrir(p.texto, p.contextos)
  retomando = false
}
onMounted(retomarPerguntaDoGate)
watch([() => assinatura.carregado.value, () => assinatura.assinante.value, () => route.path], retomarPerguntaDoGate)

/* ——— histórico ——— */
// o botão de conversa da barra: o painel abre já na lista
watch([aberto, () => painel.conversasPedidas.value], ([a, pedidas]) => {
  if (!import.meta.client || !a || !pedidas) return
  painel.conversasPedidas.value = false
  historico.value = true
  if (isAuthenticated.value) void chat.loadSessions()
}, { immediate: true })

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
let mqFolha: MediaQueryList | null = null
function lerFolha() { folha.value = !!mqFolha?.matches }

watch(aberto, async (a) => {
  if (!import.meta.client) return
  const html = document.documentElement
  html.classList.toggle('nu-chat-aberto', a)
  if (a) {
    focoAntes = document.activeElement as HTMLElement | null
    if (celular()) html.style.overflow = 'hidden'
    if (isAuthenticated.value && !sessions.value.length) void chat.loadSessions()
    await nextTick()
    // no celular o foco subiria o teclado por cima da resposta que vai chegar
    if (!celular()) composer.value?.focar()
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
  let aba: Storage | null = null
  try { aba = sessionStorage } catch { /* sem storage: nunca envia sozinho */ }
  // enviar: a volta do login que esta aba pediu. Preencher: qualquer outro
  // link (de fora, ou do visitante, que ao enviar vai ao login)
  const acao = acaoDoPedido(pedido, isAuthenticated.value, aba, Date.now())
  if (acao.tipo === 'enviar') painel.abrir(acao.pergunta)
  else if (acao.tipo === 'preencher') { texto.value = acao.pergunta; painel.abrir() }
  else painel.abrir()
  void router.replace({ query: querySemPedido(route.query as Record<string, unknown>) as Record<string, string> })
}
watch(() => route.query, lerPedido)

onMounted(() => {
  apontador.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  mqFolha = window.matchMedia('(max-width: 759px)')
  lerFolha()
  mqFolha.addEventListener('change', lerFolha)
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
  mqFolha?.removeEventListener('change', lerFolha)
  document.documentElement.classList.remove('nu-chat-aberto')
  document.documentElement.style.removeProperty('overflow')
})
</script>

<template>
  <Transition name="cpn">
    <aside
      v-if="aberto" class="cpn" :class="{ 'cpn--atras': !!assinatura.gate.value }"
      aria-label="Conversa com a IA da Aportou"
    >
      <NuFaixaMarca rotulo="IA da Aportou" :altura="52" :raio="folha ? 0 : 32" como="h2" class="cpn__topo">
        <template #acoes>
          <button
            v-if="isAuthenticated" type="button" class="cpn__icone" :class="{ 'cpn__icone--on': historico }"
            :aria-pressed="historico" aria-label="Conversas anteriores" title="Conversas anteriores" @click="alternarHistorico"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" /><path d="M3.5 4.5V9H8" /><path d="M12 7.5V12l3 2" /></svg>
          </button>
          <button
            v-if="messages.length" type="button" class="cpn__icone" aria-label="Nova conversa" title="Nova conversa" @click="novaConversa"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h8" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" /></svg>
          </button>
          <button type="button" class="cpn__icone" aria-label="Fechar a conversa" title="Fechar (Esc)" @click="painel.fechar()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>
          </button>
        </template>
        <p v-if="tickerDaPagina" class="cpn__sobre">
          <span class="cpn__sobre-rotulo">Falando sobre</span>
          <span class="cpn__sobre-ativo"><span class="cpn__sobre-ticker">{{ tickerDaPagina }}</span><span v-if="nomeDoAtivo" class="cpn__sobre-nome">{{ nomeDoAtivo }}</span></span>
        </p>
        <p v-else class="cpn__sobre"><span class="cpn__sobre-rotulo">Investir fica mais claro.</span></p>
      </NuFaixaMarca>

      <div ref="corpo" class="cpn__corpo">
        <ChatHistorico
          v-if="historico"
          :sessions="sessions" :carregando="sessionsLoading" :ativa-id="sessionId"
          @abrir="abrirSessao" @apagar="chat.deleteSession"
        />

        <template v-else>
          <div v-if="vazio" class="cpn__vazio">
            <MarcaCorte :largura="64" class="cpn__vazio-corte" />
            <h2 class="cpn__vazio-titulo">Pergunte qualquer coisa.</h2>
            <p class="cpn__vazio-sub">Sobre um ativo, a sua carteira ou o mercado de hoje.</p>
            <div class="cpn__sugs">
              <button v-for="(s, k) in sugestoes" :key="s" type="button" class="cpn__sug" :style="{ '--k': k }" @click="onFollowup(s)">{{ s }}</button>
            </div>
          </div>

          <!-- role=log + aria-live: o leitor de tela lê a resposta enquanto chega -->
          <div v-else class="cpn__conversa" role="log" aria-live="polite" aria-relevant="additions text">
            <div v-if="loadingSessionId && !messages.length" class="cpn__sk" aria-hidden="true">
              <NuSkeleton variant="line" height="46px" width="62%" radius="20px 20px 5px 20px" class="cpn__sk-eu" />
              <div class="cpn__sk-ia">
                <NuSkeleton variant="circle" width="30px" height="30px" />
                <div class="cpn__sk-balao"><NuSkeleton variant="text" :lines="4" last-width="48%" /></div>
              </div>
            </div>
            <ChatMensagem
              v-for="m in visiveis" :key="m.id" :msg="m"
              :ao-vivo="streaming && m.id === ultimaIaId"
              :mostrar-followups="m.id === ultimaIaId && !streaming"
              :login-href="loginHref"
              @followup="onFollowup"
            />
            <!-- respondendo: a pílula carvão com o anel e os três pontos -->
            <div
              v-if="estado" class="cpn__pensando" :class="{ 'cpn__pensando--meio': pensandoMeio }" role="status"
              :aria-label="pensandoVazio ? 'A IA da Aportou está pensando' : 'A IA da Aportou está buscando os dados'"
            >
              <span v-if="pensandoVazio" class="cpn__pensando-avatar" aria-hidden="true"><MarcaCorte :largura="16" cor="var(--nu-blue-on-dark)" /></span>
              <ChatPilula class="cpn__pensando-pilula" escuro>
                <span class="cpn__pensando-in" aria-hidden="true">
                  <MarcaCorte :largura="20" cor="var(--nu-blue-on-dark)" />
                  <span>{{ estado }}</span>
                  <span class="cpn__pontos"><i /><i /><i /></span>
                </span>
              </ChatPilula>
            </div>
          </div>
        </template>
      </div>

      <footer class="cpn__pe">
        <p v-if="apontador" class="cpn__dica">
          <span class="cpn__dica-ponto" aria-hidden="true" />{{ dica }}
        </p>
        <ChatComposer
          ref="composer" v-model="texto" :contextos="contextos" :streaming="streaming" :novo-id="novoId" :convite="convite"
          @enviar="enviarDoCampo" @parar="chat.stop()" @remover="painel.remover"
        />
        <p class="cpn__aviso">Resposta gerada por IA. Não é recomendação de compra ou venda.</p>
      </footer>
    </aside>
  </Transition>
</template>

<style scoped>
.cpn {
  /* solto da borda (dono, 02/11/2026: "dê uma margem nesse chat e deixe arredondado") */
  position: fixed; z-index: 51; top: var(--chat-painel-margem); right: var(--chat-painel-margem); bottom: var(--chat-painel-margem);
  width: var(--chat-painel-w, 440px);
  display: flex; flex-direction: column; overflow: hidden; background: var(--nu-page);
  border-radius: var(--nu-r-card-lg);
  box-shadow: var(--nu-chat-sombra-painel);
}
.cpn--atras { z-index: 40; }

/* o topo: a faixa da marca. É o cabeçalho do painel, não um cartão solto: sem
   o canto e a sombra próprios (o painel já recorta e já tem a dele) */
.cpn__topo { flex-shrink: 0; border-radius: 0 !important; box-shadow: none !important; padding-bottom: 16px; }
.cpn__icone {
  width: 44px; height: 44px; border: 0; border-radius: 50%; padding: 0; display: grid; place-items: center; cursor: pointer;
  background: transparent; color: var(--nu-white);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.cpn__icone:hover { background: var(--nu-dark-chip); }
.cpn__icone:active { transform: scale(.94); }
.cpn__icone--on { background: var(--nu-dark-chip); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line); }
.cpn__icone:focus-visible { outline-color: var(--nu-white); outline-offset: -3px; }
.cpn__sobre {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px; min-height: 28px; margin: 0; padding: 14px 20px 0 30px;
  font-size: var(--nu-fs-marca); font-weight: var(--nu-w-texto); line-height: 1.3; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both;
}
.cpn__sobre-rotulo { color: var(--nu-on-dark-2); }
.cpn__sobre-ativo {
  display: inline-flex; align-items: center; gap: 7px; min-width: 0; max-width: 100%; padding: 4px 11px 4px 5px;
  border-radius: var(--nu-r-pill); background: var(--nu-gray-3); color: var(--nu-white); font-weight: var(--nu-w-medio);
}
.cpn__sobre-ticker {
  flex: none; padding: 1px 8px; border-radius: var(--nu-r-pill); background: var(--nu-creme); color: var(--nu-ink);
  font-size: var(--nu-fs-xs); font-weight: var(--nu-w-forte); letter-spacing: 0.04em;
}
.cpn__sobre-nome { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.cpn__corpo { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 14px 18px 12px; }

/* vazio: o corte grande, o convite e as sugestões da página, em cascata de 60ms */
.cpn__vazio { padding: clamp(24px, 7vh, 72px) 4px 12px; }
.cpn__vazio-corte { animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.cpn__vazio-titulo {
  margin: 24px 0 0; color: var(--nu-ink); font-size: clamp(28px, 3.4vh, 34px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.05;
  animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) 60ms both;
}
.cpn__vazio-sub { margin: 12px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) 120ms both; }
.cpn__sugs { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 24px; }
.cpn__sug {
  min-height: 44px; max-width: 100%; text-align: left; padding: 8px 16px; border: 0; border-radius: 22px;
  background: var(--nu-cream-2); cursor: pointer;
  color: var(--nu-ink); font: inherit; font-size: 14.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); line-height: 1.35;
  animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; animation-delay: calc(180ms + var(--k) * 60ms);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.cpn__sug:hover { background: var(--nu-ink); color: var(--nu-white); }
.cpn__sug:active { transform: scale(.98); }

.cpn__conversa { padding-top: 2px; }
.cpn__sk { display: flex; flex-direction: column; gap: 14px; padding-top: 14px; }
.cpn__sk-eu { align-self: flex-end; }
.cpn__sk-ia { display: flex; align-items: flex-start; gap: 10px; }
.cpn__sk-balao { flex: 1; min-width: 0; padding: 16px; border-radius: 5px 20px 20px 20px; background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-line-2); }

/* respondendo: o avatar e a pílula carvão dos três pontos, serena (o anel em repouso e a luz baixa) */
.cpn__pensando { display: flex; align-items: center; gap: 10px; margin: 4px 0 24px; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.cpn__pensando--meio { margin-top: -4px; padding-left: 40px; }
.cpn__pensando-avatar { flex: none; width: 30px; height: 30px; border-radius: 50%; background: var(--nu-ink); display: grid; place-items: center; }
.cpn__pensando-pilula { --cpi-raio: 999px; }
.cpn__pensando-pilula :deep(.cpi__brilho) { opacity: .26; }
.cpn__pensando-in {
  display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 18px 0 16px;
  color: var(--nu-white); font-size: 15px; font-weight: var(--nu-w-medio); white-space: nowrap;
}
.cpn__pontos { display: inline-flex; gap: 4px; }
.cpn__pontos i { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-white); animation: nu-ponto calc(var(--nu-dur-entrada) * 2) var(--nu-ease-cor) infinite; }
.cpn__pontos i:nth-child(2) { animation-delay: 240ms; }
.cpn__pontos i:nth-child(3) { animation-delay: 480ms; }

.cpn__pe { flex-shrink: 0; padding: 10px 16px calc(12px + env(safe-area-inset-bottom)); }
.cpn__dica {
  display: flex; align-items: center; gap: 8px; margin: 0 8px 12px;
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); line-height: 1.4;
}
.cpn__dica-ponto { flex-shrink: 0; width: 9px; height: 9px; border-radius: 50%; background: var(--nu-anel); }
.cpn__aviso { margin: 12px 8px 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); line-height: 1.4; text-align: center; }

/* o painel desliza da borda direita (o que muda de lugar), junto com a página que encolhe;
   sai pelo mesmo caminho, mais rápido */
.cpn-enter-active { transition: transform var(--nu-dur-lenta) var(--nu-ease-troca), opacity var(--nu-dur-media) var(--nu-ease-cor); }
.cpn-leave-active { transition: transform var(--nu-dur-media) var(--nu-ease-cor), opacity var(--nu-dur-media) var(--nu-ease-cor); }
.cpn-enter-from, .cpn-leave-to { transform: translateX(calc(100% + var(--chat-painel-margem))); opacity: 0; }

@media (max-width: 759px) {
  .cpn { inset: 0; width: 100%; border-radius: 0; box-shadow: none; }
  .cpn__topo { padding-top: env(safe-area-inset-top); }
  .cpn__sobre { padding-left: 22px; }
  .cpn__corpo { padding: 12px 14px 12px; }
  .cpn__pe { padding-left: 12px; padding-right: 12px; }
  .cpn__pensando--meio { padding-left: 34px; }
  /* no celular a folha de tela cheia sobe do pé */
  .cpn-enter-from, .cpn-leave-to { transform: translateY(40px); }
}
@media (prefers-reduced-motion: reduce) {
  .cpn-enter-active, .cpn-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor); }
  .cpn-enter-from, .cpn-leave-to { transform: none; }
}
</style>

<style>
/* O painel encosta à direita e a página encolhe ao lado dele, no computador
   largo; entre 760 e 1180px ele passa por cima (a página ficaria estreita). */
:root { --chat-painel-w: 440px; --chat-painel-margem: 12px; }
@media (min-width: 1180px) {
  /* fechar: a página volta no tempo da saída do painel (mais rápida) */
  .nu-shell { transition: margin-right var(--nu-dur-media) var(--nu-ease-cor); }
  /* abrir: a página encolhe o painel e as duas margens dele, na mesma curva e no mesmo tempo da entrada dele */
  html.nu-chat-aberto .nu-shell { margin-right: calc(var(--chat-painel-w) + 2 * var(--chat-painel-margem)); transition: margin-right var(--nu-dur-lenta) var(--nu-ease-troca); }
}
@media (min-width: 1500px) { :root { --chat-painel-w: 460px; } }
@media (prefers-reduced-motion: reduce) { .nu-shell { transition: none; } }
</style>
