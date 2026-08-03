<script setup lang="ts">
/**
 * /business/comecar — o guia de conexão do escritório (PR-F do MVP).
 *
 * É o runbook do onboarding em forma de página: os TRÊS conectores que
 * funcionam hoje com chave (Claude Code, Cursor, Claude Desktop via ponte
 * mcp-remote), com os mesmos snippets do /mcp — inclusive o gotcha do
 * Claude Desktop: o "Bearer " com espaço PRECISA viver na env var, porque o
 * app mutila espaço inline nos args do npx. ChatGPT fica de fora e a página
 * diz o porquê (OAuth), igual ao /business.
 *
 * Estática, sem variação por cookie: cache público no nuxt.config.
 */
definePageMeta({ layout: 'business' })

const ENDPOINT = 'https://redentia-api.saraivada.com/mcp'
const KEY = 'rdt_mcp_SUA_CHAVE'

usePageSeo({
  title: 'Conectar · Redentia For Business',
  description: 'Conecte a chave MCP da Redentia ao Claude Desktop, Claude Code ou Cursor em minutos.',
  path: '/business/comecar',
  robots: 'noindex, follow',
})
useHead({ titleTemplate: null })

const cfgClaudeCode = `claude mcp add --transport http redentia ${ENDPOINT} \\
  --header "Authorization: Bearer ${KEY}"`

const cfgCursor = `{
  "mcpServers": {
    "redentia": {
      "url": "${ENDPOINT}",
      "headers": {
        "Authorization": "Bearer ${KEY}"
      }
    }
  }
}`

const cfgClaudeDesktop = `{
  "mcpServers": {
    "redentia": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${ENDPOINT}",
        "--header",
        "Authorization:\${AUTH_HEADER}"
      ],
      "env": { "AUTH_HEADER": "Bearer ${KEY}" }
    }
  }
}`

const BLOCOS = [
  {
    id: 'claude-code',
    titulo: 'Claude Code',
    passo: 'Um comando no terminal, e a próxima sessão já enxerga as tools:',
    cfg: cfgClaudeCode,
  },
  {
    id: 'cursor',
    titulo: 'Cursor',
    passo: 'Abra ~/.cursor/mcp.json (ou Settings, MCP, Add new MCP server) e adicione:',
    cfg: cfgCursor,
  },
  {
    id: 'claude-desktop',
    titulo: 'Claude Desktop',
    passo: 'O Desktop conecta pela ponte mcp-remote. Em Settings, Developer, Edit Config, cole (o "Bearer " fica na env var de propósito, o app quebra o espaço se for inline):',
    cfg: cfgClaudeDesktop,
  },
]

// padrão do /mcp: clipboard pode estar bloqueado e o feedback não trava por
// isso; o timer se limpa no unmount
const copiado = ref<string | null>(null)
let copiaTimer: ReturnType<typeof setTimeout> | undefined
async function copiar(id: string, texto: string) {
  try { await navigator.clipboard?.writeText(texto) } catch { /* clipboard bloqueado */ }
  copiado.value = id
  clearTimeout(copiaTimer)
  copiaTimer = setTimeout(() => { copiado.value = null }, 1600)
}
onBeforeUnmount(() => clearTimeout(copiaTimer))
</script>

<template>
  <section class="rbcm">
    <div class="rbcm__head">
      <NuSectionHeading eyebrow="Conectar">
        Da chave à primeira<br>pergunta.
        <template #dek>
          Troque <strong>rdt_mcp_SUA_CHAVE</strong> pela chave gerada em
          <NuxtLink to="/business/chaves" class="rbcm__link">/business/chaves</NuxtLink>
          e cole no seu assistente. A conexão leva minutos.
        </template>
      </NuSectionHeading>
    </div>

    <div class="rbcm__blocos">
      <div v-for="b in BLOCOS" :key="b.id" class="rbcm__bloco">
        <h3 class="rbcm__titulo">{{ b.titulo }}</h3>
        <p class="rbcm__passo">{{ b.passo }}</p>
        <div class="rbcm__code-wrap">
          <button type="button" class="rbcm__copy" @click="copiar(b.id, b.cfg)">
            {{ copiado === b.id ? 'Copiado' : 'Copiar' }}
          </button>
          <pre class="rbcm__code"><code>{{ b.cfg }}</code></pre>
        </div>
      </div>
    </div>

    <p class="rbcm__chatgpt">
      No ChatGPT ainda não: conectores personalizados exigem OAuth, que está no
      roteiro. Se a sua casa padronizou ChatGPT, dizemos isso na primeira
      conversa, não depois.
    </p>

    <p class="rbcm__teste">
      Conectou? Pergunta de teste: <strong>"como está o mercado hoje?"</strong>.
      Se a resposta vier com dado da Redentia, está de pé.
    </p>
  </section>
</template>

<style scoped>
.rbcm {
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.rbcm__head { max-width: 820px; }
.rbcm__link { color: var(--nu-blue); font-weight: 700; }
.rbcm__link:hover { color: var(--nu-blue-hover); }

.rbcm__blocos {
  margin-top: clamp(36px, 4.5vw, 56px); max-width: 860px;
  display: flex; flex-direction: column; gap: clamp(28px, 3.5vw, 40px);
}
.rbcm__bloco { border-top: 1px solid var(--nu-cream-line); padding-top: clamp(24px, 3vw, 32px); }
.rbcm__titulo { margin: 0; color: var(--nu-ink); font-size: clamp(19px, 1.9vw, 23px); font-weight: 800; letter-spacing: -0.02em; }
.rbcm__passo { margin: 10px 0 0; color: var(--nu-gray-2); font-size: 15px; font-weight: 500; line-height: 1.6; max-width: 640px; }

/* o contêiner rola, a página nunca rola no eixo X */
.rbcm__code-wrap { position: relative; margin-top: 14px; }
.rbcm__code {
  margin: 0; background: var(--nu-cream); border-radius: 12px;
  padding: 18px 20px; overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px; line-height: 1.6; color: var(--nu-ink);
}
.rbcm__copy {
  position: absolute; top: 10px; right: 10px; z-index: 1;
  border: 1px solid var(--nu-cream-line); cursor: pointer;
  background: var(--nu-white); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 6px 14px; font-size: 12.5px; font-weight: 800; font-family: inherit;
  transition: background .2s;
}
.rbcm__copy:hover { background: var(--nu-cream); }
.rbcm__copy:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbcm__chatgpt, .rbcm__teste {
  margin: clamp(28px, 3.5vw, 40px) 0 0; max-width: 720px;
  color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.65;
  border-top: 1px solid var(--nu-cream-line); padding-top: 22px;
}
.rbcm__teste strong { color: var(--nu-ink); font-weight: 800; }
</style>
