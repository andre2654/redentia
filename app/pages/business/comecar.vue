<script setup lang="ts">
/**
 * /business/comecar — o guia de conexão do escritório.
 *
 * MESMA ANATOMIA DA /mcp, que é a página irmã: ela resolve exatamente este
 * conteúdo (endpoint, três passos, um bloco de configuração por assistente) na
 * língua do app, e foi aprovada assim. Portado de lá: o hero com o cartão de
 * endpoint, a banda navy de passos numerados, o card branco com ABAS por
 * assistente em vez de três blocos empilhados, e o bloco de código NAVY com
 * faixa própria pro botão Copiar, que assim nunca cobre a primeira linha.
 *
 * A versão anterior era uma seção branca única, três blocos separados por fio
 * de 1px, código em creme, e as duas informações mais importantes (o que fazer
 * se a casa usa ChatGPT, e a pergunta de teste) como nota de rodapé cinza de
 * 14,5px. As duas viraram conteúdo de primeira classe: o ChatGPT é uma aba com
 * etiqueta "em breve", e a pergunta de teste é a banda de fecho.
 *
 * ⚠️ O gotcha do Claude Desktop continua valendo e agora está escrito no passo:
 * o "Bearer " com espaço PRECISA viver na env var, porque o app corta espaço
 * inline nos args do npx e a autenticação falha sem dizer o motivo.
 *
 * Estática, sem variação por cookie: cache público no nuxt.config.
 */
definePageMeta({ layout: 'business' })

const ENDPOINT = 'https://redentia-api.saraivada.com/mcp'
// Chave de ESCRITÓRIO (rdt_biz_), não a pessoal (rdt_mcp_): esta página é do
// business, e mostrar o prefixo errado manda o cliente colar a credencial que
// o plano dele não usa.
const KEY = 'rdt_biz_SUA_CHAVE'

