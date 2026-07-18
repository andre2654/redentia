<script setup lang="ts">
// /mcp — documentação pública do Redentia MCP (P0 da frente de descoberta por
// IA, 2026-07-17). É o endereço estável que diretórios de MCP, crawlers de IA
// e o link "Ver documentação" do card de /conta apontam. Esqueleto inspirado
// no docs.stripe.com/mcp (intro de 1 frase → como conectar por cliente →
// exemplos), com a identidade visual MCP já estabelecida no ContaMcp (gradiente
// azul + mint + chips de apps, cores exatas do design, não os tokens --nu-*).
//
// HONESTIDADE POR CLIENTE (fatos verificados nas docs oficiais em 2026-07-17):
// header Bearer direto = Cursor, Claude Code e Raycast; Claude Desktop via
// mcp-remote (gotcha do espaço: "Bearer " vive numa env var); claude.ai web
// tem "Request headers" em BETA de rollout limitado; ChatGPT só aceita OAuth
// em conector custom (bloco marcado "em breve" até o MCP ter OAuth). Não
// ensinamos setup que não funciona.
//
// CACHE: rota pública s-maxage=3600 (nuxt.config). O CTA é auth-aware SEM
// variar o SSR (regra dura do repo: CDN não varia por cookie): o servidor
// SEMPRE renderiza o destino de anônimo (/login?redirect=/conta#mcp — que
// pra quem JÁ está logado redireciona na hora pro destino) e, pós-mount,
// troca pra /conta#mcp direto. Zero hydration mismatch: a troca é client-only.
const ENDPOINT = 'https://redentia-api.saraivada.com/mcp'

const { isAuthenticated } = useAuthState()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const ctaTo = computed(() => (mounted.value && isAuthenticated.value ? '/conta#mcp' : '/login?redirect=%2Fconta%23mcp'))

// Logos reais (mesmos assets do ContaMcp/CarteiraMcpBanner).
const apps = [
  { name: 'Claude', logo: '/icons/logo-claude.webp' },
  { name: 'Cursor', logo: '/icons/logo-cursor.webp' },
  { name: 'Raycast', logo: '/icons/logo-raycast.webp' },
  { name: 'ChatGPT', logo: '/icons/logo-chatgpt.webp' },
]

/* ——— blocos de configuração por cliente (chave = placeholder; a real sai de /conta) ——— */
const KEY = 'rdt_mcp_SUA_CHAVE'

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

const cfgClaudeCode = `claude mcp add --transport http redentia ${ENDPOINT} \\
  --header "Authorization: Bearer ${KEY}"`

// Claude Desktop: config stdio-only → ponte via mcp-remote. O "Bearer " com
// espaço PRECISA viver na env var (bug documentado do spawn do npx no app:
// espaço inline no arg é mutilado).
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

const prompts = [
  'Como está a minha carteira hoje?',
  'Qual o meu ativo com maior peso e quanto ele paga de dividendos?',
  'Compare a minha carteira com a tese Viver de dividendos.',
  'O que saiu de notícia hoje sobre os meus ativos?',
  'Qual o preço e o P/L de WEGE3 agora?',
  'Minha carteira está muito concentrada em um setor?',
]

const FAQS = [
  {
    q: 'O que é o Redentia MCP?',
    a: 'MCP (Model Context Protocol) é o padrão aberto que conecta assistentes de IA a fontes de dados externas. O Redentia MCP é o servidor oficial da Redentia nesse padrão: com ele, o Claude, o Cursor e outros clientes compatíveis passam a responder sobre a SUA carteira, cotações da B3, teses e notícias usando dados reais, não genéricos.',
  },
  {
    q: 'Quanto custa?',
    a: 'Nada. A chave é gratuita: basta ter uma conta na Redentia, gerar a chave em Configurações e colar a configuração no seu assistente.',
  },
  {
    q: 'A IA consegue mexer na minha carteira?',
    a: 'Não. O acesso é somente leitura por design: o MCP responde consultas (posições, proventos, cotações, teses, notícias) e não executa nenhuma ação. Não existe ferramenta de compra, venda ou alteração de dados.',
  },
  {
    q: 'Quais assistentes funcionam hoje?',
    a: 'Cursor, Claude Code e Raycast conectam direto com a chave. Claude Desktop conecta via mcp-remote (ponte local, instruções nesta página). No claude.ai web o suporte a chave está em beta limitado da Anthropic. No ChatGPT, conectores personalizados exigem OAuth, que está no nosso roadmap.',
  },
  {
    q: 'Como revogo o acesso?',
    a: 'Em Configurações, seção MCP: desligue o interruptor pra suspender na hora, gere uma nova chave (a antiga morre no ato) ou desligue escopos individuais, como carteira, mantendo o resto.',
  },
  {
    q: 'Que dados a IA acessa?',
    a: 'Só o que a sua chave permitir, por escopo: Carteira (posições, saldo e proventos, somente leitura), Mercado (cotações e fundamentos da B3), Teses (as teses da Redentia e sua convicção) e Notícias com a análise da Redentia. Cada escopo tem um interruptor próprio.',
  },
]

