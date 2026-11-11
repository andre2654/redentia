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
// o estado vazio aponta para as páginas de mercado (2ª rodada da Aportou, 11/11/2026)
const SUGESTOES = [
  { rotulo: 'Rankings da B3', to: '/rankings' },
  { rotulo: 'Setores', to: '/setor' },
  { rotulo: 'Teses', to: '/teses' },
  { rotulo: 'Tesouro Direto', to: '/tesouro' },
  { rotulo: 'Notícias', to: '/noticias' },
]

usePageSeo({
  title: 'Busca',
  description: 'Busque ações, FIIs, BDRs, ETFs, cripto, Tesouro Direto, teses e guias da Aportou.',
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
        <!-- sugestões: por onde continuar quando a busca não achou -->
        <p class="bp__sug-rotulo">Ou explore por aqui</p>
        <ul class="bp__sug">
          <li v-for="s in SUGESTOES" :key="s.to">
            <NuxtLink :to="s.to" class="bp__sug-chip">{{ s.rotulo }}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></NuxtLink>
          </li>
        </ul>
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
  padding: clamp(24px, 3.2vw, 44px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(64px, 7vw, 100px);
  background: var(--nu-page);
}
.bp__corpo > * { width: 100%; max-width: 880px; }

.bp__cab {
  display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  margin-bottom: 8px;
}
.bp__cab-titulo {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-forte); letter-spacing: -0.025em;
}
.bp__cab-n { margin-left: 6px; color: var(--nu-gray); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.bp__link {
  display: inline-flex; align-items: center; gap: 5px; min-height: 44px;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); white-space: nowrap;
  text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-line);
}
.bp__link:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.bp__link:hover svg { transform: translateX(3px); }
.bp__link svg { transition: transform .2s ease; }
.bp__link:focus-visible { border-radius: 6px; }

.bp__vazio { padding: 8px 0 28px; }
.bp__vazio-titulo {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.05;
  overflow-wrap: anywhere;
}
.bp__vazio-txt { margin: 12px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; }
.bp__sug-rotulo { margin: 28px 0 0; color: var(--nu-ink); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: .16em; text-transform: uppercase; }
.bp__sug { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 0; padding: 0; }
.bp__sug-chip {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font-size: 14.5px; font-weight: 600; white-space: nowrap;
  transition: background .2s ease, transform .15s var(--nu-ease-saida);
}
.bp__sug-chip svg { color: var(--nu-blue-text); transition: transform .2s ease; }
.bp__sug-chip:hover { background: var(--nu-line-2); color: var(--nu-ink); }
.bp__sug-chip:hover svg { transform: translateX(3px); }
.bp__sug-chip:active { transform: scale(.98); }
@media (prefers-reduced-motion: reduce) { .bp__sug-chip, .bp__sug-chip svg { transition: none; } .bp__sug-chip:hover svg, .bp__sug-chip:active { transform: none; } }
.bp__erro { margin: 0 0 24px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; }

.bp__outline {
  align-self: flex-start; width: auto; margin-top: 18px; min-height: 48px; padding: 0 24px;
  background: var(--nu-white); color: var(--nu-ink);
  border: 1.5px solid var(--nu-ink); border-radius: var(--nu-r-pill);
  font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); cursor: pointer; transition: background .2s, transform .15s var(--nu-ease-saida);
}
.bp__outline:hover { background: var(--nu-row-hover); }
.bp__outline:active { transform: scale(.98); }
.bp__mais { margin-top: 24px; }

.bp__dica {
  margin: 28px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600;
}
.bp__dica span { margin: 0 6px; }
.bp__dica kbd {
  display: inline-block; min-width: 22px; margin-right: 4px; padding: 1px 6px; text-align: center;
  border: 1px solid var(--nu-line); border-radius: 6px;
  font: inherit; font-weight: var(--nu-w-medio); color: var(--nu-gray-3);
}
</style>