usePageSeo({
  title: 'Conectar · Redentia For Business',
  description: 'Conecte a chave MCP do seu escritório ao Claude Code, Cursor ou Claude Desktop em minutos.',
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

const TABS = [
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'claude-desktop', label: 'Claude Desktop' },
  { id: 'chatgpt', label: 'ChatGPT', soon: true },
]
const tab = ref('claude-code')

const PASSOS = [
  { n: '1', t: 'Gere a chave', p: 'No painel do escritório, com o nome de quem vai usar. Ela aparece uma única vez, copie na hora.' },
  { n: '2', t: 'Cole a configuração', p: 'Cada assistente tem o seu formato. Os blocos prontos estão logo abaixo, é copiar e colar.' },
  { n: '3', t: 'Pergunte', p: '"Como está o mercado hoje?" e a resposta vem com o dado da Redentia, dentro da conversa.' },
]

/* Clipboard pode estar bloqueado (iframe, permissão negada) e o feedback não
   pode travar por isso; o timer se limpa no unmount. Padrão da /mcp. */
const copiado = ref<string | null>(null)
let copiaTimer: ReturnType<typeof setTimeout> | undefined
async function copiar(id: string, texto: string) {
  try { await navigator.clipboard?.writeText(texto) }
  catch { /* clipboard bloqueado */ }
  copiado.value = id
  clearTimeout(copiaTimer)
  copiaTimer = setTimeout(() => { copiado.value = null }, 1600)
}
onBeforeUnmount(() => clearTimeout(copiaTimer))
</script>

<template>
  <div>
    <!-- A. hero -->
    <section class="rbcm">
      <div class="rbcm__cols">
        <div class="rbcm__left">
          <span class="rbcm__eyebrow">Conectar</span>
          <h1 class="rbcm__h1">Da chave à primeira<br>pergunta.</h1>
          <p class="rbcm__sub">
            Você não troca de sistema. A chave do escritório entra no assistente que a
            casa já usa, e a Redentia passa a responder de dentro da conversa.
          </p>
          <NuxtLink to="/business/chaves" class="rbcm__cta">Pegar a chave do escritório</NuxtLink>
        </div>

        <div class="rbcm__right">
          <div class="rbcm__endpoint">
            <span class="rbcm__endpoint-l">Endpoint</span>
            <code class="rbcm__endpoint-url">{{ ENDPOINT }}</code>
            <dl class="rbcm__endpoint-meta">
              <div>
                <dt>Transporte</dt>
                <dd>Streamable HTTP</dd>
              </div>
              <div>
                <dt>Autenticação</dt>
                <dd><code>Bearer rdt_biz_…</code></dd>
              </div>
              <div>
                <dt>Acesso</dt>
                <dd>Somente leitura</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <!-- B. os três passos -->
    <section class="rbcm-band">
      <div class="rbcm-band__in">
        <h2 class="rbcm-band__title">Três passos, e o<br>escritório está dentro.</h2>
        <ol class="rbcm-band__steps">
          <li v-for="p in PASSOS" :key="p.n" class="rbcm-band__step">
            <span class="rbcm-band__n">{{ p.n }}</span>
            <div>
              <div class="rbcm-band__step-t">{{ p.t }}</div>
              <p class="rbcm-band__step-p">{{ p.p }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- C. as configurações, por assistente -->
    <section class="rbcm-conf">
      <div class="rbcm-conf__in">
        <h2 class="rbcm-conf__h2">Escolha o seu<br>assistente.</h2>
        <p class="rbcm-conf__lead">
          Onde aparecer <code class="rbcm-conf__inline">{{ KEY }}</code>, troque pela chave gerada em
          <NuxtLink to="/business/chaves" class="rbcm-conf__link">/business/chaves</NuxtLink>.
          Ela aparece uma vez só, então copie antes de sair da tela.
        </p>

        <div class="rbcm-conf__card">
          <div class="rbcm-conf__tabs" role="tablist" aria-label="Assistentes">
            <button
              v-for="t in TABS" :key="t.id" type="button" role="tab"
              class="rbcm-conf__tab" :class="{ 'rbcm-conf__tab--on': tab === t.id }"
              :aria-selected="tab === t.id" @click="tab = t.id"
            >
              {{ t.label }}<span v-if="t.soon" class="rbcm-conf__soon">em breve</span>
            </button>
          </div>

          <div v-show="tab === 'claude-code'" class="rbcm-conf__panel" role="tabpanel">
            <ol class="rbcm-conf__list">
              <li class="rbcm-conf__item">
                <span class="rbcm-conf__n">1</span>
                <div class="rbcm-conf__body">
                  <p class="rbcm-conf__p">Rode este comando no terminal, na máquina de quem vai usar.</p>
                  <div class="rbcm-conf__code-wrap">
                    <button type="button" class="rbcm-conf__copy" @click="copiar('claude-code', cfgClaudeCode)">
                      {{ copiado === 'claude-code' ? 'Copiado' : 'Copiar' }}
                    </button>
                    <pre class="rbcm-conf__code"><code>{{ cfgClaudeCode }}</code></pre>
                  </div>
                </div>
              </li>
              <li class="rbcm-conf__item">
                <span class="rbcm-conf__n">2</span>
                <div class="rbcm-conf__body">
                  <p class="rbcm-conf__p">Abra uma sessão nova. A que já estava aberta não enxerga o servidor que acabou de entrar.</p>
                </div>
              </li>
            </ol>
          </div>

          <div v-show="tab === 'cursor'" class="rbcm-conf__panel" role="tabpanel">
            <ol class="rbcm-conf__list">
              <li class="rbcm-conf__item">
                <span class="rbcm-conf__n">1</span>
                <div class="rbcm-conf__body">
                  <p class="rbcm-conf__p">
                    Abra <code class="rbcm-conf__inline">~/.cursor/mcp.json</code>, ou vá em
                    Settings, MCP, Add new MCP server.
                  </p>
                </div>
              </li>
              <li class="rbcm-conf__item">
                <span class="rbcm-conf__n">2</span>
                <div class="rbcm-conf__body">
                  <p class="rbcm-conf__p">Cole o bloco e salve.</p>
                  <div class="rbcm-conf__code-wrap">
                    <button type="button" class="rbcm-conf__copy" @click="copiar('cursor', cfgCursor)">
                      {{ copiado === 'cursor' ? 'Copiado' : 'Copiar' }}
                    </button>
                    <pre class="rbcm-conf__code"><code>{{ cfgCursor }}</code></pre>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <div v-show="tab === 'claude-desktop'" class="rbcm-conf__panel" role="tabpanel">
            <ol class="rbcm-conf__list">
              <li class="rbcm-conf__item">
                <span class="rbcm-conf__n">1</span>
                <div class="rbcm-conf__body">
                  <p class="rbcm-conf__p">Em Settings, Developer, Edit Config.</p>
                </div>
              </li>
              <li class="rbcm-conf__item">
                <span class="rbcm-conf__n">2</span>
                <div class="rbcm-conf__body">
                  <p class="rbcm-conf__p">
                    Cole o bloco. O Desktop conecta pela ponte
                    <code class="rbcm-conf__inline">mcp-remote</code>, por isso a configuração é maior.
                  </p>
                  <div class="rbcm-conf__code-wrap">
                    <button type="button" class="rbcm-conf__copy" @click="copiar('claude-desktop', cfgClaudeDesktop)">
                      {{ copiado === 'claude-desktop' ? 'Copiado' : 'Copiar' }}
                    </button>
                    <pre class="rbcm-conf__code"><code>{{ cfgClaudeDesktop }}</code></pre>
                  </div>
                  <p class="rbcm-conf__note">
                    O <code class="rbcm-conf__inline">Bearer</code> com o espaço fica na variável de
                    ambiente de propósito. Colado direto nos argumentos, o app corta o espaço e a
                    autenticação falha sem dizer o motivo.
                  </p>
                </div>
              </li>
              <li class="rbcm-conf__item">
                <span class="rbcm-conf__n">3</span>
                <div class="rbcm-conf__body">
                  <p class="rbcm-conf__p">Feche e abra o Claude Desktop. Ele só lê a configuração ao iniciar.</p>
                </div>
              </li>
            </ol>
          </div>

          <div v-show="tab === 'chatgpt'" class="rbcm-conf__panel" role="tabpanel">
            <p class="rbcm-conf__vazio">
              Ainda não dá. Conector personalizado no ChatGPT exige OAuth, e a chave do
              escritório é um token direto. O OAuth está no roteiro e não tem data.
            </p>
            <p class="rbcm-conf__note">
              Se a sua casa padronizou ChatGPT, a gente diz isso na primeira conversa, não
              depois de assinar. Claude Code, Cursor e Claude Desktop conectam hoje.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- D. o pack de skills: fecha o cold-start de quem acabou de conectar -->
    <section class="rbcm-skl">
      <div class="rbcm-skl__txt">
        <h2 class="rbcm-skl__t">Conectou? O pack de<br>skills vem pronto.</h2>
        <p class="rbcm-skl__p">
          Quatro skills que ensinam o Claude a usar o MCP direito: explicar por que um ativo
          se moveu com texto pronto pro cliente, analisar carteira, comparar ativos com custo
          e sobreposição de ETFs, e um guia de bordo das ferramentas. Baixa, sobe no Claude
          e a mesa inteira usa.
        </p>
      </div>
      <NuxtLink to="/business/skills" class="rbcm-skl__cta">Ver o pack de skills</NuxtLink>
    </section>

    <!-- E. o teste -->
    <section class="rbcm-fim">
      <h2 class="rbcm-fim__t">Conectou? Pergunte<br>isso.</h2>
      <p class="rbcm-fim__q">"Como está o mercado hoje?"</p>
      <p class="rbcm-fim__p">
        Se a resposta vier com dado da Redentia, está de pé. Se vier "chave MCP ausente ou
        inválida", a chave não chegou no cabeçalho: confira se ela foi colada inteira e se a
        conta do escritório está liberada.
      </p>
      <NuxtLink to="/business/chaves" class="rbcm-fim__cta">Voltar para as chaves</NuxtLink>
    </section>
  </div>
</template>

<style scoped>
/* ——— A. hero ——— */
.rbcm {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 88px);
  animation: nu-fade .5s ease both;
}
.rbcm__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; max-width: 1120px; }
.rbcm__left { flex: 1.2 1 460px; min-width: min(320px, 100%); }
.rbcm__right { flex: 1 1 400px; min-width: min(320px, 100%); max-width: 540px; }