usePageSeo({
  title: 'Redentia MCP: sua carteira da B3 no Claude e no Cursor',
  description: 'Servidor MCP oficial da Redentia: conecte sua carteira, cotações da B3, teses e notícias ao seu assistente de IA. Chave gratuita, acesso somente leitura.',
  path: '/mcp',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Redentia MCP', path: '/mcp' },
  ],
  structuredData: [
    {
      '@type': 'SoftwareApplication',
      'name': 'Redentia MCP',
      'applicationCategory': 'FinanceApplication',
      'operatingSystem': 'Web',
      'description': 'Servidor MCP (Model Context Protocol) da Redentia: carteira da B3 via Open Finance, cotações, teses de investimento e notícias para assistentes de IA.',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'BRL' },
    },
    {
      '@type': 'FAQPage',
      'mainEntity': FAQS.map((f) => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
      })),
    },
  ],
})

/* ——— copiar blocos de código ——— */
const copied = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined
async function copy(id: string, text: string) {
  try { await navigator.clipboard?.writeText(text) } catch { /* clipboard bloqueado */ }
  copied.value = id
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (copied.value = null), 1600)
}
onBeforeUnmount(() => clearTimeout(copyTimer))
</script>

<template>
  <div class="mdoc">
    <!-- hero creme (gramática dos hubs: eyebrow + H1 gigante + sub + CTA) -->
    <section class="mdoc__hero">
      <div class="mdoc__eyebrow">Redentia MCP · grátis</div>
      <h1 class="mdoc__h1">Sua carteira,<br>dentro da sua IA.</h1>
      <p class="mdoc__sub">
        O Redentia MCP é o servidor oficial da Redentia no Model Context Protocol, o padrão aberto que conecta
        assistentes de IA a dados reais. Com uma chave gratuita, o Claude, o Cursor e outros clientes compatíveis
        respondem sobre a sua carteira da B3, cotações, teses e notícias. Somente leitura, revogável a qualquer momento.
      </p>
      <div class="mdoc__hero-ctas">
        <NuxtLink :to="ctaTo" class="mdoc__cta">Gerar minha chave</NuxtLink>
        <a href="#como-conectar" class="mdoc__cta mdoc__cta--ghost">Como conectar</a>
      </div>
    </section>

    <!-- banda azul: identidade MCP + 3 passos -->
    <section class="mdoc__band">
      <div class="mdoc__band-glow" aria-hidden="true" />
      <div class="mdoc__band-inner">
        <div class="mdoc__apps" aria-hidden="true">
          <span v-for="a in apps" :key="a.name" class="mdoc__app">
            <span class="mdoc__app-ic"><img :src="a.logo" :alt="a.name" width="22" height="22"></span>{{ a.name }}
          </span>
        </div>
        <h2 class="mdoc__band-title">Três passos e a sua IA passa a saber da sua carteira.</h2>
        <ol class="mdoc__steps">
          <li class="mdoc__step">
            <span class="mdoc__step-n">1</span>
            <div>
              <div class="mdoc__step-t">Gere a chave</div>
              <p class="mdoc__step-p">Em Configurações, seção MCP. A chave aparece uma única vez, copie na hora.</p>
            </div>
          </li>
          <li class="mdoc__step">
            <span class="mdoc__step-n">2</span>
            <div>
              <div class="mdoc__step-t">Cole a configuração</div>
              <p class="mdoc__step-p">Cada assistente tem o seu formato, todos estão nesta página com o bloco pronto.</p>
            </div>
          </li>
          <li class="mdoc__step">
            <span class="mdoc__step-n">3</span>
            <div>
              <div class="mdoc__step-t">Pergunte</div>
              <p class="mdoc__step-p">"Como está a minha carteira hoje?" e a resposta vem com os seus dados reais.</p>
            </div>
          </li>
        </ol>
        <div class="mdoc__endpoint">
          <span class="mdoc__endpoint-label">Endpoint</span>
          <code class="mdoc__endpoint-url">{{ ENDPOINT }}</code>
          <span class="mdoc__endpoint-note">streamable HTTP · <code>Authorization: Bearer rdt_mcp_…</code></span>
        </div>
      </div>
    </section>

    <!-- como conectar, por cliente -->
    <section id="como-conectar" class="mdoc__sec">
      <h2 class="mdoc__h2">Como conectar</h2>
      <p class="mdoc__lead">
        Escolha o seu assistente. Nos blocos abaixo, troque <code class="mdoc__inline">{{ KEY }}</code> pela chave
        gerada em <NuxtLink :to="ctaTo" class="mdoc__link">Configurações → MCP</NuxtLink>.
      </p>

      <div class="mdoc__client">
        <h3 class="mdoc__h3">Cursor</h3>
        <p class="mdoc__p">Abra <code class="mdoc__inline">~/.cursor/mcp.json</code> (ou Settings → MCP → Add new MCP server) e adicione:</p>
        <div class="mdoc__code-wrap">
          <button type="button" class="mdoc__copy" @click="copy('cursor', cfgCursor)">{{ copied === 'cursor' ? 'Copiado' : 'Copiar' }}</button>
          <pre class="mdoc__code">{{ cfgCursor }}</pre>
        </div>
      </div>

      <div class="mdoc__client">
        <h3 class="mdoc__h3">Claude Code</h3>
        <p class="mdoc__p">Um comando no terminal:</p>
        <div class="mdoc__code-wrap">
          <button type="button" class="mdoc__copy" @click="copy('code', cfgClaudeCode)">{{ copied === 'code' ? 'Copiado' : 'Copiar' }}</button>
          <pre class="mdoc__code">{{ cfgClaudeCode }}</pre>
        </div>
      </div>

      <div class="mdoc__client">
        <h3 class="mdoc__h3">Claude Desktop</h3>
        <p class="mdoc__p">
          O app usa servidores locais, então a conexão passa pela ponte <code class="mdoc__inline">mcp-remote</code>
          (precisa do Node.js instalado). Em Settings → Developer → Edit Config, adicione ao
          <code class="mdoc__inline">claude_desktop_config.json</code>:
        </p>
        <div class="mdoc__code-wrap">
          <button type="button" class="mdoc__copy" @click="copy('desktop', cfgClaudeDesktop)">{{ copied === 'desktop' ? 'Copiado' : 'Copiar' }}</button>
          <pre class="mdoc__code">{{ cfgClaudeDesktop }}</pre>
        </div>
        <p class="mdoc__note">O "Bearer " com espaço fica na variável <code class="mdoc__inline">AUTH_HEADER</code> de propósito: o app corta espaços dos argumentos.</p>
      </div>

      <div class="mdoc__client">
        <h3 class="mdoc__h3">Raycast</h3>
        <p class="mdoc__p">
          Rode o comando <strong>Install MCP Server</strong>, escolha transporte <strong>HTTP</strong>, cole a URL
          <code class="mdoc__inline">{{ ENDPOINT }}</code> e adicione o header
          <code class="mdoc__inline">Authorization</code> com valor <code class="mdoc__inline">Bearer {{ KEY }}</code>.
        </p>
      </div>

      <div class="mdoc__client">
        <h3 class="mdoc__h3">claude.ai (web)</h3>
        <p class="mdoc__p">
          Em Settings → Connectors → Add custom connector, cole a URL do endpoint. O campo de
          <strong>Request headers</strong> (onde entra a chave) está em beta de liberação gradual pela Anthropic:
          se a sua conta ainda não tem, use o Claude Desktop com a ponte acima.
        </p>
      </div>

      <div class="mdoc__client mdoc__client--soon">
        <h3 class="mdoc__h3">ChatGPT <span class="mdoc__soon">em breve</span></h3>
        <p class="mdoc__p">
          Conectores personalizados no ChatGPT exigem autenticação OAuth, que está no roadmap do Redentia MCP.
          Enquanto isso, a Redentia AI dentro da plataforma responde as mesmas perguntas com os seus dados.
        </p>
      </div>
    </section>

    <!-- o que a IA passa a saber -->
    <section class="mdoc__sec mdoc__sec--alt">
      <h2 class="mdoc__h2">O que a sua IA passa a saber</h2>
      <div class="mdoc__scopes">
        <div class="mdoc__scope">
          <div class="mdoc__scope-t">Carteira</div>
          <p class="mdoc__scope-p">Posições, saldo e proventos da sua carteira real, conectada via Open Finance. Somente leitura.</p>
        </div>
        <div class="mdoc__scope">
          <div class="mdoc__scope-t">Mercado</div>
          <p class="mdoc__scope-p">Cotações e fundamentos de ações, FIIs e BDRs da B3, além do placar do dia.</p>
        </div>
        <div class="mdoc__scope">
          <div class="mdoc__scope-t">Teses</div>
          <p class="mdoc__scope-p">As teses de investimento da Redentia, com composição e convicção atualizadas diariamente.</p>
        </div>
        <div class="mdoc__scope">
          <div class="mdoc__scope-t">Notícias &amp; pesquisa</div>
          <p class="mdoc__scope-p">Notícias do mercado com a leitura da Redentia e os relatórios das teses.</p>
        </div>
      </div>
      <p class="mdoc__scopes-note">
        Cada escopo tem um interruptor próprio na sua chave. Desligou, a IA para de ver na hora. E não existe
        ferramenta de escrita: o MCP não compra, não vende e não altera nada.
      </p>
    </section>

    <!-- exemplos de prompt -->
    <section class="mdoc__sec">
      <h2 class="mdoc__h2">Perguntas que ficam boas com dados de verdade</h2>
      <div class="mdoc__prompts">
        <span v-for="p in prompts" :key="p" class="mdoc__prompt">{{ p }}</span>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mdoc__sec mdoc__sec--alt">
      <h2 class="mdoc__h2">Perguntas frequentes</h2>
      <NuFaqAccordion :items="FAQS.map((f) => ({ q: f.q, a: f.a }))" :default-open="-1" surface="white" />
    </section>

    <!-- CTA final -->
    <section class="mdoc__final">
      <h2 class="mdoc__final-t">Dois minutos e a sua IA fica do lado de dentro.</h2>
      <NuxtLink :to="ctaTo" class="mdoc__cta mdoc__cta--big">Gerar minha chave grátis</NuxtLink>
    </section>
  </div>
