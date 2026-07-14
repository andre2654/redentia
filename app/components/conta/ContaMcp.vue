<script setup lang="ts">
// Seção Redentia MCP de /conta (PR5) — MOCK (o produto ainda vai ser
// desenvolvido; decisão do dono). Card azul próprio (não o card branco das
// outras seções), fiel ao mockup: badge NOVO + toggle, título + descrição,
// chips de apps (Claude/ChatGPT/Cursor/Raycast), chave de acesso mascarada
// (Revelar/Copiar/Gerar nova), permissões da chave (3 toggles) e o JSON de
// config (Copiar). Tudo estado local — nada de backend ainda.
const enabled = ref(true)
const revealed = ref(false)

const keySuffix = ref('3f9a')
const fullKey = computed(() => `rdt_mcp_9f2c8a1b4e7d${keySuffix.value}`)
const maskedKey = computed(() => `rdt_mcp_••••••••••${keySuffix.value}`)
const shownKey = computed(() => (revealed.value ? fullKey.value : maskedKey.value))

const perms = reactive({ carteira: true, teses: true, news: false })

const config = computed(() => `{
  "mcpServers": {
    "redentia": {
      "url": "https://mcp.redentia.com.br/sse",
      "headers": {
        "Authorization": "Bearer rdt_mcp_••••${keySuffix.value}"
      }
    }
  }
}`)

const apps = [
  { name: 'Claude', letter: 'C', bg: '#D97757' },
  { name: 'ChatGPT', letter: 'G', bg: '#10A37F' },
  { name: 'Cursor', letter: '›', bg: '#111111' },
  { name: 'Raycast', letter: 'R', bg: '#FF6363' },
]

// feedback de cópia por-botão (mock, sem toast global)
const copied = ref<string | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | undefined
async function copy(which: 'key' | 'config', text: string) {
  try { await navigator.clipboard?.writeText(text) }
  catch { /* clipboard bloqueado → ignora (mock) */ }
  copied.value = which
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => (copied.value = null), 1600)
}

const HEX = '0123456789abcdef'
function regenerate() {
  let s = ''
  for (let i = 0; i < 4; i++) s += HEX[Math.floor(Math.random() * 16)]
  keySuffix.value = s
  revealed.value = false
}

onBeforeUnmount(() => clearTimeout(copiedTimer))
</script>

<template>
  <section id="mcp-card" class="mcp">
    <div class="mcp__glow" aria-hidden="true" />

    <div class="mcp__top">
      <span class="mcp__badge">Novo</span>
      <NuToggle v-model="enabled" aria-label="Ativar Redentia MCP" />
    </div>

    <h2 class="mcp__title">Redentia MCP</h2>
    <p class="mcp__desc">Conecte sua carteira e as teses ao seu assistente de IA. Pergunte sobre seus investimentos direto no Claude, ChatGPT ou Cursor, a Redentia responde com os seus dados.</p>

    <div class="mcp__apps">
      <span v-for="a in apps" :key="a.name" class="mcp__app">
        <span class="mcp__app-ic" :style="{ background: a.bg }">{{ a.letter }}</span>
        {{ a.name }}
      </span>
    </div>

    <!-- chave de acesso -->
    <div class="mcp__panel">
      <div class="mcp__panel-label">Sua chave de acesso</div>
      <div class="mcp__key-row">
        <code class="mcp__key">{{ shownKey }}</code>
        <div class="mcp__key-actions">
          <button type="button" class="mcp__btn mcp__btn--dark" @click="revealed = !revealed">{{ revealed ? 'Ocultar' : 'Revelar' }}</button>
          <button type="button" class="mcp__btn mcp__btn--light" @click="copy('key', fullKey)">{{ copied === 'key' ? 'Copiado!' : 'Copiar' }}</button>
        </div>
      </div>
      <div class="mcp__key-foot">
        <button type="button" class="mcp__regen" @click="regenerate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
          Gerar nova chave
        </button>
        <span class="mcp__key-meta">Criada em 12 jul 2026 · último uso há 1h</span>
      </div>
    </div>

    <!-- permissões -->
    <div class="mcp__perms-label">Permissões da chave</div>
    <div class="mcp__perm">
      <div class="mcp__perm-txt">
        <span class="mcp__perm-name">Carteira</span>
        <span class="mcp__perm-desc">Posições, saldo e proventos, somente leitura.</span>
      </div>
      <NuToggle v-model="perms.carteira" aria-label="Permissão carteira" />
    </div>
    <div class="mcp__perm">
      <div class="mcp__perm-txt">
        <span class="mcp__perm-name">Teses</span>
        <span class="mcp__perm-desc">Teses que você acompanha e a convicção atual.</span>
      </div>
      <NuToggle v-model="perms.teses" aria-label="Permissão teses" />
    </div>
    <div class="mcp__perm">
      <div class="mcp__perm-txt">
        <span class="mcp__perm-name">Notícias &amp; pesquisa</span>
        <span class="mcp__perm-desc">Notícias analisadas e relatórios da Redentia.</span>
      </div>
      <NuToggle v-model="perms.news" aria-label="Permissão notícias e pesquisa" />
    </div>

    <!-- configuração -->
    <div class="mcp__panel mcp__panel--config">
      <div class="mcp__config-head">
        <span class="mcp__panel-label">Configuração</span>
        <button type="button" class="mcp__btn mcp__btn--dark" @click="copy('config', config)">{{ copied === 'config' ? 'Copiado!' : 'Copiar' }}</button>
      </div>
      <pre class="mcp__code">{{ config }}</pre>
    </div>
  </section>