.rbcm__eyebrow { display: block; color: var(--nu-blue); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }
.rbcm__h1 { margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(38px, 5vw, 62px); font-weight: 800; letter-spacing: -.04em; line-height: 1.02; }
.rbcm__sub { margin: 20px 0 0; max-width: 30rem; color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500; line-height: 1.6; }
.rbcm__cta {
  display: inline-flex; align-items: center; margin-top: 32px;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 16px 28px; font-size: 16.5px; font-weight: 700; transition: background .2s, transform .15s;
}
.rbcm__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }
.rbcm__cta:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }

/* o cartão de endpoint: é o que o técnico do escritório copia */
.rbcm__endpoint { background: var(--nu-white); border-radius: var(--nu-r-card); padding: 28px; box-shadow: var(--nu-shadow-card); }
.rbcm__endpoint-l { display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.4px; }
.rbcm__endpoint-url {
  display: block; margin-top: 12px;
  background: var(--nu-cream); border-radius: var(--nu-r-input); padding: 14px 16px;
  color: var(--nu-ink); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13.5px; line-height: 1.5; word-break: break-all;
}
.rbcm__endpoint-meta { margin: 20px 0 0; }
.rbcm__endpoint-meta > div { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid var(--nu-cream-2); }
.rbcm__endpoint-meta dt { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; flex-shrink: 0; }
.rbcm__endpoint-meta dd { margin: 0; color: var(--nu-ink); font-size: 14px; font-weight: 700; text-align: right; min-width: 0; }
.rbcm__endpoint-meta dd code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; word-break: break-all; }

