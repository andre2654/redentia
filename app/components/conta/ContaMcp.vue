<script setup lang="ts">
// Seção Aportou MCP de /conta. Nasceu do design do dono (Claude Design
// "Redentia Configuracoes Nu.dc.html", #sec-mcp); em 11/11/2026 vestiu a
// Aportou: o painel azul da marca (o gradiente cobalto, o corte gigante branco
// no canto, o eyebrow com o corte), o verde claro como acento (interruptor,
// chave) e tudo em tokens --nu-*. A estrutura é a mesma: interruptor, chips
// dos apps, chave mascarada e permissões. LIGADO
// no backend real (/api/me/mcp via useMcp): gera/rotaciona chave (mostrada
// 1x) e permissões por escopo. A chave em claro só existe UMA vez, no
// retorno do rotate — depois disso, só o mascarado; por isso Copiar só
// aparece com a chave em claro, e gerar abre o wizard de conexão
// (RbConexaoModal, origem "mcp") no lugar do antigo JSON de configuração
// (direção do dono 2026-08-25).
const { status, plainKey, hydrate, rotate, setEnabled, setPermissions, busy, loading } = useMcp()

// GET /me/mcp falhou → sem estado de erro, o card ficava num "gere sua chave"
// com o botão travado por `pending` (status null) = beco sem saída. loadFailed
// mostra um retry honesto (auditoria de frontend 2026-07-15).
const loadFailed = ref(false)
async function load() {
  loadFailed.value = false
  try { await hydrate() } catch { loadFailed.value = true }
}
onMounted(load)

// Enquanto o GET /me/mcp está em voo, status=null lê como "sem chave" — um
// clique no toggle nessa janela cairia no rotate() e MATARIA a chave real do
// usuário (auditoria 2026-07-15). Trava tudo até hidratar.
const pending = computed(() => busy.value || loading.value || status.value === null)

const hasKey = computed(() => status.value?.has_key ?? false)
const mcpOn = computed(() => status.value?.enabled ?? false)
const keyMasked = computed(() => status.value?.key_masked ?? '')

// Permissões locais espelhando o backend (sincroniza no hydrate/rotate).
// `cenarios` só entra quando o backend devolve a chave: front antes do backend
// = linha escondida, e o PUT não manda um escopo que o banco não conhece.
const perms = reactive<McpPermissions>({ carteira: true, mercado: true, teses: true, news: true })
watch(() => status.value?.permissions, (p) => { if (p) Object.assign(perms, p) }, { immediate: true })
const hasCenarios = computed(() => typeof status.value?.permissions?.cenarios === 'boolean')

const reveal = ref(false)
// Texto da chave: a recém-gerada (revelável) senão o mascarado do banco.
const tokenText = computed(() => (reveal.value && plainKey.value ? plainKey.value : keyMasked.value))

// Wizard de conexão (o mesmo do B2B/mcp): abre sozinho quando uma chave é
// gerada — é a única janela em que a chave em claro existe pra interpolar.
const conexaoAberta = ref(false)

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
  if (pending.value) return
  try {
    if (!hasKey.value) { await rotate(); reveal.value = true; conexaoAberta.value = true; return }
    await setEnabled(!mcpOn.value)
  } catch { await hydrate().catch(() => {}) } // falhou → re-sincroniza com o banco
}
async function onTogglePerm(k: keyof McpPermissions) {
  if (k === 'cenarios' && !hasCenarios.value) return
  if (pending.value || !hasKey.value) return
  const prev = !!perms[k]
  perms[k] = !perms[k] // otimista…
  try {
    await setPermissions({ ...perms })
  } catch {
    perms[k] = prev // …com rollback: a UI nunca mente sobre escopo de segurança
  }
}
async function onRotate() {
  if (pending.value) return
  try {
    await rotate()
    reveal.value = true // revela a nova — única chance de copiar
    conexaoAberta.value = true
  } catch { /* mantém a chave atual na tela */ }
}

const copiedToken = ref(false)
let tTimer: ReturnType<typeof setTimeout> | undefined
async function copyToken() {
  if (!plainKey.value) return // depois do reload só existe o mascarado — nada a copiar
  try { await navigator.clipboard?.writeText(plainKey.value) } catch { /* bloqueado */ }
  copiedToken.value = true
  clearTimeout(tTimer)
  tTimer = setTimeout(() => (copiedToken.value = false), 1600)
}

