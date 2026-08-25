<script setup lang="ts">
/**
 * Wizard de conexão do escritório — substitui a página /business/comecar.
 *
 * FORMATO WIZARD (direção do dono 2026-08-25: "passos simples e em formato
 * de wizard steps", e "de opção apenas claude e chatgpt, tire o resto"):
 * uma pergunta por tela, um artefato por tela, botão grande. Cinco telas:
 *
 *   1. Escolha o assistente (Claude ou ChatGPT — clicar já avança)
 *   2. Preparar (Claude: abrir os conectores · ChatGPT: ligar o dev mode)
 *   3. Criar o conector (nome + URL copiável)
 *   4. Autorizar (a CHAVE REAL copiável; sem chave, aviso + "Gerar a chave")
 *   5. Testar + instalar as skills (pack zip-de-zips) — Concluir
 *
 * Cursor/Claude Code/Claude Desktop saíram do modal por decisão do dono;
 * as instruções deles continuam vivas na /mcp (B2C).
 *
 * Shell forkado do padrão AcaoEtfXrayModal (Teleport + useModalA11y +
 * Escape + scroll-lock). plainKey null = aberto por CTA sem chave nova.
 */
const props = withDefaults(defineProps<{
  open: boolean
  plainKey: string | null
  /** 'business' = painel de chaves (aviso emite 'gerar'); 'mcp' = página
   *  B2C, onde a chave pessoal vive em /conta e o aviso vira link pra lá. */
  origem?: 'business' | 'mcp'
}>(), { origem: 'business' })

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'gerar'): void // sem chave: a página fecha o modal e foca o gerador
}>()

const ENDPOINT = 'https://redentia-api.saraivada.com/mcp'
const temChave = computed(() => props.plainKey !== null)

type Assistente = 'claude' | 'chatgpt'
const assistente = ref<Assistente | null>(null)
/** 0 = escolha; 1..4 = prep, url, chave, fim */
const idx = ref(0)
const TOTAL = 5

const NOME: Record<Assistente, string> = { claude: 'Claude', chatgpt: 'ChatGPT' }

const TITULOS: Record<string, string> = {
  escolha: 'Onde a sua mesa pergunta?',
  'prep-claude': 'Abra os conectores.',
  'prep-chatgpt': 'Ligue o modo desenvolvedor.',
  url: 'Crie o conector.',
  chave: 'Autorize com a chave.',
  fim: 'Pronto. Agora as skills.',
}
const telaId = computed(() => {
  if (idx.value === 0) return 'escolha'
  const passo = ['prep', 'url', 'chave', 'fim'][idx.value - 1]
  return passo === 'prep' ? `prep-${assistente.value}` : passo!
})
const titulo = computed(() => TITULOS[telaId.value] ?? '')

function escolher(a: Assistente) {
  assistente.value = a
  idx.value = 1
}
function voltar() {
  if (idx.value <= 1) { idx.value = 0; assistente.value = null; return }
  idx.value--
}
function avancar() {
  if (idx.value >= TOTAL - 1) { emit('close'); return }
  idx.value++
}

