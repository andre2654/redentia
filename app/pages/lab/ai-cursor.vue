<script setup lang="ts">
import type { CursorContext } from '~/utils/extractCursorContext'

definePageMeta({
  layout: false,
})

useHead({
  title: 'Lab · AI Cursor — Redentia',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
})

// ---------------------------------------------------------------
// Config controlável
// ---------------------------------------------------------------
const idleMs = ref(1000)
const loadMs = ref(2000)
const enabled = ref(true)
const autoNavigate = ref(false)

// ---------------------------------------------------------------
// Estado de debug
// ---------------------------------------------------------------
const cursorEl = ref('')
const cursorSuppressed = ref(false)
const cursorX = ref(0)
const cursorY = ref(0)
const captures = ref<Array<{ ts: number; ctx: CursorContext }>>([])
const lastConfirmed = ref<CursorContext | null>(null)
const showModal = ref(false)
const paletteQuery = ref('')
const showRawJson = ref(false)
const copyState = ref('')
const paletteInputRef = ref<HTMLTextAreaElement | null>(null)

const router = useRouter()

const rawJsonSize = computed(() => {
  if (!lastConfirmed.value) return ''
  const bytes = JSON.stringify(lastConfirmed.value).length
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
})

watch(showModal, async (v) => {
  if (!v) {
    showRawJson.value = false
    copyState.value = ''
    return
  }
  paletteQuery.value = cursor.teaser.value || ''
  await nextTick()
  paletteInputRef.value?.focus()
  paletteInputRef.value?.select()
})

function onPaletteSubmit() {
  if (!paletteQuery.value.trim() || !lastConfirmed.value) return
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('aiCursorCtx', JSON.stringify({
      ...lastConfirmed.value,
      userQuestion: paletteQuery.value.trim(),
    }))
  }
  router.push(`/help?from=cursor&ts=${Date.now()}`)
}

const cursor = useAiCursor({
  idleMs,
  loadMs,
  enabled,
  onCapture: (ctx) => {
    if (ctx) {
      captures.value.unshift({ ts: Date.now(), ctx })
      if (captures.value.length > 8) captures.value.pop()
    }
  },
  onConfirm: (ctx) => {
    lastConfirmed.value = ctx
    if (autoNavigate.value) {
      router.push(`/help?from=cursor&ts=${Date.now()}`)
    }
    else {
      showModal.value = true
    }
  },
})

// Espelha posição do cursor pra debug panel (separado do timer)
function trackCursor(e: MouseEvent) {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
  const el = document.elementFromPoint(e.clientX, e.clientY)
  cursorEl.value = el ? `<${el.tagName.toLowerCase()}>` : '—'
  cursorSuppressed.value = !!(el && cursor.isSuppressedZone(el))
}

