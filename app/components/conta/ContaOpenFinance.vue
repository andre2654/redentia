<script setup lang="ts">
// Seção Open Finance de /conta (PR3). Porta a estrutura do Frontend antigo
// (settings/integracoes.vue): lista de conexões Pluggy com logo/nome/tipo +
// status (8 estados) + meta (última sync, ativos, saldo) + ações contextuais
// (Reconectar pra LOGIN_ERROR/WAITING_USER_INPUT/ITEM_NOT_FOUND, Atualizar/
// sync pro resto, Desconectar). ITEM_NOT_FOUND = item órfão no Pluggy (troca
// de app/credenciais): Reconectar abre o widget em modo FRESH (item novo) e
// remove a conexão órfã; os outros dois reabrem em modo update (itemId).
// Polling 30s enquanto algo está UPDATING/CREATING. Conectar/reconectar abrem
// o widget do Pluggy (usePluggyWidget).
//
// NOTA (dono 2026-07-14): o Pluggy não está pago agora, então o fluxo de
// conectar não vai funcionar ainda (getConnectToken → 500). A estrutura fica
// pronta; a lista carrega vazia (empty state) e o connect mostra erro até a
// assinatura voltar. Design do Nu, sem Nuxt UI; feedback inline (sem toast).
import type { PluggyConnection } from '~/types/pluggy'

const pluggy = usePluggy()
const { openWidget, isLoading: widgetLoading } = usePluggyWidget()

const connections = ref<PluggyConnection[]>([])
const loading = ref(true)
const errorMsg = ref<string | null>(null)
const syncingIds = reactive(new Set<number>())
const deletingIds = reactive(new Set<number>())

// feedback inline (o Nu não tem toast): banner some sozinho
const notice = ref<{ tone: 'success' | 'error', text: string } | null>(null)
let noticeTimer: ReturnType<typeof setTimeout> | undefined
function notify(tone: 'success' | 'error', text: string) {
  notice.value = { tone, text }
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => (notice.value = null), 6000)
}

async function loadAll() {
  errorMsg.value = null
  try {
    connections.value = await pluggy.listConnections()
  }
  catch {
    errorMsg.value = 'Não foi possível carregar suas conexões. Tente recarregar.'
  }
  finally {
    loading.value = false
  }
}

// polling só enquanto há estado transitório (UPDATING/CREATING)
const POLL_MS = 30_000
let pollTimer: ReturnType<typeof setInterval> | null = null
const hasTransient = computed(() => connections.value.some(c => c.status === 'UPDATING' || c.status === 'CREATING'))
watch(hasTransient, (active) => {
  if (active && !pollTimer) pollTimer = setInterval(() => void loadAll(), POLL_MS)
  else if (!active && pollTimer) { clearInterval(pollTimer); pollTimer = null }
})
onBeforeUnmount(() => { if (pollTimer) clearInterval(pollTimer); clearTimeout(noticeTimer) })
onMounted(() => void loadAll())

/* ————— ações ————— */

// Open Finance é pago (plano único, 31/10/2026): conexão NOVA só para quem
// assina; quem não assina vai para a oferta. Reconectar o que já existe segue
// livre (é manutenção, não uma conta nova).
const assinatura = useAssinatura()

async function openConnectFlow() {
  await assinatura.carregar()
  if (!assinatura.assinante.value) {
    await navigateTo('/assinar')
    return
  }
  await openWidget({
    onSuccess: async () => { notify('success', 'Conta conectada. A sincronização inicial já começou.'); await loadAll() },
    onError: (err) => notify('error', (err as { message?: string })?.message || 'Não foi possível abrir o conector.'),
  })
}