/* copiar com feedback; clipboard pode estar bloqueado e o timer se limpa */
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
    assistente.value = null
    idx.value = 0
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
          <span class="rbcx__eyebrow">
            {{ assistente ? `Conectar · ${NOME[assistente]}` : 'Conectar · Redentia For Business' }}
          </span>
          <button type="button" class="rbcx__close" aria-label="Fechar" @click="emit('close')">✕</button>
        </div>

        <!-- progresso: contador + barras, o mesmo idioma dos passadores do hero -->
        <div class="rbcx__prog" aria-hidden="true">
          <span v-for="n in TOTAL" :key="n" class="rbcx__prog-bar" :class="{ 'rbcx__prog-bar--on': n <= idx + 1 }" />
        </div>
        <p class="rbcx__prog-txt">Passo {{ idx + 1 }} de {{ TOTAL }}</p>

        <h4 :id="titleId" class="rbcx__title">{{ titulo }}</h4>

        <!-- ——— 1 · escolha ——— -->
        <div v-if="telaId === 'escolha'" class="rbcx__body">
          <p class="rbcx__dek">O passo a passo muda conforme o assistente. Dá pra conectar os dois, um de cada vez.</p>
          <div class="rbcx__opcoes">
            <button type="button" class="rbcx__opcao" @click="escolher('claude')">
              <span class="rbcx__opcao-nome">Claude</span>
              <span class="rbcx__opcao-hint">claude.ai, no navegador ou no app</span>
              <span class="rbcx__opcao-seta" aria-hidden="true">→</span>
            </button>
            <button type="button" class="rbcx__opcao" @click="escolher('chatgpt')">
              <span class="rbcx__opcao-nome">ChatGPT</span>
              <span class="rbcx__opcao-hint">pelo modo desenvolvedor, em plano pago</span>
              <span class="rbcx__opcao-seta" aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <!-- ——— 2 · preparar ——— -->
        <div v-else-if="telaId === 'prep-claude'" class="rbcx__body">
          <p class="rbcx__dek">
            Abra as configurações de conectores do Claude e clique em
            <strong>Add custom connector</strong>.
          </p>
          <a href="https://claude.ai/settings/connectors" target="_blank" rel="noopener" class="rbcx__acao">
            Abrir claude.ai/settings/connectors
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
          </a>
          <p class="rbcx__nota">O botão fica no fim da lista de conectores.</p>
        </div>

        <div v-else-if="telaId === 'prep-chatgpt'" class="rbcx__body">
          <p class="rbcx__dek">
            No ChatGPT, vá em <strong>Settings → Apps &amp; Connectors → Advanced settings</strong>
            e ligue o <strong>Developer mode</strong>.
          </p>
          <p class="rbcx__nota">Precisa de plano pago da OpenAI. O interruptor fica no fim da tela de Advanced.</p>
        </div>

        <!-- ——— 3 · criar o conector ——— -->
        <div v-else-if="telaId === 'url'" class="rbcx__body">
          <p v-if="assistente === 'claude'" class="rbcx__dek">
            No <strong>Name</strong>, digite <code class="rbcx__inline">Redentia</code>.
            Na <strong>URL</strong>, cole o endereço abaixo. Conclua com <strong>Add</strong>
            e clique em <strong>Connect</strong>.
          </p>
          <p v-else class="rbcx__dek">
            Clique em <strong>Create</strong>, nomeie <code class="rbcx__inline">Redentia</code>,
            cole a URL abaixo e escolha <strong>OAuth</strong> na autenticação.
          </p>
          <div class="rbcx__code-wrap">
            <button type="button" class="rbcx__copy" @click="copiar('url', ENDPOINT)">{{ copiado === 'url' ? 'Copiado' : 'Copiar' }}</button>
            <pre class="rbcx__code"><code>{{ ENDPOINT }}</code></pre>
          </div>
        </div>

        <!-- ——— 4 · autorizar ——— -->
        <div v-else-if="telaId === 'chave'" class="rbcx__body">
          <p class="rbcx__dek">
            A página de autorização da Redentia abre sozinha. Cole a chave e clique em
            <strong>Autorizar</strong>.
          </p>
          <template v-if="temChave">
            <div class="rbcx__code-wrap">
              <button type="button" class="rbcx__copy" @click="copiar('chave', plainKey!)">{{ copiado === 'chave' ? 'Copiada' : 'Copiar' }}</button>
              <pre class="rbcx__code rbcx__code--wrap"><code>{{ plainKey }}</code></pre>
            </div>
            <p class="rbcx__nota">Ela não aparece de novo depois que você sair do painel. Se perder, revogue e gere outra.</p>
          </template>
          <div v-else-if="origem === 'business'" class="rbcx__aviso" role="status">
            <p class="rbcx__aviso-p">
              Você ainda não tem uma chave nova em mãos. Gere uma — ela aparece uma única vez —
              e este passo volta preenchido, pronto pra copiar.
            </p>
            <button type="button" class="rbcx__aviso-btn" @click="emit('gerar')">Gerar a chave</button>
          </div>
          <div v-else class="rbcx__aviso" role="status">
            <p class="rbcx__aviso-p">
              A sua chave pessoal (rdt_mcp_…) fica em Configurações, seção MCP. Copie de lá e
              cole na página de autorização.
            </p>
            <NuxtLink to="/conta" class="rbcx__aviso-btn" @click="emit('close')">Abrir Configurações</NuxtLink>
          </div>
        </div>

        <!-- ——— 5 · testar + skills ——— -->
        <div v-else class="rbcx__body">
          <p class="rbcx__dek">
            Teste num chat novo: <strong>"Como está o mercado hoje?"</strong> — se a resposta vier
            com dado da Redentia, está de pé. E as skills ensinam o assistente a usar o MCP direito.
          </p>
          <a href="/downloads/skills/redentia-skills-pack.zip" download class="rbcx__acao">
            Baixar o pack de skills
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M6.5 10.5L12 16l5.5-5.5M4.5 20h15" /></svg>
          </a>
          <p class="rbcx__nota">
            Dentro vêm quatro zips, um por skill — no claude.ai, envie um zip por vez em
            Configurações → Skills. O LEIA-ME do pack repete o passo a passo.
            <NuxtLink v-if="origem === 'business'" to="/business/skills" class="rbcx__link" @click="emit('close')">Ver as skills em detalhe</NuxtLink>
          </p>
        </div>

        <div v-if="telaId !== 'escolha'" class="rbcx__foot">
          <button type="button" class="rbcx__btn rbcx__btn--ghost" @click="voltar">Voltar</button>
          <button type="button" class="rbcx__btn" @click="avancar">
            {{ idx >= TOTAL - 1 ? 'Concluir' : 'Continuar' }}
          </button>
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
  width: min(600px, 94vw); max-height: 88vh; overflow: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 36px 40px 34px; box-shadow: var(--nu-shadow-day-modal);
  animation: rbcxrise .24s cubic-bezier(.2, .8, .2, 1);
}
.rbcx__card:focus { outline: none; }
@keyframes rbcxfade { from { opacity: 0; } }
@keyframes rbcxrise { from { opacity: 0; transform: translateY(14px) scale(.98); } }

