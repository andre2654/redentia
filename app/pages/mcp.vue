<script setup lang="ts">
// /mcp — documentação pública do Redentia MCP. REBUILD guiado pelo dono
// (2026-07-17): a 1ª versão saiu do padrão visual; esta é reconstruída
// componente a componente, cada um aprovado antes do próximo. Régua de
// design: a gramática EXATA dos hubs (calculadoras/teses) — hero creme com
// eyebrow + H1 gigante + sub (valores copiados verbatim do chb__hero) — e a
// identidade MCP do ContaMcp só onde for a banda azul.
//
// CTA auth-aware sem variar o SSR (regra do repo: CDN não varia por cookie):
// servidor sempre renderiza o destino anônimo (/login?redirect=/conta#mcp,
// que pra quem já está logado repassa na hora); pós-mount troca pra direto.
const { isAuthenticated } = useAuthState()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const ctaTo = computed(() => (mounted.value && isAuthenticated.value ? '/conta#mcp' : '/login?redirect=%2Fconta%23mcp'))

/* ——— "Como conectar": tabs por assistente (formato de referência do dono:
       passos numerados + prints reais + blocos de código com copiar) ——— */
const ENDPOINT = 'https://redentia-api.saraivada.com/mcp'
const KEY = 'rdt_mcp_SUA_CHAVE'

type TabId = 'claude-web' | 'claude-desktop' | 'claude-code' | 'cursor' | 'raycast' | 'chatgpt'
const TABS: { id: TabId; label: string; soon?: boolean }[] = [
  { id: 'claude-web', label: 'Claude Web' },
  { id: 'claude-desktop', label: 'Claude Desktop' },
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'raycast', label: 'Raycast' },
  { id: 'chatgpt', label: 'ChatGPT', soon: true },
]
const tab = ref<TabId>('claude-web')

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

// Claude Desktop é stdio-only → ponte mcp-remote. O "Bearer " com espaço
// PRECISA viver na env var (o app mutila espaço inline nos args do npx).
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

/* ——— tabela comparativa (referência do dono 2026-07-18, perguntas de
       INVESTIDOR): o que muda quando a IA ganha os dados da Redentia ——— */
type Cell = 'yes' | 'no' | 'partial' | 'na'
const COMPARE_COLS = ['App da corretora', 'App de carteira', 'IA sem conexão']
const COMPARE: { q: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { q: 'Ver a carteira consolidada de várias corretoras', cells: ['no', 'yes', 'no', 'yes'] },
  { q: 'Perguntar em linguagem natural sobre a MINHA carteira', cells: ['no', 'no', 'partial', 'yes'] },
  { q: '"Quanto recebi de dividendos este ano?"', cells: ['partial', 'yes', 'no', 'yes'] },
  { q: 'Cruzar a carteira com uma tese de investimento', cells: ['no', 'no', 'no', 'yes'] },
  { q: 'Cotações e fundamentos da B3 na conversa, sem alucinação', cells: ['na', 'na', 'no', 'yes'] },
  { q: 'Enxergar concentração e risco antes de aportar', cells: ['no', 'partial', 'no', 'yes'] },
  { q: 'Funcionar dentro do Claude e do Cursor', cells: ['no', 'no', 'na', 'yes'] },
  { q: 'Notícias do dia com leitura de IA sobre os seus ativos', cells: ['no', 'no', 'partial', 'yes'] },
  { q: 'Somente leitura, revogável em um clique', cells: ['na', 'yes', 'na', 'yes'] },
]

