<script setup lang="ts">
/**
 * Modal de conexão do escritório — substitui a página /business/comecar
 * (morta em 2026-08-25, decisão do dono: "menos é mais"). Abre sozinho
 * depois de gerar uma chave, e reabre pelos CTAs "Conectar ao assistente"
 * e pelo "Como conectar" do bloco do segredo.
 *
 * Dois passos: 1) conectar o assistente (tabs por assistente, com a CHAVE
 * REAL interpolada nas configs quando ela existe), 2) instalar as skills
 * (o pack é zip-de-zips: claude.ai instala um zip por vez).
 *
 * Shell FORKADO do padrão AcaoEtfXrayModal (Teleport + useModalA11y +
 * Escape + scroll-lock): o NuDayModal é prop-driven de texto e não carrega
 * tabs, código copiável e downloads. Tabs no padrão simples da casa
 * (mcp.vue, ex-comecar.vue): aria-selected sem roving-tabindex — corrigir
 * só aqui criaria a terceira implementação divergente; se um dia corrigir,
 * corrige nas três juntas.
 *
 * plainKey null = aberto por CTA sem chave nova: os blocos saem com o
 * placeholder rdt_biz_SUA_CHAVE e o aviso manda gerar primeiro. O bloco
 * copiável da PRÓPRIA CHAVE só existe com chave real — copiar o placeholder
 * pro claude.ai é erro garantido.
 *
 * ChatGPT SEM ressalva de homologação (decisão do dono 2026-08-25: ele
 * mesmo testa o fluxo; o callback do ChatGPT entrou no allowlist do OAuth
 * no mesmo dia).
 *
 * ⚠️ Gotcha do Claude Desktop preservado do ex-comecar: o "Bearer " com
 * espaço vive na env var porque o app corta espaço inline nos args do npx
 * e a autenticação falha sem dizer o motivo.
 */
const props = defineProps<{
  open: boolean
  plainKey: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'gerar'): void // sem chave: a página fecha o modal e foca o gerador
}>()

const ENDPOINT = 'https://redentia-api.saraivada.com/mcp'
const temChave = computed(() => props.plainKey !== null)
const chave = computed(() => props.plainKey ?? 'rdt_biz_SUA_CHAVE')

const cfgClaudeCode = computed(() => `claude mcp add --transport http redentia ${ENDPOINT} \\
  --header "Authorization: Bearer ${chave.value}"`)

const cfgCursor = computed(() => `{
  "mcpServers": {
    "redentia": {
      "url": "${ENDPOINT}",
      "headers": {
        "Authorization": "Bearer ${chave.value}"
      }
    }
  }
}`)

const cfgClaudeDesktop = computed(() => `{
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
      "env": { "AUTH_HEADER": "Bearer ${chave.value}" }
    }
  }
}`)

type TabId = 'claude-ai' | 'chatgpt' | 'cursor' | 'claude-code' | 'claude-desktop'
const TABS: { id: TabId, label: string }[] = [
  { id: 'claude-ai', label: 'claude.ai' },
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'claude-desktop', label: 'Claude Desktop' },
]
const tab = ref<TabId>('claude-ai')
const passo = ref<1 | 2>(1)

const SKILLS = [
  { slug: 'redentia-por-que-moveu', nome: 'Por que meu ativo subiu ou caiu' },
  { slug: 'redentia-carteira', nome: 'Análise da carteira' },
  { slug: 'redentia-comparar-ativos', nome: 'Comparar ativos' },
  { slug: 'redentia-onboarding', nome: 'Primeiros passos' },
]

/* copiar por id (padrão do ex-comecar): clipboard pode estar bloqueado e o
   feedback não pode travar por isso; o timer se limpa no unmount. */
const copiado = ref<string | null>(null)
let copiaTimer: ReturnType<typeof setTimeout> | undefined
async function copiar(id: string, texto: string) {
  try { await navigator.clipboard?.writeText(texto) }
  catch { /* clipboard bloqueado */ }
  copiado.value = id
  clearTimeout(copiaTimer)
  copiaTimer = setTimeout(() => { copiado.value = null }, 1600)
}