onMounted(() => {
  window.addEventListener('mousemove', trackCursor, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', trackCursor)
})

function fmtTime(ts: number) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

function copyJson() {
  if (!lastConfirmed.value) return
  navigator.clipboard?.writeText(JSON.stringify(lastConfirmed.value, null, 2))
  copyState.value = 'Copiado'
  setTimeout(() => { copyState.value = '' }, 1400)
}

function goToHelp() {
  if (lastConfirmed.value && typeof window !== 'undefined') {
    sessionStorage.setItem('aiCursorCtx', JSON.stringify(lastConfirmed.value))
  }
  router.push(`/help?from=cursor&ts=${Date.now()}`)
}

// Mock data pra rico conteúdo de teste
const fundamentals = [
  { metric: 'P/L', petr: '5,3', vale: '6,1', itub: '9,8' },
  { metric: 'P/VP', petr: '1,2', vale: '1,8', itub: '2,1' },
  { metric: 'ROE', petr: '23,4%', vale: '19,7%', itub: '21,3%' },
  { metric: 'DY (12m)', petr: '13,4%', vale: '11,2%', itub: '7,8%' },
  { metric: 'Margem Líquida', petr: '28,1%', vale: '24,5%', itub: '34,7%' },
  { metric: 'Dívida Líq./EBITDA', petr: '0,6', vale: '0,4', itub: '—' },
]

const news = [
  {
    title: 'Petrobras anuncia dividendos extraordinários de R$ 14 bi',
    source: 'Bloomberg',
    when: 'há 2h',
  },
  {
    title: 'IBOV testa máxima histórica com fluxo estrangeiro de R$ 3,2 bi',
    source: 'Valor',
    when: 'há 4h',
  },
  {
    title: 'Selic deve cair 50bps na próxima reunião do Copom, diz Itaú',
    source: 'InfoMoney',
    when: 'há 6h',
  },
]
</script>

<template>
  <div class="lab-root">
    <!-- Settings strip -->
    <header class="lab-settings" data-ai-cursor-suppress>
      <div class="lab-settings-inner">
        <div class="lab-brand">
          <span class="eyebrow">Lab · ai-cursor</span>
          <span class="lab-route">/lab/ai-cursor</span>
        </div>

        <div class="lab-controls">
          <label class="lab-control">
            <span>Idle</span>
            <input v-model.number="idleMs" type="number" min="200" max="3000" step="100" class="lab-input">
            <span class="lab-unit">ms</span>
          </label>

          <label class="lab-control">
            <span>Anel</span>
            <input v-model.number="loadMs" type="number" min="500" max="5000" step="250" class="lab-input">
            <span class="lab-unit">ms</span>
          </label>

          <label class="lab-toggle">
            <input v-model="enabled" type="checkbox">
            <span>Ativo</span>
          </label>

          <label class="lab-toggle">
            <input v-model="autoNavigate" type="checkbox">
            <span>Navegar pro /help no confirm</span>
          </label>

          <NuxtLink to="/" class="lab-link">← voltar</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Conteúdo de teste -->
    <main class="lab-main">
      <section class="lab-hero">
        <span class="eyebrow">Sandbox</span>
        <h1 class="lab-h1">Pare o mouse em qualquer coisa abaixo.</h1>
        <p class="lab-lede">
          Em <strong>{{ idleMs }}ms</strong> aparece o orb âmbar com anel carregando. Espere mais
          <strong>{{ loadMs }}ms</strong> pra ver o card expandir. Click ou Enter confirma.
          Esc cancela. Mover o mouse cancela.
        </p>
      </section>

      <!-- Card de ativo -->
      <section class="lab-section">
        <h2 class="lab-h2">Card de ativo</h2>
        <article class="quiet-card lab-asset" data-ai-context="asset:PETR4 view:overview">
          <header class="lab-asset-header">
            <div>
              <div class="eyebrow">Petróleo, Gás e Biocombustíveis</div>
              <h3 class="lab-asset-name">Petrobras PN</h3>
              <div class="lab-asset-ticker">PETR4 · B3</div>
            </div>
            <div class="lab-asset-price">
              <span class="lab-asset-amount font-mono-tab">R$ 38,42</span>
              <span class="quiet-badge quiet-badge--success">+1,24%</span>
            </div>
          </header>

          <div class="lab-asset-kpis">
            <div class="lab-kpi">
              <span class="lab-kpi-label">Dividend Yield 12m</span>
              <span class="lab-kpi-value font-mono-tab">13,4%</span>
            </div>
            <div class="lab-kpi">
              <span class="lab-kpi-label">P/L</span>
              <span class="lab-kpi-value font-mono-tab">5,3</span>
            </div>
            <div class="lab-kpi">
              <span class="lab-kpi-label">ROE</span>
              <span class="lab-kpi-value font-mono-tab">23,4%</span>
            </div>
            <div class="lab-kpi">
              <span class="lab-kpi-label">Volume diário</span>
              <span class="lab-kpi-value font-mono-tab">R$ 2,1 bi</span>
            </div>
          </div>

          <p class="lab-asset-thesis">
            A tese atual gira em torno da combinação de payout extraordinário com Brent
            estabilizado entre US$ 78–84. Com endividamento líquido em 0,6x EBITDA, há
            espaço pra continuar distribuindo acima de 60% do lucro nos próximos
            trimestres, mas o risco político eleitoral pesa no múltiplo.
          </p>
        </article>
      </section>

      <!-- Tabela de fundamentos -->
      <section class="lab-section">
        <h2 class="lab-h2">Comparativo de fundamentos</h2>
        <p class="lab-section-sub">
          Pare em qualquer célula pra testar a captura de coluna + linha em tabelas.
        </p>
        <div class="quiet-card lab-table-wrap">
          <table class="lab-table">
            <thead>
              <tr>
                <th class="lab-th">Indicador</th>
                <th class="lab-th">PETR4</th>
                <th class="lab-th">VALE3</th>
                <th class="lab-th">ITUB4</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in fundamentals" :key="row.metric">
                <td class="lab-td-label">{{ row.metric }}</td>
                <td class="lab-td font-mono-tab">{{ row.petr }}</td>
                <td class="lab-td font-mono-tab">{{ row.vale }}</td>
                <td class="lab-td font-mono-tab">{{ row.itub }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Notícias -->
      <section class="lab-section">
        <h2 class="lab-h2">Manchetes</h2>
        <div class="lab-news">
          <article v-for="(n, i) in news" :key="i" class="quiet-card lab-news-card">
            <div class="eyebrow">{{ n.source }} · {{ n.when }}</div>
            <h3 class="lab-news-title">{{ n.title }}</h3>
            <a href="#" class="lab-news-link">ler matéria completa →</a>
          </article>
        </div>
      </section>

      <!-- Editorial longo -->
      <section class="lab-section">
        <h2 class="lab-h2">Por que Selic alta penaliza FIIs de papel mais que FIIs de tijolo</h2>
        <article class="lab-editorial">
          <p>
            A intuição comum é que juro alto mata FII inteiro. Mas a mecânica é mais
            específica. Fundos de papel são, em essência, carteiras de CRIs e LCIs
            indexados ao IPCA mais um spread. Quando a Selic sobe acima da inflação
            esperada, o yield real dos títulos públicos compete diretamente com o
            spread desses CRIs, pressionando o preço de mercado das cotas.
          </p>
          <p>
            FIIs de tijolo, ao contrário, derivam o resultado do aluguel real do imóvel.
            O efeito de Selic alta neles é indireto: chega via custo de capital pra
            novas aquisições e via cap rate de mercado, mas o fluxo de receita de
            contratos vigentes segue intacto enquanto o inquilino paga.
          </p>
          <p>
            Daí o padrão histórico: ciclos de aperto monetário descontam mais
            agressivamente fundos como KNCR11 ou MXRF11 do que HGLG11 ou XPLG11. A
            assimetria do retorno na ponta de afrouxamento também é diferente — papel
            recupera mais rápido porque o preço da cota é mais sensível ao yield, mas
            tijolo recupera de forma mais durável.
          </p>
        </article>
      </section>

      <!-- KPI hero -->
      <section class="lab-section">
        <h2 class="lab-h2">Indicadores macro</h2>
        <div class="lab-macro">
          <div class="quiet-card lab-macro-card">
            <span class="eyebrow">Selic</span>
            <span class="lab-macro-value font-mono-tab">10,75%</span>
            <span class="lab-macro-delta">-0,50pp no Copom</span>
          </div>
          <div class="quiet-card lab-macro-card">
            <span class="eyebrow">IPCA 12m</span>
            <span class="lab-macro-value font-mono-tab">4,52%</span>
            <span class="lab-macro-delta">acima do teto da meta</span>
          </div>
          <div class="quiet-card lab-macro-card">
            <span class="eyebrow">IBOV YTD</span>
            <span class="lab-macro-value font-mono-tab">+12,8%</span>
            <span class="lab-macro-delta">vs. +6,1% S&P 500</span>
          </div>
          <div class="quiet-card lab-macro-card">
            <span class="eyebrow">USDBRL</span>
            <span class="lab-macro-value font-mono-tab">5,12</span>
            <span class="lab-macro-delta">-2,1% no mês</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Debug panel — sticky no canto direito -->
    <aside class="lab-debug" data-ai-cursor-suppress>
      <div class="lab-debug-section">
        <div class="eyebrow">Cursor</div>
        <dl class="lab-debug-list">
          <div><dt>X / Y</dt><dd class="font-mono-tab">{{ cursorX }}, {{ cursorY }}</dd></div>
          <div><dt>Elemento</dt><dd>{{ cursorEl }}</dd></div>
          <div><dt>Suprimido</dt><dd>{{ cursorSuppressed ? 'sim' : 'não' }}</dd></div>
          <div><dt>Phase</dt><dd>{{ cursor.phase.value }}</dd></div>
          <div><dt>Progresso</dt><dd class="font-mono-tab">{{ Math.round(cursor.progress.value * 100) }}%</dd></div>
        </dl>
      </div>

      <div v-if="cursor.lastContext.value" class="lab-debug-section">
        <div class="eyebrow">Última captura</div>
        <div class="lab-debug-breadcrumb">{{ cursor.lastContext.value.semanticBreadcrumb || '(sem breadcrumb)' }}</div>
        <div class="lab-debug-teaser">{{ cursor.teaser.value }}</div>
        <div class="lab-debug-meta">
          <span>{{ cursor.lastContext.value.focused.tag }}</span>
          <span v-if="cursor.lastContext.value.tableContext">tabela</span>
          <span>{{ Object.keys(cursor.lastContext.value.focused.attributes).length }} attrs</span>
        </div>
      </div>

      <div v-if="captures.length" class="lab-debug-section">
        <div class="eyebrow">Histórico</div>
        <ul class="lab-debug-history">
          <li v-for="cap in captures" :key="cap.ts">
            <span class="lab-debug-time">{{ fmtTime(cap.ts) }}</span>
            <span class="lab-debug-bc">{{ cap.ctx.semanticBreadcrumb || cap.ctx.focused.text.slice(0, 40) }}</span>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Overlay da feature -->
    <AtomsAiCursorOverlay
      :visible="cursor.visible.value"
      :x="cursor.x.value"
      :y="cursor.y.value"
      :progress="cursor.progress.value"
      :phase="cursor.phase.value"
      :teaser="cursor.teaser.value"
      :breadcrumb="cursor.breadcrumb.value"
      @confirm="cursor.confirm()"
      @dismiss="cursor.dismiss()"
    />

    <!-- Palette: command-palette / Spotlight style (quando autoNavigate=false) -->
    <Teleport to="body">
      <Transition name="palette">
        <div
          v-if="showModal"
          class="lab-palette-backdrop"
          data-ai-cursor-suppress
          @click.self="showModal = false"
          @keydown.esc="showModal = false"
        >
          <div class="lab-palette" @click.stop>
            <div class="lab-palette-rule" aria-hidden="true" />

            <header class="lab-palette-head">
              <span class="lab-palette-mark">
                <img src="/brand/redentia/dark-logo-icon.png" alt="" draggable="false">
              </span>
              <div class="lab-palette-head-meta">
                <span class="lab-palette-eyebrow">Perguntar à Redentia</span>
                <span class="lab-palette-breadcrumb">
                  {{ lastConfirmed?.semanticBreadcrumb || lastConfirmed?.focused.text.slice(0, 80) || 'Sem contexto' }}
                </span>
              </div>
              <button
                class="lab-palette-close"
                aria-label="fechar"
                @click="showModal = false"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
            </header>

            <div class="lab-palette-input-wrap">
              <textarea
                ref="paletteInputRef"
                v-model="paletteQuery"
                class="lab-palette-input"
                rows="2"
                placeholder="Faça sua pergunta sobre o que está vendo…"
                @keydown.enter.prevent="onPaletteSubmit"
                @keydown.esc.prevent="showModal = false"
              />
            </div>

            <ul class="lab-palette-actions">
              <li>
                <button
                  class="lab-palette-action lab-palette-action--primary"
                  :disabled="!paletteQuery.trim()"
                  @click="onPaletteSubmit"
                >
                  <span class="lab-palette-action-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2.5 8h11M9 3.5l4.5 4.5L9 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span class="lab-palette-action-label">Continuar no chat</span>
                  <kbd class="lab-palette-kbd">↵</kbd>
                </button>
              </li>
              <li>
                <button class="lab-palette-action" @click="copyJson">
                  <span class="lab-palette-action-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4" />
                      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-5A1.5 1.5 0 0 0 3 3.5v7A1.5 1.5 0 0 0 4.5 12H5" stroke="currentColor" stroke-width="1.4" />
                    </svg>
                  </span>
                  <span class="lab-palette-action-label">Copiar contexto bruto</span>
                  <span class="lab-palette-action-aux">{{ copyState || 'JSON' }}</span>
                </button>
              </li>
              <li>
                <button class="lab-palette-action" @click="showRawJson = !showRawJson">
                  <span class="lab-palette-action-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 6l3-3 3 3M6 3v8M13 10l-3 3-3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span class="lab-palette-action-label">{{ showRawJson ? 'Esconder' : 'Inspecionar' }} payload</span>
                  <span class="lab-palette-action-aux">{{ rawJsonSize }}</span>
                </button>
              </li>
            </ul>

            <Transition name="palette-json">
              <div v-if="showRawJson && lastConfirmed" class="lab-palette-json">
                <pre>{{ JSON.stringify(lastConfirmed, null, 2) }}</pre>
              </div>
            </Transition>

            <footer class="lab-palette-foot">
              <span><kbd class="lab-palette-kbd-mini">↵</kbd> perguntar</span>
              <span class="lab-palette-foot-sep">·</span>
              <span><kbd class="lab-palette-kbd-mini">Esc</kbd> fechar</span>
              <span class="lab-palette-foot-spacer" />
              <span class="lab-palette-foot-brand">redent<span style="color: var(--brand-primary)">.</span>ia</span>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.lab-root {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-body);
  font-family: var(--brand-font), sans-serif;
  padding-bottom: 120px;
}

/* ---- Settings strip ---- */
.lab-settings {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--bg-base) 92%, transparent);
  backdrop-filter: saturate(140%) blur(10px);
  border-bottom: 1px solid var(--border-subtle);
}
.lab-settings-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.lab-brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lab-route {
  font-size: 12px;
  color: var(--text-muted);
  font-feature-settings: 'tnum';
}
.lab-controls {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}
.lab-control {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-body);
}
.lab-input {
  width: 64px;
  padding: 4px 8px;
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  color: var(--text-heading);
  font-size: 12px;
  font-feature-settings: 'tnum';
}
.lab-input:focus-visible {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-ring-focus);
}
.lab-unit {
  font-size: 11px;
  color: var(--text-muted);
}
.lab-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-body);
}
.lab-toggle input {
  accent-color: var(--brand-primary);
}
.lab-link {
  font-size: 12px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 150ms ease-out;
}
.lab-link:hover {
  color: var(--brand-primary);
}