</template>

<style scoped>
/* hero na gramática dos hubs (calculadoras/rankings): creme, H1 gigante */
.mdoc__hero { background: var(--nu-cream); padding: clamp(64px, 9vw, 120px) clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 72px); animation: nu-fade .5s ease both; }
.mdoc__eyebrow { color: var(--nu-blue); font-size: clamp(15px, 1.5vw, 18px); font-weight: 800; letter-spacing: -.2px; text-transform: none; }
.mdoc__h1 { margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(42px, 5.2vw, 78px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.0; }
.mdoc__sub { color: var(--nu-gray); font-size: clamp(16px, 1.7vw, 19px); font-weight: 600; line-height: 1.6; margin-top: 22px; max-width: 720px; }
.mdoc__hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
.mdoc__cta {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 15px 28px; font-size: 16px; font-weight: 800; transition: background .2s, transform .15s;
}
.mdoc__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-1px); }
.mdoc__cta--ghost { background: transparent; color: var(--nu-ink); border: 1.5px solid var(--nu-sand); }
.mdoc__cta--ghost:hover { background: var(--nu-cream-2); color: var(--nu-ink); }

/* banda azul: paleta exata do card MCP (ContaMcp) */
.mdoc__band { position: relative; overflow: hidden; background: linear-gradient(150deg, #123A8F 0%, #1E4FC2 46%, #2F6BFF 100%); padding: clamp(56px, 7vw, 88px) clamp(22px, 5.5vw, 80px); }
.mdoc__band-glow { position: absolute; top: -110px; right: -80px; width: 340px; height: 340px; border-radius: 50%; background: radial-gradient(circle, rgba(143, 240, 181, .26) 0%, rgba(143, 240, 181, 0) 70%); pointer-events: none; }
.mdoc__band-inner { position: relative; max-width: 980px; }
.mdoc__apps { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mdoc__app { display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, .12); color: #fff; font-size: 13.5px; font-weight: 700; padding: 9px 15px; border-radius: 12px; }
.mdoc__app-ic { width: 22px; height: 22px; border-radius: 6px; background: #fff; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mdoc__app-ic img { width: 100%; height: 100%; object-fit: contain; padding: 3px; display: block; }
.mdoc__band-title { margin: 26px 0 0; color: #fff; font-size: clamp(26px, 3vw, 38px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; max-width: 640px; }
.mdoc__steps { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin: 30px 0 0; padding: 0; }
.mdoc__step { display: flex; gap: 14px; background: rgba(9, 20, 44, .5); border: 1px solid rgba(255, 255, 255, .14); border-radius: 18px; padding: 20px; }
.mdoc__step-n { width: 30px; height: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #8FF0B5; color: #0A2050; border-radius: 50%; font-size: 15px; font-weight: 800; }
.mdoc__step-t { color: #fff; font-size: 16px; font-weight: 800; }
.mdoc__step-p { margin: 6px 0 0; color: rgba(245, 241, 234, .75); font-size: 13.5px; font-weight: 600; line-height: 1.55; }
.mdoc__endpoint { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 26px; }
.mdoc__endpoint-label { color: rgba(245, 241, 234, .7); font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
.mdoc__endpoint-url { background: rgba(0, 0, 0, .28); color: #8FF0B5; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; font-weight: 600; padding: 10px 14px; border-radius: 12px; overflow-x: auto; white-space: nowrap; max-width: 100%; }
.mdoc__endpoint-note { color: rgba(245, 241, 234, .6); font-size: 12.5px; font-weight: 600; }
.mdoc__endpoint-note code { color: rgba(245, 241, 234, .85); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

/* seções de conteúdo */
.mdoc__sec { background: var(--nu-white); padding: clamp(52px, 6.5vw, 84px) clamp(22px, 5.5vw, 80px); }
.mdoc__sec--alt { background: var(--nu-cream); }
.mdoc__h2 { margin: 0; color: var(--nu-ink); font-size: clamp(28px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.02; }
.mdoc__lead { color: var(--nu-gray); font-size: 16.5px; font-weight: 600; line-height: 1.6; margin-top: 16px; max-width: 720px; }
.mdoc__link { color: var(--nu-blue); font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }

.mdoc__client { margin-top: clamp(32px, 4vw, 44px); max-width: 860px; }
.mdoc__h3 { margin: 0; color: var(--nu-ink); font-size: clamp(20px, 2.1vw, 25px); font-weight: 800; letter-spacing: -0.02em; display: flex; align-items: center; gap: 10px; }
.mdoc__p { color: var(--nu-gray); font-size: 15.5px; font-weight: 600; line-height: 1.6; margin: 10px 0 0; }
.mdoc__note { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.55; margin: 10px 0 0; }
.mdoc__inline { background: var(--nu-cream-2); color: var(--nu-ink); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .88em; padding: 2px 7px; border-radius: 7px; white-space: nowrap; }
.mdoc__soon { display: inline-flex; align-items: center; background: var(--nu-cream-2); color: var(--nu-gray); font-size: 11.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; }
.mdoc__client--soon .mdoc__p { max-width: 720px; }

/* padding-top no wrap reserva a faixa do botão Copiar — o código nunca passa
   por baixo dele, em nenhuma largura (defeito pego no verify mobile) */
.mdoc__code-wrap { position: relative; margin-top: 14px; padding-top: 44px; background: #0E1B3A; border-radius: 16px; }
.mdoc__code { margin: 0; padding: 0 22px 20px; color: #C9D8FF; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.65; white-space: pre; overflow-x: auto; }
.mdoc__copy {
  position: absolute; top: 12px; right: 12px; z-index: 1;
  background: rgba(255, 255, 255, .14); border: none; color: #fff; font-size: 12.5px; font-weight: 800;
  cursor: pointer; padding: 8px 13px; border-radius: 10px; transition: background .2s;
}
.mdoc__copy:hover { background: rgba(255, 255, 255, .26); }

/* escopos */
.mdoc__scopes { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-top: 28px; }
.mdoc__scope { background: var(--nu-white); border-radius: var(--nu-r-card); padding: 24px; box-shadow: var(--nu-shadow-card); }
.mdoc__scope-t { color: var(--nu-ink); font-size: 17px; font-weight: 800; }
.mdoc__scope-p { margin: 8px 0 0; color: var(--nu-gray); font-size: 14px; font-weight: 600; line-height: 1.55; }
.mdoc__scopes-note { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; line-height: 1.6; margin-top: 20px; max-width: 720px; }

/* prompts de exemplo */
.mdoc__prompts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
.mdoc__prompt { background: var(--nu-cream); color: var(--nu-ink); font-size: 14.5px; font-weight: 700; padding: 12px 18px; border-radius: var(--nu-r-pill); }

/* CTA final */
.mdoc__final { background: var(--nu-navy); padding: clamp(64px, 8vw, 104px) clamp(22px, 5.5vw, 80px); text-align: center; }
.mdoc__final-t { margin: 0; color: var(--nu-cream-text); font-size: clamp(28px, 3.6vw, 46px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.05; }
.mdoc__cta--big { margin-top: 26px; padding: 18px 34px; font-size: 17px; }
</style>