</template>

<style scoped>
.mcp {
  position: relative; overflow: hidden;
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(26px, 3.4vw, 44px);
  color: var(--nu-cream-text);
}
.mcp__glow {
  position: absolute; top: -80px; right: -60px; width: 380px; height: 380px;
  border-radius: 50%; background: radial-gradient(circle, rgba(255, 255, 255, .22), transparent 68%);
  pointer-events: none;
}
.mcp__top { position: relative; display: flex; align-items: center; justify-content: space-between; }
.mcp__badge {
  background: var(--nu-cream-text-12); color: var(--nu-cream-text);
  font-size: 11.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
  padding: 6px 12px; border-radius: var(--nu-r-pill);
}
.mcp__title { position: relative; margin: 22px 0 0; font-size: clamp(30px, 3.6vw, 40px); font-weight: 800; letter-spacing: -.03em; }
.mcp__desc { position: relative; margin: 14px 0 0; color: var(--nu-cream-text-82); font-size: 16px; font-weight: 500; line-height: 1.55; max-width: 60ch; }

.mcp__apps { position: relative; display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
.mcp__app {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-cream-text-12); border-radius: var(--nu-r-pill);
  padding: 8px 15px 8px 8px; font-size: 14.5px; font-weight: 800; color: var(--nu-cream-text);
}
.mcp__app-ic {
  width: 26px; height: 26px; border-radius: 8px; color: #fff;
  display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800;
}

.mcp__panel { position: relative; background: var(--nu-blue-deep); border-radius: var(--nu-r-card); padding: 22px 24px; margin-top: 26px; }
.mcp__panel-label { color: var(--nu-cream-text-72); font-size: 11.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.mcp__key-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 16px; flex-wrap: wrap; }
.mcp__key {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 16px; font-weight: 700;
  color: var(--nu-green-soft); letter-spacing: .04em; word-break: break-all;
}
.mcp__key-actions { display: flex; gap: 10px; flex-shrink: 0; }
.mcp__btn {
  border: none; cursor: pointer; font-family: var(--nu-font); font-size: 14px; font-weight: 800;
  border-radius: var(--nu-r-pill); padding: 10px 18px; transition: opacity .15s, background .15s;
}
.mcp__btn--dark { background: var(--nu-cream-text-12); color: var(--nu-cream-text); }
.mcp__btn--dark:hover { background: var(--nu-cream-text-22); }
.mcp__btn--light { background: var(--nu-white); color: var(--nu-ink); }
.mcp__btn--light:hover { opacity: .9; }
.mcp__key-foot { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 18px; flex-wrap: wrap; }
.mcp__regen {
  display: inline-flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer;
  color: var(--nu-cream-text); font-family: var(--nu-font); font-size: 14px; font-weight: 800; padding: 0;
}
.mcp__regen:hover { color: var(--nu-green-soft); }
.mcp__key-meta { color: var(--nu-cream-text-55); font-size: 13px; font-weight: 600; }

.mcp__perms-label { position: relative; color: var(--nu-cream-text-72); font-size: 11.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; margin-top: 30px; padding-bottom: 14px; border-bottom: 1px solid var(--nu-cream-text-12); }
.mcp__perm { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 18px 0; border-bottom: 1px solid var(--nu-cream-text-12); }
.mcp__perm-txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.mcp__perm-name { font-size: 17px; font-weight: 800; }
.mcp__perm-desc { color: var(--nu-cream-text-72); font-size: 14px; font-weight: 500; }

.mcp__panel--config { margin-top: 28px; }
.mcp__config-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.mcp__code {
  margin: 16px 0 0; color: var(--nu-cream-text-82);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13.5px; line-height: 1.65;
  white-space: pre; overflow-x: auto;
}
</style>