/* ---- Main content ---- */
.lab-main {
  max-width: 880px;
  margin: 0 auto;
  padding: 56px 32px 0;
}
.lab-hero {
  margin-bottom: 56px;
}
.lab-h1 {
  font-size: 38px;
  font-weight: 300;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 8px 0 16px;
  line-height: 1.1;
}
.lab-lede {
  font-size: 16px;
  line-height: 1.55;
  color: var(--text-body);
  max-width: 620px;
}
.lab-lede strong {
  font-weight: 500;
  color: var(--text-heading);
  font-feature-settings: 'tnum';
}
.lab-section {
  margin-bottom: 48px;
}
.lab-h2 {
  font-size: 22px;
  font-weight: 300;
  letter-spacing: -0.018em;
  color: var(--text-heading);
  margin-bottom: 8px;
}
.lab-section-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

/* ---- Asset card ---- */
.lab-asset {
  padding: 24px;
}
.lab-asset-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}
.lab-asset-name {
  font-size: 24px;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin: 4px 0 2px;
}
.lab-asset-ticker {
  font-size: 12px;
  color: var(--text-muted);
  font-feature-settings: 'tnum';
}
.lab-asset-price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}
.lab-asset-amount {
  font-size: 24px;
  font-weight: 400;
  color: var(--text-heading);
  letter-spacing: -0.01em;
}
.lab-asset-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 20px;
}
.lab-kpi {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lab-kpi-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.lab-kpi-value {
  font-size: 18px;
  color: var(--text-heading);
  font-weight: 400;
}
.lab-asset-thesis {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-body);
}

