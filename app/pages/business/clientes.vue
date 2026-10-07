<script setup lang="ts">
/**
 * /business/clientes — Clientes do escritório, o painel do dono.
 *
 * O recurso (Contrato C/E, 07/10/2026) deixa o assistente do escritório ler a
 * carteira de um cliente final SÓ com o consentimento do próprio cliente: o
 * escritório gera um link (aqui ou pelo assistente, com create_client_invite),
 * o cliente lê o termo e aceita em /cliente/convite/[token], e revoga quando
 * quiser em /cliente/acesso/[token].
 *
 * HOJE É DEMONSTRAÇÃO (clients_mode = 'demo', ligado por console, conta a
 * conta): quando o cliente aceita, a Redentia gera uma carteira FICTÍCIA. Este
 * painel nunca mostra valor de carteira — só status, responsável, datas e o
 * registro de acesso —, e todo cliente de demonstração leva o selo.
 *
 * Estados: carregando | falha | conta não pronta | recurso não habilitado
 * (clients_mode = 'off', ou a rota de clientes ainda não existe no servidor)
 * | painel (com estado vazio).
 *
 * Autenticada como /business/chaves (nu:token → /login?redirect=), layout
 * business, private/no-store e Referrer-Policy no-referrer no nuxt.config:
 * o link do convite aparece nesta tela UMA vez.
 */
import type { BusinessClientRow, ClientLogEntry } from '~/types/clientes'

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
  title: 'Clientes · Redentia For Business',
  description: 'Convide clientes, acompanhe o consentimento e o registro de acesso.',
  path: '/business/clientes',
  robots: 'noindex, follow',
})
useHead({ titleTemplate: null, meta: [{ name: 'referrer', content: 'no-referrer' }] })

const contaApi = useBusinessAccount()
const clientesApi = useBusinessClients()
const { lista, busy, linkGerado } = clientesApi

const carregando = ref(true)
const falha = ref<string | null>(null)
/** A rota de clientes respondeu "não existe aqui" (servidor sem o recurso). */
const semRecurso = ref(false)
const erro = ref<string | null>(null)
const nome = ref('')
const chaveNova = ref<string>('') // '' = sem chave por enquanto
const aberto = ref<string | null>(null)
const confirmando = ref<string | null>(null)
const copiado = ref(false)
const logs = ref<Record<string, ClientLogEntry[] | 'carregando' | 'erro'>>({})
const reatribuir = ref<Record<string, string>>({})
/** De qual linha saiu o link em tela (null = do formulário de cliente novo). */
const linkNaLinha = ref<string | null>(null)
/** Onde a última recusa aparece: null = formulário do topo; id = linha do cliente. */
const erroLinha = ref<string | null>(null)

const statusHttp = (e: unknown) => (e as { response?: { status?: number } })?.response?.status

async function carregar() {
  carregando.value = true
  falha.value = null
  semRecurso.value = false
  const [conta, clientes] = await Promise.allSettled([contaApi.hydrate(), clientesApi.hydrate()])
  carregando.value = false
  if (conta.status === 'rejected') {
    if (statusHttp(conta.reason) === 401) return // o authFetch já está indo pro /login
    falha.value = 'Não conseguimos carregar a conta agora. Tente de novo; se seguir assim, escreva pra contato@redentia.com.'
    return
  }
  if (clientes.status === 'rejected') {
    const st = statusHttp(clientes.reason)
    if (st === 401) return
    // 404/409 = o servidor não tem o recurso ou ele está desligado nesta
    // conta. Não é falha: é o estado "não habilitado".
    if (st === 404 || st === 409) { semRecurso.value = true; return }
    falha.value = 'Não conseguimos carregar os clientes agora. Tente de novo; se seguir assim, escreva pra contato@redentia.com.'
  }
}

// onMounted antes de qualquer await.
onMounted(carregar)

const conta = computed(() => contaApi.status.value)
const contaPronta = computed(() => Boolean(conta.value?.has_account && conta.value.enabled))
const modo = computed(() => conta.value?.clients_mode ?? lista.value?.mode ?? 'off')
const habilitado = computed(() => !semRecurso.value && modo.value !== 'off')
const ehDemo = computed(() => modo.value === 'demo')
const clientes = computed(() => lista.value?.clients ?? [])
const maxClientes = computed(() => lista.value?.max_clients ?? conta.value?.max_clients ?? null)
const chaves = computed(() => (conta.value?.keys ?? []).filter(k => k.enabled))

