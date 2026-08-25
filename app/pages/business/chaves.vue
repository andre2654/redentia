<script setup lang="ts">
/**
 * /business/chaves — o painel da conta de escritório.
 *
 * MUDANÇA DE MODELO (direção do dono 2026-08-03): era uma chave por pessoa,
 * reaproveitando o `mcp_keys` do B2C. Virou UMA CONTA por escritório, com até
 * cinco chaves rotuladas e o uso de todas num lugar só.
 *
 * REFATORAÇÃO VISUAL (2026-08-03, direção do dono: "estão muito cruas, olhe a
 * diferença pra tela de wallet"). A versão anterior era UMA seção creme com
 * cartões brancos empilhados a 20px de distância, sem título de seção, sem
 * elevação, sem superfície escura. A tela tinha importado a contenção da
 * LANDING de venda (fio de 1px, raio de documento, tipografia pequena) pra
 * dentro de um PAINEL, onde essa contenção não protege nada.
 *
 * Agora são QUATRO BANDAS full-bleed, cada uma pintando o próprio fundo e
 * carregando o próprio respiro vertical — a troca de cor É o separador, que é
 * como a /carteira e a /asset se organizam:
 *
 *   A. creme  RbKeysHero    o número do dia + consumo por chave
 *   B. navy   RbKeysUsage   30 dias de chamadas
 *   C. creme  RbKeysTable   as chaves, o segredo e o gerador
 *   D. branco RbKeysScope   escopos, limites e o próximo passo
 *
 * A PÁGINA NÃO TEM CSS DE LAYOUT. Ela guarda o estado e as regras (o mapa de
 * códigos de erro, o desarme de 5s do revogar, os timers), e as bandas são
 * burras. Foi assim que a lógica já validada ponta a ponta atravessou a
 * refatoração sem ser reescrita.
 *
 * Autenticada: mesma guarda do /conta (nu:token → /login?redirect=). A rota é
 * private/no-store no nuxt.config.
 */
definePageMeta({
  layout: 'business',
  middleware: [
    (to) => {
      const token = useCookie<string | null>('nu:token')
      if (!token.value) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
      }
    },
  ],
})

usePageSeo({
  title: 'Chaves · Redentia For Business',
  description: 'Gere as chaves MCP do seu escritório e acompanhe o uso.',
  path: '/business/chaves',
  robots: 'noindex, follow',
})
useHead({ titleTemplate: null })

const { status, plainKey, loading, busy, hydrate, createAccount, createKey, setKeyEnabled, renameKey, revokeKey } = useBusinessAccount()

const erro = ref<string | null>(null)
const copiado = ref(false)
const nomeEmpresa = ref('')
const rotulo = ref('')
const novoRotulo = ref('')
const confirmando = ref<number | null>(null)
const renomeando = ref<number | null>(null)
const tabela = ref<{ focarGerador: () => void, mostrarSegredo: () => void } | null>(null)

async function carregar() {
  erro.value = null
  try {
    await hydrate()
  }
  catch (e: unknown) {
    // 401 é sessão expirada: o authFetch já está navegando pro /login, e
    // pintar "escreva pra contato@redentia.com" numa página sendo desmontada
    // transformaria expiração de token em chamado de suporte.
    if ((e as { response?: { status?: number } })?.response?.status === 401) return
    erro.value = 'Não conseguimos carregar a conta agora. Tente de novo; se seguir assim, escreva pra contato@redentia.com.'
  }
}

onMounted(carregar)

/**
 * Toda ação passa por aqui: limpa o erro anterior e traduz a falha pro que a
 * pessoa pode fazer a respeito. Os códigos vêm do controller; qualquer outra
 * coisa cai na mensagem genérica com o caminho de suporte.
 */
async function agir(fn: () => Promise<unknown>) {
  erro.value = null
  try {
    await fn()
  }
  catch (e: unknown) {
    const data = (e as { data?: { error?: string, message?: string } })?.data
    erro.value = data?.message
      ?? ({
        max_keys: 'O escritório já está com o número máximo de chaves ativas. Revogue uma antes de gerar outra.',
        account_disabled: 'A conta ainda não foi liberada. Fale com a gente em contato@redentia.com.',
        label_taken: 'Já existe uma chave ativa com esse nome.',
        // 404 do servidor: a chave saiu por baixo (outra aba, outro
        // dispositivo). "Tente de novo" seria conselho que falha pra sempre.
        not_found: 'Essa chave não existe mais. Atualize a página para ver a lista atual.',
        no_account: 'A conta do escritório não foi encontrada. Atualize a página.',
      }[data?.error ?? ''] ?? 'A ação não completou. Tente de novo; se seguir assim, escreva pra contato@redentia.com.')
  }
}