// Logos reais (marcas transparentes → tile branco por trás no CSS).
const apps = [
  { name: 'Claude', logo: '/icons/logo-claude.webp' },
  { name: 'ChatGPT', logo: '/icons/logo-chatgpt.webp' },
  { name: 'Cursor', logo: '/icons/logo-cursor.webp' },
  { name: 'Raycast', logo: '/icons/logo-raycast.webp' },
]

onBeforeUnmount(() => { clearTimeout(tTimer) })
</script>

<template>
  <section class="mcp" :class="{ 'mcp--off': !mcpOn }">
    <span class="mcp__corte nu-corte-fundo" aria-hidden="true"><MarcaCorte :largura="420" cor="var(--nu-white)" /></span>

    <div class="mcp__head">
      <div class="mcp__head-txt">
        <NuEyebrow sobre="azul">Novo</NuEyebrow>
        <h2 class="mcp__title">Aportou MCP</h2>
        <p class="mcp__desc">Conecte sua carteira, o mercado e as teses ao seu assistente de IA. Pergunte sobre seus investimentos direto no Claude, ChatGPT ou Cursor: a Aportou responde com os seus dados.</p>
      </div>
      <button type="button" class="msw" :class="{ 'msw--on': mcpOn }" role="switch" :aria-checked="mcpOn" aria-label="Ativar Aportou MCP" @click="onToggleMain"><span class="msw__knob" /></button>
    </div>

    <div class="mcp__apps">
      <span v-for="a in apps" :key="a.name" class="mcp__app">
        <span class="mcp__app-ic"><img :src="a.logo" :alt="a.name" class="mcp__app-img" width="22" height="22"></span>{{ a.name }}
      </span>
    </div>

    <div class="mcp__panel">
      <div class="mcp__panel-label">Sua chave de acesso</div>

      <template v-if="loadFailed">
        <p class="mcp__key-empty">Não consegui carregar sua chave agora.</p>
        <button type="button" class="mcp__gen" @click="load">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /></svg>
          Tentar de novo
        </button>
      </template>

      <template v-else-if="hasKey">
        <div class="mcp__key-row">
          <code class="mcp__key" data-clarity-mask="true">{{ tokenText }}</code>
          <button v-if="plainKey" type="button" class="mcp__reveal" @click="reveal = !reveal">{{ reveal ? 'Ocultar' : 'Revelar' }}</button>
          <!-- sem a chave em claro (depois do reload), copiar copiaria o mascarado — some -->
          <button v-if="plainKey" type="button" class="mcp__copy" :class="{ 'mcp__copy--done': copiedToken }" @click="copyToken">{{ copiedToken ? 'Copiado' : 'Copiar' }}</button>
        </div>
        <p v-if="plainKey" class="mcp__key-warn">Copie agora. Por segurança, a chave não aparece de novo.</p>
        <div class="mcp__key-foot">
          <button type="button" class="mcp__regen" :disabled="pending" @click="onRotate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
            Gerar nova chave
          </button>
          <span v-if="metaText" class="mcp__key-meta">{{ metaText }}</span>
        </div>
      </template>

      <template v-else>
        <p class="mcp__key-empty">Você ainda não tem uma chave. Gere a sua para conectar a Aportou ao seu assistente de IA.</p>
        <NuBotaoSeta class="mcp__gerar" variante="creme" tamanho="m" :disabled="pending" @click="onRotate">Gerar minha chave</NuBotaoSeta>
      </template>
    </div>

    <div class="mcp__perms-label">Permissões da chave</div>
    <div class="mcp__perms">
      <div class="mcp__perm">
        <div class="mcp__perm-txt">
          <div class="mcp__perm-name">Carteira</div>
          <div class="mcp__perm-desc">Posições, saldo e proventos, somente leitura.</div>
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
          <div class="mcp__perm-name">Notícias e pesquisa</div>
          <div class="mcp__perm-desc">Notícias analisadas e relatórios da Aportou.</div>
        </div>
        <button type="button" class="msw" :class="{ 'msw--on': perms.news }" role="switch" :aria-checked="perms.news" aria-label="Permissão notícias e pesquisa" @click="onTogglePerm('news')"><span class="msw__knob" /></button>
      </div>
      <div v-if="hasCenarios" class="mcp__perm">
        <div class="mcp__perm-txt">
          <div class="mcp__perm-name">Cenários e projeções</div>
          <div class="mcp__perm-desc">O motor de projeções da Aportou roda dentro da sua IA: dólar, Selic, bolsa, petróleo e inflação sobre a carteira que você descrever na conversa. Vem desligado; ligue se quiser usar.</div>
        </div>
        <button type="button" class="msw" :class="{ 'msw--on': perms.cenarios }" role="switch" :aria-checked="!!perms.cenarios" aria-label="Permissão cenários e projeções" @click="onTogglePerm('cenarios')"><span class="msw__knob" /></button>
      </div>
    </div>

    <NuxtLink to="/mcp" class="mcp__docs">
      Ver documentação do MCP
      <svg class="mcp__docs-seta" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
    </NuxtLink>

    <RbConexaoModal :open="conexaoAberta" :plain-key="plainKey" origem="mcp" @close="conexaoAberta = false" />
  </section>