/** Traduz a recusa do servidor pro que a pessoa pode fazer. */
async function agir(fn: () => Promise<unknown>, linha: string | null = null) {
  erro.value = null
  erroLinha.value = linha
  try {
    await fn()
  }
  catch (e: unknown) {
    if (statusHttp(e) === 401) return
    const data = (e as { data?: { error?: string, message?: string } })?.data
    erro.value = data?.message
      ?? ({
        max_clients: 'O escritório chegou ao limite de clientes. Revogue um para convidar outro, ou fale com a gente.',
        pending_limit: 'Há convites demais esperando resposta. Cancele os que não vão ser usados antes de gerar outro.',
        daily_limit: 'O limite de convites de hoje acabou. Amanhã ele renova.',
        clients_disabled: 'Clientes do escritório não está ligado nesta conta. Fale com a gente em contato@redentia.com.',
        client_not_found: 'Esse cliente não existe mais. Atualize a página para ver a lista atual.',
        not_found: 'Esse item não existe mais. Atualize a página para ver a lista atual.',
        key_not_found: 'Essa chave não está mais ativa. Escolha outra.',
      }[data?.error ?? ''] ?? 'A ação não completou. Tente de novo; se seguir assim, escreva pra contato@redentia.com.')
  }
}

const nomeOk = computed(() => {
  const n = nome.value.trim().length
  return n >= 2 && n <= 80
})

async function criar() {
  if (busy.value || !nomeOk.value) return
  await agir(async () => {
    await clientesApi.create(nome.value.trim(), chaveNova.value ? Number(chaveNova.value) : null)
    linkNaLinha.value = null
    nome.value = ''
  })
}

/** Rótulo da chave responsável, de onde quer que o servidor mande. */
function responsavel(c: BusinessClientRow): string {
  if (c.assigned_key?.label) return c.assigned_key.label
  if (c.assigned_key_label) return c.assigned_key_label
  const id = c.assigned_key?.id ?? c.assigned_key_id
  if (id != null) return conta.value?.keys.find(k => k.id === id)?.label ?? `Chave ${id}`
  return 'Sem chave'
}
function responsavelId(c: BusinessClientRow): number | null {
  return c.assigned_key?.id ?? c.assigned_key_id ?? null
}

function expira(c: BusinessClientRow): string {
  if (c.consent_expires_at) return dataCurta(c.consent_expires_at)
  if (c.status === 'pending' && c.pending_invite?.expires_at) return `convite: ${dataCurta(c.pending_invite.expires_at)}`
  return ''
}

/** Última leitura: só afirma "nunca" se o servidor mandou o campo nulo. */
function ultimaLeitura(c: BusinessClientRow): string {
  if (!('last_read_at' in c)) return ''
  if (!c.last_read_at) return c.status === 'active' ? 'Ainda não lida' : ''
  const chave = chaveDaUltimaLeitura(c)
  return `${dataHora(c.last_read_at)}${chave ? ` · ${chave}` : ''}`
}

async function alternar(c: BusinessClientRow) {
  confirmando.value = null
  aberto.value = aberto.value === c.id ? null : c.id
  if (aberto.value === c.id) {
    reatribuir.value[c.id] = String(responsavelId(c) ?? '')
    await carregarLog(c)
  }
}

async function carregarLog(c: BusinessClientRow) {
  logs.value[c.id] = 'carregando'
  try {
    logs.value[c.id] = await clientesApi.log(c)
  }
  catch {
    logs.value[c.id] = 'erro'
  }
}

async function novoLink(c: BusinessClientRow) {
  await agir(async () => {
    await clientesApi.newInvite(c)
    linkNaLinha.value = c.id
  }, c.id)
  if (!erro.value) await carregarLog(c)
}

async function salvarResponsavel(c: BusinessClientRow) {
  const v = reatribuir.value[c.id] ?? ''
  await agir(() => clientesApi.update(c, { assigned_key_id: v ? Number(v) : null }), c.id)
  if (!erro.value) await carregarLog(c)
}

async function compartilhar(c: BusinessClientRow, v: boolean) {
  await agir(() => clientesApi.update(c, { shared_with_office: v }), c.id)
}

let armaTimer: ReturnType<typeof setTimeout> | undefined
async function revogar(c: BusinessClientRow) {
  clearTimeout(armaTimer)
  if (confirmando.value !== c.id) {
    confirmando.value = c.id
    armaTimer = setTimeout(() => { confirmando.value = null }, 5000)
    return
  }
  confirmando.value = null
  await agir(() => clientesApi.revoke(c), c.id)
  if (!erro.value && aberto.value === c.id) await carregarLog(c)
}