// Dois modos de reconexão, decididos pelo status:
//  - LOGIN_ERROR/WAITING_USER_INPUT: o item ainda EXISTE no Pluggy, só precisa
//    de reauth → widget em modo update (passa itemId).
//  - ITEM_NOT_FOUND: o item não existe mais neste app Pluggy (deletado, ou
//    credenciais trocadas de app) → modo update daria 404. Abre o widget SEM
//    itemId (cria item novo no app atual), PINADO no connector da órfã (senão
//    o widget abre a lista inteira de bancos e o user pode conectar outro).
//    A substituição da órfã é do BACKEND (store() faz takeover por
//    user+connector) — robusto a aba fechada e nunca apaga outra instituição.
//    O registro da nova fica por conta do próprio widget (onSuccess do
//    usePluggyWidget já chama registerConnection + sync inicial).
//  Se o item virou órfão DEPOIS do status ter sido gravado (ex.: preso em
//  LOGIN_ERROR), o modo update falha com 410 item_not_found no connect-token;
//  o backend já marcou ITEM_NOT_FOUND — o loadAll do onError troca o card pro
//  fluxo fresh e o próximo clique reconecta de verdade.
async function reconnect(conn: PluggyConnection) {
  const orphan = conn.status === 'ITEM_NOT_FOUND'
  await openWidget({
    ...(orphan
      ? (conn.connector_id ? { connectorIds: [conn.connector_id] } : {})
      : { itemId: conn.item_id }),
    onSuccess: async () => {
      notify('success', `${conn.institution_name} voltou a sincronizar.`)
      await loadAll()
    },
    onError: async (err) => {
      const data = (err as { data?: { code?: string, message?: string } })?.data
      notify('error', data?.message
        || (err as { message?: string })?.message
        || 'Não foi possível reautenticar.')
      // recarrega sempre: se o connect-token marcou ITEM_NOT_FOUND (410), o
      // card troca o selo pra "Reconecte" e o próximo clique usa o modo fresh.
      await loadAll()
    },
  })
}

async function syncOne(conn: PluggyConnection) {
  if (syncingIds.has(conn.id)) return
  syncingIds.add(conn.id)
  try {
    const result = await pluggy.syncConnection(conn.id)
    if (result.status === 'rate_limited') {
      const min = result.retry_after_minutes ?? 60
      notify('success', `${conn.institution_name} foi atualizado há pouco. Próximo refresh completo em ~${min} min.`)
    }
    else if (result.status === 'item_not_found') {
      // conexão órfã (item não existe mais no app Pluggy): o loadAll abaixo
      // já troca o selo pra "Reconecte" e o botão pra Reconectar. Mensagem
      // local (não a do backend): nomeia a instituição, importante em lista
      // com várias conexões.
      notify('error', `A conexão com ${conn.institution_name} expirou no Open Finance. Reconecte a conta para voltar a sincronizar.`)
    }
    else {
      notify('success', `Buscando dados atualizados em ${conn.institution_name}.`)
    }
    await loadAll()
  }
  catch (err) {
    notify('error', (err as { message?: string })?.message || 'Não foi possível iniciar a sincronização.')
  }
  finally {
    syncingIds.delete(conn.id)
  }
}

async function disconnectOne(conn: PluggyConnection) {
  const ok = window.confirm(
    `Desconectar ${conn.institution_name}?\n\nOs ativos importados desta conexão serão removidos da sua carteira. Você pode reconectar quando quiser.`,
  )
  if (!ok || deletingIds.has(conn.id)) return
  deletingIds.add(conn.id)
  try {
    await pluggy.deleteConnection(conn.id)
    notify('success', `${conn.institution_name} foi desconectada.`)
    await loadAll()
  }
  catch (err) {
    notify('error', (err as { message?: string })?.message || 'Não foi possível desconectar agora.')
  }
  finally {
    deletingIds.delete(conn.id)
  }
}

/* ————— helpers ————— */