async function cadastrar() {
  if (busy.value || nomeEmpresa.value.trim().length < 2) return
  await agir(() => createAccount(nomeEmpresa.value.trim()))
}

/**
 * O modal de conexão (RbConexaoModal) substitui a página /business/comecar
 * (2026-08-25): gerar chave abre o passo a passo com a chave já interpolada.
 * O segredo CONTINUA na tabela — mesma ref plainKey, uma fonte, duas
 * superfícies — e o scroll até ele migrou pro FECHAMENTO do modal, porque
 * scrollIntoView com o scroll-lock do modal ativo não anda.
 */
const conexaoAberta = ref(false)

async function gerar() {
  if (busy.value || rotulo.value.trim().length < 2) return
  await agir(async () => {
    await createKey(rotulo.value.trim())
    rotulo.value = ''
  })
  if (erro.value) return
  await nextTick()
  conexaoAberta.value = true
}

function fecharConexao() {
  conexaoAberta.value = false
  // A chave em claro nasce ACIMA do gerador: sem isto ela podia aparecer fora
  // da viewport, no único momento em que ela existe. O nextTick roda depois
  // de o lock de scroll soltar, então o smooth scroll funciona.
  if (plainKey.value) nextTick(() => tabela.value?.mostrarSegredo())
}

// 'gerar' vindo do modal aberto SEM chave (CTA das bandas): fecha e foca o
// gerador. O nextTick roda depois da restauração de foco do useModalA11y.
function gerarDoModal() {
  conexaoAberta.value = false
  nextTick(() => tabela.value?.focarGerador())
}

/**
 * Revogar é irreversível, então o primeiro clique só arma o segundo. O
 * desarme automático importa tanto quanto o armar: o botão armado fica no
 * mesmo lugar do normal, e sem prazo um clique esquecido vira uma revogação
 * acidental cinco minutos depois.
 */
let armaTimer: ReturnType<typeof setTimeout> | undefined
async function revogar(id: number) {
  clearTimeout(armaTimer)
  if (confirmando.value !== id) {
    confirmando.value = id
    armaTimer = setTimeout(() => { confirmando.value = null }, 5000)
    return
  }
  confirmando.value = null
  await agir(() => revokeKey(id))
}

function abrirRename(id: number, atual: string) {
  confirmando.value = null
  renomeando.value = id
  novoRotulo.value = atual
}

async function salvarRename(id: number) {
  if (busy.value || novoRotulo.value.trim().length < 2) return
  await agir(() => renameKey(id, novoRotulo.value.trim()))
  if (!erro.value) renomeando.value = null
}

let copiaTimer: ReturnType<typeof setTimeout> | undefined
async function copiar() {
  if (!plainKey.value) return
  try { await navigator.clipboard?.writeText(plainKey.value) }
  catch { /* clipboard bloqueado */ }
  copiado.value = true
  clearTimeout(copiaTimer)
  copiaTimer = setTimeout(() => { copiado.value = false }, 1600)
}

onBeforeUnmount(() => {
  clearTimeout(copiaTimer)
  clearTimeout(armaTimer)
})

const conta = computed(() => status.value)
const janela = computed(() => conta.value?.usage.window_days ?? 30)
const liberada = computed(() => Boolean(conta.value?.has_account && conta.value.enabled))

// ?conectar=1 (vindo do /business/skills; sobrevive ao redirect de login
// porque a guarda usa o fullPath): abre o modal quando a conta hidratar
// liberada, e limpa a query pra um reload não reabrir sozinho.
const route = useRoute()
const router = useRouter()
watch(liberada, (ok) => {
  if (ok && route.query.conectar !== undefined) {
    conexaoAberta.value = true
    router.replace({ query: {} })
  }
})

const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR')