</template>

<style scoped>
/* o painel azul da marca: gradiente cobalto, raio 32, o corte gigante branco a 8% no canto */
.mcp {
  position: relative; overflow: hidden;
  border-radius: var(--nu-r-card-lg); padding: clamp(26px, 3vw, 40px);
  background: var(--nu-grad-cobalto); color: var(--nu-white);
  box-shadow: var(--nu-shadow-card);
}
/* a posição é da classe global .nu-corte-fundo (sai sempre do canto de cima à esquerda); aqui só a opacidade */
.mcp__corte { opacity: .08; transition: opacity .3s ease; }

/* DESLIGADO (dono 2026-07-14): card cinza, como se o MCP estivesse mesmo fora.
   Fundo vira o carvão apagado + conteúdo dessatura/esmaece/trava; SÓ o
   interruptor principal continua clicável (é como se religa). */
.mcp__head-txt,
.mcp__apps,
.mcp__panel,
.mcp__perms-label,
.mcp__perms,
.mcp__docs { transition: filter .3s ease, opacity .3s ease; }
.mcp--off { background: color-mix(in srgb, var(--nu-ink) 78%, var(--nu-sand)); box-shadow: none; }
.mcp--off .mcp__corte { opacity: .04; }
.mcp--off .mcp__head-txt,
.mcp--off .mcp__apps,
.mcp--off .mcp__panel,
.mcp--off .mcp__perms-label,
.mcp--off .mcp__perms,
.mcp--off .mcp__docs { filter: grayscale(1); opacity: .62; pointer-events: none; }