.rbcx__head { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.rbcx__eyebrow { color: var(--nu-blue); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.6px; }
.rbcx__close {
  flex-shrink: 0; width: 40px; height: 40px; border: 0; border-radius: 50%; cursor: pointer;
  background: var(--nu-day-close); color: var(--nu-gray-2); font-size: 15px;
  display: grid; place-items: center; transition: background .2s;
}
.rbcx__close:hover { background: var(--nu-cream-2); }
.rbcx__close:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* progresso: barras finas, o idioma dos passadores do hero da /business */
.rbcx__prog { display: flex; gap: 5px; margin-top: 22px; }
.rbcx__prog-bar { flex: 1; height: 4px; border-radius: 2px; background: var(--nu-cream-2); transition: background .3s; }
.rbcx__prog-bar--on { background: var(--nu-blue-deep); }
.rbcx__prog-txt {
  margin: 10px 0 0; color: var(--nu-gray); font-size: 12px; font-weight: 800;
  font-variant-numeric: tabular-nums; text-transform: uppercase; letter-spacing: 1px;
}

.rbcx__title { margin: 8px 0 0; color: var(--nu-ink); font-size: 26px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; }

.rbcx__body { margin-top: 14px; }
.rbcx__dek { margin: 0; color: var(--nu-gray-2); font-size: 15.5px; font-weight: 500; line-height: 1.65; }
.rbcx__dek strong { color: var(--nu-ink); font-weight: 800; }
.rbcx__nota { margin: 14px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: 600; line-height: 1.6; }
.rbcx__inline {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: .92em; color: var(--nu-blue-deep); background: var(--nu-cream); padding: 1px 6px; border-radius: 5px;
}
.rbcx__link { color: var(--nu-blue-deep); font-weight: 800; text-decoration: underline; text-underline-offset: 3px; }
.rbcx__link:hover { color: var(--nu-blue-hover); }
.rbcx__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* ——— escolha: dois cards grandes, clicar avança ——— */
.rbcx__opcoes { margin-top: 20px; display: grid; gap: 12px; }
.rbcx__opcao {
  display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto;
  align-items: center; column-gap: 14px; text-align: left;
  padding: 20px 22px; border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-tile);
  background: var(--nu-white); cursor: pointer; font-family: inherit;
  transition: border-color .2s, background .2s, transform .18s;
}
.rbcx__opcao:hover { border-color: var(--nu-blue); background: var(--nu-cream); transform: translateY(-2px); }
.rbcx__opcao:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.rbcx__opcao-nome { grid-column: 1; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
.rbcx__opcao-hint { grid-column: 1; margin-top: 3px; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.rbcx__opcao-seta { grid-column: 2; grid-row: 1 / span 2; color: var(--nu-blue-deep); font-size: 20px; font-weight: 800; }

/* ——— o artefato de ação (link externo / download): pílula azul grande ——— */
.rbcx__acao {
  display: inline-flex; align-items: center; gap: 9px; margin-top: 18px;
  min-height: 48px; padding: 0 26px;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  font-size: 15px; font-weight: 800; transition: background .2s;
}
.rbcx__acao:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbcx__acao:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

/* bloco de código: a faixa de 44px impede o Copiar de cobrir a primeira linha */
.rbcx__code-wrap { position: relative; margin-top: 18px; padding-top: 44px; background: var(--nu-navy); border-radius: 16px; }
.rbcx__code {
  margin: 0; padding: 0 22px 18px; overflow-x: auto;
  color: var(--nu-blue-soft); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13.5px; line-height: 1.65; white-space: pre;
}
.rbcx__code--wrap { white-space: pre-wrap; word-break: break-all; }
.rbcx__copy {
  position: absolute; top: 8px; right: 10px; border: 0; border-radius: var(--nu-r-pill);
  cursor: pointer; font-family: inherit;
  padding: 8px 18px; background: var(--nu-cream-text-14); color: var(--nu-cream-text);
  font-size: 12.5px; font-weight: 800; transition: background .2s;
}
.rbcx__copy:hover { background: var(--nu-cream-text-22); }
.rbcx__copy:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }

.rbcx__aviso {
  margin-top: 18px; padding: 16px 18px; border-radius: 14px;
  background: var(--nu-amber-bg);
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.rbcx__aviso-p { margin: 0; flex: 1 1 280px; color: var(--nu-amber-text); font-size: 13.5px; font-weight: 600; line-height: 1.55; }
.rbcx__aviso-btn {
  display: inline-flex; align-items: center;
  border: 0; border-radius: var(--nu-r-pill); cursor: pointer; font-family: inherit;
  min-height: 44px; padding: 0 20px; background: var(--nu-ink); color: var(--nu-white);
  font-size: 14px; font-weight: 800; transition: background .2s;
}
.rbcx__aviso-btn:hover { background: var(--nu-ink-hover); color: var(--nu-white); }
.rbcx__aviso-btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbcx__foot { display: flex; justify-content: space-between; gap: 10px; margin-top: 28px; }
.rbcx__btn {
  border: 0; border-radius: var(--nu-r-pill); cursor: pointer; font-family: inherit;
  min-height: 48px; padding: 0 28px; background: var(--nu-ink); color: var(--nu-white);
  font-size: 15px; font-weight: 800; transition: background .2s;
}
.rbcx__btn:hover { background: var(--nu-ink-hover); }
.rbcx__btn--ghost { background: var(--nu-cream); color: var(--nu-ink); }
.rbcx__btn--ghost:hover { background: var(--nu-cream-2); }
.rbcx__btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

@media (max-width: 760px) {
  .rbcx { padding: 16px; }
  .rbcx__card { padding: 26px 20px 24px; }
  .rbcx__title { font-size: 22px; }
  .rbcx__acao { width: 100%; justify-content: center; }
  .rbcx__foot .rbcx__btn { flex: 1; }
}
</style>