/* ---- Tabela ---- */
.lab-table-wrap {
  padding: 0;
  overflow: hidden;
}
.lab-table {
  width: 100%;
  border-collapse: collapse;
}
.lab-th {
  text-align: left;
  padding: 14px 18px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-overlay);
}
.lab-th:not(:first-child) {
  text-align: right;
}
.lab-td-label {
  padding: 12px 18px;
  font-size: 13px;
  color: var(--text-heading);
  border-bottom: 1px solid var(--border-subtle);
}
.lab-td {
  padding: 12px 18px;
  text-align: right;
  font-size: 13px;
  color: var(--text-body);
  border-bottom: 1px solid var(--border-subtle);
}
.lab-table tr:last-child td {
  border-bottom: none;
}
.lab-table tr:hover .lab-td-label,
.lab-table tr:hover .lab-td {
  background: var(--bg-overlay);
}

/* ---- News ---- */
.lab-news {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.lab-news-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lab-news-title {
  font-size: 15px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--text-heading);
  letter-spacing: -0.01em;
}
.lab-news-link {
  font-size: 12px;
  color: var(--brand-primary);
  text-decoration: none;
  margin-top: auto;
}

/* ---- Editorial ---- */
.lab-editorial p {
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-body);
  margin-bottom: 14px;
}