/* ——— FAQ (accordion padrão do site + FAQPage no JSON-LD) ——— */
const FAQS = [
  { q: 'O que é o Redentia MCP?', a: 'MCP (Model Context Protocol) é o padrão aberto que conecta assistentes de IA a fontes de dados externas. O Redentia MCP é o servidor oficial da Redentia nesse padrão: com ele, o Claude, o Cursor e outros clientes compatíveis respondem sobre a sua carteira, cotações da B3, teses e notícias com dados reais, não genéricos.' },
  { q: 'Quanto custa?', a: 'Nada. A chave é gratuita: basta ter uma conta na Redentia, gerar a chave em Configurações e colar a configuração no seu assistente.' },
  { q: 'A IA consegue mexer na minha carteira?', a: 'Não. O acesso é somente leitura por design: o MCP responde consultas (posições, proventos, cotações, teses, notícias) e não executa nenhuma ação. Não existe ferramenta de compra, venda ou alteração de dados.' },
  { q: 'Quais assistentes funcionam hoje?', a: 'Cursor, Claude Code e Raycast conectam direto com a chave. Claude Desktop conecta pela ponte mcp-remote (instruções nesta página). No claude.ai web o suporte a chave está em liberação gradual pela Anthropic. No ChatGPT, conectores personalizados exigem OAuth, que está no nosso roadmap.' },
  { q: 'De onde vem a minha carteira?', a: 'Do Open Finance, a conexão oficial regulada pelo Banco Central. Você conecta corretoras e bancos (XP, Nubank, Itaú, BTG e mais de 200 instituições) e a Redentia importa suas posições automaticamente, sempre somente leitura.' },
  { q: 'Como revogo o acesso?', a: 'Em Configurações, seção MCP: desligue o interruptor pra suspender na hora, gere uma nova chave (a antiga morre no ato) ou desligue escopos individuais, como carteira, mantendo o resto.' },
]

const copied = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined
async function copy(id: string, text: string) {
  try { await navigator.clipboard?.writeText(text) } catch { /* clipboard bloqueado */ }
  copied.value = id
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (copied.value = null), 1600)
}
onBeforeUnmount(() => clearTimeout(copyTimer))

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
</script>