const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, toRef(props, 'open'))
const titleId = useId()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.open, (open) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = open ? 'hidden' : ''
  if (open) {
    passo.value = 1
    tab.value = 'claude-ai'
    copiado.value = null
    document.addEventListener('keydown', onKey)
    nextTick(() => cardRef.value?.focus())
  } else {
    document.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
  clearTimeout(copiaTimer)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="rbcx" @click="emit('close')">
      <div ref="cardRef" class="rbcx__card" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1" @click.stop>
        <div class="rbcx__head">
          <div>
            <div class="rbcx__eyebrow">Conectar · Redentia For Business</div>
            <h4 :id="titleId" class="rbcx__title">
              {{ passo === 1 ? 'Conecte o assistente.' : 'Instale as skills.' }}
            </h4>
          </div>
          <button type="button" class="rbcx__close" aria-label="Fechar" @click="emit('close')">✕</button>
        </div>

        <div class="rbcx__steps">
          <button type="button" class="rbcx__step" :class="{ 'rbcx__step--on': passo === 1 }" @click="passo = 1">
            <span class="rbcx__step-n">1</span>Conectar
          </button>
          <button type="button" class="rbcx__step" :class="{ 'rbcx__step--on': passo === 2 }" @click="passo = 2">
            <span class="rbcx__step-n">2</span>Skills
          </button>
        </div>

        <!-- ——— PASSO 1: conectar ——— -->
        <div v-show="passo === 1" class="rbcx__body">
          <div v-if="!temChave" class="rbcx__aviso" role="status">
            <p class="rbcx__aviso-p">
              Os blocos abaixo estão com <code class="rbcx__inline">rdt_biz_SUA_CHAVE</code> no lugar
              da chave. Gere uma chave primeiro — ela aparece uma única vez — e este passo a passo
              abre de novo já preenchido.
            </p>
            <button type="button" class="rbcx__aviso-btn" @click="emit('gerar')">Gerar a chave</button>
          </div>

          <div class="rbcx__tabs" role="tablist" aria-label="Assistentes">
            <button
              v-for="t in TABS" :key="t.id" type="button" role="tab"
              class="rbcx__tab" :class="{ 'rbcx__tab--on': tab === t.id }"
              :aria-selected="tab === t.id" @click="tab = t.id"
            >{{ t.label }}</button>
          </div>

          <!-- claude.ai -->
          <div v-show="tab === 'claude-ai'" class="rbcx__panel" role="tabpanel">
            <ol class="rbcx__list">
              <li class="rbcx__item">
                <span class="rbcx__n">1</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">
                    Abra <a href="https://claude.ai/settings/connectors" target="_blank" rel="noopener" class="rbcx__link">claude.ai/settings/connectors</a>
                    e clique em <strong>Add custom connector</strong>.
                  </p>
                </div>
              </li>
              <li class="rbcx__item">
                <span class="rbcx__n">2</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">No <strong>Name</strong>, digite <code class="rbcx__inline">Redentia</code>. Na <strong>URL</strong>, cole:</p>
                  <div class="rbcx__code-wrap">
                    <button type="button" class="rbcx__copy" @click="copiar('url', ENDPOINT)">{{ copiado === 'url' ? 'Copiado' : 'Copiar' }}</button>
                    <pre class="rbcx__code"><code>{{ ENDPOINT }}</code></pre>
                  </div>
                  <p class="rbcx__p">Conclua com <strong>Add</strong> e clique em <strong>Connect</strong>.</p>
                </div>
              </li>
              <li class="rbcx__item">
                <span class="rbcx__n">3</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">A página de autorização da Redentia abre. Cole a chave e clique em <strong>Autorizar</strong>.</p>
                  <div v-if="temChave" class="rbcx__code-wrap">
                    <button type="button" class="rbcx__copy" @click="copiar('chave', chave)">{{ copiado === 'chave' ? 'Copiada' : 'Copiar' }}</button>
                    <pre class="rbcx__code rbcx__code--wrap"><code>{{ chave }}</code></pre>
                  </div>
                  <p v-else class="rbcx__note">A chave entra aqui quando você gerar uma — este bloco vem preenchido.</p>
                </div>
              </li>
            </ol>
          </div>

          <!-- ChatGPT -->
          <div v-show="tab === 'chatgpt'" class="rbcx__panel" role="tabpanel">
            <ol class="rbcx__list">
              <li class="rbcx__item">
                <span class="rbcx__n">1</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">
                    Em <strong>Settings → Apps &amp; Connectors → Advanced settings</strong>, ligue o
                    <strong>Developer mode</strong>. Precisa de plano pago da OpenAI.
                  </p>
                </div>
              </li>
              <li class="rbcx__item">
                <span class="rbcx__n">2</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">Clique em <strong>Create</strong>, nomeie <code class="rbcx__inline">Redentia</code> e cole a URL:</p>
                  <div class="rbcx__code-wrap">
                    <button type="button" class="rbcx__copy" @click="copiar('url-gpt', ENDPOINT)">{{ copiado === 'url-gpt' ? 'Copiado' : 'Copiar' }}</button>
                    <pre class="rbcx__code"><code>{{ ENDPOINT }}</code></pre>
                  </div>
                  <p class="rbcx__p">Em <strong>Authentication</strong>, escolha <strong>OAuth</strong> e salve.</p>
                </div>
              </li>
              <li class="rbcx__item">
                <span class="rbcx__n">3</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">Na autorização, a página da Redentia abre: cole a chave e clique em <strong>Autorizar</strong>.</p>
                  <div v-if="temChave" class="rbcx__code-wrap">
                    <button type="button" class="rbcx__copy" @click="copiar('chave-gpt', chave)">{{ copiado === 'chave-gpt' ? 'Copiada' : 'Copiar' }}</button>
                    <pre class="rbcx__code rbcx__code--wrap"><code>{{ chave }}</code></pre>
                  </div>
                  <p v-else class="rbcx__note">A chave entra aqui quando você gerar uma — este bloco vem preenchido.</p>
                </div>
              </li>
            </ol>
          </div>

          <!-- Cursor (portado do ex-comecar) -->
          <div v-show="tab === 'cursor'" class="rbcx__panel" role="tabpanel">
            <ol class="rbcx__list">
              <li class="rbcx__item">
                <span class="rbcx__n">1</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">
                    Abra <code class="rbcx__inline">~/.cursor/mcp.json</code>, ou vá em
                    Settings, MCP, Add new MCP server.
                  </p>
                </div>
              </li>
              <li class="rbcx__item">
                <span class="rbcx__n">2</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">Cole o bloco e salve.</p>
                  <div class="rbcx__code-wrap">
                    <button type="button" class="rbcx__copy" @click="copiar('cursor', cfgCursor)">{{ copiado === 'cursor' ? 'Copiado' : 'Copiar' }}</button>
                    <pre class="rbcx__code"><code>{{ cfgCursor }}</code></pre>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <!-- Claude Code (portado do ex-comecar) -->
          <div v-show="tab === 'claude-code'" class="rbcx__panel" role="tabpanel">
            <ol class="rbcx__list">
              <li class="rbcx__item">
                <span class="rbcx__n">1</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">Rode este comando no terminal, na máquina de quem vai usar.</p>
                  <div class="rbcx__code-wrap">
                    <button type="button" class="rbcx__copy" @click="copiar('claude-code', cfgClaudeCode)">{{ copiado === 'claude-code' ? 'Copiado' : 'Copiar' }}</button>
                    <pre class="rbcx__code"><code>{{ cfgClaudeCode }}</code></pre>
                  </div>
                </div>
              </li>
              <li class="rbcx__item">
                <span class="rbcx__n">2</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">Abra uma sessão nova. A que já estava aberta não enxerga o servidor que acabou de entrar.</p>
                </div>
              </li>
            </ol>
          </div>

          <!-- Claude Desktop (portado do ex-comecar, gotcha incluso) -->
          <div v-show="tab === 'claude-desktop'" class="rbcx__panel" role="tabpanel">
            <ol class="rbcx__list">
              <li class="rbcx__item">
                <span class="rbcx__n">1</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">Em Settings, Developer, Edit Config.</p>
                </div>
              </li>
              <li class="rbcx__item">
                <span class="rbcx__n">2</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">
                    Cole o bloco. O Desktop conecta pela ponte
                    <code class="rbcx__inline">mcp-remote</code>, por isso a configuração é maior.
                  </p>
                  <div class="rbcx__code-wrap">
                    <button type="button" class="rbcx__copy" @click="copiar('claude-desktop', cfgClaudeDesktop)">{{ copiado === 'claude-desktop' ? 'Copiado' : 'Copiar' }}</button>
                    <pre class="rbcx__code"><code>{{ cfgClaudeDesktop }}</code></pre>
                  </div>
                  <p class="rbcx__note">
                    O <code class="rbcx__inline">Bearer</code> com o espaço fica na variável de
                    ambiente de propósito. Colado direto nos argumentos, o app corta o espaço e a
                    autenticação falha sem dizer o motivo.
                  </p>
                </div>
              </li>
              <li class="rbcx__item">
                <span class="rbcx__n">3</span>
                <div class="rbcx__item-body">
                  <p class="rbcx__p">Feche e abra o Claude Desktop. Ele só lê a configuração ao iniciar.</p>
                </div>
              </li>
            </ol>
          </div>

          <p class="rbcx__teste">
            Teste: pergunte <strong>"Como está o mercado hoje?"</strong> — se a resposta vier com
            dado da Redentia, está de pé. Se vier "chave ausente ou inválida", a chave não chegou inteira.
          </p>
        </div>

        <!-- ——— PASSO 2: skills ——— -->
        <div v-show="passo === 2" class="rbcx__body">
          <p class="rbcx__lead">
            Quatro skills que ensinam o Claude a usar o MCP direito — texto pronto pro cliente,
            análise de carteira, comparação com custo e sobreposição, e o guia de bordo.
          </p>
          <a href="/downloads/skills/redentia-skills-pack.zip" download class="rbcx__skl-cta">
            Baixar o pack completo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M6.5 10.5L12 16l5.5-5.5M4.5 20h15" /></svg>
          </a>
          <p class="rbcx__note">
            O pack traz um zip por skill, prontos pro claude.ai — em Configurações, procure por
            Skills (em geral dentro de Capacidades) e envie um zip por vez. No Claude Code,
            descompacte cada zip numa pasta dentro de <code class="rbcx__inline">.claude/skills/</code>.
            O LEIA-ME dentro do pack repete o passo a passo.
          </p>
          <ul class="rbcx__skl-list">
            <li v-for="s in SKILLS" :key="s.slug" class="rbcx__skl-row">
              <span class="rbcx__skl-nome">{{ s.nome }}</span>
              <a :href="`/downloads/skills/${s.slug}.zip`" download class="rbcx__skl-dl">Baixar</a>
            </li>
          </ul>
          <NuxtLink to="/business/skills" class="rbcx__skl-link" @click="emit('close')">Ver as skills em detalhe</NuxtLink>
        </div>

        <div class="rbcx__foot">
          <button v-if="passo === 2" type="button" class="rbcx__btn rbcx__btn--ghost" @click="passo = 1">Voltar</button>
          <button v-if="passo === 1" type="button" class="rbcx__btn" @click="passo = 2">Continuar: as skills</button>
          <button v-else type="button" class="rbcx__btn" @click="emit('close')">Concluir</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.rbcx {
  position: fixed; inset: 0; z-index: 9999; background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 32px;
  animation: rbcxfade .18s ease;
}
.rbcx__card {
  width: min(760px, 94vw); max-height: 88vh; overflow: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 40px 42px 38px; box-shadow: var(--nu-shadow-day-modal);
  animation: rbcxrise .24s cubic-bezier(.2, .8, .2, 1);
}
.rbcx__card:focus { outline: none; }
@keyframes rbcxfade { from { opacity: 0; } }
@keyframes rbcxrise { from { opacity: 0; transform: translateY(14px) scale(.98); } }

.rbcx__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.rbcx__eyebrow { color: var(--nu-blue); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.6px; }
.rbcx__title { margin: 8px 0 0; color: var(--nu-ink); font-size: 28px; font-weight: 800; letter-spacing: -0.03em; }
.rbcx__close {
  flex-shrink: 0; width: 40px; height: 40px; border: 0; border-radius: 50%; cursor: pointer;
  background: var(--nu-day-close); color: var(--nu-gray-2); font-size: 15px;
  display: grid; place-items: center; transition: background .2s;
}
.rbcx__close:hover { background: var(--nu-cream-2); }
.rbcx__close:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbcx__steps { display: flex; gap: 8px; margin-top: 22px; }
.rbcx__step {
  display: inline-flex; align-items: center; gap: 9px; min-height: 44px; padding: 0 18px;
  border: 0; border-radius: var(--nu-r-pill); cursor: pointer; font-family: inherit;
  background: var(--nu-cream); color: var(--nu-gray-2); font-size: 14.5px; font-weight: 800;
  transition: background .2s, color .2s;
}
.rbcx__step:hover { background: var(--nu-cream-2); }
.rbcx__step--on { background: var(--nu-ink); color: var(--nu-white); }
.rbcx__step--on:hover { background: var(--nu-ink); }
.rbcx__step:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.rbcx__step-n {
  width: 22px; height: 22px; border-radius: 8px; display: grid; place-items: center;
  background: var(--nu-tile-blue-bg); color: var(--nu-blue);
  font-size: 12.5px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.rbcx__step--on .rbcx__step-n { background: var(--nu-cream-text-22); color: var(--nu-white); }

.rbcx__body { margin-top: 4px; }

.rbcx__aviso {
  margin-top: 18px; padding: 14px 18px; border-radius: 14px;
  background: var(--nu-amber-bg);
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.rbcx__aviso-p { margin: 0; flex: 1 1 300px; color: var(--nu-amber-text); font-size: 13.5px; font-weight: 600; line-height: 1.55; }
.rbcx__aviso-btn {
  border: 0; border-radius: var(--nu-r-pill); cursor: pointer; font-family: inherit;
  min-height: 44px; padding: 0 20px; background: var(--nu-ink); color: var(--nu-white);
  font-size: 14px; font-weight: 800; transition: background .2s;
}
.rbcx__aviso-btn:hover { background: var(--nu-ink-hover); }
.rbcx__aviso-btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* tabs: receita do ex-comecar (rbcm-conf__tabs) */
.rbcx__tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 22px; }
.rbcx__tab {
  min-height: 44px; padding: 0 16px; border: 0; border-radius: var(--nu-r-pill);
  cursor: pointer; font-family: inherit;
  background: var(--nu-cream); color: var(--nu-gray-2); font-size: 14px; font-weight: 800;
  transition: background .2s, color .2s;
}
.rbcx__tab:hover { background: var(--nu-cream-2); }
.rbcx__tab--on { background: var(--nu-ink); color: var(--nu-white); }
.rbcx__tab--on:hover { background: var(--nu-ink); }
.rbcx__tab:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbcx__panel { margin-top: 8px; }
.rbcx__list { margin: 0; padding: 0; list-style: none; }
.rbcx__item { display: flex; gap: 16px; padding: 18px 0; border-top: 1.5px solid var(--nu-cream-2); }
.rbcx__item:first-child { border-top: 0; }
.rbcx__n {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 9px;
  display: grid; place-items: center;
  background: var(--nu-tile-blue-bg); color: var(--nu-blue);
  font-size: 13.5px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.rbcx__item-body { flex: 1; min-width: 0; }
.rbcx__p { margin: 3px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.rbcx__p strong { color: var(--nu-ink); font-weight: 800; }
.rbcx__note { margin: 12px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: 600; line-height: 1.55; }
.rbcx__inline {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: .92em; color: var(--nu-blue-deep); background: var(--nu-cream); padding: 1px 6px; border-radius: 5px;
}
.rbcx__link { color: var(--nu-blue-deep); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.rbcx__link:hover { color: var(--nu-blue-hover); }
.rbcx__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* bloco de código: a faixa de 44px é o que impede o Copiar de cobrir a
   primeira linha (herança do ex-comecar, que herdou da /mcp) */
.rbcx__code-wrap { position: relative; margin-top: 12px; padding-top: 44px; background: var(--nu-navy); border-radius: 16px; }
.rbcx__code {
  margin: 0; padding: 0 22px 18px; overflow-x: auto;
  color: var(--nu-blue-soft); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px; line-height: 1.65; white-space: pre;
}
.rbcx__code--wrap { white-space: pre-wrap; word-break: break-all; }
.rbcx__copy {
  position: absolute; top: 8px; right: 10px; border: 0; border-radius: var(--nu-r-pill);
  cursor: pointer; font-family: inherit;
  padding: 7px 16px; background: var(--nu-cream-text-14); color: var(--nu-cream-text);
  font-size: 12.5px; font-weight: 800; transition: background .2s;
}
.rbcx__copy:hover { background: var(--nu-cream-text-22); }
.rbcx__copy:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }

.rbcx__teste {
  margin: 20px 0 0; padding-top: 16px; border-top: 1px solid var(--nu-day-divider);
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.6;
}
.rbcx__teste strong { color: var(--nu-ink); font-weight: 800; }

/* passo 2 */
.rbcx__lead { margin: 18px 0 0; color: var(--nu-ink); font-size: 15.5px; font-weight: 600; line-height: 1.6; }
.rbcx__skl-cta {
  display: inline-flex; align-items: center; gap: 8px; margin-top: 18px; min-height: 44px; padding: 0 24px;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  font-size: 15px; font-weight: 800; transition: background .2s;
}
.rbcx__skl-cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbcx__skl-cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.rbcx__skl-list { margin: 18px 0 0; padding: 0; list-style: none; }
.rbcx__skl-row {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 13px 0; border-top: 1px solid var(--nu-day-divider);
}
.rbcx__skl-nome { color: var(--nu-ink); font-size: 15px; font-weight: 700; }
.rbcx__skl-dl {
  flex-shrink: 0; display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px;
  background: var(--nu-cream); color: var(--nu-ink); border-radius: var(--nu-r-pill);
  font-size: 13.5px; font-weight: 800; transition: background .2s;
}
.rbcx__skl-dl:hover { background: var(--nu-cream-2); color: var(--nu-ink); }
.rbcx__skl-dl:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.rbcx__skl-link {
  display: inline-block; margin-top: 16px; color: var(--nu-blue-deep);
  font-size: 14px; font-weight: 800; text-decoration: underline; text-underline-offset: 3px;
}
.rbcx__skl-link:hover { color: var(--nu-blue-hover); }
.rbcx__skl-link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbcx__foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 26px; }
.rbcx__btn {
  border: 0; border-radius: var(--nu-r-pill); cursor: pointer; font-family: inherit;
  min-height: 44px; padding: 0 24px; background: var(--nu-ink); color: var(--nu-white);
  font-size: 14.5px; font-weight: 800; transition: background .2s;
}
.rbcx__btn:hover { background: var(--nu-ink-hover); }
.rbcx__btn--ghost { background: var(--nu-cream); color: var(--nu-ink); }
.rbcx__btn--ghost:hover { background: var(--nu-cream-2); }
.rbcx__btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

@media (max-width: 760px) {
  .rbcx { padding: 16px; }
  .rbcx__card { padding: 28px 22px 26px; }
  .rbcx__title { font-size: 24px; }
  .rbcx__foot { justify-content: stretch; }
  .rbcx__btn { flex: 1; }
}
</style>