let copiaTimer: ReturnType<typeof setTimeout> | undefined
async function copiar() {
  if (!linkGerado.value) return
  try { await navigator.clipboard?.writeText(linkGerado.value.url) }
  catch { /* clipboard bloqueado: o link segue na tela */ }
  copiado.value = true
  clearTimeout(copiaTimer)
  copiaTimer = setTimeout(() => { copiado.value = false }, 1600)
}

onBeforeUnmount(() => {
  clearTimeout(armaTimer)
  clearTimeout(copiaTimer)
})
</script>

<template>
  <section v-if="carregando" class="rbcl-load">
    <NuSkeleton variant="text" :lines="2" width="60%" />
    <NuSkeleton variant="card" height="200px" radius="card-lg" />
  </section>

  <section v-else-if="falha" class="rbcl-msg">
    <p class="rbcl-msg__txt" role="alert">{{ falha }}</p>
    <button type="button" class="rbcl-btn" @click="carregar">Tentar de novo</button>
  </section>

  <section v-else-if="!contaPronta" class="rbcl-msg">
    <h1 class="rbcl-msg__h">A conta do escritório ainda não está pronta.</h1>
    <p class="rbcl-msg__txt">Clientes do escritório depende de uma conta liberada. Veja o estado dela no painel de chaves.</p>
    <NuxtLink to="/business/chaves" class="rbcl-btn">Ir para as chaves</NuxtLink>
  </section>

  <section v-else-if="!habilitado" class="rbcl-msg">
    <span class="rbcl-eyebrow">Clientes do escritório</span>
    <h1 class="rbcl-msg__h">O recurso não está habilitado nesta conta.</h1>
    <p class="rbcl-msg__txt">
      Clientes do escritório deixa o assistente ler a carteira de um cliente só com o consentimento do
      próprio cliente. Hoje ele roda em demonstração, com carteira fictícia, e é ligado pela Redentia conta
      a conta. Se a sua casa quer testar, escreva pra contato@redentia.com.
    </p>
    <NuxtLink to="/business/chaves" class="rbcl-btn rbcl-btn--ghost">Voltar para as chaves</NuxtLink>
  </section>

  <template v-else>
    <!-- A. creme: o que é, o convite novo e o link (uma vez) -->
    <section class="rbcl-a">
      <div class="rbcl-in">
        <NuxtLink to="/business/chaves" class="rbcl-back">← Chaves do escritório</NuxtLink>
        <div class="rbcl-head">
          <NuSectionHeading eyebrow="Clientes do escritório">
            Carteira de cliente,<br>só com o consentimento dele.
            <template #dek>
              Gere um link e mande ao cliente. Ele lê o termo, aceita e revoga quando quiser.
              Sem o aceite, o link não dá acesso a nada.
            </template>
          </NuSectionHeading>
          <NuBadge v-if="ehDemo" variant="neutral" size="label" class="rbcl-selo">Demonstração</NuBadge>
        </div>

        <p v-if="ehDemo" class="rbcl-demo" role="note">
          <strong>Em demonstração.</strong> Quando o cliente aceita, a Redentia gera uma carteira fictícia para o
          escritório testar o fluxo. Nenhuma conta dele é conectada e nenhuma carteira real entra. Toda resposta do servidor
          sobre essa carteira chega com o aviso de demonstração no topo, e o assistente é instruído a repeti-lo na
          primeira linha. Confira antes de repassar qualquer texto.
        </p>

        <div class="rbcl-card">
          <form class="rbcl-nova" @submit.prevent="criar">
            <div class="rbcl-campo rbcl-campo--nome">
              <label for="rbcl-nome" class="rbcl-l">Nome do cliente</label>
              <input id="rbcl-nome" v-model="nome" type="text" maxlength="80" placeholder="Como o escritório chama o cliente" autocomplete="off">
            </div>
            <div class="rbcl-campo">
              <label for="rbcl-chave" class="rbcl-l">Chave responsável</label>
              <select id="rbcl-chave" v-model="chaveNova">
                <option value="">Sem chave por enquanto</option>
                <option v-for="k in chaves" :key="k.id" :value="String(k.id)">{{ k.label }}</option>
              </select>
            </div>
            <button type="submit" class="rbcl-btn" :disabled="busy || !nomeOk">{{ busy ? 'Gerando…' : 'Criar e gerar link' }}</button>
          </form>
          <p class="rbcl-ajuda">
            Só a chave responsável vê o cliente no assistente, a menos que você o compartilhe com o escritório.
            <template v-if="maxClientes"> <span class="rbcl-num">{{ clientesOcupados(lista) }} de {{ maxClientes }}</span> vagas de cliente em uso (pendentes e ativos).</template>
          </p>
          <p v-if="erro && erroLinha === null" class="rbcl-erro" role="alert">{{ erro }}</p>

          <!-- cliente novo: o link nasce aqui; novo link de quem já existe nasce na linha dele -->
          <RbClientLink v-if="linkGerado && !linkNaLinha" :link="linkGerado" :copiado="copiado" @copiar="copiar" />
        </div>
      </div>
    </section>

    <!-- B. branco: a lista -->
    <section class="rbcl-b">
      <div class="rbcl-in">
        <h2 class="rbcl-h2">Clientes</h2>

        <p v-if="!clientes.length" class="rbcl-vazio">
          Nenhum cliente ainda. Crie o primeiro acima, ou peça ao assistente do escritório:
          ele usa <code>create_client_invite</code> e devolve o link pronto pra mandar.
        </p>

        <ul v-else class="rbcl-lista">
          <li v-for="c in clientes" :key="c.id" class="rbcl-item">
            <div class="rbcl-item__top">
              <div class="rbcl-item__nome">
                <strong>{{ c.name }}</strong>
                <NuBadge v-if="c.source === 'demonstracao'" variant="neutral" size="label">Demonstração</NuBadge>
                <NuBadge v-if="c.shared_with_office" variant="blue" size="label">Compartilhado</NuBadge>
              </div>
              <button
                type="button" class="rbcl-act" :aria-expanded="aberto === c.id" :aria-controls="`rbcl-det-${c.id}`"
                @click="alternar(c)"
              >
                {{ aberto === c.id ? 'Fechar' : 'Gerenciar' }}
              </button>
            </div>

            <dl class="rbcl-meta">
              <div><dt>Status</dt><dd :class="`rbcl-st rbcl-st--${c.status}`">{{ clientStatusLabel(c.status) }}</dd></div>
              <div><dt>Chave responsável</dt><dd>{{ responsavel(c) }}</dd></div>
              <div v-if="c.institution && c.status !== 'revoked'"><dt>Instituição</dt><dd>{{ c.institution }}</dd></div>
              <div v-if="c.connected_at"><dt>Conectado em</dt><dd class="rbcl-num">{{ dataCurta(c.connected_at) }}</dd></div>
              <div v-if="c.status === 'revoked' && c.revoked_at"><dt>Revogado em</dt><dd class="rbcl-num">{{ dataCurta(c.revoked_at) }}</dd></div>
              <div v-else-if="expira(c)"><dt>Expira em</dt><dd class="rbcl-num">{{ expira(c) }}</dd></div>
              <div v-if="ultimaLeitura(c)"><dt>Última leitura</dt><dd class="rbcl-num">{{ ultimaLeitura(c) }}</dd></div>
            </dl>

            <div v-if="aberto === c.id" :id="`rbcl-det-${c.id}`" class="rbcl-det">
              <div class="rbcl-det__acoes">
                <button type="button" class="rbcl-act" :disabled="busy" @click="novoLink(c)">Novo link</button>
                <button
                  v-if="c.pending_invite?.id != null" type="button" class="rbcl-act" :disabled="busy"
                  @click="agir(() => clientesApi.cancelInvite(c, c.pending_invite!.id), c.id)"
                >
                  Cancelar convite pendente
                </button>
                <button
                  v-if="c.status !== 'revoked'" type="button" class="rbcl-act" :class="{ 'rbcl-act--armado': confirmando === c.id }"
                  :disabled="busy" @click="revogar(c)"
                >
                  {{ confirmando === c.id ? 'Confirmar: revogar e apagar' : 'Revogar' }}
                </button>
              </div>
              <RbClientLink v-if="linkGerado && linkNaLinha === c.id" :link="linkGerado" :copiado="copiado" @copiar="copiar" />
              <p v-if="confirmando === c.id" class="rbcl-ajuda">
                Clique de novo em até 5 segundos. O acesso acaba na hora e as posições guardadas são apagadas.
              </p>

              <div class="rbcl-det__linha">
                <label :for="`rbcl-re-${c.id}`" class="rbcl-l">Reatribuir</label>
                <select :id="`rbcl-re-${c.id}`" v-model="reatribuir[c.id]">
                  <option value="">Sem chave</option>
                  <option v-for="k in chaves" :key="k.id" :value="String(k.id)">{{ k.label }}</option>
                </select>
                <button
                  type="button" class="rbcl-act" :disabled="busy || (reatribuir[c.id] ?? '') === String(responsavelId(c) ?? '')"
                  @click="salvarResponsavel(c)"
                >
                  Salvar
                </button>
              </div>

              <div class="rbcl-det__linha">
                <span class="rbcl-l" :id="`rbcl-sh-${c.id}`">Compartilhar com o escritório</span>
                <NuToggle
                  :model-value="Boolean(c.shared_with_office)" :disabled="busy"
                  :aria-label="`Compartilhar ${c.name} com todas as chaves do escritório`"
                  @update:model-value="v => compartilhar(c, v)"
                />
                <span class="rbcl-ajuda rbcl-ajuda--inline">Todas as chaves ativas passam a ver este cliente.</span>
              </div>

              <p v-if="erro && erroLinha === c.id" class="rbcl-erro" role="alert">{{ erro }}</p>

              <h3 class="rbcl-h3">Registro de acesso</h3>
              <div v-if="logs[c.id] === 'carregando'" class="rbcl-logskel"><NuSkeleton variant="text" :lines="3" /></div>
              <p v-else-if="logs[c.id] === 'erro'" class="rbcl-erro" role="alert">
                Não conseguimos carregar o registro agora.
                <button type="button" class="rbcl-link" @click="carregarLog(c)">Tentar de novo</button>
              </p>
              <p v-else-if="!(logs[c.id] as ClientLogEntry[] | undefined)?.length" class="rbcl-ajuda">Ainda não há registro.</p>
              <ol v-else class="rbcl-log">
                <li v-for="(l, i) in (logs[c.id] as ClientLogEntry[])" :key="i">
                  <span class="rbcl-log__a">{{ clientActionLabel(l.action, c.source === 'demonstracao') }}</span>
                  <span class="rbcl-log__m">
                    {{ clientActorLabel(l.actor) }}<template v-if="chaveDoRegistro(l)"> ({{ chaveDoRegistro(l) }})</template>
                    <template v-if="l.at"> · <span class="rbcl-num">{{ dataHora(l.at) }}</span></template>
                  </span>
                </li>
              </ol>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </template>
