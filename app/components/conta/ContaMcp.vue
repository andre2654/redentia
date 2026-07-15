<script setup lang="ts">
// Seção Redentia MCP de /conta. Card do design do dono (Claude Design
// "Redentia Configuracoes Nu.dc.html", #sec-mcp): gradiente azul + glow
// verde, toggle mint, chips dos apps, chave mascarada, permissões e JSON de
// config. Cores exatas do design (não os tokens --nu-*, pra bater pixel a
// pixel). LIGADO no backend real (/api/me/mcp via useMcp): gera/rotaciona
// chave (mostrada 1x), permissões por escopo e endpoint público do MCP.
// Estado real via backend (/api/me/mcp). A chave em claro só existe UMA
// vez, no retorno do rotate — depois disso, só o mascarado.
const { status, plainKey, hydrate, rotate, setEnabled, setPermissions, busy } = useMcp()
onMounted(() => { hydrate().catch(() => {}) })

const hasKey = computed(() => status.value?.has_key ?? false)
const mcpOn = computed(() => status.value?.enabled ?? false)
const keyMasked = computed(() => status.value?.key_masked ?? '')

// Permissões locais espelhando o backend (sincroniza no hydrate/rotate).
const perms = reactive({ carteira: true, mercado: true, teses: true, news: true })
watch(() => status.value?.permissions, (p) => { if (p) Object.assign(perms, p) }, { immediate: true })

const reveal = ref(false)
// Texto da chave: a recém-gerada (revelável) senão o mascarado do banco.
const tokenText = computed(() => (reveal.value && plainKey.value ? plainKey.value : keyMasked.value))
const bearer = computed(() => plainKey.value ?? keyMasked.value ?? 'rdt_mcp_...')
const cfgText = computed(() => `{
  "mcpServers": {
    "redentia": {
      "url": "https://redentia-api.saraivada.com/mcp",
      "headers": {
        "Authorization": "Bearer ${bearer.value}"
      }
    }
  }
}`)

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  return `há ${Math.floor(h / 24)} d`
}
const metaText = computed(() => {
  const s = status.value
  if (!s?.has_key) return ''
  const created = s.created_at
    ? new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null
  const used = s.last_used_at ? `último uso ${relTime(s.last_used_at)}` : 'ainda não usada'
  return created ? `Criada em ${created} · ${used}` : used
})

// Toggle principal: sem chave → gera a 1ª (liga); com chave → habilita/desabilita.
async function onToggleMain() {
  if (busy.value) return
  if (!hasKey.value) { await rotate(); reveal.value = true; return }
  await setEnabled(!mcpOn.value)
}
async function onTogglePerm(k: 'carteira' | 'mercado' | 'teses' | 'news') {
  if (busy.value || !hasKey.value) return
  perms[k] = !perms[k]
  await setPermissions({ ...perms })
}
async function onRotate() {
  if (busy.value) return
  await rotate()
  reveal.value = true // revela a nova — única chance de copiar
}

const copiedToken = ref(false)
const copiedCfg = ref(false)
let tTimer: ReturnType<typeof setTimeout> | undefined
let cTimer: ReturnType<typeof setTimeout> | undefined
async function copyToken() {
  try { await navigator.clipboard?.writeText(bearer.value) } catch { /* bloqueado */ }
  copiedToken.value = true
  clearTimeout(tTimer)
  tTimer = setTimeout(() => (copiedToken.value = false), 1600)
}
async function copyCfg() {
  try { await navigator.clipboard?.writeText(cfgText.value) } catch { /* bloqueado */ }
  copiedCfg.value = true
  clearTimeout(cTimer)
  cTimer = setTimeout(() => (copiedCfg.value = false), 1600)
}

const apps = [
  { name: 'Claude', letter: 'C', bg: '#D97757' },
  { name: 'ChatGPT', letter: 'G', bg: '#10A37F' },
  { name: 'Cursor', letter: '▹', bg: '#0A0A0C' },
  { name: 'Raycast', letter: 'R', bg: '#FF6363' },
]

