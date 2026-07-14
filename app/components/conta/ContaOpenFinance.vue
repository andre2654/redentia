<script setup lang="ts">
// Seção Open Finance de /conta (PR3). Porta a estrutura do Frontend antigo
// (settings/integracoes.vue): lista de conexões Pluggy com logo/nome/tipo +
// status (7 estados) + meta (última sync, ativos, saldo) + ações contextuais
// (Reconectar pra LOGIN_ERROR/WAITING_USER_INPUT, Atualizar/sync pro resto,
// Desconectar). Polling 30s enquanto algo está UPDATING/CREATING. Conectar/
// reconectar abrem o widget do Pluggy (usePluggyWidget).
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

async function openConnectFlow() {
  await openWidget({
    onSuccess: async () => { notify('success', 'Conta conectada. A sincronização inicial já começou.'); await loadAll() },
    onError: (err) => notify('error', (err as { message?: string })?.message || 'Não foi possível abrir o conector.'),
  })
}

async function reconnect(conn: PluggyConnection) {
  await openWidget({
    itemId: conn.item_id,
    onSuccess: async () => { notify('success', `${conn.institution_name} voltou a sincronizar.`); await loadAll() },
    onError: (err) => notify('error', (err as { message?: string })?.message || 'Não foi possível reautenticar.'),
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
  <ContaSection title="Open Finance" subtitle="Conecte corretoras e bancos pra sincronizar sua carteira automaticamente. Suas credenciais nunca passam pela Redentia, tudo regulado pelo Banco Central.">
    <div class="of">
      <!-- toolbar -->
      <div class="of__bar">
        <span class="of__count">{{ connections.length }} {{ connections.length === 1 ? 'conexão' : 'conexões' }}</span>
        <button type="button" class="of__connect" :disabled="widgetLoading" @click="openConnectFlow">
          <svg v-if="!widgetLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          <span v-else class="of__spin" aria-hidden="true" />
          {{ widgetLoading ? 'Abrindo...' : 'Conectar nova conta' }}
        </button>
      </div>

      <!-- notice inline -->
      <p v-if="notice" class="of__notice" :class="`of__notice--${notice.tone}`" role="status">{{ notice.text }}</p>

      <!-- loading -->
      <div v-if="loading" class="of__state">
        <span class="of__spin of__spin--lg" aria-hidden="true" />
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
        <button type="button" class="of__connect of__connect--empty" :disabled="widgetLoading" @click="openConnectFlow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Conectar conta
        </button>
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
              <span v-if="conn.status === 'UPDATING' || conn.status === 'CREATING'" class="of__spin" aria-hidden="true" />
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
              v-if="conn.status === 'LOGIN_ERROR' || conn.status === 'WAITING_USER_INPUT'"
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
              <span v-if="syncingIds.has(conn.id) || conn.status === 'UPDATING'" class="of__spin" aria-hidden="true" />
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
              {{ syncingIds.has(conn.id) ? 'Sincronizando...' : 'Atualizar' }}
            </button>
            <button type="button" class="of__act of__act--danger" :disabled="deletingIds.has(conn.id)" @click="disconnectOne(conn)">
              <span v-if="deletingIds.has(conn.id)" class="of__spin" aria-hidden="true" />
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 5.5 7.5M15 7h2a5 5 0 0 1 1.5 9.8M8 12h5M2 2l20 20" /></svg>
              {{ deletingIds.has(conn.id) ? 'Removendo...' : 'Desconectar' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </ContaSection>
</template>

<style scoped>
.of__bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.of__count { color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.of__connect {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-blue); color: var(--nu-white); border: none; cursor: pointer;
  border-radius: var(--nu-r-pill); padding: 12px 20px;
  font-family: var(--nu-font); font-size: 14.5px; font-weight: 800; transition: background .18s, opacity .18s;
}
.of__connect:hover:not(:disabled) { background: var(--nu-blue-hover); }
.of__connect:disabled { opacity: .55; cursor: default; }

.of__notice { margin: 16px 0 0; padding: 12px 16px; border-radius: var(--nu-r-input); font-size: 14px; font-weight: 600; }
.of__notice--success { background: var(--nu-green-bg); color: var(--nu-green); }
.of__notice--error { background: var(--nu-red-bg); color: var(--nu-red); }

.of__state { display: flex; align-items: center; justify-content: center; padding: 40px 0; }
.of__error { gap: 14px; color: var(--nu-red); font-size: 14.5px; font-weight: 600; }
.of__retry { background: none; border: none; color: var(--nu-blue); font-weight: 800; font-size: 14px; cursor: pointer; font-family: var(--nu-font); text-decoration: underline; }

.of__empty { text-align: center; padding: 44px 20px 24px; display: flex; flex-direction: column; align-items: center; }
.of__empty-ic {
  width: 60px; height: 60px; border-radius: 18px; background: var(--nu-cream); color: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center; margin-bottom: 18px;
}
.of__empty-title { margin: 0; color: var(--nu-ink); font-size: 20px; font-weight: 800; letter-spacing: -.2px; }
.of__empty-sub { margin: 8px 0 22px; color: var(--nu-gray-2); font-size: 15px; font-weight: 500; line-height: 1.55; max-width: 42ch; }
.of__connect--empty { padding: 13px 24px; }

.of__list { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.of__card { background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 20px 22px; }
.of__card-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.of__inst { display: flex; align-items: center; gap: 13px; min-width: 0; }
.of__logo {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px; background: var(--nu-white); color: var(--nu-gray);
  display: inline-flex; align-items: center; justify-content: center; overflow: hidden;
}
.of__logo-img { width: 100%; height: 100%; object-fit: contain; }
.of__inst-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.of__inst-name { color: var(--nu-ink); font-size: 16.5px; font-weight: 800; }
.of__inst-kind { color: var(--nu-gray); font-size: 13px; font-weight: 600; }

.of__status {
  display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0;
  padding: 6px 12px; border-radius: var(--nu-r-pill); font-size: 12.5px; font-weight: 800;
}
.of__status--positive { background: var(--nu-green-bg); color: var(--nu-green); }
.of__status--neutral { background: var(--nu-amber-bg); color: var(--nu-amber); }
.of__status--negative { background: var(--nu-red-bg); color: var(--nu-red); }
.of__status--info { background: var(--nu-blue-bg); color: var(--nu-blue); }

.of__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 14px; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 600; }
.of__dot { color: var(--nu-sand); }
.of__meta-strong { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }

.of__actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
.of__act {
  display: inline-flex; align-items: center; gap: 7px; cursor: pointer; font-family: var(--nu-font);
  border-radius: var(--nu-r-pill); padding: 10px 18px; font-size: 13.5px; font-weight: 800;
  border: 1.5px solid transparent; transition: background .18s, border-color .18s, color .18s, opacity .18s;
}
.of__act:disabled { opacity: .55; cursor: default; }
.of__act--primary { background: var(--nu-blue); color: var(--nu-white); }
.of__act--primary:hover:not(:disabled) { background: var(--nu-blue-hover); }
.of__act--ghost { background: var(--nu-white); color: var(--nu-ink); }
.of__act--ghost:hover:not(:disabled) { border-color: var(--nu-sand-border); }
.of__act--danger { background: none; color: var(--nu-red); }
.of__act--danger:hover:not(:disabled) { background: var(--nu-red-bg); }

.of__spin {
  width: 15px; height: 15px; flex-shrink: 0; border-radius: 50%;
  border: 2px solid currentColor; border-top-color: transparent; animation: of-spin .7s linear infinite;
}
.of__spin--lg { width: 26px; height: 26px; border-width: 3px; color: var(--nu-blue); }
@keyframes of-spin { to { transform: rotate(360deg); } }
</style>