/* ---- Macro ---- */
.lab-macro {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.lab-macro-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lab-macro-value {
  font-size: 28px;
  font-weight: 300;
  color: var(--text-heading);
  letter-spacing: -0.02em;
  line-height: 1;
}
.lab-macro-delta {
  font-size: 11px;
  color: var(--text-muted);
}

/* ---- Debug panel ---- */
.lab-debug {
  position: fixed;
  top: 90px;
  right: 24px;
  width: 280px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  padding: 16px;
  z-index: 40;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
}
.lab-debug-section {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}
.lab-debug-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.lab-debug-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}
.lab-debug-list > div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.lab-debug-list dt {
  color: var(--text-muted);
}
.lab-debug-list dd {
  color: var(--text-heading);
  margin: 0;
}
.lab-debug-breadcrumb {
  margin-top: 8px;
  color: var(--text-heading);
  font-weight: 500;
  word-break: break-word;
}
.lab-debug-teaser {
  margin-top: 4px;
  color: var(--brand-primary);
  font-size: 11px;
  font-style: italic;
}
.lab-debug-meta {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.lab-debug-history {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lab-debug-history li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
  border-bottom: 1px dashed var(--border-subtle);
}
.lab-debug-history li:last-child {
  border-bottom: none;
}
.lab-debug-time {
  font-size: 10px;
  color: var(--text-muted);
  font-feature-settings: 'tnum';
}
.lab-debug-bc {
  color: var(--text-body);
  font-size: 11px;
  word-break: break-word;
}

/* ---- Palette (command-palette / Spotlight) ---- */
.lab-palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: color-mix(in srgb, var(--bg-base) 64%, transparent);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 14vh 24px 24px;
}
.lab-palette {
  position: relative;
  width: 100%;
  max-width: 580px;
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 8%, var(--border-subtle));
  border-radius: 14px;
  box-shadow:
    0 32px 80px -20px rgba(0, 0, 0, 0.55),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 4%, transparent),
    0 60px 100px -40px color-mix(in srgb, var(--brand-primary) 18%, transparent);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.lab-palette-rule {
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--brand-primary) 60%, transparent) 40%,
    color-mix(in srgb, var(--brand-primary) 60%, transparent) 60%,
    transparent
  );
}