<template>
  <div class="mdoc">
    <!-- HERO — receita verbatim do hub de calculadoras (chb__hero), em duas
         colunas como o hero da home (texto à esquerda, demo à direita) -->
    <section class="mdoc__hero">
      <div class="mdoc__cols">
        <div class="mdoc__left">
          <div class="mdoc__eyebrow">Redentia MCP</div>
          <h1 class="mdoc__h1">Sua carteira,<br>dentro da sua IA.</h1>
          <p class="mdoc__sub">
            Conecte a Redentia ao Claude, ao Cursor e a outros assistentes compatíveis.
            Sua IA passa a responder com a sua carteira, cotações da B3, teses e notícias.
            Grátis, somente leitura e revogável a qualquer momento.
          </p>
          <NuxtLink :to="ctaTo" class="mdoc__cta">Gerar minha chave</NuxtLink>
        </div>
        <div class="mdoc__right">
          <McpHeroDemo />
        </div>
      </div>
    </section>

    <!-- BANDA AZUL — identidade do card MCP de /conta (gradiente + glow mint
         + painéis translúcidos), transição creme→cor como a home faz -->
    <section class="mdoc__band">
      <div class="mdoc__band-glow" aria-hidden="true" />
      <div class="mdoc__band-in">
        <h2 class="mdoc__band-title">Três passos e a sua IA<br>fica do lado de dentro.</h2>
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
              <p class="mdoc__step-p">Cada assistente tem o seu formato. Os blocos prontos estão logo abaixo.</p>
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
          <code class="mdoc__endpoint-url">https://redentia-api.saraivada.com/mcp</code>
          <span class="mdoc__endpoint-note">streamable HTTP · <code>Authorization: Bearer rdt_mcp_…</code></span>
        </div>
      </div>
    </section>

    <!-- COMO CONECTAR — tabs por assistente, passos numerados + prints reais
         + código com copiar (formato de referência aprovado pelo dono) -->
    <section id="como-conectar" class="mdoc__sec mdoc__sec--band">
      <h2 class="mdoc__h2">Como conectar</h2>
      <p class="mdoc__lead">
        Escolha o seu assistente. Onde aparecer <code class="mdoc__inline">{{ KEY }}</code>, troque pela chave gerada em
        <NuxtLink :to="ctaTo" class="mdoc__link">Configurações → MCP</NuxtLink>.
      </p>

      <div class="mdoc__card">
      <div class="mdoc__tabs" role="tablist" aria-label="Assistentes">
        <button
          v-for="t in TABS" :key="t.id" type="button" role="tab"
          class="mdoc__tab" :class="{ 'mdoc__tab--on': tab === t.id }"
          :aria-selected="tab === t.id" @click="tab = t.id"
        >
          {{ t.label }}<span v-if="t.soon" class="mdoc__tab-soon">em breve</span>
        </button>
      </div>

      <!-- Claude Web -->
      <div v-show="tab === 'claude-web'" class="mdoc__panel" role="tabpanel">
        <a href="https://claude.ai/settings/connectors" target="_blank" rel="noopener" class="mdoc__open">
          Abrir os conectores do Claude
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
        </a>
        <ol class="mdoc__list">
          <li class="mdoc__item">
            <span class="mdoc__n">1</span>
            <div class="mdoc__item-body">
              <p class="mdoc__p">Abra <a href="https://claude.ai/settings/connectors" target="_blank" rel="noopener" class="mdoc__link">claude.ai/settings/connectors</a>, clique em <strong>Add</strong> e escolha <strong>Adicionar conector personalizado</strong>.</p>
              <img src="/mcp-img/claude-web-menu.webp" alt="Tela de conectores do Claude com o botão Add destacado" class="mdoc__shot" width="1592" height="912" loading="lazy" decoding="async">
            </div>
          </li>
          <li class="mdoc__item">
            <span class="mdoc__n">2</span>
            <div class="mdoc__item-body">
              <p class="mdoc__p">No campo <strong>Name</strong>, digite <code class="mdoc__inline">Redentia</code>. No campo <strong>Remote MCP server URL</strong>, cole:</p>
              <div class="mdoc__code-wrap mdoc__code-wrap--line">
                <button type="button" class="mdoc__copy" @click="copy('url', ENDPOINT)">{{ copied === 'url' ? 'Copiado' : 'Copiar' }}</button>
                <pre class="mdoc__code">{{ ENDPOINT }}</pre>
              </div>
              <img src="/mcp-img/claude-web-dialog.webp" alt="Modal Adicionar conector personalizado do Claude com os campos Name e Remote MCP server URL" class="mdoc__shot" width="1592" height="912" loading="lazy" decoding="async">
            </div>
          </li>
          <li class="mdoc__item">
            <span class="mdoc__n">3</span>
            <div class="mdoc__item-body">
              <p class="mdoc__p">Em <strong>Configurações avançadas → Request headers</strong>, adicione o header <code class="mdoc__inline">Authorization</code> com o valor <code class="mdoc__inline">Bearer {{ KEY }}</code> (com o espaço depois de Bearer) e conclua.</p>
              <p class="mdoc__note">O campo de headers está em liberação gradual pela Anthropic. Se ainda não aparecer na sua conta, use a aba <button type="button" class="mdoc__link mdoc__link--btn" @click="tab = 'claude-desktop'">Claude Desktop</button>, que funciona pra todo mundo.</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Claude Desktop -->
      <div v-show="tab === 'claude-desktop'" class="mdoc__panel" role="tabpanel">
        <ol class="mdoc__list">
          <li class="mdoc__item">
            <span class="mdoc__n">1</span>
            <div class="mdoc__item-body">
              <p class="mdoc__p">No app, abra <strong>Settings → Developer → Edit Config</strong> (abre o arquivo <code class="mdoc__inline">claude_desktop_config.json</code>). Você precisa do <strong>Node.js</strong> instalado.</p>
            </div>
          </li>
          <li class="mdoc__item">
            <span class="mdoc__n">2</span>
            <div class="mdoc__item-body">
              <p class="mdoc__p">Cole a configuração (a ponte <code class="mdoc__inline">mcp-remote</code> conecta o app ao servidor remoto):</p>
              <div class="mdoc__code-wrap">
                <button type="button" class="mdoc__copy" @click="copy('desktop', cfgClaudeDesktop)">{{ copied === 'desktop' ? 'Copiado' : 'Copiar' }}</button>
                <pre class="mdoc__code">{{ cfgClaudeDesktop }}</pre>
              </div>
              <p class="mdoc__note">O "Bearer " com espaço fica na variável <code class="mdoc__inline">AUTH_HEADER</code> de propósito: o app corta espaços dos argumentos.</p>
            </div>
          </li>
          <li class="mdoc__item">
            <span class="mdoc__n">3</span>
            <div class="mdoc__item-body">
              <p class="mdoc__p">Salve e <strong>reinicie o Claude Desktop</strong>. O martelinho de ferramentas mostra "redentia" conectado.</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Claude Code -->
      <div v-show="tab === 'claude-code'" class="mdoc__panel" role="tabpanel">
        <p class="mdoc__p">Um comando no terminal e pronto:</p>
        <div class="mdoc__code-wrap">
          <button type="button" class="mdoc__copy" @click="copy('code', cfgClaudeCode)">{{ copied === 'code' ? 'Copiado' : 'Copiar' }}</button>
          <pre class="mdoc__code">{{ cfgClaudeCode }}</pre>
        </div>
      </div>

      <!-- Cursor -->
      <div v-show="tab === 'cursor'" class="mdoc__panel" role="tabpanel">
        <p class="mdoc__p">Abra <code class="mdoc__inline">~/.cursor/mcp.json</code> (ou Settings → MCP → Add new MCP server) e adicione:</p>
        <div class="mdoc__code-wrap">
          <button type="button" class="mdoc__copy" @click="copy('cursor', cfgCursor)">{{ copied === 'cursor' ? 'Copiado' : 'Copiar' }}</button>
          <pre class="mdoc__code">{{ cfgCursor }}</pre>
        </div>
      </div>

      <!-- Raycast -->
      <div v-show="tab === 'raycast'" class="mdoc__panel" role="tabpanel">
        <ol class="mdoc__list">
          <li class="mdoc__item">
            <span class="mdoc__n">1</span>
            <div class="mdoc__item-body"><p class="mdoc__p">Rode o comando <strong>Install MCP Server</strong>.</p></div>
          </li>
          <li class="mdoc__item">
            <span class="mdoc__n">2</span>
            <div class="mdoc__item-body"><p class="mdoc__p">Transporte <strong>HTTP</strong>, URL <code class="mdoc__inline">{{ ENDPOINT }}</code>.</p></div>
          </li>
          <li class="mdoc__item">
            <span class="mdoc__n">3</span>
            <div class="mdoc__item-body"><p class="mdoc__p">Em <strong>HTTP Headers</strong>, adicione <code class="mdoc__inline">Authorization</code> = <code class="mdoc__inline">Bearer {{ KEY }}</code>.</p></div>
          </li>
        </ol>
      </div>

      <!-- ChatGPT -->
      <div v-show="tab === 'chatgpt'" class="mdoc__panel" role="tabpanel">
        <p class="mdoc__p">
          Conectores personalizados no ChatGPT exigem autenticação OAuth, que está no roadmap do Redentia MCP.
          Enquanto isso, a <NuxtLink to="/busca" class="mdoc__link">Redentia AI</NuxtLink> dentro da plataforma responde
          as mesmas perguntas com os seus dados.
        </p>
      </div>
      </div>
    </section>

    <!-- CORRETORAS — animada (dono 2026-07-18): o filme do seletor Open
         Finance à direita, "Bancos e corretoras suportadas" ao lado -->
    <section class="mdoc__sec">
      <div class="mdoc__cols">
        <div class="mdoc__left">
          <h2 class="mdoc__h2">Bancos e corretoras<br>suportadas.</h2>
          <p class="mdoc__lead">
            A carteira que a sua IA lê chega na Redentia pelo <strong>Open Finance</strong>, a conexão oficial
            regulada pelo Banco Central. XP, Nubank, Itaú, BTG Pactual, Rico, Clear, Inter, C6, Bradesco,
            Santander, Banco do Brasil, Toro, Avenue, Ágora e mais de 200 outras instituições.
          </p>
          <p class="mdoc__insts-note">
            Sempre somente leitura: você escolhe o que compartilhar e desconecta quando quiser.
          </p>
        </div>
        <div class="mdoc__right">
          <McpInstDemo />
        </div>
      </div>

      <!-- faixa central: avatares das instituições + círculo de contagem -->
      <div class="mdoc__strip" aria-label="Instituições suportadas">
        <span v-for="s in ['xp', 'nubank', 'itau', 'btg', 'bradesco', 'santander', 'bb', 'inter', 'rico', 'c6']" :key="s" class="mdoc__ava">
          <img :src="`/instituicoes/${s}.svg`" :alt="s" width="30" height="30" loading="lazy">
        </span>
        <span class="mdoc__ava mdoc__ava--more">+200</span>
      </div>
    </section>

    <!-- COMPARATIVO — o que muda quando você conecta (perguntas de investidor) -->
    <section class="mdoc__sec mdoc__sec--band">
      <div class="mdoc__cmp-head">
        <span class="mdoc__chip">O que muda quando você conecta</span>
        <h2 class="mdoc__h2 mdoc__h2--center">O app da corretora <em>mostra</em> a carteira.<br>A sua IA com a Redentia <em>entende</em>.</h2>
        <p class="mdoc__lead mdoc__lead--center">
          Compare o que você consegue fazer hoje com o que passa a conseguir depois de colar uma configuração no seu assistente.
        </p>
      </div>
      <div class="mdoc__cmp-card">
        <div class="mdoc__cmp-scroll">
          <table class="mdoc__cmp">
            <thead>
              <tr>
                <th class="mdoc__cmp-q">Quero…</th>
                <th v-for="c in COMPARE_COLS" :key="c">{{ c }}</th>
                <th class="mdoc__cmp-us">Redentia MCP</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in COMPARE" :key="row.q">
                <td class="mdoc__cmp-q">{{ row.q }}</td>
                <td v-for="(cell, i) in row.cells" :key="i" :class="{ 'mdoc__cmp-us': i === 3 }">
                  <svg v-if="cell === 'yes'" class="mdoc__yes" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>
                  <svg v-else-if="cell === 'no'" class="mdoc__no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  <span v-else class="mdoc__cell-txt">{{ cell === 'partial' ? 'parcial' : 'n/a' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- FAQ — accordion padrão do site (surface white sobre banda creme) -->
    <section class="mdoc__sec mdoc__sec--band">
      <div class="mdoc__faq">
        <h2 class="mdoc__h2 mdoc__h2--center">Perguntas frequentes</h2>
        <div class="mdoc__faq-list">
          <NuFaqAccordion :items="FAQS.map((f) => ({ q: f.q, a: f.a }))" :default-open="-1" surface="white" />
        </div>
      </div>
    </section>

    <!-- CTA FINAL — banda navy, fecho da página -->
    <section class="mdoc__final">
      <h2 class="mdoc__final-t">Dois minutos e a sua IA<br>fica do lado de dentro.</h2>
      <p class="mdoc__final-p">Gere a chave grátis e conecte a Redentia ao seu assistente hoje.</p>
      <NuxtLink :to="ctaTo" class="mdoc__cta mdoc__cta--big">Gerar minha chave</NuxtLink>
    </section>
  </div>
