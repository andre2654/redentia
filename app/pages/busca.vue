<script setup lang="ts">
// /busca: só busca (redesenho de 02/11/2026, "a tela de pesquisar mais
// clara"). O chat saiu daqui para o painel que abre do lado de qualquer
// página (useChatPainel, branch feat/chat-painel); a busca só entrega a
// pergunta com abrir(q).
//
// Antes eram dois modos na mesma tela (busca e chat, ?chat=1 com drawer de
// histórico), três entradas de chat acima do primeiro resultado, filtros numa
// segunda faixa, resultados numa grade de três colunas sem ordem de leitura e
// "sem resultados" numa linha cinza. Agora: campo e tipos no topo, uma coluna
// de linhas na ordem em que as setas andam, e a pergunta como última linha.
//
//  - ?q= preenche o campo e acompanha o que se digita (o voltar do navegador
//    devolve a busca); ?tipo= é a pill; '/' foca; Esc limpa.
//  - ?chat=1 (e ?chat=1&q=) abre o painel com a pergunta. É o contrato dos
//    atalhos da carteira ("Novo aporte", "Rebalancear"). Chat exige login:
//    anônimo vai para /login?redirect= com a rota inteira, no servidor.
//  - ↑↓ andam pela lista inteira e dão a volta; Enter abre a linha marcada
//    (com texto, a primeira já vem marcada).
//  - 100% client: zero fetch no SSR (o índice baixa no onMounted).
import type { BuscaGrupo, BuscaItem, BuscaType } from '~/composables/useBuscaIndex'

const VALID_TIPOS: BuscaType[] = ['todos', 'acoes', 'fiis', 'bdrs', 'etfs', 'eua', 'cripto', 'tesouro']

usePageSeo({
  title: 'Busca',
  description: 'Busque ações, FIIs, BDRs, ETFs, cripto, Tesouro Direto, teses e guias da Redentia.',
  // Ferramenta: não rankeia, mas os links internos (ativos, teses) seguem rastreáveis.
  robots: 'noindex, follow',
})

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuthState()
const painel = useChatPainel()
const index = useBuscaIndex()
const recentes = useBuscaRecentes()

const linkDeChat = acaoDoLinkDeChat(route.query, route.fullPath, isAuthenticated.value)

// com ?chat=1 o ?q= é a pergunta do painel, não a busca
const qParam = route.query.q
const q = ref(typeof qParam === 'string' && linkDeChat.tipo === 'nenhuma' ? qParam : '')
// com ?q= na chegada a primeira linha já vem marcada, como ao digitar
const ativo = ref(q.value.trim() ? 0 : -1)
const campo = ref<{ focus: () => void } | null>(null)

const tipo = computed<BuscaType>(() => {
  const t = String(route.query.tipo ?? '')
  return (VALID_TIPOS as string[]).includes(t) ? (t as BuscaType) : 'todos'
})

const texto = computed(() => q.value.trim())
const modo = computed<'busca' | 'tipo' | 'inicio'>(() =>
  texto.value ? 'busca' : tipo.value !== 'todos' ? 'tipo' : 'inicio')

const resultado = computed(() => index.search(q.value, tipo.value))
const browseVM = computed(() => index.browse(tipo.value))
const maioresVM = computed(() => index.maiores())

/** com filtro e nada achado: quantos o "Todos" acharia */
const emTodos = computed(() =>
  modo.value === 'busca' && tipo.value !== 'todos' && resultado.value.estado === 'vazio'
    ? index.search(q.value, 'todos').total : 0)

const grupos = computed<BuscaGrupo[]>(() => {
  if (modo.value === 'busca') return resultado.value.grupos
  if (modo.value === 'tipo') return browseVM.value.itens.length ? [{ id: 'tipo', titulo: '', itens: browseVM.value.itens }] : []
  const lista: BuscaGrupo[] = []
  const rec = recentes.lista.value.map(index.aoVivo)
  if (rec.length) lista.push({ id: 'recentes', titulo: 'Recentes', itens: rec })
  lista.push(...maioresVM.value.grupos)
  return lista
})