/* head */
.lab-palette-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 24px 14px;
}
.lab-palette-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--brand-primary);
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.lab-palette-mark img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  display: block;
}
.lab-palette-head-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.lab-palette-eyebrow {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
  font-weight: 500;
}
.lab-palette-breadcrumb {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-feature-settings: 'tnum';
}
.lab-palette-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
  flex-shrink: 0;
}
.lab-palette-close:hover {
  background: var(--bg-overlay);
  color: var(--text-heading);
}

/* input */
.lab-palette-input-wrap {
  padding: 0 24px 18px;
}
.lab-palette-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: var(--text-heading);
  font-family: var(--brand-font), sans-serif;
  font-size: 22px;
  font-weight: 300;
  line-height: 1.35;
  letter-spacing: -0.01em;
  padding: 0;
}
.lab-palette-input::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
}

/* actions list */
.lab-palette-actions {
  list-style: none;
  margin: 0;
  padding: 8px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.lab-palette-action {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-body);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease-out, color 120ms ease-out;
}
.lab-palette-action:hover:not(:disabled) {
  background: var(--bg-overlay);
  color: var(--text-heading);
}
.lab-palette-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.lab-palette-action--primary {
  color: var(--brand-primary);
}
.lab-palette-action--primary:hover:not(:disabled) {
  color: var(--brand-primary);
  filter: brightness(1.1);
}
.lab-palette-action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: currentColor;
}
.lab-palette-action-label {
  flex: 1;
  font-weight: 400;
}
.lab-palette-action-aux {
  font-size: 11px;
  color: var(--text-muted);
  font-feature-settings: 'tnum';
  letter-spacing: 0.02em;
}