</template>

<style scoped>
/* valores idênticos ao .chb__hero/.chb__eyebrow/.chb__h1/.chb__sub do hub */
.mdoc__hero {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px) clamp(52px, 7vw, 84px);
  animation: nu-fade .5s ease both;
}
/* duas colunas na anatomia do hero da home (mh__cols): texto + demo */
.mdoc__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; }
.mdoc__left { flex: 1.1 1 460px; min-width: min(320px, 100%); }
.mdoc__right { flex: 1 1 380px; min-width: min(320px, 100%); display: flex; justify-content: center; }
.mdoc__eyebrow { color: var(--nu-blue); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }
/* H1 no clamp do hero da home (mh__title): hero de duas colunas divide a
   largura, o corpo do hub (88px) estourava pra 3 linhas */
.mdoc__h1 {
  margin: 14px 0 0; color: var(--nu-ink);
  font-size: clamp(44px, 5.4vw, 84px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.0;
}
.mdoc__sub {
  color: var(--nu-gray); font-size: clamp(17px, 1.8vw, 21px); font-weight: 600;
  line-height: 1.55; margin: 22px 0 0; max-width: 600px;
}
/* CTA no pill padrão do site (mesma anatomia do mh__cta da home, largura auto) */
.mdoc__cta {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 28px;
  font-size: 16.5px; font-weight: 800; margin-top: 28px;
  transition: background .2s;
}
.mdoc__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }

/* ——— banda azul: gradiente + glow verbatim do .mcp/.mcp__glow do ContaMcp;
       painéis = .mcp__panel (rgba(9,20,44,.5) + borda branca 14%) ——— */
.mdoc__band {
  position: relative; overflow: hidden;
  background: linear-gradient(150deg, #123A8F 0%, #1E4FC2 46%, #2F6BFF 100%);
  padding: clamp(56px, 7vw, 92px) clamp(22px, 5.5vw, 80px);
}
.mdoc__band-glow {
  position: absolute; top: -90px; right: -70px; width: 320px; height: 320px; border-radius: 50%;
  background: radial-gradient(circle, rgba(143, 240, 181, .28) 0%, rgba(143, 240, 181, 0) 70%); pointer-events: none;
}
.mdoc__band-in { position: relative; max-width: 1080px; }
.mdoc__band-title {
  margin: 0; color: #fff;
  font-size: clamp(30px, 3.6vw, 46px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.05;
}
.mdoc__steps {
  list-style: none; margin: clamp(28px, 3.5vw, 40px) 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;
}
.mdoc__step {
  display: flex; gap: 14px; align-items: flex-start;
  background: rgba(9, 20, 44, .5); border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 18px; padding: 22px 20px;
}
.mdoc__step-n {
  width: 30px; height: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: #8FF0B5; color: #0A2050; border-radius: 50%; font-size: 15px; font-weight: 800;
}
.mdoc__step-t { color: #fff; font-size: 16.5px; font-weight: 800; }
.mdoc__step-p { margin: 6px 0 0; color: rgba(245, 241, 234, .75); font-size: 14px; font-weight: 600; line-height: 1.55; }
.mdoc__endpoint { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: clamp(24px, 3vw, 32px); }
.mdoc__endpoint-label { color: rgba(245, 241, 234, .7); font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
.mdoc__endpoint-url {
  background: rgba(0, 0, 0, .28); color: #8FF0B5;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; font-weight: 600;
  padding: 11px 15px; border-radius: 12px; overflow-x: auto; white-space: nowrap; max-width: 100%;
}
.mdoc__endpoint-note { color: rgba(245, 241, 234, .6); font-size: 12.5px; font-weight: 600; }
.mdoc__endpoint-note code { color: rgba(245, 241, 234, .85); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

/* ——— como conectar ——— */
.mdoc__sec { background: var(--nu-white); padding: clamp(52px, 6.5vw, 84px) clamp(22px, 5.5vw, 80px); }
/* banda creme + cartão branco (formato da referência do dono; mesma lógica
   white-on-cream dos cards das calculadoras e do FAQ accordion) */
.mdoc__sec--band { background: var(--nu-cream); }
.mdoc__card {
  background: var(--nu-white); border-radius: var(--nu-r-card);
  box-shadow: var(--nu-shadow-card);
  padding: clamp(20px, 2.6vw, 34px);
  margin-top: 26px; max-width: 980px;
}
.mdoc__card .mdoc__panel { max-width: none; }
.mdoc__h2 { margin: 0; color: var(--nu-ink); font-size: clamp(28px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.02; }
.mdoc__lead { color: var(--nu-gray); font-size: 16.5px; font-weight: 600; line-height: 1.6; margin: 16px 0 0; max-width: 720px; }
.mdoc__link { color: var(--nu-blue); font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
.mdoc__link--btn { background: none; border: 0; padding: 0; font: inherit; cursor: pointer; }
.mdoc__inline {
  background: var(--nu-cream-2); color: var(--nu-ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .88em;
  padding: 2px 7px; border-radius: 7px; white-space: nowrap;
}

/* tabs (pílulas no padrão dos filtros do site: ativa = ink sólido) */
.mdoc__tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 26px; }
.mdoc__tab {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-cream); color: var(--nu-ink); border: 0; cursor: pointer;
  font-size: 14.5px; font-weight: 800; padding: 11px 18px; border-radius: var(--nu-r-pill);
  transition: background .15s, color .15s;
}
.mdoc__tab:hover { background: var(--nu-cream-2); }
.mdoc__tab--on { background: var(--nu-ink); color: var(--nu-white); }
.mdoc__tab-soon {
  background: rgba(255, 255, 255, .18); color: inherit; font-size: 10px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase; padding: 3px 8px; border-radius: 999px;
}
.mdoc__tab:not(.mdoc__tab--on) .mdoc__tab-soon { background: var(--nu-white); color: var(--nu-gray); }

.mdoc__panel { margin-top: 28px; max-width: 860px; }
.mdoc__open {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-navy); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 14px 24px; font-size: 15px; font-weight: 800;
  transition: background .2s, transform .15s;
}
.mdoc__open:hover { background: var(--nu-navy-2); color: var(--nu-white); transform: translateY(-1px); }

.mdoc__list { list-style: none; margin: 22px 0 0; padding: 0; }
.mdoc__item { display: flex; gap: 14px; padding: 16px 0; border-top: 1.5px solid var(--nu-cream-2); }
.mdoc__item:first-child { border-top: 0; padding-top: 0; }
.mdoc__n {
  width: 28px; height: 28px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: var(--nu-tile-blue-bg, rgba(47, 107, 255, .12)); color: var(--nu-blue);
  border-radius: 9px; font-size: 14px; font-weight: 800;
}
.mdoc__item-body { flex: 1; min-width: 0; }
.mdoc__p { margin: 3px 0 0; color: var(--nu-ink); font-size: 15.5px; font-weight: 600; line-height: 1.6; }
.mdoc__panel > .mdoc__p { color: var(--nu-gray); }
.mdoc__note { margin: 10px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.55; }
/* height:auto preserva o aspect-ratio (o width/height do attr só reserva o
   espaço pra não dar salto de layout); borda leve dá moldura de screenshot */
.mdoc__shot {
  display: block; width: 100%; height: auto; max-width: 620px;
  border-radius: 14px; margin-top: 16px;
  border: 1px solid var(--nu-cream-2); box-shadow: var(--nu-shadow-card);
}

/* ——— corretoras ——— */
.mdoc__insts-note { margin: 20px 0 0; color: var(--nu-gray); font-size: 14px; font-weight: 600; line-height: 1.6; max-width: 720px; }
/* faixa central de avatares sobrepostos + círculo de contagem */
.mdoc__strip { display: flex; justify-content: center; align-items: center; margin-top: clamp(36px, 4.5vw, 56px); }
.mdoc__ava {
  width: 48px; height: 48px; border-radius: 50%; background: var(--nu-white);
  border: 2.5px solid var(--nu-cream); box-shadow: var(--nu-shadow-card);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  margin-left: -10px;
}
.mdoc__ava:first-child { margin-left: 0; }
.mdoc__ava img { width: 28px; height: 28px; object-fit: contain; }
.mdoc__ava--more {
  background: var(--nu-blue); color: var(--nu-white);
  font-size: 13px; font-weight: 800; letter-spacing: -0.02em;
}

/* ——— comparativo ——— */
.mdoc__cmp-head { text-align: center; max-width: 760px; margin: 0 auto; }
.mdoc__chip {
  display: inline-flex; background: var(--nu-tile-blue-bg, rgba(47, 107, 255, .1)); color: var(--nu-blue);
  font-size: 12px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase;
  padding: 7px 14px; border-radius: 999px;
}
.mdoc__h2--center { margin-top: 18px; }
.mdoc__h2 em { color: var(--nu-blue); font-style: italic; }
.mdoc__lead--center { margin-left: auto; margin-right: auto; }
.mdoc__cmp-card {
  background: var(--nu-white); border-radius: var(--nu-r-card);
  box-shadow: var(--nu-shadow-card); margin: 30px auto 0; max-width: 1080px;
  overflow: hidden;
}
.mdoc__cmp-scroll { overflow-x: auto; }
.mdoc__cmp { width: 100%; min-width: 720px; border-collapse: collapse; }
.mdoc__cmp th {
  color: var(--nu-gray); font-size: 11.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
  text-align: center; padding: 18px 14px; border-bottom: 1.5px solid var(--nu-cream-2);
}
.mdoc__cmp th.mdoc__cmp-q { text-align: left; }
.mdoc__cmp td { text-align: center; padding: 15px 14px; border-bottom: 1.5px solid var(--nu-cream-2); }
.mdoc__cmp tbody tr:last-child td { border-bottom: 0; }
.mdoc__cmp td.mdoc__cmp-q { text-align: left; color: var(--nu-ink); font-size: 14.5px; font-weight: 700; line-height: 1.4; }
.mdoc__cmp th.mdoc__cmp-us { color: var(--nu-blue); }
.mdoc__cmp .mdoc__cmp-us { background: var(--nu-tile-blue-bg, rgba(47, 107, 255, .06)); }
.mdoc__yes { color: var(--nu-blue); display: inline-block; vertical-align: middle; }
.mdoc__no { color: var(--nu-sand, #C9C2B4); display: inline-block; vertical-align: middle; }
.mdoc__cell-txt { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— FAQ + CTA final ——— */
.mdoc__faq { max-width: 820px; margin: 0 auto; }
.mdoc__faq-list { margin-top: clamp(28px, 3.5vw, 40px); }
.mdoc__final { background: var(--nu-navy); padding: clamp(64px, 8vw, 104px) clamp(22px, 5.5vw, 80px); text-align: center; }
.mdoc__final-t { margin: 0; color: var(--nu-cream-text); font-size: clamp(30px, 4vw, 50px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.04; }
.mdoc__final-p { margin: 18px 0 0; color: var(--nu-cream-text-72); font-size: clamp(16px, 1.7vw, 19px); font-weight: 600; }
.mdoc__cta--big { margin-top: 28px; padding: 18px 34px; font-size: 17px; }

/* código: faixa própria pro Copiar (nunca sobrepõe o texto) */
.mdoc__code-wrap { position: relative; margin-top: 12px; padding-top: 44px; background: #0E1B3A; border-radius: 16px; }
.mdoc__code-wrap--line { padding-top: 0; display: flex; align-items: center; }
.mdoc__code-wrap--line .mdoc__code { flex: 1; padding: 15px 96px 15px 18px; }
.mdoc__code { margin: 0; padding: 0 22px 20px; color: #C9D8FF; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.65; white-space: pre; overflow-x: auto; }
.mdoc__copy {
  position: absolute; top: 10px; right: 10px; z-index: 1;
  background: rgba(255, 255, 255, .14); border: none; color: #fff; font-size: 12.5px; font-weight: 800;
  cursor: pointer; padding: 8px 13px; border-radius: 10px; transition: background .2s;
}
.mdoc__copy:hover { background: rgba(255, 255, 255, .26); }
.mdoc__code-wrap--line .mdoc__copy { top: 50%; transform: translateY(-50%); }
</style>