const carregando = computed(() => {
  if (modo.value === 'busca') return resultado.value.estado === 'carregando' ? 4 : 0
  if (modo.value === 'tipo') return browseVM.value.estado === 'carregando' ? 8 : 0
  return maioresVM.value.estado === 'carregando' ? 6 : 0
})

const itens = computed<BuscaItem[]>(() => grupos.value.flatMap((g) => g.itens))
const pergunta = computed(() => (texto.value ? { texto: texto.value, logado: isAuthenticated.value } : null))
const totalNav = computed(() => itens.value.length + (pergunta.value ? 1 : 0))
const ativoId = computed(() => (ativo.value >= 0 && ativo.value < totalNav.value ? `busca-op-${ativo.value}` : null))

// texto novo marca a primeira linha (Enter já abre); sem texto, nada marcado
watch([texto, tipo], () => { ativo.value = texto.value ? 0 : -1 })
watch(totalNav, (n) => { if (ativo.value >= n) ativo.value = texto.value ? 0 : -1 })

/* ——— URL: ?q= acompanha o campo, ?tipo= é a pill ——— */
let qTimer: ReturnType<typeof setTimeout> | null = null
watch(q, (v) => {
  if (qTimer) clearTimeout(qTimer)
  qTimer = setTimeout(() => {
    const query = { ...route.query } as Record<string, any>
    if (v.trim()) query.q = v
    else delete query.q
    void router.replace({ query })
  }, 300)
})

function setTipo(t: BuscaType) {
  index.resetBrowse()
  const query = { ...route.query } as Record<string, any>
  if (t === 'todos') delete query.tipo
  else query.tipo = t
  void router.replace({ query })
  index.ensureType(t)
}

/* ——— ações ——— */
function escolher(it: BuscaItem) {
  recentes.lembrar(it)
}

function abrirLinha(i: number) {
  const it = itens.value[i]
  if (it) {
    escolher(it)
    void navigateTo(it.href)
  } else if (pergunta.value && i === itens.value.length) {
    perguntar()
  }
}

function perguntar() {
  const p = texto.value
  if (!p) return
  // sem conta, a folha de cadastro com a pergunta; com conta, o painel
  painel.perguntar(p)
}

function rolarAteAtivo() {
  nextTick(() => document.getElementById(`busca-op-${ativo.value}`)?.scrollIntoView({ block: 'nearest' }))
}

function onTecla(e: KeyboardEvent) {
  if (e.isComposing) return
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    ativo.value = proximoIndice(ativo.value, totalNav.value, e.key === 'ArrowDown' ? 1 : -1)
    rolarAteAtivo()
  } else if (e.key === 'Enter') {
    if (ativo.value >= 0) { e.preventDefault(); abrirLinha(ativo.value) }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    if (q.value) q.value = ''
    else (e.target as HTMLElement).blur()
  }
}

function digitando(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable
}

function onTeclaGlobal(e: KeyboardEvent) {
  if (e.defaultPrevented) return
  if (e.key === '/' && !digitando(document.activeElement)) {
    e.preventDefault()
    campo.value?.focus()
  } else if (e.key === 'Escape' && !digitando(document.activeElement) && q.value) {
    q.value = ''
  }
}

onMounted(() => {
  window.addEventListener('keydown', onTeclaGlobal)
  index.ensureUniverse()
  recentes.carregar()
  if (linkDeChat.tipo === 'abrir') {
    painel.abrir(linkDeChat.pergunta || undefined)
    // tira chat e q da URL: um refresh não reenvia a pergunta
    void router.replace({ query: linkDeChat.query })
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onTeclaGlobal)
  if (qTimer) clearTimeout(qTimer)
})

// Deep link de chat do anônimo: login no servidor, sem flash (o cookie de
// sessão é visível no SSR). Depois de todo hook: hook registrado após um
// await é descartado.
if (linkDeChat.tipo === 'login') {
  await navigateTo(linkDeChat.para, { replace: true })
}
</script>