/* kbd badges */
.lab-palette-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  border-radius: 5px;
  color: var(--brand-primary);
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 11px;
  font-weight: 500;
}
.lab-palette-kbd-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-body);
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 10px;
  margin-right: 4px;
}

/* json reveal */
.lab-palette-json {
  margin: 0 8px 8px;
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 12px 14px;
  max-height: 240px;
  overflow: auto;
}
.lab-palette-json pre {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 11px;
  color: var(--text-body);
  line-height: 1.5;
}

/* foot */
.lab-palette-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-top: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--bg-base) 40%, transparent);
  font-size: 11px;
  color: var(--text-muted);
}
.lab-palette-foot-sep {
  color: var(--border-default);
}
.lab-palette-foot-spacer {
  flex: 1;
}
.lab-palette-foot-brand {
  font-size: 11px;
  font-weight: 300;
  letter-spacing: -0.01em;
  color: var(--text-muted);
}

/* transitions */
.palette-enter-active {
  transition: opacity 200ms ease-out;
}
.palette-leave-active {
  transition: opacity 150ms ease-in;
}
.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}
.palette-enter-active .lab-palette {
  animation: paletteIn 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes paletteIn {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.palette-json-enter-active,
.palette-json-leave-active {
  transition: max-height 220ms ease-out, opacity 180ms ease-out, margin 220ms ease-out;
  overflow: hidden;
}
.palette-json-enter-from,
.palette-json-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  margin-bottom: 0;
}

@media (prefers-reduced-motion: reduce) {
  .palette-enter-active .lab-palette {
    animation: none;
  }
}

/* Esconde debug panel em telas estreitas */
@media (max-width: 1180px) {
  .lab-debug {
    display: none;
  }
}
</style>