onBeforeUnmount(() => { clearTimeout(tTimer); clearTimeout(cTimer) })
</script>

<template>
  <section class="mcp" :class="{ 'mcp--off': !mcpOn }">
    <div class="mcp__glow" aria-hidden="true" />

    <div class="mcp__head">
      <div class="mcp__head-txt">
        <span class="mcp__badge">Novo</span>
        <h2 class="mcp__title">Redentia MCP</h2>
        <p class="mcp__desc">Conecte sua carteira, o mercado e as teses ao seu assistente de IA. Pergunte sobre seus investimentos direto no Claude, ChatGPT ou Cursor — a Redentia responde com os seus dados.</p>
      </div>
      <button type="button" class="msw" :class="{ 'msw--on': mcpOn }" role="switch" :aria-checked="mcpOn" aria-label="Ativar Redentia MCP" @click="onToggleMain"><span class="msw__knob" /></button>
    </div>

    <div class="mcp__apps">
      <span v-for="a in apps" :key="a.name" class="mcp__app">
        <span class="mcp__app-ic" :style="{ background: a.bg }">{{ a.letter }}</span>{{ a.name }}
      </span>
    </div>

    <div class="mcp__panel">
      <div class="mcp__panel-label">Sua chave de acesso</div>

      <template v-if="hasKey">
        <div class="mcp__key-row">
          <code class="mcp__key">{{ tokenText }}</code>
          <button v-if="plainKey" type="button" class="mcp__reveal" @click="reveal = !reveal">{{ reveal ? 'Ocultar' : 'Revelar' }}</button>
          <button type="button" class="mcp__copy" :class="{ 'mcp__copy--done': copiedToken }" @click="copyToken">{{ copiedToken ? 'Copiado' : 'Copiar' }}</button>
        </div>
        <p v-if="plainKey" class="mcp__key-warn">Copie agora — por segurança, não mostramos a chave de novo.</p>
        <div class="mcp__key-foot">
          <button type="button" class="mcp__regen" :disabled="busy" @click="onRotate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
            Gerar nova chave
          </button>
          <span v-if="metaText" class="mcp__key-meta">{{ metaText }}</span>
        </div>
      </template>

      <template v-else>
        <p class="mcp__key-empty">Você ainda não tem uma chave. Gere a sua pra conectar a Redentia ao seu assistente de IA.</p>
        <button type="button" class="mcp__gen" :disabled="busy" @click="onRotate">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Gerar minha chave
        </button>
      </template>
    </div>

    <div class="mcp__perms-label">Permissões da chave</div>
    <div class="mcp__perms">
      <div class="mcp__perm">
        <div class="mcp__perm-txt">
          <div class="mcp__perm-name">Carteira</div>
          <div class="mcp__perm-desc">Posições, saldo e proventos — somente leitura.</div>
        </div>
        <button type="button" class="msw" :class="{ 'msw--on': perms.carteira }" role="switch" :aria-checked="perms.carteira" aria-label="Permissão carteira" @click="onTogglePerm('carteira')"><span class="msw__knob" /></button>
      </div>
      <div class="mcp__perm">
        <div class="mcp__perm-txt">
          <div class="mcp__perm-name">Mercado</div>
          <div class="mcp__perm-desc">Cotações, busca de ativos e placar do mercado.</div>
        </div>
        <button type="button" class="msw" :class="{ 'msw--on': perms.mercado }" role="switch" :aria-checked="perms.mercado" aria-label="Permissão mercado" @click="onTogglePerm('mercado')"><span class="msw__knob" /></button>
      </div>
      <div class="mcp__perm">
        <div class="mcp__perm-txt">
          <div class="mcp__perm-name">Teses</div>
          <div class="mcp__perm-desc">Teses que você acompanha e a convicção atual.</div>
        </div>
        <button type="button" class="msw" :class="{ 'msw--on': perms.teses }" role="switch" :aria-checked="perms.teses" aria-label="Permissão teses" @click="onTogglePerm('teses')"><span class="msw__knob" /></button>
      </div>
      <div class="mcp__perm">
        <div class="mcp__perm-txt">
          <div class="mcp__perm-name">Notícias &amp; pesquisa</div>
          <div class="mcp__perm-desc">Notícias analisadas e relatórios da Redentia.</div>
        </div>
        <button type="button" class="msw" :class="{ 'msw--on': perms.news }" role="switch" :aria-checked="perms.news" aria-label="Permissão notícias e pesquisa" @click="onTogglePerm('news')"><span class="msw__knob" /></button>
      </div>
    </div>

    <div class="mcp__panel mcp__panel--cfg">
      <div class="mcp__cfg-head">
        <span class="mcp__panel-label">Configuração</span>
        <button type="button" class="mcp__cfg-copy" @click="copyCfg">{{ copiedCfg ? 'Copiado' : 'Copiar' }}</button>
      </div>
      <pre class="mcp__code">{{ cfgText }}</pre>
    </div>

    <a href="#" class="mcp__docs">
      Ver documentação do MCP
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
    </a>
  </section>