/* ——— B. os três passos, em navy ——— */
.rbcm-band { background: var(--nu-navy); padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.rbcm-band__in { max-width: 1120px; }
.rbcm-band__title { margin: 0; color: var(--nu-cream-text); font-size: clamp(30px, 3.8vw, 48px); font-weight: 800; letter-spacing: -.035em; line-height: 1.04; }
.rbcm-band__steps {
  list-style: none; margin: clamp(34px, 4vw, 46px) 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: clamp(20px, 2.5vw, 30px);
}
.rbcm-band__step { display: flex; gap: 16px; align-items: flex-start; }
.rbcm-band__n {
  width: 34px; height: 34px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: var(--nu-blue); color: var(--nu-white); border-radius: 11px;
  font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.rbcm-band__step-t { color: var(--nu-cream-text); font-size: 19px; font-weight: 800; letter-spacing: -.02em; }
.rbcm-band__step-p { margin: 8px 0 0; color: var(--nu-cream-text-72); font-size: 15.5px; font-weight: 600; line-height: 1.55; }

/* ——— C. as configurações ——— */
.rbcm-conf { background: var(--nu-cream); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.rbcm-conf__in { max-width: 1120px; }
.rbcm-conf__h2 { margin: 0; color: var(--nu-ink); font-size: clamp(30px, 3.8vw, 48px); font-weight: 800; letter-spacing: -.035em; line-height: 1.04; }
.rbcm-conf__lead { margin: 16px 0 0; max-width: 44rem; color: var(--nu-gray-2); font-size: 16.5px; font-weight: 500; line-height: 1.6; }
.rbcm-conf__link { color: var(--nu-blue); font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
.rbcm-conf__link:hover { color: var(--nu-blue-hover); }
.rbcm-conf__inline {
  background: var(--nu-cream-2); color: var(--nu-ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .88em;
  padding: 2px 7px; border-radius: 7px; white-space: nowrap;
}

.rbcm-conf__card {
  background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-card);
  padding: clamp(20px, 2.6vw, 34px); margin-top: clamp(28px, 3.5vw, 40px); max-width: 980px;
}
.rbcm-conf__tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.rbcm-conf__tab {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px;
  background: var(--nu-cream); color: var(--nu-ink); border: 0; cursor: pointer;
  font-size: 14.5px; font-weight: 800; padding: 11px 18px; border-radius: var(--nu-r-pill);
  font-family: inherit; transition: background .15s, color .15s;
}
.rbcm-conf__tab:hover { background: var(--nu-cream-2); }
.rbcm-conf__tab--on { background: var(--nu-ink); color: var(--nu-white); }
.rbcm-conf__tab:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.rbcm-conf__soon {
  background: var(--nu-white); color: var(--nu-gray); font-size: 10px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase; padding: 3px 8px; border-radius: var(--nu-r-pill);
}
.rbcm-conf__tab--on .rbcm-conf__soon { background: var(--nu-cream-text-22); color: var(--nu-white); }

.rbcm-conf__panel { margin-top: 28px; }
.rbcm-conf__list { list-style: none; margin: 0; padding: 0; }
.rbcm-conf__item { display: flex; gap: 14px; padding: 18px 0; border-top: 1.5px solid var(--nu-cream-2); }
.rbcm-conf__item:first-child { border-top: 0; padding-top: 0; }
.rbcm-conf__n {
  width: 28px; height: 28px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: var(--nu-tile-blue-bg); color: var(--nu-blue); border-radius: 9px;
  font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.rbcm-conf__body { flex: 1; min-width: 0; }
.rbcm-conf__p { margin: 3px 0 0; color: var(--nu-ink); font-size: 15.5px; font-weight: 600; line-height: 1.6; }
.rbcm-conf__note { margin: 12px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.6; }
.rbcm-conf__vazio { margin: 0; color: var(--nu-ink); font-size: 15.5px; font-weight: 600; line-height: 1.6; max-width: 46rem; }

/* código em navy, com FAIXA PRÓPRIA pro Copiar: sobreposto, ele cobria a
   primeira linha, que é justamente onde mora o comando */
.rbcm-conf__code-wrap { position: relative; margin-top: 14px; padding-top: 44px; background: var(--nu-navy); border-radius: 16px; }
.rbcm-conf__code {
  margin: 0; padding: 0 22px 20px; color: var(--nu-blue-soft);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px; line-height: 1.65; white-space: pre; overflow-x: auto;
}
.rbcm-conf__copy {
  position: absolute; top: 8px; right: 10px; z-index: 1; min-height: 32px;
  background: var(--nu-cream-text-14); border: none; color: var(--nu-white);
  font-size: 12.5px; font-weight: 800; font-family: inherit;
  cursor: pointer; padding: 7px 13px; border-radius: 10px; transition: background .2s;
}
.rbcm-conf__copy:hover { background: var(--nu-cream-text-22); }
.rbcm-conf__copy:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }

/* ——— D. o teste ———
   AZUL e não navy: o RbFooter é navy, e uma banda navy encostada nele vira uma
   mancha escura só, sem fronteira. O azul dá o corte e ainda repete o par que
   a /business/chaves usa no fecho. */
.rbcm-skl {
  background: var(--nu-white); padding: clamp(56px, 7vw, 92px) clamp(22px, 5.5vw, 80px);
  display: flex; align-items: center; justify-content: space-between; gap: clamp(24px, 4vw, 56px);
  flex-wrap: wrap; animation: nu-fade .5s ease both;
}
.rbcm-skl__txt { max-width: 620px; }
.rbcm-skl__t { margin: 0; color: var(--nu-ink); font-size: clamp(26px, 3.2vw, 40px); font-weight: 800; letter-spacing: -.03em; line-height: 1.06; }
.rbcm-skl__p { margin: 16px 0 0; color: var(--nu-gray-2); font-size: 15.5px; font-weight: 600; line-height: 1.6; }
.rbcm-skl__cta {
  display: inline-flex; align-items: center; flex-shrink: 0;
  background: var(--nu-ink); color: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 16px 30px; font-size: 16px; font-weight: 800; transition: background .2s, transform .15s;
}
.rbcm-skl__cta:hover { background: var(--nu-ink-hover); color: var(--nu-white); transform: translateY(-1px); }
.rbcm-skl__cta:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 3px; }

.rbcm-fim { background: var(--nu-blue); padding: clamp(64px, 8vw, 104px) clamp(22px, 5.5vw, 80px); text-align: center; animation: nu-fade .5s ease both; }
.rbcm-fim__t { margin: 0; color: var(--nu-cream-text); font-size: clamp(30px, 4vw, 50px); font-weight: 800; letter-spacing: -.035em; line-height: 1.04; }
.rbcm-fim__q {
  margin: 26px auto 0; max-width: 24rem;
  background: var(--nu-blue-deep); border-radius: var(--nu-r-card); padding: 20px 26px;
  color: var(--nu-cream-text); font-size: clamp(17px, 2vw, 22px); font-weight: 700; line-height: 1.4;
}
.rbcm-fim__p { margin: 24px auto 0; max-width: 40rem; color: var(--nu-cream-text-72); font-size: 15.5px; font-weight: 600; line-height: 1.6; }
.rbcm-fim__cta {
  display: inline-flex; align-items: center; margin-top: 30px;
  background: var(--nu-cream); color: var(--nu-day-btn-ink); border-radius: var(--nu-r-pill);
  padding: 16px 30px; font-size: 16.5px; font-weight: 800; transition: background .2s, transform .15s;
}
.rbcm-fim__cta:hover { background: var(--nu-white); color: var(--nu-day-btn-ink); transform: translateY(-1px); }
.rbcm-fim__cta:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 3px; }
</style>