</template>

<style scoped>
.rbcl-in { max-width: 1120px; }
.rbcl-load, .rbcl-msg {
  background: var(--nu-cream); min-height: 60vh;
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  display: flex; flex-direction: column; gap: 22px;
}
.rbcl-msg { max-width: none; }
.rbcl-msg > * { max-width: 680px; }
.rbcl-msg__h { margin: 0; color: var(--nu-ink); font-size: clamp(30px, 3.6vw, 46px); font-weight: 800; letter-spacing: -.04em; line-height: 1.05; }
.rbcl-msg__txt { margin: 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 600; line-height: 1.6; }
.rbcl-eyebrow { color: var(--nu-blue); font-size: 16px; font-weight: 800; }

.rbcl-btn {
  align-self: flex-start; display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; padding: 0 24px; border: none; cursor: pointer; font-family: inherit;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  font-size: 14.5px; font-weight: 800; transition: background .2s, opacity .2s; white-space: nowrap;
}
.rbcl-btn:hover:not(:disabled) { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbcl-btn:disabled { opacity: .5; cursor: default; }
.rbcl-btn:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }
.rbcl-btn--ghost { background: transparent; color: var(--nu-ink); border: 1.5px solid var(--nu-sand); }
.rbcl-btn--ghost:hover:not(:disabled) { background: var(--nu-cream-4); color: var(--nu-ink); }