</template>

<style scoped>
.mcp {
  position: relative; overflow: hidden;
  border-radius: 26px; padding: clamp(26px, 3vw, 40px);
  background: linear-gradient(150deg, #123A8F 0%, #1E4FC2 46%, #2F6BFF 100%);
  transition: background .3s ease;
}
.mcp__glow {
  position: absolute; top: -90px; right: -70px; width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(143, 240, 181, .28) 0%, rgba(143, 240, 181, 0) 70%); pointer-events: none;
  transition: opacity .3s ease;
}

/* DESLIGADO (dono 2026-07-14): card cinza, como se o MCP estivesse mesmo fora.
   Fundo vira cinza + conteúdo dessatura/esmaece/trava; SÓ o toggle principal
   continua colorido e clicável (é como se religa). */
.mcp__head-txt,
.mcp__apps,
.mcp__panel,
.mcp__perms-label,
.mcp__perms,
.mcp__docs { transition: filter .3s ease, opacity .3s ease; }
.mcp--off { background: linear-gradient(150deg, #363B44 0%, #474D57 46%, #59606B 100%); }
.mcp--off .mcp__glow { opacity: 0; }
.mcp--off .mcp__head-txt,
.mcp--off .mcp__apps,
.mcp--off .mcp__panel,
.mcp--off .mcp__perms-label,
.mcp--off .mcp__perms,
.mcp--off .mcp__docs { filter: grayscale(1); opacity: .55; pointer-events: none; }

.mcp__head { position: relative; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.mcp__head-txt { max-width: 560px; }
.mcp__badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255, 255, 255, .16); backdrop-filter: blur(6px); color: #fff;
  font-size: 11.5px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase;
  padding: 6px 13px; border-radius: 999px;
}
.mcp__title { margin: 16px 0 0; color: #fff; font-size: clamp(24px, 2.5vw, 32px); font-weight: 800; letter-spacing: -0.025em; }
.mcp__desc { margin: 12px 0 0; color: rgba(245, 241, 234, .82); font-size: 15.5px; font-weight: 600; line-height: 1.6; }

.mcp__apps { position: relative; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 22px; }
.mcp__app {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255, 255, 255, .12); color: #fff; font-size: 13.5px; font-weight: 700;
  padding: 9px 15px; border-radius: 12px;
}
.mcp__app-ic {
  width: 22px; height: 22px; border-radius: 6px; color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;
}

.mcp__panel { position: relative; background: rgba(9, 20, 44, .5); border: 1px solid rgba(255, 255, 255, .14); border-radius: 18px; padding: 20px; margin-top: 22px; }
.mcp__panel-label { color: rgba(245, 241, 234, .7); font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
.mcp__key-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.mcp__key {
  flex: 1; min-width: 200px; background: rgba(0, 0, 0, .28); color: #8FF0B5;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14.5px; font-weight: 600;
  padding: 13px 16px; border-radius: 12px; letter-spacing: .3px; overflow-x: auto; white-space: nowrap;
}
.mcp__reveal {
  background: rgba(255, 255, 255, .14); border: none; color: #fff; font-size: 13.5px; font-weight: 800;
  cursor: pointer; padding: 12px 15px; border-radius: 12px; transition: background .2s;
}
.mcp__reveal:hover { background: rgba(255, 255, 255, .24); }
.mcp__copy {
  background: #fff; border: none; color: #123A8F; font-size: 13.5px; font-weight: 800;
  cursor: pointer; padding: 12px 16px; border-radius: 12px; white-space: nowrap; transition: background .2s, color .2s;
}
.mcp__copy--done { background: #8FF0B5; color: #0C1524; }
.mcp__key-foot { display: flex; align-items: center; gap: 16px; margin-top: 14px; flex-wrap: wrap; }
.mcp__regen {
  display: inline-flex; align-items: center; gap: 7px; background: transparent; border: none;
  color: rgba(245, 241, 234, .78); font-size: 13px; font-weight: 800; cursor: pointer; padding: 0;
  font-family: inherit; transition: color .2s;
}
.mcp__regen:hover { color: #fff; }
.mcp__key-meta { color: rgba(245, 241, 234, .5); font-size: 12.5px; font-weight: 600; }
.mcp__key-warn { margin: 10px 0 0; color: #8FF0B5; font-size: 12.5px; font-weight: 700; }
.mcp__key-empty { margin: 12px 0 0; color: rgba(245, 241, 234, .72); font-size: 13.5px; font-weight: 500; line-height: 1.5; }
.mcp__gen {
  display: inline-flex; align-items: center; gap: 8px; margin-top: 16px;
  background: #8FF0B5; color: #0A2050; border: 0; border-radius: 999px;
  padding: 11px 20px; font-size: 14px; font-weight: 800; cursor: pointer;
  transition: opacity .15s ease;
}
.mcp__gen:disabled { opacity: .55; cursor: default; }
.mcp__regen:disabled { opacity: .5; cursor: default; }

.mcp__perms-label { position: relative; color: rgba(245, 241, 234, .7); font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; margin-top: 24px; }
.mcp__perms { position: relative; margin-top: 8px; }
.mcp__perm { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-top: 1px solid rgba(255, 255, 255, .14); }
.mcp__perm-txt { flex: 1; min-width: 0; }
.mcp__perm-name { color: #fff; font-size: 15.5px; font-weight: 800; }
.mcp__perm-desc { color: rgba(245, 241, 234, .65); font-size: 13px; font-weight: 600; margin-top: 2px; }

.mcp__panel--cfg { padding: 18px 20px; }
.mcp__cfg-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.mcp__cfg-copy {
  background: rgba(255, 255, 255, .14); border: none; color: #fff; font-size: 12.5px; font-weight: 800;
  cursor: pointer; padding: 8px 13px; border-radius: 10px; transition: background .2s;
}
.mcp__cfg-copy:hover { background: rgba(255, 255, 255, .24); }
.mcp__code { margin: 12px 0 0; color: #C9D8FF; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; line-height: 1.65; white-space: pre; overflow-x: auto; }

.mcp__docs { position: relative; display: inline-flex; align-items: center; gap: 8px; color: #fff; font-size: 14.5px; font-weight: 800; margin-top: 20px; transition: opacity .2s; }
.mcp__docs:hover { opacity: .75; color: #fff; }

/* toggle do design: track 50x30, mint on / branco translúcido off, knob 24 */
.msw {
  position: relative; flex-shrink: 0; width: 50px; height: 30px; border: none; cursor: pointer;
  border-radius: 999px; padding: 0; background: rgba(255, 255, 255, .25); transition: background .2s;
}
.msw--on { background: #8FF0B5; }
.msw__knob {
  position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .25); transition: transform .22s cubic-bezier(.4, 0, .2, 1);
}
.msw--on .msw__knob { transform: translateX(20px); }
</style>