/** A alternativa textual do gráfico, e a legenda que o vidente lê no estreito. */
const resumoGrafico = computed(() => {
  const dias = conta.value?.usage.days ?? []
  if (!dias.length) return ''
  const total = conta.value?.usage.calls ?? 0
  if (total === 0) {
    return `Nenhuma chamada nos últimos ${janela.value} dias. O número aparece aqui no minuto seguinte ao primeiro uso.`
  }
  const pico = dias.reduce((a, b) => (b.calls > a.calls ? b : a))
  const ativos = dias.filter(d => d.calls > 0).length
  const dia = new Date(`${pico.day}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `Uso por dia nos últimos ${janela.value} dias: ${num(total)} chamadas em ${ativos} ${ativos === 1 ? 'dia' : 'dias'}. `
    + `Maior dia: ${dia}, com ${num(pico.calls)}.`
})

/** Banda B não renderiza sem uso: gráfico vazio não é informação, é moldura. */
const temGrafico = computed(() => (conta.value?.usage.calls ?? 0) > 0)
</script>

<template>
  <!-- carregando: a casca da banda A, com a forma real do que vem -->
  <section v-if="loading" class="rbk-load">
    <div class="rbk-load__cols">
      <div class="rbk-load__main">
        <NuSkeleton variant="text" :lines="2" width="70%" />
      </div>
      <div class="rbk-load__aside">
        <NuSkeleton variant="card" height="220px" radius="card" />
      </div>
    </div>
  </section>

  <template v-else-if="conta">
    <RbKeysSetup
      v-if="!conta.has_account"
      v-model:nome="nomeEmpresa"
      mode="cadastro"
      :busy="busy"
      :erro="erro"
      @cadastrar="cadastrar"
    />

    <RbKeysSetup
      v-else-if="!liberada"
      v-model:nome="nomeEmpresa"
      mode="bloqueada"
      :company-name="conta.company_name"
      :busy="busy"
      :erro="erro"
    />

    <template v-else>
      <RbKeysHero :conta="conta" :janela="janela" @gerar="tabela?.focarGerador()" @conectar="conexaoAberta = true" />
      <RbKeysUsage v-if="temGrafico" :conta="conta" :janela="janela" :resumo="resumoGrafico" />
      <RbKeysTable
        ref="tabela"
        v-model:rotulo="rotulo"
        v-model:novo-rotulo="novoRotulo"
        :conta="conta"
        :janela="janela"
        :plain-key="plainKey"
        :busy="busy"
        :erro="erro"
        :confirmando="confirmando"
        :renomeando="renomeando"
        :copiado="copiado"
        @copiar="copiar"
        @gerar="gerar"
        @revogar="revogar"
        @toggle="(id, v) => agir(() => setKeyEnabled(id, v))"
        @abrir-rename="abrirRename"
        @cancelar-rename="renomeando = null"
        @salvar-rename="salvarRename"
        @conectar="conexaoAberta = true"
      />
      <RbKeysScope :conta="conta" @conectar="conexaoAberta = true" />
      <RbConexaoModal :open="conexaoAberta" :plain-key="plainKey" @close="fecharConexao" @gerar="gerarDoModal" />
    </template>
  </template>

  <section v-else class="rbk-falha">
    <p class="rbk-falha__msg" role="alert">
      {{ erro ?? 'Não conseguimos carregar a conta agora.' }}
    </p>
    <button type="button" class="rbk-falha__btn" :disabled="loading" @click="carregar">
      Tentar de novo
    </button>
  </section>
</template>

<style scoped>
/* Só o carregando e a falha têm CSS aqui: são cascas de banda, não conteúdo.
   Todo o resto do layout vive nos cinco componentes de banda. */
.rbk-load,
.rbk-falha {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 88px);
  min-height: 60vh;
}
.rbk-load__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; max-width: 1120px; }
.rbk-load__main { flex: 1.2 1 460px; min-width: min(320px, 100%); }
.rbk-load__aside { flex: 1 1 380px; min-width: min(320px, 100%); max-width: 520px; }

.rbk-falha { max-width: 640px; }
.rbk-falha__msg { margin: 0 0 20px; color: var(--nu-ink); font-size: 15.5px; font-weight: 600; line-height: 1.6; }
.rbk-falha__btn {
  min-height: 44px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 13px 26px; font-size: 16px; font-weight: 800; font-family: inherit;
  transition: background .2s, opacity .2s;
}
.rbk-falha__btn:hover:not(:disabled) { background: var(--nu-blue-hover); }
.rbk-falha__btn:disabled { opacity: .5; cursor: default; }
.rbk-falha__btn:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }
</style>