/* A — creme */
.rbcl-a { background: var(--nu-cream); padding: clamp(40px, 6vw, 80px) clamp(22px, 5.5vw, 80px) clamp(48px, 6.5vw, 88px); animation: nu-fade .5s ease both; }
.rbcl-back { display: inline-block; margin-bottom: 22px; color: var(--nu-gray-2); font-size: 14px; font-weight: 800; }
.rbcl-back:hover { color: var(--nu-ink); }
.rbcl-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.rbcl-selo { margin-top: 6px; }
.rbcl-demo {
  margin: 24px 0 0; max-width: 760px; padding: 16px 20px; border-radius: var(--nu-r-card);
  background: var(--nu-white); border: 1.5px solid var(--nu-cream-line);
  color: var(--nu-ink); font-size: 15px; font-weight: 500; line-height: 1.6;
}
.rbcl-demo strong { font-weight: 800; }

.rbcl-card {
  margin-top: clamp(26px, 3.5vw, 40px); background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  box-shadow: var(--nu-shadow-card); padding: clamp(20px, 2.6vw, 30px);
}
.rbcl-nova { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; }
.rbcl-campo { display: flex; flex-direction: column; gap: 6px; flex: 1 1 220px; min-width: min(220px, 100%); }
.rbcl-campo--nome { flex: 2 1 280px; }
.rbcl-l { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; }
.rbcl-campo input, .rbcl-campo select, .rbcl-det__linha select {
  min-height: 44px; background: var(--nu-cream); border: none; border-radius: var(--nu-r-input);
  padding: 10px 14px; color: var(--nu-ink); font-size: 15.5px; font-weight: 700; font-family: inherit;
}
.rbcl-campo input::placeholder { color: var(--nu-gray); font-weight: 500; }
.rbcl-campo input:focus-visible, .rbcl-campo select:focus-visible, .rbcl-det__linha select:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }
.rbcl-ajuda { margin: 12px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.55; }
.rbcl-ajuda--inline { margin: 0; }
.rbcl-num { font-variant-numeric: tabular-nums; }
.rbcl-erro { margin: 14px 0 0; color: var(--nu-ink); font-size: 14px; font-weight: 700; line-height: 1.55; }