.mcp__head { position: relative; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.mcp__head-txt { flex: 1 1 280px; max-width: 580px; min-width: 0; }
.mcp__title { margin: 16px 0 0; color: var(--nu-white); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.05; }
.mcp__desc { margin: 12px 0 0; color: var(--nu-blue-on-blue); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }

.mcp__apps { position: relative; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 22px; }
.mcp__app {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px;
  background: var(--nu-white-14); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio);
  padding: 0 15px 0 11px; border-radius: var(--nu-r-chip);
}
.mcp__app-ic {
  width: 24px; height: 24px; border-radius: 7px; background: var(--nu-white); overflow: hidden;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mcp__app-img { width: 100%; height: 100%; object-fit: contain; padding: 3px; display: block; }

.mcp__panel { position: relative; background: color-mix(in srgb, var(--nu-ink) 46%, transparent); border: 1.5px solid var(--nu-white-18); border-radius: var(--nu-r-panel); padding: clamp(18px, 2.2vw, 24px); margin-top: 22px; }
.mcp__panel-label, .mcp__perms-label { color: var(--nu-blue-on-blue); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: .16em; text-transform: uppercase; }
.mcp__key-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.mcp__key {
  flex: 1; min-width: 200px; min-height: 44px; display: flex; align-items: center;
  background: color-mix(in srgb, var(--nu-ink) 62%, transparent); color: var(--nu-green-soft);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: var(--nu-fs-sm); font-weight: 500;
  padding: 0 16px; border-radius: var(--nu-r-chip); letter-spacing: .3px; overflow-x: auto; white-space: nowrap;
}
.mcp__reveal, .mcp__copy {
  min-height: 44px; border: none; font-family: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio);
  cursor: pointer; padding: 0 16px; border-radius: var(--nu-r-chip); white-space: nowrap;
  transition: background .2s, color .2s, transform .15s var(--nu-ease-saida);
}
.mcp__reveal:active, .mcp__copy:active { transform: scale(.98); }
.mcp__reveal { background: var(--nu-white-14); color: var(--nu-white); }
.mcp__reveal:hover { background: var(--nu-white-30); }
.mcp__copy { background: var(--nu-white); color: var(--nu-blue-text); }
.mcp__copy:hover { background: var(--nu-blue-on-blue); }
.mcp__copy--done, .mcp__copy--done:hover { background: var(--nu-green-soft); color: var(--nu-ink); }
.mcp__key-foot { display: flex; align-items: center; gap: 6px 16px; margin-top: 10px; flex-wrap: wrap; }
.mcp__regen {
  display: inline-flex; align-items: center; gap: 7px; min-height: 44px; background: transparent; border: none;
  color: var(--nu-blue-on-blue); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); cursor: pointer; padding: 0;
  font-family: inherit; text-decoration: underline; text-underline-offset: 3px; transition: color .2s;
}
.mcp__regen svg { transition: transform .3s var(--nu-ease-saida); }
.mcp__regen:hover:not(:disabled) { color: var(--nu-white); }
.mcp__regen:hover:not(:disabled) svg { transform: rotate(90deg); }
.mcp__regen:disabled { opacity: .5; cursor: default; }
.mcp__key-meta { color: var(--nu-blue-on-blue-2); font-size: var(--nu-fs-dense); font-weight: 500; font-variant-numeric: tabular-nums; }
.mcp__key-warn { margin: 10px 0 0; color: var(--nu-green-soft); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); }
.mcp__key-empty { margin: 12px 0 0; color: var(--nu-blue-on-blue); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.mcp__gerar { margin-top: 16px; }
/* "Tentar de novo", quando a chave não carregou: a pílula creme simples */
.mcp__gen {
  display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; min-height: 44px;
  background: var(--nu-creme); color: var(--nu-ink); border: 0; border-radius: var(--nu-r-pill);
  padding: 0 20px; font-family: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); cursor: pointer;
  transition: background .2s, transform .15s var(--nu-ease-saida);
}
.mcp__gen:hover:not(:disabled) { background: var(--nu-white); }
.mcp__gen:active { transform: scale(.98); }
.mcp__gen:disabled { opacity: .55; cursor: default; }

.mcp__perms-label { position: relative; margin-top: 26px; }
.mcp__perms { position: relative; margin-top: 10px; }
.mcp__perm { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-top: 1.5px solid var(--nu-white-18); }
.mcp__perm-txt { flex: 1; min-width: 0; }
.mcp__perm-name { color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); }
.mcp__perm-desc { color: var(--nu-blue-on-blue); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.45; margin-top: 2px; }

.mcp__docs { position: relative; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); margin-top: 14px; text-decoration: underline; text-underline-offset: 3px; }
.mcp__docs:hover { color: var(--nu-white); }
.mcp__docs-seta { transition: transform .2s; }
.mcp__docs:hover .mcp__docs-seta { transform: translate(2px, -2px); }

/* o interruptor: trilho 50x30, o verde claro da marca ligado / branco translúcido desligado, botão 24 */
.msw {
  position: relative; flex-shrink: 0; width: 50px; height: 30px; border: none; cursor: pointer;
  border-radius: var(--nu-r-pill); padding: 0; background: var(--nu-white-30); transition: background .2s;
}
/* o alvo de toque chega a 44px sem mexer no desenho */
.msw::after { content: ''; position: absolute; inset: -7px 0; }
.msw--on { background: var(--nu-green-soft); }
.msw__knob {
  position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: var(--nu-white);
  box-shadow: 0 1px 3px var(--nu-ink-30); transition: transform .22s var(--nu-ease-cor);
}
.msw--on .msw__knob { transform: translateX(20px); }
.msw:focus-visible { outline: 3px solid var(--nu-white); outline-offset: 2px; }

@media (max-width: 520px) {
  /* o interruptor fica na linha do eyebrow, e o texto usa a largura toda */
  .mcp__head { display: block; }
  .mcp__head > .msw { position: absolute; top: -4px; right: 0; }
  .mcp__key { flex-basis: 100%; }
  .mcp__reveal, .mcp__copy { flex: 1; }
  .mcp__gerar { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .mcp__regen svg, .mcp__docs-seta { transition: none; }
}
</style>