type Tone = 'positive' | 'neutral' | 'negative' | 'info'
function statusVisual(status: PluggyConnection['status']): { label: string, tone: Tone } {
  switch (status) {
    case 'UPDATED': return { label: 'Sincronizado', tone: 'positive' }
    case 'OUTDATED': return { label: 'Desatualizado', tone: 'neutral' }
    case 'LOGIN_ERROR': return { label: 'Reautentique', tone: 'negative' }
    case 'WAITING_USER_INPUT': return { label: 'Verificação pendente', tone: 'neutral' }
    case 'UPDATING': return { label: 'Sincronizando', tone: 'info' }
    case 'CREATING': return { label: 'Configurando', tone: 'info' }
    case 'ERROR': return { label: 'Erro', tone: 'negative' }
    case 'ITEM_NOT_FOUND': return { label: 'Reconecte', tone: 'negative' }
    default: return { label: status, tone: 'neutral' }
  }
}
function institutionKind(t: PluggyConnection['institution_type']): string {
  return t === 'BANK' ? 'Banco' : t === 'INVESTMENT' ? 'Corretora / Investimentos' : 'Banco e Investimentos'
}
function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function timeSince(iso: string | null): string {
  if (!iso) return 'nunca'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'desconhecido'
  const min = Math.floor(Math.max(0, Date.now() - then) / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  return `há ${d} ${d === 1 ? 'dia' : 'dias'}`
}
</script>

<template>
  <ContaSection title="Open Finance" subtitle="Conecte corretoras e bancos pra sincronizar sua carteira automaticamente. Suas credenciais nunca passam pela Aportou, tudo regulado pelo Banco Central.">
    <div class="of">
      <!-- toolbar -->
      <div class="of__bar">
        <span class="of__count">{{ connections.length }} {{ connections.length === 1 ? 'conexão' : 'conexões' }}</span>
        <NuBotaoSeta tamanho="m" :loading="widgetLoading" @click="openConnectFlow">
          {{ widgetLoading ? 'Abrindo' : 'Conectar nova conta' }}
        </NuBotaoSeta>
      </div>

      <!-- notice inline -->
      <p v-if="notice" class="of__notice" :class="`of__notice--${notice.tone}`" role="status">{{ notice.text }}</p>

      <!-- loading: o esqueleto na forma do cartão de conexão -->
      <div v-if="loading" class="of__esq" aria-busy="true" aria-label="Lendo as suas conexões">
        <div class="of__esq-topo">
          <NuSkeleton width="44px" height="44px" radius="chip" />
          <div class="of__esq-txt">
            <NuSkeleton width="min(180px, 60%)" height="18px" radius="chip" />
            <NuSkeleton width="min(120px, 40%)" height="13px" radius="chip" />
          </div>
          <NuSkeleton width="110px" height="30px" radius="8px" />
        </div>
        <NuSkeleton width="min(380px, 90%)" height="14px" radius="chip" />
        <div class="of__esq-acoes">
          <NuSkeleton width="120px" height="44px" radius="pill" />
          <NuSkeleton width="130px" height="44px" radius="pill" />
        </div>
      </div>

      <!-- error -->
      <div v-else-if="errorMsg" class="of__state of__error" role="alert">
        <span>{{ errorMsg }}</span>
        <button type="button" class="of__retry" @click="loadAll">Tentar novamente</button>
      </div>

      <!-- empty -->
      <div v-else-if="!connections.length" class="of__empty">
        <span class="of__empty-ic" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 0 1 0 10h-2" /><path d="M8 12h8" /></svg>
        </span>
        <h3 class="of__empty-title">Nenhuma conta conectada</h3>
        <p class="of__empty-sub">Conecte sua primeira corretora ou banco pra começar a sincronizar sua carteira automaticamente.</p>
        <NuBotaoSeta tamanho="m" :loading="widgetLoading" @click="openConnectFlow">Conectar conta</NuBotaoSeta>
      </div>

      <!-- lista -->
      <ul v-else class="of__list">
        <li v-for="conn in connections" :key="conn.id" class="of__card">
          <div class="of__card-top">
            <div class="of__inst">
              <span class="of__logo" aria-hidden="true">
                <img v-if="conn.institution_logo" :src="conn.institution_logo" :alt="conn.institution_name" class="of__logo-img" loading="lazy">
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14M10 9h.01M14 9h.01M10 13h.01M14 13h.01M10 17h.01M14 17h.01" /></svg>
              </span>
              <span class="of__inst-text">
                <span class="of__inst-name">{{ conn.institution_name }}</span>
                <span class="of__inst-kind">{{ institutionKind(conn.institution_type) }}</span>
              </span>
            </div>
            <span class="of__status" :class="`of__status--${statusVisual(conn.status).tone}`">
              <span v-if="conn.status === 'UPDATING' || conn.status === 'CREATING'" class="of__pontos" aria-hidden="true"><i /><i /><i /></span>
              {{ statusVisual(conn.status).label }}
            </span>
          </div>

          <div class="of__meta">
            <span>Última sincronização {{ timeSince(conn.last_synced_at) }}</span>
            <span class="of__dot">·</span>
            <span>{{ conn.positions_count }} {{ conn.positions_count === 1 ? 'ativo' : 'ativos' }}</span>
            <template v-if="conn.total_balance > 0">
              <span class="of__dot">·</span>
              <span class="of__meta-strong">{{ formatBRL(conn.total_balance) }}</span>
            </template>
          </div>

          <div class="of__actions">
            <button
              v-if="conn.status === 'LOGIN_ERROR' || conn.status === 'WAITING_USER_INPUT' || conn.status === 'ITEM_NOT_FOUND'"
              type="button" class="of__act of__act--primary" :disabled="widgetLoading" @click="reconnect(conn)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 7.5a5 5 0 1 0-7 4.5L3 18v3h3l1-1h2l1-2 2.5-2.5A5 5 0 0 0 15.5 7.5z" /><circle cx="16.5" cy="7.5" r="1" /></svg>
              Reconectar
            </button>
            <button
              v-else type="button" class="of__act of__act--ghost"
              :disabled="syncingIds.has(conn.id) || conn.status === 'UPDATING' || conn.status === 'CREATING'"
              @click="syncOne(conn)"
            >
              <span v-if="syncingIds.has(conn.id) || conn.status === 'UPDATING'" class="of__pontos" aria-hidden="true"><i /><i /><i /></span>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
              {{ syncingIds.has(conn.id) ? 'Sincronizando' : 'Atualizar' }}
            </button>
            <button type="button" class="of__act of__act--danger" :disabled="deletingIds.has(conn.id)" @click="disconnectOne(conn)">
              <span v-if="deletingIds.has(conn.id)" class="of__pontos" aria-hidden="true"><i /><i /><i /></span>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 5.5 7.5M15 7h2a5 5 0 0 1 1.5 9.8M8 12h5M2 2l20 20" /></svg>
              {{ deletingIds.has(conn.id) ? 'Removendo' : 'Desconectar' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </ContaSection>
</template>

<style scoped>
/* Aportou (11/11/2026): a chamada é a pílula com a seta (NuBotaoSeta); cada
   conexão é um cartão branco dentro do painel creme (raio 22); o estado é um
   selo de raio 8; quem espera vê os três pontos da marca, nunca um giro. */
.of__bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.of__count { color: var(--nu-gray); font-size: 13.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; font-variant-numeric: tabular-nums; }

.of__notice { margin: 16px 0 0; padding: 12px 16px; border-radius: var(--nu-r-chip); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.45; animation: nu-fade .25s ease both; }
.of__notice--success { background: var(--nu-green-bg); color: var(--nu-green-text); }
.of__notice--error { background: var(--nu-red-bg); color: var(--nu-red-text); }

.of__state { display: flex; align-items: center; justify-content: center; padding: 40px 0; }
.of__error { gap: 14px; flex-wrap: wrap; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 600; }
.of__retry { min-height: 44px; background: none; border: none; color: var(--nu-blue-text); font-weight: 700; font-size: var(--nu-fs-sm); cursor: pointer; font-family: var(--nu-font); text-decoration: underline; text-underline-offset: 3px; }

/* o esqueleto tem a forma (e a altura) do cartão que chega */
.of__esq { display: flex; flex-direction: column; gap: 16px; margin-top: 18px; background: var(--nu-white); border-radius: var(--nu-r-panel); box-shadow: var(--nu-shadow-branco); padding: 20px 22px; }
.of__esq-topo { display: flex; align-items: center; gap: 13px; }
.of__esq-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.of__esq-acoes { display: flex; gap: 10px; }

.of__empty { text-align: center; padding: 44px 20px 24px; display: flex; flex-direction: column; align-items: center; }
.of__empty-ic {
  width: 60px; height: 60px; border-radius: var(--nu-r-tile); background: var(--nu-blue-bg); color: var(--nu-blue-text);
  display: inline-flex; align-items: center; justify-content: center; margin-bottom: 18px;
}
.of__empty-title { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -.025em; }
.of__empty-sub { margin: 8px 0 22px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; max-width: 42ch; }

.of__list { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.of__card { background: var(--nu-white); border-radius: var(--nu-r-panel); box-shadow: var(--nu-shadow-branco); padding: 20px 22px; animation: nu-fade .25s ease both; }
.of__card-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.of__inst { display: flex; align-items: center; gap: 13px; min-width: 0; }
.of__logo {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: var(--nu-r-chip); background: var(--nu-page); color: var(--nu-gray);
  display: inline-flex; align-items: center; justify-content: center; overflow: hidden;
}
.of__logo-img { width: 100%; height: 100%; object-fit: contain; }
.of__inst-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.of__inst-name { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.01em; }
.of__inst-kind { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }

/* o selo da marca: raio 8, 13,5px, 700 */
.of__status {
  display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0;
  padding: 6px 11px; border-radius: var(--nu-r-tag); font-size: 13.5px; font-weight: 700; line-height: 1.3;
}
.of__status--positive { background: var(--nu-green-bg); color: var(--nu-green-text); }
.of__status--neutral { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.of__status--negative { background: var(--nu-red-bg); color: var(--nu-red-text); }
.of__status--info { background: var(--nu-blue-bg); color: var(--nu-blue-text); }

.of__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 16px; padding-top: 14px; border-top: 1.5px solid var(--nu-line-2); color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; }
.of__dot { color: var(--nu-gray); }
.of__meta-strong { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }

.of__actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
.of__act {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; cursor: pointer; font-family: var(--nu-font);
  border-radius: var(--nu-r-pill); padding: 0 18px; font-size: var(--nu-fs-sm); font-weight: 700;
  border: 0; transition: background .2s, color .2s, opacity .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.of__act:active:not(:disabled) { transform: scale(.98); }
.of__act:disabled { opacity: .55; cursor: default; }
.of__act--primary { background: var(--nu-blue); color: var(--nu-white); }
.of__act--primary:hover:not(:disabled) { background: var(--nu-blue-hover); }
.of__act--ghost { background: var(--nu-white); color: var(--nu-ink); box-shadow: inset 0 0 0 1.5px var(--nu-ink); }
.of__act--ghost:hover:not(:disabled) { background: var(--nu-row-hover); }
.of__act--danger { background: none; color: var(--nu-red-text); }
.of__act--danger:hover:not(:disabled) { background: var(--nu-red-bg); }

/* quem espera: os três pontos da marca (nu-ponto), no lugar do giro */
.of__pontos { display: inline-flex; gap: 3px; flex-shrink: 0; }
.of__pontos i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: nu-ponto 1.2s infinite; }
.of__pontos i:nth-child(2) { animation-delay: .2s; }
.of__pontos i:nth-child(3) { animation-delay: .4s; }

@media (max-width: 520px) {
  .of__bar :deep(.nbs) { width: 100%; }
  .of__act { flex: 1 1 auto; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .of__notice, .of__card { animation: none; }
}
</style>