/* B — branco */
.rbcl-b { background: var(--nu-white); padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.rbcl-h2 { margin: 0; color: var(--nu-ink); font-size: clamp(28px, 3vw, 38px); font-weight: 800; letter-spacing: -.04em; }
.rbcl-vazio { margin: 16px 0 0; max-width: 62ch; color: var(--nu-gray-2); font-size: 15.5px; font-weight: 600; line-height: 1.6; }
.rbcl-vazio code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13.5px; color: var(--nu-ink); }

.rbcl-lista { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.rbcl-item { background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 20px 22px; }
.rbcl-item__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.rbcl-item__nome { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-width: 0; }
.rbcl-item__nome strong { color: var(--nu-ink); font-size: 17px; font-weight: 800; letter-spacing: -.02em; overflow-wrap: anywhere; }

.rbcl-meta { margin: 14px 0 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(170px, 100%), 1fr)); gap: 12px 20px; }
.rbcl-meta > div { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.rbcl-meta dt { color: var(--nu-gray); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
.rbcl-meta dd { margin: 0; color: var(--nu-ink); font-size: 14.5px; font-weight: 700; overflow-wrap: anywhere; }
.rbcl-st--active { color: var(--nu-green-2); }
.rbcl-st--revoked, .rbcl-st--expired { color: var(--nu-gray-2); }

.rbcl-act {
  min-height: 44px; padding: 0 16px; border: none; cursor: pointer;
  background: var(--nu-white); color: var(--nu-ink); border-radius: var(--nu-r-pill);
  font-size: 13px; font-weight: 800; font-family: inherit; transition: background .18s, color .18s, opacity .18s;
}
.rbcl-act:hover { background: var(--nu-cream-4); }
.rbcl-act:disabled { opacity: .5; cursor: default; }
.rbcl-act--armado { background: var(--nu-ink); color: var(--nu-white); }
.rbcl-act--armado:hover { background: var(--nu-ink); }
.rbcl-act:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbcl-det { margin-top: 18px; padding-top: 18px; border-top: 1.5px solid var(--nu-cream-line); animation: nu-fade .3s ease both; }
.rbcl-det__acoes { display: flex; flex-wrap: wrap; gap: 8px; }
.rbcl-det__linha { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 18px; }
.rbcl-det__linha select { flex: 0 1 260px; min-width: min(200px, 100%); background: var(--nu-white); }
.rbcl-h3 { margin: 24px 0 0; color: var(--nu-ink); font-size: 15px; font-weight: 800; }
.rbcl-logskel { margin-top: 10px; }
.rbcl-log { list-style: none; margin: 10px 0 0; padding: 0; }
.rbcl-log li { display: flex; flex-wrap: wrap; gap: 2px 12px; padding: 9px 0; border-top: 1px solid var(--nu-cream-line); }
.rbcl-log__a { color: var(--nu-ink); font-size: 14px; font-weight: 700; }
.rbcl-log__m { color: var(--nu-gray); font-size: 13px; font-weight: 600; }
.rbcl-link { background: none; border: none; padding: 0; cursor: pointer; color: var(--nu-blue); font: inherit; text-decoration: underline; }
</style>