<template>
  <div class="bp">
    <BuscaCampo
      ref="campo"
      v-model="q"
      :tipo="tipo"
      :ativo-id="ativoId"
      :com-lista="totalNav > 0"
      @update:tipo="setTipo"
      @tecla="onTecla"
    />

    <section class="bp__corpo" aria-live="polite" :aria-busy="carregando > 0">
      <!-- tipo marcado, campo vazio: o cabeçalho da lista navegável -->
      <div v-if="modo === 'tipo' && browseVM.estado !== 'erro'" class="bp__cab">
        <h2 class="bp__cab-titulo">
          {{ browseVM.titulo }}
          <span v-if="browseVM.total" class="bp__cab-n">{{ browseVM.total }}</span>
        </h2>
        <NuxtLink v-if="browseVM.maisHref" :to="browseVM.maisHref" class="bp__link">
          {{ browseVM.maisRotulo }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>

      <!-- nada achado: frase e saída, antes da pergunta -->
      <div v-if="modo === 'busca' && resultado.estado === 'vazio'" class="bp__vazio">
        <h2 class="bp__vazio-titulo">Nada encontrado para “{{ texto }}”.</h2>
        <p class="bp__vazio-txt">Confira a grafia ou busque pelo ticker, como PETR4.</p>
        <button v-if="emTodos" type="button" class="bp__outline" @click="setTipo('todos')">
          {{ emTodos === 1 ? 'Ver 1 resultado' : `Ver ${emTodos} resultados` }} em Todos
        </button>
      </div>

      <p
        v-else-if="(modo === 'busca' && resultado.estado === 'erro') || (modo === 'tipo' && browseVM.estado === 'erro') || (modo === 'inicio' && maioresVM.estado === 'erro' && !grupos.length)"
        class="bp__erro"
      >
        Não consegui carregar os ativos agora. Tente de novo em instantes.
      </p>

      <BuscaLista
        :grupos="grupos"
        :ativo="ativo"
        :carregando="carregando"
        :pergunta="pergunta"
        limpavel="recentes"
        @escolher="escolher"
        @perguntar="perguntar"
        @marcar="ativo = $event"
        @limpar="recentes.limpar()"
      />

      <button
        v-if="modo === 'tipo' && browseVM.hasMore" type="button" class="bp__outline bp__mais"
        @click="index.showMore()"
      >Ver mais</button>

      <p v-if="totalNav > 0" class="bp__dica" data-nu-hide aria-hidden="true">
        <kbd>↑</kbd><kbd>↓</kbd> para navegar <span>·</span> <kbd>Enter</kbd> abre <span>·</span> <kbd>Esc</kbd> limpa
      </p>
    </section>

  </div>
</template>

<style scoped>
.bp__corpo {
  display: flex; flex-direction: column;
  padding: clamp(24px, 3.2vw, 44px) clamp(22px, 5.5vw, 80px) clamp(64px, 8vw, 100px);
  background: var(--nu-white);
}
.bp__corpo > * { width: 100%; max-width: 880px; }

.bp__cab {
  display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  margin-bottom: 8px;
}
.bp__cab-titulo {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.01em;
}
.bp__cab-n { margin-left: 6px; color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.bp__link {
  display: inline-flex; align-items: center; gap: 5px; min-height: 44px;
  color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
}
.bp__link:hover { color: var(--nu-blue-hover); }
.bp__link:hover svg { transform: translateX(3px); }
.bp__link svg { transition: transform .2s ease; }
.bp__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 6px; }

.bp__vazio { padding: 8px 0 28px; }
.bp__vazio-titulo {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em;
  overflow-wrap: anywhere;
}
.bp__vazio-txt { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }
.bp__erro { margin: 0 0 24px; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }

.bp__outline {
  align-self: flex-start; width: auto; margin-top: 18px; min-height: 44px; padding: 10px 22px;
  background: var(--nu-white); color: var(--nu-blue-text);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill);
  font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; transition: background .2s;
}
.bp__outline:hover { background: var(--nu-blue-tint-2); }
.bp__outline:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bp__mais { margin-top: 24px; }

.bp__dica {
  margin: 28px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600;
}
.bp__dica span { margin: 0 6px; }
.bp__dica kbd {
  display: inline-block; min-width: 22px; margin-right: 4px; padding: 1px 6px; text-align: center;
  border: 1.5px solid var(--nu-cream-3); border-radius: 6px;
  font: inherit; font-weight: 700; color: var(--nu-gray-2);
}
</style>
